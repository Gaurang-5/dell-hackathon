import { AlertTriangle } from 'lucide-react'

interface LimitationBannerProps {
  limitations?: string | null
}

export function LimitationBanner({ limitations }: LimitationBannerProps) {
  if (!limitations || limitations.trim().length === 0) {
    return null
  }

  return (
    <div className="flex w-full items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <span>
        AI Caveat: {limitations}
      </span>
    </div>
  )
}
