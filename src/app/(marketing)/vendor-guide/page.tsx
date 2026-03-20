import Link from 'next/link'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

const SECTIONS = [
  {
    icon: '🏪', title: 'Setting Up a Winning Profile',
    tips: [
      { title: 'Write a compelling bio', body: 'Your bio is your pitch. Tell brides what makes you unique, how long you\'ve been working, any training or awards, and what kind of weddings you specialise in. Keep it warm and personal — brides are looking to connect, not just hire.' },
      { title: 'Upload your absolute best work', body: 'Quality beats quantity. 10 stunning photos outperform 50 average ones. Lead with your best, most recent work. Show a variety of clients and styles to show range.' },
      { title: 'Be specific with your pricing', body: 'Brides skip profiles with no pricing. You don\'t need to list every package — a starting price and a "from ₦X" is enough to qualify the right clients and save everyone time.' },
      { title: 'List all your service areas', body: 'If you travel for bookings, say so. Many diaspora brides are looking for vendors who can travel to Nigeria for their wedding. List every city or country you\'re willing to work in.' },
    ],
  },
  {
    icon: '📸', title: 'Building Your Portfolio',
    tips: [
      { title: 'Photograph every job', body: 'Even small events are portfolio content. Ask clients for permission to photograph your work before and after. These real results build more trust than staged shoots.' },
      { title: 'Sync with Instagram', body: 'Upgrade to Pro and connect your Instagram account. Your latest posts automatically appear in your VowConnect portfolio — keeping your profile fresh with zero extra effort.' },
      { title: 'Show diversity', body: 'Nigerian weddings come in every style — traditional Yoruba, Igbo, Hausa, modern, and everything in between. If you can serve different styles, show it in your portfolio.' },
    ],
  },
  {
    icon: '📅', title: 'Managing Bookings Professionally',
    tips: [
      { title: 'Respond within 24 hours', body: 'Vendors who respond quickly get booked more often. Brides are usually shopping multiple vendors at once. Being the first to respond — and being warm and professional — wins the booking.' },
      { title: 'Keep your calendar updated', body: 'Block out dates you\'re already booked immediately. Nothing damages trust like accepting a booking and then cancelling because you forgot another commitment.' },
      { title: 'Use the WhatsApp integration', body: 'Once a booking is requested, move the conversation to WhatsApp. Send photos, confirm details, and build a relationship. Brides book people they feel comfortable with.' },
      { title: 'Confirm every booking in writing', body: 'Before the event, send a WhatsApp confirmation with the date, time, location, services agreed and price. This protects both you and the client.' },
    ],
  },
  {
    icon: '📊', title: 'Growing Your Business on VowConnect',
    tips: [
      { title: 'Ask every happy client for a review', body: 'Reviews are the single most powerful thing on your profile. After each job, send a WhatsApp message asking your client to leave a review on VowConnect. Most happy clients are glad to help.' },
      { title: 'Check your analytics weekly', body: 'Your dashboard shows profile views, WhatsApp clicks, and which photos get the most attention. Use this data to improve your profile. If one photo gets 5x the clicks of others, lead with it.' },
      { title: 'Upgrade to Pro for featured placement', body: 'Pro vendors appear higher in search results and in the Featured section of their category. Most vendors on Pro see a 3–5x increase in enquiries within the first month.' },
      { title: 'Share your VowConnect profile link', body: 'Add your profile link to your Instagram bio, WhatsApp status, and business card. Every visit to your profile is a potential booking.' },
    ],
  },
]

const CHECKLIST = [
  'Business name and category selected',
  'Professional bio written (100–200 words)',
  'At least 8 portfolio images uploaded',
  'Starting price or pricing range added',
  'Location and service areas listed',
  'Phone number added for WhatsApp contact',
  'Availability calendar set up',
  'Profile photo or logo uploaded',
  'Instagram connected (Pro plan)',
  'First 5 bookings completed & reviewed',
]

export default function VendorGuidePage() {
  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />

      <section className="pt-28 pb-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="section-label mb-4">Vendor Guide</div>
          <h1 className="font-display text-5xl md:text-6xl text-theme mb-5 leading-tight">
            How to get more<br /><span className="italic text-theme-muted">bookings on VowConnect</span>
          </h1>
          <p className="text-theme-muted text-lg">The complete guide for vendors — from profile setup to getting your first 10 bookings and beyond.</p>
          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            <Link href="/register?role=vendor" className="btn-sand px-6 py-3 rounded-full">Create Free Account →</Link>
            <Link href="/pricing" className="btn-outline px-6 py-3 rounded-full">View Pricing</Link>
          </div>
        </div>
      </section>

      {/* Guide sections */}
      <section className="px-4 md:px-6 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title} className="card overflow-hidden">
              <div className="px-8 py-6 border-b border-[var(--border)] flex items-center gap-4 bg-theme-subtle">
                <span className="text-3xl">{section.icon}</span>
                <h2 className="font-display text-2xl text-theme">{section.title}</h2>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {section.tips.map((tip) => (
                  <div key={tip.title} className="px-8 py-6">
                    <h3 className="font-semibold text-theme mb-2 flex items-start gap-2">
                      <span className="text-[#C8A96E] flex-shrink-0 mt-0.5">→</span>{tip.title}
                    </h3>
                    <p className="text-theme-muted text-sm leading-relaxed pl-5">{tip.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profile checklist */}
      <section className="px-4 md:px-6 py-16 bg-theme-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-label mb-3">Checklist</div>
            <h2 className="font-display text-4xl text-theme">Profile launch checklist</h2>
            <p className="text-theme-muted text-sm mt-3">Complete all of these before you go live for best results.</p>
          </div>
          <div className="card p-8">
            <ul className="space-y-3">
              {CHECKLIST.map((item, i) => (
                <li key={item} className="flex items-center gap-4 text-sm">
                  <span className="w-6 h-6 rounded-full border-2 border-[#C8A96E]/30 flex items-center justify-center text-[10px] text-[#C8A96E] font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-theme">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-6 py-20 bg-[#080808] relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl text-white mb-4">Ready to get your first booking?</h2>
          <p className="text-white/40 text-sm mb-8">Create your free profile in under 5 minutes. No credit card needed.</p>
          <Link href="/register?role=vendor" className="btn-sand px-8 py-4 rounded-full text-base">List My Business Free →</Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
