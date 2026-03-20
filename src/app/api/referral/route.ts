import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

function generateCode(name: string): string {
  const base = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}${rand}`
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'PLANNER', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const referrals = await prisma.referral.findMany({
      where: { referrerId: auth.userId },
      include: { referee: { select: { id: true, name: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { name: true } })
    // Ensure they have a referral code
    let myCode = referrals[0]?.code
    if (!myCode) {
      // Create a referral entry as their "personal code"
      const code = generateCode(user?.name ?? 'USER')
      await prisma.referral.create({
        data: { referrerId: auth.userId, code, type: auth.role === 'VENDOR' ? 'vendor' : 'client', status: 'PENDING' },
      })
      myCode = code
    }

    const stats = {
      totalReferrals: referrals.filter(r => r.refereeId).length,
      completed: referrals.filter(r => r.status === 'COMPLETED').length,
      rewarded: referrals.filter(r => r.status === 'REWARDED').length,
    }

    return NextResponse.json({ code: myCode, referrals, stats })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: apply a referral code during registration
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'PLANNER', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { code } = await req.json()
    if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })

    const referral = await prisma.referral.findUnique({ where: { code } })
    if (!referral) return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    if (referral.referrerId === auth.userId) return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 })
    if (referral.refereeId) return NextResponse.json({ error: 'Referral code already used' }, { status: 400 })

    const updated = await prisma.referral.update({
      where: { code },
      data: { refereeId: auth.userId, status: 'COMPLETED', completedAt: new Date() },
    })

    return NextResponse.json({ ok: true, referral: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
