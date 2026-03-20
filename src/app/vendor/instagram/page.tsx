'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

import DashboardShell from '@/components/layout/DashboardShell'

const NAV = [
  { href:'/vendor/dashboard',    label:'Dashboard',    icon:'🏠' },
  { href:'/vendor/bookings',     label:'Bookings',     icon:'📅' },
  { href:'/vendor/messages',     label:'Messages',     icon:'💬' },
  { href:'/vendor/quotes',       label:'Quotes',       icon:'📄' },
  { href:'/vendor/profile',      label:'Profile',      icon:'✏️' },
  { href:'/vendor/portfolio',    label:'Portfolio',    icon:'🖼️' },
  { href:'/vendor/packages',     label:'Packages',     icon:'📦' },
  { href:'/vendor/availability', label:'Availability', icon:'🗓️' },
  { href:'/vendor/crm',          label:'Client CRM',   icon:'👥' },
  { href:'/vendor/analytics',    label:'Analytics',    icon:'📊' },
  { href:'/vendor/pricing',      label:'Pricing',      icon:'💰' },
]

interface IgPost { id: string; media_url: string; caption?: string; permalink: string; timestamp: string }
interface IgStatus {
  connected: boolean; oauthUrl?: string | null; handle?: string
  posts?: IgPost[]; expired?: boolean; error?: string
}

function InstagramSyncPageInner() {
  const searchParams  = useSearchParams()
  const justConnected = searchParams.get('connected') === 'true'
  const authError     = searchParams.get('error')

  const [status,    setStatus]    = useState<IgStatus | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)
  const [imported,  setImported]  = useState<{ imported: number; skipped: number } | null>(null)

  useEffect(() => {
    fetch('/api/instagram').then(r => r.json()).then(d => { setStatus(d); setLoading(false) })
  }, [justConnected])

  function toggleSelect(post: IgPost) {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(post.id) ? n.delete(post.id) : n.add(post.id)
      return n
    })
  }

  async function handleImport() {
    if (!status?.posts || !selected.size) return
    setImporting(true)
    const picks   = status.posts.filter(p => selected.has(p.id))
    const urls    = picks.map(p => p.media_url)
    const capts   = picks.map(p => p.caption ? p.caption.slice(0, 200) : null)
    const res     = await fetch('/api/instagram', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ imageUrls: urls, captions: capts }),
    })
    const data = await res.json()
    setImported(data)
    setSelected(new Set())
    setImporting(false)
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect your Instagram account? Imported photos will stay in your portfolio.')) return
    await fetch('/api/instagram', { method: 'DELETE' })
    setStatus({ connected: false })
    setImported(null)
  }

  if (loading) return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Instagram</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Sync your Instagram</p>
      </div>
      <div className="p-8">
       className="flex items-center justify-center h-64">
      <div className="text-center"><div className="text-4xl mb-2 animate-bounce">📸</div><div className="text-theme-faint">Connecting to Instagram...</div></div>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-theme">Instagram Sync 📸</h1>
        <p className="text-theme-muted mt-1">Import your Instagram photos directly into your portfolio</p>
      </div>

      {/* Status banners */}
      {justConnected && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium mb-4">
          ✅ Instagram connected successfully! Select photos below to import.
        </div>
      )}
      {authError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          ❌ {authError === 'cancelled' ? 'Connection cancelled.' : authError === 'auth_failed' ? 'Instagram authorisation failed. Please try again.' : 'Something went wrong. Please try again.'}
        </div>
      )}
      {imported && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium mb-4">
          ✅ Imported {imported.imported} photo{imported.imported !== 1 ? 's' : ''} to your portfolio!
          {imported.skipped > 0 && ` (${imported.skipped} already imported)`}
          <a href="/vendor/portfolio" className="underline ml-2 font-bold">View Portfolio →</a>
        </div>
      )}

      {/* Not connected */}
      {!status?.connected && (
        <div className="card p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-4xl shrink-0">
              📸
            </div>
            <div className="text-center sm:text-left">
              <h2 className="font-display text-2xl font-bold text-theme mb-2">Connect Your Instagram</h2>
              <p className="text-theme-muted text-sm mb-4">
                Import your last 9 photos from Instagram into your VowConnect portfolio in one click.
                No re-uploading — just select and import.
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start mb-5">
                {['Save hours of uploading', 'Keep portfolio fresh automatically', 'Showcase your best work instantly'].map(b => (
                  <span key={b} className="text-xs px-3 py-1 rounded-full bg-theme-subtle text-theme-muted font-medium">✓ {b}</span>
                ))}
              </div>

              {status?.oauthUrl ? (
                <a href={status.oauthUrl}
                  className="btn-primary inline-flex items-center gap-2">
                  <span className="text-lg">📸</span> Connect Instagram
                </a>
              ) : (
                <div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm mb-3">
                    ⚠️ Instagram API keys not configured yet.
                  </div>
                  <div className="text-xs text-theme-muted space-y-1">
                    <p>Add to your <code className="bg-theme-subtle px-1 rounded">.env.local</code>:</p>
                    <code className="block bg-[#0A0A0A] text-green-300 p-3 rounded-xl text-xs">
                      INSTAGRAM_CLIENT_ID="your-app-id"<br/>
                      INSTAGRAM_CLIENT_SECRET="your-secret"
                    </code>
                    <p className="mt-2">Get these at <strong>developers.facebook.com</strong> → Create App → Instagram Basic Display</p>
                  </div>
                </div>
              )}

              {status?.expired && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  Your Instagram session expired. Please reconnect.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connected — show posts */}
      {status?.connected && status.posts && (
        <>
          {/* Connection info */}
          <div className="card p-4 mb-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
              IG
            </div>
            <div className="flex-1">
              <div className="font-semibold text-theme text-sm">
                {status.handle ? `@${status.handle.replace('@','')}` : 'Instagram Connected'}
              </div>
              <div className="text-theme-faint text-xs">{status.posts.length} photos available to import</div>
            </div>
            <button onClick={handleDisconnect} className="text-xs text-red-400 hover:text-red-600 transition-colors">Disconnect</button>
          </div>

          {/* Instructions */}
          <div className="p-3 rounded-xl bg-[#FDFAF4] border border-[#C8A96E]/40 text-[#C8A96E] text-sm mb-5">
            💡 Tap photos to select them, then click "Import to Portfolio". Already-imported photos are skipped automatically.
          </div>

          {/* Photo grid */}
          {status.posts.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-3xl mb-2">🖼️</div>
              <p className="text-theme-muted text-sm">No image posts found. Only image posts (not videos or Reels) can be imported.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {status.posts.map(post => (
                  <button key={post.id} onClick={() => toggleSelect(post)} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={post.media_url} alt={post.caption ?? ''} className="w-full h-full object-cover"/>
                    {/* Hover overlay */}
                    <div className={`absolute inset-0 transition-all duration-200 flex items-center justify-center
                      ${selected.has(post.id) ? 'bg-[#C8A96E]/60' : 'bg-black/0 group-hover:bg-black/30'}`}>
                      {selected.has(post.id) && (
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                          <span className="text-[#C8A96E] text-lg font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    {/* Caption preview */}
                    {post.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Selection + import bar */}
              <div className="sticky bottom-4 z-10">
                <div className="card p-4 flex items-center gap-4 shadow-warm-lg">
                  <div className="flex-1">
                    {selected.size === 0 ? (
                      <p className="text-theme-faint text-sm">Tap photos to select</p>
                    ) : (
                      <p className="text-theme text-sm font-medium">{selected.size} photo{selected.size !== 1 ? 's' : ''} selected</p>
                    )}
                  </div>
                  <button onClick={() => setSelected(new Set(status.posts!.map(p => p.id)))}
                    className="btn-ghost text-sm py-2">Select All</button>
                  <button onClick={handleImport} disabled={!selected.size || importing}
                    className="btn-primary py-2 disabled:opacity-50">
                    {importing ? 'Importing...' : `Import ${selected.size > 0 ? selected.size : ''} to Portfolio`}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* How it works */}
      <div className="card p-5 mt-6">
        <h3 className="font-semibold text-theme mb-3 text-sm">How Instagram Sync Works</h3>
        <div className="space-y-2">
          {[
            { n:'1', t:'Connect once', d:'Authorise VowConnect to read your Instagram photos (read-only, we never post)' },
            { n:'2', t:'Browse your posts', d:'Your latest 12 image posts are loaded for selection' },
            { n:'3', t:'Select & import', d:'Choose which photos to add to your portfolio — duplicates are skipped' },
            { n:'4', t:'Repeat anytime', d:'Come back after your next event shoot to import new photos in seconds' },
          ].map(s => (
            <div key={s.n} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-[#F5ECD8] text-[#C8A96E] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</div>
              <div><span className="text-sm font-medium text-theme">{s.t}</span><span className="text-theme-faint text-sm"> — {s.d}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
      </div>
    </DashboardShell>
  )
}

export default function InstagramSyncPage() {
  return <Suspense><InstagramSyncPageInner /></Suspense>
}
