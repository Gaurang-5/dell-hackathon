import { Database, Clock, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { DataSource } from '../types'

interface DataSourceChipsProps {
  sources: DataSource[]
}

export function DataSourceChips({ sources }: DataSourceChipsProps) {
  const [activeSource, setActiveSource] = useState<DataSource | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {sources.map((source, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSource(activeSource === source ? null : source)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              activeSource === source
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'bg-white dark:bg-[#171427]/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-white/5 hover:border-slate-300 dark:border-white/20'
            }`}
          >
            <Database className="h-3.5 w-3.5 opacity-70" />
            {source.label}
          </button>
        ))}
      </div>

      {activeSource && (
        <div className="rounded-lg border border-indigo-500/30 bg-[#0F172A]/80 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 mt-2">
          <div className="flex items-center justify-between bg-indigo-500/10 px-4 py-3 border-b border-indigo-500/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Data provenance</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400">
              <Clock className="h-3 w-3" />
              Snapshot: {new Date(activeSource.syncTime).toLocaleDateString()}
            </div>
          </div>
          <div className="p-4 bg-indigo-500/5">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>{activeSource.label}</strong> is a Faker-generated simulated log from the fixed June 2024 demo dataset. No live device or external data was used.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
