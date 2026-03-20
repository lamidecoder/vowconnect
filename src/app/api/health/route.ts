import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Quick DB check — just count users
    const userCount = await prisma.user.count()
    const vendorCount = await prisma.vendor.count()
    const seeded = userCount > 0

    return NextResponse.json({
      ok: true,
      db: 'connected',
      seeded,
      counts: { users: userCount, vendors: vendorCount },
      message: seeded
        ? `DB ready — ${userCount} users, ${vendorCount} vendors`
        : 'DB connected but empty — run: npm run db:seed',
    })
  } catch (err: any) {
    const msg = err.message ?? ''
    let hint = 'Check your DATABASE_URL in .env.local'
    if (msg.includes('ECONNREFUSED')) hint = 'PostgreSQL not running — start it first'
    if (msg.includes('does not exist'))  hint = 'Database not created — run: npm run db:push'
    if (msg.includes('P1001')) hint = 'Cannot reach DB server — check host/port in DATABASE_URL'
    if (msg.includes('P1003')) hint = 'Database does not exist — run: npm run db:push'
    if (msg.includes('password')) hint = 'Wrong DB password in DATABASE_URL'

    return NextResponse.json({
      ok: false,
      db: 'error',
      error: msg.slice(0, 200),
      hint,
    }, { status: 503 })
  }
}
