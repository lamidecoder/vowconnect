// src/lib/stripe.ts
// Stripe handles international payments (UK, US, EU, CA, AU etc.)
// Paystack handles Africa (NG, GH, KE, ZA)
// Logic: detect vendor country â†’ route to correct gateway
// Docs: https://stripe.com/docs
// Install: npm install stripe @stripe/stripe-js

import Stripe from 'stripe'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY ?? ''
export const stripe = (STRIPE_KEY && !STRIPE_KEY.includes('xxx'))
  ? new Stripe(STRIPE_KEY, { apiVersion: '2025-02-24.acacia', typescript: true })
  : null

export const STRIPE_PLANS: Record<string, { name: string; monthlyPriceId: string; price: number; currency: string }> = {
  pro: {
    name:           'Pro',
    monthlyPriceId: process.env.STRIPE_PRO_PRICE_ID    ?? 'price_pro_monthly',
    price:          8,    // Â£8 / $10 / â‚¬9
    currency:       'gbp',
  },
  premium: {
    name:           'Premium',
    monthlyPriceId: process.env.STRIPE_PREMIUM_PRICE_ID ?? 'price_premium_monthly',
    price:          20,   // Â£20 / $25 / â‚¬22
    currency:       'gbp',
  },
}

// Countries served by Stripe (not Paystack)
export const STRIPE_COUNTRIES = new Set([
  'GB','US','CA','AU','NZ','IE','FR','DE','NL','BE','SE','NO','DK','FI',
  'AT','CH','IT','ES','PT','PL','CZ','HU','RO','GR','BG','HR','SI','SK',
  'LT','LV','EE','LU','MT','CY','JP','SG','HK','MY','TH','IN','BR','MX',
  'AE','SA','QA','KW','BH',
])

// Countries served by Paystack
export const PAYSTACK_COUNTRIES = new Set(['NG','GH','KE','ZA','CI','SN','RW','TZ','UG','EG'])

export function getPaymentGateway(countryCode: string): 'stripe' | 'paystack' | 'none' {
  if (PAYSTACK_COUNTRIES.has(countryCode)) return 'paystack'
  if (STRIPE_COUNTRIES.has(countryCode))  return 'stripe'
  return 'none' // show "contact us" for unsupported regions
}

export function getCurrencyForCountry(country: string): string {
  const map: Record<string, string> = {
    NG: 'NGN', GH: 'GHS', KE: 'KES', ZA: 'ZAR',
    GB: 'GBP', US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
    EU: 'EUR', FR: 'EUR', DE: 'EUR', NL: 'EUR', BE: 'EUR',
    IE: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR',
    JP: 'JPY', SG: 'SGD', HK: 'HKD',
    AE: 'AED', SA: 'SAR',
    IN: 'INR', BR: 'BRL', MX: 'MXN',
  }
  return map[country] ?? 'USD'
}

export function getCurrencySymbol(currency: string): string {
  const map: Record<string, string> = {
    NGN: 'â‚¦', GBP: 'Â£', USD: '$', EUR: 'â‚¬', CAD: 'CA$',
    AUD: 'A$', GHS: 'GHâ‚µ', KES: 'KSh', ZAR: 'R',
    JPY: 'Â¥', SGD: 'S$', AED: 'AED', SAR: 'SAR', INR: 'â‚¹',
  }
  return map[currency] ?? currency
}

// Plan prices per currency
export const PLAN_PRICES: Record<string, Record<string, number>> = {
  pro: {
    NGN: 8000, GBP: 8, USD: 10, EUR: 9,
    CAD: 13, AUD: 15, GHS: 100, KES: 1300, ZAR: 180,
  },
  premium: {
    NGN: 20000, GBP: 20, USD: 25, EUR: 22,
    CAD: 33, AUD: 38, GHS: 250, KES: 3300, ZAR: 460,
  },
}

export async function createStripeCheckout(params: {
  email: string
  plan: string
  vendorId: string
  userId: string
  currency: string
  successUrl: string
  cancelUrl: string
}) {
  const planConfig = STRIPE_PLANS[params.plan]
  if (!planConfig) throw new Error('Invalid plan')

  const amount = PLAN_PRICES[params.plan][params.currency.toUpperCase()] ?? PLAN_PRICES[params.plan].USD

  if (!stripe) throw new Error('Stripe not configured')
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode:                 'subscription',
    customer_email:       params.email,
    line_items: [{
      price_data: {
        currency:       params.currency.toLowerCase(),
        unit_amount:    amount * 100,
        recurring:      { interval: 'month' },
        product_data:   { name: `VowConnect ${planConfig.name}`, description: `Monthly ${planConfig.name} vendor subscription` },
      },
      quantity: 1,
    }],
    metadata:   { vendorId: params.vendorId, plan: params.plan, userId: params.userId },
    success_url: params.successUrl,
    cancel_url:  params.cancelUrl,
  })

  return session
}

export async function createStripeDepositSession(params: {
  email: string
  amount: number          // actual deposit amount
  currency: string
  bookingId: string
  vendorName: string
  eventType: string
  successUrl: string
  cancelUrl: string
}) {
  if (!stripe) throw new Error('Stripe not configured')
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode:                 'payment',
    customer_email:       params.email,
    line_items: [{
      price_data: {
        currency:     params.currency.toLowerCase(),
        unit_amount:  params.amount * 100,
        product_data: {
          name:        `Booking Deposit â€” ${params.vendorName}`,
          description: `${params.eventType} event deposit`,
        },
      },
      quantity: 1,
    }],
    metadata:   { bookingId: params.bookingId, type: 'deposit' },
    success_url: params.successUrl,
    cancel_url:  params.cancelUrl,
  })

  return session
}

