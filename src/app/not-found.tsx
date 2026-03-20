import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(200,169,110,0.07) 0%, transparent 65%)' }} />

      <div className="relative z-10 text-center">
        <div className="font-display text-[140px] md:text-[200px] leading-none text-white/4 select-none mb-4">404</div>
        <div className="font-display text-4xl md:text-5xl text-white mb-4 -mt-12">Page not found</div>
        <p className="text-white/30 text-base max-w-sm mx-auto mb-10">
          This page doesn&apos;t exist, or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-sand px-8 py-3.5 rounded-full text-sm">← Back to Home</Link>
          <Link href="/vendors" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/15 text-white/50 text-sm font-semibold hover:border-[#C8A96E] hover:text-white transition-colors">Browse Vendors</Link>
        </div>

        <div className="mt-14 flex items-center justify-center gap-1">
          <span className="font-display text-xl text-white/20">Vow</span>
          <span className="font-display text-xl text-[#C8A96E]/40">Connect</span>
        </div>
      </div>
    </div>
  )
}
