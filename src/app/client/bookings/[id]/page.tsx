import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { formatDate, formatPrice, getStatusColor, getWhatsAppLink } from '@/lib/utils'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import ReviewForm from '@/components/booking/ReviewForm'

interface Props { params: { id: string } }

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'COMPLETED']

export default async function BookingDetailPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const booking = await prisma.booking.findFirst({
    where: { id: params.id, clientId: user.id, deletedAt: null },
    include: {
      vendor: {
        include: {
          category: true,
          portfolio: { take: 1 },
          user: { select: { name: true } },
        },
      },
      review: true,
    },
  })

  if (!booking) notFound()

  const currentStep = STATUS_STEPS.indexOf(booking.status)
  const canReview   = booking.status === 'COMPLETED' && !booking.review
  const isCancelled = booking.status === 'CANCELLED' || booking.status === 'DECLINED'
  const whatsapp    = getWhatsAppLink(booking.vendor.whatsapp, booking.vendor.businessName)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/client/bookings" className="btn-ghost text-sm py-1.5">← My Bookings</Link>
      </div>

      {/* Status header */}
      <div className="card overflow-hidden mb-6">
        <div className="p-6 bg-gradient-to-r from-[#080808] to-[#1A0A0A] relative">
          <div className="absolute inset-0 bg-pattern-ankara opacity-20" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-white/50 text-sm mb-1">Booking Reference</div>
                <div className="font-mono text-white/60 text-sm">#{booking.id.slice(0, 12).toUpperCase()}</div>
              </div>
              <span className={`badge text-sm ${getStatusColor(booking.status)}`}>{booking.status}</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">{booking.vendor.businessName}</h1>
            <p className="text-white/50 text-sm mt-1">{booking.vendor.category.name} · {booking.vendor.location}</p>
          </div>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="p-5 border-b border-[var(--border)]">
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i <= currentStep ? 'bg-[#C8A96E] text-white shadow-sand' : 'bg-theme-subtle text-theme-faint'
                  }`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all ${i < currentStep ? 'bg-[#C8A96E]' : 'bg-theme-subtle'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {STATUS_STEPS.map(s => (
                <div key={s} className="text-xs text-theme-muted capitalize">
                  {s.toLowerCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="p-4 bg-red-50 border-t border-red-100 text-center">
            <span className="text-red-600 text-sm font-medium">
              {booking.status === 'DECLINED' ? 'The vendor was unable to take this booking.' : 'This booking was cancelled.'}
            </span>
          </div>
        )}
      </div>

      {/* Event details */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-theme mb-4">Event Details</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Event Type',   value: booking.eventType },
            { label: 'Date',         value: formatDate(booking.eventDate) },
            { label: 'Location',     value: booking.location ?? 'Not specified' },
            { label: 'Guest Count',  value: booking.guestCount ? `${booking.guestCount} guests` : 'Not specified' },
            { label: 'Budget',       value: booking.budget ? formatPrice(booking.budget) : 'Not specified' },
            { label: 'Booked On',    value: formatDate(booking.createdAt) },
          ].map(item => (
            <div key={item.label}>
              <div className="label">{item.label}</div>
              <div className="text-sm font-medium text-theme">{item.value}</div>
            </div>
          ))}
        </div>
        {booking.notes && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="label mb-1">Your Notes to Vendor</div>
            <p className="text-sm text-theme bg-theme-subtle rounded-xl p-3 leading-relaxed">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Vendor card + WhatsApp */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-theme mb-4">Vendor</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F5ECD8] to-[#EAD5B0] flex items-center justify-center text-2xl overflow-hidden shrink-0">
            {booking.vendor.portfolio[0]
              ? <img src={booking.vendor.portfolio[0].url} alt="" className="w-full h-full object-cover" />
              : booking.vendor.category.emoji}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-theme">{booking.vendor.businessName}</div>
            <div className="text-theme-muted text-sm">{booking.vendor.category.name}</div>
            <div className="text-theme-faint text-xs mt-0.5">📍 {booking.vendor.location}</div>
          </div>
          <Link href={`/vendors/${booking.vendorId}`} className="btn-ghost text-xs">View Profile</Link>
        </div>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer"
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: '#25D366' }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat with {booking.vendor.businessName} on WhatsApp
        </a>
      </div>

      {/* Review section */}
      {booking.review ? (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-theme mb-3">Your Review</h2>
          <div className="flex gap-0.5 mb-2">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`text-lg ${booking.review!.rating >= i ? 'text-[#C8A96E]' : 'text-white/50'}`}>★</span>
            ))}
          </div>
          {booking.review.comment && <p className="text-theme-muted text-sm">{booking.review.comment}</p>}
          <p className="text-theme-faint text-xs mt-2">Reviewed on {formatDate(booking.review.createdAt)}</p>
        </div>
      ) : canReview ? (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-theme mb-2">Leave a Review</h2>
          <p className="text-theme-muted text-sm mb-4">How was your experience with {booking.vendor.businessName}?</p>
          <ReviewForm bookingId={booking.id} vendorName={booking.vendor.businessName} />
        </div>
      ) : null}
    </div>
  )
}
