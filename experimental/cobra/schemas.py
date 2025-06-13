from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional, Dict, Any


class FundingCallBase(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    source: str
    extra_data: Dict[str, Any] = {}


class FundingCallCreate(FundingCallBase):
    pass


class FundingCall(FundingCallBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True