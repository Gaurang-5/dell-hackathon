import { useState } from 'react'
import { RecommendationCard } from './components/RecommendationCard'
import { AuditLog } from './components/AuditLog'
import { DeviceFleet } from './components/DeviceFleet'
import { SecurityEventsList } from './components/SecurityEventsList'
import { initialRecommendations, initialActivityLogs, initialDevices, initialSecurityEvents } from './mockData'
import { Toast } from './components/Toast'
import { ShieldAlert, Activity, Clock, TrendingUp, Laptop, Server, Smartphone, Monitor, Settings, CheckCircle2, PieChart, Users } from 'lucide-react'
import type { ActivityLogEntry } from './types'

const getCompactAssetIcon = (assetId: string) => {
  const prefix = assetId.split('-')[0]
  switch (prefix) {
    case 'LAPTOP': return <Laptop className="w-4 h-4 text-slate-400" />
    case 'SERVER': return <Server className="w-4 h-4 text-slate-400" />
    case 'MOBILE': return <Smartphone className="w-4 h-4 text-slate-400" />
    case 'WORKSTATION': return <Monitor className="w-4 h-4 text-slate-400" />
    default: return <Settings className="w-4 h-4 text-slate-400" />
  }
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'audit' | 'devices' | 'events' | 'summary'>('dashboard')
  const [activeRecommendations, setActiveRecommendations] = useState(initialRecommendations)
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(initialActivityLogs)
  const [selectedRecId, setSelectedRecId] = useState<string | null>(initialRecommendations[0]?.id || null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'Recent' | 'Urgency'>('Urgency')

  const handleActionComplete = (recommendationId: string, actionLabel: string) => {
    const rec = activeRecommendations.find(r => r.id === recommendationId)
    const updated = activeRecommendations.filter((r) => r.id !== recommendationId)
    setActiveRecommendations(updated)
    setToast({ message: `Successfully recorded: ${actionLabel}`, type: 'success' })
    if (selectedRecId === recommendationId) {
      setSelectedRecId(updated[0]?.id || null)
    }

    if (rec) {
      let decision: ActivityLogEntry['humanDecision'] = 'Approved'
      if (actionLabel.includes('Alternative') || actionLabel.includes('Schedule')) decision = 'Overridden'
      if (actionLabel.includes('Escalate')) decision = 'Escalated'

      const prefix = rec.assetId.split('-')[0].toLowerCase() as any
      const assetIcon = ['laptop', 'server', 'smartphone', 'monitor'].includes(prefix) ? prefix : 'settings'

      const newLog: ActivityLogEntry = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        assetId: rec.assetId,
        assetIcon,
        actionTaken: actionLabel,
        reasoningSummary: rec.summary,
        humanDecision: decision,
      }
      setActivityLogs(prev => [newLog, ...prev])
    }
  }

  const filteredAndSortedRecommendations = activeRecommendations
    .filter(rec => filterCategory === 'ALL' || rec.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'Urgency') {
        const aTtl = a.ttlExpiration ? new Date(a.ttlExpiration).getTime() : Infinity
        const bTtl = b.ttlExpiration ? new Date(b.ttlExpiration).getTime() : Infinity
        return aTtl - bTtl
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="min-h-screen flex text-white relative font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      <aside className="w-64 glass-panel m-6 flex flex-col z-20 shrink-0 h-[calc(100vh-3rem)]">
        <div className="glass-surface p-6 flex flex-col h-full">
          <div className="text-2xl font-bold mb-10 tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] flex items-center justify-center shadow-[0_0_20px_rgba(237,233,254,0.3)]">
              <ShieldAlert className="w-5 h-5 text-[#0F172A]" />
            </div>
            TrustOps AI
          </div>
        <nav className="space-y-1.5 font-medium text-sm">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              currentView === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            Command Center
          </button>
          <button
            onClick={() => setCurrentView('summary')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              currentView === 'summary' ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Leadership Summary
          </button>
          <button
            onClick={() => setCurrentView('devices')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              currentView === 'devices' ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Device Fleet
          </button>
          <button
            onClick={() => setCurrentView('events')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              currentView === 'events' ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Security Events
          </button>
          <button
            onClick={() => setCurrentView('audit')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              currentView === 'audit' ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            Audit Log
          </button>
        </nav>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto relative z-10 flex flex-col gap-6">
        <header className="flex justify-between items-center bg-[#171427]/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-white">
              {currentView === 'summary' ? 'IT Operations & Security Summary' : 'TrustOps Workspace'}
            </h1>
          </div>
          <div className="text-sm text-slate-400">
            {activeRecommendations.length} pending actions
          </div>
        </header>

        {currentView === 'summary' && (
          <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 w-full">
            <div className="glass-panel p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Executive Overview</h2>
              <p className="text-slate-300 text-lg leading-relaxed max-w-3xl relative z-10">
                The organization's IT infrastructure is currently operating at a <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">94% Health Score</span>. 
                Our proactive monitoring systems have identified <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{activeRecommendations.length} potential issues</span> that require human review. 
                All automated systems have been configured to require explicit IT administrator approval before taking any remediation actions, ensuring complete human oversight of the fleet.
              </p>
            </div>
            
            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Device Status Pie Chart */}
              <div className="glass-panel p-6 col-span-1">
                <div className="flex items-center gap-3 mb-8">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white tracking-tight">Fleet Compliance</h3>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 mb-8 group">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-xl transition-transform duration-500 group-hover:scale-105">
                      {/* Background track */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#171427" strokeWidth="16" />
                      
                      {/* Healthy Segment (approx 90%) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="25.12" strokeLinecap="round" className="opacity-90" />
                      
                      {/* Needs Review Segment (approx 10%) */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="226.08" className="transform origin-center rotate-[324deg] opacity-90" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-extrabold text-white tracking-tighter">{initialDevices.length}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Devices</span>
                    </div>
                  </div>
                  
                  <div className="flex w-full justify-between px-4 text-sm bg-[#171427]/40 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-slate-200 font-medium">Healthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                      <span className="text-slate-200 font-medium">Review</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Metrics */}
              <div className="glass-panel p-6 col-span-1 md:col-span-2 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white tracking-tight">Intervention Analytics</h3>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">Last 30 Days</span>
                </div>
                
                <div className="space-y-8 flex-1 flex flex-col justify-center">
                  <div className="group">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-300 font-medium tracking-wide flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        Automated Interventions Prevented
                      </span>
                      <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">{activeRecommendations.length} pending</span>
                    </div>
                    <div className="h-4 w-full bg-[#101010] rounded-full overflow-hidden shadow-inner border border-white/5">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 w-3/4 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000"></div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-300 font-medium tracking-wide flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        Human Decisions Logged
                      </span>
                      <span className="text-indigo-400 font-bold bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">{activityLogs.length} total</span>
                    </div>
                    <div className="h-4 w-full bg-[#101010] rounded-full overflow-hidden shadow-inner border border-white/5">
                      <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-400 w-full rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-1000"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 pt-6 mt-auto border-t border-white/10">
                     <div className="flex flex-col gap-1.5 bg-[#171427]/40 p-4 rounded-xl border border-white/5 hover:border-red-500/30 transition-colors">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          Security
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-white">{activeRecommendations.filter(r => r.category === 'SECURITY_FLAG').length}</span>
                          <span className="text-xs text-slate-500 font-medium">flags</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5 bg-[#171427]/40 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                          Maintenance
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-white">{activeRecommendations.filter(r => r.category === 'MAINTENANCE_REQ').length}</span>
                          <span className="text-xs text-slate-500 font-medium">reqs</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5 bg-[#171427]/40 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          Calibration
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-white">{activeRecommendations.filter(r => r.category === 'CALIBRATION_REQ').length}</span>
                          <span className="text-xs text-slate-500 font-medium">issues</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5 bg-[#171427]/40 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                          Firmware
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-white">{activeRecommendations.filter(r => r.category === 'FIRMWARE_ALERT').length}</span>
                          <span className="text-xs text-slate-500 font-medium">updates</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          <>
            {/* At-a-Glance Stats Row */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Card 1: Critical Items */}
              <div className="glass-panel h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-red-500/20 pointer-events-none"></div>
                <div className="glass-surface p-6 flex flex-col justify-between h-full relative z-10 border-l-[6px] border-red-500 rounded-l-md">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Important Actions</p>
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-3">
                      <p className="text-5xl font-black text-white tracking-tighter">{activeRecommendations.filter(r => r.category === 'SECURITY_FLAG' || r.title.includes('Critical')).length}</p>
                      <span className="text-sm font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">Critical</span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mt-3 flex items-center gap-1.5">
                       <Activity className="w-4 h-4 text-red-400" /> Immediate attention required
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Pending Approvals */}
              <div className="glass-panel h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-amber-500/20 pointer-events-none"></div>
                <div className="glass-surface p-6 flex flex-col justify-between h-full relative z-10 border-l-[6px] border-amber-500 rounded-l-md">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Pending Reviews</p>
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-3">
                      <p className="text-5xl font-black text-white tracking-tighter">{activeRecommendations.length}</p>
                      <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">Total</span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mt-3 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" /> Awaiting administrator decision
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: System Overview */}
              <div className="glass-panel h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-emerald-500/20 pointer-events-none"></div>
                <div className="glass-surface p-6 flex flex-col justify-between h-full relative z-10 border-l-[6px] border-emerald-500 rounded-l-md">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Fleet Overview</p>
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-3">
                      <p className="text-5xl font-black text-white tracking-tighter">94<span className="text-3xl text-emerald-400">%</span></p>
                      <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">Health</span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mt-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fleet operating normally
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
              {/* Left Pane (List View) */}
              <div className="col-span-4 flex flex-col gap-3 pb-32">
                {/* Filters & Sorts */}
                <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-[#171427]/40 p-3 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter</span>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-[#101010] border border-white/10 rounded-md px-2 py-1 text-xs text-white outline-none focus:border-[#EDE9FE]/50"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="MAINTENANCE_REQ">Maintenance</option>
                      <option value="CALIBRATION_REQ">Calibration</option>
                      <option value="FIRMWARE_ALERT">Firmware</option>
                      <option value="SECURITY_FLAG">Security</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sort By</span>
                    <div className="flex bg-[#101010] border border-white/10 rounded-md overflow-hidden">
                      {['Urgency', 'Recent'].map((sortOption) => (
                        <button
                          key={sortOption}
                          onClick={() => setSortBy(sortOption as any)}
                          className={`px-2 py-1 text-xs font-medium transition-colors ${
                            sortBy === sortOption ? 'bg-[#EDE9FE]/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                          }`}
                        >
                          {sortOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                {filteredAndSortedRecommendations.map((rec, index) => {
                  const isSelected = selectedRecId === rec.id
                  
                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecId(rec.id)}
                      className={`animate-fade-in-up cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? 'border-[#EDE9FE] bg-[#171427]/80 shadow-[0_0_15px_rgba(237,233,254,0.15)] scale-[1.01] backdrop-blur-md'
                          : 'border-white/10 bg-[#101010]/60 hover:border-white/20 hover:bg-[#171427]/60 backdrop-blur-sm opacity-80 hover:opacity-100'
                      }`}
                      style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'both' }}
                    >
                      <div className="p-4 relative">
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EDE9FE] rounded-l-xl" />
                        )}
                        <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
                          {getCompactAssetIcon(rec.assetId)}
                          <span className="font-medium text-slate-300">{rec.assetId}</span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-white line-clamp-2">
                            {rec.title}
                          </h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {rec.category === 'SECURITY_FLAG' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">Security</span>
                          )}
                          {rec.category === 'MAINTENANCE_REQ' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">Maintenance</span>
                          )}
                          {rec.category === 'CALIBRATION_REQ' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">Calibration</span>
                          )}
                          {rec.category === 'FIRMWARE_ALERT' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">Firmware</span>
                          )}
                          {rec.title.includes('Critical') && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">Critical</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredAndSortedRecommendations.length === 0 && (
                  <div className="text-center py-12 glass-panel">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-[#EDE9FE]/50 mb-3" />
                    <p className="text-slate-400 font-medium">No pending actions match your filters</p>
                  </div>
                )}
                </div>
              </div>

              {/* Right Pane (Detail View) */}
              <div className="col-span-8 overflow-y-auto pb-32 pr-2">
                {selectedRecId && activeRecommendations.find(r => r.id === selectedRecId) ? (
                  <RecommendationCard
                    recommendation={activeRecommendations.find(r => r.id === selectedRecId)!}
                    onActionComplete={handleActionComplete}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="rounded-full bg-[#171427]/50 border border-white/10 p-6 shadow-sm mb-4 backdrop-blur-sm">
                      <CheckCircle2 className="h-12 w-12 text-[#EDE9FE]" />
                    </div>
                    <p className="text-slate-400 font-medium">All clear. Select an anomaly to review its AI analysis.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {currentView === 'audit' && (
          <AuditLog logs={activityLogs} />
        )}

        {currentView === 'devices' && (
          <DeviceFleet devices={initialDevices} />
        )}

        {currentView === 'events' && (
          <SecurityEventsList events={initialSecurityEvents} />
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App

