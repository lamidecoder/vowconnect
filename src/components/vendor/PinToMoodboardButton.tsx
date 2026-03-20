'use client'
import { useState } from 'react'

export default function PinToMoodboardButton({
  imageUrl,
  caption,
  vendorId,
  category,
}: {
  imageUrl: string
  caption?: string
  vendorId: string
  category?: string
}) {
  const [pinned,  setPinned]  = useState(false)
  const [loading, setLoading] = useState(false)

  async function pin(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (pinned || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/wedding/moodboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, caption, sourceVendorId: vendorId, category: category ?? 'photography' }),
      })
      if (res.ok) setPinned(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={pin}
      title={pinned ? 'Pinned to mood board!' : 'Pin to mood board'}
      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs
        shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100
        ${pinned
          ? 'bg-[#C8A96E] text-white scale-100'
          : 'bg-white/90 text-[#C8A96E] hover:bg-[#C8A96E] hover:text-white'
        }
        ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {pinned ? '📌' : '🖼'}
    </button>
  )
}
