'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UnfavoriteButton({ vendorId }: { vendorId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function remove(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId }),
    })
    router.refresh()
  }

  return (
    <button onClick={remove} disabled={loading}
      className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors disabled:opacity-60"
      title="Remove from saved">
      {loading ? '⏳' : '❤️'}
    </button>
  )
}
