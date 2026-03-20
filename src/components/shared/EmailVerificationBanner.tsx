'use client'
import { useState } from 'react'

export default function EmailVerificationBanner({ email }: { email: string }) {
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  async function resend() {
    setLoading(true)
    await fetch('/api/auth/resend-verification', { method: 'POST' })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
      <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">⚠</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-amber-800 dark:text-amber-400 text-sm">
          {sent ? 'Verification email sent!' : 'Please verify your email address'}
        </div>
        <div className="text-amber-700/70 dark:text-amber-500/70 text-xs mt-0.5">
          {sent
            ? `Check ${email} — click the link to verify your account.`
            : `We sent a verification link to ${email}. Check your inbox (and spam folder).`}
        </div>
        {!sent && (
          <button onClick={resend} disabled={loading}
            className="text-xs text-amber-700 dark:text-amber-400 font-semibold underline underline-offset-2 mt-1.5 disabled:opacity-50">
            {loading ? 'Sending...' : 'Resend verification email →'}
          </button>
        )}
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600 flex-shrink-0 text-lg leading-none">×</button>
    </div>
  )
}
