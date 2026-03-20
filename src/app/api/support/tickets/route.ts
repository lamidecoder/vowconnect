import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { sanitise as sanitize } from '@/lib/validate'

function genTicketNumber() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `VC-${ymd}-${rand}`
}

// GET /api/support/tickets â€” get my tickets (authenticated) or admin list
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'SUPER_ADMIN']).catch(() => null)

    // Unauthenticated: look up by email
    const email = searchParams.get('email')
    if (!auth && email) {
      const tickets = await prisma.supportTicket.findMany({
        where: { email: email.toLowerCase() },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { replies: { orderBy: { createdAt: 'asc' } } },
      })
      return NextResponse.json(tickets)
    }

    if (!auth || 'error' in auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (auth.role === 'SUPER_ADMIN') {
      const status   = searchParams.get('status') ?? ''
      const priority = searchParams.get('priority') ?? ''
      const search   = searchParams.get('search') ?? ''
      const page     = parseInt(searchParams.get('page') ?? '1')
      const limit    = 25

      const where: any = {}
      if (status)   where.status   = status
      if (priority) where.priority = priority
      if (search)   where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { name:    { contains: search, mode: 'insensitive' } },
        { email:   { contains: search, mode: 'insensitive' } },
        { ticketNumber: { contains: search, mode: 'insensitive' } },
      ]

      const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
          where, skip: (page-1)*limit, take: limit,
          orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
          include: {
            user: { select: { id: true, name: true, email: true } },
            replies: { orderBy: { createdAt: 'asc' } },
            _count: { select: { replies: true } },
          },
        }),
        prisma.supportTicket.count({ where }),
      ])

      const counts = await prisma.supportTicket.groupBy({ by: ['status'], _count: { status: true } })
      const cMap = Object.fromEntries(counts.map(c => [c.status, c._count.status]))

      return NextResponse.json({ tickets, total, page, limit, counts: cMap })
    }

    // Regular user â€” get their own tickets
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    })
    return NextResponse.json(tickets)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/support/tickets â€” create a ticket
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, description, category } = body

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !description?.trim())
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    if (description.length > 3000)
      return NextResponse.json({ error: 'Description too long' }, { status: 400 })

    // Check if logged in
    const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'SUPER_ADMIN']).catch(() => null)
    const userId = auth && !('error' in auth) ? auth.userId : null

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber: genTicketNumber(),
        userId,
        name: sanitize(name),
        email: email.toLowerCase().trim(),
        subject: sanitize(subject),
        description: sanitize(description),
        category: category ?? 'GENERAL',
        status: 'OPEN',
        priority: 'NORMAL',
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

