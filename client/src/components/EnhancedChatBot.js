import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  deleteDoc,
  onSnapshot,
  updateDoc,
  collectionGroup
} from '../firebase';
import { FiSend, FiPaperclip, FiMic, FiSmile, FiSettings, FiX, FiMinimize2, FiMaximize2, FiMoreVertical, FiTrash2, FiVolume2, FiVolumeX, FiSun, FiMoon, FiZap, FiImage, FiFile, FiDownload, FiCheck, FiCheckCircle, FiLifeBuoy, FiAlertCircle, FiUser } from 'react-icons/fi';
import { BsRobot, BsTranslate, BsChatDots, BsStars, BsTicketPerforated } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import { IoSparkles, IoPulse, IoAnalytics } from 'react-icons/io5';
import TicketSystem from './TicketSystem';
import { generateAIResponse } from '../services/aiService';
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

// Global styles
const GlobalChatStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
`;

// Animations
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

// Main container
const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  cursor: auto !important; /* Fix cursor visibility */
  
  * {
    cursor: auto !important; /* Ensure cursor is visible on all child elements */
  }
  
  button {
    cursor: pointer !important; /* Buttons should show pointer cursor */
  }
  
  input, textarea {
    cursor: text !important; /* Text inputs should show text cursor */
  }
  
  @media (max-width: 768px) {
    bottom: 10px;
    right: 10px;
  }
`;

// Floating Action Button
const FloatingButton = styled(motion.button)`
  width: ${props => props.$isExpanded ? '200px' : '65px'};
  height: 65px;
  border-radius: ${props => props.$isExpanded ? '35px' : '50%'};
  background: ${props => props.theme.gradient};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px ${props => props.theme.shadow};
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 40px ${props => props.theme.shadow};
  }
  
  &:active {
    transform: scale(0.95);
  }
  
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
  
  &:hover::before {
    left: 100%;
  }
  
  ${props => props.$hasNotification && css`
    &::after {
      content: '';
      position: absolute;
      top: 5px;
      right: 5px;
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      animation: ${pulse} 2s infinite;
    }
  `}
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: 600;
  font-size: ${props => props.$isExpanded ? '16px' : '24px'};
`;

// Chat Window
const ChatWindow = styled(motion.div)`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 420px;
  height: 600px;
  background: ${props => props.theme.background};
  border-radius: 20px;
  box-shadow: 0 20px 60px ${props => props.theme.shadow};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${props => props.theme.border};
  
  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    height: calc(100vh - 120px);
    max-width: 420px;
    max-height: 600px;
  }
  
  @media (max-width: 480px) {
    width: calc(100vw - 20px);
    right: -10px;
  }
`;

// Header
const Header = styled.div`
  background: ${props => props.theme.gradient};
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const HeaderStatus = styled.span`
  font-size: 12px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    animation: ${pulse} 2s infinite;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  z-index: 1;
`;

const HeaderButton = styled.button`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  font-size: 18px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// Messages Area
const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: ${props => props.theme.surface};
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.textSecondary};
  }
`;

const MessageWrapper = styled(motion.div)`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  ${props => props.$isUser && 'flex-direction: row-reverse;'}
`;

const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$isUser ? props.theme.primary : props.theme.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MessageBubble = styled.div`
  padding: 12px 16px;
  border-radius: ${props => props.$isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${props => props.$isUser ? props.theme.messageUser : props.theme.messageBot};
  color: ${props => props.$isUser ? props.theme.messageUserText : props.theme.messageBotText};
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  position: relative;
  
  ${props => props.$isTyping && css`
    padding: 16px 24px;
    
    &::after {
      content: '...';
      position: absolute;
      animation: ${typing} 1.4s infinite;
    }
  `}
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: ${props => props.theme.textSecondary};
  padding: 0 4px;
  ${props => props.$isUser && 'text-align: right;'}
`;

// Input Area
const InputContainer = styled.form`
  padding: 15px;
  background: ${props => props.theme.background};
  border-top: 1px solid ${props => props.theme.border};
  display: flex;
  gap: 10px;
  align-items: center;
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: ${props => props.theme.surface};
  border-radius: 25px;
  padding: 0 15px;
  border: 2px solid transparent;
  transition: all 0.2s;
  
  &:focus-within {
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}20;
  }
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 12px 0;
  font-size: 14px;
  color: ${props => props.theme.text};
  
  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const InputActions = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

const IconButton = styled(motion.button)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 20px;
  
  &:hover {
    background: ${props => props.theme.surfaceHover};
    color: ${props => props.theme.primary};
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  ${props => props.$primary && css`
    background: ${props => props.theme.gradient};
    color: white;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px ${props => props.theme.primary}40;
    }
  `}
`;

// Emoji Picker Container
const EmojiPickerContainer = styled.div`
  position: absolute;
  bottom: 60px;
  right: 10px;
  z-index: 1000;
`;

// Ticket Form Container
const TicketFormContainer = styled(motion.div)`
  position: absolute;
  bottom: 60px;
  right: 10px;
  width: 350px;
  background: ${props => props.theme.background};
  border-radius: 15px;
  box-shadow: 0 20px 60px ${props => props.theme.shadow};
  border: 1px solid ${props => props.theme.border};
  z-index: 1000;
  overflow: hidden;
`;

const TicketFormHeader = styled.div`
  background: ${props => props.theme.gradient};
  padding: 15px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TicketFormTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TicketFormBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.text};
`;

const FormInput = styled.input`
  padding: 10px;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  color: ${props => props.theme.text};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const FormTextArea = styled.textarea`
  padding: 10px;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  color: ${props => props.theme.text};
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const FormSelect = styled.select`
  padding: 10px;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  color: ${props => props.theme.text};
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
  
  option {
    background: ${props => props.theme.surface};
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const FormButton = styled(motion.button)`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  
  ${props => props.$primary ? css`
    background: ${props => props.theme.gradient};
    color: white;
  ` : css`
    background: ${props => props.theme.surface};
    color: ${props => props.theme.textSecondary};
    border: 1px solid ${props => props.theme.border};
  `}
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Quick Action Buttons
const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 15px;
  background: ${props => props.theme.surface};
  border-top: 1px solid ${props => props.theme.border};
  justify-content: center;
`;

const QuickActionButton = styled(motion.button)`
  padding: 8px 12px;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  color: ${props => props.theme.textSecondary};
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.theme.primary};
    color: white;
    border-color: ${props => props.theme.primary};
  }
`;

// Component
const EnhancedChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [userId, setUserId] = useState('');
  const [takenOver, setTakenOver] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isButtonExpanded, setIsButtonExpanded] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const takenOverRef = useRef(false);
  const maintenanceRef = useRef(false);
  
  const currentTheme = themes[theme];

  // Translations
  const translations = {
    en: {
      title: 'Vintra AI Assistant',
      status: 'Online',
      placeholder: 'Type your message...',
      welcome: "👋 Hello! I'm your AI assistant. How can I help you today?",
      error: 'Sorry, something went wrong. Please try again.',
    },
    no: {
      title: 'Vintra AI Assistent',
      status: 'Pålogget',
      placeholder: 'Skriv din melding...',
      welcome: '👋 Hei! Jeg er din AI-assistent. Hvordan kan jeg hjelpe deg i dag?',
      error: 'Beklager, noe gikk galt. Vennligst prøv igjen.',
    }
  };

  const t = translations[language];
  
  // Initialize
  useEffect(() => {
    // Generate or retrieve user ID
    let id = localStorage.getItem('enhancedChatUserId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('enhancedChatUserId', id);
    }
    setUserId(id);
    
    // Load preferences
    const savedTheme = localStorage.getItem('chatTheme') || 'dark';
    const savedLanguage = localStorage.getItem('chatLanguage') || 'en';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
  }, []);

  // Persist chat across refresh: subscribe to messages and chat doc
  useEffect(() => {
    if (!userId) return;

    // Ensure chat doc exists
    const chatRef = doc(db, 'chats', userId);
    setDoc(chatRef, { createdAt: serverTimestamp() }, { merge: true }).catch(() => {});

    // Subscribe to takeover/maintenance state
    const unsubChat = onSnapshot(chatRef, (snap) => {
      const data = snap.data() || {};
      setTakenOver(!!data.takenOver);
      takenOverRef.current = !!data.takenOver;
      maintenanceRef.current = !!data.maintenance;
      setMaintenance(!!data.maintenance);
      setExpectedWait(typeof data.expectedWait === 'number' ? data.expectedWait : null);
      setAdminTyping(!!data.adminTyping);
    });

    // Subscribe to messages
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
    });

    return () => {
      unsubChat();
      unsubMsgs();
    };
  }, [userId]);

  const [maintenance, setMaintenance] = useState(false);
  const [expectedWait, setExpectedWait] = useState(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Expand button on hover
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setIsButtonExpanded(true);
        setTimeout(() => setIsButtonExpanded(false), 3000);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Toggle chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowEmoji(false);
  };

  // Handle emoji select
  const handleEmojiClick = (emojiObject) => {
    setInput(prev => prev + emojiObject.emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  // Compute estimated wait time (minutes) from historical response times
  const estimateWaitMinutes = async () => {
    try {
      const snap = await getDocs(collectionGroup(db, 'messages'));
      // Aggregate response time deltas (user -> next admin)
      const byUser = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const pathParts = d.ref.path.split('/'); // chats/{userId}/messages/{messageId}
        const uid = data.userId || (pathParts[0] === 'chats' ? pathParts[1] : null);
        if (!uid || !data.timestamp) return;
        let ts;
        try {
          ts = data.timestamp?.toDate?.() || new Date(data.timestamp?.seconds * 1000);
        } catch { ts = null; }
        if (!ts || isNaN(ts.getTime())) return;
        (byUser[uid] ||= []).push({ sender: data.sender, t: ts });
      });

      const deltas = [];
      Object.values(byUser).forEach((arr) => {
        arr.sort((a, b) => a.t - b.t);
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].sender === 'user') {
            // find first subsequent admin reply
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
      // Use median to resist outliers
      deltas.sort((a, b) => a - b);
      const mid = Math.floor(deltas.length / 2);
      const median = deltas.length % 2 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) / 2;
      return Math.max(1, Math.round(median));
    } catch (e) {
      return 15;
    }
  };

  // Send message
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !userId) return;
    if (maintenanceRef.current && !takenOverRef.current) {
      // In maintenance mode (no human takeover yet), do not allow sending
      return;
    }

    setInput('');
    setIsTyping(true);

    try {
      // Save user message to Firestore
      await addDoc(collection(db, 'chats', userId, 'messages'), {
        text,
        sender: 'user',
        timestamp: serverTimestamp(),
      });
      // Update chat doc lastUpdated
      try { await updateDoc(doc(db, 'chats', userId), { lastUpdated: serverTimestamp() }); } catch {}

      // If this is the first message of the chat and we're in maintenance mode, show maintenance message
      if ((messages?.length || 0) === 0 && maintenanceRef.current) {
        const eta = await estimateWaitMinutes();
        try {
          await addDoc(collection(db, 'chats', userId, 'messages'), {
            text: `⚠️ Our bot is currently under construction. A support advisor will contact you shortly. Estimated wait time: ${eta} minutes.`,
            sender: 'bot',
            timestamp: serverTimestamp(),
          });
        } catch {}
        try {
          await setDoc(doc(db, 'chats', userId), {
            maintenance: true,
            expectedWait: eta,
            lastUpdated: serverTimestamp()
          }, { merge: true });
        } catch {}
        setIsTyping(false);
        return; // Do not schedule AI reply
      }

      // If a human agent has taken over, do not send bot reply
      if (takenOverRef.current) {
        setIsTyping(false);
        return;
      }

      // Use AI service for response instead of simple generateResponse
      setTimeout(async () => {
        if (takenOverRef.current || maintenanceRef.current) {
          setIsTyping(false);
          return;
        }

        try {
          const reply = await generateAIResponse(text, userId);
          try {
            await addDoc(collection(db, 'chats', userId, 'messages'), {
              text: reply,
              sender: 'bot',
              timestamp: serverTimestamp(),
            });
          } catch {}
        } catch (error) {
          console.error('Error generating AI response:', error);
          // Fallback to simple response if AI fails
          const fallbackReply = generateResponse(text);
          try {
            await addDoc(collection(db, 'chats', userId, 'messages'), {
              text: fallbackReply,
              sender: 'bot',
              timestamp: serverTimestamp(),
            });
          } catch {}
        }
        setIsTyping(false);
      }, 1200);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      // Optional: show a transient error bubble locally
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        text: t.error,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  };

  // Generate response (placeholder - now using AI service)
  const generateResponse = (message) => {
    const msg = message.toLowerCase();

    if (msg.includes('hello') || msg.includes('hi')) {
      return "Hello! How can I assist you today?";
    }
    if (msg.includes('vintra') || msg.includes('vote')) {
      return "I can help you with information about VintraStudio and our game VOTE! What would you like to know?";
    }
    if (msg.includes('help')) {
      return "I'm here to help! You can ask me about our services, the VOTE game, or any other questions you might have. If you need more detailed assistance, I can help you create a support ticket.";
    }
    if (msg.includes('ticket') || msg.includes('support') || msg.includes('issue') || msg.includes('problem')) {
      return "It sounds like you might need additional support! Would you like me to help you create a support ticket? Click the ticket button below to get started.";
    }

    return "That's interesting! Let me help you with that. Could you provide more details?";
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Cycle theme
  const cycleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const newTheme = themeKeys[nextIndex];
    setTheme(newTheme);
    localStorage.setItem('chatTheme', newTheme);
  };

  // Handle ticket creation
  const handleCreateTicket = async () => {
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
      
      // Add confirmation message to chat
      const confirmationMessage = {
        id: Date.now(),
        text: `✅ Support ticket "${ticketData.title}" has been created successfully! Our team will respond soon.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      
      // Reset form
      setTicketData({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });
      setShowTicketForm(false);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      const errorMessage = {
        id: Date.now(),
        text: '❌ Sorry, there was an error creating your ticket. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle quick ticket creation
  const handleQuickTicket = (type) => {
    const quickTickets = {
      bug: { title: 'Bug Report', category: 'bug', priority: 'high' },
      feature: { title: 'Feature Request', category: 'feature', priority: 'medium' },
      support: { title: 'General Support', category: 'general', priority: 'medium' }
    };
    
    setTicketData(prev => ({ ...prev, ...quickTickets[type] }));
    setShowTicketForm(true);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalChatStyles />
      <ChatContainer>
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
                  <Avatar>
                    {takenOver ? <FiUser /> : <BsRobot />}
                  </Avatar>
                  <HeaderInfo>
                    <HeaderTitle>{t.title}</HeaderTitle>
                    <HeaderStatus>
                      {takenOver
                        ? (language === 'no' ? 'Supportmedarbeider aktiv' : 'Support Agent Active')
                        : (maintenance
                            ? (language === 'no' ? `Vedlikehold pågår${expectedWait ? ` • Forventet ventetid ${expectedWait} min` : ''}`
                              : `Under Maintenance${expectedWait ? ` • ETA ${expectedWait} min` : ''}`)
                            : t.status)}
                    </HeaderStatus>
                  </HeaderInfo>
                </HeaderLeft>
                <HeaderActions>
                  <HeaderButton onClick={cycleTheme}>
                    {theme === 'light' ? <FiMoon /> : theme === 'dark' ? <FiZap /> : <FiSun />}
                  </HeaderButton>
                  <HeaderButton onClick={() => setLanguage(language === 'en' ? 'no' : 'en')}>
                    <BsTranslate />
                  </HeaderButton>
                  <HeaderButton onClick={toggleChat}>
                    <FiX />
                  </HeaderButton>
                </HeaderActions>
              </Header>

              <MessagesContainer>
                {messages.map((message) => (
                  <MessageWrapper
                    key={message.id}
                    $isUser={message.sender === 'user'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageAvatar $isUser={message.sender === 'user'}>
                      {message.sender === 'user' ? '👤' : (message.sender === 'admin' ? '👨‍💼' : '🤖')}
                    </MessageAvatar>
                    <MessageContent>
                      <MessageBubble $isUser={message.sender === 'user'}>
                        {message.text}
                      </MessageBubble>
                      <MessageTime $isUser={message.sender === 'user'}>
                        {formatTime(message.timestamp)}
                      </MessageTime>
                    </MessageContent>
                  </MessageWrapper>
                ))}
                
                {isTyping && (
                  <MessageWrapper $isUser={false}>
                    <MessageAvatar $isUser={false}>🤖</MessageAvatar>
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

              <QuickActions>
                <QuickActionButton
                  onClick={() => window.dispatchEvent(new CustomEvent('openTickets', { detail: { tab: 'create', formData: { title: 'Bug Report', category: 'bug', priority: 'high' } } }))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiAlertCircle /> Report Bug
                </QuickActionButton>
                <QuickActionButton
                  onClick={() => window.dispatchEvent(new CustomEvent('openTickets', { detail: { tab: 'create', formData: { title: 'Options / Settings', category: 'options', priority: 'medium' } } }))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoSparkles /> Options
                </QuickActionButton>
                <QuickActionButton
                  onClick={() => window.dispatchEvent(new CustomEvent('openTickets', { detail: { tab: 'create', formData: { title: 'General Support', category: 'general', priority: 'medium' } } }))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiLifeBuoy /> Get Support
                </QuickActionButton>
                <QuickActionButton
                  onClick={() => window.dispatchEvent(new CustomEvent('openTickets', { detail: { tab: 'tickets' } }))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BsTicketPerforated /> View Tickets
                </QuickActionButton>
              </QuickActions>

              <InputContainer onSubmit={handleSubmit}>
                <InputWrapper>
                  <Input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={(maintenance && !takenOver) ? (language === 'no' ? `Vedlikehold – vennligst vent${expectedWait ? ` ~${expectedWait} min` : ''}` : `Under maintenance – please wait${expectedWait ? ` ~${expectedWait} min` : ''}`) : t.placeholder}
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
                    <IconButton
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('openTickets', { detail: { tab: 'create' } }))}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <BsTicketPerforated />
                    </IconButton>
                    <IconButton
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiPaperclip />
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

              {showTicketForm && (
                <TicketFormContainer
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <TicketFormHeader>
                    <TicketFormTitle>
                      <BsTicketPerforated /> Create Support Ticket
                    </TicketFormTitle>
                    <HeaderButton onClick={() => setShowTicketForm(false)}>
                      <FiX />
                    </HeaderButton>
                  </TicketFormHeader>
                  
                  <TicketFormBody>
                    <FormGroup>
                      <FormLabel>Title</FormLabel>
                      <FormInput
                        type="text"
                        placeholder="Brief description of your issue"
                        value={ticketData.title}
                        onChange={(e) => setTicketData(prev => ({ ...prev, title: e.target.value }))}
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
                      />
                    </FormGroup>
                    
                    <FormActions>
                      <FormButton
                        type="button"
                        onClick={() => setShowTicketForm(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </FormButton>
                      <FormButton
                        type="button"
                        $primary
                        onClick={handleCreateTicket}
                        disabled={!ticketData.title || !ticketData.description}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <BsTicketPerforated /> Create Ticket
                      </FormButton>
                    </FormActions>
                  </TicketFormBody>
                </TicketFormContainer>
              )}
            </ChatWindow>
          )}
        </AnimatePresence>

        {/* Ticket System Integration */}
        <TicketSystem showButton={false} />

        <FloatingButton
          onClick={toggleChat}
          $isExpanded={isButtonExpanded}
          $hasNotification={hasNotification}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ButtonContent $isExpanded={isButtonExpanded}>
            {isButtonExpanded ? (
              takenOver ? (
                <>
                  <FiUser /> Live Support
                </>
              ) : (
                <>
                  <IoSparkles /> Chat with AI
                </>
              )
            ) : (
              takenOver ? <FiUser /> : <BsChatDots />
            )}
          </ButtonContent>
        </FloatingButton>
      </ChatContainer>
    </ThemeProvider>
  );
};

export default EnhancedChatBot;
