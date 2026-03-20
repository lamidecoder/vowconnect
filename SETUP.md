# VowConnect — Local Setup Guide

## Prerequisites
- Node.js 18.17+ (check: `node -v`)
- PostgreSQL 14+ running locally, or use a cloud DB (Neon, Supabase)
- npm 9+ (check: `npm -v`)

---

## 1. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via `postinstall`.

---

## 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in **at minimum**:
- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — any long random string
- `SUPER_ADMIN_EMAIL` — the email you'll use as admin

---

## 3. Set up the database

### Option A — Push schema directly (recommended for local dev):
```bash
npm run db:push
```

### Option B — Create a migration (recommended for production):
```bash
npm run db:migrate
```

---

## 4. Seed demo data

```bash
npm run db:seed
```

This creates:
- 10 vendor categories
- System settings
- 15+ demo vendors across Lagos, London, New York
- Demo users: `vendor@vowconnect.demo` / `client@vowconnect.demo` (password: `demo1234!`)
- Your SUPER_ADMIN_EMAIL account

---

## 5. Run the dev server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## One-liner (do everything at once)

```bash
npm install && npm run db:push && npm run db:seed && npm run dev
```

---

## Common Issues

### "Can't reach database server"
- Make sure PostgreSQL is running: `pg_ctl status`
- Check your `DATABASE_URL` in `.env.local`
- For local PostgreSQL: `postgresql://postgres:YOUR_PASSWORD@localhost:5432/vowconnect`

### "PrismaClientInitializationError"
```bash
npm run db:generate   # regenerate Prisma client
```

### "Invalid DATABASE_URL"
- Must start with `postgresql://` (not `postgres://`)
- Format: `postgresql://USER:PASSWORD@HOST:PORT/DBNAME`

### "Module not found"
```bash
rm -rf node_modules .next
npm install
```

### Port already in use
```bash
npm run dev -- -p 3001
```

---

## Production deployment (Vercel)

1. Push to GitHub
2. Import repo on vercel.com
3. Set all env vars from `.env.example` in Vercel dashboard
4. Add build command: `npm run build`
5. Set `DATABASE_URL` to a cloud Postgres (Vercel Postgres, Neon, Supabase)
6. After first deploy, run: `npx prisma migrate deploy` (via Vercel CLI or seed script)

---

## Useful commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Apply schema changes (no migration file) |
| `npm run db:migrate` | Create + apply migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |
| `npm run db:reset` | **⚠️ Wipe + reseed** (dev only) |
| `npm run type-check` | Check TypeScript errors |
