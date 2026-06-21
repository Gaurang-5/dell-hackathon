import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Play, ShieldAlert, X, MessageSquare, GitBranch } from 'lucide-react'
import type { RecommendationOption, DataSource } from '../types'

interface HumanControlsProps {
  options: RecommendationOption[]
  assetId: string
  recommendationTitle: string
  dataSources: DataSource[]
  onActionConfirm: (action: string) => void
}

const ESCALATE_ACTION = 'Escalate to Human Review'

export function HumanControls({
  options,
  assetId,
  recommendationTitle,
  dataSources,
  onActionConfirm,
}: HumanControlsProps) {
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [showAskWhy, setShowAskWhy] = useState(false)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [askWhyInput, setAskWhyInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'This recommendation is generated based on fleet-wide anomaly patterns. Do you have a specific question about this data?' }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const handleConfirm = () => {
    if (pendingAction) {
      onActionConfirm(pendingAction)
      setPendingAction(null)
    }
  }

  const handleCancel = () => {
    setPendingAction(null)
  }

  const handleSendMessage = async (text?: string) => {
    const userText = (text || askWhyInput).trim()
    if (!userText) return
    if (!text) setAskWhyInput('')
    
    const updatedHistory = [...chatHistory, { role: 'user' as const, text: userText }]
    setChatHistory(updatedHistory)
    setIsTyping(true)
    
    try {
      const response = await fetch('/api/explain-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationTitle,
          contextText: dataSources.map(d => d.label).join(', '),
          questionText: userText,
          chatHistory: updatedHistory
        })
      })
      const data = await response.json()
      
      const responseText = data.answer || "I'm having trouble connecting to the AI agent right now."
      
      // Simulate streaming effect for better UX
      setIsTyping(false) // turn off typing indicator
      setChatHistory((prev) => [...prev, { role: 'ai', text: '' }])
      
      let currentText = ''
      const words = responseText.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 40)) // 20-60ms per word
        currentText += (i === 0 ? '' : ' ') + words[i]
        setChatHistory((prev) => {
          const newHistory = [...prev]
          newHistory[newHistory.length - 1] = { role: 'ai', text: currentText }
          return newHistory
        })
      }
      
    } catch (err) {
      setIsTyping(false)
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', text: "Sorry, there was an error processing your request." }
      ])
    }
  }

  const primaryOption = options[0]
  const alternativeOptions = options.slice(1)

  if (pendingAction) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50/50 p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-amber-900">
              You are about to execute: {pendingAction} on {assetId}. This will
              be recorded in the audit log.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-slate-900 dark:text-white hover:-translate-y-0.5 transition-transform shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 border-0"
              >
                <Play className="h-4 w-4" />
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {primaryOption && (
          <button
            type="button"
            onClick={() => setPendingAction(primaryOption.actionLabel)}
            className="inline-flex items-center gap-2 rounded-full bg-[#FAFAFA] px-6 py-4 text-sm font-semibold text-[#020617] hover:bg-white hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 border-0 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve ({primaryOption.actionLabel})
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setShowAskWhy(!showAskWhy)
            setShowAlternatives(false)
          }}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#171427]/50 backdrop-blur-sm px-6 py-4 text-sm font-medium text-slate-900 dark:text-white hover:border-slate-300 dark:border-white/20 hover:bg-white/50 dark:hover:bg-[#171427]/80 transition-all focus:outline-none"
        >
          <MessageSquare className="h-4 w-4 text-[#EDE9FE]" />
          Ask Why
        </button>

        {alternativeOptions.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowAlternatives(!showAlternatives)
              setShowAskWhy(false)
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#171427]/50 backdrop-blur-sm px-6 py-4 text-sm font-medium text-slate-900 dark:text-white hover:border-slate-300 dark:border-white/20 hover:bg-white/50 dark:hover:bg-[#171427]/80 transition-all focus:outline-none"
          >
            <GitBranch className="h-4 w-4 text-[#EDE9FE]" />
            See Alternatives
          </button>
        )}

        <button
          type="button"
          onClick={() => setPendingAction(ESCALATE_ACTION)}
          className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-6 py-4 text-sm font-medium text-[#F87171] hover:bg-red-500/20 transition-all focus:outline-none ml-auto"
        >
          <AlertTriangle className="h-4 w-4" />
          Escalate to Human Review
        </button>
      </div>

      {showAskWhy && (
        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-[#F3F1ED] dark:bg-[#101010]/50 p-4 animate-in slide-in-from-top-2 duration-200 flex flex-col min-h-[350px] max-h-[500px]">
          <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-3 pr-2">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-100' 
                    : 'bg-white dark:bg-[#171427]/80 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                }`}>
                  {msg.role === 'ai' && <strong className="block text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">AI Agent</strong>}
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-white dark:bg-[#171427]/80 border border-slate-200 dark:border-white/5 px-3 py-2 text-sm text-slate-500">
                  <span className="animate-pulse">Typing...</span>
                </div>
              </div>
            )}
            {!isTyping && chatHistory.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {['Why was this flagged now?', 'What is the exact risk?', 'How do we fix this?'].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    className="text-[11px] rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-auto">
            <input
              type="text"
              value={askWhyInput}
              onChange={(e) => setAskWhyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="e.g. Why wasn't this caught earlier?"
              className="flex-1 rounded-md border border-slate-200 dark:border-white/10 bg-[#F3F1ED] dark:bg-[#101010] px-3 py-2 text-sm focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-900 dark:text-white placeholder:text-slate-500"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isTyping}
              className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-slate-900 dark:text-white hover:bg-indigo-600 focus:outline-none disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {showAlternatives && alternativeOptions.length > 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-[#F3F1ED] dark:bg-[#101010]/50 p-4 animate-in slide-in-from-top-2 duration-200 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Alternative Options</h4>
          {alternativeOptions.map((opt) => (
            <div key={opt.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-slate-200 dark:border-white/5 bg-white dark:bg-[#171427]/40 p-3 shadow-sm hover:bg-white/50 dark:hover:bg-[#171427]/60 transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{opt.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{opt.description}</p>
              </div>
              <button
                onClick={() => setPendingAction(opt.actionLabel)}
                className="shrink-0 rounded-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#EDE9FE]/50 transition-colors"
              >
                Override: {opt.actionLabel}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
