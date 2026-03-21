// src/app/api/payments/route.ts
// Unified payment API — routes to Paystack or Stripe automatically
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateReference } from '@/lib/paystack'
import { getPaymentProvider, calculatePaymentBreakdown } from '@/lib/payment-router'

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vowconnect.com'
const COMMISSION = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 3)

// GET /api/payments?bookingId=xxx — get payment breakdown before paying
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['CLIENT'])
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const bookingId     = searchParams.get('bookingId')
  const milestoneIndex = Number(searchParams.get('milestone') ?? 0)

  if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      vendor: { select: { country: true, currency: true, businessName: true } },
      milestones: { orderBy: { order: 'asc' } },
    },
  })

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.clientId !== auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const milestone = booking.milestones[milestoneIndex]
  if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
  if (milestone.status !== 'PENDING') return NextResponse.json({ error: 'Already paid' }, { status: 400 })

  const breakdown = calculatePaymentBreakdown(milestone.amount, booking.vendor.country, COMMISSION)

  return NextResponse.json({
    milestone: {
      index:      milestoneIndex,
      title:      milestone.title,
      amount:     milestone.amount,
      percentage: milestone.percentage,
    },
    breakdown,
    vendorName: booking.vendor.businessName,
    provider:   breakdown.provider, // hidden from UI but useful for debugging
  })
}

// POST /api/payments — initialize payment
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['CLIENT'])
  if ('error' in auth) return auth.error

  const { bookingId, milestoneIndex = 0 } = await req.json()

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      vendor: {
        select: {
          country: true, currency: true, businessName: true,
          paystackSubaccountCode: true, bankVerified: true,
          stripeAccountId: true, stripeOnboarded: true,
        },
      },
      client: { select: { email: true, name: true } },
      milestones: { orderBy: { order: 'asc' } },
    },
  })

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.clientId !== auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const milestone = booking.milestones[milestoneIndex]
  if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
  if (milestone.status !== 'PENDING') return NextResponse.json({ error: 'Already paid' }, { status: 400 })

  const breakdown = calculatePaymentBreakdown(milestone.amount, booking.vendor.country, COMMISSION)
  const ref       = generateReference('VC')
  const provider  = breakdown.provider

  // Save payment record first
  await prisma.payment.create({
    data: {
      reference:    ref,
      bookingId,
      milestoneId:  milestone.id,
      clientId:     auth.userId,
      amount:       milestone.amount,
      commission:   breakdown.commissionAmount,
      vendorAmount: breakdown.vendorAmount,
      currency:     breakdown.currency,
      status:       'PENDING',
    },
  })

  const callbackUrl = `${APP}/client/bookings/${bookingId}?payment=verify&ref=${ref}&milestone=${milestoneIndex}`
  const metadata    = {
    bookingId,
    milestoneId:    milestone.id,
    milestoneIndex,
    clientId:       auth.userId,
    provider,
    ref,
  }

  // Route to correct provider
  if (provider === 'paystack') {
    if (!booking.vendor.paystackSubaccountCode) {
      return NextResponse.json({
        error: 'This vendor has not set up their payment account yet. Please contact them directly.',
      }, { status: 400 })
    }

    const { initializeTransaction, calculateSplit } = await import('@/lib/paystack')
    const split = calculateSplit(breakdown.totalAmount, COMMISSION)

    const transaction = await initializeTransaction({
      email:             booking.client.email,
      amount:            split.totalKobo,
      currency:          breakdown.currency,
      reference:         ref,
      subaccountCode:    booking.vendor.paystackSubaccountCode,
      transactionCharge: split.commissionKobo,
      callbackUrl,
      metadata,
    })

    return NextResponse.json({
      checkoutUrl: transaction.authorization_url,
      reference:   ref,
      provider:    'secure', // never expose provider name
      breakdown,
    })
  }

  if (provider === 'stripe') {
    if (!booking.vendor.stripeAccountId || !booking.vendor.stripeOnboarded) {
      return NextResponse.json({
        error: 'This vendor has not set up their payment account yet. Please contact them directly.',
      }, { status: 400 })
    }

    const stripe = (await import('@/lib/stripe')).stripe
    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing unavailable' }, { status: 503 })
    }

    const amountCents        = Math.round(breakdown.totalAmount * 100)
    const applicationFeeCents = Math.round(breakdown.commissionAmount * 100)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      customer_email:       booking.client.email,
      line_items: [{
        price_data: {
          currency:     breakdown.currency.toLowerCase(),
          unit_amount:  amountCents,
          product_data: {
            name:        `${milestone.title} — ${booking.vendor.businessName}`,
            description: `Milestone ${milestoneIndex + 1} payment via VowConnect`,
          },
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: applicationFeeCents,
        transfer_data: { destination: booking.vendor.stripeAccountId },
        metadata: { ...metadata },
      },
      success_url: `${callbackUrl}&status=success`,
      cancel_url:  `${APP}/client/bookings/${bookingId}?payment=cancelled`,
      metadata,
    })

    return NextResponse.json({
      checkoutUrl: session.url,
      reference:   ref,
      provider:    'secure',
      breakdown,
    })
  }

  return NextResponse.json({ error: 'Payment provider not available' }, { status: 500 })
}