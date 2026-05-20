'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FasoCareIcon } from "@/components/fasocare/icons"
import { Smartphone, LogIn, Shield, Activity, Globe, Award, ChevronRight, CheckCircle2, UserCheck, Stethoscope } from 'lucide-react'
import translations from '../public/locales/all.json'

type Language = 'fr' | 'mo' | 'di' | 'fu';

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('fr')

  const t = (key: string) => (translations[lang] as any)[key] || (translations['fr'] as any)[key]

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden relative">
      {/* Background Blobs for Glass UI effect */}
      <div className="blob bg-emerald-400/20 top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply"></div>
      <div className="blob bg-teal-400/20 top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-multiply" style={{ animationDelay: '2s' }}></div>
      <div className="blob bg-blue-400/20 bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full mix-blend-multiply" style={{ animationDelay: '4s' }}></div>

      {/* Futuristic Navbar */}
      <nav className="fixed w-full top-0 z-50 transition-all duration-300">
        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-premium rounded-3xl px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[10px] opacity-20"></div>
                <FasoCareIcon className="h-10 w-10 text-[#0d6e3f] relative z-10" />
              </div>
              <div>
                 <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none">FasoCare</p>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">Gouvernement</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-white/40 shadow-inner">
                {(['fr', 'mo', 'di', 'fu'] as const).map((l) => (
                  <button 
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-5 py-2 rounded-full text-[11px] font-extrabold uppercase transition-all duration-300 ${lang === l ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md' : 'text-slate-500 hover:text-emerald-700'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Link href="/admin/dashboard" className="group flex items-center gap-2 bg-white/60 hover:bg-white backdrop-blur-md px-5 py-3 rounded-full border border-white/60 shadow-sm transition-all text-xs font-bold text-slate-700">
                 <Shield size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" /> Espace Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-40 pb-24 md:pt-52 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Header Area */}
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-emerald-100/50 text-emerald-800 rounded-full border border-emerald-200/50 backdrop-blur-sm text-xs font-black uppercase tracking-[0.2em] shadow-sm">
               <Award size={16} className="text-emerald-600" /> Plateforme Nationale de Santé Numérique
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.05] tracking-tighter text-glow-emerald">
               {t('hero_title').replace('FasoCare', '')} 
               <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">
                 FasoCare.
               </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
               {t('hero_subtitle')}
            </p>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-24">
            
            {/* Citoyens Card */}
            <div className="glass-premium p-10 lg:p-14 rounded-[3rem] animate-slide-up delay-100 group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                  <UserCheck size={180} />
               </div>
               
               <div className="relative z-10">
                 <div className="inline-flex items-center justify-center h-16 w-16 bg-white rounded-2xl shadow-xl text-emerald-600 mb-8 transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                    <Smartphone size={32} />
                 </div>
                 
                 <h3 className="text-3xl font-black text-slate-800 mb-4">Citoyens & Familles</h3>
                 <p className="text-slate-600 font-medium mb-10 leading-relaxed text-lg max-w-md">
                   Accédez à vos dossiers médicaux, suivez les carnets de vaccination de vos enfants, et localisez les pharmacies de garde en un seul clic.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <button className="flex-1 bg-slate-900 text-white px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl hover:shadow-emerald-900/20 flex items-center justify-center gap-3">
                       Google Play
                    </button>
                    <button className="flex-1 bg-white text-slate-900 px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg flex items-center justify-center gap-3 border border-slate-200">
                       App Store
                    </button>
                 </div>

                 {/* USSD Highlight */}
                 <div className="bg-emerald-50/80 backdrop-blur-sm p-6 rounded-3xl border border-emerald-100/50 flex items-center gap-6">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">USSD</div>
                    <div>
                       <p className="text-sm font-bold text-slate-600">Accès d'urgence hors ligne</p>
                       <p className="text-3xl font-black text-emerald-700 tracking-tighter">*222#</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Professionnels Card */}
            <div className="relative p-10 lg:p-14 rounded-[3rem] animate-slide-up delay-200 group overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
               
               <div className="relative z-10 flex flex-col h-full">
                 <div className="inline-flex items-center justify-center h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl text-emerald-400 mb-8 border border-white/20 transform rotate-6 group-hover:rotate-0 transition-transform duration-300">
                    <Stethoscope size={32} />
                 </div>
                 
                 <h3 className="text-3xl font-black text-white mb-4">Professionnels de Santé</h3>
                 <p className="text-slate-300 font-medium mb-10 leading-relaxed text-lg max-w-md">
                   Médecins, Pharmaciens et Centres de santé : gérez vos consultations, vos alertes sanitaires et vos ordonnances sécurisées.
                 </p>
                 
                 <ul className="space-y-4 mb-12">
                   {['Dossier Patient Informatisé', 'E-Prescription Sécurisée QR', 'Alertes Rapides Épidémiques'].map(feature => (
                     <li key={feature} className="flex items-center gap-3 text-slate-300 font-medium">
                       <CheckCircle2 size={20} className="text-emerald-400" /> {feature}
                     </li>
                   ))}
                 </ul>

                 <div className="mt-auto pt-4">
                   <Link href="/login" className="inline-flex items-center justify-between w-full bg-emerald-500 text-white px-8 py-6 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                      <span>Accéder au Portail Pro</span>
                      <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                         <ChevronRight size={20} />
                      </div>
                   </Link>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* Elegant Footer */}
      <footer className="relative bg-white border-t border-slate-100 overflow-hidden pt-24 pb-12">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-50/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-white p-3 rounded-full shadow-lg border border-slate-100">
                 <Image 
                   src="https://upload.wikimedia.org/wikipedia/commons/9/96/Coat_of_arms_of_Burkina_Faso.svg" 
                   alt="Armoiries Burkina Faso" 
                   width={80} height={80} 
                   className="object-contain"
                 />
              </div>
              <div>
                 <p className="text-xl font-black text-slate-900 tracking-tighter">Ministère de la Santé</p>
                 <p className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em]">Burkina Faso</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
               <a href="#" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Confidentialité</a>
               <a href="#" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Mentions Légales</a>
               <a href="#" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-center">
               © {new Date().getFullYear()} FasoCare - GOUVERNEMENT DU BURKINA FASO
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
