// ✅ Bifrost.js – full fungerende chatbot med ticket fallback
import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';
import api from '../utils/api';

// --- Konfigurasjon og visuelle elementer ---
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
  cursor: pointer;
  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.5);
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
  display: flex;
  flex-direction: column;
  animation: ${popUp} 0.6s ease forwards;
`;

const PanelHeader = styled.div`
  background: #1c2e4e;
  padding: 1rem;
  color: ${colors.white};
  font-weight: bold;
  text-align: center;
`;

const PanelBody = styled.div`
  background: ${colors.backgroundDark};
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow-y: auto;
`;

const MessageBubble = styled.div`
  align-self: ${props => props.sender === 'user' ? 'flex-end' : 'flex-start'};
  background: ${props => props.sender === 'user' ? colors.userBubble : props.sender === 'admin' ? colors.adminBubble : colors.botBubble};
  color: ${colors.white};
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 8px;
  max-width: 80%;
`;

const InputRow = styled.div`
  display: flex;
  padding: 0.5rem;
  background: ${colors.panelDark};
  gap: 0.5rem;
`;

const InputField = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid ${colors.buttonBorder};
  background-color: ${colors.backgroundDark};
  color: ${colors.textLight};
`;

const SendButton = styled.button`
  background: ${colors.buttonBg};
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

export default function Bifrost() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && conversationId) {
      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/conversations/${conversationId}`);
          setMessages(res.data.messages);
        } catch {}
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = async () => {
    try {
      const res = await api.post('/chat/start', {
        name: 'Guest',
        email: 'guest@example.com',
        category: 'General',
        message: 'Hello!'
      });
      setConversationId(res.data.conversationId);
      setMessages([{ sender: 'bot', text: 'Velkommen til support!' }]);
    } catch (err) {
      console.error('Kunne ikke starte chat:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    const msg = { sender: 'user', text: input };
    setMessages(prev => [...prev, msg]);
    setInput('');
    try {
      await api.post('/chat', {
        conversationId,
        message: msg.text,
        userWantsAdmin: false
      });
    } catch (err) {
      console.error('Feil ved sending:', err);
    }
  };

  return (
    <>
      <GlobalStyle />
      <FloatingButtonWrapper>
        <FloatingButton onClick={() => {
          if (!isOpen) startChat();
          setIsOpen(prev => !prev);
        }}>
          <img src={BUTTON_IMAGE} alt="Chat" />
        </FloatingButton>
      </FloatingButtonWrapper>

      {isOpen && (
        <ChatPanel>
          <PanelHeader>
            Chat med oss
          </PanelHeader>
          <PanelBody>
            {messages.map((m, i) => (
              <MessageBubble key={i} sender={m.sender}>{m.text}</MessageBubble>
            ))}
            <div ref={scrollRef} />
          </PanelBody>
          <InputRow>
            <InputField
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Skriv en melding..."
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <SendButton onClick={sendMessage}>Send</SendButton>
          </InputRow>
        </ChatPanel>
      )}
    </>
  );
}
