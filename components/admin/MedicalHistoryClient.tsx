'use client'

import { useEffect, useState } from 'react'
import { Calendar, User, Stethoscope, Pill, Search, Download } from 'lucide-react'
import { medicalAPI, type Consultation } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { toast } from 'sonner'

export default function MedicalHistoryClient() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConsultations()
  }, [filter])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await medicalAPI.listConsultations({
        limit: 100,
      })

      setConsultations(response.data.data?.consultations || [])
    } catch (err: any) {
      console.error('Error fetching consultations:', err)
      setError(err.message || 'Failed to load medical history')
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultations = consultations.filter(
    (c) =>
      c.patientName.toLowerCase().includes(filter.toLowerCase()) ||
      c.doctorName?.toLowerCase().includes(filter.toLowerCase()) ||
      c.reason?.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleExportPDF = (consultationId: string) => {
    toast.success('Exportation en cours...', {
      description: 'Le PDF sera téléchargé bientôt.',
    })
  }

  if (error && consultations.length === 0) {
    return <ErrorState message={error} onRetry={fetchConsultations} />
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Historique Médical 📋</h2>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">Consultations et diagnostics</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Patient, médecin, motif..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Consultations List */}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-4">
          {filteredConsultations.length > 0 ? (
            filteredConsultations.map((consultation) => (
              <div
                key={consultation.id}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Row 1: Patient and Date */}
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient</p>
                          <p className="font-black text-slate-900">{consultation.patientName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</p>
                          <p className="font-black text-slate-900">
                            {new Date(consultation.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Médecin</p>
                          <p className="font-black text-slate-900">{consultation.doctorName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Reason and Diagnosis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Motif</p>
                        <p className="text-sm text-slate-700">{consultation.reason}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Diagnostic</p>
                        <p className="text-sm text-slate-700">{consultation.diagnosis || 'Non défini'}</p>
                      </div>
                    </div>

                    {/* Row 3: Prescription */}
                    {consultation.prescription && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                          <Pill className="inline mr-2" size={14} />
                          Ordonnance
                        </p>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{consultation.prescription}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                    <StatusBadge status={consultation.status} />
                    <button
                      onClick={() => handleExportPDF(consultation.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black hover:bg-emerald-700 transition"
                    >
                      <Download size={14} />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
              <p className="text-slate-400">Aucune consultation trouvée</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const labels: any = {
    pending: 'En attente',
    completed: 'Terminée',
    cancelled: 'Annulée',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {labels[status] || status}
    </span>
  )
}
