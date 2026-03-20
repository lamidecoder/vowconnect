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

const ROLE_STYLE: Record<string,string> = {
  SUPER_ADMIN: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  VENDOR:      'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  CLIENT:      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
}

interface Props { searchParams: Promise<{ q?:string; role?:string; page?:string }> }

export default async function AdminUsersPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/login')

  const params = await searchParams
  const page  = parseInt(params.page ?? '1')
  const limit = 25
  const where: any = {}
  if (params.role) where.role = params.role
  if (params.q) where.OR = [
    { name:  { contains: params.q, mode:'insensitive' } },
    { email: { contains: params.q, mode:'insensitive' } },
  ]

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip:(page-1)*limit, take:limit,
      orderBy:{ createdAt:'desc' },
      select:{
        id:true, name:true, email:true, role:true, isActive:true, createdAt:true,
        vendor:{ select:{ businessName:true, status:true } },
        _count:{ select:{ bookings:true, reviews:true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  const roleCounts = await prisma.user.groupBy({ by:['role'], _count:{ role:true } })
  const rMap = Object.fromEntries(roleCounts.map(r => [r.role, r._count.role]))

  const pages = Math.ceil(total / limit)

  return (
    <DashboardShell role="admin" userName={user.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Admin</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>User Management</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>{total} total users</p>
      </div>

      <div className="p-8">
        {/* Role pills + search */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {[
              { role:'',           label:'All',         count:total,                  color:'#9ca3af' },
              { role:'CLIENT',     label:'Clients',     count:rMap.CLIENT??0,         color:'#10b981' },
              { role:'VENDOR',     label:'Vendors',     count:rMap.VENDOR??0,         color:'#f59e0b' },
              { role:'SUPER_ADMIN',label:'Admins',      count:rMap.SUPER_ADMIN??0,    color:'#a855f7' },
            ].map(r => (
              <Link key={r.role} href={`/admin/users${r.role ? `?role=${r.role}` : ''}`}
                className="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
                style={{
                  background: params.role===r.role || (!params.role && !r.role) ? `${r.color}30` : 'var(--bg-card)',
                  color: r.color,
                  borderColor: `${r.color}40`,
                }}>
                {r.label} ({r.count})
              </Link>
            ))}
          </div>
          <form method="GET" className="ml-auto flex gap-2">
            {params.role && <input type="hidden" name="role" value={params.role}/>}
            <input name="q" defaultValue={params.q} placeholder="Search name or email…"
              className="px-4 py-2 rounded-xl text-sm outline-none w-64"
              style={{background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text)'}}/>
            <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>Search</button>
          </form>
        </div>

        {/* Users list */}
        <div className="rounded-2xl overflow-hidden" style={{border:'1px solid var(--border)'}}>
          {/* Header */}
          <div className="px-6 py-3 grid grid-cols-12 gap-4 text-[10px] font-bold uppercase tracking-widest"
            style={{background:'var(--bg-subtle)', color:'var(--text-faint)'}}>
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Activity</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-2">Actions</div>
          </div>

          {users.length === 0 ? (
            <div className="p-16 text-center" style={{background:'var(--bg-card)'}}>
              <div className="text-4xl mb-3 opacity-20">👥</div>
              <p style={{color:'var(--text-muted)'}}>No users found</p>
            </div>
          ) : users.map((u, i) => (
            <div key={u.id}
              className="px-6 py-4 grid grid-cols-12 gap-4 items-center border-b last:border-0"
              style={{
                borderColor:'var(--border)',
                background: i%2===0 ? 'var(--bg-card)' : 'transparent',
              }}>
              {/* User */}
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{u.name}</div>
                  <div className="text-xs truncate" style={{color:'var(--text-faint)'}}>{u.email}</div>
                  {u.vendor && (
                    <div className="text-[10px]" style={{color:'#C8A96E'}}>{u.vendor.businessName}</div>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_STYLE[u.role]??''}`}>
                  {u.role.replace('_',' ')}
                </span>
                {!u.isActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 bg-red-500/20 text-red-400">Suspended</span>
                )}
              </div>

              {/* Activity */}
              <div className="col-span-2 text-xs" style={{color:'var(--text-faint)'}}>
                <div>{u._count.bookings} bookings</div>
                <div>{u._count.reviews} reviews</div>
              </div>

              {/* Joined */}
              <div className="col-span-2 text-xs" style={{color:'var(--text-faint)'}}>
                {formatDate(u.createdAt)}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex gap-2">
                <Link href={`/admin/users/${u.id}`}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>
                  Edit →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm" style={{color:'var(--text-faint)'}}>
              Page {page} of {pages} · {total} users
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/users?${new URLSearchParams({...params, page:String(page-1)})}`}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)'}}>
                  ← Prev
                </Link>
              )}
              {page < pages && (
                <Link href={`/admin/users?${new URLSearchParams({...params, page:String(page+1)})}`}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)'}}>
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}