import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

async function getVendor(userId: string) {
  return prisma.vendor.findUnique({ where: { userId }, select: { id: true } })
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const vendor = await getVendor(auth.userId)
    if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')

    // All clients who have ever booked or messaged this vendor
    const bookings = await prisma.booking.findMany({
      where: { vendorId: vendor.id, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, email: true, avatar: true, country: true } },
        review: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // De-duplicate by clientId, add note/reminder data
    const clientMap = new Map<string, any>()
    for (const b of bookings) {
      if (!clientMap.has(b.clientId)) {
        clientMap.set(b.clientId, {
          client: b.client,
          bookingCount: 0,
          lastBooking: null,
          totalSpend: 0,
        })
      }
      const entry = clientMap.get(b.clientId)!
      entry.bookingCount++
      entry.lastBooking = entry.lastBooking ?? b.eventDate
      if (b.budget) entry.totalSpend += b.budget
    }

    const clients = await Promise.all(
      Array.from(clientMap.values()).map(async (entry) => {
        const [notes, reminders] = await Promise.all([
          prisma.clientNote.findMany({ where: { vendorId: vendor.id, clientId: entry.client.id }, orderBy: { createdAt: 'desc' } }),
          prisma.followUpReminder.findMany({ where: { vendorId: vendor.id, clientId: entry.client.id, isCompleted: false }, orderBy: { remindAt: 'asc' } }),
        ])
        return { ...entry, notes, reminders }
      })
    )

    if (clientId) {
      return NextResponse.json(clients.find(c => c.client.id === clientId) ?? null)
    }

    return NextResponse.json(clients)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: add a note or reminder
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const vendor = await getVendor(auth.userId)
    if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

    const { type, clientId, note, remindAt } = await req.json()
    if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

    if (type === 'note') {
      const created = await prisma.clientNote.create({
        data: { vendorId: vendor.id, clientId, note },
      })
      return NextResponse.json(created, { status: 201 })
    }

    if (type === 'reminder') {
      if (!remindAt) return NextResponse.json({ error: 'remindAt required for reminders' }, { status: 400 })
      const created = await prisma.followUpReminder.create({
        data: { vendorId: vendor.id, clientId, note: note ?? '', remindAt: new Date(remindAt) },
      })
      return NextResponse.json(created, { status: 201 })
    }

    return NextResponse.json({ error: 'type must be "note" or "reminder"' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { type, id, isCompleted } = await req.json()
    if (type === 'reminder') {
      const r = await prisma.followUpReminder.update({ where: { id }, data: { isCompleted } })
      return NextResponse.json(r)
    }
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
