'use client'

import { useEffect, useState, useCallback } from 'react'
import { ShieldAlert, Search, Filter, History, User, AlertCircle, CheckCircle, Info, RefreshCw, Terminal } from 'lucide-react'
import { auditAPI, type AuditLog } from '@/lib/api'

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('')

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await auditAPI.list({ limit: 50 })
      if (res.data?.success && res.data.data) {
        setLogs(res.data.data.logs)
        setTotal(res.data.data.total)
      }
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const filteredLogs = logs.filter(log => {
    if (search && !log.action.toLowerCase().includes(search.toLowerCase()) &&
        !log.resource.toLowerCase().includes(search.toLowerCase()) &&
        !log.userName.toLowerCase().includes(search.toLowerCase())) return false
    if (severityFilter && log.severity !== severityFilter) return false
    return true
  })

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200">Critique</span>
      case 'high': return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-200">Haut</span>
      case 'medium': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">Moyen</span>
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">Info</span>
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('DELETE') || action.includes('SUSPEND')) return <ShieldAlert size={18} className="text-red-500" />
    if (action.includes('CREATE')) return <CheckCircle size={18} className="text-emerald-500" />
    if (action.includes('UPDATE') || action.includes('PATCH')) return <History size={18} className="text-blue-500" />
    if (action.includes('LOGIN')) return <User size={18} className="text-indigo-500" />
    return <Info size={18} className="text-slate-400" />
  }

  const getSeverityCount = (severity: string) => logs.filter(l => l.severity === severity).length

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Journaux d'Audit <span className="text-lg">🛡️</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">Traçabilité totale des accès</p>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={fetchLogs} disabled={loading} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <RefreshCw size={18} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <Terminal size={18} className="text-[#0d6e3f]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Total : <span className="text-slate-900">{total.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SeverityCard label="Critique" count={getSeverityCount('critical')} color="red" />
        <SeverityCard label="Haut" count={getSeverityCount('high')} color="orange" />
        <SeverityCard label="Moyen" count={getSeverityCount('medium')} color="blue" />
        <SeverityCard label="Info" count={getSeverityCount('low')} color="slate" />
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par action, ressource ou utilisateur..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl text-sm font-medium border border-transparent focus:border-emerald-500 focus:bg-white transition"
          />
        </div>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
          className="px-6 py-4 bg-slate-50 rounded-2xl text-sm font-medium border border-transparent focus:border-emerald-500 focus:bg-white transition outline-none"
        >
          <option value="">Toutes les gravités</option>
          <option value="critical">Critique</option>
          <option value="high">Haut</option>
          <option value="medium">Moyen</option>
          <option value="low">Info</option>
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Historique ({filteredLogs.length})</h3>
          <p className="text-[10px] font-bold text-slate-300 uppercase">Temps réel</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Utilisateur</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gravité</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ressource</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-6 h-16 bg-slate-50/20"></td></tr>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-slate-50/50 transition duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition duration-500">
                          {getActionIcon(log.action)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-none">{log.action}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{log.resource}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{log.userName}</p>
                          <p className="text-[10px] font-bold text-[#0d6e3f] uppercase tracking-widest">{log.userRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">{getSeverityBadge(log.severity)}</td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-slate-500 font-medium max-w-xs truncate" title={log.details}>{log.details}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase mt-1">IP: {log.ipAddress}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{new Date(log.timestamp).toLocaleDateString('fr-FR')}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic font-medium">
                    Aucun journal d&apos;audit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SeverityCard({ label, count, color }: { label: string; count: number; color: string }) {
  const colorMap: any = { red: 'bg-red-50 text-red-600 border-red-100', orange: 'bg-orange-50 text-orange-600 border-orange-100', blue: 'bg-blue-50 text-blue-600 border-blue-100', slate: 'bg-slate-50 text-slate-600 border-slate-100' }
  return (
    <div className={`p-6 rounded-2xl border ${colorMap[color]} text-center`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-3xl font-black mt-1">{count}</p>
    </div>
  )
}
