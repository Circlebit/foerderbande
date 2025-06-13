from sqlalchemy import create_engine, Column, Integer, Text, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from typing import Optional

# Database URL - für PoC einfach hardcoded
DATABASE_URL = "postgresql://funding_user:funding_pass@localhost:5432/funding_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class FundingCall(Base):
    __tablename__ = "funding_calls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    description = Column(Text)
    url = Column(Text, nullable=False, unique=True)
    source = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=text('NOW()'))
    updated_at = Column(DateTime, server_default=text('NOW()'))
    extra_data = Column(JSONB, server_default=text("'{}'::jsonb"))


# Dependency für DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()