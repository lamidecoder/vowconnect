import Link from 'next/link'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

const CLIENT_STEPS = [
  { n: '01', icon: '🔍', title: 'Search & Discover', body: 'Browse hundreds of verified vendors by category — Gele stylist, makeup artist, photographer, content creator, mobile photographer and more. Filter by city, budget, and rating to find your perfect match in Lagos, London, Houston or Toronto.' },
  { n: '02', icon: '📋', title: 'View Portfolios & Reviews', body: 'Every vendor has a rich profile with real portfolio images and verified reviews from past clients. No fake reviews — every review comes from a completed booking.' },
  { n: '03', icon: '📅', title: 'Send a Booking Request', body: 'Found your vendor? Send a booking request in under 60 seconds. Include your event date, location and any special notes. The vendor gets notified instantly.' },
  { n: '04', icon: '💬', title: 'Chat on WhatsApp', body: 'Connect directly with your vendor on WhatsApp — Nigeria\'s favourite communication channel. Discuss details, share photos, and confirm everything before the day.' },
  { n: '05', icon: '🎊', title: 'Show Up & Celebrate', body: 'Your vendor is confirmed, verified, and ready. Show up on your wedding day with total confidence and let the magic happen.' },
  { n: '06', icon: '⭐', title: 'Leave a Review', body: 'After your event, leave an honest review to help other brides make great decisions. Your review makes the VowConnect community stronger for everyone.' },
]

const VENDOR_STEPS = [
  { n: '01', icon: '📝', title: 'Create Your Free Account', body: 'Sign up in 2 minutes. No credit card required. Choose "Vendor" as your account type during registration.' },
  { n: '02', icon: '🏪', title: 'Build Your Profile', body: 'Add your business name, category, pricing, location, and bio. Upload portfolio photos that show your best work. The more complete your profile, the more bookings you get.' },
  { n: '03', icon: '🗓️', title: 'Set Your Availability', body: 'Mark dates you\'re already booked on your availability calendar. Clients will only be able to request dates when you\'re free — no awkward double-booking.' },
  { n: '04', icon: '📲', title: 'Receive Booking Requests', body: 'Get notified when a client sends a booking request. Review the details, then accept or decline from your dashboard.' },
  { n: '05', icon: '💬', title: 'Communicate via WhatsApp', body: 'Chat with your client directly on WhatsApp to confirm details, share your portfolio, and build rapport before the big day.' },
  { n: '06', icon: '📊', title: 'Grow with Analytics', body: 'See how many people viewed your profile, how many clicked your WhatsApp link, and which portfolio images get the most attention. Upgrade to Pro to unlock full analytics.' },
]

const FAQS = [
  { q: 'Is VowConnect only for Lagos?', a: 'Not at all. VowConnect serves vendors and clients across Nigeria (Lagos, Abuja, Port Harcourt and more) and the diaspora in the UK, USA, Canada, and Ghana.' },
  { q: 'How does VowConnect verify vendors?', a: 'Vendors go through a profile review before being listed publicly. Our admin team checks that their details are genuine and their portfolio is real work.' },
  { q: 'What if a vendor cancels on me?', a: 'Use the dispute resolution feature in your booking dashboard. Our team will review the situation and help you find a replacement vendor quickly.' },
  { q: 'Can I book vendors from the diaspora for my Nigerian wedding?', a: 'Yes! Many vendors are based in London, Houston, or Toronto but are available to travel for weddings in Nigeria. Check their profile for travel availability.' },
  { q: 'What currencies are supported?', a: 'Nigerian Naira (₦), British Pounds (£), US Dollars ($), and Canadian Dollars. Vendors set their prices and you pay in your preferred currency.' },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 md:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="section-label mb-4">How It Works</div>
          <h1 className="font-display text-5xl md:text-6xl text-theme mb-5 leading-tight">
            Simple from start<br /><span className="italic text-theme-muted">to celebration</span>
          </h1>
          <p className="text-theme-muted text-lg">Whether you&apos;re a bride looking for vendors or a vendor growing your business — VowConnect makes it effortless.</p>
        </div>
      </section>

      {/* Tab visual selector */}
      <section className="px-4 md:px-6 pb-6">
        <div className="max-w-4xl mx-auto flex gap-3 justify-center flex-wrap">
          <Link href="#brides" className="btn-sand px-6 py-2.5 rounded-full text-sm">👰 For Brides</Link>
          <Link href="#vendors" className="btn-outline px-6 py-2.5 rounded-full text-sm">🧣 For Vendors</Link>
        </div>
      </section>

      {/* For Brides */}
      <section id="brides" className="px-4 md:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <span className="text-4xl">👰</span>
            <div>
              <div className="section-label">Brides & Clients</div>
              <h2 className="font-display text-3xl text-theme">Find & book your perfect vendor</h2>
            </div>
          </div>
          <div className="space-y-4">
            {CLIENT_STEPS.map((step, i) => (
              <div key={step.n} className="card p-6 md:p-8 flex items-start gap-6 card-hover">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#F5ECD8] dark:bg-[#2A1F10] flex items-center justify-center text-xl">{step.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[10px] text-[#C8A96E] font-bold tracking-widest">{step.n}</span>
                    <h3 className="font-semibold text-theme">{step.title}</h3>
                  </div>
                  <p className="text-theme-muted text-sm leading-relaxed">{step.body}</p>
                </div>
                {i < CLIENT_STEPS.length - 1 && (
                  <div className="hidden md:flex flex-shrink-0 w-6 text-[#C8A96E]/30 text-lg self-center">↓</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/register" className="btn-sand px-8 py-4 rounded-full text-base">Start Browsing Free →</Link>
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border)] mx-6 md:mx-20" />

      {/* For Vendors */}
      <section id="vendors" className="px-4 md:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <span className="text-4xl">🧣</span>
            <div>
              <div className="section-label">Vendors</div>
              <h2 className="font-display text-3xl text-theme">List your business & get booked</h2>
            </div>
          </div>
          <div className="space-y-4">
            {VENDOR_STEPS.map((step) => (
              <div key={step.n} className="card p-6 md:p-8 flex items-start gap-6 card-hover">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#F5ECD8] dark:bg-[#2A1F10] flex items-center justify-center text-xl">{step.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[10px] text-[#C8A96E] font-bold tracking-widest">{step.n}</span>
                    <h3 className="font-semibold text-theme">{step.title}</h3>
                  </div>
                  <p className="text-theme-muted text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/register?role=vendor" className="btn-sand px-8 py-4 rounded-full text-base">List Your Business Free →</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 md:px-6 py-20 bg-theme-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-label mb-3">Questions</div>
            <h2 className="font-display text-4xl text-theme">Common questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(f => (
              <div key={f.q} className="card p-6">
                <div className="font-semibold text-theme mb-2">{f.q}</div>
                <p className="text-theme-muted text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
