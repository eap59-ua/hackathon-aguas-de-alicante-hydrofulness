import logging
from fastapi import APIRouter
from app.services.analytics.ranking import get_ranking_ciudadano

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get(
    "/sostenibilidad", 
    summary="Leaderboard de Sostenibilidad Ciudadano",
    description="Ranking de barrios por puntuación de sostenibilidad (gamificación)."
)
def ranking_sostenibilidad():
    """Devuelve la puntuación gamificada de 0 a 100 y medallas."""
    try:
        return get_ranking_ciudadano()
    except Exception as e:
        logger.error(f"Error ranking: {e}")
        return {"error": str(e)}

@router.get(
    "/sostenibilidad/{barrio}",
    summary="Detalle Ranking Sostenibilidad por Barrio"
)
def ranking_barrio(barrio: str):
    data = get_ranking_ciudadano()
    ranking = data.get("ranking", [])
    
    for r in ranking:
        if r["barrio"].upper() == barrio.upper():
            return {
                "barrio": r,
                "media_ciudad": data.get("media_ciudad", 0),
                "mejor_barrio": data.get("mejor_barrio", "")
            }
    
    return {"error": f"Barrio {barrio} no encontrado"}
