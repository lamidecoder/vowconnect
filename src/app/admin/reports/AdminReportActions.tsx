'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminReportActions({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function update(status: 'RESOLVED' | 'DISMISSED') {
    setLoading(status)
    await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status }),
    })
    setLoading(null)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => update('RESOLVED')}
        disabled={!!loading}
        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
        {loading === 'RESOLVED' ? '…' : '✓ Resolve'}
      </button>
      <button
        onClick={() => update('DISMISSED')}
        disabled={!!loading}
        style={{ background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.25)', color: '#9ca3af', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
        {loading === 'DISMISSED' ? '…' : 'Dismiss'}
      </button>
    </>
  )
}
