# Menti.Co Design

## Overview
Menti.Co is a production-oriented real-time medical platform composed of three main services:

- `apps/web`: Next.js frontend for public content discovery and user interaction.
- `apps/api`: Express-based backend exposing REST endpoints, authentication, admin workflows, and MongoDB access.
- `apps/worker`: Background worker for AI-assisted ingestion, content classification, and enrichment.
- `packages/contracts`: Shared TypeScript contracts used across services for typed API data and payloads.

## Goals

- Real-time updates for content as admin workflows progress.
- Clear separation between public-facing discovery, admin operations, and background ingestion.
- Mobile-first frontend design with responsive layouts.
- Developer-friendly local + Docker-based development workflows.

## Architecture

### Web App (`apps/web`)

- Built with Next.js and TypeScript.
- Provides public search and content browsing.
- Uses `NEXT_PUBLIC_API_URL` to call the API.
- Designed to consume real-time updates via socket events from the API.
- Components are built for responsive display and simple practitioner discovery.

### API Service (`apps/api`)

- Built with Express and TypeScript.
- Connects to MongoDB for persistent storage.
- Exposes versioned API routes under `/v1`.
- Handles authentication using JWT tokens in development.
- Supports admin content workflows:
  - ingest content
  - review content
  - approve content
  - publish content
- Provides public query endpoints for conditions and doctors.

### Worker (`apps/worker`)

- Background service for AI-based content ingestion and enrichment.
- Uses `GEMINI_API_KEY` for access to external model APIs.
- Responsible for processing incoming content items and generating metadata.

## Data Model Concepts

### Content Lifecycle

- `ingest`: initial submission of raw medical content.
- `review`: editorial or clinical verification step.
- `approve`: approval to move content toward publication.
- `publish`: content becomes live for public consumption.
- Audit logs capture lifecycle events for traceability.

### Key Entities

- Content / ContentRevision
- Condition
- Doctor
- Job
- AuditLog

## Integration Points

- MongoDB: primary data store for the API service and worker.
- Websocket / real-time stream: notify `apps/web` when admin state changes occur.
- AI provider: worker uses external model API to assist ingestion.
- Type-safe contracts in `packages/contracts` ensure frontend and backend share request/response shapes.

## Deployment and Operations

### Local Development

- `npm install`
- `npm run dev:web`
- `npm run dev:api`
- `npm run dev:worker`

### Docker

- `docker compose up --build -d`
- Web on `http://localhost:3000`
- API health on `http://localhost:4000/health`
- Mongo on `27017`

### Environment Configuration

- API:
  - `API_PORT`
  - `CORS_ORIGIN`
  - `MONGO_URI`
  - `JWT_SECRET`
- Web:
  - `NEXT_PUBLIC_API_URL`
- Worker:
  - `GEMINI_API_KEY`

## Future Enhancements

- Add structured MongoDB indexes and model improvements in `packages/db`.
- Introduce queue orchestration for ingest/retry workflows.
- Upgrade auth from local JWT to production IdP.
- Add PWA and offline caching support.
- Expand frontend flows for practitioner booking and patient education.
