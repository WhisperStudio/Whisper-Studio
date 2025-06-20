// src/components/Bifrost.js
import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import api from '../utils/api'; // Antar at du har en forhåndskonfigurert Axios-instans

const BUTTON_IMAGE = 'https://i.ibb.co/yFxWgc0s/AJxt1-KNy-Zw-Rvqjji1-Teum-EKW2-C4qw-Tpl-RTJVy-M5s-Zx-VCwbq-Ogpyhnpz-T44-QB9-RF51-XVUc1-Ci-Pf8-N0-Bp.png';

// --- Styling (uendret fra din original) ---
const colors = {
  backgroundDark: '#0b1121', panelDark: '#152238', textLight: '#E0E0E0',
  userBubble: '#1E40AF', botBubble: '#1E293B', adminBubble: '#8B008B',
  white: '#FFFFFF', buttonBorder: '#1c2e4e', buttonBg: '#1A1F2E',
  buttonHover: '#2C354F', error: '#D32F2F', success: '#4CAF50',
};
const GlobalStyle = createGlobalStyle` input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px rgb(11, 9, 29) inset !important; -webkit-text-fill-color: #E0E0E0 !important; transition: background-color 5000s ease-in-out 0s; }`;
const popUp = keyframes` 0% { transform: translateY(50%) scale(0.3); opacity: 0; } 70% { transform: translateY(-10px) scale(1.05); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; }`;
const dotPulse = keyframes` 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; }`;
const FloatingButtonWrapper = styled.div` position: fixed; bottom: 20px; right: 20px; z-index: 1100; `;
const FloatingButton = styled.button` background: transparent; border: none; padding: 0; cursor: pointer; animation: ${popUp} 0.6s ease; &:hover { transform: scale(1.05); } img { width: 80px; height: 80px; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }`;
const ChatPanel = styled.div` position: fixed; bottom: 120px; right: 20px; width: 370px; height: 600px; background: ${colors.panelDark}; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6); display: flex; flex-direction: column; z-index: 1200; `;
const PanelHeader = styled.div` background: linear-gradient(135deg, #152238, #1c2e4e); padding: 15px; color: ${colors.textLight}; font-weight: bold; text-align: center; position: relative; `;
const CloseButton = styled.button` position: absolute; right: 20px; top: 15px; background: transparent; border: none; color: ${colors.textLight}; cursor: pointer; font-size: 1.5rem; `;
const PanelBody = styled.div` flex: 1; padding: 15px; background: ${colors.backgroundDark}; display: flex; flex-direction: column; `;
const MessagesContainer = styled.div` flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; `;
const MessageBubble = styled.div` align-self: ${props => props.sender === 'user' ? 'flex-end' : 'flex-start'}; background: ${props => props.sender === 'bot' ? colors.botBubble : props.sender === 'admin' ? colors.adminBubble : colors.userBubble}; color: ${colors.white}; padding: 10px 14px; border-radius: 16px; max-width: 85%; font-size: 0.95rem; white-space: pre-wrap; word-wrap: break-word; `;
const TypingIndicator = styled.div` font-style: italic; color: ${colors.textLight}; display: flex; gap: 4px; `;
const Dot = styled.span` width: 6px; height: 6px; background: ${colors.textLight}; border-radius: 50%; animation: ${dotPulse} 1.4s infinite both; `;
const InputRow = styled.div` display: flex; gap: 10px; margin-top: 10px; `;
const InputField = styled.input` flex: 1; padding: 10px; border: 2px solid ${colors.buttonBorder}; border-radius: 8px; background: ${colors.backgroundDark}; color: ${colors.textLight}; `;
const SendButton = styled.button` background: ${colors.buttonBg}; color: ${colors.white}; border: none; border-radius: 8px; padding: 10px 16px; cursor: pointer; &:disabled { opacity: 0.5; cursor: not-allowed; } `;


const Bifrost = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketId, setTicketId] = useState(localStorage.getItem('bifrost_ticket_id'));
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Hent meldinger når en ticketId er satt
  useEffect(() => {
    if (!ticketId || !isOpen) return;

    const fetchTicket = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/api/tickets/${ticketId}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Could not fetch ticket:', err);
        // Hvis ticket ikke finnes (f.eks. slettet), nullstill den
        localStorage.removeItem('bifrost_ticket_id');
        setTicketId(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTicket(); // Hent med en gang
    const interval = setInterval(fetchTicket, 5000); // Sjekk for nye meldinger hvert 5. sekund

    return () => clearInterval(interval);
  }, [ticketId, isOpen]);
  
  const handleOpenChat = async () => {
    if (!isOpen) {
        if (ticketId) {
            // Hvis vi allerede har en ID, bare åpne panelet.
            // useEffect vil hente meldingene.
            setIsOpen(true);
        } else {
            // Hvis ingen ID, start en ny ticket
            await startNewTicket();
        }
    }
    setIsOpen(!isOpen);
  };

  const startNewTicket = async () => {
    setIsLoading(true);
    try {
      const initialMessage = 'Hei, jeg har et spørsmål.';
      const res = await api.post('/api/tickets', {
        subject: 'Ny henvendelse fra chat',
        message: initialMessage,
      });

      if (res.data?._id) {
        const newTicketId = res.data._id;
        setTicketId(newTicketId);
        localStorage.setItem('bifrost_ticket_id', newTicketId);
        setMessages(res.data.messages || []);
        setIsOpen(true); // Åpne panelet etter at ticket er opprettet
      }
    } catch (err) {
      console.error('Could not start ticket:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !ticketId || isLoading) return;

    const optimisticMessage = { sender: 'user', text: inputMessage, _id: Date.now() };
    setMessages(prev => [...prev, optimisticMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Bruk det nye endepunktet for å sende melding
      await api.post(`/api/tickets/${ticketId}/message`, {
        message: inputMessage,
      });
      // Meldinger vil bli synkronisert ved neste polling-intervall
    } catch (err) {
      console.error('Message send error:', err);
      // Revert optimistic update on error
      setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <FloatingButtonWrapper>
        <FloatingButton onClick={handleOpenChat}>
          <img src={BUTTON_IMAGE} alt="Chat" />
        </FloatingButton>
      </FloatingButtonWrapper>

      {isOpen && (
        <ChatPanel>
          <PanelHeader>
            Support Chat
            <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
          </PanelHeader>

          <PanelBody>
            <MessagesContainer>
              {messages.map((m) => (
                <MessageBubble key={m._id || m.createdAt} sender={m.sender}>
                  {m.text}
                </MessageBubble>
              ))}
              {isLoading && messages.length === 0 && (
                 <TypingIndicator>Laster samtale...</TypingIndicator>
              )}
              <div ref={messagesEndRef} />
            </MessagesContainer>
            <InputRow>
              <InputField
                type="text"
                placeholder="Skriv meldingen din..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={!ticketId || isLoading}
              />
              <SendButton onClick={sendMessage} disabled={!ticketId || isLoading}>
                Send
              </SendButton>
            </InputRow>
          </PanelBody>
        </ChatPanel>
      )}
    </>
  );
};

export default Bifrost;
