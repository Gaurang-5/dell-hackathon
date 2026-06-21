
import { ActivityLogEntry } from '../types'
import { getConfidenceDisplay, formatDate } from '../utils/transparencyHelpers'
import { Laptop, Server, Smartphone, Monitor, Shield, Settings } from 'lucide-react'

interface AuditLogProps {
  logs: ActivityLogEntry[]
}

const getIconForAsset = (iconType: string) => {
  switch (iconType) {
    case 'laptop':
      return <Laptop className="w-4 h-4 mr-2 text-slate-500" />
    case 'server':
      return <Server className="w-4 h-4 mr-2 text-slate-500" />
    case 'smartphone':
      return <Smartphone className="w-4 h-4 mr-2 text-slate-500" />
    case 'monitor':
      return <Monitor className="w-4 h-4 mr-2 text-slate-500" />
    case 'shield':
      return <Shield className="w-4 h-4 mr-2 text-slate-500" />
    case 'settings':
      return <Settings className="w-4 h-4 mr-2 text-slate-500" />
    default:
      return <Monitor className="w-4 h-4 mr-2 text-slate-500" />
  }
}

const mapConfidenceToScore = (confidence: string): number => {
  if (confidence === 'HIGH') return 0.9
  if (confidence === 'MEDIUM') return 0.7
  return 0.4
}

const getDecisionBadgeClass = (decision: string) => {
  switch (decision) {
    case 'Approved':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'Overridden':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'Escalated':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200'
  }
}

export function AuditLog({ logs }: AuditLogProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Date/Time</th>
              <th className="px-6 py-4">Device</th>
              <th className="px-6 py-4">Action Taken</th>
              <th className="px-6 py-4 w-1/3">AI Reasoning Summary</th>
              <th className="px-6 py-4">Confidence</th>
              <th className="px-6 py-4">Human Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => {
              const confidenceDisplay = getConfidenceDisplay(
                mapConfidenceToScore(log.confidence)
              )

              return (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                    <div className="flex items-center">
                      {getIconForAsset(log.assetIcon)}
                      {log.assetId}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{log.actionTaken}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {log.reasoningSummary}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${confidenceDisplay.colorClass}`}
                    >
                      {confidenceDisplay.label.split(' — ')[0]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getDecisionBadgeClass(
                        log.humanDecision
                      )}`}
                    >
                      {log.humanDecision}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
