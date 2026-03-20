import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const audience = searchParams.get('audience')
    const slug = searchParams.get('slug')

    if (slug) {
      const article = await prisma.academyArticle.findUnique({ where: { slug } })
      if (!article || !article.isPublished) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(article)
    }

    const articles = await prisma.academyArticle.findMany({
      where: {
        isPublished: true,
        ...(category && { category }),
        ...(audience && { audience }),
      },
      select: { id: true, slug: true, title: true, excerpt: true, category: true, audience: true, coverImage: true, readMinutes: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    })
    return NextResponse.json(articles)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['SUPER_ADMIN'])
    if ('error' in auth) return auth.error

    const { slug, title, excerpt, content, category, audience, coverImage, readMinutes, isPublished } = await req.json()
    const article = await prisma.academyArticle.create({
      data: {
        slug, title, excerpt, content,
        category: category ?? 'general',
        audience: audience ?? 'vendor',
        coverImage: coverImage ?? null,
        readMinutes: readMinutes ?? 5,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
        authorId: auth.userId,
      },
    })
    return NextResponse.json(article, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
