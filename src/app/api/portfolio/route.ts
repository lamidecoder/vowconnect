import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
  if (!vendor) return NextResponse.json({ images: [], max: 5 })

  const maxSetting = await prisma.systemSetting.findUnique({ where: { key: 'max_portfolio_images' } })
  const max = parseInt(maxSetting?.value ?? '5')

  const images = await prisma.portfolioImage.findMany({
    where: { vendorId: vendor.id },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ images, max })
  } catch (err: any) {
    console.error('portfolio error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
