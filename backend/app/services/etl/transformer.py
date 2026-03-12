"""
transformer.py — Transformaciones y métricas derivadas.

Calcula agregaciones, métricas per cápita, variaciones,
medias móviles y estacionalidad sobre los datos limpios.
"""

import logging

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def transformar_datos(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aplica transformaciones al DataFrame limpio.

    Pasos:
    1. Calcular consumo per cápita (por contrato).
    2. Calcular variación mensual porcentual.
    3. Calcular media móvil de 3 meses.
    4. Generar columnas de estacionalidad (año, mes, trimestre).

    Args:
        df: DataFrame limpio del cleaner.

    Returns:
        DataFrame enriquecido con métricas derivadas.
    """
    logger.info("🔄 Iniciando transformaciones (%d registros)", len(df))

    # ── 1. Columnas temporales ────────────────────────────────
    df = _agregar_columnas_temporales(df)

    # ── 2. Consumo per cápita (por contrato) ──────────────────
    df = _calcular_consumo_per_capita(df)

    # ── 3. Variación mensual porcentual ───────────────────────
    df = _calcular_variacion_mensual(df)

    # ── 4. Media móvil de 3 meses ─────────────────────────────
    df = _calcular_media_movil(df)

    logger.info("✅ Transformaciones completadas: %d filas × %d columnas", *df.shape)
    return df


def _agregar_columnas_temporales(df: pd.DataFrame) -> pd.DataFrame:
    """Extrae año, mes, trimestre y etiqueta de estacionalidad."""
    if "fecha" not in df.columns:
        logger.warning("  Columna 'fecha' no encontrada, omitiendo columnas temporales")
        return df

    df["anio"] = df["fecha"].dt.year
    df["mes"] = df["fecha"].dt.month
    df["trimestre"] = df["fecha"].dt.quarter

    # Etiqueta de estacionalidad
    estaciones = {1: "INVIERNO", 2: "INVIERNO", 3: "PRIMAVERA",
                  4: "PRIMAVERA", 5: "PRIMAVERA", 6: "VERANO",
                  7: "VERANO", 8: "VERANO", 9: "OTONO",
                  10: "OTONO", 11: "OTONO", 12: "INVIERNO"}
    df["estacion"] = df["mes"].map(estaciones)

    logger.info("  Columnas temporales añadidas: anio, mes, trimestre, estacion")
    return df


def _calcular_consumo_per_capita(df: pd.DataFrame) -> pd.DataFrame:
    """Calcula consumo por contrato (proxy de per cápita)."""
    if "consumo_litros" in df.columns and "n_contratos" in df.columns:
        df["consumo_por_contrato"] = np.where(
            df["n_contratos"] > 0,
            df["consumo_litros"] / df["n_contratos"],
            0,
        )
        media = df["consumo_por_contrato"].mean()
        logger.info("  Consumo por contrato calculado (media: %.0f L/contrato)", media)
    return df


def _calcular_variacion_mensual(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calcula la variación porcentual mensual del consumo
    para cada combinación barrio + uso.
    """
    if "consumo_litros" not in df.columns:
        return df

    df = df.sort_values(["barrio", "uso", "fecha"])
    df["variacion_mensual_pct"] = (
        df.groupby(["barrio", "uso"])["consumo_litros"]
        .pct_change() * 100
    )

    # Reemplazar infinitos y NaN del primer mes
    df["variacion_mensual_pct"] = df["variacion_mensual_pct"].replace(
        [np.inf, -np.inf], np.nan
    ).fillna(0)

    logger.info("  Variación mensual calculada")
    return df


def _calcular_media_movil(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calcula la media móvil de 3 meses del consumo
    para cada combinación barrio + uso.
    """
    if "consumo_litros" not in df.columns:
        return df

    df = df.sort_values(["barrio", "uso", "fecha"])
    df["media_movil_3m"] = (
        df.groupby(["barrio", "uso"])["consumo_litros"]
        .transform(lambda x: x.rolling(window=3, min_periods=1).mean())
    )

    logger.info("  Media móvil 3 meses calculada")
    return df
