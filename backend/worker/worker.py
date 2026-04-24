import os
from celery import Celery
from pathlib import Path
from dotenv import load_dotenv

# Find root .env by searching upward from this file's location
_root_env = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(_root_env)

# Use Upstash Redis or local redis
redis_url = os.environ.get("UPSTASH_REDIS_URL", "redis://localhost:6379/0")

# For Upstash, you might need to append ?ssl_cert_reqs=none if using rediss://
# app = Celery("mentico_worker", broker=redis_url, backend=redis_url)

app = Celery(
    "mentico_worker",
    broker=redis_url,
    backend=redis_url,
    broker_connection_retry_on_startup=True
)

@app.task
def ingest_paper(paper_data: dict):
    """
    Background task to ingest a paper:
    1. Parse PDF/XML
    2. Generate Embeddings (MiniLM-L6-v2)
    3. Index in Elasticsearch (Full-text)
    4. Index in Qdrant Cloud (Vector)
    5. Save Metadata in Neon Postgres
    """
    print(f"Cloud Ingestion: {paper_data.get('title')}")
    # Implementation follows...
    return {"status": "success", "paper_id": paper_data.get("id")}

@app.task
def health_check():
    return "Worker is healthy and connected to Cloud Broker"
