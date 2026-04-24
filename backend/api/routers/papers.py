"""
Papers router — CRUD and search endpoints for research papers.
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from psycopg_pool import ConnectionPool

from dependencies import get_db_pool, get_embed_model, get_qdrant_client
from models import PaperResponse, PaperSnippet, SearchResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["papers"])


@router.get("/paper/{pubmed_id}", response_model=PaperResponse)
async def get_paper(
    pubmed_id: str,
    pool: ConnectionPool = Depends(get_db_pool),
):
    """Retrieve full metadata for a single research paper."""
    try:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT title, authors, abstract, publication_date, journal, "
                    "license, url, disorder_tags, treatment_tags "
                    "FROM papers WHERE pubmed_id = %s",
                    (pubmed_id,),
                )
                row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Paper not found")

        return PaperResponse(
            pubmed_id=pubmed_id,
            title=row[0],
            authors=row[1],
            abstract=row[2],
            publication_date=str(row[3]) if row[3] else None,
            journal=row[4],
            license=row[5],
            url=row[6],
            disorder_tags=row[7],
            treatment_tags=row[8],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to fetch paper %s: %s", pubmed_id, e)
        raise HTTPException(status_code=500, detail="Failed to retrieve paper")


@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(..., description="Search query", min_length=1),
    mode: str = Query("keyword", pattern="^(keyword|semantic)$"),
    limit: int = Query(10, ge=1, le=100),
    page: int = Query(1, ge=1),
    disorder: Optional[str] = None,
    treatment: Optional[str] = None,
    pool: ConnectionPool = Depends(get_db_pool),
    embed_model=Depends(get_embed_model),
    qdrant_client=Depends(get_qdrant_client),
):
    """Search research papers by keyword or semantic similarity."""
    offset = (page - 1) * limit
    results: list[PaperSnippet] = []

    if mode == "semantic":
        from qdrant_client.http import models

        query_vec = embed_model.encode(q).tolist()

        must_filters = []
        if disorder:
            must_filters.append(
                models.FieldCondition(
                    key="disorder_tags", match=models.MatchValue(value=disorder)
                )
            )
        if treatment:
            must_filters.append(
                models.FieldCondition(
                    key="treatment_tags", match=models.MatchValue(value=treatment)
                )
            )

        try:
            search_results = qdrant_client.search(
                collection_name="papers",
                query_vector=query_vec,
                query_filter=models.Filter(must=must_filters) if must_filters else None,
                limit=limit,
                offset=offset,
            )
        except Exception as e:
            logger.error("Qdrant search failed: %s", e)
            raise HTTPException(status_code=503, detail="Semantic search unavailable")

        for hit in search_results:
            abstract = hit.payload.get("abstract") or ""
            results.append(
                PaperSnippet(
                    pubmed_id=hit.payload.get("pubmed_id"),
                    title=hit.payload.get("title"),
                    abstract_snippet=(abstract[:300] + "...") if len(abstract) > 300 else abstract,
                    disorder_tags=hit.payload.get("disorder_tags"),
                    similarity=round(hit.score, 4),
                )
            )
    else:
        try:
            with pool.connection() as conn:
                with conn.cursor() as cur:
                    query_sql = (
                        "SELECT pubmed_id, title, abstract, publication_date, disorder_tags "
                        "FROM papers WHERE (title ILIKE %s OR abstract ILIKE %s)"
                    )
                    params: list = [f"%{q}%", f"%{q}%"]

                    if disorder:
                        query_sql += " AND %s = ANY(disorder_tags)"
                        params.append(disorder)
                    if treatment:
                        query_sql += " AND %s = ANY(treatment_tags)"
                        params.append(treatment)

                    query_sql += " ORDER BY publication_date DESC LIMIT %s OFFSET %s"
                    params.extend([limit, offset])

                    cur.execute(query_sql, params)
                    rows = cur.fetchall()

            for row in rows:
                abstract = row[2] or ""
                results.append(
                    PaperSnippet(
                        pubmed_id=row[0],
                        title=row[1],
                        abstract_snippet=(abstract[:300] + "...") if len(abstract) > 300 else abstract,
                        publication_date=str(row[3]) if row[3] else None,
                        disorder_tags=row[4],
                    )
                )
        except Exception as e:
            logger.error("Keyword search failed: %s", e)
            raise HTTPException(status_code=500, detail="Search failed")

    return SearchResponse(query=q, mode=mode, results=results)
