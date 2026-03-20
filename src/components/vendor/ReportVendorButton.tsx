'use client'
import { useState } from 'react'

const REASONS = [
  'Fake or misleading profile',
  'No-show / didn\'t fulfill booking',
  'Inappropriate behaviour',
  'Spam or scam',
  'Wrong category / service',
  'Other',
]

export default function ReportVendorButton({ vendorId }: { vendorId: string }) {
  const [open,    setOpen]    = useState(false)
  const [reason,  setReason]  = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  async function submit() {
    if (!reason) { setError('Please select a reason'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, reason, details }),
    })
    if (res.ok) { setDone(true) }
    else { const d = await res.json(); setError(d.error ?? 'Report failed') }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-theme-faint hover:text-red-400 transition-colors">
        🚨 Report this vendor
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(10,8,6,0.7)',backdropFilter:'blur(4px)'}}>
          <div className="bg-white dark:bg-[#16160e] rounded-2xl w-full max-w-sm shadow-2xl border border-[var(--border)] p-6">
            {done ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-semibold text-theme mb-2">Report submitted</h3>
                <p className="text-sm text-theme-muted mb-4">Our team will review this within 24 hours.</p>
                <button onClick={() => setOpen(false)} className="btn-primary w-full justify-center">Close</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-theme">Report this vendor</h3>
                  <button onClick={() => setOpen(false)} className="text-theme-faint hover:text-theme">✕</button>
                </div>
                {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 text-sm mb-4">{error}</div>}
                <div className="space-y-2 mb-4">
                  {REASONS.map(r => (
                    <label key={r} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${reason === r ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-[var(--border)] hover:border-red-300'}`}>
                      <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-red-500"/>
                      <span className="text-sm text-theme">{r}</span>
                    </label>
                  ))}
                </div>
                <textarea className="input resize-none mb-4 text-sm" rows={3} value={details}
                  onChange={e => setDetails(e.target.value)} placeholder="Additional details (optional)..."/>
                <button onClick={submit} disabled={loading}
                  className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm disabled:opacity-60 transition-all">
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
