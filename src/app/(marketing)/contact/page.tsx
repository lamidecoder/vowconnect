'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MarketingNav, MarketingFooter } from '@/components/marketing/Nav'

const TOPICS = ['General Enquiry','I need help with a booking','Report a vendor issue','Vendor account help','Partnership / press','Something else']

const CONTACTS = [
  { icon: '📧', label: 'Email', value: 'hello@vowconnect.com', sub: 'We reply within 24 hours' },
  { icon: '💬', label: 'WhatsApp', value: '+44 7700 000000', sub: 'Mon–Fri, 9am–6pm WAT' },
  { icon: '📸', label: 'Instagram', value: '@vowconnect', sub: 'DMs open' },
]

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', topic: '', message: '' })
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-theme">
      <MarketingNav />

      <section className="pt-28 pb-16 px-4 md:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="section-label mb-4">Contact</div>
          <h1 className="font-display text-5xl md:text-6xl text-theme mb-5 leading-tight">
            Get in touch<br /><span className="italic text-theme-muted">we&apos;d love to hear from you</span>
          </h1>
          <p className="text-theme-muted text-lg">Questions, feedback, partnerships — we&apos;re here and we reply fast.</p>
        </div>
      </section>

      <section className="px-4 md:px-6 pb-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8">

          {/* Left — contact info */}
          <div className="md:col-span-2 space-y-4">
            {CONTACTS.map(c => (
              <div key={c.label} className="card p-6 flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{c.icon}</span>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">{c.label}</div>
                  <div className="font-semibold text-theme text-sm">{c.value}</div>
                  <div className="text-theme-faint text-xs mt-0.5">{c.sub}</div>
                </div>
              </div>
            ))}

            <div className="card p-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-3">Office Hours</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-theme-muted">Monday – Friday</span><span className="text-theme font-medium">9am – 6pm WAT</span></div>
                <div className="flex justify-between"><span className="text-theme-muted">Saturday</span><span className="text-theme font-medium">10am – 2pm WAT</span></div>
                <div className="flex justify-between"><span className="text-theme-muted">Sunday</span><span className="text-theme-faint">Closed</span></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5ECD8] dark:bg-[#1A130A] border border-[#E3CC99] dark:border-[#2A1F0A]">
              <p className="text-[#8A6A2E] dark:text-[#C8A96E] text-sm font-medium mb-2">Already a member?</p>
              <p className="text-[#8A6A2E]/70 dark:text-[#C8A96E]/60 text-xs mb-3">Sign in to use our faster in-app support for booking issues.</p>
              <Link href="/login" className="text-[#8A6A2E] dark:text-[#C8A96E] text-xs font-bold hover:underline">Sign In →</Link>
            </div>
          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            <div className="card p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-5">✉️</div>
                  <h2 className="font-display text-3xl text-theme mb-3">Message sent!</h2>
                  <p className="text-theme-muted text-sm mb-8">We&apos;ve received your message and will get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name:'', email:'', topic:'', message:'' }) }}
                    className="btn-outline px-6 py-2.5 rounded-xl text-sm">Send another message</button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <h2 className="font-display text-2xl text-theme mb-6">Send us a message</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name</label>
                      <input className="input" name="name" placeholder="Chioma Okafor" value={form.name} onChange={handle} required />
                    </div>
                    <div>
                      <label className="label">Email Address</label>
                      <input className="input" type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handle} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Topic</label>
                    <select className="input" name="topic" value={form.topic} onChange={handle} required>
                      <option value="">Select a topic...</option>
                      {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea className="input min-h-[140px] resize-none" name="message" placeholder="Tell us how we can help..." value={form.message} onChange={handle} required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-sand w-full py-3.5 rounded-xl text-sm disabled:opacity-50">
                    {loading ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
