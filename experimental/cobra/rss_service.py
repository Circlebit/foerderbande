from feedgen.feed import FeedGenerator
from datetime import datetime, timezone
from typing import List
from database import FundingCall as FundingCallModel


def generate_funding_rss(funding_calls: List[FundingCallModel]) -> str:
    """
    Generate RSS feed from funding calls data.
    """
    fg = FeedGenerator()

    # Feed metadata
    fg.title('Fördermittel Monitor - Schlachthof Kassel')
    fg.link(href='http://localhost:8000/rss/funding-calls', rel='alternate')
    fg.description('Aktuelle Fördermittelausschreibungen für gemeinnützige Organisationen')
    fg.language('de')
    fg.lastBuildDate(datetime.now(timezone.utc))
    fg.generator('Funding Monitor v0.1.0')

    # Add items
    for call in funding_calls:
        fe = fg.add_entry()
        fe.id(call.url)  # Unique identifier
        fe.title(call.title)
        fe.link(href=call.url)
        fe.description(call.description or 'Keine Beschreibung verfügbar')
        fe.pubDate(call.created_at if call.created_at.tzinfo else call.created_at.replace(tzinfo=timezone.utc))

        # Add categories/tags
        fe.category(term=call.source, label=f'Quelle: {call.source}')

        # Add funding body as category if available
        if call.extra_data and 'funding_body' in call.extra_data:
            fe.category(
                term=call.extra_data['funding_body'],
                label=f"Fördergeber: {call.extra_data['funding_body']}"
            )

        # Enhanced description with metadata
        enhanced_desc = _build_enhanced_description(call)
        fe.description(enhanced_desc)

    return fg.rss_str(pretty=True).decode('utf-8')


def _build_enhanced_description(call: FundingCallModel) -> str:
    """
    Build enhanced description with metadata for RSS item.
    """
    desc_parts = []

    # Basic description
    if call.description:
        desc_parts.append(call.description)
        desc_parts.append("<br/><br/>")

    # Metadata section
    desc_parts.append("<strong>Details:</strong><br/>")

    if call.extra_data:
        # Deadline
        if 'deadline' in call.extra_data:
            deadline_str = call.extra_data['deadline']
            try:
                deadline_dt = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
                formatted_deadline = deadline_dt.strftime('%d.%m.%Y')
                desc_parts.append(f"📅 <strong>Frist:</strong> {formatted_deadline}<br/>")
            except:
                desc_parts.append(f"📅 <strong>Frist:</strong> {deadline_str}<br/>")

        # Funding amount
        min_amount = call.extra_data.get('min_amount')
        max_amount = call.extra_data.get('max_amount')
        currency = call.extra_data.get('currency', 'EUR')

        if min_amount and max_amount:
            desc_parts.append(f"💰 <strong>Fördersumme:</strong> {min_amount:,} - {max_amount:,} {currency}<br/>")
        elif max_amount:
            desc_parts.append(f"💰 <strong>Fördersumme:</strong> bis {max_amount:,} {currency}<br/>")

        # Target groups
        if 'target_groups' in call.extra_data:
            groups = ', '.join(call.extra_data['target_groups'])
            desc_parts.append(f"🎯 <strong>Zielgruppen:</strong> {groups}<br/>")

        # Contact
        if 'contact_email' in call.extra_data:
            email = call.extra_data['contact_email']
            desc_parts.append(f"📧 <strong>Kontakt:</strong> {email}<br/>")

    desc_parts.append(f"<br/>🔗 <strong>Quelle:</strong> {call.source}")

    return ''.join(desc_parts)