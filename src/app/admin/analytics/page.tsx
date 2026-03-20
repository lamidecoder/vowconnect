import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'

export const dynamic = 'force-dynamic'

const NAV = [
  { href:'/admin/dashboard',    label:'Dashboard',      icon:'🏠' },
  { href:'/admin/vendors-list', label:'Vendors',        icon:'🏪' },
  { href:'/admin/users',        label:'Users',          icon:'👥' },
  { href:'/admin/bookings',     label:'Bookings',       icon:'📅' },
  { href:'/admin/support',      label:'Support',        icon:'🎫' },
  { href:'/admin/reports',      label:'Reports',        icon:'⚠️' },
  { href:'/admin/complaints',   label:'Disputes',       icon:'⚖️' },
  { href:'/admin/analytics',    label:'Analytics',      icon:'📊' },
  { href:'/admin/broadcast',    label:'Broadcast',      icon:'📢' },
  { href:'/admin/logs',         label:'Admin Logs',     icon:'📋' },
  { href:'/admin/system',       label:'System',         icon:'⚙️' },
]

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/login')

  const [
    totalVendors, approvedVendors, totalUsers, totalBookings,
    completedBookings, totalReviews, openTickets,
  ] = await Promise.all([
    prisma.vendor.count({ where:{ deletedAt:null } }),
    prisma.vendor.count({ where:{ status:'APPROVED', deletedAt:null } }),
    prisma.user.count(),
    prisma.booking.count({ where:{ deletedAt:null } }),
    prisma.booking.count({ where:{ status:'COMPLETED', deletedAt:null } }),
    prisma.review.count(),
    prisma.supportTicket.count({ where:{ status:{ in:['OPEN','IN_PROGRESS'] } } }),
  ])

  const avgRating = await prisma.review.aggregate({ _avg:{ rating:true } })

  const stats = [
    { label:'Total Vendors',     value:totalVendors,    icon:'🏪', color:'#6366f1', sub:`${approvedVendors} approved` },
    { label:'Total Users',       value:totalUsers,      icon:'👥', color:'#10b981', sub:'registered accounts' },
    { label:'Total Bookings',    value:totalBookings,   icon:'📅', color:'#C8A96E', sub:`${completedBookings} completed` },
    { label:'Reviews',           value:totalReviews,    icon:'⭐', color:'#f59e0b', sub:`avg ${avgRating._avg.rating?.toFixed(1)??'—'} rating` },
    { label:'Open Tickets',      value:openTickets,     icon:'🎫', color:'#ef4444', sub:'need attention' },
    { label:'Completion Rate',   value:`${totalBookings>0?Math.round((completedBookings/totalBookings)*100):0}%`, icon:'📊', color:'#a78bfa', sub:'booking success rate' },
  ]

  return (
    <DashboardShell role="admin" userName={user.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Admin</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Platform Analytics</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Overview of platform performance</p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl p-6 relative overflow-hidden"
              style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10" style={{background:s.color}}/>
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className="font-display text-4xl font-bold mb-1" style={{color:'var(--text)'}}>{s.value}</div>
              <div className="text-xs font-semibold" style={{color:'var(--text-muted)'}}>{s.label}</div>
              {s.sub && <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>{s.sub}</div>}
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}