import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

// GET  /api/messages          — list conversations for current user
// POST /api/messages          — send a message (creates conversation if needed)

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'PLANNER', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    // Return messages for a specific conversation
    if (conversationId) {
      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
          },
          client: { select: { id: true, name: true, avatar: true } },
          vendor: { select: { id: true, businessName: true, user: { select: { id: true, avatar: true } } } },
        },
      })
      if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      // Mark messages as read
      await prisma.message.updateMany({
        where: { conversationId, senderId: { not: auth.userId }, isRead: false },
        data: { isRead: true },
      })

      return NextResponse.json(conv)
    }

    // List all conversations for this user
    const vendor = auth.role === 'VENDOR'
      ? await prisma.vendor.findUnique({ where: { userId: auth.userId }, select: { id: true } })
      : null

    const where = vendor
      ? { vendorId: vendor.id }
      : { clientId: auth.userId }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        client: { select: { id: true, name: true, avatar: true } },
        vendor: { select: { id: true, businessName: true, user: { select: { avatar: true } } } },
        _count: { select: { messages: { where: { isRead: false, senderId: { not: auth.userId } } } } },
      },
      orderBy: { lastMsgAt: 'desc' },
    })

    return NextResponse.json(conversations)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'PLANNER', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { vendorId, clientId, body, templateId } = await req.json()
    if (!body?.trim()) return NextResponse.json({ error: 'Message body required' }, { status: 400 })

    // Determine conversation participants
    let convClientId = clientId
    let convVendorId = vendorId

    if (auth.role === 'CLIENT' || auth.role === 'PLANNER') {
      convClientId = auth.userId
    } else if (auth.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId }, select: { id: true } })
      if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })
      convVendorId = vendor.id
    }

    if (!convClientId || !convVendorId) return NextResponse.json({ error: 'clientId and vendorId required' }, { status: 400 })

    // Upsert conversation
    const conversation = await prisma.conversation.upsert({
      where: { clientId_vendorId: { clientId: convClientId, vendorId: convVendorId } },
      update: { lastMsgAt: new Date() },
      create: { clientId: convClientId, vendorId: convVendorId, lastMsgAt: new Date() },
    })

    const message = await prisma.message.create({
      data: { conversationId: conversation.id, senderId: auth.userId, body: body.trim(), templateId: templateId ?? null },
      include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
    })

    return NextResponse.json({ conversation, message }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
