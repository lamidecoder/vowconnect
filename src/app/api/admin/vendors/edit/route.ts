import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, logAdminAction } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { vendorId, ...fields } = await req.json()
    if (!vendorId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })

    const data: any = {}
    const allowed = ['businessName', 'bio', 'status', 'plan', 'priceMin', 'priceMax', 'location', 'whatsapp', 'instagram', 'website', 'isVerified', 'isFeatured', 'isAvailable']
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        data[key] = ['priceMin', 'priceMax'].includes(key) ? parseInt(fields[key]) : fields[key]
      }
    }

    const updated = await prisma.vendor.update({ where: { id: vendorId }, data })

    await logAdminAction({
      adminId: auth.userId, action: 'EDIT_VENDOR',
      targetType: 'vendor', targetId: vendorId,
      metadata: { fields: Object.keys(data) },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
