"use client"

import { PhoneFrame, StatusBar } from "./phone-frame"
import { FasoCareIcon } from "./icons"

export function LoginScreen() {
  return (
    <PhoneFrame label="Connexion · Login">
      <StatusBar />
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0d6e3f] to-[#1ab869] px-4 py-6 text-center">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">
          <FasoCareIcon className="h-8 w-8 text-white" />
        </div>
        <div className="text-lg font-extrabold text-white">FasoCare</div>
        <div className="mt-0.5 text-[9px] text-white/80">Santé numérique · Burkina Faso</div>
      </div>
      
      {/* Body */}
      <div className="p-3">
        <div className="mb-2 text-[9px] font-bold text-slate-800">Connectez-vous</div>
        
        {/* Fields */}
        <div className="mb-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Téléphone / ID</div>
          <div className="mt-0.5 text-[10px] font-semibold text-slate-800">+226 70 ••• •••</div>
        </div>
        <div className="mb-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Mot de passe</div>
          <div className="mt-0.5 text-[10px] font-semibold text-slate-800">••••••••</div>
        </div>
        
        {/* Button */}
        <button className="mb-2 w-full rounded-lg bg-gradient-to-r from-[#0d6e3f] to-[#1ab869] py-2.5 text-[11px] font-bold text-white">
          Se connecter
        </button>
        
        {/* Roles */}
        <div className="mb-1.5 text-[9px] font-bold text-slate-800">Choisir votre rôle</div>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { icon: "🩺", label: "Médecin" },
            { icon: "👨‍👩‍👧", label: "Parent" },
            { icon: "💊", label: "Pharma." },
            { icon: "🧑", label: "Patient" },
          ].map((role, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-center">
              <div className="text-base">{role.icon}</div>
              <div className="mt-0.5 text-[7px] font-bold text-slate-500">{role.label}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-2 text-center text-[8px] text-slate-500">
          Accès USSD sans internet : *222#
        </div>
      </div>
    </PhoneFrame>
  )
}
