// Visit http://localhost:3000/setup to diagnose your setup
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  let db: any = { status: 'unknown', tablesExist: false, userCount: 0, vendorCount: 0, categoryCount: 0 }

  try {
    const { prisma } = await import('@/lib/prisma')
    await (prisma as any).$queryRaw`SELECT 1`
    db.status = 'connected'
    try {
      db.userCount     = await (prisma as any).user.count()
      db.vendorCount   = await (prisma as any).vendor.count()
      db.categoryCount = await (prisma as any).category.count()
      db.tablesExist   = true
    } catch {
      db.tablesExist = false
      db.status      = 'connected_no_tables'
    }
  } catch (err: any) {
    db.status = 'disconnected'
    db.error  = err.message?.slice(0, 300) ?? 'Unknown error'
  }

  const dbUrl      = process.env.DATABASE_URL ?? 'NOT SET'
  const maskedUrl  = dbUrl.replace(/:([^:@]+)@/, ':****@')
  const dbName     = dbUrl.split('/').pop()?.split('?')[0] ?? 'unknown'
  const jwtSet     = !!(process.env.JWT_SECRET && process.env.JWT_SECRET.length > 10)
  const adminEmail = process.env.SUPER_ADMIN_EMAIL ?? 'NOT SET'

  const step1 = db.status === 'connected' || db.status === 'connected_no_tables'
  const step2 = db.tablesExist
  const step3 = db.userCount > 0
  const step4 = jwtSet

  const allGood = step1 && step2 && step3 && step4

  return (
    <html lang="en">
      <head><title>VowConnect Setup</title></head>
      <body style={{ margin: 0, minHeight: '100vh', background: '#0A0A0A', color: '#F5F0E8', fontFamily: 'system-ui, sans-serif', padding: '40px 20px' }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: '#fff' }}>Vow</span><span style={{ color: '#C8A96E' }}>Connect</span>
              <span style={{ color: '#555', fontWeight: 400, fontSize: 16, marginLeft: 10 }}>Setup Checker</span>
            </div>
            <p style={{ color: '#555', fontSize: 14, margin: 0 }}>Diagnosing why login isn&apos;t working. Fix each step from top to bottom.</p>
          </div>

          <div style={{ display: 'grid', gap: 10, marginBottom: 28 }}>

            <StatusCard
              step={1} ok={step1} title="Database Connection"
              good={`Connected ✓  (${maskedUrl})`}
              bad={
                !dbUrl || dbUrl === 'NOT SET'
                  ? 'DATABASE_URL is not set in .env.local'
                  : db.error?.includes('ECONNREFUSED')
                  ? 'PostgreSQL is not running'
                  : db.error?.includes('does not exist')
                  ? `Database "${dbName}" does not exist`
                  : db.error?.includes('password') || db.error?.includes('auth')
                  ? 'Wrong password in DATABASE_URL'
                  : `Cannot connect: ${db.error?.slice(0, 80)}`
              }
              fix={
                db.error?.includes('ECONNREFUSED')
                  ? `PostgreSQL is not running on your computer.\n\n→ Open pgAdmin → right-click the server → Connect\n→ Or in terminal: pg_ctl start`
                  : db.error?.includes('does not exist')
                  ? `The database "${dbName}" needs to be created.\n\n→ Open pgAdmin → right-click Databases → Create → Database\n   Name: ${dbName}\n\nThen refresh this page.`
                  : db.error?.includes('password') || db.error?.includes('auth')
                  ? `Wrong password.\n\nOpen .env.local and fix the password in:\nDATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/${dbName}"`
                  : `Check .env.local has:\nDATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/${dbName}"`
              }
            />

            <StatusCard
              step={2} ok={step2} disabled={!step1} title="Database Tables"
              good={`Tables exist (${db.categoryCount} categories)`}
              bad="Tables don't exist yet — schema not applied"
              fix={`Run in your terminal:\n\nnpm run db:push\n\nThis creates all the tables. Takes ~5 seconds.`}
            />

            <StatusCard
              step={3} ok={step3} disabled={!step2} title="Demo Data"
              good={`${db.userCount} users, ${db.vendorCount} vendors seeded`}
              bad="Database is empty — demo accounts not created"
              fix={`Run in your terminal:\n\nnpm run db:seed\n\nThis creates:\n  vendor@vowconnect.demo  /  demo1234!\n  client@vowconnect.demo  /  demo1234!\n  ${adminEmail}  /  demo1234!  (admin)`}
            />

            <StatusCard
              step={4} ok={step4} title="JWT Secret"
              good="JWT_SECRET is set — sessions will work"
              bad="JWT_SECRET not set or too short — you can't stay logged in"
              fix={`Add to .env.local:\n\nJWT_SECRET="any-long-random-string-at-least-32-chars"\n\nExample:\nJWT_SECRET="vowconnect-secret-key-2024-change-this-in-production"`}
            />

          </div>

          {allGood ? (
            <div style={{ background: '#0d2b1a', border: '1px solid #1a5c35', borderRadius: 12, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>🎉 Everything is set up!</div>
              <a href="/login" style={{ display: 'inline-block', background: '#C8A96E', color: '#0A0A0A', fontWeight: 700, padding: '10px 28px', borderRadius: 100, textDecoration: 'none', fontSize: 14 }}>
                Go to Login →
              </a>
            </div>
          ) : (
            <div style={{ background: '#141414', border: '1px solid #222', borderRadius: 12, padding: 16, fontSize: 13, color: '#666' }}>
              Fix each ✗ step above, then{' '}
              <a href="/setup" style={{ color: '#C8A96E' }}>refresh this page</a>
              {' '}to check again.
            </div>
          )}

        </div>
      </body>
    </html>
  )
}

function StatusCard({ step, ok, bad, good, fix, title, disabled }: any) {
  const borderColor = disabled ? '#1a1a1a' : ok ? '#1a3a28' : '#3a1a1a'
  const iconColor   = disabled ? '#333'    : ok ? '#10b981' : '#ef4444'
  const icon        = disabled ? '○'       : ok ? '✓'       : '✗'
  return (
    <div style={{ background: '#141414', border: `1px solid ${borderColor}`, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: disabled ? '#1a1a1a' : ok ? '#0d2b1a' : '#2b0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: iconColor, marginTop: 1 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: '#444', fontWeight: 600 }}>STEP {step}</span>
            <span style={{ fontWeight: 600, fontSize: 14, color: disabled ? '#444' : '#F5F0E8' }}>{title}</span>
          </div>
          <div style={{ fontSize: 13, color: disabled ? '#333' : ok ? '#6ee7b7' : '#fca5a5' }}>
            {ok ? good : bad}
          </div>
          {!ok && !disabled && fix && (
            <pre style={{ marginTop: 10, padding: '10px 14px', background: '#0d0d0d', borderRadius: 8, fontSize: 12, color: '#C8A96E', whiteSpace: 'pre-wrap', wordBreak: 'break-word', border: '1px solid #222', margin: '10px 0 0' }}>
              {fix}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
