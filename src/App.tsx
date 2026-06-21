import { useState } from 'react'
import { RecommendationCard } from './components/RecommendationCard'
import { AuditLog } from './components/AuditLog'
import { AutonomyDial } from './components/AutonomyDial'
import { DeviceFleet } from './components/DeviceFleet'
import { SecurityEventsList } from './components/SecurityEventsList'
import { initialRecommendations, initialActivityLogs, initialDevices, initialSecurityEvents } from './mockData'
import { Toast } from './components/Toast'
import { ShieldAlert, Activity, Clock, TrendingUp, Laptop, Server, Smartphone, Monitor, Settings, CheckCircle2 } from 'lucide-react'

const getCompactAssetIcon = (assetId: string) => {
  const prefix = assetId.split('-')[0]
  switch (prefix) {
    case 'LAPTOP': return <Laptop className="w-4 h-4 text-slate-500" />
    case 'SERVER': return <Server className="w-4 h-4 text-slate-500" />
    case 'MOBILE': return <Smartphone className="w-4 h-4 text-slate-500" />
    case 'WORKSTATION': return <Monitor className="w-4 h-4 text-slate-500" />
    default: return <Settings className="w-4 h-4 text-slate-500" />
  }
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'audit' | 'devices' | 'events'>('dashboard')
  const [activeRecommendations, setActiveRecommendations] = useState(initialRecommendations)
  const [selectedRecId, setSelectedRecId] = useState<string | null>(initialRecommendations[0]?.id || null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [autonomyLevel, setAutonomyLevel] = useState<'ask' | 'notify' | 'auto'>('ask')

  const handleActionComplete = (recommendationId: string, actionLabel: string) => {
    const updated = activeRecommendations.filter((r) => r.id !== recommendationId)
    setActiveRecommendations(updated)
    setToast({ message: `Successfully recorded: ${actionLabel}`, type: 'success' })
    if (selectedRecId === recommendationId) {
      setSelectedRecId(updated[0]?.id || null)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50/50 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 text-slate-300 p-6 flex flex-col shadow-2xl relative z-20">
        <div className="text-2xl font-bold mb-10 tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          AetherAI
        </div>
        <nav className="space-y-1.5 font-medium text-sm">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              currentView === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            Dashboard
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
      </aside>
      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        {currentView === 'dashboard' && (
          <>
            <header className="mb-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Needs Your Attention
              </h1>
              <p className="mt-2 text-slate-500 font-medium">
                AI-flagged anomalies and required actions across your fleet.
              </p>
            </header>

            {/* At-a-Glance Stats Row */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Card 1: Active AI Anomalies */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active AI Anomalies</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{activeRecommendations.length}</p>
                  </div>
                  <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Card 2: Fleet Health Score */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Fleet Health Score</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-slate-900">94%</p>
                      <span className="flex items-center text-sm font-medium text-emerald-600">
                        <TrendingUp className="mr-1 h-4 w-4" />
                        Healthy
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Card 3: Pending Human Approvals */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pending Human Approvals</p>
                    <p className="mt-2 text-3xl font-bold text-amber-500">{activeRecommendations.length}</p>
                  </div>
                  <div className="rounded-full bg-amber-50 p-3 text-amber-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>

            <AutonomyDial level={autonomyLevel} onChange={setAutonomyLevel} />

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
              {/* Left Pane (List View) */}
              <div className="col-span-4 overflow-y-auto pr-2 space-y-3 pb-32">
                {activeRecommendations.map((rec, index) => {
                  const isSelected = selectedRecId === rec.id
                  const scoreNum = parseFloat(rec.confidenceScore)
                  const dotColor = !isNaN(scoreNum) && scoreNum > 0.8 ? 'bg-emerald-500' : (!isNaN(scoreNum) && scoreNum > 0.6) ? 'bg-amber-500' : 'bg-slate-400'

                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecId(rec.id)}
                      className={`animate-fade-in-up cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? 'border-indigo-400 bg-white shadow-lg shadow-indigo-100 ring-1 ring-indigo-400/50 scale-[1.01]'
                          : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 opacity-80 hover:opacity-100'
                      }`}
                      style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'both' }}
                    >
                      <div className="p-4 relative">
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl" />
                        )}
                        <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                          {getCompactAssetIcon(rec.assetId)}
                          <span className="font-medium text-slate-700">{rec.assetId}</span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                            {rec.title}
                          </h3>
                          <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotColor}`} title={`Confidence: ${rec.confidenceScore}`} />
                        </div>
                      </div>
                    </div>
                  )
                })}
                {activeRecommendations.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-900">All caught up!</h3>
                    <p className="mt-1 text-xs text-slate-500">No active recommendations require your attention.</p>
                  </div>
                )}
              </div>

              {/* Right Pane (Detail View) */}
              <div className="col-span-8 overflow-y-auto h-full pr-2 pb-32">
                {selectedRecId && activeRecommendations.find(r => r.id === selectedRecId) ? (
                  <RecommendationCard
                    recommendation={activeRecommendations.find(r => r.id === selectedRecId)!}
                    onActionComplete={handleActionComplete}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="rounded-full bg-white p-6 shadow-sm mb-4 border border-slate-200">
                      <CheckCircle2 className="h-12 w-12 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">All clear. Select an anomaly to review its AI analysis.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {currentView === 'audit' && (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Audit Log</h1>
              <p className="mt-1 text-slate-600">
                History of AI recommendations and human decisions
              </p>
            </header>
            <AuditLog logs={initialActivityLogs} />
          </>
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
