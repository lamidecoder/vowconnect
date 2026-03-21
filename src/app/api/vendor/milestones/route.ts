// src/app/api/vendor/milestones/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — get vendor's milestone template
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR'])
  if ('error' in auth) return auth.error

  const vendor = await prisma.vendor.findUnique({
    where:  { userId: auth.userId },
    select: { id: true, milestoneTemplate: true },
  })

  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Parse template or return default
  let template = null
  try {
    template = vendor.milestoneTemplate ? JSON.parse(vendor.milestoneTemplate as string) : null
  } catch { template = null }

  return NextResponse.json(template ?? [
    { title:'Booking Deposit', description:'Confirm your date', percentage:30 },
    { title:'Final Payment',   description:'On event day',      percentage:70 },
  ])
}

// POST — save vendor's milestone template
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR'])
  if ('error' in auth) return auth.error

  const { milestones } = await req.json()

  if (!Array.isArray(milestones) || milestones.length < 1) {
    return NextResponse.json({ error: 'Invalid milestones' }, { status: 400 })
  }

  const total = milestones.reduce((s: number, m: any) => s + Number(m.percentage), 0)
  if (Math.abs(total - 100) > 0.1) {
    return NextResponse.json({ error: 'Percentages must add up to 100%' }, { status: 400 })
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.vendor.update({
    where: { id: vendor.id },
    data:  { milestoneTemplate: JSON.stringify(milestones) },
  })

  return NextResponse.json({ success: true, milestones })
}