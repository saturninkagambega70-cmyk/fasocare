"use client"

import { PhoneFrame, StatusBar, TopBar, BottomNav } from "./phone-frame"
import { cn } from "@/lib/utils"

interface UserRowProps {
  initials: string
  bgColor: string
  name: string
  subtitle: string
  status: "validated" | "pending" | "suspended"
}

function UserRow({ initials, bgColor, name, subtitle, status }: UserRowProps) {
  const statusStyles = {
    validated: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-600",
    suspended: "bg-red-100 text-red-600"
  }
  const statusLabels = {
    validated: "Validé",
    pending: "En attente",
    suspended: "Suspendu"
  }
  
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-2.5 py-1.5">
      <div className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white", bgColor)}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[10px] font-semibold text-slate-800">{name}</div>
        <div className="text-[8px] text-slate-400">{subtitle}</div>
      </div>
      <div className={cn("flex-shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold", statusStyles[status])}>
        {statusLabels[status]}
      </div>
    </div>
  )
}

export function AdminScreen() {
  return (
    <PhoneFrame label="Administrateur · Ministère" badge="ADMIN">
      <StatusBar />
      <TopBar 
        title="Tableau de Bord Admin" 
        titleColor="text-slate-800" 
        notifCount={5} 
        notifColor="bg-red-500" 
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-600 px-3 py-2.5 text-white">
        <div className="text-xs font-bold">Ministère de la Santé BF</div>
        <div className="mt-0.5 text-[9px] opacity-80">Système national FasoCare</div>
        <div className="mt-1 inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-0.5 text-[8px]">
          🔐 Super Administrateur
        </div>
      </div>
      
      {/* KPIs */}
      <div className="flex gap-1.5 p-2">
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-center">
          <div className="text-base font-extrabold text-[#0d6e3f]">1.2k</div>
          <div className="text-[8px] text-slate-400">Médecins</div>
        </div>
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-center">
          <div className="text-base font-extrabold text-[#0d6e3f]">48k</div>
          <div className="text-[8px] text-slate-400">Patients</div>
        </div>
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-center">
          <div className="text-base font-extrabold text-orange-500">12</div>
          <div className="text-[8px] text-slate-400">Alertes</div>
        </div>
      </div>
      
      {/* Alert */}
      <div className="mx-2.5 flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5">
        <span className="text-base">⚠️</span>
        <span className="text-[8px] font-semibold text-red-800">2 médecins en attente de vérification</span>
      </div>
      
      {/* Section */}
      <div className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        Validations en attente
      </div>
      
      {/* User rows */}
      <UserRow 
        initials="DO" 
        bgColor="bg-violet-600" 
        name="Dr. Ouédraogo M." 
        subtitle="CMA Koudougou · Médecin" 
        status="pending" 
      />
      <UserRow 
        initials="PS" 
        bgColor="bg-sky-700" 
        name="Pharmacie Santé+" 
        subtitle="Licence #BF99870" 
        status="validated" 
      />
      <UserRow 
        initials="TR" 
        bgColor="bg-red-500" 
        name="Dr. Traoré K." 
        subtitle="CHU Bobo · Suspendu" 
        status="suspended" 
      />
      
      <div className="flex-1" />
      
      <BottomNav 
        items={[
          { icon: "📊", label: "Dashboard", active: true, activeColor: "text-slate-800" },
          { icon: "👥", label: "Comptes" },
          { icon: "📋", label: "Rapports" },
          { icon: "⚙️", label: "Système" },
        ]} 
      />
    </PhoneFrame>
  )
}
