import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAsoebiInviteWA } from '@/lib/whatsapp'

interface RouteParams { params: { code: string } }

// GET /api/asoebi/[code] — public: load group by share code
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const group = await prisma.asoebiGroup.findUnique({
    where: { shareCode: params.code },
    include: {
      vendor:     { select: { businessName: true, location: true, whatsapp: true, portfolio: { take: 1 }, category: { select: { name: true, emoji: true } } } },
      leadClient: { select: { name: true } },
      members:    { select: { id: true, name: true, status: true, joinedAt: true } },
    },
  })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  return NextResponse.json(group)
}

// POST /api/asoebi/[code] — join a group
export async function POST(req: NextRequest, { params }: RouteParams) {
  const group = await prisma.asoebiGroup.findUnique({
    where: { shareCode: params.code },
    include: { members: true, vendor: { select: { businessName: true } }, leadClient: { select: { name: true } } },
  })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  if (group.status !== 'OPEN') return NextResponse.json({ error: 'This group is no longer accepting members' }, { status: 400 })
  if (group.members.length >= group.maxSlots) return NextResponse.json({ error: 'Group is full' }, { status: 400 })

  const { name, phone, clientId } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  // Check not already in group
  if (clientId) {
    const exists = group.members.find(m => m.clientId === clientId)
    if (exists) return NextResponse.json({ error: 'Already in this group' }, { status: 409 })
  }

  const member = await prisma.asoebiMember.create({
    data: { groupId: group.id, clientId: clientId ?? null, name, phone: phone ?? null, status: 'JOINED' },
  })

  // Update group to FULL if at capacity
  const newCount = group.members.length + 1
  if (newCount >= group.maxSlots) {
    await prisma.asoebiGroup.update({ where: { id: group.id }, data: { status: 'FULL' } })
  }

  // Send WhatsApp invite if phone provided
  if (phone) {
    const eventDate = group.eventDate.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
    sendAsoebiInviteWA({
      memberPhone:  phone,
      memberName:   name,
      leadName:     group.leadClient.name,
      businessName: group.vendor.businessName,
      eventType:    group.eventType,
      eventDate,
      shareCode:    params.code,
    }).catch(console.error)
  }

  return NextResponse.json({ member, totalMembers: newCount }, { status: 201 })
}

// PATCH /api/asoebi/[code] — invite members via WA (lead only)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { phones, names } = await req.json()
  const group = await prisma.asoebiGroup.findUnique({
    where: { shareCode: params.code },
    include: { vendor: { select: { businessName: true } }, leadClient: { select: { name: true } } },
  })
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const eventDate = group.eventDate.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
  const results = await Promise.allSettled(
    (phones as string[]).map((phone, i) =>
      sendAsoebiInviteWA({
        memberPhone:  phone,
        memberName:   (names as string[])[i] ?? 'Friend',
        leadName:     group.leadClient.name,
        businessName: group.vendor.businessName,
        eventType:    group.eventType,
        eventDate,
        shareCode:    params.code,
      })
    )
  )

  return NextResponse.json({ sent: results.filter(r => r.status === 'fulfilled').length })
}
