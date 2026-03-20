'use client'
import { useState, useEffect, useCallback } from 'react'
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

const DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS  = ['January','February','March','April','May','June','July','August','September','October','November','December']
const REASONS = ['Already booked','Personal leave','Public holiday','Travel','Training']

interface DayStatus { blocked:boolean; booked:boolean; reason?:string; id?:string }

export default function AvailabilityPage() {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [data,  setData]  = useState<Record<string,DayStatus>>({})
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState<string|null>(null)
  const [showReason,  setShowReason]  = useState<string|null>(null)
  const [reason,      setReason]      = useState('Already booked')

  const monthStr = `${year}-${String(month+1).padStart(2,'0')}`

  const fetchMonth = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/availability?vendorId=me&month=${monthStr}`, { credentials:'include' })
    const d   = await res.json()
    const map: Record<string,DayStatus> = {}
    if (Array.isArray(d)) {
      d.forEach((item:any) => {
        map[item.date] = { blocked: item.status === 'BLOCKED', booked: item.status === 'BOOKED', reason: item.reason, id: item.id }
      })
    }
    setData(map)
    setLoading(false)
  }, [monthStr])

  useEffect(() => { fetchMonth() }, [fetchMonth])

  const daysInMonth = new Date(year, month+1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay()

  async function blockDay(dateStr: string) {
    setSaving(dateStr)
    const res = await fetch('/api/availability', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ date: dateStr, status:'BLOCKED', reason }),
    })
    const d = await res.json()
    setData(p => ({ ...p, [dateStr]: { blocked:true, booked:false, reason, id:d.id } }))
    setShowReason(null); setSaving(null)
  }

  async function unblockDay(dateStr: string) {
    const entry = data[dateStr]
    if (!entry?.id) return
    setSaving(dateStr)
    await fetch(`/api/availability?id=${entry.id}`, { method:'DELETE', credentials:'include' })
    setData(p => { const n = {...p}; delete n[dateStr]; return n })
    setSaving(null)
  }

  function prevMonth() { if (month===0) { setMonth(11); setYear(y=>y-1) } else setMonth(m=>m-1) }
  function nextMonth() { if (month===11) { setMonth(0); setYear(y=>y+1) } else setMonth(m=>m+1) }

  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Availability</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Manage your calendar · block dates you&apos;re unavailable</p>
      </div>

      <div className="p-8" style={{maxWidth:600}}>
        {/* Legend */}
        <div className="flex gap-4 mb-6 text-xs font-semibold flex-wrap">
          {[
            { color:'var(--bg-card)',           border:'var(--border)', label:'Available' },
            { color:'rgba(239,68,68,0.15)',      border:'rgba(239,68,68,0.4)', label:'Blocked' },
            { color:'rgba(200,169,110,0.15)',    border:'rgba(200,169,110,0.4)', label:'Booked' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{background:l.color, border:`1px solid ${l.border}`}}/>
              <span style={{color:'var(--text-muted)'}}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Month nav */}
        <div className="rounded-2xl overflow-hidden" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{borderColor:'var(--border)'}}>
            <button onClick={prevMonth} className="text-xl font-bold px-3 py-1 rounded-lg hover:opacity-70" style={{color:'var(--text-muted)'}}>‹</button>
            <h2 className="font-display text-xl font-semibold" style={{color:'var(--text)'}}>{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="text-xl font-bold px-3 py-1 rounded-lg hover:opacity-70" style={{color:'var(--text-muted)'}}>›</button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{borderColor:'#C8A96E', borderTopColor:'transparent'}}/>
            </div>
          ) : (
            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-bold py-2" style={{color:'var(--text-faint)'}}>{d}</div>
                ))}
              </div>
              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({length: firstDay}).map((_,i) => <div key={`e${i}`}/>)}
                {Array.from({length: daysInMonth}).map((_,i) => {
                  const day     = i + 1
                  const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                  const status  = data[dateStr]
                  const isToday = dateStr === today
                  const isPast  = dateStr < today
                  const isBlocked = status?.blocked
                  const isBooked  = status?.booked

                  return (
                    <button key={day}
                      onClick={() => {
                        if (isPast || isBooked) return
                        if (isBlocked) unblockDay(dateStr)
                        else { setShowReason(dateStr); setReason('Already booked') }
                      }}
                      disabled={saving === dateStr}
                      className="aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all relative"
                      style={{
                        background: isBlocked ? 'rgba(239,68,68,0.15)' : isBooked ? 'rgba(200,169,110,0.15)' : 'transparent',
                        border: isToday ? '2px solid #C8A96E' : `1px solid ${isBlocked ? 'rgba(239,68,68,0.3)' : isBooked ? 'rgba(200,169,110,0.3)' : 'var(--border)'}`,
                        color: isPast ? 'var(--text-faint)' : isBlocked ? '#f87171' : isBooked ? '#C8A96E' : 'var(--text)',
                        opacity: isPast ? 0.4 : 1,
                        cursor: isPast || isBooked ? 'default' : 'pointer',
                      }}>
                      {day}
                      {isBlocked && <span className="text-[8px] leading-none mt-0.5" style={{color:'#f87171'}}>✕</span>}
                      {isBooked  && <span className="text-[8px] leading-none mt-0.5" style={{color:'#C8A96E'}}>★</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs mt-4 text-center" style={{color:'var(--text-faint)'}}>
          Click a date to block/unblock it · Booked dates are locked
        </p>
      </div>

      {/* Reason modal */}
      {showReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <h3 className="font-semibold mb-4" style={{color:'var(--text)'}}>Block {showReason}</h3>
            <div className="space-y-2 mb-4">
              {REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: reason===r ? 'rgba(200,169,110,0.15)' : 'var(--bg-subtle)',
                    color: reason===r ? '#C8A96E' : 'var(--text)',
                    border: `1px solid ${reason===r ? 'rgba(200,169,110,0.4)' : 'var(--border)'}`,
                  }}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReason(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)'}}>
                Cancel
              </button>
              <button onClick={() => blockDay(showReason)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{background:'#ef4444'}}>
                Block Date
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}