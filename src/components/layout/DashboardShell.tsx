'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeProvider'
import { useState } from 'react'

interface NavItem { href: string; label: string; icon: string }

interface Props {
  role:      'vendor' | 'client' | 'admin'
  userName:  string
  navItems:  NavItem[]
  children:  React.ReactNode
}

const ROLE_COLORS: Record<string, string> = {
  vendor: '#C8A96E',
  client: '#C8A96E',
  admin:  '#a78bfa',
}

export default function DashboardShell({ role, userName, navItems, children }: Props) {
  const pathname  = usePathname()
  const [open,    setOpen]    = useState(false)
  const isAdmin   = role === 'admin'
  const accent    = ROLE_COLORS[role] ?? '#C8A96E'

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.replace('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{background:'var(--bg)'}}>

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 flex-shrink-0 border-r overflow-hidden"
        style={{
          background: isAdmin ? '#0a0a0a' : 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b flex items-center gap-2" style={{borderColor:'var(--border)'}}>
          <Link href="/" className="flex items-center gap-0.5">
            <span className="font-display text-lg" style={{color: isAdmin ? '#fff' : 'var(--text)'}}>Vow</span>
            <span className="font-display text-lg" style={{color: accent}}>Connect</span>
          </Link>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b" style={{borderColor:'var(--border)'}}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{background:`linear-gradient(135deg,${accent},#8B6914)`}}>
              {userName?.charAt(0)?.toUpperCase() || role.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate" style={{color: isAdmin ? '#fff' : 'var(--text)'}}>{userName || 'User'}</div>
              <div className="text-[10px] capitalize font-bold uppercase tracking-wider" style={{color: accent}}>{role}</div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map(item => {
            const active = pathname === item.href ||
              (item.href !== `/${role}/dashboard` && item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all"
                style={{
                  background:  active ? `${accent}18` : 'transparent',
                  color:       active ? accent : isAdmin ? 'rgba(255,255,255,0.45)' : 'var(--text-muted)',
                  borderLeft:  active ? `2px solid ${accent}` : '2px solid transparent',
                }}>
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-2 py-3 border-t" style={{borderColor:'var(--border)'}}>
          <button onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium transition-all hover:opacity-80"
            style={{color: isAdmin ? 'rgba(255,255,255,0.3)' : 'var(--text-faint)'}}>
            <span className="text-base w-5 text-center">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b"
        style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-display text-lg" style={{color:'var(--text)'}}>Vow</span>
          <span className="font-display text-lg" style={{color:accent}}>Connect</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen(o => !o)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{background:'var(--bg-subtle)'}}>
            <span className="text-lg">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0" style={{background:'rgba(0,0,0,0.5)'}}/>
          <div className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r overflow-hidden"
            style={{background:'var(--bg-card)', borderColor:'var(--border)'}}
            onClick={e => e.stopPropagation()}>
            <div className="px-4 py-4 pt-16 border-b flex items-center gap-3" style={{borderColor:'var(--border)'}}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                style={{background:`linear-gradient(135deg,${accent},#8B6914)`}}>
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{color:'var(--text)'}}>{userName || 'User'}</div>
                <div className="text-[10px] uppercase font-bold" style={{color:accent}}>{role}</div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2">
              {navItems.map(item => {
                const active = pathname === item.href ||
                  (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-sm font-medium"
                    style={{
                      background: active ? `${accent}18` : 'transparent',
                      color:      active ? accent : 'var(--text-muted)',
                      borderLeft: active ? `2px solid ${accent}` : '2px solid transparent',
                    }}>
                    <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="px-2 py-3 border-t" style={{borderColor:'var(--border)'}}>
              <button onClick={signOut}
                className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-sm"
                style={{color:'var(--text-faint)'}}>
                <span className="text-lg w-6 text-center">🚪</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto md:pt-0 pt-14">
          {children}
        </div>
      </main>
    </div>
  )
}