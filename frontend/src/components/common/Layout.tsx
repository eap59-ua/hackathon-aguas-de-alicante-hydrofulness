import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    sessionStorage.getItem('sidebar-collapsed') === 'true'
  )
  const [activePeriod, setActivePeriod] = useState<string>('Todo')

  const handleToggleSidebar = (state: boolean) => {
    setSidebarCollapsed(state)
    sessionStorage.setItem('sidebar-collapsed', String(state))
  }

  return (
    <div className="min-h-screen bg-bg-dark font-sans">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}
      >
        <Header activePeriod={activePeriod} onPeriodChange={setActivePeriod} />
        <main className="p-6">
          <div className="animate-fade-in">
            <Outlet context={{ activePeriod }} />
          </div>
        </main>
      </div>
    </div>
  )
}
