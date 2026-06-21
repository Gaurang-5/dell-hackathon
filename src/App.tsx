import { useState } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { RecommendationCard } from './components/RecommendationCard'
import { AuditLog } from './components/AuditLog'
import { DeviceFleet } from './components/DeviceFleet'
import { SecurityEventsList } from './components/SecurityEventsList'
import { initialRecommendations, initialActivityLogs, initialDevices, initialSecurityEvents } from './mockData'
import { Toast } from './components/Toast'
import { ShieldAlert, Activity, Clock, TrendingUp, Laptop, Server, Smartphone, Monitor, Settings, CheckCircle2, PieChart as PieChartIcon, Users, Bell, Search, LayoutDashboard } from 'lucide-react'
import type { ActivityLogEntry } from './types'

const pieData = [
  { name: 'Healthy', value: 847, color: '#10B981' },
  { name: 'Outdated', value: 289, color: '#F59E0B' },
  { name: 'Critical', value: 111, color: '#EF4444' },
]

const lineData = [
  { time: 'Mon', alerts: 4, resolved: 3 },
  { time: 'Tue', alerts: 7, resolved: 5 },
  { time: 'Wed', alerts: 3, resolved: 3 },
  { time: 'Thu', alerts: 9, resolved: 6 },
  { time: 'Fri', alerts: 6, resolved: 7 },
  { time: 'Sat', alerts: 2, resolved: 2 },
  { time: 'Sun', alerts: 5, resolved: 4 },
]

const recentActivity = [
  { time: '10:30 AM', event: 'Patch applied to SERVER-07', type: 'success' },
  { time: '10:25 AM', event: 'New device enrolled: LAPTOP-0091', type: 'info' },
  { time: '10:15 AM', event: 'Critical alert detected on LAPTOP-0042', type: 'critical' },
  { time: '09:50 AM', event: 'MFA enforced on 3 devices', type: 'success' },
  { time: '09:14 AM', event: 'AI recommendation generated for LAPTOP-0042', type: 'info' },
]

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
  const [currentView, setCurrentView] = useState<'analytics' | 'dashboard' | 'audit' | 'devices' | 'events' | 'summary'>('analytics')
  const [activeRecommendations, setActiveRecommendations] = useState(initialRecommendations)
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(initialActivityLogs)
  const [selectedRecId, setSelectedRecId] = useState<string | null>(initialRecommendations[0]?.id || null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'Recent' | 'Urgency'>('Urgency')
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [aiAutonomy, setAiAutonomy] = useState<'always_ask' | 'act_notify' | 'auto'>('always_ask')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [criticalAlertsOnly, setCriticalAlertsOnly] = useState(false)

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
    .filter(rec => {
      const matchesCategory = filterCategory === 'ALL' || rec.category === filterCategory
      const matchesSearch = !searchQuery ||
        rec.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.summary.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
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
          {/* Logo */}
          <div className="text-2xl font-bold mb-10 tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] flex items-center justify-center shadow-[0_0_20px_rgba(237,233,254,0.3)]">
              <ShieldAlert className="w-5 h-5 text-[#0F172A]" />
            </div>
            TrustOps AI
          </div>

          {/* Main Nav */}
          <nav className="space-y-1.5 font-medium text-sm flex-1">
            <button
              onClick={() => setCurrentView('analytics')}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                currentView === 'analytics' ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
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
              {activeRecommendations.filter(r => r.category === 'SECURITY_FLAG').length > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {activeRecommendations.filter(r => r.category === 'SECURITY_FLAG').length}
                </span>
              )}
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

          {/* Bottom: Settings + Profile */}
          <div className="mt-auto pt-4 border-t border-white/10 space-y-1.5">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800/50 hover:text-slate-100 transition-all duration-200 text-slate-400"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 mt-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">John Doe</p>
                <p className="text-[10px] text-slate-400 truncate">admin@company.com</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto relative z-10 flex flex-col gap-6">
        <header className="flex justify-between items-center bg-[#171427]/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg mb-4 gap-4">
          {/* Title */}
          <div className="flex items-center gap-3 shrink-0">
            <h1 className="text-xl font-bold tracking-tight text-white">
              {currentView === 'summary' ? 'IT Operations & Security Summary'
                : currentView === 'audit' ? 'Audit Log'
                : currentView === 'devices' ? 'Device Fleet'
                : currentView === 'events' ? 'Security Events'
                : currentView === 'analytics' ? 'Dashboard'
                : 'Command Center'}
            </h1>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">AI Agent Active</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search devices or actions..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#101010]/60 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/40 text-white placeholder:text-slate-500 transition-all"
            />
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(n => !n); setShowProfileMenu(false) }}
                className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Bell className="w-4 h-4" />
                {activeRecommendations.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                    {activeRecommendations.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div
                  className="fixed top-20 right-44 w-80 bg-[#171427] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden"
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Pending Actions</p>
                    <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">{activeRecommendations.length} pending</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {activeRecommendations.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6">All caught up! ✅</p>
                    ) : activeRecommendations.slice(0, 5).map(rec => (
                      <button
                        key={rec.id}
                        onClick={() => { setCurrentView('dashboard'); setSelectedRecId(rec.id); setShowNotifications(false) }}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <p className="text-xs font-semibold text-white truncate">{rec.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{rec.assetId} · {rec.category.replace('_', ' ')}</p>
                      </button>
                    ))}
                  </div>
                  {activeRecommendations.length > 5 && (
                    <button
                      onClick={() => { setCurrentView('dashboard'); setShowNotifications(false) }}
                      className="w-full text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 py-3 border-t border-white/10 transition-colors"
                    >
                      View all {activeRecommendations.length} →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(p => !p)}
                className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow">
                  JD
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-none">IT Admin</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">admin@company.com</p>
                </div>
              </button>
              {showProfileMenu && (
                <div
                  className="fixed top-20 right-4 w-48 bg-[#171427] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <button
                    onClick={() => { setShowProfileModal(true); setShowProfileMenu(false) }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>👤</span> My Profile
                  </button>
                  <button
                    onClick={() => { setShowSettings(true); setShowProfileMenu(false) }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>⚙️</span> Settings
                  </button>
                  <div className="border-t border-white/10" />
                  <button
                    onClick={() => { setToast({ message: 'You have been signed out.', type: 'success' }); setShowProfileMenu(false) }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {currentView === 'summary' && (
          <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 max-w-[1400px] mx-auto w-full">
            <div className="glass-panel p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Executive Overview</h2>
              <p className="text-slate-300 text-lg leading-relaxed max-w-5xl relative z-10">
                The organization's IT infrastructure is currently operating at a{' '}
                <span className="inline-flex items-center text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  94% Health Score
                </span>
                . Our proactive monitoring systems have identified{' '}
                <span className="inline-flex items-center text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {activeRecommendations.length} potential issues
                </span>{' '}
                that require human review. All automated systems have been configured to require explicit IT administrator approval before taking any remediation actions, ensuring complete human oversight of the fleet.
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
                  
                  <div className="flex w-full justify-center gap-12 px-4 text-sm bg-[#171427]/40 p-4 rounded-xl border border-white/5">
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

        {/* ── Analytics Dashboard View ────────────────────────── */}
        {currentView === 'analytics' && (
          <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">

            {/* Subtitle */}
            <div>
              <p className="text-xs text-slate-400">Last updated: just now · June 21, 2025 &nbsp;·&nbsp;
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />AI Agent Active
                </span>
              </p>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Devices', value: initialDevices.length.toLocaleString(), sub: 'monitored endpoints', badge: '+12 this week ↑', badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <Monitor className="w-5 h-5 text-indigo-400" />, iconBg: 'bg-indigo-500/10 border-indigo-500/20', valColor: 'text-indigo-400' },
                { label: 'Pending Actions', value: activeRecommendations.length.toString(), sub: 'require your approval', badge: `${activeRecommendations.length} awaiting review`, badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <Clock className="w-5 h-5 text-amber-400" />, iconBg: 'bg-amber-500/10 border-amber-500/20', valColor: 'text-amber-400' },
                { label: 'Critical Alerts', value: activeRecommendations.filter(r => r.category === 'SECURITY_FLAG').length.toString(), sub: 'need immediate attention', badge: '⚠ Action required', badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <ShieldAlert className="w-5 h-5 text-red-400" />, iconBg: 'bg-red-500/10 border-red-500/20', valColor: 'text-red-400' },
                { label: 'Fleet Health', value: '84%', sub: 'devices compliant', badge: '+5% from last month ↑', badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, iconBg: 'bg-emerald-500/10 border-emerald-500/20', valColor: 'text-emerald-400' },
              ].map(card => (
                <div key={card.label} className="glass-panel relative overflow-hidden group">
                  <div className="glass-surface p-5 flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.iconBg}`}>{card.icon}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>{card.badge}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{card.label}</p>
                      <p className={`text-4xl font-black tracking-tight ${card.valColor}`}>{card.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Middle Row: Fleet Health + Alert Trends + Recent Activity */}
            <div className="grid grid-cols-12 gap-4">
              {/* Fleet Health Donut */}
              <div className="col-span-4 glass-panel">
                <div className="glass-surface p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Fleet Health</h3>
                    <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">{initialDevices.length.toLocaleString()} total</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative w-44 h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white">84%</span>
                        <span className="text-xs text-slate-400 font-medium">Healthy</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs">
                      {pieData.map(d => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: d.color, boxShadow: `0 0 6px ${d.color}80` }} />
                          <span className="text-slate-300 font-medium">{d.name}</span>
                          <span className="text-slate-500">({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Trends */}
              <div className="col-span-5 glass-panel">
                <div className="glass-surface p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Alert Trends</h3>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-300"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block shadow-[0_0_6px_rgba(99,102,241,0.8)]" />Alerts</span>
                      <span className="flex items-center gap-1.5 text-slate-300"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_rgba(16,185,129,0.8)]" />Resolved</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={170}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#171427', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 12, color: '#fff' }}
                        labelStyle={{ color: '#94A3B8' }}
                      />
                      <Line type="monotone" dataKey="alerts" stroke="#818CF8" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="resolved" stroke="#34D399" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="col-span-3 glass-panel">
                <div className="glass-surface p-5 h-full">
                  <h3 className="text-sm font-bold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-lg ${
                          item.type === 'success' ? 'bg-emerald-400 shadow-emerald-400/50'
                          : item.type === 'critical' ? 'bg-red-400 shadow-red-400/50'
                          : 'bg-indigo-400 shadow-indigo-400/50'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 leading-snug">{item.event}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations Preview */}
            <div className="glass-panel overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">AI Recommendations</h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">{activeRecommendations.length} pending approval</span>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full"
                  >
                    View all in Command Center →
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-white/10">
                {activeRecommendations.slice(0, 2).map(rec => (
                  <div key={rec.id} className="p-5 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        rec.category === 'SECURITY_FLAG'
                          ? 'text-red-400 bg-red-500/10 border-red-500/20'
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />
                        {rec.category === 'SECURITY_FLAG' ? 'CRITICAL' : rec.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{Math.round(rec.confidenceScore * 100)}%</span>
                    </div>
                    <p className="text-sm font-bold text-white mb-1">{rec.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-2">{rec.assetId}</p>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{rec.summary}</p>
                    <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/10 pt-3">
                      <span>Confidence</span><span>Business Impact</span><span>ETA</span>
                    </div>
                  </div>
                ))}
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
      {/* ── Settings Modal ──────────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div className="bg-[#171427] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><Settings className="w-4 h-4 text-indigo-400" /> Settings</h2>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">AI Agent Autonomy</p>
                <div className="space-y-2">
                  {([
                    { value: 'always_ask' as const, label: 'Always Ask', desc: 'AI recommends, human always approves before any action.' },
                    { value: 'act_notify' as const, label: 'Act & Notify', desc: 'AI acts on low-risk items automatically and notifies you.' },
                    { value: 'auto' as const, label: 'Fully Autonomous', desc: 'AI handles all routine actions without prompting.' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setAiAutonomy(opt.value)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${aiAutonomy === opt.value ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${aiAutonomy === opt.value ? 'border-indigo-400' : 'border-slate-500'}`}>
                        {aiAutonomy === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{opt.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Notifications</p>
                <div className="space-y-3">
                  {([
                    { label: 'Email Notifications', desc: 'Receive daily digest of pending actions.', value: emailNotifications, toggle: () => setEmailNotifications(v => !v) },
                    { label: 'Critical Alerts Only', desc: 'Only notify for critical and high severity items.', value: criticalAlertsOnly, toggle: () => setCriticalAlertsOnly(v => !v) },
                  ]).map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                      <button onClick={item.toggle} className={`w-10 h-5 rounded-full transition-colors relative ${item.value ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${item.value ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-2">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => { setShowSettings(false); setToast({ message: 'Settings saved successfully!', type: 'success' }) }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Modal ────────────────────────────────────── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}>
          <div className="bg-[#171427] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white">My Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">✕</button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">JD</div>
                <div>
                  <p className="text-lg font-bold text-white">John Doe</p>
                  <p className="text-sm text-slate-400">IT Administrator</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">Online</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Email', value: 'admin@company.com' },
                  { label: 'Role', value: 'IT Administrator' },
                  { label: 'Department', value: 'IT Operations' },
                  { label: 'Last Login', value: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-medium text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end">
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
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

