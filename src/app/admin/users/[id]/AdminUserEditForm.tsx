'use client'
import { useState } from 'react'

interface Props {
  user: any
  vendor: any
}

export default function AdminUserEditForm({ user, vendor }: Props) {
  const [tab, setTab] = useState<'user' | 'vendor' | 'danger'>('user')
  const [saving, setSaving] = useState(false)
  const [msg,    setMsg]    = useState('')
  const [err,    setErr]    = useState('')

  const [uForm, setUForm] = useState({
    name:     user.name,
    email:    user.email,
    phone:    user.phone ?? '',
    role:     user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    newPassword: '',
  })

  const [vForm, setVForm] = useState(vendor ? {
    businessName: vendor.businessName,
    bio:          vendor.bio ?? '',
    status:       vendor.status,
    plan:         vendor.plan,
    priceMin:     String(vendor.priceMin),
    priceMax:     String(vendor.priceMax),
    location:     vendor.location,
    whatsapp:     vendor.whatsapp,
    instagram:    vendor.instagram ?? '',
    website:      vendor.website ?? '',
    isVerified:   vendor.isVerified,
    isFeatured:   vendor.isFeatured,
    isAvailable:  vendor.isAvailable,
  } : null)

  async function saveUser(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg(''); setErr('')
    const res = await fetch(`/api/admin/users/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...uForm }),
    })
    const d = await res.json()
    if (res.ok) setMsg('User updated successfully')
    else setErr(d.error ?? 'Failed to save')
    setSaving(false)
  }

  async function saveVendor(e: React.FormEvent) {
    e.preventDefault()
    if (!vForm) return
    setSaving(true); setMsg(''); setErr('')
    const res = await fetch(`/api/admin/vendors/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId: vendor.id, ...vForm }),
    })
    const d = await res.json()
    if (res.ok) setMsg('Vendor profile updated successfully')
    else setErr(d.error ?? 'Failed to save')
    setSaving(false)
  }

  async function dangerAction(action: string) {
    if (!confirm(`Are you sure you want to ${action} this account?`)) return
    setSaving(true); setMsg(''); setErr('')
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, action }),
    })
    const d = await res.json()
    if (res.ok) setMsg(`Action "${action}" completed`)
    else setErr(d.error ?? 'Action failed')
    setSaving(false)
  }

  const TABS = [
    { id: 'user',   label: '👤 User Account' },
    ...(vendor ? [{ id: 'vendor', label: '🧣 Vendor Profile' }] : []),
    { id: 'danger', label: '⚠️ Actions' },
  ]

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-theme text-theme text-sm outline-none focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]/30 transition-all'
  const labelCls = 'block text-xs font-semibold text-theme-muted uppercase tracking-wide mb-1.5'

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${tab === t.id ? 'border-[#C8A96E] text-[#C8A96E]' : 'border-transparent text-theme-muted hover:text-theme'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {msg && <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">{msg}</div>}
        {err && <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm">{err}</div>}

        {/* USER TAB */}
        {tab === 'user' && (
          <form onSubmit={saveUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input className={inputCls} value={uForm.name} onChange={e => setUForm(p => ({...p, name: e.target.value}))} required/>
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" value={uForm.email} onChange={e => setUForm(p => ({...p, email: e.target.value}))} required/>
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={uForm.phone} onChange={e => setUForm(p => ({...p, phone: e.target.value}))} placeholder="+44 7911..."/>
              </div>
              <div>
                <label className={labelCls}>Role</label>
                <select className={inputCls} value={uForm.role} onChange={e => setUForm(p => ({...p, role: e.target.value}))}>
                  <option value="CLIENT">CLIENT</option>
                  <option value="VENDOR">VENDOR</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>New Password <span className="font-normal text-theme-faint">(leave blank to keep current)</span></label>
              <input className={inputCls} type="password" value={uForm.newPassword} onChange={e => setUForm(p => ({...p, newPassword: e.target.value}))} placeholder="••••••••" minLength={8}/>
            </div>
            <div className="flex gap-6">
              {[
                { key: 'isActive',      label: 'Account Active' },
                { key: 'emailVerified', label: 'Email Verified' },
              ].map(f => (
                <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={(uForm as any)[f.key]}
                    onChange={e => setUForm(p => ({...p, [f.key]: e.target.checked}))}/>
                  <span className="text-sm text-theme">{f.label}</span>
                </label>
              ))}
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : 'Save User Changes'}
            </button>
          </form>
        )}

        {/* VENDOR TAB */}
        {tab === 'vendor' && vForm && (
          <form onSubmit={saveVendor} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Business Name</label>
                <input className={inputCls} value={vForm.businessName} onChange={e => setVForm(p => p ? {...p, businessName: e.target.value} : p)} required/>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Bio</label>
                <textarea className={inputCls} rows={4} value={vForm.bio} onChange={e => setVForm(p => p ? {...p, bio: e.target.value} : p)}/>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={vForm.status} onChange={e => setVForm(p => p ? {...p, status: e.target.value} : p)}>
                  <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Plan</label>
                <select className={inputCls} value={vForm.plan} onChange={e => setVForm(p => p ? {...p, plan: e.target.value} : p)}>
                  <option value="free">free</option>
                  <option value="pro">pro</option>
                  <option value="premium">premium</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Min Price</label>
                <input className={inputCls} type="number" value={vForm.priceMin} onChange={e => setVForm(p => p ? {...p, priceMin: e.target.value} : p)}/>
              </div>
              <div>
                <label className={labelCls}>Max Price</label>
                <input className={inputCls} type="number" value={vForm.priceMax} onChange={e => setVForm(p => p ? {...p, priceMax: e.target.value} : p)}/>
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input className={inputCls} value={vForm.location} onChange={e => setVForm(p => p ? {...p, location: e.target.value} : p)}/>
              </div>
              <div>
                <label className={labelCls}>WhatsApp</label>
                <input className={inputCls} value={vForm.whatsapp} onChange={e => setVForm(p => p ? {...p, whatsapp: e.target.value} : p)}/>
              </div>
              <div>
                <label className={labelCls}>Instagram</label>
                <input className={inputCls} value={vForm.instagram} onChange={e => setVForm(p => p ? {...p, instagram: e.target.value} : p)} placeholder="@handle"/>
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input className={inputCls} value={vForm.website} onChange={e => setVForm(p => p ? {...p, website: e.target.value} : p)} placeholder="https://..."/>
              </div>
            </div>
            <div className="flex gap-6">
              {[
                { key: 'isVerified',  label: '✓ Verified' },
                { key: 'isFeatured',  label: '⭐ Featured' },
                { key: 'isAvailable', label: '🟢 Available' },
              ].map(f => (
                <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={(vForm as any)[f.key]}
                    onChange={e => setVForm(p => p ? {...p, [f.key]: e.target.checked} : p)}/>
                  <span className="text-sm text-theme">{f.label}</span>
                </label>
              ))}
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Vendor Changes'}
            </button>
          </form>
        )}

        {/* DANGER ZONE */}
        {tab === 'danger' && (
          <div className="space-y-4">
            <p className="text-sm text-theme-muted">These actions are immediate and logged to the admin audit trail.</p>
            <div className="grid gap-3">
              {[
                { action: 'suspend',    label: 'Suspend Account',    desc: 'Block login. Reversible.', color: 'amber' },
                { action: 'activate',   label: 'Activate Account',   desc: 'Re-enable a suspended account.', color: 'green' },
                { action: 'verify_email', label: 'Mark Email Verified', desc: 'Manually verify email without a link.', color: 'blue' },
                { action: 'delete',     label: 'Delete Account',     desc: 'Soft delete. Data preserved.', color: 'red' },
              ].map(a => (
                <div key={a.action} className={`flex items-center justify-between p-4 rounded-2xl border ${
                  a.color === 'red' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900' :
                  a.color === 'amber' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' :
                  a.color === 'green' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' :
                  'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                }`}>
                  <div>
                    <div className="font-semibold text-theme text-sm">{a.label}</div>
                    <div className="text-xs text-theme-muted mt-0.5">{a.desc}</div>
                  </div>
                  <button onClick={() => dangerAction(a.action)} disabled={saving}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                      a.color === 'red' ? 'bg-rose-600 hover:bg-rose-700 text-white' :
                      a.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                      a.color === 'green' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                      'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                    {a.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
