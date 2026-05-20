"use client"

import { PhoneFrame, StatusBar, TopBar, BottomNav } from "./phone-frame"
import { cn } from "@/lib/utils"

interface StockCardProps {
  name: string
  qty: number
  qtyColor: string
  fillWidth: string
  fillColor: string
  status: "ok" | "low" | "critical"
}

function StockCard({ name, qty, qtyColor, fillWidth, fillColor, status }: StockCardProps) {
  const statusStyles = {
    ok: "bg-emerald-100 text-emerald-700",
    low: "bg-amber-100 text-amber-600",
    critical: "bg-red-100 text-red-600",
  }
  const statusLabels = {
    ok: "✓ OK",
    low: "⚡ Faible",
    critical: "⚠ Rupture",
  }
  
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
      <div className="text-[9px] font-bold text-slate-800">{name}</div>
      <div className={cn("text-xl font-extrabold", qtyColor)}>{qty}</div>
      <div className="text-[8px] text-slate-400">boîtes</div>
      <div className="mt-1 h-1 overflow-hidden rounded bg-slate-200">
        <div className={cn("h-full rounded", fillColor)} style={{ width: fillWidth }} />
      </div>
      <div className={cn("mt-1 rounded px-1 py-0.5 text-center text-[7px] font-bold", statusStyles[status])}>
        {statusLabels[status]}
      </div>
    </div>
  )
}

export function PharmacistScreen() {
  return (
    <PhoneFrame label="Pharmacien · Stocks" badge="NEW">
      <StatusBar />
      <TopBar 
        title="Espace Pharmacien" 
        titleColor="text-orange-500" 
        notifCount={2} 
        notifColor="bg-orange-500" 
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-400 px-3 py-2.5 text-white">
        <div className="text-xs font-bold">Pharmacie Santé Plus</div>
        <div className="mt-0.5 text-[9px] opacity-85">Ouagadougou · Licence #BF12345</div>
        <div className="mt-1 inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5 text-[8px]">
          ✓ Officiel
        </div>
      </div>
      
      {/* Alert */}
      <div className="px-2.5 py-1.5 text-[9px] font-bold text-orange-500">
        ⚠ ALERTES STOCK (2)
      </div>
      
      {/* Stock grid */}
      <div className="grid grid-cols-2 gap-1.5 px-2.5">
        <StockCard 
          name="Amoxicilline" 
          qty={2} 
          qtyColor="text-red-500" 
          fillWidth="10%" 
          fillColor="bg-red-500" 
          status="critical" 
        />
        <StockCard 
          name="Artemether" 
          qty={15} 
          qtyColor="text-amber-500" 
          fillWidth="35%" 
          fillColor="bg-amber-500" 
          status="low" 
        />
        <StockCard 
          name="Paracétamol" 
          qty={48} 
          qtyColor="text-emerald-500" 
          fillWidth="80%" 
          fillColor="bg-emerald-500" 
          status="ok" 
        />
        <StockCard 
          name="Doliprane 1g" 
          qty={32} 
          qtyColor="text-emerald-500" 
          fillWidth="65%" 
          fillColor="bg-emerald-500" 
          status="ok" 
        />
      </div>
      
      {/* Order button */}
      <div className="mx-2.5 mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-orange-500 py-2 text-[10px] font-bold text-white">
        🛒 Commander auprès du grossiste
      </div>
      
      <div className="flex-1" />
      
      <BottomNav 
        items={[
          { icon: "🏠", label: "Accueil", active: true, activeColor: "text-orange-500" },
          { icon: "📦", label: "Stocks" },
          { icon: "🛒", label: "Commande" },
          { icon: "📊", label: "Stats" },
        ]} 
      />
    </PhoneFrame>
  )
}
