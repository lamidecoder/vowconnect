// ─────────────────────────────────────────────────────────
// src/app/api/vendors/route.ts
// ─────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page     = parseInt(searchParams.get('page') ?? '1')
  const limit    = parseInt(searchParams.get('limit') ?? '12')
  const category = searchParams.get('category')
  const location = searchParams.get('location')
  const country  = searchParams.get('country')
  const city     = searchParams.get('city')
  const search   = searchParams.get('search')
  const featured = searchParams.get('featured') === 'true'
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')

  const where: any = { status: 'APPROVED', deletedAt: null }
  if (category) where.category = { slug: category }
  if (country)  where.country  = country
  if (city)     where.city     = { contains: city, mode: 'insensitive' }
  if (location && !city) where.location = { contains: location, mode: 'insensitive' }
  if (featured) where.isFeatured = true
  if (minPrice) where.priceMin = { gte: +minPrice }
  if (maxPrice) where.priceMax = { lte: +maxPrice }
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { bio:          { contains: search, mode: 'insensitive' } },
      { location:     { contains: search, mode: 'insensitive' } },
      { city:         { contains: search, mode: 'insensitive' } },
      { category: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        category: true,
        portfolio: { orderBy: { order: 'asc' }, take: 1 },
        reviews: { select: { rating: true } },
        user: { select: { name: true, avatar: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.vendor.count({ where }),
  ])

  const data = vendors.map(v => ({
    ...v,
    avgRating: v.reviews.length ? v.reviews.reduce((s, r) => s + r.rating, 0) / v.reviews.length : null,
    reviewCount: v.reviews.length,
  }))

  return NextResponse.json({ vendors: data, total, page, limit })
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const body = await req.json()
  const {
    businessName, bio, categoryId,
    country, countryName, city, location,
    currency, priceMin, priceMax,
    whatsapp, instagram, website,
  } = body

  if (!businessName || !categoryId || !location || !whatsapp) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
  if (existing) return NextResponse.json({ error: 'Vendor profile exists' }, { status: 409 })

  const vendor = await prisma.vendor.create({
    data: {
      userId: auth.userId, businessName, bio, categoryId,
      country: country ?? 'NG',
      countryName: countryName ?? 'Nigeria',
      city: city ?? '',
      location,
      currency: (currency ?? 'NGN') as any,
      priceMin: +priceMin, priceMax: +priceMax,
      whatsapp, instagram, website, status: 'PENDING_REVIEW',
    },
    include: { category: true },
  })

  return NextResponse.json(vendor, { status: 201 })
}
