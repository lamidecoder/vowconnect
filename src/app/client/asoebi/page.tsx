'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardShell from '@/components/layout/DashboardShell'

const NAV = [
  { href:'/client/dashboard',  label:'Dashboard',     icon:'🏠' },
  { href:'/client/bookings',   label:'My Bookings',   icon:'📅' },
  { href:'/client/wedding',    label:'Wedding Hub',   icon:'💍' },
  { href:'/client/messages',   label:'Messages',      icon:'💬' },
  { href:'/client/quotes',     label:'Quotes',        icon:'📄' },
  { href:'/client/favorites',  label:'Saved Vendors', icon:'❤️' },
  { href:'/vendors',           label:'Browse Vendors',icon:'🔍' },
  { href:'/client/asoebi',     label:'Asoebi Groups', icon:'👘' },
  { href:'/client/profile',    label:'Profile',       icon:'✏️' },
  { href:'/support',           label:'Support',       icon:'🎫' },
]

const STATUS_STYLE: Record<string,string> = {
  OPEN:      'bg-emerald-500/20 text-emerald-400',
  FULL:      'bg-blue-500/20 text-blue-400',
  CLOSED:    'bg-zinc-500/20 text-zinc-400',
  COMPLETED: 'bg-purple-500/20 text-purple-400',
}

interface Group {
  id:string; shareCode:string; eventType:string; eventDate:string
  status:string; maxSlots:number; location?:string
  vendor:{ businessName:string }
  members:{ id:string; name:string; status:string; joinedAt:string }[]
}

export default function ClientAsoebiPage() {
  const [groups,   setGroups]   = useState<Group[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<Group|null>(null)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    fetch('/api/asoebi?role=lead', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setGroups(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function copyLink(code: string) {
    navigator.clipboard.writeText(`${window.location.origin}/asoebi/${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{borderColor:'#C8A96E', borderTopColor:'transparent'}}/>
      </div>
    </DashboardShell>
  )

  if (selected) return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b flex items-center gap-4" style={{borderColor:'var(--border)'}}>
        <button onClick={() => setSelected(null)}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg"
          style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>
          ← Back
        </button>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest" style={{color:'#C8A96E'}}>Asoebi Group</div>
          <h1 className="font-display text-2xl" style={{color:'var(--text)'}}>{selected.vendor.businessName}</h1>
        </div>
      </div>
      <div className="p-8 space-y-6">
        {/* Share link */}
        <div className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#C8A96E'}}>Share Link</div>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-xs px-3 py-2 rounded-lg truncate"
              style={{background:'var(--bg-subtle)', color:'var(--text)'}}>
              {typeof window !== 'undefined' ? `${window.location.origin}/asoebi/${selected.shareCode}` : `/asoebi/${selected.shareCode}`}
            </code>
            <button onClick={() => copyLink(selected.shareCode)}
              className="text-xs font-bold px-4 py-2 rounded-lg text-white flex-shrink-0"
              style={{background:'#C8A96E'}}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{color:'var(--text)'}}>
              Members ({selected.members.length}/{selected.maxSlots})
            </h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[selected.status] ?? ''}`}>
              {selected.status}
            </span>
          </div>
          <div className="w-full rounded-full h-2 mb-4" style={{background:'var(--bg-subtle)'}}>
            <div className="h-2 rounded-full transition-all" style={{
              width:`${(selected.members.length/selected.maxSlots)*100}%`,
              background:'linear-gradient(90deg,#C8A96E,#8B6914)'
            }}/>
          </div>
          {selected.members.length === 0 ? (
            <p className="text-sm text-center py-4" style={{color:'var(--text-faint)'}}>No members yet — share the link!</p>
          ) : selected.members.map((m,i) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl mb-2"
              style={{background:'var(--bg-subtle)'}}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                {i+1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{color:'var(--text)'}}>{m.name}</div>
                <div className="text-xs" style={{color:'var(--text-faint)'}}>
                  Joined {new Date(m.joinedAt).toLocaleDateString()}
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                m.status==='CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/20 text-zinc-400'
              }`}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )

  return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Client</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Asoebi Groups 👘</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Coordinate group bookings for your wedding party</p>
      </div>

      <div className="p-8">
        {groups.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">💃</div>
            <h2 className="font-display text-2xl font-bold mb-2" style={{color:'var(--text)'}}>Group Bookings Made Easy</h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{color:'var(--text-muted)'}}>
              Create an Asoebi group and share the link with your bridesmaids and wedding party. Everyone confirms their spot in one coordinated booking.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon:'👰', label:'Create group',        sub:'Pick vendor & slots' },
                { icon:'💬', label:'Share link',          sub:'Members join instantly' },
                { icon:'🎀', label:'Vendor confirms all', sub:'One smooth booking' },
              ].map(s => (
                <div key={s.icon} className="p-4 rounded-xl" style={{background:'var(--bg-subtle)'}}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xs font-semibold" style={{color:'var(--text)'}}>{s.label}</div>
                  <div className="text-[10px] mt-0.5" style={{color:'var(--text-faint)'}}>{s.sub}</div>
                </div>
              ))}
            </div>
            <Link href="/vendors" className="inline-flex text-sm font-bold px-5 py-2.5 rounded-xl text-white"
              style={{background:'#C8A96E'}}>
              Browse Vendors →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(g => (
              <button key={g.id} onClick={() => setSelected(g)}
                className="w-full text-left rounded-2xl p-5 hover:opacity-80 transition-all"
                style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <div className="font-semibold" style={{color:'var(--text)'}}>{g.vendor.businessName}</div>
                    <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>
                      {g.eventType} · {new Date(g.eventDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[g.status] ?? ''}`}>
                    {g.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs mb-2" style={{color:'var(--text-faint)'}}>
                  <span>👥 {g.members.length}/{g.maxSlots} members</span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{background:'var(--bg-subtle)'}}>
                  <div className="h-1.5 rounded-full" style={{
                    width:`${(g.members.length/g.maxSlots)*100}%`,
                    background:'linear-gradient(90deg,#C8A96E,#8B6914)'
                  }}/>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}