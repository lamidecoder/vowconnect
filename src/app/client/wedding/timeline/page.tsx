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

const EMPTY = { title:'', dueDate:'', category:'General', notes:'' }

export default function TimelinePage() {
  const [items,   setItems]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding,  setAdding]  = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [editId,  setEditId]  = useState<string|null>(null)
  const [filter,  setFilter]  = useState('all')
  const [form,    setForm]    = useState(EMPTY)

  useEffect(() => {
    fetch('/api/wedding/timeline', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    const body = editId ? { id:editId, ...form } : form
    const res  = await fetch('/api/wedding/timeline', {
      method: editId ? 'PATCH' : 'POST',
      headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (editId) setItems(p => p.map(i => i.id===editId ? data : i))
    else        setItems(p => [...p, data])
    setAdding(false); setEditId(null); setForm(EMPTY); setSaving(false)
  }

  async function toggle(item: any) {
    const res  = await fetch('/api/wedding/timeline', {
      method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ id:item.id, isCompleted:!item.isCompleted }),
    })
    const data = await res.json()
    setItems(p => p.map(i => i.id===item.id ? data : i))
  }

  async function del(id: string) {
    await fetch('/api/wedding/timeline', {
      method:'DELETE', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ id }),
    })
    setItems(p => p.filter(i => i.id!==id))
  }

  function startEdit(item: any) {
    setEditId(item.id)
    setForm({ title:item.title, dueDate:item.dueDate?.split('T')[0]??'', category:item.category??'General', notes:item.notes??'' })
    setAdding(true)
  }

  const filtered = items.filter(i =>
    filter==='all' ? true : filter==='done' ? i.isCompleted : !i.isCompleted
  )
  const done  = items.filter(i => i.isCompleted).length
  const total = items.length
  const pct   = total > 0 ? Math.round((done/total)*100) : 0

  const inputStyle = { background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:10, padding:'9px 12px', width:'100%', fontSize:13, outline:'none' } as React.CSSProperties
  const labelStyle = { display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.1em', color:'var(--text-faint)', marginBottom:5 }

  return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Wedding Hub</div>
          <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Timeline</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Milestones & tasks · {done}/{total} done</p>
        </div>
        <button onClick={() => { setAdding(a=>!a); setEditId(null); setForm(EMPTY) }}
          className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{background:'#C8A96E'}}>
          {adding ? '✕ Cancel' : '+ Add Task'}
        </button>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
          </div>
        ) : (
          <>
            {/* Progress */}
            {total > 0 && (
              <div className="rounded-2xl p-5 mb-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{color:'var(--text)'}}>{pct}% complete</span>
                  <span className="text-xs" style={{color:'var(--text-faint)'}}>{done} of {total} tasks done</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{background:'var(--bg-subtle)'}}>
                  <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, background:'linear-gradient(90deg,#C8A96E,#8B6914)'}}/>
                </div>
              </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 mb-6">
              {[['all','All'],['todo','To Do'],['done','Done']].map(([k,l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
                  style={{ background:filter===k?'#C8A96E':'var(--bg-card)', color:filter===k?'#fff':'var(--text-muted)', borderColor:filter===k?'#C8A96E':'var(--border)' }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Add form */}
            {adding && (
              <div className="rounded-2xl p-6 mb-6" style={{background:'var(--bg-card)', border:'1px solid rgba(200,169,110,0.3)'}}>
                <h3 className="font-semibold mb-4" style={{color:'var(--text)'}}>{editId ? 'Edit Task' : 'New Task'}</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2">
                    <label style={labelStyle}>Task Title *</label>
                    <input style={inputStyle} placeholder="e.g. Book photographer" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Due Date</label>
                    <input style={inputStyle} type="date" value={form.dueDate} onChange={e => setForm(p=>({...p,dueDate:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>
                      {['General','Venue','Catering','Attire','Photography','Music','Flowers','Transport','Legal','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={save} disabled={saving||!form.title}
                    className="text-sm font-bold px-5 py-2.5 rounded-xl text-white disabled:opacity-50" style={{background:'#C8A96E'}}>
                    {saving ? 'Saving…' : editId ? 'Update' : 'Add Task'}
                  </button>
                  <button onClick={() => {setAdding(false);setEditId(null)}}
                    className="text-sm px-4 py-2.5 rounded-xl" style={{background:'var(--bg-subtle)',color:'var(--text-muted)'}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Tasks */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="text-5xl mb-4 opacity-20">📋</div>
                <p className="font-semibold" style={{color:'var(--text-muted)'}}>{items.length===0 ? 'No tasks yet' : 'No tasks in this filter'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(item => (
                  <div key={item.id} className="rounded-xl px-5 py-4 flex items-center gap-4 group hover:opacity-80 transition-all"
                    style={{background:'var(--bg-card)', border:'1px solid var(--border)', opacity:item.isCompleted?0.6:1}}>
                    <button onClick={() => toggle(item)}
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                      style={{background:item.isCompleted?'#10b981':'transparent', borderColor:item.isCompleted?'#10b981':'var(--border)'}}>
                      {item.isCompleted && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{color:'var(--text)', textDecoration:item.isCompleted?'line-through':'none'}}>{item.title}</div>
                      <div className="flex items-center gap-3 text-xs mt-0.5" style={{color:'var(--text-faint)'}}>
                        {item.category && <span>{item.category}</span>}
                        {item.dueDate && <span>📅 {new Date(item.dueDate).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(item)} className="text-xs p-1.5 rounded-lg" style={{color:'#C8A96E'}}>✎</button>
                      <button onClick={() => del(item.id)} className="text-xs p-1.5 rounded-lg" style={{color:'#f87171'}}>✕</button>
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