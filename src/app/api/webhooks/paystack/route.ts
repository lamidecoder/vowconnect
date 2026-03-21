// src/app/api/webhooks/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? ''
  const body   = await req.text()
  const hash   = crypto.createHmac('sha512', secret).update(body).digest('hex')
  const sig    = req.headers.get('x-paystack-signature')

  if (hash !== sig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  switch (event.event) {

    case 'charge.success': {
      const { reference, metadata } = event.data
      if (!metadata?.milestoneId) break

      await prisma.payment.updateMany({
        where: { reference },
        data:  { status: 'SUCCESS', paidAt: new Date() },
      })

      await prisma.bookingMilestone.updateMany({
        where: { id: metadata.milestoneId },
        data:  { status: 'PAID', paidAt: new Date() },
      })

      // Update booking
      if (metadata.bookingId) {
        await prisma.booking.update({
          where: { id: metadata.bookingId },
          data:  { status: 'ACCEPTED', paymentStatus: 'PARTIAL' },
        })
      }
      break
    }

    case 'charge.failed': {
      const { reference } = event.data
      await prisma.payment.updateMany({
        where: { reference },
        data:  { status: 'FAILED' },
      })
      break
    }

    case 'transfer.success': {
      const { reference } = event.data
      await prisma.bookingMilestone.updateMany({
        where: { transferRef: reference },
        data:  { status: 'RELEASED', releasedAt: new Date() },
      })
      break
    }

    case 'transfer.failed':
    case 'transfer.reversed': {
      const { reference } = event.data
      // Flag for admin review
      await prisma.bookingMilestone.updateMany({
        where: { transferRef: reference },
        data:  { status: 'TRANSFER_FAILED' },
      })
      // TODO: notify admin
      break
    }
  }

  return NextResponse.json({ received: true })
}