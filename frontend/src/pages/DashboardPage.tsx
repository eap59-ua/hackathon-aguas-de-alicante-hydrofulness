import { useDashboardData } from '@/hooks/useDashboardData'
import KPICards from '@/components/dashboard/KPICards'
import ConsumoChart from '@/components/dashboard/ConsumoChart'
import DistribucionChart from '@/components/dashboard/DistribucionChart'
import TopBarrios from '@/components/dashboard/TopBarrios'
import AlertasRecientes from '@/components/dashboard/AlertasRecientes'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'

export default function DashboardPage() {
  const { activePeriod } = useOutletContext<{activePeriod: string}>() || { activePeriod: 'Todo' }
  const { data, isLoading, usingMock } = useDashboardData(activePeriod)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-primary" />
          <h2 className="text-2xl font-bold">Panel Principal</h2>
        </div>
        {usingMock && (
          <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
            Datos mock
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <KPICards resumen={data.resumen} anomalias={data.anomaliasResumen} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ConsumoChart data={data.serieTemporal} />
        </div>
        <div>
          <DistribucionChart data={data.tipologia} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopBarrios data={data.porZona} />
        </div>
        <div>
          <AlertasRecientes />
        </div>
      </div>
    </div>
  )
}
