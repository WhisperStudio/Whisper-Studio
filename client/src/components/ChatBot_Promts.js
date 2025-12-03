// ChatBot_Promts.js
// !!IKKE_I_BRUK!!  const API_URL = "http://142.93.237.94:8001/api/chatbot";
const API_URL = "/api/chat";  

// Thin client: forwards user input to Python FastAPI and returns its response

// All intent/language logic is handled by Python backend

// No canned responses in the frontend

// generer en enkel sessionId per bruker (f.eks. lagres i localStorage)
export const getSessionId = () => {
  if (typeof window === "undefined") return "server-test";
  let id = localStorage.getItem("voteSessionId");
  if (!id) {
    id = crypto.randomUUID?.() || String(Date.now());
    localStorage.setItem("voteSessionId", id);
  }
  return id;
};

export const sendToBot = async (text) => {
  const sessionId = getSessionId();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, text }),
  });

  if (!res.ok) {
    throw new Error("Bot API error");
  }

  const data = await res.json();
  return data;
};
