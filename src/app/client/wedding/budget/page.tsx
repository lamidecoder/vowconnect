'use client'
import { useState, useEffect } from 'react'
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

const CATS = ['Gele Stylist','Makeup Artist','Photography','Videography','Venue','Catering','Decoration','Entertainment','Transportation','Attire & Fashion','Invitations','Honeymoon','Other']
const SYM: Record<string,string> = { NGN:'₦', GBP:'£', USD:'$', CAD:'CA$', GHS:'GH₵', EUR:'€', AUD:'A$' }
const fmt = (n:number, c:string) => `${SYM[c]??''}${n.toLocaleString()}`

const EMPTY = { category:'Other', label:'', estimatedAmount:'', actualAmount:'', isPaid:false, notes:'' }

export default function BudgetPage() {
  const [items,    setItems]    = useState<any[]>([])
  const [profile,  setProfile]  = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const [adding,   setAdding]   = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [editId,   setEditId]   = useState<string|null>(null)
  const [aiAdvice, setAiAdvice] = useState('')
  const [aiLoading,setAiLoading]= useState(false)
  const [form,     setForm]     = useState(EMPTY)

  useEffect(() => {
    Promise.all([
      fetch('/api/wedding/budget',  { credentials:'include' }).then(r => r.json()),
      fetch('/api/wedding/profile', { credentials:'include' }).then(r => r.json()),
    ]).then(([items, profile]) => {
      setItems(Array.isArray(items) ? items : [])
      setProfile(profile)
      setLoading(false)
    })
  }, [])

  const currency      = profile?.currency ?? 'NGN'
  const totalBudget   = profile?.totalBudget ?? 0
  const totalEstimated= items.reduce((s,i) => s+(i.estimatedAmount??0), 0)
  const totalActual   = items.reduce((s,i) => s+(i.actualAmount??0), 0)
  const remaining     = totalBudget - totalEstimated
  const overBudget    = remaining < 0

  async function getAiAdvice() {
    setAiLoading(true); setAiAdvice('')
    try {
      const res = await fetch('/api/ai', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ mode:'budget', prompt:`Budget: ${fmt(totalBudget,currency)}, Estimated: ${fmt(totalEstimated,currency)}, Items: ${items.map(i=>`${i.category}:${fmt(i.estimatedAmount,currency)}`).join(', ')}` }),
      })
      const data = await res.json()
      setAiAdvice(data.result ?? 'Could not generate advice.')
    } catch { setAiAdvice('Network error.') }
    setAiLoading(false)
  }

  async function saveItem() {
    setSaving(true)
    const method = editId ? 'PATCH' : 'POST'
    const body   = editId ? { id:editId, ...form } : form
    const res    = await fetch('/api/wedding/budget', { method, headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify(body) })
    const data   = await res.json()
    if (editId) setItems(p => p.map(i => i.id===editId ? data : i))
    else        setItems(p => [...p, data])
    setForm(EMPTY); setAdding(false); setEditId(null); setSaving(false)
  }

  async function togglePaid(item: any) {
    const res = await fetch('/api/wedding/budget', { method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ id:item.id, isPaid:!item.isPaid, actualAmount: !item.isPaid ? item.estimatedAmount : item.actualAmount }) })
    const data = await res.json()
    setItems(p => p.map(i => i.id===item.id ? data : i))
  }

  async function deleteItem(id: string) {
    await fetch('/api/wedding/budget', { method:'DELETE', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ id }) })
    setItems(p => p.filter(i => i.id!==id))
  }

  function startEdit(item: any) {
    setEditId(item.id)
    setForm({ category:item.category, label:item.label, estimatedAmount:String(item.estimatedAmount), actualAmount:String(item.actualAmount), isPaid:item.isPaid, notes:item.notes??'' })
    setAdding(true)
  }

  const grouped = CATS.reduce((acc:Record<string,any[]>, cat) => {
    const catItems = items.filter(i => i.category===cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})
  const otherItems = items.filter(i => !CATS.includes(i.category))
  if (otherItems.length > 0) grouped['Other'] = [...(grouped['Other']??[]), ...otherItems]

  const inputStyle = { background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:10, padding:'9px 12px', width:'100%', fontSize:13, outline:'none' } as React.CSSProperties
  const labelStyle = { display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.1em', color:'var(--text-faint)', marginBottom:5 }

  return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Wedding Hub</div>
          <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Budget Tracker</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Track your wedding spend</p>
        </div>
        <button onClick={() => { setAdding(a=>!a); setEditId(null); setForm(EMPTY) }}
          className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{background:'#C8A96E'}}>
          {adding ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label:'Total Budget',   value: totalBudget>0 ? fmt(totalBudget,currency) : 'Not set', color:'var(--text)' },
                { label:'Estimated',      value: fmt(totalEstimated,currency), color: overBudget&&totalBudget>0 ? '#f87171' : 'var(--text)' },
                { label: overBudget ? 'Over by' : 'Remaining', value: totalBudget>0 ? fmt(Math.abs(remaining),currency) : '—', color: overBudget ? '#f87171' : '#10b981' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                  <div className="font-display text-2xl font-bold" style={{color:s.color}}>{s.value}</div>
                  <div className="text-xs mt-1" style={{color:'var(--text-muted)'}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {totalBudget > 0 && (
              <div className="rounded-2xl p-5 mb-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="flex justify-between text-xs mb-2" style={{color:'var(--text-muted)'}}>
                  <span>0</span>
                  <span className="font-semibold" style={{color:'var(--text)'}}>{Math.round((totalEstimated/totalBudget)*100)}% allocated</span>
                  <span>{fmt(totalBudget,currency)}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{background:'var(--bg-subtle)'}}>
                  <div className="h-full rounded-full transition-all" style={{
                    width:`${Math.min(100,(totalEstimated/totalBudget)*100)}%`,
                    background: overBudget ? '#ef4444' : 'linear-gradient(90deg,#C8A96E,#8B6914)'
                  }}/>
                </div>
                <div className="flex gap-4 mt-2 text-xs" style={{color:'var(--text-faint)'}}>
                  <span>✅ Paid: {fmt(totalActual,currency)}</span>
                  <span>⏳ Unpaid: {fmt(totalEstimated-totalActual,currency)}</span>
                </div>
              </div>
            )}

            {/* AI advisor */}
            {items.length >= 2 && (
              <div className="rounded-2xl p-5 mb-6" style={{background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.25)'}}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <div className="font-semibold text-sm" style={{color:'var(--text)'}}>AI Budget Advisor</div>
                      <div className="text-xs" style={{color:'var(--text-muted)'}}>Get personalised advice on your budget allocation</div>
                    </div>
                  </div>
                  <button onClick={getAiAdvice} disabled={aiLoading}
                    className="text-sm font-bold px-4 py-2 rounded-xl text-white disabled:opacity-50"
                    style={{background:'#C8A96E'}}>
                    {aiLoading ? 'Analysing…' : aiAdvice ? '↺ Refresh' : 'Analyse Budget'}
                  </button>
                </div>
                {aiAdvice && (
                  <div className="mt-4 p-4 rounded-xl text-sm leading-relaxed" style={{background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)'}}>
                    {aiAdvice}
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit form */}
            {adding && (
              <div className="rounded-2xl p-6 mb-6" style={{background:'var(--bg-card)', border:'1px solid rgba(200,169,110,0.3)'}}>
                <h3 className="font-semibold mb-4" style={{color:'var(--text)'}}>{editId ? 'Edit Item' : 'Add Budget Item'}</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Item Name</label>
                    <input style={inputStyle} placeholder="e.g. Bridal makeup" value={form.label} onChange={e => setForm(p=>({...p,label:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Estimated ({currency})</label>
                    <input style={inputStyle} type="number" value={form.estimatedAmount} onChange={e => setForm(p=>({...p,estimatedAmount:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Actual Paid ({currency})</label>
                    <input style={inputStyle} type="number" value={form.actualAmount} onChange={e => setForm(p=>({...p,actualAmount:e.target.value}))}/>
                  </div>
                </div>
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input type="checkbox" checked={form.isPaid} onChange={e => setForm(p=>({...p,isPaid:e.target.checked}))} style={{width:16,height:16}}/>
                  <span className="text-sm" style={{color:'var(--text)'}}>Mark as paid</span>
                </label>
                <div className="flex gap-3">
                  <button onClick={saveItem} disabled={saving||!form.label}
                    className="text-sm font-bold px-5 py-2.5 rounded-xl text-white disabled:opacity-50" style={{background:'#C8A96E'}}>
                    {saving ? 'Saving…' : editId ? 'Update' : 'Add Item'}
                  </button>
                  <button onClick={() => {setAdding(false);setEditId(null)}}
                    className="text-sm px-4 py-2.5 rounded-xl" style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Items by category */}
            {Object.keys(grouped).length === 0 ? (
              <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="text-5xl mb-4 opacity-20">💰</div>
                <p className="font-semibold" style={{color:'var(--text-muted)'}}>No budget items yet</p>
                <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Click "+ Add Item" to start tracking</p>
              </div>
            ) : Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat} className="rounded-2xl overflow-hidden mb-4" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="px-5 py-3 flex items-center justify-between border-b" style={{background:'var(--bg-subtle)', borderColor:'var(--border)'}}>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{color:'var(--text-muted)'}}>{cat}</span>
                  <span className="text-xs font-mono" style={{color:'var(--text-faint)'}}>{fmt(catItems.reduce((s:number,i:any)=>s+i.estimatedAmount,0),currency)}</span>
                </div>
                {catItems.map((item:any) => (
                  <div key={item.id} className="px-5 py-3.5 flex items-center gap-3 border-b last:border-0 group hover:opacity-80 transition-all" style={{borderColor:'var(--border)'}}>
                    <button onClick={() => togglePaid(item)}
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                      style={{background:item.isPaid?'#10b981':'transparent', borderColor:item.isPaid?'#10b981':'var(--border)'}}>
                      {item.isPaid && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{color:'var(--text)', textDecoration:item.isPaid?'line-through':'none', opacity:item.isPaid?0.5:1}}>{item.label}</div>
                      {item.notes && <div className="text-xs" style={{color:'var(--text-faint)'}}>{item.notes}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-mono font-semibold" style={{color:'var(--text)'}}>{fmt(item.estimatedAmount,currency)}</div>
                      {item.actualAmount>0 && item.actualAmount!==item.estimatedAmount && (
                        <div className="text-xs" style={{color:'var(--text-faint)'}}>paid: {fmt(item.actualAmount,currency)}</div>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(item)} className="text-xs p-1.5 rounded-lg" style={{color:'#C8A96E'}}>✎</button>
                      <button onClick={() => deleteItem(item.id)} className="text-xs p-1.5 rounded-lg" style={{color:'#f87171'}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </DashboardShell>
  )
}