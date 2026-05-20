"use client"

import { cn } from "@/lib/utils"

interface PhoneFrameProps {
  children: React.ReactNode
  label?: string
  badge?: string
  className?: string
}

export function PhoneFrame({ children, label, badge, className }: PhoneFrameProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      {label && (
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
          {badge && (
            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="w-[200px] rounded-[30px] bg-zinc-900 p-2.5 shadow-2xl">
        <div className="min-h-[380px] overflow-hidden rounded-[22px] bg-white">
          {children}
        </div>
      </div>
    </div>
  )
}

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 text-[9px] font-bold text-zinc-900">
      <span>9:41</span>
      <div className="flex items-center gap-1 text-[8px]">
        <span>●●●</span>
        <span>📶</span>
        <span>🔋</span>
      </div>
    </div>
  )
}

interface TopBarProps {
  title: string
  titleColor?: string
  notifCount?: number
  notifColor?: string
  flag?: boolean
}

export function TopBar({ title, titleColor = "text-zinc-900", notifCount, notifColor = "bg-emerald-600" }: TopBarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5">
      <span className="text-sm">🇧🇫</span>
      <span className={cn("text-xs font-bold", titleColor)}>{title}</span>
      {notifCount !== undefined && (
        <div className={cn("flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white", notifColor)}>
          {notifCount}
        </div>
      )}
    </div>
  )
}

interface BottomNavProps {
  items: { icon: string; label: string; active?: boolean; activeColor?: string }[]
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <div className="flex border-t border-slate-100">
      {items.map((item, i) => (
        <div key={i} className="flex flex-1 flex-col items-center py-1.5">
          <span className="text-sm">{item.icon}</span>
          <span 
            className={cn(
              "mt-0.5 text-[7px] font-semibold",
              item.active ? item.activeColor || "text-emerald-700" : "text-slate-400"
            )}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
