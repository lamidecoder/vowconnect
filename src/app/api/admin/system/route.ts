import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, logAdminAction } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error
  const settings = await prisma.systemSetting.findMany()
  return NextResponse.json(Object.fromEntries(settings.map(s => [s.key, s.value])))
  } catch (err: any) {
    console.error('system error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error
  const body = await req.json()
  for (const [key, value] of Object.entries(body)) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  }
  await logAdminAction({ adminId: auth.userId, action: 'UPDATE_SYSTEM_SETTINGS', targetType: 'user', targetId: 'system', metadata: body })
  return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('system error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
