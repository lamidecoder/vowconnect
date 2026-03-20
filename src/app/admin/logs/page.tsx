import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
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

export default async function AdminLogsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/login')

  const logs = await prisma.adminLog.findMany({
    include: { admin: { select:{ name:true, email:true } } },
    orderBy: { createdAt:'desc' },
    take: 100,
  })

  return (
    <DashboardShell role="admin" userName={user.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Admin</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Admin Logs</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Audit trail of all admin actions</p>
      </div>
      <div className="p-8">
        {logs.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">📋</div>
            <p style={{color:'var(--text-muted)'}}>No logs yet</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{border:'1px solid var(--border)'}}>
            {logs.map((log, i) => (
              <div key={log.id} className="px-6 py-4 flex items-center gap-4 border-b last:border-0"
                style={{borderColor:'var(--border)', background:i%2===0?'var(--bg-card)':'transparent'}}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{color:'var(--text)'}}>{log.action}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:'rgba(200,169,110,0.15)', color:'#C8A96E'}}>{log.targetType}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>
                    by {log.admin.name} · {formatDate(log.createdAt)}
                  </div>
                </div>
                <div className="text-xs font-mono" style={{color:'var(--text-faint)'}}>{log.targetId.slice(0,8)}…</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}