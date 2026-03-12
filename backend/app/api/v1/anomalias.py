"""
anomalias.py — Endpoints REST para anomalías de consumo.

Proporciona acceso a los registros marcados como outliers
y un resumen por zona y severidad.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Query
from sqlalchemy import create_engine

import pandas as pd

from app.core.config import settings
from app.models.schemas import AnomaliaItem, ResumenAnomalias

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_df() -> pd.DataFrame:
    """Lee los datos procesados desde SQLite."""
    engine = create_engine(settings.DATABASE_URL)
    df = pd.read_sql("SELECT * FROM consumos_procesados", engine)
    if "fecha" in df.columns:
        df["fecha"] = pd.to_datetime(df["fecha"])
    return df


# ── GET /anomalias ────────────────────────────────────────────

@router.get(
    "",
    response_model=list[AnomaliaItem],
    summary="Listado de anomalías",
    description=(
        "Devuelve los registros de consumo marcados como outliers (anomalías). "
        "Filtrable por severidad y barrio."
    ),
)
async def listar_anomalias(
    severidad: Optional[str] = Query(None, description="Filtrar por severidad: ALTO, CRITICO"),
    barrio: Optional[str] = Query(None, description="Filtrar por barrio"),
    limit: int = Query(100, ge=1, le=1000, description="Máximo de resultados"),
):
    """Listado de consumos anómalos (outliers)."""
    df = _get_df()

    # Solo outliers
    df = df[df["es_outlier"] == True]  # noqa: E712

    # Filtros
    if severidad:
        df = df[df["severidad_outlier"].str.upper() == severidad.upper()]
    if barrio:
        df = df[df["barrio"].str.contains(barrio.upper(), case=False, na=False)]

    # Ordenar por consumo descendente
    df = df.sort_values("consumo_litros", ascending=False).head(limit)

    return [
        AnomaliaItem(
            barrio=row.get("barrio", ""),
            uso=row.get("uso", ""),
            fecha=str(row.get("fecha", ""))[:10],
            consumo_litros=float(row.get("consumo_litros", 0)),
            severidad=row.get("severidad_outlier", "ALTO"),
            consumo_por_contrato=float(row["consumo_por_contrato"]) if pd.notna(row.get("consumo_por_contrato")) else None,
            n_contratos=int(row.get("n_contratos", 0)),
        )
        for _, row in df.iterrows()
    ]


# ── GET /anomalias/resumen ────────────────────────────────────

@router.get(
    "/resumen",
    response_model=ResumenAnomalias,
    summary="Resumen de anomalías",
    description="Conteo de anomalías por zona y severidad.",
)
async def resumen_anomalias(
    anio: Optional[str] = Query(None, description="Filtrar por año (ej: 2024)")
):
    """Resumen de anomalías detectadas."""
    df = _get_df()
    
    if anio and "fecha" in df.columns:
        df = df[df["fecha"].dt.year == int(anio)]
        
    outliers = df[df["es_outlier"] == True]  # noqa: E712

    # Por severidad
    por_severidad = (
        outliers.groupby("severidad_outlier").size().to_dict()
        if len(outliers) > 0
        else {}
    )

    # Por barrio
    por_barrio = (
        outliers.groupby("barrio")
        .size()
        .sort_values(ascending=False)
        .head(20)
        .to_dict()
        if len(outliers) > 0
        else {}
    )

    return ResumenAnomalias(
        total_anomalias=len(outliers),
        por_severidad={str(k): int(v) for k, v in por_severidad.items()},
        por_barrio={str(k): int(v) for k, v in por_barrio.items()},
    )
