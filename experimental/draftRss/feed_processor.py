#!/usr/bin/env python3
"""
RSS Feed Processor for Funding Opportunities
"""

import hashlib
from datetime import datetime

import asyncpg
import feedparser
import httpx
import yaml


async def fetch_feed(url: str) -> feedparser.FeedParserDict:
    """Fetch and parse RSS feed"""
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return feedparser.parse(response.text)


async def save_entry(conn, entry, feed_name: str):
    """Save single feed entry to database"""
    # Generate stable ID from link and title
    entry_id = hashlib.md5(
        f"{entry.get('link', '')}{entry.get('title', '')}".encode()
    ).hexdigest()

    # Parse publication date if available
    published_date = None
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            published_date = datetime(*entry.published_parsed[:6])
        except (ValueError, TypeError):
            pass

    # Insert or update entry
    await conn.execute(
        """
        INSERT INTO feed_entries (
            id, feed_source, title, link, description, published_date, raw_content
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            updated_at = CURRENT_TIMESTAMP
    """,
        entry_id,
        feed_name,
        entry.get("title", ""),
        entry.get("link", ""),
        entry.get("description", ""),
        published_date,
        str(entry),
    )


async def process_feeds():
    """Main processing function"""
    # Load configuration
    with open("feeds.yaml", "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    # Connect to database
    conn = await asyncpg.connect(
        "postgresql://funding_user:funding_pass@localhost:5432/funding_db"
    )

    try:
        for feed_config in config["feeds"]:
            print(f"Processing {feed_config['name']}...")

            # Fetch and parse feed
            parsed_feed = await fetch_feed(feed_config["url"])

            # Save entries
            for entry in parsed_feed.entries:
                await save_entry(conn, entry, feed_config["name"])

            print(f"  → {len(parsed_feed.entries)} entries processed")

    finally:
        await conn.close()


if __name__ == "__main__":
    import asyncio

    asyncio.run(process_feeds())
