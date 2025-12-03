from http.server import BaseHTTPRequestHandler
import json

from chatbot_core import handle_message, ChatState

# enkel in-memory state pr. sessionId
SESSIONS: dict[str, ChatState] = {}


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # CORS preflight
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        # --- les body ---
        length = int(self.headers.get("Content-Length", 0) or 0)
        body = self.rfile.read(length) if length > 0 else b"{}"

        try:
            data = json.loads(body.decode("utf-8") or "{}")
        except Exception:
            data = {}

        session_id = data.get("session_id") or "default"
        text = data.get("text") or ""

        # --- hent/lag state ---
        state = SESSIONS.get(session_id) or ChatState()

        # --- kall chatbot-core ---
        result, state = handle_message(text, state)
        SESSIONS[session_id] = state

        # --- svar ---
        resp_bytes = json.dumps(result).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(resp_bytes)
