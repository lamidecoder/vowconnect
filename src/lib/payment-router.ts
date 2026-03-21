// src/lib/payment-router.ts
// Smart payment router — picks Paystack or Stripe based on vendor country
// Users never see either name — everything is "Secure Payment" on the frontend

import { calculateSplit, generateReference } from './paystack'

export type PaymentProvider = 'paystack' | 'stripe'

// Countries supported by Paystack for vendor payouts
const PAYSTACK_COUNTRIES = ['NG', 'GH', 'KE', 'ZA', 'CI', 'EG', 'RW', 'TZ', 'UG', 'ZM']

// Countries that need Stripe Connect for vendor payouts
const STRIPE_COUNTRIES = ['GB', 'US', 'CA', 'AU', 'NZ', 'DE', 'FR', 'NL', 'IE', 'SE', 'NO', 'DK', 'FI', 'BE', 'AT', 'CH', 'IT', 'ES', 'PT']

export function getPaymentProvider(vendorCountry: string): PaymentProvider {
  if (PAYSTACK_COUNTRIES.includes(vendorCountry.toUpperCase())) return 'paystack'
  if (STRIPE_COUNTRIES.includes(vendorCountry.toUpperCase())) return 'stripe'
  return 'stripe' // default to Stripe for any unknown country
}

export function getPaymentFeePercent(provider: PaymentProvider): number {
  return provider === 'paystack' ? 1.5 : 2.9
}

export function getCurrencyForCountry(country: string): string {
  const map: Record<string, string> = {
    NG: 'NGN', GH: 'GHS', KE: 'KES', ZA: 'ZAR',
    GB: 'GBP', US: 'USD', CA: 'CAD', AU: 'AUD',
    DE: 'EUR', FR: 'EUR', NL: 'EUR', IE: 'EUR',
    SE: 'SEK', NO: 'NOK', DK: 'DKK', CH: 'CHF',
  }
  return map[country.toUpperCase()] ?? 'USD'
}

export function getCurrencySymbol(currency: string): string {
  const map: Record<string, string> = {
    NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R',
    GBP: '£', USD: '$', CAD: 'CA$', AUD: 'A$',
    EUR: '€', SEK: 'kr', NOK: 'kr', DKK: 'kr', CHF: 'CHF',
  }
  return map[currency.toUpperCase()] ?? '$'
}

export interface PaymentBreakdown {
  bookingAmount:    number
  commissionAmount: number
  paymentFeeAmount: number
  totalAmount:      number
  vendorAmount:     number
  currency:         string
  currencySymbol:   string
  provider:         PaymentProvider
  feePercent:       number
}

export function calculatePaymentBreakdown(
  bookingAmount: number,
  vendorCountry: string,
  commissionPercent = 3
): PaymentBreakdown {
  const provider      = getPaymentProvider(vendorCountry)
  const currency      = getCurrencyForCountry(vendorCountry)
  const symbol        = getCurrencySymbol(currency)
  const feePercent    = getPaymentFeePercent(provider)

  const commission    = Math.round(bookingAmount * (commissionPercent / 100) * 100) / 100
  const paymentFee    = Math.round(bookingAmount * (feePercent / 100) * 100) / 100
  const total         = bookingAmount + commission + paymentFee
  const vendorAmount  = bookingAmount - commission

  return {
    bookingAmount,
    commissionAmount:  commission,
    paymentFeeAmount:  paymentFee,
    totalAmount:       Math.round(total * 100) / 100,
    vendorAmount:      Math.round(vendorAmount * 100) / 100,
    currency,
    currencySymbol:    symbol,
    provider,
    feePercent,
  }
}