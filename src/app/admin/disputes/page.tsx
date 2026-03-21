'use client'
import { useState, useEffect } from 'react'
import DashboardShell from '@/components/layout/DashboardShell'

const NAV = [
  { href:'/admin/dashboard',    label:'Dashboard',   icon:'🏠' },
  { href:'/admin/vendors-list', label:'Vendors',     icon:'🏪' },
  { href:'/admin/users',        label:'Users',       icon:'👥' },
  { href:'/admin/bookings',     label:'Bookings',    icon:'📅' },
  { href:'/admin/support',      label:'Support',     icon:'🎫' },
  { href:'/admin/disputes',     label:'Disputes',    icon:'⚖️' },
  { href:'/admin/reports',      label:'Reports',     icon:'⚠️' },
  { href:'/admin/analytics',    label:'Analytics',   icon:'📊' },
  { href:'/admin/broadcast',    label:'Broadcast',   icon:'📢' },
  { href:'/admin/logs',         label:'Admin Logs',  icon:'📋' },
  { href:'/admin/system',       label:'System',      icon:'⚙️' },
]

const STATUS_CONFIG: Record<string,{color:string;bg:string;label:string}> = {
  OPEN:             { color:'#f87171', bg:'rgba(239,68,68,0.12)',   label:'Open'         },
  INVESTIGATING:    { color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  label:'Investigating' },
  RESOLVED_CLIENT:  { color:'#10b981', bg:'rgba(16,185,129,0.12)',  label:'Refunded'     },
  RESOLVED_VENDOR:  { color:'#6366f1', bg:'rgba(99,102,241,0.12)',  label:'Released'     },
  DISMISSED:        { color:'#6b7280', bg:'rgba(107,114,128,0.12)', label:'Dismissed'    },
}

const SYM: Record<string,string> = { NGN:'₦', GBP:'£', USD:'$', CAD:'CA$', GHS:'GH₵' }

interface Dispute {
  id:string; status:string; reason:string; evidence?:string; resolution?:string
  createdAt:string; resolvedAt?:string
  booking:{ id:string; eventDate:string; eventType:string; currency:string }
  client:{ name:string; email:string }
  milestone?:{ title:string; amount:number; vendorAmount:number }
}

export default function AdminDisputesPage() {
  const [disputes,  setDisputes]  = useState<Dispute[]>([])
  const [selected,  setSelected]  = useState<Dispute|null>(null)
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('OPEN')
  const [resolving, setResolving] = useState(false)
  const [notes,     setNotes]     = useState('')

  useEffect(() => {
    fetch('/api/admin/disputes', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setDisputes(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function resolve(action: 'RESOLVED_CLIENT' | 'RESOLVED_VENDOR' | 'DISMISSED') {
    if (!selected) return
    setResolving(true)
    await fetch(`/api/admin/disputes/${selected.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ status:action, resolution:notes }),
    })
    const updated = { ...selected, status:action, resolution:notes }
    setDisputes(p => p.map(d => d.id===selected.id ? updated : d))
    setSelected(updated)
    setResolving(false)
  }

  const filtered   = disputes.filter(d =>
    filter === 'ALL' ? true :
    filter === 'OPEN' ? ['OPEN','INVESTIGATING'].includes(d.status) :
    d.status === filter
  )

  const openCount  = disputes.filter(d => ['OPEN','INVESTIGATING'].includes(d.status)).length

  return (
    <DashboardShell role="admin" userName="" navItems={NAV}>
      <div className="flex h-screen overflow-hidden" style={{background:'var(--bg)'}}>

        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r flex flex-col" style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>

          {/* Header */}
          <div className="p-5 border-b" style={{borderColor:'var(--border)'}}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">⚖️</span>
              <h1 className="font-display text-lg font-bold" style={{color:'var(--text)'}}>Disputes</h1>
              {openCount > 0 && (
                <div className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{background:'#ef4444'}}>
                  {openCount}
                </div>
              )}
            </div>
            <p className="text-xs" style={{color:'var(--text-faint)'}}>Manage payment disputes & resolutions</p>

            {/* Filter tabs */}
            <div className="flex gap-1 mt-4 flex-wrap">
              {[['OPEN','Open'],['ALL','All'],['RESOLVED_CLIENT','Refunded'],['RESOLVED_VENDOR','Released']].map(([k,l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all"
                  style={{ background:filter===k?'#C8A96E':'transparent', color:filter===k?'#fff':'var(--text-muted)', borderColor:filter===k?'#C8A96E':'var(--border)' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-3xl mb-2 opacity-20">✅</div>
                <p className="text-xs" style={{color:'var(--text-faint)'}}>No disputes in this category</p>
              </div>
            ) : filtered.map(d => {
              const s = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.OPEN
              const sym = SYM[d.booking.currency] ?? '₦'
              return (
                <button key={d.id} onClick={() => { setSelected(d); setNotes(d.resolution ?? '') }}
                  className="w-full text-left px-5 py-4 border-b transition-all"
                  style={{
                    borderColor:'var(--border)',
                    background: selected?.id===d.id ? 'rgba(200,169,110,0.08)' : 'transparent',
                    borderLeft: selected?.id===d.id ? '3px solid #C8A96E' : '3px solid transparent',
                  }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{color:'var(--text)'}}>{d.client.name}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{background:s.bg, color:s.color}}>{s.label}</span>
                  </div>
                  <div className="text-xs truncate mb-1" style={{color:'var(--text-muted)'}}>{d.reason}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]" style={{color:'var(--text-faint)'}}>{new Date(d.createdAt).toLocaleDateString()}</span>
                    {d.milestone && <span className="text-[10px] font-bold" style={{color:'#C8A96E'}}>{sym}{d.milestone.amount.toLocaleString()}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-10">⚖️</div>
                <p className="font-semibold" style={{color:'var(--text-muted)'}}>Select a dispute to review</p>
                <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Review evidence and take action</p>
              </div>
            </div>
          ) : (
            <>
              {/* Detail header */}
              <div className="px-8 py-5 border-b" style={{borderColor:'var(--border)', background:'var(--bg-card)'}}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-display text-xl font-bold" style={{color:'var(--text)'}}>{selected.client.name}</h2>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{background:STATUS_CONFIG[selected.status]?.bg, color:STATUS_CONFIG[selected.status]?.color}}>
                        {STATUS_CONFIG[selected.status]?.label}
                      </span>
                    </div>
                    <p className="text-xs" style={{color:'var(--text-faint)'}}>
                      {selected.client.email} · Opened {new Date(selected.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
                    </p>
                  </div>
                  {selected.milestone && (
                    <div className="text-right">
                      <div className="font-display text-2xl font-bold" style={{color:'#C8A96E'}}>
                        {SYM[selected.booking.currency] ?? '₦'}{selected.milestone.amount.toLocaleString()}
                      </div>
                      <div className="text-xs" style={{color:'var(--text-faint)'}}>{selected.milestone.title}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-5">

                {/* Dispute details */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'var(--text-faint)'}}>Client's Reason</div>
                    <p className="text-sm leading-relaxed" style={{color:'var(--text)'}}>{selected.reason}</p>
                  </div>
                  <div className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'var(--text-faint)'}}>Booking Details</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{color:'var(--text-muted)'}}>Event Type</span>
                        <span className="font-semibold" style={{color:'var(--text)'}}>{selected.booking.eventType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{color:'var(--text-muted)'}}>Event Date</span>
                        <span className="font-semibold" style={{color:'var(--text)'}}>
                          {new Date(selected.booking.eventDate).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                        </span>
                      </div>
                      {selected.milestone && (
                        <>
                          <div className="flex justify-between">
                            <span style={{color:'var(--text-muted)'}}>Milestone</span>
                            <span className="font-semibold" style={{color:'var(--text)'}}>{selected.milestone.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{color:'var(--text-muted)'}}>Vendor would receive</span>
                            <span className="font-semibold" style={{color:'#C8A96E'}}>{SYM[selected.booking.currency] ?? '₦'}{selected.milestone.vendorAmount.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence */}
                {selected.evidence && (
                  <div className="rounded-2xl p-5" style={{background:'rgba(200,169,110,0.05)', border:'1px solid rgba(200,169,110,0.2)'}}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#C8A96E'}}>Evidence Submitted</div>
                    <p className="text-sm leading-relaxed" style={{color:'var(--text-muted)'}}>{selected.evidence}</p>
                  </div>
                )}

                {/* Resolution (if already resolved) */}
                {selected.resolution && (
                  <div className="rounded-2xl p-5" style={{background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)'}}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#10b981'}}>Resolution Notes</div>
                    <p className="text-sm leading-relaxed" style={{color:'var(--text-muted)'}}>{selected.resolution}</p>
                  </div>
                )}

                {/* Action panel — only for open disputes */}
                {['OPEN','INVESTIGATING'].includes(selected.status) && (
                  <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                    <h3 className="font-semibold mb-4" style={{color:'var(--text)'}}>Take Action</h3>

                    <div className="mb-4">
                      <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{color:'var(--text-faint)'}}>Resolution Notes</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)}
                        rows={3} placeholder="Document your decision and reasoning…"
                        className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
                        style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => resolve('RESOLVED_CLIENT')} disabled={resolving}
                        className="py-3 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all active:scale-95"
                        style={{background:'linear-gradient(135deg,#10b981,#059669)'}}>
                        {resolving ? '…' : '💚 Refund Client'}
                      </button>
                      <button onClick={() => resolve('RESOLVED_VENDOR')} disabled={resolving}
                        className="py-3 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all active:scale-95"
                        style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                        {resolving ? '…' : '💛 Release to Vendor'}
                      </button>
                      <button onClick={() => resolve('DISMISSED')} disabled={resolving}
                        className="py-3 rounded-xl text-xs font-bold disabled:opacity-50 transition-all active:scale-95"
                        style={{background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)'}}>
                        {resolving ? '…' : 'Dismiss'}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <p className="text-[9px] text-center" style={{color:'var(--text-faint)'}}>Client gets full refund</p>
                      <p className="text-[9px] text-center" style={{color:'var(--text-faint)'}}>Vendor gets their 97%</p>
                      <p className="text-[9px] text-center" style={{color:'var(--text-faint)'}}>No action taken</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}