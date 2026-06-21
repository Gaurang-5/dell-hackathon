import { useEffect } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor =
    type === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : 'bg-rose-50 border-rose-200 text-rose-800'
  
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  const iconColor = type === 'success' ? 'text-emerald-500' : 'text-rose-500'

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 ${bgColor}`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
