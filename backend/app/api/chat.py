from fastapi import APIRouter, HTTPException
from app.schemas import ChatRequest, ChatResponse
from app.storage.repository import ScanRepository
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(payload: ChatRequest):
    """
    Context-aware security assistant chat grounded in scan results and powered by Gemini.
    """
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Chat message cannot be empty.")

    report = None
    if payload.scanId:
        report = await ScanRepository.get_scan(payload.scanId)

    reply, quick_replies = await gemini_service.chat_response(
        report=report,
        user_message=payload.message,
        finding_id=payload.findingId
    )

    return ChatResponse(reply=reply, quickReplies=quick_replies)

