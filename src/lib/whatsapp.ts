// src/lib/whatsapp.ts
// WhatsApp Business Cloud API — Meta's official API
// Free tier: 1,000 conversations/month per phone number
// Setup: developers.facebook.com/docs/whatsapp/cloud-api/get-started
// Required env vars:
//   WHATSAPP_PHONE_NUMBER_ID  — your WhatsApp Business phone number ID
//   WHATSAPP_ACCESS_TOKEN     — Meta system user access token
//   WHATSAPP_VERIFY_TOKEN     — any secret string for webhook verification

const WA_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`
const TOKEN  = process.env.WHATSAPP_ACCESS_TOKEN

interface WASendResult { messageId?: string; error?: string }

function normalisePhone(phone: string): string {
  // Convert 0XXXXXXXXXX → 234XXXXXXXXXX for Nigeria, keep international numbers
  return phone.replace(/\D/g, '').replace(/^0(\d{10})$/, '234$1')
}

async function sendMessage(to: string, body: string): Promise<WASendResult> {
  if (!TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    // Log and skip gracefully if not configured
    console.log(`[WhatsApp not configured] Would send to ${to}:`, body.slice(0, 80))
    return { messageId: 'not_configured' }
  }

  try {
    const res = await fetch(WA_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalisePhone(to),
        type: 'text',
        text: { body, preview_url: false },
      }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error?.message ?? 'WhatsApp send failed' }
    return { messageId: data.messages?.[0]?.id }
  } catch (err: any) {
    console.error('WhatsApp error:', err.message)
    return { error: err.message }
  }
}

// ─── Message Templates ────────────────────────────────────────────────────────

export async function sendBookingRequestWA(params: {
  vendorPhone: string; vendorName: string
  clientName: string; eventType: string; eventDate: string
}) {
  const msg = `🎀 *VowConnect — New Booking Request*

Hi ${params.vendorName.split(' ')[0]}! You have a new booking request:

👤 Client: *${params.clientName}*
🎊 Event: ${params.eventType}
📅 Date: ${params.eventDate}

Please open VowConnect to accept or decline:
${process.env.NEXT_PUBLIC_APP_URL}/vendor/bookings

_Reply promptly — brides book the first vendor who responds!_`

  return sendMessage(params.vendorPhone, msg)
}

export async function sendBookingConfirmedWA(params: {
  clientPhone: string; clientName: string
  businessName: string; eventType: string; eventDate: string
  vendorWhatsapp: string
}) {
  const msg = `🎉 *Booking Confirmed — VowConnect*

Hi ${params.clientName.split(' ')[0]}! Great news — *${params.businessName}* has confirmed your booking.

🎊 Event: ${params.eventType}
📅 Date: ${params.eventDate}
💬 Vendor WhatsApp: wa.me/${normalisePhone(params.vendorWhatsapp)}

Contact your vendor on WhatsApp to discuss the final details. Congratulations on your upcoming celebration! 🎀`

  return sendMessage(params.clientPhone, msg)
}

export async function sendBookingReminderWA(params: {
  clientPhone: string; clientName: string
  businessName: string; eventType: string; eventDate: string
  daysUntil: number
}) {
  const msg = `⏰ *Event Reminder — VowConnect*

Hi ${params.clientName.split(' ')[0]}! Your event is coming up in *${params.daysUntil} day${params.daysUntil !== 1 ? 's' : ''}*.

🎊 Event: ${params.eventType}
📅 Date: ${params.eventDate}
💼 Vendor: ${params.businessName}

Make sure you've confirmed all the final details with your vendor. Wishing you a beautiful day! 🎀`

  return sendMessage(params.clientPhone, msg)
}

export async function sendVendorReminderWA(params: {
  vendorPhone: string; vendorName: string
  clientName: string; eventType: string; eventDate: string
  daysUntil: number
}) {
  const msg = `⏰ *Upcoming Event Reminder — VowConnect*

Hi ${params.vendorName.split(' ')[0]}! You have an event in *${params.daysUntil} day${params.daysUntil !== 1 ? 's' : ''}*:

👤 Client: ${params.clientName}
🎊 Event: ${params.eventType}
📅 Date: ${params.eventDate}

Make sure everything is prepared! View booking details:
${process.env.NEXT_PUBLIC_APP_URL}/vendor/bookings`

  return sendMessage(params.vendorPhone, msg)
}

export async function sendAsoebiInviteWA(params: {
  memberPhone: string; memberName: string
  leadName: string; businessName: string
  eventType: string; eventDate: string; shareCode: string
}) {
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/asoebi/${params.shareCode}`
  const msg = `💃 *Asoebi Group Invite — VowConnect*

Hi ${params.memberName.split(' ')[0]}! *${params.leadName}* has invited you to join a group booking with *${params.businessName}*.

🎊 Event: ${params.eventType}
📅 Date: ${params.eventDate}

Join the group to confirm your spot:
${joinUrl}

_Powered by VowConnect — The African Wedding Marketplace_`

  return sendMessage(params.memberPhone, msg)
}

export async function sendReviewRequestWA(params: {
  clientPhone: string; clientName: string; businessName: string
}) {
  const msg = `⭐ *How was your experience? — VowConnect*

Hi ${params.clientName.split(' ')[0]}! We hope your event was magical! 🎊

Please take 30 seconds to review *${params.businessName}*. Your feedback helps other brides find the best vendors.

Leave your review here:
${process.env.NEXT_PUBLIC_APP_URL}/client/bookings

_Thank you for using VowConnect!_ 🎀`

  return sendMessage(params.clientPhone, msg)
}

// Helper for scheduler — send 48h reminders
export async function sendUpcomingEventReminders() {
  const { prisma } = await import('./prisma')
  const in48h = new Date(Date.now() + 48 * 3600 * 1000)
  const in47h = new Date(Date.now() + 47 * 3600 * 1000)

  const bookings = await prisma.booking.findMany({
    where: { status: 'ACCEPTED', eventDate: { gte: in47h, lte: in48h }, deletedAt: null },
    include: {
      client: { select: { name: true, phone: true } },
      vendor: { select: { businessName: true, whatsapp: true, user: { select: { name: true, phone: true } } } },
    },
  })

  const results = await Promise.allSettled(
    bookings.flatMap(b => {
      const tasks = []
      const eventDate = b.eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

      if (b.client.phone) {
        tasks.push(sendBookingReminderWA({
          clientPhone: b.client.phone, clientName: b.client.name,
          businessName: b.vendor.businessName, eventType: b.eventType,
          eventDate, daysUntil: 2,
        }))
      }

      const vendorPhone = b.vendor.user.phone ?? b.vendor.whatsapp
      tasks.push(sendVendorReminderWA({
        vendorPhone, vendorName: b.vendor.user.name,
        clientName: b.client.name, eventType: b.eventType,
        eventDate, daysUntil: 2,
      }))

      return tasks
    })
  )

  return { sent: results.filter(r => r.status === 'fulfilled').length }
}
