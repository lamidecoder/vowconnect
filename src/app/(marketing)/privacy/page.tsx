import Link from 'next/link'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

const SECTIONS = [
  {
    title: '1. What Data We Collect',
    content: `We collect information you provide directly: name, email address, phone number, location, and profile content. When you use VowConnect, we also collect usage data including pages visited, search queries, booking activity, and device/browser information. We do not collect payment card details — payments are handled by Stripe and Paystack directly.`,
  },
  {
    title: '2. How We Use Your Data',
    content: `We use your data to: operate the Platform and process bookings; personalise your experience and search results; send transactional emails (booking confirmations, etc.); send marketing emails (you can opt out at any time); improve the Platform through analytics; prevent fraud and ensure security.`,
  },
  {
    title: '3. Who We Share Data With',
    content: `We share limited data with: vendors you book (your name, contact, and booking details); Stripe and Paystack for payment processing; analytics providers (Vercel Analytics — anonymised); email providers for transactional communications. We do not sell your personal data to any third party. Ever.`,
  },
  {
    title: '4. Data Retention',
    content: `We keep your account data for as long as your account is active. If you delete your account, we remove personal data within 30 days. Booking records are retained for 12 months for dispute resolution purposes. Anonymised analytics data may be retained indefinitely.`,
  },
  {
    title: '5. Your Rights',
    content: `Depending on your location, you have the right to: access the data we hold about you; correct inaccurate data; delete your account and associated data; export your data in a portable format; opt out of marketing communications at any time. To exercise any of these rights, contact privacy@vowconnect.com.`,
  },
  {
    title: '6. Cookies',
    content: `VowConnect uses cookies for: authentication (keeping you logged in); preferences (dark/light mode); analytics (anonymised usage data). You can disable cookies in your browser, but some features may not work correctly.`,
  },
  {
    title: '7. Security',
    content: `We use industry-standard security measures including HTTPS encryption, hashed passwords, and secure JWT session tokens. We conduct regular security reviews. In the event of a data breach, we will notify affected users within 72 hours.`,
  },
  {
    title: '8. International Transfers',
    content: `VowConnect serves users across Nigeria, the UK, USA, and Canada. Data may be processed in different countries. We ensure appropriate safeguards are in place for all international data transfers.`,
  },
  {
    title: '9. Contact',
    content: `For privacy-related questions, contact privacy@vowconnect.com. For general enquiries, use our Contact page.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />

      <section className="pt-28 pb-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-4">Legal</div>
          <h1 className="font-display text-5xl text-theme mb-4">Privacy Policy</h1>
          <p className="text-theme-muted text-sm">Last updated: January 2025 · <Link href="/terms" className="text-[#C8A96E] hover:underline">Terms of Service</Link></p>
        </div>
      </section>

      <section className="px-4 md:px-6 pb-24">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="card p-7 bg-[#F5ECD8] dark:bg-[#1A130A] border-[#E3CC99] dark:border-[#2A1F0A]">
            <p className="text-[#8A6A2E] dark:text-[#C8A96E] text-sm leading-relaxed">
              <strong>The short version:</strong> We collect the minimum data needed to run the Platform. We never sell it. You can delete your account and data at any time.
            </p>
          </div>
          {SECTIONS.map(s => (
            <div key={s.title} className="card p-7">
              <h2 className="font-semibold text-theme mb-3">{s.title}</h2>
              <p className="text-theme-muted text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
