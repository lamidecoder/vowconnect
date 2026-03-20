'use client'
import { useEffect, useState, useRef } from 'react'

interface Vendor {
  id: string; businessName: string; category: { name: string; emoji: string }
  location: string; country: string; priceMin: number; currency: string
  latitude: number | null; longitude: number | null
  isVerified: boolean; isFeatured: boolean
  avgRating?: number; reviewCount?: number
  portfolio: { url: string }[]
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦', GBP: '£', USD: '$', EUR: '€', CAD: 'CA$', AUD: 'A$', GHS: 'GH₵', KES: 'KSh', ZAR: 'R',
}

declare global { interface Window { google: any; initMap: () => void } }

export default function MapPage() {
  const mapRef    = useRef<HTMLDivElement>(null)
  const [vendors, setVendors]   = useState<Vendor[]>([])
  const [selected, setSelected] = useState<Vendor | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLoc, setUserLoc]   = useState<{ lat: number; lng: number } | null>(null)
  const [filter, setFilter]     = useState({ category: '', country: '' })
  const markersRef = useRef<any[]>([])
  const mapInstance = useRef<any>(null)

  // Fetch vendors with coordinates
  useEffect(() => {
    fetch('/api/vendors?hasCoords=true&limit=200')
      .then(r => r.json())
      .then(data => setVendors(Array.isArray(data.vendors) ? data.vendors : []))
  }, [])

  // Load Google Maps
  useEffect(() => {
    if (window.google) { setMapLoaded(true); return }
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''
    if (!key) { setMapLoaded(false); return }
    window.initMap = () => setMapLoaded(true)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap`
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Get user location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }, [])

  // Init map and pins
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const center = userLoc ?? { lat: 6.5244, lng: 3.3792 } // Lagos default

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center, zoom: userLoc ? 12 : 6,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#E0F0FF' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#F4EDD8' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#FAF6EE' }] },
      ],
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
    })

    // User location marker
    if (userLoc) {
      new window.google.maps.Marker({
        position: userLoc, map: mapInstance.current,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4F46E5', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
        title: 'Your location',
      })
    }

    placeVendorMarkers(vendors)
  }, [mapLoaded, userLoc]) // eslint-disable-line

  function placeVendorMarkers(vendorList: Vendor[]) {
    if (!mapInstance.current) return
    // Clear old
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const filtered = vendorList.filter(v => {
      if (!v.latitude || !v.longitude) return false
      if (filter.category && v.category.name !== filter.category) return false
      if (filter.country  && v.country  !== filter.country) return false
      return true
    })

    filtered.forEach(vendor => {
      const marker = new window.google.maps.Marker({
        position: { lat: vendor.latitude!, lng: vendor.longitude! },
        map: mapInstance.current,
        title: vendor.businessName,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
              <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z"
                fill="${vendor.isFeatured ? '#C9941A' : '#5C0F30'}"/>
              <text x="18" y="24" text-anchor="middle" font-size="16" fill="white">${vendor.category.emoji}</text>
            </svg>`)}`,
          scaledSize: new window.google.maps.Size(36, 44),
          anchor: new window.google.maps.Point(18, 44),
        },
      })

      marker.addListener('click', () => setSelected(vendor))
      markersRef.current.push(marker)
    })
  }

  // Re-pin when filter or vendors change
  useEffect(() => {
    if (mapLoaded) placeVendorMarkers(vendors)
  }, [vendors, filter, mapLoaded]) // eslint-disable-line

  const categories = [...new Set(vendors.map(v => v.category.name))]
  const countries  = [...new Set(vendors.map(v => v.country))]

  const noMapsKey = !process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && typeof window !== 'undefined'

  return (
    <div className="flex flex-col h-screen -m-8" style={{ margin: '-2rem' }}>
      {/* Top bar */}
      <div className="bg-white border-b border-[var(--border)] px-5 py-3 flex items-center gap-3 flex-wrap shrink-0 z-10">
        <div className="font-display font-bold text-theme">🗺️ Vendor Map</div>
        <span className="text-theme-faint text-sm">·</span>
        <span className="text-theme-muted text-sm">{vendors.filter(v => v.latitude).length} vendors with locations</span>

        <div className="flex gap-2 ml-auto flex-wrap">
          <select value={filter.category} onChange={e => setFilter(p => ({ ...p, category: e.target.value }))}
            className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 bg-white text-theme outline-none">
            <option value="">All categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filter.country} onChange={e => setFilter(p => ({ ...p, country: e.target.value }))}
            className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 bg-white text-theme outline-none">
            <option value="">All countries</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          {noMapsKey ? (
            <div className="absolute inset-0 flex items-center justify-center bg-theme-subtle">
              <div className="text-center p-8">
                <div className="text-4xl mb-3">🗺️</div>
                <div className="font-semibold text-theme mb-2">Google Maps API key required</div>
                <div className="text-theme-muted text-sm">Add <code className="bg-theme-subtle px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> to your .env.local</div>
                <div className="text-theme-faint text-xs mt-2">Get a free key at console.cloud.google.com</div>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="absolute inset-0" />
          )}

          {/* Zoom to user button */}
          {userLoc && mapLoaded && (
            <button onClick={() => mapInstance.current?.panTo(userLoc)}
              className="absolute bottom-4 right-4 bg-white shadow-lg border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-semibold text-theme flex items-center gap-1.5 hover:bg-theme-subtle">
              📍 My Location
            </button>
          )}
        </div>

        {/* Side panel */}
        <div className="w-72 xl:w-80 bg-white border-l border-[var(--border)] flex flex-col overflow-hidden">
          {selected ? (
            <div className="flex-1 overflow-y-auto">
              {/* Selected vendor card */}
              <div className="relative">
                <div className="h-40 bg-gradient-to-br from-[#F5ECD8] to-[#EAD5B0]">
                  {selected.portfolio[0] ? (
                    <img src={selected.portfolio[0].url} alt={selected.businessName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">{selected.category.emoji}</div>
                  )}
                </div>
                <button onClick={() => setSelected(null)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-theme-muted text-sm shadow">✕</button>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="font-semibold text-theme leading-tight flex-1">{selected.businessName}</h3>
                  {selected.isVerified && <span className="badge badge-green text-xs shrink-0">✓</span>}
                  {selected.isFeatured && <span className="badge badge-gold text-xs shrink-0">⭐</span>}
                </div>
                <div className="text-xs text-theme-muted mb-3">{selected.category.emoji} {selected.category.name} · 📍 {selected.location}</div>
                {selected.avgRating && (
                  <div className="text-xs text-theme-muted mb-3">⭐ {selected.avgRating.toFixed(1)} ({selected.reviewCount} reviews)</div>
                )}
                <div className="text-[#C8A96E] font-semibold text-sm mb-4">
                  {CURRENCY_SYMBOLS[selected.currency] ?? ''}{selected.priceMin.toLocaleString()}+
                </div>
                <a href={`/vendors/${selected.id}`}
                  className="btn-primary w-full justify-center text-sm py-2.5 block text-center">
                  View Profile →
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-white/8">
                <div className="text-sm font-semibold text-theme">Vendors near you</div>
                <div className="text-xs text-theme-faint mt-0.5">Click a pin to see details</div>
              </div>
              <div className="divide-y divide-white/8">
                {vendors.filter(v => v.latitude).slice(0, 20).map(v => (
                  <button key={v.id} onClick={() => {
                    setSelected(v)
                    mapInstance.current?.panTo({ lat: v.latitude!, lng: v.longitude! })
                    mapInstance.current?.setZoom(14)
                  }} className="w-full text-left px-4 py-3 hover:bg-theme-subtle transition-colors flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F5ECD8] to-[#EAD5B0] flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      {v.portfolio[0] ? <img src={v.portfolio[0].url} className="w-full h-full object-cover" alt="" /> : v.category.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-theme text-sm truncate">{v.businessName}</div>
                      <div className="text-theme-faint text-xs truncate">📍 {v.location}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
