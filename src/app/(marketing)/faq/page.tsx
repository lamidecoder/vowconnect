import Link from 'next/link'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

const SECTIONS = [
  {
    title: 'For Brides & Clients', icon: '👰',
    faqs: [
      { q: 'Is VowConnect free for clients?', a: 'Yes, completely. Browsing vendors, sending booking requests, leaving reviews, and using Asoebi coordination — all free for clients, forever. We never charge brides.' },
      { q: 'How do I book a vendor?', a: 'Find a vendor you like, click "Send Booking Request", fill in your event date and details, and submit. The vendor gets notified and will respond within 24 hours. You can then move the conversation to WhatsApp to finalise everything.' },
      { q: 'How do I know vendors are legitimate?', a: 'Every vendor goes through a profile review by our team before being listed publicly. We also show verified reviews from real bookings — not fake testimonials.' },
      { q: 'Can I book vendors for events outside Nigeria?', a: 'Yes. Many of our vendors are based in the UK, USA, and Canada and serve both local and Nigerian events. You can also find Nigerian-based vendors who travel internationally.' },
      { q: 'What if the vendor cancels?', a: 'Report the issue through your booking dashboard. Our team will review the situation and work to help you find a replacement. We take cancellations very seriously.' },
      { q: 'What is Asoebi coordination?', a: 'Asoebi is the Nigerian tradition of guests wearing matching fabric at weddings. Our Asoebi tool lets you create a group, share fabric details, and coordinate payments with all your guests — right from VowConnect.' },
    ],
  },
  {
    title: 'For Vendors', icon: '🧣',
    faqs: [
      { q: 'How do I list my business?', a: 'Click "Get Started" or "List Your Business" on any page, create an account, select "Vendor" as your role, and fill in your profile. Our team reviews it within 24–48 hours before it goes live.' },
      { q: 'How much does it cost to list?', a: 'The Free plan is £0/₦0 forever. It includes a basic listing and up to 3 bookings per month. Pro (₦15,000/£25/month) and Premium (₦35,000/£60/month) plans unlock unlimited bookings, verified badge, featured placement, and more. See the Pricing page for full details.' },
      { q: 'How do payments work?', a: 'VowConnect does not handle payment between vendors and clients. You agree on price and payment terms with clients directly. We recommend getting a deposit before the event and final payment on the day.' },
      { q: 'Can I serve clients in multiple countries?', a: 'Yes. You can list multiple service areas including Nigeria, UK, USA, and Canada. Many vendors on VowConnect serve both local and diaspora clients.' },
      { q: 'How do I get more bookings?', a: 'Complete your profile fully, upload high-quality portfolio images, keep your availability calendar updated, and respond to booking requests quickly. Pro vendors also get featured placement in search results. Read our Vendor Guide for the full playbook.' },
      { q: 'Can I cancel my subscription?', a: 'Yes, anytime. Cancel from your dashboard settings. You keep your plan features until the end of your billing period, then revert to the Free plan. No penalties, no hassle.' },
    ],
  },
  {
    title: 'Platform & Technical', icon: '⚙️',
    faqs: [
      { q: 'What countries is VowConnect available in?', a: 'Nigeria, United Kingdom, United States, Canada, and Ghana. We are actively expanding. If you\'re in a different country, you can still join — we review each application.' },
      { q: 'Is my data safe?', a: 'Yes. We use industry-standard encryption for all data. We never sell your personal information to third parties. Read our Privacy Policy for full details.' },
      { q: 'Does VowConnect have a mobile app?', a: 'Not yet — but the website is fully mobile-optimised and works beautifully on all phones. A native app is on our roadmap.' },
      { q: 'How do I report a problem?', a: 'Use the Report button on any vendor profile or booking, or contact us directly at hello@vowconnect.com or via WhatsApp. We investigate all reports within 24 hours.' },
      { q: 'Can I delete my account?', a: 'Yes. Go to your profile settings and select "Delete Account". Your data will be removed within 30 days. Completed booking records are retained for 12 months for dispute purposes.' },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />

      <section className="pt-28 pb-16 px-4 md:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="section-label mb-4">FAQ</div>
          <h1 className="font-display text-5xl md:text-6xl text-theme mb-5 leading-tight">
            Frequently asked<br /><span className="italic text-theme-muted">questions</span>
          </h1>
          <p className="text-theme-muted text-lg">Everything you need to know about VowConnect.</p>
        </div>
      </section>

      <section className="px-4 md:px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-12">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{section.icon}</span>
                <h2 className="font-display text-3xl text-theme">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.faqs.map(faq => (
                  <div key={faq.q} className="card p-6 card-hover">
                    <div className="font-semibold text-theme mb-2 flex items-start gap-2">
                      <span className="text-[#C8A96E] flex-shrink-0 mt-0.5">Q</span>{faq.q}
                    </div>
                    <p className="text-theme-muted text-sm leading-relaxed pl-5">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-14">
          <div className="card p-8 text-center bg-[#F5ECD8] dark:bg-[#1A130A] border-[#E3CC99] dark:border-[#2A1F0A]">
            <p className="font-display text-2xl text-[#6A4A1E] dark:text-[#C8A96E] mb-2">Still have questions?</p>
            <p className="text-[#8A6A2E]/70 dark:text-[#C8A96E]/60 text-sm mb-5">Our team replies within 24 hours, usually much faster.</p>
            <Link href="/contact" className="btn-sand px-6 py-3 rounded-full text-sm">Contact Us →</Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
