/**
 * useDashboardData.ts — Hook para cargar datos del dashboard en paralelo.
 * 
 * Hace fetch a 5 endpoints simultáneamente.
 * Si el backend falla, carga datos mock automáticamente.
 * Refresca cada 5 minutos.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getResumen,
  getSerieTemporal,
  getConsumoPorTipologia,
  getConsumoPorZona,
  getAnomaliasResumen,
} from '@/services/api'
import {
  mockResumen,
  mockSerieTemporal,
  mockTipologia,
  mockPorZona,
  mockAnomaliasResumen,
} from '@/services/mockData'

interface DashboardData {
  resumen: typeof mockResumen | null
  serieTemporal: typeof mockSerieTemporal | null
  tipologia: typeof mockTipologia | null
  porZona: typeof mockPorZona | null
  anomaliasResumen: typeof mockAnomaliasResumen | null
}

export function useDashboardData(period: string = 'Todo') {
  const [data, setData] = useState<DashboardData>({
    resumen: null,
    serieTemporal: null,
    tipologia: null,
    porZona: null,
    anomaliasResumen: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMock, setUsingMock] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const anio = period === 'Todo' ? undefined : period
      const [resumen, serie, tipologia, zona, anomalias] = await Promise.all([
        getResumen(anio),
        getSerieTemporal(undefined, undefined, anio),
        getConsumoPorTipologia(anio),
        getConsumoPorZona(anio),
        getAnomaliasResumen(anio),
      ])
      setData({ resumen, serieTemporal: serie, tipologia, porZona: zona, anomaliasResumen: anomalias })
      setUsingMock(false)
    } catch {
      console.warn('[Dashboard] Backend no disponible, usando datos mock')
      
      const filteredSerie = period === 'Todo' 
        ? mockSerieTemporal 
        : mockSerieTemporal.filter(d => d.fecha.startsWith(period))

      setData({
        resumen: mockResumen,
        serieTemporal: filteredSerie,
        tipologia: mockTipologia,
        porZona: mockPorZona,
        anomaliasResumen: mockAnomaliasResumen,
      })
      setUsingMock(true)
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    const handleRefresh = () => fetchData()
    window.addEventListener('hydrofulness:refresh', handleRefresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('hydrofulness:refresh', handleRefresh)
    }
  }, [fetchData])

  return { data, isLoading, error, usingMock, refetch: fetchData }
}
