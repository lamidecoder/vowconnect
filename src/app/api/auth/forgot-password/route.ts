import { NextRequest, NextResponse } from 'next/server'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { validateEmail } from '@/lib/validate'
import { prisma } from '@/lib/prisma'
import { sendPasswordReset } from '@/lib/email'
import crypto from 'node:crypto'

export async function POST(req: NextRequest) {
  const rl = rateLimitResponse(req, 'forgot-password', RATE_LIMITS.forgotPassword)
  if (rl) return rl

  const body  = await req.json()
  const email = validateEmail(body.email)
  if (!email) return NextResponse.json({ success: true }) // silent — don't reveal

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ success: true })

  // Invalidate any existing tokens
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  // Create new token (expires in 1 hour)
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`

  try {
    await sendPasswordReset({ email: user.email, name: user.name, resetUrl })
  } catch (e) {
    console.error('Failed to send reset email:', e)
  }

  return NextResponse.json({ success: true })
}
