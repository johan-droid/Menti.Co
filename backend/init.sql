CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pubmed_id TEXT UNIQUE,
    title TEXT NOT NULL,
    authors TEXT,
    abstract TEXT,
    journal TEXT,
    publication_date DATE,
    url TEXT,
    license TEXT DEFAULT 'unknown',
    disorder_tags TEXT[] DEFAULT '{}',
    treatment_tags TEXT[] DEFAULT '{}',
    population_tags TEXT[] DEFAULT '{}',
    metadata JSONB,
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    location_city TEXT,
    location_state TEXT
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    mood_score INT CHECK (mood_score BETWEEN 1 AND 10),
    contains_crisis_keywords BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disorders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    symptoms TEXT[],
    ai_summary TEXT,
    last_updated TIMESTAMP
);

CREATE TABLE IF NOT EXISTS practitioners (
    id SERIAL PRIMARY KEY,
    name TEXT,
    specialty TEXT,
    city TEXT,
    state TEXT,
    phone TEXT,
    verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS papers_embedding_idx ON papers USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS papers_metadata_idx ON papers USING GIN (metadata);
CREATE INDEX IF NOT EXISTS journal_user_id_idx ON journal_entries (user_id);
