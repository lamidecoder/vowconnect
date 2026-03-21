'use client'
import { useState, useEffect } from 'react'
import DashboardShell from '@/components/layout/DashboardShell'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const NAV = [
  { href:'/client/dashboard',  label:'Dashboard',     icon:'🏠' },
  { href:'/client/bookings',   label:'My Bookings',   icon:'📅' },
  { href:'/client/wedding',    label:'Wedding Hub',   icon:'💍' },
  { href:'/client/messages',   label:'Messages',      icon:'💬' },
  { href:'/client/quotes',     label:'Quotes',        icon:'📄' },
  { href:'/client/favorites',  label:'Saved Vendors', icon:'❤️' },
  { href:'/client/profile',    label:'Profile',       icon:'✏️' },
]

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  PENDING:   { color:'#f59e0b', bg:'rgba(245,158,11,0.12)',   label:'Awaiting Vendor',  icon:'⏳' },
  ACCEPTED:  { color:'#C8A96E', bg:'rgba(200,169,110,0.12)',  label:'Confirmed',        icon:'✅' },
  COMPLETED: { color:'#10b981', bg:'rgba(16,185,129,0.12)',   label:'Completed',        icon:'🎉' },
  CANCELLED: { color:'#f87171', bg:'rgba(239,68,68,0.12)',    label:'Cancelled',        icon:'✕'  },
  DECLINED:  { color:'#6b7280', bg:'rgba(107,114,128,0.12)',  label:'Declined',         icon:'✗'  },
}

const MILESTONE_STATUS: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:           { color:'#6b7280', bg:'rgba(107,114,128,0.1)', label:'Not paid'         },
  PAID:              { color:'#C8A96E', bg:'rgba(200,169,110,0.12)',label:'Paid · In escrow' },
  RELEASE_REQUESTED: { color:'#f59e0b', bg:'rgba(245,158,11,0.12)', label:'Release requested' },
  RELEASED:          { color:'#10b981', bg:'rgba(16,185,129,0.12)', label:'Released'          },
  DISPUTED:          { color:'#f87171', bg:'rgba(239,68,68,0.12)',  label:'Disputed'          },
}

function BookingDetailInner() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const bookingId    = params?.id as string
  const payStatus    = searchParams.get('payment')
  const payRef       = searchParams.get('ref')

  const [booking,    setBooking]    = useState<any>(null)
  const [breakdown,  setBreakdown]  = useState<any>(null)
  const [loading,    setLoading]    = useState(true)
  const [paying,     setPaying]     = useState(false)
  const [activeMile, setActiveMile] = useState<number|null>(null)
  const [showDispute,setShowDispute]= useState<string|null>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [submittingDispute, setSubmittingDispute] = useState(false)

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`, { credentials:'include' })
      .then(r => r.json())
      .then(d => { setBooking(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [bookingId])

  useEffect(() => {
    if (!booking?.milestones?.length) return
    const pending = booking.milestones.find((m: any, i: number) =>
      m.status === 'PENDING' && (i === 0 || booking.milestones[i-1]?.status === 'RELEASED')
    )
    if (pending) {
      const idx = booking.milestones.indexOf(pending)
      setActiveMile(idx)
      fetch(`/api/payments?bookingId=${bookingId}&milestone=${idx}`, { credentials:'include' })
        .then(r => r.json())
        .then(d => setBreakdown(d.breakdown))
    }
  }, [booking])

  async function pay(milestoneIndex: number) {
    setPaying(true)
    const res  = await fetch('/api/payments', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ bookingId, milestoneIndex }),
    })
    const data = await res.json()
    if (data.checkoutUrl) window.location.href = data.checkoutUrl
    else setPaying(false)
  }

  async function submitDispute() {
    if (!disputeReason.trim() || !showDispute) return
    setSubmittingDispute(true)
    await fetch('/api/payments/release', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ milestoneId: showDispute, action:'DISPUTE', reason: disputeReason }),
    })
    setShowDispute(null); setDisputeReason('')
    window.location.reload()
  }

  if (loading) return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
          <p className="text-sm" style={{color:'var(--text-faint)'}}>Loading your booking…</p>
        </div>
      </div>
    </DashboardShell>
  )

  if (!booking) return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p style={{color:'var(--text-muted)'}}>Booking not found</p>
          <Link href="/client/bookings" className="mt-4 inline-flex text-sm font-bold px-4 py-2 rounded-xl" style={{background:'#C8A96E', color:'white'}}>Back to Bookings</Link>
        </div>
      </div>
    </DashboardShell>
  )

  const status     = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING
  const milestones = booking.milestones ?? []
  const sym        = breakdown?.currencySymbol ?? '₦'
  const totalPaid  = milestones.filter((m: any) => ['PAID','RELEASED'].includes(m.status)).reduce((s: number, m: any) => s + m.amount, 0)
  const totalDue   = milestones.reduce((s: number, m: any) => s + m.amount, 0)
  const progress   = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0

  return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      {/* Payment success banner */}
      {payStatus === 'verify' && (
        <div className="px-8 py-3 flex items-center gap-3 border-b" style={{background:'rgba(16,185,129,0.1)', borderColor:'rgba(16,185,129,0.2)'}}>
          <span className="text-lg">🎉</span>
          <p className="text-sm font-semibold" style={{color:'#10b981'}}>Payment successful! Funds are held securely until your event.</p>
        </div>
      )}
      {payStatus === 'cancelled' && (
        <div className="px-8 py-3 flex items-center gap-3 border-b" style={{background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.15)'}}>
          <span className="text-lg">⚠️</span>
          <p className="text-sm" style={{color:'#f87171'}}>Payment was cancelled. Your booking is still pending payment.</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <Link href="/client/bookings" className="flex items-center gap-2 text-xs font-semibold mb-3 hover:opacity-70 transition-all" style={{color:'var(--text-faint)'}}>
              ← Back to Bookings
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-bold" style={{color:'var(--text)'}}>{booking.vendor?.businessName}</h1>
            <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
              {booking.eventType} · {new Date(booking.eventDate).toLocaleDateString('en-GB',{weekday:'long', day:'numeric', month:'long', year:'numeric'})}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{background:status.bg, color:status.color}}>
            {status.icon} {status.label}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left — Milestones */}
          <div className="lg:col-span-2 space-y-4">

            {/* Payment progress */}
            {milestones.length > 0 && (
              <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold" style={{color:'var(--text)'}}>Payment Progress</h2>
                    <p className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>{sym}{totalPaid.toLocaleString()} paid of {sym}{totalDue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold" style={{color:'#C8A96E'}}>{Math.round(progress)}%</div>
                    <div className="text-xs" style={{color:'var(--text-faint)'}}>complete</div>
                  </div>
                </div>
                {/* Segmented progress bar */}
                <div className="flex gap-1 h-3 rounded-full overflow-hidden" style={{background:'var(--bg-subtle)'}}>
                  {milestones.map((m: any, i: number) => (
                    <div key={i} className="flex-1 rounded-full transition-all duration-700"
                      style={{
                        background: m.status === 'RELEASED' ? '#10b981' :
                                    m.status === 'PAID' ? 'linear-gradient(90deg,#C8A96E,#8B6914)' :
                                    m.status === 'DISPUTED' ? '#f87171' : 'var(--bg-subtle)',
                        border: '2px solid var(--bg-card)',
                      }}/>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {milestones.map((m: any, i: number) => (
                    <div key={i} className="text-[9px] font-bold" style={{color:'var(--text-faint)'}}>{m.percentage}%</div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestone cards */}
            {milestones.length > 0 ? milestones.map((m: any, i: number) => {
              const ms     = MILESTONE_STATUS[m.status] ?? MILESTONE_STATUS.PENDING
              const isNext = i === activeMile
              const canPay = isNext && m.status === 'PENDING' && booking.status === 'ACCEPTED'

              return (
                <div key={m.id}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: isNext && m.status === 'PENDING' ? '1.5px solid rgba(200,169,110,0.5)' : '1px solid var(--border)',
                    boxShadow: isNext && m.status === 'PENDING' ? '0 4px 24px rgba(200,169,110,0.12)' : 'none',
                  }}>

                  {/* Milestone header */}
                  <div className="px-6 py-5 flex items-center gap-4">
                    {/* Step indicator */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{
                        background: m.status === 'RELEASED' ? 'rgba(16,185,129,0.15)' :
                                    m.status === 'PAID' ? 'rgba(200,169,110,0.15)' :
                                    isNext ? 'rgba(200,169,110,0.1)' : 'var(--bg-subtle)',
                        color: m.status === 'RELEASED' ? '#10b981' :
                               ['PAID','PENDING'].includes(m.status) ? '#C8A96E' : 'var(--text-faint)',
                        border: isNext && m.status === 'PENDING' ? '1.5px solid rgba(200,169,110,0.4)' : 'none',
                      }}>
                      {m.status === 'RELEASED' ? '✓' : m.status === 'PAID' ? '🔒' : `${i+1}`}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm" style={{color:'var(--text)'}}>{m.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:ms.bg, color:ms.color}}>{ms.label}</span>
                      </div>
                      {m.description && <p className="text-xs mt-0.5 truncate" style={{color:'var(--text-faint)'}}>{m.description}</p>}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-display text-xl font-bold" style={{color: canPay ? '#C8A96E' : 'var(--text)'}}>
                        {sym}{m.amount?.toLocaleString()}
                      </div>
                      <div className="text-[10px]" style={{color:'var(--text-faint)'}}>{m.percentage}% of total</div>
                    </div>
                  </div>

                  {/* Pay button for active milestone */}
                  {canPay && breakdown && (
                    <div className="px-6 pb-5 border-t pt-4" style={{borderColor:'rgba(200,169,110,0.15)'}}>
                      {/* Fee breakdown */}
                      <div className="rounded-xl p-4 mb-4" style={{background:'var(--bg-subtle)'}}>
                        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'var(--text-faint)'}}>Payment Breakdown</div>
                        <div className="space-y-2">
                          {[
                            { label: m.title,              value: `${sym}${m.amount?.toLocaleString()}` },
                            { label: 'Platform fee (3%)',  value: `${sym}${breakdown.commissionAmount?.toLocaleString()}` },
                            { label: `Processing fee (${breakdown.feePercent}%)`, value: `${sym}${breakdown.paymentFeeAmount?.toLocaleString()}` },
                          ].map(row => (
                            <div key={row.label} className="flex items-center justify-between">
                              <span className="text-xs" style={{color:'var(--text-muted)'}}>{row.label}</span>
                              <span className="text-xs font-semibold" style={{color:'var(--text)'}}>{row.value}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 flex items-center justify-between" style={{borderColor:'var(--border)'}}>
                            <span className="text-sm font-bold" style={{color:'var(--text)'}}>You pay</span>
                            <span className="font-display text-lg font-bold" style={{color:'#C8A96E'}}>{sym}{breakdown.totalAmount?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <button onClick={() => pay(i)} disabled={paying}
                        className="w-full py-4 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-all active:scale-95 relative overflow-hidden"
                        style={{background:'linear-gradient(135deg,#C9941A,#E4B520)', boxShadow:'0 4px 20px rgba(201,148,26,0.35)'}}>
                        {paying ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'white',borderTopColor:'transparent'}}/>
                            Redirecting to secure payment…
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            🔒 Pay {sym}{breakdown.totalAmount?.toLocaleString()} Securely
                          </span>
                        )}
                      </button>
                      <p className="text-center text-[10px] mt-2" style={{color:'var(--text-faint)'}}>
                        Funds held in escrow until your event is confirmed ✓
                      </p>
                    </div>
                  )}

                  {/* Paid — show dispute option */}
                  {m.status === 'PAID' && (
                    <div className="px-6 pb-5 border-t pt-4 flex items-center justify-between" style={{borderColor:'var(--border)'}}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔒</span>
                        <div>
                          <p className="text-xs font-semibold" style={{color:'var(--text)'}}>Held in escrow</p>
                          <p className="text-[10px]" style={{color:'var(--text-faint)'}}>Auto-released 72hrs after event</p>
                        </div>
                      </div>
                      <button onClick={() => setShowDispute(m.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{background:'rgba(239,68,68,0.1)', color:'#f87171'}}>
                        Raise Dispute
                      </button>
                    </div>
                  )}

                  {/* Released */}
                  {m.status === 'RELEASED' && (
                    <div className="px-6 pb-4 flex items-center gap-2">
                      <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{background:'rgba(16,185,129,0.1)', color:'#10b981'}}>
                        ✓ Payment released to vendor
                      </span>
                    </div>
                  )}
                </div>
              )
            }) : (
              <div className="rounded-2xl p-8 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="text-4xl mb-3 opacity-20">💳</div>
                <p className="font-semibold text-sm" style={{color:'var(--text-muted)'}}>No payment milestones set up yet</p>
                <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>The vendor will set up payment milestones when they accept your booking</p>
              </div>
            )}
          </div>

          {/* Right — Booking details */}
          <div className="space-y-4">
            {/* Vendor card */}
            <div className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'#C8A96E'}}>Vendor</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                  style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                  {booking.vendor?.businessName?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{color:'var(--text)'}}>{booking.vendor?.businessName}</div>
                  <div className="text-xs" style={{color:'var(--text-faint)'}}>{booking.vendor?.category?.name}</div>
                </div>
              </div>
              <Link href={`/client/messages`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{background:'rgba(200,169,110,0.1)', color:'#C8A96E', border:'1px solid rgba(200,169,110,0.2)'}}>
                💬 Message Vendor
              </Link>
            </div>

            {/* Booking summary */}
            <div className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'var(--text-faint)'}}>Booking Details</div>
              <div className="space-y-3">
                {[
                  { icon:'📅', label:'Event Date',   value:new Date(booking.eventDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) },
                  { icon:'🎊', label:'Event Type',   value:booking.eventType },
                  { icon:'📍', label:'Location',     value:booking.location ?? 'TBC' },
                  { icon:'👥', label:'Guests',       value:booking.guestCount ? `${booking.guestCount} people` : 'TBC' },
                ].map(d => (
                  <div key={d.label} className="flex items-start gap-3">
                    <span className="text-base flex-shrink-0">{d.icon}</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest" style={{color:'var(--text-faint)'}}>{d.label}</div>
                      <div className="text-sm font-medium mt-0.5" style={{color:'var(--text)'}}>{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escrow info */}
            <div className="rounded-2xl p-5" style={{background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.2)'}}>
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#C8A96E'}}>🔒 Secure Escrow</div>
              <div className="space-y-2 text-xs" style={{color:'var(--text-muted)'}}>
                <p>✓ Payments held until event confirmed</p>
                <p>✓ Auto-released after 72 hours</p>
                <p>✓ Dispute protection available</p>
                <p>✓ Full refund if vendor cancels</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute modal */}
      {showDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)'}}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <h3 className="font-display text-xl font-bold mb-2" style={{color:'var(--text)'}}>Raise a Dispute</h3>
            <p className="text-sm mb-5" style={{color:'var(--text-muted)'}}>Tell us what happened. Our team will review within 24 hours and contact both parties.</p>
            <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)}
              rows={4} placeholder="Describe the issue in detail…"
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none mb-4"
              style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
            <div className="flex gap-3">
              <button onClick={() => setShowDispute(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)'}}>
                Cancel
              </button>
              <button onClick={submitDispute} disabled={submittingDispute || !disputeReason.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{background:'#ef4444'}}>
                {submittingDispute ? 'Submitting…' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

export default function ClientBookingDetail() {
  return <Suspense><BookingDetailInner /></Suspense>
}