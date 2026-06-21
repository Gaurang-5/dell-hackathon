import express, { Request, Response } from 'express'
import { createServer as createViteServer } from 'vite'
import type { Recommendation } from './types'

function fallbackExplainAnswer(
  recommendationTitle: string,
  contextText: string,
  questionText: string
): string {
  const q = questionText.toLowerCase()
  
  if (q.includes('late') || q.includes('earlier') || q.includes('time')) {
    return `We couldn't flag "${recommendationTitle}" earlier because the anomaly only surfaced in the past 24 hours. The telemetry readings were within normal limits until the last 3 sync cycles, at which point the deviation exceeded normal parameters. Acting now prevents an imminent failure.`
  }
  
  if (q.includes('risk') || q.includes('impact') || q.includes('safe') || q.includes('danger')) {
    return `The immediate risk needs attention because it could interrupt work during busy hours. The evidence comes from ${contextText}. The proposed action is designed to limit disruption, and no change starts until you approve it.`
  }
  
  if (q.includes('how') || q.includes('fix') || q.includes('resolve') || q.includes('do')) {
    return `The recommended action for "${recommendationTitle}" is prepared for your review. If you approve it, the system will follow the listed steps and record your decision. You can also choose an alternative or override the recommendation.`
  }
  
  if (q.includes('why') || q.includes('reason') || q.includes('explain')) {
    return `The system found a consistent pattern across these sources: ${contextText}. Similar records in this simulated fleet were followed by device trouble, so reviewing the action now is safer than waiting for the issue to grow.`
  }
  
  return `The recommendation "${recommendationTitle}" is based on ${contextText}. These records differ from the usual pattern for similar devices, so the system is asking a person to review the next step.`
}

function mockRecommendation(
  assetType: string,
  scenario: string
): Recommendation {
  const normalizedAsset = assetType.trim() || 'DEVICE'
  const assetId = `${normalizedAsset.toUpperCase()}-SIM01`
  const timestamp = Date.now()

  let category: Recommendation['category'] = 'MAINTENANCE_REQ'
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

  return {
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
}

async function startServer() {
  const app = express()
  app.use(express.json())

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  })
  app.post('/api/explain-recommendation', async (req: Request, res: Response) => {
    const {
      recommendationTitle = '',
      contextText = '',
      questionText,
    } = req.body
    const question =
      typeof questionText === 'string' && questionText.trim()
        ? questionText.trim()
        : 'Explain why this recommendation was made.'

    return res.json({
      answer: fallbackExplainAnswer(recommendationTitle, contextText, question),
    })
  })

  app.post('/api/simulate-recommendation', async (req: Request, res: Response) => {
    const { assetType = 'device', scenario = 'unknown issue' } = req.body
    return res.json(mockRecommendation(assetType, scenario))
  })

  app.use(vite.middlewares)
  app.use(express.static('dist'))
  app.use('*', (_req: Request, res: Response) => {
    res.sendFile('dist/index.html', { root: process.cwd() })
  })

  const PORT = process.env.PORT || 5173
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
