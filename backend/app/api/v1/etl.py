"""
etl.py — Endpoints REST para el pipeline ETL.

POST /api/v1/etl/run      → Ejecuta el pipeline completo
GET  /api/v1/etl/status    → Estado del último proceso
"""

import logging

from fastapi import APIRouter, HTTPException

from app.services.etl.pipeline import ejecutar_pipeline, obtener_estado

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/run",
    summary="Ejecutar pipeline ETL",
    description=(
        "Ejecuta el pipeline completo de ingesta: carga el CSV de AMAEM, "
        "limpia los datos, aplica transformaciones y guarda en SQLite."
    ),
)
async def run_etl():
    """Ejecuta el pipeline ETL completo."""
    try:
        resultado = ejecutar_pipeline()
        return resultado
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"Archivo de datos no encontrado: {e}",
        )
    except Exception as e:
        logger.error("Error ejecutando ETL: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error en el pipeline ETL: {str(e)}",
        )


@router.get(
    "/status",
    summary="Estado del pipeline ETL",
    description="Devuelve el estado del último proceso ETL ejecutado.",
)
async def get_etl_status():
    """Devuelve el estado del último proceso ETL."""
    return obtener_estado()
