import { X, ShieldAlert, Activity, AlertTriangle } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { ActivityLogEntry } from '../types'

interface IncidentReportModalProps {
  log: ActivityLogEntry
  onClose: () => void
}

export function IncidentReportModal({ log, onClose }: IncidentReportModalProps) {
  // Generate a random ID like INC-8492
  const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101010]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl glass-panel shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#171427]/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-[#F87171] border border-red-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Incident Report</h2>
              <p className="text-sm font-medium text-slate-400">
                {incidentId} • {new Date(log.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-6 glass-surface">
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#F87171]">
              <Activity className="h-4 w-4" />
              What happened
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              AI recommended <strong className="text-white">{log.actionTaken}</strong> for <strong className="text-white">{log.assetId}</strong>, but Human Admin overrode the decision to <strong className="text-white">{log.humanDecision}</strong>.
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-500">
              <ShieldAlert className="h-4 w-4" />
              Safeguard triggered
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Human-in-the-loop review. The action was paused pending explicit human confirmation, preventing an unintended system change.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#101010]/50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#EDE9FE]">
              <AlertTriangle className="h-4 w-4" />
              Root Cause Analysis (Simulated)
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              The recommendation relied too heavily on telemetry and did not include scheduled departmental maintenance. The required human review prevented an unintended system change and preserved the reason for the override.
            </p>
          </div>
        </div>

        <footer className="border-t border-white/10 bg-[#171427]/80 px-6 py-4 text-right">
          <button
            onClick={onClose}
            className="rounded-full bg-[#FAFAFA] px-6 py-3 text-sm font-semibold text-[#020617] hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 border-0 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            Acknowledge & Close
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}
