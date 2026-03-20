import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, logAdminAction } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { userId, name, email, phone, role, isActive, emailVerified, newPassword } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const data: any = { name, email: email?.toLowerCase(), phone: phone || null, role, isActive, emailVerified }
  if (newPassword && newPassword.length >= 8) {
    data.passwordHash = await bcrypt.hash(newPassword, 12)
  }

  const updated = await prisma.user.update({ where: { id: userId }, data })

  await logAdminAction({
    adminId: auth.userId, action: 'EDIT_USER',
    targetType: 'user', targetId: userId,
    metadata: { fields: Object.keys(data).filter(k => k !== 'passwordHash') },
  })

  return NextResponse.json(updated)
  } catch (err: any) {
    console.error('edit error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
