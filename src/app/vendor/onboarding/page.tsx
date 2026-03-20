'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { COUNTRIES } from '@/lib/utils'

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

const STEPS = [
  { n: 1, icon: '🏪', title: 'Business Info',   desc: 'Name, category, bio' },
  { n: 2, icon: '📍', title: 'Location',         desc: 'Country, city, area' },
  { n: 3, icon: '💰', title: 'Pricing',          desc: 'Your rates' },
  { n: 4, icon: '📱', title: 'Contact',          desc: 'WhatsApp & social' },
  { n: 5, icon: '🎉', title: 'Submit',           desc: 'Send for review' },
]

const CITIES: Record<string, string[]> = {
  NG: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City', 'Kano', 'Enugu', 'Calabar', 'Warri', 'Owerri'],
  GB: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Bristol', 'Edinburgh', 'Cardiff', 'Liverpool', 'Sheffield'],
  US: ['Houston', 'Atlanta', 'New York', 'Washington DC', 'Dallas', 'Los Angeles', 'Chicago', 'Philadelphia'],
  CA: ['Toronto', 'Calgary', 'Ottawa', 'Vancouver', 'Edmonton', 'Winnipeg'],
  GH: ['Accra', 'Kumasi', 'Tamale', 'Cape Coast', 'Takoradi'],
}

const CURRENCY_SYMBOLS: Record<string, string> = { NGN: '₦', GBP: '£', USD: '$', CAD: 'CA$', GHS: 'GH₵' }

interface Category { id: string; name: string; emoji: string }

export default function VendorOnboardingPage() {
  const router = useRouter()
  const [step, setStep]           = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [form, setForm] = useState({
    businessName: '', bio: '', categoryId: '',
    country: 'NG', countryName: 'Nigeria', city: '', location: '',
    currency: 'NGN', priceMin: '', priceMax: '',
    whatsapp: '', instagram: '',
  })

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  function set(field: string, value: string) {
    if (field === 'country') {
      const c = COUNTRIES.find(x => x.code === value) ?? COUNTRIES[0]
      setForm(p => ({ ...p, country: c.code, countryName: c.name, currency: c.currency, city: '', location: '' }))
    } else if (field === 'city') {
      const country = COUNTRIES.find(x => x.code === form.country)
      setForm(p => ({ ...p, city: value, location: `${value}, ${country?.name ?? ''}` }))
    } else {
      setForm(p => ({ ...p, [field]: value }))
    }
  }

  function validate(): string {
    if (step === 1) {
      if (!form.businessName.trim()) return 'Enter your business name'
      if (!form.categoryId) return 'Select your category'
    }
    if (step === 2) {
      if (!form.country) return 'Select your country'
      if (!form.city) return 'Select your city'
    }
    if (step === 3) {
      if (!form.priceMin || !form.priceMax) return 'Enter your price range'
      if (+form.priceMin >= +form.priceMax) return 'Maximum must be greater than minimum'
    }
    if (step === 4) {
      if (!form.whatsapp.trim()) return 'WhatsApp number is required'
    }
    return ''
  }

  function next() {
    const err = validate()
    if (err) { setError(err); return }
    setError(''); setStep(s => s + 1)
  }

  async function submit() {
    setLoading(true); setError('')
    const res = await fetch('/api/vendors', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, priceMin: +form.priceMin, priceMax: +form.priceMax }),
    })
    if (!res.ok && res.status !== 409) {
      setError((await res.json()).error ?? 'Something went wrong')
      setLoading(false); return
    }
    if (res.status === 409) {
      const upd = await fetch('/api/vendors/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, priceMin: +form.priceMin, priceMax: +form.priceMax }),
      })
      if (!upd.ok) { setError('Failed to save'); setLoading(false); return }
    }
    setStep(6)
    setTimeout(() => router.push('/vendor/dashboard'), 2500)
  }

  const sym        = CURRENCY_SYMBOLS[form.currency] ?? '₦'
  const cityList   = CITIES[form.country] ?? []
  const isDone     = step === 6

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Onboarding</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Set up your profile</p>
      </div>
      <div className="p-8">
       className="min-h-screen bg-theme-subtle flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-1 mb-8">
        <span className="font-display text-2xl text-theme">Vow</span>
        <span className="font-display text-2xl text-[#C8A96E]">Connect</span>
      </div>

      {/* Steps */}
      {!isDone && step <= 5 && (
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: step > s.n ? 16 : 14, fontWeight: 700,
                  background: step > s.n ? '#C8A96E' : step === s.n ? 'linear-gradient(135deg,#C8A96E,#A87315)' : 'transparent',
                  border: step >= s.n ? 'none' : '2px solid #D4B57A40',
                  color: step >= s.n ? 'white' : '#8A7560',
                  boxShadow: step === s.n ? '0 4px 14px rgba(200,169,110,0.4)' : 'none',
                }}>
                  {step > s.n ? '✓' : s.icon}
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color: step === s.n ? '#C8A96E' : '#8A7560', maxWidth: 52, textAlign: 'center', lineHeight: 1.3 }}>
                  {s.title}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 36, height: 2, background: step > s.n ? '#C8A96E' : '#D4B57A30', margin: '0 3px', marginBottom: 20 }} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-md">
        {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm mb-4">{error}</div>}

        {/* STEP 1 — Business Info */}
        {step === 1 && (
          <div className="card p-7 animate-fade-up">
            <h2 className="font-display text-2xl text-theme mb-1">Tell us about your business</h2>
            <p className="text-theme-muted text-sm mb-6">This is what brides will see on your profile</p>
            <div className="space-y-4">
              <div>
                <label className="label">Business Name *</label>
                <input className="input" placeholder="e.g. Lagos Gele Queen" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
              </div>
              <div>
                <label className="label">Your Category *</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {categories.map(c => (
                    <button key={c.id} type="button" onClick={() => set('categoryId', c.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${form.categoryId === c.id ? 'border-[#C8A96E] bg-[#FDFAF4] dark:bg-[#1A130A]' : 'border-[var(--border)] bg-theme-card hover:border-[#C8A96E]/40'}`}>
                      <span className="text-lg">{c.emoji}</span>
                      <div className="text-xs font-semibold text-theme mt-1">{c.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Bio / Description</label>
                <textarea className="input resize-none" rows={3} placeholder="Tell brides what makes you special..."
                  value={form.bio} onChange={e => set('bio', e.target.value)} maxLength={500} />
                <p className="text-xs text-theme-faint mt-1">{form.bio.length}/500</p>
              </div>
            </div>
            <button onClick={next} className="btn-sand w-full justify-center mt-6 py-3.5 rounded-xl">Continue →</button>
          </div>
        )}

        {/* STEP 2 — Location */}
        {step === 2 && (
          <div className="card p-7 animate-fade-up">
            <h2 className="font-display text-2xl text-theme mb-1">Where are you based?</h2>
            <p className="text-theme-muted text-sm mb-6">Brides search by country and city</p>
            <div className="space-y-4">
              <div>
                <label className="label">Country *</label>
                <div className="grid grid-cols-1 gap-2">
                  {COUNTRIES.map(c => (
                    <button key={c.code} type="button" onClick={() => set('country', c.code)}
                      className={`p-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${form.country === c.code ? 'border-[#C8A96E] bg-[#FDFAF4] dark:bg-[#1A130A]' : 'border-[var(--border)] bg-theme-card hover:border-[#C8A96E]/40'}`}>
                      <span className="text-xl">{c.flag}</span>
                      <div>
                        <div className="font-semibold text-theme text-sm">{c.name}</div>
                        <div className="text-theme-faint text-xs">{c.currency}</div>
                      </div>
                      {form.country === c.code && <span className="ml-auto text-[#C8A96E] text-lg">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">City *</label>
                <select className="input" value={form.city} onChange={e => set('city', e.target.value)}>
                  <option value="">Select your city</option>
                  {cityList.map(c => <option key={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              {form.city && (
                <div>
                  <label className="label">Specific Area / Neighbourhood</label>
                  <input className="input" placeholder={`e.g. ${form.country === 'NG' ? 'Lekki Phase 1' : form.country === 'GB' ? 'Peckham' : 'Galleria'}`}
                    value={form.location} onChange={e => set('location', e.target.value)} />
                  <p className="text-xs text-theme-faint mt-1">Shown on your public profile — be specific</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setStep(1); setError('') }} className="btn-ghost flex-1 justify-center py-3 rounded-xl">← Back</button>
              <button onClick={next} className="btn-sand flex-1 justify-center py-3 rounded-xl">Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — Pricing */}
        {step === 3 && (
          <div className="card p-7 animate-fade-up">
            <h2 className="font-display text-2xl text-theme mb-1">Your pricing</h2>
            <p className="text-theme-muted text-sm mb-6">Set your price range so brides can find you</p>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F5ECD8] dark:bg-[#1A130A] border border-[#E3CC99] dark:border-[#2A1F0A]">
                <span className="text-xl">{COUNTRIES.find(c => c.code === form.country)?.flag}</span>
                <div>
                  <div className="text-xs font-bold text-[#8A6A2E] dark:text-[#C8A96E]">Pricing in {form.currency}</div>
                  <div className="text-[10px] text-[#8A6A2E]/60 dark:text-[#C8A96E]/50">Brides in {COUNTRIES.find(c => c.code === form.country)?.name} will see prices in {form.currency}</div>
                </div>
                <select className="ml-auto text-xs px-2 py-1 rounded-lg border border-[#E3CC99] dark:border-[#2A1F0A] bg-transparent text-[#8A6A2E] dark:text-[#C8A96E]"
                  value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {COUNTRIES.map(c => <option key={c.currency} value={c.currency}>{c.flag} {c.currency}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Min ({sym}) *</label>
                  <input className="input" type="number" placeholder="e.g. 20000" min="0"
                    value={form.priceMin} onChange={e => set('priceMin', e.target.value)} />
                </div>
                <div>
                  <label className="label">Max ({sym}) *</label>
                  <input className="input" type="number" placeholder="e.g. 80000" min="0"
                    value={form.priceMax} onChange={e => set('priceMax', e.target.value)} />
                </div>
              </div>
              {form.priceMin && form.priceMax && +form.priceMin < +form.priceMax && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm">
                  ✓ {sym}{(+form.priceMin).toLocaleString()} – {sym}{(+form.priceMax).toLocaleString()}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setStep(2); setError('') }} className="btn-ghost flex-1 justify-center py-3 rounded-xl">← Back</button>
              <button onClick={next} className="btn-sand flex-1 justify-center py-3 rounded-xl">Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 4 — Contact */}
        {step === 4 && (
          <div className="card p-7 animate-fade-up">
            <h2 className="font-display text-2xl text-theme mb-1">Contact & Social</h2>
            <p className="text-theme-muted text-sm mb-6">How brides will reach you after booking</p>
            <div className="space-y-4">
              <div>
                <label className="label">WhatsApp Number *</label>
                <input className="input" type="tel"
                  placeholder={form.country === 'NG' ? '08012345678 or +2348012345678' : '+447911123456'}
                  value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
                <p className="text-xs text-theme-faint mt-1">📱 Clients contact you directly. International format preferred.</p>
              </div>
              <div>
                <label className="label">Instagram Handle (optional)</label>
                <input className="input" placeholder="@yourbusiness" value={form.instagram} onChange={e => set('instagram', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setStep(3); setError('') }} className="btn-ghost flex-1 justify-center py-3 rounded-xl">← Back</button>
              <button onClick={next} className="btn-sand flex-1 justify-center py-3 rounded-xl">Review →</button>
            </div>
          </div>
        )}

        {/* STEP 5 — Review */}
        {step === 5 && (
          <div className="card p-7 animate-fade-up">
            <h2 className="font-display text-2xl text-theme mb-1">Review & Submit</h2>
            <p className="text-theme-muted text-sm mb-6">Profile goes live after a quick review (usually 24h)</p>
            <div className="space-y-2 mb-6">
              {[
                { label: 'Business',  value: form.businessName },
                { label: 'Category',  value: categories.find(c => c.id === form.categoryId)?.name ?? '' },
                { label: 'Country',   value: `${COUNTRIES.find(c => c.code === form.country)?.flag} ${form.countryName}` },
                { label: 'City',      value: form.city },
                { label: 'Location',  value: form.location },
                { label: 'Prices',    value: `${sym}${(+form.priceMin).toLocaleString()} – ${sym}${(+form.priceMax).toLocaleString()}` },
                { label: 'WhatsApp',  value: form.whatsapp },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                  <span className="text-theme-muted text-sm">{item.label}</span>
                  <span className="font-medium text-theme text-sm">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-sm mb-5">
              ⏳ You&apos;ll get an email when approved. Most approvals happen within 24 hours.
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep(4); setError('') }} className="btn-ghost flex-1 justify-center py-3 rounded-xl">← Edit</button>
              <button onClick={submit} disabled={loading} className="btn-sand flex-1 justify-center py-3 rounded-xl disabled:opacity-60">
                {loading ? 'Submitting...' : '🚀 Submit'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6 — Done */}
        {step === 6 && (
          <div className="card p-10 text-center animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-[#F5ECD8] dark:bg-[#1A130A] flex items-center justify-center text-4xl mx-auto mb-5">🎉</div>
            <h2 className="font-display text-3xl text-theme mb-2">You&apos;re submitted!</h2>
            <p className="text-theme-muted mb-3">Our team will review your profile within 24 hours.</p>
            <p className="text-theme-faint text-sm">Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
      </div>
    </DashboardShell>
  )
}
