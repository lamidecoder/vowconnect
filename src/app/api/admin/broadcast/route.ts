import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { LIMITS, validateStr } from '@/lib/validate'
import { prisma } from '@/lib/prisma'
import { sendBroadcast } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const body = await req.json()
  const { audience } = body
  const subjectResult = validateStr(body.subject, { min: 3, max: LIMITS.subject.max, field: 'Subject' })
  if ('error' in subjectResult) return NextResponse.json({ error: subjectResult.error }, { status: 400 })
  const messageResult = validateStr(body.message, { min: 10, max: LIMITS.broadcastMsg.max, field: 'Message' })
  if ('error' in messageResult) return NextResponse.json({ error: messageResult.error }, { status: 400 })
  if (!audience) return NextResponse.json({ error: 'Missing audience' }, { status: 400 })
  const subject = subjectResult.value
  const message = messageResult.value

  const roleFilter: Record<string, unknown> = {}
  if (audience === 'vendors') roleFilter.role = 'VENDOR'
  if (audience === 'clients') roleFilter.role = 'CLIENT'
  if (audience === 'pro') {
    const vs = await prisma.vendor.findMany({ where: { plan: { in: ['pro', 'premium'] } }, select: { userId: true } })
    roleFilter.id = { in: vs.map(v => v.userId) }
  }
  if (audience === 'pending') {
    const vs = await prisma.vendor.findMany({ where: { status: 'PENDING_REVIEW' }, select: { userId: true } })
    roleFilter.id = { in: vs.map(v => v.userId) }
  }

  const users = await prisma.user.findMany({
    where: { ...roleFilter, isActive: true },
    select: { email: true, name: true },
  })

  // Send in batches of 10 (Resend rate limits)
  const BATCH = 10
  for (let i = 0; i < users.length; i += BATCH) {
    await Promise.allSettled(
      users.slice(i, i + BATCH).map(u => sendBroadcast({ email: u.email, name: u.name, subject, message }))
    )
  }

  await prisma.adminLog.create({
    data: {
      adminId: auth.userId, action: 'BROADCAST_EMAIL',
      targetType: 'users', targetId: 'batch',
      metadata: { audience, subject, recipientCount: users.length },
    },
  })

  return NextResponse.json({ success: true, recipientCount: users.length })
  } catch (err: any) {
    console.error('broadcast error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
