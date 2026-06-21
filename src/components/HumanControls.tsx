import { useState } from 'react'
import { AlertCircle, CheckCircle2, Play, ShieldAlert, X } from 'lucide-react'
import type { RecommendationOption } from '../types'

interface HumanControlsProps {
  options: RecommendationOption[]
  assetId: string
  onActionConfirm: (action: string) => void
}

const ESCALATE_ACTION = 'Escalate to Human Review'

export function HumanControls({
  options,
  assetId,
  onActionConfirm,
}: HumanControlsProps) {
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const handleConfirm = () => {
    if (pendingAction) {
      onActionConfirm(pendingAction)
      setPendingAction(null)
    }
  }

  const handleCancel = () => {
    setPendingAction(null)
  }

  if (pendingAction) {
    return (
      <div className="rounded-lg border border-amber-400 bg-amber-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-amber-900">
              You are about to execute: {pendingAction} on {assetId}. This will
              be recorded in the audit log.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
              >
                <Play className="h-4 w-4" />
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option, index) => {
        const isPrimary = index === 0

        return (
          <button
            key={option.name}
            type="button"
            onClick={() => setPendingAction(option.actionLabel)}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              isPrimary
                ? 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {option.actionLabel}
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => setPendingAction(ESCALATE_ACTION)}
        className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
      >
        <AlertCircle className="h-4 w-4" />
        {ESCALATE_ACTION}
      </button>
    </div>
  )
}
