"""
simulator.py — Simulador de Escenarios "¿Qué pasaría si...?" (What-If)

Permite a los gestores de AMAEM evaluar el impacto de distintas políticas
de gestión de demanda e infraestructura sobre el Índice de Estrés Hídrico.
"""

from typing import Any, Optional
from pydantic import BaseModel
import logging

from app.services.ml.stress_index import calcular_resumen_ciudad, calcular_estres_cientifico

logger = logging.getLogger(__name__)

class Scenario(BaseModel):
    reduccion_domestico_pct: float = 0.0      # -20 a +20
    reduccion_comercial_pct: float = 0.0      # -20 a +20
    reduccion_no_domestico_pct: float = 0.0   # -20 a +20
    agua_regenerada_pct: float = 0.0          # 0 a 30
    mejora_red_pct: float = 0.0               # 0 a 20
    restricciones_riego: bool = False
    tarifa_progresiva: bool = False

def simulate(scenario: Scenario, barrio: Optional[str] = None) -> dict[str, Any]:
    """
    Ejecuta la simulación de impacto sobre el consumo y el IEH.
    Si se provee un barrio, simula sólo para ese barrio. 
    Si no, simula para toda Alicante.
    """
    if barrio and barrio != "TODA_ALICANTE":
        # Simular para un barrio
        res_actual = calcular_estres_cientifico(barrio)
        ieh_actual = res_actual.get("ieh_valor", 0.0)
        c_actual = res_actual.get("consumo_actual_l_contrato", 0.0)
    else:
        # Simular para toda la ciudad
        res_actual = calcular_resumen_ciudad()
        ieh_actual = res_actual.get("ieh_global", 0.0)
        c_actual = 4500.0 # Proxy ciudad l/contrato/mes
        barrio = "TODA_ALICANTE"
        
    if ieh_actual == 0:
        return {"error": "No hay datos para simular"}

    # 1. Aplicar reducciones base
    ahorro_domestico = (scenario.reduccion_domestico_pct / 100) * 0.70 # peso dom 70%
    ahorro_comercial = (scenario.reduccion_comercial_pct / 100) * 0.20 # peso com 20%
    ahorro_nodom = (scenario.reduccion_no_domestico_pct / 100) * 0.10  # peso nodom 10%
    
    ahorro_pct = ahorro_domestico + ahorro_comercial + ahorro_nodom
    
    # 2. Agua regenerada (sustituye agua potable)
    if scenario.agua_regenerada_pct > 0:
        ahorro_pct += (scenario.agua_regenerada_pct / 100) * 0.15 # asume 15% es sustituible
        
    # 3. Mejora de red (reduce pérdidas, aprox 15% de pérdidas actuales)
    if scenario.mejora_red_pct > 0:
        ahorro_pct += (scenario.mejora_red_pct / 100) * 0.15
        
    # 4. Políticas
    if scenario.restricciones_riego:
        ahorro_pct += 0.03 # 3% extra de ahorro global
    if scenario.tarifa_progresiva:
        ahorro_pct += 0.05 # 5% extra de elasticidad

    # Calcular nuevo IEH
    ieh_simulado = max(0.01, ieh_actual * (1 - ahorro_pct))
    
    # Clasificación nuevo
    def clasif(ieh):
        if ieh < 0.20: return "SIN_ESTRES"
        if ieh < 0.40: return "MODERADO"
        if ieh < 0.60: return "ALTO"
        return "SEVERO"
        
    nivel_actual = clasif(ieh_actual)
    nivel_nuevo = clasif(ieh_simulado)
    
    cambio_nivel = f"{nivel_actual} → {nivel_nuevo}"
    if nivel_actual == nivel_nuevo:
        cambio_nivel = "Sin cambio de nivel"

    # Volumen (litros)
    volumen_mensual = c_actual * 5000 if barrio == "TODA_ALICANTE" else c_actual * 100 # proxys
    if ahorro_pct < 0:
        ahorro_litros_mes = -1 * abs(volumen_mensual * ahorro_pct) # Aumento de consumo
    else:
        ahorro_litros_mes = volumen_mensual * ahorro_pct

    ahorro_litros_mes = max(0.0, ahorro_litros_mes) # para UI simplificada, tratamos ahorro negativo como 0 

    # Impacto
    co2_evitado = (ahorro_litros_mes / 1000) * 0.3 # 0.3 kg CO2 por m3 tratamiento
    coste_evitado = (ahorro_litros_mes / 1000) * 1.50 # 1.50 eur / m3
    hogares = int(ahorro_litros_mes / 4000) # 4000L = consumo mes de un hogar conservador
    
    viabilidad = "BAJA"
    if ahorro_pct > 0.05: viabilidad = "MEDIA"
    if ahorro_pct > 0.15: viabilidad = "ALTA"
    if ahorro_pct < 0: viabilidad = "CONTRA-PRODUCTIVO"

    return {
        "escenario_aplicado": scenario.dict(),
        "barrio": barrio,
        "ieh_actual": round(ieh_actual, 3),
        "ieh_simulado": round(ieh_simulado, 3),
        "cambio_nivel": cambio_nivel,
        "ahorro_litros_mes": int(ahorro_litros_mes),
        "ahorro_pct": round(ahorro_pct * 100, 2),
        "co2_evitado_kg": round(co2_evitado, 1),
        "coste_evitado_eur": round(coste_evitado, 2),
        "equivalencia_humana": f"Equivale al consumo de {hogares:,.0f} hogares durante 1 mes",
        "dias_reserva_ganados": round((ahorro_pct * 100) * 0.5, 1), # Proxy heurístico
        "viabilidad": viabilidad
    }
