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
      colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      subtext: 'Based on extensive historical data patterns.',
    }
  }

  if (numericScore >= 0.6) {
    return {
      label: 'Moderate — Review Recommended',
      colorClass: 'bg-amber-100 text-amber-800 border-amber-300',
      subtext: 'AI has some uncertainty. Verify before acting.',
    }
  }

  return {
    label: 'Low Confidence — Manual Check Required',
    colorClass: 'bg-rose-100 text-rose-800 border-rose-300',
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
