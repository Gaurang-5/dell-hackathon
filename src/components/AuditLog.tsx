import { useState, useMemo } from 'react'
import { ActivityLogEntry } from '../types'
import { IncidentReportModal } from './IncidentReportModal'
import { formatDate } from '../utils/transparencyHelpers'
import { Laptop, Server, Smartphone, Monitor, Shield, Settings, Search, Filter, ArrowUpDown } from 'lucide-react'

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



const getDecisionBadgeClass = (decision: string) => {
  switch (decision) {
    case 'Approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Overridden':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'Escalated':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200'
  }
}

export function AuditLog({ logs }: AuditLogProps) {
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDecision, setFilterDecision] = useState('ALL')
  const [sortBy, setSortBy] = useState<'DateDesc' | 'DateAsc'>('DateDesc')

  const filteredAndSortedLogs = useMemo(() => {
    return logs
      .filter(log => {
        const matchesSearch = log.assetId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              log.actionTaken.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              log.reasoningSummary.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterDecision === 'ALL' || log.humanDecision === filterDecision
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime()
        const timeB = new Date(b.timestamp).getTime()
        return sortBy === 'DateDesc' ? timeB - timeA : timeA - timeB
      })
  }, [logs, searchQuery, filterDecision, sortBy])

  const uniqueDecisions = useMemo(() => Array.from(new Set(logs.map(l => l.humanDecision))), [logs])

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Audit Log</h1>
          <p className="mt-2 text-slate-400 font-medium">
            History of {filteredAndSortedLogs.length} AI recommendations and human decisions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs or devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#101010]/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50 w-64"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-[#101010]/50 border border-white/10 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none capitalize"
            >
              <option value="ALL">All Decisions</option>
              {uniqueDecisions.map(dec => (
                <option key={dec} value={dec} className="capitalize">{dec}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-[#101010]/50 border border-white/10 rounded-lg px-3 py-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'DateDesc' | 'DateAsc')}
              className="bg-transparent text-sm text-slate-300 focus:outline-none"
            >
              <option value="DateDesc">Newest First</option>
              <option value="DateAsc">Oldest First</option>
            </select>
          </div>
        </div>
      </header>

      <div className="glass-panel">
        <div className="glass-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#171427]/50 text-slate-300 font-medium border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Date/Time</th>
                  <th className="px-6 py-4">Device</th>
                  <th className="px-6 py-4">Action Taken</th>
                  <th className="px-6 py-4 w-1/3">AI Reasoning Summary</th>
                  <th className="px-6 py-4">Human Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAndSortedLogs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                      <div className="flex items-center">
                        {getIconForAsset(log.assetIcon)}
                        {log.assetId}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{log.actionTaken}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {log.reasoningSummary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2 items-start">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getDecisionBadgeClass(
                            log.humanDecision
                          )}`}
                        >
                          {log.humanDecision}
                        </span>
                        {(log.humanDecision === 'Overridden' || log.humanDecision === 'Escalated') && (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-xs font-semibold text-[#EDE9FE] hover:text-white hover:underline"
                          >
                            View AI Incident Report
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </div>
      </div>
      
      {selectedLog && (
        <IncidentReportModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  )
}
