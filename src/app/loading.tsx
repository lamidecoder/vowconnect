export default function Loading() {
  return (
    <div className="min-h-screen bg-theme flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#C8A96E]/20 border-t-[#C8A96E] animate-spin" />
        <div className="flex items-center gap-1">
          <span className="font-display text-lg text-theme/40">Vow</span>
          <span className="font-display text-lg text-[#C8A96E]/40">Connect</span>
        </div>
      </div>
    </div>
  )
}
