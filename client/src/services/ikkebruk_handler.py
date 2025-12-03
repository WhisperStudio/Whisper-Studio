from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot_core import handle_message, ChatState

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only, replace with your frontend URL in production
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

@app.post("/api/chatbot", response_model=ChatResponse)
def chat_compat(req: ChatRequest):
    return chat(req)

@app.post("/api/handler", response_model=ChatResponse)
def chat_handler(req: ChatRequest):
    return chat(req)
