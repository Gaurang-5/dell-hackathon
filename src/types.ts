export interface ReasoningStep {
  stepNum: string
  label: string
  detail: string
}

export interface RecommendationOption {
  name: string
  title: string
  description: string
  confidence: string
  badgeColor: string
  actionLabel: string
}

export interface Recommendation {
  id: string
  title: string
  summary: string
  assetId: string
  status: 'High Confidence' | 'Medium' | 'Review Recommended'
  category: 'MAINTENANCE_REQ' | 'CALIBRATION_REQ' | 'FIRMWARE_ALERT' | 'SECURITY_FLAG'
  confidenceScore: string
  confidenceLabel: 'High' | 'Medium' | 'Review'
  dataSources: string[]
  knownLimitations: string
  reasoningSteps: ReasoningStep[]
  options: RecommendationOption[]
}

export interface ActivityLogEntry {
  id: string
  timestamp: string
  assetId: string
  assetIcon: 'laptop' | 'server' | 'smartphone' | 'monitor' | 'shield' | 'settings'
  actionTaken: string
  reasoningSummary: string
  confidence: 'HIGH' | 'MEDIUM' | 'REVIEW'
  humanDecision: 'Approved' | 'Overridden' | 'Escalated'
  sourceMatrix?: undefined
}

export interface EscalationItem {
  id: string
  priority: 'Critical Severity' | 'High'
  escalatedBy: string
  timeAgo: string
  reasonText: string
  originalAction: string
  confidenceScore: string
  logicNodeDetails: string
}

export interface SubsystemOverride {
  name: string
  level: number
  description: string
}
