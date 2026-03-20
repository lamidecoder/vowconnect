import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
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

export default async function AdminComplaintsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/login')

  const reports = await prisma.report.findMany({
    include: {
      reporter: { select:{ name:true, email:true } },
      vendor:   { select:{ businessName:true, id:true } },
    },
    orderBy: { createdAt:'desc' },
  })

  const STATUS_STYLE: Record<string,string> = {
    OPEN:        'bg-red-500/20 text-red-400',
    INVESTIGATING:'bg-amber-500/20 text-amber-400',
    RESOLVED:    'bg-emerald-500/20 text-emerald-400',
    DISMISSED:   'bg-zinc-500/20 text-zinc-400',
  }

  return (
    <DashboardShell role="admin" userName={user.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Admin</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Dispute Resolution</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Manage vendor complaints & disputes</p>
      </div>

      <div className="p-8">
        {reports.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">⚖️</div>
            <p className="font-semibold" style={{color:'var(--text-muted)'}}>No reports yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <div className="font-semibold" style={{color:'var(--text)'}}>{r.vendor.businessName}</div>
                    <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>
                      Reported by {r.reporter.name} · {formatDate(r.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[r.status]??''}`}>
                      {r.status}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400">
                      {r.reason}
                    </span>
                  </div>
                </div>
                {r.description && (
                  <p className="text-sm mb-3" style={{color:'var(--text-muted)'}}>{r.description}</p>
                )}
                <div className="flex gap-2">
                  <Link href={`/vendors/${r.vendor.id}`} target="_blank"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>
                    View Vendor →
                  </Link>
                  <Link href="/admin/reports"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>
                    Manage →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}