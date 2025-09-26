// src/pages/AdminPanel.js
import React, { useEffect, useState, useRef } from 'react';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { auth, onAuthStateChanged } from '../firebase';
import { signOut } from 'firebase/auth';
import { db, collection, collectionGroup, getDocs, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, getDoc, setDoc, updateDoc, onSnapshot } from '../firebase';
import { checkAdminStatus } from '../utils/firebaseAdmin';
import ChatDashboard from '../components/ChatDashboard';
import LiveChat from '../components/LiveChat';
import VisitorAnalytics from '../components/VisitorAnalytics';
import ChatPieChart from '../components/ChatPieChart';
import ChatActivityChart from '../components/ChatActivityChart';
import ChatGeoChart from '../components/ChatGeoChart';
import BugDashboard from '../components/BugDashboard';
import AdminManagement from '../components/AdminManagement';
import RoleManagement from '../components/RoleManagement/RoleManagement';
import OwnerUserManagement from '../components/RoleManagement/OwnerUserManagement';
import AdminSupportManagement from '../components/RoleManagement/AdminSupportManagement';
import { DashboardOverview, RealtimeMonitor } from '../components/AdminDashboard';
import { 
  ServerStatus, DatabaseManager, SecurityCenter,
  UserManagement, SystemSettings, AdvancedAnalytics,
  AIBotConfig, TicketsView 
} from '../components/AdminComponents';
import { AdminLoadingScreen } from '../components/LoadingComponent';
import TaskManagement from '../components/TaskManagement/TaskManagement';

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
import { BsKanban } from 'react-icons/bs';

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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  color: #f8fafc;
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
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Sidebar = styled.nav`
  width: 300px;
  margin-top: 80px;
  background: rgba(15, 23, 42, 0.98);
  backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2rem 0;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 10;
  animation: ${slideIn} 0.6s ease;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 1024px) {
    width: 80px;
  }
`;

const Sections = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h4`
  margin: 2rem 1.5rem 0.75rem;
  font-size: 0.85rem;
  color: rgba(148, 163, 184, 0.8);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 24px;
    height: 2px;
    background: linear-gradient(90deg, #60a5fa, #a78bfa);
    border-radius: 1px;
  }
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
  width: calc(100% - 1rem);
  margin: 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.25rem;
  background: ${({ active }) => (active ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)' : 'transparent')};
  color: ${({ active }) => (active ? '#fff' : 'rgba(255, 255, 255, 0.7)')};
  border: 1px solid ${({ active }) => (active ? 'rgba(99, 102, 241, 0.3)' : 'transparent')};
  border-radius: 12px;
  cursor: pointer !important;
  font-size: 0.925rem;
  font-weight: ${({ active }) => (active ? '600' : '500')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: ${({ active }) => (active ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)' : 'rgba(99, 102, 241, 0.08)')};
    color: #fff;
    transform: translateX(4px);
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
    
    &::before {
      left: 100%;
    }
  }
  
  svg {
    font-size: 18px;
    color: ${({ active }) => (active ? '#60a5fa' : 'inherit')};
    transition: all 0.3s;
  }
  
  ${({ active }) => active && css`
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
    
    svg {
      animation: ${pulse} 2s infinite;
    }
  `}
  
  @media (max-width: 1024px) {
    padding: 1rem;
    justify-content: center;
    width: calc(100% - 1rem);
    
    span {
      display: none;
    }
    
    &:hover {
      transform: translateX(0);
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
  margin: 2rem 1rem 1rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 16px;
  cursor: pointer !important;
  font-size: 0.925rem;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover { 
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(239, 68, 68, 0.4);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const Content = styled.main`
  flex: 1;
  margin-top: 80px;
  padding: 2.5rem;
  position: relative;
  overflow: auto;
  animation: ${fadeIn} 0.6s ease;
  background: rgba(255, 255, 255, 0.01);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  }
`;

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState({});
  const [selectedConv, setSelectedConv] = useState(null);
  const [input, setInput] = useState("");
  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [userChecked, setUserChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('user');
  const buttonRefs = useRef([]);
  const highlightRef = useRef(null);

  // Firebase Auth guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const isAdmin = await checkAdminStatus(user);
          if (isAdmin) {
            setCurrentUser(user);
            
            // Check user role
            const ownerEmails = [
              'vintrastudio@gmail.com',
              'vintra@whisper.no',
              'vintra@example.com'
            ];
            
            if (ownerEmails.includes(user.email?.toLowerCase())) {
              setCurrentUserRole('owner');
            } else {
              // Check from database
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                setCurrentUserRole(userDoc.data().role || 'admin');
              } else {
                setCurrentUserRole('admin');
              }
            }
            
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
      <AdminLoadingScreen 
        title="Whisper Studio Admin"
        subtitle="Verifiserer tilgang og laster sikker dashboard..."
        showProgress={true}
        showDots={true}
      />
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
      { key: "aiBot", label: "AI Assistant", icon: <BsRobot /> },
      { key: "tickets", label: "Support Tickets", icon: <FiFileText /> }
    ]},
    { section: "📊 Statistics", items: [
      { key: "lineChart", label: "Analytics & Map", icon: <FiBarChart2 /> },
      { key: "pieChart", label: "Pie Chart", icon: <FiPieChart /> },
      { key: "botAdmin", label: "Activity Charts", icon: <BsGraphUp /> }
    ]},
    { section: "🛠️ System", items: [
      { key: "server", label: "Server Status", icon: <FiServer /> },
      { key: "database", label: "Database", icon: <FiDatabase /> },
      { key: "security", label: "Security", icon: <BsShieldCheck /> }
    ]},
    { section: "⚙️ Management", items: [
      { key: "taskManagement", label: "Oppgavebehandling", icon: <BsKanban /> },
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
    aiBot: <AIBotConfig />,
    tickets: <TicketsView />,
    lineChart: <VisitorAnalytics />,
    pieChart: <ChatPieChart />,
    botAdmin: (
      <>
        <ChatGeoChart />
        <ChatActivityChart />
      </>
    ),
    server: <ServerStatus />,
    database: <DatabaseManager />,
    security: <SecurityCenter />,
    taskManagement: <TaskManagement />,
    bugDashboard: <BugDashboard />,
    adminManagement: <AdminSupportManagement />,
    userManagement: <OwnerUserManagement />,
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
                        {it.icon}<span>{it.label}</span>
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
