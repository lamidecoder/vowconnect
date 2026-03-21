// src/app/api/admin/disputes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transferToSubaccount, createTransferRecipient, generateReference } from '@/lib/paystack'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { status, resolution } = await req.json()
  const dispute = await prisma.dispute.findUnique({
    where: { id: params.id },
    include: {
      booking: { include: { vendor: true } },
      milestone: true,
    },
  })

  if (!dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })

  // Update dispute status
  await prisma.dispute.update({
    where: { id: params.id },
    data:  { status, resolution, resolvedAt: new Date() },
  })

  // Take action based on resolution
  if (status === 'RESOLVED_CLIENT' && dispute.milestone) {
    // Refund client — mark milestone as refunded
    await prisma.bookingMilestone.update({
      where: { id: dispute.milestoneId! },
      data:  { status: 'REFUNDED' },
    })
    // TODO: trigger actual Paystack refund when live
  }

  if (status === 'RESOLVED_VENDOR' && dispute.milestone) {
    // Release to vendor
    const vendor = dispute.booking.vendor
    if (vendor.accountNumber && vendor.bankCode) {
      try {
        const recipient = await createTransferRecipient({
          name:          vendor.accountName ?? vendor.businessName,
          accountNumber: vendor.accountNumber,
          bankCode:      vendor.bankCode,
          currency:      'NGN',
        })
        const ref = generateReference('VC_DISP')
        await transferToSubaccount({
          amount:    Math.round((dispute.milestone.vendorAmount ?? dispute.milestone.amount * 0.97) * 100),
          recipient: recipient.recipient_code,
          reason:    `Dispute resolved in vendor's favour: ${dispute.id.slice(0,8)}`,
          reference: ref,
        })
        await prisma.bookingMilestone.update({
          where: { id: dispute.milestoneId! },
          data:  { status:'RELEASED', releasedAt:new Date(), transferRef:ref },
        })
      } catch (e: any) {
        console.error('Transfer failed:', e)
      }
    }
  }

  // Log admin action
  await prisma.adminLog.create({
    data: {
      adminId:    auth.userId,
      action:     `DISPUTE_${status}`,
      targetType: 'DISPUTE',
      targetId:   params.id,
      metadata:   { resolution },
    },
  })

  return NextResponse.json({ success: true })
}