"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Phone, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password: password.trim() }),
      })

      const payload = await response.json()
      if (!response.ok) {
        const message = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message
        throw new Error(message || 'Identifiants incorrects')
      }

      if (!payload?.access_token || !payload?.user) {
        throw new Error('Réponse de connexion invalide')
      }
      const userRoles = payload.user.roles || [payload.user.role]
      if (!userRoles.includes('ADMIN')) {
        throw new Error("Accès refusé: portail réservé aux administrateurs nationaux.")
      }

      sessionStorage.setItem('fasocare_admin_token', payload.access_token)
      sessionStorage.setItem('fasocare_admin_user', JSON.stringify(payload.user))
      if (payload.refresh_token) {
        sessionStorage.setItem('fasocare_refresh_token', payload.refresh_token)
      }
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-[#0d6e3f] rounded-xl flex items-center justify-center text-white">
            <Shield size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Portail FasoCare
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Connectez-vous pour accéder à votre espace sécurisé
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Numéro de téléphone (Format international)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d6e3f] outline-none text-sm"
                  placeholder="+226XXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" title="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d6e3f] outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm animate-in fade-in zoom-in-95">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0d6e3f] hover:bg-[#0a5a33] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d6e3f] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Besoin d'aide ?</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400 leading-relaxed">
                Utilisez un compte réel habilité par l'administration nationale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
