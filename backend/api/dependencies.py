"""
FastAPI dependency injection for database pool, ML models, and shared state.
"""
import logging
from fastapi import Request, HTTPException
from psycopg_pool import ConnectionPool

logger = logging.getLogger(__name__)

# --- Database Pool ---

_db_pool: ConnectionPool | None = None


def init_db_pool(conninfo: str) -> ConnectionPool:
    """Initialize the global connection pool. Called once at startup."""
    global _db_pool
    _db_pool = ConnectionPool(
        conninfo=conninfo,
        min_size=2,
        max_size=10,
        open=True,
    )
    logger.info("Database connection pool initialized (min=2, max=10)")
    return _db_pool


def close_db_pool():
    """Close the connection pool. Called at shutdown."""
    global _db_pool
    if _db_pool:
        _db_pool.close()
        logger.info("Database connection pool closed")
        _db_pool = None


def get_db_pool() -> ConnectionPool:
    """Get the connection pool for use in endpoints."""
    if _db_pool is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    return _db_pool


# --- ML Models ---

def get_embed_model(request: Request):
    """Dependency to retrieve the embedding model from app state."""
    model = getattr(request.app.state, "embed_model", None)
    if model is None:
        raise HTTPException(status_code=503, detail="Embedding model not loaded")
    return model


def get_cross_encoder(request: Request):
    """Dependency to retrieve the cross-encoder from app state."""
    model = getattr(request.app.state, "cross_encoder", None)
    if model is None:
        raise HTTPException(status_code=503, detail="Cross-encoder not loaded")
    return model


def get_qdrant_client(request: Request):
    """Dependency to retrieve the Qdrant client from app state."""
    client = getattr(request.app.state, "qdrant_client", None)
    if client is None:
        raise HTTPException(status_code=503, detail="Vector database unavailable")
    return client
