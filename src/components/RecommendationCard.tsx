import { useState, useEffect } from 'react'
import type { Recommendation } from '../types'
import { Timer, AlertOctagon } from 'lucide-react'
import {
  formatDate,
  getCategoryLabel,
  getDeviceTypeLabel,
} from '../utils/transparencyHelpers'
import { DataSourceChips } from './DataSourceChips'
import { HumanControls } from './HumanControls'
import { LimitationBanner } from './LimitationBanner'
import { ReasoningPanel } from './ReasoningPanel'

interface RecommendationCardProps {
  recommendation: Recommendation
  onActionComplete: (recommendationId: string, actionLabel: string) => void
}

export function RecommendationCard({ recommendation, onActionComplete }: RecommendationCardProps) {
  const deviceType = getDeviceTypeLabel(recommendation.assetId)
  const categoryLabel = getCategoryLabel(recommendation.category)

  const [timeLeft, setTimeLeft] = useState<string>('')
  
  useEffect(() => {
    if (!recommendation.ttlExpiration) return;
    const update = () => {
       const ms = new Date(recommendation.ttlExpiration!).getTime() - Date.now()
       if (ms <= 0) setTimeLeft('Expired')
       else {
         const hrs = Math.floor(ms / 3600000)
         const mins = Math.floor((ms % 3600000) / 60000)
         setTimeLeft(`${hrs}h ${mins}m remaining`)
       }
    }
    update()
    const int = setInterval(update, 60000)
    return () => clearInterval(int)
  }, [recommendation.ttlExpiration])

  return (
    <article className="glass-panel w-full relative">
      {recommendation.ttlExpiration && timeLeft !== 'Expired' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 px-4 py-1 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)] backdrop-blur-md animate-pulse">
          <Timer className="w-3.5 h-3.5" />
          ACTION REQUIRED: {timeLeft}
        </div>
      )}
      <div className="glass-surface p-8">
        <header className="mb-4 flex flex-col justify-between gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">
              {recommendation.assetId}
            </span>
            <span className="rounded-full bg-white/10 border border-white/5 px-2 py-0.5 text-xs font-bold text-slate-300">
              {deviceType}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="rounded-md bg-white/10 border border-white/5 px-2 py-1 font-medium text-slate-300">
              {categoryLabel}
            </span>
            <span className="text-slate-500">{formatDate(recommendation.createdAt)}</span>
          </div>
        </header>

        <section className="mb-6">
          <h2 className="text-xl font-bold leading-tight text-white tracking-tight">
            {recommendation.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {recommendation.summary}
          </p>
        </section>

        <div className="mb-6 rounded-2xl border border-white/5 bg-[#101010]/50 p-5 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#EDE9FE]/70">
              ✨ Reasoning
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider border border-slate-700/50 px-2 py-0.5 rounded bg-slate-800/30">
              Simulated Data (Faker.js)
            </span>
          </div>

          <div className="mb-6">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> AI Confidence Level
            </h4>
            <div className={`rounded-xl border p-5 ${
              recommendation.status === 'High Confidence' ? 'bg-emerald-500/10 border-emerald-500/20' :
              recommendation.status === 'Medium' ? 'bg-amber-500/10 border-amber-500/20' :
              'bg-indigo-500/10 border-indigo-500/20'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-lg font-black uppercase tracking-widest ${
                      recommendation.status === 'High Confidence' ? 'text-emerald-400' :
                      recommendation.status === 'Medium' ? 'text-amber-400' :
                      'text-indigo-400'
                    }`}>
                      {recommendation.status === 'Medium' ? 'Medium Confidence' : recommendation.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {recommendation.status === 'High Confidence' 
                      ? 'Based on extensive historical data patterns and precise telemetry matches across similar devices in your fleet.' 
                      : recommendation.status === 'Medium' 
                      ? 'Based on partial telemetry matches. Human review is suggested before taking irreversible actions.' 
                      : 'Based on anomaly detection rules. We recommend an administrator review this before proceeding.'}
                  </p>
                </div>
                
                {/* Visually Intuitive Color-Coded Bands */}
                <div className="shrink-0 flex flex-col gap-2 min-w-[140px]">
                  <div className="flex gap-1 h-3 w-full">
                    <div className={`flex-1 rounded-l-full ${
                      recommendation.status === 'High Confidence' || recommendation.status === 'Medium' || recommendation.status === 'Review Recommended' 
                        ? (recommendation.status === 'High Confidence' ? 'bg-emerald-500' : recommendation.status === 'Medium' ? 'bg-amber-500' : 'bg-indigo-500') 
                        : 'bg-white/10'
                    }`}></div>
                    <div className={`flex-1 ${
                      recommendation.status === 'High Confidence' || recommendation.status === 'Medium' 
                        ? (recommendation.status === 'High Confidence' ? 'bg-emerald-500' : 'bg-amber-500') 
                        : 'bg-white/10'
                    }`}></div>
                    <div className={`flex-1 rounded-r-full ${
                      recommendation.status === 'High Confidence' 
                        ? 'bg-emerald-500' 
                        : 'bg-white/10'
                    }`}></div>
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1">
                    <span>Low</span>
                    <span>Med</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <ReasoningPanel steps={recommendation.reasoningSteps} />
          
          {recommendation.blastRadius && (
            <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-4 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
                  Impact Simulation (Blast Radius)
                </h4>
              </div>
              <p className="text-sm text-red-200/80 mb-3">{recommendation.blastRadius.description}</p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-[#101010]/50 rounded-lg p-2 border border-red-500/10 flex-1">
                  <div className="text-[10px] uppercase text-red-400/70 font-bold mb-1">Impact Level</div>
                  <div className="text-sm font-bold text-red-300">{recommendation.blastRadius.impactLevel}</div>
                </div>
                <div className="bg-[#101010]/50 rounded-lg p-2 border border-red-500/10 flex-1">
                  <div className="text-[10px] uppercase text-red-400/70 font-bold mb-1">Est. Downtime</div>
                  <div className="text-sm font-bold text-red-300">{recommendation.blastRadius.estimatedDowntime}</div>
                </div>
                <div className="bg-[#101010]/50 rounded-lg p-2 border border-red-500/10 min-w-[200px] flex-1">
                  <div className="text-[10px] uppercase text-red-400/70 font-bold mb-1">Dependent Systems</div>
                  <div className="text-sm font-bold text-red-300">{recommendation.blastRadius.dependentSystems.join(', ')}</div>
                </div>
              </div>
            </div>
          )}

          <LimitationBanner limitations={recommendation.knownLimitations} />
          
          <div className="mt-4 pt-4 border-t border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">AI Data Sources</h4>
            <DataSourceChips sources={recommendation.dataSources} />
          </div>
        </div>
      </div>

      <footer className="mt-8 pt-6 border-t border-white/10">
        <HumanControls
          options={recommendation.options}
          assetId={recommendation.assetId}
          recommendationTitle={recommendation.title}
          dataSources={recommendation.dataSources}
          onActionConfirm={(action) => {
            console.log(`Confirmed action: ${action} on ${recommendation.assetId}`)
            onActionComplete(recommendation.id, action)
          }}
        />
      </footer>
      </div>
    </article>
  )
}
