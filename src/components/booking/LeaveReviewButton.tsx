'use client'

export function LeaveReviewButton({ bookingId, vendorName }: { bookingId: string; vendorName: string }) {
  return (
    <button
      className="badge-gold text-xs cursor-pointer hover:bg-[#F5ECD8] transition-colors"
      onClick={() => {
        const rating  = prompt(`Rate ${vendorName} (1–5 stars):`)
        const comment = prompt('Write a short review (optional):')
        if (!rating || isNaN(+rating) || +rating < 1 || +rating > 5) { alert('Please enter a valid rating (1–5)'); return }
        fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, rating: +rating, comment }),
        }).then(() => window.location.reload())
      }}>
      ⭐ Leave Review
    </button>
  )
}
