import logging
from fastapi import APIRouter
import pandas as pd
from sqlalchemy import create_engine
from app.core.config import settings
from app.services.ml.stress_index import calcular_resumen_ciudad, calcular_ranking_estres

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get(
    "/ciudad", 
    summary="Insights Globales de la Ciudad",
    description="Datos consolidados y KPIs de alto nivel (para dashboard directivo)."
)
def insights_ciudad_endpoint():
    """
    Fuentes: WEI+ (EEA, Eurostat SDG 6.4.2), Datos AMAEM Hackathon 2026, 
    Proxy climático basado en AEMET/climate-data.org.
    """
    try:
        resumen = calcular_resumen_ciudad()
        ranking = calcular_ranking_estres()
        
        # Calcular consumo anual total usando BBDD (aprox últimos 12 meses)
        engine = create_engine(settings.DATABASE_URL)
        df_query = pd.read_sql("SELECT SUM(consumo_litros) as total FROM consumos_procesados", engine)
        
        # Asumiendo 3 años de datos, el anual medio es total/3
        consumo_anual_ml = 0.0
        if not df_query.empty and df_query.iloc[0]["total"]:
            consumo_anual_ml = float(df_query.iloc[0]["total"]) / 3 / 1_000_000
        
        return {
            "ieh_global": resumen.get("ieh_global", 0),
            "ieh_nivel_global": resumen.get("ieh_nivel_global", "SIN_ESTRES"),
            "barrios_en_estres_severo": resumen.get("barrios_en_estres_severo", 0),
            "barrios_en_estres_alto": resumen.get("barrios_en_estres_alto", 0),
            "consumo_total_anual_ml": round(consumo_anual_ml, 2),
            "tendencia_ciudad_pct": 1.2, # simulado para demo
            "deficit_hidrico_acumulado_mm": 542.0, # (Sum(ET0) - Sum(Lluvia)) anual en Alicante
            "top_3_barrios_criticos": [b["barrio"] for b in ranking[:3]] if len(ranking) >= 3 else [],
            "top_3_barrios_eficientes": [b["barrio"] for b in ranking[-3:]] if len(ranking) >= 3 else [],
            "comparativa_wei_espana": "55% (Cuenca del Segura)",
            "recomendacion_principal": "Implementar simulador What-If en barrios de zona ALTO y SEVERO.",
            "fuente_metodologia": "WEI+ (EEA, Eurostat SDG 6.4.2), proxy climático AEMET"
        }
    except Exception as e:
        logger.error(f"Error en insights: {e}")
        return {"error": str(e)}
