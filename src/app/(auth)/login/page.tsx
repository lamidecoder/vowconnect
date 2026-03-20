'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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

function VowConnectLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display ${className}`}>
      <span className="text-white">Vow</span>
      <span className="text-[#C8A96E]">Connect</span>
    </span>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') ?? ''
  const errParam     = searchParams.get('error')

  const [email,       setEmail]      = useState('')
  const [password,    setPassword]   = useState('')
  const [loading,     setLoading]    = useState(false)
  const [error,       setError]      = useState('')
  const [verifiedMsg, setVerifiedMsg]= useState('')
  const [dbStatus,    setDbStatus]   = useState<'checking'|'ok'|'empty'|'error'>('checking')
  const [dbHint,      setDbHint]     = useState('')

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => {
        if (!d.ok)          { setDbStatus('error'); setDbHint(d.hint ?? d.error ?? 'DB error') }
        else if (!d.seeded) { setDbStatus('empty'); setDbHint('Run: npm run db:seed') }
        else                  setDbStatus('ok')
      })
      .catch(() => setDbStatus('error'))
  }, [])

  useEffect(() => {
    const v = searchParams.get('verified')
    if (v === 'success') setVerifiedMsg('✅ Email verified! You can now sign in.')
    if (v === 'expired') setVerifiedMsg('⚠️ Verification link expired.')
    if (v === 'invalid') setVerifiedMsg('⚠️ Invalid link.')
    if (errParam === 'google_not_configured') setError('Google sign-in is not configured.')
    if (errParam === 'google_cancelled')      setError('Google sign-in was cancelled.')
    if (errParam === 'google_failed')         setError('Google sign-in failed. Try again.')
    if (errParam === 'suspended')             setError('Your account has been suspended.')
    if (errParam === 'no_email')              setError('Google account has no email.')
  }, [searchParams, errParam])

  async function doLogin(emailVal: string, passwordVal: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({
          email:    emailVal.trim().toLowerCase(),
          password: passwordVal,
          next,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        setLoading(false)
        return
      }

      // Hard redirect — browser sends fresh request with the cookie attached
      window.location.replace(data.dest)

    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    doLogin(email, password)
  }

  const googleUrl = `/api/auth/google${next ? `?next=${encodeURIComponent(next)}` : ''}`

  return (
    <div className="min-h-screen flex bg-theme">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#080808] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(200,169,110,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,169,110,0.04) 1px,transparent 1px)',backgroundSize:'32px 32px'}}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{background:'radial-gradient(ellipse, rgba(200,169,110,0.10) 0%, transparent 65%)'}}/>
        <Link href="/" className="relative z-10">
          <VowConnectLogo className="text-2xl"/>
        </Link>
        <div className="relative z-10">
          <div className="font-display text-6xl text-white/5 leading-none mb-4">&ldquo;</div>
          <p className="font-display text-3xl text-white/70 italic leading-tight max-w-xs mb-6">
            Your perfect Nigerian wedding, wherever you are.
          </p>
          <p className="text-white/25 text-sm">— Trusted across Nigeria &amp; the diaspora</p>
          <div className="flex gap-10 mt-10 pt-10 border-t border-white/6">
            {[['500+','Vendors'],['6','Countries'],['4.9★','Rating']].map(([v,l]) => (
              <div key={l}>
                <div className="font-display text-2xl text-white">{v}</div>
                <div className="text-white/20 text-[10px] uppercase tracking-widest mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-white/10 text-xs">© {new Date().getFullYear()} VowConnect</p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-md">

          <div className="lg:hidden flex justify-center mb-10">
            <Link href="/"><VowConnectLogo className="text-2xl"/></Link>
          </div>

          <h1 className="font-display text-4xl text-theme mb-2">Welcome back</h1>
          <p className="text-theme-muted text-sm mb-8">Sign in to your VowConnect account</p>

          {/* Status banners */}
          {dbStatus === 'error' && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm mb-5">
              <strong>⚠️ Database not connected.</strong>
              <span className="text-xs font-mono mt-1 block">{dbHint}</span>
            </div>
          )}
          {dbStatus === 'empty' && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm mb-5">
              <strong>ℹ️ Database empty.</strong>
              <span className="text-xs font-mono mt-1 block">Run: npm run db:seed</span>
            </div>
          )}
          {verifiedMsg && (
            <div className={`p-3.5 rounded-xl border text-sm mb-5 ${verifiedMsg.startsWith('✅') ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'}`}>
              {verifiedMsg}
            </div>
          )}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm mb-5">
              {error}
            </div>
          )}

          {/* Google */}
          <a href={googleUrl} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-[var(--border)] bg-theme hover:bg-theme-subtle transition-all font-semibold text-theme text-sm mb-4">
            <GoogleIcon />
            Continue with Google
          </a>

          <div className="relative flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--border)]"/>
            <span className="text-xs text-theme-faint font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-[var(--border)]"/>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#C8A96E] hover:underline">Forgot?</Link>
              </div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-theme-muted mt-6">
            New to VowConnect?{' '}
            <Link
              href={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="text-[#C8A96E] font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>

          {/* Demo accounts */}
          <details className="mt-8">
            <summary className="text-xs text-theme-faint cursor-pointer hover:text-theme-muted select-none">
              Demo accounts ▾
            </summary>
            <div className="mt-3 space-y-2 text-xs text-theme-muted">
              {([
                ['Admin',          'lamidecodes@gmail.com'],
                ['Vendor (Lagos)', 'vendor@vowconnect.demo'],
                ['Client',         'client@vowconnect.demo'],
              ] as const).map(([role, em]) => (
                <div key={em} className="flex items-center justify-between p-2 rounded-lg bg-theme-subtle">
                  <span className="font-medium">{role}</span>
                  <button
                    onClick={() => doLogin(em, 'demo1234!')}
                    className="text-[#C8A96E] hover:underline font-mono"
                  >
                    {em}
                  </button>
                </div>
              ))}
              <p className="text-theme-faint pt-1">
                Password: <code className="bg-theme-subtle px-1 rounded">demo1234!</code>
              </p>
            </div>
          </details>

        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
