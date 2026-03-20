import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const vendor = auth.role === 'VENDOR'
      ? await prisma.vendor.findUnique({ where: { userId: auth.userId }, select: { id: true } })
      : null

    const where = vendor ? { vendorId: vendor.id } : { clientId: auth.userId }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        items: { include: { package: true } },
        client: { select: { id: true, name: true, email: true, avatar: true } },
        vendor: { select: { id: true, businessName: true, user: { select: { avatar: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(quotes)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['VENDOR', 'CLIENT', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { clientId, vendorId, items, notes, validDays = 7 } = await req.json()
    if (!items?.length) return NextResponse.json({ error: 'At least one item required' }, { status: 400 })

    // Resolve vendor
    let resolvedVendorId = vendorId
    if (auth.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId }, select: { id: true } })
      if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })
      resolvedVendorId = vendor.id
    }

    const resolvedClientId = auth.role === 'CLIENT' ? auth.userId : clientId
    if (!resolvedClientId || !resolvedVendorId) return NextResponse.json({ error: 'clientId and vendorId required' }, { status: 400 })

    const total = items.reduce((sum: number, item: any) => sum + Number(item.price) * Number(item.quantity ?? 1), 0)
    const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)

    const vendor = await prisma.vendor.findUnique({ where: { id: resolvedVendorId }, select: { currency: true } })

    const quote = await prisma.quote.create({
      data: {
        clientId: resolvedClientId,
        vendorId: resolvedVendorId,
        totalAmount: total,
        currency: vendor?.currency ?? 'NGN',
        validUntil,
        notes: notes ?? null,
        status: 'SENT',
        items: {
          create: items.map((item: any) => ({
            label: item.label,
            price: Number(item.price),
            quantity: Number(item.quantity ?? 1),
            packageId: item.packageId ?? null,
          })),
        },
      },
      include: { items: true },
    })
    return NextResponse.json(quote, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['CLIENT', 'VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })
    const quote = await prisma.quote.update({ where: { id }, data: { status } })
    return NextResponse.json(quote)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
