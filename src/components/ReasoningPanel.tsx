import type { ReasoningStep } from '../types'

interface ReasoningPanelProps {
  steps: ReasoningStep[]
}

const AGENT_BADGES = [
  '🔍 Detection Core',
  '⚖️ Policy Engine',
  '🛠️ Remediation Agent',
]

export function ReasoningPanel({ steps }: ReasoningPanelProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const badgeText = AGENT_BADGES[index] || '🤖 Support Agent'
        const isLast = index === steps.length - 1

        return (
          <div key={step.stepNum} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connecting Line for Pipeline Flow */}
            {!isLast && (
              <div className="absolute bottom-0 left-[11px] top-6 w-[2px] bg-blue-200/50 animate-pulse" />
            )}

            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-[10px] font-bold text-blue-700 shadow-sm">
              {index + 1}
            </div>
            
            <div className="flex flex-col gap-1.5 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-800">
                  {step.label}
                </span>
                <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-700 shadow-sm">
                  {badgeText}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {step.detail}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
