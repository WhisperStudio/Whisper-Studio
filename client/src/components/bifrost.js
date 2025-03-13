// src/components/Bifrost.js
import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

const BUTTON_IMAGE = 'https://i.ibb.co/yFxWgc0s/AJxt1-KNy-Zw-Rvqjji1-Teum-EKW2-C4qw-Tpl-RTJVy-M5s-Zx-VCwbq-Ogpyhnpz-T44-QB9-RF51-XVUc1-Ci-Pf8-N0-Bp.png';

// Animations
const popUp = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  70% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const FloatingButtonWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FloatingButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:hover { transform: scale(1.1); }
  ${props =>
    !props.isOpen &&
    css` animation: ${pulse} 2s infinite; `}
  img {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

const ChatPanel = styled.div`
  position: fixed;
  bottom: 120px;
  right: 20px;
  width: 350px;
  max-width: 90%;
  background: #f0f4f8;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  animation: ${popUp} 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transform-origin: bottom right;
  z-index: 1200;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  background: #0055aa;
  padding: 15px 20px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
`;

const PanelBody = styled.div`
  padding: 10px;
  background: #e2e8f0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// Chat messages
const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
`;

const MessageBubble = styled.div`
  background: ${props => (props.sender === 'user' ? '#2563eb' : '#fff')};
  color: ${props => (props.sender === 'user' ? '#fff' : '#111')};
  align-self: ${props => (props.sender === 'user' ? 'flex-end' : 'flex-start')};
  padding: 8px 12px;
  border-radius: 16px;
  margin: 4px 0;
  max-width: 80%;
  box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const InputField = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #a0aec0;
  border-radius: 8px;
  font-size: 1rem;
  &:focus { border-color: #0055aa; outline: none; }
`;

const SendButton = styled.button`
  padding: 10px 16px;
  background-color: #0055aa;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover { background-color: #004488; }
`;

// Forhåndsregistreringsskjema
const FormField = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #a0aec0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  &:focus { border-color: #0055aa; outline: none; }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #a0aec0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  &:focus { border-color: #0055aa; outline: none; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #a0aec0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.2s ease;
  &:focus { border-color: #0055aa; outline: none; }
`;

const NextButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: rgb(0, 0, 0);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover { background-color: #004488; }
`;

const SubmitButton = styled(NextButton)``;

const Bifrost = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [preChatCompleted, setPreChatCompleted] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [ticket, setTicket] = useState({
    category: '',
    email: '',
    name: '',
    message: '',
    subCategory: ''
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Ved mount: sjekk localStorage etter conversationId og hent samtale fra server hvis den finnes
  useEffect(() => {
    const savedConvId = localStorage.getItem('conversationId');
    if (savedConvId) {
      fetch(`http://localhost:5000/api/conversations/${savedConvId}`)
        .then(res => {
          if (!res.ok) throw new Error('Could not fetch conversation');
          return res.json();
        })
        .then(data => {
          setConversationId(data.conversationId);
          const newMessages = data.messages.map(m => ({
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp
          }));
          setChatMessages(newMessages);
          setPreChatCompleted(true);
          setStep(2);
        })
        .catch(err => console.error(err));
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isOpen]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openPanel = () => setIsOpen(true);
  const closePanel = () => setIsOpen(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setTicket(prev => ({ ...prev, [name]: value }));
  };

  // Steg 1: Velg kategori (og sub-kategori hvis 'Games')
  const handleCategorySubmit = e => {
    e.preventDefault();
    if (ticket.category) setStep(2);
  };

  // Steg 2: Fyll inn e‑post, navn og initial melding, send til /api/chat
  const handlePreChatSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ticket.email,
          name: ticket.name,
          category: ticket.category,
          subCategory: ticket.subCategory,
          message: ticket.message
        })
      });
      if (!response.ok) throw new Error("Error communicating with ChatGPT");
      const data = await response.json();
      setConversationId(data.conversationId);
      localStorage.setItem('conversationId', data.conversationId);
      const userMsg = { sender: "user", text: ticket.message, timestamp: new Date() };
      const botMsg = { sender: "bot", text: data.reply, timestamp: new Date() };
      setChatMessages([userMsg, botMsg]);
      setPreChatCompleted(true);
    } catch (error) {
      console.error("Error in pre-chat submit:", error);
    }
  };

  // Send nye meldinger i live chat
  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    const userMsg = { sender: "user", text: inputMessage, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    const messageToSend = inputMessage;
    setInputMessage("");
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: messageToSend
        })
      });
      if (!response.ok) throw new Error("Error communicating with ChatGPT");
      const data = await response.json();
      const botMsg = { sender: "bot", text: data.reply, timestamp: new Date() };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg = { sender: "bot", text: "Beklager, noe gikk galt.", timestamp: new Date() };
      setChatMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleKeyPress = e => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <>
      <FloatingButtonWrapper>
        <FloatingButton onClick={isOpen ? closePanel : openPanel} isOpen={isOpen}>
          <img src={BUTTON_IMAGE} alt="Chat Icon" />
        </FloatingButton>
      </FloatingButtonWrapper>
      {isOpen && (
        <ChatPanel>
          <PanelHeader>
            {preChatCompleted ? "LIVE SUPPORT CHAT" : "FØR DU CHATTER"}
            <CloseButton onClick={closePanel}>×</CloseButton>
          </PanelHeader>
          <PanelBody>
            {!preChatCompleted ? (
              <>
                {step === 1 && (
                  <form onSubmit={handleCategorySubmit}>
                    <FormField>
                      <Label htmlFor="category">Velg kategori</Label>
                      <Select
                        id="category"
                        name="category"
                        value={ticket.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>-- Velg kategori --</option>
                        <option value="Games">Games</option>
                        <option value="General">General</option>
                        <option value="Work">Work</option>
                        <option value="Billing">Billing</option>
                        <option value="Support">Support</option>
                        <option value="Sales">Sales</option>
                        <option value="Other">Other</option>
                      </Select>
                    </FormField>
                    {ticket.category === 'Games' && (
                      <FormField>
                        <Label htmlFor="subCategory">Game Sub-Kategori</Label>
                        <Input
                          type="text"
                          id="subCategory"
                          name="subCategory"
                          placeholder="F.eks. 'Level 10 hjelp'"
                          value={ticket.subCategory}
                          onChange={handleChange}
                        />
                      </FormField>
                    )}
                    <NextButton type="submit">Neste</NextButton>
                  </form>
                )}
                {step === 2 && (
                  <form onSubmit={handlePreChatSubmit}>
                    <FormField>
                      <Label htmlFor="email">E-post</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={ticket.email}
                        onChange={handleChange}
                        required
                      />
                    </FormField>
                    <FormField>
                      <Label htmlFor="name">Navn</Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={ticket.name}
                        onChange={handleChange}
                        required
                      />
                    </FormField>
                    <FormField>
                      <Label htmlFor="message">Melding</Label>
                      <TextArea
                        id="message"
                        name="message"
                        rows="4"
                        value={ticket.message}
                        onChange={handleChange}
                        required
                      />
                    </FormField>
                    <SubmitButton type="submit">Start Chat</SubmitButton>
                  </form>
                )}
              </>
            ) : (
              <>
                <MessagesContainer>
                  {chatMessages.map((msg, index) => (
                    <MessageBubble key={index} sender={msg.sender}>
                      {msg.text}
                    </MessageBubble>
                  ))}
                  <div ref={messagesEndRef} />
                </MessagesContainer>
                <InputContainer>
                  <InputField
                    type="text"
                    placeholder="Skriv melding..."
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <SendButton onClick={handleSendMessage}>Send</SendButton>
                </InputContainer>
              </>
            )}
          </PanelBody>
        </ChatPanel>
      )}
    </>
  );
};

export default Bifrost;
