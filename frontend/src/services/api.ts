/**
 * api.ts — Cliente Axios para la API de Hydrofulness.
 * 
 * Configurado con interceptor de errores y funciones tipadas.
 * Si el backend no responde, los hooks deben usar mockData como fallback.
 */

import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Intercept requests to avoid actual network errors when we know backend is unavailable
api.interceptors.request.use((config) => {
  if (import.meta.env.VITE_API_URL === 'mock') {
    return Promise.reject(new Error('MockFallback'))
  }
  return config
})

// Interceptor: log errores, devolver null para fallback
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.message !== 'MockFallback') {
      console.warn('[API Error]', error.message, error.config?.url)
    }
    return Promise.reject(error)
  }
)

// ── Consumos ─────────────────────────────────────────────────

export async function getResumen(anio?: string) {
  const params: Record<string, string> = {}
  if (anio) params.anio = anio
  const { data } = await api.get('/consumos/resumen', { params })
  return data
}

export async function getSerieTemporal(barrio?: string, uso?: string, anio?: string) {
  const params: Record<string, string> = {}
  if (barrio) params.barrio = barrio
  if (uso) params.uso = uso
  if (anio) params.anio = anio
  const { data } = await api.get('/consumos/serie-temporal', { params })
  return data
}

export async function getConsumoPorZona(anio?: string) {
  const params: Record<string, string> = {}
  if (anio) params.anio = anio
  const { data } = await api.get('/consumos/por-zona', { params })
  return data
}

export async function getConsumoPorTipologia(anio?: string) {
  const params: Record<string, string> = {}
  if (anio) params.anio = anio
  const { data } = await api.get('/consumos/por-tipologia', { params })
  return data
}

// ── Anomalías ────────────────────────────────────────────────

export async function getAnomalias(barrio?: string, limit = 100) {
  const params: Record<string, string | number> = { limit }
  if (barrio) params.barrio = barrio
  const { data } = await api.get('/anomalias', { params })
  return data
}

export async function getAnomaliasResumen(anio?: string) {
  const params: Record<string, string> = {}
  if (anio) params.anio = anio
  const { data } = await api.get('/anomalias/resumen', { params })
  return data
}

// ── Estrés Hídrico ───────────────────────────────────────────

export async function getEstresHidrico() {
  const { data } = await api.get('/estres-hidrico')
  return data
}

// ── Predicciones ─────────────────────────────────────────────

export async function getPrediccionConsumo(barrio: string, horizonte = 6) {
  const { data } = await api.get('/predicciones/consumo', { params: { barrio, horizonte } })
  return data
}

export async function getPrediccionAnomalias(barrio?: string) {
  const params: Record<string, string> = {}
  if (barrio) params.barrio = barrio
  const { data } = await api.get('/predicciones/anomalias', { params })
  return data
}

export async function getPrediccionEstres(barrio: string) {
  const { data } = await api.get('/predicciones/estres', { params: { barrio } })
  return data
}

export async function getRankingEstres(limit = 10) {
  const { data } = await api.get('/predicciones/estres/ranking', { params: { limit } })
  return data
}

export async function getBarriosDisponibles() {
  const { data } = await api.get('/predicciones/barrios')
  return data
}

// ── ETL ──────────────────────────────────────────────────────

export async function runETL() {
  const { data } = await api.post('/etl/run')
  return data
}

export default api
