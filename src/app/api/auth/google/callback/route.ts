import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSessionCookie, setSessionCookie } from '@/lib/auth'
import { sendWelcomeClient, sendWelcomeVendor } from '@/lib/email'

export async function GET(req: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', req.url))
  }
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=google_cancelled', req.url))
  }

  let stateData: { role: string; next: string } = { role: 'CLIENT', next: '' }
  try { stateData = JSON.parse(Buffer.from(state ?? '', 'base64url').toString()) } catch {}

  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/auth/google/callback`

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri:  redirectUri,
      grant_type:    'authorization_code',
    }),
  })
  if (!tokenRes.ok) return NextResponse.redirect(new URL('/login?error=google_failed', req.url))
  const { access_token } = await tokenRes.json()

  // Get user info from Google
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!userRes.ok) return NextResponse.redirect(new URL('/login?error=google_failed', req.url))
  const gUser = await userRes.json() as { sub: string; email: string; name: string; picture?: string }

  if (!gUser.email) return NextResponse.redirect(new URL('/login?error=no_email', req.url))

  // Find or create user
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: gUser.sub }, { email: gUser.email }] },
  })

  const isSuperAdmin = gUser.email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL ?? '').toLowerCase()

  let isNew = false
  if (!user) {
    isNew = true
    const role = isSuperAdmin ? 'SUPER_ADMIN' : (stateData.role === 'VENDOR' ? 'VENDOR' : 'CLIENT')
    user = await prisma.user.create({
      data: {
        email:         gUser.email,
        name:          gUser.name,
        avatar:        gUser.picture ?? null,
        googleId:      gUser.sub,
        emailVerified: true, // Google accounts are pre-verified
        role,
      },
    })
    // Welcome email
    if (role === 'CLIENT') sendWelcomeClient({ email: user.email, name: user.name }).catch(console.error)
  } else {
    // Link Google ID if not yet linked
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: gUser.sub, emailVerified: true, avatar: user.avatar ?? gUser.picture ?? null },
      })
    }
  }

  if (!user.isActive) return NextResponse.redirect(new URL('/login?error=suspended', req.url))

  const token = createSessionCookie({ userId: user.id, email: user.email, role: user.role, name: user.name })
  const dest  = stateData.next && stateData.next.startsWith('/')
    ? stateData.next
    : isNew && user.role === 'VENDOR' ? '/vendor/onboarding'
    : user.role === 'SUPER_ADMIN'     ? '/admin/dashboard'
    : user.role === 'VENDOR'          ? '/vendor/dashboard'
    : '/client/dashboard'

  const res = NextResponse.redirect(new URL(dest, req.url))
  setSessionCookie(res, token)
  return res
}
