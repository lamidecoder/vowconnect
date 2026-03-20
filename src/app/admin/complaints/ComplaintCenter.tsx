'use client'
import { useState, useRef, useEffect } from 'react'

// ── Types ──────────────────────────────────────────────────────
interface User {
  id: string; name: string; email: string; role: string
  isActive: boolean; createdAt: string; emailVerified: boolean
  vendor?: { id: string; businessName: string; status: string } | null
  _count: { bookings: number; supportTickets: number }
}
interface Reply { id: string; senderName: string; body: string; isAdmin: boolean; createdAt: string }
interface Ticket {
  id: string; ticketNumber: string; name: string; email: string
  subject: string; description: string; category: string
  priority: string; status: string; adminNotes?: string
  createdAt: string; updatedAt: string
  user?: User | null
  replies: Reply[]
  _count: { replies: number }
}
interface Report {
  id: string; reason: string; details?: string; status: string; createdAt: string
  reporter: { id: string; name: string; email: string }
  vendor: { id: string; businessName: string; status: string; user: { id: string; name: string; email: string } }
}

// ── Palette ────────────────────────────────────────────────────
const P = {
  gold:   '#C9941A',
  goldL:  '#E4B520',
  red:    '#ef4444',
  amber:  '#f59e0b',
  green:  '#10b981',
  blue:   '#3b82f6',
  purple: '#a855f7',
  muted:  'var(--text-muted)',
  faint:  'var(--text-faint)',
  bg:     'var(--bg-card)',
  subtle: 'var(--bg-subtle)',
  border: 'var(--border)',
  text:   'var(--text)',
}

const STATUS_C: Record<string,string> = { OPEN: P.red, IN_PROGRESS: P.amber, RESOLVED: P.green, CLOSED: '#6b7280' }
const PRIORITY_C: Record<string,string> = { LOW: '#6b7280', NORMAL: P.blue, HIGH: P.amber, URGENT: P.red }
const CAT_E: Record<string,string> = { GENERAL:'🔍', BOOKING:'📅', PAYMENT:'💳', VENDOR:'🧣', ACCOUNT:'👤', OTHER:'❓' }

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, background:color+'22', color, border:`1px solid ${color}44`, textTransform:'uppercase', letterSpacing:'0.06em' }}>
      {label}
    </span>
  )
}
function ts(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
}

// ── Main ──────────────────────────────────────────────────────
export default function ComplaintCenter({ tickets: initTickets, reports: initReports, users: initUsers, stats }: {
  tickets: Ticket[]; reports: Report[]; users: User[]
  stats: { openTickets: number; openReports: number; totalUsers: number; suspended: number }
}) {
  const [tab,        setTab]        = useState<'tickets' | 'reports' | 'users'>('tickets')
  const [tickets,    setTickets]    = useState(initTickets)
  const [reports,    setReports]    = useState(initReports)
  const [users,      setUsers]      = useState(initUsers)
  const [selTicket,  setSelTicket]  = useState<Ticket | null>(null)
  const [selUser,    setSelUser]    = useState<User | null>(null)
  const [selReport,  setSelReport]  = useState<Report | null>(null)
  const [search,     setSearch]     = useState('')
  const [reply,      setReply]      = useState('')
  const [notes,      setNotes]      = useState('')
  const [saving,     setSaving]     = useState(false)
  const [toast,      setToast]      = useState('')
  const [toastType,  setToastType]  = useState<'ok'|'err'>('ok')
  const [mobileDetail, setMobileDetail] = useState(false)
  // User edit form
  const [uEdit, setUEdit] = useState<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  function ok(msg: string)  { setToastType('ok');  setToast(msg); setTimeout(() => setToast(''), 3500) }
  function err(msg: string) { setToastType('err'); setToast(msg); setTimeout(() => setToast(''), 4000) }

  function openTicket(t: Ticket) {
    setSelTicket(t); setSelUser(null); setSelReport(null)
    setNotes(t.adminNotes ?? ''); setReply('')
    setMobileDetail(true)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }
  function openReport(r: Report) {
    setSelReport(r); setSelTicket(null); setSelUser(null)
    setMobileDetail(true)
  }
  function openUser(u: User) {
    setSelUser(u); setSelTicket(null); setSelReport(null)
    setUEdit({ name: u.name, email: u.email, role: u.role, isActive: u.isActive, emailVerified: u.emailVerified, newPassword: '' })
    setMobileDetail(true)
  }

  // ── Ticket actions ──────────────────────────────────────────
  async function ticketAction(updates: { status?: string; priority?: string; replyBody?: string; adminNotes?: string }) {
    if (!selTicket) return
    setSaving(true)
    const res = await fetch(`/api/support/tickets/${selTicket.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const d = await res.json()
    if (res.ok) {
      setSelTicket(d)
      setTickets(p => p.map(t => t.id === d.id ? d : t).filter(t => ['OPEN','IN_PROGRESS'].includes(t.status)))
      setReply(''); setNotes(d.adminNotes ?? '')
      ok('✓ Saved')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } else err('Error: ' + (d.error ?? 'Failed'))
    setSaving(false)
  }

  // ── Report actions ─────────────────────────────────────────
  async function reportAction(reportId: string, action: 'resolve' | 'dismiss' | 'suspend_vendor') {
    setSaving(true)
    if (action === 'suspend_vendor' && selReport) {
      // Suspend the vendor's user account
      const res = await fetch('/api/admin/users', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selReport.vendor.user.id, action: 'suspend' }),
      })
      if (!res.ok) { err('Failed to suspend vendor'); setSaving(false); return }
    }
    const res = await fetch(`/api/admin/reports`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status: action === 'dismiss' ? 'DISMISSED' : 'RESOLVED' }),
    })
    if (res.ok) {
      setReports(p => p.filter(r => r.id !== reportId))
      setSelReport(null); setMobileDetail(false)
      ok(action === 'suspend_vendor' ? '✓ Vendor suspended & report resolved' : '✓ Report updated')
    } else err('Failed to update report')
    setSaving(false)
  }

  // ── User actions ───────────────────────────────────────────
  async function userAction(userId: string, action: string) {
    if (!confirm(`Are you sure you want to ${action} this account?`)) return
    setSaving(true)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, action }),
    })
    if (res.ok) {
      if (action === 'suspend') setUsers(p => p.map(u => u.id === userId ? { ...u, isActive: false } : u))
      if (action === 'activate') setUsers(p => p.map(u => u.id === userId ? { ...u, isActive: true } : u))
      if (selUser?.id === userId) setSelUser(u => u ? { ...u, isActive: action !== 'suspend' } : u)
      ok(`✓ Account ${action}d`)
    } else err('Action failed')
    setSaving(false)
  }

  async function saveUser(userId: string) {
    if (!uEdit) return
    setSaving(true)
    const res = await fetch('/api/admin/users/edit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...uEdit }),
    })
    const d = await res.json()
    if (res.ok) {
      setUsers(p => p.map(u => u.id === userId ? { ...u, ...d } : u))
      ok('✓ User saved')
    } else err(d.error ?? 'Failed')
    setSaving(false)
  }

  // ── Filter ─────────────────────────────────────────────────
  const filteredTickets = tickets.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.ticketNumber.toLowerCase().includes(search.toLowerCase())
  )
  const filteredUsers = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.vendor?.businessName ?? '').toLowerCase().includes(search.toLowerCase())
  )
  const filteredReports = reports.filter(r =>
    !search || r.vendor.businessName.toLowerCase().includes(search.toLowerCase()) ||
    r.reporter.name.toLowerCase().includes(search.toLowerCase()) ||
    r.reason.toLowerCase().includes(search.toLowerCase())
  )

  // ── UI ─────────────────────────────────────────────────────
  const S: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    height: 'calc(100vh - 96px)',
    display: 'flex', flexDirection: 'column', position: 'relative',
  }

  return (
    <div style={S}>
      <style>{`
        @keyframes vc-toast-in { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform:rotate(360deg); } }
        .cc-list { overflow-y:auto; flex:1; }
        .cc-item { width:100%; text-align:left; border:none; cursor:pointer; transition:background 0.12s; }
        .cc-item:hover { background: var(--bg-subtle); }
        @media (max-width:900px) {
          .cc-list-panel { width:100% !important; }
          .cc-detail-panel { position:fixed!important; inset:0!important; z-index:60!important; display:${mobileDetail ? 'flex' : 'none'}!important; overflow:auto; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:9999, background:toastType==='ok'?P.green:P.red, color:'white', padding:'10px 20px', borderRadius:12, fontSize:13, fontWeight:600, boxShadow:'0 4px 20px rgba(0,0,0,0.25)', animation:'vc-toast-in 0.2s ease' }}>
          {toast}
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom:20, flexShrink:0 }}>
        <h1 style={{ margin:0, fontSize:28, fontWeight:700, color:P.text, fontFamily:'var(--font-display)' }}>
          Complaint Resolution
        </h1>
        <p style={{ margin:'4px 0 0', fontSize:13, color:P.muted }}>
          Unified centre for support tickets, vendor reports, and user management
        </p>

        {/* Stats row */}
        <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap' }}>
          {[
            { label:'Open Tickets', val:stats.openTickets, c:P.red, tab:'tickets' as const },
            { label:'Open Reports', val:stats.openReports, c:P.amber, tab:'reports' as const },
            { label:'Total Users',  val:stats.totalUsers, c:P.blue, tab:'users' as const },
            { label:'Suspended',    val:stats.suspended, c:P.purple, tab:'users' as const },
          ].map(s => (
            <button key={s.label} onClick={() => setTab(s.tab)}
              style={{ padding:'12px 20px', borderRadius:14, border:`1.5px solid ${s.c}22`, background:tab===s.tab?`${s.c}10`:'var(--bg-card)', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
              <div style={{ fontSize:11, fontWeight:600, color:P.faint, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:24, fontWeight:800, color:s.c }}>{s.val}</div>
            </button>
          ))}
        </div>

        {/* Tabs + search */}
        <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', gap:4, background:'var(--bg-subtle)', borderRadius:12, padding:3 }}>
            {([['tickets','🎫 Tickets'],['reports','🚨 Reports'],['users','👥 Users']] as const).map(([t,l]) => (
              <button key={t} onClick={() => { setTab(t); setSearch('') }}
                style={{ padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:13, background:tab===t?'var(--bg-card)':'transparent', color:tab===t?P.text:P.muted, boxShadow:tab===t?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.15s' }}>
                {l}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tab==='tickets' ? '🔍  Search tickets…' : tab==='reports' ? '🔍  Search reports…' : '🔍  Search users…'}
            style={{ flex:1, minWidth:200, padding:'10px 14px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, fontSize:13, color:P.text, outline:'none', fontFamily:'var(--font-body)' }}
          />
        </div>
      </div>

      {/* Main split layout */}
      <div style={{ flex:1, display:'flex', gap:14, overflow:'hidden', minHeight:0 }}>

        {/* ── LIST PANEL ────────────────────────────────── */}
        <div className="cc-list-panel" style={{ width:360, flexShrink:0, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', fontSize:12, fontWeight:600, color:P.muted, flexShrink:0 }}>
            {tab==='tickets' ? `${filteredTickets.length} open ticket${filteredTickets.length!==1?'s':''}` :
             tab==='reports' ? `${filteredReports.length} open report${filteredReports.length!==1?'s':''}` :
             `${filteredUsers.length} users`}
          </div>

          <div className="cc-list">
            {/* TICKETS LIST */}
            {tab === 'tickets' && (filteredTickets.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 20px', color:P.muted }}>
                <div style={{ fontSize:36, marginBottom:8, opacity:0.25 }}>🎫</div>
                <p style={{ fontSize:13, fontWeight:600, margin:0 }}>{search ? 'No results' : 'All clear! No open tickets'}</p>
              </div>
            ) : filteredTickets.map(t => {
              const active = selTicket?.id === t.id
              return (
                <button key={t.id} className="cc-item" onClick={() => openTicket(t)}
                  style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', background:active?`linear-gradient(135deg,${P.gold}10,${P.goldL}05)`:'transparent', display:'block', position:'relative' }}>
                  {active && <div style={{ position:'absolute', left:0, top:'15%', bottom:'15%', width:3, borderRadius:'0 3px 3px 0', background:`linear-gradient(180deg,${P.gold},${P.goldL})` }} />}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:5 }}>
                    <span style={{ fontSize:11, fontFamily:'monospace', color:P.gold, fontWeight:700 }}>{t.ticketNumber}</span>
                    <div style={{ display:'flex', gap:4 }}>
                      <Badge label={t.priority} color={PRIORITY_C[t.priority]??'#888'} />
                      <Badge label={t.status.replace('_',' ')} color={STATUS_C[t.status]??'#888'} />
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:P.text, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {CAT_E[t.category]??'❓'} {t.subject}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:11, color:P.muted }}>{t.name}</span>
                    <span style={{ fontSize:10, color:P.faint }}>{ts(t.createdAt)}</span>
                  </div>
                  {t._count.replies > 0 && <div style={{ fontSize:10, color:P.faint, marginTop:2 }}>💬 {t._count.replies} repl{t._count.replies===1?'y':'ies'}</div>}
                </button>
              )
            }))}

            {/* REPORTS LIST */}
            {tab === 'reports' && (filteredReports.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 20px', color:P.muted }}>
                <div style={{ fontSize:36, marginBottom:8, opacity:0.25 }}>🚨</div>
                <p style={{ fontSize:13, fontWeight:600, margin:0 }}>{search ? 'No results' : 'No open reports'}</p>
              </div>
            ) : filteredReports.map(r => {
              const active = selReport?.id === r.id
              return (
                <button key={r.id} className="cc-item" onClick={() => openReport(r)}
                  style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', background:active?`linear-gradient(135deg,${P.amber}10,${P.gold}05)`:'transparent', display:'block', position:'relative' }}>
                  {active && <div style={{ position:'absolute', left:0, top:'15%', bottom:'15%', width:3, borderRadius:'0 3px 3px 0', background:`linear-gradient(180deg,${P.amber},${P.gold})` }} />}
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:P.amber }}>🚨 {r.reason.replace(/_/g,' ')}</span>
                    <span style={{ fontSize:10, color:P.faint }}>{ts(r.createdAt)}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:P.text, marginBottom:2 }}>{r.vendor.businessName}</div>
                  <div style={{ fontSize:11, color:P.muted }}>Reported by {r.reporter.name}</div>
                </button>
              )
            }))}

            {/* USERS LIST */}
            {tab === 'users' && filteredUsers.map(u => {
              const active = selUser?.id === u.id
              return (
                <button key={u.id} className="cc-item" onClick={() => openUser(u)}
                  style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', background:active?`linear-gradient(135deg,${P.blue}10,${P.blue}05)`:'transparent', display:'block', position:'relative' }}>
                  {active && <div style={{ position:'absolute', left:0, top:'15%', bottom:'15%', width:3, borderRadius:'0 3px 3px 0', background:`linear-gradient(180deg,${P.blue},${P.purple})` }} />}
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:P.text }}>{u.name}</span>
                    <div style={{ display:'flex', gap:4 }}>
                      {!u.isActive && <Badge label="Suspended" color={P.red} />}
                      <Badge label={u.role} color={u.role==='SUPER_ADMIN'?P.purple:u.role==='VENDOR'?P.gold:P.green} />
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:P.muted }}>{u.email}</div>
                  {u.vendor && <div style={{ fontSize:11, color:P.faint, marginTop:2 }}>🧣 {u.vendor.businessName}</div>}
                  <div style={{ fontSize:10, color:P.faint, marginTop:2 }}>
                    {u._count.bookings} booking{u._count.bookings!==1?'s':''} · {u._count.supportTickets} ticket{u._count.supportTickets!==1?'s':''}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── DETAIL PANEL ──────────────────────────────── */}
        <div className="cc-detail-panel" style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Nothing selected */}
          {!selTicket && !selReport && !selUser && (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14, padding:40 }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:`rgba(201,148,26,0.1)`, border:`1px solid rgba(201,148,26,0.2)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>⚖️</div>
              <div style={{ textAlign:'center' }}>
                <h3 style={{ margin:'0 0 6px', fontSize:17, fontWeight:700, color:P.text, fontFamily:'var(--font-display)' }}>Resolution Centre</h3>
                <p style={{ margin:0, fontSize:13, color:P.muted }}>Select a ticket, report, or user to take action</p>
              </div>
            </div>
          )}

          {/* ── TICKET DETAIL ── */}
          {selTicket && (
            <>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:13, fontFamily:'monospace', color:P.gold, fontWeight:800 }}>{selTicket.ticketNumber}</span>
                      <Badge label={selTicket.status.replace('_',' ')} color={STATUS_C[selTicket.status]??'#888'} />
                      <Badge label={selTicket.priority} color={PRIORITY_C[selTicket.priority]??'#888'} />
                    </div>
                    <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:P.text }}>
                      {CAT_E[selTicket.category]} {selTicket.subject}
                    </h2>
                    <p style={{ margin:'4px 0 0', fontSize:12, color:P.muted }}>
                      From: <strong>{selTicket.name}</strong> &lt;{selTicket.email}&gt; · {ts(selTicket.createdAt)}
                      {selTicket.user && (
                        <button onClick={() => { openUser(selTicket.user!); setTab('users') }} style={{ marginLeft:8, color:P.gold, background:'none', border:'none', cursor:'pointer', fontSize:12, textDecoration:'underline' }}>
                          View User Profile →
                        </button>
                      )}
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {['OPEN','IN_PROGRESS','RESOLVED','CLOSED'].map(s => (
                      <button key={s} onClick={() => ticketAction({ status:s })} disabled={selTicket.status===s||saving}
                        style={{ padding:'5px 11px', borderRadius:10, border:`1px solid ${STATUS_C[s]}44`, background:selTicket.status===s?STATUS_C[s]+'22':'transparent', color:STATUS_C[s], fontSize:11, fontWeight:600, cursor:selTicket.status===s?'default':'pointer', opacity:selTicket.status===s?1:0.75, transition:'all 0.12s' }}>
                        {s.replace('_',' ')}
                      </button>
                    ))}
                    <button onClick={() => { if(confirm('Delete permanently?')) { fetch(`/api/support/tickets/${selTicket.id}`,{method:'DELETE'}); setTickets(p=>p.filter(t=>t.id!==selTicket.id)); setSelTicket(null); ok('Deleted') } }}
                      style={{ padding:'5px 11px', borderRadius:10, border:`1px solid ${P.red}44`, background:'transparent', color:P.red, fontSize:11, fontWeight:600, cursor:'pointer' }}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Thread */}
              <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:P.text }}>📨 Original Message</span>
                    <span style={{ fontSize:11, color:P.faint }}>{ts(selTicket.createdAt)}</span>
                  </div>
                  <p style={{ margin:0, fontSize:13, color:P.text, lineHeight:1.6, whiteSpace:'pre-wrap' }}>{selTicket.description}</p>
                </div>
                {selTicket.replies.map(r => (
                  <div key={r.id} style={{ display:'flex', justifyContent:r.isAdmin?'flex-end':'flex-start' }}>
                    <div style={{ maxWidth:'80%', padding:'12px 16px', borderRadius:r.isAdmin?'18px 18px 4px 18px':'18px 18px 18px 4px', background:r.isAdmin?`linear-gradient(135deg,${P.gold},#B8841A)`:'var(--bg-card)', border:r.isAdmin?'none':'1px solid var(--border)', color:r.isAdmin?'white':P.text, boxShadow:r.isAdmin?`0 2px 10px ${P.gold}44`:'0 1px 3px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontSize:10, fontWeight:700, marginBottom:5, opacity:0.7, textTransform:'uppercase', letterSpacing:'0.05em' }}>{r.isAdmin?'🛡 VowConnect Support':`👤 ${r.senderName}`}</div>
                      <p style={{ margin:0, fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap' }}>{r.body}</p>
                      <div style={{ fontSize:10, marginTop:5, opacity:0.6, textAlign:'right' }}>{ts(r.createdAt)}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Reply controls */}
              <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', background:'var(--bg-card)', flexShrink:0 }}>
                <div style={{ display:'flex', gap:10, marginBottom:10, flexWrap:'wrap' }}>
                  <div>
                    <label style={{ fontSize:10, fontWeight:600, color:P.faint, display:'block', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.06em' }}>Priority</label>
                    <select value={selTicket.priority} onChange={e => ticketAction({ priority:e.target.value })}
                      style={{ padding:'7px 10px', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:9, fontSize:12, color:PRIORITY_C[selTicket.priority], fontWeight:700, outline:'none' }}>
                      {['LOW','NORMAL','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={{ flex:1, minWidth:180 }}>
                    <label style={{ fontSize:10, fontWeight:600, color:P.faint, display:'block', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.06em' }}>Internal Notes</label>
                    <div style={{ display:'flex', gap:6 }}>
                      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Private (not shown to user)"
                        style={{ flex:1, padding:'7px 10px', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:9, fontSize:12, color:P.text, outline:'none' }} />
                      <button onClick={() => ticketAction({ adminNotes:notes })} style={{ padding:'7px 12px', borderRadius:9, border:'none', background:'var(--bg-subtle)', color:P.muted, cursor:'pointer', fontSize:12 }}>Save</button>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                  <textarea value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)) ticketAction({ replyBody:reply }) }}
                    placeholder="Reply to user… (Ctrl+Enter to send)" rows={3}
                    style={{ flex:1, padding:'10px 13px', resize:'none', background:'var(--bg-subtle)', border:`1.5px solid var(--border)`, borderRadius:12, fontSize:13, color:P.text, outline:'none', fontFamily:'var(--font-body)', lineHeight:1.5, transition:'border-color 0.15s' }}
                    onFocus={e => e.target.style.borderColor=P.gold} onBlur={e => e.target.style.borderColor='var(--border)'}
                  />
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <button onClick={() => ticketAction({ replyBody:reply, status:'IN_PROGRESS' })} disabled={!reply.trim()||saving}
                      style={{ padding:'10px 16px', borderRadius:10, border:'none', background:reply.trim()?`linear-gradient(135deg,${P.gold},${P.goldL})`:'var(--bg-subtle)', color:reply.trim()?'white':P.faint, fontWeight:700, fontSize:12, cursor:reply.trim()?'pointer':'default', whiteSpace:'nowrap', opacity:saving?0.6:1 }}>
                      {saving?'…':'↑ Send Reply'}
                    </button>
                    <button onClick={() => ticketAction({ replyBody:reply, status:'RESOLVED' })} disabled={!reply.trim()||saving}
                      style={{ padding:'8px 14px', borderRadius:10, border:`1px solid ${P.green}40`, background:'transparent', color:P.green, fontWeight:600, fontSize:11, cursor:reply.trim()?'pointer':'default', whiteSpace:'nowrap', opacity:reply.trim()?1:0.4 }}>
                      ✓ Reply & Resolve
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── REPORT DETAIL ── */}
          {selReport && (
            <div style={{ flex:1, overflowY:'auto', padding:24 }}>
              {/* Mobile back */}
              <button onClick={() => { setSelReport(null); setMobileDetail(false) }} style={{ display:'none', background:'none', border:'none', cursor:'pointer', color:P.gold, fontSize:14, marginBottom:12, fontWeight:600 }} className="cc-back">← Back</button>

              <div style={{ background:'rgba(245,158,11,0.06)', border:`1px solid ${P.amber}30`, borderRadius:14, padding:20, marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <span style={{ fontSize:20 }}>🚨</span>
                  <div>
                    <div style={{ fontSize:16, fontWeight:700, color:P.text }}>Vendor Report</div>
                    <div style={{ fontSize:12, color:P.muted }}>{ts(selReport.createdAt)}</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div style={{ padding:'10px 14px', background:'var(--bg-card)', borderRadius:10 }}>
                    <div style={{ fontSize:10, color:P.faint, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Reported Vendor</div>
                    <div style={{ fontSize:14, fontWeight:700, color:P.text }}>{selReport.vendor.businessName}</div>
                    <div style={{ fontSize:11, color:P.muted }}>{selReport.vendor.user.email}</div>
                    <Badge label={selReport.vendor.status} color={selReport.vendor.status==='APPROVED'?P.green:selReport.vendor.status==='SUSPENDED'?P.red:P.amber} />
                  </div>
                  <div style={{ padding:'10px 14px', background:'var(--bg-card)', borderRadius:10 }}>
                    <div style={{ fontSize:10, color:P.faint, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Reported By</div>
                    <div style={{ fontSize:14, fontWeight:700, color:P.text }}>{selReport.reporter.name}</div>
                    <div style={{ fontSize:11, color:P.muted }}>{selReport.reporter.email}</div>
                  </div>
                </div>
                <div style={{ padding:'12px 16px', background:'var(--bg-card)', borderRadius:10, marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:P.amber, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Reason: {selReport.reason.replace(/_/g,' ')}</div>
                  {selReport.details && <p style={{ margin:0, fontSize:13, color:P.text, lineHeight:1.6 }}>{selReport.details}</p>}
                </div>
              </div>

              {/* Actions */}
              <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:P.text }}>Resolution Actions</h3>
              <div style={{ display:'grid', gap:10 }}>
                {[
                  { action:'resolve' as const, label:'✓ Dismiss Report — No Action', desc:'Mark as reviewed, vendor remains active', bg:P.green, border:P.green },
                  { action:'suspend_vendor' as const, label:'⊘ Suspend Vendor Account', desc:'Immediately suspend the vendor and resolve this report', bg:P.red, border:P.red },
                  { action:'dismiss' as const, label:'✕ Dismiss as Invalid', desc:'Report appears unfounded, close without action', bg:'#6b7280', border:'#6b7280' },
                ].map(a => (
                  <div key={a.action} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:12, border:`1px solid ${a.border}22`, background:`${a.border}08` }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:P.text }}>{a.label}</div>
                      <div style={{ fontSize:11, color:P.muted, marginTop:2 }}>{a.desc}</div>
                    </div>
                    <button onClick={() => reportAction(selReport.id, a.action)} disabled={saving}
                      style={{ padding:'9px 16px', borderRadius:10, border:'none', background:a.bg, color:'white', fontWeight:700, fontSize:12, cursor:'pointer', whiteSpace:'nowrap', marginLeft:12, opacity:saving?0.6:1 }}>
                      {saving ? '…' : a.action === 'resolve' ? 'Resolve' : a.action === 'suspend_vendor' ? 'Suspend' : 'Dismiss'}
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop:16 }}>
                <a href={`/vendors/${selReport.vendor.id}`} target="_blank" rel="noreferrer"
                  style={{ fontSize:12, color:P.gold, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4 }}>
                  View Vendor Public Profile →
                </a>
              </div>
            </div>
          )}

          {/* ── USER DETAIL ── */}
          {selUser && uEdit && (
            <div style={{ flex:1, overflowY:'auto', padding:24 }}>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:`linear-gradient(135deg,${P.gold}22,${P.goldL}11)`, border:`2px solid ${P.gold}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:P.gold }}>
                  {selUser.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:18, fontWeight:700, color:P.text }}>{selUser.name}</div>
                  <div style={{ fontSize:12, color:P.muted }}>{selUser.email}</div>
                  <div style={{ display:'flex', gap:6, marginTop:4, flexWrap:'wrap' }}>
                    <Badge label={selUser.role} color={selUser.role==='SUPER_ADMIN'?P.purple:selUser.role==='VENDOR'?P.gold:P.green} />
                    {!selUser.isActive && <Badge label="Suspended" color={P.red} />}
                    {selUser.vendor && <Badge label={selUser.vendor.status} color={selUser.vendor.status==='APPROVED'?P.green:selUser.vendor.status==='SUSPENDED'?P.red:P.amber} />}
                  </div>
                </div>
                <a href={`/admin/users/${selUser.id}`} style={{ fontSize:12, color:P.gold, textDecoration:'none', whiteSpace:'nowrap' }}>Full Profile →</a>
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
                {[
                  { label:'Bookings', val:selUser._count.bookings },
                  { label:'Tickets',  val:selUser._count.supportTickets, c:selUser._count.supportTickets>0?P.amber:undefined },
                  { label:'Joined',   val:new Date(selUser.createdAt).toLocaleDateString('en-GB',{month:'short',year:'numeric'}) },
                ].map(s => (
                  <div key={s.label} style={{ padding:'10px 12px', background:'var(--bg-subtle)', borderRadius:10 }}>
                    <div style={{ fontSize:10, color:P.faint, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{s.label}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:(s as any).c??P.text }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Edit form */}
              <h3 style={{ margin:'0 0 12px', fontSize:14, fontWeight:700, color:P.text }}>Edit Account</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                {[
                  { label:'Full Name', key:'name', type:'text' },
                  { label:'Email', key:'email', type:'email' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:P.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.label}</label>
                    <input type={f.type} value={uEdit[f.key]} onChange={e => setUEdit((p: any) => ({...p, [f.key]:e.target.value}))}
                      style={{ width:'100%', boxSizing:'border-box', padding:'9px 12px', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:10, fontSize:13, color:P.text, outline:'none' }}
                      onFocus={e => e.target.style.borderColor=P.gold} onBlur={e => e.target.style.borderColor='var(--border)'}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, color:P.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Role</label>
                  <select value={uEdit.role} onChange={e => setUEdit((p: any) => ({...p, role:e.target.value}))}
                    style={{ width:'100%', padding:'9px 12px', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:10, fontSize:13, color:P.text, outline:'none' }}>
                    <option value="CLIENT">CLIENT</option>
                    <option value="VENDOR">VENDOR</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, color:P.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>New Password</label>
                  <input type="password" value={uEdit.newPassword} onChange={e => setUEdit((p: any) => ({...p, newPassword:e.target.value}))}
                    placeholder="Leave blank to keep current"
                    style={{ width:'100%', boxSizing:'border-box', padding:'9px 12px', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:10, fontSize:13, color:P.text, outline:'none' }}
                    onFocus={e => e.target.style.borderColor=P.gold} onBlur={e => e.target.style.borderColor='var(--border)'}
                  />
                </div>
              </div>
              <div style={{ display:'flex', gap:16, marginBottom:14 }}>
                {[
                  { key:'isActive',      label:'Account Active' },
                  { key:'emailVerified', label:'Email Verified' },
                ].map(f => (
                  <label key={f.key} style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer' }}>
                    <input type="checkbox" checked={uEdit[f.key]} onChange={e => setUEdit((p: any) => ({...p, [f.key]:e.target.checked}))} style={{ width:15, height:15 }} />
                    <span style={{ fontSize:13, color:P.text }}>{f.label}</span>
                  </label>
                ))}
              </div>
              <button onClick={() => saveUser(selUser.id)} disabled={saving}
                style={{ padding:'11px 24px', borderRadius:11, border:'none', background:`linear-gradient(135deg,${P.gold},${P.goldL})`, color:'white', fontWeight:700, fontSize:13, cursor:'pointer', opacity:saving?0.7:1, marginBottom:20 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>

              {/* Quick actions */}
              <h3 style={{ margin:'0 0 10px', fontSize:14, fontWeight:700, color:P.text }}>Quick Actions</h3>
              <div style={{ display:'grid', gap:8 }}>
                {[
                  { action:'suspend',     label:'⊘ Suspend Account', desc:'Block login immediately', color:P.amber },
                  { action:'activate',    label:'✓ Activate Account', desc:'Re-enable suspended account', color:P.green },
                  { action:'verify_email',label:'✉ Mark Email Verified', desc:'Manually verify without email link', color:P.blue },
                  { action:'delete',      label:'🗑 Soft Delete Account', desc:'Mark deleted (data preserved)', color:P.red },
                ].map(a => (
                  <div key={a.action} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, border:`1px solid ${a.color}22`, background:`${a.color}06` }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:P.text }}>{a.label}</div>
                      <div style={{ fontSize:11, color:P.muted }}>{a.desc}</div>
                    </div>
                    <button onClick={() => userAction(selUser.id, a.action)} disabled={saving}
                      style={{ padding:'7px 14px', borderRadius:9, border:'none', background:a.color, color:'white', fontWeight:700, fontSize:11, cursor:'pointer', marginLeft:12, opacity:saving?0.6:1 }}>
                      {a.action==='suspend'?'Suspend':a.action==='activate'?'Activate':a.action==='verify_email'?'Verify':a.action==='delete'?'Delete':'Go'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
