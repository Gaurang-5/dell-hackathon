import { useState, useMemo } from 'react'
import { AlertCircle, ShieldAlert, AlertTriangle, Search, Filter, ArrowUpDown } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [sortBy, setSortBy] = useState<'DateDesc' | 'DateAsc' | 'Severity'>('DateDesc')

  const filteredAndSortedEvents = useMemo(() => {
    return events
      .filter(event => {
        const matchesSearch = event.device_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              event.plain_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              formatEventType(event.event_type).toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterSeverity === 'ALL' || event.severity === filterSeverity
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        if (sortBy === 'Severity') {
          const sevMap: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 }
          return (sevMap[b.severity] || 0) - (sevMap[a.severity] || 0)
        }
        const timeA = new Date(a.timestamp).getTime()
        const timeB = new Date(b.timestamp).getTime()
        return sortBy === 'DateDesc' ? timeB - timeA : timeA - timeB
      })
  }, [events, searchQuery, filterSeverity, sortBy])

  const uniqueSeverities = useMemo(() => Array.from(new Set(events.map(e => e.severity))), [events])

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Security Events</h1>
          <p className="mt-2 text-slate-400 font-medium">
            Overview of {filteredAndSortedEvents.length} active anomalies and policy violations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events or devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#101010]/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50 w-64"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-[#101010]/50 border border-white/10 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none capitalize"
            >
              <option value="ALL">All Severities</option>
              {uniqueSeverities.map(sev => (
                <option key={sev} value={sev} className="capitalize">{sev}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-[#101010]/50 border border-white/10 rounded-lg px-3 py-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'DateDesc' | 'DateAsc' | 'Severity')}
              className="bg-transparent text-sm text-slate-300 focus:outline-none"
            >
              <option value="DateDesc">Newest First</option>
              <option value="DateAsc">Oldest First</option>
              <option value="Severity">Sort by Severity</option>
            </select>
          </div>
        </div>
      </header>

      <div className="glass-panel">
        <div className="glass-surface overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="border-b border-white/10 bg-[#171427]/50 text-xs uppercase tracking-wider text-slate-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Timestamp</th>
                <th scope="col" className="px-6 py-4 font-medium">Severity</th>
                <th scope="col" className="px-6 py-4 font-medium">Event Type</th>
                <th scope="col" className="px-6 py-4 font-medium">Affected Device</th>
                <th scope="col" className="px-6 py-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSortedEvents.map((event) => {
                const isCritical = event.severity === 'critical'
                const isHigh = event.severity === 'high'

                return (
                  <tr key={event.event_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {formatDate(event.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-[#F87171] border border-red-500/20">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Critical
                        </span>
                      ) : isHigh ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-500 border border-amber-500/20">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          High
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-300 border border-white/5">
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
