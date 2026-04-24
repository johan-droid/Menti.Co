"""
Menti.Co — Mental Health Research Library API
Application factory with proper lifespan management.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from dependencies import init_db_pool, close_db_pool, get_db_pool
from models import HealthResponse

# Configure structured logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("mentico")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""

    # 1. Initialize database connection pool
    try:
        init_db_pool(settings.DATABASE_URL)
        logger.info("Database pool ready")
    except Exception as e:
        logger.error("Database pool failed: %s", e)

    # 2. Load ML models onto app.state (not global vars)
    try:
        logger.info("Loading embedding model (all-MiniLM-L6-v2)...")
        from sentence_transformers import SentenceTransformer, CrossEncoder

        app.state.embed_model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Loading cross-encoder (ms-marco-MiniLM-L-6-v2)...")
        app.state.cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
        logger.info("ML models loaded successfully")
    except Exception as e:
        logger.error("Failed to load ML models: %s", e)
        app.state.embed_model = None
        app.state.cross_encoder = None

    # 3. Initialize Qdrant client
    try:
        from qdrant_client import QdrantClient

        app.state.qdrant_client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            check_compatibility=False,
        )
        logger.info("Qdrant client connected to %s", settings.QDRANT_URL[:50])
    except Exception as e:
        logger.error("Qdrant connection error: %s", e)
        app.state.qdrant_client = None

    yield

    # Shutdown
    close_db_pool()
    logger.info("Application shutdown complete")


# --- App Factory ---
app = FastAPI(
    title="Menti.Co Mental Health Research Library",
    version="1.0",
    lifespan=lifespan,
)

# CORS — explicit origins, not wildcards (P0 fix)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# --- Register routers ---
from routers.papers import router as papers_router
from routers.ai import router as ai_router
from routers.disorders import router as disorders_router

app.include_router(papers_router)
app.include_router(ai_router)
app.include_router(disorders_router)


# --- Root & Health ---
@app.get("/")
async def root():
    return {
        "message": "Mental Health Research Library API – open source, no medical advice.",
        "disclaimer": "This service provides research papers for informational purposes only.",
        "status": "online",
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint for container orchestration."""
    db_status = "connected"
    try:
        pool = get_db_pool()
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
    except Exception:
        db_status = "disconnected"

    qdrant_status = "connected" if getattr(app.state, "qdrant_client", None) else "disconnected"
    models_loaded = (
        getattr(app.state, "embed_model", None) is not None
        and getattr(app.state, "cross_encoder", None) is not None
    )

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        database=db_status,
        vector_db=qdrant_status,
        models_loaded=models_loaded,
    )
