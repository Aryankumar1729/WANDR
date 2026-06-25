from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import llm_service

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
    reply = await llm_service.chat(request.message, history)
    return ChatResponse(reply=reply)
