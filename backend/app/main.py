"""
Wandr — AI Travel Planner Backend
FastAPI application entry point with CORS, SSE, and API routing.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import chat, destinations, itinerary, weather, health, logistics, orchestration

app = FastAPI(
    title="Wandr Backend",
    description="Backend API for Wandr - AI Travel Planner",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(destinations.router, prefix="/api/destinations", tags=["destinations"])
app.include_router(itinerary.router, prefix="/api/itinerary", tags=["itinerary"])
app.include_router(weather.router, prefix="/api/weather", tags=["weather"])
app.include_router(logistics.router, prefix="/api/logistics", tags=["logistics"])
app.include_router(orchestration.router, prefix="/api/orchestration", tags=["orchestration"])


@app.get("/")
async def root():
    return {
        "name": "Wandr API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }
