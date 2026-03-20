'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// ── Types ────────────────────────────────────────────────────────
interface Msg {
  id: string
  body: string
  senderId: string
  createdAt: string
  isRead: boolean
  sender?: { id: string; name: string; avatar?: string; role: string }
}
interface Conv {
  id: string
  clientId: string
  vendorId: string
  lastMsgAt: string
  messages?: Msg[]
  client?: { id: string; name: string; avatar?: string }
  vendor?: { id: string; businessName: string; user?: { avatar?: string } }
  _count?: { messages: number }
}

const VENDOR_TEMPLATES = [
  { icon: '📅', label: 'Check availability',  body: 'Thank you for reaching out! Let me check my availability for your date and get back to you shortly.' },
  { icon: '💰', label: 'Request details',      body: 'Thanks for your interest! Could you share a few more details — event date, location, and approximate guest count? This helps me give you the most accurate quote.' },
  { icon: '✅', label: 'Booking confirmed',    body: "Wonderful! I've confirmed your booking. I'll be in touch soon with the next steps. Can't wait to be part of your special day! ✨" },
  { icon: '📋', label: 'Quote follow-up',      body: "Hi! Just following up on the quote I sent over. Please let me know if you have any questions — I'd love to work with you on your big day! 🎀" },
  { icon: '🙏', label: 'Thank you',            body: "It was truly an honour to be part of your celebration! Thank you so much for choosing me. Wishing you a lifetime of love and joy. 💛" },
]

// ── Helpers ──────────────────────────────────────────────────────
function Avatar({ name, size = 40 }: { name?: string; size?: number }) {
  const initials = (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const palette  = ['#C9941A', '#8B5E3C', '#6B4C9A', '#2E7D56', '#1565C0', '#C62828']
  const color    = palette[(name?.charCodeAt(0) ?? 0) % palette.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '1A', border: `2px solid ${color}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color,
      flexShrink: 0, fontFamily: 'var(--font-body)',
      userSelect: 'none',
    }}>
      {initials}
    </div>
  )
}

function ts(iso: string) {
  const d = new Date(iso), now = new Date(), diff = now.getTime() - d.getTime()
  if (diff < 60000)    return 'just now'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000)return d.toLocaleDateString('en-GB', { weekday: 'short' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function groupByDate(msgs: Msg[]) {
  const groups: { label: string; msgs: Msg[] }[] = []
  let last = ''
  for (const m of msgs) {
    const d = new Date(m.createdAt), diff = Date.now() - d.getTime()
    const label = diff < 86400000 ? 'Today'
      : diff < 172800000 ? 'Yesterday'
      : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    if (label !== last) { groups.push({ label, msgs: [] }); last = label }
    groups[groups.length - 1].msgs.push(m)
  }
  return groups
}

// ── Main ─────────────────────────────────────────────────────────
export default function MessagingUI({
  currentUserId,
  currentRole,
}: {
  currentUserId: string
  currentRole: 'CLIENT' | 'VENDOR' | 'SUPER_ADMIN'
}) {
  const [convs,         setConvs]         = useState<Conv[]>([])
  const [active,        setActive]        = useState<Conv | null>(null)
  const [messages,      setMessages]      = useState<Msg[]>([])
  const [body,          setBody]          = useState('')
  const [loading,       setLoading]       = useState(true)
  const [msgLoading,    setMsgLoading]    = useState(false)
  const [sending,       setSending]       = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [mobileView,    setMobileView]    = useState<'list' | 'chat'>('list')
  const [search,        setSearch]        = useState('')
  const [aiReplying,    setAiReplying]    = useState(false)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pollRef     = useRef<NodeJS.Timeout | null>(null)
  const isVendor    = currentRole !== 'CLIENT'

  // Load conversations
  useEffect(() => {
    fetch('/api/messages').then(r => r.json())
      .then(d => { setConvs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Open conversation
  const openConv = useCallback(async (conv: Conv) => {
    setActive(conv)
    setMobileView('chat')
    setMsgLoading(true)
    const r = await fetch(`/api/messages?conversationId=${conv.id}`)
    const d = await r.json()
    setMessages(d.messages ?? [])
    setMsgLoading(false)
    setConvs(p => p.map(c => c.id === conv.id ? { ...c, _count: { messages: 0 } } : c))
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 60)
  }, [])

  // Poll for new messages every 5s
  useEffect(() => {
    if (!active) return
    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/messages?conversationId=${active.id}`)
      const d = await r.json()
      if (d.messages) {
        setMessages(prev => {
          if (prev.length !== d.messages.length)
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
          return d.messages
        })
      }
      fetch('/api/messages').then(r => r.json()).then(d => { if (Array.isArray(d)) setConvs(d) })
    }, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [active?.id])

  function resizeTextarea(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  async function suggestReply() {
    if (!active || aiReplying) return
    const msgs = active.messages ?? []
    if (msgs.length === 0) return
    setAiReplying(true)
    // Get last 4 messages for context
    const context = msgs.slice(-4).map((m: any) => `${m.senderName}: ${m.body}`).join('\n')
    const lastClient = msgs.filter((m: any) => !m.isVendor).slice(-1)[0]
    const prompt = `Conversation context:\n${context}\n\nLatest client message: "${lastClient?.body ?? msgs.slice(-1)[0]?.body ?? ''}"\n\nDraft a helpful vendor reply.`
    try {
      const res = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'smart_reply', prompt }),
      })
      const data = await res.json()
      if (res.ok && data.result) {
        setBody(data.result)
        setTimeout(() => { textareaRef.current?.focus(); resizeTextarea(textareaRef.current!) }, 50)
      }
    } catch {}
    setAiReplying(false)
  }

  async function send() {
    if (!body.trim() || !active || sending) return
    const opt: Msg = {
      id: 'opt-' + Date.now(), body: body.trim(), senderId: currentUserId,
      createdAt: new Date().toISOString(), isRead: false,
      sender: { id: currentUserId, name: 'You', role: currentRole },
    }
    setMessages(p => [...p, opt])
    const sent = body.trim()
    setBody('')
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    setSending(true)
    try {
      const r = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: active.id, vendorId: active.vendorId, clientId: active.clientId, body: sent }),
      })
      const d = await r.json()
      if (d.message) {
        setMessages(p => p.map(m => m.id === opt.id ? d.message : m))
        setConvs(p => p.map(c => c.id === active.id ? { ...c, messages: [d.message], lastMsgAt: d.message.createdAt } : c))
      }
    } catch { setMessages(p => p.filter(m => m.id !== opt.id)) }
    setSending(false)
    textareaRef.current?.focus()
  }

  const filtered   = convs.filter(c => {
    const n = isVendor ? c.client?.name : c.vendor?.businessName
    return !search || n?.toLowerCase().includes(search.toLowerCase())
  })
  const totalUnread = convs.reduce((s, c) => s + (c._count?.messages ?? 0), 0)

  // ── Sidebar ───────────────────────────────────────────────────
  const Sidebar = (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Sidebar header */}
      <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
              Messages
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              {convs.length} conversation{convs.length !== 1 ? 's' : ''}{totalUnread > 0 ? ` · ${totalUnread} unread` : ''}
            </p>
          </div>
          {totalUnread > 0 && (
            <span style={{
              background: 'linear-gradient(135deg,#C9941A,#E4B520)', color: 'white',
              borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700,
            }}>{totalUnread}</span>
          )}
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.35, fontSize: 14, pointerEvents: 'none' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '9px 12px 9px 34px',
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              borderRadius: 12, fontSize: 13, color: 'var(--text)',
              outline: 'none', fontFamily: 'var(--font-body)',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#C9941A'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.25 }}>💬</div>
            <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>
              {search ? 'No results' : 'No messages yet'}
            </p>
            <p style={{ fontSize: 12, opacity: 0.65, margin: 0 }}>
              {isVendor ? "When clients contact you, they'll appear here" : 'Message a vendor from their profile page'}
            </p>
          </div>
        ) : filtered.map(conv => {
          const name   = isVendor ? conv.client?.name : conv.vendor?.businessName
          const last   = conv.messages?.[0]
          const unread = conv._count?.messages ?? 0
          const isAct  = active?.id === conv.id
          return (
            <button key={conv.id} onClick={() => openConv(conv)} style={{
              width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
              padding: '13px 18px 13px 20px',
              borderBottom: '1px solid var(--border)',
              background: isAct ? 'linear-gradient(135deg,rgba(201,148,26,0.09),rgba(228,181,32,0.04))' : 'transparent',
              display: 'flex', gap: 12, alignItems: 'center',
              position: 'relative', transition: 'background 0.12s',
            }}
              onMouseEnter={e => { if (!isAct) (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)' }}
              onMouseLeave={e => { if (!isAct) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {isAct && <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 3, borderRadius: '0 3px 3px 0', background: 'linear-gradient(180deg,#C9941A,#E4B520)' }} />}
              <div style={{ position: 'relative' }}>
                <Avatar name={name} size={46} />
                {unread > 0 && (
                  <div style={{
                    position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18,
                    borderRadius: 10, background: 'linear-gradient(135deg,#C9941A,#E4B520)',
                    color: 'white', fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px', border: '2px solid var(--bg-card)',
                  }}>{unread > 9 ? '9+' : unread}</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: unread > 0 ? 700 : 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name ?? 'Unknown'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0, marginLeft: 8 }}>
                    {conv.lastMsgAt ? ts(conv.lastMsgAt) : ''}
                  </span>
                </div>
                {last && (
                  <p style={{
                    margin: 0, fontSize: 12,
                    color: unread > 0 ? 'var(--text-muted)' : 'var(--text-faint)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    fontWeight: unread > 0 ? 500 : 400,
                  }}>
                    {last.senderId === currentUserId && <span style={{ opacity: 0.6 }}>You: </span>}
                    {last.body}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // ── Chat pane ─────────────────────────────────────────────────
  const otherName = active ? (isVendor ? active.client?.name : active.vendor?.businessName) : ''

  const ChatPane = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {!active ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,rgba(201,148,26,0.12),rgba(228,181,32,0.05))',
            border: '1px solid rgba(201,148,26,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
          }}>💬</div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
              Your messages
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              {isVendor ? 'Select a conversation to reply to a client' : 'Select a conversation to continue chatting'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Chat header */}
          <div style={{
            padding: '13px 18px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            {/* Mobile back */}
            <button onClick={() => setMobileView('list')}
              className="msg-back-btn"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#C9941A', fontSize: 22, padding: '2px 8px 2px 0',
                display: 'none', alignItems: 'center',
              }}>
              ←
            </button>
            <Avatar name={otherName} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{otherName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{isVendor ? 'Client' : 'Vendor'}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column' }}>
            {msgLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}><Spinner /></div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text-faint)', fontSize: 13 }}>
                No messages yet — say hello 👋
              </div>
            ) : groupByDate(messages).map(group => (
              <div key={group.label}>
                {/* Date divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0 8px' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {group.label}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                {group.msgs.map((msg, idx) => {
                  const isMe  = msg.senderId === currentUserId
                  const isOpt = msg.id.startsWith('opt-')
                  const prev  = group.msgs[idx - 1]
                  const next  = group.msgs[idx + 1]
                  const samePrev = prev?.senderId === msg.senderId
                  const sameNext = next?.senderId === msg.senderId

                  const radius = isMe
                    ? `18px 4px ${sameNext ? '6px' : '18px'} 18px`
                    : `4px 18px 18px ${sameNext ? '6px' : '18px'}`

                  return (
                    <div key={msg.id} style={{
                      display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
                      marginBottom: sameNext ? 2 : 10, marginTop: samePrev ? 0 : 4,
                      alignItems: 'flex-end', gap: 8,
                    }}>
                      {/* Avatar (other person, last in group) */}
                      {!isMe && (
                        <div style={{ width: 28, flexShrink: 0 }}>
                          {!sameNext && <Avatar name={msg.sender?.name} size={28} />}
                        </div>
                      )}

                      <div style={{ maxWidth: '74%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        {!isMe && !samePrev && (
                          <span style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 3, paddingLeft: 2 }}>
                            {msg.sender?.name}
                          </span>
                        )}
                        <div style={{
                          padding: '10px 14px', borderRadius: radius,
                          background: isMe ? 'linear-gradient(135deg,#C9941A,#B8841A)' : 'var(--bg-card)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                          color: isMe ? '#fff' : 'var(--text)',
                          fontSize: 14, lineHeight: 1.5,
                          boxShadow: isMe ? '0 2px 10px rgba(201,148,26,0.28)' : '0 1px 3px rgba(0,0,0,0.05)',
                          opacity: isOpt ? 0.72 : 1,
                          wordBreak: 'break-word' as const,
                          transition: 'opacity 0.2s',
                        }}>
                          <p style={{ margin: 0 }}>{msg.body}</p>
                        </div>
                        {!sameNext && (
                          <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 3, paddingLeft: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                            {new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            {isMe && (
                              <span style={{ fontSize: 11, color: isOpt ? 'var(--text-faint)' : msg.isRead ? '#C9941A' : 'var(--text-faint)' }}>
                                {isOpt ? '○' : msg.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-card)',
            paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
          }}>
            {/* Templates */}
            {showTemplates && isVendor && (
              <div style={{
                marginBottom: 10, background: 'var(--bg-subtle)',
                border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden',
              }}>
                <div style={{ padding: '7px 14px 6px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)' }}>Quick Replies</span>
                </div>
                {VENDOR_TEMPLATES.map(t => (
                  <button key={t.label}
                    onClick={() => { setBody(t.body); setShowTemplates(false); setTimeout(() => textareaRef.current?.focus(), 50) }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      width: '100%', textAlign: 'left', border: 'none',
                      padding: '9px 14px', cursor: 'pointer',
                      background: 'transparent', borderBottom: '1px solid var(--border)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#C9941A', marginBottom: 1 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.body.slice(0, 80)}…</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              {isVendor && (
                <button onClick={() => setShowTemplates(p => !p)} title="Quick replies"
                  style={{
                    flexShrink: 0, width: 40, height: 40, borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: showTemplates ? 'rgba(201,148,26,0.1)' : 'var(--bg-subtle)',
                    color: showTemplates ? '#C9941A' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>⚡</button>
              )}
              {isVendor && (
                <button onClick={suggestReply} disabled={aiReplying || !active} title="AI suggest reply"
                  style={{
                    flexShrink: 0, width: 40, height: 40, borderRadius: 12,
                    border: '1.5px solid rgba(201,148,26,0.35)',
                    background: aiReplying ? 'rgba(201,148,26,0.1)' : 'transparent',
                    color: '#C9941A', cursor: aiReplying || !active ? 'default' : 'pointer',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s', fontWeight: 700,
                  }}
                  onMouseEnter={e => { if (!aiReplying && active) (e.currentTarget as HTMLElement).style.background = 'rgba(201,148,26,0.1)' }}
                  onMouseLeave={e => { if (!aiReplying) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {aiReplying
                    ? <div style={{ width: 14, height: 14, border: '2px solid #C9941A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'vc-spin 0.6s linear infinite' }} />
                    : '✨'
                  }
                </button>
              )}

              <div style={{ flex: 1, position: 'relative' }}>
                <textarea ref={textareaRef} value={body}
                  onChange={e => { setBody(e.target.value); resizeTextarea(e.target) }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Message…" rows={1}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 16px', resize: 'none', overflow: 'hidden',
                    background: 'var(--bg-subtle)', border: '1.5px solid var(--border)',
                    borderRadius: 20, fontSize: 14, color: 'var(--text)',
                    outline: 'none', fontFamily: 'var(--font-body)',
                    lineHeight: 1.5, minHeight: 42, maxHeight: 140,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#C9941A'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <button onClick={send} disabled={sending || !body.trim()}
                style={{
                  flexShrink: 0, width: 42, height: 42, borderRadius: '50%', border: 'none',
                  background: body.trim() ? 'linear-gradient(135deg,#C9941A,#E4B520)' : 'var(--bg-subtle)',
                  color: body.trim() ? 'white' : 'var(--text-faint)',
                  cursor: body.trim() ? 'pointer' : 'default', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: body.trim() ? '0 2px 14px rgba(201,148,26,0.38)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: body.trim() ? 'scale(1.05)' : 'scale(0.95)',
                }}>
                {sending
                  ? <div style={{ width: 16, height: 16, border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'vc-spin 0.7s linear infinite' }} />
                  : <span style={{ display: 'block', transform: 'rotate(0deg)', fontSize: 16, lineHeight: 1 }}>↑</span>
                }
              </button>
            </div>

            <p style={{ textAlign: 'center', margin: '5px 0 0', fontSize: 10, color: 'var(--text-faint)' }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes vc-spin { to { transform: rotate(360deg); } }

        /* Desktop: side-by-side */
        .vc-msg-root { display: flex; height: calc(100vh - 64px); overflow: hidden; }
        .vc-msg-sidebar { width: 320px; flex-shrink: 0; overflow: hidden; }
        .vc-msg-chat { flex: 1; overflow: hidden; }
        .msg-back-btn { display: none !important; }

        /* Mobile: full-screen switch */
        @media (max-width: 767px) {
          .vc-msg-root { position: relative; }
          .vc-msg-sidebar { width: 100%; position: absolute; inset: 0; z-index: 2;
            transform: translateX(${mobileView === 'list' ? '0' : '-100%'});
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          }
          .vc-msg-chat { width: 100%; position: absolute; inset: 0; z-index: 1;
            transform: translateX(${mobileView === 'chat' ? '0' : '100%'});
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          }
          .msg-back-btn { display: flex !important; }
        }
      `}</style>

      <div className="vc-msg-root">
        <div className="vc-msg-sidebar">{Sidebar}</div>
        <div className="vc-msg-chat">{ChatPane}</div>
      </div>
    </>
  )
}

function Spinner() {
  return (
    <div style={{ width: 24, height: 24, border: '2.5px solid #C9941A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'vc-spin 0.7s linear infinite' }} />
  )
}
