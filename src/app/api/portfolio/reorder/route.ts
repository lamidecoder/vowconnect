import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { order } = await req.json() as { order: string[] }
    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: 'Invalid order' }, { status: 400 })
    }

    // Verify ownership: vendor can only reorder their own images
    if (auth.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
      if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

      const images = await prisma.portfolioImage.findMany({
        where: { id: { in: order }, vendorId: vendor.id },
      })
      if (images.length !== order.length) {
        return NextResponse.json({ error: 'Forbidden: some images do not belong to you' }, { status: 403 })
      }
    }

    await Promise.all(
      order.map((id, idx) => prisma.portfolioImage.update({ where: { id }, data: { order: idx } }))
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[portfolio/reorder]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
