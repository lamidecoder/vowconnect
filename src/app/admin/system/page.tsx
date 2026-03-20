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

export default async function SystemPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/login')

  const settings = [
    { label:'App Name',          value:'VowConnect',           key:'app_name' },
    { label:'Super Admin Email', value:process.env.SUPER_ADMIN_EMAIL??'—', key:'admin_email' },
    { label:'Node Environment',  value:process.env.NODE_ENV??'—',          key:'node_env' },
    { label:'Database',          value:'PostgreSQL',            key:'db' },
    { label:'AI Provider',       value:'Anthropic Claude',      key:'ai' },
    { label:'Payment (NG)',      value:'Paystack',              key:'pay_ng' },
    { label:'Payment (Intl)',    value:'Stripe',                key:'pay_intl' },
  ]

  return (
    <DashboardShell role="admin" userName={user.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Admin</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>System Settings</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Platform configuration overview</p>
      </div>
      <div className="p-8" style={{maxWidth:640}}>
        <div className="rounded-2xl overflow-hidden" style={{border:'1px solid var(--border)'}}>
          {settings.map((s, i) => (
            <div key={s.key} className="px-6 py-4 flex items-center justify-between border-b last:border-0"
              style={{borderColor:'var(--border)', background:i%2===0?'var(--bg-card)':'transparent'}}>
              <span className="text-sm" style={{color:'var(--text-muted)'}}>{s.label}</span>
              <span className="text-sm font-semibold" style={{color:'var(--text)'}}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}