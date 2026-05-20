"use client"

import { useState } from 'react'
import { FileDown, FileText, Download, ShieldCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { statsAPI } from '@/lib/api'

export default function ReportsPage() {
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [generatingCsv, setGeneratingCsv] = useState(false)

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true)
    const toastId = toast.loading('Génération du rapport PDF...')
    try {
      const response: any = await statsAPI.exportReportsPdf()
      const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Rapport_FasoCare_National_${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Rapport PDF généré avec succès !', { id: toastId })
    } catch {
      toast.error('Erreur lors de la génération du PDF.', { id: toastId })
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleGenerateCsv = async () => {
    setGeneratingCsv(true)
    const toastId = toast.loading('Génération du rapport CSV...')
    try {
      const response: any = await statsAPI.exportReports()
      const blob = new Blob([response.data as BlobPart], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Rapport_FasoCare_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Rapport CSV généré avec succès !', { id: toastId })
    } catch {
      toast.error('Erreur lors de la génération du CSV.', { id: toastId })
    } finally {
      setGeneratingCsv(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Rapports d'Activité</h2>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">Données institutionnelles en temps réel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition">
          <div className="p-5 rounded-3xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition duration-500">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rapport National</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">PDF</p>
            <p className="text-[10px] font-bold text-slate-300 mt-1">Complet & formaté</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition">
          <div className="p-5 rounded-3xl bg-blue-50 text-blue-600 group-hover:scale-110 transition duration-500">
            <Download size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Export Brut</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">CSV</p>
            <p className="text-[10px] font-bold text-slate-300 mt-1">Données analysables</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition">
          <div className="p-5 rounded-3xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition duration-500">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sécurité</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">Chiffré</p>
            <p className="text-[10px] font-bold text-slate-300 mt-1">Protocole AES-256</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm p-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="p-5 rounded-3xl bg-red-50 text-red-500">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Rapport National PDF</h3>
              <p className="text-sm text-slate-400 mt-1">Indicateurs clés, tendances et zones critiques</p>
            </div>
          </div>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck size={16} className="text-emerald-500" /> Données dashboard temps réel
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck size={16} className="text-emerald-500" /> Carte des zones épidémiques
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck size={16} className="text-emerald-500" /> Cachet officiel et horodatage
            </div>
          </div>
          <button onClick={handleGeneratePdf} disabled={generatingPdf}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl text-xs font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition shadow-xl shadow-slate-200 uppercase tracking-widest disabled:opacity-50"
          >
            {generatingPdf ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
            {generatingPdf ? 'Génération en cours...' : 'Générer le Rapport PDF'}
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm p-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="p-5 rounded-3xl bg-blue-50 text-blue-500">
              <Download size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Export CSV</h3>
              <p className="text-sm text-slate-400 mt-1">Données brutes pour analyse externe</p>
            </div>
          </div>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck size={16} className="text-emerald-500" /> Statistiques complètes
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck size={16} className="text-emerald-500" /> Format universel (Excel, LibreOffice)
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck size={16} className="text-emerald-500" /> Données anonymisées
            </div>
          </div>
          <button onClick={handleGenerateCsv} disabled={generatingCsv}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl text-xs font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition shadow-xl shadow-blue-200 uppercase tracking-widest disabled:opacity-50"
          >
            {generatingCsv ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {generatingCsv ? 'Génération en cours...' : 'Télécharger le CSV'}
          </button>
        </div>
      </div>
    </div>
  )
}
