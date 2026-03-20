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

export default function ClientProfilePage() {
  const [form,    setForm]    = useState({ name:'', phone:'' })
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch('/api/auth/me', { credentials:'include' })
      .then(r => r.json())
      .then(u => { setForm({ name: u.name ?? '', phone: u.phone ?? '' }); setEmail(u.email ?? '') })
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSaved(false)
    const res = await fetch('/api/auth/profile', {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      credentials:'include', body: JSON.stringify(form),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else { const d = await res.json(); setError(d.error ?? 'Failed to save') }
    setLoading(false)
  }

  return (
    <DashboardShell role="client" userName={form.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Client</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>My Profile</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Update your account details</p>
      </div>

      <div className="p-8 max-w-lg">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
            style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
            {form.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="font-semibold text-lg" style={{color:'var(--text)'}}>{form.name || 'Your Name'}</div>
            <div className="text-sm" style={{color:'var(--text-muted)'}}>{email}</div>
          </div>
        </div>

        <form onSubmit={save} className="space-y-5">
          {[
            { label:'Full Name', key:'name',  type:'text',  placeholder:'e.g. Chidinma Eze' },
            { label:'Phone',     key:'phone', type:'tel',   placeholder:'e.g. +2348012345678' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color:'var(--text-faint)'}}>
                {f.label}
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text)'}}
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color:'var(--text-faint)'}}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 rounded-xl text-sm outline-none opacity-50 cursor-not-allowed"
              style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)'}}
            />
            <p className="text-xs mt-1" style={{color:'var(--text-faint)'}}>Email cannot be changed</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)'}}>
              {error}
            </div>
          )}
          {saved && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{background:'rgba(16,185,129,0.1)', color:'#10b981', border:'1px solid rgba(16,185,129,0.2)'}}>
              ✓ Profile saved successfully
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50"
            style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </DashboardShell>
  )
}