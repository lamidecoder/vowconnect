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

export default function VendorCRMPage() {
  const [clients,    setClients]    = useState<any[]>([])
  const [selected,   setSelected]   = useState<any>(null)
  const [loading,    setLoading]    = useState(true)
  const [noteText,   setNoteText]   = useState('')
  const [remindAt,   setRemindAt]   = useState('')
  const [remindNote, setRemindNote] = useState('')
  const [saving,     setSaving]     = useState(false)
  const [search,     setSearch]     = useState('')
  const [tab,        setTab]        = useState<'notes'|'reminders'>('notes')

  useEffect(() => {
    fetch('/api/vendor/crm', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setClients(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  async function addNote() {
    if (!noteText.trim() || !selected) return
    setSaving(true)
    const res = await fetch('/api/vendor/crm', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ type:'note', clientId: selected.client.id, note: noteText }),
    })
    const data = await res.json()
    setClients(p => p.map(c => c.client.id === selected.client.id ? {...c, notes:[data,...(c.notes??[])]} : c))
    setSelected((p: any) => p ? {...p, notes:[data,...(p.notes??[])]} : p)
    setNoteText(''); setSaving(false)
  }

  async function addReminder() {
    if (!remindAt || !selected) return
    setSaving(true)
    const res = await fetch('/api/vendor/crm', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ type:'reminder', clientId: selected.client.id, note: remindNote, remindAt }),
    })
    const data = await res.json()
    setClients(p => p.map(c => c.client.id === selected.client.id ? {...c, reminders:[...(c.reminders??[]),data]} : c))
    setSelected((p: any) => p ? {...p, reminders:[...(p.reminders??[]),data]} : p)
    setRemindAt(''); setRemindNote(''); setSaving(false)
  }

  async function doneReminder(id: string) {
    await fetch('/api/vendor/crm', {
      method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ type:'reminder', id, isCompleted:true }),
    })
    const upd = (arr: any[]) => arr.map(r => r.id===id ? {...r, isCompleted:true} : r)
    setClients(p => p.map(c => ({...c, reminders:upd(c.reminders??[])})))
    setSelected((p: any) => p ? {...p, reminders:upd(p.reminders??[])} : p)
  }

  const filtered = clients.filter(c => !search || c.client.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return (
    <DashboardShell role="vendor" userName="Vendor" navItems={NAV}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
      </div>
    </DashboardShell>
  )

  return (
    <DashboardShell role="vendor" userName="Vendor" navItems={NAV}>
      <div className="flex h-[calc(100vh-0px)]" style={{background:'var(--bg)'}}>
        {/* Client list */}
        <div className="w-72 flex-shrink-0 border-r flex flex-col" style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
          <div className="p-4 border-b" style={{borderColor:'var(--border)'}}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#C8A96E'}}>Client CRM</div>
            <input
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{background:'var(--bg-subtle)', color:'var(--text)', border:'1px solid var(--border)'}}
              placeholder="Search clients…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3 opacity-20">👥</div>
                <p className="text-sm" style={{color:'var(--text-muted)'}}>No clients yet</p>
                <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Clients who book you appear here</p>
              </div>
            ) : filtered.map(entry => {
              const pending = entry.reminders?.filter((r: any) => !r.isCompleted).length ?? 0
              return (
                <button key={entry.client.id} onClick={() => { setSelected(entry); setTab('notes') }}
                  className="w-full text-left px-4 py-3.5 border-b transition-all flex items-center gap-3"
                  style={{
                    borderColor:'var(--border)',
                    background: selected?.client.id===entry.client.id ? 'rgba(200,169,110,0.1)' : 'transparent',
                    borderLeft: selected?.client.id===entry.client.id ? '3px solid #C8A96E' : '3px solid transparent',
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                    {entry.client.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{entry.client.name}</div>
                    <div className="text-xs" style={{color:'var(--text-faint)'}}>{entry.bookingCount} booking{entry.bookingCount!==1?'s':''}</div>
                  </div>
                  {pending > 0 && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{background:'#f59e0b'}}>{pending}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-10">👥</div>
                <p className="font-semibold" style={{color:'var(--text-muted)'}}>Select a client</p>
                <p className="text-sm mt-1" style={{color:'var(--text-faint)'}}>Choose from the left to view details</p>
              </div>
            </div>
          ) : (
            <>
              {/* Client header */}
              <div className="px-8 py-5 border-b flex items-center gap-4" style={{borderColor:'var(--border)', background:'var(--bg-card)'}}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                  {selected.client.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl" style={{color:'var(--text)'}}>{selected.client.name}</h2>
                  <p className="text-sm" style={{color:'var(--text-muted)'}}>{selected.client.email} · {selected.bookingCount} booking{selected.bookingCount!==1?'s':''}</p>
                </div>
                <div className="flex gap-2">
                  {(['notes','reminders'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all"
                      style={{
                        background: tab===t ? '#C8A96E' : 'var(--bg-subtle)',
                        color: tab===t ? '#fff' : 'var(--text-muted)',
                      }}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {tab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <textarea
                        className="flex-1 px-4 py-3 rounded-xl text-sm resize-none outline-none"
                        style={{background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text)'}}
                        placeholder="Add a note about this client…"
                        rows={3} value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                      />
                      <button onClick={addNote} disabled={saving || !noteText.trim()}
                        className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40 self-end"
                        style={{background:'#C8A96E'}}>
                        {saving ? '…' : 'Add'}
                      </button>
                    </div>
                    {(selected.notes ?? []).length === 0 ? (
                      <div className="text-center py-12 text-sm" style={{color:'var(--text-faint)'}}>No notes yet</div>
                    ) : (selected.notes ?? []).map((n: any) => (
                      <div key={n.id} className="rounded-xl p-4" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                        <p className="text-sm" style={{color:'var(--text)'}}>{n.note}</p>
                        <p className="text-xs mt-2" style={{color:'var(--text-faint)'}}>{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'reminders' && (
                  <div className="space-y-4">
                    <div className="rounded-xl p-4" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input type="datetime-local" value={remindAt} onChange={e => setRemindAt(e.target.value)}
                          className="px-3 py-2 rounded-lg text-sm outline-none"
                          style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
                        <input placeholder="Note (optional)" value={remindNote} onChange={e => setRemindNote(e.target.value)}
                          className="px-3 py-2 rounded-lg text-sm outline-none"
                          style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}/>
                      </div>
                      <button onClick={addReminder} disabled={saving || !remindAt}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40"
                        style={{background:'#C8A96E'}}>
                        {saving ? '…' : '+ Add Reminder'}
                      </button>
                    </div>
                    {(selected.reminders ?? []).length === 0 ? (
                      <div className="text-center py-12 text-sm" style={{color:'var(--text-faint)'}}>No reminders yet</div>
                    ) : (selected.reminders ?? []).map((r: any) => (
                      <div key={r.id} className="rounded-xl p-4 flex items-center gap-4"
                        style={{background: r.isCompleted ? 'var(--bg-subtle)' : 'var(--bg-card)', border:'1px solid var(--border)', opacity: r.isCompleted ? 0.5 : 1}}>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{color:'var(--text)', textDecoration: r.isCompleted ? 'line-through' : 'none'}}>
                            {new Date(r.remindAt).toLocaleString()}
                          </p>
                          {r.note && <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>{r.note}</p>}
                        </div>
                        {!r.isCompleted && (
                          <button onClick={() => doneReminder(r.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold"
                            style={{background:'rgba(16,185,129,0.15)', color:'#10b981'}}>
                            Done ✓
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}