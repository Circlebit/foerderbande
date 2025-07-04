-- Sources table for managing funding opportunity sources
-- This should be added to your Supabase database

CREATE TABLE IF NOT EXISTS sources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    source_type TEXT DEFAULT 'website',
    
    -- Crawling tracking
    last_crawled_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Additional configuration stored as JSONB
    config JSONB DEFAULT '{}',
    
    -- Standard timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT sources_url_unique UNIQUE (url),
    CONSTRAINT sources_name_not_empty CHECK (trim(name) != ''),
    CONSTRAINT sources_url_not_empty CHECK (trim(url) != '')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sources_active ON sources(is_active);
CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(source_type);
CREATE INDEX IF NOT EXISTS idx_sources_last_crawled ON sources(last_crawled_at);
CREATE INDEX IF NOT EXISTS idx_sources_config_gin ON sources USING GIN (config);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sources_updated_at 
    BEFORE UPDATE ON sources 
    FOR EACH ROW 
    EXECUTE FUNCTION update_sources_updated_at();

-- Helper function to update last_crawled_at (for backend use)
CREATE OR REPLACE FUNCTION update_source_last_crawled(source_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE sources 
    SET last_crawled_at = NOW() 
    WHERE id = source_id;
END;
$$ language 'plpgsql';

-- Row Level Security (RLS) - später aktivieren wenn nötig
-- ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Sample data for development
INSERT INTO sources (name, url, description, source_type, config, last_crawled_at) VALUES 
(
    'TED - Tenders Electronic Daily', 
    'https://ted.europa.eu/api/v3.0/',
    'Europäische Ausschreibungsplattform mit offiziellen EU-Tender',
    'api',
    '{"api_type": "rest", "auth_required": false}'::jsonb,
    NOW() - INTERVAL '2 hours'  -- Simulated: crawled 2 hours ago
),
(
    'Förderdatenbank des Bundes',
    'https://www.foerderdatenbank.de/FDB/DE/Service/RSS/rss.html',
    'Zentrale Förderdatenbank der Bundesregierung',
    'rss',
    '{"update_frequency": "daily"}'::jsonb,
    NOW() - INTERVAL '6 hours'  -- Simulated: crawled 6 hours ago
),
(
    'Fördermittel Wissenswert',
    'https://foerdermittel-wissenswert.de',
    'Spezialisierte Webseite für Fördermittel im sozialen Bereich',
    'website',
    '{"scraping_enabled": true, "check_frequency": "weekly"}'::jsonb,
    NOW() - INTERVAL '1 day'    -- Simulated: crawled 1 day ago
),
(
    'Stiftungsindex (Neu)',
    'https://www.stiftungsindex.de',
    'Neue Quelle - noch nie gecrawlt',
    'website',
    '{"scraping_enabled": true, "check_frequency": "weekly"}'::jsonb,
    NULL  -- Never crawled
)
ON CONFLICT (url) DO NOTHING;