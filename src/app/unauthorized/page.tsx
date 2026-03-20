import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-theme-subtle flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="font-display text-4xl font-bold text-theme mb-3">Access Denied</h1>
        <p className="text-theme-muted mb-8">You don't have permission to view this page. Please sign in with the correct account.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="btn-primary">Sign In</Link>
          <Link href="/" className="btn-outline">Go Home</Link>
        </div>
      </div>
    </div>
  )
}
