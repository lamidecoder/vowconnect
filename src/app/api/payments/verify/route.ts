import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTransaction } from '@/lib/paystack'
import { sendVendorUpgraded } from '@/lib/email'

export async function GET(req: NextRequest) {
  const ref = new URL(req.url).searchParams.get('ref')
    ?? new URL(req.url).searchParams.get('reference')
  if (!ref) return NextResponse.redirect(new URL('/vendor/dashboard?payment=failed', req.url))

  let result: any
  try {
    result = await verifyTransaction(ref)
  } catch {
    return NextResponse.redirect(new URL('/vendor/dashboard?payment=failed', req.url))
  }

  if (result?.status && result.data?.status === 'success') {
    const { vendorId, plan, userId } = result.data.metadata as {
      vendorId: string; plan: string; userId?: string
    }
    if (!vendorId || !plan) {
      return NextResponse.redirect(new URL('/vendor/dashboard?payment=failed', req.url))
    }

    const planExpiry = new Date()
    planExpiry.setMonth(planExpiry.getMonth() + 1)

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        plan,
        planExpiry,
        isFeatured: plan === 'pro' || plan === 'premium',
        isVerified: plan === 'premium',
      },
    })

    // Email vendor
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    if (vendor) {
      sendVendorUpgraded({
        vendorEmail:  vendor.user.email,
        vendorName:   vendor.user.name,
        businessName: vendor.businessName,
        plan,
        planExpiry: planExpiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      }).catch(console.error)

      // Log with real userId
      await prisma.adminLog.create({
        data: {
          adminId:    vendor.user.id,
          action:     'PAYSTACK_SUBSCRIPTION',
          targetType: 'vendor',
          targetId:   vendorId,
          metadata:   { plan, amount: result.data.amount / 100, reference: ref },
        },
      }).catch(console.error)
    }

    return NextResponse.redirect(new URL(`/vendor/dashboard?payment=success&plan=${plan}`, req.url))
  }

  return NextResponse.redirect(new URL('/vendor/dashboard?payment=failed', req.url))
}
