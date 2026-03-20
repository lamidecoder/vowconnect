import { NextRequest, NextResponse } from 'next/server'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { sendNewReviewToVendor } from '@/lib/email'

export async function POST(req: NextRequest) {
  const rl = rateLimitResponse(req, 'review', RATE_LIMITS.review)
  if (rl) return rl

  const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { bookingId, rating, comment } = await req.json()
  if (!bookingId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid review data' }, { status: 400 })
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId: auth.userId, status: 'COMPLETED' },
    include: {
      vendor: { include: { user: { select: { name: true, email: true } } } },
      client: { select: { name: true } },
    },
  })
  if (!booking) return NextResponse.json({ error: 'Can only review completed bookings' }, { status: 400 })

  const existing = await prisma.review.findUnique({ where: { bookingId } })
  if (existing) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })

  const review = await prisma.review.create({
    data: { bookingId, clientId: auth.userId, vendorId: booking.vendorId, rating, comment },
  })

  // Notify vendor of new review
  sendNewReviewToVendor({
    vendorEmail:  booking.vendor.user.email,
    vendorName:   booking.vendor.user.name,
    businessName: booking.vendor.businessName,
    clientName:   booking.client.name,
    rating,
    comment,
  }).catch(console.error)

  return NextResponse.json(review, { status: 201 })
}
