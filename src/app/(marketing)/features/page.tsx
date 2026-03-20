import Link from 'next/link'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

const FEATURES = [
  {
    category: 'For Brides',
    icon: '👰',
    items: [
      { title: 'Smart Vendor Search', desc: 'Filter by category, city, budget, rating, and availability. Find the perfect vendor in under 2 minutes.', icon: '🔍' },
      { title: 'Verified Reviews', desc: 'Every review comes from a client who completed a real booking. Zero fake reviews, guaranteed.', icon: '⭐' },
      { title: 'WhatsApp-First Contact', desc: 'Message any vendor directly on WhatsApp. No back-and-forth forms — just real human conversation.', icon: '💬' },
      { title: 'Booking Management', desc: 'Track all your bookings in one dashboard. Get status updates, manage dates, and leave reviews.', icon: '📅' },
      { title: 'Saved Vendors', desc: 'Favourite vendors as you browse. Come back to them when you\'re ready to book.', icon: '❤️' },
      { title: 'Asoebi Coordination', desc: 'Create an Asoebi group for your wedding. Coordinate fabric, colours, and payments with your guests.', icon: '🌺' },
    ],
  },
  {
    category: 'For Vendors',
    icon: '🧣',
    items: [
      { title: 'Beautiful Profile Page', desc: 'Showcase your work with a stunning profile. Portfolio gallery, pricing, location, and all your details.', icon: '🏪' },
      { title: 'Booking Requests', desc: 'Receive, accept, or decline booking requests directly through your dashboard.', icon: '📲' },
      { title: 'Analytics Dashboard', desc: 'See how many people viewed your profile, clicked WhatsApp, and checked your portfolio.', icon: '📊' },
      { title: 'Availability Calendar', desc: 'Mark your blocked dates so clients only book you when you\'re actually available.', icon: '🗓️' },
      { title: 'Instagram Sync', desc: 'Pull your latest Instagram posts directly into your portfolio. Keep it fresh automatically.', icon: '📸' },
      { title: 'Multi-currency Pricing', desc: 'Set prices in NGN, GBP, or USD. Serve clients in Nigeria and the diaspora seamlessly.', icon: '💰' },
    ],
  },
  {
    category: 'Platform',
    icon: '🌍',
    items: [
      { title: 'Nigeria & Diaspora', desc: 'Vendors and clients across Lagos, Abuja, London, Houston, Toronto and beyond — all on one platform.', icon: '🌍' },
      { title: 'Dark & Light Mode', desc: 'Switch between dark and light mode. Your eyes, your preference.', icon: '◑' },
      { title: 'Mobile Responsive', desc: 'Works beautifully on every device — phone, tablet, desktop. Browse vendors from anywhere.', icon: '📱' },
      { title: 'Secure Payments', desc: 'Stripe for international payments, Paystack for Nigeria. Industry-standard security.', icon: '🔐' },
      { title: 'Dispute Resolution', desc: 'Issues with a booking? Our admin team reviews reports and steps in when needed.', icon: '🛡️' },
      { title: 'Map View', desc: 'Browse vendors on an interactive map. Find verified vendors near your venue or location.', icon: '🗺️' },
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />

      <section className="pt-28 pb-16 px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-4">Features</div>
          <h1 className="font-display text-5xl md:text-6xl text-theme mb-5 leading-tight">
            Everything you need<br /><span className="italic text-theme-muted">for your wedding</span>
          </h1>
          <p className="text-theme-muted text-lg max-w-xl mx-auto">Built from the ground up for Nigerian weddings — in Nigeria and the diaspora.</p>
        </div>
      </section>

      {FEATURES.map(section => (
        <section key={section.category} className="px-4 md:px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-3xl">{section.icon}</span>
              <h2 className="font-display text-3xl text-theme">{section.category}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.items.map(item => (
                <div key={item.title} className="card p-7 card-hover">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-theme mb-2">{item.title}</h3>
                  <p className="text-theme-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="px-4 md:px-6 py-20 bg-[#080808]">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 grid-lines opacity-40 -m-10" />
          <div className="relative z-10">
            <div className="section-label mb-4">Ready?</div>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-6">Start using VowConnect today</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-sand px-8 py-4 rounded-full text-base">Browse Vendors Free →</Link>
              <Link href="/register?role=vendor" className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/15 text-white text-base font-semibold hover:border-[#C8A96E] transition-colors">List Your Business</Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
