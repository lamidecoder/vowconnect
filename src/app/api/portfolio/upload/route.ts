import { NextRequest, NextResponse } from 'next/server'
import { rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

// Cloudinary upload (falls back to base64 storage if not configured)
async function uploadToCloudinary(base64: string, isVideo: boolean): Promise<{ url: string; publicId: string; thumbnailUrl?: string }> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME
  const key   = process.env.CLOUDINARY_API_KEY
  const secret = process.env.CLOUDINARY_API_SECRET

  if (!cloud || !key || !secret) {
    // No Cloudinary configured — store base64 directly (dev only)
    const shortId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    return { url: base64, publicId: shortId }
  }

  const resourceType = isVideo ? 'video' : 'image'
  const timestamp = Math.round(Date.now() / 1000)
  const folder = 'vowconnect/portfolio'

  // Build signature
  const crypto = await import('node:crypto')
  const sigStr = `folder=${folder}&resource_type=${resourceType}&timestamp=${timestamp}${secret}`
  const signature = crypto.createHash('sha1').update(sigStr).digest('hex')

  const form = new FormData()
  form.append('file', base64)
  form.append('api_key', key)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)
  form.append('resource_type', resourceType)
  if (isVideo) {
    form.append('eager', 'c_fill,h_400,w_600/so_0') // thumbnail at 0s
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`, {
    method: 'POST', body: form,
  })
  if (!res.ok) throw new Error('Cloudinary upload failed')
  const data = await res.json()

  return {
    url: data.secure_url,
    publicId: data.public_id,
    thumbnailUrl: isVideo && data.eager?.[0]?.secure_url ? data.eager[0].secure_url : undefined,
  }
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

  const { file, mediaType = 'image', filename = '' } = await req.json()
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Enforce file size limits: 10MB images, 100MB videos
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024  // 10MB in base64 chars (~7.5MB actual)
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
  const maxSize = mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
  if (file.length > maxSize) {
    return NextResponse.json({
      error: `File too large. Max size: ${mediaType === 'video' ? '100MB' : '10MB'}`,
    }, { status: 413 })
  }

  // Validate mediaType
  if (!['image', 'video'].includes(mediaType)) {
    return NextResponse.json({ error: 'Invalid media type' }, { status: 400 })
  }

  const isVideo = mediaType === 'video'

  let url: string, cloudinaryId: string, thumbnailUrl: string | undefined

  try {
    const rl = rateLimitResponse(req, 'upload', RATE_LIMITS.upload)
    if (rl) return rl

    const result = await uploadToCloudinary(file, isVideo)
    url = result.url; cloudinaryId = result.publicId; thumbnailUrl = result.thumbnailUrl
  } catch (e: any) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed. Check Cloudinary configuration.' }, { status: 500 })
  }

  const order = vendor.portfolio.length
  const image = await prisma.portfolioImage.create({
    data: {
      vendorId: vendor.id,
      url,
      cloudinaryId,
      mediaType,
      thumbnailUrl: thumbnailUrl ?? null,
      order,
    },
  })

  return NextResponse.json(image, { status: 201 })
}
