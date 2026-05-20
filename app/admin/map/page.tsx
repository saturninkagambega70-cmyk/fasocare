"use client"

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Info, AlertTriangle, Truck, Activity, RefreshCw, Flame, Package, Bug, ShieldCheck, Thermometer } from 'lucide-react'
import { toast } from 'sonner'
import { statsAPI } from '@/lib/api'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false })

const CITIES = [
  { id: '1', name: 'Ouagadougou', lat: 12.3714, lng: -1.5197, status: 'NORMAL', level: '100%', region: 'Centre', cases: 0, intensity: 0, severity: 'NORMAL', diseases: [] },
  { id: '2', name: 'Bobo-Dioulasso', lat: 11.1772, lng: -4.2969, status: 'ALERT', level: '45%', region: 'Hauts-Bassins', cases: 15, intensity: 0.5, severity: 'MODERATE', diseases: ['Dengue'] },
  { id: '3', name: 'Koudougou', lat: 12.2513, lng: -2.3627, status: 'NORMAL', level: '92%', region: 'Centre-Ouest', cases: 0, intensity: 0, severity: 'NORMAL', diseases: [] },
  { id: '4', name: 'Kaya', lat: 13.0917, lng: -1.0844, status: 'CRITICAL', level: '12%', region: 'Centre-Nord', cases: 42, intensity: 0.8, severity: 'CRITICAL', diseases: ['Paludisme', 'Dengue'] },
  { id: '5', name: "Fada N'Gourma", lat: 12.0588, lng: 0.3556, status: 'NORMAL', level: '88%', region: 'Est', cases: 0, intensity: 0, severity: 'NORMAL', diseases: [] },
  { id: '6', name: 'Banfora', lat: 10.6333, lng: -4.7667, status: 'NORMAL', level: '95%', region: 'Cascades', cases: 0, intensity: 0, severity: 'NORMAL', diseases: [] },
  { id: '7', name: 'Dédougou', lat: 12.4667, lng: -3.4667, status: 'ALERT', level: '30%', region: 'Boucle du Mouhoun', cases: 8, intensity: 0.3, severity: 'MODERATE', diseases: ['Paludisme'] },
  { id: '8', name: 'Ouahigouya', lat: 13.5833, lng: -2.4167, status: 'NORMAL', level: '78%', region: 'Nord', cases: 0, intensity: 0, severity: 'NORMAL', diseases: [] },
  { id: '9', name: 'Dori', lat: 14.0333, lng: -0.0333, status: 'NORMAL', level: '85%', region: 'Sahel', cases: 0, intensity: 0, severity: 'NORMAL', diseases: [] },
  { id: '10', name: 'Gaoua', lat: 10.3333, lng: -3.1833, status: 'NORMAL', level: '90%', region: 'Sud-Ouest', cases: 0, intensity: 0, severity: 'NORMAL', diseases: [] },
]

type ViewMode = 'logistics' | 'epidemiology'

export default function HealthMap() {
  const [selected, setSelected] = useState<any>(null)
  const [cities, setCities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('logistics')
  const [heatmapData, setHeatmapData] = useState<any>(null)
  const [heatmapLoading, setHeatmapLoading] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [leaflet, setLeaflet] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([L]) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      setLeaflet(L)
      setLeafletLoaded(true)
    })
  }, [])

  const fetchMapData = async () => {
    try {
      setLoading(true)
      const res = await statsAPI.getMapData()
      if (res.data?.data) {
        setCities(res.data.data.map((c: any) => ({ ...CITIES.find(cc => cc.id === c.id) || c, ...c })))
      } else {
        setCities(CITIES)
      }
    } catch {
      setCities(CITIES)
    } finally {
      setLoading(false)
    }
  }

  const fetchHeatmapData = async () => {
    try {
      setHeatmapLoading(true)
      const res = await statsAPI.getHeatmapData()
      if (res.data?.data) setHeatmapData(res.data.data)
    } catch {
      // ignore
    } finally {
      setHeatmapLoading(false)
    }
  }

  useEffect(() => {
    fetchMapData()
    fetchHeatmapData()
    const interval = setInterval(() => { fetchMapData(); fetchHeatmapData() }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleDeploy = () => {
    if (selected) {
      toast.success(`Logistique déployée pour ${selected.name}`, {
        description: "Le convoi médical est en préparation. Temps estimé : 24h.",
      })
    }
  }

  const focusMap = (city: any) => {
    setSelected(city)
  }

  const statusIcon = (status: string) => {
    if (status === 'CRITICAL') return '🔴'
    if (status === 'ALERT' || status === 'MODERATE') return '🟡'
    return '🟢'
  }

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#ef4444'
      case 'MODERATE': return '#f59e0b'
      default: return '#10b981'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Carte Sanitaire Nationale <span className="text-lg">🇧🇫</span>
            <button onClick={() => { fetchMapData(); fetchHeatmapData() }} className="p-2 hover:bg-slate-100 rounded-full transition">
              <RefreshCw size={18} className={`text-slate-400 ${loading || heatmapLoading ? 'animate-spin text-[#0d6e3f]' : ''}`} />
            </button>
          </h2>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">Surveillance des stocks & épidémiologie</p>
        </div>
        <div className="flex bg-slate-100 rounded-2xl p-1.5 gap-1 shadow-inner">
          <button onClick={() => setViewMode('logistics')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${
              viewMode === 'logistics' ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}>
            <Package size={14} /> Logistique
          </button>
          <button onClick={() => setViewMode('epidemiology')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${
              viewMode === 'epidemiology' ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-md shadow-red-200 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}>
            <Flame size={14} /> Épidémiologie
          </button>
        </div>
      </div>

      <div className="flex gap-6 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
        {viewMode === 'logistics' ? (
          <>
            <LegendItem color="bg-emerald-500" label="Normal" />
            <LegendItem color="bg-amber-500" label="Alerte Stock" />
            <LegendItem color="bg-red-500" label="Urgence" />
          </>
        ) : (
          <>
            <LegendItem color="bg-emerald-400" label="Faible" />
            <LegendItem color="bg-amber-400" label="Modéré" />
            <LegendItem color="bg-red-500" label="Critique" />
            <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Thermometer size={12} /> Densité des cas
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[650px]">
        <div className="lg:col-span-2 bg-slate-100 rounded-[2.5rem] border border-slate-200 relative overflow-hidden shadow-inner" style={{ minHeight: '500px' }}>
          {leafletLoaded && (
            <MapContainer center={[12.3, -1.8]} zoom={7} className="w-full h-full" style={{ minHeight: '500px', borderRadius: 'inherit' }} scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {viewMode === 'logistics' ? cities.map(city => (
                <React.Fragment key={city.id}>
                  <Marker position={[city.lat, city.lng]} eventHandlers={{ click: () => focusMap({ ...city, _view: 'logistics' }) }}>
                    <Popup>
                      <div className="font-bold text-sm">{city.name}</div>
                      <div className="text-xs">Stock: {city.level}</div>
                      <div className="text-xs">Statut: {city.status}</div>
                    </Popup>
                  </Marker>
                  <Circle center={[city.lat, city.lng]} radius={city.status === 'CRITICAL' ? 30000 : city.status === 'ALERT' ? 20000 : 10000}
                    pathOptions={{ color: severityColor(city.status), fillColor: severityColor(city.status), fillOpacity: 0.1, weight: 2 }}
                  />
                </React.Fragment>
              )) : heatmapData?.zones?.map((zone: any) => (
                <React.Fragment key={zone.id}>
                  <Circle center={[zone.lat || 12.3, zone.lng || -1.8]} radius={zone.intensity * 50000 + 15000}
                    pathOptions={{ color: severityColor(zone.severity), fillColor: severityColor(zone.severity), fillOpacity: 0.2 + zone.intensity * 0.3, weight: 2 }}
                    eventHandlers={{ click: () => focusMap({ ...zone, _view: 'epidemiology' }) }}
                  >
                    <Popup>
                      <div className="font-bold text-sm">{zone.name}</div>
                      <div className="text-xs">Cas: {zone.cases}</div>
                      <div className="text-xs">Sévérité: {zone.severity}</div>
                    </Popup>
                  </Circle>
                </React.Fragment>
              ))}
            </MapContainer>
          )}
          {!leafletLoaded && (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
              Chargement de la carte...
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex flex-col shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition duration-1000"></div>
          <div className="relative flex-1 flex flex-col">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <div className={`p-2 rounded-xl ${viewMode === 'epidemiology' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                {viewMode === 'epidemiology' ? <Bug size={18} /> : <Info size={18} />}
              </div>
              {viewMode === 'epidemiology' ? 'Données Épidémiques' : 'Outils de Supervision'}
            </h3>

            {viewMode === 'epidemiology' && heatmapData?.summary && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Cas Totaux</p>
                  <p className="text-2xl font-black text-red-600 mt-1">{heatmapData.summary.totalCases}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Zones Actives</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{heatmapData.summary.activeZones}</p>
                </div>
              </div>
            )}

            {selected ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Localité</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter mt-1">{statusIcon(selected.status || selected.severity)} {selected.name}</p>
                  {selected.region && <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2">{selected.region}</p>}
                </div>

                {selected._view === 'logistics' ? (
                  <>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveau des Stocks</p>
                        <span className="text-lg font-black text-slate-900">{selected.level}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ease-out shadow-lg ${selected.status === 'NORMAL' ? 'bg-emerald-500' : selected.status === 'ALERT' ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: selected.level }}
                        />
                      </div>
                    </div>
                    {selected.status !== 'NORMAL' && (
                      <div className="p-6 bg-red-50 text-red-700 rounded-3xl border border-red-100 border-dashed">
                        <div className="flex gap-4">
                          <AlertTriangle size={24} className="shrink-0" />
                          <div>
                            <p className="text-sm font-black uppercase">Urgence Logistique</p>
                            <p className="text-xs font-medium opacity-80 mt-1 leading-relaxed">Stock critique. Renfort nécessaire.</p>
                          </div>
                        </div>
                        <button onClick={handleDeploy}
                          className="w-full mt-6 bg-red-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-red-200 hover:bg-red-700 transition flex items-center justify-center gap-3"
                        ><Truck size={18} /> Déployer Convoi</button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CSPS Actifs</p>
                        <p className="text-xl font-black text-slate-900 mt-1">12</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Praticiens</p>
                        <p className="text-xl font-black text-slate-900 mt-1">45</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-6 bg-gradient-to-br from-red-50 to-amber-50 rounded-3xl border border-red-100 space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Nombre de Cas</p>
                        <span className="text-3xl font-black text-red-600">{selected.cases}</span>
                      </div>
                      <div className="w-full bg-red-100 h-3 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 via-red-500 to-red-600 transition-all duration-1000 ease-out shadow-lg"
                          style={{ width: `${Math.min((selected.intensity || 0) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    {selected.diseases?.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pathologies</p>
                        <div className="flex flex-wrap gap-2">
                          {selected.diseases.map((d: string) => (
                            <span key={d} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl text-center ${selected.severity === 'CRITICAL' ? 'bg-red-500 text-white' : selected.severity === 'MODERATE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest">Sévérité</p>
                      <p className="text-xl font-black mt-1">{selected.severity}</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                  <MapPin size={32} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400 italic px-10">Cliquez sur un marqueur sur la carte</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 ${color} rounded-full shadow-md`}></div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
    </div>
  )
}
