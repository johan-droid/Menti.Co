import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

def migrate():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[ERROR] DATABASE_URL not found.")
        return

    try:
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                print("Setting up database schema...")
                
                # 1. Enable pgvector
                print("Enabling pgvector extension...")
                cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                
                # 2. Create papers table
                print("Creating 'papers' table...")
                cur.execute("""
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
                """)

                # 3. Create users table (adapted from Supabase)
                print("Creating 'users' table...")
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        email TEXT UNIQUE,
                        created_at TIMESTAMP DEFAULT NOW(),
                        location_city TEXT,
                        location_state TEXT
                    );
                """)

                # 4. Create journal_entries table
                print("Creating 'journal_entries' table...")
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS journal_entries (
                        id SERIAL PRIMARY KEY,
                        user_id UUID REFERENCES users(id),
                        content TEXT NOT NULL,
                        mood_score INT CHECK (mood_score BETWEEN 1 AND 10),
                        contains_crisis_keywords BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT NOW()
                    );
                """)

                # 5. Create disorders table
                print("Creating 'disorders' table...")
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS disorders (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        description TEXT,
                        symptoms TEXT[],
                        ai_summary TEXT,
                        last_updated TIMESTAMP
                    );
                """)

                # 6. Create practitioners table
                print("Creating 'practitioners' table...")
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS practitioners (
                        id SERIAL PRIMARY KEY,
                        name TEXT,
                        specialty TEXT,
                        city TEXT,
                        state TEXT,
                        phone TEXT,
                        verified BOOLEAN DEFAULT FALSE
                    );
                """)

                # 7. Create indexes
                print("Creating indexes...")
                cur.execute("CREATE INDEX IF NOT EXISTS papers_embedding_idx ON papers USING hnsw (embedding vector_cosine_ops);")
                cur.execute("CREATE INDEX IF NOT EXISTS papers_metadata_idx ON papers USING GIN (metadata);")
                cur.execute("CREATE INDEX IF NOT EXISTS journal_user_id_idx ON journal_entries (user_id);")

                conn.commit()
                print("[SUCCESS] Database migration completed successfully!")

    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")

if __name__ == "__main__":
    migrate()
