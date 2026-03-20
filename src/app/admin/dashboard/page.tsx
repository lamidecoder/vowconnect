import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  if (!user)                        redirect('/login?next=/admin/dashboard')
  if (user.role !== 'SUPER_ADMIN')  redirect('/login')

  const [totalVendors,pendingVendors,totalUsers,totalBookings,openTickets,openReports,recentBookings,pendingList,recentTickets] = await Promise.all([
    prisma.vendor.count({ where: { deletedAt: null } }),
    prisma.vendor.count({ where: { status: 'PENDING_REVIEW', deletedAt: null } }),
    prisma.user.count(),
    prisma.booking.count({ where: { deletedAt: null } }),
    prisma.supportTicket.count({ where: { status: { in: ['OPEN','IN_PROGRESS'] } } }),
    prisma.report.count({ where: { status: 'OPEN' } }),
    prisma.booking.findMany({ where: { deletedAt: null }, include: { vendor: true, client: true }, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.vendor.findMany({ where: { status: 'PENDING_REVIEW', deletedAt: null }, include: { user: true, category: true }, take: 4 }),
    prisma.supportTicket.findMany({ where: { status: { in: ['OPEN','IN_PROGRESS'] } }, orderBy: [{ priority:'asc' },{ createdAt:'desc' }], take: 5 }),
  ])

  const navItems = [
    { href:'/admin/dashboard',    label:'Dashboard',       icon:'🏠' },
    { href:'/admin/vendors-list', label:'Vendors',         icon:'🏪', badge: pendingVendors || undefined },
    { href:'/admin/users',        label:'Users',           icon:'👥' },
    { href:'/admin/bookings',     label:'Bookings',        icon:'📅' },
    { href:'/admin/support',      label:'Support',         icon:'🎫', badge: openTickets || undefined },
    { href:'/admin/reports',      label:'Reports',         icon:'⚠️', badge: openReports  || undefined },
    { href:'/admin/complaints',   label:'Disputes',        icon:'⚖️' },
    { href:'/admin/analytics',    label:'Analytics',       icon:'📊' },
    { href:'/admin/broadcast',    label:'Broadcast',       icon:'📢' },
    { href:'/admin/logs',         label:'Admin Logs',      icon:'📋' },
    { href:'/admin/system',       label:'System',          icon:'⚙️' },
  ]

  return (
    <DashboardShell role="admin" userName={user.name} navItems={navItems}>
      {/* Header */}
      <div className="px-8 py-6 border-b flex items-center justify-between"
        style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Admin Panel</div>
          <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Platform Overview</h1>
        </div>
        {pendingVendors > 0 && (
          <Link href="/admin/vendors-list"
            className="text-sm font-bold px-4 py-2 rounded-xl text-white animate-pulse"
            style={{background:'#C8A96E'}}>
            🔔 {pendingVendors} Pending Review
          </Link>
        )}
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[
            { label:'Vendors',       value:totalVendors,   href:'/admin/vendors-list', color:'#6366f1', urgent:false },
            { label:'Pending',       value:pendingVendors, href:'/admin/vendors-list', color:'#f59e0b', urgent:pendingVendors>0 },
            { label:'Users',         value:totalUsers,     href:'/admin/users',        color:'#10b981', urgent:false },
            { label:'Bookings',      value:totalBookings,  href:'/admin/bookings',     color:'#C8A96E', urgent:false },
            { label:'Open Tickets',  value:openTickets,    href:'/admin/support',      color:'#ef4444', urgent:openTickets>0 },
            { label:'Open Reports',  value:openReports,    href:'/admin/reports',      color:'#f97316', urgent:openReports>0 },
          ].map(s => (
            <Link key={s.label} href={s.href}
              className="rounded-2xl p-5 relative overflow-hidden transition-all hover:scale-[1.02]"
              style={{
                background: s.urgent ? `${s.color}15` : 'var(--bg-card)',
                border:`1px solid ${s.urgent ? `${s.color}40` : 'var(--border)'}`,
              }}>
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full opacity-20" style={{background:s.color}}/>
              <div className="font-display text-3xl font-bold mb-1" style={{color:s.urgent?s.color:'var(--text)'}}>{s.value}</div>
              <div className="text-xs font-semibold" style={{color:'var(--text-muted)'}}>{s.label}</div>
              {s.urgent && s.value > 0 && <div className="text-[10px] font-bold mt-1" style={{color:s.color}}>Action needed →</div>}
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent bookings */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
              <h2 className="font-semibold" style={{color:'var(--text)'}}>Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>View all →</Link>
            </div>
            {recentBookings.length === 0 ? (
              <div className="p-12 text-center text-sm" style={{color:'var(--text-faint)'}}>No bookings yet</div>
            ) : recentBookings.map(b => (
              <div key={b.id} className="px-6 py-4 flex items-center gap-4 border-b last:border-0" style={{borderColor:'var(--border)'}}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{b.vendor.businessName}</div>
                  <div className="text-xs" style={{color:'var(--text-faint)'}}>by {b.client.name} · {formatDate(b.eventDate)}</div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
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
            {/* Pending vendors */}
            <div className="rounded-2xl overflow-hidden" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
                <h2 className="font-semibold text-sm" style={{color:'var(--text)'}}>Pending Vendors</h2>
                <Link href="/admin/vendors-list" className="text-xs font-semibold" style={{color:'#C8A96E'}}>View all →</Link>
              </div>
              {pendingList.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="text-sm font-semibold" style={{color:'var(--text-muted)'}}>All caught up!</div>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {pendingList.map(v => (
                    <div key={v.id} className="p-3 rounded-xl" style={{background:'var(--bg-subtle)'}}>
                      <div className="font-semibold text-sm" style={{color:'var(--text)'}}>{v.businessName}</div>
                      <div className="text-xs mb-2" style={{color:'var(--text-faint)'}}>{v.category?.name} · {v.city}</div>
                      <Link href="/admin/vendors-list" className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                        Review →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Open tickets */}
            {recentTickets.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
                  <h3 className="font-semibold text-sm" style={{color:'var(--text)'}}>🎫 Open Tickets</h3>
                  <Link href="/admin/support" className="text-xs font-semibold" style={{color:'#C8A96E'}}>View all →</Link>
                </div>
                <div className="p-3 space-y-2">
                  {recentTickets.map(t => (
                    <Link key={t.id} href="/admin/support"
                      className="flex items-center gap-3 p-3 rounded-xl hover:opacity-80" style={{background:'var(--bg-subtle)'}}>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono mb-0.5" style={{color:'#C8A96E'}}>{t.ticketNumber}</div>
                        <div className="text-sm font-medium truncate" style={{color:'var(--text)'}}>{t.subject}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        t.priority==='URGENT'?'bg-red-100 text-red-700':
                        t.priority==='HIGH'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>
                        {t.priority}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}