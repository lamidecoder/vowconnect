import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers, activeVendors, pendingVendors,
    totalBookings, completedBookings, pendingBookings,
    newUsers, newBookings,
    locationBreakdown, categoryBreakdown,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.vendor.count({ where: { status: 'APPROVED', deletedAt: null } }),
    prisma.vendor.count({ where: { status: 'PENDING_REVIEW', deletedAt: null } }),
    prisma.booking.count({ where: { deletedAt: null } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count({ where: { status: 'PENDING', deletedAt: null } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
    prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
    prisma.vendor.groupBy({ by: ['location'], _count: { location: true }, where: { status: 'APPROVED' }, orderBy: { _count: { location: 'desc' } }, take: 10 }),
    prisma.vendor.groupBy({ by: ['categoryId'], _count: { categoryId: true } }),
  ])

  const categories = await prisma.category.findMany({ select: { id: true, name: true, emoji: true } })
  const catMap = Object.fromEntries(categories.map(c => [c.id, `${c.emoji} ${c.name}`]))

  return NextResponse.json({
    overview: { totalUsers, activeVendors, pendingVendors, totalBookings, completedBookings, pendingBookings },
    growth: { newUsers, newBookings },
    locationBreakdown: locationBreakdown.map(l => ({ location: l.location, count: l._count.location })),
    categoryBreakdown: categoryBreakdown.map(c => ({ category: catMap[c.categoryId] ?? 'Unknown', count: c._count.categoryId })),
  })
  } catch (err: any) {
    console.error('analytics error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
