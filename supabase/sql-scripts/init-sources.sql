-- Sources table for managing funding opportunity sources
-- This should be added to your Supabase database

CREATE TABLE IF NOT EXISTS sources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    source_type TEXT DEFAULT 'website',
    
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

-- Row Level Security (RLS) - später aktivieren wenn nötig
-- ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Sample data for development
INSERT INTO sources (name, url, description, source_type, config) VALUES 
(
    'TED - Tenders Electronic Daily', 
    'https://ted.europa.eu/api/v3.0/',
    'Europäische Ausschreibungsplattform mit offiziellen EU-Tender',
    'api',
    '{"api_type": "rest", "auth_required": false}'::jsonb
),
(
    'Förderdatenbank des Bundes',
    'https://www.foerderdatenbank.de/FDB/DE/Service/RSS/rss.html',
    'Zentrale Förderdatenbank der Bundesregierung',
    'rss',
    '{"update_frequency": "daily"}'::jsonb
),
(
    'Fördermittel Wissenswert',
    'https://foerdermittel-wissenswert.de',
    'Spezialisierte Webseite für Fördermittel im sozialen Bereich',
    'website',
    '{"scraping_enabled": true, "check_frequency": "weekly"}'::jsonb
)
ON CONFLICT (url) DO NOTHING;