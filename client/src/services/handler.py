# api.py
from fastapi import FastAPI
from pydantic import BaseModel
from chatbot_core import handle_message, ChatState
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS for frontend (React dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://vintrastudio.com",
        "https://www.vintrastudio.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# enkel in-memory state pr. sessionId
SESSIONS: dict[str, ChatState] = {}

class ChatRequest(BaseModel):
    session_id: str
    text: str

class ChatResponse(BaseModel):
    reply: str
    lang: str
    intent: str
    awaiting_ticket_confirm: bool
    active_view: str | None
    last_topic: str | None

@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    state = SESSIONS.get(req.session_id) or ChatState()
    result, state = handle_message(req.text, state)
    SESSIONS[req.session_id] = state
    return ChatResponse(**result)
