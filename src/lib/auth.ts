import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import type { Role } from '@prisma/client'

// Hardcoded — never read from env so middleware and server always match
export const SESSION_SECRET = 'vc-dev-fallback-secret-not-for-production'
export const COOKIE_NAME    = 'gc_session'

export interface SessionPayload {
  userId: string
  email:  string
  role:   Role
  name:   string
  iat?:   number
  exp?:   number
}

export function signToken(payload: Omit<SessionPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const store = await cookies()
    const token = store.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({
    where:   { id: session.userId },
    include: { vendor: { include: { category: true } } },
  })
}

export async function requireRole(req: NextRequest, roles: Role[]) {
  const session = getSessionFromRequest(req)
  if (!session)
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!roles.includes(session.role))
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  const user = await prisma.user.findUnique({
    where:  { id: session.userId },
    select: { id: true, role: true, isActive: true },
  })
  if (!user?.isActive)
    return { error: NextResponse.json({ error: 'Account suspended' }, { status: 403 }) }
  return { userId: session.userId, role: session.role }
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   false,
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 30,
    path:     '/',
  })
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
}

// Keep old names as aliases so nothing else breaks
export const createSessionCookie = signToken

export async function bootstrapUser(email: string, name: string) {
  const isSuperAdmin = email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL ?? '').toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })
  const user = await prisma.user.upsert({
    where:  { email },
    update: {},
    create: { email, name, role: isSuperAdmin ? 'SUPER_ADMIN' : 'CLIENT' },
  })
  return { user, isNew: !existing }
}

export async function logAdminAction(params: {
  adminId: string; action: string; targetType: string; targetId: string; metadata?: object
}) {
  return prisma.adminLog.create({ data: params })
}
