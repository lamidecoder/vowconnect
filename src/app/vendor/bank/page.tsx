'use client'
import { useState, useEffect, useRef } from 'react'
import DashboardShell from '@/components/layout/DashboardShell'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const NAV = [
  { href:'/vendor/dashboard',    label:'Dashboard',    icon:'🏠' },
  { href:'/vendor/bookings',     label:'Bookings',     icon:'📅' },
  { href:'/vendor/messages',     label:'Messages',     icon:'💬' },
  { href:'/vendor/quotes',       label:'Quotes',       icon:'📄' },
  { href:'/vendor/profile',      label:'Profile',      icon:'✏️' },
  { href:'/vendor/portfolio',    label:'Portfolio',    icon:'🖼️' },
  { href:'/vendor/packages',     label:'Packages',     icon:'📦' },
  { href:'/vendor/availability', label:'Availability', icon:'🗓️' },
  { href:'/vendor/crm',          label:'Client CRM',   icon:'👥' },
  { href:'/vendor/analytics',    label:'Analytics',    icon:'📊' },
  { href:'/vendor/pricing',      label:'Pricing',      icon:'💰' },
  { href:'/vendor/bank',         label:'Payments',     icon:'🏦' },
]

// Countries that use Paystack
const PAYSTACK_COUNTRIES = ['NG','GH','KE']
// Countries that use Stripe Connect
const STRIPE_COUNTRIES   = ['GB','US','CA','AU','DE','FR','NL','IE','SE','NO','DK','FI','BE','AT','CH','IT','ES','PT']

const COUNTRY_LIST = [
  { code:'NG', label:'Nigeria',        flag:'🇳🇬', provider:'paystack', currency:'NGN' },
  { code:'GH', label:'Ghana',          flag:'🇬🇭', provider:'paystack', currency:'GHS' },
  { code:'KE', label:'Kenya',          flag:'🇰🇪', provider:'paystack', currency:'KES' },
  { code:'GB', label:'United Kingdom', flag:'🇬🇧', provider:'stripe',   currency:'GBP' },
  { code:'US', label:'United States',  flag:'🇺🇸', provider:'stripe',   currency:'USD' },
  { code:'CA', label:'Canada',         flag:'🇨🇦', provider:'stripe',   currency:'CAD' },
  { code:'AU', label:'Australia',      flag:'🇦🇺', provider:'stripe',   currency:'AUD' },
  { code:'DE', label:'Germany',        flag:'🇩🇪', provider:'stripe',   currency:'EUR' },
  { code:'FR', label:'France',         flag:'🇫🇷', provider:'stripe',   currency:'EUR' },
  { code:'NL', label:'Netherlands',    flag:'🇳🇱', provider:'stripe',   currency:'EUR' },
  { code:'IE', label:'Ireland',        flag:'🇮🇪', provider:'stripe',   currency:'EUR' },
]

interface Bank { id: number; name: string; code: string }

type VerifyState = 'idle' | 'verifying' | 'verified' | 'mismatch' | 'failed'

function BankPageInner() {
  const searchParams  = useSearchParams()
  const stripeStatus  = searchParams.get('stripe')

  const [vendorCountry,  setVendorCountry]  = useState<string>('')
  const [vendorName,     setVendorName]     = useState('')
  const [loading,        setLoading]        = useState(true)

  // Paystack state
  const [banks,          setBanks]          = useState<Bank[]>([])
  const [bankSearch,     setBankSearch]     = useState('')
  const [showDropdown,   setShowDropdown]   = useState(false)
  const [bankCode,       setBankCode]       = useState('')
  const [bankName,       setBankName]       = useState('')
  const [accountNo,      setAccountNo]      = useState('')
  const [verifyState,    setVerifyState]    = useState<VerifyState>('idle')
  const [resolvedName,   setResolvedName]   = useState('')
  const [nameWarning,    setNameWarning]    = useState('')
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [existing,       setExisting]       = useState<any>(null)

  // Stripe state
  const [stripeStatus_,  setStripeStatus_]  = useState<{connected:boolean;onboarded:boolean}|null>(null)
  const [connectingStripe, setConnectingStripe] = useState(false)

  const [error, setError] = useState('')
  const verifyTimer = useRef<NodeJS.Timeout>()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const countryInfo = COUNTRY_LIST.find(c => c.code === vendorCountry)
  const provider    = countryInfo?.provider ?? 'paystack'

  useEffect(() => {
    // Load vendor info
    fetch('/api/vendors/me', { credentials:'include' })
      .then(r => r.json())
      .then(d => {
        setVendorCountry(d.country ?? 'NG')
        setVendorName(d.businessName ?? '')
      })

    // Load existing bank for Paystack
    fetch('/api/vendor/bank', { credentials:'include' })
      .then(r => r.json())
      .then(d => { if (d.bankVerified) setExisting(d) })

    // Load Stripe status
    fetch('/api/vendor/stripe-connect', { credentials:'include' })
      .then(r => r.json())
      .then(d => setStripeStatus_(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Check Stripe onboarding completion on return
  useEffect(() => {
    if (stripeStatus === 'success') {
      fetch('/api/vendor/stripe-connect', {
        method:'PATCH', credentials:'include',
      }).then(r => r.json()).then(d => {
        if (d.onboarded) setStripeStatus_({ connected:true, onboarded:true })
      })
    }
  }, [stripeStatus])

  // Load banks for Paystack countries
  useEffect(() => {
    if (provider !== 'paystack') return
    const country = vendorCountry === 'NG' ? 'nigeria' : vendorCountry === 'GH' ? 'ghana' : 'kenya'
    fetch(`/api/vendor/bank/banks?country=${country}`, { credentials:'include' })
      .then(r => r.json())
      .then(d => setBanks(Array.isArray(d) ? d : []))
  }, [vendorCountry, provider])

  // Auto-verify account number
  useEffect(() => {
    clearTimeout(verifyTimer.current)
    if (accountNo.length === 10 && bankCode) {
      setVerifyState('verifying')
      verifyTimer.current = setTimeout(verifyAccount, 800)
    } else if (accountNo.length > 0) {
      setVerifyState('idle')
      setResolvedName('')
    }
  }, [accountNo, bankCode])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function verifyAccount() {
    try {
      const res  = await fetch(`/api/vendor/bank/verify?account=${accountNo}&bank=${bankCode}`, { credentials:'include' })
      const data = await res.json()
      if (!res.ok || !data.accountName) { setVerifyState('failed'); return }
      setResolvedName(data.accountName)
      const resolved  = data.accountName.toLowerCase()
      const nameParts = vendorName.toLowerCase().split(' ')
      const matches   = nameParts.some(p => p.length > 2 && resolved.includes(p))
      setVerifyState(matches ? 'verified' : 'mismatch')
      setNameWarning(matches ? '' : `Account name "${data.accountName}" doesn't match your business name. Make sure this is your correct account.`)
    } catch { setVerifyState('failed') }
  }

  async function savePaystack() {
    if (!bankCode || accountNo.length !== 10) { setError('Please complete bank details'); return }
    if (verifyState === 'failed') { setError('Account not found — please check the details'); return }
    setSaving(true); setError('')
    const res  = await fetch('/api/vendor/bank', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ bankCode, bankName, accountNumber:accountNo, bankCountry:vendorCountry }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return }
    setSaved(true)
    setExisting({ bankName, accountNumber:accountNo, accountName:resolvedName, bankVerified:true })
    setSaving(false)
  }

  async function connectStripe() {
    setConnectingStripe(true); setError('')
    const res  = await fetch('/api/vendor/stripe-connect', { method:'POST', credentials:'include' })
    const data = await res.json()
    if (data.onboardingUrl) window.location.href = data.onboardingUrl
    else { setError(data.error ?? 'Failed to connect'); setConnectingStripe(false) }
  }

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
  const inputStyle = { background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:12, padding:'12px 16px', width:'100%', fontSize:14, outline:'none' } as React.CSSProperties
  const labelStyle = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.1em', color:'var(--text-faint)', marginBottom:6 }

  return (
    <DashboardShell role="vendor" userName={vendorName} navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Payment Account</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Set up your account to receive payments from clients</p>
      </div>

      <div className="p-8" style={{maxWidth:600}}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
          </div>
        ) : (
          <>
            {/* Stripe return messages */}
            {stripeStatus === 'success' && (
              <div className="mb-6 p-4 rounded-2xl flex gap-3 items-center" style={{background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)'}}>
                <span className="text-2xl">🎉</span>
                <div>
                  <div className="font-semibold text-sm" style={{color:'#10b981'}}>Payment account connected!</div>
                  <div className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>You can now receive payments from clients worldwide.</div>
                </div>
              </div>
            )}
            {stripeStatus === 'refresh' && (
              <div className="mb-6 p-4 rounded-2xl" style={{background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)'}}>
                <p className="text-sm font-semibold" style={{color:'#f59e0b'}}>Setup incomplete. Please try again.</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-2xl text-sm" style={{background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)'}}>
                {error}
              </div>
            )}

            {/* How payouts work */}
            <div className="rounded-2xl p-5 mb-6" style={{background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.2)'}}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔒</span>
                <span className="font-semibold text-sm" style={{color:'var(--text)'}}>Secure Escrow Payments</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon:'💳', label:'Client pays',   sub:'Held securely' },
                  { icon:'🎉', label:'Event done',     sub:'Client confirms' },
                  { icon:'💸', label:'You get paid',   sub:'97% transferred' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl" style={{background:'var(--bg-card)'}}>
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-xs font-bold" style={{color:'var(--text)'}}>{s.label}</div>
                    <div className="text-[10px] mt-0.5" style={{color:'var(--text-faint)'}}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paystack flow — Nigeria, Ghana, Kenya */}
            {provider === 'paystack' && (
              <>
                {(existing?.bankVerified && !saved) ? (
                  <div className="rounded-2xl p-5 mb-6 flex items-center gap-4" style={{background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)'}}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0" style={{background:'#10b981'}}>✓</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{color:'#10b981'}}>Bank account verified</div>
                      <div className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{existing.accountName} · {existing.bankName} · ••••{existing.accountNumber?.slice(-4)}</div>
                    </div>
                    <button onClick={() => setExisting(null)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
                      style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>
                      Update
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                    <h2 className="font-semibold mb-1" style={{color:'var(--text)'}}>Bank Account Details</h2>
                    <p className="text-xs mb-5" style={{color:'var(--text-faint)'}}>Enter your bank account to receive payouts · {countryInfo?.flag} {countryInfo?.label}</p>

                    {/* Bank selector */}
                    <div className="mb-4" ref={dropdownRef}>
                      <label style={labelStyle}>Bank Name *</label>
                      <div className="relative">
                        <input style={inputStyle}
                          placeholder={banks.length ? 'Search for your bank…' : 'Loading banks…'}
                          value={bankSearch}
                          onChange={e => { setBankSearch(e.target.value); setShowDropdown(true); setBankCode('') }}
                          onFocus={() => setShowDropdown(true)}/>
                        {showDropdown && filteredBanks.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 max-h-48 overflow-y-auto"
                            style={{background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'0 8px 24px rgba(0,0,0,0.15)'}}>
                            {filteredBanks.slice(0,20).map(bank => (
                              <button key={bank.code} onClick={() => { setBankCode(bank.code); setBankName(bank.name); setBankSearch(bank.name); setShowDropdown(false); setVerifyState('idle'); setResolvedName('') }}
                                className="w-full text-left px-4 py-3 text-sm border-b last:border-0 hover:opacity-70 transition-all"
                                style={{borderColor:'var(--border)', color:'var(--text)', background:'var(--bg-card)'}}>
                                {bank.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {bankCode && <p className="text-xs mt-1.5 font-semibold" style={{color:'#10b981'}}>✓ {bankName} selected</p>}
                    </div>

                    {/* Account number */}
                    <div className="mb-5">
                      <label style={labelStyle}>Account Number *</label>
                      <div className="relative">
                        <input style={{...inputStyle, paddingRight:50}}
                          placeholder="10-digit account number"
                          value={accountNo}
                          onChange={e => setAccountNo(e.target.value.replace(/\D/g,'').slice(0,10))}
                          maxLength={10}/>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">
                          {verifyState==='verifying' && <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>}
                          {verifyState==='verified' && '✅'}
                          {verifyState==='mismatch' && '⚠️'}
                          {verifyState==='failed'   && '❌'}
                        </div>
                      </div>

                      {/* Verification result */}
                      {resolvedName && (
                        <div className="mt-2 px-4 py-3 rounded-xl" style={{
                          background: verifyState==='verified' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                          border: `1px solid ${verifyState==='verified' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                        }}>
                          <div className="text-xs font-bold" style={{color: verifyState==='verified' ? '#10b981' : '#f59e0b'}}>
                            {verifyState==='verified' ? '✓ Verified: ' : '⚠ Account found: '}{resolvedName}
                          </div>
                          {nameWarning && <div className="text-xs mt-1" style={{color:'#f59e0b'}}>{nameWarning}</div>}
                        </div>
                      )}
                      {verifyState==='failed' && (
                        <div className="mt-2 px-4 py-3 rounded-xl text-xs" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171'}}>
                          ❌ Account not found. Check the account number and bank.
                        </div>
                      )}
                      {!bankCode && accountNo.length > 0 && (
                        <p className="text-xs mt-1.5" style={{color:'#f59e0b'}}>⚠ Please select your bank first</p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl mb-5" style={{background:'var(--bg-subtle)'}}>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>
                        💡 You receive <strong>97%</strong> of each payment. VowConnect takes a <strong>3% platform fee</strong> to keep the service running. Payment processing fees are paid by the client.
                      </p>
                    </div>

                    <button onClick={savePaystack}
                      disabled={saving || verifyState==='idle' || verifyState==='verifying' || verifyState==='failed' || !bankCode || accountNo.length!==10}
                      className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-40 transition-all active:scale-95"
                      style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'white',borderTopColor:'transparent'}}/>
                          Verifying & Saving…
                        </span>
                      ) : verifyState==='mismatch' ? 'Save Anyway →' : '✓ Save Bank Account'}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Stripe Connect flow — UK, US, CA etc */}
            {provider === 'stripe' && (
              <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
                <h2 className="font-semibold mb-1" style={{color:'var(--text)'}}>Connect Your Account</h2>
                <p className="text-xs mb-5" style={{color:'var(--text-faint)'}}>
                  {countryInfo?.flag} {countryInfo?.label} vendors connect via our secure international payment partner
                </p>

                {stripeStatus_?.onboarded ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl mb-4" style={{background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)'}}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">✅</div>
                    <div>
                      <div className="font-semibold text-sm" style={{color:'#10b981'}}>Payment account connected</div>
                      <div className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>You can receive payments in {countryInfo?.currency}</div>
                    </div>
                  </div>
                ) : stripeStatus_?.connected ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl mb-5" style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)'}}>
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-semibold text-sm" style={{color:'#f59e0b'}}>Setup incomplete</div>
                      <div className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Complete your account setup to receive payments</div>
                    </div>
                  </div>
                ) : null}

                <div className="p-4 rounded-xl mb-5" style={{background:'var(--bg-subtle)'}}>
                  <div className="space-y-2">
                    {[
                      '✓ Receive payments in your local currency',
                      '✓ Direct bank transfers to your account',
                      '✓ You receive 97% — we take 3% only',
                      '✓ Secure — your bank details are never shared',
                    ].map(t => <p key={t} className="text-xs" style={{color:'var(--text-muted)'}}>{t}</p>)}
                  </div>
                </div>

                <button onClick={connectStripe} disabled={connectingStripe || stripeStatus_?.onboarded}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-40 transition-all active:scale-95"
                  style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
                  {connectingStripe ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'white',borderTopColor:'transparent'}}/>
                      Connecting…
                    </span>
                  ) : stripeStatus_?.onboarded ? '✓ Account Connected' : stripeStatus_?.connected ? 'Complete Setup →' : 'Connect Payment Account →'}
                </button>
              </div>
            )}

            {/* Payout timeline */}
            <div className="mt-6 rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
              <h3 className="font-semibold text-sm mb-4" style={{color:'var(--text)'}}>When do I get paid?</h3>
              <div className="space-y-3">
                {[
                  { icon:'📅', title:'Booking confirmed',     body:'Client pays the first milestone — held in escrow' },
                  { icon:'🎪', title:'Event complete',         body:'Client confirms within 72hrs — or auto-released' },
                  { icon:'✅', title:'You request release',    body:'Tap "Release payment" on your booking page' },
                  { icon:'💸', title:'Money transferred',      body:'97% hits your account within 24hrs' },
                  { icon:'⚖️', title:'Dispute?',              body:'Raise a dispute — our team reviews within 24hrs' },
                ].map(s => (
                  <div key={s.title} className="flex gap-3 items-start">
                    <span className="text-lg flex-shrink-0 mt-0.5">{s.icon}</span>
                    <div>
                      <div className="text-xs font-bold" style={{color:'var(--text)'}}>{s.title}</div>
                      <div className="text-xs" style={{color:'var(--text-faint)'}}>{s.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}

export default function VendorBankPage() {
  return <Suspense><BankPageInner /></Suspense>
}