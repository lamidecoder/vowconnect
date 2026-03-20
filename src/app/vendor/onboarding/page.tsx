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
  { n:1, icon:'🏪', title:'Business Info',  desc:'Name, category, bio' },
  { n:2, icon:'📍', title:'Location',       desc:'Country, city, area' },
  { n:3, icon:'💰', title:'Pricing',        desc:'Your rates' },
  { n:4, icon:'📱', title:'Contact',        desc:'WhatsApp & social' },
  { n:5, icon:'🎉', title:'Submit',         desc:'Send for review' },
]

const CITIES: Record<string,string[]> = {
  NG:['Lagos','Abuja','Port Harcourt','Ibadan','Benin City','Kano','Enugu','Calabar'],
  GB:['London','Birmingham','Manchester','Leeds','Bristol','Edinburgh','Cardiff'],
  US:['Houston','Atlanta','New York','Washington DC','Dallas','Los Angeles','Chicago'],
  CA:['Toronto','Calgary','Ottawa','Vancouver','Edmonton','Winnipeg'],
  GH:['Accra','Kumasi','Tamale','Cape Coast','Takoradi'],
}

const CURR: Record<string,string> = { NGN:'₦', GBP:'£', USD:'$', CAD:'CA$', GHS:'GH₵' }

interface Category { id:string; name:string; emoji:string }

export default function VendorOnboardingPage() {
  const router = useRouter()
  const [step, setStep]           = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]     = useState(false)
  const [form, setForm] = useState({
    businessName:'', bio:'', categoryId:'',
    country:'NG', countryName:'Nigeria', city:'', location:'',
    currency:'NGN', priceMin:'', priceMax:'',
    whatsapp:'', instagram:'', website:'',
  })

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) {
    const { name, value } = e.target
    if (name === 'country') {
      const c = COUNTRIES.find(x => x.code===value) ?? COUNTRIES[0]
      setForm(p => ({ ...p, country:c.code, countryName:c.name, currency:c.currency, city:'', location:'' }))
    } else if (name === 'city') {
      const country = COUNTRIES.find(x => x.code===form.country)
      setForm(p => ({ ...p, city:value, location:`${value}, ${country?.name??''}` }))
    } else {
      setForm(p => ({ ...p, [name]:value }))
    }
  }

  async function submit() {
    setLoading(true)
    const payload = { ...form, priceMin:form.priceMin?+form.priceMin:undefined, priceMax:form.priceMax?+form.priceMax:undefined }
    const res = await fetch('/api/vendors', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
    if (res.ok || res.status===409) {
      if (res.status===409) {
        await fetch('/api/vendors/me', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      }
      router.push('/vendor/dashboard')
    }
    setLoading(false)
  }

  const sym = CURR[form.currency] ?? '₦'
  const cities = CITIES[form.country] ?? []
  const inputStyle = { background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:12, padding:'10px 14px', width:'100%', fontSize:14, outline:'none' } as React.CSSProperties
  const labelStyle = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.1em', color:'var(--text-faint)', marginBottom:6 }

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Onboarding</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Set up your vendor profile · step {step} of {STEPS.length}</p>
      </div>

      <div className="p-8" style={{maxWidth:640}}>
        {/* Step indicators */}
        <div className="flex gap-2 mb-8">
          {STEPS.map(s => (
            <div key={s.n} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: step>=s.n ? '#C8A96E' : 'var(--bg-subtle)',
                  color: step>=s.n ? '#fff' : 'var(--text-faint)',
                  border: `2px solid ${step>=s.n ? '#C8A96E' : 'var(--border)'}`,
                }}>
                {step>s.n ? '✓' : s.n}
              </div>
              <div className="text-[9px] font-semibold text-center hidden sm:block" style={{color:step===s.n?'#C8A96E':'var(--text-faint)'}}>{s.title}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
          {/* Step 1 - Business Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl mb-4" style={{color:'var(--text)'}}>🏪 Business Info</h2>
              <div>
                <label style={labelStyle}>Business Name *</label>
                <input style={inputStyle} name="businessName" placeholder="e.g. Lagos Gele Queen" value={form.businessName} onChange={handleChange} required/>
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <select style={inputStyle} name="categoryId" value={form.categoryId} onChange={handleChange} required>
                  <option value="">Select your category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Bio / Description</label>
                <textarea style={{...inputStyle, resize:'none'}} name="bio" rows={4}
                  placeholder="Tell brides about your experience and style..."
                  value={form.bio} onChange={handleChange} maxLength={500}/>
                <div className="text-xs mt-1" style={{color:'var(--text-faint)'}}>{form.bio.length}/500</div>
              </div>
            </div>
          )}

          {/* Step 2 - Location */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl mb-4" style={{color:'var(--text)'}}>📍 Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Country *</label>
                  <select style={inputStyle} name="country" value={form.country} onChange={handleChange}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>City *</label>
                  <select style={inputStyle} name="city" value={form.city} onChange={handleChange}>
                    <option value="">Select city</option>
                    {cities.map(c => <option key={c}>{c}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Full Location *</label>
                <input style={inputStyle} name="location" placeholder="e.g. Lekki, Lagos" value={form.location} onChange={handleChange}/>
              </div>
            </div>
          )}

          {/* Step 3 - Pricing */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl mb-4" style={{color:'var(--text)'}}>💰 Pricing</h2>
              <div>
                <label style={labelStyle}>Currency</label>
                <select style={inputStyle} name="currency" value={form.currency} onChange={handleChange}>
                  {COUNTRIES.map(c => <option key={c.currency} value={c.currency}>{c.flag} {c.currency}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Min Price ({sym}) *</label>
                  <input style={inputStyle} name="priceMin" type="number" placeholder="e.g. 20000" value={form.priceMin} onChange={handleChange}/>
                </div>
                <div>
                  <label style={labelStyle}>Max Price ({sym}) *</label>
                  <input style={inputStyle} name="priceMax" type="number" placeholder="e.g. 80000" value={form.priceMax} onChange={handleChange}/>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 - Contact */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl mb-4" style={{color:'var(--text)'}}>📱 Contact & Social</h2>
              <div>
                <label style={labelStyle}>WhatsApp Number * (with country code)</label>
                <input style={inputStyle} name="whatsapp" type="tel" placeholder="+2348012345678" value={form.whatsapp} onChange={handleChange}/>
              </div>
              <div>
                <label style={labelStyle}>Instagram (optional)</label>
                <input style={inputStyle} name="instagram" placeholder="@yourbusiness" value={form.instagram} onChange={handleChange}/>
              </div>
              <div>
                <label style={labelStyle}>Website (optional)</label>
                <input style={inputStyle} name="website" type="url" placeholder="https://..." value={form.website} onChange={handleChange}/>
              </div>
            </div>
          )}

          {/* Step 5 - Submit */}
          {step === 5 && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="font-display text-2xl mb-2" style={{color:'var(--text)'}}>Ready to go live!</h2>
              <p className="text-sm mb-6" style={{color:'var(--text-muted)'}}>Your profile will be reviewed by our team within 24 hours.</p>
              <div className="text-left rounded-xl p-4 mb-6" style={{background:'var(--bg-subtle)'}}>
                {[
                  ['Business', form.businessName],
                  ['Location', form.location],
                  ['Pricing', form.priceMin ? `${sym}${form.priceMin} – ${sym}${form.priceMax}` : '—'],
                  ['WhatsApp', form.whatsapp],
                ].map(([k,v]) => (
                  <div key={k} className="flex items-center justify-between py-2 border-b last:border-0 text-sm" style={{borderColor:'var(--border)'}}>
                    <span style={{color:'var(--text-faint)'}}>{k}</span>
                    <span className="font-semibold" style={{color:'var(--text)'}}>{v||'—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button onClick={() => setStep(s=>s-1)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>
                ← Back
              </button>
            ) : <div/>}

            {step < 5 ? (
              <button onClick={() => setStep(s=>s+1)}
                disabled={
                  (step===1 && (!form.businessName || !form.categoryId)) ||
                  (step===2 && (!form.city || !form.location)) ||
                  (step===3 && (!form.priceMin || !form.priceMax)) ||
                  (step===4 && !form.whatsapp)
                }
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{background:'#C8A96E'}}>
                Next →
              </button>
            ) : (
              <button onClick={submit} disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                {loading ? 'Submitting…' : '🚀 Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}