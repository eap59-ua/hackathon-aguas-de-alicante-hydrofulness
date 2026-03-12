/**
 * mockData.ts — Datos mock realistas para desarrollo sin backend.
 *
 * Basados en barrios reales de Alicante, 36 meses (2022-2024),
 * con estacionalidad real (verano +40%) y anomalías distribuidas.
 */

const BARRIOS = [
  '01-CENTRO', '02-ENSANCHE-DIPUTACION', '05-BENALUA', '06-CAROLINAS',
  '08-CAMPOAMOR', '10-FLORIDA BAJA', '12-POLIGONO BABEL',
  '14-ALTOZANO-CONDE LUMIARES', '20-SAN GABRIEL', '25-VILLAFRANQUEZA',
  '30-PAU', '35-CABO HUERTAS',
]

const MESES = (() => {
  const m: string[] = []
  for (let y = 2022; y <= 2024; y++)
    for (let mo = 1; mo <= 12; mo++)
      m.push(`${y}-${String(mo).padStart(2, '0')}`)
  return m
})()

const ESTACIONALIDAD: Record<number, number> = {
  1: 0.75, 2: 0.78, 3: 0.85, 4: 0.95, 5: 1.05, 6: 1.15,
  7: 1.40, 8: 1.45, 9: 1.20, 10: 0.95, 11: 0.80, 12: 0.72,
}

export function genSerie(base: number) {
  return MESES.map((m) => {
    const mes = parseInt(m.split('-')[1])
    const factor = ESTACIONALIDAD[mes]
    const ruido = 0.9 + Math.random() * 0.2
    return {
      fecha: m,
      consumo_litros: Math.round(base * factor * ruido),
    }
  })
}

// ── KPIs ─────────────────────────────────────────────────────

export const mockResumen = {
  consumo_total: 45_414_150_638,
  consumo_medio_mensual: 1_261_504_184,
  tendencia_pct: 2.26,
  total_registros: 5796,
  total_barrios: 57,
  fecha_min: '2022-01-31',
  fecha_max: '2024-12-31',
}

// ── Serie temporal ───────────────────────────────────────────

export const mockSerieTemporal = MESES.map((m) => {
  const mes = parseInt(m.split('-')[1])
  const base = 1_200_000_000
  const factor = ESTACIONALIDAD[mes]
  const ruido = 0.95 + Math.random() * 0.1
  return {
    fecha: m,
    consumo_litros: Math.round(base * factor * ruido),
    consumo_por_contrato: Math.round(5500 * factor * ruido),
    media_movil_3m: Math.round(base * factor * 0.98),
  }
})

// ── Por tipología ────────────────────────────────────────────

export const mockTipologia = [
  { uso: 'DOMESTICO', consumo_total: 35_121_260_000, porcentaje: 77.34, n_registros: 1932 },
  { uso: 'NO DOMESTICO', consumo_total: 9_041_780_000, porcentaje: 19.91, n_registros: 1932 },
  { uso: 'COMERCIAL', consumo_total: 1_251_109_000, porcentaje: 2.75, n_registros: 1932 },
]

// ── Por zona ─────────────────────────────────────────────────

const BASES_BARRIO: Record<string, number> = {
  '01-CENTRO': 850_000_000,
  '02-ENSANCHE-DIPUTACION': 620_000_000,
  '05-BENALUA': 540_000_000,
  '06-CAROLINAS': 480_000_000,
  '08-CAMPOAMOR': 720_000_000,
  '10-FLORIDA BAJA': 950_000_000,
  '12-POLIGONO BABEL': 1_100_000_000,
  '14-ALTOZANO-CONDE LUMIARES': 420_000_000,
  '20-SAN GABRIEL': 380_000_000,
  '25-VILLAFRANQUEZA': 280_000_000,
  '30-PAU': 520_000_000,
  '35-CABO HUERTAS': 450_000_000,
}

export const mockPorZona = BARRIOS.map((b) => ({
  barrio: b,
  consumo_total: (BASES_BARRIO[b] || 500_000_000) * 36,
  consumo_medio: BASES_BARRIO[b] || 500_000_000,
  n_contratos_total: Math.round((BASES_BARRIO[b] || 500_000_000) / 5000),
  n_registros: 108,
}))

// ── Anomalías ────────────────────────────────────────────────

export const mockAnomaliasResumen = {
  total_anomalias: 373,
  por_severidad: { ALTO: 248, CRITICO: 125 },
  por_barrio: {
    '12-POLIGONO BABEL': 22,
    '10-FLORIDA BAJA': 18,
    '08-CAMPOAMOR': 16,
    '01-CENTRO': 14,
    '06-CAROLINAS': 12,
  },
}

export const mockAnomalias = [
  { barrio: '12-POLIGONO BABEL', uso: 'NO DOMESTICO', fecha: '2024-07-31', consumo_litros: 58_000_000, severidad: 'CRITICO', n_contratos: 264 },
  { barrio: '10-FLORIDA BAJA', uso: 'DOMESTICO', fecha: '2024-08-31', consumo_litros: 45_000_000, severidad: 'ALTO', n_contratos: 4665 },
  { barrio: '08-CAMPOAMOR', uso: 'COMERCIAL', fecha: '2023-07-31', consumo_litros: 3_200_000, severidad: 'ALTO', n_contratos: 91 },
  { barrio: '01-CENTRO', uso: 'DOMESTICO', fecha: '2024-06-30', consumo_litros: 38_000_000, severidad: 'ALTO', n_contratos: 3200 },
  { barrio: '06-CAROLINAS', uso: 'NO DOMESTICO', fecha: '2023-08-31', consumo_litros: 22_000_000, severidad: 'CRITICO', n_contratos: 520 },
]

// ── Estrés hídrico ───────────────────────────────────────────

export const mockEstresHidrico = BARRIOS.map((b) => {
  const indice = 0.5 + Math.random() * 1.2
  const nivel = indice < 0.7 ? 'BAJO' : indice < 1.0 ? 'MODERADO' : indice < 1.3 ? 'ALTO' : 'CRITICO'
  const color = { BAJO: '#10B981', MODERADO: '#F59E0B', ALTO: '#FB923C', CRITICO: '#EF4444' }[nivel]
  return { barrio: b, indice: Math.round(indice * 100) / 100, nivel, color_hex: color }
})
