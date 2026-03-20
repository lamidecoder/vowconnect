'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const EVENT_TYPES = ['Traditional Wedding','White Wedding','Introduction Ceremony','Engagement Party','Naming Ceremony','Birthday','Other']
const DAY_INITIALS = ['S','M','T','W','T','F','S']
const MONTH_NAMES  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface DayData { blocked?: boolean; booked?: boolean; reason?: string }

export default function BookingModal({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  const router = useRouter()
  const [open,    setOpen]    = useState(false)
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({ eventDate:'', eventType:'', location:'', guestCount:'', budget:'', notes:'' })
  const now = new Date()
  const [calYear,  setCalYear]  = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [dayData,  setDayData]  = useState<Record<string, DayData>>({})
  const [calLoading, setCalLoading] = useState(false)

  const monthStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}`

  useEffect(() => {
    if (!open) return
    setCalLoading(true)
    fetch(`/api/availability?vendorId=${vendorId}&month=${monthStr}`)
      .then(r => r.json())
      .then(d => {
        const map: Record<string, DayData> = {}
        ;(d.blocked ?? []).forEach((b: any) => { map[b.date] = { blocked:true, reason:b.reason } })
        ;(d.booked  ?? []).forEach((b: any) => { map[b.date] = { ...(map[b.date]??{}), booked:true } })
        setDayData(map)
      })
      .catch(()=>{})
      .finally(() => setCalLoading(false))
  }, [open, monthStr, vendorId])

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.eventDate || !form.eventType) { setError('Please fill required fields'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/bookings', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ vendorId, ...form }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Booking failed'); setLoading(false); return }
      setSuccess(true)
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  function close() { setOpen(false); setStep(1); setSuccess(false); setError(''); setForm({ eventDate:'', eventType:'', location:'', guestCount:'', budget:'', notes:'' }) }

  // Calendar math
  const todayStr    = now.toISOString().split('T')[0]
  const firstDay    = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate()
  const cells       = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)]

  function pickDate(day: number) {
    const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    if (ds <= todayStr || dayData[ds]?.blocked || dayData[ds]?.booked) return
    setForm(p => ({ ...p, eventDate: ds }))
  }

  function prevMonth() { calMonth===0 ? (setCalMonth(11),setCalYear(y=>y-1)) : setCalMonth(m=>m-1) }
  function nextMonth() { calMonth===11 ? (setCalMonth(0),setCalYear(y=>y+1)) : setCalMonth(m=>m+1) }

  const selectedLabel = form.eventDate
    ? new Date(form.eventDate+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
    : ''

  return (
    <>
      <button onClick={()=>setOpen(true)} className="btn-primary w-full justify-center py-3 text-base">
        📅 Check Availability &amp; Book
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{background:'rgba(26,14,7,0.75)', backdropFilter:'blur(4px)'}}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-warm-lg overflow-hidden animate-fade-up max-h-[92vh] flex flex-col">

            {/* Modal header */}
            <div className="relative p-6 pb-4 bg-gradient-to-r from-[#080808] to-[#1A0A0A] shrink-0">
              <div className="absolute inset-0 bg-pattern-ankara opacity-20" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Request Booking</h2>
                  <p className="text-white/50 text-sm mt-0.5">{vendorName}</p>
                </div>
                <button onClick={close} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">✕</button>
              </div>
              {!success && (
                <div className="flex gap-2 mt-4 relative z-10">
                  {[1,2,3].map(s=>(
                    <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${step>=s?'bg-[#C8A96E]':'bg-white/20'}`}/>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {success ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-4">🎊</div>
                  <h3 className="font-display text-2xl font-bold text-theme mb-2">Booking Sent!</h3>
                  <p className="text-theme-muted text-sm mb-6">
                    Your request has been sent to <strong>{vendorName}</strong>. They typically respond within a few hours.
                  </p>
                  <button onClick={()=>{close();router.push('/client/bookings')}} className="btn-primary w-full justify-center">
                    View My Bookings
                  </button>
                </div>
              ) : (
                <>
                  {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">{error}</div>}

                  {/* ── Step 1: Calendar ── */}
                  {step===1 && (
                    <div>
                      <p className="text-sm text-theme-muted mb-4 font-medium">Pick an available date — blocked dates are shown so you always know before asking.</p>

                      <div className="bg-theme-subtle border border-[var(--border)] rounded-2xl p-4 mb-4">
                        {/* Month nav */}
                        <div className="flex items-center justify-between mb-3">
                          <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-theme-muted hover:bg-theme-subtle text-sm">‹</button>
                          <span className="text-sm font-bold text-theme">{MONTH_NAMES[calMonth]} {calYear}</span>
                          <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-theme-muted hover:bg-theme-subtle text-sm">›</button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-1">
                          {DAY_INITIALS.map((d,i)=><div key={i} className="text-center text-xs font-bold text-theme-faint">{d}</div>)}
                        </div>

                        {calLoading ? (
                          <div className="h-28 flex items-center justify-center text-xs text-theme-faint">Checking availability...</div>
                        ) : (
                          <div className="grid grid-cols-7 gap-0.5">
                            {cells.map((day,i) => {
                              if (!day) return <div key={`e${i}`}/>
                              const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                              const s  = dayData[ds]
                              const past     = ds <= todayStr
                              const unavail  = s?.blocked || s?.booked
                              const selected = form.eventDate === ds
                              const today    = ds === todayStr

                              const style = past
                                ? {bg:'#F4EDD8', color:'#C8B89A', cursor:'default', border:'transparent'}
                                : s?.booked
                                ? {bg:'#DBEAFE', color:'#1D4ED8', cursor:'not-allowed', border:'#93C5FD'}
                                : s?.blocked
                                ? {bg:'#FEE2E2', color:'#991B1B', cursor:'not-allowed', border:'#FCA5A5'}
                                : selected
                                ? {bg:'#C9941A', color:'#fff',     cursor:'pointer',    border:'#A87315'}
                                : today
                                ? {bg:'transparent', color:'#C9941A', cursor:'pointer', border:'#C9941A'}
                                : {bg:'transparent', color:'#2C1A0E', cursor:'pointer', border:'transparent'}

                              return (
                                <button key={ds} disabled={past||unavail} onClick={()=>pickDate(day)}
                                  title={s?.booked ? 'Already booked' : s?.reason ?? (s?.blocked ? 'Unavailable' : '')}
                                  style={{background:style.bg, border:`1.5px solid ${style.border}`, color:style.color,
                                    borderRadius:7, padding:'5px 0', fontSize:12, fontWeight:selected?700:500, cursor:style.cursor}}>
                                  {day}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {/* Legend */}
                        <div className="flex gap-3 mt-3 flex-wrap">
                          {[
                            {bg:'#DBEAFE',border:'#93C5FD',label:'Booked'},
                            {bg:'#FEE2E2',border:'#FCA5A5',label:'Unavailable'},
                            {bg:'#C9941A',border:'#A87315',label:'Your pick'},
                          ].map(l=>(
                            <div key={l.label} className="flex items-center gap-1 text-xs text-theme-faint">
                              <div style={{width:10,height:10,background:l.bg,border:`1.5px solid ${l.border}`,borderRadius:2}}/>
                              {l.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      {form.eventDate && (
                        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium mb-4">
                          ✓ {selectedLabel}
                        </div>
                      )}

                      <button onClick={()=>{if(!form.eventDate){setError('Please select a date');return};setError('');setStep(2)}}
                        className="btn-primary w-full justify-center">
                        Continue →
                      </button>
                    </div>
                  )}

                  {/* ── Step 2: Event type + location ── */}
                  {step===2 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-theme">Event Details</h3>
                      <div className="p-3 rounded-xl bg-[#FDFAF4] border border-[#C8A96E]/40 text-[#C8A96E] text-sm font-medium">📅 {selectedLabel}</div>
                      <div>
                        <label className="label">Event Type *</label>
                        <select className="input" name="eventType" value={form.eventType} onChange={handleChange} required>
                          <option value="">Select event type</option>
                          {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Event Location</label>
                        <input className="input" name="location" placeholder="e.g. Eko Hotel, Victoria Island" value={form.location} onChange={handleChange}/>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={()=>setStep(1)} className="btn-ghost flex-1 justify-center">← Back</button>
                        <button onClick={()=>{if(!form.eventType){setError('Select event type');return};setError('');setStep(3)}} className="btn-primary flex-1 justify-center">Continue →</button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Budget + notes + submit ── */}
                  {step===3 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-theme">Final Details</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Guest Count</label>
                          <input className="input" type="number" name="guestCount" placeholder="200" value={form.guestCount} onChange={handleChange}/>
                        </div>
                        <div>
                          <label className="label">Budget</label>
                          <input className="input" type="number" name="budget" placeholder="50000" value={form.budget} onChange={handleChange}/>
                        </div>
                      </div>
                      <div>
                        <label className="label">Notes for Vendor</label>
                        <textarea className="input resize-none" name="notes" rows={3} placeholder="Special requests, style preferences..." value={form.notes} onChange={handleChange}/>
                      </div>
                      <div className="p-3 rounded-xl bg-theme-subtle border border-[var(--border)] text-xs text-theme-muted">
                        📋 No payment required yet. Vendor will respond within a few hours.
                      </div>
                      <div className="flex gap-3">
                        <button onClick={()=>setStep(2)} className="btn-ghost flex-1 justify-center">← Back</button>
                        <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center disabled:opacity-60">
                          {loading ? 'Sending...' : 'Send Request 🎀'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
