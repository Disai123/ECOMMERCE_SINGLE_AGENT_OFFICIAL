"""
Agent service — fully async, single event loop.

History persistence strategy
-------------------------------
Each DB row in agent_messages holds:
  role = "user"  | content = plain text
  role = "ai"    | content = JSON with {text, tool_calls}   ← serialised AIMessage
  role = "tool"  | content = JSON with {tool_call_id, output}  ← ToolMessage result

This preserves the full LangChain message graph across requests so the model
always has proper tool-call / tool-result context when reconstructing history.
"""

import os
import json
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from dotenv import load_dotenv

load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import (
    SystemMessage, HumanMessage, AIMessage, ToolMessage, BaseMessage
)
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END

from .state import AgentState
from .tools import AgentTools
from .. import models

# ---------------------------------------------------------------------------
# LLM
# ---------------------------------------------------------------------------
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite")


# ---------------------------------------------------------------------------
# (De)serialisation helpers
# ---------------------------------------------------------------------------

def _serialize_message(msg: BaseMessage) -> dict:
    """Convert a LangChain message to a dict safe for JSON storage."""
    if isinstance(msg, HumanMessage):
        return {"role": "user", "content": str(msg.content)}

    if isinstance(msg, AIMessage):
        tool_calls = []
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            for tc in msg.tool_calls:
                tool_calls.append({
                    "id":   tc["id"],
                    "name": tc["name"],
                    "args": tc["args"],
                })
        return {
            "role":    "ai",
            "content": json.dumps({"text": str(msg.content), "tool_calls": tool_calls}),
        }

    if isinstance(msg, ToolMessage):
        return {
            "role":    "tool",
            "content": json.dumps({
                "tool_call_id": msg.tool_call_id,
                "output":       str(msg.content),
            }),
        }

    # Fallback — shouldn't hit this for the types we use
    return {"role": "other", "content": str(msg.content)}


def _deserialize_row(role: str, content: str) -> BaseMessage | None:
    """Reconstruct a LangChain message from a DB row."""
    if role == "user":
        return HumanMessage(content=content)

    if role == "ai":
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            # Legacy plain-text assistant row
            return AIMessage(content=content)

        text       = data.get("text", "")
        tool_calls = data.get("tool_calls", [])

        if tool_calls:
            # Reconstruct AIMessage with tool_calls so the model sees the
            # full structured history and doesn't re-interpret follow-ups.
            return AIMessage(content=text, tool_calls=tool_calls)
        return AIMessage(content=text)

    if role == "tool":
        try:
            data = json.loads(content)
            return ToolMessage(
                content=data.get("output", ""),
                tool_call_id=data.get("tool_call_id", ""),
            )
        except json.JSONDecodeError:
            return None          # skip malformed rows

    if role == "assistant":
        # Legacy rows saved with role="assistant" before this refactor
        return AIMessage(content=content)

    return None                  # unknown roles → skip


# ---------------------------------------------------------------------------
# Main agent entry point
# ---------------------------------------------------------------------------

async def run_agent_turn(
    user_message: str,
    user_id: int,
    session_id: str,
    db: AsyncSession,
):
    """
    Run one agent turn, fully async on FastAPI's event loop.
    Saves the complete message graph (tool calls + results) to the DB so the
    next turn has proper context.
    """
    agent_tools = AgentTools(db, user_id, session_id)

    # ---------------------------------------------------------------------- #
    # Tool definitions                                                         #
    # ---------------------------------------------------------------------- #
    @tool
    async def search_products(query: str) -> str:
        """Search for products in the ShopEasy catalog by name or description keyword.
        Always call this before mentioning any product. Return ONLY what this tool returns."""
        results = await agent_tools.search_products(query)
        if not results:
            return f"No products found in our catalog matching '{query}'. Please try a different search term."
        return results

    @tool
    async def add_to_cart(product_id: int, quantity: int = 1) -> str:
        """Add a product to the cart."""
        return await agent_tools.add_to_cart(product_id, quantity)

    @tool
    async def get_cart() -> list:
        """Get current cart contents."""
        return await agent_tools.get_cart()

    @tool
    async def checkout() -> str:
        """Checkout pending items in the cart."""
        return await agent_tools.checkout()

    tools_list = [search_products, add_to_cart, get_cart, checkout]
    model_with_tools = llm.bind_tools(tools_list)

    # ---------------------------------------------------------------------- #
    # LangGraph nodes (async)                                                  #
    # ---------------------------------------------------------------------- #
    async def agent_node(state: AgentState):
        response = await model_with_tools.ainvoke(state["messages"])
        return {"messages": [response]}

    async def tool_node(state: AgentState):
        last = state["messages"][-1]
        results = []
        if hasattr(last, "tool_calls") and last.tool_calls:
            for tc in last.tool_calls:
                selected = next((t for t in tools_list if t.name == tc["name"]), None)
                output = "Error: Tool not found"
                if selected:
                    try:
                        output = await selected.ainvoke(tc["args"])
                    except Exception as e:
                        output = f"Tool error: {e}"
                results.append(ToolMessage(content=str(output), tool_call_id=tc["id"]))
        return {"messages": results}

    def should_continue(state: AgentState) -> str:
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            return "tools"
        return END

    workflow = StateGraph(AgentState)
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", tool_node)
    workflow.set_entry_point("agent")
    workflow.add_conditional_edges("agent", should_continue)
    workflow.add_edge("tools", "agent")
    app_graph = workflow.compile()

    # ---------------------------------------------------------------------- #
    # Load full conversation history from DB                                   #
    # ---------------------------------------------------------------------- #
    stmt = (
        select(models.AgentMessage)
        .filter(models.AgentMessage.session_id == session_id)
        .order_by(models.AgentMessage.created_at)
    )
    result = await db.execute(stmt)
    db_messages = result.scalars().all()

    current_messages: List[BaseMessage] = [
        SystemMessage(content=(
            "You are a helpful E-commerce Assistant for ShopEasy.\n"
            "\n"
            "STRICT RULES — follow these without exception:\n"
            "1. ALWAYS call the search_products tool FIRST before mentioning any product.\n"
            "2. ONLY show products that the search_products tool actually returned. "
            "   NEVER invent product names, prices, brands, or descriptions.\n"
            "3. If the tool returns no results, say: "
            "   'I couldn't find any products matching that in our catalog. Try a different keyword.'\n"
            "4. To add a product to the cart, use add_to_cart with the product_id "
            "   returned by the tool — NEVER guess an ID.\n"
            "5. When the user says 'yes', 'add it', 'sure', or similar confirmations, "
            "   call add_to_cart using the product_id from the LAST search result shown.\n"
            "6. Use get_cart to show cart contents. Use checkout to place an order.\n"
            "7. Keep answers concise and friendly."
        ))
    ]

    for row in db_messages:
        msg = _deserialize_row(row.role, row.content)
        if msg is not None:
            current_messages.append(msg)

    # Add the current user turn
    current_messages.append(HumanMessage(content=user_message))

    # ---------------------------------------------------------------------- #
    # Run graph (single event loop — no threads)                               #
    # ---------------------------------------------------------------------- #
    final_state = await app_graph.ainvoke({
        "messages":   current_messages,
        "user_id":    user_id,
        "session_id": session_id,
    })

    # ---------------------------------------------------------------------- #
    # Persist the NEW messages produced this turn                              #
    # (user message + every AI / tool message from the graph run)             #
    # ---------------------------------------------------------------------- #

    # 1. User message
    user_row = _serialize_message(HumanMessage(content=user_message))
    db.add(models.AgentMessage(
        session_id=session_id,
        role=user_row["role"],
        content=user_row["content"],
    ))

    # 2. All messages produced during this turn (everything after history + user)
    new_msgs = final_state["messages"][len(current_messages):]
    for msg in new_msgs:
        serialized = _serialize_message(msg)
        if serialized["role"] == "other":
            continue
        db.add(models.AgentMessage(
            session_id=session_id,
            role=serialized["role"],
            content=serialized["content"],
        ))

    await db.commit()

    # Return the last AI message as the agent's reply
    last_msg = final_state["messages"][-1]
    return last_msg.content if isinstance(last_msg, AIMessage) else str(last_msg.content)
