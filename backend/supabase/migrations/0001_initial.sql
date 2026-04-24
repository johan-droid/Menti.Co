-- 1. Users table (extends Supabase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  location_city TEXT,
  location_state TEXT
);

-- 2. Journal entries table (with crisis flag)
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  mood_score INT CHECK (mood_score BETWEEN 1 AND 10),
  contains_crisis_keywords BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Disorder library (populated from WHO API)
CREATE TABLE disorders (
  id TEXT PRIMARY KEY,  -- ICD-11 code, e.g., "6A70"
  name TEXT NOT NULL,
  description TEXT,
  symptoms TEXT[],
  ai_summary TEXT,
  last_updated TIMESTAMP
);

-- 4. Local practitioners (for your resource directory)
CREATE TABLE practitioners (
  id SERIAL PRIMARY KEY,
  name TEXT,
  specialty TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  verified BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security (RLS)
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own journal entries
CREATE POLICY "Users can view their own journal entries" 
ON journal_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" 
ON journal_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Anyone can read disorders and practitioners
ALTER TABLE disorders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read disorders" ON disorders FOR SELECT USING (true);

ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read practitioners" ON practitioners FOR SELECT USING (true);
