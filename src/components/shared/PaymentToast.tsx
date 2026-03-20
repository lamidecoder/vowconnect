'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function Toast() {
  const params = useSearchParams()
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [type, setType] = useState<'success' | 'failed' | null>(null)
  const [plan, setPlan] = useState('')

  useEffect(() => {
    const payment = params.get('payment')
    if (payment === 'success') { setType('success'); setPlan(params.get('plan') ?? ''); setVisible(true) }
    else if (payment === 'failed') { setType('failed'); setVisible(true) }
    if (payment) {
      // Clean the URL without reload
      const url = new URL(window.location.href)
      url.searchParams.delete('payment')
      url.searchParams.delete('plan')
      window.history.replaceState({}, '', url.toString())
    }
  }, [params])

  useEffect(() => {
    if (visible) { const t = setTimeout(() => setVisible(false), 6000); return () => clearTimeout(t) }
  }, [visible])

  if (!visible || !type) return null

  return (
    <div className={`mb-5 flex items-center gap-3 p-4 rounded-2xl border text-sm font-medium animate-fade-in ${
      type === 'success'
        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400'
        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
    }`}>
      <span className="text-xl">{type === 'success' ? '🎉' : '⚠️'}</span>
      <div>
        {type === 'success'
          ? <><strong>{plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated!</strong> Your profile is now featured on VowConnect.</>
          : <>Payment was not completed. Please try again from the <a href="/vendor/pricing" className="underline">pricing page</a>.</>}
      </div>
      <button onClick={() => setVisible(false)} className="ml-auto opacity-50 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  )
}

export default function PaymentToast() {
  return <Suspense><Toast /></Suspense>
}
