import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MessagingUI from '@/components/messaging/MessagingUI'
import DashboardShell from '@/components/layout/DashboardShell'

const NAV = [
  { href:'/client/dashboard',  label:'Dashboard',     icon:'🏠' },
  { href:'/client/bookings',   label:'My Bookings',   icon:'📅' },
  { href:'/client/wedding',    label:'Wedding Hub',   icon:'💍' },
  { href:'/client/messages',   label:'Messages',      icon:'💬' },
  { href:'/client/quotes',     label:'Quotes',        icon:'📄' },
  { href:'/client/favorites',  label:'Saved Vendors', icon:'❤️' },
  { href:'/vendors',           label:'Browse Vendors',icon:'🔍' },
  { href:'/client/asoebi',     label:'Asoebi Groups', icon:'👘' },
  { href:'/client/profile',    label:'Profile',       icon:'✏️' },
  { href:'/support',           label:'Support',       icon:'🎫' },
]

export default async function ClientMessagesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/client/messages')
  return (
    <DashboardShell role="client" userName={user.name} navItems={NAV}>
      <MessagingUI currentUserId={user.id} currentRole={user.role as 'CLIENT'} />
    </DashboardShell>
  )
}


