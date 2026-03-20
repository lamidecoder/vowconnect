'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewForm({ bookingId, vendorName }: { bookingId: string; vendorName: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setError('Please select a star rating'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, rating, comment }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to submit review'); setLoading(false); return }
    router.refresh()
  }

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <div>
        <div className="label mb-2">Rating</div>
        <div className="flex gap-2 items-center">
          {[1,2,3,4,5].map(i => (
            <button key={i} type="button"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(i)}
              className="text-3xl transition-transform hover:scale-110 active:scale-95"
              style={{ color: (hovered || rating) >= i ? '#C9941A' : '#D1C5B0', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
              ★
            </button>
          ))}
          {(hovered || rating) > 0 && (
            <span className="text-sm font-semibold text-[#C8A96E] ml-1">{LABELS[hovered || rating]}</span>
          )}
        </div>
      </div>

      <div>
        <label className="label">Your Review (optional)</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder={`Tell other brides about your experience with ${vendorName}...`}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading || !rating} className="btn-primary disabled:opacity-60">
        {loading ? 'Submitting...' : 'Submit Review ⭐'}
      </button>
    </form>
  )
}
