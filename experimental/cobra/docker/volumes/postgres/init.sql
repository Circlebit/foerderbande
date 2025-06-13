-- Rohdaten vom Crawling
CREATE TABLE raw_articles (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,           -- 'esf', 'eu_ted', etc.
    url TEXT NOT NULL,
    title TEXT,
    content TEXT,                          -- Raw HTML/Text
    extra_data JSONB,                        -- Flexible zusätzliche Daten
    checksum VARCHAR(32),                  -- Für Deduplication
    scraped_at TIMESTAMP DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE       -- Flag für LLM-Processing
);

-- Aufbereitete Ausschreibungen
CREATE TABLE funding_calls (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL UNIQUE,  -- eindeutige URL als natürlicher Key
    source TEXT NOT NULL,      -- z.B. 'Aktion Mensch', 'ESF'

    -- Core timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Flexible Metadaten
    extra_data JSONB DEFAULT '{}'
);



-- Demo-Daten für funding_calls
INSERT INTO funding_calls (title, description, url, source, extra_data) VALUES
(
    'Förderung familienunterstützender Maßnahmen 2025',
    'Das Bundesministerium für Familie, Senioren, Frauen und Jugend fördert innovative Projekte zur Stärkung von Familien in schwierigen Lebenslagen.',
    'https://www.bmfsfj.de/foerderung/familie-2025',
    'BMFSFJ',
    '{
        "deadline": "2025-09-30T23:59:59Z",
        "funding_body": "Bundesministerium für Familie, Senioren, Frauen und Jugend",
        "max_amount": 150000,
        "min_amount": 25000,
        "currency": "EUR",
        "target_groups": ["Familien", "Alleinerziehende", "Kinder"],
        "application_type": "digital",
        "contact_email": "foerderung@bmfsfj.de",
        "keywords": ["Familie", "Beratung", "Unterstützung", "Integration"]
    }'
),
(
    'ESF Plus - Soziale Innovation und Zusammenhalt',
    'Förderung von Projekten zur sozialen Innovation und zum gesellschaftlichen Zusammenhalt in benachteiligten Stadtteilen.',
    'https://www.esf.de/portal/soziale-innovation-2025',
    'ESF',
    '{
        "deadline": "2025-07-15T23:59:59Z",
        "funding_body": "Europäischer Sozialfonds Plus",
        "max_amount": 300000,
        "min_amount": 50000,
        "currency": "EUR",
        "target_groups": ["Benachteiligte", "Migranten", "Jugendliche"],
        "application_type": "online",
        "contact_email": "info@esf-hessen.de",
        "keywords": ["Innovation", "Sozial", "Quartier", "Teilhabe"]
    }'
),
(
    'Aktion Mensch - Inklusion einfach machen',
    'Unterstützung für Projekte, die Barrieren abbauen und ein selbstverständliches Miteinander von Menschen mit und ohne Behinderung fördern.',
    'https://www.aktion-mensch.de/foerderung/inklusion-2025',
    'Aktion Mensch',
    '{
        "deadline": "2025-08-01T23:59:59Z",
        "funding_body": "Aktion Mensch e.V.",
        "max_amount": 80000,
        "min_amount": 5000,
        "currency": "EUR",
        "target_groups": ["Menschen mit Behinderung", "Familien", "Kinder"],
        "application_type": "online",
        "contact_email": "foerderung@aktion-mensch.de",
        "keywords": ["Inklusion", "Barrierefreiheit", "Teilhabe", "Behinderung"]
    }'
),
(
    'Demokratie leben! - Partnerschaften für Demokratie',
    'Förderung lokaler Bündnisse zur Stärkung der Demokratie und Prävention von Extremismus auf kommunaler Ebene.',
    'https://www.demokratie-leben.de/partnerschaften-2025',
    'BMFSFJ',
    '{
        "deadline": "2025-06-30T23:59:59Z",
        "funding_body": "Bundesministerium für Familie, Senioren, Frauen und Jugend",
        "max_amount": 120000,
        "min_amount": 40000,
        "currency": "EUR",
        "target_groups": ["Kommunen", "Vereine", "Bürgerschaftliche Initiativen"],
        "application_type": "digital",
        "contact_email": "demokratie-leben@bmfsfj.de",
        "keywords": ["Demokratie", "Extremismus", "Prävention", "Beteiligung"]
    }'
),
(
    'LEADER+ - Ländliche Entwicklung Hessen',
    'Förderung innovativer Projekte zur nachhaltigen Entwicklung ländlicher Räume mit Fokus auf Gemeinschaftsprojekte und regionale Wertschöpfung.',
    'https://www.hessen.de/leader-plus-2025',
    'HMUKLV',
    '{
        "deadline": "2025-12-15T23:59:59Z",
        "funding_body": "Hessisches Ministerium für Umwelt, Klimaschutz, Landwirtschaft und Verbraucherschutz",
        "max_amount": 200000,
        "min_amount": 10000,
        "currency": "EUR",
        "target_groups": ["Ländliche Gemeinden", "Landwirte", "Regionale Akteure"],
        "application_type": "schriftlich",
        "contact_email": "leader@hmuklv.hessen.de",
        "keywords": ["Ländlich", "Nachhaltigkeit", "Regional", "Innovation"]
    }'
);