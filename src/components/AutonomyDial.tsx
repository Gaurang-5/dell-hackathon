import { User, Zap, Bot, ShieldAlert } from 'lucide-react'

interface AutonomyDialProps {
  level: 'ask' | 'notify' | 'auto'
  onChange: (level: 'ask' | 'notify' | 'auto') => void
}

export function AutonomyDial({ level, onChange }: AutonomyDialProps) {
  return (
    <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Autonomy Dial</h2>
        <p className="mt-1 text-sm text-slate-500">
          Global setting to determine how much autonomy the AI is granted for system remediation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Level 1: Ask */}
        <button
          type="button"
          onClick={() => onChange('ask')}
          className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
            level === 'ask'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <User className={`mb-2 h-6 w-6 ${level === 'ask' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span className="font-semibold">Always Ask Me</span>
          <span className="mt-1 text-center text-xs opacity-80">Strict human-in-the-loop</span>
        </button>

        {/* Level 2: Notify */}
        <button
          type="button"
          onClick={() => onChange('notify')}
          className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
            level === 'notify'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Zap className={`mb-2 h-6 w-6 ${level === 'notify' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="font-semibold">Act & Notify</span>
          <span className="mt-1 text-center text-xs opacity-80">AI handles routine tasks</span>
        </button>

        {/* Level 3: Auto (Disabled) */}
        <button
          type="button"
          disabled
          title="Requires Enterprise Trust Tier"
          className="flex cursor-not-allowed flex-col items-center justify-center rounded-lg border-2 border-slate-100 bg-slate-50 p-4 text-slate-400 opacity-70"
        >
          <Bot className="mb-2 h-6 w-6 text-slate-300" />
          <span className="font-semibold">Fully Autonomous</span>
          <span className="mt-1 text-center text-xs">Disabled (Enterprise Tier)</span>
        </button>
      </div>

      {level === 'notify' && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm font-medium">
            Warning: AI is now authorized to execute Routine maintenance without explicit approval.
          </p>
        </div>
      )}
    </section>
  )
}
