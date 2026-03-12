import { useNavigate } from 'react-router-dom'
import { mockAnomalias } from '@/services/mockData'

interface Props {
  anomalias?: typeof mockAnomalias
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICO: '#EF4444',
  ALTO: '#F59E0B',
  MEDIO: '#FCD34D',
  BAJA: '#10B981',
}

export default function AlertasRecientes({ anomalias }: Props) {
  const navigate = useNavigate()
  const items = (anomalias || mockAnomalias).slice(0, 5)

  return (
    <div className="bg-bg-surface border border-white/5 rounded-xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-muted">Alertas Recientes</h3>
        <button
          onClick={() => navigate('/anomalias')}
          className="text-xs text-primary hover:underline"
        >
          Ver todas →
        </button>
      </div>
      <div className="space-y-3">
        {items.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-default"
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: SEVERITY_COLORS[a.severidad] || '#94A3B8' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {a.barrio.replace(/^\d+-/, '')}
              </p>
              <p className="text-xs text-text-muted">
                {a.uso} · {a.fecha}
              </p>
            </div>
            <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
              {(a.consumo_litros / 1_000_000).toFixed(1)} ML
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
