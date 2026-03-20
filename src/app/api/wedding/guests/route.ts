import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

async function ensureProfile(userId: string) {
  return prisma.weddingProfile.upsert({
    where: { clientId: userId },
    update: {},
    create: { clientId: userId },
  })
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const profile = await prisma.weddingProfile.findUnique({ where: { clientId: auth.userId } })
    if (!profile) return NextResponse.json([])
    const { searchParams } = new URL(req.url)
    const side = searchParams.get('side')
    const rsvp = searchParams.get('rsvp')
    const guests = await prisma.guest.findMany({
      where: {
        weddingProfileId: profile.id,
        ...(side && { side }),
        ...(rsvp && { rsvpStatus: rsvp as any }),
      },
      orderBy: [{ tableNumber: 'asc' }, { name: 'asc' }],
    })
    // Summary stats
    const stats = {
      total: guests.length,
      attending: guests.filter(g => g.rsvpStatus === 'ATTENDING').length,
      declined: guests.filter(g => g.rsvpStatus === 'DECLINED').length,
      pending: guests.filter(g => g.rsvpStatus === 'PENDING').length,
      maybe: guests.filter(g => g.rsvpStatus === 'MAYBE').length,
    }
    return NextResponse.json({ guests, stats })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const profile = await ensureProfile(auth.userId)
    const body = await req.json()

    // Support bulk create
    if (Array.isArray(body)) {
      const guests = await prisma.guest.createMany({
        data: body.map(g => ({ weddingProfileId: profile.id, ...g })),
      })
      return NextResponse.json(guests, { status: 201 })
    }

    const { name, email, phone, side, rsvpStatus, dietaryNeeds, tableNumber, plusOne, plusOneName, notes } = body
    const guest = await prisma.guest.create({
      data: {
        weddingProfileId: profile.id,
        name,
        email: email ?? null,
        phone: phone ?? null,
        side: side ?? null,
        rsvpStatus: rsvpStatus ?? 'PENDING',
        dietaryNeeds: dietaryNeeds ?? null,
        tableNumber: tableNumber ? Number(tableNumber) : null,
        plusOne: plusOne ?? false,
        plusOneName: plusOneName ?? null,
        notes: notes ?? null,
      },
    })
    return NextResponse.json(guest, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { id, ...data } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (data.tableNumber !== undefined) data.tableNumber = data.tableNumber ? Number(data.tableNumber) : null
    const guest = await prisma.guest.update({ where: { id }, data })
    return NextResponse.json(guest)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { id } = await req.json()
    await prisma.guest.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
