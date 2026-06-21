import type { ReasoningStep } from '../types'
import { Search, AlertCircle, Lightbulb, CheckCircle2 } from 'lucide-react'

interface ReasoningPanelProps {
  steps: ReasoningStep[]
}

const getStepConfig = (index: number) => {
  switch (index) {
    case 0:
      return {
        icon: <Search className="w-5 h-5 text-indigo-400" />,
        bgClass: 'bg-indigo-500/10',
        borderClass: 'border-indigo-500/20',
        indicatorClass: 'bg-indigo-500',
      }
    case 1:
      return {
        icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
        bgClass: 'bg-amber-500/10',
        borderClass: 'border-amber-500/20',
        indicatorClass: 'bg-amber-500',
      }
    case 2:
      return {
        icon: <Lightbulb className="w-5 h-5 text-emerald-400" />,
        bgClass: 'bg-emerald-500/10',
        borderClass: 'border-emerald-500/20',
        indicatorClass: 'bg-emerald-500',
      }
    default:
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />,
        bgClass: 'bg-slate-500/10',
        borderClass: 'border-slate-500/20',
        indicatorClass: 'bg-slate-500',
      }
  }
}

export function ReasoningPanel({ steps }: ReasoningPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((step, index) => {
        const config = getStepConfig(index)

        return (
          <div 
            key={step.stepNum} 
            className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#171427]/40 p-5 shadow-sm transition-all hover:bg-white/50 dark:hover:bg-[#171427]/60 hover:border-slate-200 dark:hover:border-white/10"
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full ${config.indicatorClass} opacity-80`} />
            
            <div className="flex items-start gap-4 ml-2">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.bgClass} ${config.borderClass}`}>
                {config.icon}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                  {step.label}
                </h4>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {step.detail}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
