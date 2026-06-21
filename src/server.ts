import 'dotenv/config'
import express, { Request, Response } from 'express'
import { createServer as createViteServer } from 'vite'
import { HfInference } from '@huggingface/inference'
import type { Recommendation } from './types'

const hf = new HfInference(process.env.HF_API_KEY)

async function explainAnswerWithAI(
  recommendationTitle: string,
  contextText: string,
  chatHistory: { role: 'user' | 'ai' | 'system'; text: string }[]
): Promise<string> {
  const systemPrompt = `You are a transparent IT Operations AI assistant.
Your job is to answer the IT admin's specific questions about this recommendation.
Context Data Used: ${contextText}
Recommendation: ${recommendationTitle}
CRITICAL RULES:
- Do NOT repeat the exact same response or format.
- Answer their specific question conversationally, clearly, and concisely.
- Do NOT use ML jargon or probability terms. Keep it in plain English.
- Do NOT copy previous AI messages.`

  // Build an alternating user/assistant sequence (Llama-3 requires this)
  const mappedHistory: { role: string; content: string }[] = []
  let expectedRole = 'user'
  for (const msg of chatHistory) {
    if (!msg.text.trim()) continue
    const role = msg.role === 'ai' ? 'assistant' : 'user'
    if (role === expectedRole) {
      mappedHistory.push({ role, content: msg.text })
      expectedRole = expectedRole === 'user' ? 'assistant' : 'user'
    } else if (mappedHistory.length > 0 && mappedHistory[mappedHistory.length - 1].role === role) {
      // merge consecutive same-role messages
      mappedHistory[mappedHistory.length - 1].content += '\n' + msg.text
    }
  }
  // Drop a leading assistant message so conversation starts with user
  if (mappedHistory.length > 0 && mappedHistory[0].role === 'assistant') mappedHistory.shift()

  const messages = [
    { role: 'system', content: systemPrompt },
    ...mappedHistory
  ]

  try {
    if (!process.env.HF_API_KEY) {
      throw new Error('No HF_API_KEY set')
    }
    const response = await hf.chatCompletion({
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      messages: messages as any,
      max_tokens: 300,
      temperature: 0.7
    })
    return response.choices[0].message.content || 'I could not generate an explanation.'
  } catch (err: any) {
    console.error('AI Inference Error:', err)
    // Intelligent fallback based on the latest user question
    const lastUserMsg = chatHistory.filter(m => m.role === 'user').pop()?.text?.toLowerCase() || ''
    if (lastUserMsg.includes('alternative') || lastUserMsg.includes('option') || lastUserMsg.includes('other')) {
      return `Besides the primary recommendation, you could schedule the action for a later maintenance window to avoid disrupting the user during working hours. This keeps the risk contained but delays resolution.`
    }
    if (lastUserMsg.includes('delay') || lastUserMsg.includes('wait') || lastUserMsg.includes('later') || lastUserMsg.includes('days')) {
      return `Delaying is possible, but each day without action increases the chance of disruption. If you must delay, scheduling it for tonight\'s maintenance window is the safest option.`
    }
    if (lastUserMsg.includes('risk') || lastUserMsg.includes('danger') || lastUserMsg.includes('impact')) {
      return `The main risk is that the device could fail during working hours, impacting the user\'s productivity. The longer this is left unaddressed, the higher the chance of an unplanned outage.`
    }
    if (lastUserMsg.includes('fix') || lastUserMsg.includes('how') || lastUserMsg.includes('resolve')) {
      return `The recommended fix is ready to apply. Once you approve it, the system will handle the update automatically. You can also schedule it for later if needed.`
    }
    return `Based on the available data, the recommendation for "${recommendationTitle}" stands. Multiple sources agree on the issue. Acting now is lower risk than waiting.`
  }
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
      chatHistory = []
    } = req.body
    
    // Ensure the latest question is at least somewhere, or just use the whole history
    const historyToUse = chatHistory.length > 0 ? chatHistory : [
      { role: 'user', text: typeof questionText === 'string' && questionText.trim() ? questionText.trim() : 'Explain why this recommendation was made.' }
    ]

    try {
      const answer = await explainAnswerWithAI(recommendationTitle, contextText, historyToUse)
      return res.json({ answer })
    } catch (e) {
      return res.json({ answer: 'An error occurred while generating the explanation.' })
    }
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
