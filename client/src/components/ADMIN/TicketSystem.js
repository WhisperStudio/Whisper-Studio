// src/components/TicketSystem.js
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  db, collection, addDoc, getDocs, query, orderBy, onSnapshot,
  updateDoc, doc, serverTimestamp, where, deleteDoc
} from '../../firebase';
import TicketReplyWindow from '../TicketReplyWindow';
import {
  FiMessageSquare, FiSend, FiPaperclip, FiImage, FiFile,
  FiAlertCircle, FiCheckCircle, FiClock, FiUser, FiTag,
  FiX, FiMaximize2, FiMinimize2, FiMoreVertical, FiEdit3,
  FiTrash2, FiStar, FiFilter, FiSearch, FiBell, FiArchive,
  FiRefreshCw, FiDownload, FiUpload, FiZap, FiShield, FiMessageCircle
} from 'react-icons/fi';
import {
  BsTicketPerforated, BsChatDots, BsExclamationTriangle,
  BsCheckCircleFill, BsClockHistory, BsPerson, BsReply,
  BsStarFill, BsArchive, BsShieldCheck
} from 'react-icons/bs';
import { IoSparkles, IoRocketSharp, IoPulse } from 'react-icons/io5';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
`;

// Main Container
const TicketContainer = styled.div`
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 10050;
  animation: ${fadeIn} 0.5s ease;
`;

// Floating Button
const FloatingButton = styled(motion.button)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
  transition: all 0.3s;
  position: relative;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
  }

  svg {
    font-size: 24px;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  animation: ${pulse} 2s infinite;
`;

// Ticket Window
const TicketWindow = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 400px;
  height: 600px;
  background: rgba(15, 12, 41, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10060;

  @media (max-width: 768px) {
    width: 90vw;
    height: 80vh;
    right: 5vw;
    bottom: 10vh;
  }
`;

// Header
const Header = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: #6366f1;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: scale(1.1);
  }
`;

// Tab Navigation
const TabNav = styled.div`
  display: flex;
  padding: 10px 20px;
  gap: 10px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TabButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.active ? 'rgba(99, 102, 241, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.active ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 10px;
  color: ${props => props.active ? '#6366f1' : 'rgba(255, 255, 255, 0.7)'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
  }
`;

// Content Area
const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
    border-radius: 3px;
  }
`;

// Ticket List
const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TicketCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
`;

const TicketTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 5px;
`;

const TicketMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 10px;
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const ViewButton = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #818cf8;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(99, 102, 241, 0.2);
  }
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  background: ${props =>
    props.status === 'open' ? 'rgba(245, 158, 11, 0.2)' :
    props.status === 'in-progress' ? 'rgba(99, 102, 241, 0.2)' :
    props.status === 'resolved' ? 'rgba(34, 197, 94, 0.2)' :
    'rgba(239, 68, 68, 0.2)'
  };
  color: ${props =>
    props.status === 'open' ? '#f59e0b' :
    props.status === 'in-progress' ? '#6366f1' :
    props.status === 'resolved' ? '#22c55e' :
    '#ef4444'
  };
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const PriorityBadge = styled.span`
  padding: 4px 10px;
  background: ${props =>
    props.priority === 'urgent' ? 'rgba(239, 68, 68, 0.2)' :
    props.priority === 'high' ? 'rgba(245, 158, 11, 0.2)' :
    props.priority === 'medium' ? 'rgba(99, 102, 241, 0.2)' :
    'rgba(107, 114, 128, 0.2)'
  };
  color: ${props =>
    props.priority === 'urgent' ? '#ef4444' :
    props.priority === 'high' ? '#f59e0b' :
    props.priority === 'medium' ? '#6366f1' :
    '#6b7280'
  };
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const TicketDescription = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin-bottom: 10px;
`;

// Create Ticket Form
const CreateForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
`;

const Input = styled.input`
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #6366f1;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #6366f1;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Select = styled.select`
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #6366f1;
    background: rgba(255, 255, 255, 0.08);
  }

  option {
    background: #1f273f;
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Main Component
const TicketSystem = ({ showButton = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyWindowOpen, setReplyWindowOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Determine current userId shared with chat
  const [currentUserId, setCurrentUserId] = useState('');
  
  // Initialize userId
  useEffect(() => {
    let id = localStorage.getItem('enhancedChatUserId') || localStorage.getItem('chatUserId') || localStorage.getItem('userId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('enhancedChatUserId', id);
    }
    setCurrentUserId(id);
  }, []);

  // Load current user's tickets from Firebase
  useEffect(() => {
    if (!currentUserId) return;
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(t => t.userId === currentUserId);
      setTickets(ticketsList);
      const unread = ticketsList.filter(t => t.status === 'open').length;
      setUnreadCount(unread);
    }, (error) => {
      console.error('TicketSystem: Error loading tickets:', error);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Listen for global event to open ticket overlay
  useEffect(() => {
    const openTickets = (e) => {
      setIsOpen(true);
      const detail = e?.detail || {};
      if (detail.tab) setActiveTab(detail.tab);
      setSelectedTicket(null);
      if (detail.formData) {
        setFormData(prev => ({ ...prev, ...detail.formData }));
      }
    };
    window.addEventListener('openTickets', openTickets);
    return () => window.removeEventListener('openTickets', openTickets);
  }, []);

  // Create new ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setLoading(true);
    try {
      const ticketData = {
        ...formData,
        status: 'open',
        userId: currentUserId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messages: []
      };

      await addDoc(collection(db, 'tickets'), ticketData);

      setFormData({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });

      setActiveTab('tickets');
      alert('Ticket opprettet! Du kan nå se den i "My Tickets" fanen.');
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const openReplyWindow = (ticket) => {
    setSelectedTicket(ticket);
    setReplyWindowOpen(true);
    // Lukk panel for å gi plass til reply-vinduet
    setIsOpen(false);
    // Marker ticket som “in-progress” om den er åpen
    if (ticket.status === 'open') {
      const ticketRef = doc(db, 'tickets', ticket.id);
      updateDoc(ticketRef, { status: 'in-progress', updatedAt: serverTimestamp() }).catch(() => {});
    }
  };

  const closeReplyWindow = () => {
    setReplyWindowOpen(false);
    setSelectedTicket(null);
    setIsOpen(true);
  };

  return (
    <>
      <TicketContainer>
        {!isOpen && showButton && (
          <FloatingButton
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
          >
            <BsTicketPerforated />
            {unreadCount > 0 && (
              <NotificationBadge>{unreadCount}</NotificationBadge>
            )}
          </FloatingButton>
        )}
      </TicketContainer>

      <AnimatePresence>
        {isOpen && (
          <TicketWindow
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <Header>
              <HeaderTitle>
                <BsTicketPerforated /> Support Tickets
              </HeaderTitle>
              <HeaderActions>
                <IconButton onClick={() => setIsOpen(false)}>
                  <FiX />
                </IconButton>
              </HeaderActions>
            </Header>

            <TabNav>
              <TabButton
                active={activeTab === 'tickets'}
                onClick={() => setActiveTab('tickets')}
              >
                <FiMessageSquare /> My Tickets
              </TabButton>
              <TabButton
                active={activeTab === 'create'}
                onClick={() => setActiveTab('create')}
              >
                <FiEdit3 /> New Ticket
              </TabButton>
            </TabNav>

            <Content>
              {activeTab === 'tickets' ? (
                <TicketList>
                  {tickets.length > 0 ? (
                    tickets.map(ticket => (
                      <TicketCard
                        key={ticket.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <TicketHeader>
                          <TicketTitle>{ticket.title}</TicketTitle>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <StatusBadge status={ticket.status}>
                              {ticket.status}
                            </StatusBadge>
                            <PriorityBadge priority={ticket.priority}>
                              {ticket.priority}
                            </PriorityBadge>
                          </div>
                        </TicketHeader>
                        <TicketDescription>
                          {ticket.description.substring(0, 100)}{ticket.description.length > 100 ? '...' : ''}
                        </TicketDescription>
                        <TicketMeta>
                          <span><FiClock /> {formatDate(ticket.createdAt)}</span>
                          <span><FiMessageCircle /> {ticket.messages?.length || 0} messages</span>
                        </TicketMeta>
                        <ViewButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            openReplyWindow(ticket);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#818cf8',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            width: '100%',
                            marginTop: '12px',
                            fontSize: '13px'
                          }}
                        >
                          <FiMessageCircle size={14} />
                          Open Reply Window
                        </ViewButton>
                      </TicketCard>
                    ))
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: 'rgba(255,255,255,0.5)'
                    }}>
                      <BsTicketPerforated size={48} style={{ marginBottom: '20px' }} />
                      <p>Ingen tickets ennå</p>
                      <p style={{ fontSize: '14px', marginTop: '10px' }}>
                        Opprett en ticket for å få support
                      </p>
                      <p style={{ fontSize: '12px', marginTop: '20px', color: 'rgba(255,255,255,0.3)' }}>
                        Debug: User ID = {currentUserId}
                      </p>
                    </div>
                  )}
                </TicketList>
              ) : (
                <CreateForm onSubmit={handleCreateTicket}>
                  <FormGroup>
                    <Label>Title</Label>
                    <Input
                      type="text"
                      placeholder="Brief description of your issue"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="options">Options</option>
                      <option value="bug">Bug Report</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Description</Label>
                    <TextArea
                      placeholder="Describe your issue in detail..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </FormGroup>

                  <SubmitButton
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="spin" /> Creating...
                      </>
                    ) : (
                      <>
                        <FiSend /> Create Ticket
                      </>
                    )}
                  </SubmitButton>
                </CreateForm>
              )}
            </Content>
          </TicketWindow>
        )}
      </AnimatePresence>

      {/* Svarvindu i egen overlay */}
      {replyWindowOpen && selectedTicket && (
        <TicketReplyWindow
          ticket={selectedTicket}
          onClose={closeReplyWindow}
        />
      )}
    </>
  );
};

export default TicketSystem;
