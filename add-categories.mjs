import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const cats = [
    { name: 'Sound Engineer',          emoji: '🎛️', slug: 'sound-engineer'          },
    { name: 'Sound Mixer',             emoji: '🎚️', slug: 'sound-mixer'             },
    { name: 'Fashion Designer',        emoji: '👗', slug: 'fashion-designer'        },
    { name: 'Wedding Content Creator', emoji: '🎬', slug: 'wedding-content-creator' },
  ]
  for (const cat of cats) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat })
    console.log('Added:', cat.name)
  }
  await prisma.$disconnect()
}
main().catch(console.error)
