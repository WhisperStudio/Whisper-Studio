// src/pages/AdminPanel.js
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { checkAdminStatus } from '../utils/firebaseAdmin';

import ChatDashboard from '../components/ChatDashboard';
import LiveChat from '../components/LiveChat';
// import AIBot from '../components/AIBot';
// import TicketDashboard from '../components/TicketDashboard';
// import Tickets from '../components/Tickets';
import LineChart from '../components/LineChart';
// import PieChartCard from '../components/pieChartCard';
import ChatPieChart from '../components/ChatPieChart';
import ChatActivityChart from '../components/ChatActivityChart';
import ChatGeoChart from '../components/ChatGeoChart';
import CountryGeoChart from "../components/CountryGeoChart";
// import AdminManagement from '../components/AdminManagement';

import {
  FiMessageSquare,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiPieChart,
  FiCpu,
  FiSettings,
  FiMessageCircle
} from 'react-icons/fi';

// Removed socket.io dependency - using Firebase only

// ─── Styled Components ───────────────────────────────────────────────────────
const Page = styled.div`
  display: flex;
  min-height: 100vh;
  background: #152238;
  color: #E0E0E0;
  font-family: 'Segoe UI', sans-serif;
`;

const Sidebar = styled.nav`
  width: 240px;
  margin-top: 100px;
  background: #152238;
  padding: 2rem 1rem;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const Sections = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h4`
  margin: 1rem 0 0.5rem;
  font-size: 0.9rem;
  color: #bbb;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0.5rem 0;
`;

const NavButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${({ active }) => (active ? '#263154' : 'transparent')};
  color: ${({ active }) => (active ? '#fff' : '#ccc')};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.3s, transform 0.3s;
  position: relative;

  &:hover {
    background: #2d3a6a;
    transform: translateX(4px);
  }
`;

const Highlight = styled.div`
  position: absolute;
  left: 0;
  width: 4px;
  height: 40px;
  background: #4a6fc3;
  border-radius: 0 4px 4px 0;
  transition: top 0.3s;
`;

const LogoutButton = styled.button`
  margin-top: auto;
  background: #ff4d4d;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;

  &:hover { background: #d93636; }
`;

const Content = styled.main`
  flex: 1;
  margin-top: 100px;
  padding-top: 60px;
  position: relative;
  padding: 2rem;
  background: #1f273f;
  overflow: auto;
`;

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState({});
  const [selectedConv, setSelectedConv] = useState(null);
  const [input, setInput] = useState("");
  const [active, setActive] = useState("lineChart");
  const [userChecked, setUserChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const highlightRef = useRef();
  const buttonRefs = useRef([]);

  // Firebase Auth guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const isAdmin = await checkAdminStatus(user);
          if (isAdmin) {
            setCurrentUser(user);
            setUserChecked(true);
            setLoading(false);
          } else {
            // Not an admin, redirect to login
            await signOut(auth);
            navigate("/login");
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          navigate("/login");
        }
      } else {
        // No user logged in
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Firebase-based chat initialization (placeholder)
  useEffect(() => {
    if (active !== "chat" || !userChecked) return;
    
    // TODO: Implement Firebase-based chat system
    // For now, we'll use mock data
    const mockConversations = {
      'user1': [
        { from: 'user', text: 'Hello, I need help', userId: 'user1', timestamp: new Date() },
        { from: 'admin', text: 'How can I help you?', userId: 'user1', timestamp: new Date() }
      ],
      'user2': [
        { from: 'user', text: 'I have a question', userId: 'user2', timestamp: new Date() }
      ]
    };
    setConversations(mockConversations);
  }, [active, userChecked]);

  const sendChat = () => {
    if (!input.trim() || !selectedConv) return;
    const msg = { 
      from: 'admin', 
      text: input, 
      userId: selectedConv, 
      timestamp: new Date(),
      adminEmail: currentUser?.email 
    };
    
    // TODO: Implement Firebase-based message sending
    // For now, just update local state
    setConversations(prev => ({
      ...prev,
      [selectedConv]: (prev[selectedConv] || []).concat(msg)
    }));
    setInput("");
  };

  const deleteConv = id => {
    const c = { ...conversations };
    delete c[id];
    setConversations(c);
    if (selectedConv === id) setSelectedConv(null);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // on nav click, set active and move highlight
  const handleNavClick = (key, idx) => {
    setActive(key);
    const btn = buttonRefs.current[idx];
    if (btn && highlightRef.current) {
      highlightRef.current.style.top = btn.offsetTop + 'px';
    }
  };

  if (loading || !userChecked) {
    return (
      <Page>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#fff',
          fontSize: '18px'
        }}>
          Laster admin panel...
        </div>
      </Page>
    );
  }

  const MENU = [
    { section: "Support", items: [
      { key: "chat", label: "Chat Dashboard", icon: <FiMessageSquare /> },
      { key: "liveChat", label: "Live Chat", icon: <FiMessageCircle /> },
      { key: "aiBot", label: "AI Assistant", icon: <FiCpu /> },
      { key: "ticketDashboard", label: "Ticket Dashboard", icon: <FiFileText /> },
      { key: "tickets", label: "Tickets", icon: <FiUsers /> }
    ]},
    { section: "Statistics", items: [
      { key: "lineChart", label: "Analytics & Map", icon: <FiBarChart2 /> },
      { key: "pieChart", label: "Pie Chart", icon: <FiPieChart /> },
      { key: "botAdmin", label: "Activity Charts", icon: <FiCpu /> }
    ]},
    { section: "Administration", items: [
      { key: "adminManagement", label: "Admin Management", icon: <FiSettings /> }
    ]}
  ];

  const CONTENT = {
  chat: <ChatDashboard />,
  liveChat: <LiveChat />,
  aiBot: <div>AI Bot - Coming Soon</div>,
  ticketDashboard: <div>Ticket Dashboard - Coming Soon</div>,
  tickets: <div>Tickets - Coming Soon</div>,
  lineChart: (
    <>
      <LineChart />
      <CountryGeoChart />
    </>
  ),
  pieChart: <ChatPieChart />,
  botAdmin: (
    <>
      <ChatActivityChart />
      <ChatGeoChart />
    </>
  ),
  adminManagement: <div>Admin Management - Coming Soon</div>
};

  return (
    <Page>
      <Sidebar>
        <Highlight ref={highlightRef} />
        <Sections>
          {MENU.map((cat, secIdx) => (
            <div key={cat.section}>
              <SectionTitle>{cat.section}</SectionTitle>
              <NavList>
                {cat.items.map((it, idx) => {
                  const globalIdx = MENU
                    .slice(0, secIdx)
                    .reduce((sum, s) => sum + s.items.length, 0) + idx;
                  return (
                    <NavItem key={it.key}>
                      <NavButton
                        ref={el => buttonRefs.current[globalIdx] = el}
                        active={active === it.key}
                        onClick={() => handleNavClick(it.key, globalIdx)}
                      >
                        {it.icon}{it.label}
                      </NavButton>
                    </NavItem>
                  );
                })}
              </NavList>
            </div>
          ))}
        </Sections>
        <LogoutButton onClick={logout}>Logg ut</LogoutButton>
      </Sidebar>

      <Content>
        {CONTENT[active]}
      </Content>
    </Page>
  );
}
