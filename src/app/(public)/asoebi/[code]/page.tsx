'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Group {
  id: string; shareCode: string; eventType: string; eventDate: string
  status: string; maxSlots: number; location?: string; notes?: string
  vendor: { businessName: string; location: string; category: { name: string; emoji: string }; portfolio: { url: string }[] }
  leadClient: { name: string }
  members: { id: string; name: string; status: string }[]
}

export default function AsoebiJoinPage() {
  const { code } = useParams() as { code: string }
  const [group,   setGroup]   = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [joined,  setJoined]  = useState(false)
  const [form,    setForm]    = useState({ name:'', phone:'' })
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    fetch(`/api/asoebi/${code}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setGroup(d); setLoading(false) })
      .catch(() => { setError('Could not load group'); setLoading(false) })
  }, [code])

  async function handleJoin() {
    if (!form.name.trim()) { setError('Please enter your name'); return }
    setSaving(true); setError('')
    const res = await fetch(`/api/asoebi/${code}`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() || null }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Could not join'); setSaving(false); return }
    setJoined(true); setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-theme-subtle flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3 animate-bounce">💃</div><p className="text-theme-faint">Loading...</p></div>
    </div>
  )

  if (!group) return (
    <div className="min-h-screen bg-theme-subtle flex items-center justify-center p-4">
      <div className="card p-8 text-center max-w-sm">
        <div className="text-4xl mb-3">😕</div>
        <h2 className="font-display text-2xl font-bold text-theme mb-2">Group Not Found</h2>
        <p className="text-theme-muted text-sm">{error || 'This invite link may have expired or been closed.'}</p>
        <a href="/" className="btn-primary mt-4 justify-center inline-flex">Visit VowConnect</a>
      </div>
    </div>
  )

  const eventDate = new Date(group.eventDate).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
  const isFull    = group.members.length >= group.maxSlots || group.status !== 'OPEN'

  return (
    <div className="min-h-screen bg-theme-subtle">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        {group.vendor.portfolio[0] ? (
          <img src={group.vendor.portfolio[0].url} alt="" className="w-full h-full object-cover"/>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A0A0A] to-[#1A0808]"/>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="font-display text-2xl font-bold text-white">{group.vendor.businessName}</div>
          <div className="text-white/40 text-sm">{group.vendor.category.emoji} {group.vendor.category.name} · 📍 {group.vendor.location}</div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Group info */}
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💃</span>
            <div>
              <div className="font-semibold text-theme">Asoebi Group Booking</div>
              <div className="text-xs text-theme-faint">Organised by {group.leadClient.name}</div>
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-theme">
            <div>🎊 <strong>{group.eventType}</strong></div>
            <div>📅 {eventDate}</div>
            {group.location && <div>📍 {group.location}</div>}
            {group.notes && <div>📝 {group.notes}</div>}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-theme-muted">Spots filled</span>
              <span className="font-bold text-theme">{group.members.length} / {group.maxSlots}</span>
            </div>
            <div className="w-full bg-theme-subtle rounded-full h-2">
              <div className="h-2 bg-gradient-to-r from-[#C8A96E]-400 to-gold-600 rounded-full transition-all"
                style={{width:`${(group.members.length/group.maxSlots)*100}%`}}/>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="card p-5 mb-4">
          <h3 className="font-semibold text-theme mb-3 text-sm">Who's In 👥</h3>
          <div className="flex flex-wrap gap-2">
            {group.members.map((m,i)=>(
              <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-theme-subtle border border-[var(--border)]">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#F5ECD8] to-[#EAD5B0] flex items-center justify-center text-xs font-bold text-theme">{i+1}</div>
                <span className="text-xs text-theme">{m.name}</span>
                {m.status==='CONFIRMED' && <span className="text-green-500 text-xs">✓</span>}
              </div>
            ))}
            {Array.from({length: group.maxSlots - group.members.length}, (_,i)=>(
              <div key={`empty${i}`} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-dashed border-[var(--border)]">
                <span className="text-xs text-theme-faint">Open spot</span>
              </div>
            ))}
          </div>
        </div>

        {/* Join form */}
        {joined ? (
          <div className="card p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="font-display text-2xl font-bold text-theme mb-2">You're In!</h2>
            <p className="text-theme-muted text-sm mb-4">
              You've joined the group booking with <strong>{group.vendor.businessName}</strong>. The lead bride will be in touch with details.
            </p>
            <a href="/" className="btn-ghost inline-flex justify-center text-sm">Explore VowConnect</a>
          </div>
        ) : isFull ? (
          <div className="card p-6 text-center">
            <div className="text-4xl mb-3">😔</div>
            <h2 className="font-display text-xl font-bold text-theme mb-2">
              {group.status !== 'OPEN' ? 'Group Closed' : 'Group Is Full'}
            </h2>
            <p className="text-theme-muted text-sm">This group is no longer accepting new members.</p>
          </div>
        ) : (
          <div className="card p-5">
            <h3 className="font-semibold text-theme mb-4">Join This Group</h3>
            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="label">Your Name *</label>
                <input className="input" placeholder="e.g. Amaka Johnson" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
              </div>
              <div>
                <label className="label">WhatsApp Number (for updates)</label>
                <input className="input" type="tel" placeholder="+2348012345678 or +447911123456" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
              </div>
              <button onClick={handleJoin} disabled={saving||!form.name.trim()} className="btn-primary w-full justify-center disabled:opacity-50">
                {saving ? 'Joining...' : '💃 Join This Group'}
              </button>
              <p className="text-xs text-theme-faint text-center">
                By joining you confirm your interest. The vendor will contact the group to confirm final arrangements.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
