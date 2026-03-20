// src/lib/email.ts — VowConnect production email templates
// Provider: Resend (resend.com)

import { Resend } from 'resend'

const RESEND_KEY = process.env.RESEND_API_KEY ?? ''
const resend     = RESEND_KEY && !RESEND_KEY.startsWith('re_xxx') ? new Resend(RESEND_KEY) : null
const APP        = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vowconnect.com'

// When Resend isn't configured, log emails to console (dev-friendly fallback)
async function sendEmail(opts: { from: string; to: string; subject: string; html: string }) {
  if (!resend) {
    console.log('\n📧 [EMAIL - not sent, RESEND_API_KEY not configured]')
    console.log('  To:', opts.to)
    console.log('  Subject:', opts.subject)
    console.log('  (Set RESEND_API_KEY in .env.local to send real emails)\n')
    return
  }
  await resend.emails.send(opts)
}

function getFrom() {
  return process.env.RESEND_FROM_EMAIL ?? 'VowConnect <hello@vowconnect.com>'
}

/* ── Design tokens ── */
const C = {
  gold:       '#C9941A',
  goldLight:  '#E4B520',
  goldBg:     'rgba(201,148,26,0.08)',
  goldBorder: 'rgba(201,148,26,0.25)',
  umber:      '#1A0A04',
  text:       '#2C1A0E',
  muted:      '#8A7560',
  faint:      '#B0A090',
  cream:      '#FAF8F4',
  white:      '#FFFFFF',
  border:     '#EDE5D4',
  green:      '#16a34a',
  greenBg:    'rgba(22,163,74,0.08)',
  red:        '#dc2626',
  redBg:      'rgba(220,38,38,0.08)',
  blue:       '#2563eb',
  blueBg:     'rgba(37,99,235,0.08)',
  wa:         '#25D366',
}

/* ── Base layout ── */
function base(body: string, preview = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>VowConnect</title>
  ${preview ? `<div style="display:none;max-height:0;overflow:hidden;">${preview}&#847;</div>` : ''}
  <style>
    @media (max-width:600px){
      .container{padding:0 !important;}
      .card{border-radius:0 !important; margin:0 !important;}
      .hero{border-radius:0 !important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};">
<tr><td align="center" style="padding:32px 16px 48px;">
<table class="container" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

<!-- LOGO BAR -->
<tr><td style="padding-bottom:24px;text-align:center;">
  <a href="${APP}" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
    <span style="display:inline-block;width:32px;height:32px;background:linear-gradient(135deg,${C.gold},#8B6A0A);border-radius:8px;"></span>
    <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:${C.umber};font-family:Georgia,serif;">Vow<span style="color:${C.gold};">Connect</span></span>
  </a>
</td></tr>

<!-- MAIN CARD -->
<tr><td class="card" style="background:${C.white};border-radius:20px;border:1px solid ${C.border};overflow:hidden;box-shadow:0 4px 24px rgba(44,26,14,0.06);">
  ${body}
</td></tr>

<!-- FOOTER -->
<tr><td style="padding:24px 8px 0;text-align:center;">
  <p style="margin:0 0 8px;font-size:12px;color:${C.muted};">
    <a href="${APP}" style="color:${C.gold};text-decoration:none;font-weight:600;">VowConnect</a>
    &nbsp;·&nbsp;The Global African Wedding Marketplace
  </p>
  <p style="margin:0;font-size:11px;color:${C.faint};">
    <a href="${APP}/unsubscribe" style="color:${C.faint};text-decoration:none;">Unsubscribe</a>
    &nbsp;·&nbsp;
    <a href="${APP}/privacy" style="color:${C.faint};text-decoration:none;">Privacy Policy</a>
    &nbsp;·&nbsp;
    © ${new Date().getFullYear()} VowConnect
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

/* ── Hero section ── */
function hero(emoji: string, title: string, subtitle: string, gradient = `135deg,${C.umber} 0%,#2C1204 60%,#4A1A08 100%`) {
  return `
<div class="hero" style="background:linear-gradient(${gradient});padding:40px 40px 36px;text-align:center;">
  <div style="font-size:52px;line-height:1;margin-bottom:16px;">${emoji}</div>
  <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:${C.white};font-family:Georgia,serif;letter-spacing:-0.5px;">${title}</h1>
  <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.6);line-height:1.5;">${subtitle}</p>
</div>
<div style="height:4px;background:linear-gradient(90deg,${C.gold},${C.goldLight},${C.gold});"></div>`
}

/* ── Body wrapper ── */
function body(content: string) {
  return `<div style="padding:36px 40px;">${content}</div>`
}

/* ── Components ── */
const h2 = (t: string) => `<h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${C.umber};font-family:Georgia,serif;">${t}</h2>`
const p  = (t: string, style = '') => `<p style="margin:12px 0;font-size:15px;color:${C.text};line-height:1.7;${style}">${t}</p>`
const hr = () => `<hr style="border:none;border-top:1px solid ${C.border};margin:28px 0;"/>`

function btn(label: string, href: string, variant: 'gold'|'green'|'outline'|'dark' = 'gold') {
  const styles: Record<string, { bg: string; color: string; border?: string }> = {
    gold:    { bg: `linear-gradient(135deg,${C.gold} 0%,#A87315 100%)`, color: C.white },
    green:   { bg: `linear-gradient(135deg,${C.wa} 0%,#1DA851 100%)`,   color: C.white },
    outline: { bg: 'transparent', color: C.gold, border: `2px solid ${C.gold}` },
    dark:    { bg: `linear-gradient(135deg,${C.umber} 0%,#2C1204 100%)`, color: C.white },
  }
  const s = styles[variant]
  return `
<table cellpadding="0" cellspacing="0" style="margin:20px 0;">
  <tr><td style="border-radius:100px;${s.border ? `border:${s.border};` : ''}">
    <a href="${href}" style="display:inline-block;background:${s.bg};color:${s.color};text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:100px;letter-spacing:0.2px;">${label}</a>
  </td></tr>
</table>`
}

function infoCard(rows: { icon?: string; label: string; value: string }[], title?: string) {
  return `
<div style="background:${C.cream};border:1px solid ${C.border};border-radius:14px;overflow:hidden;margin:20px 0;">
  ${title ? `<div style="padding:12px 20px;border-bottom:1px solid ${C.border};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.muted};">${title}</div>` : ''}
  ${rows.map((r, i) => `
    <div style="display:flex;align-items:center;padding:13px 20px;${i < rows.length - 1 ? `border-bottom:1px solid ${C.border};` : ''}">
      ${r.icon ? `<span style="font-size:18px;margin-right:12px;flex-shrink:0;">${r.icon}</span>` : ''}
      <div style="flex:1;">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:${C.muted};margin-bottom:2px;">${r.label}</div>
        <div style="font-size:14px;font-weight:600;color:${C.umber};">${r.value}</div>
      </div>
    </div>`).join('')}
</div>`
}

function alert(text: string, type: 'gold'|'green'|'red'|'blue' = 'gold') {
  const colors = { gold: [C.goldBg, C.gold], green: [C.greenBg, C.green], red: [C.redBg, C.red], blue: [C.blueBg, C.blue] }
  const [bg, color] = colors[type]
  return `<div style="background:${bg};border:1px solid ${color}30;border-radius:12px;padding:14px 18px;margin:16px 0;font-size:13px;color:${color};line-height:1.6;">${text}</div>`
}

function checklist(items: string[]) {
  return `<ul style="list-style:none;padding:0;margin:16px 0;">
    ${items.map(i => `<li style="padding:5px 0;font-size:14px;color:${C.text};line-height:1.5;"><span style="color:${C.green};margin-right:8px;font-weight:700;">✓</span>${i}</li>`).join('')}
  </ul>`
}

function statRow(stats: { label: string; value: string }[]) {
  return `
<div style="display:flex;gap:0;border:1px solid ${C.border};border-radius:14px;overflow:hidden;margin:20px 0;">
  ${stats.map((s, i) => `
    <div style="flex:1;padding:18px 12px;text-align:center;${i < stats.length - 1 ? `border-right:1px solid ${C.border};` : ''}">
      <div style="font-size:22px;font-weight:800;color:${C.umber};font-family:Georgia,serif;">${s.value}</div>
      <div style="font-size:11px;color:${C.muted};margin-top:3px;font-weight:500;">${s.label}</div>
    </div>`).join('')}
</div>`
}

/* ═══════════════════════════════════════════════
   01 · WELCOME — CLIENT
═══════════════════════════════════════════════ */
export async function sendWelcomeClient(p1: { email: string; name: string }) {
  const first = p1.name.split(' ')[0]
  const content = body(`
    ${h2(`Welcome to VowConnect, ${first}! 🎀`)}
    ${p('You\'re now part of a global community connecting couples with the finest African wedding vendors — from Lagos to London, Toronto to Accra.')}
    ${checklist([
      'Browse <strong>500+ verified vendors</strong> across 6 countries',
      'Filter by category, city and budget to find your perfect match',
      'Book directly and manage everything in one place',
      'Chat instantly on WhatsApp with any vendor',
    ])}
    ${btn('Browse Vendors Now →', `${APP}/vendors`, 'gold')}
    ${hr()}
    ${p(`Questions? Reply to this email or <a href="${APP}/contact" style="color:${C.gold};">contact us here</a>.`, `color:${C.muted};font-size:13px;`)}
  `)
  return sendEmail({
    from: getFrom(), to: p1.email,
    subject: `Welcome to VowConnect, ${first}! 🎀`,
    html: base(hero('🎀', `Welcome, ${first}!`, 'Your journey to a perfect Nigerian wedding starts here') + content, 'Your dream wedding vendors are waiting'),
  })
}

/* ═══════════════════════════════════════════════
   02 · WELCOME — VENDOR
═══════════════════════════════════════════════ */
export async function sendWelcomeVendor(p1: { email: string; name: string; businessName: string }) {
  const first = p1.name.split(' ')[0]
  const content = body(`
    ${h2(`You're on VowConnect, ${first}!`)}
    ${p(`<strong>${p1.businessName}</strong> has been submitted for review. Our team approves listings within <strong>24 hours</strong> — you'll get an email the moment you're live.`)}
    ${hr()}
    <p style="font-size:14px;font-weight:700;color:${C.umber};margin:0 0 8px;">Make your profile irresistible while you wait:</p>
    ${checklist([
      'Upload <strong>5 high-quality portfolio photos or videos</strong> — the #1 thing clients look at',
      'Write a compelling bio: your style, experience & specialties',
      'Set an accurate price range — clients filter by budget',
      'Confirm your WhatsApp number — bookings happen there',
    ])}
    ${btn('Complete Your Profile →', `${APP}/vendor/profile`, 'gold')}
    ${statRow([{ value: '500+', label: 'Active vendors' }, { value: '2,400+', label: 'Monthly bookings' }, { value: '6', label: 'Countries' }])}
  `)
  return sendEmail({
    from: getFrom(), to: p1.email,
    subject: `${p1.businessName} submitted — you'll be live within 24 hours`,
    html: base(hero('🚀', 'Profile Under Review', 'We\'ll have you live within 24 hours') + content, 'Your VowConnect vendor profile is under review'),
  })
}

/* ═══════════════════════════════════════════════
   03 · VENDOR APPROVED
═══════════════════════════════════════════════ */
export async function sendVendorApproved(p1: { vendorEmail: string; vendorName: string; businessName: string }) {
  const first = p1.vendorName.split(' ')[0]
  const content = body(`
    ${h2(`Congratulations, ${first}!`)}
    ${p(`<strong>${p1.businessName}</strong> is now <strong>live on VowConnect</strong> and discoverable by brides and grooms across Nigeria, UK, USA, Canada and Ghana.`)}
    ${alert('✓ Your profile is approved and accepting bookings', 'green')}
    <p style="font-size:14px;font-weight:700;color:${C.umber};margin:16px 0 8px;">Your first booking checklist:</p>
    ${checklist([
      'Share your VowConnect profile link on Instagram and WhatsApp',
      'Upload your best 5 portfolio images or videos',
      'Block out dates you\'re not available in your calendar',
      'Respond to booking requests within 2 hours for best rankings',
    ])}
    ${btn('Go to My Dashboard →', `${APP}/vendor/dashboard`, 'gold')}
    ${btn('View My Public Profile →', `${APP}/vendors`, 'outline')}
  `)
  return sendEmail({
    from: getFrom(), to: p1.vendorEmail,
    subject: `🎉 ${p1.businessName} is now LIVE on VowConnect!`,
    html: base(hero('🎉', 'You\'re Live!', `${p1.businessName} is now accepting bookings`, `135deg,${C.green} 0%,#0D6B30 100%`) + content, 'Your profile is live — clients can find you now'),
  })
}

/* ═══════════════════════════════════════════════
   04 · VENDOR REJECTED
═══════════════════════════════════════════════ */
export async function sendVendorRejected(p1: { vendorEmail: string; vendorName: string; businessName: string; reason?: string }) {
  const first = p1.vendorName.split(' ')[0]
  const content = body(`
    ${h2('Profile Review Update')}
    ${p(`Hi <strong>${first}</strong>, thank you for applying to list <strong>${p1.businessName}</strong> on VowConnect.`)}
    ${p('After review, we weren\'t able to approve your profile at this time.')}
    ${p1.reason ? alert(`<strong>Reason:</strong> ${p1.reason}`, 'red') : ''}
    <p style="font-size:14px;font-weight:700;color:${C.umber};margin:16px 0 8px;">Common reasons for rejection:</p>
    ${checklist([
      'No portfolio images uploaded',
      'Incomplete business information',
      'Invalid or missing WhatsApp number',
      'Category doesn\'t match the service offered',
    ])}
    ${p('Fix the issues above and resubmit — we\'d love to have you on the platform.')}
    ${btn('Update My Profile →', `${APP}/vendor/profile`, 'dark')}
  `)
  return sendEmail({
    from: getFrom(), to: p1.vendorEmail,
    subject: `${p1.businessName} — Profile Review Update`,
    html: base(hero('📋', 'Profile Review Update', 'Action needed before your listing goes live') + content),
  })
}

/* ═══════════════════════════════════════════════
   05 · BOOKING REQUEST → VENDOR
═══════════════════════════════════════════════ */
export async function sendBookingRequestToVendor(p1: {
  vendorEmail: string; vendorName: string; businessName: string
  clientName: string; clientPhone?: string
  eventType: string; eventDate: string; location?: string; notes?: string; bookingId: string
}) {
  const waLink = p1.clientPhone
    ? `https://wa.me/${p1.clientPhone.replace(/\D/g,'').replace(/^0/,'234')}`
    : null
  const content = body(`
    ${h2(`New booking request from ${p1.clientName}`)}
    ${p(`Hi <strong>${p1.vendorName.split(' ')[0]}</strong>, someone wants to book <strong>${p1.businessName}</strong>!`)}
    ${infoCard([
      { icon: '👰', label: 'Client',     value: p1.clientName },
      { icon: '📅', label: 'Event Date', value: p1.eventDate },
      { icon: '🎊', label: 'Event Type', value: p1.eventType },
      ...(p1.location ? [{ icon: '📍', label: 'Location', value: p1.location }] : []),
    ], 'Booking Details')}
    ${p1.notes ? `
      <div style="background:${C.cream};border:1px solid ${C.border};border-radius:12px;padding:16px 20px;margin:16px 0;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:${C.muted};margin-bottom:6px;">Message from client</div>
        <p style="margin:0;font-size:14px;color:${C.text};line-height:1.6;font-style:italic;">"${p1.notes}"</p>
      </div>` : ''}
    ${alert('⏰ <strong>Respond within 2 hours</strong> for best rankings. Vendors who respond fast get 3× more bookings.', 'gold')}
    ${btn('Accept or Decline →', `${APP}/vendor/bookings`, 'gold')}
    ${waLink ? btn('💬 Message Client on WhatsApp', waLink, 'green') : ''}
  `)
  return sendEmail({
    from: getFrom(), to: p1.vendorEmail,
    subject: `📅 New booking request — ${p1.eventType} on ${p1.eventDate}`,
    html: base(hero('📅', 'New Booking Request', `${p1.clientName} wants to book ${p1.businessName}`, `135deg,${C.gold} 0%,#8B6A0A 100%`) + content, `${p1.clientName} wants to book your services`),
  })
}

/* ═══════════════════════════════════════════════
   06 · BOOKING CONFIRMATION → CLIENT
═══════════════════════════════════════════════ */
export async function sendBookingConfirmationToClient(p1: {
  clientEmail: string; clientName: string; businessName: string; vendorWhatsapp?: string
  eventType: string; eventDate: string; bookingId: string
}) {
  const first = p1.clientName.split(' ')[0]
  const waLink = p1.vendorWhatsapp
    ? `https://wa.me/${p1.vendorWhatsapp.replace(/\D/g,'').replace(/^0/,'234')}`
    : null
  const content = body(`
    ${h2(`Your request is sent, ${first}!`)}
    ${p(`Your booking request for <strong>${p1.businessName}</strong> has been received. They typically respond within a few hours.`)}
    ${infoCard([
      { icon: '🏪', label: 'Vendor',     value: p1.businessName },
      { icon: '🎊', label: 'Event Type', value: p1.eventType },
      { icon: '📅', label: 'Event Date', value: p1.eventDate },
      { icon: '🔖', label: 'Booking ID', value: `#${p1.bookingId.slice(0, 8).toUpperCase()}` },
    ], 'Booking Summary')}
    ${alert('💡 <strong>Tip:</strong> You can message the vendor on WhatsApp while you wait for a response.', 'gold')}
    ${btn('View My Bookings →', `${APP}/client/bookings`, 'gold')}
    ${waLink ? btn('💬 Chat with Vendor on WhatsApp', waLink, 'green') : ''}
  `)
  return sendEmail({
    from: getFrom(), to: p1.clientEmail,
    subject: `✅ Booking request sent to ${p1.businessName}`,
    html: base(hero('✅', 'Booking Request Sent!', `${p1.businessName} has been notified`, `135deg,${C.green} 0%,#0D6B30 100%`) + content, 'Your booking request has been received'),
  })
}

/* ═══════════════════════════════════════════════
   07 · BOOKING ACCEPTED → CLIENT
═══════════════════════════════════════════════ */
export async function sendBookingAcceptedToClient(p1: {
  clientEmail: string; clientName: string; businessName: string; vendorWhatsapp?: string
  eventType: string; eventDate: string; bookingId: string; vendorNote?: string
}) {
  const first = p1.clientName.split(' ')[0]
  const waLink = p1.vendorWhatsapp
    ? `https://wa.me/${p1.vendorWhatsapp.replace(/\D/g,'').replace(/^0/,'234')}`
    : null
  const content = body(`
    ${h2(`${first}, your booking is confirmed! 🎉`)}
    ${p(`<strong>${p1.businessName}</strong> has accepted your booking request. Get in touch to discuss the details and make it official.`)}
    ${infoCard([
      { icon: '🏪', label: 'Vendor',     value: p1.businessName },
      { icon: '🎊', label: 'Event',      value: p1.eventType },
      { icon: '📅', label: 'Date',       value: p1.eventDate },
    ])}
    ${p1.vendorNote ? `
      <div style="background:${C.cream};border-left:3px solid ${C.gold};border-radius:0 12px 12px 0;padding:14px 18px;margin:16px 0;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.5px;color:${C.muted};margin-bottom:4px;">Message from vendor</div>
        <p style="margin:0;font-size:14px;color:${C.text};line-height:1.6;font-style:italic;">"${p1.vendorNote}"</p>
      </div>` : ''}
    ${alert('🎊 <strong>Next step:</strong> Message the vendor on WhatsApp to discuss payment, timing and specific requirements.', 'green')}
    ${btn('View Booking Details →', `${APP}/client/bookings/${p1.bookingId}`, 'gold')}
    ${waLink ? btn('💬 Message Vendor on WhatsApp', waLink, 'green') : ''}
  `)
  return sendEmail({
    from: getFrom(), to: p1.clientEmail,
    subject: `🎉 ${p1.businessName} accepted your booking!`,
    html: base(hero('🎉', 'Booking Accepted!', `${p1.businessName} is ready for your ${p1.eventType}`, `135deg,${C.green} 0%,#0D6B30 100%`) + content, `Great news — ${p1.businessName} said yes!`),
  })
}

/* ═══════════════════════════════════════════════
   08 · BOOKING DECLINED → CLIENT
═══════════════════════════════════════════════ */
export async function sendBookingDeclinedToClient(p1: {
  clientEmail: string; clientName: string; businessName: string
  eventType: string; eventDate: string; reason?: string
}) {
  const first = p1.clientName.split(' ')[0]
  const content = body(`
    ${h2(`Update on your booking, ${first}`)}
    ${p(`Unfortunately, <strong>${p1.businessName}</strong> is unable to take your booking for <strong>${p1.eventDate}</strong>.`)}
    ${p1.reason ? alert(`<strong>Reason:</strong> ${p1.reason}`, 'red') : ''}
    ${p('Don\'t worry — there are hundreds of other great vendors on VowConnect!')}
    ${btn('Find Another Vendor →', `${APP}/vendors`, 'gold')}
    ${p(`Need help finding the right vendor? <a href="${APP}/contact" style="color:${C.gold};">Contact our team</a> — we\'re happy to assist.`, `color:${C.muted};font-size:13px;`)}
  `)
  return sendEmail({
    from: getFrom(), to: p1.clientEmail,
    subject: `Update on your ${p1.businessName} booking`,
    html: base(hero('📋', 'Booking Update', 'We\'ll help you find the perfect alternative') + content),
  })
}

/* ═══════════════════════════════════════════════
   09 · BOOKING COMPLETED + REVIEW REQUEST → CLIENT
═══════════════════════════════════════════════ */
export async function sendReviewRequest(p1: {
  clientEmail: string; clientName: string; businessName: string
  eventType: string; eventDate: string; bookingId: string
}) {
  const first = p1.clientName.split(' ')[0]
  const content = body(`
    ${h2(`How did ${p1.businessName} do?`)}
    ${p(`Hi <strong>${first}</strong>, your <strong>${p1.eventType}</strong> was on <strong>${p1.eventDate}</strong> — we hope it was absolutely magical! 💫`)}
    ${p(`Your honest review of <strong>${p1.businessName}</strong> helps other couples find great vendors and helps good vendors grow. It takes less than 60 seconds.`)}
    ${btn('Leave a Review ⭐ →', `${APP}/client/bookings/${p1.bookingId}`, 'gold')}
    ${alert('💛 <strong>Reviews matter.</strong> Every genuine review helps a small business get their next booking.', 'gold')}
  `)
  return sendEmail({
    from: getFrom(), to: p1.clientEmail,
    subject: `How was ${p1.businessName}? Leave a review 🌟`,
    html: base(hero('⭐', 'Share Your Experience', 'Help other couples find amazing vendors') + content, 'Leave a review for your recent vendor'),
  })
}

/* ═══════════════════════════════════════════════
   10 · NEW REVIEW → VENDOR
═══════════════════════════════════════════════ */
export async function sendNewReviewToVendor(p1: {
  vendorEmail: string; vendorName: string; businessName: string
  clientName: string; rating: number; comment?: string
}) {
  const stars = '★'.repeat(p1.rating) + '☆'.repeat(5 - p1.rating)
  const content = body(`
    ${h2(`New ${p1.rating}-star review for ${p1.businessName}`)}
    ${p(`Hi <strong>${p1.vendorName.split(' ')[0]}</strong>, <strong>${p1.clientName}</strong> just left you a review!`)}
    <div style="background:${C.cream};border:1px solid ${C.border};border-radius:16px;padding:24px;margin:20px 0;text-align:center;">
      <div style="font-size:32px;color:${C.gold};letter-spacing:4px;margin-bottom:8px;">${stars}</div>
      <div style="font-size:22px;font-weight:800;color:${C.umber};font-family:Georgia,serif;">${p1.rating}.0 / 5.0</div>
      ${p1.comment ? `<p style="margin:16px 0 0;font-size:15px;color:${C.text};line-height:1.7;font-style:italic;">"${p1.comment}"</p><p style="margin:8px 0 0;font-size:13px;color:${C.muted};font-weight:600;">— ${p1.clientName}</p>` : ''}
    </div>
    ${p(`Great reviews boost your ranking on VowConnect. Keep up the excellent work!`)}
    ${btn('View All My Reviews →', `${APP}/vendor/analytics`, 'gold')}
  `)
  return sendEmail({
    from: getFrom(), to: p1.vendorEmail,
    subject: `⭐ ${p1.clientName} gave you ${p1.rating} stars!`,
    html: base(hero('⭐', 'New Review!', `${p1.clientName} reviewed ${p1.businessName}`, `135deg,${C.gold} 0%,#8B6A0A 100%`) + content, `${p1.rating}-star review from ${p1.clientName}`),
  })
}

/* ═══════════════════════════════════════════════
   11 · SUBSCRIPTION UPGRADED → VENDOR
═══════════════════════════════════════════════ */
export async function sendVendorUpgraded(p1: {
  vendorEmail: string; vendorName: string; businessName: string; plan: string; planExpiry: string
}) {
  const planLabel = p1.plan.charAt(0).toUpperCase() + p1.plan.slice(1)
  const perks: Record<string, string[]> = {
    pro:     ['Featured placement in search results', 'Verified badge on your profile', 'Priority support', 'Up to 20 portfolio images'],
    premium: ['Top-of-page featured placement', 'Verified & Premium badges', 'VIP support with 1-hour response', 'Unlimited portfolio images', 'Analytics dashboard access'],
  }
  const content = body(`
    ${h2(`${planLabel} plan activated, ${p1.vendorName.split(' ')[0]}!`)}
    ${p(`<strong>${p1.businessName}</strong> is now on the <strong>${planLabel} plan</strong>. Your new benefits are active immediately.`)}
    ${infoCard([
      { icon: '📅', label: 'Plan',       value: `${planLabel} Plan` },
      { icon: '⏰', label: 'Valid Until', value: p1.planExpiry },
      { icon: '✓',  label: 'Status',     value: 'Active' },
    ])}
    ${perks[p1.plan.toLowerCase()] ? `
      <p style="font-size:14px;font-weight:700;color:${C.umber};margin:16px 0 8px;">Your ${planLabel} benefits:</p>
      ${checklist(perks[p1.plan.toLowerCase()])}` : ''}
    ${btn('View My Dashboard →', `${APP}/vendor/dashboard`, 'gold')}
  `)
  return sendEmail({
    from: getFrom(), to: p1.vendorEmail,
    subject: `🚀 ${planLabel} plan activated for ${p1.businessName}`,
    html: base(hero('🚀', `${planLabel} Plan Active!`, 'Your benefits are live right now', `135deg,${C.gold} 0%,#8B6A0A 100%`) + content, `Your ${planLabel} plan is now active`),
  })
}

/* ═══════════════════════════════════════════════
   12 · EMAIL VERIFICATION
═══════════════════════════════════════════════ */
export async function sendEmailVerification(p1: { email: string; name: string; verifyUrl: string }) {
  const first = p1.name.split(' ')[0]
  const content = body(`
    ${h2(`Verify your email, ${first}`)}
    ${p('You\'re almost ready! Click the button below to verify your email address and unlock full access to VowConnect.')}
    ${btn('Verify My Email →', p1.verifyUrl, 'dark')}
    ${alert('⏰ This link expires in <strong>24 hours</strong>. If you didn\'t sign up, you can safely ignore this email.', 'gold')}
    ${p(`Or copy this link:<br/><span style="font-size:12px;color:${C.muted};word-break:break-all;">${p1.verifyUrl}</span>`, `color:${C.muted};font-size:13px;`)}
  `)
  return sendEmail({
    from: getFrom(), to: p1.email,
    subject: 'Verify your VowConnect email address',
    html: base(hero('✉️', 'Verify Your Email', 'One click to activate your account') + content, 'Click to verify your VowConnect email address'),
  })
}

/* ═══════════════════════════════════════════════
   13 · PASSWORD RESET
═══════════════════════════════════════════════ */
export async function sendPasswordReset(p1: { email: string; name: string; resetUrl: string }) {
  const first = p1.name.split(' ')[0]
  const content = body(`
    ${h2(`Reset your password, ${first}`)}
    ${p('We received a request to reset the password for your VowConnect account. Click below to set a new password.')}
    ${btn('Reset My Password →', p1.resetUrl, 'dark')}
    ${alert('⏰ This link expires in <strong>1 hour</strong>. If you didn\'t request this, your password is safe — you can ignore this email.', 'gold')}
    ${p('🔒 For your security, never share this link with anyone — including VowConnect support.', `color:${C.muted};font-size:13px;`)}
  `)
  return sendEmail({
    from: getFrom(), to: p1.email,
    subject: 'Reset your VowConnect password',
    html: base(hero('🔐', 'Password Reset', 'Secure link — expires in 1 hour') + content, 'Reset your VowConnect account password'),
  })
}

/* ═══════════════════════════════════════════════
   14 · ADMIN BROADCAST
═══════════════════════════════════════════════ */
export async function sendBroadcast(p1: { email: string; name: string; subject: string; message: string }) {
  const content = body(`
    ${h2(p1.subject)}
    ${p(`Hi <strong>${p1.name.split(' ')[0]}</strong>,`)}
    <div style="white-space:pre-line;font-size:15px;color:${C.text};line-height:1.7;">${p1.message}</div>
    ${hr()}
    ${p(`— The VowConnect Team`, `color:${C.muted};font-size:13px;`)}
  `)
  return sendEmail({
    from: getFrom(), to: p1.email,
    subject: p1.subject,
    html: base(hero('📢', p1.subject, 'From the VowConnect team') + content),
  })
}

/* ═══════════════════════════════════════════════
   15 · CONTACT FORM SUBMISSION → ADMIN
═══════════════════════════════════════════════ */
export async function sendContactFormToAdmin(p1: {
  name: string; email: string; topic: string; message: string
}) {
  const content = body(`
    ${h2('New Contact Form Submission')}
    ${infoCard([
      { icon: '👤', label: 'Name',  value: p1.name },
      { icon: '✉️', label: 'Email', value: p1.email },
      { icon: '📌', label: 'Topic', value: p1.topic },
    ])}
    <div style="background:${C.cream};border:1px solid ${C.border};border-radius:12px;padding:16px 20px;margin:16px 0;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:${C.muted};margin-bottom:8px;">Message</div>
      <p style="margin:0;font-size:14px;color:${C.text};line-height:1.7;">${p1.message}</p>
    </div>
    ${btn(`Reply to ${p1.name} →`, `mailto:${p1.email}`, 'dark')}
  `)
  return sendEmail({
    from: getFrom(),
    to: process.env.SUPER_ADMIN_EMAIL ?? 'lamidecodes@gmail.com',
    replyTo: p1.email,
    subject: `[VowConnect] Contact: ${p1.topic} — ${p1.name}`,
    html: base(hero('📩', 'New Contact Form', `From ${p1.name}`) + content),
  })
}
