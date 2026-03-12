"""
Hydrofulness API — Inteligencia Predictiva para la Gestión del Estrés Hídrico.

Aplicación principal FastAPI. Punto de entrada del backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as api_v1_router


def create_app() -> FastAPI:
    """Crea y configura la aplicación FastAPI."""

    app = FastAPI(
        title="Hydrofulness API",
        description=(
            "API de inteligencia predictiva para la gestión del estrés hídrico "
            "en Alicante. Hackathon de Datos AMAEM 2026."
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS — permitir frontend en desarrollo
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Registrar routers
    app.include_router(api_v1_router, prefix="/api/v1")

    @app.get("/", tags=["health"])
    async def root():
        """Health check del servicio."""
        return {
            "service": "Hydrofulness API",
            "version": "0.1.0",
            "status": "running",
        }

    return app


app = create_app()
