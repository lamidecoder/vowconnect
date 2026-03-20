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

const CATS = ['All','dress','gele','makeup','decor','flowers','cake','venue','photography','fashion','other']
const EMPTY = { imageUrl:'', caption:'', category:'decor', sourceUrl:'' }

export default function MoodBoardPage() {
  const [pins,    setPins]    = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding,  setAdding]  = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [filter,  setFilter]  = useState('All')
  const [form,    setForm]    = useState(EMPTY)

  useEffect(() => {
    fetch('/api/wedding/moodboard', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setPins(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function addPin() {
    if (!form.imageUrl) return
    setSaving(true)
    const res  = await fetch('/api/wedding/moodboard', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setPins(p => [...p, data])
    setAdding(false); setSaving(false); setForm(EMPTY)
  }

  async function del(id: string) {
    await fetch('/api/wedding/moodboard', {
      method:'DELETE', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ id }),
    })
    setPins(p => p.filter(x => x.id!==id))
  }

  const filtered = filter==='All' ? pins : pins.filter(p => p.category===filter)

  return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Wedding Hub</div>
          <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Mood Board</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>{pins.length} pins · your wedding vision</p>
        </div>
        <button onClick={() => setAdding(a=>!a)}
          className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{background:'#C8A96E'}}>
          {adding ? '✕ Cancel' : '+ Pin Image'}
        </button>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
          </div>
        ) : (
          <>
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap mb-6">
              {CATS.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all"
                  style={{
                    background: filter===cat ? '#C8A96E' : 'var(--bg-card)',
                    color:      filter===cat ? '#fff' : 'var(--text-muted)',
                    borderColor: filter===cat ? '#C8A96E' : 'var(--border)',
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Add pin form */}
            {adding && (
              <div className="rounded-2xl p-6 mb-6" style={{background:'var(--bg-card)', border:'1px solid rgba(200,169,110,0.3)'}}>
                <h3 className="font-semibold mb-4" style={{color:'var(--text)'}}>Pin an Image</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:'var(--text-faint)'}}>Image URL *</label>
                    <input
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}
                      type="url" placeholder="https://…"
                      value={form.imageUrl} onChange={e => setForm(p=>({...p,imageUrl:e.target.value}))}/>
                    <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Right-click any image → &apos;Copy image address&apos;</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:'var(--text-faint)'}}>Category</label>
                      <select className="w-full px-3 py-2 rounded-xl text-sm outline-none capitalize"
                        style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}
                        value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>
                        {CATS.filter(c=>c!=='All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:'var(--text-faint)'}}>Caption</label>
                      <input className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}
                        placeholder="Optional note"
                        value={form.caption} onChange={e => setForm(p=>({...p,caption:e.target.value}))}/>
                    </div>
                  </div>
                  {form.imageUrl && (
                    <div className="rounded-xl overflow-hidden h-32" style={{border:'1px solid var(--border)'}}>
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display='none' }}/>
                    </div>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button onClick={addPin} disabled={saving||!form.imageUrl}
                      className="text-sm font-bold px-5 py-2.5 rounded-xl text-white disabled:opacity-50" style={{background:'#C8A96E'}}>
                      {saving ? 'Pinning…' : 'Pin Image'}
                    </button>
                    <button onClick={() => setAdding(false)}
                      className="text-sm px-4 py-2.5 rounded-xl" style={{background:'var(--bg-subtle)',color:'var(--text-muted)'}}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="text-5xl mb-4 opacity-20">🖼️</div>
                <p className="font-semibold" style={{color:'var(--text-muted)'}}>{pins.length===0 ? 'Your mood board is empty' : 'No pins in this category'}</p>
                <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Browse vendor portfolios and pin images that inspire you</p>
              </div>
            ) : (
              /* Masonry grid */
              <div style={{columns:'2 180px', gap:12}}>
                {filtered.map(pin => (
                  <div key={pin.id} className="group relative rounded-2xl overflow-hidden mb-3 break-inside-avoid"
                    style={{border:'1px solid var(--border)'}}>
                    <img src={pin.imageUrl} alt={pin.caption??'Pin'} className="w-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src=`https://placehold.co/300x400?text=${pin.category}` }}/>
                    <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all"
                      style={{background:'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'}}>
                      {pin.caption && <p className="text-white text-xs font-medium mb-1">{pin.caption}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-[10px] capitalize">{pin.category}</span>
                        <button onClick={() => del(pin.id)}
                          className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{background:'rgba(239,68,68,0.8)', color:'#fff'}}>
                          ✕
                        </button>
                      </div>
                    </div>
                    {pin.sourceVendorId && (
                      <div className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{background:'rgba(200,169,110,0.9)'}}>
                        VowConnect
                      </div>
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