import type { Recommendation } from '../types'
import {
  formatDate,
  getCategoryLabel,
  getDeviceTypeLabel,
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
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {recommendation.assetId}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {deviceType}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
            {categoryLabel}
          </span>
          <span>{formatDate(recommendation.createdAt)}</span>
        </div>
      </header>

      <section className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">
          {recommendation.title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {recommendation.summary}
        </p>
      </section>

      <section className="mb-5 flex flex-col gap-4">
        <ConfidenceIndicator score={recommendation.confidenceScore} />
        <LimitationBanner limitations={recommendation.knownLimitations} />
        <DataSourceChips sources={recommendation.dataSources} />
      </section>

      <div className="mb-5 rounded-md bg-slate-50 p-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
          AI Reasoning
        </h3>
        <ReasoningPanel steps={recommendation.reasoningSteps} />
      </div>

      <footer>
        <HumanControls
          options={recommendation.options}
          assetId={recommendation.assetId}
          onActionConfirm={(action) => {
            console.log(`Confirmed action: ${action} on ${recommendation.assetId}`)
            onActionComplete(recommendation.id, action)
          }}
        />
      </footer>
    </article>
  )
}
