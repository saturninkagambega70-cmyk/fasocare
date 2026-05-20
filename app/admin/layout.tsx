"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Map, FileText, LogOut, User, ShieldAlert } from 'lucide-react'
import { FasoCareIcon } from "@/components/fasocare/icons"

type AdminSessionUser = {
  id?: string
  role?: string
  roles?: string[]
  name?: string | null
  phone?: string | null
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null)

  useEffect(() => {
    try {
      const token = sessionStorage.getItem('fasocare_admin_token')
      const rawUser = sessionStorage.getItem('fasocare_admin_user')

      if (!token || !rawUser) {
        window.location.href = '/login'
        return
      }

      const parsed = JSON.parse(rawUser) as AdminSessionUser
      const userRoles = parsed?.roles || [parsed?.role]
      if (!userRoles.includes('ADMIN')) {
        sessionStorage.removeItem('fasocare_admin_token')
        sessionStorage.removeItem('fasocare_admin_user')
        window.location.href = '/login'
        return
      }
      setAdminUser(parsed)
      setIsReady(true)
    } catch {
      setTimeout(() => {
        sessionStorage.removeItem('fasocare_admin_token')
        sessionStorage.removeItem('fasocare_admin_user')
        window.location.href = '/login'
      }, 3000)
    }
  }, [router])

  const displayName = useMemo(() => {
    if (adminUser?.name && adminUser.name.trim()) return adminUser.name
    if (adminUser?.phone && adminUser.phone.trim()) return adminUser.phone
    return 'Administrateur'
  }, [adminUser])

  const handleLogout = () => {
    sessionStorage.removeItem('fasocare_admin_token')
    sessionStorage.removeItem('fasocare_admin_user')
    window.location.href = '/login'
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest uppercase text-slate-400">Vérification d'accès</p>
          <p className="mt-2 text-white font-black">Chargement sécurisé...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <aside className="w-80 bg-slate-900 text-white flex flex-col m-5 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800">
        <div className="p-12">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fasocare-gradient border border-white/20 shadow-xl shadow-emerald-900/40">
              <FasoCareIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tighter block leading-none">FasoCare</span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-500 mt-1 block">Supervision</span>
            </div>
          </div>
          <div className="mt-10 flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Monitoring Actif</span>
          </div>
        </div>

        <nav className="flex-1 px-8 space-y-3">
          <SidebarLink href="/admin/dashboard" icon={LayoutDashboard} label="Tableau de Bord" active={pathname === '/admin/dashboard'} />
          <SidebarLink href="/admin/users" icon={Users} label="Accréditations" color="blue" active={pathname === '/admin/users'} />
          <SidebarLink href="/admin/map" icon={Map} label="Carte Sanitaire" color="yellow" active={pathname === '/admin/map'} />
          <SidebarLink href="/admin/reports" icon={FileText} label="Rapports d'Activité" color="purple" active={pathname === '/admin/reports'} />
          <SidebarLink href="/admin/audit" icon={ShieldAlert} label="Gestion d'Audit" color="red" active={pathname === '/admin/audit'} />
        </nav>

        <div className="p-10 border-t border-white/5 space-y-6">
          <div className="flex flex-col items-center gap-4 py-4 bg-white/5 rounded-3xl border border-white/10">
            <div className="h-12 w-12 rounded-full border-2 border-emerald-500 p-1 bg-white">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Coat_of_arms_of_Burkina_Faso.svg" alt="Seal" className="w-full h-full object-contain" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ministère de la Santé</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center w-full p-5 text-red-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="mr-3 group-hover:-translate-x-1 transition" size={18} />
            Se Déconnecter
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pt-5 pb-5 pr-5">
        <div className="h-full bg-slate-50/50 rounded-[3.5rem] shadow-inner border border-slate-200/40 flex flex-col overflow-hidden">
          <header className="px-12 py-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 shadow-sm">
            <div>
              <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-1">Gouvernement du Burkina Faso</h1>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">Centre de Supervision National</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{displayName}</span>
                <span className="text-[9px] font-bold text-[#0d6e3f] uppercase tracking-widest mt-1">Accès ADMIN</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                <User size={24} className="text-slate-300" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

function SidebarLink({ href, icon: Icon, label, active, color }: any) {
  const colorStyles: any = {
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    red: 'text-red-400'
  }
  return (
    <Link href={href} className={`flex items-center p-5 rounded-2xl transition group ${active ? 'bg-[#0d6e3f] text-white shadow-2xl shadow-emerald-900/40 border border-white/5 animate-slide-up' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
      <Icon className={`mr-4 transition duration-300 group-hover:scale-110 ${active ? 'text-white' : (colorStyles[color] || 'text-slate-500')}`} size={22} />
      <span className="text-[11px] font-black uppercase tracking-[0.1em]">{label}</span>
    </Link>
  )
}
