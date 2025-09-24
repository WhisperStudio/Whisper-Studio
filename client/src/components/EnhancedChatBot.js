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
  onSnapshot
} from '../firebase';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { FiSend, FiPaperclip, FiMic, FiSmile, FiSettings, FiX, FiMinimize2, FiMaximize2, FiMoreVertical, FiTrash2, FiVolume2, FiVolumeX, FiSun, FiMoon, FiZap, FiImage, FiFile, FiDownload, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { BsRobot, BsTranslate, BsChatDots, BsStars } from 'react-icons/bs';
import { IoSparkles } from 'react-icons/io5';

// Theme definitions
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

// Component
const EnhancedChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [userId, setUserId] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isButtonExpanded, setIsButtonExpanded] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
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
    
    if (!isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        id: Date.now(),
        text: t.welcome,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  };

  // Handle emoji select
  const handleEmojiClick = (emojiObject) => {
    setInput(prev => prev + emojiObject.emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  // Send message
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Save to Firebase
      await addDoc(collection(db, 'chats', userId, 'messages'), {
        ...userMessage,
        timestamp: serverTimestamp(),
      });

      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: generateResponse(text),
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        
        // Save bot response
        addDoc(collection(db, 'chats', userId, 'messages'), {
          ...botMessage,
          timestamp: serverTimestamp(),
        });
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: t.error,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  };

  // Generate response (placeholder - replace with OpenAI)
  const generateResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('hello') || msg.includes('hi')) {
      return "Hello! How can I assist you today?";
    }
    if (msg.includes('vintra') || msg.includes('vote')) {
      return "I can help you with information about VintraStudio and our game VOTE! What would you like to know?";
    }
    if (msg.includes('help')) {
      return "I'm here to help! You can ask me about our services, the VOTE game, or any other questions you might have.";
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
                    <BsRobot />
                  </Avatar>
                  <HeaderInfo>
                    <HeaderTitle>{t.title}</HeaderTitle>
                    <HeaderStatus>{t.status}</HeaderStatus>
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
                      {message.sender === 'user' ? '👤' : '🤖'}
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
                
                <div ref={messagesEndRef} />
              </MessagesContainer>

              <InputContainer onSubmit={handleSubmit}>
                <InputWrapper>
                  <Input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
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
            </ChatWindow>
          )}
        </AnimatePresence>

        <FloatingButton
          onClick={toggleChat}
          $isExpanded={isButtonExpanded}
          $hasNotification={hasNotification}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ButtonContent $isExpanded={isButtonExpanded}>
            {isButtonExpanded ? (
              <>
                <IoSparkles /> Chat with AI
              </>
            ) : (
              <BsChatDots />
            )}
          </ButtonContent>
        </FloatingButton>
      </ChatContainer>
    </ThemeProvider>
  );
};

export default EnhancedChatBot;
