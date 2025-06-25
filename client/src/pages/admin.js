// src/pages/AdminPanel.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// 🔌 Socket.io
const socket = io("https://chat.vintrastudio.com", {
  transports: ["websocket"],
});

// 🧱 Styled Components
const Container = styled.div`
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Sidebar = styled.div`
  width: 280px;
  background: #1f1f1f;
  color: white;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid #333;
`;

const ChatWindow = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const Message = styled.div`
  margin-bottom: 12px;
  background: ${props => (props.from === 'admin' ? '#cce5ff' : '#e2e2e2')};
  padding: 10px;
  border-radius: 10px;
  align-self: ${props => (props.from === 'admin' ? 'flex-end' : 'flex-start')};
  max-width: 60%;
`;

const InputArea = styled.div`
  display: flex;
  padding: 20px;
  border-top: 1px solid #ddd;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const Button = styled.button`
  margin-left: 10px;
  padding: 10px 16px;
  background: #1f7cff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Conversation = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  background: ${props => (props.active ? '#333' : '#2a2a2a')};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: red;
  cursor: pointer;
`;

// 🧠 Hovedkomponent
function AdminPanel() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState({});
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");

  // 🔐 Sikkerhetskontroll
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("AdminPanel: bruker →", user);

    if (!user || user.role !== "admin") {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // 🔌 Socket.io kobling
  useEffect(() => {
    socket.on("init", (initialMessages) => {
      const convos = {};
      initialMessages.forEach((msg) => {
        if (!convos[msg.userId]) convos[msg.userId] = [];
        convos[msg.userId].push(msg);
      });
      setConversations(convos);
    });

    socket.on("new_message", (msg) => {
      setConversations(prev => ({
        ...prev,
        [msg.userId]: [...(prev[msg.userId] || []), msg]
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ✉️ Send svar
  const sendMessage = () => {
    if (!input.trim() || !selected) return;
    const msg = { from: 'admin', text: input, userId: selected };
    socket.emit("admin_reply", msg);
    setConversations(prev => ({
      ...prev,
      [selected]: [...(prev[selected] || []), msg]
    }));
    setInput("");
  };

  // 🗑️ Slett samtale
  const deleteConversation = (id) => {
    const updated = { ...conversations };
    delete updated[id];
    setConversations(updated);
    if (selected === id) setSelected(null);
  };

  return (
    <Container>
      <Sidebar>
        <h3>Aktive samtaler</h3>
        {Object.keys(conversations).map((id) => (
          <Conversation
            key={id}
            active={selected === id}
            onClick={() => setSelected(id)}
          >
            <span>Bruker {id.slice(-4)}</span>
            <DeleteButton onClick={(e) => {
              e.stopPropagation();
              deleteConversation(id);
            }}>🗑️</DeleteButton>
          </Conversation>
        ))}
      </Sidebar>

      <ChatWindow>
        <MessagesContainer>
          {selected && conversations[selected] && conversations[selected].map((msg, i) => (
            <Message key={i} from={msg.from}>
              <strong>{msg.from}:</strong> {msg.text}
            </Message>
          ))}
        </MessagesContainer>

        {selected && (
          <InputArea>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv et svar..."
            />
            <Button onClick={sendMessage}>Send</Button>
          </InputArea>
        )}
      </ChatWindow>
    </Container>
  );
}

export default AdminPanel;
