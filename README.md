# VowConnect — Nigerian & Diaspora Wedding Vendor Marketplace

A full-stack wedding vendor marketplace connecting brides with verified vendors across Nigeria, the UK, the USA, Canada, and Ghana.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (bcryptjs) — no external auth provider
- **Email:** Resend (12 templates built-in)
- **Payments:** Stripe (international) + Paystack (Nigeria)
- **Dark Mode:** CSS variables + class strategy

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
cp .env.example .env.local
# Edit both files with your database URL and other secrets
```

### 3. Set up database
```bash
# Make sure PostgreSQL is running, then:
npx prisma db push
npx prisma db seed  # loads demo data
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

After seeding, use these to log in:

| Role       | Email                        | Password   |
|------------|------------------------------|------------|
| Admin      | lamidecodes@gmail.com        | demo1234!  |
| Vendor     | vendor@vowconnect.demo         | demo1234!  |
| Vendor 2   | vendor2@vowconnect.demo        | demo1234!  |
| Client     | client@vowconnect.demo         | demo1234!  |

## Key Pages

### Public
- `/` — Homepage
- `/vendors` — Browse all vendors
- `/vendors/[id]` — Vendor profile
- `/map` — Map view
- `/pricing` — Pricing plans
- `/features` — Feature overview
- `/how-it-works` — Guide for brides and vendors
- `/vendor-guide` — Vendor success guide
- `/about`, `/contact`, `/faq`, `/blog`
- `/login`, `/register`, `/forgot-password`, `/reset-password`

### Vendor Portal (`/vendor/*`)
- Dashboard, Profile, Portfolio, Bookings, Analytics
- Availability calendar, Instagram sync, Asoebi groups, Pricing

### Client Portal (`/client/*`)
- Dashboard, Bookings, Favourites, Asoebi, Profile

### Admin (`/admin/*`)
- Dashboard, Vendors, Users, Bookings, Reports
- Audit Logs, Analytics, System Settings, Broadcast Email

## Environment Variables

See `.env.example` for all required variables with descriptions.

Minimum required for local dev:
```
DATABASE_URL=postgresql://...
JWT_SECRET=any-long-random-string
```

## Deployment

The app is ready for deployment on **Vercel** with a managed PostgreSQL database (Supabase, Neon, Railway, or Vercel Postgres).

```bash
npm run build  # verify it builds cleanly first
```
