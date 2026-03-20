// prisma/seed-demo.ts — Rich demo data for every VowConnect page
import bcrypt from 'bcryptjs'
import { PrismaClient, Currency } from '@prisma/client'
const prisma = new PrismaClient()
const daysFromNow   = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d }
const daysAgo       = (n: number) => daysFromNow(-n)
const monthsFromNow = (n: number) => { const d = new Date(); d.setMonth(d.getMonth() + n); return d }
const rand          = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a

async function main() {
  console.log('\n🌱  Seeding rich demo data...\n')
  const demoHash = await bcrypt.hash('demo1234!', 12)

  // 1. CATEGORIES
  const catData = [
    { name: 'Gele Stylist',    slug: 'gele-stylist',    emoji: '🧣' },
    { name: 'Makeup Artist',   slug: 'makeup-artist',   emoji: '💄' },
    { name: 'Photographer',    slug: 'photographer',    emoji: '📸' },
    { name: 'Videographer',    slug: 'videographer',    emoji: '🎥' },
    { name: 'Event Decorator', slug: 'decorator',       emoji: '🌸' },
    { name: 'Caterer',         slug: 'caterer',         emoji: '🍽️' },
    { name: 'DJ & MC',         slug: 'dj-mc',           emoji: '🎵' },
    { name: 'Cake Designer',   slug: 'cake-designer',   emoji: '🎂' },
    { name: 'Aso-ebi Tailor',  slug: 'aso-ebi-tailor',  emoji: '🪡' },
    { name: 'Wedding Planner',    slug: 'wedding-planner',    emoji: '📋' },
    { name: 'Content Creator',     slug: 'content-creator',     emoji: '🎬' },
    { name: 'Mobile Photographer', slug: 'mobile-photographer', emoji: '📱' },
  ]
  for (const c of catData) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c })
  }
  const cats = await prisma.category.findMany()
  const cat  = (slug: string) => cats.find(c => c.slug === slug)!
  console.log('✅  Categories (10)')

  // 2. SYSTEM SETTINGS
  for (const s of [
    { key: 'maintenance_mode',     value: 'false' },
    { key: 'homepage_headline',    value: 'Find Trusted Wedding Vendors Worldwide' },
    { key: 'homepage_subline',     value: 'Book verified Gele stylists, makeup artists, photographers & more for your perfect day' },
    { key: 'max_portfolio_images', value: '5' },
    { key: 'booking_rate_limit',   value: '5' },
    { key: 'featured_slots',       value: '6' },
    { key: 'platform_fee_pct',     value: '0' },
  ]) { await prisma.systemSetting.upsert({ where: { key: s.key }, update: {}, create: s }) }

  // 3. USERS
  const adminEmail = process.env.SUPER_ADMIN_EMAIL ?? 'lamidecodes@gmail.com'
  const adminUser  = await prisma.user.upsert({ where: { email: adminEmail },
    update: { role: 'SUPER_ADMIN', passwordHash: demoHash },
    create: { email: adminEmail, name: 'Lamide (Admin)', role: 'SUPER_ADMIN', passwordHash: demoHash, country: 'NG' } })

  const vendorUser1 = await prisma.user.upsert({ where: { email: 'vendor@vowconnect.demo' },
    update: { role: 'VENDOR', passwordHash: demoHash },
    create: { email: 'vendor@vowconnect.demo', name: 'Adaeze Okonkwo', role: 'VENDOR', phone: '+2348012345678', country: 'NG', passwordHash: demoHash } })

  const vendorUser2 = await prisma.user.upsert({ where: { email: 'vendor2@vowconnect.demo' },
    update: { role: 'VENDOR', passwordHash: demoHash },
    create: { email: 'vendor2@vowconnect.demo', name: 'Fatima Hassan', role: 'VENDOR', phone: '+447911234567', country: 'GB', passwordHash: demoHash } })

  const clientUser1 = await prisma.user.upsert({ where: { email: 'client@vowconnect.demo' },
    update: { passwordHash: demoHash },
    create: { email: 'client@vowconnect.demo', name: 'Chidinma Eze', role: 'CLIENT', phone: '+2348099887766', country: 'NG', passwordHash: demoHash } })

  const clientUser2 = await prisma.user.upsert({ where: { email: 'client2@vowconnect.demo' },
    update: { passwordHash: demoHash },
    create: { email: 'client2@vowconnect.demo', name: 'Blessing Obi', role: 'CLIENT', phone: '+447800123456', country: 'GB', passwordHash: demoHash } })

  console.log('✅  Users (5)')

  // 4. VENDOR PROFILES
  const vendor1 = await prisma.vendor.upsert({ where: { userId: vendorUser1.id }, update: {}, create: {
    userId: vendorUser1.id,
    businessName: 'Adaeze Gele & Bridal',
    bio: 'Award-winning Gele stylist with 8+ years experience serving Lagos brides. Specialising in traditional Yoruba, Igbo and Hausa styles for weddings, introductions and naming ceremonies. Available across Lagos and for destination events. Featured in Bella Vow Weddings 2023.',
    categoryId: cat('gele-stylist').id, location: 'Victoria Island, Lagos', city: 'Lagos',
    country: 'NG', countryName: 'Nigeria', latitude: 6.4281, longitude: 3.4219,
    priceMin: 25000, priceMax: 150000, currency: 'NGN' as Currency,
    whatsapp: '+2348012345678', instagram: '@adaeze_gele',
    isAvailable: true, isVerified: true, isFeatured: true,
    status: 'APPROVED', plan: 'premium', profileViews: 847,
  }})

  const vendor2 = await prisma.vendor.upsert({ where: { userId: vendorUser2.id }, update: {}, create: {
    userId: vendorUser2.id,
    businessName: "Fatima's Gele Studio London",
    bio: "Premier Gele tying service in London for 6 years. Serving the UK Nigerian and Ghanaian diaspora with expert traditional and contemporary styles. Qualified in Yoruba, Igbo and Hausa Gele techniques. Travel available across the UK and Nigeria.",
    categoryId: cat('gele-stylist').id, location: 'Peckham, London', city: 'London',
    country: 'GB', countryName: 'United Kingdom', latitude: 51.4740, longitude: -0.0697,
    priceMin: 80, priceMax: 350, currency: 'GBP' as Currency,
    whatsapp: '+447911234567', instagram: '@fatima_gele_london',
    isAvailable: true, isVerified: true, isFeatured: true,
    status: 'APPROVED', plan: 'pro', profileViews: 412,
  }})

  // Extra vendors
  const extras = [
    { email: 'makeup@vowconnect.demo',  name: 'Tolu Adebayo',  country: 'NG',
      biz: "Tolu's Beauty Studio", bio: 'Top-rated bridal MUA in Lagos. Specialising in editorial, natural glam and HD makeup. 200+ bridal clients. Products: MAC, Fenty, Charlotte Tilbury.',
      cat: 'makeup-artist', loc: 'Lekki Phase 1, Lagos', city: 'Lagos', cname: 'Nigeria',
      lat: 6.4698, lng: 3.5852, min: 30000, max: 120000, curr: 'NGN',
      wa: '+2348034567890', ig: '@tolu_mua_lagos', feat: true, verif: true, views: 634, plan: 'pro', status: 'APPROVED' },
    { email: 'photo@vowconnect.demo',   name: 'Emeka Shots',   country: 'NG',
      biz: 'EmekaShots Photography', bio: 'Award-winning wedding photographer based in Lagos. Certified by WPPI. Destination weddings across Africa, UK and USA.',
      cat: 'photographer', loc: 'Ikeja, Lagos', city: 'Lagos', cname: 'Nigeria',
      lat: 6.5958, lng: 3.3478, min: 200000, max: 800000, curr: 'NGN',
      wa: '+2348056789012', ig: '@emekashots', feat: false, verif: true, views: 523, plan: 'pro', status: 'APPROVED' },
    { email: 'deco@vowconnect.demo',    name: 'Grace Nwosu',   country: 'NG',
      biz: 'Grace Events Decoration', bio: 'Luxury event decoration and florals in Abuja. Canopy draping, floral installations, table centrepieces.',
      cat: 'decorator', loc: 'Maitama, Abuja', city: 'Abuja', cname: 'Nigeria',
      lat: 9.0765, lng: 7.3986, min: 150000, max: 500000, curr: 'NGN',
      wa: '+2348078901234', ig: '@grace_events_abuja', feat: false, verif: true, views: 291, plan: 'free', status: 'APPROVED' },
    { email: 'vendor3@vowconnect.demo', name: 'Amina Bridal',  country: 'GB',
      biz: 'Amina London Bridal Hair', bio: 'Afro bridal hair specialist in Birmingham. Gele tying, braids, twists and natural styles. Serving the West Midlands Nigerian community.',
      cat: 'gele-stylist', loc: 'Handsworth, Birmingham', city: 'Birmingham', cname: 'United Kingdom',
      lat: 52.4862, lng: -1.8904, min: 60, max: 250, curr: 'GBP',
      wa: '+447922345678', ig: '@amina_bridal_brum', feat: false, verif: true, views: 178, plan: 'free', status: 'APPROVED' },
    { email: 'caterer@vowconnect.demo', name: 'Mama Cooks',    country: 'NG',
      biz: "Mama Cooks Catering", bio: "Authentic Nigerian cuisine for weddings and events. Jollof, egusi, pounded yam and small chops. Serving Lagos and Ogun State for 12 years.",
      cat: 'caterer', loc: 'Surulere, Lagos', city: 'Lagos', cname: 'Nigeria',
      lat: 6.5059, lng: 3.3506, min: 50000, max: 300000, curr: 'NGN',
      wa: '+2348067890123', ig: '@mamacooks_lagos', feat: false, verif: true, views: 209, plan: 'free', status: 'APPROVED' },
    { email: 'cake@vowconnect.demo',    name: 'Cakes by Yemi', country: 'NG',
      biz: 'Cakes by Yemi', bio: 'Luxury wedding cakes and dessert tables in Lagos. Fondant, buttercream and semi-naked cakes. Custom designs inspired by your Ankara and colour palette.',
      cat: 'cake-designer', loc: 'Magodo, Lagos', city: 'Lagos', cname: 'Nigeria',
      lat: 6.5970, lng: 3.3940, min: 40000, max: 200000, curr: 'NGN',
      wa: '+2348045678901', ig: '@cakesbyyemi', feat: false, verif: false, views: 134, plan: 'free', status: 'PENDING_REVIEW' },
    // US vendors
    { email: 'houston@vowconnect.demo', name: 'Kemi Fashola', country: 'US',
      biz: 'Kemi Gele Houston', bio: 'Premier Gele stylist for the Houston Nigerian community. Serving Greater Houston for 5 years — traditional, contemporary and royal styles. Available for destination events across Texas and the South.',
      cat: 'gele-stylist', loc: 'Galleria Area, Houston', city: 'Houston', cname: 'United States',
      lat: 29.7373, lng: -95.4613, min: 150, max: 600, curr: 'USD',
      wa: '+17135559012', ig: '@kemi_gele_houston', feat: true, verif: true, views: 315, plan: 'pro', status: 'APPROVED' },
    { email: 'atlanta@vowconnect.demo', name: 'Ngozi Williams', country: 'US',
      biz: 'Ngozi Bridal MUA Atlanta', bio: 'Bridal makeup artist serving Atlanta and surrounding areas. Specialising in melanin-rich skin — natural glam, bold editorial, and HD airbrush looks. Over 150 Nigerian and diaspora weddings.',
      cat: 'makeup-artist', loc: 'Buckhead, Atlanta', city: 'Atlanta', cname: 'United States',
      lat: 33.8490, lng: -84.3880, min: 200, max: 700, curr: 'USD',
      wa: '+14045559012', ig: '@ngozi_mua_atlanta', feat: false, verif: true, views: 198, plan: 'pro', status: 'APPROVED' },
    // Canada vendor
    { email: 'toronto@vowconnect.demo', name: 'Bisi Adeyemi', country: 'CA',
      biz: 'Bisi Events Toronto', bio: 'Award-winning Nigerian wedding decorator based in Toronto. Serving the GTA Nigerian community with full event design — centrepieces, draping, floral walls, and aso-ebi colour coordination.',
      cat: 'decorator', loc: 'North York, Toronto', city: 'Toronto', cname: 'Canada',
      lat: 43.7615, lng: -79.4111, min: 800, max: 5000, curr: 'CAD',
      wa: '+14165559012', ig: '@bisi_events_toronto', feat: false, verif: true, views: 241, plan: 'free', status: 'APPROVED' },
    // Ghana vendor
    { email: 'accra@vowconnect.demo', name: 'Ama Asante', country: 'GH',
      biz: 'Ama Glam Accra', bio: 'Top bridal makeup artist in Accra. Working with Ghanaian, Nigerian and diaspora brides across West Africa. Expert in natural glam, evening looks, and kente ceremony makeup.',
      cat: 'makeup-artist', loc: 'Airport Residential, Accra', city: 'Accra', cname: 'Ghana',
      lat: 5.6037, lng: -0.1870, min: 500, max: 2000, curr: 'GHS',
      wa: '+233201234567', ig: '@ama_glam_accra', feat: false, verif: true, views: 163, plan: 'free', status: 'APPROVED' },
    // Content Creators
    { email: 'creator.lagos@vowconnect.demo', name: 'Tunde Visuals', country: 'NG',
      biz: 'Tunde Visuals Content Studio', bio: 'Wedding content creator based in Lagos. Specialising in cinematic same-day reels, Instagram stories, and TikTok highlights. Your wedding trending before the night ends.',
      cat: 'content-creator', loc: 'Lekki Phase 2, Lagos', city: 'Lagos', cname: 'Nigeria',
      lat: 6.4481, lng: 3.5674, min: 80000, max: 350000, curr: 'NGN',
      wa: '+2348011223344', ig: '@tundevisuals', feat: true, verif: true, views: 412, plan: 'pro', status: 'APPROVED' },
    { email: 'creator.london@vowconnect.demo', name: 'Sade Okonkwo', country: 'GB',
      biz: 'Sade Creates London', bio: 'Nigerian wedding content creator covering London and South East England. Reels, BTS footage, drone shots and same-day edits. Over 2M views across client content.',
      cat: 'content-creator', loc: 'Peckham, London', city: 'London', cname: 'United Kingdom',
      lat: 51.4733, lng: -0.0694, min: 300, max: 1200, curr: 'GBP',
      wa: '+447933112233', ig: '@sadecreates', feat: false, verif: true, views: 287, plan: 'pro', status: 'APPROVED' },
    { email: 'creator.houston@vowconnect.demo', name: 'Dayo Films', country: 'US',
      biz: 'Dayo Films & Content', bio: 'Houston-based wedding content creator. Social media packages for Nigerian diaspora weddings — coordinated with your photographer so nothing is missed.',
      cat: 'content-creator', loc: 'Sugar Land, Houston', city: 'Houston', cname: 'United States',
      lat: 29.6197, lng: -95.6349, min: 400, max: 1500, curr: 'USD',
      wa: '+17135551234', ig: '@dayofilms', feat: false, verif: true, views: 194, plan: 'free', status: 'APPROVED' },
    // Mobile Photographers
    { email: 'mobilephoto.lagos@vowconnect.demo', name: 'Chidi Mobile Clicks', country: 'NG',
      biz: 'Chidi Mobile Photography', bio: 'Professional mobile photographer in Lagos using iPhone 15 Pro Max with advanced editing. Perfect for budget-conscious couples who still want stunning quality. Fast turnaround — gallery ready in 24 hours.',
      cat: 'mobile-photographer', loc: 'Yaba, Lagos', city: 'Lagos', cname: 'Nigeria',
      lat: 6.5085, lng: 3.3724, min: 25000, max: 100000, curr: 'NGN',
      wa: '+2348099887766', ig: '@chidi_clicks', feat: false, verif: true, views: 256, plan: 'free', status: 'APPROVED' },
    { email: 'mobilephoto.uk@vowconnect.demo', name: 'Funke Mobile Studio', country: 'GB',
      biz: 'Funke Mobile Studio', bio: 'UK-based mobile photographer for Nigerian weddings. Using Pixel 8 Pro and professional lighting. Available across Greater London. Includes printed album.',
      cat: 'mobile-photographer', loc: 'Woolwich, London', city: 'London', cname: 'United Kingdom',
      lat: 51.4905, lng: 0.0649, min: 150, max: 500, curr: 'GBP',
      wa: '+447944556677', ig: '@funke_mobile_studio', feat: false, verif: false, views: 89, plan: 'free', status: 'APPROVED' },
  ]

  const vendorMap: Record<string, any> = { 'vendor@vowconnect.demo': vendor1, 'vendor2@vowconnect.demo': vendor2 }
  for (const v of extras) {
    const u = await prisma.user.upsert({
      where: { email: v.email }, update: { role: 'VENDOR' },
      create: { email: v.email, name: v.name, role: 'VENDOR', country: v.country, passwordHash: demoHash },
    })
    const vend = await prisma.vendor.upsert({ where: { userId: u.id }, update: {}, create: {
      userId: u.id, businessName: v.biz, bio: v.bio,
      categoryId: cat(v.cat).id, location: v.loc, city: v.city,
      country: v.country, countryName: v.cname, latitude: v.lat, longitude: v.lng,
      priceMin: v.min, priceMax: v.max, currency: v.curr as Currency,
      whatsapp: v.wa, instagram: v.ig, isAvailable: true,
      isVerified: v.verif, isFeatured: v.feat, status: v.status as any,
      plan: v.plan, profileViews: v.views,
    }})
    vendorMap[v.email] = vend
  }
  console.log('✅  Vendors (12)')

  // 5. PORTFOLIO IMAGES
  const portfolios = [
    { vid: vendor1.id, imgs: [
      ['https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&q=80', 'Traditional Yoruba Gele — scarlet & gold'],
      ['https://images.unsplash.com/photo-1607435097405-db48af25cde9?w=800&q=80', 'Modern bridal Gele — ivory & rose gold'],
      ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80', 'Group Asoebi styling — 8 bridesmaids'],
      ['https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80', 'Traditional introduction ceremony look'],
      ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', 'Bridal beauty — Lagos 2024'],
      ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', 'Editorial — Eko Hotel rooftop'],
    ]},
    { vid: vendor2.id, imgs: [
      ['https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=800&q=80', 'London wedding — burgundy Gele'],
      ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80', 'Double Gele — navy & gold'],
      ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&q=80', 'Ivory bridal Gele — Mayfair venue'],
      ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80', 'Classic Yoruba look for UK bride'],
    ]},
    { vid: vendorMap['makeup@vowconnect.demo'].id, imgs: [
      ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80', 'Natural glam bridal look'],
      ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80', 'HD makeup — traditional ceremony'],
      ['https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&q=80', 'Editorial shoot — Lagos 2024'],
    ]},
    { vid: vendorMap['photo@vowconnect.demo'].id, imgs: [
      ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 'Bride & groom — Eko Hotel'],
      ['https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80', 'Traditional ceremony — sunset'],
      ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80', 'Candid reception moments'],
      ['https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80', 'Details — bridal accessories flat lay'],
    ]},
  ]
  for (const { vid, imgs } of portfolios) {
    for (let i = 0; i < imgs.length; i++) {
      const exists = await prisma.portfolioImage.findFirst({ where: { vendorId: vid, order: i } })
      if (!exists) await prisma.portfolioImage.create({
        data: { vendorId: vid, url: imgs[i][0], cloudinaryId: `demo_${vid}_${i}`, caption: imgs[i][1], order: i }
      }).catch(() => {})
    }
  }
  console.log('✅  Portfolio images (17)')

  // 6. BOOKINGS
  const bookingDefs = [
    { id: 'demo_booking_1', clientId: clientUser1.id, vendorId: vendor1.id,
      eventDate: monthsFromNow(2), eventType: 'Traditional Wedding',
      location: 'Eko Hotel & Suites, Victoria Island', guestCount: 300, budget: 80000,
      notes: 'I want a tall scarlet and gold double Gele. Full bridal look for the ceremony. Coming with 6 bridesmaids who also need styling.',
      status: 'ACCEPTED' as const, currency: 'NGN' as Currency },
    { id: 'demo_booking_2', clientId: clientUser1.id, vendorId: vendor1.id,
      eventDate: daysFromNow(14), eventType: 'Introduction Ceremony',
      location: 'Ikoyi Club, Lagos', guestCount: 150,
      notes: 'First meeting with the family. Want something elegant but not too dramatic.',
      status: 'PENDING' as const, currency: 'NGN' as Currency },
    { id: 'demo_booking_3', clientId: clientUser2.id, vendorId: vendor2.id,
      eventDate: monthsFromNow(3), eventType: 'White Wedding',
      location: 'The Dorchester, Mayfair, London', guestCount: 120, budget: 250,
      notes: 'Elegant ivory and gold Gele. Venue is very formal.',
      status: 'ACCEPTED' as const, currency: 'GBP' as Currency },
    { id: 'demo_booking_4', clientId: clientUser1.id, vendorId: vendor1.id,
      eventDate: daysAgo(45), eventType: 'Birthday Party',
      location: 'Lagos Continental Hotel', guestCount: 100,
      status: 'COMPLETED' as const, currency: 'NGN' as Currency },
    { id: 'demo_booking_5', clientId: clientUser2.id, vendorId: vendor1.id,
      eventDate: daysFromNow(7), eventType: 'Naming Ceremony',
      location: 'Transcorp Hilton, Abuja',
      notes: 'Visiting Lagos from London. Short notice but willing to pay premium.',
      status: 'PENDING' as const, currency: 'NGN' as Currency },
    { id: 'demo_booking_6', clientId: clientUser1.id, vendorId: vendorMap['makeup@vowconnect.demo'].id,
      eventDate: monthsFromNow(2), eventType: 'Traditional Wedding',
      location: 'Eko Hotel & Suites, Victoria Island', guestCount: 300, budget: 60000,
      notes: 'Need bridal makeup same day as Gele booking. HD makeup, lashes included.',
      status: 'ACCEPTED' as const, currency: 'NGN' as Currency },
  ]
  for (const b of bookingDefs) {
    await prisma.booking.upsert({ where: { id: b.id }, update: {}, create: b })
  }
  console.log('✅  Bookings (6 — pending + accepted + completed)')

  // 7. REVIEWS
  await prisma.review.upsert({ where: { bookingId: 'demo_booking_4' }, update: {}, create: {
    bookingId: 'demo_booking_4', clientId: clientUser1.id, vendorId: vendor1.id,
    rating: 5, comment: 'Adaeze is absolutely phenomenal! My Gele was the talk of the entire party. She arrived 30 minutes early and the results were breathtaking. She handled all 6 bridesmaids with patience and skill. Already booked her again for my traditional wedding!',
  }})

  // Extra reviews via standalone bookings
  const extraReviews = [
    { bId: 'demo_rb_1', cId: clientUser2.id, vId: vendor2.id,         rating: 5, comment: "Fatima is simply the best in London. My Gele was the centrepiece of my whole look. Every single guest asked who did it. Worth every penny!" },
    { bId: 'demo_rb_2', cId: clientUser2.id, vId: vendorMap['makeup@vowconnect.demo'].id, rating: 5, comment: "Tolu's work is extraordinary. Natural glam look that lasted 12 hours. My photos are absolutely stunning." },
    { bId: 'demo_rb_3', cId: clientUser2.id, vId: vendor1.id,         rating: 4, comment: "Very talented Gele stylist. Arrived on time and worked beautifully on all 4 of us. Final result was worth it." },
    { bId: 'demo_rb_4', cId: clientUser1.id, vId: vendorMap['photo@vowconnect.demo'].id, rating: 5, comment: "EmekaShots captured our day perfectly. The sunset shots are magazine-worthy. Best investment we made for the wedding." },
  ]
  for (const r of extraReviews) {
    await prisma.booking.upsert({ where: { id: r.bId }, update: {}, create: {
      id: r.bId, clientId: r.cId, vendorId: r.vId,
      eventDate: daysAgo(rand(60,180)), eventType: 'Wedding',
      status: 'COMPLETED', currency: 'NGN',
    }})
    const exists = await prisma.review.findUnique({ where: { bookingId: r.bId } })
    if (!exists) await prisma.review.create({ data: {
      bookingId: r.bId, clientId: r.cId, vendorId: r.vId, rating: r.rating, comment: r.comment,
    }}).catch(() => {})
  }
  console.log('✅  Reviews (5)')

  // 8. FAVORITES
  for (const f of [
    { userId: clientUser1.id, vendorId: vendor2.id },
    { userId: clientUser1.id, vendorId: vendorMap['makeup@vowconnect.demo'].id },
    { userId: clientUser1.id, vendorId: vendorMap['photo@vowconnect.demo'].id },
    { userId: clientUser2.id, vendorId: vendor1.id },
  ]) { await prisma.favorite.upsert({ where: { userId_vendorId: f }, update: {}, create: f }).catch(() => {}) }
  console.log('✅  Favorites (4)')

  // 9. BLOCKED DATES
  for (const b of [
    { n: 3,  r: 'Already booked — private event' },
    { n: 4,  r: 'Already booked — private event' },
    { n: 10, r: 'Personal leave' },
    { n: 11, r: 'Personal leave' },
    { n: 18, r: 'Travel to Abuja' },
    { n: 25, r: 'Public holiday' },
    { n: 32, r: 'Training workshop' },
  ]) {
    const d = new Date(daysFromNow(b.n).toISOString().split('T')[0])
    await prisma.blockedDate.upsert({
      where: { vendorId_date: { vendorId: vendor1.id, date: d } },
      update: {}, create: { vendorId: vendor1.id, date: d, reason: b.r },
    }).catch(() => {})
  }
  console.log('✅  Blocked dates (7)')

  // 10. ANALYTICS EVENTS
  const evtTypes = ['profile_view','profile_view','profile_view','profile_view','whatsapp_click','portfolio_click','portfolio_click','favorite','booking_request']
  const ctries   = ['NG','NG','NG','NG','NG','GB','GB','US','CA','ZA','GH']
  for (const vid of [vendor1.id, vendor2.id]) {
    for (let i = 0; i < (vid === vendor1.id ? 60 : 30); i++) {
      const createdAt = new Date(); createdAt.setDate(createdAt.getDate() - rand(0,30)); createdAt.setHours(rand(7,22))
      await prisma.analyticsEvent.create({ data: {
        vendorId: vid,
        type:     evtTypes[rand(0, evtTypes.length-1)],
        country:  ctries[rand(0, ctries.length-1)],
        createdAt,
      }}).catch(() => {})
    }
  }
  console.log('✅  Analytics events (90)')

  // 11. ASOEBI GROUP
  const asoebi = await prisma.asoebiGroup.upsert({ where: { shareCode: 'DEMO01' }, update: {}, create: {
    leadClientId: clientUser1.id, vendorId: vendor1.id,
    eventDate: monthsFromNow(2), eventType: 'Traditional Wedding',
    location: 'Eko Hotel & Suites, Victoria Island', maxSlots: 10,
    notes: "Chidinma's wedding — 10 bridesmaids, all wearing aso-oke in scarlet and gold.",
    status: 'OPEN', shareCode: 'DEMO01', currency: 'NGN',
  }})
  const memberCount = await prisma.asoebiMember.count({ where: { groupId: asoebi.id } })
  if (memberCount === 0) {
    for (const m of [
      { name: 'Adaeze Okeke', status: 'CONFIRMED' },
      { name: 'Ngozi Eze',    status: 'CONFIRMED' },
      { name: 'Amaka Obi',    status: 'JOINED' },
      { name: 'Kemi Adeyemi', status: 'JOINED' },
    ]) { await prisma.asoebiMember.create({ data: { groupId: asoebi.id, clientId: null, name: m.name, status: m.status }}).catch(() => {}) }
  }
  console.log('✅  Asoebi group DEMO01 + 4 members')

  // SUMMARY
  // adminEmail already defined above
  console.log(`
${'═'.repeat(58)}
🎉  VOWCONNECT DEMO DATA READY!
${'═'.repeat(58)}

  All passwords: demo1234!

  👑  ADMIN
      ${adminEmail}
      → http://localhost:3000/admin/dashboard

  🧣  VENDOR (Lagos, Nigeria)
      vendor@vowconnect.demo
      → http://localhost:3000/vendor/dashboard
      Has: 2 pending + 2 accepted bookings, analytics,
           calendar with blocks, Asoebi group, portfolio

  🧣  VENDOR 2 (London, UK)
      vendor2@vowconnect.demo
      → http://localhost:3000/vendor/dashboard
      Has: 1 accepted booking, GBP pricing, UK portfolio

  👰  CLIENT (Lagos bride — Chidinma)
      client@vowconnect.demo
      → http://localhost:3000/client/dashboard
      Has: 3 bookings, 3 saved vendors, Asoebi group lead

  👰  CLIENT 2 (London bride — Blessing)
      client2@vowconnect.demo
      → http://localhost:3000/client/dashboard
      Has: 2 bookings (UK + NG vendors)

  🔗  PUBLIC
      http://localhost:3000/vendors      → 12 vendors (NG, GB, US, CA, GH)
      http://localhost:3000/map          → Map view
      http://localhost:3000/asoebi/DEMO01 → Join Asoebi

${'═'.repeat(58)}
`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
