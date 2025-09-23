import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  where,
  doc,
  setDoc,
  deleteDoc 
} from '../firebase';

// Styled Components
const Container = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 50;
`;

const Bubble = styled.div`
  position: relative;
  background: #fff;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: pulse 2s infinite;
  z-index: 51;
  font-size: 1.5rem;

  ${props => props.isTyping && `
    animation: waves 1.5s infinite;
  `}

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
  }

  @keyframes waves {
    0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.7); }
    50% { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
    100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
  }
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  margin-bottom: 4rem;
  width: 20rem;
  height: 32.5rem;
  background: #0a0a0a;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  display: ${props => props.open ? 'flex' : 'none'};
  flex-direction: column;
  z-index: 60;
`;

const Header = styled.div`
  padding: 1rem;
  background: rgba(0,0,0,0.3);
  border-bottom: 1px solid #374151;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
`;

const HeaderTitle = styled.h3`
  color: #fff;
  font-weight: 600;
  margin: 0;
`;

const MessagesContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const Messages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #fff;
  scrollbar-width: thin;
  scrollbar-color: #374151 transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #374151;
    border-radius: 3px;
  }
`;

const MessageRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const Avatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: avatarEnter 0.4s ease-out forwards;
  font-size: 1.2rem;

  @keyframes avatarEnter {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const MessageBubble = styled.div`
  padding: 0.5rem;
  border-radius: 0.75rem;
  max-width: 16rem;
  background: ${props => props.isUser ? '#fff' : '#1f2937'};
  color: ${props => props.isUser ? '#000' : '#fff'};
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
`;

const Dot = styled.span`
  width: 0.3rem;
  height: 0.3rem;
  background-color: #6b7280;
  border-radius: 50%;
  animation: dotPulse 1s infinite;
  margin: 0 0.1rem;

  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dotPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.5); }
    50% { opacity: 1; transform: scale(1); }
  }
`;

const Form = styled.form`
  padding: 0.5rem;
  background: rgba(0,0,0,0.2);
  border-top: 1px solid #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
`;

const Input = styled.input`
  flex: 1;
  max-width: 14rem;
  background: #111827;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  color: #fff;
  outline: none;
  font-size: 0.875rem;
  border: none;
  transition: box-shadow 0.2s ease;

  &:focus {
    box-shadow: 0 0 0 2px #4a6fc3;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Button = styled.button`
  background: #4a6fc3;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s ease;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    width: 1rem;
    height: 1rem;
    stroke: white;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0a0a0a;
  z-index: 10;
  display: ${props => props.visible ? 'flex' : 'none'};
  flex-direction: column;
  color: #eee;
`;

const OverlayHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
`;

const OverlayClose = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
`;

const OverlayTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #555;

  button {
    flex: 1;
    background: none;
    border: none;
    padding: 0.75rem;
    color: #aaa;
    cursor: pointer;

    &.active {
      color: white;
      border-bottom: 2px solid #4a6fc3;
    }
  }
`;

const OverlayContent = styled.div`
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
`;

const SettingRow = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 4px;
    border: 2px solid #aaa;
    background: #0a0a0a;
    color: rgb(255, 255, 255);
  }
`;

// Translations
const translations = {
  no: {
    placeholder: 'Skriv melding…',
    initialMessage: 'Hei! Jeg er Vintra sin AI-assistent. Hva kan jeg hjelpe deg med? PS: Du kan endre språk i innstillinger (...).',
    errorMessage: 'Noe gikk galt…',
    sendButton: 'Send',
    settingsTab: 'Innstillinger',
    infoTab: 'Info',
    settingsLang: 'Språk',
    infoHeading: 'Om Vintra-boten',
    infoText: 'Her kan du stille spørsmål om våre tjenester…',
  },
  en: {
    placeholder: 'Type a message…',
    initialMessage: "Hello! I'm Vintra's AI assistant. How can I help you? PS: You can change the language in settings (...).",
    errorMessage: 'Something went wrong…',
    sendButton: 'Send',
    settingsTab: 'Settings',
    infoTab: 'Info',
    settingsLang: 'Language',
    infoHeading: 'About the Vintra Bot',
    infoText: 'Here you can ask about our services…',
  }
};

// Simple icons as text/emoji
const ICONS = {
  inactive: '😊',
  writing: '✍️',
  error: '❌',
  user: '👤',
  smile: '😄',
  tired: '😴',
  sleep: '💤'
};

const ChatBot = () => {
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [isBotTyping, setBotTyping] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayTab, setOverlayTab] = useState('settings');
  const [language, setLanguage] = useState('en');
  const [idleState, setIdleState] = useState('none');
  const scrollRef = useRef(null);
  const idleTimers = useRef([]);

  const t = translations[language];

  // Generate/restore userId once and create user profile in Firebase
  useEffect(() => {
    const initializeUser = async () => {
      let id = localStorage.getItem('chatUserId');
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('chatUserId', id);
      }
      setUserId(id);
      
      // Create user profile in Firebase if it doesn't exist
      try {
        // Also create a document in the chats collection to ensure it exists
        const chatDocRef = doc(db, 'chats', id);
        await setDoc(chatDocRef, {
          userId: id,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          status: 'online'
        }, { merge: true });
        
        console.log('ChatBot: User chat document created/updated for:', id);
      } catch (error) {
        console.error('ChatBot: Error creating user chat document:', error);
      }
    };
    
    initializeUser();
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  // Real-time message updates when chat is open
  useEffect(() => {
    if (!open || !userId) return;

    const checkForNewMessages = async () => {
      try {
        const messagesRef = collection(db, 'chats', userId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(messagesQuery);
        
        const latestMessages = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          latestMessages.push({
            text: data.text,
            sender: data.sender,
            icon: data.sender === 'user' ? 'user' : (data.sender === 'admin' ? 'inactive' : 'inactive'),
            timestamp: data.timestamp?.toDate() || new Date()
          });
        });

        // Only update if there are new messages
        if (latestMessages.length !== messages.length) {
          console.log('ChatBot: New messages detected, updating...');
          setMessages(latestMessages);
        }
      } catch (error) {
        console.error('ChatBot: Error checking for new messages:', error);
      }
    };

    // Check for new messages every 2 seconds when chat is open
    const interval = setInterval(checkForNewMessages, 2000);
    return () => clearInterval(interval);
  }, [open, userId, messages.length]);

  // Idle state management
  const resetIdleTimers = () => {
    idleTimers.current.forEach(clearTimeout);
    idleTimers.current = [];
    setIdleState('none');
    idleTimers.current.push(
      setTimeout(() => setIdleState('smile'), 25000),
      setTimeout(() => setIdleState('none'), 27000),
      setTimeout(() => setIdleState('tired'), 40000),
      setTimeout(() => setIdleState('sleep'), 42000)
    );
  };

  useEffect(() => {
    resetIdleTimers();
  }, [messages.length, isBotTyping]);

  useEffect(() => {
    return () => idleTimers.current.forEach(clearTimeout);
  }, []);

  const addMessage = (msg) => setMessages(prev => [...prev, msg]);

  const clearChat = async () => {
    if (window.confirm('Are you sure you want to delete this entire chat? This cannot be undone.')) {
      try {
        console.log('Clearing chat for user:', userId);
        
        // Clear local messages
        setMessages([]);
        
        // Delete all messages from Firebase
        const messagesRef = collection(db, 'chats', userId, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        
        const deletePromises = messagesSnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );
        
        await Promise.all(deletePromises);
        
        // Generate new user ID to start fresh
        const newId = crypto.randomUUID();
        localStorage.setItem('chatUserId', newId);
        setUserId(newId);
        
        console.log('Chat cleared successfully. New user ID:', newId);
        
        // Show welcome message for new chat
        setTimeout(() => {
          addMessage({
            text: t.initialMessage,
            sender: 'bot',
            icon: 'inactive',
          });
        }, 500);
        
      } catch (error) {
        console.error('Error clearing chat:', error);
        alert('Error clearing chat. Please try again.');
      }
    }
  };

  const handleBubble = async () => {
    setOpen(v => !v);
    setOverlayVisible(false);
    
    // Load existing messages when opening chat
    if (!open && userId) {
      try {
        const messagesRef = collection(db, 'chats', userId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(messagesQuery);
        
        const existingMessages = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          existingMessages.push({
            text: data.text,
            sender: data.sender,
            icon: data.sender === 'user' ? 'user' : 'inactive',
            timestamp: data.timestamp?.toDate() || new Date()
          });
        });
        
        if (existingMessages.length > 0) {
          setMessages(existingMessages);
        } else {
          // Only show welcome message if no existing messages
          addMessage({
            text: t.initialMessage,
            sender: 'bot',
            icon: 'inactive',
          });
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Show welcome message on error
        addMessage({
          text: t.initialMessage,
          sender: 'bot',
          icon: 'inactive',
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOverlayVisible(false);
    const txt = input.trim();
    if (!txt || !userId) return;

    const userMessage = { 
      text: txt, 
      sender: 'user', 
      icon: 'user',
      timestamp: new Date(),
      userId: userId
    };

    addMessage(userMessage);
    setInput('');
    setBotTyping(true);

    try {
      console.log('Saving user message to Firebase...', { userId, text: txt });
      
      // Save user message to Firebase
      const userMessageRef = await addDoc(collection(db, 'chats', userId, 'messages'), {
        sender: 'user',
        text: txt,
        timestamp: serverTimestamp(),
        userId: userId,
        country: 'unknown', // You can get this from IP geolocation if needed
        language: language,
        read: false // Mark as unread for admin
      });
      
      console.log('User message saved successfully:', userMessageRef.id);

      // Simulate AI response (replace with actual OpenAI call)
      setTimeout(async () => {
        const aiResponse = generateAIResponse(txt);
        
        const botMessage = {
          text: aiResponse,
          sender: 'bot',
          icon: 'inactive',
          timestamp: new Date(),
          userId: userId
        };

        setBotTyping(false);
        addMessage(botMessage);

        // Save bot response to Firebase
        console.log('Saving bot response to Firebase...', { userId, text: aiResponse });
        
        const botMessageRef = await addDoc(collection(db, 'chats', userId, 'messages'), {
          sender: 'bot',
          text: aiResponse,
          timestamp: serverTimestamp(),
          userId: userId,
          language: language,
          read: true // Bot messages are automatically read
        });
        
        console.log('Bot message saved successfully:', botMessageRef.id);

      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setTimeout(() => {
        setBotTyping(false);
        addMessage({
          text: t.errorMessage,
          sender: 'bot',
          icon: 'error',
        });
      }, 1500);
    }
  };

  // Simple AI response generator (replace with OpenAI)
  const generateAIResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('vintra') || msg.includes('vote')) {
      return "I can help you with information about VintraStudio and our game VOTE! VOTE is a story-driven open world game inspired by Nordic nature and culture. What would you like to know?";
    }
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hei')) {
      return "Hello! I'm Vintra's AI assistant. How can I help you today?";
    }
    
    if (msg.includes('help')) {
      return "I can help you with questions about VintraStudio, our game VOTE, and our services. What specific information are you looking for?";
    }
    
    return "I can only answer questions about VintraStudio and the game VOTE. Please check our FAQ for more information: https://vintra.no/faq";
  };

  const lastBotIndex = messages
    .map((m, i) => (m.sender === 'bot' ? i : -1))
    .filter(i => i >= 0)
    .pop() ?? -1;

  const isUserTyping = input.trim().length > 0;

  return (
    <Container>
      <Bubble isTyping={isBotTyping} onClick={handleBubble}>
        💬
      </Bubble>

      <ChatWindow open={open}>
        <Header>
          <HeaderTitle>Vintra AI</HeaderTitle>
        </Header>

        <MessagesContainer>
          {overlayVisible && (
            <Overlay visible={overlayVisible}>
              <OverlayHeader>
                <OverlayClose onClick={() => setOverlayVisible(false)}>
                  ✕
                </OverlayClose>
              </OverlayHeader>
              <OverlayTabs>
                <button
                  className={overlayTab === 'settings' ? 'active' : ''}
                  onClick={() => setOverlayTab('settings')}
                >
                  {t.settingsTab}
                </button>
                <button
                  className={overlayTab === 'info' ? 'active' : ''}
                  onClick={() => setOverlayTab('info')}
                >
                  {t.infoTab}
                </button>
              </OverlayTabs>
              <OverlayContent>
                {overlayTab === 'settings' ? (
                  <SettingRow>
                    <label>{t.settingsLang}</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="no">Norsk</option>
                      <option value="en">English</option>
                      <option value="sv">Svenska</option>
                      <option value="da">Dansk</option>
                      <option value="fi">Suomi</option>
                      <option value="de">Deutsch</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                    </select>
                  </SettingRow>
                ) : (
                  <>
                    <h5>{t.infoHeading}</h5>
                    <p>{t.infoText}</p>
                  </>
                )}
              </OverlayContent>
            </Overlay>
          )}

          <Messages ref={scrollRef}>
            {messages.map((m, i) => {
              const isLastBot = i === lastBotIndex;
              const showAvatar = m.sender === 'bot' && isLastBot && !isBotTyping;

              const avatarIcon = isUserTyping
                ? ICONS.user
                : idleState !== 'none' && messages.length > 0 && isLastBot
                ? ICONS[idleState]
                : ICONS[m.icon];

              return (
                <MessageRow key={i} isUser={m.sender === 'user'}>
                  {showAvatar && <Avatar>{avatarIcon}</Avatar>}
                  <MessageBubble isUser={m.sender === 'user'}>
                    {m.text}
                  </MessageBubble>
                </MessageRow>
              );
            })}

            {isBotTyping && (
              <MessageRow isUser={false}>
                <Avatar>✍️</Avatar>
                <MessageBubble isUser={false}>
                  <TypingIndicator>
                    <Dot />
                    <Dot />
                    <Dot />
                  </TypingIndicator>
                </MessageBubble>
              </MessageRow>
            )}
          </Messages>
        </MessagesContainer>

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            autoComplete="off"
          />
          <Button type="submit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </Button>
          <Button
            type="button"
            onClick={() => {
              setOverlayVisible(v => !v);
              setOverlayTab('settings');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <Button
            type="button"
            onClick={clearChat}
            style={{ background: '#ff6b6b' }}
            title="Clear Chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" xmlns="http://www.w3.org/2000/svg">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </Button>
        </Form>
      </ChatWindow>
    </Container>
  );
};

export default ChatBot;
