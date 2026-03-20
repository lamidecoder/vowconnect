import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, setSessionCookie } from '@/lib/auth'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { validateEmail, LIMITS, sanitise } from '@/lib/validate'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimitResponse(req, 'login', RATE_LIMITS.login)
    if (rl) return rl

    const body     = await req.json()
    const email    = validateEmail(body.email)
    const password = sanitise(body.password)

    if (!email || !password)
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    if (password.length < LIMITS.password.min || password.length > LIMITS.password.max)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    let user
    try {
      user = await prisma.user.findUnique({ where: { email } })
    } catch (dbErr: any) {
      const msg = dbErr.message ?? ''
      if (
        msg.includes('connect') || msg.includes('ECONNREFUSED') ||
        msg.includes('does not exist') || msg.includes('P1001') || msg.includes('P1003')
      ) {
        return NextResponse.json({
          error: 'Database not connected. Run: npx prisma db push && npm run db:seed',
        }, { status: 503 })
      }
      throw dbErr
    }

    if (!user || !user.passwordHash)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    if (!user.isActive)
      return NextResponse.json({ error: 'Account suspended. Contact support.' }, { status: 403 })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    // Determine redirect destination
    const next        = body.next ?? ''
    const defaultDest =
      user.role === 'SUPER_ADMIN' ? '/admin/dashboard' :
      user.role === 'VENDOR'      ? '/vendor/dashboard' :
                                    '/client/dashboard'
    const dest = (next && next.startsWith('/') && !next.startsWith('//')) ? next : defaultDest

    const token = signToken({
      userId: user.id,
      email:  user.email,
      role:   user.role,
      name:   user.name,
    })

    // Return JSON with cookie — client does window.location.replace
    const res = NextResponse.json({
      ok:   true,
      dest,
      role: user.role,
      name: user.name,
    })
    setSessionCookie(res, token)
    return res

  } catch (err: any) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
