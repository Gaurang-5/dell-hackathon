import { AlertTriangle } from 'lucide-react'

interface LimitationBannerProps {
  limitations?: string | null
}

export function LimitationBanner({ limitations }: LimitationBannerProps) {
  if (!limitations || limitations.trim().length === 0) {
    return null
  }

  return (
    <div className="flex w-full items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <span>
        AI Caveat: {limitations}
      </span>
    </div>
  )
}
