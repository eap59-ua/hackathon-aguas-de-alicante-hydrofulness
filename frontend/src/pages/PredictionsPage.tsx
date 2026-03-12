import { useState, useEffect, useMemo } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { TrendingUp, Loader2 } from 'lucide-react'
import StressGauge from '@/components/charts/StressGauge'
import { getPrediccionConsumo, getRankingEstres, getBarriosDisponibles } from '@/services/api'
import { mockSerieTemporal, mockEstresHidrico } from '@/services/mockData'

const MESES_NOMBRE = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatMonth(fecha: string): string {
  const [y, m] = fecha.split('-')
  return `${MESES_NOMBRE[parseInt(m || '1')]} ${(y || '').slice(2)}`
}

const SCENARIOS = [
  { id: 'optimista', label: '🟢 Optimista', factor: 0.9, color: '#10B981' },
  { id: 'base', label: '🟡 Base', factor: 1.0, color: '#F59E0B' },
  { id: 'pesimista', label: '🔴 Pesimista', factor: 1.15, color: '#EF4444' },
] as const

export default function PredictionsPage() {
  const [barrios, setBarrios] = useState<string[]>([])
  const [selectedBarrio, setSelectedBarrio] = useState('')
  const [scenario, setScenario] = useState<string>('base')
  const [chartData, setChartData] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stressValue, setStressValue] = useState(0.85)

  // Load barrios list
  useEffect(() => {
    getBarriosDisponibles()
      .then((r) => {
        setBarrios(r.barrios || [])
        if (r.barrios?.length) setSelectedBarrio(r.barrios[0])
      })
      .catch(() => {
        const fallback = ['01-CENTRO', '10-FLORIDA BAJA', '12-POLIGONO BABEL']
        setBarrios(fallback)
        setSelectedBarrio(fallback[0])
      })
  }, [])

  // Load prediction data
  useEffect(() => {
    if (!selectedBarrio) return
    setLoading(true)
    Promise.all([
      getPrediccionConsumo(selectedBarrio, 12).catch(() => null),
      getRankingEstres(10).catch(() => null),
    ]).then(([pred, rank]) => {
      if (pred?.datos) {
        setChartData(pred.datos)
      } else {
        setChartData(mockSerieTemporal.map((d) => ({
          ds: d.fecha + '-01',
          yhat: d.consumo_litros,
          yhat_lower: d.consumo_litros * 0.85,
          yhat_upper: d.consumo_litros * 1.15,
        })))
      }
      if (rank?.ranking) {
        setRanking(rank.ranking)
        const current = rank.ranking.find((r: any) => r.barrio === selectedBarrio)
        if (current) setStressValue(current.valor)
      } else {
        setRanking(mockEstresHidrico)
      }
    }).finally(() => setLoading(false))
  }, [selectedBarrio])

  const scenarioFactor = SCENARIOS.find((s) => s.id === scenario)?.factor || 1.0

  const processedData = useMemo(() => {
    const totalHistorical = chartData.filter((d) => d.yhat === d.yhat_lower && d.yhat === d.yhat_upper).length
    return chartData.map((d, i) => {
      const isForecast = i >= totalHistorical || (d.yhat_upper !== d.yhat)
      return {
        ...d,
        label: formatMonth(d.ds),
        historical: isForecast ? null : d.yhat,
        forecast: isForecast ? d.yhat * scenarioFactor : null,
        upper: isForecast ? d.yhat_upper * scenarioFactor : null,
        lower: isForecast ? d.yhat_lower * scenarioFactor : null,
      }
    })
  }, [chartData, scenarioFactor])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-7 h-7 text-primary" />
        <h2 className="text-2xl font-bold">Predicciones y Escenarios</h2>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={selectedBarrio}
          onChange={(e) => setSelectedBarrio(e.target.value)}
          className="bg-bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-text-primary"
        >
          {barrios.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <div className="flex gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenario(s.id)}
              className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                scenario === s.id
                  ? 'border-current bg-white/5'
                  : 'border-white/10 text-text-muted hover:text-text-primary'
              }`}
              style={scenario === s.id ? { color: s.color, borderColor: s.color } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart + Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-bg-surface border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-muted mb-4">Proyección de Consumo</h3>
          <div style={{ width: '100%', minHeight: 400 }}>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={processedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={false} interval={5} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => (v / 1_000_000).toFixed(0) + 'M'} width={50} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(14,165,233,0.3)', borderRadius: '8px', color: '#F8FAFC', fontSize: '12px' }}
                  formatter={(v: any) => [v ? (Number(v) / 1_000_000).toFixed(1) + ' ML' : '-', '']}
                />
                <Area type="monotone" dataKey="historical" stroke="#0EA5E9" strokeWidth={2} fill="url(#gradHist)" dot={false} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="#0EA5E9" fillOpacity={0.08} />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#0F172A" fillOpacity={1} />
                <Line type="monotone" dataKey="forecast" stroke="#60A5FA" strokeWidth={2} strokeDasharray="8 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <StressGauge value={stressValue * scenarioFactor} />
      </div>

      {/* Ranking table */}
      <div className="bg-bg-surface border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-muted mb-4">Top 10 — Mayor Estrés Hídrico</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 px-3 text-text-muted font-medium">#</th>
                <th className="text-left py-2 px-3 text-text-muted font-medium">Barrio</th>
                <th className="text-right py-2 px-3 text-text-muted font-medium">IEH</th>
                <th className="text-center py-2 px-3 text-text-muted font-medium">Nivel</th>
              </tr>
            </thead>
            <tbody>
              {ranking.slice(0, 10).map((r: any, i: number) => (
                <tr key={r.barrio} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-3 text-text-muted">{i + 1}</td>
                  <td className="py-2 px-3 font-medium">{r.barrio}</td>
                  <td className="py-2 px-3 text-right font-semibold">{typeof r.valor === 'number' ? r.valor.toFixed(2) : (r.indice || 0).toFixed(2)}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: (r.color_hex || '#64748B') + '1A',
                        color: r.color_hex || '#64748B',
                      }}
                    >
                      {r.nivel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
