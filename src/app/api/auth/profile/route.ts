import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error
  const { name, phone } = await req.json()
  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: { ...(name && { name }), ...(phone !== undefined && { phone }) },
    select: { id: true, name: true, email: true, phone: true, role: true },
  })
  return NextResponse.json(user)
  } catch (err: any) {
    console.error('profile error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
