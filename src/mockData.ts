import securityEventsRaw from '../public/data/security_events.json'
import recommendationsRaw from '../public/data/ai_recommendations.json'
import auditLogRaw from '../public/data/audit_log.json'
import devicesRaw from '../public/data/devices.json'

import type {
  ActivityLogEntry,
  EscalationItem,
  Recommendation,
  SubsystemOverride,
  Device,
  SecurityEvent,
} from './types'

// Reference time for human-readable relative timestamps in the mocked dataset.
const MOCK_NOW = new Date('2024-06-21T09:30:00')

export const initialRecommendations: Recommendation[] =
  recommendationsRaw as unknown as Recommendation[]

export const initialDevices: Device[] = devicesRaw as unknown as Device[]

export const initialSecurityEvents: SecurityEvent[] = securityEventsRaw as unknown as SecurityEvent[]

export const initialActivityLogs: ActivityLogEntry[] = (auditLogRaw as unknown as any[]).map(
  (entry) => ({
    id: entry.id,
    timestamp: entry.timestamp,
    assetId: entry.assetId,
    assetIcon: entry.assetIcon,
    actionTaken: entry.actionTaken,
    reasoningSummary: entry.reasoningSummary,
    confidence: entry.confidence,
    humanDecision: entry.humanDecision,
    sourceMatrix: undefined,
  })
)

function timeAgo(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  const diffMs = MOCK_NOW.getTime() - date.getTime()
  const seconds = Math.floor(diffMs / 1000)

  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function originalActionFor(eventType: string): string {
  switch (eventType) {
    case 'suspicious_process':
      return 'Isolate device from network'
    case 'failed_login_burst':
      return 'Lock user account temporarily'
    case 'policy_violation':
      return 'Enforce policy and notify user'
    case 'unauthorized_usb':
      return 'Block USB port access'
    case 'anomalous_traffic':
      return 'Throttle outbound connections'
    case 'patch_overdue_critical':
      return 'Force immediate patch deployment'
    case 'config_drift':
      return 'Restore approved configuration'
    default:
      return 'Review with security team'
  }
}

function logicNodeDetailsFor(eventType: string, description: string): string {
  switch (eventType) {
    case 'suspicious_process':
      return `The system noticed a program behaving in a way that normal software on this device does not. Because that kind of activity often leads to bigger problems, it was escalated for a human to review.`
    case 'failed_login_burst':
      return `There were many failed sign-in attempts in a short time, which is not typical for this user. The AI raised it because this pattern can mean someone is trying to guess the password.`
    case 'policy_violation':
      return `This device broke a company rule about what sites or programs are allowed. The AI flagged it so the policy can be enforced before it becomes a habit.`
    case 'unauthorized_usb':
      return `An unknown USB device was connected, which could copy data or introduce unsafe software. The AI escalated this because unapproved storage devices are not allowed.`
    case 'anomalous_traffic':
      return `The device sent data to a place it has never contacted before, and the volume was unusually high. The AI flagged it because that can be a sign of stolen data leaving the network.`
    case 'patch_overdue_critical':
      return `This device is missing important security fixes that other devices already have. The AI escalated it because unpatched devices are a common way attackers get in.`
    case 'config_drift':
      return `The settings on this device no longer match the company-approved baseline. The AI flagged it because mismatched settings can quietly open security holes.`
    default:
      return `The AI reviewed this event and decided it needs a human decision. ${description}`
  }
}

export const initialEscalationQueue: EscalationItem[] = (securityEventsRaw as any[])
  .filter(
    (event) =>
      event.resolved === false &&
      (event.severity === 'critical' || event.severity === 'high')
  )
  .slice(0, 4)
  .map((event) => ({
    id: event.event_id,
    priority: event.severity === 'critical' ? 'Critical Severity' : 'High',
    escalatedBy:
      event.severity === 'critical'
        ? 'Auto-flagged by AI (low confidence)'
        : 'Flagged for review',
    timeAgo: timeAgo(event.timestamp),
    reasonText: event.plain_description,
    originalAction: originalActionFor(event.event_type),
    confidenceScore: event.severity === 'critical' ? '0.41' : '0.58',
    logicNodeDetails: logicNodeDetailsFor(
      event.event_type,
      event.plain_description
    ),
  }))

export const initialOverrides: SubsystemOverride[] = [
  {
    name: 'Patch & Update Management',
    level: 5,
    description: 'Automated patch deployment and scheduling',
  },
  {
    name: 'Threat Detection & Response',
    level: 3,
    description: 'Security event monitoring and alerting',
  },
  {
    name: 'Device Configuration',
    level: 4,
    description: 'Policy enforcement and configuration compliance',
  },
  {
    name: 'Access & Identity Controls',
    level: 2,
    description: 'Login monitoring and access permissions',
  },
]
