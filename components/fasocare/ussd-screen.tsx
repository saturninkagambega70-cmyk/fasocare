"use client"

import { PhoneFrame, StatusBar, TopBar, BottomNav } from "./phone-frame"

interface NetModeProps {
  icon: string
  label: string
  sublabel: string
  bgColor: string
  borderColor: string
  textColor: string
  subTextColor: string
}

function NetMode({ icon, label, sublabel, bgColor, borderColor, textColor, subTextColor }: NetModeProps) {
  return (
    <div className={`flex flex-1 flex-col items-center rounded-lg border p-2 ${bgColor} ${borderColor}`}>
      <span className="text-lg">{icon}</span>
      <span className={`mt-0.5 text-[8px] font-bold ${textColor}`}>{label}</span>
      <span className={`text-[7px] ${subTextColor}`}>{sublabel}</span>
    </div>
  )
}

export function USSDScreen() {
  return (
    <PhoneFrame label="Accessibilité · USSD" badge="NEW">
      <StatusBar />
      <TopBar 
        title="Accès Universel" 
        titleColor="text-slate-700" 
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-3 py-2.5 text-white">
        <div className="text-xs font-bold">Mode Hors-ligne &amp; USSD</div>
        <div className="mt-0.5 text-[9px] opacity-85">Accès sans internet · Zones rurales</div>
      </div>
      
      {/* USSD Screen simulation */}
      <div className="mx-2.5 mt-2 rounded-lg bg-slate-900 p-3 font-mono">
        <div className="text-[9px] text-emerald-400">FasoCare USSD *222#</div>
        <div className="text-[9px] text-emerald-400">──────────────────</div>
        <div className="text-[9px] text-emerald-400">1. Mon ordonnance</div>
        <div className="text-[9px] text-emerald-400">2. Rappel vaccin</div>
        <div className="text-[9px] text-emerald-400">3. Pharmacie proche</div>
        <div className="text-[9px] text-emerald-400">4. RDV médecin</div>
        <div className="text-[9px] text-emerald-400">──────────────────</div>
        <div className="text-[9px] text-white">Réponse: 1▊</div>
      </div>
      
      {/* Net modes */}
      <div className="flex gap-1.5 px-2.5 py-2">
        <NetMode 
          icon="📶" 
          label="En ligne" 
          sublabel="App complète" 
          bgColor="bg-emerald-50" 
          borderColor="border-emerald-300" 
          textColor="text-emerald-700" 
          subTextColor="text-emerald-400" 
        />
        <NetMode 
          icon="📵" 
          label="Hors-ligne" 
          sublabel="Cache local" 
          bgColor="bg-amber-50" 
          borderColor="border-amber-300" 
          textColor="text-amber-600" 
          subTextColor="text-amber-400" 
        />
        <NetMode 
          icon="📞" 
          label="USSD" 
          sublabel="*222#" 
          bgColor="bg-sky-50" 
          borderColor="border-sky-300" 
          textColor="text-sky-700" 
          subTextColor="text-sky-400" 
        />
      </div>
      
      {/* SMS preview */}
      <div className="mx-2.5 rounded-lg border border-emerald-300 bg-emerald-50 p-2">
        <div className="mb-1 text-[8px] font-bold text-emerald-700">📱 SMS reçu :</div>
        <div className="text-[8px] leading-relaxed text-emerald-800">
          FasoCare: Rappel vaccin ROR pour Aminata le 15/04. Répondez OUI pour confirmer.
        </div>
      </div>
      
      <div className="flex-1" />
      
      <BottomNav 
        items={[
          { icon: "📵", label: "Hors-ligne" },
          { icon: "📞", label: "USSD" },
          { icon: "📱", label: "SMS", active: true, activeColor: "text-slate-700" },
          { icon: "🗺️", label: "Carte" },
        ]} 
      />
    </PhoneFrame>
  )
}
