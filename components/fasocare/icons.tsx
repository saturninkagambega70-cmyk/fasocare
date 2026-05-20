"use client"

import { cn } from "@/lib/utils"

interface IconProps {
  className?: string
}

export function FasoCareIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 30 30" fill="none" className={cn("h-6 w-6", className)}>
      <path d="M15 4L15 26M4 15L26 15" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="15" cy="15" r="12" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
    </svg>
  )
}
