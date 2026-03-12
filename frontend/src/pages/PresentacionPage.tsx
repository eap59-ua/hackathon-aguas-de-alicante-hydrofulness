import { ArrowRight, Droplets, MapPin, Users, Zap, ShieldCheck, ChevronDown, Activity, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PresentacionPage() {
  const scrollToDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-bg-dark min-h-screen text-white font-sans overflow-x-hidden animate-fade-in relative selection:bg-primary/30">
        
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen opacity-40"></div>
      </div>

      {/* Navbar Minimalist */}
      <nav className="fixed top-0 w-full bg-bg-dark/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Droplets className="w-6 h-6 text-primary" />
                <span className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                  Hydrofulness
                </span>
            </div>
            <div className="flex items-center gap-6">
                <a href="#solucion" className="text-sm font-medium text-text-muted hover:text-white transition-colors">La Solución</a>
                <a href="#impacto" className="text-sm font-medium text-text-muted hover:text-white transition-colors">Impacto</a>
                <Link to="/dashboard" className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/50 hover:border-transparent rounded-full text-sm font-bold transition-all flex items-center gap-2">
                  Ver Demo <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-32 flex flex-col items-center justify-center min-h-screen text-center px-6 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-text-muted mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          DATATHON AGUAS DE ALICANTE 2026
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Inteligencia Hídrica <br className="hidden md:block"/> 
          para una Ciudad <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">Resiliente</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mb-12 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
          Plataforma integral predictiva de estrés hídrico basada en el estándar europeo WEI+.
          Optimizando el consumo, previniendo anomalías y empoderando a la ciudadanía.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link to="/dashboard" className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 rounded-full text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group">
            <Activity className="w-5 h-5 group-hover:animate-bounce" />
            Acceder a la Plataforma
          </Link>
          <button onClick={scrollToDemo} className="px-8 py-4 bg-bg-surface border border-white/10 hover:bg-white/5 rounded-full text-white font-bold text-lg transition-all flex items-center justify-center gap-2">
            Ver Módulos <ChevronDown className="w-5 h-5 opacity-50" />
          </button>
        </div>
      </section>

      {/* PROBLEM & SOLUTION SECTION */}
      <section id="solucion" className="py-24 bg-bg-surface border-y border-white/5 relative z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">El Reto del Agua en Alicante</h2>
            <p className="text-text-muted max-w-2xl mx-auto">La provincia de Alicante es pionera en la gestión cíclica del agua, pero se enfrenta a sequías recurrentes. Pasamos de un modelo reactivo a uno predictivo y ciudadano.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={MapPin}
              title="Índice Estrés WEI+"
              desc="Adopción del Water Exploitation Index plus para cruzar el consumo real con variables pluviométricas y ET0 (Evapotranspiración)."
              color="text-blue-400"
            />
            <FeatureCard 
              icon={Zap}
              title="Predicción y Anomalías"
              desc="Machine Learning para predecir la demanda a 6 meses vista y detectar fugas o consumos atípicos en tiempo real por barrio."
              color="text-amber-400"
            />
            <FeatureCard 
              icon={Users}
              title="Módulo Ciudadano"
              desc="Simuladores What-If para gestores y un ranking de gamificación para premiar el ahorro de los barrios."
              color="text-emerald-400"
            />
          </div>
        </div>
      </section>

      {/* DEMO / MODULES SECTION */}
      <section id="demo-section" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
           <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div>
               <h2 className="text-3xl md:text-4xl font-black mb-4">Módulos de la Plataforma</h2>
               <p className="text-text-muted max-w-xl">Navega por las distintas soluciones ya implementadas y funcionales con los datos reales del conjunto proporcionado.</p>
             </div>
             <Link to="/mapa" className="text-primary hover:text-white font-semibold flex items-center gap-1 transition-colors">
               Ver todos los módulos <ArrowRight className="w-4 h-4" />
             </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModuleCard 
                title="Dashboard Ejecutivo"
                desc="Visión general 360º de la situación hídrica de la ciudad. Consumo por usos y barrios críticos."
                link="/dashboard"
                image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
              />
              <ModuleCard 
                title="Simulador de Decisiones"
                desc="Evalúa el impacto de aplicar agua regenerada, mejora de redes o restricciones en el IEH."
                link="/simulador"
                image="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
              />
              <ModuleCard 
                title="Mapa de Estrés y Modelos Predictivos"
                desc="Visualización geoespacial interactiva de Alicante y modelos Random Forest para previsión a 6 meses."
                link="/mapa"
                image="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop"
              />
               <ModuleCard 
                title="Ranking de Ciudadanía"
                desc="Gamificación social: los ciudadanos compiten sanamente por la medalla de sostenibilidad de su barrio."
                link="/ranking"
                image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
              />
           </div>
        </div>
      </section>

      {/* IMPACT / VALIDATION */}
      <section id="impacto" className="py-24 bg-gradient-to-b from-bg-surface to-bg-dark border-t border-white/5 relative z-10">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-black mb-6">Impacto Real. Alineado con los ODS.</h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto mb-16">
              Hydrofulness no es solo un cuadro de mando; es una herramienta de impacto diseñada bajo los criterios técnicos más estrictos.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat value="100%" label="Datos Integrados" sub="Usos, Clima y Consumo" />
              <div className="hidden md:block w-px h-16 bg-white/10 mx-auto self-center"></div>
              <Stat value="WEI+" label="Metodología Europea" sub="Estrés validado" />
              <div className="hidden md:block w-px h-16 bg-white/10 mx-auto self-center"></div>
              <Stat value="4" label="Módulos ML" sub="Anomalías, Predicción, Simulación y Ranking" />
              <div className="hidden md:block w-px h-16 bg-white/10 mx-auto self-center"></div>
              <Stat value="ODS 6" label="Impacto Neto" sub="Agua limpia y saneamiento" />
            </div>
         </div>
      </section>

      {/* Cta Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/50 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg text-white">Hydrofulness</span>
          </div>
          <p className="text-sm text-text-muted">Desarrollado para el Datathon Aguas de Alicante y la Universidad de Alicante.</p>
          <div className="text-sm font-semibold text-primary flex items-center gap-1">
             <Trophy className="w-4 h-4" /> Candidatura al Primer Premio
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="bg-bg-dark border border-white/5 p-8 rounded-2xl hover:border-white/10 transition-colors group">
      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function ModuleCard({ title, desc, link, image }: any) {
  return (
    <Link to={link} className="group relative rounded-2xl overflow-hidden block border border-white/10 hover:border-primary/50 transition-colors aspect-video md:aspect-[21/9]">
       <div className="absolute inset-0 bg-bg-dark">
         <img src={image} alt={title} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" />
       </div>
       <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/60 to-transparent p-8 flex flex-col justify-end">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
            {title} <ArrowUpRightIcon className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </h3>
          <p className="text-text-muted text-sm max-w-md">{desc}</p>
       </div>
    </Link>
  )
}

function Stat({ value, label, sub }: any) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-black text-white mb-2">{value}</div>
      <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-text-muted">{sub}</div>
    </div>
  )
}

function ArrowUpRightIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
}
