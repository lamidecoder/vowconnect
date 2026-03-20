import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, logAdminAction } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
  const q = searchParams.get('q')
  const role = searchParams.get('role')

  const where: any = {}
  if (role) where.role = role
  if (q) where.OR = [
    { name: { contains: q, mode: 'insensitive' } },
    { email: { contains: q, mode: 'insensitive' } },
  ]

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, isActive: true, deletedAt: true, createdAt: true, vendor: { select: { businessName: true, status: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ users, total, page })
  } catch (err: any) {
    console.error('users error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {

  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const body = await req.json()
  const { id, isActive, role, action } = body

  // Handle action-based updates
  if (action === 'suspend')       { await prisma.user.update({ where: { id }, data: { isActive: false } }); return NextResponse.json({ success: true }) }
  if (action === 'activate')      { await prisma.user.update({ where: { id }, data: { isActive: true  } }); return NextResponse.json({ success: true }) }
  if (action === 'verify_email')  { await prisma.user.update({ where: { id }, data: { emailVerified: true, emailVerifyToken: null } }); return NextResponse.json({ success: true }) }
  if (action === 'delete')        { await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }); return NextResponse.json({ success: true }) }

  const _dummy = undefined
  if (id === auth.userId) return NextResponse.json({ error: 'Cannot modify own account' }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id },
    data: { ...(isActive !== undefined && { isActive }), ...(role && { role }) },
  })

  await logAdminAction({
    adminId: auth.userId,
    action: isActive === false ? 'SUSPEND_USER' : isActive === true ? 'ACTIVATE_USER' : 'CHANGE_ROLE',
    targetType: 'user', targetId: id,
    metadata: { isActive, role },
  })

  return NextResponse.json(updated)
  } catch (err: any) {
    console.error('users error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
