export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { assetType = 'device', scenario = 'unknown issue' } = req.body

  const normalizedAsset = assetType.trim() || 'DEVICE'
  const assetId = `${normalizedAsset.toUpperCase()}-SIM01`
  const timestamp = Date.now()

  let category = 'MAINTENANCE_REQ'
  const lowerScenario = scenario.toLowerCase()
  if (
    lowerScenario.includes('patch') ||
    lowerScenario.includes('security') ||
    lowerScenario.includes('threat') ||
    lowerScenario.includes('malware')
  ) {
    category = 'SECURITY_FLAG'
  } else if (
    lowerScenario.includes('firmware') ||
    lowerScenario.includes('bios')
  ) {
    category = 'FIRMWARE_ALERT'
  } else if (
    lowerScenario.includes('battery') ||
    lowerScenario.includes('calibrat')
  ) {
    category = 'CALIBRATION_REQ'
  }

  const mockData = {
    id: `sim-${timestamp}`,
    title: `${assetId}: ${scenario}`,
    summary: `The ${assetType} shows signs of ${scenario}. Acting now will reduce downtime and keep the device in line with company policy.`,
    assetId,
    createdAt: new Date().toISOString(),
    status: 'Review Recommended',
    category,
    dataSources: [
      {
        label: `Device telemetry for this ${assetType} over the past 30 days`,
        syncTime: new Date().toISOString(),
        rawData: '{\n  "status": "ok",\n  "telemetry": true\n}'
      },
      {
        label: `Fleet comparison across 1,847 similar ${assetType} devices`,
        syncTime: new Date().toISOString(),
        rawData: '{\n  "comparison_group": "standard",\n  "percentile": 85\n}'
      },
      {
        label: `Support ticket history from the last 12 months`,
        syncTime: new Date().toISOString(),
        rawData: '{\n  "ticket_count": 2,\n  "last_ticket_date": "2023-11-04"\n}'
      }
    ],
    knownLimitations:
      'This recommendation assumes the device is powered on and connected to the corporate network. Devices on sleep mode or VPN-only connections may need a different approach.',
    reasoningSteps: [
      {
        stepNum: '01',
        label: 'What we found',
        detail: `We reviewed this ${assetType} and found clear indicators of ${scenario} compared with similar devices in your fleet.`,
      },
      {
        stepNum: '02',
        label: 'Why it matters',
        detail: `If left unaddressed, ${scenario} can lead to slowdowns, security gaps, or user disruption across the organization.`,
      },
      {
        stepNum: '03',
        label: 'What we recommend',
        detail:
          'Apply the recommended action during the next maintenance window to bring the device back into compliance.',
      },
    ],
    options: [
      {
        name: 'Option A',
        title: 'Option A: Fix now',
        description: `Apply the fix immediately to resolve ${scenario}. Downtime is expected to be minimal.`,
        badgeColor: 'tertiary',
        actionLabel: 'Apply Fix Now',
      },
      {
        name: 'Option B',
        title: 'Option B: Schedule for later',
        description: `Queue the fix for tonight to avoid disrupting the user. Risk remains until the action is taken.`,
        badgeColor: 'error',
        actionLabel: 'Schedule for Tonight',
      },
    ],
  }

  return res.status(200).json(mockData)
}
