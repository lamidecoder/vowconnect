import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'PLANNER', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const profile = await prisma.weddingProfile.findUnique({
      where: { clientId: auth.userId },
      include: {
        budgetItems: { orderBy: { createdAt: 'asc' } },
        timelineItems: { orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }] },
        moodBoard: { orderBy: { order: 'asc' } },
        _count: { select: { guestList: true } },
      },
    })
    return NextResponse.json(profile)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'PLANNER', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { partnerName, weddingDate, venue, city, country, totalBudget, currency, guestCount, theme, notes } = await req.json()

    const profile = await prisma.weddingProfile.upsert({
      where: { clientId: auth.userId },
      update: {
        partnerName, venue, city, country, theme, notes,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        totalBudget: totalBudget ? Number(totalBudget) : null,
        guestCount: guestCount ? Number(guestCount) : null,
        currency: currency ?? undefined,
      },
      create: {
        clientId: auth.userId,
        partnerName, venue, city, country, theme, notes,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        totalBudget: totalBudget ? Number(totalBudget) : null,
        guestCount: guestCount ? Number(guestCount) : null,
        currency: currency ?? 'NGN',
      },
    })
    return NextResponse.json(profile)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
