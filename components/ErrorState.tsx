import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  title?: string
}

export function ErrorState({
  message = 'Une erreur est survenue lors du chargement des données',
  onRetry,
  title = 'Erreur',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="p-4 bg-red-50 rounded-full">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-black text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d6e3f] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      )}
    </div>
  )
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 mb-4">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
