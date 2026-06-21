import type { ReasoningStep } from '../types'

interface ReasoningPanelProps {
  steps: ReasoningStep[]
}

export function ReasoningPanel({ steps }: ReasoningPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((step, index) => (
        <div key={step.stepNum} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
            {index + 1}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-800">
              {step.label}
            </span>
            <p className="text-sm leading-relaxed text-slate-600">
              {step.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
