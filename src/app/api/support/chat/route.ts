import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are VowConnect's friendly support assistant — an expert in Nigerian weddings and our vendor marketplace platform.

VowConnect connects brides and families with verified Nigerian wedding vendors (Gele stylists, makeup artists, photographers, videographers, content creators, mobile photographers, decorators, caterers, DJs, cake designers, Aso-ebi tailors, wedding planners) across Nigeria (Lagos, Abuja, Port Harcourt), UK (London, Birmingham), USA (Houston, Atlanta), Canada (Toronto), and Ghana (Accra).

Your role:
- Answer questions about how VowConnect works
- Help users find the right type of vendor for their needs
- Explain booking, payment, and refund processes
- Guide vendors on how to list their services
- Answer questions about Nigerian wedding traditions and planning
- Help users understand pricing (NGN, GBP, USD, CAD, GHS)
- Direct complex issues to human support via ticket

Key facts:
- Free to browse and favourite vendors
- Clients book by requesting on a vendor's profile; vendor accepts/declines
- Vendors can upgrade to Pro plan for featured placement
- Payments go through Stripe (international) or Paystack (Nigeria)
- Disputes: contact support@vowconnect.com or raise a ticket
- Demo accounts: vendor@vowconnect.demo, client@vowconnect.demo (password: demo1234!)

Tone: Warm, professional, knowledgeable. Use light Nigerian cultural warmth (e.g. reference "aso-ebi", "owambe", "traditional ceremony" naturally). Keep answers concise — 2-3 sentences unless a detailed explanation is needed. If you can't help, suggest submitting a support ticket.

Never make up vendor availability, prices, or contact details.`

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json()
    if (!messages || !Array.isArray(messages))
      return NextResponse.json({ error: 'messages required' }, { status: 400 })

    // Trim to last 20 messages to keep context manageable
    const recent = messages.slice(-20)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: recent.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude API error:', err)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? 'Sorry, I had trouble with that. Please try again or submit a support ticket.'

    return NextResponse.json({ reply: text })
  } catch (err: any) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
