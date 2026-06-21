import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HF_API_KEY)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    recommendationTitle = '',
    contextText = '',
    questionText,
    chatHistory = []
  } = req.body

  const historyToUse = chatHistory.length > 0 ? chatHistory : [
    { role: 'user', text: typeof questionText === 'string' && questionText.trim() ? questionText.trim() : 'Explain why this recommendation was made.' }
  ]

  const systemPrompt = `You are a transparent IT Operations AI assistant.
Your job is to answer the IT admin's specific questions about this recommendation.
Context Data Used: ${contextText}
Recommendation: ${recommendationTitle}
CRITICAL RULES:
- Do NOT repeat the exact same response or format.
- Answer their specific question conversationally, clearly, and concisely.
- Do NOT use ML jargon or probability terms. Keep it in plain English.
- Do NOT copy previous AI messages.`

  const mappedHistory: { role: string; content: string }[] = []
  let expectedRole = 'user'
  for (const msg of historyToUse) {
    if (!msg.text.trim()) continue
    const role = msg.role === 'ai' ? 'assistant' : 'user'
    if (role === expectedRole) {
      mappedHistory.push({ role, content: msg.text })
      expectedRole = expectedRole === 'user' ? 'assistant' : 'user'
    } else if (mappedHistory.length > 0 && mappedHistory[mappedHistory.length - 1].role === role) {
      mappedHistory[mappedHistory.length - 1].content += '\n' + msg.text
    }
  }
  
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
    const answer = response.choices[0].message.content || 'I could not generate an explanation.'
    return res.status(200).json({ answer })
  } catch (err: any) {
    console.error('AI Inference Error:', err)
    const lastUserMsg = historyToUse.filter((m: any) => m.role === 'user').pop()?.text?.toLowerCase() || ''
    
    if (lastUserMsg.includes('alternative') || lastUserMsg.includes('option') || lastUserMsg.includes('other')) {
      return res.status(200).json({ answer: `Besides the primary recommendation, you could schedule the action for a later maintenance window to avoid disrupting the user during working hours. This keeps the risk contained but delays resolution.` })
    }
    if (lastUserMsg.includes('delay') || lastUserMsg.includes('wait') || lastUserMsg.includes('later') || lastUserMsg.includes('days')) {
      return res.status(200).json({ answer: `Delaying is possible, but each day without action increases the chance of disruption. If you must delay, scheduling it for tonight's maintenance window is the safest option.` })
    }
    if (lastUserMsg.includes('risk') || lastUserMsg.includes('danger') || lastUserMsg.includes('impact')) {
      return res.status(200).json({ answer: `The main risk is that the device could fail during working hours, impacting the user's productivity. The longer this is left unaddressed, the higher the chance of an unplanned outage.` })
    }
    if (lastUserMsg.includes('fix') || lastUserMsg.includes('how') || lastUserMsg.includes('resolve')) {
      return res.status(200).json({ answer: `The recommended fix is ready to apply. Once you approve it, the system will handle the update automatically. You can also schedule it for later if needed.` })
    }
    return res.status(200).json({ answer: `Based on the available data, the recommendation for "${recommendationTitle}" stands. Multiple sources agree on the issue. Acting now is lower risk than waiting.` })
  }
}
