import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vowconnect.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const static_pages = [
    '', '/vendors', '/map', '/features', '/pricing',
    '/how-it-works', '/vendor-guide', '/about', '/contact',
    '/faq', '/blog', '/terms', '/privacy',
    '/login', '/register',
  ].map(path => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly' as 'daily' | 'weekly',
    priority: path === '' ? 1 : path === '/vendors' ? 0.9 : 0.7,
  }))

  return static_pages
}
