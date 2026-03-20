'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-40" />
      <div className="relative z-10 text-center max-w-md">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="font-display text-4xl text-white mb-3">Something went wrong</h1>
        <p className="text-white/30 text-sm leading-relaxed mb-8">
          An unexpected error occurred. If this keeps happening, please contact us.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-sand px-7 py-3.5 rounded-full text-sm">Try Again</button>
          <Link href="/" className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-white/15 text-white/50 text-sm font-semibold hover:border-white/40 hover:text-white transition-colors">← Home</Link>
        </div>
      </div>
    </div>
  )
}
