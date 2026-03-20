import { NextRequest, NextResponse } from 'next/server'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

  const now  = new Date()
  const d7   = new Date(now.getTime() - 7  * 86400000)
  const d30  = new Date(now.getTime() - 30 * 86400000)
  const d90  = new Date(now.getTime() - 90 * 86400000)

  const [
    views7,   views30,  views90,
    bookings7, bookings30, completedAll,
    whatsappClicks30, favoriteCount,
    topImages,
    visitorCountries,
    viewsByDay,
    reviewStats,
    bookingConversion,
  ] = await Promise.all([
    // Profile views
    prisma.analyticsEvent.count({ where: { vendorId: vendor.id, type: 'profile_view', createdAt: { gte: d7  } } }),
    prisma.analyticsEvent.count({ where: { vendorId: vendor.id, type: 'profile_view', createdAt: { gte: d30 } } }),
    prisma.analyticsEvent.count({ where: { vendorId: vendor.id, type: 'profile_view', createdAt: { gte: d90 } } }),
    // Bookings
    prisma.booking.count({ where: { vendorId: vendor.id, createdAt: { gte: d7  }, deletedAt: null } }),
    prisma.booking.count({ where: { vendorId: vendor.id, createdAt: { gte: d30 }, deletedAt: null } }),
    prisma.booking.count({ where: { vendorId: vendor.id, status: 'COMPLETED',        deletedAt: null } }),
    // WhatsApp clicks
    prisma.analyticsEvent.count({ where: { vendorId: vendor.id, type: 'whatsapp_click', createdAt: { gte: d30 } } }),
    // Favorites
    prisma.favorite.count({ where: { vendorId: vendor.id } }),
    // Portfolio image clicks (top 5)
    prisma.analyticsEvent.groupBy({
      by: ['imageId'], _count: { imageId: true },
      where: { vendorId: vendor.id, type: 'portfolio_click', imageId: { not: null }, createdAt: { gte: d30 } },
      orderBy: { _count: { imageId: 'desc' } }, take: 5,
    }),
    // Where visitors come from
    prisma.analyticsEvent.groupBy({
      by: ['country'], _count: { country: true },
      where: { vendorId: vendor.id, type: 'profile_view', country: { not: null }, createdAt: { gte: d30 } },
      orderBy: { _count: { country: 'desc' } }, take: 8,
    }),
    // Views per day last 30 days
    prisma.$queryRaw`
      SELECT DATE("createdAt") as day, COUNT(*)::int as count
      FROM "AnalyticsEvent"
      WHERE "vendorId" = ${vendor.id}
        AND type = 'profile_view'
        AND "createdAt" >= ${d30}
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `,
    // Review stats
    prisma.review.aggregate({
      where: { vendorId: vendor.id },
      _avg: { rating: true }, _count: { id: true },
    }),
    // Booking conversion (views→requests)
    prisma.booking.count({ where: { vendorId: vendor.id, createdAt: { gte: d30 }, deletedAt: null } }),
  ])

  // Enrich top images with actual image data
  const imageIds = topImages.map(i => i.imageId).filter(Boolean) as string[]
  const images   = imageIds.length
    ? await prisma.portfolioImage.findMany({ where: { id: { in: imageIds } }, select: { id: true, url: true, caption: true } })
    : []
  const imageMap = Object.fromEntries(images.map(i => [i.id, i]))

  const conversionRate = views30 > 0 ? Math.round((bookingConversion / views30) * 100) : 0

  return NextResponse.json({
    views:    { d7: views7, d30: views30, d90: views90 },
    bookings: { d7: bookings7, d30: bookings30, completed: completedAll },
    whatsappClicks30,
    favoriteCount,
    conversionRate,
    avgRating:   reviewStats._avg.rating,
    reviewCount: reviewStats._count.id,
    topImages: topImages.map(i => ({
      clicks: i._count.imageId,
      image:  imageMap[i.imageId!] ?? null,
    })),
    visitorCountries: visitorCountries.map(c => ({ country: c.country, count: c._count.country })),
    viewsByDay,
  })
}

// POST — record analytics event (called from client-side)
const ALLOWED_EVENT_TYPES = new Set(['profile_view', 'whatsapp_click', 'portfolio_click', 'booking_intent', 'share'])

export async function POST(req: NextRequest) {
  // Rate limit to prevent DB spam
  const rl = rateLimitResponse(req, 'analytics', RATE_LIMITS.analytics)
  if (rl) return NextResponse.json({ ok: true }) // silent — don't expose limits to scrapers

  const { vendorId, type, imageId, source } = await req.json()

  // Validate event type against allowlist
  if (!vendorId || !type || !ALLOWED_EVENT_TYPES.has(type)) return NextResponse.json({ ok: true })

  // Validate vendorId format (CUID — 25 chars, starts with c)
  if (typeof vendorId !== 'string' || vendorId.length > 30 || !/^c[a-z0-9]+$/.test(vendorId)) {
    return NextResponse.json({ ok: true })
  }

  // Get approximate country from CF-IPCountry header (Vercel/Cloudflare)
  const country = req.headers.get('cf-ipcountry') ?? req.headers.get('x-vercel-ip-country') ?? null

  await prisma.analyticsEvent.create({
    data: { vendorId, type, imageId: imageId ?? null, country, source: source ?? null },
  }).catch(() => {}) // non-blocking

  return NextResponse.json({ ok: true })
}
