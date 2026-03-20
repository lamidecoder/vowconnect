import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { vendorId } = await req.json()

  const existing = await prisma.favorite.findUnique({
    where: { userId_vendorId: { userId: auth.userId, vendorId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return NextResponse.json({ saved: false })
  }

  await prisma.favorite.create({ data: { userId: auth.userId, vendorId } })
  return NextResponse.json({ saved: true })
  } catch (err: any) {
    console.error('favorites error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const favorites = await prisma.favorite.findMany({
    where: { userId: auth.userId },
    include: {
      vendor: {
        include: {
          category: true,
          portfolio: { take: 1 },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(favorites.map(f => f.vendor))
  } catch (err: any) {
    console.error('favorites error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
