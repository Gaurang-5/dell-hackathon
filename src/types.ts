export interface ReasoningStep {
  stepNum: string
  label: string
  detail: string
}

export interface RecommendationOption {
  name: string
  title: string
  description: string
  badgeColor: string
  actionLabel: string
}

export interface DataSource {
  label: string
  syncTime: string
  rawData: string
}

export interface BlastRadius {
  impactLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  dependentSystems: string[]
  estimatedDowntime: string
  description: string
}

export interface Recommendation {
  id: string
  title: string
  summary: string
  assetId: string
  createdAt: string
  status: 'High Confidence' | 'Medium' | 'Review Recommended'
  category: 'MAINTENANCE_REQ' | 'CALIBRATION_REQ' | 'FIRMWARE_ALERT' | 'SECURITY_FLAG'
  dataSources: DataSource[]
  knownLimitations: string
  reasoningSteps: ReasoningStep[]
  options: RecommendationOption[]
  blastRadius?: BlastRadius
  ttlExpiration?: string
  confidenceScore?: number
}

export interface ActivityLogEntry {
  id: string
  timestamp: string
  assetId: string
  assetIcon: 'laptop' | 'server' | 'smartphone' | 'monitor' | 'shield' | 'settings'
  actionTaken: string
  reasoningSummary: string
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
  logicNodeDetails: string
}

export interface SubsystemOverride {
  name: string
  level: number
  description: string
}

export interface Device {
  device_id: string
  device_name: string
  os: string
  department: string
  assigned_user: string
  last_seen: string
  patch_compliance_pct: number
  disk_usage_pct: number
  ram_usage_pct: number
  cpu_avg_7d: number
  is_encrypted: boolean
  last_patch_date: string
  antivirus_status: 'active' | 'missing' | 'outdated'
  fleet_segment: string
}

export interface SecurityEvent {
  event_id: string
  timestamp: string
  device_id: string
  device_name: string
  event_type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  plain_description: string
  process_name: string | null
  resolved: boolean
  resolution_action: string | null
}
