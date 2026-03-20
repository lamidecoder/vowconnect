import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import EmailVerificationBanner from '@/components/shared/EmailVerificationBanner'
import DashboardShell from '@/components/layout/DashboardShell'

export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
  const user = await getCurrentUser()
  if (!user)                        redirect('/login?next=/client/dashboard')
  if (user.role === 'VENDOR')       redirect('/vendor/dashboard')
  if (user.role === 'SUPER_ADMIN')  redirect('/admin/dashboard')

  const [bookings, favorites, suggestedVendors] = await Promise.all([
    prisma.booking.findMany({
      where: { clientId: user.id, deletedAt: null },
      include: { vendor: { include: { category: true } } },
      orderBy: { createdAt: 'desc' }, take: 6,
    }),
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.vendor.findMany({
      where: { status: 'APPROVED', isFeatured: true },
      include: { category: true, reviews: { select: { rating: true } } },
      take: 4,
    }),
  ])

  const pending   = bookings.filter(b => b.status === 'PENDING').length
  const accepted  = bookings.filter(b => b.status === 'ACCEPTED').length
  const completed = bookings.filter(b => b.status === 'COMPLETED').length

  const navItems = [
    { href: '/client/dashboard',  label: 'Dashboard',     icon: '🏠' },
    { href: '/client/bookings',   label: 'My Bookings',   icon: '📅', badge: pending || undefined },
    { href: '/client/wedding',    label: 'Wedding Hub',   icon: '💍' },
    { href: '/client/messages',   label: 'Messages',      icon: '💬' },
    { href: '/client/quotes',     label: 'Quotes',        icon: '📄' },
    { href: '/client/favorites',  label: `Saved Vendors`, icon: '❤️' },
    { href: '/vendors',           label: 'Browse Vendors',icon: '🔍' },
    { href: '/client/asoebi',     label: 'Asoebi Groups', icon: '👘' },
    { href: '/client/profile',    label: 'Profile',       icon: '✏️' },
    { href: '/support',           label: 'Support',       icon: '🎫' },
  ]

  return (
    <DashboardShell role="client" userName={user.name} navItems={navItems}>
      {!user.emailVerified && <EmailVerificationBanner email={user.email} />}

      {/* Hero */}
      <div className="relative overflow-hidden px-8 py-8 border-b" style={{borderColor:'var(--border)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle at 80% 50%, #C8A96E, transparent 60%)'}}/>
        <div className="relative">
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Welcome back</div>
          <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Hey, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Your wedding planning journey is looking beautiful</p>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Total Bookings', value: bookings.length, icon:'📅', color:'#6366f1' },
            { label:'Pending',        value: pending,         icon:'⏳', color:'#f59e0b' },
            { label:'Confirmed',      value: accepted,        icon:'✅', color:'#10b981' },
            { label:'Completed',      value: completed,       icon:'🎉', color:'#C8A96E' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-6 relative overflow-hidden"
              style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10" style={{background:s.color}}/>
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
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
              <h2 className="font-semibold" style={{color:'var(--text)'}}>My Bookings</h2>
              <Link href="/client/bookings" className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>View all →</Link>
            </div>
            {bookings.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-5xl mb-3 opacity-20">💍</div>
                <p className="text-sm font-medium mb-3" style={{color:'var(--text-muted)'}}>No bookings yet</p>
                <Link href="/vendors" className="inline-flex text-sm font-bold px-4 py-2 rounded-xl text-white"
                  style={{background:'#C8A96E'}}>Browse Vendors →</Link>
              </div>
            ) : bookings.map(b => (
              <Link key={b.id} href={`/client/bookings/${b.id}`}
                className="px-6 py-4 flex items-center gap-4 border-b last:border-0 hover:opacity-80 transition-all"
                style={{borderColor:'var(--border)'}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{background:'var(--bg-subtle)'}}>
                  {b.vendor.category?.emoji ?? '🎊'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{color:'var(--text)'}}>{b.vendor.businessName}</div>
                  <div className="text-xs" style={{color:'var(--text-faint)'}}>{b.eventType} · {formatDate(b.eventDate)}</div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  b.status==='PENDING'?'bg-amber-100 text-amber-700':
                  b.status==='ACCEPTED'?'bg-emerald-100 text-emerald-700':
                  b.status==='COMPLETED'?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>
                  {b.status}
                </span>
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Quick actions grid */}
            <div className="rounded-2xl overflow-hidden" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="px-5 py-4 border-b" style={{borderColor:'var(--border)'}}>
                <h3 className="font-semibold text-sm" style={{color:'var(--text)'}}>Quick Actions</h3>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {[
                  { href:'/client/wedding',   icon:'💍', label:'Wedding Hub',    desc:'Plan your day'      },
                  { href:'/vendors',           icon:'🔍', label:'Find Vendors',   desc:'Browse & book'      },
                  { href:'/client/messages',   icon:'💬', label:'Messages',       desc:'Chat now'           },
                  { href:'/client/favorites',  icon:'❤️', label:`Saved (${favorites})`, desc:'Your list'   },
                  { href:'/map',               icon:'🗺️', label:'Map View',       desc:'Near you'           },
                  { href:'/client/quotes',     icon:'📄', label:'Quotes',         desc:'Compare prices'     },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex flex-col gap-1 p-3 rounded-xl hover:opacity-80 transition-all"
                    style={{background:'var(--bg-subtle)'}}>
                    <span className="text-xl">{l.icon}</span>
                    <span className="text-xs font-semibold" style={{color:'var(--text)'}}>{l.label}</span>
                    <span className="text-[10px]" style={{color:'var(--text-faint)'}}>{l.desc}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Suggested vendors */}
            {suggestedVendors.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="px-5 py-4 border-b" style={{borderColor:'var(--border)'}}>
                  <h3 className="font-semibold text-sm" style={{color:'var(--text)'}}>✨ Featured Vendors</h3>
                </div>
                <div className="p-4 space-y-2">
                  {suggestedVendors.map(v => {
                    const avg = v.reviews.length ? (v.reviews.reduce((s,r)=>s+r.rating,0)/v.reviews.length).toFixed(1) : null
                    return (
                      <Link key={v.id} href={`/vendors/${v.id}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:opacity-80 transition-all">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{background:'var(--bg-subtle)'}}>
                          {v.category?.emoji ?? '🎊'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{v.businessName}</div>
                          <div className="text-xs" style={{color:'var(--text-faint)'}}>{v.category?.name}{avg?` · ★${avg}`:''}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}


