import Link from 'next/link'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

const VALUES = [
  { icon: '🤝', title: 'Trust First', body: 'Every vendor is reviewed before going live. Every review is from a real booking. We never compromise on trust.' },
  { icon: '🌍', title: 'Diaspora Proud', body: 'We were built for Nigerians wherever they are — Lagos, London, Houston, Toronto. Your culture travels with you.' },
  { icon: '📱', title: 'WhatsApp Native', body: 'We don\'t fight how Nigerians communicate. We built on top of it. WhatsApp is the centre of every vendor connection.' },
  { icon: '🪙', title: 'Transparent Pricing', body: 'No surprise fees. No hidden commissions. Vendors keep 100% of what clients pay them. We charge vendors a simple monthly fee for premium features.' },
]

const TEAM = [
  { name: 'Lamide A.',       role: 'Founder & CEO',          init: 'L', location: 'Lagos & London' },
  { name: 'Tunde O.',        role: 'Head of Vendor Relations', init: 'T', location: 'Lagos' },
  { name: 'Adaeze M.',       role: 'Head of Operations',      init: 'A', location: 'Abuja' },
  { name: 'Femi D.',         role: 'Lead Engineer',           init: 'F', location: 'London' },
  { name: 'Priscilla N.',    role: 'Community Manager',       init: 'P', location: 'Houston' },
]

const MILESTONES = [
  { year: '2023', event: 'VowConnect founded in Lagos' },
  { year: '2024', event: 'Launched in London & Houston' },
  { year: '2024', event: '500+ verified vendors onboarded' },
  { year: '2025', event: '2,000+ weddings served' },
  { year: '2025', event: 'Expanded to Toronto & Accra' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(200,169,110,0.15) 0%, transparent 60%)' }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="section-label mb-4">About VowConnect</div>
          <h1 className="font-display text-5xl md:text-7xl text-theme mb-8 leading-[0.95]">
            Built for Nigerian<br />weddings,<br />
            <span className="italic text-theme-muted">wherever they happen.</span>
          </h1>
          <p className="text-theme-muted text-xl max-w-2xl leading-relaxed">
            VowConnect was born from a simple frustration: finding trusted Nigerian wedding vendors — especially from abroad — was too hard. We built the platform we wished existed.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 md:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-6">Our Story</div>
          <div className="space-y-5 text-theme-muted text-base leading-relaxed">
            <p>Planning a Nigerian wedding from London is hard. You need a Gele stylist who knows what they&apos;re doing, a makeup artist who understands your skin, a photographer who captures the aso-ebi moments, and a decorator who gets the cultural significance of every detail.</p>
            <p>Before VowConnect, finding these people meant WhatsApp groups with thousands of messages, word-of-mouth referrals that didn&apos;t always pan out, and Instagram DMs with no guarantee the person was legitimate or available on your date.</p>
            <p>We built VowConnect to fix that. A single, trusted marketplace where every vendor is verified, every review is real, and booking takes minutes not months.</p>
            <p className="font-medium text-theme">Today, VowConnect connects brides with hundreds of verified vendors across Nigeria, the UK, the USA, and Canada — and we&apos;re just getting started.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 md:px-6 py-16 bg-theme-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-label mb-3">What We Stand For</div>
            <h2 className="font-display text-4xl text-theme">Our values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="card p-7 card-hover">
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-semibold text-theme mb-2">{v.title}</h3>
                <p className="text-theme-muted text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="px-4 md:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-8">Timeline</div>
          <div className="relative">
            <div className="absolute left-14 top-0 bottom-0 w-px bg-[var(--border)]" />
            <div className="space-y-6">
              {MILESTONES.map(m => (
                <div key={m.event} className="flex items-center gap-6">
                  <div className="w-14 text-right text-[#C8A96E] font-mono text-xs font-bold flex-shrink-0">{m.year}</div>
                  <div className="w-3 h-3 rounded-full bg-[#C8A96E] flex-shrink-0 z-10 ring-4 ring-[var(--bg)]" />
                  <div className="font-medium text-theme text-sm">{m.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-4 md:px-6 py-16 bg-theme-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-label mb-3">The Team</div>
            <h2 className="font-display text-4xl text-theme">Who builds VowConnect</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEAM.map(t => (
              <div key={t.name} className="card p-6 text-center card-hover">
                <div className="w-14 h-14 rounded-full bg-[#F5ECD8] dark:bg-[#2A1F10] flex items-center justify-center font-display text-2xl text-[#8A6A2E] mx-auto mb-4">{t.init}</div>
                <div className="font-semibold text-theme text-sm">{t.name}</div>
                <div className="text-theme-muted text-xs mt-1">{t.role}</div>
                <div className="text-theme-faint text-[10px] mt-1">📍 {t.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join us */}
      <section className="px-4 md:px-6 py-20 bg-[#080808] relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl text-white mb-4">Be part of the story</h2>
          <p className="text-white/40 text-sm mb-8">Join thousands of brides and vendors already on VowConnect.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-sand px-8 py-4 rounded-full text-base">Get Started Free →</Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/15 text-white/60 text-base font-semibold hover:border-[#C8A96E] hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
