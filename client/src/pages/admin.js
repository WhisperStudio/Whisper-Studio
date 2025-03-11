import React, { useState } from "react";
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
  FiMoon
} from "react-icons/fi";

// ----- THEMES -----

const lightTheme = {
  bodyBg: "#f9fafb",
  containerBg: "rgba(255, 255, 255, 0.95)",
  text: "#111827",
  sidebarBg: "#1f2937",
  sidebarHover: "#374151",
  sidebarActive: "rgba(55, 65, 81, 0.3)",
  cardBg: "#fff",
  buttonBg: "#2563eb",
  buttonHover: "#1d4ed8",
  inputBorder: "#d1d5db",
  inputFocus: "#9ca3af"
};

const darkTheme = {
  bodyBg: "#111827",
  containerBg: "#1e293b",
  text: "#f9fafb",
  sidebarBg: "#374151",
  sidebarHover: "#4b5563",
  sidebarActive: "rgba(255, 255, 255, 0.2)",
  cardBg: "#1f2937",
  buttonBg: "#2563eb",
  buttonHover: "#1d4ed8",
  inputBorder: "#4b5563",
  inputFocus: "#6b7280"
};

// Global styles for å sette bakgrunn og font ut ifra valgt tema
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: "Roboto", sans-serif;
    background: ${({ theme }) => theme.bodyBg};
    color: ${({ theme }) => theme.text};
    transition: background 0.3s, color 0.3s;
  }
`;

// ----- STYLES -----

// Hovedcontainer for hele applikasjonen
const AdminContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.containerBg};
  border-radius: 8px;
  margin: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s;
`;

// Topbar (navbar)
const TopBar = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

// Venstre side av topbaren
const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
`;

// Logo/brand
const Brand = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-right: 30px;
`;

// Hamburgermeny-ikon med jevn overgang
const MenuIcon = styled.div`
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  margin-right: 20px;
  transition: color 0.2s;
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

// Søkefeltet
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
  &:focus {
    border-color: ${({ theme }) => theme.inputFocus};
  }
`;

// Høyre side av topbaren (varsler, profil)
const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

// Ikonknapper
const IconButton = styled.div`
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

// Wrapper for sideinnhold: Sidebar + Content
const Main = styled.div`
  display: flex;
  flex: 1;
  background-color: ${({ theme }) => theme.bodyBg};
  transition: background-color 0.3s;
`;

// Sidebar
const Sidebar = styled.div`
  width: 60px;
  background-color: ${({ theme }) => theme.sidebarBg};
  padding-top: 16px;
  transition: width 0.3s;
  overflow: hidden;
  ${(props) =>
    props.expanded &&
    `
      width: 220px;
  `}
`;

// Sidebar-item
const SidebarItem = styled.div`
  display: flex;
  align-items: center;
  color: #9ca3af;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  background-color: ${(props) =>
    props.active ? props.theme.sidebarActive : "transparent"};
  &:hover {
    background-color: ${({ theme }) => theme.sidebarHover};
    color: #fff;
  }
`;

// Ikon i sidebar
const SidebarIcon = styled.div`
  font-size: 20px;
  margin-right: ${(props) => (props.expanded ? "16px" : "0")};
  transition: margin 0.3s;
`;

// Label i sidebar
const SidebarLabel = styled.span`
  display: ${(props) => (props.expanded ? "inline" : "none")};
  white-space: nowrap;
  transition: opacity 0.3s;
`;

// Hovedinnholdsområde
const Content = styled.div`
  flex: 1;
  padding: 24px;
  background-color: ${({ theme }) => theme.cardBg};
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s;
`;

// Form elementer for Settings (Light/Dark mode toggle)
const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.text};
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleButton = styled.button`
  background-color: ${({ theme }) => theme.buttonBg};
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${({ theme }) => theme.buttonHover};
  }
`;

// ----- DATA & COMPONENTS -----

// Seksjonsdata med faktiske placeholders for hver side
const sections = {
  Dashboard: {
    title: "Dashboard",
    content: (
      <div>
        <h3>Overview</h3>
        <p>This is a placeholder for a dashboard chart or summary.</p>
        <div style={{ background: "#e5e7eb", padding: "20px", borderRadius: "8px" }}>
          [Chart Component Placeholder]
        </div>
      </div>
    )
  },
  Users: {
    title: "User Management",
    content: (
      <div>
        <h3>Users List</h3>
        <ul>
          <li>User 1 (Admin)</li>
          <li>User 2 (Editor)</li>
          <li>User 3 (Viewer)</li>
        </ul>
      </div>
    )
  },
  Settings: {
    title: "Settings",
    content: "Settings content will be replaced with Light/Dark mode toggle below."
  },
  Logs: {
    title: "Logs",
    content: (
      <div>
        <h3>Recent Logs</h3>
        <ul>
          <li>Log entry 1: System started.</li>
          <li>Log entry 2: User login detected.</li>
          <li>Log entry 3: Error: Something went wrong.</li>
        </ul>
      </div>
    )
  }
};

const Admin = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [themeMode, setThemeMode] = useState("light");

  const toggleTheme = () => {
    setThemeMode(themeMode === "light" ? "dark" : "light");
  };

  // Innhold basert på valgt seksjon
  const renderContent = () => {
    if (activeSection === "Settings") {
      return (
        <>
          <h2>{sections.Settings.title}</h2>
          <FormGroup>
            <Label>Theme Mode</Label>
            <ToggleContainer>
              {themeMode === "light" ? <FiSun /> : <FiMoon />}
              <ToggleButton onClick={toggleTheme}>
                Switch to {themeMode === "light" ? "Dark" : "Light"} Mode
              </ToggleButton>
            </ToggleContainer>
          </FormGroup>
        </>
      );
    } else {
      return (
        <>
          <h2>{sections[activeSection].title}</h2>
          {sections[activeSection].content}
        </>
      );
    }
  };

  return (
    <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
      <GlobalStyle />
      <AdminContainer>
        {/* TOPBAR */}
        <TopBar>
          <TopBarLeft>
            <Brand>Admin</Brand>
            <MenuIcon onClick={() => setSidebarExpanded(!sidebarExpanded)}>
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

        {/* MAIN AREA: Sidebar + Content */}
        <Main>
          <Sidebar expanded={sidebarExpanded}>
            <SidebarItem
              active={activeSection === "Dashboard"}
              onClick={() => setActiveSection("Dashboard")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiHome />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>
                Dashboard
              </SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Users"}
              onClick={() => setActiveSection("Users")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiUsers />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>
                User Management
              </SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Settings"}
              onClick={() => setActiveSection("Settings")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiSettings />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>
                Settings
              </SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Logs"}
              onClick={() => setActiveSection("Logs")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiFileText />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>
                Logs
              </SidebarLabel>
            </SidebarItem>
          </Sidebar>

          <Content>{renderContent()}</Content>
        </Main>
      </AdminContainer>
    </ThemeProvider>
  );
};

export default Admin;
