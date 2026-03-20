import Link from 'next/link'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using VowConnect ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. These terms apply to all users — brides, clients, vendors, and administrators.`,
  },
  {
    title: '2. Who We Are',
    content: `VowConnect is a wedding vendor marketplace operated by VowConnect Ltd. We provide a platform connecting brides and clients with wedding vendors serving Nigeria and the diaspora. We are not a party to any agreement between vendors and clients.`,
  },
  {
    title: '3. User Accounts',
    content: `You must create an account to use most features. You are responsible for keeping your login credentials secure. You must provide accurate, current information. You may not impersonate another person or create accounts for fraudulent purposes. VowConnect reserves the right to suspend or delete accounts that violate these terms.`,
  },
  {
    title: '4. Vendor Listings',
    content: `Vendors must provide accurate information about their services, pricing, and availability. Portfolio images must be your own work. Fake reviews, misleading descriptions, and fraudulent pricing are grounds for immediate removal. VowConnect reviews all vendor profiles before they go live and may remove listings that do not meet our standards.`,
  },
  {
    title: '5. Bookings & Payments',
    content: `VowConnect facilitates booking requests but is not responsible for the fulfilment of services. All payment and service agreements are between the vendor and client directly. VowConnect does not hold or process payments on behalf of vendors. Disputes should first be attempted to resolve directly between parties; VowConnect may mediate if required.`,
  },
  {
    title: '6. Reviews & Content',
    content: `Reviews must be honest and based on genuine experiences. You may not post defamatory, false, or malicious content. VowConnect may remove content that violates community standards. By posting content on VowConnect, you grant VowConnect a non-exclusive license to display it on the Platform.`,
  },
  {
    title: '7. Prohibited Conduct',
    content: `You may not: use the Platform for any unlawful purpose; spam, harass, or abuse other users; attempt to bypass verification or security systems; scrape or copy Platform data without permission; use the Platform to promote competing services in a deceptive way.`,
  },
  {
    title: '8. Subscription Plans',
    content: `Vendor subscription plans are billed monthly. Upgrades take effect immediately. Downgrades take effect at the end of the billing period. VowConnect reserves the right to change pricing with 30 days notice. No refunds are provided for unused portions of a subscription period.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `VowConnect is a marketplace platform and does not guarantee the quality, reliability, or legality of vendor services. VowConnect\' liability is limited to the amount paid to us in the 30 days preceding any claim. We are not liable for any indirect, consequential, or incidental damages.`,
  },
  {
    title: '10. Changes to Terms',
    content: `We may update these Terms at any time. We will notify users of significant changes via email or in-app notification. Continued use of the Platform after changes constitutes acceptance.`,
  },
  {
    title: '11. Contact',
    content: `For questions about these Terms, contact us at legal@vowconnect.com or through our Contact page.`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />

      <section className="pt-28 pb-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-4">Legal</div>
          <h1 className="font-display text-5xl text-theme mb-4">Terms of Service</h1>
          <p className="text-theme-muted text-sm">Last updated: January 2025 · <Link href="/privacy" className="text-[#C8A96E] hover:underline">Privacy Policy</Link></p>
        </div>
      </section>

      <section className="px-4 md:px-6 pb-24">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="card p-7 bg-[#F5ECD8] dark:bg-[#1A130A] border-[#E3CC99] dark:border-[#2A1F0A]">
            <p className="text-[#8A6A2E] dark:text-[#C8A96E] text-sm leading-relaxed">
              <strong>Summary:</strong> VowConnect connects brides with wedding vendors. We are a marketplace — not a service provider. Be honest, be respectful, and don&apos;t do anything dodgy. Full terms below.
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
