import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/instagram/callback?code=xxx&state=vendorId
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code     = searchParams.get('code')
  const vendorId = searchParams.get('state')
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const redirectUri = `${appUrl}/api/instagram/callback`

  if (!code || !vendorId) {
    return NextResponse.redirect(new URL('/vendor/instagram?error=cancelled', appUrl))
  }

  try {
    // Exchange code for short-lived token
    const form = new FormData()
    form.append('client_id',     process.env.INSTAGRAM_CLIENT_ID ?? '')
    form.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET ?? '')
    form.append('grant_type',    'authorization_code')
    form.append('redirect_uri',  redirectUri)
    form.append('code',          code)

    const tokenRes  = await fetch('https://api.instagram.com/oauth/access_token', { method: 'POST', body: form })
    const tokenData = await tokenRes.json()

    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.redirect(new URL('/vendor/instagram?error=auth_failed', appUrl))
    }

    // Exchange for long-lived token (60 days)
    const longLivedRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${tokenData.access_token}`
    )
    const longLivedData = await longLivedRes.json()
    const finalToken = longLivedData.access_token ?? tokenData.access_token

    // Store token in SystemSetting
    await prisma.systemSetting.upsert({
      where:  { key: `ig_token_${vendorId}` },
      update: { value: finalToken },
      create: { key: `ig_token_${vendorId}`, value: finalToken },
    })

    return NextResponse.redirect(new URL('/vendor/instagram?connected=true', appUrl))
  } catch {
    return NextResponse.redirect(new URL('/vendor/instagram?error=server_error', appUrl))
  }
}
