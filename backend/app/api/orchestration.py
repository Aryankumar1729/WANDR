from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.agents.orchestrator import OrchestratorAgent

router = APIRouter()
orchestrator = OrchestratorAgent()

class PlanRequest(BaseModel):
    origin: str
    destination: str
    date: str
    duration: int = 2
    adults: int = 1
    budget: float = 50000.0

@router.post("/stream")
async def stream_orchestration(request: PlanRequest):
    return StreamingResponse(
        orchestrator.stream_plan(request.model_dump()), 
        media_type="text/event-stream"
    )
