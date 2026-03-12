"""
Configuración central de la aplicación.

Lee variables de entorno desde .env y expone un objeto Settings.
"""

from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración de la aplicación, leída desde variables de entorno."""

    # Base de datos
    DATABASE_URL: str = "sqlite:///./hydrofulness.db"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    # Debug
    DEBUG: bool = True

    # Ruta a los datos CSV
    DATA_DIR: str = str(Path(__file__).resolve().parent.parent.parent.parent / "data")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
