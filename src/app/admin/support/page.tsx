'use client'
import { useState, useEffect, useRef } from 'react'
import DashboardShell from '@/components/layout/DashboardShell'

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

const STATUS_COLOR: Record<string,string> = {
  OPEN:'#ef4444', IN_PROGRESS:'#f59e0b', WAITING:'#6366f1', RESOLVED:'#10b981', CLOSED:'#6b7280',
}
const PRIORITY_COLOR: Record<string,string> = {
  URGENT:'#ef4444', HIGH:'#f59e0b', MEDIUM:'#6366f1', LOW:'#6b7280',
}

interface Ticket {
  id:string; ticketNumber:string; name:string; email:string
  subject:string; description:string; category:string
  priority:string; status:string; adminNotes?:string
  createdAt:string; replies:{ id:string; senderName:string; body:string; isAdmin:boolean; createdAt:string }[]
}

export default function AdminSupportPage() {
  const [tickets,  setTickets]  = useState<Ticket[]>([])
  const [selected, setSelected] = useState<Ticket|null>(null)
  const [loading,  setLoading]  = useState(true)
  const [reply,    setReply]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [notes,    setNotes]    = useState('')
  const [filter,   setFilter]   = useState('OPEN')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/support/tickets?admin=1', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setTickets(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [selected?.replies.length])

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    const res = await fetch(`/api/support/tickets/${selected.id}`, {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ body:reply, isAdmin:true }),
    })
    const data = await res.json()
    const updated = { ...selected, replies:[...(selected.replies??[]), data] }
    setSelected(updated)
    setTickets(p => p.map(t => t.id===selected.id ? updated : t))
    setReply(''); setSending(false)
  }

  async function updateStatus(status: string) {
    if (!selected) return
    await fetch(`/api/support/tickets/${selected.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ status }),
    })
    const updated = { ...selected, status }
    setSelected(updated)
    setTickets(p => p.map(t => t.id===selected.id ? updated : t))
  }

  async function saveNotes() {
    if (!selected) return
    await fetch(`/api/support/tickets/${selected.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ adminNotes:notes }),
    })
    const updated = { ...selected, adminNotes:notes }
    setSelected(updated)
    setTickets(p => p.map(t => t.id===selected.id ? updated : t))
  }

  const filtered = tickets.filter(t =>
    filter === 'ALL' ? true :
    filter === 'OPEN' ? ['OPEN','IN_PROGRESS'].includes(t.status) :
    t.status === filter
  )

  const counts = tickets.reduce((acc:Record<string,number>, t) => {
    acc[t.status] = (acc[t.status]??0) + 1; return acc
  }, {})

  return (
    <DashboardShell role="admin" userName="" navItems={NAV}>
      <div className="flex h-screen overflow-hidden" style={{background:'var(--bg)'}}>
        {/* Ticket list */}
        <div className="w-80 flex-shrink-0 border-r flex flex-col" style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
          <div className="p-4 border-b" style={{borderColor:'var(--border)'}}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#C8A96E'}}>Support Tickets</div>
            <div className="flex gap-1 flex-wrap">
              {[['OPEN','Open'],['ALL','All'],['RESOLVED','Done']].map(([k,l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                  style={{ background:filter===k?'#C8A96E':'transparent', color:filter===k?'#fff':'var(--text-muted)', borderColor:filter===k?'#C8A96E':'var(--border)' }}>
                  {l} {k==='OPEN' ? `(${(counts.OPEN??0)+(counts.IN_PROGRESS??0)})` : k==='ALL' ? `(${tickets.length})` : `(${counts.RESOLVED??0})`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{color:'var(--text-faint)'}}>No tickets</div>
            ) : filtered.map(t => (
              <button key={t.id} onClick={() => { setSelected(t); setNotes(t.adminNotes??'') }}
                className="w-full text-left px-4 py-3.5 border-b transition-all"
                style={{
                  borderColor:'var(--border)',
                  background: selected?.id===t.id ? 'rgba(200,169,110,0.1)' : 'transparent',
                  borderLeft: selected?.id===t.id ? '3px solid #C8A96E' : '3px solid transparent',
                }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono" style={{color:'#C8A96E'}}>{t.ticketNumber}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{background:`${PRIORITY_COLOR[t.priority]}20`, color:PRIORITY_COLOR[t.priority]}}>{t.priority}</span>
                </div>
                <div className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{t.subject}</div>
                <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>{t.name} · {new Date(t.createdAt).toLocaleDateString()}</div>
                <div className="text-[10px] font-bold mt-1" style={{color:STATUS_COLOR[t.status]}}>{t.status.replace('_',' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-10">🎫</div>
                <p className="font-semibold" style={{color:'var(--text-muted)'}}>Select a ticket</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b flex items-center gap-4 flex-wrap" style={{borderColor:'var(--border)', background:'var(--bg-card)'}}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono" style={{color:'#C8A96E'}}>{selected.ticketNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:`${PRIORITY_COLOR[selected.priority]}20`, color:PRIORITY_COLOR[selected.priority]}}>{selected.priority}</span>
                  </div>
                  <h2 className="font-semibold text-lg mt-0.5" style={{color:'var(--text)'}}>{selected.subject}</h2>
                  <p className="text-xs" style={{color:'var(--text-faint)'}}>{selected.name} · {selected.email} · {selected.category}</p>
                </div>
                <select value={selected.status} onChange={e => updateStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  style={{background:`${STATUS_COLOR[selected.status]}20`, color:STATUS_COLOR[selected.status], border:`1px solid ${STATUS_COLOR[selected.status]}40`}}>
                  {['OPEN','IN_PROGRESS','WAITING','RESOLVED','CLOSED'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Original message */}
                <div className="rounded-2xl p-4" style={{background:'var(--bg-subtle)', border:'1px solid var(--border)'}}>
                  <div className="text-xs font-bold mb-2" style={{color:'var(--text-faint)'}}>Original Message</div>
                  <p className="text-sm leading-relaxed" style={{color:'var(--text)'}}>{selected.description}</p>
                </div>

                {/* Replies */}
                {selected.replies.map(r => (
                  <div key={r.id} className={`flex ${r.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className="rounded-2xl p-4 max-w-lg" style={{
                      background: r.isAdmin ? 'rgba(200,169,110,0.15)' : 'var(--bg-card)',
                      border: `1px solid ${r.isAdmin ? 'rgba(200,169,110,0.3)' : 'var(--border)'}`,
                    }}>
                      <div className="text-xs font-bold mb-1" style={{color: r.isAdmin ? '#C8A96E' : 'var(--text-faint)'}}>
                        {r.isAdmin ? '👑 Admin' : r.senderName}
                      </div>
                      <p className="text-sm leading-relaxed" style={{color:'var(--text)'}}>{r.body}</p>
                      <div className="text-[10px] mt-1" style={{color:'var(--text-faint)'}}>{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef}/>
              </div>

              {/* Reply box */}
              <div className="p-4 border-t" style={{borderColor:'var(--border)', background:'var(--bg-card)'}}>
                <div className="flex gap-3">
                  <textarea value={reply} onChange={e => setReply(e.target.value)}
                    rows={2} placeholder="Type your reply…"
                    className="flex-1 px-3 py-2 rounded-xl text-sm resize-none outline-none"
                    style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
                  <button onClick={sendReply} disabled={sending||!reply.trim()}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white self-end disabled:opacity-50"
                    style={{background:'#C8A96E'}}>
                    {sending ? '…' : 'Send'}
                  </button>
                </div>
                {/* Admin notes */}
                <div className="mt-3 flex gap-2">
                  <input value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Internal admin notes…"
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                    style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text-muted)'}}/>
                  <button onClick={saveNotes} className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                    style={{background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)'}}>
                    Save Note
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}