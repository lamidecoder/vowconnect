import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, logAdminAction } from '@/lib/auth'

// GET /api/admin/reports?status=OPEN
export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? 'OPEN'

    const [reports, counts] = await Promise.all([
      prisma.report.findMany({
        where: { status },
        include: {
          reporter: { select: { name: true, email: true } },
          vendor:   { select: { businessName: true, id: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.groupBy({ by: ['status'], _count: { status: true } }),
    ])

    const cMap = Object.fromEntries(counts.map(c => [c.status, c._count.status]))
    return NextResponse.json({ reports, counts: cMap })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/admin/reports  — resolve or dismiss a report
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { reportId, status } = await req.json()
    if (!reportId || !['RESOLVED', 'DISMISSED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data:  { status },
    })

    await logAdminAction({
      adminId:    auth.userId,
      action:     status === 'RESOLVED' ? 'RESOLVE_REPORT' : 'DISMISS_REPORT',
      targetType: 'report',
      targetId:   reportId,
    })

    return NextResponse.json(report)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
