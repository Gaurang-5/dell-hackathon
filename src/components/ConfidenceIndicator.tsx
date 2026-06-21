import { getConfidenceDisplay } from '../utils/transparencyHelpers'

interface ConfidenceIndicatorProps {
  score: number | string
}

export function ConfidenceIndicator({ score }: ConfidenceIndicatorProps) {
  const { label, colorClass, subtext } = getConfidenceDisplay(score)

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-medium ${colorClass}`}
      >
        {label}
      </span>
      <span className="text-xs text-slate-500">{subtext}</span>
    </div>
  )
}
