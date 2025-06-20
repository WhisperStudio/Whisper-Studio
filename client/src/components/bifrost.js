// ✅ Fullstendig og fikset Bifrost.js med fungerende sendeknapp og admin-integrasjon
import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';
import api from '../utils/api';

const BUTTON_IMAGE = 'https://i.ibb.co/yFxWgc0s/AJxt1-KNy-Zw-Rvqjji1-Teum-EKW2-C4qw-Tpl-RTJVy-M5s-Zx-VCwbq-Ogpyhnpz-T44-QB9-RF51-XVUc1-Ci-Pf8-N0-Bp.png';

const colors = {
  backgroundDark: '#0b1121',
  panelDark: '#152238',
  textLight: '#E0E0E0',
  userBubble: '#1E40AF',
  botBubble: '#1E293B',
  adminBubble: '#8B008B',
  white: '#FFFFFF',
  buttonBorder: '#1c2e4e',
  buttonBg: '#1A1F2E',
  buttonHover: '#2C354F',
  error: '#D32F2F',
  success: '#4CAF50',
};

const GlobalStyle = createGlobalStyle`
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px rgb(11, 9, 29) inset !important;
      -webkit-text-fill-color: #E0E0E0 !important;
      transition: background-color 5000s ease-in-out 0s;
  }
`;

const popUp = keyframes`
  0% { transform: translateY(50%) scale(0.3); opacity: 0; }
  70% { transform: translateY(-10px) scale(1.05); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
`;

const dotPulse = keyframes`
  0% { opacity: 0.2; }
  20% { opacity: 1; }
  100% { opacity: 0.2; }
`;

const FloatingButtonWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1100;
`;

const FloatingButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  animation: ${popUp} 0.6s ease;
  &:hover { transform: scale(1.05); }
  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  }
`;

const ChatPanel = styled.div`
  position: fixed;
  bottom: 120px;
  right: 20px;
  width: 370px;
  height: 600px;
  background: ${colors.panelDark};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  z-index: 1200;
`;

const PanelHeader = styled.div`
  background: linear-gradient(135deg, #152238, #1c2e4e);
  padding: 15px;
  color: ${colors.textLight};
  font-weight: bold;
  text-align: center;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 20px;
  top: 15px;
  background: transparent;
  border: none;
  color: ${colors.textLight};
  cursor: pointer;
  font-size: 1.5rem;
`;

const PanelBody = styled.div`
  flex: 1;
  padding: 15px;
  background: ${colors.backgroundDark};
  display: flex;
  flex-direction: column;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MessageBubble = styled.div`
  align-self: ${props => props.sender === 'user' ? 'flex-end' : 'flex-start'};
  background: ${props => props.sender === 'bot' ? colors.botBubble : props.sender === 'admin' ? colors.adminBubble : colors.userBubble};
  color: ${colors.white};
  padding: 10px 14px;
  border-radius: 16px;
  max-width: 85%;
  font-size: 0.95rem;
`;

const TypingIndicator = styled.div`
  font-style: italic;
  color: ${colors.textLight};
  display: flex;
  gap: 4px;
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  background: ${colors.textLight};
  border-radius: 50%;
  animation: ${dotPulse} 1.4s infinite both;
`;

const InputRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const InputField = styled.input`
  flex: 1;
  padding: 10px;
  border: 2px solid ${colors.buttonBorder};
  border-radius: 8px;
  background: ${colors.backgroundDark};
  color: ${colors.textLight};
`;

const SendButton = styled.button`
  background: ${colors.buttonBg};
  color: ${colors.white};
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
`;

const Bifrost = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [adminTyping, setAdminTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    const fetchChat = async () => {
      if (!conversationId) return;
      try {
        const res = await api.get(`/conversations/${conversationId}`);
        if (Array.isArray(res.data?.messages)) {
          setChatMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    const interval = setInterval(fetchChat, 5000);
    fetchChat();
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const onlineRes = await api.get('/admin/availability');
        setAdminOnline(!!onlineRes.data?.adminAvailable);
        const typingRes = await api.get('/admin/typing');
        setAdminTyping(!!typingRes.data?.adminTyping);
      } catch (err) {
        console.error('Admin status fetch failed:', err);
      }
    };
    if (isOpen) {
      checkStatus();
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const startConversation = async () => {
    try {
      const res = await api.post('/chat/start', {
        name: 'Guest',
        email: 'guest@example.com',
        category: 'General',
        message: 'Hello!',
      });
      if (res.data?.conversationId) {
        setConversationId(res.data.conversationId);
        setChatMessages([{ sender: 'bot', text: 'Welcome to support!' }]);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;
    const msg = { sender: 'user', text: inputMessage };
    setChatMessages(prev => [...prev, msg]);
    setInputMessage('');
    try {
      await api.post('/chat/message', {
        conversationId,
        message: inputMessage,
      });
    } catch (err) {
      console.error('Message send error:', err);
    }
  };

  return (
    <>
      <GlobalStyle />
      <FloatingButtonWrapper>
        <FloatingButton onClick={() => {
          if (!isOpen) startConversation();
          setIsOpen(prev => !prev);
        }}>
          <img src={BUTTON_IMAGE} alt="Chat" />
        </FloatingButton>
      </FloatingButtonWrapper>

      {isOpen && (
        <ChatPanel>
          <PanelHeader>
            Chat with us {adminOnline ? '(Admin online)' : '(Bot only)'}
            <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
          </PanelHeader>

          <PanelBody>
            <MessagesContainer>
              {chatMessages.map((m, i) => (
                <MessageBubble key={i} sender={m.sender}>{m.text}</MessageBubble>
              ))}
              {adminTyping && (
                <TypingIndicator>
                  Admin is typing <Dot /><Dot /><Dot />
                </TypingIndicator>
              )}
              <div ref={endRef} />
            </MessagesContainer>
            <InputRow>
              <InputField
                type="text"
                placeholder="Your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <SendButton onClick={sendMessage}>Send</SendButton>
            </InputRow>
          </PanelBody>
        </ChatPanel>
      )}
    </>
  );
};

export default Bifrost;
