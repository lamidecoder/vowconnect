// src/app/api/admin/disputes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const disputes = await prisma.dispute.findMany({
    include: {
      booking: {
        select: { id:true, eventDate:true, eventType:true, currency:true },
      },
      client:    { select: { name:true, email:true } },
      milestone: { select: { title:true, amount:true, vendorAmount:true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(disputes)
}