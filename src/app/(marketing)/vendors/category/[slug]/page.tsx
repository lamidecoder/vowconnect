// src/app/(marketing)/vendors/category/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const CATEGORIES: Record<string, {
  name: string; emoji: string; plural: string
  headline: string; description: string
  whatTheyDo: string; howToChoose: string
  avgPrice: string; bookingTip: string
  cities: string[]
  faq: { q: string; a: string }[]
}> = {
  'gele-stylist': {
    name: 'Gele Stylist', plural: 'Gele Stylists', emoji: '🧣',
    headline: 'Find Verified Gele Stylists',
    description: 'The gele is the centrepiece of any Nigerian bride\'s look. A perfectly tied gele elevates an entire outfit — and a poorly tied one can ruin it. Finding a skilled gele stylist is one of the most important wedding vendor decisions you\'ll make.',
    whatTheyDo: `A gele stylist specialises in tying and styling Nigerian headwraps for traditional and white wedding occasions. The best ones can work with virtually any fabric — from stiff aso-oke to softer ankara — and create styles that range from the classic towering fan shapes to more modern, angular constructions.

Beyond just tying, a skilled stylist knows how to pin the gele so it stays in place through hours of dancing, sitting, and general wedding chaos. They know which styles photograph best, which work better for certain face shapes, and how to adjust on the fly when the fabric isn't cooperating.`,
    howToChoose: `Look for a stylist who has a portfolio of real wedding work, not just studio shots. Ask specifically about their experience with your fabric type — aso-oke and sego behave very differently. A trial run is non-negotiable: book one 1–2 weeks before your wedding and take photos in different lighting.`,
    avgPrice: '₦15,000 – ₦150,000 (Lagos/Abuja) · £80 – £350 (UK) · $100 – $400 (US)',
    bookingTip: 'Book early — the best gele stylists work multiple events per weekend and their Saturday slots fill up months in advance, especially during December and Easter wedding season.',
    cities: ['Lagos', 'Abuja', 'London', 'Houston', 'Toronto', 'Atlanta'],
    faq: [
      { q: 'How long does it take to tie a gele?', a: 'A skilled stylist takes 20–45 minutes per person, depending on the style complexity and the fabric. A wedding party of 10 bridesmaids could take 4–5 hours for the stylist, so factor that into your morning schedule.' },
      { q: 'Should I do a trial gele before the wedding?', a: 'Absolutely, and this is non-negotiable. A trial lets you see how the style looks in photos, test whether the fabric holds the shape you want, and flag any issues before the wedding day. Do it 1–2 weeks before.' },
      { q: 'What\'s the difference between aso-oke and other gele fabrics?', a: 'Aso-oke is a traditional hand-woven fabric from the Yoruba people — it\'s stiff, structured, and holds elaborate shapes very well. Sego is a lighter, shinier fabric that creates softer, more flowing looks. Your stylist can advise on which works better for your preferred style.' },
      { q: 'Can a gele stylist travel to my venue?', a: 'Most gele stylists travel to the client — they\'ll come to your home, hotel, or venue on the wedding morning. Travel fees vary by distance. Some stylists charge a flat rate, others charge per kilometre. Always confirm this upfront.' },
    ],
  },
  'makeup-artist': {
    name: 'Makeup Artist', plural: 'Makeup Artists', emoji: '💄',
    headline: 'Book Nigerian Wedding Makeup Artists',
    description: 'Your wedding makeup needs to look beautiful in person, photograph well under flash, last through tears and dancing, and work with your skin tone. Finding a makeup artist who can do all four — and who understands Nigerian beauty standards — is the mission.',
    whatTheyDo: `Nigerian wedding makeup artists are specialists in working with darker skin tones, creating looks that translate beautifully to camera, and building makeup that can last 12+ hours in varying conditions — from air-conditioned churches to outdoor receptions in warm weather.

The best ones have built extensive portfolios across different skin tones and understand how to use colour, contouring, and finish to create looks that feel authentic to you while also being suitably glamorous for the occasion. Many also offer services for the wedding party, mothers of the couple, and Igba Nkwu/traditional ceremony looks.`,
    howToChoose: `Ask to see full wedding galleries — not just the hero shot of the bride, but photos taken at the actual venue, in real wedding lighting. Check that they have experience with skin tones similar to yours. A trial run is essential — do it on a regular day and wear the makeup out to see how it holds.`,
    avgPrice: '₦30,000 – ₦200,000 (bride, Nigeria) · £200 – £600 (bride, UK) · $300 – $800 (bride, US)',
    bookingTip: 'Top makeup artists book 6–12 months ahead for peak wedding dates. Secure your artist before you finalise your venue.',
    cities: ['Lagos', 'Abuja', 'London', 'Houston', 'Toronto', 'Atlanta'],
    faq: [
      { q: 'How long does wedding makeup take?', a: 'Bridal makeup typically takes 1.5–2.5 hours. Each bridesmaid/member of the wedding party takes 45–60 minutes. Factor this into your morning timeline carefully — a party of 6 could mean 5+ hours of work.' },
      { q: 'What should I bring to a makeup trial?', a: 'Bring photos of looks you like (not just inspiration — actual examples of the makeup you want), your wedding outfit or a photo of it, and any products you know your skin reacts well to. Wear your hair in the style you\'ll have it on the wedding day.' },
      { q: 'Should my makeup artist specialise in dark skin tones?', a: 'It\'s strongly advisable. Makeup for darker skin tones requires different techniques, products, and colour choices than those for lighter skin. A generalist can sometimes struggle — look for portfolios that show consistent experience with your skin tone.' },
      { q: 'What\'s the difference between a bridal and regular makeup booking?', a: 'Bridal makeup involves more prep (a trial, detailed consultation, sometimes multiple looks for different parts of the day), uses longer-lasting products, and typically involves the artist being on-site for the whole morning. Regular makeup is usually just one appointment.' },
    ],
  },
  'photographer': {
    name: 'Photographer', plural: 'Wedding Photographers', emoji: '📸',
    headline: 'Find Nigerian Wedding Photographers',
    description: 'Your wedding photos are the only thing that lasts forever. Everything else — the flowers, the food, the dress — is temporary. Your photos are not. This is not a vendor to compromise on.',
    whatTheyDo: `Nigerian wedding photographers have developed a distinctive style over the years — documentary storytelling that captures the real moments (the laughter, the tears, the chaos of the morning preparations) combined with vibrant, colourful portraiture that celebrates the beauty of the occasion.

The best photographers understand Nigerian wedding structure: the traditional ceremony, the white wedding, the reception, the coordinating outfits, the Alaga moments, the families. They know where to be and when, and they understand how to capture these culturally specific moments in a way that will mean something to you in 20 years.`,
    howToChoose: `Ask to see complete wedding galleries — not highlight reels, not best-of collections. Complete galleries. You want to see consistency, not just peak moments. Also ask about their second shooter policy for large Nigerian weddings, and confirm they own quality backup equipment.`,
    avgPrice: '₦150,000 – ₦800,000 (Nigeria) · £1,500 – £4,000 (UK) · $2,000 – $6,000 (US)',
    bookingTip: 'Photography is the one vendor where you should stretch your budget if you need to. You will look at these photos for the rest of your life.',
    cities: ['Lagos', 'Abuja', 'London', 'Houston', 'Toronto', 'Atlanta'],
    faq: [
      { q: 'What\'s the difference between a photo and video package?', a: 'Photo packages cover still images; video packages cover filmed footage, usually edited into a highlight film of 5–15 minutes plus full footage. Many photographers also offer videography or work with videographer partners for combined packages.' },
      { q: 'Do I need a second photographer?', a: 'For a Nigerian wedding with 200+ guests and multiple events across a day, a second shooter is highly recommended. They capture moments your main photographer physically can\'t be in two places to shoot — like the groom\'s preparation while the main photographer is with the bride.' },
      { q: 'How long until I get my photos back?', a: 'Typical turnaround is 4–12 weeks depending on the photographer and package. Some offer a sneak peek of 20–30 images within a week. Ask about this upfront — it\'s worth knowing, especially if you\'re excited (and you will be).' },
      { q: 'What happens if my photographer is ill on the day?', a: 'A professional photographer will always have a backup plan — a colleague or associate photographer who can cover in emergencies. Ask specifically about their emergency policy before signing a contract.' },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = CATEGORIES[params.slug]
  if (!cat) return { title: 'Not Found' }
  return {
    title: `${cat.headline} | VowConnect`,
    description: `Find and book verified ${cat.plural} for your Nigerian wedding. Real reviews, transparent pricing, secure booking.`,
    keywords: `${cat.plural} Nigerian wedding, ${cat.name} wedding, Nigerian ${cat.name.toLowerCase()}, book ${cat.name.toLowerCase()} wedding`,
    openGraph: {
      title: `${cat.headline} | VowConnect`,
      description: `Verified ${cat.plural} for Nigerian weddings worldwide.`,
    },
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = CATEGORIES[params.slug]
  if (!cat) notFound()

  const vendors = await prisma.vendor.findMany({
    where: {
      category:  { slug: params.slug },
      status:    'APPROVED',
      deletedAt: null,
    },
    include: {
      category: true,
      reviews:  { select: { rating: true } },
      portfolio:{ take:1, orderBy:{ order:'asc' } },
    },
    orderBy: [{ isFeatured:'desc' }, { profileViews:'desc' }],
    take: 9,
  })

  return (
    <div className="min-h-screen" style={{background:'var(--bg)'}}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: cat.plural,
        description: cat.description,
        provider: { '@type': 'Organization', name: 'VowConnect' },
      })}}/>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28"
        style={{background:'linear-gradient(135deg,#0a0a0a,#1a1208)'}}>
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 60% 40%, rgba(200,169,110,0.1) 0%, transparent 60%)'}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-3 mb-6 text-xs" style={{color:'rgba(255,255,255,0.3)'}}>
            <Link href="/" className="hover:text-white transition-colors">VowConnect</Link>
            <span>/</span>
            <Link href="/vendors" className="hover:text-white transition-colors">Vendors</Link>
            <span>/</span>
            <span style={{color:'#C8A96E'}}>{cat.plural}</span>
          </div>

          <div className="text-6xl mb-5">{cat.emoji}</div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            {cat.headline}
          </h1>
          <p className="text-base sm:text-lg mb-8 max-w-2xl leading-relaxed" style={{color:'rgba(255,255,255,0.45)', fontFamily:'Georgia, serif'}}>
            {cat.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/vendors?category=${params.slug}`}
              className="flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold text-white text-sm transition-all hover:opacity-90"
              style={{background:'linear-gradient(135deg,#C9941A,#E4B520)', boxShadow:'0 4px 24px rgba(201,148,26,0.4)'}}>
              Browse {cat.plural}
            </Link>
            <Link href="/register?role=vendor"
              className="flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-sm"
              style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)'}}>
              I am a {cat.name} →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 space-y-16">

        {/* What they do */}
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#C8A96E'}}>The Role</div>
            <h2 className="font-display text-3xl mb-5" style={{color:'var(--text)'}}>What does a {cat.name} do?</h2>
            {cat.whatTheyDo.split('\n\n').map((p, i) => (
              <p key={i} className="text-sm leading-[1.9] mb-4" style={{color:'var(--text-muted)', fontFamily:'Georgia, serif'}}>{p}</p>
            ))}
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#C8A96E'}}>How to Choose</div>
              <p className="text-sm leading-[1.8]" style={{color:'var(--text-muted)', fontFamily:'Georgia, serif'}}>{cat.howToChoose}</p>
            </div>
            <div className="rounded-2xl p-6" style={{background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.2)'}}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#C8A96E'}}>Typical Pricing</div>
              <p className="text-sm" style={{color:'var(--text-muted)'}}>{cat.avgPrice}</p>
            </div>
            <div className="rounded-2xl p-5 flex gap-3" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <span className="text-xl flex-shrink-0">💡</span>
              <div>
                <div className="text-xs font-bold mb-1" style={{color:'var(--text)'}}>Booking Tip</div>
                <p className="text-xs leading-relaxed" style={{color:'var(--text-muted)', fontFamily:'Georgia, serif'}}>{cat.bookingTip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors */}
        {vendors.length > 0 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#C8A96E'}}>Verified</div>
            <h2 className="font-display text-3xl mb-8" style={{color:'var(--text)'}}>Top {cat.plural} on VowConnect</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map(v => {
                const avg = v.reviews.length
                  ? (v.reviews.reduce((s,r) => s+r.rating, 0)/v.reviews.length).toFixed(1) : null
                return (
                  <Link key={v.id} href={`/vendors/${v.id}`}
                    className="group rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
                    style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                    <div className="h-36 relative overflow-hidden" style={{background:'var(--bg-subtle)'}}>
                      {v.portfolio[0]
                        ? <img src={v.portfolio[0].url} alt={v.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        : <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-15">{cat.emoji}</div>
                      }
                      {v.isVerified && <div className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{background:'rgba(16,185,129,0.9)'}}>✓ Verified</div>}
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-sm mb-0.5" style={{color:'var(--text)'}}>{v.businessName}</div>
                      <div className="text-xs mb-2" style={{color:'var(--text-faint)'}}>📍 {v.location}</div>
                      <div className="flex items-center justify-between pt-2 border-t" style={{borderColor:'var(--border)'}}>
                        {avg && <span className="text-xs" style={{color:'#C8A96E'}}>★ {avg}</span>}
                        {v.priceMin && <span className="text-xs font-semibold" style={{color:'var(--text-muted)'}}>{v.priceMin.toLocaleString()}+</span>}
                        <span className="text-xs font-bold" style={{color:'#C8A96E'}}>Book →</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* By city */}
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#C8A96E'}}>By Location</div>
          <h2 className="font-display text-3xl mb-6" style={{color:'var(--text)'}}>{cat.plural} by city</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cat.cities.map(city => (
              <Link key={city}
                href={`/vendors?city=${city.toLowerCase()}&category=${params.slug}`}
                className="p-4 rounded-2xl text-center transition-all hover:scale-[1.02]"
                style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <div className="font-semibold text-sm mb-0.5" style={{color:'var(--text)'}}>{cat.plural}</div>
                <div className="text-xs" style={{color:'#C8A96E'}}>in {city} →</div>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#C8A96E'}}>Questions</div>
          <h2 className="font-display text-3xl mb-8" style={{color:'var(--text)'}}>Common questions about {cat.plural}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {cat.faq.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <h3 className="font-semibold text-sm mb-3" style={{color:'var(--text)'}}>{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{color:'var(--text-muted)', fontFamily:'Georgia, serif'}}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{background:'linear-gradient(135deg,#0a0a0a,#1a1208)'}}>
          <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 50% 100%, rgba(200,169,110,0.1) 0%, transparent 60%)'}}/>
          <div className="relative z-10">
            <div className="text-4xl mb-4">{cat.emoji}</div>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">Find your {cat.name} today</h2>
            <p className="text-sm mb-7 max-w-md mx-auto" style={{color:'rgba(255,255,255,0.4)', fontFamily:'Georgia, serif'}}>
              Browse verified {cat.plural}, read real reviews, and book with confidence.
            </p>
            <Link href={`/vendors?category=${params.slug}`}
              className="inline-flex px-8 py-4 rounded-full font-bold text-white text-sm transition-all hover:opacity-90"
              style={{background:'linear-gradient(135deg,#C9941A,#E4B520)'}}>
              Browse {cat.plural} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}