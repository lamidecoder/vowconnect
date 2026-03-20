import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, logAdminAction } from '@/lib/auth'
import { sendVendorApproved, sendVendorRejected } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, email: true } } },
  })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  let data: any = {}
  let action = ''

  switch (params.action) {
    case 'approve':
      data = { status: 'APPROVED' }
      action = 'APPROVE_VENDOR'
      sendVendorApproved({
        vendorEmail:  vendor.user.email,
        vendorName:   vendor.user.name,
        businessName: vendor.businessName,
      }).catch(console.error)
      break
    case 'reject':
      data = { status: 'REJECTED' }
      action = 'REJECT_VENDOR'
      sendVendorRejected({
        vendorEmail:  vendor.user.email,
        vendorName:   vendor.user.name,
        businessName: vendor.businessName,
      }).catch(console.error)
      break
    case 'suspend':
      data = { status: 'SUSPENDED' }
      action = 'SUSPEND_VENDOR'
      break
    case 'verify':
      data = { isVerified: !vendor.isVerified }
      action = vendor.isVerified ? 'REMOVE_VERIFIED' : 'VERIFY_VENDOR'
      break
    case 'feature':
      data = { isFeatured: !vendor.isFeatured }
      action = vendor.isFeatured ? 'UNFEATURE_VENDOR' : 'FEATURE_VENDOR'
      break
    case 'diaspora':
      data = { isDiaspora: !(vendor as any).isDiaspora }
      action = (vendor as any).isDiaspora ? 'REMOVE_DIASPORA' : 'MARK_DIASPORA'
      break
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const updated = await prisma.vendor.update({ where: { id: params.id }, data })
  await logAdminAction({ adminId: auth.userId, action, targetType: 'vendor', targetId: params.id })

  return NextResponse.json(updated)
}
