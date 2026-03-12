"""API v1 — routers de la versión 1."""

from fastapi import APIRouter

from app.api.v1 import (
    consumos,
    indice_estres,
    anomalias,
    predicciones,
    etl,
    clima,
    insights,
    simulador,
    ranking
)

router = APIRouter()

router.include_router(consumos.router, prefix="/consumos", tags=["Consumos"])
router.include_router(indice_estres.router, prefix="/estres-hidrico", tags=["Estrés Hídrico"])
router.include_router(anomalias.router, prefix="/anomalias", tags=["Anomalías"])
router.include_router(predicciones.router, prefix="/predicciones", tags=["Predicciones ML"])
router.include_router(clima.router, prefix="/clima", tags=["Clima y Pluviometría"])
router.include_router(insights.router, prefix="/insights", tags=["Insights Ejecutivos"])
router.include_router(simulador.router, prefix="/simulador", tags=["Simulador What-If"])
router.include_router(ranking.router, prefix="/ranking", tags=["Ranking Ciudadano"])
router.include_router(etl.router, prefix="/etl", tags=["ETL (Admin)"])
