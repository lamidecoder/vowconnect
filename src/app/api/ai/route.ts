import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

// Rate limit: simple in-memory (use Redis in production)
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20
const hits: Map<string, { count: number; reset: number }> = new Map()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const rec = hits.get(userId)
  if (!rec || now > rec.reset) {
    hits.set(userId, { count: 1, reset: now + WINDOW_MS })
    return true
  }
  if (rec.count >= MAX_PER_WINDOW) return false
  rec.count++
  return true
}

const SYSTEM_PROMPTS: Record<string, string> = {
  bio: `You are a professional copywriter specialising in Nigerian wedding vendors. 
Write compelling, warm, professional vendor bios for the VowConnect marketplace. 
Bios should be 2-3 sentences, highlight their specialty and location, use culturally resonant language where appropriate, and end with a call to action. 
Keep it under 300 characters. Never use generic phrases like "passionate professional". Be specific.
Respond with ONLY the bio text — no quotes, no explanation, no preamble.`,

  smart_reply: `You are a Nigerian wedding vendor assistant on VowConnect. 
Draft a professional, warm reply to a client message. 
Be responsive to their specific question or concern. Use appropriate warmth — this is a cultural industry.
Keep replies concise (2-4 sentences). Be helpful, professional, and genuine.
Respond with ONLY the draft reply — no quotes, no explanation, no preamble.`,

  budget: `You are a Nigerian wedding budget advisor on VowConnect.
Analyse a couple's wedding budget breakdown and give specific, actionable advice.
Know that Nigerian/African weddings typically prioritise: catering (25-35%), decor/venue (20-30%), photography/video (10-15%), attire/gele/makeup (10-15%), music/entertainment (5-10%).
UK/US/Canada diaspora weddings often have higher photography budgets.
Be warm but honest. Flag if they're under-spending on something important or over-spending relative to their total.
Keep advice to 3-4 sentences. Be specific with percentages and amounts.
Respond with ONLY the advice text — no headers, no bullet points, no preamble.`,

  review_summary: `You are summarising vendor reviews for VowConnect, a Nigerian wedding marketplace.
Write a 2-sentence summary of what clients love about this vendor, based on the review snippets provided.
Be specific — name actual things clients mention. Use warm but professional language.
If reviews are mixed, acknowledge the positives while noting any consistent concerns.
Respond with ONLY the summary — no quotes, no explanation.`,
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'SUPER_ADMIN']).catch(() => null)
    // Allow unauthenticated for review_summary (public vendor profiles)
    const body = await req.json()
    const { mode, prompt } = body

    if (!mode || !prompt) return NextResponse.json({ error: 'mode and prompt required' }, { status: 400 })
    if (!SYSTEM_PROMPTS[mode]) return NextResponse.json({ error: 'invalid mode' }, { status: 400 })

    // Rate limit authenticated users
    if (auth && !('error' in auth)) {
      if (!checkRateLimit(auth.userId)) {
        return NextResponse.json({ error: 'Rate limit reached — try again in a minute' }, { status: 429 })
      }
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      return NextResponse.json({ error: 'AI not configured — add ANTHROPIC_API_KEY to .env.local' }, { status: 503 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // Fast + cheap for inline features
        max_tokens: 400,
        system: SYSTEM_PROMPTS[mode],
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json({ error: 'AI service error' }, { status: 502 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    return NextResponse.json({ result: text.trim() })

  } catch (err: any) {
    console.error('AI route error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
