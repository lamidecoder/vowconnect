import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {

  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  return NextResponse.json(categories)
  } catch (err: any) {
    console.error('categories error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
