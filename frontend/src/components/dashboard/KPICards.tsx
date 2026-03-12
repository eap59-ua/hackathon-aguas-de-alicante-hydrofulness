import { useEffect, useState } from 'react'
import { Droplets, BarChart, Activity, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

interface KPI {
  label: string
  value: number
  format: (v: number) => string
  icon: React.ElementType
  color: string
  trend?: number
}

interface Props {
  resumen: {
    consumo_total: number
    consumo_medio_mensual: number
    tendencia_pct: number
    total_registros: number
    total_barrios: number
  } | null
  anomalias: { total_anomalias: number } | null
}

function formatML(v: number): string {
  return (v / 1_000_000).toFixed(1) + ' ML'
}

function formatNum(v: number): string {
  return v.toLocaleString('es-ES')
}

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let animationFrameId: number
    const start = performance.now()
    const initialValue = current

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(initialValue + (target - initialValue) * eased)
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }
    
    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [target, duration]) // eslint-disable-line react-hooks/exhaustive-deps

  if (target > 1_000_000) return <>{formatML(current)}</>
  return <>{current < 1000 ? current.toFixed(1) : formatNum(Math.round(current))}</>
}

export default function KPICards({ resumen, anomalias }: Props) {
  const kpis: KPI[] = [
    {
      label: 'Consumo Total',
      value: resumen?.consumo_total ?? 0,
      format: formatML,
      icon: Droplets,
      color: '#0EA5E9',
      trend: resumen?.tendencia_pct,
    },
    {
      label: 'Media por Contrato',
      value: resumen ? Math.round(resumen.consumo_medio_mensual / (resumen.total_barrios || 1)) : 0,
      format: (v) => formatNum(v) + ' L',
      icon: BarChart,
      color: '#10B981',
    },
    {
      label: 'Índice de Estrés',
      value: resumen?.tendencia_pct ? Math.abs(resumen.tendencia_pct * 10) : 0,
      format: (v) => v.toFixed(1),
      icon: Activity,
      color: '#F59E0B',
    },
    {
      label: 'Anomalías Detectadas',
      value: anomalias?.total_anomalias ?? 0,
      format: (v) => formatNum(Math.round(v)),
      icon: AlertTriangle,
      color: (anomalias?.total_anomalias ?? 0) > 10 ? '#EF4444' : '#F59E0B',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className="bg-bg-surface border border-white/5 rounded-xl p-5 animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: kpi.color + '1A' }}
            >
              <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
            </div>
            {kpi.trend !== undefined && (
              <span className={`flex items-center gap-1 text-xs font-medium ${kpi.trend >= 0 ? 'text-danger' : 'text-secondary'}`}>
                {kpi.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(kpi.trend).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-text-primary mb-1">
            <AnimatedNumber target={kpi.value} />
          </div>
          <p className="text-sm text-text-muted">{kpi.label}</p>
        </div>
      ))}
    </div>
  )
}
