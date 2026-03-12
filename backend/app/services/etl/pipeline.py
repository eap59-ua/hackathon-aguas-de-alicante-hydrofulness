"""
pipeline.py — Orquestador del pipeline ETL completo.

Ejecuta las fases load → clean → transform en secuencia,
guarda el resultado en SQLite y genera un informe resumen.
"""

import json
import logging
import time
from pathlib import Path
from typing import Any

import pandas as pd
from sqlalchemy import create_engine

from app.core.config import settings
from app.services.etl.loader import cargar_csv
from app.services.etl.cleaner import limpiar_datos
from app.services.etl.transformer import transformar_datos

logger = logging.getLogger(__name__)

# Estado global del último proceso ETL
_ultimo_estado: dict[str, Any] = {
    "status": "idle",
    "mensaje": "No se ha ejecutado ningún proceso ETL.",
    "inicio": None,
    "fin": None,
    "duracion_seg": None,
    "informe": None,
}


def obtener_estado() -> dict[str, Any]:
    """Devuelve el estado del último proceso ETL."""
    return _ultimo_estado.copy()


def ejecutar_pipeline(ruta_csv: str | Path | None = None) -> dict[str, Any]:
    """
    Ejecuta el pipeline ETL completo: load → clean → transform → save.

    Args:
        ruta_csv: Ruta al CSV. Si es None, usa la ruta por defecto en settings.

    Returns:
        Diccionario con informe resumen del proceso.

    Raises:
        Exception: Si cualquier fase del pipeline falla.
    """
    global _ultimo_estado

    if ruta_csv is None:
        ruta_csv = Path(settings.DATA_DIR) / "datos-hackathon-amaem.csv"

    _ultimo_estado = {
        "status": "running",
        "mensaje": "Pipeline ETL en ejecución...",
        "inicio": time.strftime("%Y-%m-%d %H:%M:%S"),
        "fin": None,
        "duracion_seg": None,
        "informe": None,
    }

    inicio = time.time()

    try:
        # ── FASE 1: Cargar ────────────────────────────────────
        logger.info("═" * 60)
        logger.info("PIPELINE ETL — Inicio")
        logger.info("═" * 60)

        df = cargar_csv(ruta_csv)

        # ── FASE 2: Limpiar ───────────────────────────────────
        df = limpiar_datos(df)

        # ── FASE 3: Transformar ───────────────────────────────
        df = transformar_datos(df)

        # ── FASE 4: Guardar en SQLite ─────────────────────────
        _guardar_en_sqlite(df)

        # ── FASE 5: Generar informe ───────────────────────────
        informe = _generar_informe(df)

        duracion = round(time.time() - inicio, 2)

        _ultimo_estado = {
            "status": "success",
            "mensaje": f"Pipeline completado en {duracion}s",
            "inicio": _ultimo_estado["inicio"],
            "fin": time.strftime("%Y-%m-%d %H:%M:%S"),
            "duracion_seg": duracion,
            "informe": informe,
        }

        logger.info("═" * 60)
        logger.info("PIPELINE ETL — Completado en %.2fs", duracion)
        logger.info("═" * 60)

        return _ultimo_estado

    except Exception as e:
        duracion = round(time.time() - inicio, 2)
        _ultimo_estado = {
            "status": "error",
            "mensaje": f"Error en pipeline: {str(e)}",
            "inicio": _ultimo_estado["inicio"],
            "fin": time.strftime("%Y-%m-%d %H:%M:%S"),
            "duracion_seg": duracion,
            "informe": None,
        }
        logger.error("❌ Pipeline ETL falló: %s", e, exc_info=True)
        raise


def _guardar_en_sqlite(df: pd.DataFrame) -> None:
    """Guarda el DataFrame procesado en la tabla 'consumos_procesados' de SQLite."""
    db_url = settings.DATABASE_URL
    engine = create_engine(db_url)

    # Convertir columnas datetime a string para SQLite
    df_to_save = df.copy()
    for col in df_to_save.select_dtypes(include=["datetime64"]).columns:
        df_to_save[col] = df_to_save[col].astype(str)

    df_to_save.to_sql("consumos_procesados", engine, if_exists="replace", index=False)
    logger.info("  💾 Datos guardados en SQLite: tabla 'consumos_procesados' (%d filas)", len(df))


def _generar_informe(df: pd.DataFrame) -> dict[str, Any]:
    """Genera un informe resumen del proceso ETL."""
    informe: dict[str, Any] = {
        "total_registros": len(df),
    }

    # Rango de fechas
    if "fecha" in df.columns:
        informe["fecha_min"] = str(df["fecha"].min())
        informe["fecha_max"] = str(df["fecha"].max())

    # Distribución por barrio
    if "barrio" in df.columns:
        dist_barrio = (
            df.groupby("barrio")["consumo_litros"]
            .sum()
            .sort_values(ascending=False)
            .head(10)
            .to_dict()
        )
        informe["top_10_barrios_consumo"] = {k: int(v) for k, v in dist_barrio.items()}
        informe["total_barrios"] = df["barrio"].nunique()

    # Distribución por uso
    if "uso" in df.columns:
        informe["distribucion_uso"] = (
            df.groupby("uso")["consumo_litros"].sum().to_dict()
        )

    # Anomalías
    if "es_outlier" in df.columns:
        n_outliers = df["es_outlier"].sum()
        informe["anomalias_detectadas"] = int(n_outliers)
        if "severidad_outlier" in df.columns:
            informe["anomalias_por_severidad"] = (
                df[df["es_outlier"]]
                .groupby("severidad_outlier")
                .size()
                .to_dict()
            )

    # Consumo total
    if "consumo_litros" in df.columns:
        informe["consumo_total_litros"] = int(df["consumo_litros"].sum())
        informe["consumo_medio_mensual"] = int(df["consumo_litros"].mean())

    logger.info("  📊 Informe generado: %s", json.dumps(informe, indent=2, default=str))
    return informe
