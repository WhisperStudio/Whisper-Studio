// src/components/Bifrost.js
import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';

// Bildeikon for knappen
const BUTTON_IMAGE = 'https://i.ibb.co/yFxWgc0s/AJxt1-KNy-Zw-Rvqjji1-Teum-EKW2-C4qw-Tpl-RTJVy-M5s-Zx-VCwbq-Ogpyhnpz-T44-QB9-RF51-XVUc1-Ci-Pf8-N0-Bp.png';

// Dark-blue theme (kan tilpasses)
const colors = {
  backgroundDark: '#0b1121',
  panelDark: '#152238',
  textLight: '#E0E0E0',
  userBubble: '#1E40AF', // Blå
  botBubble: '#1E293B',  // Mørkblå
  adminBubble: '#8B008B', // Lilla (admin)
  white: '#FFFFFF',
  buttonBorder: '#1c2e4e',
  buttonBg: '#1A1F2E',
  buttonHover: '#2C354F'
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

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Animations
const popUp = keyframes`
  0% {
    transform: translateY(50%) scale(0.3);
    opacity: 0;
  }
  70% {
    transform: translateY(-10px) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.07); }
  100% { transform: scale(1); }
`;

const spinGradient = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const dotPulse = keyframes`
  0% { opacity: 0.2; }
  20% { opacity: 1; }
  100% { opacity: 0.2; }
`;

// Styled Components
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
  position: relative;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
  ${props =>
    !props.isOpen &&
    css`
      animation: ${pulse} 2s infinite;
    `}
  &:hover {
    transform: scale(1.1);
  }
  &:hover::after {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      rgba(255,255,255,0.4),
      rgba(255,255,255,0) 40%,
      rgba(255,255,255,0.4) 80%,
      rgba(255,255,255,0)
    );
    animation: ${spinGradient} 1s linear infinite;
    z-index: 1;
    pointer-events: none;
  }
  img {
    position: relative;
    z-index: 2;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-shadow: 0px 4px 15px rgba(0,0,0,0.5);
  }
`;

const ChatPanel = styled.div`
  position: fixed;
  bottom: 120px;
  right: 20px;
  width: 350px;
  max-width: 90%;
  background: ${colors.panelDark};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
  animation: ${popUp} 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
  transform-origin: bottom right;
  z-index: 1200;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  background: linear-gradient(135deg, #152238, #1c2e4e);
  padding: 15px 20px;
  color: ${colors.textLight};
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  height: 60px;
`;

const GreetingText = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${colors.textLight};
`;

const CloseButton = styled.button`
  position: absolute;
  right: 20px;
  background: transparent;
  border: none;
  color: ${colors.textLight};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 30px;
  height: 30px;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.2);
  }
  &:active {
    transform: scale(0.9);
  }
  svg {
    width: 100%;
    height: 100%;
  }
`;

const BackButton = styled.button`
  position: absolute;
  left: 20px;
  background: transparent;
  border: none;
  color: ${colors.textLight};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 30px;
  height: 30px;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.2);
  }
  &:active {
    transform: scale(0.9);
  }
  svg {
    width: 100%;
    height: 100%;
  }
`;

const PanelBody = styled.div`
  padding: 10px;
  background: ${colors.backgroundDark};
  flex: 1;
  display: flex;
  flex-direction: column;
  color: ${colors.textLight};
`;

// Skjemaelementer for ticket-opprettelse
const FormField = styled.div`
  margin-bottom: 18px;
`;
const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${colors.textLight};
`;
const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.buttonBorder};
  background-color: rgb(11, 9, 29);
  color: ${colors.textLight};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  &:focus {
    border-color: ${colors.buttonHover};
    outline: none;
  }
`;
const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.buttonBorder};
  background-color: rgb(11, 9, 29);
  color: ${colors.textLight};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  &:focus {
    border-color: ${colors.buttonHover};
    outline: none;
  }
`;
const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.buttonBorder};
  background-color: rgb(11, 9, 29);
  color: ${colors.textLight};
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.2s ease;
  &:focus {
    border-color: ${colors.buttonHover};
    outline: none;
  }
`;

// Generelle knapper
const StyledButton = styled.button`
  border: 2px solid ${colors.buttonBorder};
  background-color: ${colors.buttonBg};
  color: ${colors.white};
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: ${colors.buttonHover};
  }
  width: 100%;
  margin-top: 10px;
`;

// Bifrost-komponenten
const Bifrost = () => {
  /**
   * Stegoversikt:
   * 0: Velg Chatbot / Admin / Ticket
   * 0.5: Fallback dersom admin ikke er tilgjengelig
   * 1: Velg kategori (kun for chat)
   * 2: Oppgi e-post, navn og melding (for chat)
   * 3: Chat
   * ticket: Opprett ticket (skjema for ticket-opplysninger)
   */
  const [step, setStep] = useState(0);
  const [preChatCompleted, setPreChatCompleted] = useState(false);

  // Data for chat / ticket
  const [conversationId, setConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // Valg
  const [userWantsAdmin, setUserWantsAdmin] = useState(false);
  const [adminAvailable, setAdminAvailable] = useState(false);

  // Chat input
  const [inputMessage, setInputMessage] = useState("");

  // "isTyping" for AI Bot
  const [isTyping, setIsTyping] = useState(false);

  // Pre-chat data (benyttes i chat)
  const [ticketData, setTicketData] = useState({
    category: '',
    email: '',
    name: '',
    message: '',
    subCategory: ''
  });

  // Data for Ticket-skjemaet
  const [ticketForm, setTicketForm] = useState({
    category: '',
    email: '',
    name: '',
    message: '',
    subCategory: ''
  });

  // Åpne/lukke panel
  const [isOpen, setIsOpen] = useState(false);
  const openPanel = () => setIsOpen(true);
  const closePanel = () => setIsOpen(false);
  const messagesEndRef = useRef(null);

  // Hent adminAvailable én gang
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/availability')
      .then(res => res.json())
      .then(data => setAdminAvailable(data.adminAvailable))
      .catch(err => console.error('Error fetching admin availability:', err));
  }, []);

  // Poll for meldinger i samtale (kun for chat)
  useEffect(() => {
    if (!conversationId || step !== 3) return;
    const interval = setInterval(() => {
      fetch(`http://localhost:5000/api/conversations/${conversationId}`)
        .then(res => {
          if (!res.ok) throw new Error('Could not fetch conversation');
          return res.json();
        })
        .then(data => {
          if (!data.messages) return;
          setChatMessages(data.messages);
        })
        .catch(err => console.error('Polling error:', err));
    }, 2000);
    return () => clearInterval(interval);
  }, [conversationId, step]);

  // Scroll til bunn
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  // STEG 0: Velg alternativ (Chatbot, Admin eller Ticket)
  const handleChooseChatbot = () => {
    setUserWantsAdmin(false);
    setStep(1);
  };

  const handleChooseAdmin = () => {
    setUserWantsAdmin(true);
    if (adminAvailable) {
      setStep(1);
    } else {
      setStep(0.5);
    }
  };

  // Ticket-valg: Gå til ticket-skjema
  const handleChooseTicket = () => {
    setStep("ticket");
  };

  // STEG 0.5: Fallback dersom admin ikke er tilgjengelig
  const handleFallbackChatbot = () => {
    setUserWantsAdmin(false);
    setStep(1);
  };

  // STEG 1: Velg kategori (for chat – ticket bruker eget skjema)
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (ticketData.category) {
      setStep(2);
    }
  };

  // STEG 2: Oppgi e-post, navn, melding (for chat)
  const handlePreChatSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsTyping(true);
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ticketData.email,
          name: ticketData.name,
          category: ticketData.category,
          subCategory: ticketData.subCategory,
          message: ticketData.message,
          userWantsAdmin
        })
      });
      if (!response.ok) throw new Error("Error communicating with ChatGPT/admin flow");
      const data = await response.json();
      setConversationId(data.conversationId);
      // Legg til en velkomstmelding manuelt
      const welcomeMsg = {
        sender: userWantsAdmin ? 'admin' : 'bot',
        text: "Welcome to Vintra Support!",
        timestamp: new Date()
      };
      const userMsg = ticketData.message.trim() ? {
        sender: "user",
        text: ticketData.message,
        timestamp: new Date()
      } : null;
      setChatMessages(userMsg ? [welcomeMsg, userMsg] : [welcomeMsg]);
      setPreChatCompleted(true);
      setStep(3);
    } catch (error) {
      console.error("Error in pre-chat submit:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // STEG "ticket": Opprett ticket
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketForm)
      });
      if (!res.ok) throw new Error("Failed to create ticket");
      alert("Ticket created successfully!");
      // Nullstill skjema og lukk panelet
      setTicketForm({
        category: '',
        email: '',
        name: '',
        message: '',
        subCategory: ''
      });
      setStep(0);
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  // STEG 3: Chat (for chat)
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const messageToSend = inputMessage;
    setInputMessage("");
    try {
      setIsTyping(true);
      await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: messageToSend, userWantsAdmin })
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Funksjon for å gå tilbake ett steg
  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      setStep(0);
    } else if (step === "ticket") {
      setStep(0);
    } else if (step === 0.5) {
      setStep(0);
    }
  };

  // Render innhold basert på steg
  const renderContent = () => {
    // Chat: Steg 3
    if (step === 3 && preChatCompleted) {
      return (
        <>
          <div style={{ flex: 1, overflowY: "auto", marginBottom: "10px" }}>
            {chatMessages.map((msg, index) => (
              <div key={index} style={{
                marginBottom: "8px",
                color: msg.sender === "bot" ? "#7824BC" : msg.sender === "admin" ? "#3B82F6" : "#484F5D"
              }}>
                <strong>{msg.sender.toUpperCase()}:</strong> {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                padding: "10px",
                border: "2px solid " + colors.buttonBorder,
                borderRadius: "8px",
                backgroundColor: "rgb(11, 9, 29)",
                color: colors.textLight
              }}
            />
            <StyledButton onClick={handleSendMessage}>Send</StyledButton>
          </div>
        </>
      );
    }

    // Ticket-skjema (når steg === "ticket")
    if (step === "ticket") {
      return (
        <form onSubmit={handleTicketSubmit}>
          <FormField>
            <Label htmlFor="ticketCategory">Category</Label>
            <Select
              id="ticketCategory"
              value={ticketForm.category}
              onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
              required
            >
              <option value="" disabled>-- Select category --</option>
              <option value="Games">Games</option>
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Billing">Billing</option>
              <option value="Support">Support</option>
              <option value="Sales">Sales</option>
              <option value="Other">Other</option>
            </Select>
          </FormField>
          {ticketForm.category === 'Games' && (
            <FormField>
              <Label htmlFor="ticketSubCategory">Game sub-category</Label>
              <Input
                type="text"
                id="ticketSubCategory"
                placeholder="For example, 'Level 10 help'"
                value={ticketForm.subCategory}
                onChange={e => setTicketForm({ ...ticketForm, subCategory: e.target.value })}
              />
            </FormField>
          )}
          <FormField>
            <Label htmlFor="ticketEmail">Email</Label>
            <Input
              type="email"
              id="ticketEmail"
              value={ticketForm.email}
              onChange={e => setTicketForm({ ...ticketForm, email: e.target.value })}
              required
            />
          </FormField>
          <FormField>
            <Label htmlFor="ticketName">Name</Label>
            <Input
              type="text"
              id="ticketName"
              value={ticketForm.name}
              onChange={e => setTicketForm({ ...ticketForm, name: e.target.value })}
              required
            />
          </FormField>
          <FormField>
            <Label htmlFor="ticketMessage">Message</Label>
            <TextArea
              id="ticketMessage"
              rows="4"
              value={ticketForm.message}
              onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
              required
            />
          </FormField>
          <StyledButton type="submit">Create Ticket</StyledButton>
        </form>
      );
    }

    // For steg 0, 0.5, 1 og 2 (Pre-chat for chat)
    switch (step) {
      case 0:
        return (
          <>
            <ul style={{ marginBottom: '1rem' }}>
              <li>Would you prefer to chat with Chatbot, an Admin or create a Ticket?</li>
            </ul>
            <div style={{ display: 'flex', gap: '8px' }}>
              <StyledButton onClick={handleChooseChatbot}>Chatbot</StyledButton>
              <StyledButton onClick={handleChooseAdmin}>Admin</StyledButton>
              <StyledButton onClick={handleChooseTicket}>Ticket</StyledButton>
            </div>
          </>
        );
      case 0.5:
        return (
          <>
            <ul style={{ marginBottom: '1rem' }}>
              <li>No admin is available right now.</li>
              <li>Do you want to use a Chatbot, create a Ticket or try again?</li>
            </ul>
            <div style={{ display: 'flex', gap: '8px' }}>
              <StyledButton onClick={handleFallbackChatbot}>Chatbot</StyledButton>
              <StyledButton onClick={handleChooseTicket}>Ticket</StyledButton>
            </div>
          </>
        );
      case 1:
        return (
          <form onSubmit={handleCategorySubmit}>
            <ul style={{ marginBottom: '1rem' }}>
              <li>Choose category</li>
            </ul>
            <FormField>
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                name="category"
                value={ticketData.category}
                onChange={e => setTicketData({ ...ticketData, category: e.target.value })}
                required
              >
                <option value="" disabled>-- Select category --</option>
                <option value="Games">Games</option>
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Billing">Billing</option>
                <option value="Support">Support</option>
                <option value="Sales">Sales</option>
                <option value="Other">Other</option>
              </Select>
            </FormField>
            {ticketData.category === 'Games' && (
              <FormField>
                <Label htmlFor="subCategory">Game sub-category</Label>
                <Input
                  type="text"
                  id="subCategory"
                  placeholder="E.g., 'Level 10 help'"
                  value={ticketData.subCategory}
                  onChange={e => setTicketData({ ...ticketData, subCategory: e.target.value })}
                />
              </FormField>
            )}
            <StyledButton type="submit">Next</StyledButton>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handlePreChatSubmit}>
            <ul style={{ marginBottom: '1rem' }}>
              <li>Enter your details</li>
            </ul>
            <FormField>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={ticketData.email}
                onChange={e => setTicketData({ ...ticketData, email: e.target.value })}
                required
              />
            </FormField>
            <FormField>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                value={ticketData.name}
                onChange={e => setTicketData({ ...ticketData, name: e.target.value })}
                required
              />
            </FormField>
            <FormField>
              <Label htmlFor="message">Message</Label>
              <TextArea
                id="message"
                rows="4"
                value={ticketData.message}
                onChange={e => setTicketData({ ...ticketData, message: e.target.value })}
                required
              />
            </FormField>
            <StyledButton type="submit">Start Chat</StyledButton>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyle />
      <FloatingButtonWrapper>
        <FloatingButton onClick={isOpen ? closePanel : openPanel} isOpen={isOpen}>
          <img src={BUTTON_IMAGE} alt="Chat Icon" />
        </FloatingButton>
      </FloatingButtonWrapper>
      {isOpen && (
        <ChatPanel>
          <PanelHeader>
            {step !== 0 && (
              <BackButton onClick={handleBack}>
                <svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.657 18.657a1 1 0 0 1-.707-.293l-5.657-5.657a1 1 0 0 1 0-1.414l5.657-5.657a1 1 0 0 1 1.414 1.414L10.414 12l4.95 4.95a1 1 0 0 1-.707 1.707z"></path>
                </svg>
              </BackButton>
            )}
            <GreetingText>{getTimeGreeting()}</GreetingText>
            <CloseButton onClick={closePanel}>
              <svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.414 12l4.95-4.95a1 1 0 0 0-1.414-1.414L12 10.586l-4.95-4.95A1 1 0 0 0 5.636 7.05l4.95 4.95-4.95 4.95a1 1 0 0 0 1.414 1.414l4.95-4.95 4.95 4.95a1 1 0 0 0 1.414-1.414z"></path>
              </svg>
            </CloseButton>
          </PanelHeader>
          <PanelBody>
            {renderContent()}
          </PanelBody>
        </ChatPanel>
      )}
    </>
  );
};

export default Bifrost;
