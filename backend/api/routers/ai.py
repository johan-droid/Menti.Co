"""
AI Research Assistant router — semantic search + cross-encoder re-ranking + LLM summarization.
"""
import asyncio
import logging

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from dependencies import get_embed_model, get_cross_encoder, get_qdrant_client
from models import AiAskResponse, PaperSnippet
from services.llm import detect_crisis, CRISIS_RESOURCES, generate_summary

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/ask", response_model=AiAskResponse)
async def ai_ask(
    q: str = Query(..., description="The user question", min_length=2, max_length=1000),
    view_type: str = Query("patient", pattern="^(patient|clinician)$"),
    embed_model=Depends(get_embed_model),
    cross_encoder=Depends(get_cross_encoder),
    qdrant_client=Depends(get_qdrant_client),
):
    """AI-powered research assistant with crisis detection, re-ranking, and LLM summarization."""

    # SAFETY: Crisis detection runs FIRST, before any other processing
    if detect_crisis(q):
        return JSONResponse(content=CRISIS_RESOURCES, status_code=200)

    # Step 1: Semantic search → get top 20 candidates (CPU-bound, offload to thread)
    query_vec = await asyncio.to_thread(embed_model.encode, q)
    query_vec = query_vec.tolist()

    try:
        candidates = qdrant_client.search(
            collection_name="papers",
            query_vector=query_vec,
            limit=20,
        )
    except Exception as e:
        logger.error("Qdrant search failed in AI ask: %s", e)
        return AiAskResponse(
            query=q,
            view_type=view_type,
            summary="Search service is temporarily unavailable.",
            results=[],
        )

    if not candidates:
        return AiAskResponse(
            query=q,
            view_type=view_type,
            summary="No relevant research papers found for your query.",
            results=[],
        )

    # Step 2: Cross-encoder re-ranking (CPU-bound, offload to thread)
    pairs = [
        (q, hit.payload.get("abstract") or hit.payload.get("title", ""))
        for hit in candidates
    ]
    scores = await asyncio.to_thread(cross_encoder.predict, pairs)

    scored_hits: list[PaperSnippet] = []
    for hit, score in zip(candidates, scores):
        abstract = hit.payload.get("abstract") or ""
        scored_hits.append(
            PaperSnippet(
                pubmed_id=hit.payload.get("pubmed_id"),
                title=hit.payload.get("title"),
                abstract_snippet=(abstract[:400] + "...") if len(abstract) > 400 else abstract,
                disorder_tags=hit.payload.get("disorder_tags"),
                relevance_score=round(float(score), 4),
            )
        )

    scored_hits.sort(key=lambda x: x.relevance_score or 0, reverse=True)
    top_papers = scored_hits[:5]

    # Step 3: Async LLM summarization
    summary = await generate_summary(
        q, [p.model_dump() for p in top_papers], view_type
    )

    return AiAskResponse(
        query=q,
        view_type=view_type,
        summary=summary,
        results=top_papers,
    )
