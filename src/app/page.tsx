import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VowConnect — Nigerian & Diaspora Wedding Vendor Marketplace',
  description: 'Find and book verified Gele stylists, makeup artists, photographers, content creators, mobile photographers and more for your Nigerian wedding — in Lagos, London, Houston, Toronto and beyond.',
  openGraph: {
    title: 'VowConnect — Nigerian Wedding Vendor Marketplace',
    description: 'Find and book verified Nigerian wedding vendors anywhere in the world.',
    url: 'https://vowconnect.com',
    siteName: 'VowConnect',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VowConnect — Nigerian Wedding Vendor Marketplace',
    description: 'Find and book verified Nigerian wedding vendors anywhere in the world.',
  },
}

import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/ThemeProvider'

const CATS = [
  { name: 'Gele Stylist',    slug: 'gele-stylist',    emoji: '🧣', count: 48 },
  { name: 'Makeup Artist',   slug: 'makeup-artist',   emoji: '💄', count: 62 },
  { name: 'Photographer',    slug: 'photographer',    emoji: '📸', count: 35 },
  { name: 'Event Decorator', slug: 'decorator',       emoji: '🌸', count: 29 },
  { name: 'Caterer',         slug: 'caterer',         emoji: '🍽️', count: 41 },
  { name: 'Cake Designer',   slug: 'cake-designer',   emoji: '🎂', count: 22 },
  { name: 'DJ & MC',         slug: 'dj-mc',           emoji: '🎵', count: 17 },
  { name: 'Wedding Planner',    slug: 'wedding-planner',    emoji: '📋', count: 14 },
  { name: 'Content Creator',     slug: 'content-creator',     emoji: '🎬', count: 18 },
  { name: 'Mobile Photographer', slug: 'mobile-photographer', emoji: '📱', count: 11 },
]

const VENDORS = [
  { name: 'Adaeze Gele & Bridal',   area: 'Victoria Island, Lagos', cat: 'Gele Stylist',  price: '₦25k–150k',  rating: 4.9, reviews: 47, e: '🧣', tag: 'Most Booked' },
  { name: "Fatima's Gele Studio",   area: 'Peckham, London',        cat: 'Gele Stylist',  price: '£80–350',    rating: 5.0, reviews: 31, e: '🧣', tag: 'UK Top Pick'  },
  { name: "Tolu's Beauty Studio",   area: 'Lekki Phase 1, Lagos',   cat: 'Makeup Artist', price: '₦30k–120k',  rating: 4.8, reviews: 89, e: '💄', tag: 'Top Rated'    },
]

const LOCATIONS = [
  { flag: '🇳🇬', city: 'Lagos',   count: '200+ vendors' },
  { flag: '🇳🇬', city: 'Abuja',   count: '60+ vendors'  },
  { flag: '🇬🇧', city: 'London',  count: '85+ vendors'  },
  { flag: '🇺🇸', city: 'Houston', count: '40+ vendors'  },
  { flag: '🇺🇸', city: 'Atlanta', count: '35+ vendors'  },
  { flag: '🇨🇦', city: 'Toronto', count: '28+ vendors'  },
]

const STEPS = [
  { n: '01', title: 'Browse & Discover', body: 'Search by category, city, and budget. View real portfolios and verified reviews from brides across Nigeria and the diaspora.' },
  { n: '02', title: 'Book & Connect',    body: 'Send a booking request in 60 seconds. Chat on WhatsApp. Vendors respond within hours, wherever they are in the world.' },
  { n: '03', title: 'Celebrate',         body: 'Show up on your day with total confidence. Your vendor is verified, confirmed, and ready to make magic.' },
]

const REVIEWS = [
  { name: 'Chioma Okafor',  role: 'Bride · Lekki 2024',       text: 'Found my Gele stylist in 10 minutes. She was breathtaking. VowConnect is a lifesaver for Nigerian brides.',     init: 'C' },
  { name: 'Bisi Adeyemi',   role: 'MOB · London 2024',        text: 'Planning a Nigerian wedding from London felt impossible until VowConnect. Connected us with vendors back home seamlessly.', init: 'B' },
  { name: 'Amaka Obi',      role: 'Bride · Houston 2024',     text: 'As a Nigerian-American bride I needed authentic vendors. VowConnect understood exactly what I was looking for.',  init: 'A' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-theme overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 group">
            <span className="font-display text-xl text-theme">Vow</span>
            <span className="font-display text-xl text-[#C8A96E]">Connect</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[['Browse Vendors','/vendors'],['Features','/features'],['Pricing','/pricing'],['How It Works','/how-it-works']].map(([l,h]) => (
              <Link key={l} href={h} className="text-sm font-medium text-theme-muted hover:text-theme transition-colors">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login"    className="btn-ghost text-sm hidden sm:flex">Sign In</Link>
            <Link href="/register" className="btn-sand text-sm py-2 px-4 md:px-5 rounded-full">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#080808]" />
        <div className="absolute inset-0 grid-lines" />
        {/* Warm glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(200,169,110,0.11) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 right-0 w-1/2 h-2/3 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at bottom right, rgba(180,100,80,0.07) 0%, transparent 55%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-20 w-full">
          <div className="max-w-4xl">
            {/* Label */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in">
              <div className="w-8 h-px bg-[#C8A96E]" />
              <span className="text-[#C8A96E] text-[10px] font-bold uppercase tracking-[0.25em]">Nigeria & Diaspora Wedding Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-[clamp(44px,7.5vw,96px)] leading-[0.92] text-white mb-8 animate-fade-up tracking-tight">
              Your dream<br />
              <span className="text-sand-grad">Nigerian wedding</span><br />
              <span className="italic text-white/30">anywhere in the world.</span>
            </h1>

            <p className="text-white/40 text-lg md:text-xl font-light max-w-lg mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '100ms' }}>
              Find and book verified Gele stylists, makeup artists, photographers, content creators and more — in Lagos, London, Houston, Toronto and beyond.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <Link href="/find-my-vendor"
                style={{ background: 'linear-gradient(135deg,#C9941A,#E4B520)', boxShadow: '0 4px 20px rgba(201,148,26,0.4)' }}
                className="px-8 py-4 text-base rounded-full text-white font-bold hover:opacity-90 transition-opacity">
                ✨ Find My Vendors
              </Link>
              <Link href="/vendors" className="btn-sand px-8 py-4 text-base rounded-full">
                Browse Vendors →
              </Link>
              <Link href="/register" className="group flex items-center gap-2.5 text-white/40 hover:text-white text-sm font-medium transition-colors">
                <span className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center group-hover:border-[#C8A96E] group-hover:text-[#C8A96E] transition-all">+</span>
                List Your Business Free
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 md:gap-12 mt-14 pt-12 border-t border-white/6 animate-fade-up" style={{ animationDelay: '300ms' }}>
              {[['500+','Verified Vendors'],['2,400+','Bookings Done'],['4.9 ★','Avg Rating'],['6','Countries']].map(([v,l]) => (
                <div key={l}>
                  <div className="font-display text-2xl text-white">{v}</div>
                  <div className="text-white/25 text-[10px] mt-1 uppercase tracking-[0.15em]">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Location tags - desktop */}
          <div className="absolute right-6 bottom-24 hidden xl:flex flex-col gap-2">
            {LOCATIONS.slice(0,4).map((l, i) => (
              <div key={l.city} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/8 animate-slide-up"
                style={{ animationDelay: `${400 + i * 80}ms`, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
                <span className="text-base">{l.flag}</span>
                <div>
                  <div className="text-white text-xs font-semibold">{l.city}</div>
                  <div className="text-white/30 text-[10px]">{l.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <div className="text-white/15 text-[9px] uppercase tracking-[0.25em]">Scroll</div>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ── LOCATIONS STRIP ── */}
      <div className="bg-[#0D0D0D] border-y border-white/6 py-5 overflow-hidden">
        <div className="flex gap-10 animate-[shimmer_20s_linear_infinite] whitespace-nowrap px-6">
          {[...LOCATIONS,...LOCATIONS].map((l, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg">{l.flag}</span>
              <span className="text-white/50 text-sm font-medium">{l.city}</span>
              <span className="text-white/20 text-xs">{l.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="py-24 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <div className="section-label mb-4">Categories</div>
              <h2 className="font-display text-4xl md:text-5xl text-theme">Every vendor for<br/><span className="italic text-theme-muted">your big day</span></h2>
            </div>
            <Link href="/vendors" className="btn-outline self-start md:self-auto">View All Vendors →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CATS.map((cat, i) => (
              <Link key={cat.slug} href={`/vendors?category=${cat.slug}`}
                className="group relative card p-5 md:p-6 card-hover cursor-pointer">
                <div className="text-3xl mb-4">{cat.emoji}</div>
                <div className="font-semibold text-theme text-sm group-hover:text-[#C8A96E] transition-colors">{cat.name}</div>
                <div className="text-theme-faint text-xs mt-1">{cat.count} vendors</div>
                <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-[rgba(10,10,10,0.04)] dark:bg-white/5 flex items-center justify-center text-theme-faint text-[10px] group-hover:bg-[#C8A96E] group-hover:text-white transition-all duration-300">→</div>
                {i === 0 && <div className="absolute top-3 right-3 badge-sand text-[9px]">Popular</div>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VENDORS ── */}
      <section className="py-24 md:py-32 px-4 md:px-6 bg-[#080808] relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(200,169,110,0.07) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <div className="section-label mb-4">Hand-picked</div>
              <h2 className="font-display text-4xl md:text-5xl text-white">Featured<br/><span className="italic text-white/25">vendors</span></h2>
            </div>
            <Link href="/vendors" className="self-start text-white/30 hover:text-white text-sm font-medium transition-colors">Browse all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {VENDORS.map(v => (
              <div key={v.name} className="group rounded-2xl overflow-hidden border border-white/6 hover:border-[#C8A96E]/30 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="h-44 flex items-center justify-center relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-6xl opacity-10 group-hover:scale-110 transition-transform duration-500">{v.e}</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/8 text-white/60 text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/10">{v.tag}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="text-white font-semibold text-sm">{v.name}</div>
                    <div className="text-white/35 text-xs mt-0.5">📍 {v.area}</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#C8A96E] text-xs">★ <span className="text-white font-semibold">{v.rating}</span> <span className="text-white/25">({v.reviews})</span></span>
                    <span className="text-white/8">·</span>
                    <span className="text-xs font-semibold text-[#C8A96E]">{v.price}</span>
                    <Link href="/vendors" className="ml-auto text-xs font-semibold text-[#C8A96E]/60 hover:text-[#C8A96E] transition-colors">Book →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <div className="section-label mb-4">Process</div>
            <h2 className="font-display text-4xl md:text-5xl text-theme">Three steps to your<br /><span className="italic text-theme-muted">perfect vendor</span></h2>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden">
            {STEPS.map((s, i) => (
              <div key={s.n} className="bg-theme-card p-8 md:p-10 relative group hover:bg-theme-subtle transition-colors">
                <div className="font-mono text-xs text-[#C8A96E] mb-6 uppercase tracking-widest">{s.n}</div>
                <h3 className="font-display text-2xl text-theme mb-4">{s.title}</h3>
                <p className="text-theme-muted text-sm leading-relaxed">{s.body}</p>
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#C8A96E] rounded-full items-center justify-center text-white text-xs z-10 shadow-[0_4px_12px_rgba(200,169,110,0.4)]">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-24 md:py-32 px-4 md:px-6 bg-theme-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label mb-4">Testimonials</div>
            <h2 className="font-display text-4xl md:text-5xl text-theme">Brides love<br/><span className="italic text-theme-muted">VowConnect</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {REVIEWS.map(r => (
              <div key={r.name} className="card p-7 md:p-8 card-hover relative">
                <div className="font-display text-7xl text-[#C8A96E]/10 absolute top-4 right-5 leading-none select-none">&ldquo;</div>
                <div className="flex gap-0.5 mb-5">{[1,2,3,4,5].map(i => <span key={i} className="text-[#C8A96E] text-xs">★</span>)}</div>
                <p className="text-theme-muted text-sm leading-relaxed mb-8">{r.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                  <div className="w-9 h-9 rounded-full bg-[#F5ECD8] dark:bg-[#2A1F10] flex items-center justify-center font-semibold text-[#8A6A2E] text-sm">{r.init}</div>
                  <div>
                    <div className="font-semibold text-theme text-sm">{r.name}</div>
                    <div className="text-theme-faint text-xs">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR VENDORS ── */}
      <section id="vendors" className="py-24 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-[#080808] overflow-hidden relative p-10 md:p-20">
            <div className="absolute inset-0 grid-lines opacity-50" />
            <div className="absolute right-0 top-0 w-2/3 h-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right center, rgba(200,169,110,0.07) 0%, transparent 55%)' }} />
            <div className="relative z-10 max-w-xl">
              <div className="section-label mb-6">For Vendors</div>
              <h2 className="font-display text-4xl md:text-5xl text-white mb-6 leading-tight">
                Reach brides in<br />
                <span className="text-sand-grad">Nigeria & diaspora</span>
              </h2>
              <p className="text-white/35 text-base leading-relaxed mb-10">
                List your business free on VowConnect. Get discovered by brides in Lagos, London, New York, Toronto and beyond.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register?role=vendor" className="btn-sand px-8 py-4 text-base rounded-full">
                  List Your Business Free →
                </Link>
                <Link href="/login" className="flex items-center text-white/30 hover:text-white text-sm font-medium transition-colors sm:pl-2">
                  Already a member? Sign in
                </Link>
              </div>
              <div className="flex flex-wrap gap-8 mt-12 pt-10 border-t border-white/6">
                {[['Free','To join'],['₦0','Setup fee'],['Day 1','Earn bookings']].map(([v,l]) => (
                  <div key={l}>
                    <div className="font-display text-2xl text-white">{v}</div>
                    <div className="text-white/20 text-[10px] uppercase tracking-widest mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080808] border-t border-white/5 py-14 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-1 mb-4">
                <span className="font-display text-xl text-white">Vow</span>
                <span className="font-display text-xl text-[#C8A96E]">Connect</span>
              </div>
              <p className="text-white/20 text-sm leading-relaxed max-w-xs">
                Nigeria &amp; diaspora&apos;s premier marketplace for verified wedding vendors.
              </p>
              <div className="flex gap-5 mt-6">
                {['Instagram','TikTok','WhatsApp'].map(s => (
                  <a key={s} href="#" className="text-white/20 hover:text-[#C8A96E] text-xs transition-colors">{s}</a>
                ))}
              </div>
            </div>
            {[
              { t: 'For Clients',  l: [['✨ Find My Vendors','/find-my-vendor'],['Browse Vendors','/vendors'],['How It Works','/how-it-works'],['FAQ','/faq'],['Contact','/contact']] },
              { t: 'For Vendors',  l: [['List Business','/register?role=vendor'],['Vendor Guide','/vendor-guide'],['Pricing','/pricing'],['FAQ','/faq']] },
              { t: 'Company',      l: [['About','/about'],['Blog','/blog'],['Features','/features'],['Contact','/contact']] },
            ].map(col => (
              <div key={col.t}>
                <h4 className="text-white/35 font-bold text-[9px] mb-4 uppercase tracking-[0.2em]">{col.t}</h4>
                <ul className="space-y-2.5">
                  {col.l.map(([label, href]) => <li key={label}><a href={href} className="text-white/20 hover:text-[#C8A96E] text-sm transition-colors">{label}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/15 text-xs">© {new Date().getFullYear()} VowConnect. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy','Terms','Contact'].map(l => <a key={l} href="#" className="text-white/15 hover:text-[#C8A96E] text-xs transition-colors">{l}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
