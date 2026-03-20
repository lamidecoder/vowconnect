'use client'
import { useState, useEffect } from 'react'
import DashboardShell from '@/components/layout/DashboardShell'

const NAV = [
  { href:'/vendor/dashboard',    label:'Dashboard',    icon:'🏠' },
  { href:'/vendor/bookings',     label:'Bookings',     icon:'📅' },
  { href:'/vendor/messages',     label:'Messages',     icon:'💬' },
  { href:'/vendor/quotes',       label:'Quotes',       icon:'📄' },
  { href:'/vendor/profile',      label:'Profile',      icon:'✏️' },
  { href:'/vendor/portfolio',    label:'Portfolio',    icon:'🖼️' },
  { href:'/vendor/packages',     label:'Packages',     icon:'📦' },
  { href:'/vendor/availability', label:'Availability', icon:'🗓️' },
  { href:'/vendor/crm',          label:'Client CRM',   icon:'👥' },
  { href:'/vendor/analytics',    label:'Analytics',    icon:'📊' },
  { href:'/vendor/pricing',      label:'Pricing',      icon:'💰' },
]

const STATUS_STYLE: Record<string,string> = {
  OPEN:'bg-emerald-500/20 text-emerald-400', FULL:'bg-blue-500/20 text-blue-400',
  CLOSED:'bg-zinc-500/20 text-zinc-400',     COMPLETED:'bg-purple-500/20 text-purple-400',
}

interface Group {
  id:string; shareCode:string; eventType:string; eventDate:string
  status:string; maxSlots:number
  leadClient:{ name:string; email:string }
  members:{ id:string; name:string; phone?:string; status:string }[]
}

export default function VendorAsoebiPage() {
  const [groups,  setGroups]  = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState<string|null>(null)

  useEffect(() => {
    fetch('/api/asoebi?role=vendor', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setGroups(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Asoebi Groups 👘</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Group bookings from clients</p>
      </div>
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">👘</div>
            <p className="font-semibold" style={{color:'var(--text-muted)'}}>No group bookings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(g => (
              <div key={g.id} className="rounded-2xl overflow-hidden" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <button onClick={() => setOpen(open===g.id ? null : g.id)}
                  className="w-full text-left px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold" style={{color:'var(--text)'}}>{g.leadClient.name}</div>
                    <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>
                      {g.eventType} · {new Date(g.eventDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-xs" style={{color:'var(--text-faint)'}}>👥 {g.members.length}/{g.maxSlots}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[g.status]??''}`}>{g.status}</span>
                  <span className="text-xs" style={{color:'var(--text-faint)'}}>{open===g.id?'▲':'▼'}</span>
                </button>
                {open === g.id && (
                  <div className="border-t px-6 py-4 space-y-2" style={{borderColor:'var(--border)', background:'var(--bg-subtle)'}}>
                    {g.members.map((m,i) => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:'var(--bg-card)'}}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>{i+1}</div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold" style={{color:'var(--text)'}}>{m.name}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.status==='CONFIRMED'?'bg-emerald-500/20 text-emerald-400':'bg-zinc-500/20 text-zinc-400'}`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}