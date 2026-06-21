import express, { Request, Response } from 'express'
import { createServer as createViteServer } from 'vite'
import type { Recommendation } from './types'

const HF_MODEL_URL =
  'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3'

const EXPLAIN_SYSTEM_PROMPT = `You are an AI assistant for an IT management platform. You explain AI decisions in plain English to IT administrators who are not data scientists. Never use ML jargon, probability distributions, or technical model terms. Write like a trusted colleague explaining their reasoning. Be specific — cite the data sources mentioned in the context. Keep your answer under 150 words. Use short paragraphs.`

function buildExplainPrompt(
  recommendationTitle: string,
  contextText: string,
  questionText: string
): string {
  return `<s>[INST] <<SYS>>\n${EXPLAIN_SYSTEM_PROMPT}\n<</SYS>>\n\nRecommendation: ${recommendationTitle}\nContext: ${contextText}\nAdmin question: ${questionText}\n[/INST]`
}

function fallbackExplainAnswer(
  recommendationTitle: string,
  contextText: string,
  questionText: string
): string {
  return (
    `Based on the data sources listed — ${contextText} — the platform generated "${recommendationTitle}". ` +
    `The signals show a clear deviation from the normal baseline for this device, so the AI is recommending action before the issue affects users. ` +
    `To your question, "${questionText}": the recommendation was made because multiple reliable sources agree on the problem, and acting now is lower risk than waiting. ` +
    `If you need more detail, open the recommendation card to see the exact sources and suggested next steps.`
  )
}

const SIMULATE_SYSTEM_PROMPT = `Respond with ONLY a valid JSON object, no explanation before or after, no markdown code blocks. The JSON must match this exact schema:

{
  "id": "string (generate as sim- + timestamp)",
  "title": "string (format: DEVICE-ID: Issue Title)",
  "summary": "string (plain English, 2 sentences max)",
  "assetId": "string",
  "createdAt": "string (ISO 8601 datetime)",
  "status": "High Confidence" | "Medium" | "Review Recommended",
  "category": "MAINTENANCE_REQ" | "CALIBRATION_REQ" | "FIRMWARE_ALERT" | "SECURITY_FLAG",
  "confidenceScore": "string (decimal like 0.84)",
  "confidenceLabel": "High" | "Medium" | "Review",
  "dataSources": "string[] (2-4 items, plain English with specific numbers)",
  "knownLimitations": "string (plain English caveat)",
  "reasoningSteps": [
    { "stepNum": "01", "label": "What we found", "detail": "string" },
    { "stepNum": "02", "label": "Why it matters", "detail": "string" },
    { "stepNum": "03", "label": "What we recommend", "detail": "string" }
  ],
  "options": [
    { "name": "Option A", "title": "string", "description": "string", "confidence": "Confidence: High", "badgeColor": "tertiary", "actionLabel": "string" },
    { "name": "Option B", "title": "string", "description": "string", "confidence": "Confidence: Medium", "badgeColor": "error", "actionLabel": "string" }
  ]
}`

function buildSimulatePrompt(assetType: string, scenario: string): string {
  return `<s>[INST] <<SYS>>\n${SIMULATE_SYSTEM_PROMPT}\n<</SYS>>\n\nAsset type: ${assetType}\nScenario: ${scenario}\nGenerate a realistic IT management recommendation as JSON.[/INST]`
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
    status: 'High Confidence',
    category,
    confidenceScore: '0.87',
    confidenceLabel: 'High',
    dataSources: [
      `Device telemetry for this ${assetType} over the past 30 days`,
      `Fleet comparison across 1,847 similar ${assetType} devices`,
      `Support ticket history from the last 12 months`,
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
        confidence: 'Confidence: High',
        badgeColor: 'tertiary',
        actionLabel: 'Apply Fix Now',
      },
      {
        name: 'Option B',
        title: 'Option B: Schedule for later',
        description: `Queue the fix for tonight to avoid disrupting the user. Risk remains until the action is taken.`,
        confidence: 'Confidence: Medium',
        badgeColor: 'error',
        actionLabel: 'Schedule for Tonight',
      },
    ],
  }
}

async function callMistral(prompt: string): Promise<string> {
  // Vite's loadEnv can grab the .env variables natively
  const { loadEnv } = await import('vite')
  const env = loadEnv('', process.cwd(), '')
  const apiKey = env.HF_API_KEY || process.env.HF_API_KEY

  if (!apiKey) {
    throw new Error('HF_API_KEY not configured')
  }

  const response = await fetch(HF_MODEL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.4,
        return_full_text: false,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`HuggingFace API returned ${response.status}`)
  }

  const data = (await response.json()) as Array<{ generated_text?: string }>
  const generatedText = data?.[0]?.generated_text
  if (!generatedText) {
    throw new Error('Empty response from HuggingFace')
  }
  return generatedText.trim()
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

    const prompt = buildExplainPrompt(recommendationTitle, contextText, question)

    try {
      const answer = await callMistral(prompt)
      return res.json({ answer })
    } catch (err) {
      console.error(err)
      return res.json({
        answer: fallbackExplainAnswer(recommendationTitle, contextText, question),
      })
    }
  })

  app.post('/api/simulate-recommendation', async (req: Request, res: Response) => {
    const { assetType = 'device', scenario = 'unknown issue' } = req.body
    const prompt = buildSimulatePrompt(assetType, scenario)

    try {
      const generatedText = await callMistral(prompt)
      const cleanedText = generatedText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()
      const parsed = JSON.parse(cleanedText) as Recommendation
      return res.json(parsed)
    } catch {
      return res.json(mockRecommendation(assetType, scenario))
    }
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
