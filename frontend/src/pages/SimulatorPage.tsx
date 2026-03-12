import { useState, useEffect } from 'react'
import { Zap, Activity, Droplet, TreePine, Coins, Users, ShieldAlert, ArrowRight } from 'lucide-react'
import api from '@/services/api'
import StressGauge from '@/components/charts/StressGauge'

interface Scenario {
  reduccion_domestico_pct: number
  reduccion_comercial_pct: number
  reduccion_no_domestico_pct: number
  agua_regenerada_pct: number
  mejora_red_pct: number
  restricciones_riego: boolean
  tarifa_progresiva: boolean
}

interface SimulationResult {
  ieh_actual: number
  ieh_simulado: number
  cambio_nivel: string
  ahorro_litros_mes: number
  ahorro_pct: number
  co2_evitado_kg: number
  coste_evitado_eur: number
  equivalencia_humana: string
  dias_reserva_ganados: number
  viabilidad: string
}

const DEFAULT_SCENARIO: Scenario = {
  reduccion_domestico_pct: 0,
  reduccion_comercial_pct: 0,
  reduccion_no_domestico_pct: 0,
  agua_regenerada_pct: 0,
  mejora_red_pct: 0,
  restricciones_riego: false,
  tarifa_progresiva: false
}

export default function SimulatorPage() {
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO)
  const [presets, setPresets] = useState<any[]>([])
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/simulador/presets').then((res) => {
      setPresets(res.data)
    }).catch((error) => {
      console.warn("Backend no disponible. Usando presets mock.", error)
      const MOCK_PRESETS = [
        { nombre: "Plan Sequía Nivel 1", scenario: { reduccion_domestico_pct: 5, restricciones_riego: true, tarifa_progresiva: true, reduccion_comercial_pct: 0, reduccion_no_domestico_pct: 0, agua_regenerada_pct: 0, mejora_red_pct: 0 } },
        { nombre: "Transición Agua Regenerada", scenario: { reduccion_domestico_pct: 0, reduccion_comercial_pct: 0, reduccion_no_domestico_pct: 0, agua_regenerada_pct: 15, mejora_red_pct: 0, restricciones_riego: false, tarifa_progresiva: false } },
        { nombre: "Campaña Ciudadana", scenario: { reduccion_domestico_pct: 5, reduccion_comercial_pct: 0, reduccion_no_domestico_pct: 0, agua_regenerada_pct: 0, mejora_red_pct: 0, restricciones_riego: false, tarifa_progresiva: false } },
        { nombre: "Optimización Integral", scenario: { reduccion_domestico_pct: 10, reduccion_comercial_pct: 8, reduccion_no_domestico_pct: 0, agua_regenerada_pct: 15, mejora_red_pct: 10, restricciones_riego: false, tarifa_progresiva: false } }
      ]
      setPresets(MOCK_PRESETS)
    })
    
    // Simulate initial
    handleSimulate(DEFAULT_SCENARIO)
  }, [])

  const handleSimulate = async (scen: Scenario = scenario) => {
    setLoading(true)
    try {
      const res = await api.post('/simulador/ejecutar', scen)
      setResult(res.data)
    } catch (error) {
      console.warn("Backend no disponible. Usando cálculo mock local.", error)
      // Cálculo mock local cuando el backend no responde
      const baseConsumo = 28_800_000 // litros/mes mock
      const reduccion = (scen.reduccion_domestico_pct * 0.62 +
                         scen.reduccion_comercial_pct * 0.28 +
                         scen.reduccion_no_domestico_pct * 0.10) / 100 +
                        (scen.agua_regenerada_pct * 0.15) / 100 +
                        (scen.mejora_red_pct * 0.15) / 100 +
                        (scen.restricciones_riego ? 0.03 : 0) +
                        (scen.tarifa_progresiva ? 0.05 : 0)

      const ahorro = baseConsumo * reduccion
      const mockResult: SimulationResult = {
        ieh_actual: 1.12,
        ieh_simulado: Math.max(0.3, 1.12 * (1 - reduccion)),
        ahorro_litros_mes: Math.round(ahorro),
        ahorro_pct: +(reduccion * 100).toFixed(1),
        co2_evitado_kg: Math.round(ahorro / 1000 * 0.3),
        coste_evitado_eur: Math.round(ahorro / 1000 * 1.5),
        equivalencia_humana: `Equivale al consumo de ${Math.round(ahorro / 4500)} hogares durante 1 mes`,
        viabilidad: reduccion > 0.05 ? "ALTA" : reduccion > 0.02 ? "MEDIA" : "BAJA",
        cambio_nivel: 1.12 * (1 - reduccion) < 1.0 ? "ALTO → MODERADO" : "Sin cambio",
        dias_reserva_ganados: +(reduccion * 30).toFixed(1)
      }
      setResult(mockResult)
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (scen: Scenario) => {
    setScenario(scen)
    handleSimulate(scen)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Simulador What-If</h1>
          <p className="text-text-muted mt-1">Evalúa el impacto de decisiones de gestión en el estrés hídrico de Alicante</p>
        </div>
        <div className="flex gap-2">
          {presets.map((p, i) => (
            <button 
              key={i} 
              onClick={() => applyPreset(p.scenario)}
              className="px-3 py-1.5 bg-bg-surface border border-white/10 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
            >
              {p.nombre}
            </button>
          ))}
          <button 
            onClick={() => { setScenario(DEFAULT_SCENARIO); handleSimulate(DEFAULT_SCENARIO) }}
            className="px-3 py-1.5 bg-bg-surface border border-white/10 rounded-lg text-xs font-semibold text-text-muted hover:bg-white/5 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL IZQUIERDO: CONTROLES */}
        <div className="lg:col-span-4 bg-bg-surface border border-white/5 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
            <SlidersIcon className="w-5 h-5 text-primary" /> Parámetros del Escenario
          </h3>

          <div className="space-y-6">
            <SliderControl 
              label="Reducción Doméstico (%)" value={scenario.reduccion_domestico_pct}
              onChange={(v: number) => setScenario({...scenario, reduccion_domestico_pct: v})} max={20} 
            />
            <SliderControl 
              label="Reducción Comercial (%)" value={scenario.reduccion_comercial_pct}
              onChange={(v: number) => setScenario({...scenario, reduccion_comercial_pct: v})} max={20} 
            />
            <SliderControl 
              label="Reducción No Doméstico (%)" value={scenario.reduccion_no_domestico_pct}
              onChange={(v: number) => setScenario({...scenario, reduccion_no_domestico_pct: v})} max={20} 
            />
            <SliderControl 
              label="Sustitución Agua Regenerada (%)" value={scenario.agua_regenerada_pct}
              onChange={(v: number) => setScenario({...scenario, agua_regenerada_pct: v})} max={30} color="emerald"
            />
             <SliderControl 
              label="Mejora Red Abastecimiento (%)" value={scenario.mejora_red_pct}
              onChange={(v: number) => setScenario({...scenario, mejora_red_pct: v})} max={20} color="amber"
            />

            <div className="pt-4 border-t border-white/5 space-y-4">
              <ToggleControl 
                label="Restricciones de Riego" 
                checked={scenario.restricciones_riego}
                onChange={(c: boolean) => setScenario({...scenario, restricciones_riego: c})}
              />
              <ToggleControl 
                label="Tarifa Progresiva Penalizadora" 
                checked={scenario.tarifa_progresiva}
                onChange={(c: boolean) => setScenario({...scenario, tarifa_progresiva: c})}
              />
            </div>

            <button 
              onClick={() => handleSimulate()}
              disabled={loading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-primary to-blue-500 rounded-lg text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              SIMULAR IMPACTO
            </button>
          </div>
        </div>

        {/* PANEL CENTRAL: RESULTADOS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-6">Proyección del Índice de Estrés Hídrico (WEI+)</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-xs text-text-muted mb-2 font-semibold">SITUACIÓN ACTUAL</p>
                <div className="w-48 h-32 relative mx-auto opacity-70">
                  {result && <StressGauge value={result.ieh_actual} />}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <ArrowRight className="w-8 h-8 text-primary opacity-50 mb-2" />
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${!result || result.cambio_nivel.includes('Sin cambio') ? 'bg-bg-dark border-white/10 text-text-muted' : 'bg-primary/20 border-primary/50 text-primary'}`}>
                  {result ? result.cambio_nivel : '...'}
                </span>
              </div>

              <div className="text-center">
                <p className="text-xs text-primary mb-2 font-bold">ESCENARIO SIMULADO</p>
                <div className="w-56 h-36 relative mx-auto transform scale-110">
                   {result && <StressGauge value={result.ieh_simulado} />}
                </div>
              </div>
            </div>

            {result && (
              <div>
                <div className="mb-2 flex justify-between text-xs font-semibold">
                  <span className="text-text-muted">Viabilidad de Implementación</span>
                  <span className={result.viabilidad === 'ALTA' ? 'text-emerald-400' : result.viabilidad === 'MEDIA' ? 'text-amber-400' : 'text-rose-400'}>
                    {result.viabilidad}
                  </span>
                </div>
                <div className="h-2 w-full bg-bg-dark rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${result.viabilidad === 'ALTA' ? 'bg-emerald-500 w-full' : result.viabilidad === 'MEDIA' ? 'bg-amber-500 w-2/3' : 'bg-rose-500 w-1/3'}`} />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <ImpactCard icon={Droplet} title="Litros Ahorrados" value={result ? `${(result.ahorro_litros_mes / 1_000_000).toFixed(1)}M L` : '-'} sub="al mes" color="text-primary" />
             <ImpactCard icon={TreePine} title="CO2 Evitado" value={result ? `${result.co2_evitado_kg.toLocaleString('es-ES')} kg` : '-'} sub="estimado" color="text-emerald-400" />
             <ImpactCard icon={Coins} title="Coste Evitado" value={result ? `${result.coste_evitado_eur.toLocaleString('es-ES')} €` : '-'} sub="tratamiento" color="text-amber-400" />
             <ImpactCard icon={Users} title="Equivalencia" value={result ? result.equivalencia_humana.match(/\d+.\d+/)?.[0] || '-' : '-'} sub="hogares/mes" color="text-purple-400" />
          </div>

          {/* LISTA DE BARRIOS AFECTADOS */}
          <div className="bg-bg-surface border border-white/5 rounded-xl p-5 flex-1">
             <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
               <ShieldAlert className="w-4 h-4 text-primary" /> Impacto Directo
             </h3>
             <div className="bg-bg-dark/50 rounded-lg p-4 border border-white/5 text-sm text-text-muted">
                <p>El escenario actual tendría un impacto global en la ciudad de Alicante equivalente a <strong>{result?.ahorro_pct || 0}%</strong> de ahorro.</p>
                <p className="mt-2 text-xs italic opacity-70">Nota: Al aplicarse a la ciudad de Alicante completa (TODA_ALICANTE), esta proyección considera el peso promedio de la matriz de consumo local.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SlidersIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="21" y2="21"/><line x1="4" x2="20" y1="14" y2="14"/><line x1="4" x2="20" y1="7" y2="7"/><polygon points="9 21 15 21 12 17 9 21"/><polygon points="9 14 15 14 12 10 9 14"/><polygon points="9 7 15 7 12 3 9 7"/></svg>
}

function SliderControl({ label, value, onChange, max, color = 'primary' }: any) {
  const isZero = value === 0
  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-xs">
        <label className="text-text-muted font-medium">{label}</label>
        <span className={`font-bold ${isZero ? 'text-white/40' : `text-${color}`}`}>{value}%</span>
      </div>
      <input 
        type="range" min="0" max={max} step="1" value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  )
}

function ToggleControl({ label, checked, onChange }: any) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs text-text-muted font-medium">{label}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-bg-dark'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
      </div>
    </label>
  )
}

function ImpactCard({ icon: Icon, title, value, sub, color }: any) {
  return (
    <div className="bg-bg-surface border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
      <div className={`p-2 rounded-full bg-bg-dark mb-3 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-xs text-text-muted mb-1">{title}</h4>
      <p className={`text-xl font-black mb-1 ${color}`}>{value}</p>
      <p className="text-[10px] text-white/40 uppercase tracking-wider">{sub}</p>
    </div>
  )
}
