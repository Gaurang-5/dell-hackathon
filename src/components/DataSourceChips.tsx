import { Database } from 'lucide-react'

interface DataSourceChipsProps {
  sources: string[]
}

export function DataSourceChips({ sources }: DataSourceChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((source) => (
        <span
          key={source}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
        >
          <Database className="h-3.5 w-3.5 text-slate-500" />
          {source}
        </span>
      ))}
    </div>
  )
}
