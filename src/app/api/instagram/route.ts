import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

// Instagram Basic Display API
// Setup: developers.facebook.com/docs/instagram-basic-display-api
// Env vars needed:
//   INSTAGRAM_CLIENT_ID      — Meta Developer App client ID
//   INSTAGRAM_CLIENT_SECRET  — Meta Developer App client secret
//   NEXT_PUBLIC_APP_URL      — your public URL (for OAuth redirect)

const IG_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID ?? ''
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`

// GET — check connection status + fetch recent posts
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const vendor = await prisma.vendor.findUnique({
    where: { userId: auth.userId },
    select: { id: true, instagram: true },
  })
  if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

  // Check if token is stored in SystemSetting (keyed by vendorId)
  const tokenRecord = await prisma.systemSetting.findUnique({ where: { key: `ig_token_${vendor.id}` } })

  if (!tokenRecord) {
    const oauthUrl = IG_CLIENT_ID
      ? `https://api.instagram.com/oauth/authorize?client_id=${IG_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user_profile,user_media&response_type=code&state=${vendor.id}`
      : null
    return NextResponse.json({ connected: false, oauthUrl, handle: vendor.instagram })
  }

  // Fetch recent 12 posts
  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp&limit=12&access_token=${tokenRecord.value}`
    )
    const data = await res.json()

    if (data.error) {
      // Token expired
      await prisma.systemSetting.delete({ where: { key: `ig_token_${vendor.id}` } }).catch(() => {})
      return NextResponse.json({ connected: false, expired: true })
    }

    const posts = (data.data ?? []).filter((p: any) =>
      p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM'
    )
    return NextResponse.json({ connected: true, handle: vendor.instagram, posts })
  } catch {
    return NextResponse.json({ connected: false, error: 'Could not reach Instagram' })
  }
}

// POST — import selected posts into portfolio
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const { imageUrls, captions } = await req.json()
  if (!Array.isArray(imageUrls) || !imageUrls.length) {
    return NextResponse.json({ error: 'No images selected' }, { status: 400 })
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId } })
  if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

  const existing = await prisma.portfolioImage.count({ where: { vendorId: vendor.id } })

  let imported = 0; let skipped = 0
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i]
    const dup = await prisma.portfolioImage.findFirst({ where: { vendorId: vendor.id, url } })
    if (dup) { skipped++; continue }
    await prisma.portfolioImage.create({
      data: {
        vendorId:     vendor.id,
        url,
        cloudinaryId: `ig_import_${Date.now()}_${i}`,
        caption:      captions?.[i] ? captions[i].slice(0, 200) : null,
        order:        existing + imported,
      },
    })
    imported++
  }

  return NextResponse.json({ imported, skipped })
}

// DELETE — disconnect Instagram
export async function DELETE(req: NextRequest) {
  const auth = await requireRole(req, ['VENDOR', 'SUPER_ADMIN'])
  if ('error' in auth) return auth.error

  const vendor = await prisma.vendor.findUnique({ where: { userId: auth.userId }, select: { id: true } })
  if (vendor) {
    await prisma.systemSetting.delete({ where: { key: `ig_token_${vendor.id}` } }).catch(() => {})
  }
  return NextResponse.json({ ok: true })
}
