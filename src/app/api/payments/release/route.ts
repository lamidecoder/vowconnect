// src/app/api/payments/release/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transferToSubaccount, createTransferRecipient, generateReference } from '@/lib/paystack'

// POST /api/payments/release — vendor requests milestone release / client approves
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { milestoneId, action } = await req.json()
  // action: 'REQUEST' (vendor) | 'APPROVE' (client) | 'DISPUTE' (client) | 'FORCE_RELEASE' (admin)

  const milestone = await prisma.bookingMilestone.findUnique({
    where: { id: milestoneId },
    include: {
      booking: {
        include: {
          vendor: {
            select: {
              businessName: true,
              paystackSubaccountCode: true,
              accountNumber: true,
              bankCode: true,
              accountName: true,
            },
          },
          client: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
  if (milestone.status !== 'PAID') return NextResponse.json({ error: 'Milestone not yet paid' }, { status: 400 })

  const booking = milestone.booking
  const vendor  = booking.vendor

  if (action === 'REQUEST') {
    // Vendor requests release — notify client
    if (auth.role !== 'VENDOR') return NextResponse.json({ error: 'Only vendor can request release' }, { status: 403 })

    await prisma.bookingMilestone.update({
      where: { id: milestoneId },
      data:  { status: 'RELEASE_REQUESTED', releaseRequestedAt: new Date() },
    })

    // TODO: send notification to client
    return NextResponse.json({ success: true, message: 'Release requested. Client will be notified.' })
  }

  if (action === 'DISPUTE') {
    // Client disputes — hold funds, open dispute
    await prisma.bookingMilestone.update({
      where: { id: milestoneId },
      data:  { status: 'DISPUTED', disputedAt: new Date() },
    })

    await prisma.dispute.create({
      data: {
        bookingId:   booking.id,
        milestoneId: milestone.id,
        clientId:    booking.client.id,
        reason:      'Client disputed milestone release',
        status:      'OPEN',
      },
    })

    return NextResponse.json({ success: true, message: 'Dispute opened. Our team will review within 24hrs.' })
  }

  if (action === 'APPROVE' || action === 'FORCE_RELEASE') {
    // Client approves or admin force-releases — transfer to vendor
    if (action === 'APPROVE' && booking.client.id !== auth.userId) {
      return NextResponse.json({ error: 'Only the client can approve release' }, { status: 403 })
    }
    if (action === 'FORCE_RELEASE' && auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    try {
      // Create transfer recipient
      const recipient = await createTransferRecipient({
        name:          vendor.accountName ?? vendor.businessName,
        accountNumber: vendor.accountNumber!,
        bankCode:      vendor.bankCode!,
        currency:      'NGN',
      })

      const amountKobo = Math.round(milestone.vendorAmount * 100)
      const ref        = generateReference('VC_REL')

      // Transfer to vendor
      await transferToSubaccount({
        amount:    amountKobo,
        recipient: recipient.recipient_code,
        reason:    `VowConnect payout: ${milestone.title} - Booking ${booking.id.slice(0,8)}`,
        reference: ref,
      })

      // Update milestone
      await prisma.bookingMilestone.update({
        where: { id: milestoneId },
        data:  {
          status:      'RELEASED',
          releasedAt:  new Date(),
          transferRef: ref,
        },
      })

      // Check if all milestones released → complete booking
      const allMilestones = await prisma.bookingMilestone.findMany({ where: { bookingId: booking.id } })
      const allReleased   = allMilestones.every(m => m.id === milestoneId ? true : m.status === 'RELEASED')

      if (allReleased) {
        await prisma.booking.update({
          where: { id: booking.id },
          data:  { status: 'COMPLETED', paymentStatus: 'PAID' },
        })
      }

      return NextResponse.json({ success: true, message: 'Payment released to vendor', transferRef: ref })
    } catch (e: any) {
      return NextResponse.json({ error: `Transfer failed: ${e.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}