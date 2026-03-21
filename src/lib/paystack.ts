// src/lib/paystack.ts
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? ''
const BASE = 'https://api.paystack.co'

async function paystackRequest(method: string, path: string, body?: any) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!data.status) throw new Error(data.message ?? 'Paystack error')
  return data.data
}

// ── Subaccounts ──────────────────────────────────────────────
export async function createSubaccount(params: {
  businessName: string
  bankCode: string
  accountNumber: string
  percentageCharge: number // platform commission %
  description?: string
  primaryContactEmail?: string
  primaryContactPhone?: string
}) {
  return paystackRequest('POST', '/subaccount', {
    business_name:          params.businessName,
    bank_code:              params.bankCode,
    account_number:         params.accountNumber,
    percentage_charge:      params.percentageCharge,
    description:            params.description,
    primary_contact_email:  params.primaryContactEmail,
    primary_contact_phone:  params.primaryContactPhone,
    settlement_bank:        params.bankCode,
  })
}

export async function updateSubaccount(subaccountCode: string, params: {
  percentageCharge?: number
  isActive?: boolean
}) {
  return paystackRequest('PUT', `/subaccount/${subaccountCode}`, {
    percentage_charge: params.percentageCharge,
    active:            params.isActive,
  })
}

export async function getSubaccount(subaccountCode: string) {
  return paystackRequest('GET', `/subaccount/${subaccountCode}`)
}

// ── Bank list ────────────────────────────────────────────────
export async function getBanks(country: 'nigeria' | 'ghana' | 'kenya' = 'nigeria') {
  const data = await paystackRequest('GET', `/bank?country=${country}&per_page=100`)
  return Array.isArray(data) ? data : data?.data ?? []
}

// ── Verify account number ────────────────────────────────────
export async function verifyAccountNumber(accountNumber: string, bankCode: string) {
  return paystackRequest('GET', `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`)
}

// ── Initialize transaction with split ───────────────────────
export async function initializeTransaction(params: {
  email: string
  amount: number // in kobo (multiply NGN by 100)
  currency: string
  reference: string
  subaccountCode: string
  transactionCharge: number // platform fee in kobo
  callbackUrl?: string
  metadata?: Record<string, any>
}) {
  return paystackRequest('POST', '/transaction/initialize', {
    email:              params.email,
    amount:             params.amount,
    currency:           params.currency,
    reference:          params.reference,
    subaccount:         params.subaccountCode,
    transaction_charge: params.transactionCharge,
    bearer:             'subaccount', // vendor bears Paystack fees
    callback_url:       params.callbackUrl,
    metadata:           params.metadata,
  })
}

// ── Verify transaction ───────────────────────────────────────
export async function verifyTransaction(reference: string) {
  return paystackRequest('GET', `/transaction/verify/${reference}`)
}

// ── Transfer (for escrow release) ───────────────────────────
export async function transferToSubaccount(params: {
  amount: number // in kobo
  recipient: string // recipient code
  reason: string
  reference: string
}) {
  return paystackRequest('POST', '/transfer', {
    source:    'balance',
    amount:    params.amount,
    recipient: params.recipient,
    reason:    params.reason,
    reference: params.reference,
  })
}

// ── Create transfer recipient from subaccount ────────────────
export async function createTransferRecipient(params: {
  name: string
  accountNumber: string
  bankCode: string
  currency?: string
}) {
  return paystackRequest('POST', '/transferrecipient', {
    type:           'nuban',
    name:           params.name,
    account_number: params.accountNumber,
    bank_code:      params.bankCode,
    currency:       params.currency ?? 'NGN',
  })
}

// ── Calculate split amounts ──────────────────────────────────
export function calculateSplit(amountNaira: number, commissionPercent = 3) {
  const amountKobo      = Math.round(amountNaira * 100)
  const commissionKobo  = Math.round(amountKobo * (commissionPercent / 100))
  const vendorKobo      = amountKobo - commissionKobo
  const paystackFeeKobo = Math.min(Math.round(amountKobo * 0.015), 200000) // 1.5% capped at ₦2000

  return {
    totalKobo:      amountKobo,
    commissionKobo,
    vendorKobo,
    paystackFeeKobo,
    totalNaira:     amountNaira,
    commissionNaira: commissionKobo / 100,
    vendorNaira:     vendorKobo / 100,
  }
}

// ── Generate unique reference ────────────────────────────────
export function generateReference(prefix = 'VC') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}