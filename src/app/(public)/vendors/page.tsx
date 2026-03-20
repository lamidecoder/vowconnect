import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { formatPrice, getWhatsAppLink, COUNTRIES } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: {
    category?: string; country?: string; city?: string
    search?: string; page?: string; diaspora?: string
  }
}

// Cities per country for filter UI
const CITIES: Record<string, string[]> = {
  NG: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City', 'Kano', 'Enugu', 'Calabar'],
  GB: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Bristol', 'Edinburgh', 'Cardiff'],
  US: ['Houston', 'Atlanta', 'New York', 'Washington DC', 'Dallas', 'Los Angeles', 'Chicago'],
  CA: ['Toronto', 'Calgary', 'Ottawa', 'Vancouver', 'Edmonton'],
  GH: ['Accra', 'Kumasi', 'Tamale', 'Cape Coast'],
}

export default async function VendorsPage({ searchParams }: Props) {
  const currentUser = await getCurrentUser()
  const page  = parseInt(searchParams.page ?? '1')
  const limit = 12

  const categories = await prisma.category.findMany({ where: { isActive: true } })
  const currentCategory = categories.find(c => c.slug === searchParams.category)
  const currentCountry  = COUNTRIES.find(c => c.code === searchParams.country)

  // Build the where clause with all filters
  const where: any = { status: 'APPROVED', deletedAt: null }
  if (searchParams.category) where.category  = { slug: searchParams.category }
  if (searchParams.country)  where.country   = searchParams.country
  if (searchParams.city)     where.city      = { contains: searchParams.city,   mode: 'insensitive' }
  if (searchParams.diaspora === '1') where.isDiaspora = true
  if (searchParams.search)   where.OR = [
    { businessName: { contains: searchParams.search, mode: 'insensitive' } },
    { bio:          { contains: searchParams.search, mode: 'insensitive' } },
    { location:     { contains: searchParams.search, mode: 'insensitive' } },
    { city:         { contains: searchParams.search, mode: 'insensitive' } },
    { category: { name: { contains: searchParams.search, mode: 'insensitive' } } },
  ]

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        category: true,
        portfolio: { take: 1, orderBy: { order: 'asc' } },
        reviews:   { select: { rating: true } },
        user:      { select: { name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { profileViews: 'desc' }],
    }),
    prisma.vendor.count({ where }),
  ])

  // Build current params helper (omits page on new filters)
  function buildUrl(overrides: Record<string, string | undefined>) {
    const base = { ...searchParams, ...overrides }
    const clean = Object.fromEntries(Object.entries(base).filter(([, v]) => v != null && v !== ''))
    return '/vendors?' + new URLSearchParams(clean as Record<string, string>).toString()
  }

  const citiesForCountry = searchParams.country ? (CITIES[searchParams.country] ?? []) : []
  const activeFilters = [
    searchParams.search   && `"${searchParams.search}"`,
    currentCategory       && currentCategory.name,
    currentCountry        && currentCountry.name,
    searchParams.city     && searchParams.city,
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-theme">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-1 flex-shrink-0">
            <span className="font-display text-xl text-theme">Vow</span>
            <span className="font-display text-xl text-[#C8A96E]">Connect</span>
          </Link>

          {/* Search bar */}
          <form className="flex-1 max-w-xl" method="GET" action="/vendors">
            {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
            {searchParams.country  && <input type="hidden" name="country"  value={searchParams.country} />}
            {searchParams.city     && <input type="hidden" name="city"     value={searchParams.city} />}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-faint text-sm">🔍</span>
              <input
                name="search"
                defaultValue={searchParams.search}
                placeholder="Search by name, style, location…"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-theme-subtle border border-[var(--border)] text-theme text-sm placeholder:text-theme-faint focus:outline-none focus:border-[#C8A96E] transition-colors"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/login"    className="btn-ghost text-sm hidden sm:inline-flex">Sign In</Link>
            <Link href="/register" className="btn-sand text-sm py-2 px-4 rounded-full">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* Header */}
        <div className="mb-7">
          <div className="section-label mb-2">
            {[currentCountry?.flag, currentCountry?.name, searchParams.city, currentCategory?.name].filter(Boolean).join(' · ') || 'All Vendors'}
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="font-display text-4xl md:text-5xl text-theme">
              {searchParams.search ? `"${searchParams.search}"` : currentCategory ? `${currentCategory.emoji} ${currentCategory.name}s` : 'Browse Vendors'}
            </h1>
            <p className="text-theme-muted text-sm">{total} vendor{total !== 1 ? 's' : ''}</p>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {activeFilters.map(f => (
                <span key={f} className="badge-sand text-xs">{f}</span>
              ))}
              <Link href="/vendors" className="text-xs text-theme-muted hover:text-theme underline underline-offset-2">Clear all</Link>
            </div>
          )}
        </div>

        {/* Filters row */}
        <div className="space-y-3 mb-8 pb-8 border-b border-[var(--border)]">
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            <Link href={buildUrl({ category: undefined, page: undefined })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${!searchParams.category ? 'bg-[#0A0A0A] dark:bg-[#F5F5F5] text-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white' : 'bg-theme-card text-theme-muted border-[var(--border)] hover:border-[#C8A96E]/50 hover:text-theme'}`}>
              All Categories
            </Link>
            {categories.map(c => (
              <Link key={c.slug} href={buildUrl({ category: c.slug, page: undefined })}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${searchParams.category === c.slug ? 'bg-[#0A0A0A] dark:bg-[#F5F5F5] text-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white' : 'bg-theme-card text-theme-muted border-[var(--border)] hover:border-[#C8A96E]/50 hover:text-theme'}`}>
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>

          {/* Country + City filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-theme-faint font-semibold uppercase tracking-wider">Location:</span>
            <Link href={buildUrl({ country: undefined, city: undefined, page: undefined })}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${!searchParams.country ? 'bg-[#C8A96E] text-white border-[#C8A96E]' : 'bg-theme-card text-theme-muted border-[var(--border)] hover:border-[#C8A96E]/50 hover:text-theme'}`}>
              🌍 Worldwide
            </Link>
            {COUNTRIES.map(c => (
              <Link key={c.code} href={buildUrl({ country: c.code, city: undefined, page: undefined })}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${searchParams.country === c.code ? 'bg-[#C8A96E] text-white border-[#C8A96E]' : 'bg-theme-card text-theme-muted border-[var(--border)] hover:border-[#C8A96E]/50 hover:text-theme'}`}>
                {c.flag} {c.name}
              </Link>
            ))}
          </div>

          {/* City sub-filter (only when country is selected) */}
          {citiesForCountry.length > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs text-theme-faint font-semibold uppercase tracking-wider">City:</span>
              <Link href={buildUrl({ city: undefined, page: undefined })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${!searchParams.city ? 'border-[#C8A96E] text-[#C8A96E]' : 'bg-theme-card text-theme-muted border-[var(--border)] hover:border-[#C8A96E]/50 hover:text-theme'}`}>
                All cities
              </Link>
              {citiesForCountry.map(city => (
                <Link key={city} href={buildUrl({ city, page: undefined })}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${searchParams.city === city ? 'border-[#C8A96E] text-[#C8A96E]' : 'bg-theme-card text-theme-muted border-[var(--border)] hover:border-[#C8A96E]/50 hover:text-theme'}`}>
                  {city}
                </Link>
              ))}
            </div>
          )}

          {/* Diaspora specialist filter */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-theme-faint font-semibold uppercase tracking-wider">Specialist:</span>
            <Link href={buildUrl({ diaspora: undefined, page: undefined })}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${!searchParams.diaspora ? 'bg-[#C8A96E] text-white border-[#C8A96E]' : 'bg-theme-card text-theme-muted border-[var(--border)] hover:border-[#C8A96E]/50 hover:text-theme'}`}>
              All vendors
            </Link>
            <Link href={buildUrl({ diaspora: '1', page: undefined })}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${searchParams.diaspora === '1' ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-card text-theme-muted border-[var(--border)] hover:border-blue-400/50 hover:text-theme'}`}>
              ✈️ Diaspora Specialist
            </Link>
          </div>
        </div>

        {/* Vendor grid */}
        {vendors.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-5 opacity-20">🔍</div>
            <p className="font-display text-3xl text-theme mb-2">No vendors found</p>
            <p className="text-theme-muted text-sm mb-6">Try adjusting your filters or search terms</p>
            <Link href="/vendors" className="btn-sand px-8 py-3 rounded-full">Clear all filters</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendors.map(v => {
              const avg = v.reviews.length
                ? (v.reviews.reduce((s, r) => s + r.rating, 0) / v.reviews.length).toFixed(1)
                : null
              const countryInfo = COUNTRIES.find(c => c.code === v.country)
              return (
                <div key={v.id} className="card card-hover overflow-hidden group">
                  {/* Image */}
                  <div className="relative h-48 bg-theme-subtle overflow-hidden">
                    {v.portfolio[0] ? (
                      <img src={v.portfolio[0].url} alt={v.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-theme-faint">
                        {v.category?.emoji ?? '🧣'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {v.isFeatured && <span className="bg-[#C8A96E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">FEATURED</span>}
                      {v.isVerified && <span className="bg-white/90 dark:bg-black/70 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">✓ Verified</span>}
                      {(v as any).isDiaspora && <span className="bg-blue-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">✈️ Diaspora</span>}
                    </div>
                    {v.plan === 'premium' && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-black/60 text-[#C8A96E] text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">PREMIUM</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-theme text-sm leading-tight truncate">{v.businessName}</h3>
                        <p className="text-theme-faint text-xs mt-0.5">
                          {countryInfo?.flag} {v.city || v.location}
                        </p>
                      </div>
                      {v.category && (
                        <span className="text-[9px] font-semibold text-theme-faint border border-[var(--border)] rounded-full px-2 py-0.5 flex-shrink-0">
                          {v.category.emoji} {v.category.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
                      {avg && (
                        <span className="text-xs text-[#C8A96E] font-semibold">
                          ★ {avg} <span className="text-theme-faint font-normal">({v.reviews.length})</span>
                        </span>
                      )}
                      {v.priceMin && (
                        <span className="text-xs font-semibold text-theme-muted">
                          {formatPrice(v.priceMin, v.currency ?? 'NGN')}+
                        </span>
                      )}
                      <div className="ml-auto flex gap-1.5">
                        {v.whatsapp && currentUser && (
                          <a href={getWhatsAppLink(v.whatsapp, `Hi! I found you on VowConnect.`)} target="_blank" rel="noreferrer"
                            className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xs hover:scale-110 transition-transform">
                            💬
                          </a>
                        )}
                        <Link href={`/vendors/${v.id}`}
                          className="px-3 py-1.5 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] text-xs font-semibold hover:opacity-80 transition-opacity">
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-center gap-3 mt-12">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })} className="btn-outline px-6 py-2.5 rounded-full text-sm">← Prev</Link>
            )}
            <span className="px-4 py-2.5 text-sm text-theme-muted">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            {page * limit < total && (
              <Link href={buildUrl({ page: String(page + 1) })} className="btn-sand px-6 py-2.5 rounded-full text-sm">Next →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
