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

interface IgPost { id:string; media_url:string; caption?:string; permalink:string; timestamp:string }
interface IgStatus { connected:boolean; oauthUrl?:string|null; handle?:string; posts?:IgPost[]; expired?:boolean; error?:string }

function InstagramInner() {
  const searchParams  = useSearchParams()
  const justConnected = searchParams.get('connected') === 'true'
  const authError     = searchParams.get('error')

  const [status,    setStatus]    = useState<IgStatus|null>(null)
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)
  const [imported,  setImported]  = useState<{imported:number;skipped:number}|null>(null)

  useEffect(() => {
    fetch('/api/instagram', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setStatus(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [justConnected])

  function toggle(post: IgPost) {
    setSelected(p => { const n = new Set(p); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n })
  }

  async function importSelected() {
    if (!selected.size || !status?.posts) return
    setImporting(true)
    const posts = status.posts.filter(p => selected.has(p.id))
    const res   = await fetch('/api/instagram', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ posts }),
    })
    const data = await res.json()
    setImported(data)
    setSelected(new Set())
    setImporting(false)
  }

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Instagram Sync</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Import your Instagram posts to your portfolio</p>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
          </div>
        ) : !status?.connected ? (
          <div className="rounded-2xl p-12 text-center max-w-md mx-auto" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="text-5xl mb-4">📸</div>
            <h2 className="font-display text-2xl font-bold mb-2" style={{color:'var(--text)'}}>Connect Instagram</h2>
            <p className="text-sm mb-6" style={{color:'var(--text-muted)'}}>Import your best work directly from Instagram into your VowConnect portfolio</p>
            {authError && <p className="text-sm mb-4" style={{color:'#f87171'}}>Error: {authError}</p>}
            {status?.oauthUrl ? (
              <a href={status.oauthUrl}
                className="inline-flex text-sm font-bold px-6 py-3 rounded-xl text-white"
                style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                Connect Instagram →
              </a>
            ) : (
              <p className="text-sm" style={{color:'var(--text-faint)'}}>Instagram integration not configured. Add INSTAGRAM_CLIENT_ID to your environment.</p>
            )}
          </div>
        ) : (
          <>
            {justConnected && (
              <div className="mb-6 p-4 rounded-xl text-sm font-semibold" style={{background:'rgba(16,185,129,0.1)', color:'#10b981', border:'1px solid rgba(16,185,129,0.2)'}}>
                ✅ Instagram connected! Select posts to import.
              </div>
            )}
            {imported && (
              <div className="mb-6 p-4 rounded-xl text-sm" style={{background:'rgba(200,169,110,0.1)', color:'#C8A96E', border:'1px solid rgba(200,169,110,0.3)'}}>
                ✅ Imported {imported.imported} posts · {imported.skipped} already in portfolio
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold" style={{color:'var(--text)'}}>@{status.handle}</h2>
                <p className="text-xs mt-0.5" style={{color:'var(--text-faint)'}}>{status.posts?.length ?? 0} posts · select to import</p>
              </div>
              {selected.size > 0 && (
                <button onClick={importSelected} disabled={importing}
                  className="text-sm font-bold px-4 py-2 rounded-xl text-white disabled:opacity-50"
                  style={{background:'#C8A96E'}}>
                  {importing ? 'Importing…' : `Import ${selected.size} posts`}
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(status.posts ?? []).map(post => (
                <button key={post.id} onClick={() => toggle(post)}
                  className="relative aspect-square rounded-xl overflow-hidden transition-all"
                  style={{border: selected.has(post.id) ? '3px solid #C8A96E' : '2px solid var(--border)'}}>
                  <img src={post.media_url} alt={post.caption??''} className="w-full h-full object-cover"/>
                  {selected.has(post.id) && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{background:'rgba(200,169,110,0.4)'}}>
                      <span className="text-white text-2xl font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}

export default function InstagramPage() {
  return <Suspense><InstagramInner /></Suspense>
}