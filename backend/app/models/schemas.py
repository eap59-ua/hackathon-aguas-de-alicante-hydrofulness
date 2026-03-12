"""
schemas.py — Modelos Pydantic para request/response de la API Hydrofulness.

Define los esquemas de datos para todos los endpoints:
consumos, anomalías e índice de estrés hídrico.
"""

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ── Enums ─────────────────────────────────────────────────────

class TipoUso(str, Enum):
    """Tipos de uso del agua."""
    DOMESTICO = "DOMESTICO"
    COMERCIAL = "COMERCIAL"
    NO_DOMESTICO = "NO DOMESTICO"


class NivelEstres(str, Enum):
    """Niveles del índice de estrés hídrico."""
    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"
    CRITICO = "CRITICO"


class SeveridadAnomalia(str, Enum):
    """Severidad de las anomalías detectadas."""
    NORMAL = "NORMAL"
    ALTO = "ALTO"
    CRITICO = "CRITICO"


# ── Consumos ──────────────────────────────────────────────────

class ConsumoItem(BaseModel):
    """Registro individual de consumo."""
    barrio: str = Field(..., description="Nombre del barrio")
    uso: str = Field(..., description="Tipo de uso: DOMESTICO, COMERCIAL, NO DOMESTICO")
    fecha: str = Field(..., description="Fecha del registro (YYYY-MM-DD)")
    consumo_litros: float = Field(..., description="Consumo en litros")
    n_contratos: int = Field(..., description="Número de contratos")
    consumo_por_contrato: Optional[float] = Field(None, description="Litros por contrato")
    es_outlier: Optional[bool] = Field(False, description="Si es anomalía")


class ConsumosPaginados(BaseModel):
    """Respuesta paginada de consumos."""
    total: int = Field(..., description="Total de registros")
    page: int = Field(..., description="Página actual")
    size: int = Field(..., description="Registros por página")
    pages: int = Field(..., description="Total de páginas")
    data: list[ConsumoItem] = Field(..., description="Lista de registros")


class ResumenKPIs(BaseModel):
    """KPIs globales de consumo."""
    consumo_total: float = Field(..., description="Consumo total en litros")
    consumo_medio_mensual: float = Field(..., description="Media mensual en litros")
    tendencia_pct: float = Field(..., description="Tendencia % (último vs penúltimo periodo)")
    total_registros: int = Field(..., description="Total de registros en BD")
    total_barrios: int = Field(..., description="Número de barrios")
    fecha_min: str = Field(..., description="Fecha más antigua")
    fecha_max: str = Field(..., description="Fecha más reciente")


class ConsumoZona(BaseModel):
    """Consumo agregado por zona/barrio."""
    barrio: str
    consumo_total: float
    consumo_medio: float
    n_contratos_total: int
    n_registros: int


class ConsumoTipologia(BaseModel):
    """Distribución de consumo por tipología de uso."""
    uso: str
    consumo_total: float
    porcentaje: float
    n_registros: int


class SerieTemporal(BaseModel):
    """Punto de una serie temporal."""
    fecha: str
    consumo_litros: float
    consumo_por_contrato: Optional[float] = None
    media_movil_3m: Optional[float] = None


# ── Anomalías ─────────────────────────────────────────────────

class AnomaliaItem(BaseModel):
    """Registro de anomalía de consumo."""
    barrio: str
    uso: str
    fecha: str
    consumo_litros: float
    severidad: str = Field(..., description="ALTO o CRITICO")
    consumo_por_contrato: Optional[float] = None
    n_contratos: int = 0


class ResumenAnomalias(BaseModel):
    """Resumen de anomalías por zona y severidad."""
    total_anomalias: int
    por_severidad: dict[str, int]
    por_barrio: dict[str, int]


# ── Índice de Estrés Hídrico ─────────────────────────────────

class EstresHidrico(BaseModel):
    """Índice de estrés hídrico por zona."""
    barrio: str
    indice: float = Field(..., description="Valor del índice (0-100+)")
    nivel: NivelEstres = Field(..., description="Nivel: BAJO, MEDIO, ALTO, CRITICO")
    color_hex: str = Field(..., description="Color del semáforo (#hex)")
    tendencia: float = Field(..., description="Tendencia % vs periodo anterior")
    consumo_actual: float = Field(..., description="Consumo del último periodo")
    consumo_medio_historico: float = Field(..., description="Media histórica")


class EstresHidricoMapa(BaseModel):
    """Datos de estrés hídrico para visualización en mapa."""
    barrio: str
    indice: float
    nivel: str
    color_hex: str


# ── ETL ───────────────────────────────────────────────────────

class ETLStatus(BaseModel):
    """Estado del pipeline ETL."""
    status: str
    mensaje: str
    inicio: Optional[str] = None
    fin: Optional[str] = None
    duracion_seg: Optional[float] = None
    informe: Optional[dict] = None
