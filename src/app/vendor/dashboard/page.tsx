mport { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import EmailVerificationBanner from '@/components/shared/EmailVerificationBanner'
import PaymentToast from '@/components/shared/PaymentToast'
import DashboardShell from '@/components/layout/DashboardShell'

export const dynamic = 'force-dynamic'

export default async function VendorDashboard() {
  const user = await getCurrentUser()
  if (!user)                         redirect('/login?next=/vendor/dashboard')
  if (user.role === 'CLIENT')        redirect('/client/dashboard')
  if (user.role === 'SUPER_ADMIN')   redirect('/admin/dashboard')
  if (!user.vendor)                  redirect('/vendor/profile')

  const vendor = user.vendor

  const [bookings, reviews, viewData] = await Promise.all([
    prisma.booking.findMany({
      where: { vendorId: vendor.id, deletedAt: null },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }, take: 8,
    }),
    prisma.review.findMany({
      where: { vendorId: vendor.id },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }, take: 4,
    }),
    prisma.vendor.findUnique({ where: { id: vendor.id }, select: { profileViews: true } }),
  ])

  const pending   = bookings.filter(b => b.status === 'PENDING').length
  const accepted  = bookings.filter(b => b.status === 'ACCEPTED').length
  const completed = bookings.filter(b => b.status === 'COMPLETED').length
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  const navItems = [
    { href: '/vendor/dashboard',    label: 'Dashboard',    icon: '🏠' },
    { href: '/vendor/bookings',     label: 'Bookings',     icon: '📅', badge: pending || undefined },
    { href: '/vendor/messages',     label: 'Messages',     icon: '💬' },
    { href: '/vendor/quotes',       label: 'Quotes',       icon: '📄' },
    { href: '/vendor/profile',      label: 'Profile',      icon: '✏️' },
    { href: '/vendor/portfolio',    label: 'Portfolio',    icon: '🖼️' },
    { href: '/vendor/packages',     label: 'Packages',     icon: '📦' },
    { href: '/vendor/availability', label: 'Availability', icon: '🗓️' },
    { href: '/vendor/crm',          label: 'Client CRM',   icon: '👥' },
    { href: '/vendor/analytics',    label: 'Analytics',    icon: '📊' },
    { href: '/vendor/pricing',      label: 'Pricing',      icon: '💰' },
  ]

  return (
    <DashboardShell role="vendor" userName={vendor.businessName} navItems={navItems}>
      <PaymentToast />
      {!user.emailVerified && <EmailVerificationBanner email={user.email} />}

      {/* Header */}
      <div className="px-8 py-6 border-b flex items-center justify-between"
        style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor Dashboard</div>
          <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>{vendor.businessName}</h1>
        </div>
        <div className="flex items-center gap-2">
          {avgRating && (
            <div className="px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>★ {avgRating}</div>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${vendor.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-amber-100 text-amber-700'}`}>
            {vendor.status}
          </span>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Profile Views', value: viewData?.profileViews ?? 0, icon:'👁️', color:'#6366f1' },
            { label:'Pending',       value: pending,                      icon:'⏳', color:'#f59e0b' },
            { label:'Confirmed',     value: accepted,                     icon:'✅', color:'#10b981' },
            { label:'Completed',     value: completed,                    icon:'🎉', color:'#C8A96E' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-6 relative overflow-hidden"
              style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10"
                style={{background:s.color}}/>
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className="font-display text-4xl font-bold" style={{color:'var(--text)'}}>{s.value}</div>
              <div className="text-xs mt-1 font-medium" style={{color:'var(--text-muted)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bookings */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="px-6 py-4 border-b flex items-center justify-between"
              style={{borderColor:'var(--border)'}}>
              <h2 className="font-semibold" style={{color:'var(--text)'}}>Recent Bookings</h2>
              <Link href="/vendor/bookings"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>
                View all →
              </Link>
            </div>
            {bookings.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-5xl mb-3 opacity-20">📅</div>
                <p className="text-sm font-medium" style={{color:'var(--text-muted)'}}>No bookings yet</p>
                <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Share your profile to get your first booking</p>
              </div>
            ) : bookings.slice(0,6).map((b,i) => (
              <div key={b.id} className="px-6 py-4 flex items-center gap-4 border-b last:border-0"
                style={{borderColor:'var(--border)'}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{background:`hsl(${i*55+20},55%,50%)`}}>
                  {b.client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{color:'var(--text)'}}>{b.client.name}</div>
                  <div className="text-xs" style={{color:'var(--text-faint)'}}>{b.eventType} · {formatDate(b.eventDate)}</div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  b.status==='PENDING'?'bg-amber-100 text-amber-700':
                  b.status==='ACCEPTED'?'bg-emerald-100 text-emerald-700':
                  b.status==='COMPLETED'?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Reviews */}
            <div className="rounded-2xl overflow-hidden"
              style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="px-5 py-4 border-b" style={{borderColor:'var(--border)'}}>
                <h3 className="font-semibold text-sm" style={{color:'var(--text)'}}>Latest Reviews</h3>
              </div>
              {reviews.length === 0 ? (
                <div className="p-8 text-center text-xs" style={{color:'var(--text-faint)'}}>No reviews yet</div>
              ) : (
                <div className="p-4 space-y-3">
                  {reviews.map(r => (
                    <div key={r.id} className="p-3 rounded-xl" style={{background:'var(--bg-subtle)'}}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{color:'var(--text)'}}>{r.client.name}</span>
                        <span className="text-xs" style={{color:'#C8A96E'}}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                      </div>
                      {r.comment && <p className="text-xs line-clamp-2" style={{color:'var(--text-muted)'}}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="rounded-2xl p-5 overflow-hidden relative"
              style={{background:'linear-gradient(135deg,#1a1208,#2d1f06)'}}>
              <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 80% 20%, #C8A96E, transparent 60%)'}}/>
              <div className="relative">
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#C8A96E'}}>Pro Tip</div>
                <p className="text-sm font-semibold text-white mb-3">Complete your profile to get 3x more bookings</p>
                <Link href="/vendor/profile"
                  className="inline-flex text-xs font-bold px-4 py-2 rounded-xl text-white"
                  style={{background:'#C8A96E'}}>
                  Complete Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}


