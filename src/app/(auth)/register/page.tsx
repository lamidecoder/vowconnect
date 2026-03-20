'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { safeRedirectPath } from '@/lib/validate'
import { ThemeToggle } from '@/components/layout/ThemeProvider'

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

const ROLES = [
  { id: 'client', label: 'I\'m a Bride/Groom', sub: 'Find & book vendors for my wedding', icon: '👰' },
  { id: 'vendor', label: 'I\'m a Vendor',      sub: 'List my services & get booked',     icon: '🧣' },
]

function RegisterForm() {
  const router  = useRouter()
  const params  = useSearchParams()
  const next    = params.get('next') ?? ''
  const prompted = params.get('prompt') === '1'
  const defaultRole = params.get('role') === 'vendor' ? 'vendor' : 'client'

  const [step,    setStep]    = useState(prompted ? 0 : 1)
  const [role,    setRole]    = useState<'client'|'vendor'>(defaultRole as any)
  const [form,    setForm]    = useState({ name:'', email:'', password:'', phone:'' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const res  = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: role.toUpperCase() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Registration failed'); setLoading(false); return }
    const dest = next || (role === 'vendor' ? '/vendor/onboarding' : '/client/dashboard')
    window.location.href = safeRedirectPath(dest, defaultDest)
  }

  const googleUrl = `/api/auth/google?role=${role.toUpperCase()}${next ? `&next=${encodeURIComponent(next)}` : ''}`

  const STATS_CLIENT = [['500+','Verified Vendors'],['6','Countries'],['Free','To join']]
  const STATS_VENDOR = [['2,400+','Bookings/mo'],['0%','Commission'],['Free','Listing']]
  const stats = role === 'vendor' ? STATS_VENDOR : STATS_CLIENT

  return (
    <div className="min-h-screen flex bg-theme">
      {/* Left */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#080808] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(200,169,110,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,169,110,0.04) 1px,transparent 1px)',backgroundSize:'32px 32px'}}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none" style={{background:'radial-gradient(ellipse, rgba(200,169,110,0.09) 0%, transparent 65%)'}}/>
        <Link href="/" className="relative z-10">
          <span className="font-display text-2xl text-white">Vow<span className="text-[#C8A96E]">Connect</span></span>
        </Link>
        <div className="relative z-10">
          <p className="font-display text-4xl text-white/60 italic leading-tight max-w-xs mb-8">
            {role === 'vendor'
              ? 'Join hundreds of vendors already getting booked every week.'
              : 'Find your perfect Nigerian wedding vendor, wherever you are.'}
          </p>
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/6">
            {stats.map(([v,l]) => (
              <div key={l}>
                <div className="font-display text-2xl text-white">{v}</div>
                <div className="text-white/20 text-[10px] uppercase tracking-widest mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-white/10 text-xs">© {new Date().getFullYear()} VowConnect</p>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/"><span className="font-display text-2xl text-theme">Vow<span className="text-[#C8A96E]">Connect</span></span></Link>
          </div>

          {/* Prompted banner */}
          {prompted && (
            <div className="mb-6 p-4 rounded-2xl bg-[#C8A96E]/10 border border-[#C8A96E]/30">
              <p className="text-sm font-semibold text-[#C8A96E]">🔒 Create a free account to view vendor profiles</p>
              <p className="text-xs text-theme-muted mt-1">Join thousands of couples and vendors across 6 countries</p>
            </div>
          )}

          {/* Step 0: Role picker (when prompted) */}
          {step === 0 && (
            <>
              <h1 className="font-display text-3xl text-theme mb-2">Join VowConnect</h1>
              <p className="text-theme-muted text-sm mb-6">First, who are you?</p>
              <div className="space-y-3 mb-6">
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => { setRole(r.id as any); setStep(1) }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left hover:border-[#C8A96E] hover:bg-[#C8A96E]/5 border-[var(--border)]">
                    <span className="text-3xl">{r.icon}</span>
                    <div>
                      <div className="font-semibold text-theme">{r.label}</div>
                      <div className="text-xs text-theme-muted mt-0.5">{r.sub}</div>
                    </div>
                    <span className="ml-auto text-theme-faint">→</span>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-theme-muted">
                Already have an account?{' '}
                <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-[#C8A96E] font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* Step 1: Registration form */}
          {step === 1 && (
            <>
              <h1 className="font-display text-3xl text-theme mb-1">
                {prompted ? 'Create your free account' : 'Create account'}
              </h1>
              <p className="text-theme-muted text-sm mb-6">
                {role === 'vendor' ? 'Start getting booked today.' : 'Browse & book vendors in seconds.'}
              </p>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm mb-5">{error}</div>
              )}

              {/* Role picker (non-prompted) */}
              {!prompted && (
                <div className="flex gap-2 mb-5">
                  {ROLES.map(r => (
                    <button key={r.id} onClick={() => setRole(r.id as any)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${role === r.id ? 'border-[#C8A96E] bg-[#C8A96E]/10 text-[#C8A96E]' : 'border-[var(--border)] text-theme-muted hover:border-[#C8A96E]/40'}`}>
                      {r.icon} {r.id === 'client' ? 'Bride/Groom' : 'Vendor'}
                    </button>
                  ))}
                </div>
              )}

              {/* Google */}
              <a href={googleUrl}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-[var(--border)] bg-theme hover:bg-theme-subtle transition-all font-semibold text-theme text-sm mb-4">
                <GoogleIcon />
                Continue with Google
              </a>

              <div className="relative flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[var(--border)]"/>
                <span className="text-xs text-theme-faint font-medium">or use email</span>
                <div className="flex-1 h-px bg-[var(--border)]"/>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="label">Full name</label>
                  <input className="input" name="name" placeholder="Adaeze Okonkwo" value={form.name} onChange={handle} required/>
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input className="input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handle} required/>
                </div>
                <div>
                  <label className="label">Password</label>
                  <input className="input" type="password" name="password" placeholder="Min. 8 characters" value={form.password} onChange={handle} required minLength={8}/>
                </div>
                <div>
                  <label className="label">Phone <span className="text-theme-faint font-normal">(optional)</span></label>
                  <input className="input" type="tel" name="phone" placeholder="+44 7911 123456" value={form.phone} onChange={handle}/>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60 mt-2">
                  {loading ? 'Creating account...' : 'Create Account →'}
                </button>
              </form>

              <p className="text-center text-xs text-theme-faint mt-4">
                By registering you agree to our{' '}
                <Link href="/terms" className="hover:underline text-theme-muted">Terms</Link> &{' '}
                <Link href="/privacy" className="hover:underline text-theme-muted">Privacy Policy</Link>
              </p>
              <p className="text-center text-sm text-theme-muted mt-4">
                Already have an account?{' '}
                <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-[#C8A96E] font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>
}
