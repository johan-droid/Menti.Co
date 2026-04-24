import os
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()

def test_qdrant():
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    
    if not url or not api_key:
        print("[ERROR] QDRANT_URL or QDRANT_API_KEY not found in .env")
        return

    print(f"Connecting to Qdrant at: {url}")
    
    try:
        client = QdrantClient(url=url, api_key=api_key)
        collections = client.get_collections()
        print("[SUCCESS] Successfully connected to Qdrant Cloud!")
        print(f"Available Collections: {collections.collections}")
        
        # Check if papers collection exists, if not create it
        collection_name = "papers"
        exists = any(c.name == collection_name for c in collections.collections)
        
        if not exists:
            print(f"Creating collection '{collection_name}'...")
            from qdrant_client.http import models
            client.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
            )
            print(f"[SUCCESS] Collection '{collection_name}' created.")
        else:
            print(f"[INFO] Collection '{collection_name}' already exists.")

    except Exception as e:
        print(f"[ERROR] Failed to connect to Qdrant: {e}")

if __name__ == "__main__":
    test_qdrant()
