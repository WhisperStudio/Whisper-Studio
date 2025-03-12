// Admin.js
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
  FiClipboard
} from "react-icons/fi";
import Bifrost from "../components/bifrost";

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

/* --- Ekstra styling for den fancy Tickets-siden --- */
const TabBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TabButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: ${({ active }) => (active ? "#1d4ed8" : "#e0e7ff")};
  color: ${({ active }) => (active ? "#fff" : "#111827")};
  transition: background 0.3s, color 0.3s;
`;

const TicketDashboardContainer = styled.div`
  background: linear-gradient(135deg,rgb(255, 255, 255),rgb(255, 255, 255));
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
`;

const TicketCard = styled.div`
  color: black;
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  strong {
    font-weight: 600;
    color: #111;
  }

  p {
    margin: 0.5rem 0;
    color: black;

  }

  .reply {
    color: green;
    margin-top: 0.5rem;
  }

  button {
    margin-top: 0.5rem;
    margin-right: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    background: #2563eb;
    color: #fff;
    transition: background 0.3s;
    &:hover {
      background: #1d4ed8;
    }
  }

  textarea {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-family: inherit;
  }
`;

/* --- TicketDashboard-komponent --- */
const TicketDashboard = () => {
  const categories = ["Games", "General", "Other", "Work", "Billing"];
  const [tickets, setTickets] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Games");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Hent tickets fra localStorage
  const fetchTickets = () => {
    const stored = localStorage.getItem("tickets");
    return stored ? JSON.parse(stored) : [];
  };

  // Lagre tickets i localStorage
  const saveTickets = (ticketsArray) => {
    localStorage.setItem("tickets", JSON.stringify(ticketsArray));
  };

  useEffect(() => {
    setTickets(fetchTickets());
    const intervalId = setInterval(() => {
      setTickets(fetchTickets());
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleReplySubmit = (ticketId) => {
    const updated = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, reply: replyText };
      }
      return ticket;
    });
    saveTickets(updated);
    setTickets(updated);
    setReplyTicketId(null);
    setReplyText("");
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.category === activeCategory &&
    (ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     ticket.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <TicketDashboardContainer>
      <CardTitle style={{ color: "#111" }}>Tickets - {activeCategory}</CardTitle>
      <TabBar>
        {categories.map(cat => (
          <TabButton
            key={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </TabButton>
        ))}
      </TabBar>
      <div style={{ marginBottom: "1rem" }}>
        <SearchInput
          type="text"
          placeholder="Søk i tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredTickets.length === 0 ? (
        <p>Ingen tickets funnet for kategori "{activeCategory}".</p>
      ) : (
        filteredTickets.map(ticket => (
          <TicketCard key={ticket.id}>
            <strong>{ticket.name}</strong> ({ticket.email})
            <p>{ticket.message}</p>
            {ticket.reply ? (
              <p className="reply"><em>Svar: {ticket.reply}</em></p>
            ) : replyTicketId === ticket.id ? (
              <div>
                <textarea
                  rows="3"
                  placeholder="Skriv ditt svar her..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button onClick={() => handleReplySubmit(ticket.id)}>
                  Send svar
                </button>
                <button
                  onClick={() => {
                    setReplyTicketId(null);
                    setReplyText("");
                  }}
                >
                  Avbryt
                </button>
              </div>
            ) : (
              <button onClick={() => setReplyTicketId(ticket.id)}>
                Svar
              </button>
            )}
          </TicketCard>
        ))
      )}
    </TicketDashboardContainer>
  );
};

// ---------- Admin-komponenten ----------
const Admin = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [themeMode, setThemeMode] = useState("dark");
  const [users, setUsers] = useState([
    { id: 1, name: "User 1 (Admin)" },
    { id: 2, name: "User 2 (Editor)" },
    { id: 3, name: "User 3 (Viewer)" }
  ]);
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
              <button onClick={() => alert("Data oppdatert!")}>
                Oppdater Data
              </button>
            </Card>
          </>
        );
      case "Tickets":
        // Bruk TicketDashboard for en avansert visning av tickets
        return <TicketDashboard />;
      case "Users":
        return (
          <>
            <CardTitle>Brukeradministrasjon</CardTitle>
            <ul>
              {users.map((user) => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
            <div style={{ marginBottom: "16px" }}>
              <label>Legg til ny bruker</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <SearchInput
                  type="text"
                  placeholder="Brukernavn..."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
                <button onClick={addUser}>Legg til</button>
              </div>
            </div>
          </>
        );
      case "Settings":
        return (
          <>
            <CardTitle>Innstillinger</CardTitle>
            <div style={{ marginBottom: "16px" }}>
              <label>Theme Mode</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {themeMode === "light" ? <FiSun /> : <FiMoon />}
                <button onClick={toggleTheme}>
                  Bytt til {themeMode === "light" ? "Mørk" : "Lys"} Mode
                </button>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label>Språk</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button onClick={() => alert("Bytt til Norsk")}>Norsk</button>
                <button onClick={() => alert("Switch to English")}>English</button>
              </div>
            </div>
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
            <button onClick={clearLogs}>Slett Logger</button>
          </>
        );
      case "Reports":
        return (
          <>
            <CardTitle>Rapporter</CardTitle>
            <div style={{ marginBottom: "16px" }}>
              <label>Filter Rapporter</label>
              <SearchInput
                type="text"
                placeholder="Søk i rapporter..."
                value={reportsFilter}
                onChange={(e) => setReportsFilter(e.target.value)}
              />
            </div>
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
            <div style={{ marginBottom: "16px" }}>
              <label>Navn</label>
              <SearchInput type="text" placeholder="Ditt navn" />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label>E-post</label>
              <SearchInput type="email" placeholder="din.epost@domene.no" />
            </div>
            <button onClick={() => alert("Profil oppdatert!")}>
              Oppdater Profil
            </button>
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
            {/* Dashboard */}
            <SidebarItem
              active={activeSection === "Dashboard"}
              onClick={() => setActiveSection("Dashboard")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiHome />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Dashboard</SidebarLabel>
            </SidebarItem>
            {/* Tickets */}
            <SidebarItem
              active={activeSection === "Tickets"}
              onClick={() => setActiveSection("Tickets")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiFileText />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Tickets</SidebarLabel>
            </SidebarItem>
            {/* Users */}
            <SidebarItem
              active={activeSection === "Users"}
              onClick={() => setActiveSection("Users")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiUsers />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Brukere</SidebarLabel>
            </SidebarItem>
            {/* Settings */}
            <SidebarItem
              active={activeSection === "Settings"}
              onClick={() => setActiveSection("Settings")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiSettings />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Innstillinger</SidebarLabel>
            </SidebarItem>
            {/* Logs */}
            <SidebarItem
              active={activeSection === "Logs"}
              onClick={() => setActiveSection("Logs")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiFileText />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Logger</SidebarLabel>
            </SidebarItem>
            {/* Reports */}
            <SidebarItem
              active={activeSection === "Reports"}
              onClick={() => setActiveSection("Reports")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiClipboard />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Rapporter</SidebarLabel>
            </SidebarItem>
            {/* Analytics */}
            <SidebarItem
              active={activeSection === "Analytics"}
              onClick={() => setActiveSection("Analytics")}
            >
              <SidebarIcon expanded={sidebarExpanded}>
                <FiBarChart2 />
              </SidebarIcon>
              <SidebarLabel expanded={sidebarExpanded}>Analyse</SidebarLabel>
            </SidebarItem>
            {/* Profile */}
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
            <RightSidebar>
              <Card>
                <CardTitle>Hurtiginfo</CardTitle>
                <p>Denne seksjonen kan vise rask statistikk eller små grafer.</p>
              </Card>
              <Card>
                <CardTitle>Ekstra Widget</CardTitle>
                <p>Tilleggsinnhold kan legges her.</p>
              </Card>
              {/* Vis Bifrost-komponenten direkte slik at nye tickets kan sendes */}
              <Bifrost />
            </RightSidebar>
          </ContentWrapper>
        </Main>
      </AdminContainer>
    </ThemeProvider>
  );
};

export default Admin;
