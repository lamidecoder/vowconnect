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

interface Group {
  id: string; shareCode: string; eventType: string; eventDate: string
  status: string; maxSlots: number
  leadClient: { name: string; email: string }
  members: { id: string; name: string; phone?: string; status: string }[]
}

const STATUS_COLORS: Record<string, string> = {
  OPEN:'bg-green-100 text-green-700', FULL:'bg-blue-100 text-blue-700',
  CLOSED:'bg-gray-100 text-gray-600', COMPLETED:'bg-purple-100 text-purple-700',
}

export default function VendorAsoebiPage() {
  const [groups,  setGroups]  = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState<string|null>(null)

  useEffect(() => {
    fetch('/api/asoebi?role=vendor').then(r=>r.json()).then(d=>{setGroups(Array.isArray(d)?d:[]);setLoading(false)})
  }, [])

  if (loading) return <div className="text-center py-20 text-theme-faint">Loading group bookings...</div>

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Asoebi Groups</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Group bookings</p>
      </div>
      <div className="p-8">
      >
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-theme">Asoebi Groups 💃</h1>
        <p className="text-theme-muted mt-1">Group bookings where multiple people book you together</p>
      </div>

      {!groups.length ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">💃</div>
          <h3 className="font-semibold text-theme mb-2">No group bookings yet</h3>
          <p className="text-theme-muted text-sm max-w-sm mx-auto">
            When a bride creates an Asoebi group booking for your services, it will appear here.
            Each group can have up to 12 members — one event, multiple clients!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(g => (
            <div key={g.id} className="card overflow-hidden">
              <button onClick={()=>setOpen(open===g.id?null:g.id)} className="w-full p-5 text-left hover:bg-theme-subtle">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-semibold text-theme">
                      {g.eventType} · {new Date(g.eventDate).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                    </div>
                    <div className="text-theme-muted text-sm mt-0.5">Lead: {g.leadClient.name} · {g.members.length}/{g.maxSlots} members</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${STATUS_COLORS[g.status]} text-xs`}>{g.status}</span>
                    <span className="text-theme-faint text-sm">{open===g.id?'▲':'▼'}</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-theme-subtle rounded-full h-1.5">
                  <div className="h-1.5 bg-gradient-to-r from-[#C8A96E]-400 to-gold-600 rounded-full" style={{width:`${(g.members.length/g.maxSlots)*100}%`}}/>
                </div>
              </button>

              {open === g.id && (
                <div className="border-t border-[var(--border)] p-5">
                  <div className="mb-4">
                    <div className="text-xs font-bold text-theme-faint uppercase tracking-wide mb-2">Lead Client</div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-theme-subtle">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5ECD8] to-[#EAD5B0] flex items-center justify-center font-bold text-theme text-sm">
                        {g.leadClient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-theme text-sm">{g.leadClient.name}</div>
                        <div className="text-theme-faint text-xs">{g.leadClient.email}</div>
                      </div>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#F5ECD8] text-[#C8A96E]">Lead</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-theme-faint uppercase tracking-wide mb-2">All Members</div>
                    <div className="space-y-2">
                      {g.members.map((m,i) => (
                        <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-theme-subtle">
                          <div className="w-7 h-7 rounded-full bg-theme-subtle flex items-center justify-center text-xs font-bold text-theme-muted shrink-0">{i+1}</div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-theme">{m.name}</div>
                            {m.phone && <div className="text-xs text-theme-faint">{m.phone}</div>}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${m.status==='CONFIRMED'?'bg-green-100 text-green-700':'bg-theme-subtle text-theme-muted'}`}>{m.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--border)] flex gap-2">
                    <a href={`https://wa.me/${g.leadClient.email}`}
                      className="btn-ghost flex-1 justify-center text-sm">💬 WhatsApp Lead</a>
                    <div className="text-xs text-theme-faint flex items-center px-2">
                      Code: <code className="ml-1 font-mono text-[#C8A96E]">{g.shareCode}</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
      </div>
    </DashboardShell>
  )
}
