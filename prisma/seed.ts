import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding VowConnect database...')

  // Categories
  const cats = [
    { name: 'Gele Stylist',    slug: 'gele-stylist',   emoji: '🧣' },
    { name: 'Makeup Artist',   slug: 'makeup-artist',  emoji: '💄' },
    { name: 'Photographer',    slug: 'photographer',   emoji: '📸' },
    { name: 'Videographer',    slug: 'videographer',   emoji: '🎥' },
    { name: 'Event Decorator', slug: 'decorator',      emoji: '🌸' },
    { name: 'Caterer',         slug: 'caterer',        emoji: '🍽️' },
    { name: 'DJ & MC',         slug: 'dj-mc',          emoji: '🎵' },
    { name: 'Cake Designer',   slug: 'cake-designer',  emoji: '🎂' },
    { name: 'Aso-ebi Tailor',  slug: 'aso-ebi-tailor', emoji: '🪡' },
    { name: 'Wedding Planner', slug: 'wedding-planner',emoji: '📋' },
  ]

  for (const cat of cats) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  // System settings
  const settings = [
    { key: 'maintenance_mode',    value: 'false' },
    { key: 'homepage_headline',   value: 'Find Trusted Wedding Vendors in Lagos' },
    { key: 'homepage_subline',    value: 'Book verified Gele stylists, makeup artists, photographers & more for your perfect day' },
    { key: 'max_portfolio_images', value: '5' },
    { key: 'booking_rate_limit',  value: '3' },
    { key: 'featured_slots',      value: '6' },
    { key: 'platform_fee_pct',    value: '0' },
  ]

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }

  console.log('✅ Categories seeded:', cats.length)
  console.log('✅ System settings seeded')
  console.log(`🔑 Sign in with ${process.env.SUPER_ADMIN_EMAIL} to claim SUPER_ADMIN`)
  console.log('🎉 Seed complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
