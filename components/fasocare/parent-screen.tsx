"use client"

import { PhoneFrame, StatusBar, TopBar, BottomNav } from "./phone-frame"
import { cn } from "@/lib/utils"

interface VaccineItemProps {
  dotColor: string
  name: string
  date: string
  status: "done" | "todo" | "planned"
}

function VaccineItem({ dotColor, name, date, status }: VaccineItemProps) {
  const statusStyles = {
    done: "bg-emerald-100 text-emerald-700",
    todo: "bg-amber-100 text-amber-600",
    planned: "bg-slate-100 text-slate-500",
  }
  const statusLabels = {
    done: "Fait",
    todo: "À faire",
    planned: "Planifié",
  }
  
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 py-1.5">
      <div className={cn("h-2 w-2 flex-shrink-0 rounded-full", dotColor)} />
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-semibold text-slate-800">{name}</div>
        <div className="text-[8px] text-slate-400">{date}</div>
      </div>
      <div className={cn("flex-shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold", statusStyles[status])}>
        {statusLabels[status]}
      </div>
    </div>
  )
}

export function ParentScreen() {
  return (
    <PhoneFrame label="Parent · Vaccination" badge="NEW">
      <StatusBar />
      <TopBar 
        title="Espace Parents" 
        titleColor="text-violet-600" 
        notifCount={1} 
        notifColor="bg-violet-600" 
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-400 px-3 py-2.5 text-white">
        <div className="text-xs font-bold">Carnet Vaccination Numérique</div>
        <div className="mt-0.5 text-[9px] opacity-85">Suivi officiel · Min. Santé</div>
        <div className="mt-1 inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5 text-[8px]">
          🔒 QR Officiel
        </div>
      </div>
      
      {/* Child card */}
      <div className="mx-2.5 mt-2 rounded-xl border border-violet-200 bg-violet-50 p-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white">
            AM
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-violet-900">Aminata Ouédraogo</div>
            <div className="text-[8px] text-violet-600">5 ans · Fille · 19kg</div>
          </div>
          <div className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold text-amber-600">
            2 vaccins
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-violet-200">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-violet-600 to-violet-400" />
        </div>
        <div className="mt-1 text-[8px] font-semibold text-violet-600">75% du calendrier complet</div>
      </div>
      
      {/* Vaccine list */}
      <div className="px-2.5 pt-1.5">
        <VaccineItem 
          dotColor="bg-emerald-500" 
          name="BCG + Polio" 
          date="✓ 15 Jan 2020" 
          status="done" 
        />
        <VaccineItem 
          dotColor="bg-amber-500" 
          name="ROR (Rougeole)" 
          date="⏰ 15 Avril 2026" 
          status="todo" 
        />
        <VaccineItem 
          dotColor="bg-slate-300" 
          name="Méningite A" 
          date="📅 Sept. 2026" 
          status="planned" 
        />
      </div>
      
      {/* SMS alert */}
      <div className="mx-2.5 mt-2 flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5">
        <span className="text-base">📱</span>
        <span className="text-[8px] font-semibold text-amber-800">Rappel SMS : ROR dans 14 jours</span>
      </div>
      
      <div className="flex-1" />
      
      <BottomNav 
        items={[
          { icon: "🏠", label: "Accueil", active: true, activeColor: "text-violet-600" },
          { icon: "👶", label: "Enfants" },
          { icon: "💉", label: "Vaccins" },
          { icon: "📲", label: "Partager" },
        ]} 
      />
    </PhoneFrame>
  )
}
