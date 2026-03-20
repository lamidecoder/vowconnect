'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const saved = localStorage.getItem('nv-theme') as Theme
    const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const t = saved ?? pref
    setTheme(t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }, [])

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('nv-theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useContext(ThemeCtx)
  return (
    <button onClick={toggle} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-[rgba(10,10,10,0.06)] dark:hover:bg-[rgba(255,255,255,0.06)] ${className}`}
      aria-label="Toggle theme" title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
      {theme === 'dark'
        ? <span className="text-[#C8A96E] text-base">☀</span>
        : <span className="text-[rgba(10,10,10,0.5)] text-base">◑</span>
      }
    </button>
  )
}
