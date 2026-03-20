import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'

const JWT_SECRET = 'vc-dev-fallback-secret-not-for-production'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('gc_session')?.value
  if (!cookie) return NextResponse.json({ status: 'no_cookie' })
  
  try {
    const decoded = jwt.verify(cookie, JWT_SECRET) as any
    return NextResponse.json({ status: 'valid', role: decoded.role, userId: decoded.userId })
  } catch (e: any) {
    // Try with env secret
    try {
      const envSecret = process.env.JWT_SECRET ?? 'none'
      const decoded2 = jwt.verify(cookie, envSecret) as any
      return NextResponse.json({ 
        status: 'signed_with_env_secret', 
        role: decoded2.role,
        envSecret: envSecret.substring(0, 10) + '...',
        message: 'Cookie was signed with .env.local JWT_SECRET but middleware uses hardcoded secret'
      })
    } catch {
      return NextResponse.json({ status: 'invalid', error: e.message })
    }
  }
}
