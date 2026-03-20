'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
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

const CURR: Record<string,string> = { NGN:'₦', GBP:'£', USD:'$', CAD:'CA$', GHS:'GH₵', EUR:'€' }
type QStatus = 'DRAFT'|'SENT'|'ACCEPTED'|'DECLINED'|'EXPIRED'
const S_STYLE: Record<QStatus,{bg:string;color:string;label:string}> = {
  DRAFT:    { bg:'rgba(100,100,100,0.1)', color:'#888',    label:'Draft'    },
  SENT:     { bg:'rgba(200,169,110,0.15)',color:'#C8A96E', label:'Pending'  },
  ACCEPTED: { bg:'rgba(16,185,129,0.15)', color:'#10b981', label:'Accepted' },
  DECLINED: { bg:'rgba(239,68,68,0.1)',   color:'#f87171', label:'Declined' },
  EXPIRED:  { bg:'rgba(120,80,200,0.1)',  color:'#a78bfa', label:'Expired'  },
}

interface Quote {
  id:string; status:QStatus; totalAmount:number; currency:string
  createdAt:string; validUntil?:string; notes?:string
  vendor:{ id:string; businessName:string }
  items:{ label:string; price:number; quantity:number }[]
}

export default function ClientQuotesPage() {
  const [quotes,   setQuotes]   = useState<Quote[]>([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState<string|null>(null)
  const [acting,   setActing]   = useState<string|null>(null)

  useEffect(() => {
    fetch('/api/quotes', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setQuotes(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function respond(id: string, status: 'ACCEPTED'|'DECLINED') {
    setActing(id)
    const res = await fetch('/api/quotes', {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      credentials:'include', body: JSON.stringify({ id, status }),
    })
    if (res.ok) setQuotes(p => p.map(q => q.id===id ? {...q, status} : q))
    setActing(null)
  }

  const pending = quotes.filter(q => q.status === 'SENT').length

  return (
    <DashboardShell role="client" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Client</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Quotes</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
          {pending > 0 ? `${pending} quote${pending>1?'s':''} awaiting your response` : 'Vendor quotes & pricing'}
        </p>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
          </div>
        ) : quotes.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">📄</div>
            <h3 className="font-semibold text-lg mb-2" style={{color:'var(--text)'}}>No quotes yet</h3>
            <p className="text-sm mb-6" style={{color:'var(--text-muted)'}}>When a vendor sends you a quote, it will appear here</p>
            <Link href="/vendors" className="inline-flex text-sm font-bold px-5 py-2.5 rounded-xl text-white" style={{background:'#C8A96E'}}>
              Browse Vendors →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map(q => {
              const expired = q.validUntil && new Date(q.validUntil) < new Date() && q.status==='SENT'
              const status: QStatus = expired ? 'EXPIRED' : q.status
              const s = S_STYLE[status]
              const sym = CURR[q.currency] ?? ''
              const open = expanded === q.id
              const canAct = status === 'SENT'

              return (
                <div key={q.id} className="rounded-2xl overflow-hidden"
                  style={{
                    background:'var(--bg-card)',
                    border: canAct ? '1px solid rgba(200,169,110,0.4)' : '1px solid var(--border)',
                  }}>
                  {canAct && (
                    <div className="px-5 py-2 text-xs font-semibold" style={{background:'rgba(200,169,110,0.08)', color:'#C8A96E', borderBottom:'1px solid rgba(200,169,110,0.15)'}}>
                      ✨ New quote from {q.vendor.businessName}
                    </div>
                  )}
                  <button onClick={() => setExpanded(open ? null : q.id)}
                    className="w-full text-left px-6 py-4 flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold" style={{color:'var(--text)'}}>{q.vendor.businessName}</div>
                      <div className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>
                        {q.items.length} item{q.items.length!==1?'s':''} · {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="font-display text-2xl font-bold" style={{color: canAct ? '#C8A96E' : 'var(--text)'}}>
                      {sym}{q.totalAmount.toLocaleString()}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:s.bg, color:s.color}}>
                      {s.label}
                    </span>
                    <span className="text-xs" style={{color:'var(--text-faint)', transform: open?'rotate(180deg)':'none'}}> ▾</span>
                  </button>

                  {open && (
                    <div className="border-t px-6 py-5" style={{borderColor:'var(--border)', background:'var(--bg-subtle)'}}>
                      <table className="w-full text-sm mb-4">
                        <thead>
                          <tr className="text-xs font-bold uppercase tracking-widest" style={{color:'var(--text-faint)'}}>
                            <th className="text-left pb-3">Service</th>
                            <th className="text-right pb-3">Qty</th>
                            <th className="text-right pb-3">Rate</th>
                            <th className="text-right pb-3">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {q.items.map((item,i) => (
                            <tr key={i} className="border-t" style={{borderColor:'var(--border)'}}>
                              <td className="py-2.5" style={{color:'var(--text)'}}>{item.label}</td>
                              <td className="py-2.5 text-right" style={{color:'var(--text-muted)'}}>{item.quantity}</td>
                              <td className="py-2.5 text-right" style={{color:'var(--text-muted)'}}>{sym}{item.price.toLocaleString()}</td>
                              <td className="py-2.5 text-right font-semibold" style={{color:'var(--text)'}}>{sym}{(item.price*item.quantity).toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="border-t-2" style={{borderColor:'var(--border)'}}>
                            <td colSpan={3} className="pt-3 font-bold" style={{color:'var(--text)'}}>Total</td>
                            <td className="pt-3 text-right font-display text-xl font-bold" style={{color:'#C8A96E'}}>{sym}{q.totalAmount.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>

                      {q.notes && (
                        <div className="rounded-xl p-4 mb-4" style={{background:'var(--bg-card)', borderLeft:'3px solid #C8A96E'}}>
                          <p className="text-sm" style={{color:'var(--text-muted)'}}>{q.notes}</p>
                        </div>
                      )}

                      {canAct && (
                        <div className="flex gap-3 flex-wrap">
                          <button onClick={() => respond(q.id,'ACCEPTED')} disabled={!!acting}
                            className="flex-1 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                            style={{background:'#10b981', minWidth:140}}>
                            {acting===q.id ? '…' : '✓ Accept Quote'}
                          </button>
                          <button onClick={() => respond(q.id,'DECLINED')} disabled={!!acting}
                            className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
                            style={{background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)', minWidth:140}}>
                            Decline
                          </button>
                          <Link href={`/vendors/${q.vendor.id}`}
                            className="flex-1 py-3 rounded-xl font-semibold text-sm text-center"
                            style={{background:'rgba(200,169,110,0.1)', color:'#C8A96E', border:'1px solid rgba(200,169,110,0.3)', minWidth:140}}>
                            View Vendor
                          </Link>
                        </div>
                      )}
                      {status === 'ACCEPTED' && (
                        <div className="rounded-xl p-4 flex items-center gap-3" style={{background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)'}}>
                          <span className="text-xl">🎉</span>
                          <div>
                            <div className="font-bold text-sm" style={{color:'#10b981'}}>Quote accepted!</div>
                            <div className="text-xs" style={{color:'var(--text-muted)'}}>The vendor will be in touch to confirm your booking.</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}