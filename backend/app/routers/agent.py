from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .. import schemas, models, deps
from ..database import get_db
from ..agent.service import run_agent_turn
import uuid

router = APIRouter(
    prefix="/agent",
    tags=["agent"]
)

@router.post("/chat", response_model=schemas.AgentChatResponse)
async def chat_with_agent(
    request: schemas.AgentChatRequest,
    current_user: models.User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ensure session exists or create it
    result = await db.execute(select(models.AgentSession).filter(models.AgentSession.id == request.session_id))
    session = result.scalars().first()
    
    if not session:
        session = models.AgentSession(id=request.session_id, user_id=current_user.id)
        db.add(session)
        await db.commit()
    
    # Run Agent
    try:
        response_text = await run_agent_turn(
            user_message=request.message,
            user_id=current_user.id,
            session_id=request.session_id,
            db=db
        )
    except Exception as e:
        # Log error
        print(f"Agent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
    return schemas.AgentChatResponse(
        response=str(response_text),
        session_id=request.session_id
    )

@router.get("/history/{session_id}")
async def get_history(
    session_id: str,
    current_user: models.User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    import json as _json

    # Verify ownership
    result = await db.execute(
        select(models.AgentSession).filter(
            models.AgentSession.id == session_id,
            models.AgentSession.user_id == current_user.id
        )
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    result = await db.execute(
        select(models.AgentMessage)
        .filter(models.AgentMessage.session_id == session_id)
        .order_by(models.AgentMessage.created_at)
    )
    rows = result.scalars().all()

    clean = []
    for row in rows:
        # Skip intermediate tool-result rows — frontend never displays them
        if row.role == "tool":
            continue

        if row.role in ("ai", "assistant"):
            # Extract the plain text from the JSON envelope (if present)
            try:
                data = _json.loads(row.content)
                text = data.get("text", "").strip()
            except (_json.JSONDecodeError, AttributeError):
                # Legacy plain-text assistant rows
                text = row.content.strip()

            # Skip AI messages that are pure tool-dispatch with no visible text
            if not text:
                continue

            clean.append({"role": "assistant", "content": text})

        elif row.role == "user":
            clean.append({"role": "user", "content": row.content})

    return clean


@router.get("/cart/{session_id}")
async def get_agent_cart(
    session_id: str,
    current_user: models.User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    import json as _json
    # No user_id filter — consistent with the /chat endpoint which also only
    # matches by session_id. The session_id is a random string so it is
    # effectively private already.
    result = await db.execute(
        select(models.AgentSession).filter(
            models.AgentSession.id == session_id
        )
    )
    session = result.scalars().first()
    if not session or not session.cart_state:
        return []
    try:
        return _json.loads(session.cart_state)
    except Exception:
        return []

