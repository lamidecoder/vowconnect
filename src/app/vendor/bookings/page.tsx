'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import DashboardShell from '@/components/layout/DashboardShell'
import Link from 'next/link'

interface Booking {
  id: string; status: string; eventType: string; eventDate: string
  location?: string; guestCount?: number; budget?: number; notes?: string
  client: { name: string; email: string; phone?: string }
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  ACCEPTED:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  COMPLETED: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  DECLINED:  'bg-red-500/20 text-red-400 border border-red-500/30',
  CANCELLED: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30',
}

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

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [busy, setBusy]         = useState<string|null>(null)
  const [expanded, setExpanded] = useState<string|null>(null)

  useEffect(() => {
    fetch('/api/bookings', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setBookings(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  async function updateStatus(id: string, status: string) {
    setBusy(id + status)
    await fetch(`/api/bookings/${id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status }), credentials:'include',
    })
    setBookings(p => p.map(b => b.id === id ? {...b, status} : b))
    setBusy(null)
  }

  const counts: Record<string,number> = { ALL: bookings.length, PENDING:0, ACCEPTED:0, COMPLETED:0, DECLINED:0, CANCELLED:0 }
  bookings.forEach(b => { if (b.status in counts) counts[b.status]++ })
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter)

  if (loading) return (
    <DashboardShell role="vendor" userName="Vendor" navItems={NAV}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E', borderTopColor:'transparent'}}/>
      </div>
    </DashboardShell>
  )

  return (
    <DashboardShell role="vendor" userName="Vendor" navItems={NAV}>
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Booking Requests</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>{bookings.length} total · {counts.PENDING} pending action</p>
      </div>

      <div className="p-8">
        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {Object.entries(counts).map(([s, c]) => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all border"
              style={{
                background: filter === s ? '#C8A96E' : 'var(--bg-card)',
                color:      filter === s ? '#fff' : 'var(--text-muted)',
                borderColor: filter === s ? '#C8A96E' : 'var(--border)',
              }}>
              {s.charAt(0) + s.slice(1).toLowerCase()} ({c})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">📭</div>
            <p className="font-semibold" style={{color:'var(--text-muted)'}}>No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => (
              <div key={b.id} className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: b.status==='PENDING' ? 'rgba(245,158,11,0.05)' : 'var(--bg-card)',
                  border: b.status==='PENDING' ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)',
                }}>
                {/* Row */}
                <button className="w-full px-6 py-4 flex items-center gap-4 text-left"
                  onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                    {b.client.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold" style={{color:'var(--text)'}}>{b.client.name}</div>
                    <div className="text-xs" style={{color:'var(--text-faint)'}}>{b.eventType} · {formatDate(b.eventDate)}{b.location ? ` · ${b.location}` : ''}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[b.status] ?? ''}`}>{b.status}</span>
                  <span className="text-xs ml-2" style={{color:'var(--text-faint)'}}>{expanded===b.id?'▲':'▼'}</span>
                </button>

                {/* Expanded details */}
                {expanded === b.id && (
                  <div className="px-6 pb-6 border-t" style={{borderColor:'var(--border)'}}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 mb-4">
                      {[
                        { label:'Event Type', value: b.eventType },
                        { label:'Date',       value: formatDate(b.eventDate) },
                        { label:'Location',   value: b.location ?? 'Not specified' },
                        { label:'Guests',     value: b.guestCount ? `~${b.guestCount}` : 'Not specified' },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl p-3" style={{background:'var(--bg-subtle)'}}>
                          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'var(--text-faint)'}}>{item.label}</div>
                          <div className="text-sm font-semibold" style={{color:'var(--text)'}}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {b.notes && (
                      <div className="rounded-xl p-4 mb-4" style={{background:'var(--bg-subtle)'}}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color:'#C8A96E'}}>Client Note</div>
                        <p className="text-sm italic" style={{color:'var(--text-muted)'}}>"{b.notes}"</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Link href="/vendor/messages"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                        💬 Message Client
                      </Link>
                      {b.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus(b.id,'ACCEPTED')} disabled={!!busy}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                            style={{background:'#10b981'}}>
                            {busy===b.id+'ACCEPTED' ? '…' : '✓ Accept'}
                          </button>
                          <button onClick={() => updateStatus(b.id,'DECLINED')} disabled={!!busy}
                            className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                            style={{background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)'}}>
                            {busy===b.id+'DECLINED' ? '…' : '✗ Decline'}
                          </button>
                        </>
                      )}
                      {b.status === 'ACCEPTED' && (
                        <button onClick={() => updateStatus(b.id,'COMPLETED')} disabled={!!busy}
                          className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                          style={{background:'#6366f1'}}>
                          {busy===b.id+'COMPLETED' ? '…' : '🎊 Mark Completed'}
                        </button>
                      )}
                    </div>
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