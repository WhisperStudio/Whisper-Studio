// src/pages/ChatDashboard.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiLock, FiTrash2 } from "react-icons/fi";

// Styled components
const ChatDashboardContainer = styled.div`
  background: #0b1121; 
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 30px 40px rgba(0, 0, 0, 0.25);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChatListWrapper = styled.div`
  display: flex;
  gap: 1rem;
`;

const ChatList = styled.div`
  flex: 1;
  max-width: 300px;
  border-right: 1px solid #ccc;
  padding-right: 16px;
  overflow-y: auto;
`;

const ChatListItem = styled.div`
  padding: 8px;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  background: ${({ active }) => (active ? "#182547" : "transparent")};
  transition: background 0.2s;
  &:hover {
    background: rgb(38, 55, 100);
  }
`;

const ChatDetails = styled.div`
  flex: 2;
  padding-left: 16px;
`;

const MessagesContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: #faf9fa;
`;

const MessageItem = styled.div`
  margin-bottom: 8px;
  line-height: 1.4;
  color: ${({ sender }) => {
    if (sender === "bot") return "#7824BC"; // Purple for bot
    if (sender === "admin") return "#3B82F6"; // Blue for admin
    if (sender === "user") return "#484F5D"; // Dark text for user
    return "#000";
  }};
`;

const AdminTextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-family: inherit;
  resize: vertical;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  background-color: ${({ bgColor }) => bgColor || "#2563eb"};
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  &:hover {
    opacity: 0.9;
  }
`;

const CategoryFilter = styled.select`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid rgb(49, 54, 77);
  margin-bottom: 12px;
  background-color: #1a1f2e;
  color: #fff;
`;

const CardTitle = styled.h2`
  margin-bottom: 12px;
  font-size: 18px;
`;

// Funksjon for å signalisere at admin skriver
const setAdminTyping = async (typing) => {
  try {
    await fetch("http://104.248.132.57:5000/api/admin/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typing })
    });
  } catch (error) {
    console.error("Error setting admin typing:", error);
  }
};

// ChatDashboard-komponenten
const ChatDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [adminReply, setAdminReply] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Hent samtaler fra API-et
  const fetchConversations = async () => {
    try {
      const res = await fetch("http://104.248.132.57:5000/api/conversations");
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Poll for oppdateringer hvert 10. sekund
  useEffect(() => {
    fetchConversations();
    const intervalId = setInterval(fetchConversations, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setAdminReply("");
  };

  // Oppdater adminReply og signaliser til serveren om at admin skriver
  const handleAdminTextChange = (e) => {
    setAdminReply(e.target.value);
    setAdminTyping(e.target.value.trim().length > 0);
  };

  // Send admin-reply til backend og oppdater samtalen
  const handleAdminReply = async (conversationId) => {
    if (!adminReply.trim()) return;
    try {
      const res = await fetch(
        `http://104.248.132.57:5000/api/conversations/${conversationId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ replyText: adminReply })
        }
      );
      if (!res.ok) throw new Error("Failed to send admin reply");

      // Etter sending stopper vi admin typing
      await setAdminTyping(false);

      setAdminReply("");
      await fetchConversations();
      // Hent oppdatert samtale
      const updatedRes = await fetch(
        `http://104.248.132.57:5000/api/conversations/${conversationId}`
      );
      const updatedConv = await updatedRes.json();
      setSelectedConversation(updatedConv);
    } catch (error) {
      console.error("Error sending admin reply:", error);
    }
  };

  // Slett en samtale
  const handleDeleteConversation = async (conversationId) => {
    try {
      const res = await fetch(
        `http://104.248.132.57:5000/api/conversations/${conversationId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete conversation");
      await fetchConversations();
      setSelectedConversation(null);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Lukk en samtale
  const handleCloseConversation = async (conversationId) => {
    try {
      const res = await fetch(
        `http://104.248.132.57:5000/api/conversations/${conversationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "closed" })
        }
      );
      if (!res.ok) throw new Error("Failed to close conversation");
      await fetchConversations();
      const updatedRes = await fetch(
        `http://104.248.132.57:5000/api/conversations/${conversationId}`
      );
      const updatedConv = await updatedRes.json();
      setSelectedConversation(updatedConv);
    } catch (error) {
      console.error("Error closing conversation:", error);
    }
  };

  // Filtrer samtaler etter valgt kategori
  const filteredConversations =
    categoryFilter === "All"
      ? conversations
      : conversations.filter((conv) => conv.category === categoryFilter);

  return (
    <ChatDashboardContainer>
      <CardTitle style={{ color: "white" }}>Live Chat</CardTitle>
      <p style={{ marginBottom: "1rem", marginLeft: "1rem", color: "white", fontSize: "0.9rem" }}>
        • See all ongoing chats. • Reply as admin (blue text). • Bot is purple text.
      </p>
      <CategoryFilter
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        <option value="All">All categories</option>
        <option value="Games">Games</option>
        <option value="General">General</option>
        <option value="Work">Work</option>
        <option value="Billing">Billing</option>
        <option value="Support">Support</option>
        <option value="Sales">Sales</option>
        <option value="Other">Other</option>
      </CategoryFilter>
      <ChatListWrapper>
        <ChatList>
          <h3 style={{ marginTop: 0 }}>Conversations</h3>
          {filteredConversations.length === 0 ? (
            <p>No conversations found.</p>
          ) : (
            filteredConversations.map((conv) => {
              const lastSender =
                conv.messages && conv.messages.length > 0
                  ? conv.messages[conv.messages.length - 1].sender.toLowerCase()
                  : "none";
              const senderColor =
                lastSender === "bot"
                  ? "#7824BC"
                  : lastSender === "admin"
                  ? "#3B82F6"
                  : lastSender === "user"
                  ? "#484F5D"
                  : "#aaa";
              return (
                <ChatListItem
                  key={conv.conversationId}
                  active={
                    selectedConversation &&
                    selectedConversation.conversationId === conv.conversationId
                  }
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div>
                    <strong style={{ color: "#fff", fontSize: "1.1rem" }}>
                      {conv.name || "Unknown user"}
                    </strong>
                    <strong style={{ color: "#fff", marginLeft: "10px" }}>:</strong>
                    <strong
                      style={{
                        fontSize: "0.75rem",
                        color: "#fff",
                        marginLeft: "10px"
                      }}
                    >
                      {new Date(conv.createdAt).toLocaleString()}
                    </strong>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "white", margin: 0 }}>
                    {conv.messages && conv.messages.length > 0
                      ? conv.messages[conv.messages.length - 1].text.slice(0, 50) + "..."
                      : "No messages"}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#aaa", margin: "4px 0 0 0" }}>
                    Sist Redigert{" "}
                    <strong style={{ color: senderColor }}>
                      {lastSender.toUpperCase()}
                    </strong>{" "}
                    : {new Date(conv.updatedAt).toLocaleString()}
                  </p>
                </ChatListItem>
              );
            })
          )}
        </ChatList>
        <ChatDetails>
          {selectedConversation ? (
            <div>
              <h3 style={{ marginTop: 0 }}>
                Chat with {selectedConversation.name || "Unknown user"}
              </h3>
              <p style={{ marginBottom: 10, fontSize: "0.9rem", color: "white" }}>
                Email: {selectedConversation.email || "Unknown"}
              </p>
              <p style={{ marginBottom: 10, fontSize: "0.9rem", color: "white" }}>
                Category: {selectedConversation.category || "None"}
              </p>
              <MessagesContainer>
                {selectedConversation.messages.map((msg, index) => (
                  <MessageItem key={index} sender={msg.sender}>
                    <strong>{msg.sender.toUpperCase()}:</strong> {msg.text}
                  </MessageItem>
                ))}
              </MessagesContainer>
              <AdminTextArea
                rows="3"
                placeholder="Write a reply..."
                value={adminReply}
                onChange={handleAdminTextChange}
              />
              <ActionButtons>
                <ActionButton
                  bgColor="#2563eb"
                  onClick={() =>
                    handleAdminReply(selectedConversation.conversationId)
                  }
                >
                  Send Reply
                </ActionButton>
                <ActionButton
                  bgColor="#f59e0b"
                  onClick={() =>
                    handleCloseConversation(selectedConversation.conversationId)
                  }
                >
                  Close <FiLock style={{ marginLeft: "4px" }} />
                </ActionButton>
                <ActionButton
                  bgColor="#dc2626"
                  onClick={() =>
                    handleDeleteConversation(selectedConversation.conversationId)
                  }
                >
                  Delete <FiTrash2 style={{ marginLeft: "4px" }} />
                </ActionButton>
              </ActionButtons>
            </div>
          ) : (
            <p>Select a conversation.</p>
          )}
        </ChatDetails>
      </ChatListWrapper>
    </ChatDashboardContainer>
  );
};

export default ChatDashboard;
