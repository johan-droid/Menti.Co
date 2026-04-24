.PHONY: setup ingest api web dev clean

# Variables
API_DIR = backend/api
WEB_DIR = frontend/web
SCRIPTS_DIR = backend/scripts

setup:
	@echo "🚀 Setting up Menti.Co Environment..."
	cd $(API_DIR) && uv sync
	cd $(WEB_DIR) && npm install
	@echo "✅ Dependencies installed."

migrate:
	@echo "🗄️  Running Database Migrations..."
	cd $(API_DIR) && uv run python ../../$(SCRIPTS_DIR)/migrate_db.py

ingest:
	@echo "📚 Ingesting Mental Health Research..."
	cd $(API_DIR) && uv run python ../../$(SCRIPTS_DIR)/ingest_pubmed.py

api:
	@echo "🔌 Starting API Server..."
	cd $(API_DIR) && uv run uvicorn main:app --port 4000 --reload

web:
	@echo "🌐 Starting Web Frontend..."
	cd $(WEB_DIR) && npm run dev

dev:
	@echo "🔥 Starting Full Stack Development Mode..."
	# This requires installed 'concurrently' or similar, but we'll use a simple approach
	make -j 2 api web

docker-up:
	docker-compose up --build

help:
	@echo "Menti.Co Workflow Commands:"
	@echo "  make setup    - Install all dependencies (Backend + Frontend)"
	@echo "  make migrate  - Run Neon/Postgres schema migrations"
	@echo "  make ingest   - Pull mental health papers from PubMed"
	@echo "  make api      - Start FastAPI backend"
	@echo "  make web      - Start Next.js frontend"
	@echo "  make dev      - Start both API and Web concurrently"
	@echo "  make docker-up - Launch full stack in Docker"
