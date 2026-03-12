import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

const PERIODS = ['2022', '2023', '2024', 'Todo'] as const

interface HeaderProps {
  title?: string
  subtitle?: string
  activePeriod?: string
  onPeriodChange?: (period: string) => void
}

export default function Header({ title = 'Dashboard', subtitle, activePeriod = 'Todo', onPeriodChange }: HeaderProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    window.dispatchEvent(new CustomEvent('hydrofulness:refresh'))
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-bg-dark/80 backdrop-blur-sm sticky top-0 z-30">
      {/* Left: Title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </div>

      {/* Center: Period selector */}
      <div className="hidden md:flex items-center gap-1 bg-bg-surface rounded-lg p-1">
        {PERIODS.map((period) => (
          <button
            key={period}
            onClick={() => onPeriodChange && onPeriodChange(period)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              ${activePeriod === period
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
              }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Right: Refresh + Stress Badge */}
      <div className="flex items-center gap-3">
        <StressBadge />
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-white/5 transition-all"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  )
}

function StressBadge() {
  // Simple static badge — will connect to real data later
  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      <span className="text-xs font-semibold text-accent">IEH: MODERADO</span>
    </div>
  )
}
