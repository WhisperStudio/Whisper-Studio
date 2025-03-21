import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';

// Ikon til den flytende knappen
const BUTTON_IMAGE = 'https://i.ibb.co/yFxWgc0s/AJxt1-KNy-Zw-Rvqjji1-Teum-EKW2-C4qw-Tpl-RTJVy-M5s-Zx-VCwbq-Ogpyhnpz-T44-QB9-RF51-XVUc1-Ci-Pf8-N0-Bp.png';

// Dark-blue theme
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

// Header med skygge og tilbake knapp
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
  height: 60px; /* Set a fixed height to ensure consistency */
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

// Chat messages
const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 0 5px;
`;

/**
 * Meldingsfarger og plassering:
 * - bot => venstre, farge: botBubble
 * - admin => høyre, farge: adminBubble (lilla), litt ekstra margin
 * - user => høyre, farge: userBubble (blå)
 */
const MessageBubble = styled.div`
  background: ${props =>
    props.sender === 'bot'
      ? colors.botBubble
      : props.sender === 'admin'
      ? colors.adminBubble
      : colors.userBubble};
  color: ${props =>
    props.sender === 'bot' ? colors.textLight : colors.white};
  align-self: ${props =>
    props.sender === 'bot' ? 'flex-start' : 'flex-end'};
  /* Litt ekstra margin for admin-meldinger */
  margin-right: ${props => (props.sender === 'admin' ? '20px' : '0')};
  padding: 10px 14px;
  border-radius: 16px;
  margin: 4px 0;
  max-width: 80%;
  box-shadow: 0px 2px 8px rgba(0,0,0,0.2);
  font-size: 0.95rem;
  line-height: 1.3;
`;

const SenderLabel = styled.div`
  font-size: 0.75rem;
  font-weight: bold;
  margin-bottom: 2px;
  color: ${props =>
    props.sender === 'bot' ? colors.textLight : colors.white};
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  margin: 4px 0;
  font-style: italic;
  color: ${colors.textLight};
`;

const Dot = styled.span`
  display: inline-block;
  width: 4px;
  height: 4px;
  margin: 0 2px;
  background-color: ${colors.textLight};
  border-radius: 50%;
  animation: ${dotPulse} 1.4s infinite both;
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
`;

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
`;

const InputField = styled.input`
  flex: 1;
  padding: 10px;
  border: 2px solid ${colors.buttonBorder};
  background-color: rgb(11, 9, 29);
  color: ${colors.textLight};
  border-radius: 8px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: ${colors.buttonHover};
  }
  &:-webkit-autofill,
  &:-webkit-autofill:hover, 
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px rgb(11, 9, 29) inset !important;
    -webkit-text-fill-color: #E0E0E0 !important;
  }
`;
// Use a functional component to avoid rendering StyledButton directly
const SendButtonComponent = (props) => <StyledButton {...props}>{props.children}</StyledButton>;
const SendButton = styled(SendButtonComponent)``;

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
  width: 90%;
  padding: 12px 16px;
  border: 2px solid ${colors.buttonBorder};
  background-color:rgb(11, 9, 29);
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
  background-color:rgb(11, 9, 29);
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
  width: 90%;
  padding: 12px 16px;
  border: 2px solid ${colors.buttonBorder};
  background-color:rgb(11, 9, 29);
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

// Create functional components for the buttons to avoid direct styled component rendering
const NextButtonComponent = (props) => <StyledButton {...props}>{props.children}</StyledButton>;
const NextButton = styled(NextButtonComponent)`
  width: 100%;
  margin-top: 10px;
`;

const SubmitButtonComponent = (props) => <StyledButton {...props}>{props.children}</StyledButton>;
const SubmitButton = styled(SubmitButtonComponent)`
  width: 100%;
  margin-top: 10px;
`;

const Bifrost = () => {
  /**
   * Pre-chat steg:
   * 0: Velg Chatbot / Admin
   * 0.5: Fallback hvis admin ikke tilgjengelig
   * 1: Velg kategori
   * 2: Oppgi e-post, navn, melding
   * 3: Chat
   */
  const [step, setStep] = useState(0);
  const [preChatCompleted, setPreChatCompleted] = useState(false);

  // Conversation data
  const [conversationId, setConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // Valg
  const [userWantsAdmin, setUserWantsAdmin] = useState(false);
  const [adminAvailable, setAdminAvailable] = useState(false);

  // Chat input
  const [inputMessage, setInputMessage] = useState("");

  // "isTyping" for AI Bot
  const [isTyping, setIsTyping] = useState(false);

  // Admin sin typing (polling)
  const [adminIsTyping, setAdminIsTyping] = useState(false);

  // Pre-chat data
  const [ticket, setTicket] = useState({
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
    fetch('https://api.vintrastudio.com/api/admin/availability')
      .then(res => res.json())
      .then(data => setAdminAvailable(data.adminAvailable))
      .catch(err => console.error('Error fetching admin availability:', err));
  }, []);

  // Poll for meldinger i conversation
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(() => {
      fetch(`https://api.vintrastudio.com/api/conversations/${conversationId}`)
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
  }, [conversationId]);

  // Poll for admin typing status
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('https://api.vintrastudio.com/api/admin/typing')
        .then(res => res.json())
        .then(data => setAdminIsTyping(data.adminTyping))
        .catch(err => console.error('Error fetching admin typing status:', err));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Scroll til bunn
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping, adminIsTyping]);

  // STEG 0: Velg Chatbot eller Admin
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

  // STEG 0.5: Fallback hvis admin ikke tilgjengelig
  const handleFallbackChatbot = () => {
    setUserWantsAdmin(false);
    setStep(1);
  };

  const handleFallbackTicket = () => {
    alert("Ticket submission placeholder.\nImplementer din ticket-løsning her.");
    setIsOpen(false);
  };

  // STEG 1: Velg kategori
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (ticket.category) {
      setStep(2);
    }
  };

  // STEG 2: E-post, navn, melding
  // Alle samtaler starter med "Welcome to Vintra Support!"
  const handlePreChatSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsTyping(true);
      const response = await fetch("https://api.vintrastudio.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ticket.email,
          name: ticket.name,
          category: ticket.category,
          subCategory: ticket.subCategory,
          message: ticket.message,
          userWantsAdmin
        })
      });
      if (!response.ok) throw new Error("Error communicating with ChatGPT/admin flow");
      const data = await response.json();
      setConversationId(data.conversationId);
      // Legg inn en "Welcome to Vintra Support!" melding manuelt i chatten.
      const welcomeMsg = {
        sender: userWantsAdmin ? 'admin' : 'bot',
        text: "Welcome to Vintra Support!",
        timestamp: new Date()
      };
      // Hvis brukeren skrev en melding i pre-chat
      const userMsg = ticket.message.trim() ? {
        sender: "user",
        text: ticket.message,
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

  // STEG 3: Chat
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const messageToSend = inputMessage;
    setInputMessage("");
    try {
      setIsTyping(true);
      await fetch("https://api.vintrastudio.com/api/chat", {
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

  // Funksjon for å gå ett steg tilbake
  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else if (step === 1 || step === 0.5) {
      setStep(0);
    }
  };

  // Render innhold for hvert steg
  const renderContent = () => {
    // STEG 3: Chat
    if (step === 3 && preChatCompleted) {
      return (
        <>
          <MessagesContainer>
            {chatMessages.map((msg, index) => (
              <MessageBubble key={index} sender={msg.sender}>
                <SenderLabel sender={msg.sender}>
                  {msg.sender === 'user' ? 'You' : msg.sender === 'admin' ? 'Admin' : 'AI Bot'}
                </SenderLabel>
                {msg.text}
              </MessageBubble>
            ))}
            {adminIsTyping && (
              <TypingIndicator>
                Admin is typing <Dot /><Dot /><Dot />
              </TypingIndicator>
            )}
            {isTyping && !userWantsAdmin && (
              <TypingIndicator>
                AI Bot is typing <Dot /><Dot /><Dot />
              </TypingIndicator>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>
          <InputContainer>
            <InputField
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <SendButton onClick={handleSendMessage}>Send</SendButton>
          </InputContainer>
        </>
      );
    }

    // Pre-chat steg: 0, 0.5, 1, 2
    switch (step) {
      case 0:
        return (
          <>
            <ul style={{ marginBottom: '1rem' }}>
              <li>Would you prefer a Chatbot or an Admin to talk to?</li>
            </ul>
            <div style={{ display: 'flex', gap: '8px' }}>
              <NextButton onClick={handleChooseChatbot}>Chatbot</NextButton>
              <NextButton onClick={handleChooseAdmin}>Admin</NextButton>
            </div>
          </>
        );
      case 0.5:
        return (
          <>
            <ul style={{ marginBottom: '1rem' }}>
              <li>No admin is available right now.</li>
              <li>Do you want to use a Chatbot or send inn a ticket?</li>
            </ul>
            <div style={{ display: 'flex', gap: '8px' }}>
              <NextButton onClick={handleFallbackChatbot}>Chatbot</NextButton>
              <NextButton onClick={handleFallbackTicket}>Ticket</NextButton>
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
                value={ticket.category}
                onChange={e => setTicket({ ...ticket, category: e.target.value })}
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
            {ticket.category === 'Games' && (
              <FormField>
                <Label htmlFor="subCategory">Game sub-category</Label>
                <Input
                  type="text"
                  id="subCategory"
                  name="subCategory"
                  placeholder="F.eks. 'Level 10 help'"
                  value={ticket.subCategory}
                  onChange={e => setTicket({ ...ticket, subCategory: e.target.value })}
                />
              </FormField>
            )}
            <NextButton type="submit">Next</NextButton>
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
                name="email"
                value={ticket.email}
                onChange={e => setTicket({ ...ticket, email: e.target.value })}
                required
              />
            </FormField>
            <FormField>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={ticket.name}
                onChange={e => setTicket({ ...ticket, name: e.target.value })}
                required
              />
            </FormField>
            <FormField>
              <Label htmlFor="message">Message</Label>
              <TextArea
                id="message"
                name="message"
                rows="4"
                value={ticket.message}
                onChange={e => setTicket({ ...ticket, message: e.target.value })}
                required
              />
            </FormField>
            <SubmitButton type="submit">Start Chat</SubmitButton>
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
                <svg fill="#ffffff" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M14.657 18.657a1 1 0 0 1-.707-.293l-5.657-5.657a1 1 0 0 1 0-1.414l5.657-5.657a1 1 0 0 1 1.414 1.414L10.414 12l4.95 4.95a1 1 0 0 1-.707 1.707z"></path>
                  </g>
                </svg>
              </BackButton>
            )}
            <GreetingText>{getTimeGreeting()}</GreetingText>
            <CloseButton onClick={closePanel}>
              <svg fill="#ffffff" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path d="M13.414 12l4.95-4.95a1 1 0 0 0-1.414-1.414L12 10.586l-4.95-4.95A1 1 0 0 0 5.636 7.05l4.95 4.95-4.95 4.95a1 1 0 0 0 1.414 1.414l4.95-4.95 4.95 4.95a1 1 0 0 0 1.414-1.414z"></path>
                </g>
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
