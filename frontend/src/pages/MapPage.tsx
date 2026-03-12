import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip } from 'react-leaflet'
import { getBarrioCoords, ALICANTE_CENTER, ALICANTE_ZOOM } from '@/utils/alicante-barrios'
import { getConsumoPorZona } from '@/services/api'
import { mockPorZona } from '@/services/mockData'
import { Map as MapIcon, Loader2 } from 'lucide-react'

interface ZonaData {
  barrio: string
  consumo_total: number
  consumo_medio: number
  n_contratos_total: number
  n_registros: number
}

function getColor(ratio: number): string {
  if (ratio > 0.8) return '#EF4444'
  if (ratio > 0.6) return '#FB923C'
  if (ratio > 0.4) return '#F59E0B'
  if (ratio > 0.2) return '#10B981'
  return '#0EA5E9'
}

function getRadius(consumo: number, max: number): number {
  const ratio = consumo / max
  return 15 + ratio * 30
}

export default function MapPage() {
  const [zonas, setZonas] = useState<ZonaData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConsumoPorZona()
      .then((data) => setZonas(data))
      .catch(() => setZonas(mockPorZona))
      .finally(() => setLoading(false))
  }, [])

  const maxConsumo = useMemo(
    () => Math.max(...zonas.map((z) => z.consumo_total), 1),
    [zonas]
  )

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
        <MapIcon className="w-7 h-7 text-primary" />
        <h2 className="text-2xl font-bold">Mapa de Consumo por Barrio</h2>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-white/5" style={{ height: '70vh' }}>
        <MapContainer
          center={ALICANTE_CENTER}
          zoom={ALICANTE_ZOOM}
          className="w-full h-full"
          style={{ background: '#0F172A' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {zonas.map((zona) => {
            const coords = getBarrioCoords(zona.barrio)
            if (!coords) return null
            const ratio = zona.consumo_total / maxConsumo
            return (
              <CircleMarker
                key={zona.barrio}
                center={[coords.lat, coords.lng]}
                radius={getRadius(zona.consumo_total, maxConsumo)}
                pathOptions={{
                  color: '#fff',
                  weight: 2,
                  fillColor: getColor(ratio),
                  fillOpacity: 0.7,
                }}
              >
                <LeafletTooltip direction="top" className="!bg-bg-surface !border-white/10 !text-text-primary !rounded-lg !text-xs">
                  <strong>{coords.nombre}</strong>: {(zona.consumo_total / 1_000_000).toFixed(0)} ML
                </LeafletTooltip>
                <Popup className="!rounded-xl">
                  <div className="text-sm space-y-1 min-w-[180px]" style={{ color: '#F8FAFC' }}>
                    <p className="font-bold text-base">{coords.nombre}</p>
                    <p>Consumo total: <strong>{(zona.consumo_total / 1_000_000).toFixed(1)} ML</strong></p>
                    <p>Media mensual: {(zona.consumo_medio / 1_000_000).toFixed(1)} ML</p>
                    <p>Contratos: {zona.n_contratos_total.toLocaleString('es-ES')}</p>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-bg-surface/90 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <p className="text-xs font-semibold text-text-muted mb-2">Nivel de Consumo</p>
          <div className="flex items-center gap-1 mb-1">
            {['#0EA5E9', '#10B981', '#F59E0B', '#FB923C', '#EF4444'].map((c) => (
              <div key={c} className="w-6 h-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>Bajo</span>
            <span>Alto</span>
          </div>
        </div>
      </div>
    </div>
  )
}
