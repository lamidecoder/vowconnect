import { NextRequest, NextResponse } from 'next/server'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { sendContactFormToAdmin } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { name, email, topic, message } = await req.json()
  if (!name || !email || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  try {
    const rl = rateLimitResponse(req, 'contact', RATE_LIMITS.contact)
    if (rl) return rl

    await sendContactFormToAdmin({ name, email, topic: topic ?? 'General', message })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Contact form error:', e)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
