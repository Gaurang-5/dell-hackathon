import { useState } from 'react'
import { RecommendationCard } from './components/RecommendationCard'
import { AuditLog } from './components/AuditLog'
import { AutonomyDial } from './components/AutonomyDial'
import { initialRecommendations, initialActivityLogs } from './mockData'
import { Toast } from './components/Toast'

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'audit' | 'devices'>('dashboard')
  const [activeRecommendations, setActiveRecommendations] = useState(initialRecommendations)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [autonomyLevel, setAutonomyLevel] = useState<'ask' | 'notify' | 'auto'>('ask')

  const handleActionComplete = (recommendationId: string, actionLabel: string) => {
    setActiveRecommendations((prev) => prev.filter((r) => r.id !== recommendationId))
    setToast({ message: `Successfully recorded: ${actionLabel}`, type: 'success' })
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
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
            Devices
          </button>
          <button className="w-full text-left block px-4 py-2 rounded hover:bg-slate-800">
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

            <AutonomyDial level={autonomyLevel} onChange={setAutonomyLevel} />

            <div className="flex flex-col gap-6">
              {activeRecommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onActionComplete={handleActionComplete}
                />
              ))}
              {activeRecommendations.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                  <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                  <p className="mt-1 text-sm text-slate-500">No active recommendations require your attention.</p>
                </div>
              )}
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
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Devices</h1>
              <p className="mt-1 text-slate-600">Manage your connected assets</p>
            </header>
          </>
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
