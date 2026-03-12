import { useState } from 'react'
import { AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react'

const MOCK_ANOMALIAS = [
  { id: 1, barrio: "12-PLAYA SAN JUAN", fecha: "2024-07-31", consumo_litros: 892000, consumo_esperado: 420000, desviacion_pct: 112.4, severidad: "CRITICA", tipo: "Pico de consumo estival" },
  { id: 2, barrio: "01-CENTRO", fecha: "2024-08-31", consumo_litros: 654000, consumo_esperado: 380000, desviacion_pct: 72.1, severidad: "ALTA", tipo: "Consumo anómalo nocturno" },
  { id: 3, barrio: "06-CAROLINAS", fecha: "2024-06-30", consumo_litros: 523000, consumo_esperado: 340000, desviacion_pct: 53.8, severidad: "MEDIA", tipo: "Variación brusca mensual" },
  { id: 4, barrio: "30-PAU", fecha: "2024-09-30", consumo_litros: 478000, consumo_esperado: 310000, desviacion_pct: 54.2, severidad: "ALTA", tipo: "Pico post-verano" },
  { id: 5, barrio: "08-CAMPOAMOR", fecha: "2024-07-31", consumo_litros: 412000, consumo_esperado: 290000, desviacion_pct: 42.1, severidad: "MEDIA", tipo: "Patrón inusual de riego" },
  { id: 6, barrio: "35-CABO HUERTAS", fecha: "2024-08-31", consumo_litros: 567000, consumo_esperado: 350000, desviacion_pct: 62.0, severidad: "ALTA", tipo: "Consumo turístico elevado" },
  { id: 7, barrio: "25-VILLAFRANQUEZA", fecha: "2024-05-31", consumo_litros: 298000, consumo_esperado: 220000, desviacion_pct: 35.5, severidad: "BAJA", tipo: "Ligera desviación" },
]

export default function AnomaliesPage() {
  const [anomalias] = useState(MOCK_ANOMALIAS)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          Centro de Anomalías
        </h1>
        <p className="text-text-muted mt-1">Detección de patrones atípicos y posibles fugas por barrio</p>
      </div>

      <div className="bg-bg-surface border border-white/5 rounded-xl overflow-hidden">
         <table className="w-full text-left text-sm">
           <thead className="bg-bg-dark text-xs uppercase text-text-muted sticky top-0">
             <tr>
               <th className="px-6 py-4 font-semibold">Severidad</th>
               <th className="px-6 py-4 font-semibold">Barrio</th>
               <th className="px-6 py-4 font-semibold">Tipo de Anomalía</th>
               <th className="px-6 py-4 font-semibold text-right">Desviación</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
             {anomalias.map((item) => (
               <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                 <td className="px-6 py-4">
                   <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                     item.severidad === 'CRITICA' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                     item.severidad === 'ALTA' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                     item.severidad === 'MEDIA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                     'bg-white/5 text-text-muted border-white/10'
                   }`}>
                     {item.severidad === 'CRITICA' ? <ShieldAlert className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                     {item.severidad}
                   </div>
                 </td>
                 <td className="px-6 py-4 font-semibold text-white">{item.barrio}</td>
                 <td className="px-6 py-4 text-text-muted">{item.tipo}</td>
                 <td className="px-6 py-4 text-right font-mono font-bold text-rose-400">+{item.desviacion_pct.toFixed(1)}%</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  )
}
