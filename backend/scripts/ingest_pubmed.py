import os
import time
from datetime import datetime
from typing import List, Dict, Any
from Bio import Entrez
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models
import psycopg
from dotenv import load_dotenv
import uuid
from pathlib import Path

# Find root .env by searching upward from this file's location
_root_env = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(_root_env)

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
Entrez.email = "mentico-research@example.com"
MODEL_NAME = "all-MiniLM-L6-v2"
BATCH_SIZE = 50
MAX_RESULTS_PER_QUERY = 200

# Mental health MeSH queries
QUERIES = [
    'depression OR anxiety OR "depressive disorder" OR "anxiety disorder"',
    'schizophrenia OR bipolar OR "schizophrenia spectrum"',
    'PTSD OR "post-traumatic stress" OR "eating disorder" OR anorexia OR bulimia',
    'addiction OR "substance use" OR insomnia OR "sleep disorder"',
    'psychotherapy OR "cognitive behavioral therapy" OR CBT OR mindfulness',
]

# Tag mapping
DISORDER_MAP = {
    'Depressive Disorder': 'depression',
    'Anxiety Disorders': 'anxiety',
    'Schizophrenia': 'schizophrenia',
    'Bipolar Disorder': 'bipolar',
    'Stress Disorders, Post-Traumatic': 'ptsd',
    'Feeding and Eating Disorders': 'eating_disorder',
    'Substance-Related Disorders': 'substance_use',
    'Sleep Initiation and Maintenance Disorders': 'insomnia',
}
TREATMENT_MAP = {
    'Cognitive Behavioral Therapy': 'cbt',
    'Psychotherapy': 'psychotherapy',
    'Mindfulness': 'mindfulness',
    'Antidepressive Agents': 'antidepressants',
    'Antipsychotic Agents': 'antipsychotics',
}

print(f"Loading model {MODEL_NAME}...")
model = SentenceTransformer(MODEL_NAME)
qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
COLLECTION_NAME = "papers"

def ensure_qdrant_collection():
    try:
        collections = qdrant.get_collections().collections
        exists = any(c.name == COLLECTION_NAME for c in collections)
        if not exists:
            qdrant.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
            )
    except Exception as e:
        print(f"Qdrant collection check failed: {e}")

def fetch_pmids(query: str, retmax: int = 100) -> List[str]:
    handle = Entrez.esearch(db="pubmed", term=query, retmax=retmax, sort="relevance")
    records = Entrez.read(handle)
    handle.close()
    return records.get("IdList", [])

def fetch_details(pmid_list: List[str]):
    ids = ",".join(pmid_list)
    handle = Entrez.efetch(db="pubmed", id=ids, retmode="xml")
    records = Entrez.read(handle)
    handle.close()
    return records.get("PubmedArticle", [])

def extract_tags(mesh_headings):
    disorders = set()
    treatments = set()
    for heading in mesh_headings:
        desc = str(heading['DescriptorName'])
        if desc in DISORDER_MAP:
            disorders.add(DISORDER_MAP[desc])
        if desc in TREATMENT_MAP:
            treatments.add(TREATMENT_MAP[desc])
    return list(disorders), list(treatments)

def parse_record(article: Dict[str, Any]) -> Dict[str, Any]:
    medline = article["MedlineCitation"]
    article_data = medline["Article"]
    pmid = str(medline["PMID"])

    title = article_data.get("ArticleTitle", "No Title")
    author_list = article_data.get("AuthorList", [])
    authors = ", ".join(f"{a.get('LastName', '')} {a.get('ForeName', '')}" for a in author_list)
    
    abstract_node = article_data.get("Abstract", {}).get("AbstractText", [])
    abstract = " ".join(str(p) for p in abstract_node)

    date_info = article_data.get("Journal", {}).get("JournalIssue", {}).get("PubDate", {})
    try:
        year = int(date_info.get("Year", datetime.now().year))
        month = date_info.get("Month", "01")
        # Handle month names
        month_map = {"Jan":1, "Feb":2, "Mar":3, "Apr":4, "May":5, "Jun":6, "Jul":7, "Aug":8, "Sep":9, "Oct":10, "Nov":11, "Dec":12}
        month_val = month_map.get(month, 1) if isinstance(month, str) else int(month)
        pub_date = datetime(year, month_val, 1).date()
    except:
        pub_date = datetime.now().date()

    journal = article_data.get("Journal", {}).get("Title", "Unknown Journal")
    
    pmc = None
    for art_id in article.get("PubmedData", {}).get("ArticleIdList", []):
        if art_id.attributes.get("IdType") == "pmc":
            pmc = str(art_id)
            break
    
    url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmc}/" if pmc else f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
    mesh_headings = medline.get("MeshHeadingList", [])
    disorder_tags, treatment_tags = extract_tags(mesh_headings)

    return {
        "pubmed_id": pmid,
        "title": title,
        "authors": authors,
        "abstract": abstract,
        "publication_date": pub_date,
        "journal": journal,
        "license": "cc-by" if pmc else "unknown",
        "url": url,
        "disorder_tags": disorder_tags,
        "treatment_tags": treatment_tags,
        "population_tags": [],
    }

def insert_paper(paper_dict: Dict[str, Any]):
    if not paper_dict["abstract"]:
        return

    embedding = model.encode(paper_dict["abstract"]).tolist()
    paper_uuid = str(uuid.uuid4())

    # Postgres
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO papers (id, pubmed_id, title, authors, abstract, journal, publication_date, url, license, disorder_tags, treatment_tags, population_tags, embedding)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (pubmed_id) DO NOTHING;
                """, (
                    paper_uuid,
                    paper_dict["pubmed_id"],
                    paper_dict["title"],
                    paper_dict["authors"],
                    paper_dict["abstract"],
                    paper_dict["journal"],
                    paper_dict["publication_date"],
                    paper_dict["url"],
                    paper_dict["license"],
                    paper_dict["disorder_tags"],
                    paper_dict["treatment_tags"],
                    paper_dict["population_tags"],
                    embedding
                ))
                conn.commit()
    except Exception as e:
        print(f"Postgres error: {e}")

    # Qdrant
    try:
        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                models.PointStruct(
                    id=paper_uuid,
                    vector=embedding,
                    payload={
                        "title": paper_dict["title"],
                        "abstract": paper_dict["abstract"],
                        "pubmed_id": paper_dict["pubmed_id"],
                        "disorder_tags": paper_dict["disorder_tags"],
                        "treatment_tags": paper_dict["treatment_tags"]
                    }
                )
            ]
        )
    except Exception as e:
        print(f"Qdrant error: {e}")

def main():
    ensure_qdrant_collection()
    
    # Get already collected PMIDs
    already_collected = set()
    try:
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT pubmed_id FROM papers")
                already_collected = {row[0] for row in cur.fetchall()}
    except Exception as e:
        print(f"[WARNING] Could not fetch existing PMIDs: {e}")

    for query in QUERIES:
        print(f"Searching: {query}")
        try:
            pmid_list = fetch_pmids(query, retmax=MAX_RESULTS_PER_QUERY)
            new_pmids = [p for p in pmid_list if p not in already_collected]
            print(f"Found {len(new_pmids)} new papers.")

            for i in range(0, len(new_pmids), BATCH_SIZE):
                batch = new_pmids[i:i+BATCH_SIZE]
                articles = fetch_details(batch)
                for art in articles:
                    try:
                        paper_data = parse_record(art)
                        insert_paper(paper_data)
                    except Exception as e:
                        print(f"Parsing error: {e}")
                print(f"  Inserted batch {i//BATCH_SIZE + 1}")
                time.sleep(1)
        except Exception as e:
            print(f"Query error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
