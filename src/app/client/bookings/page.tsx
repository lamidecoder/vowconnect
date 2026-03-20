import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LeaveReviewButton } from '@/components/booking/LeaveReviewButton'
import DashboardShell from '@/components/layout/DashboardShell'

export const dynamic = 'force-dynamic'

const NAV = [
  { href:'/client/dashboard',  label:'Dashboard',     icon:'🏠' },
  { href:'/client/bookings',   label:'My Bookings',   icon:'📅' },
  { href:'/client/wedding',    label:'Wedding Hub',   icon:'💍' },
  { href:'/client/messages',   label:'Messages',      icon:'💬' },
  { href:'/client/quotes',     label:'Quotes',        icon:'📄' },
  { href:'/client/favorites',  label:'Saved Vendors', icon:'❤️' },
  { href:'/vendors',           label:'Browse Vendors',icon:'🔍' },
  { href:'/client/asoebi',     label:'Asoebi Groups', icon:'👘' },
  { href:'/client/profile',    label:'Profile',       icon:'✏️' },
  { href:'/support',           label:'Support',       icon:'🎫' },
]

export default async function ClientBookingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/client/bookings')
  if (user.role === 'VENDOR')      redirect('/vendor/bookings')
  if (user.role === 'SUPER_ADMIN') redirect('/admin/bookings')

  const bookings = await prisma.booking.findMany({
    where: { clientId: user.id, deletedAt: null },
    include: {
      vendor: { include: { category: true, portfolio: { take:1, orderBy:{ order:'asc' } } } },
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const groups = {
    active:    bookings.filter(b => ['PENDING','ACCEPTED'].includes(b.status)),
    completed: bookings.filter(b => b.status === 'COMPLETED'),
    other:     bookings.filter(b => ['DECLINED','CANCELLED'].includes(b.status)),
  }

  const STATUS_STYLE: Record<string,string> = {
    PENDING:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    ACCEPTED:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    COMPLETED: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    DECLINED:  'bg-red-500/20 text-red-400 border border-red-500/30',
    CANCELLED: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30',
  }

  return (
    <DashboardShell role="client" userName={user.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Client</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>My Bookings</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>{bookings.length} booking{bookings.length!==1?'s':''} total</p>
      </div>

      <div className="p-8">
        {bookings.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">💍</div>
            <h3 className="font-semibold text-lg mb-2" style={{color:'var(--text)'}}>No bookings yet</h3>
            <p className="text-sm mb-6" style={{color:'var(--text-muted)'}}>Find your perfect vendor and make your first booking</p>
            <Link href="/vendors" className="inline-flex text-sm font-bold px-6 py-3 rounded-xl text-white"
              style={{background:'#C8A96E'}}>Browse Vendors →</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {[
              { title:'🟡 Active Bookings',      items: groups.active,    show: groups.active.length > 0 },
              { title:'✅ Completed',             items: groups.completed, show: groups.completed.length > 0 },
              { title:'❌ Declined / Cancelled',  items: groups.other,     show: groups.other.length > 0 },
            ].filter(g => g.show).map(group => (
              <div key={group.title}>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{color:'var(--text-muted)'}}>{group.title}</h2>
                <div className="space-y-3">
                  {group.items.map(b => (
                    <div key={b.id} className="rounded-2xl overflow-hidden"
                      style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                      <div className="p-5 flex gap-4">
                        {/* Vendor image/emoji */}
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{background:'var(--bg-subtle)'}}>
                          {b.vendor.portfolio[0]
                            ? <img src={b.vendor.portfolio[0].url} className="w-full h-full object-cover rounded-xl" alt=""/>
                            : b.vendor.category?.emoji ?? '🎊'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="font-semibold" style={{color:'var(--text)'}}>{b.vendor.businessName}</div>
                              <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>
                                {b.vendor.category?.name} · {b.eventType} · {formatDate(b.eventDate)}
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[b.status]??''}`}>
                              {b.status}
                            </span>
                          </div>
                          {b.notes && (
                            <p className="text-xs italic mb-3 line-clamp-2" style={{color:'var(--text-muted)'}}>"{b.notes}"</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/client/bookings/${b.id}`}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                              style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>
                              View Details →
                            </Link>
                            <Link href="/client/messages"
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                              style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>
                              💬 Message
                            </Link>
                            {b.status === 'COMPLETED' && !b.review && (
                              <LeaveReviewButton bookingId={b.id} vendorName={b.vendor.businessName} />
                            )}
                            {b.review && (
                              <span className="text-xs px-3 py-1.5 rounded-lg" style={{background:'rgba(16,185,129,0.1)', color:'#10b981'}}>
                                ★ Reviewed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

