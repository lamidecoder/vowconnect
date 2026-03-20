import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

function makeShareCode(len = 7): string {
  return Math.random().toString(36).slice(2, 2 + len).toUpperCase()
}

// GET /api/asoebi?role=lead|member|vendor
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['CLIENT','VENDOR','SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') ?? 'lead'

  if (auth.role === 'VENDOR' || role === 'vendor') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
    if (!vendor) return NextResponse.json([])
    const groups = await prisma.asoebiGroup.findMany({
      where: { vendorId: vendor.id },
      include: { leadClient: { select: { name: true, email: true } }, members: true, vendor: { select: { businessName: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(groups)
  }

  if (role === 'member') {
    const groups = await prisma.asoebiGroup.findMany({
      where: { members: { some: { clientId: auth.userId } } },
      include: { leadClient: { select: { name: true } }, members: true, vendor: { select: { businessName: true, whatsapp: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(groups)
  }

  // Lead
  const groups = await prisma.asoebiGroup.findMany({
    where: { leadClientId: auth.userId },
    include: { members: { include: { client: { select: { name: true, email: true } } } }, vendor: { select: { businessName: true, whatsapp: true, location: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(groups)
}

// POST /api/asoebi — lead client creates a group
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['CLIENT','SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const body = await req.json()
  const { vendorId, eventDate, eventType, location, maxSlots, notes } = body
  if (!vendorId || !eventDate || !eventType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, status: 'APPROVED' } })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  // Generate unique share code
  let shareCode = makeShareCode()
  while (await prisma.asoebiGroup.findUnique({ where: { shareCode } })) {
    shareCode = makeShareCode()
  }

  const group = await prisma.asoebiGroup.create({
    data: {
      leadClientId: auth.userId,
      vendorId,
      eventDate:    new Date(eventDate),
      eventType,
      location:     location ?? null,
      maxSlots:     maxSlots ? +maxSlots : 12,
      notes:        notes ?? null,
      shareCode,
      currency:     vendor.currency,
    },
    include: { vendor: { select: { businessName: true } }, members: true },
  })

  // Lead bride auto-joins
  await prisma.asoebiMember.create({
    data: { groupId: group.id, clientId: auth.userId, name: 'Lead (You)', status: 'CONFIRMED' },
  }).catch(() => {})

  return NextResponse.json(group, { status: 201 })
}
