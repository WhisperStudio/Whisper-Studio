// src/pages/AdminPanel.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Sett IP til droplet din ↓
const socket = io("https://chat.vintrastudio.com");

function AdminPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("init", (initialMessages) => {
      setMessages(initialMessages);
    });

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("admin_reply", input);
    setInput("");
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>Vintra Admin Panel</h2>
      <div style={{ height: 400, overflowY: "scroll", background: "#eee", padding: 10, marginBottom: 20 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{m.from}:</strong> {m.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv svar..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 16px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
