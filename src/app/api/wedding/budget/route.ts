import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

async function ensureProfile(userId: string) {
  return prisma.weddingProfile.upsert({
    where: { clientId: userId },
    update: {},
    create: { clientId: userId },
  })
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const profile = await prisma.weddingProfile.findUnique({ where: { clientId: auth.userId } })
    if (!profile) return NextResponse.json([])
    const items = await prisma.budgetItem.findMany({
      where: { weddingProfileId: profile.id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(items)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const profile = await ensureProfile(auth.userId)
    const { category, label, estimatedAmount, actualAmount, isPaid, vendorId, notes } = await req.json()
    const item = await prisma.budgetItem.create({
      data: {
        weddingProfileId: profile.id,
        category: category ?? 'Other',
        label: label ?? 'Budget item',
        estimatedAmount: Number(estimatedAmount ?? 0),
        actualAmount: Number(actualAmount ?? 0),
        isPaid: isPaid ?? false,
        vendorId: vendorId ?? null,
        notes: notes ?? null,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { id, category, label, estimatedAmount, actualAmount, isPaid, notes } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const item = await prisma.budgetItem.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(label !== undefined && { label }),
        ...(estimatedAmount !== undefined && { estimatedAmount: Number(estimatedAmount) }),
        ...(actualAmount !== undefined && { actualAmount: Number(actualAmount) }),
        ...(isPaid !== undefined && { isPaid }),
        ...(notes !== undefined && { notes }),
      },
    })
    return NextResponse.json(item)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { id } = await req.json()
    await prisma.budgetItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
