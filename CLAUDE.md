# Menti.Co — Agent Mission Protocol

## Project Identity
Menti.Co is a clinical-grade mental health research platform. Every change must prioritize **patient safety**, **data security**, and **clinical accuracy**. This is a medical-adjacent application — treat it accordingly.

## Architecture

### Directory Structure
```
backend/           # All server-side code (Python 3.12+)
  api/             # FastAPI service — the core research API
    config.py      # Settings, env loading (pydantic-settings)
    main.py        # App factory, lifespan, middleware
    models.py      # Pydantic request/response schemas
    routers/       # Route modules (papers, search, ai)
    services/      # Business logic (llm, search, crisis)
    dependencies.py # FastAPI dependency injection (DB pool, models)
  worker/          # Celery background tasks (paper ingestion)
  scripts/         # One-off scripts (migration, ingestion, tests)
  packages/        # Shared backend packages
frontend/          # All client-side code (TypeScript)
  web/             # Next.js 15 App Router
  packages/        # Shared UI primitives
```

### Tech Stack
| Layer | Technology | Notes |
|---|---|---|
| API Framework | FastAPI | Async-first, use `async def` for all endpoints |
| Database | PostgreSQL (Neon) + pgvector | Always use connection pooling |
| Vector Search | Qdrant Cloud | 384-dim embeddings (all-MiniLM-L6-v2) |
| Task Queue | Celery + Redis/Upstash | For paper ingestion pipelines |
| LLM | Ollama (local) | Async HTTP calls only |
| Frontend | Next.js 15 + Tailwind + Framer Motion | App Router, typed routes |

## Coding Standards

### Python (Backend)
- **Python 3.12+** with type hints on all function signatures
- **Async by default**: Use `async def` for endpoints. Use `httpx.AsyncClient` for HTTP. Use `asyncio.to_thread()` for CPU-bound work (ML model inference)
- **Connection pooling**: Never use bare `psycopg.connect()`. Always use `psycopg_pool.AsyncConnectionPool` via FastAPI dependency injection
- **Error handling**: Never expose internal errors to clients. Log with `logging` module, return generic messages. Never use bare `except: pass`
- **Logging**: Use Python `logging` module, not `print()`. Use structured format: `logger = logging.getLogger(__name__)`
- **No global mutable state**: Store ML models and clients on `app.state`, inject via dependencies
- **Pydantic models**: Define request/response schemas. No raw dicts in route returns

### Security Rules (NON-NEGOTIABLE)
1. **Never commit secrets**: All credentials in `.env`, always in `.gitignore`
2. **CORS**: Explicit origin list, never `allow_origins=["*"]` in production
3. **Input validation**: All query params must have bounds (`ge=`, `le=`)
4. **Error responses**: Never include `str(e)`, stack traces, or SQL in HTTP responses
5. **Rate limiting**: All AI/LLM endpoints must have rate limits
6. **Auth**: Protected endpoints require API key or JWT validation

### Crisis Safety Protocol
This is a mental health platform. The crisis detection system is **safety-critical**:
- Crisis keyword detection must run BEFORE any other processing
- Crisis resources must always include multi-region helplines
- Never let an LLM generate crisis advice — always return hardcoded resources
- Never diagnose users. Use language like "Research suggests..." or "Studies show..."
- Every AI response MUST include a medical disclaimer

### Database
- Single source of truth: `backend/scripts/migrate_db.py`
- Use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` for idempotency
- pgvector dimension: 384 (matches all-MiniLM-L6-v2)
- Always use parameterized queries, never string interpolation

### Dependencies
- Only include dependencies that are actually imported and used
- API should NOT depend on celery, biopython, elasticsearch, langchain, minio
- Worker should NOT depend on fastapi
- Use `uv` for Python package management

### Docker
- Bake ML models into the Docker image to avoid download at startup
- Use health checks in compose files
- Dev compose must match actual tech stack (FastAPI, not Express)

## Development Commands
```bash
# Start API (from project root)
backend/api/.venv/Scripts/python -m uvicorn main:app --app-dir backend/api --reload --port 4000

# Start frontend
npm run dev:web

# Run migrations
cd backend/scripts && uv run python migrate_db.py

# Run ingestion
cd backend/scripts && uv run python ingest_pubmed.py

# Type checking
npm run typecheck --workspaces
```

## Review Checklist
Before any PR:
- [ ] No credentials in code or committed files
- [ ] All endpoints have input validation
- [ ] Error responses don't leak internals
- [ ] Async used for I/O operations
- [ ] Crisis detection tested if AI endpoints changed
- [ ] Medical disclaimer present in all AI responses
