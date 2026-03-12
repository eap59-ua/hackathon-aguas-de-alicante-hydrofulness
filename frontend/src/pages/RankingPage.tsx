import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, Star, Share2, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import api from '@/services/api'

interface RankingItem {
  posicion: number
  barrio: string
  score: number
  medalla: string
  consumo_litros_contrato: number
  tendencia: number
  fortaleza: string
  area_mejora: string
}

interface RankingData {
  ranking: RankingItem[]
  media_ciudad: number
  mejor_barrio: string
  peor_barrio: string
  dato_motivacional: string
}

export default function RankingPage() {
  const [data, setData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ranking/sostenibilidad')
      .then(res => setData(res.data))
      .catch((error) => {
        console.warn("Backend no disponible. Usando mock ranking data.", error)
        const MOCK_RANKING = [
          { posicion: 1, barrio: "05-BENALUA", score: 82, medalla: "ORO", consumo_litros_contrato: 3200, tendencia: -4.2, fortaleza: "Consumo bajo y estable", area_mejora: "" },
          { posicion: 2, barrio: "14-ALTOZANO-CONDE LUMIARES", score: 76, medalla: "ORO", consumo_litros_contrato: 3450, tendencia: -2.8, fortaleza: "Tendencia positiva", area_mejora: "" },
          { posicion: 3, barrio: "01-CENTRO", score: 68, medalla: "PLATA", consumo_litros_contrato: 3800, tendencia: -1.5, fortaleza: "Pocos picos anómalos", area_mejora: "" },
          { posicion: 4, barrio: "06-CAROLINAS", score: 62, medalla: "PLATA", consumo_litros_contrato: 4100, tendencia: 0.3, fortaleza: "Consumo estable", area_mejora: "" },
          { posicion: 5, barrio: "08-CAMPOAMOR", score: 58, medalla: "BRONCE", consumo_litros_contrato: 4350, tendencia: 1.2, fortaleza: "Zona en mejora", area_mejora: "" },
          { posicion: 6, barrio: "20-SAN GABRIEL", score: 52, medalla: "BRONCE", consumo_litros_contrato: 4600, tendencia: 2.1, fortaleza: "Comercial estable", area_mejora: "" },
          { posicion: 7, barrio: "30-PAU", score: 45, medalla: "BRONCE", consumo_litros_contrato: 5100, tendencia: 3.5, fortaleza: "Zona nueva, creciendo", area_mejora: "" },
          { posicion: 8, barrio: "35-CABO HUERTAS", score: 38, medalla: "SIN_MEDALLA", consumo_litros_contrato: 5800, tendencia: 5.2, fortaleza: "Potencial de mejora", area_mejora: "" },
          { posicion: 9, barrio: "10-FLORIDA BAJA", score: 35, medalla: "SIN_MEDALLA", consumo_litros_contrato: 6100, tendencia: 4.8, fortaleza: "Zona turística", area_mejora: "" },
          { posicion: 10, barrio: "12-PLAYA SAN JUAN", score: 28, medalla: "SIN_MEDALLA", consumo_litros_contrato: 7200, tendencia: 6.1, fortaleza: "Alto potencial de ahorro", area_mejora: "" }
        ]
        setData({
          ranking: MOCK_RANKING,
          media_ciudad: 58,
          mejor_barrio: "05-BENALUA",
          peor_barrio: "12-PLAYA SAN JUAN",
          dato_motivacional: "Si todos los barrios alcanzaran el nivel de Benalúa, Alicante ahorraría 12 millones de litros al año"
        })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data || !data.ranking) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Ranking Ciudadano de Sostenibilidad
          </h1>
          <p className="text-text-muted mt-1">Descubre qué barrios lideran el consumo responsable de agua</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL IZQUIERDO: RESUMEN Y DATO MOTIVACIONAL */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-bg-surface to-primary/10 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
             <h3 className="text-sm font-semibold text-primary mb-2">Meta de Ciudad</h3>
             <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black text-white">{data.media_ciudad}</span>
                <span className="text-text-muted">/ 100 ptos</span>
             </div>
             <div className="h-3 w-full bg-bg-dark rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full" style={{ width: `${data.media_ciudad}%` }}></div>
             </div>
             <p className="text-xs text-text-muted italic">Puntuación media global de Alicante hacia la sostenibilidad hídrica.</p>
          </div>

          <div className="bg-bg-surface border border-white/5 rounded-xl p-6">
             <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
               <Star className="w-4 h-4 text-emerald-400" /> El Dato del Mes
             </h3>
             <p className="text-sm text-text-muted leading-relaxed mb-4">
               {data.dato_motivacional}
             </p>
             <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors">
               <Share2 className="w-4 h-4" /> Comparte esta meta
             </button>
          </div>

           <div className="bg-bg-surface border border-white/5 rounded-xl p-6">
             <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
               <Info className="w-4 h-4 text-primary" /> ¿Cómo se calcula?
             </h3>
             <ul className="text-xs text-text-muted space-y-3">
               <li>• <strong>Consumo:</strong> Litros per cápita y contrato.</li>
               <li>• <strong>Estabilidad:</strong> Picos de consumo anómalos.</li>
               <li>• <strong>Tendencia:</strong> Reducción respecto al año anterior.</li>
             </ul>
          </div>
        </div>

        {/* PANEL DERECHO: TABLA LEADERBOARD */}
        <div className="lg:col-span-2 bg-bg-surface border border-white/5 rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-bg-dark/30">
             <h3 className="font-semibold text-white">Clasificación por Barrios</h3>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg-dark text-xs uppercase text-text-muted sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-semibold">Pos</th>
                  <th className="px-6 py-4 font-semibold">Barrio</th>
                  <th className="px-6 py-4 font-semibold text-center">Score</th>
                  <th className="px-6 py-4 font-semibold text-right">Tendencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.ranking.map((item) => (
                  <tr key={item.barrio} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      {item.posicion === 1 ? <Trophy className="w-5 h-5 text-amber-400" /> :
                       item.posicion === 2 ? <Medal className="w-5 h-5 text-slate-300" /> :
                       item.posicion === 3 ? <Award className="w-5 h-5 text-amber-700" /> :
                       <span className="text-text-muted font-mono">{item.posicion}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white group-hover:text-primary transition-colors">{item.barrio}</p>
                      <p className="text-[10px] text-text-muted mt-1 truncate max-w-[250px]">
                        <span className="text-emerald-400">{item.fortaleza}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm bg-bg-dark border border-white/10 group-hover:border-primary/50 transition-colors">
                        {item.score}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`inline-flex items-center gap-1 font-medium ${item.tendencia < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.tendencia < 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        {Math.abs(item.tendencia).toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
