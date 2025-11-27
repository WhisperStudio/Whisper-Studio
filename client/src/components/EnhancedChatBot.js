import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes, css, ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  collectionGroup
} from '../firebase';
import { FiSend, FiSmile, FiX, FiMoon, FiZap, FiSun, FiEdit3, FiClock, FiArrowLeft, FiUser } from 'react-icons/fi';
import { BsChatDots, BsTicketPerforated } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import TicketSystem from './TicketSystem';
import { createPolkadotAvatar } from './PolkadotAvatar';

// Import Python bot client
import { sendToBot } from "./ChatBot_Promts";

/* ===================== THEME ===================== */
const themes = {
  light: {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',
    secondary: '#ec4899',
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceHover: '#f3f4f6',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.1)',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    messageUser: '#6366f1',
    messageBot: '#f3f4f6',
    messageUserText: '#ffffff',
    messageBotText: '#111827',
  },
  dark: {
    primary: '#818cf8',
    primaryDark: '#6366f1',
    primaryLight: '#a5b4fc',
    secondary: '#f472b6',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    info: '#60a5fa',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    messageUser: '#6366f1',
    messageBot: '#1e293b',
    messageUserText: '#ffffff',
    messageBotText: '#f1f5f9',
  },
  neon: {
    primary: '#00ffff',
    primaryDark: '#00cccc',
    primaryLight: '#66ffff',
    secondary: '#ff00ff',
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceHover: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    border: '#333333',
    shadow: 'rgba(0, 255, 255, 0.2)',
    error: '#ff3333',
    success: '#00ff00',
    warning: '#ffff00',
    info: '#00ffff',
    gradient: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
    messageUser: 'linear-gradient(135deg, #00ffff 0%, #0099cc 100%)',
    messageBot: '#1a1a1a',
    messageUserText: '#000000',
    messageBotText: '#ffffff',
  }
};

/* ===================== GLOBAL STYLES ===================== */
const GlobalChatStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  .chat-container, .chat-container * {
    cursor: auto;
  }
`;

const bounceIn = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;
const typing = keyframes`
  0%, 80%, 100% { transform: scale(0); opacity: 0; }
  40% { transform: scale(1); opacity: 1; }
`;

/* ===================== UI ELEMENTS ===================== */
const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  @media (max-width: 768px) {
    bottom: 10px;
    right: 10px;
  }
`;
const FloatingButton = styled(motion.button)`
  width: ${props => props.$isExpanded ? '200px' : '65px'};
  height: 65px;
  border-radius: ${props => props.$isExpanded ? '35px' : '50%'};
  background: ${props => props.theme.gradient};
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 30px ${props => props.theme.shadow};
  position: relative; overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { transform: scale(1.05); box-shadow: 0 15px 40px ${props => props.theme.shadow}; }
  &:active { transform: scale(0.95); }
  &::before {
    content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  &:hover::before { left: 100%; }
  ${props => props.$hasNotification && css`
    &::after {
      content: ''; position: absolute; top: 5px; right: 5px; width: 12px; height: 12px;
      background: #ef4444; border-radius: 50%; animation: ${pulse} 2s infinite;
    }
  `}
`;
const ButtonContent = styled.div`
  display: flex; align-items: center; gap: 10px; color: white; font-weight: 600;
  font-size: ${props => props.$isExpanded ? '16px' : '24px'};
`;
const ChatWindow = styled(motion.div)`
  position: absolute; bottom: 80px; right: 0; width: 420px; height: 600px;
  background: ${props => props.theme.background}; border-radius: 20px;
  box-shadow: 0 20px 60px ${props => props.theme.shadow};
  display: flex; flex-direction: column; overflow: hidden; border: 1px solid ${props => props.theme.border};
  @media (max-width: 768px) {
    width: calc(100vw - 40px); height: calc(100vh - 120px); max-width: 420px; max-height: 600px;
  }
  @media (max-width: 480px) {
    width: calc(100vw - 20px); right: -10px;
  }
`;
const Header = styled.div`
  background: ${props => props.theme.gradient}; padding: 20px; display: flex; align-items: center; justify-content: space-between;
  color: white; position: relative; overflow: hidden;
  &::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  }
`;
const TabNav = styled.div`
  display: flex; padding: 10px 15px; gap: 8px; background: ${props => props.theme.surface};
  border-bottom: 1px solid ${props => props.theme.border};
`;
const TabButton = styled.button`
  flex: 1; padding: 10px 16px;
  background: ${props => props.$active ? props.theme.primary : 'transparent'};
  border: 1px solid ${props => props.$active ? props.theme.primary : props.theme.border};
  border-radius: 10px;
  color: ${props => props.$active ? '#fff' : props.theme.textSecondary};
  font-weight: 500; font-size: 13px; cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  &:hover {
    background: ${props => props.$active ? props.theme.primaryDark : props.theme.surfaceHover};
    color: ${props => props.$active ? '#fff' : props.theme.text};
  }
`;

const TicketList = styled.div` display: flex; flex-direction: column; gap: 12px; padding: 15px; `;
const TicketCard = styled(motion.div)`
  background: ${props => props.theme.messageBot}; border: 1px solid ${props => props.theme.border};
  border-radius: 12px; padding: 15px; cursor: pointer; transition: all 0.3s;
  &:hover { background: ${props => props.theme.surfaceHover}; transform: translateX(5px); }
`;
const TicketCardHeader = styled.div` display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; `;
const TicketCardTitle = styled.h4` font-size: 15px; font-weight: 600; color: ${props => props.theme.text}; margin: 0 0 4px 0; `;
const TicketCardMeta = styled.div` display: flex; gap: 8px; align-items: center; font-size: 11px; color: ${props => props.theme.textSecondary}; `;
const TicketStatusBadge = styled.span`
  padding: 4px 10px;
  background: ${props =>
    props.$status === 'open' ? 'rgba(245, 158, 11, 0.2)' :
    props.$status === 'in-progress' ? 'rgba(99, 102, 241, 0.2)' :
    'rgba(34, 197, 94, 0.2)'};
  color: ${props =>
    props.$status === 'open' ? '#f59e0b' :
    props.$status === 'in-progress' ? '#6366f1' :
    '#22c55e'};
  border-radius: 6px; font-size: 10px; font-weight: 600; text-transform: uppercase;
`;
const TicketCardDesc = styled.p` font-size: 13px; color: ${props => props.theme.textSecondary}; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; `;

const HeaderLeft = styled.div` display: flex; align-items: center; gap: 12px; z-index: 1; `;
const Avatar = styled.div`
  width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; transition: all 0.3s ease;
  &::before {
    content: ''; position: absolute; top: -3px; left: -3px; right: -3px; bottom: -3px; border-radius: 50%;
    background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #4facfe, #667eea);
    background-size: 300% 300%; opacity: 0; z-index: -1; filter: blur(8px); transition: opacity 0.3s ease;
  }
  &:hover::before { opacity: 0.6; animation: gradientShift 3s ease infinite; }
  &::after {
    content: ''; position: absolute; top: -6px; left: -6px; right: -6px; bottom: -6px; border-radius: 50%;
    border: 2px solid rgba(99, 102, 241, 0.3); opacity: 0; transition: all 0.3s ease;
  }
  &:hover::after { opacity: 1; animation: ${pulse} 2s ease-in-out infinite; }
  & > div { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; }
  @keyframes gradientShift { 0% {background-position: 0% 50%} 50% {background-position: 100% 50%} 100% {background-position: 0% 50%} }
`;
const HeaderInfo = styled.div` display: flex; flex-direction: column; `;
const HeaderTitle = styled.h3` margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.5px; `;
const HeaderStatus = styled.span`
  font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 5px;
  &::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: ${pulse} 2s infinite; }
`;
const HeaderActions = styled.div` display: flex; gap: 10px; z-index: 1; `;
const HeaderButton = styled.button`
  width: 35px; height: 35px; border-radius: 50%; background: rgba(255,255,255,0.2);
  border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; backdrop-filter: blur(10px); font-size: 18px;
  &:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
  &:active { transform: scale(0.95); }
`;

const MessagesContainer = styled.div`
  flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; background: ${props => props.theme.surface}; scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${props => props.theme.border}; border-radius: 3px; }
  &::-webkit-scrollbar-thumb:hover { background: ${props => props.theme.textSecondary}; }
`;
const MessageWrapper = styled(motion.div)`
  display: flex; align-items: flex-end; gap: 8px; ${props => props.$isUser && 'flex-direction: row-reverse;'}
  ${props => !props.$hasAvatar && !props.$isUser && 'margin-left: 40px;'}
`;
const MessageAvatar = styled.div`
  width: 32px; height: 32px; border-radius: 50%; background: ${props => props.$isUser ? props.theme.primary : 'transparent'};
  display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; position: relative;
  ${props => props.$isUser && css` color: white; `}
  & > div { width: 100%; height: 100%; }
`;
const MessageContent = styled.div` max-width: 70%; display: flex; flex-direction: column; gap: 4px; `;
const MessageBubble = styled.div`
  padding: 12px 16px; border-radius: ${props => props.$isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${props => props.$isUser ? props.theme.messageUser : props.theme.messageBot};
  color: ${props => props.$isUser ? props.theme.messageUserText : props.theme.messageBotText};
  font-size: 14px; line-height: 1.5; word-wrap: break-word; position: relative;
  ${props => props.$isTyping && css`
    padding: 16px 24px;
    &::after { content: '...'; position: absolute; animation: ${typing} 1.4s infinite; }
  `}
`;
const MessageTime = styled.span` font-size: 11px; color: ${props => props.theme.textSecondary}; padding: 0 4px; ${props => props.$isUser && 'text-align: right;'} `;

const InputContainer = styled.form`
  padding: 15px; background: ${props => props.theme.background}; border-top: 1px solid ${props => props.theme.border};
  display: flex; gap: 10px; align-items: center;
`;
const InputWrapper = styled.div`
  flex: 1; position: relative; display: flex; align-items: center; background: ${props => props.theme.surface};
  border-radius: 25px; padding: 0 15px; border: 2px solid transparent; transition: all 0.2s;
  &:focus-within { border-color: ${props => props.theme.primary}; box-shadow: 0 0 0 3px ${props => props.theme.primary}20; }
`;
const Input = styled.input`
  flex: 1; background: transparent; border: none; outline: none; padding: 12px 0; font-size: 14px; color: ${props => props.theme.text};
  &::placeholder { color: ${props => props.theme.textSecondary}; }
`;
const InputActions = styled.div` display: flex; gap: 5px; align-items: center; `;
const IconButton = styled(motion.button)`
  width: 36px; height: 36px; border-radius: 50%; background: transparent; border: none;
  color: ${props => props.theme.textSecondary}; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; font-size: 20px;
  &:hover { background: ${props => props.theme.surfaceHover}; color: ${props => props.theme.primary}; }
  &:active { transform: scale(0.9); }
  ${props => props.$primary && css`
    background: ${props => props.theme.gradient}; color: white;
    &:hover { transform: scale(1.1); box-shadow: 0 4px 12px ${props => props.theme.primary}40; }
  `}
`;

const EmojiPickerContainer = styled.div` position: absolute; bottom: 60px; right: 10px; z-index: 1000; `;

const TicketFormContainer = styled(motion.div)`
  position: absolute; bottom: 60px; right: 10px; width: 350px;
  background: ${props => props.theme.background}; border-radius: 15px; box-shadow: 0 20px 60px ${props => props.theme.shadow};
  border: 1px solid ${props => props.theme.border}; z-index: 1000; overflow: hidden;
`;
const TicketFormHeader = styled.div` background: ${props => props.theme.gradient}; padding: 15px; color: white; display: flex; justify-content: space-between; align-items: center; `;
const TicketFormTitle = styled.h3` margin: 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; `;
const TicketFormBody = styled.div` padding: 20px; display: flex; flex-direction: column; gap: 15px; `;
const FormGroup = styled.div` display: flex; flex-direction: column; gap: 5px; `;
const FormLabel = styled.label` font-size: 13px; font-weight: 500; color: ${props => props.theme.text}; `;
const FormInput = styled.input`
  padding: 10px; background: ${props => props.theme.surface}; border: 1px solid ${props => props.theme.border};
  border-radius: 8px; color: ${props => props.theme.text}; font-size: 14px;
  &:focus { outline: none; border-color: ${props => props.theme.primary}; }
  &::placeholder { color: ${props => props.theme.textSecondary}; }
`;
const FormTextArea = styled.textarea`
  padding: 10px; background: ${props => props.theme.surface}; border: 1px solid ${props => props.theme.border};
  border-radius: 8px; color: ${props => props.theme.text}; font-size: 14px; min-height: 80px; resize: vertical;
  &:focus { outline: none; border-color: ${props => props.theme.primary}; }
  &::placeholder { color: ${props => props.theme.textSecondary}; }
`;
const FormSelect = styled.select`
  padding: 10px; background: ${props => props.theme.surface}; border: 1px solid ${props => props.theme.border};
  border-radius: 8px; color: ${props => props.theme.text}; font-size: 14px; cursor: pointer;
  &:focus { outline: none; border-color: ${props => props.theme.primary}; }
  option { background: ${props => props.theme.surface}; }
`;
const FormActions = styled.div` display: flex; gap: 10px; justify-content: flex-end; `;
const FormButton = styled(motion.button)`
  padding: 8px 16px; border-radius: 8px; border: none; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px;
  ${props => props.$primary ? css` background: ${props => props.theme.gradient}; color: white; ` : css`
    background: ${props => props.theme.surface}; color: ${props => props.theme.textSecondary}; border: 1px solid ${props => props.theme.border};
  `}
  &:hover { transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ===================== POLKADOT AVATAR (MESSAGE) ===================== */
const MessageAvatarPolkadot = ({ messageId, sender, isTyping }) => {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!containerRef.current || apiRef.current) return;
    const config = {
      size: 32, dots: 60, rings: 4, minRadius: 0, maxRadius: 13, dotSize: 3,
      variant: 'free', baseHue: sender === 'admin' ? 280 : 210, spread: 0,
      sat: 95, light: 55, alpha: 0.75, bgAlpha: 0.12, glowStrength: 12,
      speedMin: 3.0, speedMax: 10.0, bobAmp: 2.0, bobSpeed: 1.8, state: 'idle', visible: true, physics: false
    };
    apiRef.current = createPolkadotAvatar(containerRef.current, config);
    return () => { if (apiRef.current) { apiRef.current.destroy(); apiRef.current = null; } };
  }, [sender]);

  useEffect(() => {
    if (!apiRef.current) return;
    if (isTyping) {
      setIsAnimating(true);
      const dots = apiRef.current.root.querySelectorAll('.orb');
      dots.forEach((orb, i) => {
        const delay = i * 8;
        setTimeout(() => {
          orb.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          orb.style.opacity = '0';
          orb.style.transform = `scale(1.5) rotate(${Math.random() * 360}deg)`;
        }, delay);
      });
    } else if (isAnimating) {
      const dots = apiRef.current.root.querySelectorAll('.orb');
      dots.forEach((orb, i) => {
        const delay = i * 8;
        setTimeout(() => {
          orb.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          orb.style.opacity = '1';
          orb.style.transform = 'scale(1) rotate(0deg)';
        }, delay);
      });
      setIsAnimating(false);
    }
  }, [isTyping, isAnimating]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

/* ===================== COMPONENT ===================== */
const EnhancedChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en'); // auto-switch on user message
  const [userId, setUserId] = useState('');
  const [takenOver, setTakenOver] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isButtonExpanded, setIsButtonExpanded] = useState(false);
  const [hasNotification] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false); // kept for potential popup form usage
  const [ticketData, setTicketData] = useState({ title: '', description: '', category: 'general', priority: 'medium' });
  const [activeView, setActiveView] = useState('chat'); // 'chat', 'tickets', 'createTicket', 'viewTicket'
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessage, setTicketMessage] = useState('');
  const [maintenance, setMaintenance] = useState(false);
  const [expectedWait, setExpectedWait] = useState(null);
  const [awaitingTicketConfirm, setAwaitingTicketConfirm] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const takenOverRef = useRef(false);
  const maintenanceRef = useRef(false);
  const headerAvatarRef = useRef(null);
  const headerAvatarApiRef = useRef(null);
  const welcomeRequestedRef = useRef(false);

  const currentTheme = themes[theme];

  // UI chrome uses static labels; all bot text comes from Python backend

  /* ===================== INIT & SUBSCRIPTIONS ===================== */
  useEffect(() => {
    let id = localStorage.getItem('enhancedChatUserId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('enhancedChatUserId', id);
    }
    setUserId(id);

    const savedTheme = localStorage.getItem('chatTheme') || 'dark';
    const savedLanguage = localStorage.getItem('chatLanguage') || 'en';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
  }, []);

  // Header avatar
  useEffect(() => {
    if (!isOpen || !headerAvatarRef.current) return;
    if (headerAvatarApiRef.current) return;
    const timer = setTimeout(() => {
      if (!headerAvatarRef.current) return;
      headerAvatarApiRef.current = createPolkadotAvatar(headerAvatarRef.current, {
        size: 32, dots: 80, rings: 5, minRadius: 0, maxRadius: 12, dotSize: 3.5,
        variant: 'sphere', baseHue: 210, spread: 0, sat: 95, light: 55, alpha: 0.85,
        bgAlpha: 0.15, glowStrength: 15, speedMin: 4.0, speedMax: 12.0, bobAmp: 1.5, bobSpeed: 2.0,
        state: 'idle', visible: true, physics: true, gravity: 'none'
      });
    }, 100);
    return () => {
      clearTimeout(timer);
      if (headerAvatarApiRef.current) { headerAvatarApiRef.current.destroy(); headerAvatarApiRef.current = null; }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!headerAvatarApiRef.current) return;
    if (isTyping) headerAvatarApiRef.current.setState('typing');
    else if (input.length > 0) headerAvatarApiRef.current.setState('listening');
    else headerAvatarApiRef.current.setState('idle');
  }, [isTyping, input]);

  useEffect(() => {
    if (!headerAvatarApiRef.current) return;
    headerAvatarApiRef.current.update({ gravity: isOpen ? 'down' : 'up' });
  }, [isOpen]);

  useEffect(() => {
    if (!userId) return;

    const chatRef = doc(db, 'chats', userId);
    setDoc(chatRef, { createdAt: serverTimestamp() }, { merge: true }).catch(() => {});

    const unsubChat = onSnapshot(chatRef, (snap) => {
      const data = snap.data() || {};
      setTakenOver(!!data.takenOver);
      takenOverRef.current = !!data.takenOver;
      maintenanceRef.current = !!data.maintenance;
      setMaintenance(!!data.maintenance);
      setExpectedWait(typeof data.expectedWait === 'number' ? data.expectedWait : null);
      setAdminTyping(!!data.adminTyping);
    });

    const msgsRef = collection(db, 'chats', userId, 'messages');
    const msgsQ = query(msgsRef, orderBy('timestamp', 'asc'));
    const unsubMsgs = onSnapshot(msgsQ, (snap) => {
      const list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          text: data.text,
          sender: data.sender || 'bot',
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp?.seconds * 1000) || new Date(),
        };
      });
      setMessages(list);

      // Request welcome from Python bot once when chat opens and no messages exist
      if (list.length === 0 && isOpen && !welcomeRequestedRef.current) {
        welcomeRequestedRef.current = true;
        const greetInput = 'hello';
        (async () => {
          try {
            const data = await sendToBot(greetInput);
            if (data?.lang) {
              setLanguage(data.lang);
              localStorage.setItem('chatLanguage', data.lang);
            }
            if (data?.reply) {
              await addDoc(msgsRef, {
                text: data.reply,
                sender: 'bot',
                timestamp: serverTimestamp(),
              });
            }
          } catch (err) {
            console.error('Error fetching welcome from Python bot:', err);
          }
        })();
      }
    });

    return () => { unsubChat(); unsubMsgs(); };
  }, [userId, isOpen, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setIsButtonExpanded(true);
        setTimeout(() => setIsButtonExpanded(false), 3000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const toggleChat = () => { setIsOpen(!isOpen); setShowEmoji(false); };

  const handleEmojiClick = (emojiObject) => {
    setInput(prev => prev + emojiObject.emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const estimateWaitMinutes = async () => {
    try {
      const snap = await getDocs(collectionGroup(db, 'messages'));
      const byUser = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const pathParts = d.ref.path.split('/');
        const uid = data.userId || (pathParts[0] === 'chats' ? pathParts[1] : null);
        if (!uid || !data.timestamp) return;
        let ts;
        try { ts = data.timestamp?.toDate?.() || new Date(data.timestamp?.seconds * 1000); } catch { ts = null; }
        if (!ts || isNaN(ts.getTime())) return;
        (byUser[uid] ||= []).push({ sender: data.sender, t: ts });
      });

      const deltas = [];
      Object.values(byUser).forEach((arr) => {
        arr.sort((a, b) => a.t - b.t);
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].sender === 'user') {
            const t0 = arr[i].t;
            for (let j = i + 1; j < arr.length; j++) {
              if (arr[j].sender === 'admin') {
                const minutes = Math.max(0, (arr[j].t - t0) / 60000);
                if (isFinite(minutes) && minutes < 24 * 60) deltas.push(minutes);
                break;
              }
            }
          }
        }
      });

      if (deltas.length === 0) return 15;
      deltas.sort((a, b) => a - b);
      const mid = Math.floor(deltas.length / 2);
      const median = deltas.length % 2 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) / 2;
      return Math.max(1, Math.round(median));
    } catch (e) { return 15; }
  };

  /* ===================== SEND MESSAGE ===================== */
  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const cycleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const newTheme = themeKeys[nextIndex];
    setTheme(newTheme);
    localStorage.setItem('chatTheme', newTheme);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketData.title || !ticketData.description) return;
    try {
      const ticket = {
        ...ticketData,
        status: 'open',
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messages: []
      };
      await addDoc(collection(db, 'tickets'), ticket);
      setTicketData({ title: '', description: '', category: 'general', priority: 'medium' });
      setActiveView('tickets');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket. Please try again.');
    }
  };

  const handleSendTicketMessage = async () => {
    if (!ticketMessage.trim() || !selectedTicket) return;
    try {
      const messageData = { text: ticketMessage, sender: 'user', timestamp: new Date().toISOString(), userId: userId };
      const ticketRef = doc(db, 'tickets', selectedTicket.id);
      const updatedMessages = [...(selectedTicket.messages || []), messageData];
      await updateDoc(ticketRef, { messages: updatedMessages, updatedAt: serverTimestamp(), status: 'in-progress' });
      setSelectedTicket({ ...selectedTicket, messages: updatedMessages });
      setTicketMessage('');
    } catch (error) { console.error('Error sending message:', error); }
  };

  const onBotReply = async (replyText) => {
    try {
      await addDoc(collection(db, 'chats', userId, 'messages'), {
        text: replyText,
        sender: 'bot',
        timestamp: serverTimestamp(),
      });
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !userId) return;
    if (maintenanceRef.current && !takenOverRef.current) return;


    setInput('');
    setIsTyping(true);

    try {
      await addDoc(collection(db, 'chats', userId, 'messages'), {
        text,
        sender: 'user',
        timestamp: serverTimestamp(),
      });
      try { await updateDoc(doc(db, 'chats', userId), { lastUpdated: serverTimestamp() }); } catch {}

      if ((messages?.length || 0) === 0 && maintenanceRef.current) {
        const eta = await estimateWaitMinutes();
        try {
          await addDoc(collection(db, 'chats', userId, 'messages'), {
            text: language === 'no'
              ? `⚠️ Botten er under arbeid. En rådgiver kontakter deg snart. Forventet ventetid: ${eta} min.`
              : `⚠️ Our bot is under construction. An advisor will contact you shortly. Estimated wait: ${eta} min.`,
            sender: 'bot',
            timestamp: serverTimestamp(),
          });
        } catch {}
        try {
          await setDoc(doc(db, 'chats', userId), { maintenance: true, expectedWait: eta, lastUpdated: serverTimestamp() }, { merge: true });
        } catch {}
        setIsTyping(false);
        return;
      }

      if (takenOverRef.current) { setIsTyping(false); return; }

      // ---- CALL PYTHON BOT BACKEND ----
      try {
        const data = await sendToBot(text);
        if (data?.lang) {
          setLanguage(data.lang);
          localStorage.setItem('chatLanguage', data.lang);
        }
        setAwaitingTicketConfirm(!!data?.awaiting_ticket_confirm);
        if (data?.active_view) setActiveView(data.active_view);
        if (data?.reply) {
          await onBotReply(data.reply);
        }
        setIsTyping(false);
        return;
      } catch (err) {
        console.error('Python bot call failed:', err);
      }

      // No local fallback; Python backend is the single source of truth
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`, text: 'Sorry, something went wrong. Please try again.', sender: 'bot', timestamp: new Date(),
      }]);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  /* ===================== TICKETS SUB ===================== */
  useEffect(() => {
    if (!userId) return;
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(t => t.userId === userId);
      setTickets(ticketsList);
      if (selectedTicket) {
        const updated = ticketsList.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    }, (error) => { console.error('Error loading tickets:', error); });
    return () => unsubscribe();
  }, [userId, selectedTicket?.id]);

  /* ===================== RENDER ===================== */
  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalChatStyles />
      <ChatContainer className="chat-container">
        <AnimatePresence>
          {isOpen && (
            <ChatWindow
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <Header>
                <HeaderLeft>
                  <Avatar
                    onMouseEnter={() => {
                      if (headerAvatarApiRef.current) {
                        headerAvatarApiRef.current.update({
                          maxRadius: 18, speedMin: 12.0, speedMax: 30.0, glowStrength: 30, alpha: 1.0,
                          bobAmp: 3.0, bobSpeed: 3.5, dotSize: 4.5
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      if (headerAvatarApiRef.current) {
                        headerAvatarApiRef.current.update({
                          maxRadius: 12, speedMin: 4.0, speedMax: 12.0, glowStrength: 15, alpha: 0.85,
                          bobAmp: 1.5, bobSpeed: 2.0, dotSize: 3.5
                        });
                      }
                    }}
                  >
                    <div ref={headerAvatarRef} />
                  </Avatar>
                  <HeaderInfo>
                    <HeaderTitle>Vintra AI Assistant</HeaderTitle>
                    <HeaderStatus>
                      {takenOver
                        ? 'Support Agent Active'
                        : (maintenance
                            ? `Under Maintenance${expectedWait ? ` • ETA ${expectedWait} min` : ''}`
                            : 'Online')}
                    </HeaderStatus>
                  </HeaderInfo>
                </HeaderLeft>
                <HeaderActions>
                  <HeaderButton onClick={cycleTheme}>
                    {theme === 'light' ? <FiMoon /> : theme === 'dark' ? <FiZap /> : <FiSun />}
                  </HeaderButton>
                  <HeaderButton onClick={toggleChat}><FiX /></HeaderButton>
                </HeaderActions>
              </Header>

              <TabNav>
                <TabButton $active={activeView === 'chat'} onClick={() => setActiveView('chat')}>
                  <BsChatDots /> Chat
                </TabButton>
                <TabButton $active={activeView === 'tickets'} onClick={() => setActiveView('tickets')}>
                  <BsTicketPerforated /> Tickets {tickets.length > 0 && `(${tickets.length})`}
                </TabButton>
                <TabButton $active={activeView === 'createTicket'} onClick={() => setActiveView('createTicket')}>
                  <FiEdit3 /> New
                </TabButton>
              </TabNav>

              {/* Chat View */}
              {activeView === 'chat' && (
                <>
                  <MessagesContainer>
                    {messages.map((message, index) => {
                      const isLastBotMessage = message.sender !== 'user' && index === messages.length - 1;
                      const hasAvatar = message.sender === 'user' || isLastBotMessage;
                      return (
                        <MessageWrapper
                          key={message.id}
                          $isUser={message.sender === 'user'}
                          $hasAvatar={hasAvatar}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {hasAvatar && (
                            <MessageAvatar $isUser={message.sender === 'user'}>
                              {message.sender === 'user'
                                ? '👤'
                                : <MessageAvatarPolkadot messageId={message.id} sender={message.sender} isTyping={false} />
                              }
                            </MessageAvatar>
                          )}
                          <MessageContent>
                            <MessageBubble $isUser={message.sender === 'user'}>
                              {message.text}
                            </MessageBubble>
                            <MessageTime $isUser={message.sender === 'user'}>
                              {formatTime(message.timestamp)}
                            </MessageTime>
                          </MessageContent>
                        </MessageWrapper>
                      );
                    })}

                    {isTyping && (
                      <MessageWrapper $isUser={false}>
                        <MessageAvatar $isUser={false}>
                          <MessageAvatarPolkadot messageId="typing" sender="bot" isTyping={true} />
                        </MessageAvatar>
                        <MessageContent>
                          <MessageBubble $isUser={false} $isTyping={true}>
                            <span style={{ opacity: 0 }}>...</span>
                          </MessageBubble>
                        </MessageContent>
                      </MessageWrapper>
                    )}

                    {adminTyping && (
                      <MessageWrapper $isUser={false}>
                        <MessageAvatar $isUser={false}>👨‍💼</MessageAvatar>
                        <MessageContent>
                          <MessageBubble $isUser={false} $isTyping={true}>
                            <span style={{ opacity: 0 }}>...</span>
                          </MessageBubble>
                        </MessageContent>
                      </MessageWrapper>
                    )}

                    <div ref={messagesEndRef} />
                  </MessagesContainer>

                  <InputContainer onSubmit={handleSubmit}>
                    <InputWrapper>
                      <Input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={(maintenance && !takenOver)
                          ? `Under maintenance – please wait${expectedWait ? ` ~${expectedWait} min` : ''}`
                          : 'Type your message...'}
                        disabled={isTyping || (maintenance && !takenOver)}
                      />
                      <InputActions>
                        <IconButton
                          type="button"
                          onClick={() => setShowEmoji(!showEmoji)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiSmile />
                        </IconButton>
                      </InputActions>
                    </InputWrapper>
                    <IconButton
                      type="submit"
                      $primary
                      disabled={!input.trim() || isTyping || (maintenance && !takenOver)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiSend />
                    </IconButton>
                  </InputContainer>

                  {showEmoji && (
                    <EmojiPickerContainer>
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={theme === 'dark' ? 'dark' : 'light'}
                        height={350}
                        width={300}
                      />
                    </EmojiPickerContainer>
                  )}
                </>
              )}

              {/* Tickets View */}
              {activeView === 'tickets' && (
                <TicketList>
                  {tickets.length > 0 ? (
                    tickets.map(ticket => (
                      <TicketCard
                        key={ticket.id}
                        onClick={() => { setSelectedTicket(ticket); setActiveView('viewTicket'); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <TicketCardHeader>
                          <div>
                            <TicketCardTitle>{ticket.title}</TicketCardTitle>
                            <TicketCardMeta>
                              <FiClock /> {formatDate(ticket.createdAt)}
                            </TicketCardMeta>
                          </div>
                          <TicketStatusBadge $status={ticket.status}>
                            {ticket.status}
                          </TicketStatusBadge>
                        </TicketCardHeader>
                        <TicketCardDesc>{ticket.description}</TicketCardDesc>
                      </TicketCard>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: currentTheme.textSecondary }}>
                      <BsTicketPerforated size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                      <p>Ingen tickets ennå</p>
                      <p style={{ fontSize: '14px', marginTop: '10px' }}>Opprett en ticket for å få support</p>
                    </div>
                  )}
                </TicketList>
              )}

              {/* Create Ticket View */}
              {activeView === 'createTicket' && (
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                  <form onSubmit={handleCreateTicket}>
                    <FormGroup>
                      <FormLabel>Title</FormLabel>
                      <FormInput
                        type="text"
                        placeholder="Brief description of your issue"
                        value={ticketData.title}
                        onChange={(e) => setTicketData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Category</FormLabel>
                      <FormSelect
                        value={ticketData.category}
                        onChange={(e) => setTicketData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="options">Options</option>
                        <option value="bug">Bug Report</option>
                      </FormSelect>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Priority</FormLabel>
                      <FormSelect
                        value={ticketData.priority}
                        onChange={(e) => setTicketData(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </FormSelect>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Description</FormLabel>
                      <FormTextArea
                        placeholder="Describe your issue in detail..."
                        value={ticketData.description}
                        onChange={(e) => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                        required
                      />
                    </FormGroup>

                    <FormButton
                      type="submit"
                      $primary
                      disabled={!ticketData.title || !ticketData.description}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ width: '100%', marginTop: '10px' }}
                    >
                      <BsTicketPerforated /> Create Ticket
                    </FormButton>
                  </form>
                </div>
              )}

              {/* View Single Ticket */}
              {activeView === 'viewTicket' && selectedTicket && (
                <>
                  <div
                    style={{
                      padding: '15px',
                      borderBottom: `1px solid ${currentTheme.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <IconButton onClick={() => setActiveView('tickets')}>
                      <FiArrowLeft />
                    </IconButton>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '16px', color: currentTheme.text }}>
                        {selectedTicket.title}
                      </h4>
                      <TicketStatusBadge
                        $status={selectedTicket.status}
                        style={{ marginTop: '5px', display: 'inline-block' }}
                      >
                        {selectedTicket.status}
                      </TicketStatusBadge>
                    </div>
                  </div>

                  <MessagesContainer>
                    {/* Initial ticket description */}
                    <MessageWrapper $isUser={true}>
                      <MessageAvatar $isUser={true}>👤</MessageAvatar>
                      <MessageContent>
                        <MessageBubble $isUser={true}>
                          {selectedTicket.description}
                        </MessageBubble>
                        <MessageTime $isUser={true}>
                          {formatTime(selectedTicket.createdAt)}
                        </MessageTime>
                      </MessageContent>
                    </MessageWrapper>

                    {/* Ticket message thread */}
                    {selectedTicket.messages?.map((msg, index) => (
                      <MessageWrapper key={index} $isUser={msg.sender === 'user'}>
                        <MessageAvatar $isUser={msg.sender === 'user'}>
                          {msg.sender === 'user' ? '👤' : '👨‍💼'}
                        </MessageAvatar>
                        <MessageContent>
                          <MessageBubble $isUser={msg.sender === 'user'}>
                            {msg.text}
                          </MessageBubble>
                          <MessageTime $isUser={msg.sender === 'user'}>
                            {formatTime(msg.timestamp)}
                          </MessageTime>
                        </MessageContent>
                      </MessageWrapper>
                    ))}

                    <div ref={messagesEndRef} />
                  </MessagesContainer>

                  <InputContainer onSubmit={(e) => { e.preventDefault(); handleSendTicketMessage(); }}>
                    <InputWrapper>
                      <Input
                        type="text"
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="Type your message..."
                      />
                    </InputWrapper>
                    <IconButton
                      type="submit"
                      $primary
                      disabled={!ticketMessage.trim()}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiSend />
                    </IconButton>
                  </InputContainer>
                </>
              )}
            </ChatWindow>
          )}
        </AnimatePresence>

        {/* Ticket System Integration (kept for consistency) */}
        <TicketSystem showButton={false} />

        <FloatingButton
          onClick={toggleChat}
          $isExpanded={isButtonExpanded}
          $hasNotification={false}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ButtonContent $isExpanded={isButtonExpanded}>
            {isButtonExpanded
              ? (takenOver ? <> <FiUser /> Live Support </> : <> <BsChatDots /> Chat with AI </>)
              : (takenOver ? <FiUser /> : <BsChatDots />)}
          </ButtonContent>
        </FloatingButton>
      </ChatContainer>
    </ThemeProvider>
  );
};

export default EnhancedChatBot;
