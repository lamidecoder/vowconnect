import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

// Default wedding timeline checklist
const DEFAULT_TIMELINE = [
  { title: 'Set your wedding date', category: 'admin', priority: 'high', monthsBefore: 12 },
  { title: 'Set your total budget', category: 'admin', priority: 'high', monthsBefore: 12 },
  { title: 'Book your venue', category: 'venue', priority: 'high', monthsBefore: 12 },
  { title: 'Book your photographer', category: 'Photography', priority: 'high', monthsBefore: 10 },
  { title: 'Book your content creator / social media coverage', category: 'Content', priority: 'medium', monthsBefore: 8 },
  { title: 'Book your videographer', category: 'Videographer', priority: 'medium', monthsBefore: 10 },
  { title: 'Book your Gele stylist', category: 'Gele Stylist', priority: 'high', monthsBefore: 9 },
  { title: 'Book your makeup artist', category: 'Makeup Artist', priority: 'high', monthsBefore: 9 },
  { title: 'Book event decorator', category: 'Event Decorator', priority: 'high', monthsBefore: 8 },
  { title: 'Send save-the-dates', category: 'admin', priority: 'medium', monthsBefore: 8 },
  { title: 'Book caterer', category: 'catering', priority: 'high', monthsBefore: 7 },
  { title: 'Order traditional attire / Aso-ebi', category: 'fashion', priority: 'medium', monthsBefore: 6 },
  { title: 'Send formal invitations', category: 'admin', priority: 'high', monthsBefore: 5 },
  { title: 'Plan honeymoon', category: 'travel', priority: 'low', monthsBefore: 5 },
  { title: 'Book DJ / live band', category: 'entertainment', priority: 'medium', monthsBefore: 4 },
  { title: 'Confirm all vendor bookings', category: 'admin', priority: 'high', monthsBefore: 2 },
  { title: 'Final dress/attire fitting', category: 'fashion', priority: 'high', monthsBefore: 1 },
  { title: 'Confirm guest count with caterer', category: 'catering', priority: 'high', monthsBefore: 1 },
  { title: 'Prepare payments for vendors', category: 'admin', priority: 'high', monthsBefore: 0 },
]

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
    const items = await prisma.timelineItem.findMany({
      where: { weddingProfileId: profile.id },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    })
    return NextResponse.json(items)
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

    // Seed default timeline
    if (body.seedDefaults && profile.weddingDate) {
      const weddingDate = new Date(profile.weddingDate)
      const existing = await prisma.timelineItem.count({ where: { weddingProfileId: profile.id } })
      if (existing === 0) {
        const items = DEFAULT_TIMELINE.map(t => {
          const dueDate = new Date(weddingDate)
          dueDate.setMonth(dueDate.getMonth() - t.monthsBefore)
          return {
            weddingProfileId: profile.id,
            title: t.title,
            category: t.category,
            priority: t.priority,
            dueDate,
          }
        })
        await prisma.timelineItem.createMany({ data: items })
        const created = await prisma.timelineItem.findMany({
          where: { weddingProfileId: profile.id },
          orderBy: { dueDate: 'asc' },
        })
        return NextResponse.json(created, { status: 201 })
      }
    }

    const { title, description, dueDate, category, priority } = body
    const item = await prisma.timelineItem.create({
      data: {
        weddingProfileId: profile.id,
        title,
        description: description ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category ?? null,
        priority: priority ?? 'medium',
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { id, isCompleted, title, description, dueDate, priority } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const item = await prisma.timelineItem.update({
      where: { id },
      data: {
        ...(isCompleted !== undefined && { isCompleted }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(priority !== undefined && { priority }),
      },
    })
    return NextResponse.json(item)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { id } = await req.json()
    await prisma.timelineItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
