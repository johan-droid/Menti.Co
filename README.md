# Menti.Co

Production-oriented starter for a real-time medical platform:
- Next.js frontend (`apps/web`)
- Express + Socket.io API (`apps/api`)
- Worker for AI-assisted ingestion (`apps/worker`)
- Shared type contracts (`packages/contracts`)

## Quick start

1. Install dependencies:
   - `npm install`
2. Start services in separate terminals:
   - `npm run dev:web`
   - `npm run dev:api`
   - `npm run dev:worker`

## Docker Compose quick start

1. Build and start all services:
   - `docker compose up --build -d`
   - or `npm run docker:up`
2. Open:
   - Web: `http://localhost:3000`
   - API health: `http://localhost:4000/health`
3. Stop:
   - `docker compose down`
   - or `npm run docker:down`

Compose includes:
- `mongo` on `27017`
- `api` on `4000` (connected to Mongo via `mongodb://mongo:27017/mentico`)
- `web` on `3000`

## Docker hot-reload dev

Run web + api in watch mode inside containers:
- `docker compose -f docker-compose.yml -f compose.dev.yml up --build`

Run detached:
- `docker compose -f docker-compose.yml -f compose.dev.yml up --build -d`
- or `npm run docker:dev:up`

Stop:
- `docker compose -f docker-compose.yml -f compose.dev.yml down`
- or `npm run docker:dev:down`
- rebuild without deleting volumes: `npm run docker:dev:rebuild`
- reset all dev containers/volumes and rebuild: `npm run docker:dev:reset`

Logs:
- API logs: `npm run docker:logs:api`
- Mongo logs: `npm run docker:logs:mongo`
- Web logs: `npm run docker:logs:web`
- Service status: `npm run docker:ps`

## Environment variables

- API (`apps/api`):
  - `API_PORT=4000`
  - `CORS_ORIGIN=http://localhost:3000`
  - `MONGO_URI=mongodb://localhost:27017/mentico`
  - `JWT_SECRET=replace-me`
- Web (`apps/web`):
  - `NEXT_PUBLIC_API_URL=http://localhost:4000`
- Worker (`apps/worker`):
  - `GEMINI_API_KEY=...`

## Phase 1 endpoints

- Auth:
  - `POST /v1/auth/login` (local dev JWT minting)
- Public:
  - `GET /v1/public/conditions?query=anxiety`
  - `GET /v1/public/doctors?specialty=Psychiatry&city=Mumbai`
- Admin content (Bearer token required):
  - `POST /v1/admin/content/ingest`
  - `POST /v1/admin/content/:entityId/review`
  - `POST /v1/admin/content/:entityId/approve`
  - `POST /v1/admin/content/:entityId/publish`
  - `GET /v1/admin/content/audit-logs`

## Dev seed + workflow test (PowerShell)

1. Seed sample data and print test JWTs:
   - `npm run seed:dev -w @mentico/api`
2. Or mint a token with login route:
   - `$login = Invoke-RestMethod -Method POST -Uri "http://localhost:4000/v1/auth/login" -ContentType "application/json" -Body '{"userId":"admin-1","role":"admin"}'`
   - `$token = $login.data.token`
3. Ingest content:
   - `$ingest = Invoke-RestMethod -Method POST -Uri "http://localhost:4000/v1/admin/content/ingest" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"title":"CBT outcomes in anxiety cohorts","sourceUrl":"https://example.org/study-2026","body":"This study shows improved anxiety score trends with structured CBT over 12 weeks among adult cohorts in outpatient settings."}'`
   - `$entityId = $ingest.data.entityId`
4. Review (reviewer/admin token):
   - `Invoke-RestMethod -Method POST -Uri "http://localhost:4000/v1/admin/content/$entityId/review" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"notes":"Clinical terminology verified and evidence phrasing adjusted."}'`
5. Approve:
   - `Invoke-RestMethod -Method POST -Uri "http://localhost:4000/v1/admin/content/$entityId/approve" -Headers @{ Authorization = "Bearer $token" }`
6. Publish:
   - `Invoke-RestMethod -Method POST -Uri "http://localhost:4000/v1/admin/content/$entityId/publish" -Headers @{ Authorization = "Bearer $token" }`

When `apps/web` is running, the home page card should update its "Last live content update" timestamp after review/approve/publish writes, confirming change-stream socket delivery.

## Next implementation steps

- Add MongoDB models and indexes in `packages/db`
- Add BullMQ queue for ingest/retry orchestration
- Add PWA with offline-safe caching policy
- Replace local login with production IdP (Auth.js/Clerk/Supabase Auth)
