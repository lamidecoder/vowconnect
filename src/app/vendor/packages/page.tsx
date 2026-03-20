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
]

const CURR: Record<string,string> = { NGN:'₦', GBP:'£', USD:'$', CAD:'CA$', GHS:'GH₵', EUR:'€' }
const EMPTY = { name:'', description:'', price:'', duration:'', includes:[''] }

export default function VendorPackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [adding,   setAdding]   = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [editId,   setEditId]   = useState<string|null>(null)
  const [currency, setCurrency] = useState('NGN')
  const [form,     setForm]     = useState(EMPTY)

  useEffect(() => {
    fetch('/api/vendor/packages', { credentials:'include' })
      .then(r => r.json())
      .then(d => {
        setPackages(Array.isArray(d) ? d : [])
        if (d?.[0]?.currency) setCurrency(d[0].currency)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function addInclude() { setForm(p => ({ ...p, includes: [...p.includes, ''] })) }
  function updateInclude(i: number, v: string) { setForm(p => ({ ...p, includes: p.includes.map((x,j) => j===i ? v : x) })) }
  function removeInclude(i: number) { setForm(p => ({ ...p, includes: p.includes.filter((_,j) => j!==i) })) }

  async function save() {
    setSaving(true)
    const body = { ...form, price: Number(form.price), includes: form.includes.filter(Boolean), currency }
    const method = editId ? 'PATCH' : 'POST'
    const url    = editId ? `/api/vendor/packages?id=${editId}` : '/api/vendor/packages'
    const res = await fetch(url, {
      method, headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify(editId ? { id:editId, ...body } : body),
    })
    if (res.ok) {
      const data = await res.json()
      if (editId) setPackages(p => p.map(x => x.id===editId ? data : x))
      else setPackages(p => [...p, data])
      setAdding(false); setEditId(null); setForm(EMPTY)
    }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm('Delete this package?')) return
    await fetch(`/api/vendor/packages?id=${id}`, { method:'DELETE', credentials:'include' })
    setPackages(p => p.filter(x => x.id !== id))
  }

  function startEdit(pkg: any) {
    setEditId(pkg.id)
    setForm({ name:pkg.name, description:pkg.description??'', price:String(pkg.price), duration:pkg.duration??'', includes:pkg.includes?.length ? pkg.includes : [''] })
    setAdding(true)
  }

  const sym = CURR[currency] ?? '₦'
  const inputStyle = { background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:10, padding:'9px 12px', width:'100%', fontSize:13, outline:'none' } as React.CSSProperties
  const labelStyle = { display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.1em', color:'var(--text-faint)', marginBottom:5 }

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
          <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Packages</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Create service packages for your clients</p>
        </div>
        <button onClick={() => { setAdding(a => !a); setEditId(null); setForm(EMPTY) }}
          className="text-sm font-bold px-4 py-2 rounded-xl text-white"
          style={{background:'#C8A96E'}}>
          {adding ? '✕ Cancel' : '+ New Package'}
        </button>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{borderColor:'#C8A96E', borderTopColor:'transparent'}}/>
          </div>
        ) : (
          <>
            {/* Form */}
            {adding && (
              <div className="rounded-2xl p-6 mb-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <h2 className="font-semibold mb-4" style={{color:'var(--text)'}}>{editId ? 'Edit Package' : 'New Package'}</h2>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label style={labelStyle}>Package Name *</label>
                    <input style={inputStyle} placeholder="e.g. Full Day Bridal" value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Duration</label>
                    <input style={inputStyle} placeholder="e.g. 8 hours" value={form.duration} onChange={e => setForm(p => ({...p, duration:e.target.value}))}/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label style={labelStyle}>Price *</label>
                    <input style={inputStyle} type="number" placeholder="0" value={form.price} onChange={e => setForm(p => ({...p, price:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select style={inputStyle} value={currency} onChange={e => setCurrency(e.target.value)}>
                      {Object.keys(CURR).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label style={labelStyle}>Description</label>
                  <textarea style={{...inputStyle, resize:'none'}} rows={3} placeholder="What's included in this package…"
                    value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))}/>
                </div>
                <div className="mb-4">
                  <label style={labelStyle}>What&apos;s Included</label>
                  {form.includes.map((inc, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input style={{...inputStyle, width:'auto', flex:1}} placeholder={`Item ${i+1}`}
                        value={inc} onChange={e => updateInclude(i, e.target.value)}/>
                      {form.includes.length > 1 && (
                        <button onClick={() => removeInclude(i)} style={{color:'#f87171', fontSize:12, padding:'0 8px'}}>✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={addInclude} className="text-xs font-semibold mt-1" style={{color:'#C8A96E'}}>+ Add item</button>
                </div>
                <div className="flex items-center justify-between">
                  {form.price && <div className="font-display text-lg font-bold" style={{color:'#C8A96E'}}>{sym}{Number(form.price).toLocaleString()}</div>}
                  <button onClick={save} disabled={saving || !form.name || !form.price}
                    className="text-sm font-bold px-5 py-2.5 rounded-xl text-white disabled:opacity-50"
                    style={{background:'#C8A96E'}}>
                    {saving ? 'Saving…' : editId ? 'Update Package' : 'Save Package'}
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            {packages.length === 0 && !adding ? (
              <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="text-5xl mb-4 opacity-20">📦</div>
                <p className="font-semibold" style={{color:'var(--text-muted)'}}>No packages yet</p>
                <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Create packages to make it easy for clients to book you</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map(pkg => (
                  <div key={pkg.id} className="rounded-2xl p-5"
                    style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold" style={{color:'var(--text)'}}>{pkg.name}</h3>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(pkg)}
                          className="text-xs px-2 py-1 rounded-lg" style={{background:'rgba(200,169,110,0.1)', color:'#C8A96E'}}>Edit</button>
                        <button onClick={() => del(pkg.id)}
                          className="text-xs px-2 py-1 rounded-lg" style={{background:'rgba(239,68,68,0.1)', color:'#f87171'}}>Del</button>
                      </div>
                    </div>
                    <div className="font-display text-2xl font-bold mb-1" style={{color:'#C8A96E'}}>
                      {CURR[pkg.currency] ?? sym}{pkg.price?.toLocaleString()}
                    </div>
                    {pkg.duration && <div className="text-xs mb-2" style={{color:'var(--text-faint)'}}>⏱ {pkg.duration}</div>}
                    {pkg.description && <p className="text-xs mb-3 line-clamp-2" style={{color:'var(--text-muted)'}}>{pkg.description}</p>}
                    {pkg.includes?.length > 0 && (
                      <ul className="space-y-1">
                        {pkg.includes.map((item: string, i: number) => (
                          <li key={i} className="text-xs flex items-center gap-2" style={{color:'var(--text-muted)'}}>
                            <span style={{color:'#10b981'}}>✓</span> {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}