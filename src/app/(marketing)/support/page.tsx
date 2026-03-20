'use client'
import { useState } from 'react'
import Link from 'next/link'

const FAQ = [
  { q: 'How do I book a vendor on VowConnect?', a: 'Browse vendors, open their profile, and click "Book Now" or "Send Message". The vendor will review your request and confirm availability. You can also use our AI chatbot (bottom right) to find the perfect vendor for your needs.' },
  { q: 'Is it free to browse and contact vendors?', a: 'Yes — creating an account, browsing, saving favourites, and messaging vendors is completely free for clients. Vendors pay for upgraded plans to access premium features.' },
  { q: 'What happens if a vendor cancels my booking?', a: 'If a vendor cancels, you receive a full refund automatically. You should also contact us via the support chat or submit a ticket and our team will help you find an alternative vendor quickly.' },
  { q: 'How do I list my business as a vendor?', a: 'Register for a vendor account, complete your onboarding profile, and submit for review. Our team typically approves profiles within 24 hours. Once approved, your profile goes live to thousands of brides.' },
  { q: 'What currencies and payment methods are supported?', a: 'We support NGN (Paystack), GBP/USD/CAD (Stripe). Vendors set their own prices in their local currency. You can always message a vendor to discuss payment arrangements.' },
  { q: 'How do I change or cancel a booking?', a: 'Go to My Bookings in your dashboard and select the booking. You can message the vendor directly or request a cancellation. Cancellation policies vary by vendor — check their profile for details.' },
  { q: 'Can I book multiple vendors for the same event?', a: 'Absolutely — most weddings need a photographer, Gele stylist, makeup artist, decorator, and more. Book as many vendors as you need and manage them all from your dashboard.' },
  { q: 'My account is not working — what should I do?', a: 'Try resetting your password from the login page. If that doesn\'t work, submit a support ticket below with your email address and we\'ll resolve it within 24 hours.' },
]

const CATEGORIES = [
  { icon: '📅', label: 'Booking Help', color: '#C9941A' },
  { icon: '💳', label: 'Payments', color: '#3b82f6' },
  { icon: '🧣', label: 'Vendor Issues', color: '#10b981' },
  { icon: '👤', label: 'Account', color: '#a855f7' },
  { icon: '📦', label: 'Packages & Quotes', color: '#f59e0b' },
  { icon: '❓', label: 'General', color: '#6b7280' },
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [tf, setTf] = useState({ name:'', email:'', subject:'', description:'', category:'GENERAL', priority:'NORMAL' })
  const [tState, setTState] = useState<'idle'|'sending'|'done'|'error'>('idle')
  const [ticketNum, setTicketNum] = useState('')

  async function submit() {
    if (!tf.name || !tf.email || !tf.subject || !tf.description) return
    setTState('sending')
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tf),
      })
      const d = await res.json()
      if (res.ok) { setTicketNum(d.ticketNumber ?? d.id); setTState('done') }
      else setTState('error')
    } catch { setTState('error') }
  }

  const INP: React.CSSProperties = { width:'100%', boxSizing:'border-box', padding:'12px 16px', background:'var(--bg-card)', border:'1.5px solid var(--border)', borderRadius:13, fontSize:14, color:'var(--text)', outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.15s' }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', fontFamily:'var(--font-body)' }}>
      <style>{`.vc-inp:focus{border-color:#C9941A!important;box-shadow:0 0 0 3px rgba(201,148,26,0.08)!important;}`}</style>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0A0A0A 0%,#1a1008 60%,#0A0A0A 100%)', padding:'72px 24px 60px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-60, left:'10%', width:300, height:300, borderRadius:'50%', background:'rgba(201,148,26,0.04)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, right:'5%', width:400, height:400, borderRadius:'50%', background:'rgba(201,148,26,0.03)', pointerEvents:'none' }} />

        <div style={{ position:'relative', maxWidth:640, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:20, background:'rgba(201,148,26,0.12)', border:'1px solid rgba(201,148,26,0.25)', marginBottom:20 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'block' }} />
            <span style={{ fontSize:12, color:'#C9941A', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>Support Centre</span>
          </div>
          <h1 style={{ margin:'0 0 16px', fontSize:'clamp(32px,5vw,52px)', fontWeight:800, color:'white', lineHeight:1.15, fontFamily:'var(--font-display)' }}>
            How can we help<br />
            <span style={{ background:'linear-gradient(135deg,#C9941A,#E4B520)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>you today?</span>
          </h1>
          <p style={{ margin:'0 0 32px', fontSize:16, color:'rgba(255,255,255,0.55)', lineHeight:1.6, maxWidth:480, marginLeft:'auto', marginRight:'auto' }}>
            Get instant answers from our AI assistant, or submit a ticket and our team will respond within 24 hours.
          </p>

          {/* Category pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
            {CATEGORIES.map(c => (
              <div key={c.label} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:24, background:`${c.color}15`, border:`1px solid ${c.color}30`, cursor:'default' }}>
                <span style={{ fontSize:16 }}>{c.icon}</span>
                <span style={{ fontSize:13, color:c.color, fontWeight:600 }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }}>

          {/* LEFT — FAQ */}
          <div>
            <div style={{ marginBottom:28 }}>
              <h2 style={{ margin:'0 0 6px', fontSize:26, fontWeight:800, color:'var(--text)', fontFamily:'var(--font-display)' }}>
                Frequently Asked Questions
              </h2>
              <p style={{ margin:0, fontSize:14, color:'var(--text-muted)' }}>
                Quick answers to common questions
              </p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {FAQ.map((item, i) => (
                <div key={i}
                  style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', transition:'box-shadow 0.15s', boxShadow: openFaq === i ? '0 4px 20px rgba(201,148,26,0.1)' : 'none' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width:'100%', textAlign:'left', padding:'16px 18px', border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:'var(--text)', lineHeight:1.4, flex:1 }}>{item.q}</span>
                    <span style={{ fontSize:18, color:'#C9941A', flexShrink:0, transition:'transform 0.2s', transform:openFaq===i?'rotate(45deg)':'none', display:'block' }}>+</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding:'0 18px 18px', borderTop:'1px solid var(--border)' }}>
                      <p style={{ margin:'14px 0 0', fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat CTA */}
            <div style={{ marginTop:28, padding:'20px', background:'linear-gradient(135deg,rgba(201,148,26,0.08),rgba(228,181,32,0.04))', border:'1px solid rgba(201,148,26,0.2)', borderRadius:16, display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#C9941A,#E4B520)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>💬</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:'var(--text)', fontSize:14, marginBottom:3 }}>Still have questions?</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>Click the chat bubble (bottom-right) for instant AI answers</div>
              </div>
            </div>
          </div>

          {/* RIGHT — Ticket form */}
          <div>
            <div style={{ marginBottom:28 }}>
              <h2 style={{ margin:'0 0 6px', fontSize:26, fontWeight:800, color:'var(--text)', fontFamily:'var(--font-display)' }}>
                Submit a Ticket
              </h2>
              <p style={{ margin:0, fontSize:14, color:'var(--text-muted)' }}>
                Our team responds within 24 hours
              </p>
            </div>

            {tState === 'done' ? (
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:18, padding:'48px 32px', textAlign:'center' }}>
                <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
                <h3 style={{ margin:'0 0 10px', fontSize:22, fontWeight:800, color:'var(--text)', fontFamily:'var(--font-display)' }}>Ticket Submitted!</h3>
                <div style={{ background:'rgba(201,148,26,0.08)', border:'1px solid rgba(201,148,26,0.25)', borderRadius:14, padding:'14px 20px', margin:'18px 0' }}>
                  <p style={{ margin:'0 0 4px', fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600 }}>Your ticket reference</p>
                  <p style={{ margin:0, fontSize:22, fontWeight:900, color:'#C9941A', fontFamily:'monospace', letterSpacing:'0.06em' }}>{ticketNum}</p>
                </div>
                <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.7, marginBottom:24 }}>
                  We've sent a confirmation to <strong style={{ color:'var(--text)' }}>{tf.email}</strong>.<br />
                  Our team will respond within 24 hours.
                </p>
                <button onClick={() => { setTf({ name:'', email:'', subject:'', description:'', category:'GENERAL', priority:'NORMAL' }); setTState('idle'); setTicketNum('') }}
                  style={{ padding:'12px 28px', borderRadius:12, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', fontWeight:600, fontSize:14, cursor:'pointer' }}>
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:18, padding:28 }}>
                {tState === 'error' && (
                  <div style={{ padding:'12px 16px', borderRadius:11, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', fontSize:13, marginBottom:20 }}>
                    Something went wrong. Please try again or email us at support@vowconnect.com
                  </div>
                )}

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Full Name *</label>
                    <input className="vc-inp" style={INP} value={tf.name} onChange={e => setTf(p => ({...p,name:e.target.value}))} placeholder="Amaka Obi" />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Email Address *</label>
                    <input className="vc-inp" style={INP} type="email" value={tf.email} onChange={e => setTf(p => ({...p,email:e.target.value}))} placeholder="amaka@email.com" />
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Category</label>
                    <select className="vc-inp" style={INP} value={tf.category} onChange={e => setTf(p => ({...p,category:e.target.value}))}>
                      {[['GENERAL','🔍 General'],['BOOKING','📅 Booking Issue'],['PAYMENT','💳 Payment Problem'],['VENDOR','🧣 Vendor Problem'],['ACCOUNT','👤 Account Help'],['OTHER','❓ Other']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Priority</label>
                    <div style={{ display:'flex', gap:8 }}>
                      {[['NORMAL','Normal'],['HIGH','High'],['URGENT','Urgent!']].map(([v,l]) => (
                        <button key={v} onClick={() => setTf(p => ({...p,priority:v}))}
                          style={{ flex:1, padding:'11px 6px', borderRadius:10, border:'1.5px solid', borderColor:tf.priority===v?(v==='URGENT'?'#ef4444':v==='HIGH'?'#f59e0b':'#C9941A'):'var(--border)', background:tf.priority===v?(v==='URGENT'?'rgba(239,68,68,0.08)':v==='HIGH'?'rgba(245,158,11,0.08)':'rgba(201,148,26,0.08)'):'transparent', color:tf.priority===v?(v==='URGENT'?'#ef4444':v==='HIGH'?'#f59e0b':'#C9941A'):'var(--text-muted)', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.12s' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Subject *</label>
                  <input className="vc-inp" style={INP} value={tf.subject} onChange={e => setTf(p => ({...p,subject:e.target.value}))} placeholder="Brief description of your issue" />
                </div>

                <div style={{ marginBottom:22 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Description *</label>
                  <textarea className="vc-inp" style={{ ...INP, resize:'vertical', minHeight:120, lineHeight:'1.6' }} rows={5}
                    value={tf.description} onChange={e => setTf(p => ({...p,description:e.target.value}))}
                    placeholder="Please describe your issue in detail. Include any relevant order or booking IDs…" />
                </div>

                <button onClick={submit} disabled={tState==='sending'||!tf.name||!tf.email||!tf.subject||!tf.description}
                  style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#C9941A,#E4B520)', color:'white', fontWeight:800, fontSize:15, cursor:'pointer', opacity:(tState==='sending'||!tf.name||!tf.email||!tf.subject||!tf.description)?0.6:1, transition:'opacity 0.15s, transform 0.12s', boxShadow:'0 4px 16px rgba(201,148,26,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  {tState === 'sending' ? (
                    <><span style={{ width:16, height:16, border:'2.5px solid white', borderTopColor:'transparent', borderRadius:'50%', animation:'vc-spin 0.6s linear infinite', display:'block' }} /> Submitting…</>
                  ) : '🎫 Submit Support Ticket'}
                </button>

                <p style={{ textAlign:'center', marginTop:16, fontSize:12, color:'var(--text-faint)' }}>
                  Or email us directly at{' '}
                  <a href="mailto:support@vowconnect.com" style={{ color:'#C9941A', textDecoration:'none', fontWeight:600 }}>support@vowconnect.com</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes vc-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
