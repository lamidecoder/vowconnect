// src/app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { initializeTransaction, verifyTransaction, calculateSplit, generateReference } from '@/lib/paystack'

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vowconnect.com'
const COMMISSION = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 3)

// POST /api/payments — initialize a booking payment
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['CLIENT'])
  if ('error' in auth) return auth.error

  const { bookingId, milestoneIndex } = await req.json()

  // Load booking with vendor and milestone details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      vendor: {
        select: {
          businessName: true,
          paystackSubaccountCode: true,
          bankVerified: true,
          currency: true,
        },
      },
      client: {
        select: { email: true, name: true },
      },
      milestones: { orderBy: { order: 'asc' } },
    },
  })

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.clientId !== auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  if (!booking.vendor.paystackSubaccountCode) {
    return NextResponse.json({ error: 'Vendor has not set up their payment account yet' }, { status: 400 })
  }

  const milestone = booking.milestones[milestoneIndex ?? 0]
  if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
  if (milestone.status !== 'PENDING') return NextResponse.json({ error: 'Milestone already paid' }, { status: 400 })

  // Calculate split
  const split  = calculateSplit(milestone.amount, COMMISSION)
  const ref    = generateReference('VC_MS')

  // Initialize Paystack transaction
  const transaction = await initializeTransaction({
    email:              booking.client.email,
    amount:             split.totalKobo,
    currency:           booking.vendor.currency ?? 'NGN',
    reference:          ref,
    subaccountCode:     booking.vendor.paystackSubaccountCode,
    transactionCharge:  split.commissionKobo,
    callbackUrl:        `${APP}/client/bookings/${bookingId}?payment=verify&ref=${ref}`,
    metadata: {
      bookingId,
      milestoneId:    milestone.id,
      milestoneIndex: milestoneIndex ?? 0,
      clientId:       auth.userId,
      vendorName:     booking.vendor.businessName,
      description:    milestone.title,
    },
  })

  // Save payment record
  await prisma.payment.create({
    data: {
      reference:     ref,
      bookingId,
      milestoneId:   milestone.id,
      amount:        milestone.amount,
      commission:    split.commissionNaira,
      vendorAmount:  split.vendorNaira,
      currency:      booking.vendor.currency ?? 'NGN',
      status:        'PENDING',
      clientId:      auth.userId,
    },
  })

  return NextResponse.json({
    authorizationUrl: transaction.authorization_url,
    reference:        ref,
    amount:           milestone.amount,
    breakdown: {
      total:      milestone.amount,
      commission: split.commissionNaira,
      vendor:     split.vendorNaira,
      fee:        split.paystackFeeKobo / 100,
    },
  })
}

// GET /api/payments?ref=xxx — verify payment after redirect
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'No reference' }, { status: 400 })

  try {
    const transaction = await verifyTransaction(ref)

    if (transaction.status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful', status: transaction.status }, { status: 400 })
    }

    const { bookingId, milestoneId } = transaction.metadata

    // Update payment record
    await prisma.payment.update({
      where:  { reference: ref },
      data:   { status: 'SUCCESS', paidAt: new Date() },
    })

    // Update milestone status
    await prisma.bookingMilestone.update({
      where: { id: milestoneId },
      data:  { status: 'PAID', paidAt: new Date() },
    })

    // Update booking status if first milestone
    await prisma.booking.update({
      where: { id: bookingId },
      data:  { status: 'ACCEPTED', paymentStatus: 'PARTIAL' },
    })

    return NextResponse.json({ success: true, bookingId })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}