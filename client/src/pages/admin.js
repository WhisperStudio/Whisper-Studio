// src/pages/admin.js
import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiFileText,
  FiMenu,
  FiBell,
  FiUser,
  FiSun,
  FiMoon,
  FiBarChart2,
  FiClipboard,
  FiTrash2,
  FiLock,
  FiCornerDownRight,
  FiInbox
} from "react-icons/fi";
import {
  FcAssistant,
  FcReadingEbook,
  FcAndroidOs
} from "react-icons/fc";
import PieChartCard from "../components/pieChartCard";
import BotAdminTicketChart from "../components/BotAdminTicketChart";
import LineChart from "../components/LineChart";
import Bifrost from "../components/bifrost";
// Tickets-komponenten legges til fra den andre koden
import Tickets from "../components/Tickets";

// ---------- THEMES (bruker dine farger) ----------
const lightTheme = {
  bodyBg: "#f9fafb",
  containerBg: "#ffffff",
  text: "#111827",
  mutedText: "#6b7280",
  cardBg: "#ffffff",
  sidebarBg: "#1f2937",
  sidebarHover: "#374151",
  sidebarActive: "rgba(255, 255, 255, 0.1)",
  buttonBg: "#2563eb",
  buttonHover: "#1d4ed8",
  inputBorder: "#d1d5db",
  inputFocus: "#9ca3af",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
};

const darkTheme = {
  bodyBg: "#0F131D",
  containerBg: "#161A28",
  text: "#F3F4F6",
  mutedText: "#9CA3AF",
  cardBg: "#1A1F2E",
  sidebarBg: "#161A28",
  sidebarHover: "#1F2433",
  sidebarActive: "rgba(255, 255, 255, 0.05)",
  buttonBg: "#00BFA6",
  buttonHover: "#00A38D",
  inputBorder: "#2E3345",
  inputFocus: "#4b5563",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
};

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Roboto", sans-serif;
    background-color: ${({ theme }) => theme.bodyBg};
    color: ${({ theme }) => theme.text};
    transition: background-color 0.3s, color 0.3s;
  }
`;

// ---------- STYLED COMPONENTS FOR LAYOUT ----------
const AdminContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const TopBar = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Brand = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;

const MenuIcon = styled.div`
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.mutedText};
  transition: color 0.2s;
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background-color: ${({ theme }) => theme.bodyBg};
  color: ${({ theme }) => theme.text};
  &:focus {
    border-color: ${({ theme }) => theme.inputFocus};
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const IconButton = styled.div`
  font-size: 20px;
  color: ${({ theme }) => theme.mutedText};
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const Main = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: ${({ expanded }) => (expanded ? "220px" : "60px")};
  background-color: ${({ theme }) => theme.sidebarBg};
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`;

const SidebarItem = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme, active }) => (active ? "#fff" : theme.mutedText)};
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  background-color: ${({ active, theme }) =>
    active ? theme.sidebarActive : "transparent"};
  &:hover {
    background-color: ${({ theme }) => theme.sidebarHover};
    color: #fff;
  }
`;

const SidebarIcon = styled.div`
  font-size: 20px;
  margin-right: ${({ expanded }) => (expanded ? "16px" : "0")};
  transition: margin 0.3s;
`;

const SidebarLabel = styled.span`
  display: ${({ expanded }) => (expanded ? "inline" : "none")};
  white-space: nowrap;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
`;

const MainContent = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightSidebar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 8px;
  padding: 20px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  transition: background-color 0.3s;
`;

const CardTitle = styled.h2`
  margin-bottom: 12px;
  font-size: 18px;
`;

// ---------- CHAT DASHBOARD (DIN eksisterende implementasjon) ----------
const ChatDashboardContainer = styled.div`
  background: #1A1F2E; 
  box-shadow: 0 10px 20px 6px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  border-radius: 12px;
  
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
  padding-right: 16px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #0b1121; /* Mørk bakgrunn, samme som container */
  }
  &::-webkit-scrollbar-thumb {
    background-color:rgb(48, 49, 53); /* Grå scrollbar */
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgb(48, 49, 53);
  }
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
  background:rgb(255, 255, 255);
`;

// Color-code messages
const MessageItem = styled.div`
  margin-bottom: 8px;
  line-height: 1.4;
  color: ${({ sender }) => {
    if (sender === "bot") return "#7824BC";   // Purple for bot
    if (sender === "admin") return "#3B82F6"; // Blue for admin
    if (sender === "user") return "#484F5D";  // Dark text for user
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
  background-color: #0b1121;
  color: #fff;
`;

// ---------- CHAT DASHBOARD COMPONENT ----------
const ChatDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [adminReply, setAdminReply] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Hent samtaler
  const fetchConversations = async () => {
    try {
      const res = await fetch("https://api.vintrastudio.com/api/conversations");
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Polling hvert 10. sekund
  useEffect(() => {
    fetchConversations();
    const intervalId = setInterval(fetchConversations, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setAdminReply("");
  };

  // Kalles når admin skriver i tekstfeltet
  const handleAdminTextChange = (e) => {
    setAdminReply(e.target.value);
    // Oppdater serveren om at admin skriver (dersom feltet ikke er tomt)
    setAdminTyping(e.target.value.trim().length > 0);
  };

  // Oppdater serveren om at admin skriver
  const setAdminTyping = async (typing) => {
    try {
      await fetch("https://api.vintrastudio.com/api/admin/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typing })
      });
    } catch (error) {
      console.error("Error setting admin typing:", error);
    }
  };

  // Send admin-reply
  const handleAdminReply = async (conversationId) => {
    if (!adminReply.trim()) return;
    try {
      const res = await fetch(
        `https://api.vintrastudio.com/api/conversations/${conversationId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ replyText: adminReply })
        }
      );
      if (!res.ok) throw new Error("Failed to send admin reply");

      // Etter sending, si fra at admin ikke lenger skriver
      await setAdminTyping(false);

      setAdminReply("");
      await fetchConversations();
      // Hent oppdatert samtale
      const updatedRes = await fetch(
        `https://api.vintrastudio.com/api/conversations/${conversationId}`
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
        `https://api.vintrastudio.com/api/conversations/${conversationId}`,
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
        `https://api.vintrastudio.com/api/conversations/${conversationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "closed" })
        }
      );
      if (!res.ok) throw new Error("Failed to close conversation");
      await fetchConversations();
      const updatedRes = await fetch(
        `https://api.vintrastudio.com/api/conversations/${conversationId}`
      );
      const updatedConv = await updatedRes.json();
      setSelectedConversation(updatedConv);
    } catch (error) {
      console.error("Error closing conversation:", error);
    }
  };
  const lastSender =
  selectedConversation?.messages?.length > 0
    ? selectedConversation.messages[selectedConversation.messages.length - 1].sender.toLowerCase()
    : "ingen";

const senderColor =
  lastSender === "bot"
    ? "#7824BC"
    : lastSender === "admin"
    ? "#3B82F6"
    : lastSender === "user"
    ? "#484F5D"
    : "#aaa";



  // Filter samtaler etter kategori
  const filteredConversations =
    categoryFilter === "All"
      ? conversations
      : conversations.filter((conv) => conv.category === categoryFilter);

  return (
    <ChatDashboardContainer >
      <div style={{ borderBottom: "", display: "grid" }}>
        <CardTitle style={{ color: "white",  marginLeft: "auto", marginRight: "auto", fontSize: "1.4rem" }}>Live Chat</CardTitle>
        <div style={{ marginTop: "-0.5rem", marginBottom: "3rem", marginLeft: "6.2rem" , color: "white", fontSize: "0.9rem"}}>
          <p style={{ marginBottom: "1rem", marginLeft: "1rem", fontSize: "1rem"}}>
            Se alle pågående chatter.
          </p>
          <p style={{ marginBottom: "1rem", marginLeft: "3rem"}}>
            • Admin vises med blå tekst. <FcAssistant style={{ fontSize: "1.5rem", marginBottom: "-0.3rem" }}/>
          </p>
          <p style={{ marginBottom: "1rem", marginLeft: "3rem"}}>
            • Bot vises med lilla tekst. <FcAndroidOs style={{ fontSize: "1.5rem", marginBottom: "-0.3rem" }}/>
          </p>
          <p style={{ marginBottom: "1rem", marginLeft: "3rem"}}>
              • User vises med grå tekst. <FcReadingEbook style={{ fontSize: "1.5rem", marginBottom: "-0.3rem" }}/>
          </p>
        </div>
      </div>
      
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
        <ChatList style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              padding: "1rem",
              borderRadius: "6px",
              backgroundColor: "#0b1121",
              maxHeight: "700px",      // Sett maks høyde
              overflowY: "auto", 
              
            }}>
          <h3 style={{ marginTop: 0 }}>Conversations</h3>
          {filteredConversations.length === 0 ? (
            <p>No conversations found.</p>
          ) : (
            filteredConversations.map((conv) => {
              const lastSender =
                conv.messages && conv.messages.length > 0
                  ? conv.messages[conv.messages.length - 1].sender.toLowerCase()
                  : "ingen";
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
                        marginLeft: "10px",
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
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      margin: "4px 0 0 0",
                    }}
                  >
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
        <ChatDetails style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              padding: "1rem",
              borderRadius: "6px",
              backgroundColor: "#0b1121",
            }}>
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
              <div style={{ fontSize: "0.75rem", color: "#aaa", marginBottom: "8px" }}>
                Created: {new Date(selectedConversation.createdAt).toLocaleString()} | Last Edited{" "}
                <strong style={{ color: senderColor }}>
                  {lastSender.toUpperCase()}
                </strong>{" "}
                : {new Date(selectedConversation.updatedAt).toLocaleString()}
              </div>
              <ActionButtons>
                <ActionButton
                  bgColor="#2563eb"
                  onClick={() =>
                    handleAdminReply(selectedConversation.conversationId)
                  }
                >
                  <FiCornerDownRight
                    style={{
                      fontSize: "20px",
                      marginLeft: "4px",
                      marginRight: "4px"
                    }}
                  />
                </ActionButton>
                <ActionButton
                  bgColor="#f59e0b"
                  onClick={() =>
                    handleCloseConversation(selectedConversation.conversationId)
                  }
                >
                  <FiLock
                    style={{
                      fontSize: "20px",
                      marginLeft: "4px",
                      marginRight: "4px"
                    }}
                  />
                </ActionButton>
                <ActionButton
                  bgColor="#dc2626"
                  onClick={() =>
                    handleDeleteConversation(selectedConversation.conversationId)
                  }
                >
                  <FiTrash2
                    style={{
                      fontSize: "20px",
                      marginLeft: "4px",
                      marginRight: "4px"
                    }}
                  />
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

// ---------- ADMIN MAIN COMPONENT ----------
const Admin = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  // Vi har nå separate seksjoner for Tickets og Chat
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [themeMode, setThemeMode] = useState("dark");
  const [adminAvailable, setAdminAvailable] = useState(false);

  const [users, setUsers] = useState([
    { id: 1, name: "User 1 (Admin)" },
    { id: 2, name: "User 2 (Editor)" },
    { id: 3, name: "User 3 (Viewer)" }
  ]);
  const [newUserName, setNewUserName] = useState("");
  const [reportsFilter, setReportsFilter] = useState("");

  // Bruker din opprinnelige endpoint for admin availability
  const fetchAdminAvailability = async () => {
    try {
      const res = await fetch("https://api.vintrastudio.com/api/admin/availability");
      const data = await res.json();
      setAdminAvailable(data.adminAvailable);
    } catch (error) {
      console.error("Error fetching admin availability:", error);
    }
  };

  useEffect(() => {
    fetchAdminAvailability();
  }, []);

  const toggleTheme = () => {
    setThemeMode(themeMode === "light" ? "dark" : "light");
  };

  const toggleAdminAvailability = async () => {
    try {
      const newVal = !adminAvailable;
      const res = await fetch("https://api.vintrastudio.com/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: newVal })
      });
      if (!res.ok) throw new Error("Failed to update availability");
      const data = await res.json();
      setAdminAvailable(data.adminAvailable);
    } catch (error) {
      console.error("Error updating admin availability:", error);
    }
  };

  const addUser = () => {
    if (newUserName.trim() === "") return;
    const newUser = { id: users.length + 1, name: newUserName };
    setUsers([...users, newUser]);
    setNewUserName("");
  };

  const clearLogs = () => {
    alert("Logs cleared (dummy function).");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <>
            <CardTitle>Dashboard Overview</CardTitle>
            <p style={{ marginBottom: 16 }}>
              • Main dashboard content goes here.
            </p>
            <Card>
              <CardTitle>Activity Summary</CardTitle>
              <p>
                Transactions this week: <strong>5.18k</strong>
              </p>
              <button onClick={() => alert("Data updated!")}>
                Update Data
              </button>
            </Card>
          </>
        );
      case "Tickets":
        return <Tickets />;
      case "Chat":
        return <ChatDashboard />;
      case "Users":
        return (
          <>
            <CardTitle>User Management</CardTitle>
            <ul>
              {users.map((user) => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
            <div style={{ marginBottom: "16px" }}>
              <label>Add New User</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <SearchInput
                  type="text"
                  placeholder="Username..."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
                <button onClick={addUser}>Add</button>
              </div>
            </div>
          </>
        );
      case "Settings":
        return (
          <>
            <CardTitle>Settings</CardTitle>
            <div style={{ marginBottom: "16px" }}>
              <label>Theme Mode</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {themeMode === "light" ? <FiSun /> : <FiMoon />}
                <button onClick={toggleTheme}>
                  Switch to {themeMode === "light" ? "Dark" : "Light"} Mode
                </button>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label>Admin Availability</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <p style={{ margin: 0 }}>
                  {adminAvailable ? "Available" : "Unavailable"}
                </p>
                <button onClick={toggleAdminAvailability}>Toggle</button>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label>Language</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button onClick={() => alert("Switched to English")}>
                  English
                </button>
                <button onClick={() => alert("Switched to Norwegian")}>
                  Norwegian
                </button>
              </div>
            </div>
          </>
        );
      case "Logs":
        return (
          <>
            <CardTitle>System Logs</CardTitle>
            <ul>
              <li>Log 1: System started.</li>
              <li>Log 2: User logged in.</li>
              <li>Log 3: Error: Something went wrong.</li>
            </ul>
            <button onClick={clearLogs}>Clear Logs</button>
          </>
        );
      case "Reports":
        return (
          <>
            <CardTitle>Reports</CardTitle>
            <div style={{ marginBottom: "16px" }}>
              <label>Filter Reports</label>
              <SearchInput
                type="text"
                placeholder="Search reports..."
                value={reportsFilter}
                onChange={(e) => setReportsFilter(e.target.value)}
              />
            </div>
            <p>
              Showing reports containing: <strong>{reportsFilter}</strong>
            </p>
            <ul>
              <li>Report 1: Revenue</li>
              <li>Report 2: User Activity</li>
              <li>Report 3: Error Logs</li>
            </ul>
          </>
        );
      case "Analytics":
        return (
          <>
            <CardTitle>Analytics</CardTitle>
            <p>This section can have charts and graphs later.</p>
            <Card>
              <CardTitle>Simple Analytics</CardTitle>
              <p>Dummy data:</p>
              <LineChart/>
            </Card>
          </>
        );
      case "Profile":
        return (
          <>
            <CardTitle>My Profile</CardTitle>
            <p>Edit your profile information here.</p>
            <div style={{ marginBottom: "16px" }}>
              <label>Name</label>
              <SearchInput type="text" placeholder="Your name" />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label>Email</label>
              <SearchInput type="email" placeholder="your.email@example.com" />
            </div>
            <button onClick={() => alert("Profile updated!")}>
              Update Profile
            </button>
          </>
        );
      default:
        return <p>Please select a section from the menu.</p>;
    }
  };

  return (
    <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
      <GlobalStyle />
      <AdminContainer>
        {/* TOP BAR */}
        <TopBar>
          <TopBarLeft>
            <Brand>Dashboard</Brand>
            <MenuIcon onClick={() => setSidebarExpanded((prev) => !prev)}>
              <FiMenu />
            </MenuIcon>
            <SearchContainer>
              <SearchInput placeholder="Search..." />
            </SearchContainer>
          </TopBarLeft>
          <TopBarRight>
            <IconButton>
              <FiBell />
            </IconButton>
            <IconButton>
              <FiUser />
            </IconButton>
          </TopBarRight>
        </TopBar>

        {/* MAIN AREA */}
        <Main>
          {/* SIDEBAR */}
          <Sidebar expanded={sidebarExpanded}>
            <SidebarItem
              active={activeSection === "Dashboard"}
              onClick={() => setActiveSection("Dashboard")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiHome />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Dashboard</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Tickets"}
              onClick={() => setActiveSection("Tickets")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiInbox />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Tickets</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Chat"}
              onClick={() => setActiveSection("Chat")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiFileText />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Chat</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Users"}
              onClick={() => setActiveSection("Users")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiUsers />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Users</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Settings"}
              onClick={() => setActiveSection("Settings")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiSettings />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Settings</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Logs"}
              onClick={() => setActiveSection("Logs")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiFileText />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Logs</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Reports"}
              onClick={() => setActiveSection("Reports")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiClipboard />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Reports</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Analytics"}
              onClick={() => setActiveSection("Analytics")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiBarChart2 />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Analytics</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Profile"}
              onClick={() => setActiveSection("Profile")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiUser />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Profile</SidebarLabel>
            </SidebarItem>
          </Sidebar>

          {/* CONTENT + RIGHT SIDEBAR */}
          <ContentWrapper>
            <MainContent>
              <Card>{renderContent()}</Card>
            </MainContent>
            <RightSidebar>
              <Card>
                <CardTitle>Active Conversations</CardTitle>
                <PieChartCard />
              </Card>
              <Card>
                <CardTitle>Type of Active Chats</CardTitle>
                <BotAdminTicketChart />
              </Card>
              {/* Bifrost (live chat-knapp) vises også i admin-panelet */}
              <Bifrost />
            </RightSidebar>
          </ContentWrapper>
        </Main>
      </AdminContainer>
    </ThemeProvider>
  );
};

export default Admin;