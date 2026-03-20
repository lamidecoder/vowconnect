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

const STATUS_STYLE: Record<string,string> = {
  PENDING_REVIEW: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  APPROVED:       'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  REJECTED:       'bg-red-500/20 text-red-400 border border-red-500/30',
  SUSPENDED:      'bg-red-500/20 text-red-400 border border-red-500/30',
}

interface Props { searchParams: Promise<{ status?: string; q?: string }> }

export default async function AdminVendorsPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/login')

  const params = await searchParams
  const where: any = { deletedAt: null }
  if (params.status) where.status = params.status
  if (params.q) where.OR = [
    { businessName: { contains: params.q, mode:'insensitive' } },
    { user: { email: { contains: params.q, mode:'insensitive' } } },
  ]

  const vendors = await prisma.vendor.findMany({
    where,
    include: {
      category: true,
      user: { select:{ name:true, email:true } },
      reviews: { select:{ rating:true } },
      _count: { select:{ bookings:true } },
    },
    orderBy: [{ status:'asc' }, { createdAt:'desc' }],
  })

  const statusCounts = await prisma.vendor.groupBy({ by:['status'], _count:{ status:true }, where:{ deletedAt:null } })
  const counts = Object.fromEntries(statusCounts.map(s => [s.status, s._count.status]))

  const tabs = [
    { label:'All',       value:'',              count: vendors.length },
    { label:'Pending',   value:'PENDING_REVIEW', count: counts.PENDING_REVIEW ?? 0 },
    { label:'Approved',  value:'APPROVED',       count: counts.APPROVED ?? 0 },
    { label:'Rejected',  value:'REJECTED',       count: counts.REJECTED ?? 0 },
    { label:'Suspended', value:'SUSPENDED',      count: counts.SUSPENDED ?? 0 },
  ]

  return (
    <DashboardShell role="admin" userName={user.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Admin</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Vendor Management</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>{vendors.length} vendors</p>
      </div>

      <div className="p-8">
        {/* Tabs + Search */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <Link key={t.value} href={`/admin/vendors-list${t.value ? `?status=${t.value}` : ''}`}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all border"
                style={{
                  background: params.status===t.value || (!params.status && !t.value) ? '#C8A96E' : 'var(--bg-card)',
                  color:      params.status===t.value || (!params.status && !t.value) ? '#fff' : 'var(--text-muted)',
                  borderColor: params.status===t.value || (!params.status && !t.value) ? '#C8A96E' : 'var(--border)',
                }}>
                {t.label} {t.count>0 && `(${t.count})`}
              </Link>
            ))}
          </div>
          <form method="GET" className="ml-auto flex gap-2">
            {params.status && <input type="hidden" name="status" value={params.status}/>}
            <input name="q" defaultValue={params.q} placeholder="Search vendors…"
              className="px-4 py-2 rounded-xl text-sm outline-none w-64"
              style={{background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text)'}}/>
            <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>Search</button>
          </form>
        </div>

        {/* Vendor cards */}
        <div className="space-y-3">
          {vendors.length === 0 ? (
            <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="text-4xl mb-3 opacity-20">🏪</div>
              <p style={{color:'var(--text-muted)'}}>No vendors found</p>
            </div>
          ) : vendors.map(v => {
            const avg = v.reviews.length ? (v.reviews.reduce((s,r)=>s+r.rating,0)/v.reviews.length).toFixed(1) : null
            return (
              <div key={v.id} className="rounded-2xl p-5 flex items-center gap-4"
                style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{background:'var(--bg-subtle)'}}>
                  {v.category?.emoji ?? '🏪'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" style={{color:'var(--text)'}}>{v.businessName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[v.status]??''}`}>{v.status.replace('_',' ')}</span>
                    {v.isDiaspora && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Diaspora</span>}
                  </div>
                  <div className="text-xs mt-0.5 flex items-center gap-3 flex-wrap" style={{color:'var(--text-faint)'}}>
                    <span>{v.category?.name}</span>
                    <span>{v.city}{v.country ? `, ${v.country}` : ''}</span>
                    <span>{v.user.email}</span>
                    {avg && <span>★ {avg}</span>}
                    <span>{v._count.bookings} bookings</span>
                    <span>Joined {formatDate(v.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {v.status === 'PENDING_REVIEW' && (
                    <>
                      <form method="POST" action={`/api/admin/vendors/${v.id}/approve`}>
                        <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{background:'rgba(16,185,129,0.15)', color:'#10b981', border:'1px solid rgba(16,185,129,0.3)'}}>
                          ✓ Approve
                        </button>
                      </form>
                      <form method="POST" action={`/api/admin/vendors/${v.id}/reject`}>
                        <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)'}}>
                          ✗ Reject
                        </button>
                      </form>
                    </>
                  )}
                  <Link href={`/vendors/${v.id}`} target="_blank"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>
                    View →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}