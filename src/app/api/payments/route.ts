import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { initializeTransaction, generateReference, PLANS, type Plan } from '@/lib/paystack'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY.includes('xxx')) {
      return NextResponse.json({ error: 'Paystack is not configured. Add PAYSTACK_SECRET_KEY to .env.local' }, { status: 503 })
    }

    const { plan } = await req.json() as { plan: Plan }

    if (!PLANS[plan] || plan === 'free') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, email: true },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
    if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

    const reference = generateReference('GC-SUB')
    const planInfo  = PLANS[plan]

    const result = await initializeTransaction({
      email:     user.email,
      amount:    planInfo.price,
      reference,
      metadata:  { vendorId: vendor.id, plan, userId: auth.userId },
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify?ref=${reference}`,
    })

    if (!result.status) {
      return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
    }

    return NextResponse.json({
      authorizationUrl: result.data.authorization_url,
      reference,
      plan,
      amount: planInfo.price,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
