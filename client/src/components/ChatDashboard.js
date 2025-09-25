// src/components/ChatDashboard.js
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FiLock, FiUnlock, FiTrash2, FiMessageCircle, FiUser, FiX } from 'react-icons/fi';
import { db, collection, collectionGroup, getDocs, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, getDoc, setDoc, updateDoc, onSnapshot } from '../firebase';
import { auth } from '../firebase';


const ChatDashboardContainer = styled.div`
  background: #0b1121;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 30px 40px rgba(0, 0, 0, 0.25);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChatListWrapper = styled.div`
  display: flex;
  gap: 1rem;
`;

const ChatList = styled.div`
  flex: 1;
  max-width: 300px;
  border-right: 1px solid #ccc;
  padding-right: 16px;
  overflow-y: auto;
`;

const ChatListItem = styled.div`
  padding: 8px;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  background: ${({ active }) => (active ? "#182547" : "transparent")};
  transition: background 0.2s;
  &:hover {
    background: rgb(38, 55, 100);
  }
`;

const ChatDetails = styled.div`
  flex: 2;
  padding-left: 16px;
`;

const MessagesContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #003366;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  background: #152238;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageBubble = styled.div`
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 12px;
  max-width: 75%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  align-self: ${({ variant }) => (variant === 'user' ? 'flex-end' : 'flex-start')};
  background: ${({ variant }) => (
    variant === 'user' ? '#1a2332' :
    variant === 'admin' ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)' :
    variant === 'bot' ? 'rgba(168, 85, 247, 0.15)' :
    'rgba(148, 163, 184, 0.15)'
  )};
  color: ${({ variant }) => (
    variant === 'admin' ? '#fff' :
    '#cfefff'
  )};
  border: 1px solid ${({ variant }) => (
    variant === 'user' ? '#003366' :
    variant === 'admin' ? 'rgba(99, 102, 241, 0.4)' :
    variant === 'bot' ? 'rgba(168, 85, 247, 0.35)' :
    'rgba(148, 163, 184, 0.25)'
  )};
`;

const MessageItem = styled.div`
  margin-bottom: 8px;
  line-height: 1.4;
  color: ${({ sender }) => {
    if (sender === "bot") return "#7824BC"; // Purple for bot
    if (sender === "admin") return "#3B82F6"; // Blue for admin
    if (sender === "user") return "#484F5D"; // Dark text for user
    return "#000";
  }};
`;

const AdminTextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-family: inherit;
  resize: vertical;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  background-color: ${({ bgColor }) => bgColor || "#2563eb"};
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  &:hover {
    opacity: 0.9;
  }
`;

const CategoryFilter = styled.select`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid rgb(49, 54, 77);
  margin-bottom: 12px;
  background-color: #1a1f2e;
  color: #fff;
`;

const CardTitle = styled.h2`
  margin-bottom: 12px;
  font-size: 18px;
`;

const StatusBadge = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ active }) => active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(99, 102, 241, 0.15)'};
  border: 1px solid ${({ active }) => active ? 'rgba(34, 197, 94, 0.35)' : 'rgba(99, 102, 241, 0.3)'};
  color: ${({ active }) => active ? '#34d399' : '#a78bfa'};
`;

// Funksjon for å signalisere at admin skriver
const setAdminTyping = async (typing) => {
  try {
    await fetch("https://api.vintrastudio.com/api/admin/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typing })
    });
  } catch (error) {
    console.error("Error setting admin typing:", error);
  }
};

// ChatDashboard-komponenten
const ChatDashboard = () => {
  const [conversations, setConversations] = useState({});
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedChatInfo, setSelectedChatInfo] = useState(null); // chat doc data (e.g., takenOver)
  const messagesUnsubRef = useRef(null);
  const chatInfoUnsubRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load conversations from Firebase
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        console.log('ChatDashboard: Loading conversations from Firebase...');
        
        // First try to get chats collection directly
        console.log('ChatDashboard: Trying direct chats collection approach...');
        const chatsSnapshot = await getDocs(collection(db, 'chats'));
        console.log('ChatDashboard: Found chat documents:', chatsSnapshot.size);
        
        if (chatsSnapshot.size > 0) {
          console.log('ChatDashboard: Chat document IDs:');
          chatsSnapshot.forEach(doc => {
            console.log('- Chat ID:', doc.id, 'Data:', doc.data());
          });
        }
        
        // Also try collectionGroup approach
        console.log('ChatDashboard: Trying collectionGroup messages approach...');
        const messagesSnapshot = await getDocs(collectionGroup(db, 'messages'));
        console.log('ChatDashboard: Found total messages across all chats:', messagesSnapshot.size);
        
        // Group messages by userId
        const userChats = {};
        messagesSnapshot.forEach(doc => {
          const data = doc.data();
          console.log('ChatDashboard: Processing message:', doc.id, data);
          
          // Try multiple ways to get userId
          let userId = data.userId || data.uid || data.user_id;
          
          // If no userId in message, try to extract from document path
          if (!userId) {
            const docPath = doc.ref.path; // e.g., "chats/userId/messages/messageId"
            const pathParts = docPath.split('/');
            if (pathParts.length >= 2 && pathParts[0] === 'chats') {
              userId = pathParts[1];
              console.log('ChatDashboard: Extracted userId from path:', userId);
            }
          }
          
          if (userId) {
            if (!userChats[userId]) {
              userChats[userId] = [];
            }
            const sender = data.sender;
            const mappedFrom = sender === 'user' ? 'user' : sender === 'admin' ? 'admin' : sender === 'system' ? 'system' : 'bot';
            userChats[userId].push({
              id: doc.id,
              from: mappedFrom,
              text: data.text,
              timestamp: data.timestamp?.toDate() || new Date(data.timestamp?.seconds * 1000) || new Date(),
              userId: userId,
              senderEmail: data.senderEmail
            });
            console.log(`ChatDashboard: Added message to user ${userId}:`, data.text?.substring(0, 50));
          } else {
            console.warn('ChatDashboard: No userId found for message:', doc.id, data);
          }
        });
        
        console.log('ChatDashboard: Grouped messages by user:', Object.keys(userChats).length, 'users found');
        
        // If no messages found via collectionGroup, try direct approach
        if (Object.keys(userChats).length === 0 && chatsSnapshot.size > 0) {
          console.log('ChatDashboard: No messages via collectionGroup, trying direct chat approach...');
          
          for (const chatDoc of chatsSnapshot.docs) {
            const userId = chatDoc.id;
            console.log('ChatDashboard: Checking messages for user:', userId);
            
            try {
              const messagesRef = collection(db, 'chats', userId, 'messages');
              const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
              const userMessagesSnapshot = await getDocs(messagesQuery);
              
              console.log(`ChatDashboard: Found ${userMessagesSnapshot.size} messages for user ${userId}`);
              
              if (!userMessagesSnapshot.empty) {
                const userMessages = [];
                userMessagesSnapshot.forEach(doc => {
                  const data = doc.data();
                  const sender = data.sender;
                  const mappedFrom = sender === 'user' ? 'user' : sender === 'admin' ? 'admin' : sender === 'system' ? 'system' : 'bot';
                  userMessages.push({
                    id: doc.id,
                    from: mappedFrom,
                    text: data.text,
                    timestamp: data.timestamp?.toDate() || new Date(data.timestamp?.seconds * 1000) || new Date(),
                    userId: userId,
                    senderEmail: data.senderEmail
                  });
                });
                
                if (userMessages.length > 0) {
                  userChats[userId] = userMessages;
                }
              }
            } catch (error) {
              console.error(`ChatDashboard: Error loading messages for user ${userId}:`, error);
            }
          }
          
          console.log('ChatDashboard: After direct approach, found users:', Object.keys(userChats).length);
        }
        
        const convs = {};
        
        // Process each user's messages
        Object.keys(userChats).forEach(userId => {
          const userMessages = userChats[userId];
          
          // Sort messages by timestamp (oldest first for conversation flow)
          userMessages.sort((a, b) => a.timestamp - b.timestamp);
          
          convs[userId] = userMessages;
          
          console.log(`ChatDashboard: Processed user ${userId} with ${userMessages.length} messages`);
        });
        
        console.log('ChatDashboard: Loaded conversations:', Object.keys(convs).length, convs);
        
        // Only update if there are actual changes to prevent unnecessary re-renders
        const currentKeys = Object.keys(conversations).sort();
        const newKeys = Object.keys(convs).sort();
        const hasChanges = JSON.stringify(currentKeys) !== JSON.stringify(newKeys) ||
          Object.keys(convs).some(userId => {
            const currentMsgs = conversations[userId] || [];
            const newMsgs = convs[userId] || [];
            return currentMsgs.length !== newMsgs.length;
          });
        
        if (hasChanges || Object.keys(conversations).length === 0) {
          console.log('ChatDashboard: Changes detected, updating conversations');
          setConversations(convs);
        } else {
          console.log('ChatDashboard: No changes detected, skipping update');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('ChatDashboard: Error loading conversations:', error);
        // Fallback to mock data
        const mockConversations = {
          'demo-user-1': [
            { from: 'user', text: 'Hello, I need help', userId: 'demo-user-1', timestamp: new Date() },
            { from: 'admin', text: 'How can I help you?', userId: 'demo-user-1', timestamp: new Date() }
          ]
        };
        setConversations(mockConversations);
        setLoading(false);
      }
    };
    
    loadConversations();
    
    // Refresh every 10 seconds to reduce blinking
    const interval = setInterval(() => {
      // Only reload if not currently loading to prevent blinking
      if (!loading) {
        loadConversations();
      }
    }, 10000);
    return () => {
      clearInterval(interval);
      if (window.selectedConversationInterval) {
        clearInterval(window.selectedConversationInterval);
      }
    };
  }, []);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (messagesUnsubRef.current) messagesUnsubRef.current();
      if (chatInfoUnsubRef.current) chatInfoUnsubRef.current();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const onSelect = async (userId) => {
    setSelected(userId);

    // Unsubscribe previous listeners
    if (messagesUnsubRef.current) {
      messagesUnsubRef.current();
      messagesUnsubRef.current = null;
    }
    if (chatInfoUnsubRef.current) {
      chatInfoUnsubRef.current();
      chatInfoUnsubRef.current = null;
    }

    if (!userId) return;

    // Live messages subscription
    try {
      const messagesRef = collection(db, 'chats', userId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
      messagesUnsubRef.current = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map((d) => {
          const data = d.data();
          const sender = data.sender;
          const mappedFrom = sender === 'user' ? 'user' : sender === 'admin' ? 'admin' : sender === 'system' ? 'system' : 'bot';
          return {
            id: d.id,
            from: mappedFrom,
            text: data.text,
            timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp?.seconds * 1000) || new Date(),
            userId,
            senderEmail: data.senderEmail
          };
        });
        setConversations((prev) => ({ ...prev, [userId]: messages }));
      });
    } catch (err) {
      console.error('onSelect: error subscribing to messages', err);
    }

    // Chat doc subscription (for takeover status)
    try {
      const chatRef = doc(db, 'chats', userId);
      chatInfoUnsubRef.current = onSnapshot(chatRef, (snap) => {
        setSelectedChatInfo(snap.exists() ? snap.data() : null);
      });

      // Ensure chat doc exists
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          takenOver: false
        }, { merge: true });
      }
    } catch (err) {
      console.error('onSelect: error subscribing to chat doc', err);
    }
  };

  const onSend = async () => {
    if (!input.trim() || !selected || sending) return;
    
    setSending(true);
    const messageText = input.trim();
    setInput('');
    
    try {
      // Save to Firebase
      const messageData = {
        text: messageText,
        sender: 'admin',
        senderEmail: auth.currentUser?.email,
        timestamp: serverTimestamp(),
        userId: selected
      };
      
      const messagesRef = collection(db, 'chats', selected, 'messages');
      await addDoc(messagesRef, messageData);
      // Update chat doc lastUpdated
      try {
        await updateDoc(doc(db, 'chats', selected), {
          lastUpdated: serverTimestamp()
        });
      } catch (_) {}
      
      // Update local state
      const newMessage = {
        id: Date.now().toString(),
        from: 'admin',
        text: messageText,
        timestamp: new Date(),
        userId: selected,
        senderEmail: auth.currentUser?.email
      };
      
      setConversations(prev => ({
        ...prev,
        [selected]: [...(prev[selected] || []), newMessage]
      }));
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Add a system message into the conversation (visible to user)
  const addSystemMessage = async (userId, text) => {
    try {
      const messagesRef = collection(db, 'chats', userId, 'messages');
      await addDoc(messagesRef, {
        text,
        sender: 'system',
        timestamp: serverTimestamp(),
        userId
      });
    } catch (err) {
      console.error('addSystemMessage error:', err);
    }
  };

  const takeOverChat = async () => {
    if (!selected) return;
    try {
      const chatRef = doc(db, 'chats', selected);
      await setDoc(chatRef, {
        takenOver: true,
        takenOverByEmail: auth.currentUser?.email || 'admin',
        takenOverByUid: auth.currentUser?.uid || 'admin',
        takenOverAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      }, { merge: true });
      await addSystemMessage(selected, `A support agent has taken over the conversation.`);
      // Optional: notify bot backend to stop replying
      try {
        await fetch('https://api.vintrastudio.com/api/admin/takeover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selected, takeover: true, admin: auth.currentUser?.email })
        });
      } catch (_) {}
    } catch (err) {
      console.error('takeOverChat error:', err);
    }
  };

  const releaseChat = async () => {
    if (!selected) return;
    try {
      const chatRef = doc(db, 'chats', selected);
      await setDoc(chatRef, {
        takenOver: false,
        releasedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      }, { merge: true });
      await addSystemMessage(selected, `The conversation has been returned to the AI assistant.`);
      // Optional: notify bot backend to resume
      try {
        await fetch('https://api.vintrastudio.com/api/admin/takeover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selected, takeover: false, admin: auth.currentUser?.email })
        });
      } catch (_) {}
    } catch (err) {
      console.error('releaseChat error:', err);
    }
  };

  const onDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      return;
    }

    try {
      console.log('ChatDashboard: Deleting chat for user:', userId);
      
      // Delete all messages first
      const messagesRef = collection(db, 'chats', userId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Delete the chat document
      await deleteDoc(doc(db, 'chats', userId));
      
      console.log('ChatDashboard: Chat deleted successfully');
      
      // Update local state
      setConversations(prev => {
        const newConvs = { ...prev };
        delete newConvs[userId];
        return newConvs;
      });
      
      if (selected === userId) {
        setSelected(null);
      }
      
    } catch (error) {
      console.error('ChatDashboard: Error deleting chat:', error);
      alert('Error deleting chat. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  if (loading) {
    return (
      <ChatDashboardContainer>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#99e6ff' }}>
          <FiMessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <div>Loading conversations...</div>
        </div>
      </ChatDashboardContainer>
    );
  }

  return (
    <ChatDashboardContainer>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
        <FiMessageCircle />
        Live Chat Dashboard ({Object.keys(conversations).length} conversations)
      </h3>
      <CategoryFilter
        value="All"
        onChange={(e) => console.log(e.target.value)}
      >
        <option value="All">All categories</option>
        <option value="Games">Games</option>
        <option value="General">General</option>
        <option value="Work">Work</option>
        <option value="Billing">Billing</option>
        <option value="Support">Support</option>
        <option value="Sales">Sales</option>
        <option value="Other">Other</option>
      </CategoryFilter>
      <ChatListWrapper>
        <ChatList>
          {Object.keys(conversations).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#99e6ff', opacity: 0.7 }}>
              <FiUser size={32} style={{ marginBottom: '1rem' }} />
              <div>No conversations yet</div>
              <small>Conversations will appear when users start chatting</small>
            </div>
          ) : (
            Object.keys(conversations).map((userId) => {
              const messages = conversations[userId] || [];
              const lastMessage = messages[messages.length - 1];
              const unreadCount = messages.filter(m => m.from === 'user' && !m.read).length;
              
              return (
                <ChatListItem
                  key={userId}
                  active={selected === userId}
                  onClick={() => onSelect(userId)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUser size={14} />
                        User {userId.substring(0, 8)}
                      </strong>
                      <small style={{ color: '#99e6ff', display: 'block', marginTop: '0.25rem' }}>
                        {messages.length} messages
                      </small>
                      {lastMessage && (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#ccc', 
                          marginTop: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '200px'
                        }}>
                          {lastMessage.from === 'admin' ? '👨‍💼 ' : '👤 '}{lastMessage.text}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                      {unreadCount > 0 && (
                        <span style={{
                          background: '#00ddff',
                          color: '#000',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          {unreadCount}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(userId);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ff6b6b",
                          cursor: "pointer",
                          padding: '0.25rem',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 107, 107, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'none'}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </ChatListItem>
              );
            })
          )}
        </ChatList>
        <ChatDetails>
          {selected ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>
                  Chat with User {selected.substring(0, 8)}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#99e6ff',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Close Chat"
                  >
                    <FiX size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(selected)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete Chat"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <StatusBadge active={selectedChatInfo?.takenOver}>
                  {selectedChatInfo?.takenOver ? `Taken over by ${selectedChatInfo?.takenOverByEmail || 'admin'}` : 'AI Assistant Active'}
                </StatusBadge>
                {!selectedChatInfo?.takenOver ? (
                  <ActionButton bgColor="#7c3aed" onClick={takeOverChat} title="Take over this chat">
                    <FiLock style={{ marginRight: 6 }} /> Take Over
                  </ActionButton>
                ) : (
                  <ActionButton bgColor="#0ea5e9" onClick={releaseChat} title="Release back to AI">
                    <FiUnlock style={{ marginRight: 6 }} /> Release to AI
                  </ActionButton>
                )}
              </div>

              <MessagesContainer>
                {conversations[selected].map((msg, index) => (
                  <MessageBubble key={index} variant={msg.from}>
                    {msg.text}
                  </MessageBubble>
                ))}
              </MessagesContainer>
              <AdminTextArea
                rows="3"
                placeholder="Write a reply..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // typing indicator with debounce
                  try { setAdminTyping(true); } catch { /* ignore */ }
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(() => {
                    try { setAdminTyping(false); } catch { /* ignore */ }
                  }, 1500);
                }}
                onKeyPress={handleKeyPress}
              />
              <ActionButtons>
                <ActionButton
                  bgColor="#2563eb"
                  onClick={onSend}
                  disabled={sending || !input.trim()}
                >
                  {sending ? 'Sending...' : 'Send Reply'}
                </ActionButton>
                <ActionButton
                  bgColor="#dc3545"
                  onClick={() => onDelete(selected)}
                >
                  Delete <FiTrash2 style={{ marginLeft: "4px" }} />
                </ActionButton>
              </ActionButtons>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#99e6ff' }}>
              <FiMessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h4>Select a conversation</h4>
              <p>Choose a user from the list to view and reply to their messages</p>
            </div>
          )}
        </ChatDetails>
      </ChatListWrapper>
    </ChatDashboardContainer>
  );
};

export default ChatDashboard;
