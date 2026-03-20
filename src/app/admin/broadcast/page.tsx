'use client'
import { useState } from 'react'
import DashboardShell from '@/components/layout/DashboardShell'

const NAV = [
  { href:'/admin/dashboard',    label:'Dashboard',      icon:'🏠' },
  { href:'/admin/vendors-list', label:'Vendors',        icon:'🏪' },
  { href:'/admin/users',        label:'Users',          icon:'👥' },
  { href:'/admin/bookings',     label:'Bookings',       icon:'📅' },
  { href:'/admin/support',      label:'Support',        icon:'🎫' },
  { href:'/admin/reports',      label:'Reports',        icon:'⚠️' },
  { href:'/admin/complaints',   label:'Disputes',       icon:'⚖️' },
  { href:'/admin/analytics',    label:'Analytics',      icon:'📊' },
  { href:'/admin/broadcast',    label:'Broadcast',      icon:'📢' },
  { href:'/admin/logs',         label:'Admin Logs',     icon:'📋' },
  { href:'/admin/system',       label:'System',         icon:'⚙️' },
]

const AUDIENCES = [
  { id:'all',     label:'Everyone',       sub:'All vendors and clients',  icon:'🌍' },
  { id:'vendors', label:'Vendors only',   sub:'All registered vendors',   icon:'🏪' },
  { id:'clients', label:'Clients only',   sub:'All registered clients',   icon:'👥' },
]

export default function BroadcastPage() {
  const [audience, setAudience] = useState('all')
  const [subject,  setSubject]  = useState('')
  const [message,  setMessage]  = useState('')
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState('')

  async function send() {
    if (!subject.trim() || !message.trim()) return
    setSending(true); setError('')
    const res = await fetch('/api/admin/broadcast', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ audience, subject, message }),
    })
    if (res.ok) { setSent(true); setSubject(''); setMessage('') }
    else { const d = await res.json(); setError(d.error ?? 'Failed to send') }
    setSending(false)
  }

  const inputStyle = { background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:12, padding:'10px 14px', width:'100%', fontSize:14, outline:'none' } as React.CSSProperties

  return (
    <DashboardShell role="admin" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Admin</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Broadcast</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Send messages to users</p>
      </div>
      <div className="p-8" style={{maxWidth:640}}>
        {sent && (
          <div className="mb-6 p-4 rounded-xl text-sm font-semibold" style={{background:'rgba(16,185,129,0.1)', color:'#10b981', border:'1px solid rgba(16,185,129,0.2)'}}>
            ✅ Broadcast sent successfully!
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm" style={{background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)'}}>
            {error}
          </div>
        )}

        <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <h2 className="font-semibold mb-4" style={{color:'var(--text)'}}>New Broadcast</h2>

          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{color:'var(--text-faint)'}}>Audience</label>
            <div className="grid grid-cols-3 gap-3">
              {AUDIENCES.map(a => (
                <button key={a.id} onClick={() => setAudience(a.id)}
                  className="p-3 rounded-xl text-left border transition-all"
                  style={{
                    background: audience===a.id ? 'rgba(200,169,110,0.12)' : 'var(--bg-subtle)',
                    borderColor: audience===a.id ? '#C8A96E' : 'var(--border)',
                  }}>
                  <div className="text-xl mb-1">{a.icon}</div>
                  <div className="text-xs font-bold" style={{color: audience===a.id ? '#C8A96E' : 'var(--text)'}}>{a.label}</div>
                  <div className="text-[10px]" style={{color:'var(--text-faint)'}}>{a.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{color:'var(--text-faint)'}}>Subject</label>
            <input style={inputStyle} placeholder="e.g. Important platform update" value={subject} onChange={e => setSubject(e.target.value)}/>
          </div>

          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{color:'var(--text-faint)'}}>Message</label>
            <textarea style={{...inputStyle, resize:'none'}} rows={6}
              placeholder="Write your message here…"
              value={message} onChange={e => setMessage(e.target.value)}/>
          </div>

          <button onClick={send} disabled={sending || !subject.trim() || !message.trim()}
            className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
            style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
            {sending ? 'Sending…' : `📢 Send to ${AUDIENCES.find(a=>a.id===audience)?.label}`}
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}