'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeProvider'

interface NavItem {
  href:   string
  label:  string
  icon:   string
  badge?: number
}

interface Props {
  role:     'vendor' | 'client' | 'admin'
  userName: string
  navItems: NavItem[]
  children: React.ReactNode
}

export default function DashboardShell({ role, userName, navItems, children }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    setSigningOut(true)
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.replace('/login')
  }

  const isAdmin = role === 'admin'

  return (
    <div className="min-h-screen flex" style={{background:'var(--bg)'}}>
      {/* Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 min-h-screen sticky top-0 border-r z-20"
        style={{
          background:   isAdmin ? '#0a0a0a' : 'var(--bg-card)',
          borderColor:  isAdmin ? 'rgba(255,255,255,0.06)' : 'var(--border)',
        }}
      >
        {/* Logo + user */}
        <div className="p-6 border-b" style={{borderColor: isAdmin ? 'rgba(255,255,255,0.06)' : 'var(--border)'}}>
          <Link href="/" className="font-display text-xl" style={{color: isAdmin ? '#fff' : 'var(--text)'}}>
            Vow<span style={{color:'#C8A96E'}}>Connect</span>
          </Link>
          {isAdmin && (
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5" style={{color:'#C8A96E'}}>Admin Panel</div>
          )}
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{color: isAdmin ? '#fff' : 'var(--text)'}}>{userName}</div>
              <div className="text-xs capitalize" style={{color: isAdmin ? 'rgba(255,255,255,0.35)' : 'var(--text-muted)'}}>
                {role}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== `/${role}/dashboard` && item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? 'rgba(200,169,110,0.15)' : 'transparent',
                  color:      active ? '#C8A96E' : isAdmin ? 'rgba(255,255,255,0.45)' : 'var(--text-muted)',
                }}>
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{background:'#C8A96E'}}>{item.badge}</span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t space-y-0.5" style={{borderColor: isAdmin ? 'rgba(255,255,255,0.06)' : 'var(--border)'}}>
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs" style={{color: isAdmin ? 'rgba(255,255,255,0.3)' : 'var(--text-faint)'}}>Theme</span>
            <ThemeToggle />
          </div>
          <button onClick={signOut} disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{color: isAdmin ? 'rgba(255,255,255,0.35)' : 'var(--text-muted)'}}>
            <span className="text-base w-5 text-center">↩</span>
            <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b"
          style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
          <Link href="/" className="font-display text-lg" style={{color:'var(--text)'}}>
            Vow<span style={{color:'#C8A96E'}}>Connect</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={signOut}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{background:'rgba(200,169,110,0.12)', color:'#C8A96E'}}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}