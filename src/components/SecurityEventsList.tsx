import { AlertCircle, ShieldAlert, AlertTriangle } from 'lucide-react'
import type { SecurityEvent } from '../types'
import { formatDate } from '../utils/transparencyHelpers'

interface SecurityEventsListProps {
  events: SecurityEvent[]
}

const formatEventType = (type: string) => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function SecurityEventsList({ events }: SecurityEventsListProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900">Security Events</h1>
        <p className="mt-1 text-slate-600">
          Active anomalies and policy violations
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Timestamp</th>
                <th scope="col" className="px-6 py-4 font-medium">Severity</th>
                <th scope="col" className="px-6 py-4 font-medium">Event Type</th>
                <th scope="col" className="px-6 py-4 font-medium">Affected Device</th>
                <th scope="col" className="px-6 py-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.slice(0, 50).map((event) => {
                const isCritical = event.severity === 'critical'
                const isHigh = event.severity === 'high'

                return (
                  <tr key={event.event_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {formatDate(event.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Critical
                        </span>
                      ) : isHigh ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          High
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Medium
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                      {formatEventType(event.event_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{event.device_name}</p>
                      <p className="text-xs text-slate-500">{event.device_id}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-md">
                      <p className="truncate" title={event.plain_description}>{event.plain_description}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
