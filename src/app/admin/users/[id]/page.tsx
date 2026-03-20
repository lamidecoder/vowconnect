import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import AdminUserEditForm from './AdminUserEditForm'

interface Props { params: { id: string } }

export default async function AdminUserDetailPage({ params }: Props) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'SUPER_ADMIN') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      vendor: {
        include: {
          category: true,
          portfolio: true,
          reviews: { include: { client: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
          _count: { select: { bookings: true, favorites: true } },
        },
      },
      bookings: {
        include: { vendor: { select: { businessName: true } } },
        orderBy: { createdAt: 'desc' }, take: 10,
      },
      supportTickets: {
        orderBy: { createdAt: 'desc' }, take: 10,
        include: { replies: { orderBy: { createdAt: 'asc' } } },
      },
      _count: { select: { bookings: true, reviews: true } },
    },
  })
  if (!user) notFound()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back */}
      <a href="/admin/users" className="text-sm text-theme-muted hover:text-theme transition-colors">← Back to Users</a>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5ECD8] to-[#EAD5B0] flex items-center justify-center text-2xl font-bold text-theme shrink-0 overflow-hidden">
            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover"/> : user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-theme">{user.name}</h1>
            <p className="text-theme-muted text-sm">{user.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className={`badge text-xs ${user.role === 'SUPER_ADMIN' ? 'badge-purple' : user.role === 'VENDOR' ? 'badge-gold' : 'badge-green'}`}>{user.role}</span>
              <span className={`badge text-xs ${user.isActive ? 'badge-green' : 'badge-red'}`}>{user.isActive ? 'Active' : 'Suspended'}</span>
              {user.emailVerified && <span className="badge badge-blue text-xs">✉ Verified</span>}
              {user.googleId && <span className="badge badge-gray text-xs">🔗 Google</span>}
            </div>
          </div>
          <div className="text-right text-xs text-theme-faint">
            <div>Joined {formatDate(user.createdAt)}</div>
            <div className="mt-1">ID: {user.id.slice(0, 12)}...</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
          {[
            { label: 'Total Bookings', value: user._count.bookings },
            { label: 'Reviews Given', value: user._count.reviews },
            { label: 'Phone', value: user.phone ?? '—' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-xs text-theme-faint uppercase tracking-widest mb-1">{s.label}</div>
              <div className="font-semibold text-theme text-sm">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      <AdminUserEditForm user={user} vendor={user.vendor} />

      {/* Vendor profile if exists */}
      {user.vendor && (
        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-theme mb-4">Vendor Profile</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Business', user.vendor.businessName],
              ['Category', user.vendor.category.name],
              ['Status', user.vendor.status],
              ['Plan', user.vendor.plan],
              ['Location', user.vendor.location],
              ['Country', `${user.vendor.countryName ?? ''} (${user.vendor.country})`],
              ['Price Range', `${user.vendor.currency} ${user.vendor.priceMin} – ${user.vendor.priceMax}`],
              ['Views', String(user.vendor.profileViews)],
              ['Bookings', String(user.vendor._count.bookings)],
              ['Portfolio', `${user.vendor.portfolio.length} items`],
            ].map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl bg-theme-subtle">
                <div className="text-xs text-theme-faint uppercase tracking-wide mb-1">{k}</div>
                <div className="font-medium text-theme">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3 flex-wrap">
            <a href={`/vendors/${user.vendor.id}`} target="_blank" className="btn-ghost text-sm py-1.5">View Public Profile →</a>
            <a href={`/admin/vendors-list`} className="btn-ghost text-sm py-1.5">Manage All Vendors →</a>
          </div>
        </div>
      )}

      {/* Recent bookings */}
      {user.bookings.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-theme mb-4">Recent Bookings</h2>
          <div className="space-y-2">
            {user.bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-theme-subtle text-sm">
                <div>
                  <span className="font-medium text-theme">{b.eventType}</span>
                  <span className="text-theme-muted ml-2">{b.vendor.businessName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge text-xs ${b.status === 'COMPLETED' ? 'badge-green' : b.status === 'ACCEPTED' ? 'badge-blue' : b.status === 'PENDING' ? 'badge-gold' : 'badge-red'}`}>{b.status}</span>
                  <span className="text-theme-faint">{formatDate(b.eventDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support tickets */}
      {(user as any).supportTickets?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-theme">🎫 Support Tickets</h2>
            <a href="/admin/support" className="btn-ghost text-sm py-1.5">View All Tickets →</a>
          </div>
          <div className="space-y-3">
            {(user as any).supportTickets.map((t: any) => (
              <div key={t.id} className="p-4 rounded-xl bg-theme-subtle border border-[var(--border)]">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-mono text-[#C8A96E] font-bold">{t.ticketNumber}</span>
                    <div className="font-semibold text-theme text-sm mt-0.5">{t.subject}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`badge text-xs ${t.status === 'OPEN' ? 'badge-red' : t.status === 'IN_PROGRESS' ? 'badge-sand' : t.status === 'RESOLVED' ? 'badge-green' : 'badge-gray'}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                    <span className={`badge text-xs ${t.priority === 'URGENT' ? 'badge-red' : t.priority === 'HIGH' ? 'badge-sand' : 'badge-blue'}`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
                <p className="text-theme-muted text-xs line-clamp-2">{t.description}</p>
                <div className="text-xs text-theme-faint mt-2">
                  {t.replies.length} repl{t.replies.length === 1 ? 'y' : 'ies'} · {formatDate(t.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
