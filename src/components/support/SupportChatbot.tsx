'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Msg { id: string; role: 'user' | 'assistant'; content: string; ts: number }

const QUICK = [
  { icon: '📅', text: 'How do I book a vendor?' },
  { icon: '🧣', text: 'Find me a Gele stylist in London' },
  { icon: '💳', text: 'How does payment work?' },
  { icon: '🏪', text: 'How do I list my business?' },
  { icon: '⚠️', text: 'I have a problem with my booking' },
]

function TypingIndicator() {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, paddingLeft:4 }}>
      <AiAvatar />
      <div style={{ display:'flex', gap:4, padding:'11px 14px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'18px 18px 18px 4px' }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#C9941A', display:'block', animation:`vc-dot 1.2s ease ${i*0.2}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

function AiAvatar() {
  return (
    <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,rgba(201,148,26,0.15),rgba(228,181,32,0.08))', border:'1.5px solid rgba(201,148,26,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>
      💬
    </div>
  )
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
}

export default function SupportChatbot() {
  const [open,    setOpen]    = useState(false)
  const [view,    setView]    = useState<'chat' | 'ticket'>('chat')
  const [msgs,    setMsgs]    = useState<Msg[]>([])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [unread,  setUnread]  = useState(0)
  const [shimmer, setShimmer] = useState(false)

  const [tf, setTf] = useState({ name:'', email:'', subject:'', description:'', category:'GENERAL', priority:'NORMAL' })
  const [tState, setTState] = useState<'idle'|'sending'|'done'|'error'>('idle')
  const [ticketNum, setTicketNum] = useState('')

  const bodyRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const uid = useRef(0)
  const nextId = () => String(++uid.current)

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{ id: nextId(), role: 'assistant', ts: Date.now(), content: "Nne, welcome! 👋 I'm VowConnect's support assistant. I can help you find the perfect vendor for your owambe, answer questions about bookings, or sort out any issues. What can I help you with today?" }])
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
    if (open) setUnread(0)
  }, [open])

  useEffect(() => { const t = setTimeout(() => setShimmer(true), 4000); return () => clearTimeout(t) }, [])

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight }, [msgs, loading])

  const sendMsg = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    const userMsg: Msg = { id: nextId(), role: 'user', content, ts: Date.now() }
    const newMsgs = [...msgs, userMsg]
    setMsgs(newMsgs)
    setLoading(true)
    if (inputRef.current) inputRef.current.style.height = '38px'
    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setMsgs(p => [...p, { id: nextId(), role: 'assistant', ts: Date.now(), content: "I'm having a little trouble right now. Please try again or switch to the 🎫 Ticket tab to reach our human support team." }])
      } else {
        setMsgs(p => [...p, { id: nextId(), role: 'assistant', content: data.reply, ts: Date.now() }])
        if (!open) setUnread(u => u + 1)
      }
    } catch {
      setMsgs(p => [...p, { id: nextId(), role: 'assistant', ts: Date.now(), content: "Network error — please check your connection or submit a support ticket." }])
    }
    setLoading(false)
  }, [input, msgs, loading, open])

  async function submitTicket() {
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

  function resetTicket() {
    setTf({ name:'', email:'', subject:'', description:'', category:'GENERAL', priority:'NORMAL' })
    setTState('idle'); setTicketNum('')
  }

  const INP: React.CSSProperties = { width:'100%', boxSizing:'border-box', padding:'9px 13px', background:'var(--bg-subtle)', border:'1.5px solid var(--border)', borderRadius:11, fontSize:13, color:'var(--text)', outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.15s' }
  const LBL: React.CSSProperties = { display:'block', fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em' }

  return (
    <>
      <style>{`
        @keyframes vc-dot   { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }
        @keyframes vc-up    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes vc-pulse { 0%{box-shadow:0 0 0 0 rgba(201,148,26,0.6)} 70%{box-shadow:0 0 0 12px rgba(201,148,26,0)} 100%{box-shadow:0 0 0 0 rgba(201,148,26,0)} }
        @keyframes vc-spin  { to{transform:rotate(360deg)} }
        .vc-widget * { box-sizing:border-box; }
        .vc-msg      { animation: vc-up 0.18s ease; }
        .vc-inp:focus { border-color:#C9941A !important; }
        .vc-fab { transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.25s ease; }
        .vc-fab:hover { transform:scale(1.08) !important; }
        @media(max-width:480px) { .vc-panel { right:0 !important;bottom:0 !important;width:100vw !important;height:100dvh !important;border-radius:0 !important; } }
      `}</style>

      <button className="vc-fab" onClick={() => setOpen(p => !p)} aria-label="Support chat"
        style={{ position:'fixed', bottom:24, right:24, zIndex:9998, width:56, height:56, borderRadius:'50%', border:'none', background:open?'#111':'linear-gradient(135deg,#C9941A,#E4B520)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:open?'0 4px 20px rgba(0,0,0,0.4)':'0 4px 20px rgba(201,148,26,0.45)', animation:shimmer&&!open?'vc-pulse 2s ease 1':'none' }}>
        <span style={{ fontSize:22, lineHeight:1, transition:'transform 0.2s', transform:open?'rotate(45deg)':'none', display:'block' }}>{open ? '✕' : '💬'}</span>
        {unread > 0 && !open && (
          <span style={{ position:'absolute', top:-3, right:-3, minWidth:18, height:18, borderRadius:9, background:'#ef4444', color:'white', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', border:'2px solid white' }}>{unread}</span>
        )}
      </button>

      {open && (
        <div className="vc-panel vc-widget" style={{ position:'fixed', bottom:92, right:24, zIndex:9997, width:375, height:560, borderRadius:22, background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'0 24px 64px rgba(0,0,0,0.22),0 4px 16px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', overflow:'hidden', animation:'vc-up 0.22s cubic-bezier(0.34,1.56,0.64,1)', fontFamily:'var(--font-body)' }}>

          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#1a1008,#2a1a0a)', padding:'14px 18px', flexShrink:0, display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(201,148,26,0.2)' }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#C9941A,#E4B520)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, boxShadow:'0 2px 12px rgba(201,148,26,0.4)' }}>💬</div>
            <div style={{ flex:1 }}>
              <div style={{ color:'white', fontWeight:700, fontSize:14 }}>VowConnect Support</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'block', boxShadow:'0 0 6px #4ade8088' }} />
                <span style={{ color:'rgba(255,255,255,0.55)', fontSize:11 }}>AI assistant · Online</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.08)', borderRadius:10, padding:3 }}>
              {[['chat','💬 Chat'],['ticket','🎫 Ticket']].map(([t,l]) => (
                <button key={t} onClick={() => setView(t as any)} style={{ padding:'5px 10px', borderRadius:8, border:'none', cursor:'pointer', background:view===t?'white':'transparent', color:view===t?'#C9941A':'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, transition:'all 0.15s' }}>{l}</button>
              ))}
            </div>
          </div>

          {/* CHAT */}
          {view === 'chat' && (
            <>
              <div ref={bodyRef} style={{ flex:1, overflowY:'auto', padding:'14px 14px 8px', display:'flex', flexDirection:'column', gap:10, scrollBehavior:'smooth' }}>
                {msgs.map((msg, i) => {
                  const isAi = msg.role === 'assistant'
                  const showAvatar = isAi && (i === 0 || msgs[i-1]?.role !== 'assistant')
                  return (
                    <div key={msg.id} className="vc-msg" style={{ display:'flex', flexDirection:'column', alignItems:isAi?'flex-start':'flex-end', gap:3 }}>
                      <div style={{ display:'flex', alignItems:'flex-end', gap:7, flexDirection:isAi?'row':'row-reverse' }}>
                        {isAi ? (showAvatar ? <AiAvatar /> : <div style={{ width:28, flexShrink:0 }} />) : null}
                        <div style={{ maxWidth:'82%', padding:'10px 14px', borderRadius:isAi?'4px 18px 18px 18px':'18px 4px 18px 18px', background:isAi?'var(--bg-subtle)':'linear-gradient(135deg,#C9941A,#B8841A)', border:isAi?'1px solid var(--border)':'none', color:isAi?'var(--text)':'white', fontSize:13, lineHeight:1.58, wordBreak:'break-word', boxShadow:isAi?'none':'0 2px 8px rgba(201,148,26,0.3)' }}>
                          {msg.content}
                        </div>
                      </div>
                      <span style={{ fontSize:10, color:'var(--text-faint)', paddingLeft:isAi?36:0, paddingRight:isAi?0:2 }}>{fmtTime(msg.ts)}</span>
                    </div>
                  )
                })}
                {loading && <TypingIndicator />}
                {msgs.length === 1 && !loading && (
                  <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:4 }}>
                    <p style={{ margin:0, fontSize:11, color:'var(--text-faint)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em' }}>Quick questions</p>
                    {QUICK.map(q => (
                      <button key={q.text} onClick={() => sendMsg(q.text)}
                        style={{ textAlign:'left', padding:'9px 13px', borderRadius:11, border:'1.5px solid rgba(201,148,26,0.25)', background:'rgba(201,148,26,0.04)', color:'var(--text)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(201,148,26,0.1)'; (e.currentTarget as HTMLElement).style.borderColor='#C9941A' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(201,148,26,0.04)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(201,148,26,0.25)' }}
                      ><span>{q.icon}</span> {q.text}</button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ padding:'10px 12px 12px', borderTop:'1px solid var(--border)', background:'var(--bg-card)', flexShrink:0 }}>
                <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                  <textarea ref={inputRef} className="vc-inp" value={input}
                    onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,110)+'px' }}
                    onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg()} }}
                    placeholder="Type a message… (Enter to send)" rows={1} disabled={loading}
                    style={{ flex:1, resize:'none', overflow:'hidden', minHeight:38, padding:'9px 13px', background:'var(--bg-subtle)', border:'1.5px solid var(--border)', borderRadius:16, fontSize:13, color:'var(--text)', outline:'none', fontFamily:'var(--font-body)', lineHeight:1.5, transition:'border-color 0.15s' }}
                  />
                  <button onClick={() => sendMsg()} disabled={!input.trim()||loading}
                    style={{ width:38, height:38, borderRadius:'50%', border:'none', flexShrink:0, background:input.trim()?'linear-gradient(135deg,#C9941A,#E4B520)':'var(--bg-subtle)', color:input.trim()?'white':'var(--text-faint)', cursor:input.trim()?'pointer':'default', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:input.trim()?'0 2px 10px rgba(201,148,26,0.4)':'none', transition:'all 0.15s' }}>
                    {loading ? <span style={{ width:14, height:14, border:'2px solid currentColor', borderTopColor:'transparent', borderRadius:'50%', animation:'vc-spin 0.6s linear infinite', display:'block' }} /> : '↑'}
                  </button>
                </div>
                <div style={{ marginTop:7, textAlign:'center' }}>
                  <button onClick={() => setView('ticket')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'var(--text-faint)', transition:'color 0.15s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#C9941A'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='var(--text-faint)'}>
                    Need human support? Submit a ticket →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TICKET */}
          {view === 'ticket' && (
            <div style={{ flex:1, overflowY:'auto', padding:18 }}>
              {tState === 'done' ? (
                <div style={{ textAlign:'center', padding:'32px 16px' }}>
                  <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
                  <h3 style={{ margin:'0 0 8px', fontSize:18, fontWeight:800, color:'var(--text)' }}>Ticket Submitted!</h3>
                  <div style={{ background:'rgba(201,148,26,0.08)', border:'1px solid rgba(201,148,26,0.25)', borderRadius:12, padding:'12px 18px', margin:'14px 0' }}>
                    <p style={{ fontSize:11, color:'var(--text-muted)', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Your ticket number</p>
                    <p style={{ fontSize:18, fontWeight:900, color:'#C9941A', margin:0, fontFamily:'monospace', letterSpacing:'0.05em' }}>{ticketNum}</p>
                  </div>
                  <p style={{ color:'var(--text-muted)', fontSize:12, lineHeight:1.6 }}>We'll reply to your email within 24 hours.</p>
                  <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:18 }}>
                    <button onClick={resetTicket} style={{ padding:'9px 18px', borderRadius:11, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:12, fontWeight:600 }}>Submit Another</button>
                    <button onClick={() => setView('chat')} style={{ padding:'9px 18px', borderRadius:11, border:'none', background:'linear-gradient(135deg,#C9941A,#E4B520)', color:'white', cursor:'pointer', fontSize:12, fontWeight:700 }}>Back to Chat</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom:16 }}>
                    <h3 style={{ margin:'0 0 4px', fontSize:15, fontWeight:800, color:'var(--text)' }}>Submit a Support Ticket</h3>
                    <p style={{ margin:0, fontSize:12, color:'var(--text-muted)' }}>Our team responds within 24 hours</p>
                  </div>
                  {tState === 'error' && (
                    <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', fontSize:12, marginBottom:14 }}>
                      Something went wrong. Please try again or email support@vowconnect.com
                    </div>
                  )}
                  <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div>
                        <label style={LBL}>Name *</label>
                        <input className="vc-inp" style={INP} value={tf.name} onChange={e => setTf(p => ({...p,name:e.target.value}))} placeholder="Amaka Obi" />
                      </div>
                      <div>
                        <label style={LBL}>Email *</label>
                        <input className="vc-inp" style={INP} type="email" value={tf.email} onChange={e => setTf(p => ({...p,email:e.target.value}))} placeholder="amaka@email.com" />
                      </div>
                    </div>
                    <div>
                      <label style={LBL}>Category</label>
                      <select className="vc-inp" style={INP} value={tf.category} onChange={e => setTf(p => ({...p,category:e.target.value}))}>
                        {[['GENERAL','🔍 General Question'],['BOOKING','📅 Booking Issue'],['PAYMENT','💳 Payment Problem'],['VENDOR','🧣 Vendor Problem'],['ACCOUNT','👤 Account Help'],['OTHER','❓ Other']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={LBL}>Subject *</label>
                      <input className="vc-inp" style={INP} value={tf.subject} onChange={e => setTf(p => ({...p,subject:e.target.value}))} placeholder="Brief description of your issue" />
                    </div>
                    <div>
                      <label style={LBL}>Priority</label>
                      <div style={{ display:'flex', gap:6 }}>
                        {[['NORMAL','Normal'],['HIGH','High'],['URGENT','Urgent']].map(([v,l]) => (
                          <button key={v} onClick={() => setTf(p => ({...p,priority:v}))}
                            style={{ flex:1, padding:'7px', borderRadius:9, border:'1.5px solid', borderColor:tf.priority===v?(v==='URGENT'?'#ef4444':v==='HIGH'?'#f59e0b':'#C9941A'):'var(--border)', background:tf.priority===v?(v==='URGENT'?'rgba(239,68,68,0.1)':v==='HIGH'?'rgba(245,158,11,0.1)':'rgba(201,148,26,0.1)'):'transparent', color:tf.priority===v?(v==='URGENT'?'#ef4444':v==='HIGH'?'#f59e0b':'#C9941A'):'var(--text-muted)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.12s' }}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={LBL}>Description *</label>
                      <textarea className="vc-inp" style={{ ...INP, resize:'vertical', minHeight:80 }} rows={4} value={tf.description} onChange={e => setTf(p => ({...p,description:e.target.value}))} placeholder="Please describe your issue in detail…" />
                    </div>
                    <button onClick={submitTicket} disabled={tState==='sending'||!tf.name||!tf.email||!tf.subject||!tf.description}
                      style={{ padding:'12px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#C9941A,#E4B520)', color:'white', fontWeight:800, fontSize:14, cursor:'pointer', opacity:(tState==='sending'||!tf.name||!tf.email||!tf.subject||!tf.description)?0.6:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'opacity 0.15s' }}>
                      {tState==='sending' ? <><span style={{ width:14, height:14, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', animation:'vc-spin 0.6s linear infinite', display:'block' }} /> Submitting…</> : '🎫 Submit Ticket'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
