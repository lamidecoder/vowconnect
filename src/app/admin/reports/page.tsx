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

interface Props { searchParams: Promise<{ status?: string }> }

export default async function AdminReportsPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/login')

  const params = await searchParams
  const status = params.status ?? 'OPEN'

  const reports = await prisma.report.findMany({
    where: { status },
    include: {
      reporter: { select:{ name:true, email:true } },
      vendor:   { select:{ businessName:true, id:true } },
    },
    orderBy: { createdAt:'desc' },
  })

  const STATUS_STYLE: Record<string,string> = {
    OPEN:          'bg-red-500/20 text-red-400',
    INVESTIGATING: 'bg-amber-500/20 text-amber-400',
    RESOLVED:      'bg-emerald-500/20 text-emerald-400',
    DISMISSED:     'bg-zinc-500/20 text-zinc-400',
  }

  return (
    <DashboardShell role="admin" userName={user.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Admin</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Reports</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Vendor reports & complaints</p>
      </div>
      <div className="p-8">
        <div className="flex gap-2 mb-6">
          {['OPEN','INVESTIGATING','RESOLVED','DISMISSED'].map(s => (
            <Link key={s} href={`/admin/reports?status=${s}`}
              className="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
              style={{ background:status===s?'#C8A96E':'var(--bg-card)', color:status===s?'#fff':'var(--text-muted)', borderColor:status===s?'#C8A96E':'var(--border)' }}>
              {s.charAt(0)+s.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>

        {reports.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">⚠️</div>
            <p style={{color:'var(--text-muted)'}}>No {status.toLowerCase()} reports</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                  <div>
                    <div className="font-semibold" style={{color:'var(--text)'}}>{r.vendor.businessName}</div>
                    <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>
                      by {r.reporter.name} ({r.reporter.email}) · {formatDate(r.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[r.status]??''}`}>{r.status}</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400">{r.reason}</span>
                  </div>
                </div>
                {r.description && <p className="text-sm" style={{color:'var(--text-muted)'}}>{r.description}</p>}
                <Link href={`/vendors/${r.vendor.id}`} target="_blank"
                  className="inline-flex mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>
                  View Vendor →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}