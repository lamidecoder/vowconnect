// src/lib/rateLimit.ts — In-memory rate limiter (works on Vercel Edge + Node)
// For production scale, swap the store with Upstash Redis

interface RateLimitEntry { count: number; resetAt: number }

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSecs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check rate limit for a given key (IP + endpoint).
 * Returns { success: false } when limit is exceeded.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSecs * 1000

  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: config.limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt }
}

/** Get client IP from Next.js request headers */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    req.headers.get('cf-connecting-ip') ??
    'unknown'
  )
}

import { NextResponse } from 'next/server'

/** Drop-in helper — returns a 429 response if rate limited, null if OK */
export function rateLimitResponse(
  req: Request,
  endpoint: string,
  config: RateLimitConfig,
): NextResponse | null {
  const ip  = getClientIp(req)
  const key = `${endpoint}:${ip}`
  const result = checkRateLimit(key, config)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After':       String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(config.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        },
      },
    )
  }
  return null
}

// ── Pre-configured limits for each sensitive endpoint ────────────────────────

export const RATE_LIMITS = {
  /** Login: 10 attempts per 15 minutes per IP */
  login:              { limit: 10,  windowSecs: 15 * 60 },
  /** Register: 5 accounts per hour per IP */
  register:           { limit: 5,   windowSecs: 60 * 60 },
  /** Password reset: 5 requests per hour per IP */
  forgotPassword:     { limit: 5,   windowSecs: 60 * 60 },
  /** Email verification resend: 3 per hour */
  resendVerification: { limit: 3,   windowSecs: 60 * 60 },
  /** Booking creation: 20 per hour per user */
  createBooking:      { limit: 20,  windowSecs: 60 * 60 },
  /** Contact form: 5 per hour per IP */
  contact:            { limit: 5,   windowSecs: 60 * 60 },
  /** Newsletter signup: 3 per hour per IP */
  newsletter:         { limit: 3,   windowSecs: 60 * 60 },
  /** Analytics events: 200 per 10 minutes per IP (generous for real users) */
  analytics:          { limit: 200, windowSecs: 10 * 60 },
  /** File upload: 20 per hour per user */
  upload:             { limit: 20,  windowSecs: 60 * 60 },
  /** Report vendor: 10 per hour per IP */
  report:             { limit: 10,  windowSecs: 60 * 60 },
  /** Review submit: 10 per hour per user */
  review:             { limit: 10,  windowSecs: 60 * 60 },
} as const
