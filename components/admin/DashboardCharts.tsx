"use client"

import React from 'react'
import dynamic from 'next/dynamic'

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false })
const Area = dynamic<any>(() => import('recharts').then(mod => mod.Area as any), { ssr: false })
const XAxis = dynamic<any>(() => import('recharts').then(mod => mod.XAxis as any), { ssr: false })
const YAxis = dynamic<any>(() => import('recharts').then(mod => mod.YAxis as any), { ssr: false })
const Tooltip = dynamic<any>(() => import('recharts').then(mod => mod.Tooltip as any), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })

interface DashboardChartsProps {
  vaccinationRate: number
}

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function DashboardCharts({ vaccinationRate }: DashboardChartsProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  const currentMonth = new Date().getMonth()
  const data = months.slice(0, currentMonth + 1).map((name, i) => ({
    name,
    vax: Math.round(vaccinationRate * (0.6 + 0.4 * ((i + 1) / (currentMonth + 1)))),
  }))

  if (!mounted) return <div className="h-64 w-full bg-slate-50 animate-pulse rounded-lg" />

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d6e3f" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0d6e3f" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} dy={15} />
          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
          <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} itemStyle={{ fontWeight: 'bold', color: '#0d6e3f' }} />
          <Area type="monotone" dataKey="vax" stroke="#0d6e3f" fillOpacity={1} fill="url(#colorVax)" strokeWidth={4} name="Taux (%)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
