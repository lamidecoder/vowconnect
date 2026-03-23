import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const cats = [
    { name: 'Nail Technician', emoji: '💅', slug: 'nail-technician' },
  ]
  for (const cat of cats) {
    await prisma.category.upsert({ where:{ slug: cat.slug }, update:{}, create: cat })
    console.log('✅ Added:', cat.name)
  }
  await prisma.$disconnect()
}
main().catch(console.error)
