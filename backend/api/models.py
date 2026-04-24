"""
Pydantic response models for type-safe API contracts.
"""
from pydantic import BaseModel
from typing import Optional


class PaperResponse(BaseModel):
    pubmed_id: str
    title: str
    authors: str | None = None
    abstract: str | None = None
    publication_date: str | None = None
    journal: str | None = None
    license: str | None = None
    url: str | None = None
    disorder_tags: list[str] | None = None
    treatment_tags: list[str] | None = None


class PaperSnippet(BaseModel):
    pubmed_id: str | None = None
    title: str | None = None
    abstract_snippet: str = ""
    disorder_tags: list[str] | None = None
    publication_date: str | None = None
    similarity: float | None = None
    relevance_score: float | None = None


class SearchResponse(BaseModel):
    query: str
    mode: str
    results: list[PaperSnippet]
    disclaimer: str = "These are research papers, not a substitute for professional advice."


class AiAskResponse(BaseModel):
    query: str
    view_type: str
    summary: str
    results: list[PaperSnippet]
    disclaimer: str = "These are research papers, not a substitute for professional advice."


class CrisisResponse(BaseModel):
    message: str
    crisis_resources: list[str]
    is_crisis: bool = True


class HealthResponse(BaseModel):
    status: str
    database: str
    vector_db: str
    models_loaded: bool


class ErrorResponse(BaseModel):
    detail: str


class Disorder(BaseModel):
    id: str
    name: str
    description: str | None = None
    ai_summary: str | None = None


class DisordersResponse(BaseModel):
    ok: bool = True
    data: list[Disorder]
