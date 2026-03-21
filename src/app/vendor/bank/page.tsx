'use client'
import { useState, useEffect, useRef } from 'react'
import DashboardShell from '@/components/layout/DashboardShell'

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
]

interface Bank { id: number; name: string; code: string; country: string }

const COUNTRIES = [
  { code:'NG', label:'Nigeria',  flag:'🇳🇬', currency:'NGN', paystackCountry:'nigeria'  },
  { code:'GH', label:'Ghana',    flag:'🇬🇭', currency:'GHS', paystackCountry:'ghana'    },
  { code:'KE', label:'Kenya',    flag:'🇰🇪', currency:'KES', paystackCountry:'kenya'    },
]

type VerifyState = 'idle' | 'verifying' | 'verified' | 'failed' | 'mismatch'

export default function VendorBankPage() {
  const [existing,    setExisting]    = useState<any>(null)
  const [banks,       setBanks]       = useState<Bank[]>([])
  const [bankSearch,  setBankSearch]  = useState('')
  const [showDropdown,setShowDropdown]= useState(false)
  const [country,     setCountry]     = useState('NG')
  const [bankCode,    setBankCode]    = useState('')
  const [bankName,    setBankName]    = useState('')
  const [accountNo,   setAccountNo]   = useState('')
  const [verifyState, setVerifyState] = useState<VerifyState>('idle')
  const [resolvedName,setResolvedName]= useState('')
  const [nameWarning, setNameWarning] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')
  const [vendorName,  setVendorName]  = useState('')
  const verifyTimer = useRef<NodeJS.Timeout>()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load existing bank details
    fetch('/api/vendor/bank', { credentials:'include' })
      .then(r => r.json())
      .then(d => {
        if (d.bankVerified) setExisting(d)
        if (d.bankCountry)  setCountry(d.bankCountry)
      })
      .catch(() => {})

    // Load vendor name for matching
    fetch('/api/vendors/me', { credentials:'include' })
      .then(r => r.json())
      .then(d => setVendorName(d.businessName ?? ''))
      .catch(() => {})
  }, [])

  // Load banks when country changes
  useEffect(() => {
    setBanks([]); setBankCode(''); setBankName(''); setAccountNo(''); setVerifyState('idle'); setResolvedName('')
    const pc = COUNTRIES.find(c => c.code === country)?.paystackCountry ?? 'nigeria'
    fetch(`/api/vendor/bank/banks?country=${pc}`, { credentials:'include' })
      .then(r => r.json())
      .then(d => setBanks(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [country])

  // Auto-verify account number when 10 digits entered
  useEffect(() => {
    clearTimeout(verifyTimer.current)
    if (accountNo.length === 10 && bankCode) {
      setVerifyState('verifying')
      verifyTimer.current = setTimeout(() => verifyAccount(), 800)
    } else if (accountNo.length > 0 && accountNo.length < 10) {
      setVerifyState('idle')
      setResolvedName('')
    }
  }, [accountNo, bankCode])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function verifyAccount() {
    if (!bankCode || accountNo.length !== 10) return
    try {
      const res  = await fetch(`/api/vendor/bank/verify?account=${accountNo}&bank=${bankCode}`, { credentials:'include' })
      const data = await res.json()

      if (!res.ok || !data.accountName) {
        setVerifyState('failed')
        setResolvedName('')
        return
      }

      setResolvedName(data.accountName)

      // Check if account name roughly matches vendor/business name
      const resolved  = data.accountName.toLowerCase()
      const business  = vendorName.toLowerCase()
      const firstName = vendorName.split(' ')[0]?.toLowerCase() ?? ''

      if (!resolved.includes(firstName) && !business.split(' ').some((w: string) => resolved.includes(w))) {
        setVerifyState('mismatch')
        setNameWarning(`Account name "${data.accountName}" doesn't match your business name. Make sure this is your correct account.`)
      } else {
        setVerifyState('verified')
        setNameWarning('')
      }
    } catch {
      setVerifyState('failed')
    }
  }

  function selectBank(bank: Bank) {
    setBankCode(bank.code)
    setBankName(bank.name)
    setBankSearch(bank.name)
    setShowDropdown(false)
    setVerifyState('idle')
    setResolvedName('')
  }

  async function save() {
    if (verifyState === 'failed') { setError('Please enter a valid account number'); return }
    if (!bankCode || accountNo.length !== 10) { setError('Please complete bank details'); return }
    if (verifyState !== 'verified' && verifyState !== 'mismatch') { setError('Please wait for account verification'); return }

    setSaving(true); setError('')
    const res = await fetch('/api/vendor/bank', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ bankCode, bankName, accountNumber: accountNo, bankCountry: country }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return }

    setSaved(true)
    setExisting({ bankName, accountNumber: accountNo, accountName: resolvedName, bankVerified: true, bankCountry: country })
    setSaving(false)
  }

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
  const inputStyle = { background:'var(--bg-subtle)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:12, padding:'12px 16px', width:'100%', fontSize:14, outline:'none' } as React.CSSProperties
  const labelStyle = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.1em', color:'var(--text-faint)', marginBottom:6 }

  return (
    <DashboardShell role="vendor" userName="" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Payment Account</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Add your bank account to receive payments</p>
      </div>

      <div className="p-8" style={{maxWidth:600}}>

        {/* Why this matters */}
        <div className="rounded-2xl p-5 mb-6 flex gap-4" style={{background:'rgba(200,169,110,0.08)', border:'1px solid rgba(200,169,110,0.2)'}}>
          <span className="text-2xl flex-shrink-0">🔒</span>
          <div>
            <div className="font-semibold text-sm mb-1" style={{color:'var(--text)'}}>Secure escrow payments</div>
            <p className="text-xs leading-relaxed" style={{color:'var(--text-muted)'}}>
              Client payments are held securely until your event is confirmed complete. Your earnings are then transferred automatically to this account. You must verify your bank account before accepting paid bookings.
            </p>
          </div>
        </div>

        {/* Existing verified account */}
        {existing?.bankVerified && !saved && (
          <div className="rounded-2xl p-5 mb-6 flex items-center gap-4" style={{background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)'}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0" style={{background:'rgba(16,185,129,0.8)'}}>✓</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm" style={{color:'#10b981'}}>Bank account verified</div>
              <div className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{existing.accountName} · {existing.bankName} · ••••{existing.accountNumber?.slice(-4)}</div>
            </div>
            <button onClick={() => setExisting(null)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{background:'var(--bg-subtle)', color:'var(--text-muted)'}}>
              Update
            </button>
          </div>
        )}

        {/* Success state */}
        {saved && (
          <div className="rounded-2xl p-5 mb-6 flex items-center gap-4" style={{background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)'}}>
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-semibold text-sm" style={{color:'#10b981'}}>Bank account saved successfully!</div>
              <div className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>You can now accept paid bookings. Payments will be transferred to {resolvedName}.</div>
            </div>
          </div>
        )}

        {/* Form */}
        {(!existing?.bankVerified || saved === false) && (
          <div className="rounded-2xl p-6" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <h2 className="font-semibold mb-6" style={{color:'var(--text)'}}>Bank Details</h2>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)'}}>
                {error}
              </div>
            )}

            {/* Country */}
            <div className="mb-4">
              <label style={labelStyle}>Account Country</label>
              <div className="grid grid-cols-3 gap-2">
                {COUNTRIES.map(c => (
                  <button key={c.code} onClick={() => setCountry(c.code)}
                    className="p-3 rounded-xl text-sm font-semibold border transition-all"
                    style={{
                      background: country===c.code ? 'rgba(200,169,110,0.15)' : 'var(--bg-subtle)',
                      borderColor: country===c.code ? '#C8A96E' : 'var(--border)',
                      color: country===c.code ? '#C8A96E' : 'var(--text-muted)',
                    }}>
                    {c.flag} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank selector with search */}
            <div className="mb-4" ref={dropdownRef}>
              <label style={labelStyle}>Bank Name *</label>
              <div className="relative">
                <input
                  style={inputStyle}
                  placeholder={banks.length ? 'Search for your bank…' : 'Loading banks…'}
                  value={bankSearch}
                  onChange={e => { setBankSearch(e.target.value); setShowDropdown(true); setBankCode(''); setVerifyState('idle') }}
                  onFocus={() => setShowDropdown(true)}
                />
                {showDropdown && filteredBanks.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 max-h-52 overflow-y-auto"
                    style={{background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'0 8px 30px rgba(0,0,0,0.2)'}}>
                    {filteredBanks.slice(0,20).map(bank => (
                      <button key={bank.code} onClick={() => selectBank(bank)}
                        className="w-full text-left px-4 py-3 text-sm hover:opacity-80 transition-all border-b last:border-0"
                        style={{borderColor:'var(--border)', color:'var(--text)'}}>
                        {bank.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {bankCode && <div className="text-xs mt-1.5" style={{color:'#10b981'}}>✓ {bankName} selected</div>}
            </div>

            {/* Account number with live verification */}
            <div className="mb-4">
              <label style={labelStyle}>Account Number *</label>
              <div className="relative">
                <input
                  style={{...inputStyle, paddingRight:48}}
                  placeholder="Enter 10-digit account number"
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value.replace(/\D/g,'').slice(0,10))}
                  maxLength={10}
                />
                {/* Verification indicator */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {verifyState === 'verifying' && (
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
                  )}
                  {verifyState === 'verified' && <span className="text-lg">✅</span>}
                  {verifyState === 'mismatch' && <span className="text-lg">⚠️</span>}
                  {verifyState === 'failed'   && <span className="text-lg">❌</span>}
                </div>
              </div>

              {/* Resolved account name */}
              {resolvedName && (
                <div className="mt-2 px-3 py-2 rounded-xl flex items-center gap-2"
                  style={{
                    background: verifyState==='verified' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                    border: `1px solid ${verifyState==='verified' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                  }}>
                  <span>{verifyState==='verified' ? '✓' : '⚠'}</span>
                  <div>
                    <div className="text-xs font-bold" style={{color: verifyState==='verified' ? '#10b981' : '#f59e0b'}}>
                      {resolvedName}
                    </div>
                    {nameWarning && <div className="text-xs mt-0.5" style={{color:'#f59e0b'}}>{nameWarning}</div>}
                    {verifyState==='verified' && <div className="text-xs" style={{color:'var(--text-faint)'}}>Account verified ✓</div>}
                  </div>
                </div>
              )}

              {verifyState === 'failed' && (
                <div className="mt-2 px-3 py-2 rounded-xl text-xs" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171'}}>
                  ❌ Account not found. Please check the number and bank selected.
                </div>
              )}

              {!bankCode && accountNo.length > 0 && (
                <div className="text-xs mt-1.5" style={{color:'#f59e0b'}}>⚠ Please select your bank first</div>
              )}
            </div>

            {/* Important notice */}
            <div className="mb-6 p-4 rounded-xl" style={{background:'var(--bg-subtle)', border:'1px solid var(--border)'}}>
              <div className="text-xs font-bold mb-2" style={{color:'var(--text)'}}>Important</div>
              <ul className="text-xs space-y-1.5" style={{color:'var(--text-muted)'}}>
                <li>• Payments are transferred within 24hrs of event confirmation</li>
                <li>• VowConnect deducts a 3% platform fee before transfer</li>
                <li>• Ensure the account belongs to you — fraud will result in permanent ban</li>
                <li>• You can update your account details at any time</li>
              </ul>
            </div>

            <button onClick={save}
              disabled={saving || (verifyState !== 'verified' && verifyState !== 'mismatch') || !bankCode || accountNo.length !== 10}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-40 transition-all"
              style={{background:'linear-gradient(135deg,#C8A96E,#8B6914)'}}>
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'white',borderTopColor:'transparent'}}/>
                  Verifying & Saving…
                </span>
              ) : verifyState === 'mismatch' ? (
                'Save Anyway (Account Name Mismatch)'
              ) : (
                '✓ Save Bank Account'
              )}
            </button>
          </div>
        )}

        {/* Payout info */}
        <div className="mt-6 rounded-2xl p-5" style={{background:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <h3 className="font-semibold text-sm mb-4" style={{color:'var(--text)'}}>How payouts work</h3>
          <div className="space-y-3">
            {[
              { icon:'💳', title:'Client pays',         body:'Payment is held securely in escrow on VowConnect' },
              { icon:'🎉', title:'Event complete',       body:'Client confirms the event went well' },
              { icon:'⏱️', title:'72hr window',          body:'Client has 72hrs to raise a dispute, else auto-released' },
              { icon:'💸', title:'You get paid',         body:'97% transferred to your account automatically' },
              { icon:'📊', title:'VowConnect takes 3%',  body:'Our platform fee, deducted before transfer' },
            ].map(s => (
              <div key={s.title} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 mt-0.5">{s.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{color:'var(--text)'}}>{s.title}</div>
                  <div className="text-xs" style={{color:'var(--text-faint)'}}>{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}