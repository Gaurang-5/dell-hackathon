import { X, ShieldAlert, Activity, AlertTriangle } from 'lucide-react'
import type { ActivityLogEntry } from '../types'

interface IncidentReportModalProps {
  log: ActivityLogEntry
  onClose: () => void
}

export function IncidentReportModal({ log, onClose }: IncidentReportModalProps) {
  // Generate a random ID like INC-8492
  const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Incident Report</h2>
              <p className="text-sm font-medium text-slate-500">
                {incidentId} • {new Date(log.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-6">
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-800">
              <Activity className="h-4 w-4" />
              What happened
            </h3>
            <p className="text-sm leading-relaxed text-rose-900">
              AI recommended <strong>{log.actionTaken}</strong> for {log.assetId}, but Human Admin overrode the decision to <strong>{log.humanDecision}</strong>.
            </p>
          </div>

          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
              <ShieldAlert className="h-4 w-4" />
              Safeguard triggered
            </h3>
            <p className="text-sm leading-relaxed text-amber-900">
              Human-in-the-loop review. The action was paused pending explicit human confirmation, preventing an unintended system change.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
              <AlertTriangle className="h-4 w-4" />
              Root Cause Analysis (Simulated)
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              AI over-indexed on telemetry data and lacked context regarding scheduled departmental maintenance. The model confidence was <strong>{log.confidence}</strong>, which triggered the required human-in-the-loop escalation pathway.
            </p>
          </div>
        </div>

        <footer className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-right">
          <button
            onClick={onClose}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Acknowledge & Close
          </button>
        </footer>
      </div>
    </div>
  )
}
