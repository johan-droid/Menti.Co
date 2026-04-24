"""
Disorders router — public endpoint for mental health disorder library.
"""
import logging

from fastapi import APIRouter, Depends, HTTPException
from psycopg_pool import ConnectionPool

from dependencies import get_db_pool
from models import DisordersResponse, Disorder

logger = logging.getLogger(__name__)
router = APIRouter(tags=["disorders"], prefix="/v1/public")


@router.get("/disorders", response_model=DisordersResponse)
async def get_disorders(
    pool: ConnectionPool = Depends(get_db_pool),
):
    """Retrieve all mental health disorders from the library."""
    try:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, description, ai_summary FROM disorders ORDER BY name"
                )
                rows = cur.fetchall()

        disorders = [
            Disorder(
                id=row[0],
                name=row[1],
                description=row[2],
                ai_summary=row[3],
            )
            for row in rows
        ]

        return DisordersResponse(ok=True, data=disorders)

    except Exception as e:
        logger.error("Failed to fetch disorders: %s", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve disorders")
