"""
predicciones.py — Endpoints REST para modelos predictivos.

GET /api/v1/predicciones/consumo     — Predicción de consumo por barrio
GET /api/v1/predicciones/anomalias   — Anomalías detectadas por ML
GET /api/v1/predicciones/estres      — Índice de estrés hídrico por barrio
GET /api/v1/predicciones/estres/ranking — Top barrios con mayor estrés
"""

import logging
from typing import Optional

from fastapi import APIRouter, Query, HTTPException

from app.services.ml.predictor import predict_consumo, get_barrios_disponibles
from app.services.ml.anomaly_detector import detect_anomalies
from app.services.ml.stress_index import calcular_estres_cientifico, calcular_ranking_estres

logger = logging.getLogger(__name__)

router = APIRouter()


# ── GET /predicciones/consumo ─────────────────────────────────

@router.get(
    "/consumo",
    summary="Predicción de consumo por barrio",
    description=(
        "Genera una predicción de consumo futuro para un barrio usando "
        "descomposición estacional y regresión lineal. "
        "Incluye datos históricos e intervalo de confianza del 95%."
    ),
)
async def prediccion_consumo(
    barrio: str = Query(..., description="Nombre del barrio (ej: 10-FLORIDA BAJA)"),
    horizonte: int = Query(6, ge=1, le=24, description="Meses a predecir"),
):
    """Predicción de consumo para un barrio."""
    try:
        resultado = predict_consumo(barrio, horizonte)
        if resultado.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No hay datos suficientes para el barrio: {barrio}",
            )
        return {
            "barrio": barrio,
            "horizonte_meses": horizonte,
            "total_puntos": len(resultado),
            "datos": resultado.to_dict(orient="records"),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error en predicción: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /predicciones/anomalias ───────────────────────────────

@router.get(
    "/anomalias",
    summary="Anomalías detectadas por ML",
    description=(
        "Detecta anomalías de consumo usando Isolation Forest. "
        "Clasifica por severidad: CRITICA, ALTA, MEDIA, BAJA."
    ),
)
async def prediccion_anomalias(
    barrio: Optional[str] = Query(None, description="Filtrar por barrio"),
):
    """Anomalías detectadas con Isolation Forest."""
    try:
        resultados = detect_anomalies(barrio)
        return {
            "barrio": barrio or "todos",
            "total_anomalias": len(resultados),
            "anomalias": resultados[:100],  # Limitar respuesta
        }
    except Exception as e:
        logger.error("Error en detección de anomalías: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /predicciones/estres ──────────────────────────────────

@router.get(
    "/estres",
    summary="Índice de estrés hídrico por barrio",
    description=(
        "Calcula el Índice de Estrés Hídrico (IEH) para un barrio. "
        "Fórmula: (C_actual / C_historico) × W_estacionalidad × W_tendencia. "
        "Niveles: BAJO (<0.7), MODERADO (0.7-1.0), ALTO (1.0-1.3), CRITICO (>1.3)."
    ),
)
async def prediccion_estres(
    barrio: str = Query(..., description="Nombre del barrio"),
):
    """Índice de estrés hídrico para un barrio."""
    try:
        resultado = calcular_estres_cientifico(barrio)
        return resultado
    except Exception as e:
        logger.error("Error calculando estrés: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /predicciones/estres/ranking ──────────────────────────

@router.get(
    "/estres/ranking",
    summary="Ranking de estrés hídrico",
    description="Top barrios con mayor índice de estrés hídrico, ordenados de mayor a menor.",
)
async def ranking_estres(
    limit: int = Query(10, ge=1, le=60, description="Número de barrios a devolver"),
):
    """Top N barrios con mayor estrés hídrico."""
    try:
        ranking = calcular_ranking_estres()
        return {
            "total_barrios": len(ranking),
            "ranking": ranking[:limit],
        }
    except Exception as e:
        logger.error("Error en ranking de estrés: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /predicciones/barrios ─────────────────────────────────

@router.get(
    "/barrios",
    summary="Barrios disponibles",
    description="Lista de todos los barrios con datos disponibles para predicciones.",
)
async def listar_barrios():
    """Lista de barrios disponibles."""
    barrios = get_barrios_disponibles()
    return {"total": len(barrios), "barrios": barrios}
