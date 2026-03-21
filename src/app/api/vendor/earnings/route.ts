// src/app/api/vendor/earnings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR'])
  if ('error' in auth) return auth.error

  const vendor = await prisma.vendor.findUnique({
    where: { userId: auth.userId },
    select: { id: true, currency: true },
  })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const now       = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const [payments, bookings, pendingMilestones] = await Promise.all([
    prisma.payment.findMany({
      where: { booking: { vendorId: vendor.id }, status: 'SUCCESS' },
      include: { booking: { include: { client: { select:{ name:true } } } }, milestone: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findMany({
      where: { vendorId: vendor.id, deletedAt: null },
      select: { id:true, status:true, budget:true, createdAt:true },
    }),
    prisma.bookingMilestone.findMany({
      where: {
        booking: { vendorId: vendor.id },
        status: { in: ['PAID','RELEASE_REQUESTED'] },
      },
      include: {
        booking: { include: { client: { select:{ name:true } } } },
      },
    }),
  ])

  const totalEarned    = payments.filter(p => p.milestone?.status === 'RELEASED').reduce((s, p) => s + p.vendorAmount, 0)
  const pendingRelease = payments.filter(p => p.milestone?.status === 'PAID').reduce((s, p) => s + p.vendorAmount, 0)
  const thisMonthAmt   = payments.filter(p => p.milestone?.status === 'RELEASED' && p.createdAt >= thisMonth).reduce((s, p) => s + p.vendorAmount, 0)
  const lastMonthAmt   = payments.filter(p => p.milestone?.status === 'RELEASED' && p.createdAt >= lastMonth && p.createdAt <= lastMonthEnd).reduce((s, p) => s + p.vendorAmount, 0)
  const completed      = bookings.filter(b => b.status === 'COMPLETED').length
  const avgValue       = completed > 0 ? totalEarned / completed : 0

  // Build monthly chart for last 12 months
  const monthlyChart = Array.from({ length: 12 }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    const end   = new Date(now.getFullYear(), now.getMonth() - (11 - i) + 1, 0)
    const label = d.toLocaleDateString('en-GB', { month: 'short' })
    const amount = payments
      .filter(p => p.milestone?.status === 'RELEASED' && p.createdAt >= d && p.createdAt <= end)
      .reduce((s, p) => s + p.vendorAmount, 0)
    return { month: label, amount }
  })

  // Payouts history
  const payouts = payments.slice(0, 20).map(p => ({
    id:            p.id,
    amount:        p.vendorAmount,
    status:        p.milestone?.status ?? 'PAID',
    date:          p.createdAt.toISOString(),
    bookingId:     p.bookingId,
    clientName:    p.booking.client.name,
    milestoneName: p.milestone?.title ?? 'Payment',
    ref:           p.reference,
  }))

  // Pending milestones awaiting release
  const pending = pendingMilestones.map(m => ({
    id:           m.id,
    title:        m.title,
    amount:       m.amount,
    vendorAmount: m.vendorAmount ?? m.amount * 0.97,
    status:       m.status,
    bookingId:    m.bookingId,
    clientName:   m.booking.client.name,
    eventDate:    m.booking.eventDate?.toISOString() ?? '',
  }))

  return NextResponse.json({
    currency:          vendor.currency ?? 'NGN',
    totalEarned,
    pendingRelease,
    thisMonth:         thisMonthAmt,
    lastMonth:         lastMonthAmt,
    totalBookings:     bookings.length,
    completedBookings: completed,
    avgBookingValue:   Math.round(avgValue),
    payouts,
    pendingMilestones: pending,
    monthlyChart,
  })
}