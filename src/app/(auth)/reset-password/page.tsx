'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeProvider'
import { Suspense } from 'react'

function ResetForm() {
  const params   = useSearchParams()
  const router   = useRouter()
  const token    = params.get('token') ?? ''
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const res  = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Reset failed'); setLoading(false); return }
    setSuccess(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  if (!token) return (
    <div className="card p-8 text-center w-full max-w-md">
      <div className="text-4xl mb-4">⚠️</div>
      <h1 className="font-display text-2xl text-theme mb-3">Invalid link</h1>
      <p className="text-theme-muted text-sm mb-6">This reset link is missing or invalid. Please request a new one.</p>
      <Link href="/forgot-password" className="btn-sand w-full rounded-xl py-3 text-sm flex items-center justify-center">Request New Link →</Link>
    </div>
  )

  return (
    <div className="card p-8 w-full max-w-md">
      {success ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#F5ECD8] dark:bg-[#1A130A] flex items-center justify-center text-2xl mx-auto mb-5">✓</div>
          <h1 className="font-display text-3xl text-theme mb-3">Password updated!</h1>
          <p className="text-theme-muted text-sm">Redirecting you to sign in...</p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-3xl text-theme mb-2">Set new password</h1>
          <p className="text-theme-muted text-sm mb-7">Choose a strong password for your VowConnect account.</p>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm mb-5">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" placeholder="At least 8 characters" minLength={8}
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input className="input" type="password" placeholder="Same as above"
                value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-sand w-full py-3.5 rounded-xl text-sm disabled:opacity-50">
              {loading ? 'Updating...' : 'Set New Password →'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-theme p-6">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <Link href="/" className="flex items-center gap-1 mb-10">
        <span className="font-display text-2xl text-theme">Vow</span>
        <span className="font-display text-2xl text-[#C8A96E]">Connect</span>
      </Link>
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  )
}
