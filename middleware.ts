import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'

// Must be identical to SESSION_SECRET in src/lib/auth.ts
const SESSION_SECRET = 'vc-dev-fallback-secret-not-for-production'
const COOKIE_NAME    = 'gc_session'

const ROLE_PROTECTED: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/vendor(\/|$)/,  roles: ['VENDOR', 'SUPER_ADMIN'] },
  { pattern: /^\/client(\/|$)/,  roles: ['CLIENT', 'PLANNER', 'SUPER_ADMIN'] },
  { pattern: /^\/admin(\/|$)/,   roles: ['SUPER_ADMIN'] },
  { pattern: /^\/planner(\/|$)/, roles: ['PLANNER', 'SUPER_ADMIN'] },
]

const LOGIN_REQUIRED = [
  /^\/vendors\/[^/]+/,
  /^\/map$/,
]

const AUTH_PAGES = ['/login', '/register']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) return NextResponse.next()

  const token = req.cookies.get(COOKIE_NAME)?.value
  let session: { userId: string; role: string } | null = null

  if (token) {
    try {
      session = jwt.verify(token, SESSION_SECRET) as { userId: string; role: string }
    } catch {
      session = null
    }
  }

  // Logged-in users away from auth pages
  if (session && AUTH_PAGES.some(p => pathname.startsWith(p))) {
    const dest =
      session.role === 'SUPER_ADMIN' ? '/admin/dashboard' :
      session.role === 'VENDOR'      ? '/vendor/dashboard' :
                                       '/client/dashboard'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // Role-gated routes
  for (const { pattern, roles } of ROLE_PROTECTED) {
    if (pattern.test(pathname)) {
      if (!session) {
        const url = new URL('/login', req.url)
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
      }
      if (!roles.includes(session.role)) {
        const dest =
          session.role === 'SUPER_ADMIN' ? '/admin/dashboard' :
          session.role === 'VENDOR'      ? '/vendor/dashboard' :
                                           '/client/dashboard'
        return NextResponse.redirect(new URL(dest, req.url))
      }
    }
  }

  // Login-required routes
  for (const pattern of LOGIN_REQUIRED) {
    if (pattern.test(pathname) && !session) {
      const url = new URL('/register', req.url)
      url.searchParams.set('next', pathname)
      url.searchParams.set('prompt', '1')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
