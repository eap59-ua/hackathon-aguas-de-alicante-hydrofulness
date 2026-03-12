import { Settings, Shield, Github, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-text-muted" /> Configuración del Sistema
        </h1>
        <p className="text-text-muted mt-1">Preferencias y estado de la plataforma Hydrofulness</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-bg-surface border border-white/5 rounded-xl p-6">
           <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <Database className="w-5 h-5 text-primary" /> Conexión y Datos
           </h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center p-3 bg-bg-dark rounded-lg border border-white/5">
                <div>
                  <p className="font-semibold text-sm text-white">Estado del Servidor API</p>
                  <p className="text-xs text-text-muted">Conexión con el pipeline de Machine Learning</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span> Offline
                </span>
             </div>
             
             <div className="flex justify-between items-center p-3 bg-bg-dark rounded-lg border border-white/5">
                <div>
                  <p className="font-semibold text-sm text-white">Fallback a Mock Data</p>
                  <p className="text-xs text-text-muted">Usar datos de demostración en entorno local</p>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full relative cursor-not-allowed opacity-80">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
             </div>
           </div>
        </div>

        <div className="bg-bg-surface border border-white/5 rounded-xl p-6">
           <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <Shield className="w-5 h-5 text-emerald-400" /> Acerca de la Versión
           </h3>
           <div className="space-y-4 text-sm text-text-muted">
             <p><strong className="text-white">Hydrofulness v1.0.0</strong></p>
             <p>Plataforma SaaS para la monitorización preventiva y gamificada del estrés hídrico urbano.</p>
             <p>Desarrollada para el <strong>Datathon Aguas de Alicante 2026</strong> organizado por AMAEM y la Universidad de Alicante.</p>
             
             <a href="https://github.com/erardojr/DATATHON-AGUASDEALICANTE-HYDROFULNESS" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-colors">
               <Github className="w-4 h-4" /> Ver Repositorio en GitHub
             </a>
           </div>
        </div>
      </div>
    </div>
  )
}
