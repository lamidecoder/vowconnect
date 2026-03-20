'use client'
import { useEffect, useState } from 'react'
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

const COUNTRY_NAMES: Record<string,string> = {
  NG:'🇳🇬 Nigeria', GB:'🇬🇧 United Kingdom', US:'🇺🇸 United States',
  CA:'🇨🇦 Canada', AU:'🇦🇺 Australia', GH:'🇬🇭 Ghana',
}

interface Analytics {
  views:    { d7:number; d30:number; d90:number }
  bookings: { d7:number; d30:number; completed:number }
  favoriteCount:  number
  conversionRate: number
  avgRating:      number|null
  reviewCount:    number
  visitorCountries: { country:string; count:number }[]
  viewsByDay:       { day:string; count:number }[]
}

function StatCard({ label, value, sub, color, icon }: { label:string; value:string|number; sub?:string; color:string; icon:string }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10" style={{background:color}}/>
      <div className="text-2xl mb-3">{icon}</div>
      <div className="font-display text-3xl font-bold" style={{color:'var(--text)'}}>{value}</div>
      <div className="text-xs font-semibold mt-1" style={{color:'var(--text-muted)'}}>{label}</div>
      {sub && <div className="text-[10px] mt-0.5" style={{color:'var(--text-faint)'}}>{sub}</div>}
    </div>
  )
}

function MiniBar({ data }: { data: { day:string; count:number }[] }) {
  if (!data.length) return <div className="h-16 flex items-center justify-center text-xs" style={{color:'var(--text-faint)'}}>No data yet</div>
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 rounded-t-sm transition-all" title={`${d.day}: ${d.count} views`}
          style={{height:`${Math.max((d.count/max)*100, 4)}%`, background:'rgba(200,169,110,0.6)'}}/>
      ))}
    </div>
  )
}

export default function VendorAnalyticsPage() {
  const [data,    setData]    = useState<Analytics|null>(null)
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState<'d7'|'d30'|'d90'>('d30')

  useEffect(() => {
    fetch('/api/analytics', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Analytics</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Track your profile performance</p>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{borderColor:'#C8A96E', borderTopColor:'transparent'}}/>
          </div>
        ) : !data ? (
          <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">📊</div>
            <p className="font-semibold" style={{color:'var(--text-muted)'}}>No analytics data yet</p>
            <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Data will appear once clients start viewing your profile</p>
          </div>
        ) : (
          <>
            {/* Period selector */}
            <div className="flex gap-2 mb-6">
              {([['d7','7 days'],['d30','30 days'],['d90','90 days']] as const).map(([k,l]) => (
                <button key={k} onClick={() => setPeriod(k)}
                  className="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
                  style={{
                    background: period===k ? '#C8A96E' : 'var(--bg-card)',
                    color:      period===k ? '#fff' : 'var(--text-muted)',
                    borderColor: period===k ? '#C8A96E' : 'var(--border)',
                  }}>{l}</button>
              ))}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Profile Views"  value={data.views[period]}    sub={`last ${period.slice(1)} days`} color="#6366f1" icon="👁️"/>
              <StatCard label="New Bookings"   value={data.bookings[period]} sub={`last ${period.slice(1)} days`} color="#C8A96E" icon="📅"/>
              <StatCard label="Saved by"       value={data.favoriteCount}    sub="clients"                        color="#ec4899" icon="❤️"/>
              <StatCard label="Avg Rating"     value={data.avgRating ? `${data.avgRating} ★` : '—'} sub={`${data.reviewCount} reviews`} color="#f59e0b" icon="⭐"/>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Views chart */}
              <div className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <h3 className="font-semibold mb-4" style={{color:'var(--text)'}}>Daily Profile Views</h3>
                <MiniBar data={data.viewsByDay.slice(-30)} />
                <p className="text-xs mt-2" style={{color:'var(--text-faint)'}}>Last 30 days</p>
              </div>

              {/* Countries */}
              <div className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <h3 className="font-semibold mb-4" style={{color:'var(--text)'}}>Visitor Locations</h3>
                {data.visitorCountries.length === 0 ? (
                  <div className="text-sm text-center py-6" style={{color:'var(--text-faint)'}}>No location data yet</div>
                ) : (
                  <div className="space-y-2">
                    {data.visitorCountries.slice(0,6).map(vc => {
                      const pct = Math.round((vc.count / data.views.d30) * 100) || 1
                      return (
                        <div key={vc.country}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span style={{color:'var(--text)'}}>{COUNTRY_NAMES[vc.country] ?? vc.country}</span>
                            <span style={{color:'var(--text-faint)'}}>{vc.count} views</span>
                          </div>
                          <div className="w-full rounded-full h-1.5" style={{background:'var(--bg-subtle)'}}>
                            <div className="h-1.5 rounded-full" style={{width:`${pct}%`, background:'linear-gradient(90deg,#C8A96E,#8B6914)'}}/>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Conversion */}
              <div className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <h3 className="font-semibold mb-2" style={{color:'var(--text)'}}>Conversion Rate</h3>
                <div className="font-display text-5xl font-bold mb-1" style={{color:'#C8A96E'}}>
                  {data.conversionRate.toFixed(1)}%
                </div>
                <p className="text-xs" style={{color:'var(--text-faint)'}}>Views that turned into bookings</p>
              </div>

              {/* Completed bookings */}
              <div className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <h3 className="font-semibold mb-2" style={{color:'var(--text)'}}>Completed Events</h3>
                <div className="font-display text-5xl font-bold mb-1" style={{color:'#10b981'}}>
                  {data.bookings.completed}
                </div>
                <p className="text-xs" style={{color:'var(--text-faint)'}}>Total successful events delivered</p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}