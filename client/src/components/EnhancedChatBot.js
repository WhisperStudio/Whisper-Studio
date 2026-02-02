import { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes, css, ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX,  FiAlertTriangle } from 'react-icons/fi';
import GlassOrbAvatar from './GlassOrbAvatar';
import { db, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, setDoc, onSnapshot, updateDoc, collectionGroup, getDoc } from '../firebase';
import { FiSmile, FiEdit3, FiClock, FiArrowLeft, FiUser } from 'react-icons/fi';
import { BsChatDots, BsTicketPerforated } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import { generateAIResponse } from '../services/aiService';

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
  },
  christmas: {
    primary: '#ff6b6b',
    primaryDark: '#ff3737',
    primaryLight: '#ff9a9a',
    secondary: '#33cc33',
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
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #33cc33 100%)',
    messageUser: '#ff6b6b',
    messageBot: '#f3f4f6',
    messageUserText: '#ffffff',
    messageBotText: '#111827',
  }
};

/* ===================== GLOBAL STYLES ===================== */
// Import Google Fonts directly
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
link.rel = 'stylesheet';
if (!document.querySelector('link[href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"]')) {
  document.head.appendChild(link);
}

const GlobalChatStyles = createGlobalStyle`
  .chat-container, .chat-container * {
    cursor: auto;
  }
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
  position: absolute;
  bottom: 80px;
  right: 0;
  width: min(420px, calc(100vw - 40px));
  height: min(600px, calc(100vh - 140px));
  background: ${props => props.theme.background}; border-radius: 20px;
  box-shadow: 0 20px 60px ${props => props.theme.shadow};
  display: flex; flex-direction: column; overflow: hidden; border: 1px solid ${props => props.theme.border};
  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    height: calc(100vh - 140px);
    max-width: 420px;
    max-height: 600px;
  }
  @media (max-width: 480px) {
    width: calc(100vw - 20px);
    right: 0;
  }
`;
const Header = styled.div`
  background: ${props => props.theme.name === 'dark' ? '#0a0d1a' : '#0a0d1a'};
  padding: 15px 20px 15px 90px; /* Increased left padding for avatar */
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 90px; /* Ensure enough height for the avatar */
  position: relative;
  border-bottom: 1px solid ${props => props.theme.border};
`;
const TabNav = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.border};
  padding: 0 20px;
  background: ${props => props.theme.surface};
  position: relative;
  z-index: 10;
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
  &:hover { background: ${props => props.surfaceHover}; transform: translateX(5px); }
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

const HeaderLeft = styled.div` 
  display: flex; 
  align-items: center; 
  position: relative;
  padding-left: 10px; /* Add padding to account for avatar width */
  min-height: 80px; /* Ensure enough height for the avatar */
  width: 100%;
  z-index: 1; 
  gap: 20px;
`;

const HeaderInfo = styled.div` 
  display: flex; 
  flex-direction: column; 
  width: 100%;
`;
const HeaderTitle = styled.h3` 
  margin: 0; 
  font-size: 16px; 
  font-weight: 600; 
  display: flex;
  align-items: center;
  gap: 8px;
`;
const HeaderStatus = styled.span`
  font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 5px;
  &::before { 
    content: ''; 
    width: 8px; 
    height: 8px; 
    border-radius: 50%; 
    background: ${props => (props.$maintenance ? '#f59e0b' : '#10b981')}; 
    animation: ${pulse} 2s infinite; 
  }
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
  flex: 1; 
  overflow-y: auto; 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  gap: 15px; 
  background: ${props => props.theme.surface}; 
  scroll-behavior: smooth; 
  position: relative;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { 
    background: ${props => props.theme.border}; 
    border-radius: 3px; 
  }
  &::-webkit-scrollbar-thumb:hover { 
    background: ${props => props.theme.textSecondary}; 
  }
  
  ${props => props.$maintenance && css`
    &::after {
      content: '⚠️';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(2);
      opacity: 0.3;
      font-size: 60px;
      pointer-events: none;
      z-index: 1;
    }
    
    & > * {
      opacity: 0.5;
    }
  `}
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

const FormButton = styled(motion.button)`
  padding: 8px 16px; border-radius: 8px; border: none; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px;
  ${props => props.$primary ? css` background: ${props => props.theme.gradient}; color: white; ` : css`
    background: ${props => props.theme.surface}; color: ${props => props.theme.textSecondary}; border: 1px solid ${props => props.theme.border};
  `}
  &:hover { transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;


const MaintenanceView = styled.div`
  flex: 1;
  background: #0b1f3b;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: #e5f0ff;
  gap: 12px;
`;

const MaintenanceIcon = styled(FiAlertTriangle)`
  font-size: 40px;
  color: #fbbf24;
`;

const MaintenanceText = styled.p`
  margin: 0;
  font-size: 14px;
  max-width: 280px;
`;

// ===================== AI AVATAR ===================== */
// The AI_Avatar component is now imported from './AI_Avatar'

/* ===================== COMPONENT ===================== */
const EnhancedChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [skin, setSkin] = useState('default');
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [takenOver, setTakenOver] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isButtonExpanded, setIsButtonExpanded] = useState(false);
 
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [expectedWait, setExpectedWait] = useState(null);

  const [ticketData, setTicketData] = useState({ title: '', description: '', category: 'general', priority: 'medium' });
  const [activeView, setActiveView] = useState('chat'); // 'chat', 'tickets', 'createTicket', 'viewTicket'
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessage, setTicketMessage] = useState('');
  const [awaitingTicketConfirm, setAwaitingTicketConfirm] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const takenOverRef = useRef(false);
  const maintenanceRef = useRef(false);

  const welcomeRequestedRef = useRef(false);

  const currentTheme = themes[theme];
  const effectiveMaintenanceText = (typeof maintenanceMessage === 'string' && maintenanceMessage.trim())
    ? maintenanceMessage.trim()
    : 'The bot is currently under maintenance.';

  // UI chrome uses static labels; all bot text comes from Python backend

  /* ===================== INIT & SUBSCRIPTIONS ===================== */
  // Sync global AI settings (theme, avatar skin, maintenance) from Firestore
  useEffect(() => {
    const settingsRef = doc(db, 'system', 'aiSettings');
    const unsub = onSnapshot(settingsRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() || {};

      // Theme / appearance
      if (data.theme && themes[data.theme]) {
        setTheme(prev => (prev === data.theme ? prev : data.theme));
        document.documentElement.setAttribute('data-theme', data.theme);
      }
      if (data.avatarSkin) {
        setSkin(prev => (prev === data.avatarSkin ? prev : data.avatarSkin));
      }

      // Maintenance mode: when bot is disabled globally, chat goes into maintenance
      const enabled = data.isEnabled !== false; // default true
      const globalMaintenance = !enabled;
      maintenanceRef.current = globalMaintenance;
      setMaintenance(globalMaintenance);

      if (typeof data.maintenanceMessage === 'string') {
        setMaintenanceMessage(data.maintenanceMessage);
      } else {
        setMaintenanceMessage('');
      }

      if (typeof data.expectedWait === 'number') {
        setExpectedWait(data.expectedWait);
      }
    });

    return () => unsub();
  }, []);

  // Handle keyboard events for direct typing when chat is open
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      // If user is already focused on input, let it handle the event
      if (document.activeElement === inputRef.current) return;
      
      // If it's a printable character or space, focus the input
      if (e.key.length === 1 || e.key === ' ' || e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    let id = localStorage.getItem('enhancedChatUserId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('enhancedChatUserId', id);
    }
    setUserId(id);

    const savedLanguage = localStorage.getItem('chatLanguage') || 'en';
    const savedAISettings = JSON.parse(localStorage.getItem('aiSettings') || '{}');
    
    setLanguage(savedLanguage);

    if (typeof savedAISettings.message === 'string') {
      setMaintenanceMessage(savedAISettings.message);
    }
  }, []);

  // Header avatar state management for the AI_Avatar component
  // Header avatar state management for the GlassOrbAvatar component

  useEffect(() => {
    if (!userId || !isOpen) return;

    // Set initializing state to show loading indicator
    setIsInitializing(true);

    // Initialize chat document immediately (non-blocking)
    setDoc(doc(db, 'chats', userId), { 
      createdAt: serverTimestamp() 
    }, { merge: true }).catch(() => {});

    // Fetch country code asynchronously without blocking
    const fetchCountryAsync = async () => {
      try {
        const chatDoc = await getDoc(doc(db, 'chats', userId));
        const chatData = chatDoc.data();
        
        if (!chatData.country) {
          try {
            const response = await fetch('https://ipapi.co/json');
            const { country } = await response.json();
            
            await updateDoc(doc(db, 'chats', userId), {
              country: country || 'Unknown',
              lastUpdated: serverTimestamp()
            });
          } catch (error) {
            console.error('Error fetching country:', error);
            // Set Unknown as fallback
            await updateDoc(doc(db, 'chats', userId), {
              country: 'Unknown',
              lastUpdated: serverTimestamp()
            });
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        // Clear initializing state after a short delay
        setTimeout(() => setIsInitializing(false), 300);
      }
    };

    // Start country fetching in background
    fetchCountryAsync();

    const chatRef = doc(db, 'chats', userId);
    const unsubChat = onSnapshot(chatRef, (snap) => {
      const data = snap.data() || {};
      setTakenOver(!!data.takenOver);
      takenOverRef.current = !!data.takenOver;
      // Maintenance is now driven by global AI settings (system/aiSettings)
      // but we still respect any expectedWait stored per chat
      if (typeof data.expectedWait === 'number') {
        setExpectedWait(data.expectedWait);
      }
      setAdminTyping(!!data.adminTyping);
    });

    // When in maintenance mode (and not handled by a human), avoid
    // subscribing to messages or initializing the AI backend.
    if (maintenance && !takenOver) {
      setMessages([]);
      return () => { unsubChat(); };
    }

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

      // Request welcome message once when chat opens and no messages exist
      if (list.length === 0 && isOpen && !welcomeRequestedRef.current) {
        welcomeRequestedRef.current = true;
        
        // Add small delay to prevent blocking UI
        setTimeout(async () => {
          try {
            const data = await generateAIResponse('hello', userId);
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
            console.error('Error fetching welcome from bot:', err);
          }
        }, 100); // Small delay to prevent UI blocking
      }

    });

    return () => { unsubChat(); unsubMsgs(); };
  }, [userId, isOpen, language, maintenance, takenOver]);

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

  // Maintenance state is now managed through the admin panel
  // and synced via localStorage

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


  // Input handlers for chat input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setIsUserTyping(value.length > 0);
  };

  const handleInputFocus = () => {
    if (input.length > 0) {
      setIsUserTyping(true);
    }
  };

  const handleInputBlur = () => {
    setIsUserTyping(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !userId) return;
    if (maintenanceRef.current && !takenOverRef.current) return;

    setInput('');
    setIsUserTyping(false); // Reset user typing state when submitting
    setIsTyping(true);

    try {
      // Add user message to chat
      await addDoc(collection(db, 'chats', userId, 'messages'), {
        text,
        sender: 'user',
        timestamp: serverTimestamp(),
      });
      
      try { 
        await updateDoc(doc(db, 'chats', userId), { lastUpdated: serverTimestamp() }); 
      } catch (error) {
        console.error('Error updating chat timestamp:', error);
      }

      // Handle maintenance mode
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
        } catch (error) {
          console.error('Error sending maintenance message:', error);
        }
        
        try {
          await setDoc(
            doc(db, 'chats', userId), 
            { 
              maintenance: true, 
              expectedWait: eta, 
              lastUpdated: serverTimestamp() 
            }, 
            { merge: true }
          );
        } catch (error) {
          console.error('Error updating maintenance status:', error);
        }
        
        setIsTyping(false);
        return;
      }

      if (takenOverRef.current) { 
        setIsTyping(false); 
        return; 
      }

      // Call Node_AI handler
      try {
        // Call Node_AI handler (JS-bot)
      const response = await generateAIResponse(text, userId);

      // Update language if needed
      if (response?.lang) {
        setLanguage(response.lang);
        localStorage.setItem('chatLanguage', response.lang);
      }

      setAwaitingTicketConfirm(!!response.awaiting_ticket_confirm);

      if (response.active_view) {
        setActiveView(response.active_view);
      }

      if (response.reply) {
        // Add a small delay to ensure the typing indicator is visible
        await new Promise(resolve => setTimeout(resolve, 500));
        await addDoc(collection(db, 'chats', userId, 'messages'), {
          text: response.reply,
          sender: 'bot',
          timestamp: serverTimestamp(),
        });
      }
} catch (error) {
        console.error('Error getting AI response:', error);
        // Fallback response if AI service fails
        await addDoc(collection(db, 'chats', userId, 'messages'), {
          text: language === 'no' 
            ? 'Beklager, det oppsto en feil. Vennligst prøv igjen.' 
            : 'Sorry, something went wrong. Please try again.',
          sender: 'bot',
          timestamp: serverTimestamp(),
        });
      } finally {
        setIsTyping(false);
      }
      
    } catch (error) {
      console.error('Error in message handling:', error);
      setIsTyping(false);
      
      // Add error message to chat
      try {
        await addDoc(collection(db, 'chats', userId, 'messages'), {
          text: language === 'no'
            ? 'Beklager, det oppsto en feil under sending av meldingen.'
            : 'Sorry, there was an error sending your message.',
          sender: 'bot',
          timestamp: serverTimestamp(),
        });
      } catch (innerError) {
        console.error('Error adding error message to chat:', innerError);
      }
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
  }, [userId, selectedTicket]);

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
                  {isInitializing && (
                    <div style={{
                      position: 'absolute',
                      left: '-80px',
                      top: '0px',
                      zIndex: 10
                    }}>
                      <GlassOrbAvatar 
                        size={60} 
                        skin={skin} 
                        colorState="typing" 
                        isTyping={true} 
                      />
                    </div>
                  )}
                  {!isInitializing && (
                    <div style={{
                      position: 'absolute',
                      left: '-80px',
                      top: '0px',
                      zIndex: 10
                    }}>
                      <GlassOrbAvatar 
                        size={60} 
                        skin={skin} 
                        colorState="idle" 
                        isHovered={false} 
                      />
                    </div>
                  )}
                  <HeaderInfo>
                    <HeaderTitle>
                      {maintenance ? <FiAlertTriangle color="#ffa500" /> : null}
                      Vintra AI Assistant
                    </HeaderTitle>
                    <HeaderStatus $maintenance={maintenance && !takenOver}>
                      {takenOver
                        ? 'Support Agent Active'
                        : (maintenance
                            ? `Under Maintenance${expectedWait ? ` • ETA ${expectedWait} min` : ''}`
                            : 'Online')}
                    </HeaderStatus>
                  </HeaderInfo>
                </HeaderLeft>
                <HeaderActions>
                  <HeaderButton onClick={() => setIsOpen(false)} title="Close">
                    <FiX />
                  </HeaderButton>
                </HeaderActions>
              </Header>

              <TabNav>
                <TabButton 
                  $active={activeView === 'chat'} 
                  onClick={() => setActiveView('chat')}
                >
                  <BsChatDots /> Chat
                </TabButton>
                <TabButton 
                  $active={activeView === 'tickets'} 
                  onClick={() => setActiveView('tickets')}
                >
                  <BsTicketPerforated /> Tickets
                </TabButton>
                <TabButton 
                  $active={activeView === 'createTicket'}
                  onClick={() => setActiveView('createTicket')}
                  $primary
                >
                  <FiEdit3 /> New
                </TabButton>
              </TabNav>

              {/* Chat View */}
              {activeView === 'chat' && (
                maintenance && !takenOver ? (
                  <MaintenanceView>
                    <MaintenanceIcon />
                    <MaintenanceText>
                      {effectiveMaintenanceText}
                    </MaintenanceText>
                  </MaintenanceView>
                ) : (
                <>
                  <MessagesContainer $maintenance={false}>
                    {messages.map((message) => {
                      const isUser = message.sender === 'user';
                      return (
                        <MessageWrapper key={message.id} $isUser={isUser}>
                          <MessageAvatar $isUser={isUser}>
                            {isUser ? '👤' : (
                              <GlassOrbAvatar 
                                messageId={message.id} 
                                sender={message.sender} 
                                isTyping={false}
                                skin={skin}
                                style={{ width: '32px', height: '32px' }} 
                              />
                            )}
                          </MessageAvatar>
                          <MessageContent>
                            <MessageBubble $isUser={isUser}>
                              {message.text}
                            </MessageBubble>
                            <MessageTime $isUser={isUser}>
                              {formatTime(message.timestamp)}
                            </MessageTime>
                          </MessageContent>
                        </MessageWrapper>
                      );
                    })}

                    {isTyping && (
                      <MessageWrapper $isUser={false}>
                        <MessageAvatar $isUser={false}>
                          <GlassOrbAvatar 
                            messageId="typing" 
                            sender="bot" 
                            isTyping={true}
                            skin={skin}
                            style={{ width: '32px', height: '32px' }} 
                          />
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
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder={'Type your message...'}
                        disabled={isTyping}
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
                      disabled={!input.trim() || isTyping}
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
                )
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
