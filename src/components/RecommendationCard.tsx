import type { Recommendation } from '../types'
import {
  formatDate,
  getCategoryLabel,
  getDeviceTypeLabel,
  getDataWeighting,
} from '../utils/transparencyHelpers'
import { ConfidenceIndicator } from './ConfidenceIndicator'
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

  return (
    <article className="rounded-lg p-6 transition-all duration-200 shadow-sm border border-slate-200 bg-white">
      <header className="mb-4 flex flex-col justify-between gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900">
            {recommendation.assetId}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
            {deviceType}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-800">
            {categoryLabel}
          </span>
          <span className="text-slate-500">{formatDate(recommendation.createdAt)}</span>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-xl font-bold leading-tight text-slate-900">
          {recommendation.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {recommendation.summary}
        </p>
      </section>

      <section className="mb-6">
        <ConfidenceIndicator score={recommendation.confidenceScore} />
      </section>

      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
        <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          ✨ AI Analysis & Reasoning
        </h3>
        <div className="flex flex-col gap-5">
          <ReasoningPanel steps={recommendation.reasoningSteps} />
          
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">
              Data Weighting (Model Explainability)
            </h4>
            <div className="flex flex-col gap-3">
              {getDataWeighting(recommendation.category, recommendation.assetId).map((weight, i) => (
                <div key={i}>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                    <span>{weight.label}</span>
                    <span>{weight.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${weight.colorClass} rounded-full`} style={{ width: `${weight.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <LimitationBanner limitations={recommendation.knownLimitations} />
          <DataSourceChips sources={recommendation.dataSources} />
        </div>
      </div>

      <footer>
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
    </article>
  )
}
