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
  PENDING:   'bg-amber-500/20 text-amber-400',
  ACCEPTED:  'bg-emerald-500/20 text-emerald-400',
  COMPLETED: 'bg-blue-500/20 text-blue-400',
  DECLINED:  'bg-red-500/20 text-red-400',
  CANCELLED: 'bg-zinc-500/20 text-zinc-400',
}

interface Props { searchParams: Promise<{ status?: string; q?: string }> }

export default async function AdminBookingsPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/login')

  const params = await searchParams
  const where: any = { deletedAt: null }
  if (params.status) where.status = params.status
  if (params.q) where.OR = [
    { client: { name:  { contains: params.q, mode:'insensitive' } } },
    { vendor: { businessName: { contains: params.q, mode:'insensitive' } } },
  ]

  const bookings = await prisma.booking.findMany({
    where,
    include: { vendor: true, client: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const statuses = ['PENDING','ACCEPTED','COMPLETED','DECLINED','CANCELLED']

  return (
    <DashboardShell role="admin" userName={user.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Admin</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>All Bookings</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>{bookings.length} bookings</p>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <Link href="/admin/bookings"
              className="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
              style={{ background:!params.status?'#C8A96E':'var(--bg-card)', color:!params.status?'#fff':'var(--text-muted)', borderColor:!params.status?'#C8A96E':'var(--border)' }}>
              All
            </Link>
            {statuses.map(s => (
              <Link key={s} href={`/admin/bookings?status=${s}`}
                className="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
                style={{ background:params.status===s?'#C8A96E':'var(--bg-card)', color:params.status===s?'#fff':'var(--text-muted)', borderColor:params.status===s?'#C8A96E':'var(--border)' }}>
                {s.charAt(0)+s.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>
          <form method="GET" className="ml-auto flex gap-2">
            {params.status && <input type="hidden" name="status" value={params.status}/>}
            <input name="q" defaultValue={params.q} placeholder="Search…"
              className="px-4 py-2 rounded-xl text-sm outline-none w-56"
              style={{background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text)'}}/>
            <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>Search</button>
          </form>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{border:'1px solid var(--border)'}}>
          <div className="px-6 py-3 grid grid-cols-12 gap-4 text-[10px] font-bold uppercase tracking-widest"
            style={{background:'var(--bg-subtle)', color:'var(--text-faint)'}}>
            <div className="col-span-3">Client</div>
            <div className="col-span-3">Vendor</div>
            <div className="col-span-2">Event</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
          </div>
          {bookings.length === 0 ? (
            <div className="p-16 text-center" style={{background:'var(--bg-card)'}}>
              <div className="text-4xl mb-3 opacity-20">📅</div>
              <p style={{color:'var(--text-muted)'}}>No bookings found</p>
            </div>
          ) : bookings.map((b, i) => (
            <div key={b.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center border-b last:border-0"
              style={{ borderColor:'var(--border)', background:i%2===0?'var(--bg-card)':'transparent' }}>
              <div className="col-span-3 min-w-0">
                <div className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{b.client.name}</div>
                <div className="text-xs truncate" style={{color:'var(--text-faint)'}}>{b.client.email}</div>
              </div>
              <div className="col-span-3 min-w-0">
                <div className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{b.vendor.businessName}</div>
              </div>
              <div className="col-span-2 text-sm" style={{color:'var(--text-muted)'}}>{b.eventType}</div>
              <div className="col-span-2 text-sm" style={{color:'var(--text-muted)'}}>{formatDate(b.eventDate)}</div>
              <div className="col-span-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[b.status]??''}`}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}