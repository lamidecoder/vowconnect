import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { sendBookingAcceptedToClient, sendBookingDeclinedToClient, sendReviewRequest, sendNewReviewToVendor } from '@/lib/email'
import { formatDate } from '@/lib/utils'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { status } = await req.json()
  const booking = await prisma.booking.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      client: { select: { name: true, email: true } },
      vendor: { include: { user: { select: { name: true } } } },
    },
  })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // Vendor can only act on their own bookings
  if (auth.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
    if (vendor?.id !== booking.vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const allowed: Record<string, string[]> = {
      PENDING: ['ACCEPTED', 'DECLINED'],
      ACCEPTED: ['COMPLETED', 'CANCELLED'],
    }
    if (!allowed[booking.status]?.includes(status)) {
      return NextResponse.json({ error: `Cannot change from ${booking.status} to ${status}` }, { status: 400 })
    }
  }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: { status, ...(auth.role === 'SUPER_ADMIN' && { overriddenBy: auth.userId }) },
  })

  const formattedDate = formatDate(booking.eventDate)

  // Trigger emails
  if (status === 'ACCEPTED') {
    sendBookingAcceptedToClient({
      clientEmail:  booking.client.email,
      clientName:   booking.client.name,
      businessName: booking.vendor.businessName,
      vendorWhatsapp: booking.vendor.whatsapp,
      eventType:    booking.eventType,
      eventDate:    formattedDate,
      bookingId:    booking.id,
    }).catch(console.error)
  }

  if (status === 'DECLINED') {
    sendBookingDeclinedToClient({
      clientEmail:  booking.client.email,
      clientName:   booking.client.name,
      businessName: booking.vendor.businessName,
      eventType:    booking.eventType,
      eventDate:    formattedDate,
    }).catch(console.error)
  }

  if (status === 'COMPLETED') {
    // Send review request email 1 day after completion
    setTimeout(() => {
      sendReviewRequest({
        clientEmail:  booking.client.email,
        clientName:   booking.client.name,
        businessName: booking.vendor.businessName,
        bookingId:    booking.id,
        eventType:    booking.eventType,
        eventDate:    formattedDate,
      }).catch(console.error)
    }, 24 * 60 * 60 * 1000)
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error
  await prisma.booking.update({ where: { id: params.id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ success: true })
}
