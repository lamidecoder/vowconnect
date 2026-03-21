// src/app/api/vendor/stripe-connect/route.ts
// Stripe Connect onboarding for international vendors (UK, US, CA etc)
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vowconnect.com'

// GET — get vendor's Stripe Connect status
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR'])
  if ('error' in auth) return auth.error

  const vendor = await prisma.vendor.findUnique({
    where: { userId: auth.userId },
    select: {
      stripeAccountId:  true,
      stripeOnboarded:  true,
      country:          true,
      businessName:     true,
    },
  })

  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  return NextResponse.json({
    connected:  !!vendor.stripeAccountId,
    onboarded:  vendor.stripeOnboarded ?? false,
    country:    vendor.country,
  })
}

// POST — create Stripe Connect account + onboarding link
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR'])
  if ('error' in auth) return auth.error

  const stripe = (await import('@/lib/stripe')).stripe
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const vendor = await prisma.vendor.findUnique({
    where: { userId: auth.userId },
    include: { user: { select: { email: true, name: true } } },
  })

  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  try {
    let accountId = vendor.stripeAccountId

    // Create Stripe Connect account if not exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type:         'express',
        email:        vendor.user.email,
        country:      vendor.country ?? 'GB',
        capabilities: {
          card_payments: { requested: true },
          transfers:     { requested: true },
        },
        business_profile: {
          name: vendor.businessName,
          url:  `${APP}/vendors/${vendor.id}`,
        },
        metadata: {
          vendorId: vendor.id,
          platform: 'vowconnect',
        },
      })
      accountId = account.id

      await prisma.vendor.update({
        where: { id: vendor.id },
        data:  { stripeAccountId: accountId, stripeOnboarded: false },
      })
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account:     accountId,
      refresh_url: `${APP}/vendor/bank?stripe=refresh`,
      return_url:  `${APP}/vendor/bank?stripe=success`,
      type:        'account_onboarding',
    })

    return NextResponse.json({ onboardingUrl: accountLink.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH — check if vendor completed Stripe onboarding
export async function PATCH(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR'])
  if ('error' in auth) return auth.error

  const stripe = (await import('@/lib/stripe')).stripe
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const vendor = await prisma.vendor.findUnique({
    where: { userId: auth.userId },
    select: { stripeAccountId: true, id: true },
  })

  if (!vendor?.stripeAccountId) {
    return NextResponse.json({ onboarded: false })
  }

  try {
    const account = await stripe.accounts.retrieve(vendor.stripeAccountId)
    const onboarded = account.details_submitted && account.charges_enabled

    if (onboarded) {
      await prisma.vendor.update({
        where: { id: vendor.id },
        data:  { stripeOnboarded: true },
      })
    }

    return NextResponse.json({ onboarded, chargesEnabled: account.charges_enabled })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}