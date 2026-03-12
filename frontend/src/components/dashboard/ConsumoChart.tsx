import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  data: Array<{ fecha: string; consumo_litros: number }> | null
}

export default function ConsumoChart({ data }: Props) {
  if (!data || data.length === 0) return null

  const formatted = data.map((d) => ({
    ...d,
    label: formatMonth(d.fecha),
    consumo: d.consumo_litros,
  }))

  return (
    <div className="bg-bg-surface border border-white/5 rounded-xl p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-text-muted mb-4">Evolución del Consumo</h3>
      <div style={{ width: '100%', minHeight: 320 }}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="gradConsumo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={5}
            />
            <YAxis
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v / 1_000_000).toFixed(0) + 'M'}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid rgba(14,165,233,0.3)',
                borderRadius: '8px',
                color: '#F8FAFC',
                fontSize: '13px',
              }}
              formatter={(v: any) => [Number(v).toLocaleString('es-ES') + ' L', 'Consumo']}
              labelFormatter={(l) => `Periodo: ${l}`}
            />
            <Area
              type="monotone"
              dataKey="consumo"
              stroke="#0EA5E9"
              strokeWidth={2}
              fill="url(#gradConsumo)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function formatMonth(fecha: string): string {
  const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const parts = fecha.split('-')
  const m = parseInt(parts[1] || '1')
  const y = (parts[0] || '').slice(2)
  return `${meses[m]} ${y}`
}
