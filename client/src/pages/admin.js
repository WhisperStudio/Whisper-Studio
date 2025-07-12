// src/pages/AdminPanel.js
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

import ChatDashboard from '../components/ChatDashboard';
import TicketDashboard from '../components/TicketDashboard';
import Tickets from '../components/Tickets';
import LineChartCard from '../components/LineChart';
import PieChartCard from '../components/pieChartCard';
import ChatActivityChart from '../components/ChatActivityChart';
import ChatGeoChart      from "../components/ChatGeoChart";
import CountryGeoChart      from "../components/CountryGeoChart";

import {
  FiMessageSquare,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiPieChart,
  FiCpu
} from 'react-icons/fi';

const socket = io("https://chat.vintrastudio.com", { transports: ["websocket"] });

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
  const [active, setActive] = useState("chat");
  const [userChecked, setUserChecked] = useState(false);
  const highlightRef = useRef();
  const buttonRefs = useRef([]);

  // Auth guard
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u || u.role !== "admin") {
      localStorage.removeItem("user");
      navigate("/login");
    } else {
      setUserChecked(true);
    }
  }, [navigate]);

  // Socket init for chat
  useEffect(() => {
    if (active !== "chat") return;
    socket.on("init", msgs => {
      const convos = {};
      msgs.forEach(m => {
        convos[m.userId] = (convos[m.userId] || []).concat(m);
      });
      setConversations(convos);
    });
    socket.on("new_message", m => {
      setConversations(prev => ({
        ...prev,
        [m.userId]: (prev[m.userId] || []).concat(m)
      }));
    });
    return () => socket.disconnect();
  }, [active]);

  const sendChat = () => {
    if (!input.trim() || !selectedConv) return;
    const msg = { from: 'admin', text: input, userId: selectedConv };
    socket.emit("admin_reply", msg);
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
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/login");
  };

  // on nav click, set active and move highlight
  const handleNavClick = (key, idx) => {
    setActive(key);
    const btn = buttonRefs.current[idx];
    if (btn && highlightRef.current) {
      highlightRef.current.style.top = btn.offsetTop + 'px';
    }
  };

  if (!userChecked) return null;

  const MENU = [
    { section: "Support", items: [
      { key: "chat", label: "Chat Dashboard", icon: <FiMessageSquare /> },
      { key: "ticketDashboard", label: "Ticket Dashboard", icon: <FiFileText /> },
      { key: "tickets", label: "Tickets", icon: <FiUsers /> }
    ]},
    { section: "Statistics", items: [
      { key: "lineChart", label: "Line Chart", icon: <FiBarChart2 /> },
      { key: "pieChart", label: "Pie Chart", icon: <FiPieChart /> },
      { key: "botAdmin", label: "Bot Admin Chart", icon: <FiCpu /> }
    ]}
  ];

  const CONTENT = {
  chat: (
    <ChatDashboard
      conversations={conversations}
      selected={selectedConv}
      onSelect={setSelectedConv}
      onSend={sendChat}
      input={input}
      setInput={setInput}
      onDelete={deleteConv}
    />
  ),
  ticketDashboard: <TicketDashboard />,
  tickets:           <Tickets />,
  lineChart:         <LineChartCard />,
  pieChart:          <CountryGeoChart  />,
  botAdmin: (
    <>
      <ChatActivityChart />
      <ChatGeoChart />
    </>
  ),
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
