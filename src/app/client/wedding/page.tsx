'use client'
import { useState, useEffect, Suspense } from 'react'
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

const CURRENCY_SYMBOLS: Record<string,string> = { NGN:'₦', GBP:'£', USD:'$', CAD:'CA$', GHS:'GH₵', EUR:'€', AUD:'A$' }
function fmt(n:number, c:string) { return `${CURRENCY_SYMBOLS[c]??''}${n.toLocaleString()}` }
function daysUntil(d: string|Date) { return Math.ceil((new Date(d).getTime()-Date.now())/(1000*60*60*24)) }

function WeddingHubInner() {
  const [profile,   setProfile]   = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [form,      setForm]      = useState({ partnerName:'', weddingDate:'', venue:'', city:'', country:'NG', totalBudget:'', currency:'NGN', guestCount:'' })
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    fetch('/api/wedding/profile', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setProfile(d); if (!d) setShowSetup(true); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function saveProfile() {
    setSaving(true)
    const res = await fetch('/api/wedding/profile', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setProfile(data); setShowSetup(false); setSaving(false)
    if (form.weddingDate) {
      await fetch('/api/wedding/timeline', {
        method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
        body: JSON.stringify({ seedDefaults:true }),
      })
    }
  }

  if (loading) return (
    <DashboardShell role="client" userName="Client" navItems={NAV}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
      </div>
    </DashboardShell>
  )

  if (showSetup || !profile) return (
    <DashboardShell role="client" userName="Client" navItems={NAV}>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💍</div>
            <h1 className="font-display text-4xl mb-2" style={{color:'var(--text)'}}>Set Up Your Wedding Hub</h1>
            <p className="text-sm" style={{color:'var(--text-muted)'}}>Let's get your big day organised</p>
          </div>
          <div className="rounded-2xl p-8 space-y-4" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            {[
              { label:"Partner's Name", key:'partnerName', type:'text', placeholder:'e.g. Amara' },
              { label:'Wedding Date',   key:'weddingDate', type:'date', placeholder:'' },
              { label:'Venue Name',     key:'venue',       type:'text', placeholder:'e.g. Eko Hotel' },
              { label:'City',           key:'city',        type:'text', placeholder:'e.g. Lagos' },
              { label:'Guest Count',    key:'guestCount',  type:'number', placeholder:'e.g. 200' },
              { label:'Total Budget',   key:'totalBudget', type:'number', placeholder:'e.g. 2000000' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold uppercase tracking-widest block mb-1.5" style={{color:'var(--text-faint)'}}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest block mb-1.5" style={{color:'var(--text-faint)'}}>Country</label>
                <select value={form.country} onChange={e => setForm(p => ({...p, country:e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}>
                  {[['NG','Nigeria'],['GB','UK'],['US','USA'],['GH','Ghana'],['CA','Canada'],['AU','Australia']].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest block mb-1.5" style={{color:'var(--text-faint)'}}>Currency</label>
                <select value={form.currency} onChange={e => setForm(p => ({...p, currency:e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}>
                  {Object.keys(CURRENCY_SYMBOLS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-white mt-2 disabled:opacity-50"
              style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
              {saving ? 'Saving…' : '💍 Create My Wedding Hub'}
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  )

  const days = profile.weddingDate ? daysUntil(profile.weddingDate) : null

  return (
    <DashboardShell role="client" userName="Client" navItems={NAV}>
      {/* Hero */}
      <div className="relative overflow-hidden px-8 py-10 border-b" style={{borderColor:'var(--border)'}}>
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 70% 50%, rgba(200,169,110,0.08), transparent 60%)'}}/>
        <div className="relative">
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#C8A96E'}}>Wedding Hub</div>
          <h1 className="font-display text-4xl mb-1" style={{color:'var(--text)'}}>
            {profile.partnerName ? `You & ${profile.partnerName}` : 'Your Wedding'}
          </h1>
          {profile.weddingDate && (
            <p className="text-sm" style={{color:'var(--text-muted)'}}>
              {new Date(profile.weddingDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
              {profile.venue ? ` · ${profile.venue}` : ''}
              {profile.city ? `, ${profile.city}` : ''}
            </p>
          )}
          {days !== null && days > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.3)'}}>
              <span className="font-display text-2xl font-bold" style={{color:'#C8A96E'}}>{days}</span>
              <span className="text-sm" style={{color:'var(--text-muted)'}}>days to go 🎊</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Budget',   value: profile.totalBudget ? fmt(profile.totalBudget, profile.currency??'NGN') : '—', icon:'💰' },
            { label:'Guests',   value: profile.guestCount ?? '—', icon:'👥' },
            { label:'Venue',    value: profile.venue ?? 'TBD', icon:'🏛️' },
            { label:'City',     value: profile.city ?? 'TBD', icon:'📍' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-semibold text-sm truncate" style={{color:'var(--text)'}}>{s.value}</div>
              <div className="text-xs" style={{color:'var(--text-faint)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Planning tools */}
        <h2 className="font-semibold mb-4" style={{color:'var(--text)'}}>Planning Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { href:'/client/wedding/budget',   icon:'💰', label:'Budget Tracker',  desc:'Track every spend'       },
            { href:'/client/wedding/timeline', icon:'📋', label:'Timeline',        desc:'Milestones & tasks'      },
            { href:'/client/wedding/guests',   icon:'👥', label:'Guest List',      desc:'RSVPs & seating'         },
            { href:'/client/wedding/moodboard',icon:'🖼️', label:'Mood Board',      desc:'Inspiration & vision'    },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="rounded-2xl p-5 hover:opacity-80 transition-all"
              style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="text-3xl mb-3">{l.icon}</div>
              <div className="font-semibold text-sm" style={{color:'var(--text)'}}>{l.label}</div>
              <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>{l.desc}</div>
            </Link>
          ))}
        </div>

        {/* Find vendors */}
        <div className="rounded-2xl p-6 flex items-center justify-between gap-4 overflow-hidden relative"
          style={{background:'linear-gradient(135deg,#1a1208,#2d1f06)'}}>
          <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 80% 50%, #C8A96E, transparent 60%)'}}/>
          <div className="relative">
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Ready to book?</div>
            <p className="font-display text-xl text-white">Find your perfect wedding vendors</p>
            <p className="text-sm mt-1" style={{color:'rgba(255,255,255,0.4)'}}>Gele, makeup, photography, catering & more</p>
          </div>
          <Link href="/vendors"
            className="relative flex-shrink-0 px-5 py-3 rounded-xl font-bold text-white text-sm"
            style={{background:'#C8A96E'}}>
            Browse Vendors →
          </Link>
        </div>
      </div>
    </DashboardShell>
  )
}

export default function WeddingHubPage() {
  return <Suspense><WeddingHubInner /></Suspense>
}