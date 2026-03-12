import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useNavigate } from 'react-router-dom'

interface Zona {
  barrio: string
  consumo_total: number
  consumo_medio: number
  n_contratos_total: number
}

interface Props {
  data: Zona[] | null
}

export default function TopBarrios({ data }: Props) {
  const navigate = useNavigate()

  if (!data || data.length === 0) return null

  const top10 = [...data]
    .sort((a, b) => b.consumo_total - a.consumo_total)
    .slice(0, 10)
    .map((d) => ({
      ...d,
      nombre: d.barrio.replace(/^\d+-/, ''),
      consumo_ml: d.consumo_total / 1_000_000,
    }))

  const maxConsumo = Math.max(...top10.map((d) => d.consumo_ml))

  return (
    <div className="bg-bg-surface border border-white/5 rounded-xl p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-text-muted mb-4">Top 10 Barrios por Consumo</h3>
      <div style={{ width: '100%', minHeight: 320 }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={top10} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis
              type="number"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v / 1000).toFixed(0) + 'K ML'}
            />
            <YAxis
              type="category"
              dataKey="nombre"
              tick={{ fill: '#F8FAFC', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid rgba(14,165,233,0.3)',
                borderRadius: '8px',
                color: '#F8FAFC',
                fontSize: '13px',
              }}
              formatter={(v: any) => [(Number(v) / 1000).toFixed(1) + ' GL', 'Consumo']}
            />
            <Bar
              dataKey="consumo_ml"
              radius={[0, 6, 6, 0]}
              cursor="pointer"
              onClick={(entry: any) => navigate(`/mapa?barrio=${entry.barrio}`)}
              animationDuration={800}
            >
              {top10.map((_, i) => {
                const ratio = top10[i].consumo_ml / maxConsumo
                const color = ratio > 0.8 ? '#0EA5E9' : ratio > 0.5 ? '#10B981' : '#64748B'
                return <Cell key={i} fill={color} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
