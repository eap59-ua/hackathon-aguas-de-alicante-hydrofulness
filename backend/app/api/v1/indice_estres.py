"""
indice_estres.py — Endpoints REST para el índice de estrés hídrico.

Calcula un índice dinámico por zona que combina consumo actual,
media histórica y factor de estacionalidad.

Fórmula: (consumo_actual / consumo_medio_historico) × factor_estacionalidad × 100
"""

import logging

from fastapi import APIRouter
from sqlalchemy import create_engine

import numpy as np
import pandas as pd

from app.core.config import settings
from app.models.schemas import EstresHidrico, EstresHidricoMapa, NivelEstres
from app.services.ml.stress_index import calcular_estres_cientifico, calcular_resumen_ciudad

logger = logging.getLogger(__name__)

router = APIRouter()

# Colores del semáforo
_COLORES = {
    NivelEstres.BAJO: "#10B981",      # Verde — Sostenibilidad
    NivelEstres.MEDIO: "#F59E0B",     # Ámbar — Alerta
    NivelEstres.ALTO: "#EF4444",      # Rojo — Peligro
    NivelEstres.CRITICO: "#7F1D1D",   # Rojo oscuro — Crítico
}

# Factores de estacionalidad (verano > invierno)
_FACTORES_ESTACIONALIDAD = {
    "INVIERNO": 0.85,
    "PRIMAVERA": 1.00,
    "VERANO": 1.25,
    "OTONO": 0.95,
}


def _get_df() -> pd.DataFrame:
    """Lee los datos procesados desde SQLite."""
    engine = create_engine(settings.DATABASE_URL)
    df = pd.read_sql("SELECT * FROM consumos_procesados", engine)
    if "fecha" in df.columns:
        df["fecha"] = pd.to_datetime(df["fecha"])
    return df


def _clasificar_nivel(indice: float) -> NivelEstres:
    """Clasifica el índice de estrés en un nivel."""
    if indice <= 70:
        return NivelEstres.BAJO
    elif indice <= 100:
        return NivelEstres.MEDIO
    elif indice <= 130:
        return NivelEstres.ALTO
    else:
        return NivelEstres.CRITICO


def _calcular_estres_por_zona(df: pd.DataFrame) -> list[dict]:
    """
    Calcula el índice de estrés hídrico para cada barrio.

    Fórmula:
        indice = (consumo_ultimo_periodo / consumo_medio_historico)
                 × factor_estacionalidad × 100

    Devuelve una lista de diccionarios con los datos por zona.
    """
    resultados = []

    if "fecha" not in df.columns or "barrio" not in df.columns:
        return resultados

    # Determinar último periodo y estación
    ultima_fecha = df["fecha"].max()
    ultimo_mes = ultima_fecha.month

    # Mapear mes a estación
    estaciones_mes = {1: "INVIERNO", 2: "INVIERNO", 3: "PRIMAVERA",
                      4: "PRIMAVERA", 5: "PRIMAVERA", 6: "VERANO",
                      7: "VERANO", 8: "VERANO", 9: "OTONO",
                      10: "OTONO", 11: "OTONO", 12: "INVIERNO"}
    estacion_actual = estaciones_mes.get(ultimo_mes, "PRIMAVERA")
    factor_estacion = _FACTORES_ESTACIONALIDAD.get(estacion_actual, 1.0)

    # Último periodo = último mes con datos
    ultimo_periodo = df["fecha"].dt.to_period("M").max()
    penultimo_periodo = ultimo_periodo - 1

    for barrio in df["barrio"].unique():
        df_barrio = df[df["barrio"] == barrio]

        # Consumo medio histórico
        consumo_medio = float(df_barrio["consumo_litros"].mean())
        if consumo_medio == 0:
            continue

        # Consumo del último periodo
        df_ultimo = df_barrio[df_barrio["fecha"].dt.to_period("M") == ultimo_periodo]
        consumo_actual = float(df_ultimo["consumo_litros"].sum()) if len(df_ultimo) > 0 else 0

        # Consumo del penúltimo periodo (para tendencia)
        df_penultimo = df_barrio[df_barrio["fecha"].dt.to_period("M") == penultimo_periodo]
        consumo_anterior = float(df_penultimo["consumo_litros"].sum()) if len(df_penultimo) > 0 else 0

        # Calcular índice
        if consumo_medio > 0:
            indice = (consumo_actual / consumo_medio) * factor_estacion * 100
        else:
            indice = 0

        # Tendencia
        tendencia = 0.0
        if consumo_anterior > 0:
            tendencia = round(((consumo_actual - consumo_anterior) / consumo_anterior) * 100, 2)

        nivel = _clasificar_nivel(indice)

        resultados.append({
            "barrio": barrio,
            "indice": round(indice, 2),
            "nivel": nivel,
            "color_hex": _COLORES[nivel],
            "tendencia": tendencia,
            "consumo_actual": consumo_actual,
            "consumo_medio_historico": round(consumo_medio, 2),
        })

    # Ordenar por índice descendente
    resultados.sort(key=lambda x: x["indice"], reverse=True)
    return resultados


# ── GET /estres-hidrico ───────────────────────────────────────

@router.get(
    "",
    response_model=list[EstresHidrico],
    summary="Índice de estrés hídrico por zona",
    description=(
        "Calcula el índice de estrés hídrico para cada barrio de Alicante. "
        "El índice combina consumo actual, media histórica y estacionalidad. "
        "Valores: <70 BAJO, 70-100 MEDIO, 100-130 ALTO, >130 CRÍTICO."
    ),
)
async def estres_hidrico():
    """Índice de estrés hídrico por zona."""
    df = _get_df()
    resultados = _calcular_estres_por_zona(df)

    return [
        EstresHidrico(
            barrio=r["barrio"],
            indice=r["indice"],
            nivel=r["nivel"],
            color_hex=r["color_hex"],
            tendencia=r["tendencia"],
            consumo_actual=r["consumo_actual"],
            consumo_medio_historico=r["consumo_medio_historico"],
        )
        for r in resultados
    ]


# ── GET /estres-hidrico/mapa ──────────────────────────────────

@router.get(
    "/mapa",
    response_model=list[EstresHidricoMapa],
    summary="Datos de estrés hídrico para mapa",
    description="Array simplificado de zonas con índice y color para renderizar en un mapa de calor.",
)
async def estres_hidrico_mapa():
    """Datos simplificados para el mapa de calor."""
    df = _get_df()
    resultados = _calcular_estres_por_zona(df)

    return [
        EstresHidricoMapa(
            barrio=r["barrio"],
            indice=r["indice"],
            nivel=r["nivel"].value if hasattr(r["nivel"], "value") else r["nivel"],
            color_hex=r["color_hex"],
        )
        for r in resultados
    ]

# ── GET /estres-hidrico/cientifico ────────────────────────────

@router.get(
    "/cientifico",
    summary="Índice de Estrés Hídrico Científico (WEI+ Adaptado)",
    description=(
        "Calcula el IEH usando una adaptación a escala urbana del Water Exploitation Index plus (WEI+), "
        "metodología oficial de la Agencia Europea de Medio Ambiente."
    ),
)
async def estres_hidrico_cientifico(barrio: str):
    """Índice WEI+ adaptado para un barrio."""
    return calcular_estres_cientifico(barrio)


# ── GET /estres-hidrico/resumen-ciudad ────────────────────────

@router.get(
    "/resumen-ciudad",
    summary="Resumen de Estrés Hídrico Ciudad (WEI+)",
    description="Media ponderada de toda la ciudad de Alicante y comparativa europea.",
)
async def estres_hidrico_resumen():
    """Media ponderada de toda Alicante + comparativa EU."""
    return calcular_resumen_ciudad()
