import Link from 'next/link'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

const POSTS = [
  {
    slug: 'how-to-tie-the-perfect-gele',
    category: 'Gele & Style', date: 'January 15, 2025', readTime: '5 min read',
    title: 'How to choose the perfect Gele stylist for your Nigerian wedding',
    excerpt: 'Your Gele is one of the most photographed moments of your wedding day. Here\'s exactly what to look for when booking a Gele stylist — and the questions you must ask before committing.',
    featured: true, icon: '🧣',
  },
  {
    slug: 'nigerian-wedding-makeup-diaspora',
    category: 'Makeup', date: 'January 8, 2025', readTime: '4 min read',
    title: 'Finding a Nigerian makeup artist in the UK: everything you need to know',
    excerpt: 'Planning a Nigerian wedding from the UK but want an artist who truly understands your skin tone and the Owambe aesthetic? We break down exactly how to find and vet the right artist.',
    featured: false, icon: '💄',
  },
  {
    slug: 'asoebi-coordination-guide',
    category: 'Wedding Planning', date: 'December 20, 2024', readTime: '6 min read',
    title: 'The complete guide to Asoebi coordination in 2025',
    excerpt: 'Asoebi fabric, colour coordination, payment collection from 200 guests — it can feel overwhelming. We built a tool for exactly this, and this guide shows you how to use it.',
    featured: false, icon: '🌺',
  },
  {
    slug: 'budget-nigerian-wedding-vendors',
    category: 'Budget', date: 'December 10, 2024', readTime: '7 min read',
    title: 'How to plan a stunning Nigerian wedding on a realistic budget',
    excerpt: 'Big Nigerian wedding energy doesn\'t have to mean a big budget. Our guide to finding quality vendors at different price points — with real figures from Lagos, London and Houston.',
    featured: false, icon: '💰',
  },
  {
    slug: 'diaspora-nigerian-wedding-planning',
    category: 'Diaspora Weddings', date: 'November 28, 2024', readTime: '8 min read',
    title: 'Planning a Nigerian traditional wedding from abroad: a step-by-step guide',
    excerpt: 'You\'re in Houston, your family is in Lagos, and the wedding is in three months. Here\'s the exact process we\'ve seen work for hundreds of diaspora couples.',
    featured: false, icon: '🌍',
  },
  {
    slug: 'vendor-spotlight-adaeze-gele',
    category: 'Vendor Spotlight', date: 'November 15, 2024', readTime: '3 min read',
    title: 'Vendor spotlight: Adaeze Gele & Bridal, Victoria Island',
    excerpt: 'With over 400 brides served and a 4.9-star rating, Adaeze is one of VowConnect\' most booked vendors. We sat down with her to learn what makes her work stand out.',
    featured: false, icon: '⭐',
  },
]

const CATS = ['All','Gele & Style','Makeup','Wedding Planning','Budget','Diaspora Weddings','Vendor Spotlight']

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured)!
  const rest     = POSTS.filter(p => !p.featured)

  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />

      <section className="pt-28 pb-16 px-4 md:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="section-label mb-4">Blog</div>
          <h1 className="font-display text-5xl md:text-6xl text-theme mb-5 leading-tight">
            Nigerian wedding<br /><span className="italic text-theme-muted">inspiration & advice</span>
          </h1>
          <p className="text-theme-muted text-lg">Tips, guides and stories from the VowConnect community.</p>
        </div>
      </section>

      {/* Category filter */}
      <section className="px-4 md:px-6 pb-8">
        <div className="max-w-6xl mx-auto flex gap-2 flex-wrap">
          {CATS.map((c, i) => (
            <button key={c} className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${i === 0 ? 'bg-[#0A0A0A] dark:bg-[#F5F0E8] text-white dark:text-[#0A0A0A] border-transparent' : 'border-[var(--border)] text-theme-muted hover:border-[#C8A96E] hover:text-[#C8A96E]'}`}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Featured post */}
      <section className="px-4 md:px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="card overflow-hidden card-hover">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 h-56 md:h-auto bg-[#080808] flex items-center justify-center relative overflow-hidden">
                <div className="text-8xl opacity-10">{featured.icon}</div>
                <div className="absolute inset-0 grid-lines opacity-50" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#C8A96E] text-white text-[9px] font-bold px-3 py-1 rounded-full">Featured</span>
                </div>
              </div>
              <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="badge-sand">{featured.category}</span>
                  <span className="text-theme-faint text-xs">{featured.date} · {featured.readTime}</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-theme mb-4 leading-tight">{featured.title}</h2>
                <p className="text-theme-muted text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                <Link href={`/blog/${featured.slug}`} className="btn-sand self-start px-6 py-2.5 rounded-full text-sm">Read Article →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of posts */}
      <section className="px-4 md:px-6 pb-24">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card p-6 card-hover block group">
              <div className="h-28 rounded-xl bg-theme-subtle flex items-center justify-center text-5xl mb-5 opacity-60 group-hover:opacity-100 transition-opacity">{post.icon}</div>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-gray text-[9px]">{post.category}</span>
                <span className="text-theme-faint text-[10px]">{post.readTime}</span>
              </div>
              <h3 className="font-semibold text-theme text-sm leading-snug mb-2 group-hover:text-[#C8A96E] transition-colors">{post.title}</h3>
              <p className="text-theme-faint text-xs leading-relaxed line-clamp-3">{post.excerpt}</p>
              <div className="mt-4 text-[#C8A96E] text-xs font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">Read more <span>→</span></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 md:px-6 py-20 bg-theme-subtle">
        <div className="max-w-2xl mx-auto text-center">
          <div className="section-label mb-3">Newsletter</div>
          <h2 className="font-display text-4xl text-theme mb-3">Wedding tips in your inbox</h2>
          <p className="text-theme-muted text-sm mb-8">Monthly roundup of vendor spotlights, planning tips, and real wedding stories.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input className="input flex-1" type="email" placeholder="your@email.com" />
            <button className="btn-sand px-5 py-3 rounded-xl text-sm flex-shrink-0">Subscribe</button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
