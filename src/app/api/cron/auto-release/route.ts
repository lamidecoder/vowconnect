// src/app/api/cron/auto-release/route.ts
// Runs daily via Vercel Cron — auto-releases milestones 72hrs after event with no dispute
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transferToSubaccount, createTransferRecipient, generateReference } from '@/lib/paystack'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000) // 72 hours ago

  // Find milestones that are release-requested or paid, event passed 72hrs ago, no dispute
  const toRelease = await prisma.bookingMilestone.findMany({
    where: {
      status:  { in: ['PAID', 'RELEASE_REQUESTED'] },
      paidAt:  { lt: cutoff },
      booking: {
        eventDate: { lt: new Date() },
        status:    { not: 'CANCELLED' },
      },
    },
    include: {
      booking: {
        include: {
          vendor: {
            select: {
              businessName: true,
              accountName: true,
              accountNumber: true,
              bankCode: true,
            },
          },
        },
      },
    },
    take: 50, // process in batches
  })

  let released = 0
  let failed   = 0

  for (const milestone of toRelease) {
    try {
      const vendor = milestone.booking.vendor
      if (!vendor.accountNumber || !vendor.bankCode) continue

      const recipient = await createTransferRecipient({
        name:          vendor.accountName ?? vendor.businessName,
        accountNumber: vendor.accountNumber,
        bankCode:      vendor.bankCode,
        currency:      'NGN',
      })

      const ref = generateReference('VC_AUTO')
      await transferToSubaccount({
        amount:    Math.round((milestone.vendorAmount ?? milestone.amount * 0.97) * 100),
        recipient: recipient.recipient_code,
        reason:    `Auto-release: ${milestone.title}`,
        reference: ref,
      })

      await prisma.bookingMilestone.update({
        where: { id: milestone.id },
        data:  { status: 'RELEASED', releasedAt: new Date(), transferRef: ref, autoReleased: true },
      })

      released++
    } catch (e) {
      failed++
      console.error(`Failed to auto-release milestone ${milestone.id}:`, e)
    }
  }

  return NextResponse.json({ processed: toRelease.length, released, failed })
}