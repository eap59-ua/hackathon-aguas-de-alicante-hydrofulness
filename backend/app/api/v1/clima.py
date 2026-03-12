import logging
from fastapi import APIRouter
from app.services.etl.pluviometria import get_balance_hidrico

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get(
    "/balance-hidrico",
    summary="Balance hídrico mensual (Multi-Fuente)",
    description="Combina consumo real con datos pluviométricos y Evapotranspiración (ET0) para calcular déficit hídrico.",
)
def balance_hidrico_endpoint(barrio: str, anio: int):
    """Devuelve el cruce de consumo vs lluvia vs Evapotranspiración."""
    try:
        return get_balance_hidrico(barrio, anio)
    except Exception as e:
        logger.error(f"Error balance hidrico: {e}")
        return {"error": str(e)}
