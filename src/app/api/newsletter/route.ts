import { NextRequest, NextResponse } from 'next/server'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimitResponse(req, 'newsletter', RATE_LIMITS.newsletter)
    if (rl) return rl


  const { email, name } = await req.json()
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Valid email required' }, { status: 400 })

  // Store as a user preference / newsletter sub - using SystemSetting as a simple KV store
  // In production swap for a proper newsletter table or Mailchimp/Resend audience
  await prisma.systemSetting.upsert({
    where: { key: `newsletter:${email.toLowerCase()}` },
    update: { value: name ?? email },
    create: { key: `newsletter:${email.toLowerCase()}`, value: name ?? email },
  })

  return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('newsletter error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
