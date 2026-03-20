'use client'
import { useEffect, useRef, useState } from 'react'
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

const MAX = 5

interface Media { id:string; url:string; thumbnailUrl?:string; caption?:string; order:number; mediaType:string }

export default function VendorPortfolioPage() {
  const [items,     setItems]     = useState<Media[]>([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const [editId,    setEditId]    = useState<string|null>(null)
  const [editCap,   setEditCap]   = useState('')
  const [preview,   setPreview]   = useState<Media|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/portfolio', { credentials:'include' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.images)) setItems(d.images); setLoading(false) })
  }, [])

  async function upload(files: FileList|null) {
    if (!files?.length) return
    if (items.length >= MAX) { setError(`Max ${MAX} items allowed`); return }
    setUploading(true); setError('')
    for (const file of Array.from(files).slice(0, MAX-items.length)) {
      const isVideo = file.type.startsWith('video/')
      if (file.size > (isVideo ? 100 : 10)*1024*1024) { setError(`${isVideo?'Videos':'Images'} must be under ${isVideo?'100MB':'10MB'}`); continue }
      const reader = new FileReader()
      await new Promise<void>(resolve => {
        reader.onload = async () => {
          const res = await fetch('/api/portfolio/upload', {
            method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
            body: JSON.stringify({ file:reader.result, mediaType:isVideo?'video':'image', filename:file.name }),
          })
          if (res.ok) { const item = await res.json(); setItems(p => [...p, item]) }
          else { const d = await res.json(); setError(d.error ?? 'Upload failed') }
          resolve()
        }
        reader.readAsDataURL(file)
      })
    }
    setUploading(false)
  }

  async function del(id: string) {
    if (!confirm('Remove this from your portfolio?')) return
    await fetch(`/api/portfolio/${id}`, { method:'DELETE', credentials:'include' })
    setItems(p => p.filter(i => i.id !== id))
  }

  async function saveCaption(id: string) {
    await fetch(`/api/portfolio/${id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ caption:editCap }),
    })
    setItems(p => p.map(i => i.id===id ? {...i, caption:editCap} : i))
    setEditId(null)
  }

  if (loading) return (
    <DashboardShell role="vendor" userName="Vendor" navItems={NAV}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{borderColor:'#C8A96E',borderTopColor:'transparent'}}/>
      </div>
    </DashboardShell>
  )

  return (
    <DashboardShell role="vendor" userName="Vendor" navItems={NAV}>
      <div className="px-8 py-6 border-b" style={{borderColor:'var(--border)'}}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'#C8A96E'}}>Vendor</div>
        <h1 className="font-display text-3xl" style={{color:'var(--text)'}}>Portfolio</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>{items.length}/{MAX} items · Showcase your best work</p>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)'}}>
            {error}
          </div>
        )}

        {/* Upload area */}
        {items.length < MAX && (
          <div
            onClick={() => fileRef.current?.click()}
            className="relative mb-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:opacity-80 flex flex-col items-center justify-center py-12"
            style={{borderColor:'rgba(200,169,110,0.4)', background:'rgba(200,169,110,0.04)'}}>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden"
              onChange={e => upload(e.target.files)} />
            <div className="text-4xl mb-3">{uploading ? '⏳' : '📸'}</div>
            <p className="font-semibold" style={{color:'var(--text)'}}>
              {uploading ? 'Uploading…' : 'Click to upload photos or videos'}
            </p>
            <p className="text-sm mt-1" style={{color:'var(--text-faint)'}}>
              Up to {MAX-items.length} more · Images 10MB · Videos 100MB
            </p>
          </div>
        )}

        {/* Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-20">🖼️</div>
            <p className="font-semibold" style={{color:'var(--text-muted)'}}>No portfolio items yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer"
                style={{background:'var(--bg-subtle)'}}>
                {item.mediaType === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt={item.caption ?? ''} className="w-full h-full object-cover"
                    onClick={() => setPreview(item)} />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-3"
                  style={{background:'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'}}>
                  {editId === item.id ? (
                    <div className="flex gap-1">
                      <input value={editCap} onChange={e => setEditCap(e.target.value)}
                        className="flex-1 px-2 py-1 rounded-lg text-xs text-white outline-none"
                        style={{background:'rgba(255,255,255,0.15)'}}
                        placeholder="Add caption…" onClick={e => e.stopPropagation()} />
                      <button onClick={e => { e.stopPropagation(); saveCaption(item.id) }}
                        className="text-xs px-2 py-1 rounded-lg font-bold text-white" style={{background:'#C8A96E'}}>✓</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button onClick={e => { e.stopPropagation(); setEditId(item.id); setEditCap(item.caption??'') }}
                        className="text-xs text-white/70 hover:text-white truncate flex-1 text-left">
                        {item.caption ? item.caption : '+ Add caption'}
                      </button>
                      <button onClick={e => { e.stopPropagation(); del(item.id) }}
                        className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                        style={{background:'rgba(239,68,68,0.3)', color:'#f87171'}}>✕</button>
                    </div>
                  )}
                </div>
                {item.mediaType === 'video' && (
                  <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full text-white font-bold"
                    style={{background:'rgba(0,0,0,0.6)'}}>▶ Video</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:'rgba(0,0,0,0.9)'}} onClick={() => setPreview(null)}>
          <img src={preview.url} alt={preview.caption ?? ''} className="max-w-full max-h-full rounded-2xl object-contain" />
          {preview.caption && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-white/70 bg-black/60 px-4 py-2 rounded-full">
              {preview.caption}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  )
}