import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const vendorId = searchParams.get('vendorId')

    if (vendorId) {
      // Public: anyone can view a vendor's packages
      const packages = await prisma.vendorPackage.findMany({
        where: { vendorId, isActive: true },
        orderBy: { price: 'asc' },
      })
      return NextResponse.json(packages)
    }

    // Auth: vendor viewing their own packages
    const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId }, select: { id: true } })
    if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

    const packages = await prisma.vendorPackage.findMany({
      where: { vendorId: vendor.id },
      orderBy: { price: 'asc' },
    })
    return NextResponse.json(packages)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId }, select: { id: true, currency: true } })
    if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

    const { name, description, price, duration, includes } = await req.json()
    if (!name || price === undefined) return NextResponse.json({ error: 'name and price required' }, { status: 400 })

    const pkg = await prisma.vendorPackage.create({
      data: {
        vendorId: vendor.id,
        name,
        description: description ?? null,
        price: Number(price),
        currency: vendor.currency,
        duration: duration ?? null,
        includes: Array.isArray(includes) ? includes : [],
      },
    })
    return NextResponse.json(pkg, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { id, name, description, price, duration, includes, isActive } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const pkg = await prisma.vendorPackage.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(duration !== undefined && { duration }),
        ...(includes !== undefined && { includes }),
        ...(isActive !== undefined && { isActive }),
      },
    })
    return NextResponse.json(pkg)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
    if ('error' in auth) return auth.error
    const { id } = await req.json()
    await prisma.vendorPackage.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
