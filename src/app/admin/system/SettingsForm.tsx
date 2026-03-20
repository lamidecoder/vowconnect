'use client'
import { useState } from 'react'

interface Props { settings: Record<string, string> }

export default function SystemSettingsForm({ settings }: Props) {
  const [form, setForm] = useState({
    maintenance_mode:        settings.maintenance_mode        ?? 'false',
    max_portfolio_images:    settings.max_portfolio_images    ?? '10',
    platform_fee_pct:        settings.platform_fee_pct        ?? '0',
    homepage_hero_text:      settings.homepage_hero_text      ?? '',
    vendor_approval_required: settings.vendor_approval_required ?? 'true',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/admin/system', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaved(true); setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const card: React.CSSProperties = { background: '#1a1a26', border: '1px solid #2a2a3d', borderRadius: 14, padding: 24, marginBottom: 16 }
  const label: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: '#6b6b8a', marginBottom: 6 }
  const input: React.CSSProperties = { width: '100%', background: '#12121a', border: '1px solid #2a2a3d', borderRadius: 10, padding: '10px 14px', color: '#f0f0f8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }

  return (
    <form onSubmit={handleSave}>
      {saved && <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, color: '#10b981', fontSize: 14 }}>✅ Settings saved</div>}

      <div style={card}>
        <h2 style={{ color: '#f0f0f8', fontWeight: 600, marginBottom: 16 }}>Platform Controls</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={label}>Maintenance Mode</label>
          <select value={form.maintenance_mode} onChange={e => setForm(p => ({ ...p, maintenance_mode: e.target.value }))} style={input}>
            <option value="false">🟢 Live — accepting visitors</option>
            <option value="true">🔴 Maintenance — show coming soon</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={label}>Vendor Approval Required</label>
          <select value={form.vendor_approval_required} onChange={e => setForm(p => ({ ...p, vendor_approval_required: e.target.value }))} style={input}>
            <option value="true">✅ Manual review before going live</option>
            <option value="false">⚡ Auto-approve all vendors</option>
          </select>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ color: '#f0f0f8', fontWeight: 600, marginBottom: 16 }}>Limits & Fees</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={label}>Max Portfolio Images (free)</label>
            <input type="number" min="1" max="50" value={form.max_portfolio_images}
              onChange={e => setForm(p => ({ ...p, max_portfolio_images: e.target.value }))} style={input} />
          </div>
          <div>
            <label style={label}>Platform Fee % (0 = disabled)</label>
            <input type="number" min="0" max="20" step="0.5" value={form.platform_fee_pct}
              onChange={e => setForm(p => ({ ...p, platform_fee_pct: e.target.value }))} style={input} />
            <p style={{ color: '#4a4a6a', fontSize: 11, marginTop: 4 }}>Set to 0 until you activate escrow payments</p>
          </div>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ color: '#f0f0f8', fontWeight: 600, marginBottom: 16 }}>Homepage Content</h2>
        <div>
          <label style={label}>Hero Tagline (optional override)</label>
          <input value={form.homepage_hero_text}
            onChange={e => setForm(p => ({ ...p, homepage_hero_text: e.target.value }))}
            placeholder="Leave blank to use default"
            style={input} />
        </div>
      </div>

      <button type="submit" disabled={saving}
        style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', border: 'none', borderRadius: 12, padding: '14px 32px', color: 'white', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, width: '100%' }}>
        {saving ? 'Saving...' : 'Save All Settings →'}
      </button>
    </form>
  )
}
