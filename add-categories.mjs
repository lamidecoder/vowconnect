import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const cats = [
    // Nigerian wedding specific
    { name: 'Alaga Iduro',           emoji: '🎤', slug: 'alaga-iduro'           },
    { name: 'Alaga Ijoko',           emoji: '🎙️', slug: 'alaga-ijoko'           },
    { name: 'Ushering Agency',       emoji: '🤝', slug: 'ushering-agency'       },
    { name: 'Security & Bouncers',   emoji: '💪', slug: 'security-bouncers'     },
    { name: 'Protocol Officer',      emoji: '🎖️', slug: 'protocol-officer'      },
    { name: 'Event Compere / MC',    emoji: '🎭', slug: 'event-compere-mc'      },
    // Entertainment
    { name: 'Live Band',             emoji: '🎸', slug: 'live-band'             },
    { name: 'Praise & Worship',      emoji: '🙌', slug: 'praise-worship'        },
    { name: 'Cultural Dance Group',  emoji: '💃', slug: 'cultural-dance-group'  },
    { name: 'Comedian',              emoji: '😂', slug: 'comedian'              },
    { name: 'Saxophonist',           emoji: '🎷', slug: 'saxophonist'           },
    // Experience
    { name: 'Photo Booth',           emoji: '📷', slug: 'photo-booth'          },
    { name: 'Souvenir & Gifts',      emoji: '🎁', slug: 'souvenir-gifts'        },
    { name: 'Wedding Stationery',    emoji: '💌', slug: 'wedding-stationery'    },
    { name: 'Event Lighting',        emoji: '💡', slug: 'event-lighting'        },
    { name: 'Fireworks & Pyro',      emoji: '🎆', slug: 'fireworks-pyro'        },
    // Practical
    { name: 'Event Tent & Canopy',   emoji: '⛺', slug: 'event-tent-canopy'     },
    { name: 'Chair & Table Rental',  emoji: '🪑', slug: 'chair-table-rental'    },
    { name: 'Generator Hire',        emoji: '⚡', slug: 'generator-hire'        },
    { name: 'Makeup School',         emoji: '🎓', slug: 'makeup-school'         },
  ]

  for (const cat of cats) {
    await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: cat,
    })
    console.log('✅ Added:', cat.name)
  }
  await prisma.$disconnect()
  console.log('\n🎉 All categories added!')
}
main().catch(console.error)
