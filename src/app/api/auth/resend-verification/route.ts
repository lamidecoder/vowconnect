import { NextRequest, NextResponse } from 'next/server'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendEmailVerification } from '@/lib/email'
import crypto from 'node:crypto'

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimitResponse(req, 'resend-verification', RATE_LIMITS.resendVerification)
    if (rl) return rl


  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.emailVerified) return NextResponse.json({ error: 'Already verified' }, { status: 400 })

  const verifyToken  = crypto.randomBytes(32).toString('hex')
  const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken: verifyToken, emailVerifyExpiry: verifyExpiry },
  })

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${verifyToken}`

  await sendEmailVerification({ email: user.email, name: user.name, verifyUrl })

  return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('resend-verification error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
