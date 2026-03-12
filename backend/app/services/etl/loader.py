"""
loader.py — Carga y normalización del CSV de datos AMAEM.

Lee el archivo CSV principal de telelectura, normaliza nombres de columnas,
parsea fechas y convierte valores numéricos del formato español.
"""

import logging
from pathlib import Path

import pandas as pd

logger = logging.getLogger(__name__)


def cargar_csv(ruta_csv: str | Path) -> pd.DataFrame:
    """
    Lee el CSV de datos AMAEM y devuelve un DataFrame limpio.

    Pasos:
    1. Detección automática de encoding y separador.
    2. Normalización de nombres de columnas a snake_case.
    3. Parseo de columnas de fecha a datetime.
    4. Conversión de valores numéricos con formato español (comas de miles).

    Args:
        ruta_csv: Ruta al archivo CSV.

    Returns:
        DataFrame con datos limpios y tipados.

    Raises:
        FileNotFoundError: Si el archivo no existe.
        ValueError: Si el CSV no tiene las columnas esperadas.
    """
    ruta = Path(ruta_csv)
    if not ruta.exists():
        raise FileNotFoundError(f"Archivo CSV no encontrado: {ruta}")

    logger.info("📂 Cargando CSV desde: %s", ruta)

    # ── Intentar distintos encodings ──────────────────────────
    for encoding in ("utf-8", "latin-1", "cp1252", "iso-8859-1"):
        try:
            df = pd.read_csv(ruta, encoding=encoding, sep=None, engine="python")
            logger.info("  Encoding detectado: %s", encoding)
            break
        except (UnicodeDecodeError, pd.errors.ParserError):
            continue
    else:
        raise ValueError(f"No se pudo leer el CSV con ningún encoding conocido: {ruta}")

    logger.info("  Filas cargadas: %d | Columnas: %s", len(df), list(df.columns))

    # ── Normalizar nombres de columnas ────────────────────────
    df = _normalizar_columnas(df)

    # ── Parsear fechas ────────────────────────────────────────
    if "fecha" in df.columns:
        df["fecha"] = pd.to_datetime(df["fecha"], format="mixed", dayfirst=False)
        logger.info("  Columna 'fecha' parseada a datetime.")

    # ── Convertir valores numéricos (formato español) ─────────
    for col in ("consumo_litros", "n_contratos"):
        if col in df.columns:
            df[col] = _parsear_numero_espanol(df[col])
            logger.info("  Columna '%s' convertida a numérico.", col)

    logger.info("✅ CSV cargado correctamente: %d filas × %d columnas", *df.shape)
    return df


def _normalizar_columnas(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normaliza nombres de columnas:
    - Minúsculas, sin tildes, sin caracteres especiales.
    - Espacios → guiones bajos.
    - Mapeo específico para columnas conocidas del CSV AMAEM.
    """
    import unicodedata

    def limpiar_nombre(nombre: str) -> str:
        # Quitar tildes
        nombre = unicodedata.normalize("NFD", nombre)
        nombre = "".join(c for c in nombre if unicodedata.category(c) != "Mn")
        # Minúsculas, reemplazar espacios y paréntesis
        nombre = nombre.lower().strip()
        nombre = nombre.replace(" ", "_").replace("(", "").replace(")", "")
        nombre = nombre.replace("/", "_").replace("º", "")
        nombre = nombre.replace("__", "_").strip("_")
        return nombre

    df.columns = [limpiar_nombre(c) for c in df.columns]

    # Mapeo específico para columnas conocidas
    mapeo = {
        "fecha_aaaa_mm_dd": "fecha",
        "consumo_litros": "consumo_litros",
        "n_contratos": "n_contratos",
    }
    df = df.rename(columns=mapeo)

    return df


def _parsear_numero_espanol(serie: pd.Series) -> pd.Series:
    """
    Convierte una serie con formato numérico español a float.

    Maneja:
    - Comas como separador de miles: "29,205,005" → 29205005.0
    - Cadenas con comillas: '"511,019"' → 511019.0
    """
    if serie.dtype in ("float64", "int64"):
        return serie.astype(float)

    return pd.to_numeric(
        serie.astype(str).str.replace('"', "").str.replace(",", ""),
        errors="coerce",
    )
