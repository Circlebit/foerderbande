-- Minimal Application Schema: Funding Calls

-- Main table for funding calls
CREATE TABLE IF NOT EXISTS funding_calls (
    id SERIAL PRIMARY KEY,
    
    -- Core fields (always present)
    title TEXT NOT NULL,
    description TEXT,
    deadline DATE,
    source_url TEXT,
    
    -- Everything else flexible in JSONB
    details JSONB DEFAULT '{}',
    
    -- Simple relevance (can be calculated later)
    relevance_score DECIMAL(3,2) DEFAULT 0.0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data for testing
INSERT INTO funding_calls (title, description, deadline, source_url, details, relevance_score) VALUES 
(
    'EU-Förderung Jugendarbeit 2025',
    'Förderung für innovative Projekte in der Jugendarbeit und Bildung.',
    '2025-08-15',
    'https://example.com/grant1',
    '{
        "funding_body": "Europäische Union",
        "max_amount": 50000,
        "target_groups": ["Jugendliche", "Bildungseinrichtungen"],
        "keywords": ["Jugend", "Bildung", "Innovation"],
        "status": "open"
    }',
    0.85
),
(
    'Digitalisierung Bildung NRW',
    'Unterstützung bei der digitalen Transformation von Bildungseinrichtungen.',
    '2025-07-30',
    'https://example.com/grant2',

    '{
        "funding_body": "Land NRW",
        "max_amount": 25000,
        "target_groups": ["Schulen", "Vereine"],
        "keywords": ["Digital", "Bildung", "Technologie"],
        "status": "open"
    }',
    0.72
),
(
    'Bundesförderung Familienarbeit',
    'Projekte zur Stärkung von Familien und Kindern.',
    '2025-09-01',
    'https://example.com/grant3',
    '{
        "funding_body": "BMFSFJ",
        "max_amount": 75000,
        "target_groups": ["Familien", "Kinder"],
        "keywords": ["Familie", "Kinder", "Soziale Arbeit"],
        "status": "open"
    }',
    0.91
);