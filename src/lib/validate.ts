// src/lib/validate.ts — Input validation & sanitisation helpers

/** Strip HTML tags and trim whitespace */
export function sanitise(str: unknown): string {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').trim()
}

/** Validate and sanitise an email address */
export function validateEmail(email: unknown): string | null {
  const s = sanitise(email)
  if (!s || s.length > 254) return null
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  return re.test(s) ? s.toLowerCase() : null
}

/** Validate a plain string field with length constraints */
export function validateStr(
  value: unknown,
  opts: { min?: number; max: number; field: string },
): { value: string } | { error: string } {
  const s = sanitise(value)
  if (opts.min && s.length < opts.min)
    return { error: `${opts.field} must be at least ${opts.min} characters` }
  if (s.length > opts.max)
    return { error: `${opts.field} must be under ${opts.max} characters` }
  return { value: s }
}

/** Validate an integer within a range */
export function validateInt(
  value: unknown,
  opts: { min: number; max: number; field: string },
): { value: number } | { error: string } {
  const n = parseInt(String(value))
  if (isNaN(n)) return { error: `${opts.field} must be a number` }
  if (n < opts.min || n > opts.max)
    return { error: `${opts.field} must be between ${opts.min} and ${opts.max}` }
  return { value: n }
}

/** Validate a URL (must be https) */
export function validateUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null
  const s = url.trim().slice(0, 2048)
  try {
    const u = new URL(s)
    return u.protocol === 'https:' ? s : null
  } catch {
    return null
  }
}

/** Ensure a redirect path is internal (starts with /) — prevents open redirect */
export function safeRedirectPath(path: unknown, fallback = '/'): string {
  if (typeof path !== 'string') return fallback
  const s = path.trim()
  // Must start with / and not be a protocol-relative URL (//evil.com)
  if (!s.startsWith('/') || s.startsWith('//')) return fallback
  // Must not contain newlines (header injection)
  if (/[\r\n]/.test(s)) return fallback
  return s
}

/** Field length limits used across the app */
export const LIMITS = {
  name:         { max: 100 },
  email:        { max: 254 },
  password:     { min: 8, max: 128 },
  businessName: { max: 120 },
  bio:          { max: 1000 },
  comment:      { max: 2000 },
  message:      { max: 5000 },
  subject:      { max: 200 },
  location:     { max: 200 },
  reason:       { max: 500 },
  caption:      { max: 300 },
  notes:        { max: 2000 },
  whatsapp:     { max: 20  },
  instagram:    { max: 60  },
  website:      { max: 256 },
  broadcastMsg: { max: 10000 },
  eventType:    { max: 100 },
} as const
