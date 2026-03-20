mport { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import UnfavoriteButton from '@/components/vendor/UnfavoriteButton'
import DashboardShell from '@/components/layout/DashboardShell'

export const dynamic = 'force-dynamic'

const NAV = [
  { href:'/client/dashboard',  label:'Dashboard',     icon:'🏠' },
  { href:'/client/bookings',   label:'My Bookings',   icon:'📅' },
  { href:'/client/wedding',    label:'Wedding Hub',   icon:'💍' },
  { href:'/client/messages',   label:'Messages',      icon:'💬' },
  { href:'/client/quotes',     label:'Quotes',        icon:'📄' },
  { href:'/client/favorites',  label:'Saved Vendors', icon:'❤️' },
  { href:'/vendors',           label:'Browse Vendors',icon:'🔍' },
  { href:'/client/asoebi',     label:'Asoebi Groups', icon:'👘' },
  { href:'/client/profile',    label:'Profile',       icon:'✏️' },
  { href:'/support',           label:'Support',       icon:'🎫' },
]

export default async function FavoritesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/client/favorites')

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      vendor: {
        include: {
          category: true,
          portfolio: { take:1, orderBy:{ order:'asc' } },
          reviews:   { select:{ rating:true } },
        },
      },
    },
    orderBy: { createdAt:'desc' },
  })

  return (
    <DashboardShell role="client" userName={user.name} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Client</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Saved Vendors</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>{favorites.length} vendor{favorites.length!==1?'s':''} saved</p>
      </div>

      <div className="p-8">
        {favorites.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4 opacity-20">❤️</div>
            <h2 className="font-display text-2xl font-bold mb-2" style={{color:'var(--text)'}}>No saved vendors yet</h2>
            <p className="text-sm mb-6" style={{color:'var(--text-muted)'}}>Tap the heart on any vendor to save them here</p>
            <Link href="/vendors" className="inline-flex text-sm font-bold px-5 py-2.5 rounded-xl text-white" style={{background:'#C8A96E'}}>
              Browse Vendors →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {favorites.map(({ vendor, id: favId }) => {
              const avg = vendor.reviews.length
                ? (vendor.reviews.reduce((s,r) => s+r.rating, 0) / vendor.reviews.length).toFixed(1)
                : null
              return (
                <div key={favId} className="rounded-2xl overflow-hidden group"
                  style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                  {/* Image */}
                  <div className="h-44 relative overflow-hidden" style={{background:'var(--bg-subtle)'}}>
                    {vendor.portfolio[0] ? (
                      <img src={vendor.portfolio[0].url} alt={vendor.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
                        {vendor.category?.emoji ?? '🎊'}
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <UnfavoriteButton vendorId={vendor.id} />
                    </div>
                    {vendor.isVerified && (
                      <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{background:'rgba(16,185,129,0.9)'}}>✓ Verified</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold truncate" style={{color:'var(--text)'}}>{vendor.businessName}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{background:'rgba(200,169,110,0.15)', color:'#C8A96E'}}>
                        {vendor.category?.name}
                      </span>
                    </div>
                    {vendor.location && (
                      <p className="text-xs mb-3" style={{color:'var(--text-faint)'}}>📍 {vendor.location}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t" style={{borderColor:'var(--border)'}}>
                      <div className="flex items-center gap-2 text-sm">
                        {avg && (
                          <span className="flex items-center gap-1 text-xs">
                            <span style={{color:'#C8A96E'}}>★</span>
                            <span className="font-semibold" style={{color:'var(--text)'}}>{avg}</span>
                          </span>
                        )}
                        {vendor.priceMin && (
                          <span className="text-xs font-medium" style={{color:'#C8A96E'}}>{formatPrice(vendor.priceMin)}+</span>
                        )}
                      </div>
                      <Link href={`/vendors/${vendor.id}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg"
                        style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}


