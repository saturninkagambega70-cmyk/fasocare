'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Users, Syringe, Activity, AlertCircle, TrendingUp, ShieldAlert, Map, FileText, RefreshCw } from 'lucide-react'
import { statsAPI, notificationsAPI, type DashboardStats, type Notification } from '@/lib/api'
import { SkeletonCard } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'

const DashboardCharts = dynamic(() => import('@/components/admin/DashboardCharts'), { ssr: false })

interface KpiCardProps {
  title: string
  value: string | number
  sub: string
  icon: any
  color: string
  trend?: string
}

interface DashboardNotification {
  id: string
  type: 'alert' | 'validation' | 'stock_alert'
  title: string
  message: string
  timestamp: string
  read: boolean
}

const KpiCard = ({ title, value, sub, icon: Icon, color, trend }: KpiCardProps) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{title}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <div className="flex items-center gap-2 pt-2">
          {trend && (
            <span
              className={`flex items-center text-[10px] font-black px-2 py-1 rounded-full ${
                trend.startsWith('+') ? 'bg-emerald-50 text-[#0d6e3f]' : 'bg-red-50 text-red-600'
              }`}
            >
              <TrendingUp size={12} className="mr-1" /> {trend}
            </span>
          )}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
        </div>
      </div>
      <div
        className={`p-5 rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-110 ${
          color === 'blue'
            ? 'bg-blue-600 shadow-blue-900/10'
            : color === 'emerald'
            ? 'bg-emerald-600 shadow-emerald-900/10'
            : color === 'indigo'
            ? 'bg-indigo-600 shadow-indigo-900/10'
            : 'bg-orange-600 shadow-orange-900/10'
        }`}
      >
        <Icon size={28} className="text-white" />
      </div>
    </div>
  </div>
)

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [statsRes, notifRes] = await Promise.all([
        statsAPI.getDashboard(),
        notificationsAPI.list({ limit: 10 }),
      ])
      const dashboardStats = statsRes.data.data || {
        citizens: 0,
        vaccinationRate: 0,
        consultations: 0,
        stockAlerts: 0,
        trends: { citizens: '+0%', vaccination: '+0%', consultations: '+0%', alerts: '+0%' },
      }
      setStats(dashboardStats as DashboardStats)
      const notificationsList = (notifRes.data.data?.notifications || []).map(normalizeNotification)
      setNotifications(notificationsList)
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboardData() }, [fetchDashboardData])

  if (error && !stats) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tableau de Bord National</h2>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={fetchDashboardData} disabled={loading} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
          <RefreshCw size={18} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className={`p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group transition-all duration-700 ${
        (stats?.stockAlerts || 0) > 0 ? 'bg-gradient-to-r from-orange-600 to-red-600 shadow-orange-900/20' : 'bg-[#0d6e3f] shadow-emerald-900/20'
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition duration-1000"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xl border border-white/20">
            {(stats?.stockAlerts || 0) > 0 ? <AlertCircle size={32} className="text-white animate-pulse" /> : <ShieldAlert size={32} className="text-yellow-400" />}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70">
              {(stats?.stockAlerts || 0) > 0 ? 'Urgence Logistique' : 'Statut National'}
            </p>
            <h2 className="text-2xl font-black tracking-tight">
              {(stats?.stockAlerts || 0) > 0
                ? `${stats?.stockAlerts} Point(s) de Santé en Rupture`
                : 'Système de Santé Opérationnel'}
            </h2>
            <p className="text-white/80 text-sm font-medium">
              {(stats?.stockAlerts || 0) > 0
                ? 'Nécessite un déploiement urgent de kits médicaux.'
                : `Couverture vaccinale: ${stats?.vaccinationRate?.toFixed(1) || 0}%`}
            </p>
          </div>
        </div>
        <Link
          href={(stats?.stockAlerts || 0) > 0 ? '/admin/map' : '/admin/dashboard'}
          className="bg-white text-[#0d6e3f] px-10 py-5 rounded-2xl text-xs font-black shadow-xl hover:bg-emerald-50 transition-all active:scale-95 uppercase tracking-[0.2em] relative z-10 mb-4 md:mb-0"
        >
          {(stats?.stockAlerts || 0) > 0 ? 'Déployer Logistique' : 'Voir la Carte'}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <SkeletonCard count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <KpiCard title="Citoyens Enregistrés" value={stats?.citizens || 0} sub="Patients actifs" trend={stats?.trends?.citizens} icon={Users} color="blue" />
          <KpiCard title="Taux de Vaccination" value={`${(stats?.vaccinationRate || 0).toFixed(1)}%`} sub="Moyenne nationale" trend={stats?.trends?.vaccination} icon={Syringe} color="emerald" />
          <KpiCard title="Consultations (24h)" value={stats?.consultations || 0} sub="Dernières 24h" trend={stats?.trends?.consultations} icon={Activity} color="indigo" />
          <KpiCard title="Alertes de Stock" value={stats?.stockAlerts || 0} sub="Points de santé" trend={stats?.trends?.alerts} icon={AlertCircle} color="orange" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl transition duration-700">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Évolution de la Couverture Vaccinale</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Taux national 2026</p>
            </div>
            <div className="flex gap-4">
              <Link href="/admin/map" className="bg-slate-50 p-3 rounded-xl text-slate-400 hover:text-[#0d6e3f] transition">
                <Map size={20} />
              </Link>
              <Link href="/admin/reports" className="bg-slate-50 p-3 rounded-xl text-slate-400 hover:text-[#0d6e3f] transition">
                <FileText size={20} />
              </Link>
            </div>
          </div>
          {stats && <DashboardCharts vaccinationRate={stats.vaccinationRate} />}
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Notifications</h3>
            <Link href="/admin/users" className="text-[10px] font-black text-[#0d6e3f] uppercase tracking-[0.3em] hover:opacity-70 transition">
              Tout voir
            </Link>
          </div>
          <div className="space-y-8 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-5 group">
                  <div
                    className={`p-4 rounded-2xl ${
                      notif.type === 'validation' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    } group-hover:scale-110 transition duration-500 shadow-inner`}
                  >
                    {notif.type === 'validation' ? <ShieldAlert size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 group-hover:text-[#0d6e3f] transition">{notif.title}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                    <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em] pt-2">
                      {formatTimestamp(notif.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-slate-400 text-sm italic">Aucune notification récente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function normalizeNotification(notification: Notification): DashboardNotification {
  const normalizedType =
    notification.type === 'VACCINATION' || notification.type === 'PRESCRIPTION' || notification.type === 'validation'
      ? 'validation'
      : notification.type === 'stock_alert'
        ? 'stock_alert'
        : 'alert'
  return {
    id: notification.id,
    type: normalizedType,
    title: notification.title,
    message: notification.message || notification.content || '',
    timestamp: notification.timestamp,
    read: notification.read ?? notification.isRead ?? false,
  }
}

function formatTimestamp(ts: string) {
  try {
    return new Date(ts).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return ts }
}
