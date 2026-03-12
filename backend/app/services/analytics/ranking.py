"""
ranking.py — Motor de gamificación y Ranking Ciudadano de Sostenibilidad.
Calcula una puntuación de salud de consumo para cada barrio de 0 a 100.
"""

from typing import Any
import pandas as pd
from sqlalchemy import create_engine
import time

from app.core.config import settings
from app.services.ml.stress_index import calcular_ranking_estres

_cache = {}
_CACHE_TTL = 3600

def get_ranking_ciudadano() -> dict[str, Any]:
    cache_key = "ranking_ciudadano"
    if cache_key in _cache and time.time() - _cache[cache_key]["ts"] < _CACHE_TTL:
        return _cache[cache_key]["data"]

    # Traer todos los barrios base de stress index
    stress_ranking = calcular_ranking_estres()
    if not stress_ranking:
        return {"error": "Sin datos"}

    engine = create_engine(settings.DATABASE_URL)
    df = pd.read_sql("SELECT barrio, consumo_litros FROM consumos_procesados", engine)

    ranking_final = []
    
    # 0 a 100 scores base (inverso de IEH para simplificar pero dando matices gamificados)
    for index, r in enumerate(stress_ranking):
        # 1. Base Score a partir del IEH (consumos eficientes y estables)
        ieh = r["valor"]
        score = max(0, min(100, 100 - (ieh * 30)))
        
        # 2. Asignar medallas y mensajes
        medalla = "SIN MEDALLA"
        if score >= 75: medalla = "ORO"
        elif score >= 60: medalla = "PLATA"
        elif score >= 45: medalla = "BRONCE"
        
        fortalezas = []
        if r.get("tendencia_interanual_pct", 0) < 0:
            fortalezas.append("Reducción constante del consumo interanual")
        if ieh <= 0.4:
            fortalezas.append("Consumo eficiente por contrato")
            
        mejora = "Mantener los buenos hábitos."
        if r["nivel"] in ["SEVERO", "ALTO", "CRITICO"]:
            mejora = "Vigilar el consumo en meses de verano."
        elif r.get("tendencia_interanual_pct", 0) > 2:
            mejora = "Frenar la tendencia al alza del consumo."
            
        ranking_final.append({
            "posicion": index + 1,
            "barrio": r["barrio"],
            "score": round(score),
            "medalla": medalla,
            "consumo_litros_contrato": r.get("consumo_actual_l_contrato", 0),
            "tendencia": r.get("tendencia_interanual_pct", 0),
            "fortaleza": fortalezas[0] if fortalezas else "Consumo dentro de la media",
            "area_mejora": mejora
        })

    ranking_final.sort(key=lambda x: x["score"], reverse=True)
    
    # Recalcular posiciones
    for i, item in enumerate(ranking_final):
        item["posicion"] = i + 1

    media_ciudad = sum(float(r["score"]) for r in ranking_final) / len(ranking_final) if ranking_final else 0
    
    mejor = ranking_final[0]["barrio"] if ranking_final else ""
    peor = ranking_final[-1]["barrio"] if ranking_final else ""

    data = {
        "ranking": ranking_final,
        "media_ciudad": round(media_ciudad),
        "mejor_barrio": mejor,
        "peor_barrio": peor,
        "dato_motivacional": f"Si todos los barrios alcanzaran el nivel de {str(mejor).capitalize()}, Alicante ahorraría millones de litros al año."
    }
    
    _cache[cache_key] = {"data": data, "ts": time.time()}
    return data
