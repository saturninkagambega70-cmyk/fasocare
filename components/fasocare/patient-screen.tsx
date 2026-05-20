"use client"

import { PhoneFrame, StatusBar, TopBar, BottomNav } from "./phone-frame"
import { cn } from "@/lib/utils"

interface HistoryItemProps {
  icon: string
  name: string
  date: string
  status: "active" | "expired"
}

function HistoryItem({ icon, name, date, status }: HistoryItemProps) {
  const statusStyles = {
    active: "bg-emerald-100 text-emerald-700",
    expired: "bg-slate-100 text-slate-500",
  }
  const statusLabels = {
    active: "Actif",
    expired: "Expiré",
  }
  
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-2.5 py-1.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sm">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[9px] font-semibold text-slate-800">{name}</div>
        <div className="text-[8px] text-slate-400">{date}</div>
      </div>
      <div className={cn("flex-shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold", statusStyles[status])}>
        {statusLabels[status]}
      </div>
    </div>
  )
}

export function PatientScreen() {
  return (
    <PhoneFrame label="Patient · Dossier QR" badge="NEW">
      <StatusBar />
      <TopBar 
        title="Mon Espace Patient" 
        titleColor="text-sky-700" 
        notifCount={1} 
        notifColor="bg-sky-700" 
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-700 to-sky-500 px-3 py-2.5 text-white">
        <div className="text-xs font-bold">Josias Kaboré</div>
        <div className="mt-0.5 text-[9px] opacity-85">22 ans · ID #BF12345</div>
        <div className="mt-1 inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5 text-[8px]">
          ✓ Profil vérifié
        </div>
      </div>
      
      {/* QR Card */}
      <div className="mx-2.5 mt-2 rounded-xl border-2 border-sky-500 bg-gradient-to-br from-sky-50 to-sky-100 p-2.5 text-center">
        <div className="mb-1.5 text-[9px] font-bold text-sky-700">🔒 QR CODE PATIENT SÉCURISÉ</div>
        <div className="mx-auto mb-1.5 flex h-14 w-14 items-center justify-center rounded-lg bg-sky-700 text-3xl">
          ⬛
        </div>
        <div className="text-[10px] font-bold text-sky-700">Partage temporaire actif</div>
        <div className="mt-0.5 text-[8px] text-slate-500">⏱ Expire dans 23h 47min · Révocable</div>
      </div>
      
      {/* Share options */}
      <div className="flex gap-1.5 px-2.5 py-2">
        {[
          { icon: "👨‍⚕️", label: "Médecin" },
          { icon: "🏥", label: "Hôpital" },
          { icon: "🚑", label: "Urgences" },
        ].map((opt, i) => (
          <div key={i} className="flex flex-1 flex-col items-center rounded-lg border border-sky-200 bg-sky-50 py-1.5">
            <span className="text-base">{opt.icon}</span>
            <span className="mt-0.5 text-[8px] font-semibold text-sky-700">{opt.label}</span>
          </div>
        ))}
      </div>
      
      {/* Section */}
      <div className="px-2.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        Historique médecins
      </div>
      
      {/* History items */}
      <HistoryItem 
        icon="👨‍⚕️" 
        name="Dr. Ouédraogo · CMA Koudougou" 
        date="Aujourd'hui · Paludisme" 
        status="active" 
      />
      <HistoryItem 
        icon="👩‍⚕️" 
        name="Dr. Sanou · CHU Ouaga" 
        date="12 Mars · Infection" 
        status="expired" 
      />
      
      <div className="flex-1" />
      
      <BottomNav 
        items={[
          { icon: "🏠", label: "Accueil", active: true, activeColor: "text-sky-700" },
          { icon: "🔲", label: "Mon QR" },
          { icon: "📋", label: "Dossier" },
          { icon: "📅", label: "RDV" },
        ]} 
      />
    </PhoneFrame>
  )
}
