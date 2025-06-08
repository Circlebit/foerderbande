-- Rohdaten vom Crawling
CREATE TABLE raw_articles (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,           -- 'esf', 'eu_ted', etc.
    url TEXT NOT NULL,
    title TEXT,
    content TEXT,                          -- Raw HTML/Text
    metadata JSONB,                        -- Flexible zusätzliche Daten
    checksum VARCHAR(32),                  -- Für Deduplication
    scraped_at TIMESTAMP DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE       -- Flag für LLM-Processing
);