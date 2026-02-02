import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiSend, FiX } from 'react-icons/fi';
import { db, serverTimestamp, doc, onSnapshot, updateDoc } from '../../firebase';

const ChatWindow = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  height: 600px;
  background: #0f172a;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 15px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 12px;
  background: ${props => props.isUser ? '#6366f1' : '#1e293b'};
  color: white;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  word-wrap: break-word;
  line-height: 1.4;
`;

const InputContainer = styled.div`
  padding: 15px;
  background: #1e293b;
  display: flex;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Input = styled.textarea`
  flex: 1;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: inherit;
  resize: none;
  max-height: 120px;
  min-height: 50px;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const SendButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #4f46e5;
  }
  
  &:disabled {
    background: #4b5563;
    cursor: not-allowed;
  }
`;

const TicketChatWindow = ({ ticket, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load messages for this ticket
  useEffect(() => {
    if (!ticket?.id) return;

    const ticketRef = doc(db, 'tickets', ticket.id);
    const unsubscribe = onSnapshot(ticketRef, (doc) => {
      if (doc.exists()) {
        const ticketData = doc.data();
        setMessages(ticketData.messages || []);
      }
    });

    return () => unsubscribe();
  }, [ticket?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket?.id) return;

    setIsSending(true);
    try {
      const message = {
        text: newMessage,
        sender: 'admin',
        timestamp: serverTimestamp(),
        userId: ticket.userId
      };

      const ticketRef = doc(db, 'tickets', ticket.id);
      await updateDoc(ticketRef, {
        messages: [...(ticket.messages || []), message],
        status: 'in-progress',
        updatedAt: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!ticket) return null;

  return (
    <ChatWindow>
      <ChatHeader>
        <ChatTitle>Ticket: {ticket.title}</ChatTitle>
        <CloseButton onClick={onClose}>
          <FiX />
        </CloseButton>
      </ChatHeader>
      
      <MessagesContainer>
        {/* Initial ticket message */}
        <Message>
          <div><strong>User:</strong> {ticket.description}</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
            {new Date(ticket.createdAt?.toDate()).toLocaleString()}
          </div>
        </Message>

        {/* Ticket messages */}
        {messages.map((msg, index) => (
          <Message key={index} isUser={msg.sender === 'user'}>
            <div>{msg.text}</div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
              {msg.sender === 'admin' ? 'Admin' : 'User'} • {msg.timestamp?.toDate().toLocaleString()}
            </div>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <form onSubmit={handleSendMessage}>
        <InputContainer>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={1}
          />
          <SendButton type="submit" disabled={!newMessage.trim() || isSending}>
            <FiSend />
          </SendButton>
        </InputContainer>
      </form>
    </ChatWindow>
  );
};

export default TicketChatWindow;
