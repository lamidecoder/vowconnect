import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

async function ensureProfile(userId: string) {
  return prisma.weddingProfile.upsert({ where: { clientId: userId }, update: {}, create: { clientId: userId } })
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const profile = await prisma.weddingProfile.findUnique({ where: { clientId: auth.userId } })
    if (!profile) return NextResponse.json([])
    const pins = await prisma.moodBoardPin.findMany({
      where: { weddingProfileId: profile.id },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(pins)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const profile = await ensureProfile(auth.userId)
    const { imageUrl, caption, sourceVendorId, sourceUrl, category } = await req.json()
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })
    const count = await prisma.moodBoardPin.count({ where: { weddingProfileId: profile.id } })
    const pin = await prisma.moodBoardPin.create({
      data: { weddingProfileId: profile.id, imageUrl, caption: caption ?? null, sourceVendorId: sourceVendorId ?? null, sourceUrl: sourceUrl ?? null, category: category ?? null, order: count },
    })
    return NextResponse.json(pin, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { id } = await req.json()
    await prisma.moodBoardPin.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
