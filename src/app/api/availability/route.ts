import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

// GET /api/availability?vendorId=<id>|me&month=YYYY-MM
export async function GET(req: NextRequest) {
  try {

  const { searchParams } = new URL(req.url)
  let   vendorId = searchParams.get('vendorId')
  const month    = searchParams.get('month')

  if (vendorId === 'me') {
    const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId }, select: { id: true } })
    if (!vendor) return NextResponse.json({ blocked: [], booked: [] })
    vendorId = vendor.id
  }

  if (!vendorId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })

  const dateFilter: any = {}
  if (month) {
    const [y, m] = month.split('-').map(Number)
    dateFilter.date = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) }
  }

  const [blocked, bookings] = await Promise.all([
    prisma.blockedDate.findMany({
      where: { vendorId, ...dateFilter },
      select: { id: true, date: true, reason: true },
      orderBy: { date: 'asc' },
    }),
    prisma.booking.findMany({
      where: { vendorId, status: { in: ['ACCEPTED','PENDING'] }, deletedAt: null,
               ...(month ? { eventDate: dateFilter.date } : {}) },
      select: { eventDate: true, eventType: true },
    }),
  ])

  return NextResponse.json({
    blocked: blocked.map(b => ({ id: b.id, date: b.date.toISOString().split('T')[0], reason: b.reason })),
    booked:  bookings.map(b  => ({ date: b.eventDate.toISOString().split('T')[0], type: b.eventType })),
  })
  } catch (err: any) {
    console.error('availability error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error
  const { date, reason } = await req.json()
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })
  const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
  if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })
  const blocked = await prisma.blockedDate.upsert({
    where:  { vendorId_date: { vendorId: vendor.id, date: new Date(date) } },
    update: { reason },
    create: { vendorId: vendor.id, date: new Date(date), reason },
  })
  return NextResponse.json(blocked, { status: 201 })
  } catch (err: any) {
    console.error('availability error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error
  const { date } = await req.json()
  const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
  if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })
  await prisma.blockedDate.deleteMany({ where: { vendorId: vendor.id, date: new Date(date) } })
  return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('availability error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
