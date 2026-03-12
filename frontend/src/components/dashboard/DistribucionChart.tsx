import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface TipoConsumo {
  uso: string
  consumo_total: number
  porcentaje: number
}

interface Props {
  data: TipoConsumo[] | null
}

const COLORS: Record<string, string> = {
  DOMESTICO: '#0EA5E9',
  'NO DOMESTICO': '#F59E0B',
  COMERCIAL: '#10B981',
}

const LABELS: Record<string, string> = {
  DOMESTICO: 'Doméstico',
  'NO DOMESTICO': 'No Doméstico',
  COMERCIAL: 'Comercial',
}

export default function DistribucionChart({ data }: Props) {
  if (!data || data.length === 0) return null

  const total = data.reduce((s, d) => s + d.consumo_total, 0)

  return (
    <div className="bg-bg-surface border border-white/5 rounded-xl p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-text-muted mb-4">Distribución por Uso</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-48 h-48">
          <div style={{ width: '100%', minHeight: 192 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="consumo_total"
                  nameKey="uso"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((d) => (
                    <Cell key={d.uso} fill={COLORS[d.uso] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '13px',
                  }}
                  formatter={(v: any) => [(Number(v) / 1_000_000).toFixed(0) + ' ML', '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold">{(total / 1_000_000_000).toFixed(1)}</span>
            <span className="text-xs text-text-muted">GL total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {data.map((d) => (
            <div key={d.uso} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[d.uso] }} />
              <div>
                <p className="text-sm font-medium">{LABELS[d.uso] || d.uso}</p>
                <p className="text-xs text-text-muted">{d.porcentaje.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
