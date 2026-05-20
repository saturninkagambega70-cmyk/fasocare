"use client"

import { PhoneFrame, StatusBar, TopBar, BottomNav } from "./phone-frame"
import { cn } from "@/lib/utils"

interface PatientRowProps {
  initials: string
  bgColor: string
  name: string
  condition: string
  status: "online" | "active"
}

function PatientRow({ initials, bgColor, name, condition, status }: PatientRowProps) {
  const statusStyles = {
    online: "bg-blue-100 text-blue-700",
    active: "bg-emerald-100 text-emerald-700",
  }
  const statusLabels = {
    online: "En ligne",
    active: "Actif",
  }
  
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-2.5 py-1.5">
      <div className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white", bgColor)}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[10px] font-semibold text-slate-800">{name}</div>
        <div className="text-[8px] text-slate-400">{condition}</div>
      </div>
      <div className={cn("flex-shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold", statusStyles[status])}>
        {statusLabels[status]}
      </div>
    </div>
  )
}

export function DoctorScreen() {
  return (
    <PhoneFrame label="Médecin · Téléconsult." badge="NEW">
      <StatusBar />
      <TopBar 
        title="Espace Médecin" 
        titleColor="text-[#0d6e3f]" 
        notifCount={3} 
        notifColor="bg-[#0d6e3f]" 
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d6e3f] to-[#1ab869] px-3 py-2.5 text-white">
        <div className="text-xs font-bold">Dr. Moussa Ouédraogo</div>
        <div className="mt-0.5 text-[9px] opacity-85">Généraliste · CMA Koudougou</div>
        <div className="mt-1 inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5 text-[8px]">
          ✓ Vérifié
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex gap-1.5 p-2">
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-center">
          <div className="text-base font-extrabold text-[#0d6e3f]">24</div>
          <div className="text-[8px] text-slate-400">Patients</div>
        </div>
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-center">
          <div className="text-base font-extrabold text-[#0d6e3f]">8</div>
          <div className="text-[8px] text-slate-400">Ordonnances</div>
        </div>
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-center">
          <div className="text-base font-extrabold text-blue-600">3</div>
          <div className="text-[8px] text-slate-400">Téléconsult.</div>
        </div>
      </div>
      
      {/* Teleconsult block */}
      <div className="mx-2.5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-2 text-white">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-base">
          📹
        </div>
        <div>
          <div className="text-[11px] font-bold">Consulter à distance</div>
          <div className="text-[8px] opacity-85">Appel vidéo + QR ordonnance</div>
        </div>
      </div>
      
      {/* Section */}
      <div className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        Patients en attente
      </div>
      
      {/* Patient rows */}
      <PatientRow 
        initials="JK" 
        bgColor="bg-violet-600" 
        name="Josias Kaboré" 
        condition="Fièvre · Téléconsult." 
        status="online" 
      />
      <PatientRow 
        initials="AS" 
        bgColor="bg-orange-500" 
        name="Awa Sanou" 
        condition="Paludisme · Présentiel" 
        status="active" 
      />
      
      {/* QR Button */}
      <div className="mx-2.5 mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 border-[#0d6e3f] px-2 py-2 text-[10px] font-bold text-[#0d6e3f]">
        🔲 Générer QR Ordonnance
      </div>
      
      <div className="flex-1" />
      
      <BottomNav 
        items={[
          { icon: "🏠", label: "Accueil", active: true, activeColor: "text-[#0d6e3f]" },
          { icon: "👥", label: "Patients" },
          { icon: "📹", label: "Télé" },
          { icon: "📋", label: "Ordonnances" },
        ]} 
      />
    </PhoneFrame>
  )
}
