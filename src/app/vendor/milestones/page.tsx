'use client'
import { useState, useEffect } from 'react'
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
  { href:'/vendor/bank',         label:'Payments',     icon:'🏦' },
]

const PRESETS = [
  {
    label: 'Simple (2 milestones)',
    icon: '⚡',
    desc: 'Best for gele, makeup, photography',
    milestones: [
      { title:'Booking Deposit', description:'Confirm your date', percentage:30 },
      { title:'Final Payment',   description:'On event day',       percentage:70 },
    ],
  },
  {
    label: 'Standard (3 milestones)',
    icon: '⭐',
    desc: 'Best for decoration, catering',
    milestones: [
      { title:'Initial Deposit',  description:'Secure your booking', percentage:30 },
      { title:'Materials/Setup',  description:'Purchase materials',   percentage:40 },
      { title:'Completion',       description:'After event',          percentage:30 },
    ],
  },
  {
    label: 'Project (4 milestones)',
    icon: '🎬',
    desc: 'Best for videography, fashion design',
    milestones: [
      { title:'Booking Deposit',  description:'Confirm booking',        percentage:25 },
      { title:'Pre-Production',   description:'Planning & preparation', percentage:25 },
      { title:'Event Day',        description:'Day of event',           percentage:25 },
      { title:'Final Delivery',   description:'Edited content/product', percentage:25 },
    ],
  },
]

interface Milestone { title:string; description:string; percentage:number }

export default function VendorMilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title:'Booking Deposit', description:'Confirm your date', percentage:30 },
    { title:'Final Payment',   description:'On event day',      percentage:70 },
  ])
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [currency, setCurrency] = useState('NGN')

  const SYM: Record<string,string> = { NGN:'₦', GBP:'£', USD:'$', CAD:'CA$', GHS:'GH₵' }

  useEffect(() => {
    fetch('/api/vendors/me', { credentials:'include' })
      .then(r => r.json())
      .then(d => { if (d.currency) setCurrency(d.currency) })
    fetch('/api/bookings?role=vendor&status=ACCEPTED', { credentials:'include' })
      .then(r => r.json())
      .then(d => setBookings(Array.isArray(d) ? d.slice(0,5) : []))
  }, [])

  const total = milestones.reduce((s, m) => s + m.percentage, 0)
  const sym   = SYM[currency] ?? '₦'

  function applyPreset(preset: typeof PRESETS[0]) {
    setMilestones([...preset.milestones])
  }

  function updateMilestone(i: number, field: keyof Milestone, value: string | number) {
    setMilestones(p => p.map((m, j) => j === i ? { ...m, [field]: value } : m))
  }

  function addMilestone() {
    const remaining = 100 - total
    if (remaining <= 0 || milestones.length >= 5) return
    setMilestones(p => [...p, { title:`Milestone ${p.length + 1}`, description:'', percentage: Math.min(remaining, 25) }])
  }

  function removeMilestone(i: number) {
    if (milestones.length <= 1) return
    setMilestones(p => p.filter((_, j) => j !== i))
  }

  async function save() {
    if (total !== 100) return
    setSaving(true)
    await fetch('/api/vendor/milestones', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ milestones }),
    })
    setSaved(true); setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const isValid = total === 100 && milestones.every(m => m.title)

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Payment Milestones</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Set how clients pay you — in stages that protect everyone</p>
      </div>

      <div className="p-8 max-w-3xl">

        {saved && (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)'}}>
            <span className="text-xl">✅</span>
            <p className="font-semibold text-sm" style={{color:'#10b981'}}>Milestone structure saved! New bookings will use this structure.</p>
          </div>
        )}

        {/* Quick presets */}
        <div className="mb-8">
          <h2 className="font-semibold text-sm mb-3" style={{color:'var(--text)'}}>Quick Presets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p)}
                className="p-4 rounded-2xl text-left border transition-all hover:opacity-80 active:scale-95"
                style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
                <div className="text-2xl mb-2">{p.icon}</div>
                <div className="text-sm font-bold" style={{color:'var(--text)'}}>{p.label}</div>
                <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>{p.desc}</div>
                <div className="flex gap-1 mt-2">
                  {p.milestones.map((m, i) => (
                    <div key={i} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{background:'rgba(200,169,110,0.15)', color:'#C8A96E'}}>
                      {m.percentage}%
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Milestone builder */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm" style={{color:'var(--text)'}}>Your Milestones</h2>
            <div className="flex items-center gap-2">
              <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${total === 100 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {total}% of 100%
              </div>
            </div>
          </div>

          {/* Visual percentage bar */}
          <div className="flex gap-1 h-4 rounded-full overflow-hidden mb-5" style={{background:'var(--bg-subtle)'}}>
            {milestones.map((m, i) => {
              const colors = ['#C8A96E','#10b981','#6366f1','#f59e0b','#ec4899']
              return (
                <div key={i} className="rounded-full transition-all duration-300 flex items-center justify-center"
                  style={{width:`${m.percentage}%`, background:colors[i % colors.length], minWidth: m.percentage > 5 ? 0 : '2%'}}>
                  {m.percentage > 10 && <span className="text-[9px] font-bold text-white">{m.percentage}%</span>}
                </div>
              )
            })}
            {total < 100 && (
              <div className="flex-1 rounded-full" style={{background:'var(--bg-subtle)', border:'2px dashed var(--border)'}}/>
            )}
          </div>

          {/* Milestone list */}
          <div className="space-y-3">
            {milestones.map((m, i) => {
              const colors = ['#C8A96E','#10b981','#6366f1','#f59e0b','#ec4899']
              const exampleAmount = 100000
              const amount = Math.round(exampleAmount * (m.percentage / 100))

              return (
                <div key={i} className="rounded-2xl p-5"
                  style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{background:colors[i % colors.length]}}>
                      {i+1}
                    </div>
                    <div className="flex-1 font-semibold text-sm" style={{color:'var(--text)'}}>Milestone {i+1}</div>
                    <div className="text-xs font-bold px-2 py-1 rounded-lg" style={{background:`${colors[i % colors.length]}15`, color:colors[i % colors.length]}}>
                      {sym}{amount.toLocaleString()} on {sym}100k booking
                    </div>
                    {milestones.length > 1 && (
                      <button onClick={() => removeMilestone(i)} className="text-xs px-2 py-1 rounded-lg ml-1" style={{color:'#f87171', background:'rgba(239,68,68,0.08)'}}>✕</button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{color:'var(--text-faint)'}}>Title *</label>
                      <input value={m.title}
                        onChange={e => updateMilestone(i, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}
                        placeholder="e.g. Booking Deposit"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{color:'var(--text-faint)'}}>Percentage *</label>
                      <div className="relative">
                        <input type="number" value={m.percentage} min={5} max={90}
                          onChange={e => updateMilestone(i, 'percentage', Math.min(90, Math.max(5, Number(e.target.value))))}
                          className="w-full px-3 py-2 rounded-xl text-sm outline-none pr-8"
                          style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{color:'var(--text-faint)'}}>%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{color:'var(--text-faint)'}}>Description (shown to client)</label>
                    <input value={m.description}
                      onChange={e => updateMilestone(i, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}
                      placeholder="e.g. Secures your date and covers initial planning"/>
                  </div>
                </div>
              )
            })}
          </div>

          {milestones.length < 5 && (
            <button onClick={addMilestone} disabled={total >= 100}
              className="w-full mt-3 py-3 rounded-xl text-sm font-semibold border-2 border-dashed transition-all disabled:opacity-30"
              style={{borderColor:'var(--border)', color:'var(--text-muted)'}}>
              + Add another milestone
            </button>
          )}
        </div>

        {total !== 100 && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{background:'rgba(245,158,11,0.1)', color:'#f59e0b', border:'1px solid rgba(245,158,11,0.2)'}}>
            ⚠ Percentages must add up to exactly 100%. Currently: {total}%
          </div>
        )}

        <button onClick={save} disabled={saving || !isValid}
          className="w-full py-4 rounded-xl font-bold text-white text-sm disabled:opacity-40 transition-all active:scale-95"
          style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)', boxShadow:'0 4px 20px rgba(200,169,110,0.25)'}}>
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'white',borderTopColor:'transparent'}}/>
              Saving…
            </span>
          ) : '✓ Save Milestone Structure'}
        </button>

        <p className="text-center text-xs mt-3" style={{color:'var(--text-faint)'}}>
          This structure will apply to all new bookings. Existing bookings are unaffected.
        </p>
      </div>
    </DashboardShell>
  )
}