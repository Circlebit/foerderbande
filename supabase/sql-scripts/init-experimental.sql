-- Simple Application Schema: Funding Calls
-- Start simple, add complexity later

CREATE TABLE IF NOT EXISTS funding_calls (
    id SERIAL PRIMARY KEY,
    
    -- Essential fields only
    url TEXT UNIQUE NOT NULL,  -- Use URL as natural unique identifier
    title TEXT NOT NULL,
    description TEXT,
    
    -- All the messy, variable data goes here
    data JSONB NOT NULL DEFAULT '{}',
    
    -- Simple timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_funding_calls_data_gin ON funding_calls USING GIN (data);
CREATE INDEX IF NOT EXISTS idx_funding_calls_updated_at ON funding_calls(updated_at DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_funding_calls_updated_at 
    BEFORE UPDATE ON funding_calls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data - properly escaped JSON
INSERT INTO funding_calls (url, title, description, data) VALUES 
(
    'https://foerdermittel-wissenswert.de/jugend-staerken/',
    'JUGEND STÄRKEN: Brücken in die Eigenständigkeit (JUST BEst)',
    'Das Programm "JUGEND STÄRKEN" fördert Projekte, die junge Menschen zwischen 14 und 26 Jahren unterstützen...',
    '{
        "_id": "https://foerdermittel-wissenswert.de/jugend-staerken/",
        "url": "https://foerdermittel-wissenswert.de/jugend-staerken/",
        "name": "JUGEND STÄRKEN: Brücken in die Eigenständigkeit (JUST BEst)",
        "is_relevant": true,
        "deadline": "29. Januar 2027, 15 Uhr",
        "sum": "bis zu 300.000 Euro pro Jahr",
        "timeframe": "bis spätestens 31. Dezember 2028",
        "description": "Das Programm \"JUGEND STÄRKEN\" fördert Projekte, die junge Menschen zwischen 14 und 26 Jahren unterstützen, die sich in besonders schwierigen Lebenslagen befinden. Die Förderung erfolgt über vier methodische Bausteine, die die individuelle Stabilisierung und Begleitung der Zielgruppe zum Ziel haben. Die Antragsstellung erfolgt durch die Jugendämter, wobei freie Träger eine wichtige Rolle bei der Umsetzung spielen.",
        "relevance_reason": "Die Ausschreibung richtet sich ausdrücklich an soziale Einrichtungen, da die Jugendämter als Träger der öffentlichen Jugendhilfe antragsberechtigt sind und die Projekte in Zusammenarbeit mit freien Trägern realisiert werden.",
        "scraped_at": "2025-06-17T22:34:54.446111"
    }'::jsonb
),
(
    'https://foerdermittel-wissenswert.de/partnerschaft-fuer-demokratie/',
    'Partnerschaft für Demokratie',
    'Die Partnerschaft für Demokratie ist ein Bundesprogramm, das lokale Bündnisse zur Förderung von Demokratie, Toleranz und Gewaltfreiheit unterstützt...',
    '{
        "_id": "https://foerdermittel-wissenswert.de/partnerschaft-fuer-demokratie/",
        "url": "https://foerdermittel-wissenswert.de/partnerschaft-fuer-demokratie/",
        "name": "Partnerschaft für Demokratie",
        "is_relevant": true,
        "deadline": null,
        "sum": "bis zu 140.000 € pro Jahr, mit einzelnen Projekten bis zu 20.000 €",
        "timeframe": null,
        "description": "Die Partnerschaft für Demokratie ist ein Bundesprogramm, das lokale Bündnisse zur Förderung von Demokratie, Toleranz und Gewaltfreiheit unterstützt. Es richtet sich an soziale Einrichtungen sowie diverse lokale Akteure, die Projekte zur Verbesserung des Zusammenlebens entwickeln.",
        "relevance_reason": "Die Ausschreibung richtet sich ausdrücklich an soziale und kulturelle Einrichtungen, die sich für Demokratie und ein tolerantes Zusammenleben engagieren.",
        "scraped_at": "2025-06-17T22:36:29.715631"
    }'::jsonb
);