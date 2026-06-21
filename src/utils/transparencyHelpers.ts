export interface ConfidenceDisplay {
  label: string
  colorClass: string
  subtext: string
}

export function getConfidenceDisplay(score: number | string): ConfidenceDisplay {
  const numericScore = typeof score === 'string' ? parseFloat(score) : score

  if (Number.isNaN(numericScore)) {
    return {
      label: 'Unknown Confidence',
      colorClass: 'bg-slate-100 text-slate-800 border-slate-300',
      subtext: 'Confidence could not be determined. Review manually.',
    }
  }

  if (numericScore >= 0.8) {
    return {
      label: 'High Confidence',
      colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      subtext: 'Based on extensive historical data patterns.',
    }
  }

  if (numericScore >= 0.6) {
    return {
      label: 'Moderate — Review Recommended',
      colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      subtext: 'AI has some uncertainty. Verify before acting.',
    }
  }

  return {
    label: 'Low Confidence — Manual Check Required',
    colorClass: 'bg-red-500/10 text-[#F87171] border-red-500/20',
    subtext: 'Limited historical data. Human verification required.',
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'SECURITY_FLAG':
      return 'Security Alert'
    case 'MAINTENANCE_REQ':
      return 'Maintenance Required'
    case 'FIRMWARE_ALERT':
      return 'Firmware Update'
    case 'CALIBRATION_REQ':
      return 'System Configuration'
    default:
      return 'System Alert'
  }
}

export function getDeviceTypeLabel(assetId: string): string {
  const prefix = assetId.split('-')[0]

  switch (prefix) {
    case 'LAPTOP':
      return 'Laptop'
    case 'SERVER':
      return 'Server'
    case 'WORKSTATION':
      return 'Workstation'
    case 'MOBILE':
      return 'Mobile'
    default:
      return 'Device'
  }
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  const month = parts.find((p) => p.type === 'month')?.value ?? ''
  const day = parts.find((p) => p.type === 'day')?.value ?? ''
  const year = parts.find((p) => p.type === 'year')?.value ?? ''
  const hour = parts.find((p) => p.type === 'hour')?.value ?? ''
  const minute = parts.find((p) => p.type === 'minute')?.value ?? ''
  const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value ?? ''

  return `${month} ${day}, ${year} at ${hour}:${minute} ${dayPeriod}`
}

export interface DataWeight {
  label: string
  percentage: number
  colorClass: string
}

export function getDataWeighting(category: string, assetId: string): DataWeight[] {
  let sum = 0
  for (let i = 0; i < assetId.length; i++) {
    sum += assetId.charCodeAt(i)
  }
  const seed = sum
  
  if (category === 'SECURITY_FLAG') {
    const v1 = 45 + (seed % 12)
    const v2 = 25 + (seed % 8)
    return [
      { label: 'Security Policy Rules', percentage: v1, colorClass: 'bg-indigo-500' },
      { label: 'Fleet Incident History', percentage: v2, colorClass: 'bg-blue-400' },
      { label: 'Device Telemetry', percentage: 100 - v1 - v2, colorClass: 'bg-slate-300' },
    ]
  }
  
  if (category === 'MAINTENANCE_REQ') {
    const v1 = 55 + (seed % 15)
    const v2 = 20 + (seed % 10)
    return [
      { label: 'Device Telemetry', percentage: v1, colorClass: 'bg-indigo-500' },
      { label: 'Fleet Maintenance History', percentage: v2, colorClass: 'bg-blue-400' },
      { label: 'Support Ticket Patterns', percentage: 100 - v1 - v2, colorClass: 'bg-slate-300' },
    ]
  }

  if (category === 'FIRMWARE_ALERT') {
    const v1 = 40 + (seed % 14)
    const v2 = 35 + (seed % 9)
    return [
      { label: 'Manufacturer Guidelines', percentage: v1, colorClass: 'bg-indigo-500' },
      { label: 'Device Telemetry', percentage: v2, colorClass: 'bg-blue-400' },
      { label: 'Fleet History', percentage: 100 - v1 - v2, colorClass: 'bg-slate-300' },
    ]
  }

  // CALIBRATION_REQ and fallback
  const v1 = 60 + (seed % 11)
  const v2 = 20 + (seed % 6)
  return [
    { label: 'Device Telemetry', percentage: v1, colorClass: 'bg-indigo-500' },
    { label: 'Battery Analytics', percentage: v2, colorClass: 'bg-blue-400' },
    { label: 'Manufacturer Guidelines', percentage: 100 - v1 - v2, colorClass: 'bg-slate-300' },
  ]
}
