import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

// In production this would come from a CMS (Contentful, Sanity, etc.)
const POSTS: Record<string, {
  title: string; category: string; date: string; readTime: string; icon: string
  intro: string; sections: { heading: string; body: string }[]
}> = {
  'how-to-tie-the-perfect-gele': {
    title: 'How to choose the perfect Gele stylist for your Nigerian wedding',
    category: 'Gele & Style', date: 'January 15, 2025', readTime: '5 min read', icon: '🧣',
    intro: 'Your Gele is one of the most photographed moments of your wedding day. A masterful Gele frames your face, completes your aso-oke, and carries deep cultural significance. Choosing the right stylist is one of the most important vendor decisions you will make. Here is exactly what to look for.',
    sections: [
      { heading: 'Check their portfolio carefully', body: 'A Gele stylist\'s portfolio tells you everything. Look for photos of real wedding clients — not just practice shots on mannequins. Pay attention to symmetry, height, and whether the front pleat is clean and centred. A stylist who only shows angle shots from one side may be hiding weakness on the other.' },
      { heading: 'Ask about their training and experience', body: 'Ask directly: How long have you been styling Gele? Have you done weddings for my tribe (Yoruba, Igbo, Edo)? Different styles vary — Yoruba Gele is typically wider and more structured than Igbo or Edo styles. Ensure your stylist knows yours.' },
      { heading: 'Confirm their location and travel availability', body: 'Many diaspora brides hire a stylist from London or Houston who travels to Nigeria for the wedding. Confirm travel costs upfront. Conversely, if you\'re in the UK and your stylist is in Lagos, confirm they\'re willing to travel or can recommend a trusted colleague.' },
      { heading: 'Book early — especially in peak season', body: 'Top Gele stylists in Lagos, London, and Houston book out 3–6 months in advance for peak season (December–January and July–August). If your wedding is in December, start reaching out by June at the latest.' },
      { heading: 'Agree on a trial run', body: 'Always do a trial at least 2 weeks before your wedding. This lets you test the style, adjust the height and shape, take photos in your dress, and iron out any concerns before the big day.' },
    ],
  },
  'nigerian-wedding-makeup-diaspora': {
    title: 'Finding a Nigerian makeup artist in the UK: everything you need to know',
    category: 'Makeup', date: 'January 8, 2025', readTime: '4 min read', icon: '💄',
    intro: 'You want an artist who understands melanin-rich skin, knows the Owambe aesthetic, and can keep your beat fresh from the traditional ceremony to the reception. Finding that person in the UK takes strategy. Here\'s the roadmap.',
    sections: [
      { heading: 'Look for melanin-specialist experience', body: 'Ask potential artists about their experience with deep and dark skin tones. Request to see portfolio images of clients whose complexion matches yours. A great artist will have a varied portfolio and will discuss your undertones, skin type, and any concerns confidently.' },
      { heading: 'Check longevity — Nigerian weddings are long', body: 'A Nigerian wedding can run 8–12 hours. Ask your artist what products they use for setting and longevity. Airbrush foundation tends to last longer. Ask specifically: "What\'s your approach to keeping my makeup fresh for a 10-hour day?"' },
      { heading: 'Confirm cultural knowledge', body: 'An artist who has done Nigerian weddings knows the difference between traditional and white wedding looks, understands aso-ebi colours, and knows not to over-contour a Yoruba bridal look where the full round face is celebrated, not minimised.' },
      { heading: 'Trial runs are non-negotiable', body: 'Book a full trial at least 3 weeks before your wedding. Take photos in natural and artificial light. Wear your headgear if possible. The trial reveals everything — the communication style, time management, and whether the look actually suits you.' },
    ],
  },
  'asoebi-coordination-guide': {
    title: 'The complete guide to Asoebi coordination in 2025',
    category: 'Wedding Planning', date: 'December 20, 2024', readTime: '6 min read', icon: '🌺',
    intro: 'Asoebi is the beautiful Nigerian tradition of family and close friends wearing matching fabric to celebrate with the couple. Coordinating it — especially for a large Nigerian wedding — can feel like a logistical nightmare. This guide walks you through doing it with ease, including how to use VowConnect\'s Asoebi tool.',
    sections: [
      { heading: 'Choose your fabric early', body: 'Start sourcing your aso-oke, ankara, or lace at least 3 months before the wedding. For diaspora couples, fabric markets in Brixton (London), Peckham, and the Nigeria Town area of Houston carry good stock. For Nigerian brides, Balogun Market in Lagos is the gold standard.' },
      { heading: 'Set clear expectations upfront', body: 'Be explicit about who is invited to wear Asoebi, the colour(s), the price per yard, and the deadline to order. Use WhatsApp groups for communication but also track everything in a spreadsheet or dedicated tool.' },
      { heading: 'Use the VowConnect Asoebi tool', body: 'VowConnect has a built-in Asoebi coordination feature. Create a group, set your fabric details and price, and share the join link with your guests. They can confirm their interest, pay their deposit, and you can track everything in one place — no more chasing individuals on WhatsApp.' },
      { heading: 'Handle late payers firmly but kindly', body: 'Set a firm payment deadline 6 weeks before the wedding. After the deadline, fabric is not guaranteed. This is stated upfront and followed through. Flexibility breeds chaos at scale.' },
      { heading: 'Consider professional distribution', body: 'For large groups (50+ people), consider using a seamstress or fabric distributor who will cut and distribute fabric directly. Many Lagos-based seamstresses offer this service and it removes significant logistical burden from you.' },
    ],
  },
  'budget-nigerian-wedding-vendors': {
    title: 'How to find quality Nigerian wedding vendors on a budget',
    category: 'Budget Planning', date: 'December 10, 2024', readTime: '5 min read', icon: '💰',
    intro: `A Nigerian wedding doesn't have to cost a fortune to be beautiful. The key is knowing where to look, what to prioritise, and how to negotiate.`,
    sections: [
      { heading: 'Decide your non-negotiables', body: `Before searching, write down the three things that matter most visually. For most Nigerian brides it's Gele, makeup, and photography — because those live in every photo forever. Allocate the majority of your vendor budget to these three. Everything else is negotiable.` },
      { heading: 'Use VowConnect filters smartly', body: `Filter by category and country together. Local vendors often charge less and don't add travel costs. A vendor with 4.6 stars and 20 reviews is often better value than a 5-star vendor with 2 reviews.` },
      { heading: 'Consider emerging vendors', body: `Many of the best vendors are still building their portfolios and actively seeking bookings. They price lower than established names while delivering exceptional work. Look for polished Instagram presence but fewer reviews — that's your sweet spot.` },
      { heading: 'Book early for off-peak discounts', body: `Saturday weddings in December cost more than a Friday in March. Off-peak timing can reduce vendor costs by 20-40%. Most vendors offer better rates when booked 6+ months in advance.` },
      { heading: 'Bundle where you can', body: `Some Gele stylists also do touch-up makeup. Some photographers also do videography. Bundling can save 15–25% compared to booking separately, with the added benefit of stylistic cohesion.` },
    ],
  },
  'diaspora-nigerian-wedding-planning': {
    title: 'Planning a Nigerian wedding from abroad: the complete diaspora guide',
    category: 'Diaspora', date: 'November 28, 2024', readTime: '7 min read', icon: '✈️',
    intro: `Planning a Nigerian wedding from London, Houston, or Toronto requires a different approach. Time zones, international bank transfers, WhatsApp coordination across continents — it adds up. This guide is written specifically for diaspora couples.`,
    sections: [
      { heading: 'Decide: Nigeria, abroad, or both?', body: `Many diaspora couples host two ceremonies — traditional in Nigeria and reception abroad. Start with Nigerian dates first since family coordination there is typically harder to control.` },
      { heading: 'Build your vendor team remotely', body: `You can shortlist and communicate with Nigerian vendors entirely via VowConnect and WhatsApp. Ask for a recent portfolio, request a video call, ask for references, and confirm payment details over two separate channels.` },
      { heading: 'Managing payments across borders', body: `For Nigerian vendors, most accept bank transfers to Nigerian accounts. Get account details in writing and always confirm the name on the account. VowConnect Pro vendors are verified — look for the badge.` },
      { heading: 'Use a local coordinator', body: `If planning from abroad, a local coordinator in Lagos or Abuja is one of the best investments you can make. They can physically check venues, supervise vendor setup, and handle unexpected logistics. Budget ₦150,000–₦500,000.` },
      { heading: 'Asoebi logistics from abroad', body: `The VowConnect Asoebi tool was specifically designed for diaspora couples. Create your group, share the link in your family WhatsApp, and track confirmations and payments from anywhere in the world.` },
      { heading: 'Diaspora timeline', body: `12 months: Choose dates and book venue. 9 months: Book photographers and videographers. 6 months: Gele, makeup, decorator. 4 months: Asoebi fabric. 2 months: Final confirmations. 4 weeks: Trial runs.` },
    ],
  },
  'vendor-spotlight-adaeze-gele': {
    title: 'Vendor spotlight: how Adaeze built a 6-figure Gele business in London',
    category: 'Vendor Stories', date: 'November 15, 2024', readTime: '4 min read', icon: '🌟',
    intro: `Adaeze started tying Gele for friends in Peckham in 2018. Six years later, she runs one of the most sought-after Gele styling practices in London, flying to Nigeria and the US for weddings year-round.`,
    sections: [
      { heading: 'Start with your community', body: `"I didn't have a website when I started. I just told everyone I knew that I was doing Gele. My first five clients were my mum's friends. Those five became twenty referrals. Nigerian weddings run on word of mouth — the community is the algorithm."` },
      { heading: 'Portfolio photography is everything', body: `"I invested in one proper photoshoot early on — four models, different aso-oke colours. That portfolio got me my first big Ikoyi wedding booking and I never looked back. One investment, years of returns."` },
      { heading: 'Specialise before you expand', body: `"For the first two years I only did Gele. That focus let me get really good at it and build a reputation as a specialist. Don't be everything to everyone."` },
      { heading: 'The diaspora market is underserved', body: `"There are so many Nigerian women in London, Houston, Toronto who want authentic Gele but can't find someone they trust. When I started taking bookings outside London I realised how big the market was. VowConnect made it easier for brides abroad to find me specifically."` },
      { heading: 'On pricing yourself fairly', body: `"I see a lot of vendors undercharging because they're afraid of losing bookings. Don't. If your work is good, your price is your positioning. A bride who books the cheapest Gele stylist is not your client."` },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }))
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug]
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/blog" className="text-theme-muted text-sm hover:text-theme transition-colors">← Blog</Link>
            <span className="text-theme-faint">/</span>
            <span className="badge-sand">{post.category}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-theme mb-5 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 text-theme-muted text-sm">
            <span>{post.date}</span>
            <span className="text-theme-faint">·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      {/* Cover */}
      <section className="px-4 md:px-6 mb-12">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-[#080808] h-52 md:h-72 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 grid-lines opacity-50" />
            <div className="text-8xl opacity-10">{post.icon}</div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 md:px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-theme-muted text-lg leading-relaxed mb-10 font-light">{post.intro}</p>

          <div className="space-y-10">
            {post.sections.map((section, i) => (
              <div key={i}>
                <h2 className="font-display text-2xl text-theme mb-3">{section.heading}</h2>
                <p className="text-theme-muted leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 rounded-2xl bg-[#F5ECD8] dark:bg-[#1A130A] border border-[#E3CC99] dark:border-[#2A1F0A] p-8">
            <div className="section-label mb-3">Ready to get started?</div>
            <h3 className="font-display text-2xl text-[#6A4A1E] dark:text-[#C8A96E] mb-3">Find your vendors on VowConnect</h3>
            <p className="text-[#8A6A2E]/70 dark:text-[#C8A96E]/60 text-sm mb-5">Hundreds of verified Gele stylists, makeup artists, photographers and more — across Nigeria and the diaspora.</p>
            <Link href="/vendors" className="btn-sand px-6 py-3 rounded-full text-sm">Browse Vendors Free →</Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
