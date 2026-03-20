import { NextRequest, NextResponse } from 'next/server'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { validateEmail, validateStr, LIMITS } from '@/lib/validate'
import { prisma } from '@/lib/prisma'
import { createSessionCookie, setSessionCookie } from '@/lib/auth'
import { sendEmailVerification, sendWelcomeClient, sendWelcomeVendor } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'

export async function POST(req: NextRequest) {
  const { name, email, password, phone, role } = await req.json()
  if (!name || !email || !password)
    return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
  if (password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const normalEmail = email.toLowerCase().trim()

  const existing = await prisma.user.findUnique({ where: { email: normalEmail } })
  if (existing)
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })

  const isSuperAdmin  = normalEmail === (process.env.SUPER_ADMIN_EMAIL ?? '').toLowerCase()
  const assignedRole  = isSuperAdmin ? 'SUPER_ADMIN' : (role === 'VENDOR' ? 'VENDOR' : 'CLIENT')

  // Email verification token (expires in 24h)
  const verifyToken  = crypto.randomBytes(32).toString('hex')
  const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email:             normalEmail,
      passwordHash,
      phone:             phone ?? null,
      role:              assignedRole,
      // Super admin and demo users skip email verification
      emailVerified:     isSuperAdmin,
      emailVerifyToken:  isSuperAdmin ? null : verifyToken,
      emailVerifyExpiry: isSuperAdmin ? null : verifyExpiry,
    },
  })

  // Send verification email (don't block registration on failure)
  if (!isSuperAdmin) {
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${verifyToken}`
    sendEmailVerification({ email: normalEmail, name, verifyUrl }).catch(console.error)
  }

  // Also send welcome email
  if (assignedRole === 'CLIENT') {
    sendWelcomeClient({ email: normalEmail, name }).catch(console.error)
  }

  // Log in immediately after register (don't require email verification to use the app)
  const token = createSessionCookie({ userId: user.id, email: user.email, role: user.role, name: user.name })
  const res   = NextResponse.json({ role: user.role, name: user.name }, { status: 201 })
  setSessionCookie(res, token)
  return res
}
