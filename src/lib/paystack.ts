// src/lib/paystack.ts
// Paystack is Nigeria's #1 payment gateway
// Docs: https://paystack.com/docs
// Install: npm install axios  (or use native fetch)

const SECRET = process.env.PAYSTACK_SECRET_KEY ?? ''
const BASE   = 'https://api.paystack.co'

type PaystackHeaders = {
  Authorization: string
  'Content-Type': string
}

function headers(): PaystackHeaders {
  return {
    Authorization: `Bearer ${SECRET}`,
    'Content-Type': 'application/json',
  }
}

export type Plan = 'free' | 'pro' | 'premium'

export const PLANS: Record<Plan, { name: string; price: number; features: string[] }> = {
  free: {
    name:     'Free',
    price:    0,
    features: ['5 portfolio images', 'Basic listing', 'Booking requests', 'WhatsApp contact button'],
  },
  pro: {
    name:     'Pro',
    price:    8000,
    features: ['10 portfolio images', '⭐ Featured badge', 'Priority in search results', 'Analytics dashboard', 'Booking analytics'],
  },
  premium: {
    name:     'Premium',
    price:    20000,
    features: ['Unlimited portfolio images', '✓ Verified badge', 'Top of search results', 'Priority support', 'All Pro features'],
  },
}

export async function initializeTransaction(params: {
  email: string
  amount: number           // In Naira (will be converted to kobo)
  reference: string
  metadata?: Record<string, unknown>
  callbackUrl?: string
}) {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email:        params.email,
      amount:       params.amount * 100,   // Paystack uses kobo
      reference:    params.reference,
      callback_url: params.callbackUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
      metadata:     params.metadata ?? {},
    }),
  })
  return res.json()
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${BASE}/transaction/verify/${reference}`, {
    headers: headers(),
  })
  return res.json()
}

export async function createCustomer(params: { email: string; name: string; phone?: string }) {
  const [first, ...rest] = params.name.split(' ')
  const res = await fetch(`${BASE}/customer`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email:      params.email,
      first_name: first,
      last_name:  rest.join(' ') || first,
      phone:      params.phone,
    }),
  })
  return res.json()
}

export function generateReference(prefix = 'GC') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}
