import { NextRequest, NextResponse } from 'next/server'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimitResponse(req, 'report', RATE_LIMITS.report)
    if (rl) return rl


  const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { vendorId, reason, details } = await req.json()
  if (!vendorId || !reason) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Prevent duplicate reports from same user
  const existing = await prisma.report.findFirst({
    where: { reporterId: auth.userId, targetId: vendorId, status: 'PENDING' },
  })
  if (existing) return NextResponse.json({ error: 'You have already reported this vendor' }, { status: 409 })

  const report = await prisma.report.create({
    data: {
      reporterId:  auth.userId,
      targetId:    vendorId,
      targetType:  'vendor',
      reason,
      description: details ?? null,
      status:      'PENDING',
    },
  })

  return NextResponse.json(report, { status: 201 })
  } catch (err: any) {
    console.error('reports error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: { select: { name: true, email: true } },
      vendor:   { select: { businessName: true, id: true } },
    },
  })
  return NextResponse.json(reports)
  } catch (err: any) {
    console.error('reports error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
