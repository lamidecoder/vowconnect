'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const CLIENT_TABS = [
  { href: '/client/dashboard', icon: '🏠', label: 'Home'     },
  { href: '/vendors',          icon: '🔍', label: 'Browse'   },
  { href: '/client/bookings',  icon: '📅', label: 'Bookings' },
  { href: '/client/messages',  icon: '💬', label: 'Messages', msgBadge: true },
  { href: '/client/profile',   icon: '👤', label: 'Profile'  },
]

const VENDOR_TABS = [
  { href: '/vendor/dashboard',  icon: '📊', label: 'Home'      },
  { href: '/vendor/bookings',   icon: '📅', label: 'Bookings'  },
  { href: '/vendor/messages',   icon: '💬', label: 'Messages', msgBadge: true },
  { href: '/vendor/portfolio',  icon: '🖼️', label: 'Portfolio' },
  { href: '/vendor/profile',    icon: '🏪', label: 'Profile'   },
]

/* Bottom tab bar for dashboard pages */
export function MobileNav({ role }: { role: 'CLIENT' | 'VENDOR' }) {
  const pathname  = usePathname()
  const tabs      = role === 'CLIENT' ? CLIENT_TABS : VENDOR_TABS
  const [unread, setUnread] = useState(0)

  // Poll unread count every 15s
  useEffect(() => {
    function fetchUnread() {
      fetch('/api/messages')
        .then(r => r.json())
        .then(d => {
          if (!Array.isArray(d)) return
          const total = d.reduce((s: number, c: any) => s + (c._count?.messages ?? 0), 0)
          setUnread(total)
        })
        .catch(() => {})
    }
    fetchUnread()
    const id = setInterval(fetchUnread, 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <div className="h-16 md:hidden" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(235,224,192,0.8)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
        <div className="flex items-stretch h-16">
          {tabs.map(tab => {
            const active  = pathname.startsWith(tab.href)
            const showDot = (tab as any).msgBadge && unread > 0 && !active
            return (
              <Link key={tab.href} href={tab.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
                style={{ textDecoration: 'none' }}>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg,#C9941A,#E4B520)' }} />
                )}
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  <span style={{ fontSize: 20, opacity: active ? 1 : 0.45, transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.15s', display: 'block' }}>
                    {tab.icon}
                  </span>
                  {showDot && (
                    <span style={{
                      position: 'absolute', top: -2, right: -4,
                      minWidth: 16, height: 16, borderRadius: 8,
                      background: 'linear-gradient(135deg,#C9941A,#E4B520)',
                      color: 'white', fontSize: 9, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 3px', border: '1.5px solid white',
                    }}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </span>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? '#C9941A' : '#8A7560' }}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

/* Hamburger header for public pages */
export function PublicMobileHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden"
        style={{
          height: 56,
          background: scrolled ? 'rgba(250,246,238,0.96)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(235,224,192,0.6)' : 'none',
          transition: 'all 0.3s',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '100%' }}>
          <Link href="/" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 700, color: scrolled ? '#C9941A' : '#E8C96A', textDecoration: 'none' }}>
            Vow<span className="text-[#C8A96E]">Connect</span>
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${scrolled ? '#EBE0C0' : 'rgba(255,255,255,0.3)'}`, background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer' }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ display: 'block', width: menuOpen && i === 1 ? 0 : 18, height: 1.5, background: scrolled ? '#2C1A0E' : 'white', borderRadius: 2, transform: menuOpen ? (i === 0 ? 'translateY(6.5px) rotate(45deg)' : i === 2 ? 'translateY(-6.5px) rotate(-45deg)' : 'scaleX(0)') : 'none', transition: 'all 0.2s' }} />
            ))}
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 48, background: 'rgba(26,14,7,0.8)', backdropFilter: 'blur(8px)', opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none', transition: 'opacity 0.25s' }} onClick={() => setMenuOpen(false)} />

      {/* Slide-in drawer */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '75vw', maxWidth: 300, zIndex: 49, background: '#FAF6EE', transform: menuOpen ? 'translateX(0)' : 'translateX(110%)', transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)', padding: '80px 24px 40px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 24, fontWeight: 700, color: '#C9941A', marginBottom: 12 }}>
          Vow<span className="text-[#C8A96E]">Connect</span>
        </div>
        {[
          { href: '/vendors',      label: '🔍  Browse Vendors'   },
          { href: '#categories',   label: '🎀  All Categories'   },
          { href: '#how-it-works', label: '📋  How It Works'     },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ display: 'block', padding: '13px 16px', borderRadius: 12, color: '#2C1A0E', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
            {item.label}
          </Link>
        ))}
        <div style={{ height: 1, background: '#EBE0C0', margin: '12px 0' }} />
        <Link href="/login" style={{ display: 'block', padding: '13px 16px', borderRadius: 12, color: '#2C1A0E', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
          👤  Sign In
        </Link>
        <Link href="/register" style={{ display: 'block', padding: '13px 16px', borderRadius: 14, background: 'linear-gradient(135deg,#C9941A,#A87315)', color: 'white', fontWeight: 700, fontSize: 15, textAlign: 'center', textDecoration: 'none', marginTop: 8 }}>
          ✨  Get Started Free
        </Link>
        <Link href="/register?role=vendor" style={{ display: 'block', padding: '13px 16px', borderRadius: 14, border: '1.5px solid #EBE0C0', color: '#5E3D1A', fontWeight: 600, fontSize: 14, textAlign: 'center', textDecoration: 'none', marginTop: 6 }}>
          🧣  List My Business
        </Link>
        <div style={{ marginTop: 'auto', color: '#8A7560', fontSize: 11, textAlign: 'center' }}>
          Nigeria's #1 Wedding Vendor Marketplace
        </div>
      </div>
    </>
  )
}

/* Admin mobile header + drawer */
const ADMIN_ITEMS = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/vendors',   icon: '🧣', label: 'Vendors'   },
  { href: '/admin/users',     icon: '👥', label: 'Users'     },
  { href: '/admin/bookings',  icon: '📅', label: 'Bookings'  },
  { href: '/admin/reports',   icon: '🚨', label: 'Reports'   },
  { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
  { href: '/admin/system',    icon: '⚙️', label: 'Settings'  },
  { href: '/admin/logs',      icon: '🗂️', label: 'Audit Log' },
]

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      <div className="h-14 md:hidden" />
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden"
        style={{ height: 56, background: '#12121a', borderBottom: '1px solid #2a2a3d' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '100%' }}>
          <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VowConnect Admin
          </span>
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 22, cursor: 'pointer' }}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </header>
      {open && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={() => setOpen(false)} />
          <div className="fixed top-14 left-0 bottom-0 w-56 z-50 md:hidden overflow-y-auto"
            style={{ background: '#12121a', borderRight: '1px solid #2a2a3d' }}>
            {ADMIN_ITEMS.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px', fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#f0f0f8' : '#6b6b8a', background: active ? 'rgba(168,85,247,0.1)' : 'none', borderLeft: active ? '2px solid #a855f7' : '2px solid transparent', textDecoration: 'none' }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}
                </Link>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
