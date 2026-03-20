'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/ThemeProvider'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
    if (res.ok) { setSent(true) }
    else { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme p-6">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-1 justify-center mb-10">
          <span className="font-display text-2xl text-theme">Vow</span>
          <span className="font-display text-2xl text-[#C8A96E]">Connect</span>
        </Link>

        {sent ? (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F5ECD8] dark:bg-[#1A130A] flex items-center justify-center text-2xl mx-auto mb-5">📧</div>
            <h1 className="font-display text-3xl text-theme mb-3">Check your inbox</h1>
            <p className="text-theme-muted text-sm leading-relaxed mb-6">
              We&apos;ve sent a password reset link to <strong className="text-theme">{email}</strong>. It expires in 1 hour.
            </p>
            <p className="text-theme-faint text-xs mb-6">Didn&apos;t get it? Check your spam folder, or{' '}
              <button onClick={() => setSent(false)} className="text-[#C8A96E] hover:underline">try again</button>.
            </p>
            <Link href="/login" className="btn-outline w-full rounded-xl py-3 text-sm flex items-center justify-center">← Back to Sign In</Link>
          </div>
        ) : (
          <div className="card p-8">
            <h1 className="font-display text-3xl text-theme mb-2">Reset your password</h1>
            <p className="text-theme-muted text-sm mb-7">Enter your email and we&apos;ll send you a reset link.</p>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm mb-5">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="you@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} autoComplete="email" required />
              </div>
              <button type="submit" disabled={loading} className="btn-sand w-full py-3.5 rounded-xl text-sm disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </form>

            <p className="text-center text-sm text-theme-muted mt-6">
              Remember your password? <Link href="/login" className="text-[#C8A96E] font-semibold">Sign In →</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
