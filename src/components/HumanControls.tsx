import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Play, ShieldAlert, X, MessageSquare, GitBranch } from 'lucide-react'
import type { RecommendationOption } from '../types'

interface HumanControlsProps {
  options: RecommendationOption[]
  assetId: string
  recommendationTitle: string
  dataSources: string[]
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

  const handleSendMessage = async () => {
    if (!askWhyInput.trim()) return
    const userText = askWhyInput.trim()
    setAskWhyInput('')
    
    setChatHistory((prev) => [...prev, { role: 'user', text: userText }])
    setIsTyping(true)
    
    try {
      const response = await fetch('/api/explain-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationTitle,
          contextText: dataSources.join(', '),
          questionText: userText
        })
      })
      const data = await response.json()
      
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', text: data.answer || "I'm having trouble connecting to the AI agent right now." }
      ])
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', text: "Sorry, there was an error processing your request." }
      ])
    } finally {
      setIsTyping(false)
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
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:-translate-y-0.5 transition-transform shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 border-0"
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
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 border-0"
          >
            <CheckCircle2 className="h-4 w-4" />
            {primaryOption.actionLabel}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setShowAskWhy(!showAskWhy)
            setShowAlternatives(false)
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          <MessageSquare className="h-4 w-4 text-slate-400" />
          Ask Why
        </button>

        {alternativeOptions.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowAlternatives(!showAlternatives)
              setShowAskWhy(false)
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <GitBranch className="h-4 w-4 text-slate-400" />
            See Alternatives
          </button>
        )}

        <button
          type="button"
          onClick={() => setPendingAction(ESCALATE_ACTION)}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 shadow-sm hover:border-red-300 hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ml-auto"
        >
          <AlertTriangle className="h-4 w-4" />
          Escalate
        </button>
      </div>

      {showAskWhy && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 animate-in slide-in-from-top-2 duration-200 flex flex-col max-h-[300px]">
          <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-3 pr-2">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}>
                  {msg.role === 'ai' && <strong className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">AI Agent</strong>}
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-500">
                  <span className="animate-pulse">Typing...</span>
                </div>
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
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {showAlternatives && alternativeOptions.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 animate-in slide-in-from-top-2 duration-200 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-slate-800 mb-1">Alternative Options</h4>
          {alternativeOptions.map((opt) => (
            <div key={opt.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <div>
                <p className="text-sm font-bold text-slate-800">{opt.title}</p>
                <p className="text-xs text-slate-500 mt-1">{opt.description}</p>
              </div>
              <button
                onClick={() => setPendingAction(opt.actionLabel)}
                className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
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
