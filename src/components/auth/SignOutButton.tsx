'use client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }
  return (
    <button onClick={signOut}
      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-white/25 hover:text-white hover:bg-white/5 text-xs font-medium transition-all">
      ← Sign Out
    </button>
  )
}
