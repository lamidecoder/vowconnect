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

const RSVP = ['PENDING','ATTENDING','DECLINED','MAYBE']
const RSVP_LABEL: Record<string,string> = { PENDING:'Pending', ATTENDING:'✓ Attending', DECLINED:'✗ Declined', MAYBE:'? Maybe' }
const RSVP_COLOR: Record<string,{bg:string;color:string}> = {
  PENDING:   { bg:'rgba(100,100,100,0.1)',  color:'#888'    },
  ATTENDING: { bg:'rgba(16,185,129,0.15)',  color:'#10b981' },
  DECLINED:  { bg:'rgba(239,68,68,0.15)',   color:'#f87171' },
  MAYBE:     { bg:'rgba(200,169,110,0.15)', color:'#C8A96E' },
}

const EMPTY = { name:'', email:'', phone:'', side:'', rsvpStatus:'PENDING', dietaryNeeds:'', tableNumber:'', plusOne:false, plusOneName:'', notes:'' }

export default function GuestListPage() {
  const [guests,     setGuests]     = useState<any[]>([])
  const [stats,      setStats]      = useState<any>({})
  const [loading,    setLoading]    = useState(true)
  const [adding,     setAdding]     = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [editId,     setEditId]     = useState<string|null>(null)
  const [search,     setSearch]     = useState('')
  const [filterRsvp, setFilterRsvp] = useState('')
  const [form,       setForm]       = useState(EMPTY)

  function load() {
    const p = new URLSearchParams()
    if (filterRsvp) p.set('rsvp', filterRsvp)
    fetch(`/api/wedding/guests?${p}`, { credentials:'include' })
      .then(r => r.json())
      .then(d => { setGuests(d.guests??[]); setStats(d.stats??{}); setLoading(false) })
  }

  useEffect(() => { load() }, [filterRsvp])

  async function save() {
    setSaving(true)
    const body = editId ? { id:editId, ...form } : form
    const res  = await fetch('/api/wedding/guests', {
      method: editId ? 'PATCH' : 'POST',
      headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (editId) setGuests(p => p.map(g => g.id===editId ? data : g))
    else        setGuests(p => [...p, data])
    setAdding(false); setEditId(null); setSaving(false); setForm(EMPTY); load()
  }

  async function updateRsvp(id: string, rsvpStatus: string) {
    const res  = await fetch('/api/wedding/guests', {
      method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ id, rsvpStatus }),
    })
    const data = await res.json()
    setGuests(p => p.map(g => g.id===id ? data : g))
    load()
  }

  async function del(id: string) {
    await fetch('/api/wedding/guests', {
      method:'DELETE', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ id }),
    })
    setGuests(p => p.filter(g => g.id!==id)); load()
  }

  function startEdit(g: any) {
    setEditId(g.id)
    setForm({ name:g.name, email:g.email??'', phone:g.phone??'', side:g.side??'', rsvpStatus:g.rsvpStatus, dietaryNeeds:g.dietaryNeeds??'', tableNumber:g.tableNumber?String(g.tableNumber):'', plusOne:g.plusOne, plusOneName:g.plusOneName??'', notes:g.notes??'' })
    setAdding(true)
  }

  const filtered = guests.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase()))

  const inputStyle = { background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:10, padding:'9px 12px', width:'100%', fontSize:13, outline:'none' } as React.CSSProperties
  const labelStyle = { display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.1em', color:'var(--text-faint)', marginBottom:5 }

  return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Wedding Hub</div>
          <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Guest List</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>RSVPs, dietary needs & seating</p>
        </div>
        <button onClick={() => { setAdding(a=>!a); setEditId(null); setForm(EMPTY) }}
          className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{background:'#C8A96E'}}>
          {adding ? '✕ Cancel' : '+ Add Guest'}
        </button>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label:'Total',     value:stats.total??0,    color:'var(--text)'  },
                { label:'Attending', value:stats.attending??0, color:'#10b981'      },
                { label:'Declined',  value:stats.declined??0,  color:'#f87171'      },
                { label:'Pending',   value:stats.pending??0,   color:'#f59e0b'      },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                  <div className="font-display text-3xl font-bold" style={{color:s.color}}>{s.value}</div>
                  <div className="text-xs mt-1" style={{color:'var(--text-muted)'}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <input style={{...inputStyle, flex:1, minWidth:180}} placeholder="Search guests…" value={search} onChange={e => setSearch(e.target.value)}/>
              <select style={{...inputStyle, width:'auto'}} value={filterRsvp} onChange={e => setFilterRsvp(e.target.value)}>
                <option value="">All RSVPs</option>
                {RSVP.map(r => <option key={r} value={r}>{RSVP_LABEL[r]}</option>)}
              </select>
            </div>

            {/* Add/Edit form */}
            {adding && (
              <div className="rounded-2xl p-6 mb-6" style={{background:'var(--bg-card)', border:'1px solid rgba(200,169,110,0.3)'}}>
                <h3 className="font-semibold mb-4" style={{color:'var(--text)'}}>{editId ? 'Edit Guest' : 'Add Guest'}</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2">
                    <label style={labelStyle}>Full Name *</label>
                    <input style={inputStyle} value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Chioma Okafor"/>
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input style={inputStyle} value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Side</label>
                    <select style={inputStyle} value={form.side} onChange={e => setForm(p=>({...p,side:e.target.value}))}>
                      <option value="">Select</option>
                      <option value="bride">Bride side</option>
                      <option value="groom">Groom side</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>RSVP</label>
                    <select style={inputStyle} value={form.rsvpStatus} onChange={e => setForm(p=>({...p,rsvpStatus:e.target.value}))}>
                      {RSVP.map(r => <option key={r} value={r}>{RSVP_LABEL[r]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Table #</label>
                    <input style={inputStyle} type="number" value={form.tableNumber} onChange={e => setForm(p=>({...p,tableNumber:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Dietary Needs</label>
                    <input style={inputStyle} placeholder="e.g. Vegetarian" value={form.dietaryNeeds} onChange={e => setForm(p=>({...p,dietaryNeeds:e.target.value}))}/>
                  </div>
                </div>
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input type="checkbox" checked={form.plusOne} onChange={e => setForm(p=>({...p,plusOne:e.target.checked}))} style={{width:16,height:16}}/>
                  <span className="text-sm" style={{color:'var(--text)'}}>Bringing a +1</span>
                  {form.plusOne && <input style={{...inputStyle, width:'auto', flex:1}} placeholder="+1 name" value={form.plusOneName} onChange={e => setForm(p=>({...p,plusOneName:e.target.value}))}/>}
                </label>
                <div className="flex gap-3">
                  <button onClick={save} disabled={saving||!form.name}
                    className="text-sm font-bold px-5 py-2.5 rounded-xl text-white disabled:opacity-50" style={{background:'#C8A96E'}}>
                    {saving ? 'Saving…' : editId ? 'Update' : 'Add Guest'}
                  </button>
                  <button onClick={() => {setAdding(false);setEditId(null)}}
                    className="text-sm px-4 py-2.5 rounded-xl" style={{background:'var(--bg-subtle)',color:'var(--text-muted)'}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Guest list */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="text-5xl mb-4 opacity-20">👥</div>
                <p className="font-semibold" style={{color:'var(--text-muted)'}}>{guests.length===0 ? 'No guests yet' : 'No guests match your search'}</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                {filtered.map((g,i) => (
                  <div key={g.id} className="px-5 py-4 flex items-center gap-4 group hover:opacity-80 transition-all border-b last:border-0"
                    style={{borderColor:'var(--border)'}}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{color:'var(--text)'}}>{g.name}{g.plusOne && <span className="text-xs ml-1" style={{color:'var(--text-faint)'}}>+1{g.plusOneName?` (${g.plusOneName})`:''}</span>}</div>
                      <div className="text-xs flex gap-3 mt-0.5" style={{color:'var(--text-faint)'}}>
                        {g.email && <span>{g.email}</span>}
                        {g.side && <span className="capitalize">{g.side} side</span>}
                        {g.dietaryNeeds && <span>🥗 {g.dietaryNeeds}</span>}
                        {g.tableNumber && <span>Table {g.tableNumber}</span>}
                      </div>
                    </div>
                    <select value={g.rsvpStatus} onChange={e => updateRsvp(g.id, e.target.value)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer outline-none"
                      style={{background:RSVP_COLOR[g.rsvpStatus]?.bg, color:RSVP_COLOR[g.rsvpStatus]?.color, border:'none'}}>
                      {RSVP.map(r => <option key={r} value={r}>{RSVP_LABEL[r]}</option>)}
                    </select>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(g)} className="text-xs p-1.5 rounded-lg" style={{color:'#C8A96E'}}>✎</button>
                      <button onClick={() => del(g.id)} className="text-xs p-1.5 rounded-lg" style={{color:'#f87171'}}>✕</button>
                    </div>
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