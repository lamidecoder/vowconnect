'use client'
import { useState, useEffect } from 'react'
import DashboardShell from '@/components/layout/DashboardShell'
import Link from 'next/link'

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
  { href:'/vendor/bank',         label:'Payments',     icon:'🏦' },
]

const SYM: Record<string,string> = { NGN:'₦', GBP:'£', USD:'$', CAD:'CA$', GHS:'GH₵' }

interface EarningsData {
  currency:         string
  totalEarned:      number
  pendingRelease:   number
  thisMonth:        number
  lastMonth:        number
  totalBookings:    number
  completedBookings:number
  avgBookingValue:  number
  payouts:          Payout[]
  pendingMilestones:PendingMilestone[]
  monthlyChart:     { month:string; amount:number }[]
}

interface Payout {
  id:string; amount:number; status:string; date:string
  bookingId:string; clientName:string; milestoneName:string; ref:string
}

interface PendingMilestone {
  id:string; title:string; amount:number; vendorAmount:number
  status:string; bookingId:string; clientName:string; eventDate:string
}

export default function VendorEarningsPage() {
  const [data,     setData]     = useState<EarningsData|null>(null)
  const [loading,  setLoading]  = useState(true)
  const [period,   setPeriod]   = useState<'30'|'90'|'365'>('30')
  const [releasing,setReleasing]= useState<string|null>(null)

  useEffect(() => {
    fetch('/api/vendor/earnings', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function requestRelease(milestoneId: string) {
    setReleasing(milestoneId)
    await fetch('/api/payments/release', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ milestoneId, action:'REQUEST' }),
    })
    window.location.reload()
  }

  const sym = SYM[data?.currency ?? 'NGN'] ?? '₦'

  const maxBar = data?.monthlyChart?.length
    ? Math.max(...data.monthlyChart.map(m => m.amount), 1)
    : 1

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      {/* Premium header */}
      <div className="relative overflow-hidden" style={{background:'linear-gradient(135deg,#0a0a0a,#1a1208)'}}>
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 30% 50%, rgba(200,169,110,0.12) 0%, transparent 60%)'}}/>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5" style={{background:'#C8A96E', filter:'blur(60px)'}}/>
        <div className="relative z-10 px-8 py-8">
          <div className="text-xs font-bold uppercase tracking-[0.25em] mb-2" style={{color:'rgba(200,169,110,0.7)'}}>Vendor</div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">Earnings</h1>
          <p className="text-sm" style={{color:'rgba(255,255,255,0.35)'}}>Your payments, payouts & financial overview</p>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
              <p className="text-xs" style={{color:'var(--text-faint)'}}>Loading your earnings…</p>
            </div>
          </div>
        ) : !data ? (
          <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">💰</div>
            <p className="font-semibold" style={{color:'var(--text-muted)'}}>No earnings data yet</p>
            <p className="text-xs mt-1 mb-6" style={{color:'var(--text-faint)'}}>Complete your first booking to see your earnings here</p>
            <Link href="/vendor/bank" className="inline-flex text-sm font-bold px-5 py-2.5 rounded-xl text-white" style={{background:'#C8A96E'}}>
              Set Up Payment Account →
            </Link>
          </div>
        ) : (
          <>
            {/* Hero stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label:    'Total Earned',
                  value:    `${sym}${data.totalEarned.toLocaleString()}`,
                  sub:      'all time',
                  icon:     '💰',
                  color:    '#C8A96E',
                  gradient: 'linear-gradient(135deg,rgba(200,169,110,0.15),rgba(200,169,110,0.05))',
                  border:   'rgba(200,169,110,0.3)',
                },
                {
                  label:    'In Escrow',
                  value:    `${sym}${data.pendingRelease.toLocaleString()}`,
                  sub:      'awaiting release',
                  icon:     '🔒',
                  color:    '#6366f1',
                  gradient: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(99,102,241,0.04))',
                  border:   'rgba(99,102,241,0.25)',
                },
                {
                  label:    'This Month',
                  value:    `${sym}${data.thisMonth.toLocaleString()}`,
                  sub:      data.thisMonth >= data.lastMonth ? `↑ vs last month` : `↓ vs last month`,
                  icon:     '📈',
                  color:    data.thisMonth >= data.lastMonth ? '#10b981' : '#f87171',
                  gradient: `linear-gradient(135deg,${data.thisMonth >= data.lastMonth ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)'},transparent)`,
                  border:   data.thisMonth >= data.lastMonth ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)',
                },
                {
                  label:    'Avg Booking',
                  value:    `${sym}${data.avgBookingValue.toLocaleString()}`,
                  sub:      `${data.completedBookings} completed`,
                  icon:     '⭐',
                  color:    '#f59e0b',
                  gradient: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.04))',
                  border:   'rgba(245,158,11,0.25)',
                },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 relative overflow-hidden"
                  style={{background:s.gradient, border:`1px solid ${s.border}`}}>
                  <div className="text-2xl mb-3">{s.icon}</div>
                  <div className="font-display text-2xl sm:text-3xl font-bold mb-0.5" style={{color:s.color}}>
                    {s.value}
                  </div>
                  <div className="text-xs font-semibold" style={{color:'var(--text-muted)'}}>{s.label}</div>
                  <div className="text-[10px] mt-0.5" style={{color:'var(--text-faint)'}}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Monthly chart */}
              <div className="lg:col-span-2 rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold" style={{color:'var(--text)'}}>Monthly Earnings</h2>
                  <div className="flex gap-1">
                    {([['30','3M'],['90','6M'],['365','1Y']] as const).map(([v,l]) => (
                      <button key={v} onClick={() => setPeriod(v)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                        style={{ background:period===v?'#C8A96E':'var(--bg-subtle)', color:period===v?'#fff':'var(--text-muted)' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Bar chart */}
                <div className="flex items-end gap-2 h-36">
                  {data.monthlyChart.slice(-(Number(period) === 30 ? 3 : Number(period) === 90 ? 6 : 12)).map((m, i, arr) => {
                    const pct = (m.amount / maxBar) * 100
                    const isLast = i === arr.length - 1
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-[9px] font-bold" style={{color:'var(--text-faint)'}}>
                          {m.amount > 0 ? `${sym}${(m.amount/1000).toFixed(0)}k` : ''}
                        </div>
                        <div className="w-full rounded-t-lg transition-all duration-700 relative group cursor-pointer"
                          style={{
                            height:`${Math.max(pct, 4)}%`,
                            background: isLast
                              ? 'linear-gradient(180deg,#E4B520,#C9941A)'
                              : 'linear-gradient(180deg,rgba(200,169,110,0.4),rgba(200,169,110,0.15))',
                            boxShadow: isLast ? '0 4px 16px rgba(200,169,110,0.3)' : 'none',
                          }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all z-10">
                            {sym}{m.amount.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-[9px]" style={{color:'var(--text-faint)'}}>{m.month}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick stats */}
              <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <h2 className="font-semibold mb-5" style={{color:'var(--text)'}}>Overview</h2>
                <div className="space-y-4">
                  {[
                    { label:'Total Bookings',   value:data.totalBookings,    color:'#C8A96E' },
                    { label:'Completed',         value:data.completedBookings, color:'#10b981' },
                    { label:'Success Rate',      value:`${data.totalBookings > 0 ? Math.round((data.completedBookings/data.totalBookings)*100) : 0}%`, color:'#6366f1' },
                    { label:'In Escrow',         value:`${sym}${data.pendingRelease.toLocaleString()}`, color:'#f59e0b' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between py-2 border-b last:border-0" style={{borderColor:'var(--border)'}}>
                      <span className="text-sm" style={{color:'var(--text-muted)'}}>{s.label}</span>
                      <span className="font-display text-base font-bold" style={{color:s.color}}>{s.value}</span>
                    </div>
                  ))}
                </div>
                <Link href="/vendor/bank" className="flex items-center justify-center gap-2 mt-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                  style={{background:'rgba(200,169,110,0.1)', color:'#C8A96E', border:'1px solid rgba(200,169,110,0.2)'}}>
                  🏦 View Payment Account
                </Link>
              </div>
            </div>

            {/* Pending milestones — money waiting */}
            {data.pendingMilestones?.length > 0 && (
              <div className="rounded-2xl overflow-hidden mb-6" style={{border:'1px solid rgba(200,169,110,0.3)', background:'rgba(200,169,110,0.04)'}}>
                <div className="px-6 py-4 flex items-center gap-3 border-b" style={{borderColor:'rgba(200,169,110,0.15)'}}>
                  <span className="text-xl">⏳</span>
                  <div>
                    <h2 className="font-semibold text-sm" style={{color:'var(--text)'}}>Payments Awaiting Release</h2>
                    <p className="text-xs" style={{color:'var(--text-faint)'}}>Request release after your event is complete</p>
                  </div>
                  <div className="ml-auto font-display text-lg font-bold" style={{color:'#C8A96E'}}>
                    {sym}{data.pendingMilestones.reduce((s, m) => s + m.vendorAmount, 0).toLocaleString()}
                  </div>
                </div>
                {data.pendingMilestones.map(m => (
                  <div key={m.id} className="px-6 py-4 flex items-center gap-4 border-b last:border-0 flex-wrap" style={{borderColor:'rgba(200,169,110,0.1)'}}>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{color:'var(--text)'}}>{m.clientName}</div>
                      <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>
                        {m.title} · Event: {new Date(m.eventDate).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                      </div>
                    </div>
                    <div className="font-display text-lg font-bold" style={{color:'#C8A96E'}}>{sym}{m.vendorAmount.toLocaleString()}</div>
                    {m.status === 'PAID' && (
                      <button onClick={() => requestRelease(m.id)} disabled={releasing === m.id}
                        className="text-xs font-bold px-4 py-2 rounded-xl text-white disabled:opacity-50 transition-all active:scale-95"
                        style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                        {releasing === m.id ? '…' : 'Request Release →'}
                      </button>
                    )}
                    {m.status === 'RELEASE_REQUESTED' && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{background:'rgba(245,158,11,0.15)', color:'#f59e0b'}}>
                        ⏳ Awaiting client
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Transaction history */}
            <div className="rounded-2xl overflow-hidden" style={{border:'1px solid var(--border)'}}>
              <div className="px-6 py-4 border-b" style={{borderColor:'var(--border)', background:'var(--bg-subtle)'}}>
                <h2 className="font-semibold text-sm" style={{color:'var(--text)'}}>Transaction History</h2>
              </div>
              {data.payouts?.length === 0 ? (
                <div className="p-12 text-center" style={{background:'var(--bg-card)'}}>
                  <div className="text-4xl mb-3 opacity-20">📋</div>
                  <p className="text-sm" style={{color:'var(--text-faint)'}}>No transactions yet</p>
                </div>
              ) : (
                <div style={{background:'var(--bg-card)'}}>
                  {(data.payouts ?? []).map((p, i) => (
                    <div key={p.id} className="px-6 py-4 flex items-center gap-4 border-b last:border-0 flex-wrap" style={{borderColor:'var(--border)'}}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{background: p.status==='RELEASED' ? 'rgba(16,185,129,0.1)' : 'rgba(200,169,110,0.1)'}}>
                        <span className="text-base">{p.status==='RELEASED' ? '✅' : '🔒'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" style={{color:'var(--text)'}}>{p.clientName}</div>
                        <div className="text-xs mt-0.5 truncate" style={{color:'var(--text-faint)'}}>
                          {p.milestoneName} · {new Date(p.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-display font-bold" style={{color: p.status==='RELEASED' ? '#10b981' : '#C8A96E'}}>
                          +{sym}{p.amount.toLocaleString()}
                        </div>
                        <div className={`text-[10px] font-bold ${p.status==='RELEASED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {p.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}