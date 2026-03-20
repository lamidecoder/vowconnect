import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { sendVendorUpgraded } from '@/lib/email'
import Stripe from 'stripe'

export const runtime = 'nodejs' }

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes('xxx')) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 400 })
  }
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch (err: any) {
    console.error('Stripe webhook error:', err.message)
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      const { vendorId, plan, userId } = session.metadata ?? {}
      if (!vendorId || !plan) break

      const planExpiry = new Date()
      planExpiry.setMonth(planExpiry.getMonth() + 1)

      await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          plan,
          planExpiry,
          isFeatured:       plan === 'pro' || plan === 'premium',
          isVerified:       plan === 'premium',
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
          stripeSubId:      typeof session.subscription === 'string' ? session.subscription : undefined,
        },
      })

      // Email vendor
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: { user: { select: { name: true, email: true } } },
      })
      if (vendor) {
        sendVendorUpgraded({
          vendorEmail:  vendor.user.email,
          vendorName:   vendor.user.name,
          businessName: vendor.businessName,
          plan,
          planExpiry:   planExpiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        }).catch(console.error)
      }

      await prisma.adminLog.create({
        data: { adminId: userId ?? vendorId, action: 'STRIPE_SUBSCRIPTION', targetType: 'vendor', targetId: vendorId, metadata: { plan, sessionId: session.id } },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await prisma.vendor.updateMany({
        where: { stripeSubId: sub.id },
        data:  { plan: 'free', isFeatured: false, isVerified: false, stripeSubId: null, planExpiry: null },
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : null
      if (customerId) {
        await prisma.vendor.updateMany({
          where: { stripeCustomerId: customerId },
          data:  { plan: 'free', isFeatured: false, isVerified: false },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

