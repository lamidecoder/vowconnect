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
type QStatus = 'DRAFT'|'SENT'|'ACCEPTED'|'DECLINED'|'EXPIRED'
const S_STYLE: Record<QStatus,{bg:string;color:string}> = {
  DRAFT:    { bg:'rgba(100,100,100,0.1)', color:'#888'    },
  SENT:     { bg:'rgba(200,169,110,0.15)',color:'#C8A96E' },
  ACCEPTED: { bg:'rgba(16,185,129,0.15)', color:'#10b981' },
  DECLINED: { bg:'rgba(239,68,68,0.1)',   color:'#f87171' },
  EXPIRED:  { bg:'rgba(120,80,200,0.1)',  color:'#a78bfa' },
}

interface Item { label:string; price:string; quantity:string }
interface Quote {
  id:string; status:QStatus; totalAmount:number; currency:string
  createdAt:string; validUntil?:string; notes?:string
  client:{ name:string; email?:string }
  items:{ label:string; price:number; quantity:number }[]
}

const EMPTY_FORM = { clientId:'', currency:'NGN', notes:'', validDays:'30' }
const EMPTY_ITEM: Item = { label:'', price:'', quantity:'1' }

export default function VendorQuotesPage() {
  const [quotes,   setQuotes]   = useState<Quote[]>([])
  const [clients,  setClients]  = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [expanded, setExpanded] = useState<string|null>(null)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [items,    setItems]    = useState<Item[]>([{ ...EMPTY_ITEM }])
  const [err,      setErr]      = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/quotes', { credentials:'include' }).then(r => r.json()),
      fetch('/api/vendor/crm', { credentials:'include' }).then(r => r.json()),
      fetch('/api/vendor/packages', { credentials:'include' }).then(r => r.json()),
    ]).then(([q, c, p]) => {
      setQuotes(Array.isArray(q) ? q : [])
      setClients(Array.isArray(c) ? c : [])
      setPackages(Array.isArray(p) ? p : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function total() {
    return items.reduce((s,i) => s + (parseFloat(i.price)||0) * (parseInt(i.quantity)||1), 0)
  }

  async function save() {
    if (!form.clientId) { setErr('Please select a client'); return }
    if (items.some(i => !i.label || !i.price)) { setErr('Fill in all item details'); return }
    setSaving(true); setErr('')
    const res = await fetch('/api/quotes', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({
        clientId: form.clientId,
        currency: form.currency,
        notes: form.notes,
        validUntil: form.validDays ? new Date(Date.now() + parseInt(form.validDays)*86400000).toISOString() : undefined,
        items: items.map(i => ({ label:i.label, price:parseFloat(i.price), quantity:parseInt(i.quantity)||1 })),
      }),
    })
    const data = await res.json()
    if (res.ok) { setQuotes(p => [data, ...p]); setCreating(false); setForm(EMPTY_FORM); setItems([{...EMPTY_ITEM}]) }
    else setErr(data.error ?? 'Failed to create quote')
    setSaving(false)
  }

  async function send(id: string) {
    await fetch('/api/quotes', {
      method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ id, status:'SENT' }),
    })
    setQuotes(p => p.map(q => q.id===id ? {...q, status:'SENT'} : q))
  }

  const sym = CURR[form.currency] ?? ''

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
          <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Quotes</h1>
        </div>
        <button onClick={() => setCreating(c => !c)}
          className="text-sm font-bold px-4 py-2 rounded-xl text-white"
          style={{background:'#C8A96E'}}>
          {creating ? '✕ Cancel' : '+ New Quote'}
        </button>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
          </div>
        ) : (
          <>
            {/* Create form */}
            {creating && (
              <div className="rounded-2xl p-6 mb-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <h2 className="font-semibold mb-4" style={{color:'var(--text)'}}>New Quote</h2>
                {err && <p className="text-sm mb-3 px-3 py-2 rounded-lg" style={{background:'rgba(239,68,68,0.1)', color:'#f87171'}}>{err}</p>}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:'var(--text-faint)'}}>Client</label>
                    <select value={form.clientId} onChange={e => setForm(p => ({...p, clientId:e.target.value}))}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}>
                      <option value="">Select client…</option>
                      {clients.map((c:any) => <option key={c.client.id} value={c.client.id}>{c.client.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:'var(--text-faint)'}}>Currency</label>
                    <select value={form.currency} onChange={e => setForm(p => ({...p, currency:e.target.value}))}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}>
                      {Object.keys(CURR).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{color:'var(--text-faint)'}}>Line Items</label>
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input placeholder="Service description" value={item.label}
                        onChange={e => setItems(p => p.map((x,j) => j===i ? {...x, label:e.target.value} : x))}
                        className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                        style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
                      <input placeholder={`${sym}Price`} value={item.price} type="number"
                        onChange={e => setItems(p => p.map((x,j) => j===i ? {...x, price:e.target.value} : x))}
                        className="w-28 px-3 py-2 rounded-xl text-sm outline-none"
                        style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
                      <input placeholder="Qty" value={item.quantity} type="number"
                        onChange={e => setItems(p => p.map((x,j) => j===i ? {...x, quantity:e.target.value} : x))}
                        className="w-16 px-3 py-2 rounded-xl text-sm outline-none"
                        style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
                      {items.length > 1 && (
                        <button onClick={() => setItems(p => p.filter((_,j) => j!==i))}
                          className="text-xs px-2 rounded-xl" style={{color:'#f87171'}}>✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setItems(p => [...p, {...EMPTY_ITEM}])}
                    className="text-xs font-semibold mt-1" style={{color:'#C8A96E'}}>
                    + Add item
                  </button>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:'var(--text-faint)'}}>Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes:e.target.value}))}
                    rows={3} placeholder="Any additional details for the client…"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                    style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
                </div>

                <div className="flex items-center justify-between">
                  <div className="font-display text-xl font-bold" style={{color:'#C8A96E'}}>
                    Total: {sym}{total().toLocaleString()}
                  </div>
                  <button onClick={save} disabled={saving}
                    className="text-sm font-bold px-5 py-2.5 rounded-xl text-white disabled:opacity-50"
                    style={{background:'#C8A96E'}}>
                    {saving ? 'Saving…' : 'Create & Send Quote'}
                  </button>
                </div>
              </div>
            )}

            {/* Quotes list */}
            {quotes.length === 0 && !creating ? (
              <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="text-5xl mb-4 opacity-20">📄</div>
                <p className="font-semibold mb-1" style={{color:'var(--text-muted)'}}>No quotes yet</p>
                <p className="text-xs" style={{color:'var(--text-faint)'}}>Create a quote to send to a client</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map(q => {
                  const s = S_STYLE[q.status] ?? S_STYLE.DRAFT
                  const open = expanded === q.id
                  const csym = CURR[q.currency] ?? ''
                  return (
                    <div key={q.id} className="rounded-2xl overflow-hidden"
                      style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                      <button onClick={() => setExpanded(open ? null : q.id)}
                        className="w-full text-left px-6 py-4 flex items-center gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold" style={{color:'var(--text)'}}>{q.client.name}</div>
                          <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>
                            {q.items.length} item{q.items.length!==1?'s':''} · {new Date(q.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="font-display text-xl font-bold" style={{color:'var(--text)'}}>
                          {csym}{q.totalAmount.toLocaleString()}
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{background:s.bg, color:s.color}}>
                          {q.status}
                        </span>
                        <span className="text-xs" style={{color:'var(--text-faint)'}}>{open?'▲':'▼'}</span>
                      </button>

                      {open && (
                        <div className="border-t px-6 py-5" style={{borderColor:'var(--border)', background:'var(--bg-subtle)'}}>
                          <table className="w-full text-sm mb-4">
                            <thead>
                              <tr className="text-xs font-bold uppercase tracking-widest" style={{color:'var(--text-faint)'}}>
                                <th className="text-left pb-2">Service</th>
                                <th className="text-right pb-2">Qty</th>
                                <th className="text-right pb-2">Rate</th>
                                <th className="text-right pb-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {q.items.map((item,i) => (
                                <tr key={i} className="border-t" style={{borderColor:'var(--border)'}}>
                                  <td className="py-2" style={{color:'var(--text)'}}>{item.label}</td>
                                  <td className="py-2 text-right" style={{color:'var(--text-muted)'}}>{item.quantity}</td>
                                  <td className="py-2 text-right" style={{color:'var(--text-muted)'}}>{csym}{item.price.toLocaleString()}</td>
                                  <td className="py-2 text-right font-semibold" style={{color:'var(--text)'}}>{csym}{(item.price*item.quantity).toLocaleString()}</td>
                                </tr>
                              ))}
                              <tr className="border-t-2" style={{borderColor:'var(--border)'}}>
                                <td colSpan={3} className="pt-3 font-bold" style={{color:'var(--text)'}}>Total</td>
                                <td className="pt-3 text-right font-display text-xl font-bold" style={{color:'#C8A96E'}}>{csym}{q.totalAmount.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                          {q.notes && (
                            <div className="rounded-xl p-3 mb-4" style={{background:'var(--bg-card)', borderLeft:'3px solid #C8A96E'}}>
                              <p className="text-sm" style={{color:'var(--text-muted)'}}>{q.notes}</p>
                            </div>
                          )}
                          {q.status === 'DRAFT' && (
                            <button onClick={() => send(q.id)}
                              className="text-sm font-bold px-4 py-2 rounded-xl text-white"
                              style={{background:'#C8A96E'}}>
                              Send to Client →
                            </button>
                          )}
                          {q.status === 'ACCEPTED' && (
                            <div className="rounded-xl p-3 flex items-center gap-2" style={{background:'rgba(16,185,129,0.1)', color:'#10b981'}}>
                              <span>✅</span>
                              <span className="text-sm font-semibold">Client accepted this quote!</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}