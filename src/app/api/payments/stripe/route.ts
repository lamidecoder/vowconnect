import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { createStripeCheckout, getCurrencyForCountry } from '@/lib/stripe'

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vowconnect.com'

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { plan } = await req.json()
  if (!['pro', 'premium'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where:  { id: auth.userId },
    select: { name: true, email: true, country: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
  if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('xxx')) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const currency = getCurrencyForCountry(vendor.country ?? user.country ?? 'US')

  const session = await createStripeCheckout({
    email:      user.email,
    plan,
    vendorId:   vendor.id,
    userId:     auth.userId,
    currency,
    successUrl: `${APP}/vendor/pricing?payment=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl:  `${APP}/vendor/pricing?payment=cancelled`,
  })

  return NextResponse.json({ checkoutUrl: session.url, sessionId: session.id })
}