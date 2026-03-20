import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {

  const token = new URL(req.url).searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/login?verified=invalid', req.url))
  }

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } })

  if (!user || !user.emailVerifyExpiry || user.emailVerifyExpiry < new Date()) {
    return NextResponse.redirect(new URL('/login?verified=expired', req.url))
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified:      true,
      emailVerifyToken:   null,
      emailVerifyExpiry:  null,
    },
  })

  return NextResponse.redirect(new URL('/login?verified=success', req.url))
  } catch (err: any) {
    console.error('verify-email error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
