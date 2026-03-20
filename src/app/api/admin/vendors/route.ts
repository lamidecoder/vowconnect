import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const status   = searchParams.get('status')
    const search   = searchParams.get('search') ?? ''
    const page     = parseInt(searchParams.get('page') ?? '1')
    const limit    = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100) // cap at 100
    const skip     = (page - 1) * limit

    const where: any = { deletedAt: null }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { location:     { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name:  { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          user:     { select: { id: true, name: true, email: true, createdAt: true } },
          category: { select: { name: true, emoji: true } },
          _count:   { select: { bookings: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.vendor.count({ where }),
    ])

    return NextResponse.json({ vendors, total, page, pages: Math.ceil(total / limit) })
  } catch (err: any) {
    console.error('[admin/vendors GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
