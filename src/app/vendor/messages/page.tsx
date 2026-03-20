import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MessagingUI from '@/components/messaging/MessagingUI'
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

export default async function VendorMessagesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/vendor/messages')
  return (
    <DashboardShell role="vendor" userName={user.name} navItems={NAV}>
      <MessagingUI currentUserId={user.id} currentRole={user.role as 'VENDOR'} />
    </DashboardShell>
  )
}


