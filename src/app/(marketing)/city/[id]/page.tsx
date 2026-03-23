// src/app/(marketing)/vendors/[city]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// ── City data ────────────────────────────────────────────────
const CITIES: Record<string, {
  name: string; country: string; flag: string; currency: string
  currencySymbol: string; timezone: string
  headline: string; subheadline: string
  description: string; tip: string
  neighborhoods: string[]; nearbyEvents: string[]
  popularCategories: string[]
  faq: { q: string; a: string }[]
}> = {
  lagos: {
    name: 'Lagos', country: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦',
    timezone: 'WAT',
    headline: 'Find Wedding Vendors in Lagos',
    subheadline: 'From Victoria Island to Lekki — trusted vendors for your dream Nigerian wedding',
    description: `Lagos is Nigeria's wedding capital. Whether you're planning a traditional engagement in Surulere, a church wedding in Victoria Island, or a reception in one of Lekki's luxury halls, the city has an abundance of talented vendors who understand the culture, the colours, and the chaos (in the best possible way).

Finding the right vendor used to mean WhatsApp groups, word of mouth, and hoping for the best. VowConnect changes that. Every vendor on our platform is verified, reviewed by real couples, and ready to make your day unforgettable.`,
    tip: `Lagos traffic is real — always book vendors who are based close to your venue. A vendor coming from the Island to the Mainland on a Saturday morning is a recipe for stress.`,
    neighborhoods: ['Victoria Island', 'Lekki', 'Ikoyi', 'Surulere', 'Ikeja', 'Ajah', 'Yaba', 'Lagos Island'],
    nearbyEvents: ['Traditional Engagement', 'White Wedding', 'Reception', 'Introduction Ceremony'],
    popularCategories: ['Gele Stylist', 'Makeup Artist', 'Photographer', 'Caterer', 'Event Decorator', 'Alaga Iduro'],
    faq: [
      { q: 'How much does a Gele stylist cost in Lagos?', a: 'Gele stylists in Lagos typically charge between ₦15,000 and ₦150,000 depending on their experience, the style complexity, and whether they travel to you. Top-rated stylists who serve Victoria Island and Lekki clients tend to charge premium rates for their convenience and expertise.' },
      { q: 'How far in advance should I book wedding vendors in Lagos?', a: 'For peak wedding season (December, April, August), book at least 6–12 months in advance. Photographers and decorators get booked out fastest. Outside peak season, 3–6 months is usually enough, but the best vendors fill up quickly year-round.' },
      { q: 'Do Lagos vendors travel outside the city?', a: 'Many do, especially for destination weddings in Abeokuta, Ibadan, or Benin. Always confirm travel fees upfront — most vendors charge a flat travel fee or per-kilometre rate, and some require overnight accommodation for early-morning events.' },
      { q: 'What\'s the average cost of a full wedding vendor package in Lagos?', a: 'A complete vendor setup for a Lagos wedding (photographer, decorator, caterer, makeup, gele, DJ, and ushers) typically ranges from ₦2 million to ₦15 million+ depending on your guest count and vendor tier. VowConnect shows you real pricing upfront so there are no surprises.' },
    ],
  },
  london: {
    name: 'London', country: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£',
    timezone: 'GMT',
    headline: 'Nigerian Wedding Vendors in London',
    subheadline: 'Authentic Nigerian wedding professionals serving the UK diaspora',
    description: `Planning a Nigerian wedding in London is a beautiful juggling act. You want the full cultural experience — the aso-ebi, the Alaga, the gele — but you're also working with British venues, British weather, and family flying in from Lagos who have very strong opinions about everything.

The Nigerian wedding community in London is thriving. From Peckham to Stratford, there are talented gele stylists, makeup artists, and photographers who understand exactly what a Nigerian wedding looks and feels like. VowConnect connects you with the best of them — verified, reviewed, and ready.`,
    tip: `London Nigerian weddings often happen across two venues — the church or registry, then a reception hall. Make sure your vendors know the full day schedule and both addresses. A Peckham-based vendor for a Canary Wharf venue needs to factor in travel time.`,
    neighborhoods: ['Peckham', 'Brixton', 'Stratford', 'Canary Wharf', 'Croydon', 'Woolwich', 'Dalston', 'Lewisham'],
    nearbyEvents: ['Church Wedding', 'Registry Office', 'Reception', 'Traditional Introduction'],
    popularCategories: ['Gele Stylist', 'Makeup Artist', 'Photographer', 'Caterer', 'Event Decorator'],
    faq: [
      { q: 'Can I find authentic Nigerian gele stylists in London?', a: 'Absolutely. London has a large and talented community of Nigerian gele stylists, particularly in South East London (Peckham, Lewisham, Woolwich) and East London (Stratford, Forest Gate). Many trained in Nigeria before relocating and bring genuine expertise in traditional styles.' },
      { q: 'How much do Nigerian wedding vendors charge in London?', a: 'Rates are generally higher than in Nigeria due to UK cost of living. Gele stylists charge £80–£350+ per head, makeup artists £200–£600 for the bride, and photographers £1,500–£4,000 for full coverage. Many offer packages for wedding parties.' },
      { q: 'Do London vendors understand Nigerian wedding traditions?', a: 'The best ones absolutely do. Look for vendors who specifically mention Nigerian weddings in their profile, and check their portfolio for evidence of traditional attire, gele, and asoebi coordination. Our verified badge means we\'ve checked their experience.' },
      { q: 'Can vendors travel to weddings outside London?', a: 'Yes — many London-based Nigerian vendors travel across the UK for weddings in Manchester, Birmingham, Leeds, Bristol, and beyond. Travel fees vary but are usually reasonable. Some vendors prefer to stay local, so always confirm beforehand.' },
    ],
  },
  houston: {
    name: 'Houston', country: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$',
    timezone: 'CST',
    headline: 'Nigerian Wedding Vendors in Houston',
    subheadline: 'Serving Houston\'s vibrant Nigerian-American wedding community',
    description: `Houston has one of the largest Nigerian communities outside Africa, and the wedding scene reflects it. From Sugarland to Katy, Nigerian-Texan weddings are full events — think colour, volume, and celebrations that go deep into the night.

What makes Houston weddings unique is the blend: traditional Nigerian ceremony meets American venue, Nigerian food alongside catered American fare, gele and aso-ebi at a ballroom wedding. The vendors who do this best are the ones who've grown up in both worlds. VowConnect helps you find them.`,
    tip: `Houston is spread out — your vendor might be in Katy and your venue in Pearland. Always factor driving time into your day-of schedule and make sure your vendor knows Houston traffic on Saturdays can be as bad as Lagos (almost).`,
    neighborhoods: ['Sugarland', 'Katy', 'Pearland', 'Missouri City', 'The Woodlands', 'Humble', 'Stafford', 'Richmond'],
    nearbyEvents: ['Traditional Ceremony', 'Church Wedding', 'Reception', 'Engagement Party'],
    popularCategories: ['Gele Stylist', 'Makeup Artist', 'Photographer', 'Caterer', 'Event Decorator', 'DJ & MC'],
    faq: [
      { q: 'Are there Nigerian gele stylists in Houston?', a: 'Yes, Houston has a growing community of Nigerian gele stylists, particularly in Southwest Houston and Sugarland where the Nigerian community is concentrated. Many are self-taught or trained in Nigeria and offer both traditional and modern styles.' },
      { q: 'How much do Nigerian wedding vendors charge in Houston?', a: 'Pricing varies widely. Gele stylists typically charge $100–$400, makeup artists $300–$800 for the bride, and photographers $2,000–$6,000 for full wedding coverage. Nigerian caterers vary greatly based on menu and guest count.' },
      { q: 'Can I book Nigerian vendors for a wedding outside Houston?', a: 'Many Houston vendors travel to Dallas, Austin, San Antonio, and beyond. Some even fly to other states for destination weddings. Travel fees are usually negotiated directly. Check each vendor\'s profile for travel availability.' },
      { q: 'What\'s the Nigerian wedding scene like in Houston?', a: 'Very active. Houston has regular Nigerian wedding expos, a strong Yoruba, Igbo, and Edo community presence, and venues that specifically cater to large Nigerian-style receptions. It\'s one of the best cities in the US for an authentic Nigerian wedding experience.' },
    ],
  },
  toronto: {
    name: 'Toronto', country: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: 'CA$',
    timezone: 'EST',
    headline: 'Nigerian Wedding Vendors in Toronto',
    subheadline: 'Where Nigerian culture meets Canadian warmth — find your perfect wedding team',
    description: `Toronto's Nigerian community is one of the most active in North America. Brampton, Scarborough, and North York have become centres of Nigerian cultural life in Canada, and the wedding industry has grown with it.

Toronto Nigerian weddings are known for being well-organised, colourful, and thoroughly documented. There's a reason so many Nigerian-Canadian couples end up with stunning wedding content — the vendors here have developed a real specialisation in capturing these moments beautifully.`,
    tip: `Toronto winters are real. If you're planning a winter wedding, confirm your vendors have reliable transport and always have a backup plan for outdoor photo sessions. Summer weekends book out fast — secure your vendors by January for June/July/August dates.`,
    neighborhoods: ['Brampton', 'Scarborough', 'North York', 'Mississauga', 'Etobicoke', 'Markham', 'Ajax', 'Pickering'],
    nearbyEvents: ['Traditional Ceremony', 'Church Wedding', 'Reception', 'Engagement'],
    popularCategories: ['Gele Stylist', 'Makeup Artist', 'Photographer', 'Caterer', 'Event Decorator'],
    faq: [
      { q: 'Where can I find Nigerian wedding vendors in Toronto?', a: 'The Nigerian vendor community in Toronto is concentrated in Brampton, Scarborough, and North York. Many vendors also serve Mississauga and the wider GTA. VowConnect lists verified Nigerian vendors across the Greater Toronto Area with real reviews.' },
      { q: 'How much do Nigerian wedding vendors cost in Toronto?', a: 'Gele stylists charge CA$150–$500, makeup artists CA$400–$900 for the bride, photographers CA$2,500–$7,000 for full coverage. Nigerian caterers vary widely by menu complexity and guest count, typically CA$50–$150 per head.' },
      { q: 'Do Toronto vendors travel to other cities in Canada?', a: 'Many do, especially to Ottawa, Hamilton, London (Ontario), and Calgary. Some vendors travel coast to coast for destination weddings. Always discuss travel fees and accommodation needs upfront.' },
      { q: 'Is it hard to find authentic Nigerian food caterers in Toronto?', a: 'Not at all. Toronto has a thriving Nigerian food scene with caterers specialising in everything from Yoruba to Igbo cuisine. Many offer tasting sessions so you can confirm the jollof rice tastes right before committing.' },
    ],
  },
  abuja: {
    name: 'Abuja', country: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦',
    timezone: 'WAT',
    headline: 'Wedding Vendors in Abuja',
    subheadline: 'The capital city\'s finest — for weddings that match Abuja\'s prestige',
    description: `Abuja weddings are different. There's a refinement to them — the venues are grand, the guest lists include people of influence, and the expectation of excellence is high. The Federal Capital Territory has produced some of Nigeria's most talented wedding professionals, many of whom have built their reputation on delivering for Abuja's discerning clientele.

From Maitama to Wuse to Gwarinpa, Abuja has a concentration of skilled vendors who understand the city's culture of excellence. VowConnect makes it easy to find and book them — with transparent pricing and verified reviews from real Abuja couples.`,
    tip: `Abuja is more organised than Lagos but vendors still book out fast during the dry season (October to March). The Eid periods are particularly busy — plan well ahead if your wedding falls near any major holiday.`,
    neighborhoods: ['Maitama', 'Wuse', 'Garki', 'Asokoro', 'Gwarinpa', 'Jabi', 'Kubwa', 'Life Camp'],
    nearbyEvents: ['Traditional Wedding', 'Court Wedding', 'Church Wedding', 'Islamic Nikah'],
    popularCategories: ['Gele Stylist', 'Makeup Artist', 'Photographer', 'Caterer', 'Event Decorator', 'Event Planner'],
    faq: [
      { q: 'How much do wedding vendors charge in Abuja?', a: 'Abuja vendors generally charge more than other Nigerian cities outside Lagos, reflecting the higher cost of living. Gele stylists charge ₦20,000–₦120,000, makeup artists ₦30,000–₦200,000 for the bride, and photographers ₦150,000–₦800,000 for full coverage.' },
      { q: 'What are the best areas to find vendors in Abuja?', a: 'Many of Abuja\'s top vendors operate from Wuse 2, Maitama, and Garki. However, most will travel to any part of the FCT. VowConnect shows you each vendor\'s location and whether they\'re willing to travel to your venue.' },
      { q: 'When is wedding season in Abuja?', a: 'Abuja has two peak wedding seasons — the dry season (November to March) and the August rush. December is the busiest month, coinciding with when many Nigerians in the diaspora return home. Book at least 6 months ahead for December dates.' },
      { q: 'Can I find vendors who speak Hausa for a traditional Hausa wedding?', a: 'Yes. Abuja has vendors who specialise in Hausa, Yoruba, and Igbo traditional weddings, as well as multicultural ceremonies. When browsing vendors, look for those who mention your specific tradition in their profile.' },
    ],
  },
  atlanta: {
    name: 'Atlanta', country: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$',
    timezone: 'EST',
    headline: 'Nigerian Wedding Vendors in Atlanta',
    subheadline: 'ATL\'s Nigerian community deserves the best — find them here',
    description: `Atlanta has quietly become one of America's most important cities for Nigerian-American culture. The community is large, tight-knit, and absolutely knows how to throw a wedding. From Decatur to Alpharetta, you'll find talented Nigerian vendors who've built their craft serving Atlanta's vibrant diaspora community.

What sets Atlanta apart is the energy. Nigerian weddings here have that Southern hospitality layered over West African tradition — big venues, beautiful people, and a party that goes until morning. Finding vendors who can match that energy is what VowConnect is built for.`,
    tip: `Atlanta traffic rivals Lagos on weekday evenings. Weekend mornings are generally better, but always give vendors extra buffer time, especially if your ceremony is in Buckhead and your reception is in Stone Mountain.`,
    neighborhoods: ['Decatur', 'Alpharetta', 'Marietta', 'Stone Mountain', 'Smyrna', 'Norcross', 'Duluth', 'Lithonia'],
    nearbyEvents: ['Traditional Ceremony', 'Church Wedding', 'Reception', 'Engagement Party'],
    popularCategories: ['Gele Stylist', 'Makeup Artist', 'Photographer', 'Caterer', 'DJ & MC'],
    faq: [
      { q: 'Is Atlanta a good city for a Nigerian wedding?', a: 'One of the best in the US. Atlanta has a large Nigerian community, multiple venues experienced with Nigerian receptions, and a growing number of specialist vendors. The city\'s Southern hospitality culture also makes for very welcoming venues and service providers.' },
      { q: 'How do I find Nigerian-specific vendors in Atlanta?', a: 'VowConnect lists Atlanta-based vendors who specialise in Nigerian weddings. You can filter by category, location, and even specific traditions (Yoruba, Igbo, etc). All vendors have verified profiles and real reviews from Atlanta couples.' },
      { q: 'What does a Nigerian wedding in Atlanta typically cost?', a: 'It varies enormously based on guest count and vendor tier. A Nigerian wedding with 200 guests in Atlanta typically runs $30,000–$80,000 all-in for venue, catering, and vendors. Going big with 400+ guests and premium vendors? Budget upward of $100,000.' },
      { q: 'Do Atlanta vendors travel to nearby cities?', a: 'Most Atlanta vendors will travel to Charlotte, Nashville, Birmingham, and other Southeast cities. Some travel further for destination weddings. Travel fees are usually straightforward — discuss them upfront when getting quotes.' },
    ],
  },
}

const CATEGORY_PAGES: Record<string, {
  name: string; emoji: string; description: string; whatToExpect: string
}> = {
  'gele-stylist': {
    name: 'Gele Stylists', emoji: '🧣',
    description: 'The gele is the crown of a Nigerian wedding. A skilled gele stylist transforms metres of fabric into a towering, architectural masterpiece that photographs beautifully and stays in place through hours of dancing.',
    whatToExpect: 'Expect a gele stylist to spend 20–45 minutes per person. Top stylists bring their own pins, needles, and accessories. Always do a trial run before the wedding day — styles look different in photos, and you want to love yours.',
  },
  'makeup-artist': {
    name: 'Makeup Artists', emoji: '💄',
    description: 'Nigerian wedding makeup is an art form. The best artists understand how to work with darker skin tones, create looks that photograph well under both indoor and outdoor lighting, and build looks that last a full 12-hour wedding day.',
    whatToExpect: 'Bridal makeup typically takes 1.5–2.5 hours for the bride and 45–60 minutes for the wedding party. A good artist will do a trial 1–2 weeks before the wedding. Bring reference photos, but let them guide you on what works best for your features.',
  },
  'photographer': {
    name: 'Wedding Photographers', emoji: '📸',
    description: 'Your photos are the only thing from your wedding that lasts forever. Nigerian wedding photographers have developed a unique style — documentary storytelling mixed with vibrant, colourful portraiture that captures the energy of the celebration.',
    whatToExpect: 'Full-day coverage typically means 8–12 hours. A second shooter is worth the extra cost for large Nigerian weddings. Ask to see full wedding galleries, not just the best shots — consistency matters more than a handful of hero images.',
  },
}

// Generate static paths
export async function generateStaticParams() {
  return Object.keys(CITIES).map(city => ({ city }))
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const city = CITIES[params.id.toLowerCase()]
  if (!city) return { title: 'Not Found' }

  return {
    title: `${city.headline} | VowConnect`,
    description: `Find and book verified Nigerian wedding vendors in ${city.name}. Gele stylists, makeup artists, photographers, caterers & more. Trusted by ${city.name} couples.`,
    keywords: `Nigerian wedding vendors ${city.name}, gele stylist ${city.name}, Nigerian makeup artist ${city.name}, Nigerian wedding photographer ${city.name}, Nigerian caterer ${city.name}`,
    openGraph: {
      title: `${city.headline} | VowConnect`,
      description: `Find verified Nigerian wedding vendors in ${city.name} — ${city.popularCategories.join(', ')} and more.`,
      url: `https://vowconnect.vercel.app/vendors/${params.id}`,
      siteName: 'VowConnect',
      type: 'website',
    },
    alternates: {
      canonical: `https://vowconnect.vercel.app/vendors/${params.id}`,
    },
  }
}

export default async function CityPage({ params }: { params: { id: string } }) {
  const citySlug = params.id.toLowerCase()
  const city     = CITIES[citySlug]
  if (!city) notFound()

  // Fetch real vendors from DB
  const vendors = await prisma.vendor.findMany({
    where: {
      city:     { contains: city.name, mode: 'insensitive' },
      status:   'APPROVED',
      deletedAt: null,
    },
    include: {
      category: true,
      reviews:  { select: { rating: true } },
      portfolio:{ take:1, orderBy:{ order:'asc' } },
    },
    orderBy: [{ isFeatured:'desc' }, { profileViews:'desc' }],
    take: 12,
  })

  // Also get nearby cities
  const nearbyCities = Object.entries(CITIES)
    .filter(([slug]) => slug !== citySlug)
    .filter(([, c]) => c.country === city.country)
    .slice(0, 4)

  return (
    <div className="min-h-screen" style={{background:'var(--bg)'}}>

      {/* Schema markup for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: `VowConnect ${city.name}`,
        description: `Nigerian wedding vendor marketplace in ${city.name}`,
        url: `https://vowconnect.vercel.app/city/${citySlug}`,
        areaServed: city.name,
        serviceType: 'Wedding Vendor Marketplace',
      })}}/>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1208 50%,#0a0a0a 100%)',
        minHeight: '60vh',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 40% 60%, rgba(200,169,110,0.12) 0%, transparent 60%)'}}/>
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-5 blur-3xl" style={{background:'#C8A96E'}}/>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28 w-full">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs mb-6 flex-wrap" style={{color:'rgba(255,255,255,0.3)'}}>
              <Link href="/" className="hover:text-white transition-colors">VowConnect</Link>
              <span>/</span>
              <Link href="/vendors" className="hover:text-white transition-colors">Vendors</Link>
              <span>/</span>
              <span style={{color:'#C8A96E'}}>{city.name}</span>
            </div>

            {/* Flag + city */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl">{city.flag}</span>
              <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{background:'rgba(200,169,110,0.15)', color:'#C8A96E', border:'1px solid rgba(200,169,110,0.25)'}}>
                {city.country}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {city.headline}
            </h1>
            <p className="text-lg sm:text-xl mb-8 leading-relaxed" style={{color:'rgba(255,255,255,0.45)'}}>
              {city.subheadline}
            </p>

            {/* Quick category pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {city.popularCategories.map(cat => (
                <Link key={cat}
                  href={`/vendors?city=${city.name.toLowerCase()}&category=${cat.toLowerCase().replace(/ /g,'-')}`}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.25)', color:'#C8A96E'}}>
                  {cat}
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/vendors?city=${city.name.toLowerCase()}`}
                className="flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
                style={{background:'linear-gradient(135deg,#C9941A,#E4B520)', boxShadow:'0 4px 24px rgba(201,148,26,0.4)'}}>
                ✨ Browse {city.name} Vendors
              </Link>
              <Link href="/register"
                className="flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-sm transition-all"
                style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)'}}>
                List Your Business Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="border-y" style={{background:'#0d0d0d', borderColor:'rgba(255,255,255,0.06)'}}>
        <div className="max-w-6xl mx-auto px-8 py-5 flex flex-wrap gap-8 sm:gap-12">
          {[
            { value: vendors.length > 0 ? `${vendors.length}+` : '50+', label: `Vendors in ${city.name}` },
            { value: '4.9 ★', label: 'Average rating' },
            { value: 'Free', label: 'To browse & compare' },
            { value: '24hr', label: 'Typical response time' },
          ].map(s => (
            <div key={s.label}>
              <div className="font-display text-xl sm:text-2xl text-white font-bold">{s.value}</div>
              <div className="text-xs mt-0.5 uppercase tracking-widest" style={{color:'rgba(255,255,255,0.25)'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16">

        {/* About this city — human written */}
        <div className="grid lg:grid-cols-3 gap-10 mb-16">
          <div className="lg:col-span-2">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#C8A96E'}}>About</div>
            <h2 className="font-display text-3xl sm:text-4xl mb-6 leading-tight" style={{color:'var(--text)'}}>
              Planning a Nigerian wedding in {city.name}
            </h2>
            {city.description.split('\n\n').map((para, i) => (
              <p key={i} className="text-base leading-[1.8] mb-4" style={{color:'var(--text-muted)', fontFamily:'Georgia, serif'}}>
                {para}
              </p>
            ))}

            {/* Local tip */}
            <div className="mt-6 p-5 rounded-2xl flex gap-4" style={{background:'rgba(200,169,110,0.07)', border:'1px solid rgba(200,169,110,0.2)'}}>
              <span className="text-2xl flex-shrink-0">💡</span>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Local Tip</div>
                <p className="text-sm leading-relaxed" style={{color:'var(--text-muted)', fontFamily:'Georgia, serif'}}>
                  {city.tip}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'var(--text-faint)'}}>Popular Areas</div>
              <div className="flex flex-wrap gap-2">
                {city.neighborhoods.map(n => (
                  <span key={n} className="text-xs px-2.5 py-1 rounded-full" style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'var(--text-faint)'}}>Event Types</div>
              <div className="space-y-2">
                {city.nearbyEvents.map(e => (
                  <div key={e} className="flex items-center gap-2 text-sm" style={{color:'var(--text-muted)'}}>
                    <span style={{color:'#C8A96E'}}>→</span> {e}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{background:'linear-gradient(135deg,rgba(200,169,110,0.08),rgba(200,169,110,0.03))', border:'1px solid rgba(200,169,110,0.2)'}}>
              <div className="text-sm font-semibold mb-2" style={{color:'var(--text)'}}>Are you a vendor in {city.name}?</div>
              <p className="text-xs mb-4" style={{color:'var(--text-muted)'}}>List your business free and reach couples planning their wedding right now.</p>
              <Link href="/register?role=vendor"
                className="flex items-center justify-center py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{background:'linear-gradient(135deg,#C9941A,#E4B520)'}}>
                Join VowConnect Free →
              </Link>
            </div>
          </div>
        </div>

        {/* Featured vendors */}
        {vendors.length > 0 && (
          <div className="mb-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{color:'#C8A96E'}}>Verified Professionals</div>
                <h2 className="font-display text-3xl sm:text-4xl" style={{color:'var(--text)'}}>
                  Top vendors in {city.name}
                </h2>
              </div>
              <Link href={`/vendors?city=${city.name.toLowerCase()}`}
                className="text-sm font-semibold hidden sm:flex items-center gap-1 hover:opacity-70 transition-all"
                style={{color:'#C8A96E'}}>
                See all →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map(v => {
                const avg = v.reviews.length
                  ? (v.reviews.reduce((s, r) => s + r.rating, 0) / v.reviews.length).toFixed(1)
                  : null
                return (
                  <Link key={v.id} href={`/vendors/${v.id}`}
                    className="group rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
                    style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                    <div className="h-40 relative overflow-hidden" style={{background:'var(--bg-subtle)'}}>
                      {v.portfolio[0] ? (
                        <img src={v.portfolio[0].url} alt={v.businessName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-15">
                          {v.category.emoji}
                        </div>
                      )}
                      {v.isFeatured && (
                        <div className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{background:'rgba(200,169,110,0.9)'}}>
                          ⭐ Featured
                        </div>
                      )}
                      {v.isVerified && (
                        <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{background:'rgba(16,185,129,0.9)'}}>
                          ✓ Verified
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm leading-tight" style={{color:'var(--text)'}}>{v.businessName}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>
                          {v.category.name}
                        </span>
                      </div>
                      <div className="text-xs mb-2" style={{color:'var(--text-faint)'}}>📍 {v.location}</div>
                      <div className="flex items-center justify-between pt-2 border-t" style={{borderColor:'var(--border)'}}>
                        <div className="flex items-center gap-2">
                          {avg && <span className="text-xs" style={{color:'#C8A96E'}}>★ {avg} <span style={{color:'var(--text-faint)'}}>({v.reviews.length})</span></span>}
                          {v.priceMin && <span className="text-xs font-semibold" style={{color:'var(--text-muted)'}}>{city.currencySymbol}{v.priceMin.toLocaleString()}+</span>}
                        </div>
                        <span className="text-xs font-bold" style={{color:'#C8A96E'}}>Book →</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="text-center mt-8">
              <Link href={`/vendors?city=${city.name.toLowerCase()}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:opacity-90"
                style={{background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text)'}}>
                View all {city.name} vendors →
              </Link>
            </div>
          </div>
        )}

        {/* Category sections */}
        <div className="mb-16">
          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#C8A96E'}}>Browse by Category</div>
          <h2 className="font-display text-3xl sm:text-4xl mb-10" style={{color:'var(--text)'}}>
            Every vendor you need, in {city.name}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {city.popularCategories.map(cat => {
              const catData = CATEGORY_PAGES[cat.toLowerCase().replace(/ /g,'-')]
              return (
                <Link key={cat}
                  href={`/vendors?city=${city.name.toLowerCase()}&category=${cat.toLowerCase().replace(/ /g,'-')}`}
                  className="group p-5 rounded-2xl transition-all hover:scale-[1.01]"
                  style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                  <div className="text-3xl mb-3">{catData?.emoji ?? '🎊'}</div>
                  <h3 className="font-semibold mb-2 group-hover:text-[#C8A96E] transition-colors" style={{color:'var(--text)'}}>
                    {cat} in {city.name}
                  </h3>
                  {catData && (
                    <p className="text-xs leading-relaxed line-clamp-2" style={{color:'var(--text-faint)', fontFamily:'Georgia, serif'}}>
                      {catData.description}
                    </p>
                  )}
                  <div className="mt-3 text-xs font-bold" style={{color:'#C8A96E'}}>Browse vendors →</div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* FAQ — human-written, SEO gold */}
        <div className="mb-16">
          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#C8A96E'}}>Real Questions</div>
          <h2 className="font-display text-3xl sm:text-4xl mb-10" style={{color:'var(--text)'}}>
            {city.name} wedding vendor FAQ
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {city.faq.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <h3 className="font-semibold text-sm mb-3 leading-snug" style={{color:'var(--text)'}}>{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{color:'var(--text-muted)', fontFamily:'Georgia, serif'}}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby cities */}
        {nearbyCities.length > 0 && (
          <div className="mb-16">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{color:'#C8A96E'}}>Also in {city.country}</div>
            <h2 className="font-display text-2xl sm:text-3xl mb-6" style={{color:'var(--text)'}}>Vendors in other cities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {nearbyCities.map(([slug, c]) => (
                <Link key={slug} href={`/city/${slug}`}
                  className="p-4 rounded-2xl text-center transition-all hover:scale-[1.02]"
                  style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                  <div className="text-2xl mb-1">{c.flag}</div>
                  <div className="font-semibold text-sm" style={{color:'var(--text)'}}>{c.name}</div>
                  <div className="text-xs mt-0.5" style={{color:'#C8A96E'}}>Browse →</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-3xl overflow-hidden relative p-8 sm:p-14 text-center"
          style={{background:'linear-gradient(135deg,#0a0a0a,#1a1208)'}}>
          <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 50% 100%, rgba(200,169,110,0.12) 0%, transparent 60%)'}}/>
          <div className="relative z-10">
            <div className="text-4xl mb-4">{city.flag}</div>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4 leading-tight">
              Ready to find your {city.name} vendor?
            </h2>
            <p className="text-sm sm:text-base mb-8 max-w-lg mx-auto" style={{color:'rgba(255,255,255,0.4)', fontFamily:'Georgia, serif'}}>
              Browse verified vendors, read real reviews from {city.name} couples, and book securely — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/vendors?city=${city.name.toLowerCase()}`}
                className="px-8 py-4 rounded-full font-bold text-white text-sm transition-all hover:opacity-90"
                style={{background:'linear-gradient(135deg,#C9941A,#E4B520)', boxShadow:'0 4px 20px rgba(201,148,26,0.4)'}}>
                Browse {city.name} Vendors →
              </Link>
              <Link href="/register"
                className="px-8 py-4 rounded-full font-semibold text-sm transition-all"
                style={{background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)'}}>
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}