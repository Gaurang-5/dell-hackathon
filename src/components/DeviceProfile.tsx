import { useMemo } from 'react'
import { ActivityLogEntry, Device, Recommendation, SecurityEvent } from '../types'
import { Monitor, ArrowLeft, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'
import { formatDate } from '../utils/transparencyHelpers'

interface DeviceProfileProps {
  deviceId: string
  devices: Device[]
  recommendations: Recommendation[]
  events: SecurityEvent[]
  logs: ActivityLogEntry[]
  onBack: () => void
}

export function DeviceProfile({ deviceId, devices, recommendations, events, logs, onBack }: DeviceProfileProps) {
  const device = useMemo(() => devices.find(d => d.device_id === deviceId), [devices, deviceId])
  
  const deviceRecommendations = useMemo(() => 
    recommendations.filter(r => r.assetId === deviceId || r.assetId === device?.device_name),
  [recommendations, deviceId, device])

  const deviceEvents = useMemo(() => 
    events.filter(e => e.device_id === deviceId),
  [events, deviceId])

  const deviceLogs = useMemo(() => 
    logs.filter(l => l.assetId === deviceId || l.assetId === device?.device_name),
  [logs, deviceId, device])

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Monitor className="w-12 h-12 mb-4 opacity-50" />
        <p>Device not found</p>
        <button onClick={onBack} className="mt-4 text-indigo-400 hover:underline">Go back</button>
      </div>
    )
  }

  const patchPct = Math.round(device.patch_compliance_pct * 100)
  const isPatchWarning = patchPct < 70

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 pb-12">
      <header className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 bg-slate-200 dark:bg-[#101010]/50 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-100 dark:bg-white/5 transition-colors text-slate-600 dark:text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Monitor className="w-8 h-8 text-indigo-400" />
            {device.device_name}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
            <span className="bg-slate-200 dark:bg-[#101010]/50 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 text-xs">{device.device_id}</span>
            <span>•</span>
            <span>{device.assigned_user} ({device.department})</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Vitals */}
        <div className="glass-panel p-5 flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Patch Compliance</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-black ${isPatchWarning ? 'text-red-500' : 'text-emerald-500'}`}>{patchPct}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mt-2">
             <div className={`h-full ${isPatchWarning ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${patchPct}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Antivirus Status</p>
          <div className="mt-2 flex">
            {device.antivirus_status === 'active' ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" /> Active
              </span>
            ) : device.antivirus_status === 'outdated' ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-5 w-5" /> Outdated
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-bold text-red-600 dark:text-red-400 border border-red-500/20">
                <ShieldAlert className="h-5 w-5" /> Missing
              </span>
            )}
          </div>
        </div>

        <div className="glass-panel p-5 flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">System Resources</p>
          <div className="flex flex-col gap-3 mt-1">
            <div>
               <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-400"><span>CPU (7d avg)</span> <span className="font-bold text-slate-900 dark:text-white">{device.cpu_avg_7d}%</span></div>
               <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-indigo-400" style={{ width: `${device.cpu_avg_7d}%` }} /></div>
            </div>
            <div>
               <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-400"><span>RAM Usage</span> <span className="font-bold text-slate-900 dark:text-white">{device.ram_usage_pct}%</span></div>
               <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-indigo-400" style={{ width: `${device.ram_usage_pct}%` }} /></div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 flex flex-col gap-2">
           <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Device Details</p>
           <div className="flex flex-col gap-1 mt-1 text-sm">
             <div className="flex justify-between"><span className="text-slate-500">OS</span><span className="font-medium text-slate-900 dark:text-white">{device.os}</span></div>
             <div className="flex justify-between"><span className="text-slate-500">Encrypted</span><span className="font-medium text-slate-900 dark:text-white">{device.is_encrypted ? 'Yes' : 'No'}</span></div>
             <div className="flex justify-between"><span className="text-slate-500">Segment</span><span className="font-medium text-slate-900 dark:text-white capitalize">{device.fleet_segment}</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
        {/* Left Column: Fixes & Events */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-[#FDFCF8] dark:bg-[#171427]/50">
               <h3 className="font-bold text-slate-900 dark:text-white">Active Recommendations ({deviceRecommendations.length})</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {deviceRecommendations.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No active AI recommendations for this device.</p>
              ) : (
                deviceRecommendations.map(rec => (
                  <div key={rec.id} className="bg-slate-100 dark:bg-[#101010]/50 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                     <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{rec.title}</h4>
                     <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{rec.summary}</p>
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        rec.status === 'High Confidence' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                        rec.status === 'Medium' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                        'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
                     }`}>{rec.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-[#FDFCF8] dark:bg-[#171427]/50">
               <h3 className="font-bold text-slate-900 dark:text-white">Recent Security Events ({deviceEvents.length})</h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {deviceEvents.length === 0 ? (
                <p className="text-sm text-slate-500 italic p-5">No recent security events.</p>
              ) : (
                deviceEvents.map(event => (
                  <div key={event.event_id} className="p-4 flex flex-col gap-1 hover:bg-white/50 dark:hover:bg-white/5 hover:backdrop-blur-sm transition-all cursor-pointer">
                     <div className="flex justify-between items-start">
                       <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{event.plain_description}</span>
                       <span className="text-[10px] text-slate-500 whitespace-nowrap">{formatDate(event.timestamp)}</span>
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-wider self-start px-2 py-0.5 rounded border mt-1 ${
                        event.severity === 'critical' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
                        event.severity === 'high' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                        'text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20'
                     }`}>{event.severity}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Audit Log */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel flex flex-col overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-[#FDFCF8] dark:bg-[#171427]/50">
               <h3 className="font-bold text-slate-900 dark:text-white">Audit Log History</h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-white/10 overflow-y-auto max-h-[600px]">
              {deviceLogs.length === 0 ? (
                <p className="text-sm text-slate-500 italic p-5">No audit logs found for this device.</p>
              ) : (
                deviceLogs.map(log => (
                  <div key={log.id} className="p-5 flex flex-col gap-2 hover:bg-white/50 dark:hover:bg-white/5 hover:backdrop-blur-sm transition-all cursor-pointer">
                     <div className="flex justify-between items-start mb-1">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                         log.humanDecision === 'Approved' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                         log.humanDecision === 'Overridden' ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' :
                         log.humanDecision === 'Escalated' ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20' :
                         'text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20'
                       }`}>{log.humanDecision}</span>
                       <span className="text-[10px] text-slate-500 whitespace-nowrap">{formatDate(log.timestamp)}</span>
                     </div>
                     <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{log.actionTaken}</p>
                     <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#101010]/50 p-3 rounded-lg border border-slate-200 dark:border-white/5 mt-1">{log.reasoningSummary}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
