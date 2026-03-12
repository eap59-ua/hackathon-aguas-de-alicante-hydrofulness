"""
cleaner.py — Limpieza y validación de datos AMAEM.

Elimina duplicados, maneja valores nulos, detecta y marca outliers,
y normaliza valores categóricos.
"""

import logging

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def limpiar_datos(df: pd.DataFrame) -> pd.DataFrame:
    """
    Limpia el DataFrame de datos AMAEM.

    Pasos:
    1. Eliminar filas completamente duplicadas.
    2. Manejar valores nulos (interpolación / valor por defecto).
    3. Detectar y marcar outliers con IQR (consumos extremos).
    4. Normalizar valores categóricos.

    Args:
        df: DataFrame cargado por el loader.

    Returns:
        DataFrame limpio con columna 'es_outlier' añadida.
    """
    total_inicial = len(df)
    logger.info("🧹 Iniciando limpieza de datos (%d registros)", total_inicial)

    # ── 1. Eliminar duplicados ────────────────────────────────
    duplicados = df.duplicated().sum()
    df = df.drop_duplicates()
    logger.info("  Duplicados eliminados: %d", duplicados)

    # ── 2. Manejar valores nulos ──────────────────────────────
    df = _manejar_nulos(df)

    # ── 3. Detectar outliers ──────────────────────────────────
    df = _detectar_outliers(df)

    # ── 4. Normalizar categóricos ─────────────────────────────
    df = _normalizar_categoricos(df)

    logger.info(
        "✅ Limpieza completada: %d → %d registros (%d eliminados)",
        total_inicial,
        len(df),
        total_inicial - len(df),
    )
    return df


def _manejar_nulos(df: pd.DataFrame) -> pd.DataFrame:
    """Maneja valores nulos según el tipo de columna."""
    nulos_antes = df.isnull().sum().sum()

    # Columnas numéricas: interpolación lineal
    columnas_numericas = df.select_dtypes(include=[np.number]).columns
    for col in columnas_numericas:
        nulos_col = df[col].isnull().sum()
        if nulos_col > 0:
            df[col] = df[col].interpolate(method="linear").fillna(0)
            logger.info("    '%s': %d nulos interpolados", col, nulos_col)

    # Columnas categóricas: valor por defecto
    columnas_categoricas = df.select_dtypes(include=["object"]).columns
    for col in columnas_categoricas:
        nulos_col = df[col].isnull().sum()
        if nulos_col > 0:
            df[col] = df[col].fillna("DESCONOCIDO")
            logger.info("    '%s': %d nulos → 'DESCONOCIDO'", col, nulos_col)

    nulos_despues = df.isnull().sum().sum()
    logger.info("  Nulos tratados: %d → %d", nulos_antes, nulos_despues)
    return df


def _detectar_outliers(df: pd.DataFrame) -> pd.DataFrame:
    """
    Detecta outliers en la columna 'consumo_litros' usando el método IQR.

    Un valor es outlier si supera Q3 + 3*IQR.
    Añade columnas:
    - 'es_outlier': bool
    - 'severidad_outlier': 'NORMAL' | 'ALTO' | 'CRITICO'
    """
    df["es_outlier"] = False
    df["severidad_outlier"] = "NORMAL"

    if "consumo_litros" not in df.columns:
        logger.warning("  Columna 'consumo_litros' no encontrada, omitiendo detección de outliers")
        return df

    consumo = df["consumo_litros"]
    q1 = consumo.quantile(0.25)
    q3 = consumo.quantile(0.75)
    iqr = q3 - q1

    umbral_alto = q3 + 3 * iqr
    umbral_critico = q3 + 5 * iqr

    # Marcar outliers
    mask_alto = consumo > umbral_alto
    mask_critico = consumo > umbral_critico

    df.loc[mask_alto, "es_outlier"] = True
    df.loc[mask_alto & ~mask_critico, "severidad_outlier"] = "ALTO"
    df.loc[mask_critico, "severidad_outlier"] = "CRITICO"

    n_altos = (mask_alto & ~mask_critico).sum()
    n_criticos = mask_critico.sum()
    logger.info(
        "  Outliers detectados: %d ALTOS + %d CRÍTICOS (umbral IQR: Q3+3×IQR = %.0f L)",
        n_altos,
        n_criticos,
        umbral_alto,
    )
    return df


def _normalizar_categoricos(df: pd.DataFrame) -> pd.DataFrame:
    """Normaliza valores categóricos: mayúsculas, sin espacios extra."""
    if "barrio" in df.columns:
        df["barrio"] = df["barrio"].str.strip().str.upper()
        n_barrios = df["barrio"].nunique()
        logger.info("  Barrios normalizados: %d únicos", n_barrios)

    if "uso" in df.columns:
        df["uso"] = df["uso"].str.strip().str.upper()
        usos = df["uso"].unique().tolist()
        logger.info("  Tipos de uso: %s", usos)

    return df
