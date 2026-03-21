// src/app/api/vendor/bank/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createSubaccount, verifyAccountNumber, getBanks, generateReference
} from '@/lib/paystack'

// GET /api/vendor/bank — get vendor's bank details
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const vendor = await prisma.vendor.findUnique({
    where: { userId: auth.userId },
    select: {
      id: true,
      paystackSubaccountCode: true,
      bankName: true,
      bankCode: true,
      accountNumber: true,
      accountName: true,
      bankCountry: true,
      bankVerified: true,
    },
  })

  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  return NextResponse.json(vendor)
}

// POST /api/vendor/bank — save bank details & create Paystack subaccount
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR'])
  if ('error' in auth) return auth.error

  const { bankCode, bankName, accountNumber, bankCountry } = await req.json()

  if (!bankCode || !accountNumber) {
    return NextResponse.json({ error: 'Bank code and account number required' }, { status: 400 })
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: auth.userId },
    include: { user: { select: { name: true, email: true, phone: true } } },
  })
  if (!vendor) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })

  // 1. Verify account number with Paystack
  let accountName = ''
  try {
    const verified = await verifyAccountNumber(accountNumber, bankCode)
    accountName = verified.account_name
  } catch (e) {
    return NextResponse.json({ error: 'Could not verify account number. Please check and try again.' }, { status: 400 })
  }

  // 2. Create Paystack subaccount
  let subaccountCode = vendor.paystackSubaccountCode
  try {
    const commissionPercent = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 3)
    const subaccount = await createSubaccount({
      businessName:        vendor.businessName,
      bankCode,
      accountNumber,
      percentageCharge:    commissionPercent,
      description:         `VowConnect vendor: ${vendor.businessName}`,
      primaryContactEmail: vendor.user.email,
      primaryContactPhone: vendor.user.phone ?? undefined,
    })
    subaccountCode = subaccount.subaccount_code
  } catch (e: any) {
    return NextResponse.json({ error: `Payment setup failed: ${e.message}` }, { status: 400 })
  }

  // 3. Save to database
  const updated = await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      paystackSubaccountCode: subaccountCode,
      bankName,
      bankCode,
      accountNumber,
      accountName,
      bankCountry: bankCountry ?? 'NG',
      bankVerified: true,
    },
  })

  return NextResponse.json({
    success: true,
    accountName,
    subaccountCode,
    message: 'Bank account verified and payment account created successfully',
  })
}

// GET /api/vendor/bank/banks?country=nigeria — list banks