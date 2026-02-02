import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  db, 
  collection, 
  collectionGroup,
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  where,
  deleteDoc 
} from '../firebase';
import { auth } from '../firebase';
import { FiSend, FiUser, FiMessageCircle, FiX, FiTrash2 } from 'react-icons/fi';

const ChatContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1rem;
  height: 600px;
  background: #0a0f1a;
  border-radius: 12px;
  border: 1px solid #003366;
  box-shadow: 0 0 20px rgba(0,85,170,0.3);
  overflow: hidden;
`;

const UsersList = styled.div`
  background: #152238;
  border-right: 1px solid #003366;
  display: flex;
  flex-direction: column;
`;

const UsersHeader = styled.div`
  padding: 1rem;
  background: #1a2a45;
  color: #00ddff;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #003366;
`;

const UserItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #003366;
  cursor: pointer;
  transition: background 0.3s ease;
  color: #cfefff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${props => props.active ? '#263154' : 'transparent'};
  
  &:hover {
    background: #2d3a6a;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const UserStatus = styled.div`
  font-size: 0.8rem;
  color: #99e6ff;
`;

const UnreadBadge = styled.div`
  background: #00ddff;
  color: #000;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
`;

const ChatArea = styled.div`
  display: flex;
  flex-direction: column;
  background: #0a0f1a;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #003366;
  background: #152238;
  color: #cfefff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  align-self: ${props => props.isAdmin ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  background: ${props => props.isAdmin ? '#00ddff' : '#152238'};
  color: ${props => props.isAdmin ? '#000' : '#cfefff'};
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border-bottom-right-radius: ${props => props.isAdmin ? '4px' : '12px'};
  border-bottom-left-radius: ${props => props.isAdmin ? '12px' : '4px'};
  word-wrap: break-word;
  border: 1px solid ${props => props.isAdmin ? '#00ddff' : '#003366'};
`;

const MessageMeta = styled.div`
  font-size: 0.7rem;
  color: #99e6ff;
  margin-top: 0.25rem;
  text-align: ${props => props.isAdmin ? 'right' : 'left'};
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
  background: #00ddff;
  color: #000;
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
    background: #00b8cc;
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #99e6ff;
  text-align: center;
`;

const LiveChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load real chat users from Firebase
  useEffect(() => {
    const loadChatUsers = async () => {
      try {
        console.log('Loading chat users from Firebase...');
        
        // First try to get chats collection directly
        console.log('Trying direct chats collection approach...');
        const chatsSnapshot = await getDocs(collection(db, 'chats'));
        console.log('Found chat documents:', chatsSnapshot.size);
        
        if (chatsSnapshot.size > 0) {
          console.log('Chat document IDs:');
          chatsSnapshot.forEach(doc => {
            console.log('- Chat ID:', doc.id, 'Data:', doc.data());
          });
        }
        
        // Also try collectionGroup approach
        console.log('Trying collectionGroup messages approach...');
        const messagesSnapshot = await getDocs(collectionGroup(db, 'messages'));
        console.log('Found total messages across all chats:', messagesSnapshot.size);
        
        // Group messages by userId
        const userChats = {};
        messagesSnapshot.forEach(doc => {
          const data = doc.data();
          console.log('Processing message:', doc.id, data);
          
          // Try multiple ways to get userId
          let userId = data.userId || data.uid || data.user_id;
          
          // If no userId in message, try to extract from document path
          if (!userId) {
            const docPath = doc.ref.path; // e.g., "chats/userId/messages/messageId"
            const pathParts = docPath.split('/');
            if (pathParts.length >= 2 && pathParts[0] === 'chats') {
              userId = pathParts[1];
              console.log('Extracted userId from path:', userId);
            }
          }
          
          if (userId) {
            if (!userChats[userId]) {
              userChats[userId] = [];
            }
            userChats[userId].push({ 
              id: doc.id, 
              ...data,
              userId: userId, // Ensure userId is set
              timestamp: data.timestamp?.toDate() || new Date(data.timestamp?.seconds * 1000) || new Date()
            });
            console.log(`Added message to user ${userId}:`, data.text?.substring(0, 50));
          } else {
            console.warn('No userId found for message:', doc.id, data);
          }
        });
        
        console.log('Grouped messages by user:', Object.keys(userChats).length, 'users found');
        
        // If no messages found via collectionGroup, try direct approach
        if (Object.keys(userChats).length === 0 && chatsSnapshot.size > 0) {
          console.log('No messages via collectionGroup, trying direct chat approach...');
          
          for (const chatDoc of chatsSnapshot.docs) {
            const userId = chatDoc.id;
            console.log('Checking messages for user:', userId);
            
            try {
              const messagesRef = collection(db, 'chats', userId, 'messages');
              const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));
              const userMessagesSnapshot = await getDocs(messagesQuery);
              
              console.log(`Found ${userMessagesSnapshot.size} messages for user ${userId}`);
              
              if (!userMessagesSnapshot.empty) {
                const userMessages = [];
                userMessagesSnapshot.forEach(doc => {
                  const data = doc.data();
                  userMessages.push({
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate() || new Date(data.timestamp?.seconds * 1000) || new Date()
                  });
                });
                
                if (userMessages.length > 0) {
                  userChats[userId] = userMessages;
                }
              }
            } catch (error) {
              console.error(`Error loading messages for user ${userId}:`, error);
            }
          }
          
          console.log('After direct approach, found users:', Object.keys(userChats).length);
        }
        
        const chatUsers = [];
        
        // Process each user's messages
        Object.keys(userChats).forEach(userId => {
          const userMessages = userChats[userId];
          
          // Sort messages by timestamp (newest first)
          userMessages.sort((a, b) => b.timestamp - a.timestamp);
          
          const latestMessage = userMessages[0];
          
          // Count unread messages
          let unreadCount = 0;
          userMessages.forEach(msg => {
            if (msg.sender === 'user' && msg.read === false) {
              unreadCount++;
            }
          });
          
          chatUsers.push({
            id: userId,
            name: `User ${userId.substring(0, 8)}`,
            email: `${userId.substring(0, 8)}@chat.user`,
            status: 'online',
            unreadCount,
            lastMessage: latestMessage.text,
            lastSeen: latestMessage.timestamp
          });
          
          console.log(`LiveChat: Processed user ${userId} with ${userMessages.length} messages`);
        });
        
        // Sort by most recent activity
        chatUsers.sort((a, b) => b.lastSeen - a.lastSeen);
        console.log('Loaded chat users:', chatUsers.length, chatUsers);
        setUsers(chatUsers);
        
      } catch (error) {
        console.error('Error loading chat users:', error);
        // Fallback to mock users if Firebase fails
        const mockUsers = [
          {
            id: 'demo-user-1',
            name: 'Demo User',
            email: 'demo@example.com',
            status: 'online',
            unreadCount: 1,
            lastMessage: 'Hello, I need help!',
            lastSeen: new Date()
          }
        ];
        setUsers(mockUsers);
      }
    };
    
    loadChatUsers();
    
    // Refresh users every 3 seconds for real-time updates
    const interval = setInterval(loadChatUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load messages for selected user
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    // Try to load from Firebase first
    const messagesRef = collection(db, 'chats', selectedUser.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    // Use getDocs instead of onSnapshot to avoid Firebase 11.9.0 bug
    const fetchMessages = async () => {
      try {
        const snapshot = await getDocs(q);
        const messagesList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messagesList.push({ 
            id: doc.id, 
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(data.timestamp?.seconds * 1000) || new Date()
          });
        });

        // Sort messages by timestamp
        messagesList.sort((a, b) => a.timestamp - b.timestamp);

        if (messagesList.length === 0) {
          // Generate mock messages if no Firebase data
          const mockMessages = generateMockMessages(selectedUser.id);
          setMessages(mockMessages);
        } else {
          setMessages(messagesList);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Fallback to mock messages
        const mockMessages = generateMockMessages(selectedUser.id);
        setMessages(mockMessages);
      }
    };

    fetchMessages();
    
    // Auto-refresh messages every 2 seconds when a user is selected
    const messageInterval = setInterval(fetchMessages, 2000);
    return () => clearInterval(messageInterval);
  }, [selectedUser]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateMockMessages = (userId) => {
    const baseMessages = {
      user1: [
        { id: '1', text: 'Hello, I need help with my account', sender: 'user', timestamp: new Date(Date.now() - 10 * 60 * 1000) },
        { id: '2', text: 'Hi! I\'d be happy to help you. What seems to be the issue?', sender: 'admin', timestamp: new Date(Date.now() - 9 * 60 * 1000) },
        { id: '3', text: 'I can\'t log into my account. It says my password is incorrect.', sender: 'user', timestamp: new Date(Date.now() - 8 * 60 * 1000) },
        { id: '4', text: 'Let me help you reset your password. I\'ll send you a reset link.', sender: 'admin', timestamp: new Date(Date.now() - 7 * 60 * 1000) }
      ],
      user2: [
        { id: '1', text: 'Thank you for your help earlier!', sender: 'user', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
        { id: '2', text: 'You\'re welcome! Is everything working properly now?', sender: 'admin', timestamp: new Date(Date.now() - 55 * 60 * 1000) },
        { id: '3', text: 'Yes, everything is perfect. Thanks again!', sender: 'user', timestamp: new Date(Date.now() - 50 * 60 * 1000) }
      ],
      user3: [
        { id: '1', text: 'Is there anyone available?', sender: 'user', timestamp: new Date(Date.now() - 5 * 60 * 1000) }
      ]
    };

    return baseMessages[userId] || [];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedUser || loading) return;

    setLoading(true);
    const messageText = inputMessage.trim();
    setInputMessage('');

    try {
      const messageData = {
        text: messageText,
        sender: 'admin',
        senderEmail: auth.currentUser?.email,
        timestamp: serverTimestamp(),
        userId: selectedUser.id,
        read: false
      };

      // Save to Firebase
      const messagesRef = collection(db, 'chats', selectedUser.id, 'messages');
      await addDoc(messagesRef, messageData);

      // Update local state immediately for better UX
      const newMessage = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'admin',
        senderEmail: auth.currentUser?.email,
        timestamp: new Date(),
        userId: selectedUser.id
      };
      setMessages(prev => [...prev, newMessage]);

      // Mark all user messages as read and update user's unread count
      const unreadMessagesRef = collection(db, 'chats', selectedUser.id, 'messages');
      const unreadQuery = query(unreadMessagesRef, where('sender', '==', 'user'), where('read', '==', false));
      const unreadSnapshot = await getDocs(unreadQuery);
      
      // Mark unread messages as read (you would need to update each document)
      // For now, just update the local state
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, unreadCount: 0, lastMessage: messageText, lastSeen: new Date() }
          : user
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      // Add message locally even if Firebase fails
      const newMessage = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'admin',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this entire conversation? This cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting chat for user:', userId);
      
      // Delete all messages first
      const messagesRef = collection(db, 'chats', userId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Delete the chat document
      await deleteDoc(doc(db, 'chats', userId));
      
      console.log('Chat deleted successfully');
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // Clear selected user if it was the deleted one
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setMessages([]);
      }
      
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Error deleting chat. Please try again.');
    }
  };

  const closeChat = (userId) => {
    // Just deselect the user (close the chat view)
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
      setMessages([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('no-NO', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return '';
    }
  };

  return (
    <ChatContainer>
      <UsersList>
        <UsersHeader>
          <FiMessageCircle />
          Active Chats ({users.length})
        </UsersHeader>
        {users.map(user => (
          <UserItem
            key={user.id}
            active={selectedUser?.id === user.id}
            onClick={() => setSelectedUser(user)}
          >
            <FiUser />
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserStatus>
                {user.status === 'online' ? '🟢 Online' : '🔴 Offline'}
              </UserStatus>
            </UserInfo>
            {user.unreadCount > 0 && (
              <UnreadBadge>{user.unreadCount}</UnreadBadge>
            )}
          </UserItem>
        ))}
      </UsersList>

      <ChatArea>
        {selectedUser ? (
          <>
            <ChatHeader>
              <div style={{ flex: 1 }}>
                {selectedUser.name} ({selectedUser.email})
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => closeChat(selectedUser.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#99e6ff',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close Chat"
                >
                  <FiX size={16} />
                </button>
                <button
                  onClick={() => deleteChat(selectedUser.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Delete Chat"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </ChatHeader>
            
            <MessagesContainer>
              {messages.map(message => (
                <Message key={message.id} isAdmin={message.sender === 'admin'}>
                  <MessageBubble isAdmin={message.sender === 'admin'}>
                    {message.text}
                    <MessageMeta isAdmin={message.sender === 'admin'}>
                      {formatTime(message.timestamp)}
                      {message.sender === 'admin' && message.senderEmail && (
                        <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                          {message.senderEmail}
                        </div>
                      )}
                    </MessageMeta>
                  </MessageBubble>
                </Message>
              ))}
              <div ref={messagesEndRef} />
            </MessagesContainer>

            <MessageInput>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
              />
              <SendButton onClick={sendMessage} disabled={loading || !inputMessage.trim()}>
                <FiSend />
              </SendButton>
            </MessageInput>
          </>
        ) : (
          <EmptyState>
            <FiMessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Select a chat to start messaging</h3>
            <p>Choose a user from the list to view their conversation</p>
          </EmptyState>
        )}
      </ChatArea>
    </ChatContainer>
  );
};

export default LiveChat;
