-- Database initialization script
-- This runs automatically when the PostgreSQL container starts for the first time

-- Create the main table for feed entries
CREATE TABLE IF NOT EXISTS feed_entries (
    id VARCHAR(32) PRIMARY KEY,
    feed_source VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    link TEXT,
    description TEXT,
    published_date TIMESTAMP,
    raw_content TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feed_entries_source ON feed_entries(feed_source);
CREATE INDEX IF NOT EXISTS idx_feed_entries_published ON feed_entries(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_feed_entries_created ON feed_entries(created_at DESC);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feed_entries_updated_at 
    BEFORE UPDATE ON feed_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial test data (optional, for development)
-- You can remove this section in production
INSERT INTO feed_entries (
    id, feed_source, title, link, description, published_date
) VALUES (
    'test001', 
    'Test Feed', 
    'Initial Test Entry', 
    'https://example.com/test', 
    'This is a test entry to verify the database setup works correctly.',
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Create a view for recent entries (useful for debugging)
CREATE OR replace VIEW recent_entries AS
SELECT 
    feed_source,
    title,
    link,
    published_date,
    created_at
FROM feed_entries 
ORDER BY COALESCE(published_date, created_at) DESC
LIMIT 50;