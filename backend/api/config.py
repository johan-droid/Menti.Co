"""
Menti.Co API Configuration
Centralized settings with validation via pydantic-settings.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database (Neon PostgreSQL)
    DATABASE_URL: str = ""

    # Vector Search (Qdrant Cloud)
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str | None = None

    # AI / LLM Config
    LLM_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    MODEL_NAME: str = "llama3:8b"

    # API Config
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    API_PORT: int = 4000
    DEBUG: bool = True

    # Rate limiting
    AI_RATE_LIMIT_PER_MINUTE: int = 30

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
