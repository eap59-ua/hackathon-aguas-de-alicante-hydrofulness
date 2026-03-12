"""
consumos.py — Endpoints REST para consulta de consumos de agua.

Proporciona acceso a los datos procesados de telelectura de AMAEM:
listado paginado, KPIs, agregaciones por zona y tipología, y series temporales.
"""

import math
import logging
from typing import Optional

from fastapi import APIRouter, Query
from sqlalchemy import create_engine, text

import pandas as pd

from app.core.config import settings
from app.models.schemas import (
    ConsumosPaginados,
    ConsumoItem,
    ResumenKPIs,
    ConsumoZona,
    ConsumoTipologia,
    SerieTemporal,
)

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_df() -> pd.DataFrame:
    """Lee los datos procesados desde SQLite."""
    engine = create_engine(settings.DATABASE_URL)
    df = pd.read_sql("SELECT * FROM consumos_procesados", engine)
    if "fecha" in df.columns:
        df["fecha"] = pd.to_datetime(df["fecha"])
    return df


# ── GET /consumos ─────────────────────────────────────────────

@router.get(
    "",
    response_model=ConsumosPaginados,
    summary="Listado de consumos",
    description="Devuelve un listado paginado de consumos con filtros opcionales por barrio, uso y rango de fechas.",
)
async def listar_consumos(
    barrio: Optional[str] = Query(None, description="Filtrar por barrio (ej: 10-FLORIDA BAJA)"),
    uso: Optional[str] = Query(None, description="Filtrar por tipo: DOMESTICO, COMERCIAL, NO DOMESTICO"),
    fecha_desde: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM)"),
    fecha_hasta: Optional[str] = Query(None, description="Fecha fin (YYYY-MM)"),
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(50, ge=1, le=500, description="Registros por página"),
):
    """Listado paginado de consumos con filtros."""
    df = _get_df()

    # Aplicar filtros
    if barrio:
        df = df[df["barrio"].str.contains(barrio.upper(), case=False, na=False)]
    if uso:
        df = df[df["uso"].str.upper() == uso.upper()]
    if fecha_desde:
        df = df[df["fecha"] >= pd.to_datetime(fecha_desde)]
    if fecha_hasta:
        df = df[df["fecha"] <= pd.to_datetime(fecha_hasta + "-31")]

    total = len(df)
    pages = math.ceil(total / size) if total > 0 else 1
    start = (page - 1) * size
    df_page = df.iloc[start : start + size]

    items = [
        ConsumoItem(
            barrio=row.get("barrio", ""),
            uso=row.get("uso", ""),
            fecha=str(row.get("fecha", ""))[:10],
            consumo_litros=float(row.get("consumo_litros", 0)),
            n_contratos=int(row.get("n_contratos", 0)),
            consumo_por_contrato=float(row["consumo_por_contrato"]) if pd.notna(row.get("consumo_por_contrato")) else None,
            es_outlier=bool(row.get("es_outlier", False)),
        )
        for _, row in df_page.iterrows()
    ]

    return ConsumosPaginados(total=total, page=page, size=size, pages=pages, data=items)


# ── GET /consumos/resumen ─────────────────────────────────────

@router.get(
    "/resumen",
    response_model=ResumenKPIs,
    summary="KPIs globales de consumo",
    description="Devuelve indicadores clave: consumo total, media mensual, tendencia, rango de fechas y total de barrios.",
)
async def resumen_kpis(
    anio: Optional[str] = Query(None, description="Filtrar por año (ej: 2024)")
):
    """KPIs globales del sistema."""
    df = _get_df()

    if anio and "fecha" in df.columns:
        df = df[df["fecha"].dt.year == int(anio)]

    consumo_total = float(df["consumo_litros"].sum())

    # Media mensual
    if "fecha" in df.columns:
        mensual = df.groupby(df["fecha"].dt.to_period("M"))["consumo_litros"].sum()
        consumo_medio = float(mensual.mean()) if len(mensual) > 0 else 0
    else:
        consumo_medio = float(df["consumo_litros"].mean())

    # Tendencia: último periodo vs penúltimo
    tendencia = 0.0
    if "fecha" in df.columns and len(df) > 0:
        mensual = df.groupby(df["fecha"].dt.to_period("M"))["consumo_litros"].sum()
        if len(mensual) >= 2:
            ultimo = float(mensual.iloc[-1])
            penultimo = float(mensual.iloc[-2])
            if penultimo > 0:
                tendencia = round(((ultimo - penultimo) / penultimo) * 100, 2)

    return ResumenKPIs(
        consumo_total=consumo_total,
        consumo_medio_mensual=consumo_medio,
        tendencia_pct=tendencia,
        total_registros=len(df),
        total_barrios=int(df["barrio"].nunique()) if "barrio" in df.columns else 0,
        fecha_min=str(df["fecha"].min())[:10] if "fecha" in df.columns else "",
        fecha_max=str(df["fecha"].max())[:10] if "fecha" in df.columns else "",
    )


# ── GET /consumos/por-zona ────────────────────────────────────

@router.get(
    "/por-zona",
    response_model=list[ConsumoZona],
    summary="Consumo por zona/barrio",
    description="Devuelve el consumo agregado por barrio, ordenado de mayor a menor. Ideal para el mapa de calor.",
)
async def consumo_por_zona(
    anio: Optional[str] = Query(None, description="Filtrar por año (ej: 2024)")
):
    """Consumo agregado por barrio."""
    df = _get_df()

    if anio and "fecha" in df.columns:
        df = df[df["fecha"].dt.year == int(anio)]

    agrupado = (
        df.groupby("barrio")
        .agg(
            consumo_total=("consumo_litros", "sum"),
            consumo_medio=("consumo_litros", "mean"),
            n_contratos_total=("n_contratos", "sum"),
            n_registros=("consumo_litros", "count"),
        )
        .reset_index()
        .sort_values("consumo_total", ascending=False)
    )

    return [
        ConsumoZona(
            barrio=row["barrio"],
            consumo_total=float(row["consumo_total"]),
            consumo_medio=float(row["consumo_medio"]),
            n_contratos_total=int(row["n_contratos_total"]),
            n_registros=int(row["n_registros"]),
        )
        for _, row in agrupado.iterrows()
    ]


# ── GET /consumos/por-tipologia ───────────────────────────────

@router.get(
    "/por-tipologia",
    response_model=list[ConsumoTipologia],
    summary="Distribución por tipología de uso",
    description="Distribución del consumo entre doméstico, comercial e industrial/no doméstico.",
)
async def consumo_por_tipologia(
    anio: Optional[str] = Query(None, description="Filtrar por año (ej: 2024)")
):
    """Distribución de consumo por tipo de uso."""
    df = _get_df()

    if anio and "fecha" in df.columns:
        df = df[df["fecha"].dt.year == int(anio)]

    total_global = float(df["consumo_litros"].sum())

    agrupado = (
        df.groupby("uso")
        .agg(
            consumo_total=("consumo_litros", "sum"),
            n_registros=("consumo_litros", "count"),
        )
        .reset_index()
        .sort_values("consumo_total", ascending=False)
    )

    return [
        ConsumoTipologia(
            uso=row["uso"],
            consumo_total=float(row["consumo_total"]),
            porcentaje=round(float(row["consumo_total"]) / total_global * 100, 2) if total_global > 0 else 0,
            n_registros=int(row["n_registros"]),
        )
        for _, row in agrupado.iterrows()
    ]


# ── GET /consumos/serie-temporal ──────────────────────────────

@router.get(
    "/serie-temporal",
    response_model=list[SerieTemporal],
    summary="Serie temporal de consumo",
    description="Serie mensual de consumo para gráficos de línea. Filtrable por barrio y tipo de uso.",
)
async def serie_temporal(
    barrio: Optional[str] = Query(None, description="Filtrar por barrio"),
    uso: Optional[str] = Query(None, description="Filtrar por tipo de uso"),
    agrupacion: str = Query("mensual", description="Agrupación: mensual"),
    anio: Optional[str] = Query(None, description="Filtrar por año"),
):
    """Serie temporal de consumo mensual."""
    df = _get_df()

    if anio and "fecha" in df.columns:
        df = df[df["fecha"].dt.year == int(anio)]

    # Filtros
    if barrio:
        df = df[df["barrio"].str.contains(barrio.upper(), case=False, na=False)]
    if uso:
        df = df[df["uso"].str.upper() == uso.upper()]

    if len(df) == 0:
        return []

    # Agrupar por mes
    df["periodo"] = df["fecha"].dt.to_period("M")
    serie = (
        df.groupby("periodo")
        .agg(
            consumo_litros=("consumo_litros", "sum"),
            consumo_por_contrato=("consumo_por_contrato", "mean"),
            media_movil_3m=("media_movil_3m", "mean"),
        )
        .reset_index()
    )

    return [
        SerieTemporal(
            fecha=str(row["periodo"]),
            consumo_litros=float(row["consumo_litros"]),
            consumo_por_contrato=float(row["consumo_por_contrato"]) if pd.notna(row["consumo_por_contrato"]) else None,
            media_movil_3m=float(row["media_movil_3m"]) if pd.notna(row["media_movil_3m"]) else None,
        )
        for _, row in serie.iterrows()
    ]
