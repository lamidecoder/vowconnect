import { NextRequest, NextResponse } from 'next/server'
import { LIMITS, validateStr, sanitise } from '@/lib/validate'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { sendBookingRequestToVendor, sendBookingConfirmationToClient } from '@/lib/email'
import { sendBookingRequestWA, sendBookingConfirmedWA } from '@/lib/whatsapp'
import { formatDate } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  let bookings: any[]
  if (auth.role === 'SUPER_ADMIN') {
    bookings = await prisma.booking.findMany({
      where: { deletedAt: null, ...(status && { status: status as any }) },
      include: { vendor: { include: { user: { select: { name: true } } } }, client: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
  } else if (auth.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
    if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })
    bookings = await prisma.booking.findMany({
      where: { vendorId: vendor.id, deletedAt: null, ...(status && { status: status as any }) },
      include: { client: { select: { name: true, phone: true, avatar: true, email: true } }, review: true },
      orderBy: { createdAt: 'desc' },
    })
  } else {
    bookings = await prisma.booking.findMany({
      where: { clientId: auth.userId, deletedAt: null, ...(status && { status: status as any }) },
      include: { vendor: { include: { portfolio: { take: 1 }, user: { select: { name: true } } } }, review: true },
      orderBy: { createdAt: 'desc' },
    })
  }
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error
  const body = await req.json()
  const { vendorId, eventDate, eventType, location, guestCount, budget, notes } = body
  if (!vendorId || !eventDate || !eventType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const pending = await prisma.booking.count({ where: { clientId: auth.userId, status: 'PENDING', deletedAt: null } })
  if (pending >= 3) {
    return NextResponse.json({ error: 'Too many pending bookings. Wait for responses first.' }, { status: 429 })
  }
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, status: 'APPROVED', isAvailable: true, deletedAt: null },
    include: { user: { select: { name: true, email: true } } },
  })
  if (!vendor) return NextResponse.json({ error: 'Vendor not available' }, { status: 400 })

  // Check for date conflict: vendor already has an ACCEPTED booking on this date
  const dateConflict = await prisma.booking.findFirst({
    where: {
      vendorId,
      eventDate: new Date(eventDate),
      status: { in: ['PENDING', 'ACCEPTED'] },
      deletedAt: null,
    },
  })
  if (dateConflict) {
    return NextResponse.json({ error: 'This vendor is already booked on that date. Please choose another date.' }, { status: 409 })
  }

  // Check if this client already has a booking with this vendor for this date
  const clientConflict = await prisma.booking.findFirst({
    where: { clientId: auth.userId, vendorId, eventDate: new Date(eventDate), deletedAt: null },
  })
  if (clientConflict) {
    return NextResponse.json({ error: 'You already have a booking request with this vendor for that date.' }, { status: 409 })
  }
  const client = await prisma.user.findUnique({ where: { id: auth.userId }, select: { name: true, email: true, phone: true } })
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  const booking = await prisma.booking.create({
    data: { clientId: auth.userId, vendorId, eventDate: new Date(eventDate), eventType, location, guestCount: guestCount ? +guestCount : null, budget: budget ? +budget : null, notes },
    include: { vendor: { include: { user: { select: { name: true, email: true } } } } },
  })
  const formattedDate = formatDate(new Date(eventDate))
  Promise.allSettled([
    sendBookingRequestToVendor({ vendorEmail: vendor.user.email, vendorName: vendor.user.name, businessName: vendor.businessName, clientName: client.name, eventType, eventDate: formattedDate, location, notes, bookingId: booking.id }),
    sendBookingConfirmationToClient({ clientEmail: client.email, clientName: client.name, businessName: vendor.businessName, vendorWhatsapp: vendor.whatsapp, eventType, eventDate: formattedDate, bookingId: booking.id }),
    // WhatsApp notifications (fires in parallel, fails silently if not configured)
    sendBookingRequestWA({ vendorPhone: vendor.whatsapp, vendorName: vendor.user.name, clientName: client.name, eventType, eventDate: formattedDate }),
    ...(client.phone ? [sendBookingConfirmedWA({ clientPhone: client.phone, clientName: client.name, businessName: vendor.businessName, eventType, eventDate: formattedDate, vendorWhatsapp: vendor.whatsapp })] : []),
  ]).catch(console.error)
  return NextResponse.json(booking, { status: 201 })
}
