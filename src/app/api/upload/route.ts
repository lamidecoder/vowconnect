// Legacy upload route - redirects to new /api/portfolio/upload
// Kept for backward compatibility
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function uploadToCloudinary(base64: string): Promise<{ url: string; publicId: string }> {
  const cloud  = process.env.CLOUDINARY_CLOUD_NAME
  const key    = process.env.CLOUDINARY_API_KEY
  const secret = process.env.CLOUDINARY_API_SECRET

  if (!cloud || !key || !secret) {
    const shortId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    return { url: base64, publicId: shortId }
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder    = 'vowconnect/portfolio'
  const crypto    = await import('node:crypto')
  const sig       = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest('hex')

  const form = new FormData()
  form.append('file', base64)
  form.append('api_key', key)
  form.append('timestamp', String(timestamp))
  form.append('signature', sig)
  form.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Cloudinary upload failed')
  const data = await res.json()
  return { url: data.secure_url, publicId: data.public_id }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const vendor = await prisma.vendor.findUnique({
    where: { userId: auth.userId },
    include: { portfolio: true },
  })
  if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

  const MAX = 5
  if (vendor.portfolio.length >= MAX) {
    return NextResponse.json({ error: `Maximum ${MAX} portfolio items allowed` }, { status: 400 })
  }

  const { file } = await req.json()
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  try {
    const { url, publicId } = await uploadToCloudinary(file)
    const image = await prisma.portfolioImage.create({
      data: {
        vendorId:    vendor.id,
        url,
        cloudinaryId: publicId,
        mediaType:   'image',
        order:       vendor.portfolio.length,
      },
    })
    return NextResponse.json(image, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
