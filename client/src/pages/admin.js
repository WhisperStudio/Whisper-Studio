// src/pages/AdminPanel.js
import React, { useEffect, useState, useRef } from 'react';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { checkAdminStatus } from '../utils/firebaseAdmin';

import ChatDashboard from '../components/ChatDashboard';
import LiveChat from '../components/LiveChat';
import VisitorAnalytics from '../components/VisitorAnalytics';
import ChatPieChart from '../components/ChatPieChart';
import ChatActivityChart from '../components/ChatActivityChart';
import ChatGeoChart from '../components/ChatGeoChart';
import BugDashboard from '../components/BugDashboard';
import AdminManagement from '../components/AdminManagement';
import { DashboardOverview, RealtimeMonitor } from '../components/AdminDashboard';
import { 
  ServerStatus, DatabaseManager, SecurityCenter, SystemLogs,
  UserManagement, SystemSettings, AdvancedAnalytics, PerformanceMetrics,
  AIBotConfig, TicketDashboard, TicketsView 
} from '../components/AdminComponents';

import {
  FiMessageSquare,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiPieChart,
  FiCpu,
  FiSettings,
  FiMessageCircle,
  FiAlertTriangle,
  FiActivity,
  FiDatabase,
  FiShield,
  FiGlobe,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiLock,
  FiUnlock,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiEdit3,
  FiEye,
  FiZap,
  FiHardDrive,
  FiWifi,
  FiServer,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiHeadphones,
  FiMic,
  FiVideo,
  FiCamera,
  FiBell,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiMaximize,
  FiMinimize,
  FiX,
  FiPlus,
  FiMinus,
  FiLogOut
} from 'react-icons/fi';
import { 
  BsRobot, BsGraphUp, BsSpeedometer2, BsShieldCheck, BsChatDots,
  BsLightning, BsStars, BsGear, BsPeople, BsBarChart, BsCloudCheck
} from 'react-icons/bs';
import { IoSparkles, IoRocketSharp, IoPulse, IoAnalytics } from 'react-icons/io5';
import { HiOutlineChartBar, HiOutlineUserGroup, HiOutlineCog } from 'react-icons/hi';

// Global Styles
const GlobalAdminStyles = createGlobalStyle`
  * {
    cursor: auto !important;
  }
  
  button {
    cursor: pointer !important;
  }
  
  input, textarea {
    cursor: text !important;
  }
`;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Removed socket.io dependency - using Firebase only

// ─── Styled Components ───────────────────────────────────────────────────────
const Page = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  color: #E0E0E0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
  cursor: auto !important;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.03" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,133.3C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
    background-size: cover;
    pointer-events: none;
  }
`;

const Sidebar = styled.nav`
  width: 280px;
  margin-top: 80px;
  background: rgba(15, 12, 41, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 0;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 10;
  animation: ${slideIn} 0.5s ease;
  
  @media (max-width: 1024px) {
    width: 80px;
  }
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
  padding: 1rem 1.5rem;
  background: ${({ active }) => (active ? 'rgba(99, 102, 241, 0.1)' : 'transparent')};
  color: ${({ active }) => (active ? '#fff' : 'rgba(255, 255, 255, 0.7)')};
  border: none;
  border-left: 3px solid ${({ active }) => (active ? '#6366f1' : 'transparent')};
  cursor: pointer !important;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    background: rgba(99, 102, 241, 0.05);
    color: #fff;
    transform: translateX(8px);
    padding-left: 2rem;
  }
  
  svg {
    font-size: 20px;
    color: ${({ active }) => (active ? '#6366f1' : 'inherit')};
    animation: ${({ active }) => (active ? pulse : 'none')} 2s infinite;
  }
  
  ${({ active }) => active && css`
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 60%;
      background: #6366f1;
      border-radius: 2px;
      animation: ${glow} 2s infinite;
    }
  `}
  
  @media (max-width: 1024px) {
    padding: 1rem;
    justify-content: center;
    
    span {
      display: none;
    }
    
    &:hover {
      padding-left: 1rem;
    }
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
  margin: 2rem 1rem;
  background: linear-gradient(135deg, #ff4d4d 0%, #d93636 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer !important;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3);

  &:hover { 
    background: linear-gradient(135deg, #d93636 0%, #ff4d4d 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 77, 77, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Content = styled.main`
  flex: 1;
  margin-top: 80px;
  padding: 2rem;
  position: relative;
  overflow: auto;
  animation: ${fadeIn} 0.5s ease;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState({});
  const [selectedConv, setSelectedConv] = useState(null);
  const [input, setInput] = useState("");
  const [active, setActive] = useState("dashboard");
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
          Loading Admin Panel...
        </div>
      </Page>
    );
  }

  const MENU = [
    { section: "🚀 Dashboard", items: [
      { key: "dashboard", label: "Overview", icon: <BsSpeedometer2 /> },
      { key: "realtime", label: "Real-time Monitor", icon: <IoPulse /> },
      { key: "analytics", label: "Advanced Analytics", icon: <IoAnalytics /> },
    ]},
    { section: "💬 Communication", items: [
      { key: "chat", label: "Chat Dashboard", icon: <FiMessageSquare /> },
      { key: "liveChat", label: "Live Chat", icon: <BsChatDots /> },
      { key: "aiBot", label: "AI Assistant", icon: <BsRobot /> },
      { key: "ticketDashboard", label: "Ticket Dashboard", icon: <FiFileText /> },
      { key: "tickets", label: "Support Tickets", icon: <FiUsers /> }
    ]},
    { section: "📊 Statistics", items: [
      { key: "lineChart", label: "Analytics & Map", icon: <FiBarChart2 /> },
      { key: "pieChart", label: "Pie Chart", icon: <FiPieChart /> },
      { key: "botAdmin", label: "Activity Charts", icon: <BsGraphUp /> },
      { key: "performance", label: "Performance", icon: <BsLightning /> }
    ]},
    { section: "🛠️ System", items: [
      { key: "server", label: "Server Status", icon: <FiServer /> },
      { key: "database", label: "Database", icon: <FiDatabase /> },
      { key: "security", label: "Security", icon: <BsShieldCheck /> },
      { key: "logs", label: "System Logs", icon: <FiActivity /> }
    ]},
    { section: "⚙️ Management", items: [
      { key: "bugDashboard", label: "Bug Reports", icon: <FiAlertTriangle /> },
      { key: "adminManagement", label: "Admin Management", icon: <HiOutlineCog /> },
      { key: "userManagement", label: "User Management", icon: <HiOutlineUserGroup /> },
      { key: "settings", label: "Settings", icon: <FiSettings /> }
    ]}
  ];

  const CONTENT = {
    dashboard: <DashboardOverview />,
    realtime: <RealtimeMonitor />,
    analytics: <AdvancedAnalytics />,
    chat: <ChatDashboard />,
    liveChat: <LiveChat />,
    aiBot: <AIBotConfig />,
    ticketDashboard: <TicketDashboard />,
    tickets: <TicketsView />,
    lineChart: <VisitorAnalytics />,
    pieChart: <ChatPieChart />,
    botAdmin: (
      <>
        <ChatGeoChart />
        <ChatActivityChart />
      </>
    ),
    performance: <PerformanceMetrics />,
    server: <ServerStatus />,
    database: <DatabaseManager />,
    security: <SecurityCenter />,
    logs: <SystemLogs />,
    bugDashboard: <BugDashboard />,
    adminManagement: <AdminManagement />,
    userManagement: <UserManagement />,
    settings: <SystemSettings />
  };

  return (
    <>
      <GlobalAdminStyles />
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
        <LogoutButton onClick={logout}>
          <FiLogOut /> Logg ut
        </LogoutButton>
      </Sidebar>

      <Content>
        {CONTENT[active]}
      </Content>
    </Page>
    </>
  );
}
