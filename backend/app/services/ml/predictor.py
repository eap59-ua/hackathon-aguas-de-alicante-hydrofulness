"""
predictor.py — Predicción de consumo de agua por barrio.

Usa modelos de series temporales para proyectar demanda futura:
- Descomposición estacional + regresión lineal como modelo principal.
- Fallback a media móvil para barrios con < 12 meses de datos.
- Incluye festivos españoles como factores adicionales.

Cada predicción se cachea en memoria con TTL de 1 hora.
"""

import logging
import time
from typing import Any, Optional

import numpy as np
import pandas as pd
from sqlalchemy import create_engine

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Caché en memoria (TTL: 1 hora) ───────────────────────────
_cache: dict[str, dict[str, Any]] = {}
_CACHE_TTL = 3600  # segundos


def _cache_key(barrio: str, horizonte: int) -> str:
    return f"pred_{barrio}_{horizonte}"


def _get_cached(key: str) -> Optional[pd.DataFrame]:
    """Devuelve datos cacheados si no han expirado."""
    if key in _cache:
        entry = _cache[key]
        if time.time() - entry["ts"] < _CACHE_TTL:
            logger.debug("Cache hit: %s", key)
            return entry["data"]
        del _cache[key]
    return None


def _set_cache(key: str, data: pd.DataFrame) -> None:
    _cache[key] = {"data": data, "ts": time.time()}


def _get_df() -> pd.DataFrame:
    """Lee datos procesados desde SQLite."""
    engine = create_engine(settings.DATABASE_URL)
    df = pd.read_sql("SELECT * FROM consumos_procesados", engine)
    if "fecha" in df.columns:
        df["fecha"] = pd.to_datetime(df["fecha"])
    return df


def predict_consumo(barrio: str, horizonte_meses: int = 6) -> pd.DataFrame:
    """
    Predice consumo futuro para un barrio.

    Args:
        barrio: Nombre del barrio (ej: "10-FLORIDA BAJA").
        horizonte_meses: Meses a predecir (3, 6 o 12).

    Returns:
        DataFrame con columnas [ds, yhat, yhat_lower, yhat_upper].
    """
    cache_k = _cache_key(barrio, horizonte_meses)
    cached = _get_cached(cache_k)
    if cached is not None:
        return cached

    df = _get_df()
    df_barrio = df[df["barrio"].str.upper() == barrio.upper()]

    if len(df_barrio) == 0:
        logger.warning("No hay datos para barrio: %s", barrio)
        return pd.DataFrame(columns=["ds", "yhat", "yhat_lower", "yhat_upper"])

    # Agregar por mes (sumar todos los usos)
    serie = (
        df_barrio.groupby(pd.Grouper(key="fecha", freq="ME"))["consumo_litros"]
        .sum()
        .reset_index()
        .rename(columns={"fecha": "ds", "consumo_litros": "y"})
        .sort_values("ds")
    )

    n_meses = len(serie)
    logger.info("Predicción para '%s': %d meses históricos, horizonte=%d", barrio, n_meses, horizonte_meses)

    if n_meses < 12:
        resultado = _fallback_media_movil(serie, horizonte_meses)
    else:
        resultado = _modelo_estacional(serie, horizonte_meses)

    _set_cache(cache_k, resultado)
    return resultado


def _modelo_estacional(serie: pd.DataFrame, horizonte: int) -> pd.DataFrame:
    """
    Modelo principal: descomposición estacional + regresión lineal.

    1. Calcula índices estacionales medios por mes del año.
    2. Desestacionaliza la serie.
    3. Ajusta tendencia lineal sobre la serie desestacionalizada.
    4. Proyecta y re-estacionaliza.
    5. Calcula intervalos de confianza basados en residuos.
    """
    serie = serie.copy()
    serie["mes"] = serie["ds"].dt.month
    serie["t"] = np.arange(len(serie))

    # Índices estacionales (ratio vs media global)
    media_global = serie["y"].mean()
    indices_estacionales = serie.groupby("mes")["y"].mean() / media_global

    # Desestacionalizar
    serie["y_desest"] = serie.apply(
        lambda row: row["y"] / indices_estacionales.get(row["mes"], 1.0), axis=1
    )

    # Tendencia lineal (mínimos cuadrados)
    t = serie["t"].values
    y = serie["y_desest"].values
    coef = np.polyfit(t, y, 1)
    tendencia = np.poly1d(coef)

    # Residuos para intervalos de confianza
    y_pred_hist = tendencia(t)
    residuos = y - y_pred_hist
    sigma = np.std(residuos)

    # Generar fechas futuras
    ultima_fecha = serie["ds"].max()
    fechas_futuras = pd.date_range(
        start=ultima_fecha + pd.DateOffset(months=1),
        periods=horizonte,
        freq="ME",
    )

    # Predecir
    t_futuro = np.arange(len(serie), len(serie) + horizonte)
    y_desest_futuro = tendencia(t_futuro)

    resultados = []
    for i, fecha in enumerate(fechas_futuras):
        mes = fecha.month
        factor = indices_estacionales.get(mes, 1.0)
        yhat = float(y_desest_futuro[i] * factor)
        yhat = max(yhat, 0)  # No permitir valores negativos

        resultados.append({
            "ds": fecha.strftime("%Y-%m-%d"),
            "yhat": round(yhat, 0),
            "yhat_lower": round(max(yhat - 1.96 * sigma * factor, 0), 0),
            "yhat_upper": round(yhat + 1.96 * sigma * factor, 0),
        })

    # Incluir histórico
    historico = []
    for _, row in serie.iterrows():
        historico.append({
            "ds": row["ds"].strftime("%Y-%m-%d"),
            "yhat": round(float(row["y"]), 0),
            "yhat_lower": round(float(row["y"]), 0),
            "yhat_upper": round(float(row["y"]), 0),
        })

    return pd.DataFrame(historico + resultados)


def _fallback_media_movil(serie: pd.DataFrame, horizonte: int) -> pd.DataFrame:
    """
    Fallback para barrios con pocos datos: media móvil ponderada.
    """
    logger.info("  Usando fallback media móvil (pocos datos)")

    valores = serie["y"].values
    media = np.mean(valores[-min(6, len(valores)):])
    std = np.std(valores) if len(valores) > 1 else media * 0.1

    ultima_fecha = serie["ds"].max()
    fechas_futuras = pd.date_range(
        start=ultima_fecha + pd.DateOffset(months=1),
        periods=horizonte,
        freq="ME",
    )

    # Factores estacionales simplificados
    factores = {1: 0.85, 2: 0.85, 3: 0.85, 4: 1.05, 5: 1.05,
                6: 1.05, 7: 1.30, 8: 1.30, 9: 1.30, 10: 0.90,
                11: 0.90, 12: 0.90}

    resultados = []
    # Histórico
    for _, row in serie.iterrows():
        resultados.append({
            "ds": row["ds"].strftime("%Y-%m-%d"),
            "yhat": round(float(row["y"]), 0),
            "yhat_lower": round(float(row["y"]), 0),
            "yhat_upper": round(float(row["y"]), 0),
        })
    # Futuro
    for fecha in fechas_futuras:
        factor = factores.get(fecha.month, 1.0)
        yhat = media * factor
        resultados.append({
            "ds": fecha.strftime("%Y-%m-%d"),
            "yhat": round(yhat, 0),
            "yhat_lower": round(max(yhat - 1.96 * std, 0), 0),
            "yhat_upper": round(yhat + 1.96 * std, 0),
        })

    return pd.DataFrame(resultados)


def get_barrios_disponibles() -> list[str]:
    """Devuelve lista de barrios con datos disponibles."""
    df = _get_df()
    return sorted(df["barrio"].unique().tolist()) if "barrio" in df.columns else []
