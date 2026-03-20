import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatPrice, formatDate } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import BookingModal from '@/components/booking/BookingModal'
import FavoriteButton from '@/components/vendor/FavoriteButton'
import ReportVendorButton from '@/components/vendor/ReportVendorButton'
import PinToMoodboardButton from '@/components/vendor/PinToMoodboardButton'
import MessageVendorButton from '@/components/messaging/MessageVendorButton'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vendor = await prisma.vendor.findFirst({
    where: { id: params.id, status: 'APPROVED', deletedAt: null },
    include: { category: true },
  })
  if (!vendor) return { title: 'Vendor Not Found' }
  return {
    title: `${vendor.businessName} — ${vendor.category.name} in ${vendor.location}`,
    description: vendor.bio ?? `Book ${vendor.businessName}, a verified ${vendor.category.name} in ${vendor.location}.`,
  }
}

export default async function VendorProfilePage({ params }: Props) {
  const [vendor, currentUser] = await Promise.all([
    prisma.vendor.findFirst({
      where: { id: params.id, status: 'APPROVED', deletedAt: null },
      include: {
        category: true,
        user: { select: { name: true, avatar: true, createdAt: true } },
        portfolio: { orderBy: { order: 'asc' } },
        reviews: {
          include: { client: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { bookings: true, favorites: true } },
      },
    }),
    getCurrentUser(),
  ])

  if (!vendor) notFound()

  // Increment view count + log analytics event (async, non-blocking)
  prisma.vendor.update({ where: { id: params.id }, data: { profileViews: { increment: 1 } } }).catch(() => {})
  prisma.analyticsEvent.create({ data: { vendorId: params.id, type: 'profile_view' } }).catch(() => {})

  const avgRating = vendor.reviews.length
    ? vendor.reviews.reduce((s, r) => s + r.rating, 0) / vendor.reviews.length
    : null

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: vendor.reviews.filter(r => r.rating === star).length,
    pct: vendor.reviews.length
      ? Math.round((vendor.reviews.filter(r => r.rating === star).length / vendor.reviews.length) * 100)
      : 0,
  }))

  const isFavorited = currentUser
    ? !!(await prisma.favorite.findUnique({
        where: { userId_vendorId: { userId: currentUser.id, vendorId: vendor.id } },
      }))
    : false


  // AI review summary — only when 3+ reviews, non-blocking
  let reviewSummary: string | null = null
  if (vendor.reviews.length >= 3) {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (apiKey && apiKey !== 'your_anthropic_api_key_here') {
        const snippets = vendor.reviews
          .filter(r => r.comment)
          .slice(0, 8)
          .map(r => `★${r.rating}: "${r.comment}"`)
          .join('\n')
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'x-api-key': apiKey },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 150,
            system: 'Summarise vendor reviews for a Nigerian wedding marketplace in 1–2 warm sentences. Be specific. No preamble.',
            messages: [{ role: 'user', content: `Vendor: ${vendor.businessName} (${vendor.category.name})\nReviews:\n${snippets}` }],
          }),
        })
        const json = await res.json()
        reviewSummary = json.content?.[0]?.text?.trim() ?? null
      }
    } catch { /* fail silently */ }
  }
  return (
    <div className="min-h-screen bg-theme-subtle">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 glass border-b border-[var(--border)]/50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/vendors" className="btn-ghost text-sm py-1.5">← Back to Vendors</Link>
          <div className="flex-1" />
          <Link href="/" className="font-display text-lg font-bold text-[#C8A96E] hidden sm:block">
            Vow<span className="text-[#C8A96E]">Connect</span>
          </Link>
          {!currentUser && (
            <Link href="/login" className="btn-primary text-sm py-2 px-4">Sign In to Book</Link>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero — portfolio gallery */}
            <div className="card overflow-hidden">
              {vendor.portfolio.length > 0 ? (
                <div className="grid gap-1"
                  style={{ gridTemplateColumns: vendor.portfolio.length === 1 ? '1fr' : 'repeat(2, 1fr)', gridTemplateRows: 'auto' }}>
                  {vendor.portfolio.slice(0, 5).map((img, i) => (
                    <div key={img.id}
                      className={`relative overflow-hidden bg-theme-subtle group ${i === 0 && vendor.portfolio.length > 1 ? 'row-span-2' : ''}`}
                      style={{ aspectRatio: i === 0 ? '4/5' : '1/1' }}>
                      <img
                        src={img.url}
                        alt={img.caption ?? `${vendor.businessName} portfolio ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <PinToMoodboardButton
                        imageUrl={img.url}
                        caption={img.caption ?? vendor.businessName}
                        vendorId={vendor.id}
                        category={vendor.category?.slug}
                      />
                      {i === 4 && vendor.portfolio.length > 5 && (
                        <div className="absolute inset-0 bg-[#0A0A0A]/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">+{vendor.portfolio.length - 5} more</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-[#F5ECD8] to-[#EAD5B0] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-3">{vendor.category.emoji}</div>
                    <p className="text-theme-faint text-sm">No portfolio images yet</p>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <div className="card p-6">
              <h2 className="font-display text-2xl font-bold text-theme mb-3">About {vendor.businessName}</h2>
              {vendor.bio ? (
                <p className="text-theme-muted leading-relaxed">{vendor.bio}</p>
              ) : (
                <p className="text-theme-faint italic">This vendor hasn't written a bio yet.</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
                {[
                  { label: 'Category',   value: `${vendor.category.emoji} ${vendor.category.name}` },
                  { label: 'Location',   value: `📍 ${vendor.location}` },
                  { label: 'Price Range',value: `${formatPrice(vendor.priceMin)} – ${formatPrice(vendor.priceMax)}` },
                  { label: 'Bookings',   value: `${vendor._count.bookings} completed` },
                ].map(item => (
                  <div key={item.label}>
                    <div className="label">{item.label}</div>
                    <div className="text-sm font-medium text-theme">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                {vendor.isVerified && (
                  <span className="badge badge-blue">✓ Verified by VowConnect</span>
                )}
                {vendor.isFeatured && (
                  <span className="badge-gold">⭐ Featured Vendor</span>
                )}
                {(vendor as any).isDiaspora && (
                  <span className="badge" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' }}>✈️ Diaspora Specialist</span>
                )}
                <span className={`badge ${vendor.isAvailable ? 'badge-green' : 'badge-gray'}`}>
                  {vendor.isAvailable ? '🟢 Available for Bookings' : '🔴 Currently Unavailable'}
                </span>
                <span className="badge badge-gray">
                  👁️ {vendor.profileViews} profile views
                </span>
              </div>
            </div>

            {/* Full Portfolio */}
            {vendor.portfolio.length > 5 && (
              <div className="card p-6">
                <h2 className="font-display text-2xl font-bold text-theme mb-4">Full Portfolio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {vendor.portfolio.map(img => (
                    <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-theme-subtle">
                      <img src={img.url} alt={img.caption ?? ''} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-theme">
                  Reviews {vendor.reviews.length > 0 && <span className="text-theme-faint font-normal text-lg">({vendor.reviews.length})</span>}
                </h2>
                {avgRating && (
                  <div className="text-right">
                    <div className="font-display text-4xl font-bold text-gradient-gold">{avgRating.toFixed(1)}</div>
                    <div className="flex gap-0.5 justify-end mt-1">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-sm ${avgRating >= i ? 'text-[#C8A96E]' : 'text-white/50'}`}>★</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {avgRating && (
                <div className="space-y-2 mb-6 pb-6 border-b border-[var(--border)]">
                  {ratingBreakdown.map(r => (
                    <div key={r.star} className="flex items-center gap-3">
                      <span className="text-sm text-theme-muted w-4">{r.star}</span>
                      <span className="text-[#C8A96E] text-sm">★</span>
                      <div className="flex-1 h-2 bg-theme-subtle rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#C8A96E]-500 to-gold-400 rounded-full transition-all duration-700"
                          style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-xs text-theme-faint w-6 text-right">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}

              {vendor.reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="text-theme-muted text-sm">No reviews yet — be the first to book and review!</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviewSummary && (
                    <div style={{
                      padding: '14px 18px', borderRadius: 14, marginBottom: 4,
                      background: 'linear-gradient(135deg,rgba(201,148,26,0.08),rgba(201,148,26,0.03))',
                      border: '1.5px solid rgba(201,148,26,0.2)',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>✨</span>
                      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, fontStyle: 'italic' }}>
                        {reviewSummary}
                      </p>
                    </div>
                  )}
                  {vendor.reviews.map(review => (
                    <div key={review.id} className="pb-5 border-b border-white/8 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F5ECD8] to-[#EAD5B0] flex items-center justify-center font-bold text-theme text-sm shrink-0">
                          {review.client.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-theme text-sm">{review.client.name}</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(i => (
                                <span key={i} className={`text-xs ${review.rating >= i ? 'text-[#C8A96E]' : 'text-white/50'}`}>★</span>
                              ))}
                            </div>
                            <span className="text-theme-faint text-xs ml-auto">{formatDate(review.createdAt)}</span>
                          </div>
                          {review.comment && (
                            <p className="text-theme-muted text-sm leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Sticky booking card ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">

              {/* Vendor identity card */}
              <div className="card p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5ECD8] to-[#EAD5B0] flex items-center justify-center text-2xl font-bold text-theme shrink-0 overflow-hidden">
                    {vendor.user.avatar
                      ? <img src={vendor.user.avatar} alt="" className="w-full h-full object-cover" />
                      : vendor.category.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="font-display text-2xl font-bold text-theme leading-tight">{vendor.businessName}</h1>
                    <p className="text-theme-muted text-sm mt-0.5">{vendor.category.name} · {vendor.location}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {avgRating && (
                        <span className="flex items-center gap-1 text-sm font-semibold text-theme">
                          <span className="text-[#C8A96E]">★</span> {avgRating.toFixed(1)}
                          <span className="text-theme-faint font-normal">({vendor.reviews.length})</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-theme-subtle border border-[var(--border)] mb-4">
                  <div className="text-xs text-theme-muted font-medium uppercase tracking-wide mb-1">Price Range</div>
                  <div className="font-semibold text-theme">
                    {formatPrice(vendor.priceMin)} – {formatPrice(vendor.priceMax)}
                  </div>
                </div>

                {/* Action buttons */}
                {vendor.isAvailable ? (
                  <>
                    {currentUser ? (
                      <BookingModal vendorId={vendor.id} vendorName={vendor.businessName} />
                    ) : (
                      <Link href={`/login?redirect=/vendors/${vendor.id}`} className="btn-primary w-full justify-center py-3 text-base">
                        Sign In to Book
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="w-full py-3 rounded-full bg-theme-subtle text-theme-faint text-center text-sm font-medium cursor-not-allowed">
                    Currently Unavailable
                  </div>
                )}

                {currentUser && (
                  <MessageVendorButton vendorId={vendor.id} />
                )}

                {currentUser ? (
                  <a href="/client/messages"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all"
                    style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                    💬 Message Vendor
                  </a>
                ) : (
                  <Link href={`/register?next=/vendors/${vendor.id}`}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-full bg-theme-subtle border-2 border-[#C8A96E]/40 text-[#C8A96E] font-semibold text-sm transition-all hover:bg-[#C8A96E]/10">
                    🔒 Sign up free to contact vendor
                  </Link>
                )}

                {currentUser && (
                  <FavoriteButton vendorId={vendor.id} initialFavorited={isFavorited} />
                )}

                {currentUser && vendor.isAvailable && (
                  <Link href={'/client/asoebi'}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-[#C8A96E]/60 text-[#C8A96E] font-semibold text-sm hover:bg-[#FDFAF4] transition-all">
                    💃 Asoebi Group Booking
                  </Link>
                )}
                {currentUser && (
                  <Link href={'/client/quotes'}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-[var(--border)] text-[var(--text-muted)] font-medium text-sm hover:bg-[var(--bg-subtle)] transition-all">
                    📄 View My Quotes
                  </Link>
                )}
              </div>

              {/* Social links */}
              {vendor.instagram && (
                <div className="card p-4">
                  <h3 className="label mb-3">Social</h3>
                  <a href={`https://instagram.com/${vendor.instagram.replace('@', '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-theme hover:text-[#C8A96E] transition-colors">
                    <span className="text-xl">📸</span>
                    @{vendor.instagram.replace('@', '')}
                  </a>
                </div>
              )}

              {/* Member since */}
              <div className="card p-4 text-center">
                <p className="text-theme-faint text-xs">Member since {formatDate(vendor.user.createdAt)}</p>
                <p className="text-theme-muted text-xs mt-1">{vendor._count.favorites} people saved this vendor</p>
              </div>

              {/* Report */}
              <div className="text-center">
                <ReportVendorButton vendorId={vendor.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}