from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List

from database import get_db, FundingCall as FundingCallModel
from schemas import FundingCall
from rss_service import generate_funding_rss

app = FastAPI(title="Funding Monitor API", version="0.1.0")

# CORS für Frontend-Zugriff
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Funding Monitor API", "version": "0.1.0"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


@app.get("/api/funding-calls", response_model=List[FundingCall])
async def get_funding_calls(db: Session = Depends(get_db)):
    """
    Get all funding calls, ordered by relevance and deadline.
    """
    calls = db.query(FundingCallModel).order_by(
        FundingCallModel.created_at.desc()
    ).all()
    return calls


@app.get("/rss/funding-calls", response_class=Response)
async def get_funding_rss(db: Session = Depends(get_db)):
    """
    Get funding calls as RSS feed.
    """
    calls = db.query(FundingCallModel).order_by(
        FundingCallModel.created_at.desc()
    ).limit(50).all()  # Limit to latest 50 entries for RSS

    rss_content = generate_funding_rss(calls)

    return Response(
        content=rss_content,
        media_type="application/rss+xml",
        headers={"Content-Disposition": "inline; filename=funding-calls.rss"}
    )
