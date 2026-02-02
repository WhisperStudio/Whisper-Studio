import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { FiSend, FiCpu, FiUser, FiActivity, FiTrendingUp } from 'react-icons/fi';

const BotContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  height: 600px;
  background: #0a0f1a;
  border-radius: 12px;
  border: 1px solid #003366;
  box-shadow: 0 0 20px rgba(0,85,170,0.3);
  overflow: hidden;
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30" fill="%2300ddff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>'), auto;
  
  * {
    cursor: inherit;
  }
`;

const ChatArea = styled.div`
  display: flex;
  flex-direction: column;
  background: #0a0f1a;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background: #1a2a45;
  color: #00ddff;
  font-weight: 600;
  border-bottom: 1px solid #003366;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 80%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const MessageIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.isUser ? '#00ddff' : '#7B68EE'};
  color: ${props => props.isUser ? '#000' : '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MessageBubble = styled.div`
  background: ${props => props.isUser ? '#00ddff' : '#152238'};
  color: ${props => props.isUser ? '#000' : '#cfefff'};
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border-bottom-right-radius: ${props => props.isUser ? '4px' : '12px'};
  border-bottom-left-radius: ${props => props.isUser ? '12px' : '4px'};
  word-wrap: break-word;
  border: 1px solid ${props => props.isUser ? '#00ddff' : '#003366'};
  position: relative;
`;

const MessageMeta = styled.div`
  font-size: 0.7rem;
  color: #99e6ff;
  margin-top: 0.25rem;
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #99e6ff;
  font-style: italic;
  padding: 0.5rem 0;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 0.25rem;
  
  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00ddff;
    animation: typing 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
  
  @keyframes typing {
    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }
`;

const MessageInput = styled.div`
  padding: 1rem;
  border-top: 1px solid #003366;
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  background: #152238;
  border: 1px solid #003366;
  border-radius: 20px;
  color: #cfefff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #00ddff;
    box-shadow: 0 0 0 2px rgba(0, 221, 255, 0.2);
  }
  
  &::placeholder {
    color: #99e6ff;
  }
`;

const SendButton = styled.button`
  background: #7B68EE;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6A5ACD;
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SidePanel = styled.div`
  background: #152238;
  border-left: 1px solid #003366;
  display: flex;
  flex-direction: column;
`;

const PanelSection = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #003366;
`;

const PanelTitle = styled.h3`
  color: #00ddff;
  margin: 0 0 1rem 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatCard = styled.div`
  background: #0a0f1a;
  border: 1px solid #003366;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ddff;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: #99e6ff;
  font-size: 0.8rem;
`;

const QuickAction = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #1a2a45;
  color: #cfefff;
  border: 1px solid #003366;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    background: #2d3a6a;
    border-color: #00ddff;
  }
`;

const AIBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [botStats, setBotStats] = useState({
    totalQueries: 1247,
    todayQueries: 23,
    avgResponseTime: '1.2s',
    satisfaction: '94%'
  });
  const messagesEndRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: '1',
      text: 'Hello! I\'m your AI assistant. I can help you with analytics, user management, system status, and more. What would you like to know?',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Simple keyword-based responses
    if (message.includes('user') || message.includes('brukere')) {
      return `Based on current data, you have ${botStats.totalQueries} total users with ${botStats.todayQueries} new registrations today. User growth is trending upward by 12% this month.`;
    }
    
    if (message.includes('analytics') || message.includes('statistikk')) {
      return 'Here\'s a quick overview: Website traffic is up 15% this week, conversion rate is at 3.2%, and user engagement has increased by 8%. Would you like me to generate a detailed report?';
    }
    
    if (message.includes('system') || message.includes('status')) {
      return 'All systems are operational! Server uptime: 99.9%, Database response time: 45ms, API endpoints: All green. Last backup completed 2 hours ago.';
    }
    
    if (message.includes('help') || message.includes('hjelp')) {
      return 'I can help you with:\n• User analytics and statistics\n• System monitoring and status\n• Performance metrics\n• Data insights and reports\n• Admin tasks and automation\n\nJust ask me anything!';
    }
    
    if (message.includes('revenue') || message.includes('income')) {
      return 'Revenue insights: This month\'s revenue is $45,230 (↑18% from last month). Top performing products: Premium subscriptions (65%), Pro features (25%), Add-ons (10%).';
    }
    
    // Default responses
    const defaultResponses = [
      'That\'s an interesting question! Based on the current data trends, I\'d recommend checking the analytics dashboard for more detailed insights.',
      'I understand you\'re looking for information about that. Let me analyze the current system data... The metrics show positive trends across most KPIs.',
      'Great question! From what I can see in the admin panel, everything is running smoothly. Would you like me to dive deeper into any specific area?',
      'I\'m here to help! While I process that request, you might want to check the real-time dashboard for the latest updates.',
      'Based on the current system performance and user behavior patterns, I can provide you with actionable insights. What specific area interests you most?'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // Update stats
      setBotStats(prev => ({
        ...prev,
        totalQueries: prev.totalQueries + 1,
        todayQueries: prev.todayQueries + 1
      }));
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('no-NO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <BotContainer>
      <ChatArea>
        <ChatHeader>
          <FiCpu />
          AI Assistant - Admin Helper
        </ChatHeader>
        
        <MessagesContainer>
          {messages.map(message => (
            <Message key={message.id} isUser={message.sender === 'user'}>
              <MessageIcon isUser={message.sender === 'user'}>
                {message.sender === 'user' ? <FiUser /> : <FiCpu />}
              </MessageIcon>
              <MessageBubble isUser={message.sender === 'user'}>
                {message.text}
                <MessageMeta isUser={message.sender === 'user'}>
                  {formatTime(message.timestamp)}
                </MessageMeta>
              </MessageBubble>
            </Message>
          ))}
          
          {isTyping && (
            <Message isUser={false}>
              <MessageIcon isUser={false}>
                <FiCpu />
              </MessageIcon>
              <TypingIndicator>
                AI is thinking
                <TypingDots>
                  <span></span>
                  <span></span>
                  <span></span>
                </TypingDots>
              </TypingIndicator>
            </Message>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <MessageInput>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your admin panel..."
            disabled={isTyping}
          />
          <SendButton onClick={sendMessage} disabled={isTyping || !inputMessage.trim()}>
            <FiSend />
          </SendButton>
        </MessageInput>
      </ChatArea>

      <SidePanel>
        <PanelSection>
          <PanelTitle>
            <FiActivity />
            Bot Statistics
          </PanelTitle>
          
          <StatCard>
            <StatValue>{botStats.totalQueries}</StatValue>
            <StatLabel>Total Queries</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{botStats.todayQueries}</StatValue>
            <StatLabel>Today's Queries</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{botStats.avgResponseTime}</StatValue>
            <StatLabel>Avg Response Time</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{botStats.satisfaction}</StatValue>
            <StatLabel>Satisfaction Rate</StatLabel>
          </StatCard>
        </PanelSection>

        <PanelSection>
          <PanelTitle>
            <FiTrendingUp />
            Quick Actions
          </PanelTitle>
          
          <QuickAction onClick={() => handleQuickAction('Show me user analytics')}>
            📊 User Analytics
          </QuickAction>
          
          <QuickAction onClick={() => handleQuickAction('What is the system status?')}>
            🖥️ System Status
          </QuickAction>
          
          <QuickAction onClick={() => handleQuickAction('Show revenue report')}>
            💰 Revenue Report
          </QuickAction>
          
          <QuickAction onClick={() => handleQuickAction('Help me with admin tasks')}>
            🛠️ Admin Help
          </QuickAction>
          
          <QuickAction onClick={() => handleQuickAction('Generate performance insights')}>
            📈 Performance Insights
          </QuickAction>
        </PanelSection>
      </SidePanel>
    </BotContainer>
  );
};

export default AIBot;