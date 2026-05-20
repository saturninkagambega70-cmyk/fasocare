import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-[#0d6e3f]" />
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-[#0d6e3f]" />
      <p className="text-sm text-slate-600">Chargement des données...</p>
    </div>
  )
}

export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded-full w-24"></div>
            <div className="h-10 bg-slate-200 rounded-lg w-32"></div>
            <div className="h-3 bg-slate-100 rounded-full"></div>
          </div>
        </div>
      ))}
    </>
  )
}
