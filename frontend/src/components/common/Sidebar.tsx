import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Settings,
  Menu,
  Droplet,
  Sliders,
  Trophy,
  Presentation
} from 'lucide-react'

interface NavItem {
  icon: ReactNode
  label: string
  to: string
  color?: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', to: '/dashboard' },
  { icon: <Map size={20} />, label: 'Mapa de Calor', to: '/mapa' },
  { icon: <TrendingUp size={20} />, label: 'Predicciones ML', to: '/predicciones' },
  { icon: <AlertTriangle size={20} />, label: 'Anomalías', to: '/anomalias', color: 'text-amber-500' },
  { icon: <BarChart3 size={20} />, label: 'Análisis Avanzado', to: '/analisis' },
  { icon: <Sliders size={20} />, label: 'Simulador What-If', to: '/simulador', color: 'text-emerald-400' },
  { icon: <Trophy size={20} />, label: 'Ranking Ciudadano', to: '/ranking', color: 'text-amber-400' }
]

const BOTTOM_ITEMS: NavItem[] = [
  { icon: <Presentation size={20} />, label: 'Presentación', to: '/presentacion', color: 'text-indigo-400' },
  { icon: <Settings size={20} />, label: 'Configuración', to: '/configuracion' }
]

interface SidebarProps {
  collapsed: boolean
  onToggle: (state: boolean) => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-bg-surface border-r border-white/5 transition-all duration-300 z-40 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <Droplet className="w-6 h-6 text-primary shrink-0" />
            <span className="font-bold text-lg tracking-tight whitespace-nowrap bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Hydrofulness
            </span>
          </div>
        )}
        <button
          onClick={() => onToggle(!collapsed)}
          className={`p-2 rounded-full flex items-center justify-center text-text-muted hover:bg-white/5 hover:text-primary transition-colors ${collapsed ? 'mx-auto' : ''}`}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <div className={`shrink-0 ${item.color || ''}`}>
              {item.icon}
            </div>
            {!collapsed && (
              <span className="font-medium whitespace-nowrap text-sm">
                {item.label}
              </span>
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-bg-surface border border-white/10 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Elements */}
      <div className="mt-auto px-2 pb-4 space-y-1 border-t border-white/5 pt-4">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <div className={`shrink-0 ${item.color || ''}`}>
              {item.icon}
            </div>
            {!collapsed && (
              <span className="font-medium whitespace-nowrap text-sm">
                {item.label}
              </span>
            )}
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-bg-surface border border-white/10 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
