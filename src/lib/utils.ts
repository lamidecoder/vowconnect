import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'NGN') {
  const localeMap: Record<string, string> = {
    NGN: 'en-NG', GBP: 'en-GB', USD: 'en-US', EUR: 'en-EU',
  }
  return new Intl.NumberFormat(localeMap[currency] ?? 'en-NG', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date))
}

export function formatRelative(date: Date | string) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)   return `${days}d ago`
  return formatDate(d)
}

export function getWhatsAppLink(phone: string, vendorName: string) {
  const msg = encodeURIComponent(
    `Hi ${vendorName}! I found you on VowConnect and I'd love to book you for my event. Are you available?`
  )
  const clean = phone.replace(/\D/g, '').replace(/^0/, '234')
  return `https://wa.me/${clean}?text=${msg}`
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING:        'badge-sand',
    ACCEPTED:       'badge-green',
    DECLINED:       'badge-red',
    COMPLETED:      'badge-ink',
    CANCELLED:      'badge-gray',
    PENDING_REVIEW: 'badge-sand',
    APPROVED:       'badge-green',
    REJECTED:       'badge-red',
    SUSPENDED:      'badge-red',
  }
  return map[status] ?? 'badge-gray'
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const COUNTRIES = [
  { code: 'NG', name: 'Nigeria',        flag: '🇳🇬', currency: 'NGN' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  { code: 'US', name: 'United States',  flag: '🇺🇸', currency: 'USD' },
  { code: 'CA', name: 'Canada',         flag: '🇨🇦', currency: 'CAD' },
  { code: 'GH', name: 'Ghana',          flag: '🇬🇭', currency: 'GHS' },
]
