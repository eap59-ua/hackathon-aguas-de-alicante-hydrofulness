from fastapi import APIRouter
from app.services.analytics.simulator import Scenario, simulate

router = APIRouter()

@router.post("/ejecutar", summary="Ejecutar simulación What-If")
def ejecutar_simulacion(scenario: Scenario, barrio: str = "TODA_ALICANTE"):
    """
    Ejecuta el modelo de simulación de impacto sobre el Índice de Estrés Hídrico.
    """
    return simulate(scenario, barrio)

@router.get("/presets", summary="Recuperar escenarios predefinidos para la ciudad")
def get_presets():
    return [
        {
            "id": "plan_sequia_1",
            "nombre": "Plan Sequía Nivel 1",
            "scenario": {
                "restricciones_riego": True,
                "tarifa_progresiva": True,
                "reduccion_domestico_pct": 0,
                "reduccion_comercial_pct": 0,
                "reduccion_no_domestico_pct": 0,
                "agua_regenerada_pct": 0,
                "mejora_red_pct": 0
            }
        },
        {
            "id": "transicion_regenerada",
            "nombre": "Transición Circular (Agua Regenerada)",
            "scenario": {
                "restricciones_riego": False,
                "tarifa_progresiva": False,
                "reduccion_domestico_pct": 0,
                "reduccion_comercial_pct": 0,
                "reduccion_no_domestico_pct": 0,
                "agua_regenerada_pct": 15,
                "mejora_red_pct": 5
            }
        },
        {
            "id": "campana_ciudadana",
            "nombre": "Campaña Concienciación Ciudadana",
            "scenario": {
                "restricciones_riego": False,
                "tarifa_progresiva": False,
                "reduccion_domestico_pct": 5,
                "reduccion_comercial_pct": 2,
                "reduccion_no_domestico_pct": 0,
                "agua_regenerada_pct": 0,
                "mejora_red_pct": 0
            }
        },
        {
            "id": "optimizacion_integral",
            "nombre": "Optimización Integral",
            "scenario": {
                "restricciones_riego": True,
                "tarifa_progresiva": True,
                "reduccion_domestico_pct": 10,
                "reduccion_comercial_pct": 5,
                "reduccion_no_domestico_pct": 5,
                "agua_regenerada_pct": 15,
                "mejora_red_pct": 10
            }
        }
    ]
