'use client'
import { useState } from 'react'
import Link from 'next/link'

// ── Quiz steps ────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'role',
    question: "Are you planning a wedding or promoting your services?",
    subtitle: "This helps us tailor recommendations for you",
    type: 'single',
    options: [
      { value: 'bride',  label: "I'm a bride/family planning a wedding", icon: '💍' },
      { value: 'vendor', label: "I'm a vendor looking to list my services", icon: '🧣' },
    ],
  },
  {
    id: 'style',
    question: "What kind of wedding are you planning?",
    subtitle: "Select all that apply",
    type: 'multi',
    options: [
      { value: 'traditional', label: 'Traditional Nigerian ceremony',  icon: '🪘' },
      { value: 'white',       label: 'White wedding / church',         icon: '⛪' },
      { value: 'court',       label: 'Court / registry wedding',       icon: '⚖️' },
      { value: 'destination', label: 'Destination wedding',            icon: '✈️' },
      { value: 'intimate',    label: 'Intimate gathering (under 50)',   icon: '🌿' },
      { value: 'owambe',      label: "Big owambe (200+ guests)",       icon: '🎉' },
    ],
  },
  {
    id: 'location',
    question: "Where is your wedding taking place?",
    subtitle: "We'll match you with vendors who work in that area",
    type: 'single',
    options: [
      { value: 'NG-Lagos',   label: 'Lagos, Nigeria',       icon: '🇳🇬' },
      { value: 'NG-Abuja',   label: 'Abuja, Nigeria',       icon: '🇳🇬' },
      { value: 'NG-PH',      label: 'Port Harcourt, Nigeria', icon: '🇳🇬' },
      { value: 'GB-London',  label: 'London, UK',           icon: '🇬🇧' },
      { value: 'GB-Midlands',label: 'Birmingham / Midlands, UK', icon: '🇬🇧' },
      { value: 'US-Houston', label: 'Houston / Atlanta, US', icon: '🇺🇸' },
      { value: 'CA-Toronto', label: 'Toronto, Canada',      icon: '🇨🇦' },
      { value: 'other',      label: 'Somewhere else',       icon: '🌍' },
    ],
  },
  {
    id: 'timing',
    question: "When is your wedding?",
    type: 'single',
    options: [
      { value: 'under3',   label: 'Under 3 months away',    icon: '🔥' },
      { value: '3to6',     label: '3–6 months away',        icon: '⏳' },
      { value: '6to12',    label: '6–12 months away',       icon: '📅' },
      { value: 'over12',   label: 'More than a year away',  icon: '🌱' },
      { value: 'flexible', label: "Date not set yet",       icon: '🤷' },
    ],
  },
  {
    id: 'vendors',
    question: "Which vendors do you still need to book?",
    subtitle: "Select everything you're still searching for",
    type: 'multi',
    options: [
      { value: 'gele',        label: 'Gele / Head Tie Stylist',    icon: '🧣' },
      { value: 'makeup',      label: 'Makeup Artist',              icon: '💄' },
      { value: 'photographer',label: 'Photographer',               icon: '📸' },
      { value: 'videographer',label: 'Videographer',               icon: '🎥' },
      { value: 'decorator',   label: 'Decorator / Venue Stylist',  icon: '🌸' },
      { value: 'catering',    label: 'Caterer',                    icon: '🍲' },
      { value: 'dj',          label: 'DJ / Live Band',             icon: '🎵' },
      { value: 'cake',        label: 'Cake Designer',              icon: '🎂' },
      { value: 'asoebi',      label: 'Aso-ebi Tailor',            icon: '🪡' },
      { value: 'content',     label: 'Content Creator',            icon: '🎬' },
      { value: 'planner',     label: 'Wedding Planner',            icon: '📋' },
    ],
  },
  {
    id: 'budget',
    question: "What's your total vendor budget?",
    subtitle: "Helps us show vendors in your price range",
    type: 'single',
    options: [
      { value: 'budget',   label: 'Under ₦500k / £500 / $500',  icon: '💰' },
      { value: 'mid',      label: '₦500k–2m / £500–2k / $500–2k', icon: '💵' },
      { value: 'premium',  label: '₦2m–5m / £2k–5k / $2k–5k',   icon: '💎' },
      { value: 'luxury',   label: 'Over ₦5m / £5k / $5k',        icon: '👑' },
      { value: 'unsure',   label: "I'm not sure yet",             icon: '🤔' },
    ],
  },
  {
    id: 'priorities',
    question: "What matters most to you when choosing a vendor?",
    subtitle: "Pick up to 3",
    type: 'multi',
    max: 3,
    options: [
      { value: 'reviews',   label: 'Lots of verified reviews',    icon: '⭐' },
      { value: 'price',     label: 'Competitive pricing',         icon: '🏷️' },
      { value: 'diaspora',  label: 'Experience with diaspora weddings', icon: '✈️' },
      { value: 'whatsapp',  label: 'Quick WhatsApp response',     icon: '💬' },
      { value: 'portfolio', label: 'Strong visual portfolio',     icon: '🖼️' },
      { value: 'packages',  label: 'Clear packaged pricing',      icon: '📦' },
      { value: 'verified',  label: 'Verified / trusted badge',    icon: '✓' },
    ],
  },
]

interface Answer { [stepId: string]: string | string[] }
interface Rec { vendorType: string; reason: string; urgency: string; searchUrl: string; icon: string }

export default function FindMyVendorPage() {
  const [step,      setStep]      = useState(0)
  const [answers,   setAnswers]   = useState<Answer>({})
  const [loading,   setLoading]   = useState(false)
  const [recs,      setRecs]      = useState<Rec[] | null>(null)
  const [summary,   setSummary]   = useState('')
  const [error,     setError]     = useState('')

  const current = STEPS[step]
  const progress = ((step) / STEPS.length) * 100

  function select(value: string) {
    if (current.type === 'single') {
      setAnswers(p => ({ ...p, [current.id]: value }))
    } else {
      const existing = (answers[current.id] as string[]) ?? []
      const max = (current as any).max
      if (existing.includes(value)) {
        setAnswers(p => ({ ...p, [current.id]: existing.filter(v => v !== value) }))
      } else if (!max || existing.length < max) {
        setAnswers(p => ({ ...p, [current.id]: [...existing, value] }))
      }
    }
  }

  function isSelected(value: string): boolean {
    const val = answers[current.id]
    if (!val) return false
    return Array.isArray(val) ? val.includes(value) : val === value
  }

  function canAdvance(): boolean {
    const val = answers[current.id]
    if (!val) return false
    if (Array.isArray(val)) return val.length > 0
    return true
  }

  function advance() {
    // Skip vendor-specific question if user is a vendor
    if (answers.role === 'vendor' && step === 0) {
      // Go straight to AI
      submit({ ...answers })
      return
    }
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else submit(answers)
  }

  async function submit(finalAnswers: Answer) {
    setLoading(true)
    setError('')
    try {
      const prompt = buildPrompt(finalAnswers)
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          mode: 'matchmaking',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.reply) throw new Error('AI unavailable')

      // Parse JSON from reply
      const text: string = data.reply
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setRecs(parsed.recommendations ?? [])
        setSummary(parsed.summary ?? '')
      } else {
        setRecs([])
        setSummary(text)
      }
    } catch (e) {
      // Fallback: generate recs from answers directly
      setRecs(generateFallbackRecs(finalAnswers))
      setSummary(generateFallbackSummary(finalAnswers))
    }
    setLoading(false)
  }

  function buildPrompt(a: Answer): string {
    if (a.role === 'vendor') {
      return `A vendor wants to list their services on VowConnect, a Nigerian wedding marketplace.
Respond ONLY with valid JSON: { "summary": "2-sentence warm welcome and what they should do next", "recommendations": [{ "vendorType": "List your business", "reason": "...", "urgency": "High", "searchUrl": "/vendor/onboarding", "icon": "🧣" }, { "vendorType": "Complete your profile", "reason": "...", "urgency": "High", "searchUrl": "/vendor/profile", "icon": "◻" }, { "vendorType": "Set your packages", "reason": "...", "urgency": "Medium", "searchUrl": "/vendor/packages", "icon": "📦" }] }`
    }
    return `A bride/family planning a wedding has answered a vendor matching quiz on VowConnect.

Their answers:
- Wedding styles: ${JSON.stringify(a.style ?? [])}
- Location: ${a.location ?? 'not specified'}
- Wedding timing: ${a.timing ?? 'not specified'}
- Vendors still needed: ${JSON.stringify(a.vendors ?? [])}
- Budget range: ${a.budget ?? 'not specified'}
- Priorities: ${JSON.stringify(a.priorities ?? [])}

Based on this, recommend their TOP 3–4 most urgent vendor types to book, in priority order. For each, give:
1. A specific reason why they need it soon given their timeline and wedding style
2. An urgency level (Urgent / Soon / When ready)
3. A search URL on VowConnect for that vendor type

Location to country code mapping: NG-Lagos/Abuja/PH → country=NG, GB → country=GB, US → country=US, CA → country=CA

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "summary": "2-3 sentence warm, culturally-aware overview of their wedding situation and what to focus on first",
  "recommendations": [
    {
      "vendorType": "Photographer",
      "reason": "specific reason for their situation",
      "urgency": "Urgent",
      "searchUrl": "/vendors?category=photographer&country=NG",
      "icon": "📸"
    }
  ]
}`
  }

  function generateFallbackRecs(a: Answer): Rec[] {
    const vendors = (a.vendors as string[]) ?? []
    const country = (a.location as string ?? '').split('-')[0] || 'NG'
    const slugMap: Record<string, { slug: string; icon: string; label: string }> = {
      gele:         { slug: 'gele-stylist',    icon: '🧣', label: 'Gele Stylist' },
      photographer: { slug: 'photographer',    icon: '📸', label: 'Photographer' },
      makeup:       { slug: 'makeup-artist',   icon: '💄', label: 'Makeup Artist' },
      videographer: { slug: 'videographer',    icon: '🎥', label: 'Videographer' },
      decorator:    { slug: 'decorator',       icon: '🌸', label: 'Decorator' },
      catering:     { slug: 'caterer',         icon: '🍲', label: 'Caterer' },
      dj:           { slug: 'dj',              icon: '🎵', label: 'DJ' },
      cake:         { slug: 'cake-designer',   icon: '🎂', label: 'Cake Designer' },
      content:      { slug: 'content-creator', icon: '🎬', label: 'Content Creator' },
    }
    return vendors.slice(0, 4).map(v => {
      const m = slugMap[v] ?? { slug: v, icon: '⭐', label: v }
      return { vendorType: m.label, reason: `Browse verified ${m.label}s available for your wedding`, urgency: 'Soon', searchUrl: `/vendors?category=${m.slug}&country=${country}`, icon: m.icon }
    })
  }

  function generateFallbackSummary(a: Answer): string {
    const loc = a.location as string ?? ''
    const timing = a.timing as string ?? ''
    const urgency = timing === 'under3' || timing === '3to6' ? 'Your wedding is coming up soon — act fast!' : "You're in a great position to plan ahead."
    return `Based on your answers, we've matched you with the most relevant vendors for your ${loc.includes('GB') ? 'UK' : loc.includes('US') ? 'US' : 'Nigerian'} wedding. ${urgency}`
  }

  // ── Results view ──────────────────────────────────────────────
  if (recs !== null) {
    const URGENCY_COLOR: Record<string, string> = { Urgent: '#ef4444', Soon: '#f59e0b', 'When ready': '#10b981' }
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#0A0A0A,#1a1008)', padding: '56px 24px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>
            Your Vendor Matches
          </h1>
          {summary && (
            <p style={{ margin: '0 auto', maxWidth: 560, fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{summary}</p>
          )}
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

          {/* Recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
            {recs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <p>No specific matches — browse all vendors to find the right fit.</p>
                <Link href="/vendors" style={{ display: 'inline-block', marginTop: 16, padding: '12px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#C9941A,#E4B520)', color: 'white', fontWeight: 700, textDecoration: 'none' }}>Browse All Vendors</Link>
              </div>
            ) : recs.map((rec, i) => (
              <div key={i} style={{ animation: `fadeUp 0.3s ease ${i * 0.08}s both`, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(201,148,26,0.12),rgba(228,181,32,0.06))', border: '1.5px solid rgba(201,148,26,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{rec.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{rec.vendorType}</span>
                    <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: `${URGENCY_COLOR[rec.urgency] ?? '#888'}15`, color: URGENCY_COLOR[rec.urgency] ?? '#888', border: `1px solid ${URGENCY_COLOR[rec.urgency] ?? '#888'}33` }}>
                      {rec.urgency}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{rec.reason}</p>
                </div>
                <Link href={rec.searchUrl}
                  style={{ flexShrink: 0, padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg,#C9941A,#E4B520)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(201,148,26,0.3)' }}>
                  Browse →
                </Link>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/vendors" style={{ padding: '12px 24px', borderRadius: 13, border: '1.5px solid var(--border)', color: 'var(--text)', fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: 'all 0.15s' }}>
              Browse All Vendors
            </Link>
            <Link href="/register" style={{ padding: '12px 24px', borderRadius: 13, background: 'var(--bg-card)', border: '1.5px solid rgba(201,148,26,0.4)', color: '#C9941A', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Save My Matches
            </Link>
            <button onClick={() => { setStep(0); setAnswers({}); setRecs(null); setSummary('') }}
              style={{ padding: '12px 24px', borderRadius: 13, border: 'none', background: 'transparent', color: 'var(--text-faint)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Loading view ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, fontFamily: 'var(--font-body)' }}>
        <style>{`@keyframes vc-spin{to{transform:rotate(360deg)}}@keyframes vc-dot{0%,80%,100%{transform:scale(0.7);opacity:0.4}40%{transform:scale(1.1);opacity:1}}`}</style>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#C9941A,#E4B520)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 4px 20px rgba(201,148,26,0.4)', animation: 'vc-spin 2s linear infinite' }}>✨</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Finding your perfect matches…</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Our AI is analysing your wedding requirements</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9941A', display: 'block', animation: `vc-dot 1.2s ease ${i * 0.2}s infinite` }} />)}
        </div>
      </div>
    )
  }

  // ── Quiz step view ─────────────────────────────────────────────
  const multiSelected = (answers[current.id] as string[]) ?? []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .quiz-opt { transition: all 0.15s; cursor: pointer; }
        .quiz-opt:hover { border-color: #C9941A !important; background: rgba(201,148,26,0.06) !important; }
      `}</style>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--bg-subtle)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#C9941A,#E4B520)', width: `${progress}%`, transition: 'width 0.4s ease', borderRadius: '0 2px 2px 0' }} />
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 40px' }}>
        {/* Step counter */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 32, textAlign: 'center' }}>
          Step {step + 1} of {STEPS.length}
        </div>

        {/* Question */}
        <div style={{ animation: 'fadeUp 0.25s ease', marginBottom: 32, textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(20px,3.5vw,30px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>
            {current.question}
          </h2>
          {current.subtitle && (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>{current.subtitle}</p>
          )}
          {(current as any).max && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#C9941A', fontWeight: 600 }}>
              {multiSelected.length}/{(current as any).max} selected
            </p>
          )}
        </div>

        {/* Options grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: current.options.length <= 3 ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 10,
          marginBottom: 32,
          animation: 'fadeUp 0.3s ease 0.05s both',
        }}>
          {current.options.map(opt => {
            const sel = isSelected(opt.value)
            return (
              <button key={opt.value} className="quiz-opt" onClick={() => select(opt.value)}
                style={{
                  padding: '14px 18px',
                  borderRadius: 14,
                  border: `2px solid ${sel ? '#C9941A' : 'var(--border)'}`,
                  background: sel ? 'rgba(201,148,26,0.09)' : 'var(--bg-card)',
                  textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: sel ? '0 0 0 3px rgba(201,148,26,0.12)' : 'none',
                }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.icon}</span>
                <span style={{ fontSize: 14, fontWeight: sel ? 700 : 500, color: sel ? '#C9941A' : 'var(--text)', flex: 1 }}>
                  {opt.label}
                </span>
                {sel && <span style={{ color: '#C9941A', fontSize: 16, flexShrink: 0 }}>✓</span>}
              </button>
            )
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              style={{ padding: '12px 22px', borderRadius: 13, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              ← Back
            </button>
          ) : <div />}

          <button onClick={advance} disabled={!canAdvance()}
            style={{
              padding: '13px 32px', borderRadius: 13, border: 'none',
              background: canAdvance() ? 'linear-gradient(135deg,#C9941A,#E4B520)' : 'var(--bg-subtle)',
              color: canAdvance() ? 'white' : 'var(--text-faint)',
              fontWeight: 700, fontSize: 15, cursor: canAdvance() ? 'pointer' : 'default',
              boxShadow: canAdvance() ? '0 4px 16px rgba(201,148,26,0.35)' : 'none',
              transition: 'all 0.15s',
            }}>
            {step === STEPS.length - 1 ? 'Find My Vendors ✨' : 'Continue →'}
          </button>
        </div>

        {error && <p style={{ textAlign: 'center', color: '#ef4444', fontSize: 13, marginTop: 16 }}>{error}</p>}
      </div>
    </div>
  )
}
