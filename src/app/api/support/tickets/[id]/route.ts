import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, logAdminAction } from '@/lib/auth'
import { sanitize } from '@/lib/validate'

// PATCH /api/support/tickets/[id] — update ticket (admin) or add reply
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const body = await req.json()
    const { replyBody, status, priority, adminNotes, assignedTo } = body

    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } })
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    // Non-admin can only add replies to their own ticket
    if (auth.role !== 'SUPER_ADMIN' && ticket.userId !== auth.userId)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const updates: any = {}
    if (auth.role === 'SUPER_ADMIN') {
      if (status)      updates.status = status
      if (priority)    updates.priority = priority
      if (adminNotes !== undefined) updates.adminNotes = sanitize(adminNotes)
      if (assignedTo !== undefined) updates.assignedTo = assignedTo
      if (status === 'RESOLVED' || status === 'CLOSED') updates.resolvedAt = new Date()
    }
    updates.updatedAt = new Date()

    const [updatedTicket] = await Promise.all([
      prisma.supportTicket.update({ where: { id: params.id }, data: updates }),
      replyBody?.trim()
        ? prisma.ticketReply.create({
            data: {
              ticketId: params.id,
              senderId: auth.userId,
              senderName: auth.role === 'SUPER_ADMIN' ? 'VowConnect Support' : ticket.name,
              body: sanitize(replyBody),
              isAdmin: auth.role === 'SUPER_ADMIN',
            },
          })
        : Promise.resolve(null),
    ])

    if (auth.role === 'SUPER_ADMIN') {
      await logAdminAction({
        adminId: auth.userId, action: 'UPDATE_TICKET',
        targetType: 'ticket', targetId: params.id,
        metadata: { status, replyAdded: !!replyBody },
      })
    }

    // Refetch with replies
    const full = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    })
    return NextResponse.json(full)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/support/tickets/[id] — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole(req, ['SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    await prisma.supportTicket.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
