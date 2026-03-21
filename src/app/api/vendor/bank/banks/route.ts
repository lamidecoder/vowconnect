// src/app/api/vendor/bank/banks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBanks } from '@/lib/paystack'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country = (searchParams.get('country') ?? 'nigeria') as 'nigeria' | 'ghana' | 'kenya'

  try {
    const banks = await getBanks(country)
    return NextResponse.json(banks)
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not fetch banks' }, { status: 500 })
  }
}