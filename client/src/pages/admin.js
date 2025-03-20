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
  FiInbox
} from "react-icons/fi";
import Bifrost from "../components/bifrost"; // Juster stien ved behov
import ChatDashboard from "../components/ChatDashboard"; // Live chat-dashboard
import Tickets from "../components/Tickets"; // Tickets-side med billettsystem

// ---------- THEMES ----------
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

// ---------- CHAT DASHBOARD (Eksisterende komponent) ----------
/* ChatDashboard er som før – koden er inkludert over og forblir uendret */
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

// (ChatDashboard-komponenten er inkludert som egen fil/importert ovenfor)

// ---------- ADMIN MAIN COMPONENT ----------
const Admin = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
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

  const fetchAdminAvailability = async () => {
    try {
      const res = await fetch("http://104.248.132.57:5000/api/admin/availability");
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
      const res = await fetch("http://104.248.132.57:5000/api/admin/availability", {
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
              <ul>
                <li>Visitors: 1,234</li>
                <li>Conversions: 123</li>
                <li>Engagement: 78%</li>
              </ul>
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
                <CardTitle>Quick Info</CardTitle>
                <p>Fast stats or mini charts can go here.</p>
              </Card>
              <Card>
                <CardTitle>Extra Widget</CardTitle>
                <p>Additional content can be placed here.</p>
              </Card>
              {/* Bifrost (live chat button) also appears in the admin panel */}
              <Bifrost />
            </RightSidebar>
          </ContentWrapper>
        </Main>
      </AdminContainer>
    </ThemeProvider>
  );
};

export default Admin;
