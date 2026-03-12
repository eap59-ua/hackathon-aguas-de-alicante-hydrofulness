"""
anomaly_detector.py — Detección de anomalías multivariante con Isolation Forest.

Detecta patrones de consumo anómalos usando features:
consumo_litros, consumo_por_contrato, variacion_mensual_pct, mes del año.

Clasificación por severidad:
  score > 0.8 → CRITICA (#EF4444)
  score > 0.6 → ALTA    (#F59E0B)
  score > 0.4 → MEDIA   (#FCD34D)
  score ≤ 0.4 → BAJA    (#10B981)
"""

import logging
import time
from typing import Any, Optional

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sqlalchemy import create_engine

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Caché ─────────────────────────────────────────────────────
_cache: dict[str, dict[str, Any]] = {}
_CACHE_TTL = 3600


def _get_df() -> pd.DataFrame:
    engine = create_engine(settings.DATABASE_URL)
    df = pd.read_sql("SELECT * FROM consumos_procesados", engine)
    if "fecha" in df.columns:
        df["fecha"] = pd.to_datetime(df["fecha"])
    return df


_SEVERITY_MAP = {
    "CRITICA": {"color": "#EF4444", "min_score": 0.8},
    "ALTA":    {"color": "#F59E0B", "min_score": 0.6},
    "MEDIA":   {"color": "#FCD34D", "min_score": 0.4},
    "BAJA":    {"color": "#10B981", "min_score": 0.0},
}


def _classify_severity(score: float) -> tuple[str, str]:
    """Clasifica la severidad según el anomaly score."""
    if score > 0.8:
        return "CRITICA", "#EF4444"
    elif score > 0.6:
        return "ALTA", "#F59E0B"
    elif score > 0.4:
        return "MEDIA", "#FCD34D"
    else:
        return "BAJA", "#10B981"


def detect_anomalies(barrio: Optional[str] = None) -> list[dict[str, Any]]:
    """
    Detecta anomalías de consumo usando Isolation Forest.

    Args:
        barrio: Si se especifica, filtra por ese barrio.

    Returns:
        Lista de diccionarios con las anomalías detectadas y su severidad.
    """
    cache_key = f"anomalias_{barrio or 'all'}"
    if cache_key in _cache and time.time() - _cache[cache_key]["ts"] < _CACHE_TTL:
        return _cache[cache_key]["data"]

    df = _get_df()

    if barrio:
        df = df[df["barrio"].str.upper() == barrio.upper()]

    if len(df) < 10:
        logger.warning("Datos insuficientes para detección de anomalías (%d filas)", len(df))
        return []

    # Preparar features
    feature_cols = []
    for col in ["consumo_litros", "consumo_por_contrato", "variacion_mensual_pct"]:
        if col in df.columns:
            feature_cols.append(col)

    if "fecha" in df.columns:
        df["mes_ano"] = df["fecha"].dt.month
        feature_cols.append("mes_ano")

    if not feature_cols:
        logger.warning("No hay columnas de features disponibles")
        return []

    # Rellenar NaN en features
    X = df[feature_cols].fillna(0).values

    # Escalar
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Isolation Forest
    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42,
        n_jobs=-1,
    )
    predictions = model.fit_predict(X_scaled)
    raw_scores = model.decision_function(X_scaled)

    # Normalizar scores a [0, 1] (más alto = más anómalo)
    min_score = raw_scores.min()
    max_score = raw_scores.max()
    score_range = max_score - min_score if max_score != min_score else 1
    anomaly_scores = 1 - (raw_scores - min_score) / score_range

    df["is_anomaly"] = predictions == -1
    df["anomaly_score"] = anomaly_scores

    # Filtrar solo anomalías
    anomalias = df[df["is_anomaly"]].copy()
    anomalias = anomalias.sort_values("anomaly_score", ascending=False)

    resultados = []
    for _, row in anomalias.iterrows():
        score = float(row["anomaly_score"])
        severidad, color = _classify_severity(score)

        resultados.append({
            "barrio": row.get("barrio", ""),
            "uso": row.get("uso", ""),
            "fecha": str(row.get("fecha", ""))[:10],
            "consumo_litros": float(row.get("consumo_litros", 0)),
            "consumo_por_contrato": float(row.get("consumo_por_contrato", 0)) if pd.notna(row.get("consumo_por_contrato")) else None,
            "anomaly_score": round(score, 3),
            "severidad": severidad,
            "color_hex": color,
            "n_contratos": int(row.get("n_contratos", 0)),
        })

    logger.info("Anomalías detectadas: %d (barrio=%s)", len(resultados), barrio or "todos")
    _cache[cache_key] = {"data": resultados, "ts": time.time()}
    return resultados
