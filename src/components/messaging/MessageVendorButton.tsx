'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MessageVendorButton({ vendorId }: { vendorId: string }) {
  const router  = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    try {
      // Send an empty-ish opener message to create the conversation
      // so it shows up in the inbox immediately
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, body: 'Hi! I\'m interested in your services.' }),
      })
    } catch {}
    router.push('/client/messages')
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 border-[#C8A96E]/60 text-[#C8A96E] font-semibold text-sm transition-all hover:bg-[#C8A96E]/10 disabled:opacity-60"
    >
      {busy ? (
        <span className="w-4 h-4 border-2 border-[#C8A96E] border-t-transparent rounded-full animate-spin" />
      ) : '💬'}
      {busy ? 'Opening…' : 'Message Vendor'}
    </button>
  )
}
