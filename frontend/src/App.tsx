import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/common/Layout'
import DashboardPage from './pages/DashboardPage'
import MapPage from './pages/MapPage'
import PredictionsPage from './pages/PredictionsPage'
import SimulatorPage from './pages/SimulatorPage'
import RankingPage from './pages/RankingPage'
import AnomaliesPage from './pages/AnomaliesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import PresentacionPage from './pages/PresentacionPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/predicciones" element={<PredictionsPage />} />
          <Route path="/simulador" element={<SimulatorPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          {/* Hotfixed Routes */}
          <Route path="/analisis" element={<AnalyticsPage />} />
          <Route path="/anomalias" element={<AnomaliesPage />} />
          <Route path="/configuracion" element={<SettingsPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Fullscreen landing page (No sidebar) */}
        <Route path="/presentacion" element={<PresentacionPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
