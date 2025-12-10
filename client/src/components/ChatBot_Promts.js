// ChatBot_Promts.js

import { ChatState, handleMessage } from '../services/Node_AI'; // juster path

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


const stateBySession = new Map();

export const sendToBot = async (text) => {
  const sessionId = getSessionId();

  let state = stateBySession.get(sessionId);
  if (!state) {
    state = new ChatState();
    stateBySession.set(sessionId, state);
  }

  const result = await handleMessage(text, state);
  stateBySession.set(sessionId, result.state);

  const {
    reply,
    lang,
    intent,
    awaiting_ticket_confirm,
    active_view,
    last_topic,
  } = result;

  return {
    reply,
    lang,
    intent,
    awaiting_ticket_confirm,
    active_view,
    last_topic,
  };
};
