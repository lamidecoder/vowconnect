import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error
  const vendor = await prisma.vendor.findUnique({
    where: { userId: auth.userId },
    include: { category: true, portfolio: { orderBy: { order: 'asc' } } },
  })
  if (!vendor) return NextResponse.json(null)
  return NextResponse.json(vendor)
}

export async function PATCH(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error
  const body = await req.json()
  const {
    businessName, bio, categoryId,
    country, countryName, city, location,
    currency, priceMin, priceMax,
    whatsapp, instagram, website, isAvailable,
  } = body
  const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
  if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })
  const updated = await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      ...(businessName !== undefined && { businessName }),
      ...(bio          !== undefined && { bio }),
      ...(categoryId   !== undefined && { categoryId }),
      ...(country      !== undefined && { country }),
      ...(countryName  !== undefined && { countryName }),
      ...(city         !== undefined && { city }),
      ...(location     !== undefined && { location }),
      ...(currency     !== undefined && { currency: currency as any }),
      ...(priceMin     !== undefined && { priceMin: +priceMin }),
      ...(priceMax     !== undefined && { priceMax: +priceMax }),
      ...(whatsapp     !== undefined && { whatsapp }),
      ...(instagram    !== undefined && { instagram }),
      ...(website      !== undefined && { website }),
      ...(isAvailable  !== undefined && { isAvailable }),
    },
    include: { category: true },
  })
  return NextResponse.json(updated)
}
