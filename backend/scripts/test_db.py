import os
import psycopg
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv()

def test_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ Error: DATABASE_URL not found in .env file.")
        return

    print(f"Connecting to: {db_url.split('@')[-1]}") # Print host only for security
    
    try:
        # Connect to an existing database
        with psycopg.connect(db_url) as conn:
            # Open a cursor to perform database operations
            with conn.cursor() as cur:
                # Execute a command: this creates a new table
                cur.execute("SELECT version();")
                
                # Retrieve query results
                record = cur.fetchone()
                print(f"[SUCCESS] Successfully connected to Neon!")
                print(f"PostgreSQL version: {record[0]}")
                
                # Check for pgvector extension
                cur.execute("SELECT extname FROM pg_extension WHERE extname = 'vector';")
                extension = cur.fetchone()
                if extension:
                    print("[INFO] pgvector extension is installed.")
                else:
                    print("[WARNING] pgvector extension is NOT installed. You can enable it with: CREATE EXTENSION vector;")

    except Exception as e:
        print(f"[ERROR] Failed to connect to the database: {e}")

if __name__ == "__main__":
    test_connection()
