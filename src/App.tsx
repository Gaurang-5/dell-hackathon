import { useEffect } from 'react'
import { initialRecommendations } from './mockData'

function App() {
  useEffect(() => {
    console.log('Initial recommendations:', initialRecommendations)
  }, [])

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <div className="text-xl font-bold mb-8">AetherAI IT Management</div>
        <nav className="space-y-2">
          <a href="#" className="block px-4 py-2 rounded hover:bg-slate-700">
            Dashboard
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-slate-700">
            Devices
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-slate-700">
            Security Events
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-slate-700">
            Audit Log
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-slate-50">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="mt-4 text-slate-600">Main content area.</p>
      </main>
    </div>
  )
}

export default App
