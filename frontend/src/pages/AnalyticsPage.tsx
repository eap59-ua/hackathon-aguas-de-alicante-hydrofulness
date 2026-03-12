import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
        <BarChart3 className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Análisis Avanzado</h1>
      <p className="text-text-muted max-w-lg mb-8">
        El módulo de cruce de variables y exportación de informes personalizados estará disponible en la próxima versión estable de Hydrofulness.
      </p>
      
      <div className="flex gap-4">
        <div className="px-6 py-4 bg-bg-surface border border-white/5 rounded-xl text-left">
           <h3 className="text-sm font-bold text-white mb-1">Cálculo de IEH en Tiempo Real</h3>
           <p className="text-xs text-text-muted">Cruzamos evapotranspiración con lluvia y consumo.</p>
        </div>
        <div className="px-6 py-4 bg-bg-surface border border-white/5 rounded-xl text-left">
           <h3 className="text-sm font-bold text-white mb-1">Exportación de Datasets</h3>
           <p className="text-xs text-text-muted">Descarga de informes agregados por código postal.</p>
        </div>
      </div>
    </div>
  )
}
