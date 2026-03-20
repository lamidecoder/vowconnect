'use client'
import { useEffect, useState } from 'react'
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

interface Category { id: string; name: string; emoji: string }

const CITIES: Record<string, string[]> = {
  NG: ['Lagos','Abuja','Port Harcourt','Ibadan','Benin City','Kano','Enugu','Calabar','Warri','Owerri'],
  GB: ['London','Birmingham','Manchester','Leeds','Bristol','Edinburgh','Cardiff','Liverpool'],
  US: ['Houston','Atlanta','New York','Washington DC','Dallas','Los Angeles','Chicago','Philadelphia'],
  CA: ['Toronto','Calgary','Ottawa','Vancouver','Edmonton','Winnipeg'],
  GH: ['Accra','Kumasi','Tamale','Cape Coast','Takoradi'],
}

const CURR: Record<string,string> = { NGN:'₦', GBP:'£', USD:'$', CAD:'CA$', GHS:'GH₵' }

export default function VendorProfilePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState('')
  const [aiWriting,  setAiWriting]  = useState(false)
  const [aiError,    setAiError]    = useState('')
  const [form, setForm] = useState({
    businessName:'', bio:'', categoryId:'',
    country:'NG', countryName:'Nigeria', city:'', location:'',
    currency:'NGN', priceMin:'', priceMax:'',
    whatsapp:'', instagram:'', website:'', isAvailable:true,
  })

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
    fetch('/api/vendors/me', { credentials:'include' }).then(r => r.json()).then(data => {
      if (data?.id) {
        setForm({
          businessName: data.businessName ?? '',
          bio:          data.bio          ?? '',
          categoryId:   data.categoryId   ?? '',
          country:      data.country      ?? 'NG',
          countryName:  data.countryName  ?? 'Nigeria',
          city:         data.city         ?? '',
          location:     data.location     ?? '',
          currency:     data.currency     ?? 'NGN',
          priceMin:     data.priceMin ? String(data.priceMin) : '',
          priceMax:     data.priceMax ? String(data.priceMax) : '',
          whatsapp:     data.whatsapp  ?? '',
          instagram:    data.instagram ?? '',
          website:      data.website   ?? '',
          isAvailable:  data.isAvailable ?? true,
        })
      }
    }).catch(() => {})
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) {
    const { name, type } = e.target
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    if (name === 'country') {
      const c = COUNTRIES.find(x => x.code === value) ?? COUNTRIES[0]
      setForm(p => ({ ...p, country:c.code, countryName:c.name, currency:c.currency, city:'', location:'' }))
    } else if (name === 'city') {
      const country = COUNTRIES.find(x => x.code === form.country)
      setForm(p => ({ ...p, city: String(value), location:`${value}, ${country?.name ?? ''}` }))
    } else {
      setForm(p => ({ ...p, [name]: value }))
    }
  }

  async function generateBio() {
    if (!form.businessName) { setAiError('Add your business name first'); return }
    setAiWriting(true); setAiError('')
    const cat = categories.find(c => c.id === form.categoryId)
    try {
      const res = await fetch('/api/ai', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ mode:'bio', prompt:`Business: ${form.businessName}\nCategory: ${cat?.name ?? 'Wedding vendor'}\nLocation: ${form.city}, ${form.countryName}` }),
      })
      const data = await res.json()
      if (res.ok && data.result) setForm(p => ({ ...p, bio: data.result.slice(0, 500) }))
      else setAiError(data.error ?? 'AI unavailable')
    } catch { setAiError('Network error') }
    setAiWriting(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSaved(false)
    const payload = { ...form, priceMin: form.priceMin ? +form.priceMin : undefined, priceMax: form.priceMax ? +form.priceMax : undefined }
    const res = await fetch('/api/vendors', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    if (!res.ok && res.status !== 409) { setError((await res.json()).error ?? 'Failed to save'); setLoading(false); return }
    if (res.status === 409) {
      const upd = await fetch('/api/vendors/me', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if (!upd.ok) { setError('Failed to update profile'); setLoading(false); return }
    }
    setSaved(true); setLoading(false)
    setTimeout(() => router.push('/vendor/dashboard'), 1500)
  }

  const sym = CURR[form.currency] ?? '₦'
  const cities = CITIES[form.country] ?? []

  const inputStyle = { background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:12, padding:'10px 14px', width:'100%', fontSize:14, outline:'none' } as React.CSSProperties
  const labelStyle = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.1em', color:'var(--text-faint)', marginBottom:6 }
  const cardStyle  = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:24, marginBottom:16 }

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>My Profile</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Update your listing · changes go live after review</p>
      </div>

      <div className="p-8" style={{maxWidth:720}}>
        {saved && <div className="mb-4 p-3 rounded-xl text-sm font-semibold" style={{background:'rgba(16,185,129,0.1)', color:'#10b981', border:'1px solid rgba(16,185,129,0.2)'}}>✅ Profile saved! Redirecting…</div>}
        {error && <div className="mb-4 p-3 rounded-xl text-sm" style={{background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)'}}>{error}</div>}

        <form onSubmit={handleSave}>
          {/* Business */}
          <div style={cardStyle}>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'#C8A96E'}}>Business Details</div>
            <div className="space-y-4">
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
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6}}>
                  <label style={{...labelStyle, marginBottom:0}}>Bio / Description</label>
                  <button type="button" onClick={generateBio} disabled={aiWriting}
                    style={{fontSize:11, fontWeight:700, color:'#C8A96E', background:'rgba(200,169,110,0.1)', border:'1px solid rgba(200,169,110,0.3)', borderRadius:8, padding:'4px 10px', cursor:'pointer'}}>
                    {aiWriting ? '✨ Writing…' : '✨ Write with AI'}
                  </button>
                </div>
                <textarea style={{...inputStyle, resize:'none'}} name="bio" rows={4}
                  placeholder="Tell brides about your experience, style, and what makes you special..."
                  value={form.bio} onChange={handleChange} maxLength={500}/>
                <div style={{fontSize:11, color:'var(--text-faint)', marginTop:4}}>{form.bio.length}/500 · {aiError && <span style={{color:'#f87171'}}>{aiError}</span>}</div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={cardStyle}>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'#C8A96E'}}>Location</div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}>Country *</label>
                <select style={inputStyle} name="country" value={form.country} onChange={handleChange} required>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>City *</label>
                <select style={inputStyle} name="city" value={form.city} onChange={handleChange} required>
                  <option value="">Select city</option>
                  {cities.map(c => <option key={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Full Location Display *</label>
              <input style={inputStyle} name="location" placeholder="e.g. Lekki, Lagos" value={form.location} onChange={handleChange} required/>
            </div>
          </div>

          {/* Pricing */}
          <div style={cardStyle}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
              <div className="text-xs font-bold uppercase tracking-widest" style={{color:'#C8A96E'}}>Pricing</div>
              <select style={{...inputStyle, width:'auto', padding:'4px 10px', fontSize:12}} name="currency" value={form.currency} onChange={handleChange}>
                {COUNTRIES.map(c => <option key={c.currency} value={c.currency}>{c.flag} {c.currency}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Min Price ({sym}) *</label>
                <input style={inputStyle} name="priceMin" type="number" placeholder="e.g. 20000" value={form.priceMin} onChange={handleChange} required min="0"/>
              </div>
              <div>
                <label style={labelStyle}>Max Price ({sym}) *</label>
                <input style={inputStyle} name="priceMax" type="number" placeholder="e.g. 80000" value={form.priceMax} onChange={handleChange} required min="0"/>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div style={cardStyle}>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'#C8A96E'}}>Contact & Social</div>
            <div className="space-y-4">
              <div>
                <label style={labelStyle}>WhatsApp Number * (with country code)</label>
                <input style={inputStyle} name="whatsapp" type="tel"
                  placeholder={form.country==='NG' ? '08012345678 or +2348012345678' : '+447911123456'}
                  value={form.whatsapp} onChange={handleChange} required/>
              </div>
              <div>
                <label style={labelStyle}>Instagram Handle (optional)</label>
                <input style={inputStyle} name="instagram" placeholder="@yourbusiness" value={form.instagram} onChange={handleChange}/>
              </div>
              <div>
                <label style={labelStyle}>Website (optional)</label>
                <input style={inputStyle} name="website" type="url" placeholder="https://yourbusiness.com" value={form.website} onChange={handleChange}/>
              </div>
              <label style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer'}}>
                <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} style={{width:16, height:16}}/>
                <span style={{fontSize:14, color:'var(--text)', fontWeight:500}}>I&apos;m available for new bookings</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
            style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
            {loading ? 'Saving…' : 'Save Profile →'}
          </button>
        </form>
      </div>
    </DashboardShell>
  )
}