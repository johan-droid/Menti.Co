import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

load_dotenv()

def test_elastic():
    url = os.getenv("ES_URL")
    api_key = os.getenv("ES_API_KEY")
    
    if not url or not api_key:
        print("[ERROR] ES_URL or ES_API_KEY not found in .env")
        return

    print(f"Connecting to Elasticsearch at: {url}")
    
    try:
        client = Elasticsearch(
            url,
            api_key=api_key
        )
        
        if client.ping():
            print("[SUCCESS] Successfully connected to Elastic Cloud!")
        else:
            print("[ERROR] Failed to ping Elasticsearch.")
            return

        # Initialize the 'papers' index with custom mappings for medical research
        index_name = "papers"
        if not client.indices.exists(index=index_name):
            print(f"Creating index '{index_name}'...")
            client.indices.create(
                index=index_name,
                body={
                    "mappings": {
                        "properties": {
                            "title": {"type": "text", "analyzer": "standard"},
                            "abstract": {"type": "text", "analyzer": "standard"},
                            "full_text": {"type": "text", "analyzer": "standard"},
                            "authors": {"type": "keyword"},
                            "journal": {"type": "keyword"},
                            "year": {"type": "integer"},
                            "doi": {"type": "keyword"},
                            "created_at": {"type": "date"}
                        }
                    }
                }
            )
            print(f"[SUCCESS] Index '{index_name}' created.")
        else:
            print(f"[INFO] Index '{index_name}' already exists.")

    except Exception as e:
        print(f"[ERROR] Failed to connect to Elasticsearch: {e}")

if __name__ == "__main__":
    test_elastic()
