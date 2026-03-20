'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'

const NAV = [
  { href:'/vendor/dashboard',    label:'Dashboard',    icon:'ðŸ ' },
  { href:'/vendor/bookings',     label:'Bookings',     icon:'ðŸ“…' },
  { href:'/vendor/messages',     label:'Messages',     icon:'ðŸ’¬' },
  { href:'/vendor/quotes',       label:'Quotes',       icon:'ðŸ“„' },
  { href:'/vendor/profile',      label:'Profile',      icon:'âœï¸' },
  { href:'/vendor/portfolio',    label:'Portfolio',    icon:'ðŸ–¼ï¸' },
  { href:'/vendor/packages',     label:'Packages',     icon:'ðŸ“¦' },
  { href:'/vendor/availability', label:'Availability', icon:'ðŸ—“ï¸' },
  { href:'/vendor/crm',          label:'Client CRM',   icon:'ðŸ‘¥' },
  { href:'/vendor/analytics',    label:'Analytics',    icon:'ðŸ“Š' },
  { href:'/vendor/pricing',      label:'Pricing',      icon:'ðŸ’°' },
]

const CURRENCIES: Record<string,{symbol:string;pro:number;premium:number;flag:string}> = {
  NGN: { symbol:'â‚¦',   pro:8000,  premium:20000, flag:'ðŸ‡³ðŸ‡¬' },
  GBP: { symbol:'Â£',   pro:8,     premium:20,    flag:'ðŸ‡¬ðŸ‡§' },
  USD: { symbol:'$',   pro:10,    premium:25,    flag:'ðŸ‡ºðŸ‡¸' },
  EUR: { symbol:'â‚¬',   pro:9,     premium:22,    flag:'ðŸ‡ªðŸ‡º' },
  CAD: { symbol:'CA$', pro:13,    premium:33,    flag:'ðŸ‡¨ðŸ‡¦' },
  AUD: { symbol:'A$',  pro:15,    premium:38,    flag:'ðŸ‡¦ðŸ‡º' },
  GHS: { symbol:'GHâ‚µ', pro:100,   premium:250,   flag:'ðŸ‡¬ðŸ‡­' },
  KES: { symbol:'KSh', pro:1300,  premium:3300,  flag:'ðŸ‡°ðŸ‡ª' },
  ZAR: { symbol:'R',   pro:180,   premium:460,   flag:'ðŸ‡¿ðŸ‡¦' },
}

function fmt(amount: number, symbol: string) {
  return `${symbol}${amount.toLocaleString()}`
}

function PricingInner() {
  const searchParams = useSearchParams()
  const [currency, setCurrency] = useState('NGN')
  const [current,  setCurrent]  = useState<'free'|'pro'|'premium'>('free')

  useEffect(() => {
    const c = searchParams.get('currency') ?? localStorage.getItem('vc_currency') ?? 'NGN'
    if (c in CURRENCIES) setCurrency(c)
  }, [searchParams])

  const c = CURRENCIES[currency]

  const plans = [
    {
      id: 'free', name: 'Free', price: 0, period: '',
      gradient: 'from-zinc-800 to-zinc-900',
      accent: '#9ca3af',
      features: [
        { text:'5 portfolio images',       ok:true  },
        { text:'Basic listing',            ok:true  },
        { text:'Receive booking requests', ok:true  },
        { text:'In-app messaging',         ok:true  },
        { text:'Featured in search',       ok:false },
        { text:'Profile analytics',        ok:false },
        { text:'âœ“ Verified badge',         ok:false },
        { text:'Priority support',         ok:false },
      ],
    },
    {
      id: 'pro', name: 'Pro', price: c.pro, period:'/mo',
      gradient: 'from-amber-900 to-yellow-900',
      accent: '#C8A96E',
      popular: true,
      features: [
        { text:'20 portfolio items',       ok:true },
        { text:'Worldwide listing',        ok:true },
        { text:'Receive booking requests', ok:true },
        { text:'In-app messaging',         ok:true },
        { text:'â­ Featured in search',    ok:true },
        { text:'Profile analytics',        ok:true },
        { text:'âœ“ Verified badge',         ok:false },
        { text:'Priority support',         ok:false },
      ],
    },
    {
      id: 'premium', name: 'Premium', price: c.premium, period:'/mo',
      gradient: 'from-purple-900 to-indigo-900',
      accent: '#a78bfa',
      features: [
        { text:'Unlimited portfolio',      ok:true },
        { text:'Diaspora listing boost',   ok:true },
        { text:'Priority booking queue',   ok:true },
        { text:'In-app messaging',         ok:true },
        { text:'ðŸ”¥ Top of search results', ok:true },
        { text:'Advanced analytics',       ok:true },
        { text:'âœ“ Verified badge',         ok:true },
        { text:'Priority support',         ok:true },
      ],
    },
  ]

  return (
    <DashboardShell role="vendor" userName="Vendor" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Pricing Plans</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Grow your business with the right plan</p>
      </div>

      <div className="p-8">
        {/* Currency selector */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <span className="text-sm font-semibold" style={{color:'var(--text-muted)'}}>Show prices in:</span>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(CURRENCIES).map(([code, data]) => (
              <button key={code} onClick={() => { setCurrency(code); localStorage.setItem('vc_currency', code) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border"
                style={{
                  background: currency===code ? '#C8A96E' : 'var(--bg-card)',
                  color:      currency===code ? '#fff' : 'var(--text-muted)',
                  borderColor: currency===code ? '#C8A96E' : 'var(--border)',
                }}>
                {data.flag} {code}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id}
              className={`relative rounded-2xl overflow-hidden ${current===plan.id ? 'ring-2' : ''}`}
              style={{
                background: `linear-gradient(135deg, var(--bg-card), var(--bg-subtle))`,
                border: `1px solid ${plan.accent}40`,
                }}>
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold"
                  style={{background:'#C8A96E', color:'#fff'}}>
                  â­ MOST POPULAR
                </div>
              )}
              <div className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:plan.accent}}>{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-4xl font-bold" style={{color:'var(--text)'}}>
                    {plan.price === 0 ? 'Free' : fmt(plan.price, c.symbol)}
                  </span>
                  {plan.period && <span className="text-sm" style={{color:'var(--text-muted)'}}>{plan.period}</span>}
                </div>
                <p className="text-xs mb-6" style={{color:'var(--text-faint)'}}>
                  {plan.id==='free' ? 'Always free, no card needed' : `Billed monthly in ${currency}`}
                </p>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f.text} className="flex items-center gap-2.5 text-sm">
                      <span className={`text-base flex-shrink-0 ${f.ok ? '' : 'opacity-25'}`}>
                        {f.ok ? 'âœ“' : 'âœ—'}
                      </span>
                      <span style={{color: f.ok ? 'var(--text)' : 'var(--text-faint)'}}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setCurrent(plan.id as any)}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: current===plan.id ? plan.accent : `${plan.accent}20`,
                    color: current===plan.id ? '#fff' : plan.accent,
                    border: `1px solid ${plan.accent}40`,
                  }}>
                  {current === plan.id ? 'âœ“ Current Plan' : plan.id==='free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-center mt-6" style={{color:'var(--text-faint)'}}>
          Nigerian vendors pay via Paystack Â· International vendors via Stripe Â· Cancel anytime
        </p>
      </div>
    </DashboardShell>
  )
}

export default function VendorPricingPage() {
  return <Suspense><PricingInner /></Suspense>
}
