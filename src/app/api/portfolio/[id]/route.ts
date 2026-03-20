import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

async function deleteFromCloudinary(publicId: string, isVideo: boolean) {
  const cloud  = process.env.CLOUDINARY_CLOUD_NAME
  const key    = process.env.CLOUDINARY_API_KEY
  const secret = process.env.CLOUDINARY_API_SECRET
  if (!cloud || !key || !secret || publicId.startsWith('local_')) return

  const resourceType = isVideo ? 'video' : 'image'
  const timestamp    = Math.round(Date.now() / 1000)
  const crypto       = await import('node:crypto')
  const sig          = crypto.createHash('sha1').update(`public_id=${publicId}&timestamp=${timestamp}${secret}`).digest('hex')

  const form = new FormData()
  form.append('public_id', publicId); form.append('api_key', key)
  form.append('timestamp', String(timestamp)); form.append('signature', sig)

  await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/destroy`, { method: 'POST', body: form })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const image = await prisma.portfolioImage.findUnique({ where: { id: params.id }, include: { vendor: true } })
  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (auth.role === 'VENDOR' && image.vendor.userId !== auth.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  deleteFromCloudinary(image.cloudinaryId, image.mediaType === 'video').catch(console.error)
  await prisma.portfolioImage.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const image = await prisma.portfolioImage.findUnique({ where: { id: params.id }, include: { vendor: true } })
  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (auth.role === 'VENDOR' && image.vendor.userId !== auth.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { caption } = await req.json()
  const updated = await prisma.portfolioImage.update({ where: { id: params.id }, data: { caption } })
  return NextResponse.json(updated)
}
