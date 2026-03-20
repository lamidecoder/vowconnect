import Link from 'next/link'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

const PLANS = [
  {
    name: 'Free', price: { ng: '₦0', uk: '£0', us: '$0' }, period: 'forever',
    desc: 'Perfect for getting started.',
    features: ['Basic profile listing','5 portfolio images','WhatsApp contact button','Appear in search results','3 bookings/month','Basic analytics'],
    missing: ['Featured placement','Priority support','Instagram sync','Unlimited bookings','Verified badge'],
    cta: 'Start Free', href: '/register?role=vendor', featured: false,
  },
  {
    name: 'Pro', price: { ng: '₦15,000', uk: '£25', us: '$30' }, period: '/month',
    desc: 'For serious vendors ready to grow.',
    features: ['Everything in Free','30 portfolio images','Unlimited bookings','Verified badge','Featured in category','Instagram sync','Advanced analytics','Priority support','Custom profile URL'],
    missing: ['Homepage featured slot','Dedicated account manager'],
    cta: 'Start Pro — 14 days free', href: '/register?role=vendor&plan=pro', featured: true,
  },
  {
    name: 'Premium', price: { ng: '₦35,000', uk: '£60', us: '$75' }, period: '/month',
    desc: 'Maximum visibility for top vendors.',
    features: ['Everything in Pro','Unlimited portfolio','Homepage featured slot','Top of search results','Full Instagram sync','Dedicated account manager','Early access to features','Co-marketing opportunities'],
    missing: [],
    cta: 'Go Premium', href: '/register?role=vendor&plan=premium', featured: false,
  },
]

const FAQS = [
  { q: 'Can I switch plans at any time?', a: 'Yes. Upgrade or downgrade anytime. Upgrades take effect immediately; downgrades at end of billing cycle.' },
  { q: 'Is there a contract or minimum commitment?', a: 'No contracts. All plans are month-to-month. Cancel anytime with no hidden fees.' },
  { q: 'What payment methods do you accept?', a: 'All major cards, bank transfer (Nigeria), and mobile money. Stripe for international, Paystack for Nigerian vendors.' },
  { q: 'Do clients pay to use VowConnect?', a: 'Never. VowConnect is completely free for brides and clients. We only charge vendors for premium features.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes — Pro comes with a 14-day free trial, no credit card required.' },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />
      <section className="pt-28 pb-16 px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-4">Pricing</div>
          <h1 className="font-display text-5xl md:text-6xl text-theme mb-5 leading-tight">Simple, honest<br /><span className="italic text-theme-muted">pricing</span></h1>
          <p className="text-theme-muted text-lg max-w-xl mx-auto">Start free and grow at your own pace. No hidden fees, no contracts.</p>
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            {['🇳🇬 ₦ Nigeria','🇬🇧 £ UK','🇺🇸 $ USA'].map(l => <span key={l} className="badge-gray text-xs px-3 py-1.5">{l}</span>)}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5 items-start">
            {PLANS.map(plan => (
              <div key={plan.name} className={`card relative ${plan.featured ? 'ring-2 ring-[#C8A96E] ring-offset-2 ring-offset-[var(--bg)]' : ''}`}>
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C8A96E] text-white text-[10px] font-bold px-4 py-1 rounded-full">★ Most Popular</div>
                )}
                <div className={`p-7 border-b border-[var(--border)] ${plan.featured ? 'bg-[#C8A96E]/5' : ''}`}>
                  <div className="font-bold text-theme text-xs uppercase tracking-widest mb-3">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl text-theme">{plan.price.ng}</span>
                    <span className="text-theme-muted text-sm">{plan.period}</span>
                  </div>
                  <div className="text-theme-faint text-xs mb-4">{plan.price.uk}{plan.period !== 'forever' ? plan.period : ''} · {plan.price.us}{plan.period !== 'forever' ? plan.period : ''}</div>
                  <p className="text-theme-muted text-sm">{plan.desc}</p>
                </div>
                <div className="p-7">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(f => <li key={f} className="flex items-start gap-2.5 text-sm text-theme"><span className="text-[#C8A96E] flex-shrink-0">✓</span>{f}</li>)}
                    {plan.missing.map(f => <li key={f} className="flex items-start gap-2.5 text-sm text-theme-faint opacity-40"><span className="flex-shrink-0">✗</span>{f}</li>)}
                  </ul>
                  <Link href={plan.href} className={`block text-center py-3.5 rounded-xl text-sm font-semibold transition-all ${plan.featured ? 'bg-[#C8A96E] text-white hover:bg-[#B08940]' : 'border border-[var(--border)] text-theme hover:border-[#C8A96E] hover:text-[#C8A96E]'}`}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-[#080808] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute inset-0 grid-lines opacity-40" />
            <div className="relative z-10 flex-1">
              <div className="section-label mb-3">For Brides</div>
              <h2 className="font-display text-3xl text-white mb-3">Always free for brides</h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-md">Browsing, booking, saving vendors — completely free for clients, forever.</p>
            </div>
            <Link href="/register" className="relative z-10 btn-sand px-8 py-4 rounded-full text-base flex-shrink-0">Start Browsing Free →</Link>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 py-20 bg-theme-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12"><div className="section-label mb-3">FAQ</div><h2 className="font-display text-4xl text-theme">Pricing questions</h2></div>
          <div className="space-y-3">
            {FAQS.map(f => (
              <div key={f.q} className="card p-6">
                <div className="font-semibold text-theme mb-2">{f.q}</div>
                <p className="text-theme-muted text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-theme-muted text-sm mt-10">Still have questions? <Link href="/contact" className="text-[#C8A96E] font-semibold">Contact us →</Link></p>
        </div>
      </section>
      <MarketingFooter />
    </div>
  )
}
