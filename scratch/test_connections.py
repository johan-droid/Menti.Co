import os
from dotenv import load_dotenv
import psycopg
from qdrant_client import QdrantClient

load_dotenv()

def test_db():
    print(f"Testing DB connection to {os.getenv('DATABASE_URL')[:30]}...")
    try:
        with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT count(*) FROM papers")
                count = cur.fetchone()[0]
                print(f"DB Success: Found {count} papers")
    except Exception as e:
        print(f"DB Error: {e}")

def test_qdrant():
    print(f"Testing Qdrant connection to {os.getenv('QDRANT_URL')}...")
    try:
        client = QdrantClient(
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY"),
        )
        collections = client.get_collections()
        print(f"Qdrant Success: Collections: {[c.name for c in collections.collections]}")
    except Exception as e:
        print(f"Qdrant Error: {e}")

if __name__ == "__main__":
    test_db()
    test_qdrant()
