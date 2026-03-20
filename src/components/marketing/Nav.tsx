'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from '@/components/layout/ThemeProvider'

interface Me { name: string; email: string; role: string; avatar?: string }

export function MarketingNav() {
  const [me,       setMe]       = useState<Me | null>(null)
  const [open,     setOpen]     = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me', { credentials:'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { setMe(d?.name ? d : null); setLoading(false) })
      .catch(() => { setMe(null); setLoading(false) })
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function signOut() {
    setSigningOut(true)
    await fetch('/api/auth/logout', { method:'POST', credentials:'include' })
    window.location.replace('/login')
  }

  const dashboardHref =
    me?.role === 'SUPER_ADMIN' ? '/admin/dashboard' :
    me?.role === 'VENDOR'      ? '/vendor/dashboard' :
                                  '/client/dashboard'

  const initial = me?.name?.charAt(0).toUpperCase() ?? ''

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 flex-shrink-0">
          <span className="font-display text-xl text-theme">Vow</span>
          <span className="font-display text-xl text-[#C8A96E]">Connect</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/vendors"        className="text-sm font-medium text-theme-muted hover:text-theme transition-colors">Browse Vendors</Link>
          <Link href="/find-my-vendor" className="text-sm font-medium text-[#C9941A] hover:text-[#E4B520] transition-colors">✨ Find My Vendor</Link>
          <Link href="/features"       className="text-sm font-medium text-theme-muted hover:text-theme transition-colors">Features</Link>
          <Link href="/pricing"        className="text-sm font-medium text-theme-muted hover:text-theme transition-colors">Pricing</Link>
          <Link href="/how-it-works"   className="text-sm font-medium text-theme-muted hover:text-theme transition-colors">How It Works</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {loading ? (
            <div className="w-8 h-8 rounded-full animate-pulse" style={{background:'var(--border)'}}/>
          ) : me ? (
            /* Avatar dropdown */
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all hover:opacity-80 focus:outline-none"
                style={{borderColor:'var(--border)', background:'var(--bg-subtle)'}}>
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0"
                  style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                  {me.avatar
                    ? <img src={me.avatar} alt={me.name} className="w-full h-full object-cover"/>
                    : initial}
                </div>
                <span className="text-sm font-medium text-theme hidden sm:block">{me.name.split(' ')[0]}</span>
                <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} style={{color:'var(--text-muted)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {open && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden shadow-2xl z-50"
                  style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                  
                  {/* User info */}
                  <div className="px-4 py-4 border-b" style={{borderColor:'var(--border)'}}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0"
                        style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                        {me.avatar
                          ? <img src={me.avatar} alt={me.name} className="w-full h-full object-cover"/>
                          : initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate" style={{color:'var(--text)'}}>{me.name}</div>
                        <div className="text-xs truncate" style={{color:'var(--text-faint)'}}>{me.email}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{color:'#C8A96E'}}>
                          {me.role.replace('_',' ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-2">
                    <Link href={dashboardHref} onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-70"
                      style={{color:'var(--text)'}}>
                      <span className="text-base">🏠</span>
                      <span>Dashboard</span>
                    </Link>

                    {me.role === 'VENDOR' && (
                      <>
                        <Link href="/vendor/profile" onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-70"
                          style={{color:'var(--text)'}}>
                          <span className="text-base">✏️</span>
                          <span>Edit Profile</span>
                        </Link>
                        <Link href="/vendor/bookings" onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-70"
                          style={{color:'var(--text)'}}>
                          <span className="text-base">📅</span>
                          <span>Bookings</span>
                        </Link>
                      </>
                    )}

                    {me.role === 'CLIENT' && (
                      <>
                        <Link href="/client/bookings" onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-70"
                          style={{color:'var(--text)'}}>
                          <span className="text-base">📅</span>
                          <span>My Bookings</span>
                        </Link>
                        <Link href="/client/wedding" onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-70"
                          style={{color:'var(--text)'}}>
                          <span className="text-base">💍</span>
                          <span>Wedding Hub</span>
                        </Link>
                      </>
                    )}

                    <Link href="/support" onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-70"
                      style={{color:'var(--text)'}}>
                      <span className="text-base">🎫</span>
                      <span>Support</span>
                    </Link>
                  </div>

                  {/* Sign out */}
                  <div className="border-t py-2" style={{borderColor:'var(--border)'}}>
                    <button onClick={signOut} disabled={signingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-70 disabled:opacity-40"
                      style={{color:'#ef4444'}}>
                      <span className="text-base">↩</span>
                      <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in */
            <>
              <Link href="/login"    className="btn-ghost text-sm hidden sm:flex">Sign In</Link>
              <Link href="/register" className="btn-sand text-sm py-2 px-4 rounded-full">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export function MarketingFooter() {
  return (
    <footer className="bg-[#080808] border-t border-white/5 py-14 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-1 mb-4">
              <span className="font-display text-xl text-white">Vow</span>
              <span className="font-display text-xl text-[#C8A96E]">Connect</span>
            </div>
            <p className="text-white/20 text-sm leading-relaxed max-w-xs">Nigeria & diaspora&apos;s premier marketplace for verified wedding vendors.</p>
            <div className="flex gap-5 mt-6">
              {['Instagram','TikTok','WhatsApp'].map(s => <a key={s} href="#" className="text-white/20 hover:text-[#C8A96E] text-xs transition-colors">{s}</a>)}
            </div>
          </div>
          {[
            { t:'Platform',    l:[['Browse Vendors','/vendors'],['✨ Find My Vendor','/find-my-vendor'],['Map View','/map'],['Features','/features'],['Pricing','/pricing']] },
            { t:'For Vendors', l:[['List Business','/register?role=vendor'],['Vendor Guide','/vendor-guide'],['Dashboard','/vendor/dashboard'],['FAQ','/faq']] },
            { t:'Company',     l:[['About','/about'],['Blog','/blog'],['Support','/support'],['Contact','/contact'],['Privacy','/privacy']] },
          ].map(col => (
            <div key={col.t}>
              <h4 className="text-white/35 font-bold text-[9px] mb-4 uppercase tracking-[0.2em]">{col.t}</h4>
              <ul className="space-y-2.5">
                {col.l.map(([label, href]) => <li key={label}><Link href={href} className="text-white/20 hover:text-[#C8A96E] text-sm transition-colors">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/15 text-xs">© {new Date().getFullYear()} VowConnect. All rights reserved.</p>
          <div className="flex gap-6">
            {[['Privacy','/privacy'],['Terms','/terms'],['Contact','/contact']].map(([l,h]) => <Link key={l} href={h} className="text-white/15 hover:text-[#C8A96E] text-xs transition-colors">{l}</Link>)}
          </div>
        </div>
      </div>
    </footer>
  )
}