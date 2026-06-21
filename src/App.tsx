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
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white p-6 flex flex-col">
        <div className="text-xl font-bold mb-8">AetherAI</div>
        <nav className="space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full text-left block px-4 py-2 rounded ${
              currentView === 'dashboard' ? 'bg-slate-700' : 'hover:bg-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('devices')}
            className={`w-full text-left block px-4 py-2 rounded ${
              currentView === 'devices' ? 'bg-slate-700' : 'hover:bg-slate-800'
            }`}
          >
            Device Fleet
          </button>
          <button
            onClick={() => setCurrentView('events')}
            className={`w-full text-left block px-4 py-2 rounded ${
              currentView === 'events' ? 'bg-slate-700' : 'hover:bg-slate-800'
            }`}
          >
            Security Events
          </button>
          <button
            onClick={() => setCurrentView('audit')}
            className={`w-full text-left block px-4 py-2 rounded ${
              currentView === 'audit' ? 'bg-slate-700' : 'hover:bg-slate-800'
            }`}
          >
            Audit Log
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {currentView === 'dashboard' && (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">
                Needs Your Attention
              </h1>
              <p className="mt-1 text-slate-600">
                AI-flagged anomalies and required actions
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
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 animate-fade-in-up hover:translate-x-1 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm'
                      }`}
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
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
