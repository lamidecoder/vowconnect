'use client'
import { useState } from 'react'

export default function FavoriteButton({
  vendorId,
  initialFavorited,
}: {
  vendorId: string
  initialFavorited: boolean
}) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      })
      const data = await res.json()
      if (res.ok) setFavorited(data.saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-full border-2 text-sm font-semibold transition-all duration-200 disabled:opacity-60 ${
        favorited
          ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-[var(--border)] text-theme-muted hover:border-red-300 hover:text-red-500'
      }`}
    >
      {favorited ? '❤️ Saved' : '🤍 Save Vendor'}
    </button>
  )
}
