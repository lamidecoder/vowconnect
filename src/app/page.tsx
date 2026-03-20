import type { Metadata } from 'next'
import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/ThemeProvider'

export const metadata: Metadata = {
  title: 'VowConnect – Find & Book Verified Nigerian Wedding Vendors Globally',
  description: 'Find and book verified Gele stylists, makeup artists, photographers, content creators and more – in Lagos, London, Houston, Toronto and beyond.',
  openGraph: {
    title: 'VowConnect – Nigerian Wedding Vendor Marketplace',
    description: 'Find and book verified Nigerian wedding vendors anywhere in the world.',
    url: 'https://vowconnect.com',
    siteName: 'VowConnect',
    type: 'website',
  },
}

const CATS = [
  { name: 'Gele Stylist',     slug: 'gele-stylist',    emoji: '🧣', count: 48 },
  { name: 'Makeup Artist',    slug: 'makeup-artist',   emoji: '💄', count: 62 },
  { name: 'Photographer',     slug: 'photographer',    emoji: '📸', count: 35 },
  { name: 'Event Decorator',  slug: 'decorator',       emoji: '🌸', count: 29 },
  { name: 'Caterer',          slug: 'caterer',         emoji: '🍽️', count: 41 },
  { name: 'Cake Designer',    slug: 'cake-designer',   emoji: '🎂', count: 22 },
  { name: 'DJ & MC',          slug: 'dj-mc',           emoji: '🎵', count: 17 },
  { name: 'Wedding Planner',  slug: 'wedding-planner', emoji: '📋', count: 14 },
  { name: 'Content Creator',  slug: 'content-creator', emoji: '🎬', count: 18 },
  { name: 'Fashion Designer', slug: 'fashion-designer',emoji: '👗', count: 11 },
  { name: 'Sound Engineer',   slug: 'sound-engineer',  emoji: '🎛️', count: 8  },
  { name: 'Videographer',     slug: 'videographer',    emoji: '🎥', count: 24 },
]

const QUICK_CATS = [
  { label: 'Gele',        slug: 'gele-stylist',    emoji: '🧣' },
  { label: 'Makeup',      slug: 'makeup-artist',   emoji: '💄' },
  { label: 'Photos',      slug: 'photographer',    emoji: '📸' },
  { label: 'Decor',       slug: 'decorator',       emoji: '🌸' },
  { label: 'Catering',    slug: 'caterer',         emoji: '🍽️' },
  { label: 'DJ & MC',     slug: 'dj-mc',           emoji: '🎵' },
]

const LOCATIONS = [
  { flag: '🇳🇬', city: 'Lagos',   count: '200+' },
  { flag: '🇳🇬', city: 'Abuja',   count: '60+'  },
  { flag: '🇬🇧', city: 'London',  count: '85+'  },
  { flag: '🇺🇸', city: 'Houston', count: '40+'  },
  { flag: '🇺🇸', city: 'Atlanta', count: '35+'  },
  { flag: '🇨🇦', city: 'Toronto', count: '28+'  },
]

const VENDORS = [
  { name: 'Adaeze Gele & Bridal', area: 'Victoria Island, Lagos', cat: 'Gele Stylist',  price: '₦25k–150k', rating: 4.9, reviews: 47, e: '🧣', tag: 'Most Booked' },
  { name: "Fatima's Gele Studio", area: 'Peckham, London',        cat: 'Gele Stylist',  price: '£80–350',   rating: 5.0, reviews: 31, e: '🧣', tag: 'UK Top Pick'  },
  { name: "Tolu's Beauty Studio", area: 'Lekki Phase 1, Lagos',   cat: 'Makeup Artist', price: '₦30k–120k', rating: 4.8, reviews: 89, e: '💄', tag: 'Top Rated'    },
]

const STEPS = [
  { n: '01', title: 'Browse & Discover', body: 'Search by category, city, and budget. View real portfolios and verified reviews from brides across Nigeria and the diaspora.', icon: '🔍' },
  { n: '02', title: 'Book & Connect',    body: 'Send a booking request in 60 seconds. Chat directly with vendors. They respond within hours, wherever in the world.',           icon: '💬' },
  { n: '03', title: 'Celebrate',         body: 'Show up on your day with total confidence. Your vendor is verified, confirmed, and ready to make magic.',                       icon: '🎉' },
]

const REVIEWS = [
  { name: 'Chioma Okafor', role: 'Bride · Lekki 2024',   text: 'Found my Gele stylist in 10 minutes. She was breathtaking. VowConnect is a lifesaver for Nigerian brides.',          init: 'C' },
  { name: 'Bisi Adeyemi',  role: 'MOB · London 2024',    text: 'Planning a Nigerian wedding from London felt impossible until VowConnect. Connected us with vendors back home.',       init: 'B' },
  { name: 'Amaka Obi',     role: 'Bride · Houston 2024', text: 'As a Nigerian-American bride I needed authentic vendors. VowConnect understood exactly what I was looking for.',     init: 'A' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-theme overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-0.5 flex-shrink-0">
            <span className="font-display text-lg sm:text-xl text-theme">Vow</span>
            <span className="font-display text-lg sm:text-xl text-[#C8A96E]">Connect</span>
          </Link>
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            {[['Browse Vendors','/vendors'],['Pricing','/pricing'],['How It Works','/how-it-works']].map(([l,h]) => (
              <Link key={l} href={h} className="text-sm font-medium text-theme-muted hover:text-theme transition-colors whitespace-nowrap">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Link href="/login" className="btn-ghost text-xs sm:text-sm hidden sm:flex px-3 py-1.5">Sign In</Link>
            <Link href="/register" className="btn-sand text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-5 rounded-full whitespace-nowrap">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#080808]" />
        <div className="absolute inset-0 grid-lines" />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[300px] sm:w-[600px] md:w-[900px] h-[300px] sm:h-[500px] md:h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(200,169,110,0.11) 0%, transparent 60%)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20">
          {/* Label */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-6 sm:w-8 h-px bg-[#C8A96E] flex-shrink-0" />
            <span className="text-[#C8A96E] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em]">Nigeria & Diaspora Wedding Marketplace</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(36px,8vw,88px)] leading-[0.9] text-white mb-5 sm:mb-7 tracking-tight">
            Find & Book<br />
            <span className="text-sand-grad">Nigerian Wedding</span><br />
            <span className="italic text-white/25">Vendors Globally.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-white/40 text-sm sm:text-base md:text-xl font-light max-w-sm sm:max-w-lg mb-7 sm:mb-9 leading-relaxed">
            Gele stylists, makeup artists, photographers & more — Lagos, London, Houston, Toronto and beyond.
          </p>

          {/* Quick category pills */}
          <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
            {QUICK_CATS.map(c => (
              <Link key={c.slug} href={`/vendors?category=${c.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 hover:scale-105"
                style={{ background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.25)', color:'#C8A96E' }}>
                <span>{c.emoji}</span> {c.label}
              </Link>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 sm:mb-8">
            <Link href="/vendors"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base rounded-full text-white font-bold hover:opacity-90 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg,#C9941A,#E4B520)', boxShadow: '0 4px 20px rgba(201,148,26,0.4)' }}>
              ✨ Find My Vendors
            </Link>
            <Link href="/register?role=vendor"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base rounded-full font-semibold transition-all active:scale-95"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)' }}>
              🏪 List Your Business Free
            </Link>
          </div>

          {/* City pills */}
          <div className="flex flex-wrap gap-2 mb-10 sm:mb-14">
            <span className="text-white/20 text-[10px] sm:text-xs self-center">Browse by city:</span>
            {LOCATIONS.map(l => (
              <Link key={l.city} href={`/vendors?city=${l.city.toLowerCase()}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all hover:opacity-80 active:scale-95"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.35)' }}>
                {l.flag} {l.city} <span style={{color:'rgba(255,255,255,0.15)'}}>{l.count}</span>
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-4 sm:gap-8 md:gap-12 pt-8 border-t border-white/6">
            {[['500+','Verified Vendors'],['2,400+','Bookings Done'],['4.9 ★','Avg Rating'],['6','Countries']].map(([v,l]) => (
              <div key={l}>
                <div className="font-display text-xl sm:text-2xl text-white">{v}</div>
                <div className="text-white/25 text-[9px] sm:text-[10px] mt-0.5 uppercase tracking-[0.15em]">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <div className="text-white/15 text-[9px] uppercase tracking-[0.25em]">Scroll</div>
          <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ── LOCATIONS STRIP ── */}
      <div className="bg-[#0D0D0D] border-y border-white/6 py-4 overflow-hidden">
        <div className="flex gap-8 sm:gap-10 animate-[shimmer_20s_linear_infinite] whitespace-nowrap px-4 sm:px-6">
          {[...LOCATIONS,...LOCATIONS,...LOCATIONS].map((l, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <span className="text-base sm:text-lg">{l.flag}</span>
              <span className="text-white/50 text-xs sm:text-sm font-medium">{l.city}</span>
              <span className="text-white/20 text-[10px] sm:text-xs">{l.count} vendors</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── VENDOR CTA BANNER ── */}
      <div className="bg-[#0D0D0D] border-b border-white/6 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">🏪</span>
            <div>
              <p className="text-white/70 text-sm font-semibold leading-tight">Are you a vendor?</p>
              <p className="text-white/30 text-xs sm:text-sm mt-0.5">Join 500+ professionals already getting booked every week.</p>
            </div>
          </div>
          <Link href="/register?role=vendor"
            className="flex-shrink-0 self-start sm:self-auto px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
            style={{ background:'linear-gradient(135deg,#C9941A,#E4B520)', color:'white' }}>
            List Your Business Free →
          </Link>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 md:mb-16 gap-4 sm:gap-6">
            <div>
              <div className="section-label mb-3 sm:mb-4">Categories</div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-theme">Every vendor for<br/><span className="italic text-theme-muted">your big day</span></h2>
            </div>
            <Link href="/vendors" className="btn-outline self-start text-sm sm:text-base">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {CATS.map((cat, i) => (
              <Link key={cat.slug} href={`/vendors?category=${cat.slug}`}
                className="group relative card p-4 sm:p-5 md:p-6 card-hover cursor-pointer">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{cat.emoji}</div>
                <div className="font-semibold text-theme text-xs sm:text-sm group-hover:text-[#C8A96E] transition-colors leading-tight">{cat.name}</div>
                <div className="text-theme-faint text-[10px] sm:text-xs mt-1">{cat.count} vendors</div>
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white/5 flex items-center justify-center text-theme-faint text-[9px] sm:text-[10px] group-hover:bg-[#C8A96E] group-hover:text-white transition-all duration-300">→</div>
                {i === 0 && <div className="absolute top-2 sm:top-3 right-2 sm:right-3 badge-sand text-[8px] sm:text-[9px]">Popular</div>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VENDORS ── */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#080808] relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-50" />
        <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(200,169,110,0.07) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 md:mb-16 gap-4">
            <div>
              <div className="section-label mb-3 sm:mb-4">Hand-picked</div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white">Featured<br/><span className="italic text-white/25">vendors</span></h2>
            </div>
            <Link href="/vendors" className="self-start text-white/30 hover:text-white text-sm font-medium transition-colors">Browse all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {VENDORS.map(v => (
              <div key={v.name} className="group rounded-2xl overflow-hidden border border-white/6 hover:border-[#C8A96E]/30 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="h-36 sm:h-44 flex items-center justify-center relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-5xl sm:text-6xl opacity-10 group-hover:scale-110 transition-transform duration-500">{v.e}</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/70 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/10 text-white/60 text-[9px] font-bold px-2 sm:px-2.5 py-1 rounded-full border border-white/10">{v.tag}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="text-white font-semibold text-sm leading-tight">{v.name}</div>
                    <div className="text-white/35 text-xs mt-0.5">📍 {v.area}</div>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-[#C8A96E] text-xs">★ <span className="text-white font-semibold">{v.rating}</span> <span className="text-white/25">({v.reviews})</span></span>
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
      <section id="how" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 md:mb-20">
            <div className="section-label mb-3 sm:mb-4">Process</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-theme">Three steps to your<br /><span className="italic text-theme-muted">perfect vendor</span></h2>
          </div>
          {/* Mobile: stacked cards / Desktop: row */}
          <div className="flex flex-col md:grid md:grid-cols-3 md:divide-x divide-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden">
            {STEPS.map((s, i) => (
              <div key={s.n} className="bg-theme-card p-6 sm:p-8 md:p-10 relative group hover:bg-theme-subtle transition-colors border-b md:border-b-0 border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="font-mono text-xs text-[#C8A96E] uppercase tracking-widest">{s.n}</div>
                  <div className="text-xl sm:text-2xl">{s.icon}</div>
                </div>
                <h3 className="font-display text-xl sm:text-2xl text-theme mb-3 sm:mb-4">{s.title}</h3>
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
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-theme-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="section-label mb-3 sm:mb-4">Testimonials</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-theme">Brides love<br/><span className="italic text-theme-muted">VowConnect</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {REVIEWS.map(r => (
              <div key={r.name} className="card p-5 sm:p-7 md:p-8 card-hover relative">
                <div className="font-display text-6xl sm:text-7xl text-[#C8A96E]/10 absolute top-3 sm:top-4 right-4 sm:right-5 leading-none select-none">&ldquo;</div>
                <div className="flex gap-0.5 mb-4 sm:mb-5">{[1,2,3,4,5].map(i => <span key={i} className="text-[#C8A96E] text-xs">★</span>)}</div>
                <p className="text-theme-muted text-sm leading-relaxed mb-6 sm:mb-8">{r.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                  <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#F5ECD8] dark:bg-[#2A1F10] flex items-center justify-center font-semibold text-[#8A6A2E] text-sm flex-shrink-0">{r.init}</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-theme text-sm truncate">{r.name}</div>
                    <div className="text-theme-faint text-xs">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR VENDORS ── */}
      <section id="vendors" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl bg-[#080808] overflow-hidden relative p-6 sm:p-10 md:p-20">
            <div className="absolute inset-0 grid-lines opacity-50" />
            <div className="absolute right-0 top-0 w-full sm:w-2/3 h-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right center, rgba(200,169,110,0.07) 0%, transparent 55%)' }} />
            <div className="relative z-10 max-w-xl">
              <div className="section-label mb-4 sm:mb-6">For Vendors</div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-4 sm:mb-6 leading-tight">
                Reach brides in<br />
                <span className="text-sand-grad">Nigeria & diaspora</span>
              </h2>
              <p className="text-white/35 text-sm sm:text-base leading-relaxed mb-7 sm:mb-10">
                List your business free on VowConnect. Get discovered by brides in Lagos, London, New York, Toronto and beyond. No commission. No setup fee.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/register?role=vendor"
                  className="flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base rounded-full font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background:'linear-gradient(135deg,#C9941A,#E4B520)' }}>
                  List Your Business Free →
                </Link>
                <Link href="/login" className="flex items-center justify-center sm:justify-start text-white/30 hover:text-white text-sm font-medium transition-colors sm:pl-2">
                  Already a member? Sign in
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-4 sm:gap-8 mt-8 sm:mt-12 pt-6 sm:pt-10 border-t border-white/6">
                {[['Free','To join'],['₦0','Setup fee'],['Day 1','Earn bookings']].map(([v,l]) => (
                  <div key={l}>
                    <div className="font-display text-xl sm:text-2xl text-white">{v}</div>
                    <div className="text-white/20 text-[9px] sm:text-[10px] uppercase tracking-widest mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080808] border-t border-white/5 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 mb-10 sm:mb-12">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-0.5 mb-3 sm:mb-4">
                <span className="font-display text-xl text-white">Vow</span>
                <span className="font-display text-xl text-[#C8A96E]">Connect</span>
              </div>
              <p className="text-white/20 text-sm leading-relaxed max-w-xs">
                Nigeria & diaspora&apos;s premier marketplace for verified wedding vendors.
              </p>
              <div className="flex gap-4 sm:gap-5 mt-5 sm:mt-6">
                {['Instagram','TikTok','WhatsApp'].map(s => (
                  <a key={s} href="#" className="text-white/20 hover:text-[#C8A96E] text-xs transition-colors">{s}</a>
                ))}
              </div>
            </div>
            {[
              { t: 'For Clients', l: [['✨ Find Vendors','/vendors'],['Browse','/vendors'],['How It Works','/how-it-works'],['Contact','/contact']] },
              { t: 'For Vendors', l: [['List Business','/register?role=vendor'],['Pricing','/pricing'],['FAQ','/faq']] },
              { t: 'Company',     l: [['About','/about'],['Blog','/blog'],['Contact','/contact']] },
            ].map(col => (
              <div key={col.t}>
                <h4 className="text-white/35 font-bold text-[9px] mb-3 sm:mb-4 uppercase tracking-[0.2em]">{col.t}</h4>
                <ul className="space-y-2 sm:space-y-2.5">
                  {col.l.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-white/20 hover:text-[#C8A96E] text-xs sm:text-sm transition-colors">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-white/15 text-xs text-center sm:text-left">© {new Date().getFullYear()} VowConnect. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              {['Privacy','Terms','Contact'].map(l => (
                <a key={l} href="#" className="text-white/15 hover:text-[#C8A96E] text-xs transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}