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
  FiMoon,
  FiBarChart2,
  FiClipboard
} from "react-icons/fi";

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
  * {
    box-sizing: border-box;
  }
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

// Top bar
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

// Search
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

// Top bar right icons
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

// Main area (sidebar + content)
const Main = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

// Sidebar
const Sidebar = styled.div`
  width: ${({ expanded }) => (expanded ? "220px" : "60px")};
  background-color: ${({ theme }) => theme.sidebarBg};
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`;

// Sidebar items
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

// Content area
const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
`;

// Del innholdet i to kolonner for å etterligne et dashbordoppsett
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

// Cards
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

// Settings form group
const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
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

// ---------- PLACEHOLDER SEKSJONER OG FUNKSJONALITET ----------

// Dummy data for brukerliste
const initialUsers = [
  { id: 1, name: "User 1 (Admin)" },
  { id: 2, name: "User 2 (Editor)" },
  { id: 3, name: "User 3 (Viewer)" }
];

const Admin = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [themeMode, setThemeMode] = useState("dark");
  const [users, setUsers] = useState(initialUsers);
  const [newUserName, setNewUserName] = useState("");
  const [reportsFilter, setReportsFilter] = useState("");

  const toggleTheme = () => {
    setThemeMode(themeMode === "light" ? "dark" : "light");
  };

  const addUser = () => {
    if (newUserName.trim() === "") return;
    const newUser = { id: users.length + 1, name: newUserName };
    setUsers([...users, newUser]);
    setNewUserName("");
  };

  const clearLogs = () => {
    alert("Logs cleared (dummy function)");
  };

  // Render innhold basert på aktiv seksjon
  const renderContent = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <>
            <CardTitle>Dashboard Oversikt</CardTitle>
            <p style={{ marginBottom: 16 }}>
              Dette er en placeholder for hovedinnholdet i dashbordet.
            </p>
            <Card>
              <CardTitle>Aktivitetsoppsummering</CardTitle>
              <p>
                Antall transaksjoner denne uken: <strong>5.18k</strong>
              </p>
              <ToggleButton onClick={() => alert("Data oppdatert!")}>
                Oppdater Data
              </ToggleButton>
            </Card>
          </>
        );
      case "Users":
        return (
          <>
            <CardTitle>Brukeradministrasjon</CardTitle>
            <ul>
              {users.map((user) => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
            <FormGroup>
              <Label>Legg til ny bruker</Label>
              <div style={{ display: "flex", gap: "8px" }}>
                <SearchInput
                  type="text"
                  placeholder="Brukernavn..."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
                <ToggleButton onClick={addUser}>Legg til</ToggleButton>
              </div>
            </FormGroup>
          </>
        );
      case "Settings":
        return (
          <>
            <CardTitle>Innstillinger</CardTitle>
            <FormGroup>
              <Label>Theme Mode</Label>
              <ToggleContainer>
                {themeMode === "light" ? <FiSun /> : <FiMoon />}
                <ToggleButton onClick={toggleTheme}>
                  Bytt til {themeMode === "light" ? "Mørk" : "Lys"} Mode
                </ToggleButton>
              </ToggleContainer>
            </FormGroup>
            <FormGroup>
              <Label>Språk</Label>
              <ToggleContainer>
                <ToggleButton onClick={() => alert("Bytt til Norsk")}>
                  Norsk
                </ToggleButton>
                <ToggleButton onClick={() => alert("Switch to English")}>
                  English
                </ToggleButton>
              </ToggleContainer>
            </FormGroup>
          </>
        );
      case "Logs":
        return (
          <>
            <CardTitle>Systemlogger</CardTitle>
            <ul>
              <li>Logg 1: System startet.</li>
              <li>Logg 2: Bruker logget inn.</li>
              <li>Logg 3: Error: Noe gikk galt.</li>
            </ul>
            <ToggleButton onClick={clearLogs}>Slett Logger</ToggleButton>
          </>
        );
      case "Reports":
        return (
          <>
            <CardTitle>Rapporter</CardTitle>
            <FormGroup>
              <Label>Filter Rapporter</Label>
              <SearchInput
                type="text"
                placeholder="Søk i rapporter..."
                value={reportsFilter}
                onChange={(e) => setReportsFilter(e.target.value)}
              />
            </FormGroup>
            <p>
              Viser rapporter som inneholder: <strong>{reportsFilter}</strong>
            </p>
            <ul>
              <li>Rapport 1: Omsetning</li>
              <li>Rapport 2: Brukeraktivitet</li>
              <li>Rapport 3: Feilrapporter</li>
            </ul>
          </>
        );
      case "Analytics":
        return (
          <>
            <CardTitle>Analyse</CardTitle>
            <p>Denne seksjonen kan senere utvides med diagrammer og grafer.</p>
            <Card>
              <CardTitle>Enkel Analyse</CardTitle>
              <p>Viser dummy-data:</p>
              <ul>
                <li>Besøkende: 1,234</li>
                <li>Konverteringer: 123</li>
                <li>Engasjement: 78%</li>
              </ul>
            </Card>
          </>
        );
      case "Profile":
        return (
          <>
            <CardTitle>Min Profil</CardTitle>
            <p>Her kan du redigere din profilinformasjon.</p>
            <FormGroup>
              <Label>Navn</Label>
              <SearchInput type="text" placeholder="Ditt navn" />
            </FormGroup>
            <FormGroup>
              <Label>E-post</Label>
              <SearchInput type="email" placeholder="din.epost@domene.no" />
            </FormGroup>
            <ToggleButton onClick={() => alert("Profil oppdatert!")}>
              Oppdater Profil
            </ToggleButton>
          </>
        );
      default:
        return <p>Velg en seksjon fra menyen.</p>;
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
            <MenuIcon onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <FiMenu />
            </MenuIcon>
            <SearchContainer>
              <SearchInput placeholder="Søk..." />
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
              active={activeSection === "Users"}
              onClick={() => setActiveSection("Users")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiUsers />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Brukere</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Settings"}
              onClick={() => setActiveSection("Settings")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiSettings />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Innstillinger</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Logs"}
              onClick={() => setActiveSection("Logs")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiFileText />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Logger</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Reports"}
              onClick={() => setActiveSection("Reports")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiClipboard />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Rapporter</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Analytics"}
              onClick={() => setActiveSection("Analytics")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiBarChart2 />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Analyse</SidebarLabel>
            </SidebarItem>
            <SidebarItem
              active={activeSection === "Profile"}
              onClick={() => setActiveSection("Profile")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiUser />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Profil</SidebarLabel>
            </SidebarItem>
          </Sidebar>

          {/* CONTENT + HØYRE SIDEBAR */}
          <ContentWrapper>
            <MainContent>
              <Card>{renderContent()}</Card>
            </MainContent>

            {/* HØYRE SIDEBAR (EKSEMPEL) */}
            <RightSidebar>
              <Card>
                <CardTitle>Hurtiginfo</CardTitle>
                <p>Denne seksjonen kan vise rask statistikk eller små grafer.</p>
              </Card>
              <Card>
                <CardTitle>Ekstra Widget</CardTitle>
                <p>Tilleggsinnhold kan legges her.</p>
              </Card>
            </RightSidebar>
          </ContentWrapper>
        </Main>
      </AdminContainer>
    </ThemeProvider>
  );
};

export default Admin;
