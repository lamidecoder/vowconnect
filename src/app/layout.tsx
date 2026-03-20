import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import SupportChatbot from '@/components/support/SupportChatbot'

export const metadata: Metadata = {
  title: 'VowConnect — Nigerian & Diaspora Wedding Vendor Marketplace',
  description: 'Find and book verified Gele stylists, makeup artists, photographers, content creators and more for your Nigerian wedding — in Lagos, London, New York and beyond.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('nv-theme')||((window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark')})()` }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <SupportChatbot />
        </ThemeProvider>
      </body>
    </html>
  )
}
