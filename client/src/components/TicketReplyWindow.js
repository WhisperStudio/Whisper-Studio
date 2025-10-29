import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FiX, FiSend, FiTrash2, FiUser, FiMessageCircle } from "react-icons/fi";
import { db, doc, updateDoc, serverTimestamp, collection, addDoc, onSnapshot } from "../firebase";

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 10080;
  background: rgba(2,6,23,0.6); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
`;

const Window = styled.div`
  width: min(900px, 92vw); height: min(720px, 90vh);
  background: radial-gradient(1200px 600px at 10% 0%, rgba(99,102,241,0.15), transparent),
              radial-gradient(900px 500px at 90% 20%, rgba(236,72,153,0.12), transparent),
              #0b1121;
  border: 1px solid rgba(148,163,184,0.12);
  border-radius: 18px; box-shadow: 0 40px 80px rgba(0,0,0,0.45);
  color: #e6f0ff; display: flex; flex-direction: column; overflow: hidden;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-bottom: 1px solid rgba(148,163,184,0.15);
  background: linear-gradient(180deg, rgba(2,6,23,0.8), rgba(2,6,23,0.55));
`;

const Title = styled.div`
  display: flex; flex-direction: column; gap: 6px;
  & h3 { margin: 0; font-size: 18px; }
  & small { color: #98a6c0 }
`;

const CloseBtn = styled.button`
  background: none; border: none; color: #cfefff; cursor: pointer;
  padding: 8px; border-radius: 10px; transition: background .2s;
  &:hover { background: rgba(148,163,184,0.12); }
`;

const Body = styled.div`
  flex: 1; display: grid; grid-template-rows: 1fr auto;
  padding: 16px;
`;

const Messages = styled.div`
  overflow-y: auto; padding: 12px; border-radius: 16px;
  border: 1px solid rgba(99,102,241,0.25);
  background: linear-gradient(180deg, rgba(23,37,84,0.65), rgba(15,23,42,0.65));
  display: flex; flex-direction: column; gap: 10px;
`;

const Bubble = styled.div`
  padding: 12px 16px; margin: 4px 0; border-radius: 14px; max-width: 75%;
  align-self: ${({ variant }) => (variant === "user" ? "flex-end" : "flex-start")};
  background: ${({ variant }) =>
    variant === "user"
      ? "linear-gradient(135deg, rgba(14,165,233,0.25), rgba(99,102,241,0.25))"
      : variant === "admin"
      ? "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)"
      : "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(59,130,246,0.16))"};
  border: ${({ variant }) =>
    variant === "user"
      ? "1px solid rgba(14,165,233,0.35)"
      : variant === "admin"
      ? "1px solid rgba(99,102,241,0.4)"
      : "1px solid rgba(168,85,247,0.35)"};
  color: ${({ variant }) => (variant === "admin" ? "#fff" : "#cfefff")};
  word-wrap: break-word;
`;

const Composer = styled.div`
  margin-top: 12px; display: flex; gap: 10px; align-items: flex-end;
`;

const TextArea = styled.textarea`
  flex: 1; padding: 12px; border-radius: 12px;
  border: 1px solid #334155; background: #0f172a; color: #e2e8f0;
  min-height: 90px; max-height: 220px; resize: vertical;
  &:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,0.2); }
`;

const SendBtn = styled.button`
  width: 48px; height: 48px; border-radius: 12px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff;
  display: grid; place-items: center; transition: transform .15s;
  &:disabled { opacity: .6; cursor: not-allowed; }
  &:active { transform: scale(.97); }
`;

const MetaRow = styled.div`
  display: flex; gap: 10px; align-items: center; color: #9db2d1; font-size: 12px;
`;

const Pill = styled.span`
  padding: 6px 12px; border-radius: 999px; font-weight: 700;
  background: ${({ color }) => color || "rgba(99,102,241,0.18)"};
  border: 1px solid rgba(99,102,241,0.35); color: #a78bfa;
`;

const formatTime = (timestamp) => {
  const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const TicketReplyWindow = ({ ticket, onClose, adminEmail }) => {
  const [liveTicket, setLiveTicket] = useState(ticket);
  const [input, setInput] = useState("");
  const msgRef = useRef(null);

  // Live oppdatering for denne ticketen
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "tickets", ticket.id), (snap) => {
      if (snap.exists()) setLiveTicket({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [ticket.id]);

  useEffect(() => {
    msgRef.current?.scrollTo({ top: msgRef.current.scrollHeight, behavior: "smooth" });
  }, [liveTicket?.messages?.length]);

  const sendReply = async () => {
    const text = input.trim();
    if (!text) return;

    const ticketRef = doc(db, "tickets", liveTicket.id);
    const updated = [...(liveTicket.messages || []), {
      text, sender: "admin", adminEmail, timestamp: new Date().toISOString(), userId: liveTicket.userId
    }];

    await updateDoc(ticketRef, {
      messages: updated,
      updatedAt: serverTimestamp(),
      status: liveTicket.status === "open" ? "in-progress" : liveTicket.status
    });

    setInput("");
  };

  return (
    <Overlay>
      <Window>
        <Header>
          <Title>
            <h3>{liveTicket.title}</h3>
            <MetaRow>
              <Pill>Priority: {String(liveTicket.priority || "medium").toUpperCase()}</Pill>
              <Pill color="rgba(34,197,94,0.22)" style={{borderColor:"rgba(34,197,94,0.4)", color:"#34d399"}}>
                Status: {String(liveTicket.status || "open").toUpperCase()}
              </Pill>
              <span style={{display:"inline-flex",alignItems:"center",gap:6,opacity:.8}}>
                <FiMessageCircle /> {liveTicket.messages?.length || 0} messages
              </span>
            </MetaRow>
          </Title>
          <CloseBtn onClick={onClose} title="Close">
            <FiX size={20} />
          </CloseBtn>
        </Header>

        <Body>
          <Messages ref={msgRef}>
            {/* Startbeskrivelse vises som første “user”-boble */}
            {liveTicket.description && (
              <Bubble variant="user">{liveTicket.description}</Bubble>
            )}
            {(liveTicket.messages || []).map((m, i) => (
              <Bubble key={i} variant={m.sender === "user" ? "user" : m.sender === "admin" ? "admin" : "bot"}>
                {m.text}
                <div style={{fontSize:11,opacity:.7,marginTop:6}}>
                  {m.sender === "admin" ? "Admin" : m.sender === "user" ? "User" : "System"} • {formatTime(m.timestamp)}
                </div>
              </Bubble>
            ))}
          </Messages>

          <Composer>
            <TextArea
              placeholder="Write a reply… (Enter for ny linje, Ctrl/Cmd+Enter for å sende)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  sendReply();
                }
              }}
            />
            <SendBtn onClick={sendReply} disabled={!input.trim()}>
              <FiSend />
            </SendBtn>
          </Composer>
        </Body>
      </Window>
    </Overlay>
  );
};

export default TicketReplyWindow;
