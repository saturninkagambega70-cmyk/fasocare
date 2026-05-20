'use client'

import { useEffect, useState } from 'react'
import { Search, UserCheck, UserX, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { api, usersAPI, type User } from '@/lib/api'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await usersAPI.list({
        search: filter,
        limit: 100,
      })

      setUsers(response.data?.data?.users || [])
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId: string, action: 'validate' | 'suspend', userName: string) => {
    try {
      if (action === 'validate') {
        await usersAPI.validate(userId)
        toast.success(`Accréditation effectuée avec succès`, {
          description: `${userName} a été validé(e).`,
        })
      } else {
        await usersAPI.suspend(userId)
        toast.success(`Suspension effectuée avec succès`, {
          description: `${userName} a été suspendu(e).`,
        })
      }
      fetchUsers()
    } catch (err: any) {
      toast.error('Erreur', {
        description: err.message || 'Une erreur est survenue',
      })
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.establishment?.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase()),
  )

  if (error && users.length === 0) {
    return <ErrorState message={error} onRetry={fetchUsers} />
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Accréditations 🔐</h2>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">Gestion des accès praticiens</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Nom, établissement, email..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Praticien</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Établissement</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Statut</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                              user.role === 'DOCTOR' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600 shadow-sm'
                            }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-emerald-700 transition">{user.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-700">{user.establishment || 'N/A'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{user.phone}</p>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition duration-300">
                          {user.status !== 'active' && (
                            <button
                              onClick={() => handleAction(user.id, 'validate', user.name)}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition"
                            >
                              <UserCheck size={14} /> VALIDER
                            </button>
                          )}
                          {user.status !== 'suspended' && (
                            <button
                              onClick={() => handleAction(user.id, 'suspend', user.name)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                            >
                              <UserX size={18} />
                            </button>
                          )}
                          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-amber-100 text-amber-700',
    suspended: 'bg-red-100 text-red-700',
  }
  const labels: any = {
    active: 'Actif',
    inactive: 'Inactif',
    suspended: 'Suspendu',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {labels[status] || status}
    </span>
  )
}
