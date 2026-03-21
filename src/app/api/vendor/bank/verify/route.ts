// src/app/api/vendor/bank/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { verifyAccountNumber } from '@/lib/paystack'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR'])
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const account = searchParams.get('account')
  const bank    = searchParams.get('bank')

  if (!account || !bank) {
    return NextResponse.json({ error: 'Account and bank required' }, { status: 400 })
  }

  if (account.length !== 10) {
    return NextResponse.json({ error: 'Account number must be 10 digits' }, { status: 400 })
  }

  try {
    const result = await verifyAccountNumber(account, bank)
    return NextResponse.json({
      accountName:   result.account_name,
      accountNumber: result.account_number,
      bankId:        result.bank_id,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }
}