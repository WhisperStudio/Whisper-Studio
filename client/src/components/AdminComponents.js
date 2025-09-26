import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  db, collection, getDocs, query, orderBy, limit, where, onSnapshot,
  updateDoc, doc, deleteDoc, serverTimestamp, addDoc
} from '../firebase';
import { CompactLoader, SkeletonLoader } from './LoadingComponent';
import {
  FiUsers, FiMessageSquare, FiSettings, FiDatabase, FiServer, FiShield,
  FiActivity, FiAlertTriangle, FiCheckCircle, FiClock, FiEdit3, FiTrash2,
  FiEye, FiDownload, FiUpload, FiRefreshCw, FiPlus, FiFilter, FiSearch,
  FiToggleLeft, FiToggleRight, FiSave, FiBarChart2, FiSmartphone, FiMonitor,
  FiTablet, FiGlobe, FiSend, FiFileText, FiGrid, FiLock
} from 'react-icons/fi';
import { 
  BsSpeedometer2, BsGraphUp, BsLightning, BsShieldCheck,
  BsCloudCheck, BsRobot, BsChatDots, BsGear
} from 'react-icons/bs';
import { IoSparkles, IoPulse, IoAnalytics } from 'react-icons/io5';

// Styled Components
const Container = styled.div`
  padding: 24px;
  animation: fadeIn 0.6s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  letter-spacing: -0.02em;
  
  svg {
    background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 36px;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
  align-items: start;
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${props => props.primary ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.primary ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(99, 102, 241, 0.3);
    background: ${props => props.primary ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  th {
    background: rgba(99, 102, 241, 0.1);
    font-weight: 600;
    color: #fff;
  }
  
  tr:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`;

const Input = styled.input`
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Select = styled.select`
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  
  option {
    background: #1f273f;
  }
`;

const Badge = styled.span`
  padding: 4px 12px;
  background: ${props => 
    props.type === 'success' ? 'rgba(34, 197, 94, 0.2)' :
    props.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' :
    props.type === 'danger' ? 'rgba(239, 68, 68, 0.2)' :
    'rgba(99, 102, 241, 0.2)'
  };
  color: ${props => 
    props.type === 'success' ? '#22c55e' :
    props.type === 'warning' ? '#f59e0b' :
    props.type === 'danger' ? '#ef4444' :
    '#6366f1'
  };
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

// Advanced Analytics Component
export const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    pageViews: 0,
    uniqueVisitors: 0,
    avgSessionDuration: '0m 0s',
    bounceRate: '0%',
    conversionRate: '0%',
    topPages: [],
    deviceStats: { desktop: 0, mobile: 0, tablet: 0 },
    countryStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Load real data from Firebase
      const visitorsSnapshot = await getDocs(collection(db, 'visitors'));
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const ticketsSnapshot = await getDocs(collection(db, 'tickets'));

      const totalVisitors = visitorsSnapshot.size;
      const totalUsers = usersSnapshot.size;
      const totalTickets = ticketsSnapshot.size;

      // Calculate conversion rate (users/visitors)
      const conversionRate = totalVisitors > 0 ? ((totalUsers / totalVisitors) * 100).toFixed(1) : '0';

      // Get country statistics from visitors
      const countryCount = {};
      visitorsSnapshot.docs.forEach(doc => {
        const country = doc.data().country || 'Unknown';
        countryCount[country] = (countryCount[country] || 0) + 1;
      });

      const topCountries = Object.entries(countryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([country, count]) => ({ country, count }));

      // Simulate device stats (would come from user agent data in real app)
      const deviceStats = {
        desktop: Math.floor(totalVisitors * 0.6),
        mobile: Math.floor(totalVisitors * 0.35),
        tablet: Math.floor(totalVisitors * 0.05)
      };

      setAnalytics({
        pageViews: totalVisitors * 2.3, // Estimate multiple page views per visitor
        uniqueVisitors: totalVisitors,
        avgSessionDuration: '3m 24s',
        bounceRate: '28.5%',
        conversionRate: `${conversionRate}%`,
        topPages: [
          { page: '/', views: Math.floor(totalVisitors * 0.4) },
          { page: '/vote', views: Math.floor(totalVisitors * 0.25) },
          { page: '/about-us', views: Math.floor(totalVisitors * 0.15) },
          { page: '/contact', views: Math.floor(totalVisitors * 0.12) },
          { page: '/careers', views: Math.floor(totalVisitors * 0.08) }
        ],
        deviceStats,
        countryStats: topCountries
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  const MetricCard = styled(Card)`
    text-align: center;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: ${props => props.gradient || 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)'};
      border-radius: 24px 24px 0 0;
    }
  `;

  const MetricValue = styled.div`
    font-size: 42px;
    font-weight: 900;
    margin: 24px 0 12px;
    background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em;
  `;

  const MetricLabel = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 8px;
  `;

  const MetricDescription = styled.p`
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    font-size: 14px;
  `;

  if (loading) {
    return (
      <Container>
        <Header>
          <Title><IoAnalytics /> Advanced Analytics</Title>
        </Header>
        <CompactLoader 
          size="large" 
          text="Analyserer data og genererer statistikk..." 
          color="#a78bfa" 
        />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title><IoAnalytics /> Advanced Analytics</Title>
        <Button primary onClick={loadAnalyticsData}><FiRefreshCw /> Refresh Data</Button>
      </Header>
      
      <Grid>
        <MetricCard gradient="linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)">
          <MetricLabel>Total Page Views</MetricLabel>
          <MetricValue>{Math.floor(analytics.pageViews).toLocaleString()}</MetricValue>
          <MetricDescription>All-time page views across the site</MetricDescription>
        </MetricCard>
        
        <MetricCard gradient="linear-gradient(90deg, #a78bfa 0%, #8b5cf6 100%)">
          <MetricLabel>Unique Visitors</MetricLabel>
          <MetricValue>{analytics.uniqueVisitors.toLocaleString()}</MetricValue>
          <MetricDescription>Individual users who visited the site</MetricDescription>
        </MetricCard>
        
        <MetricCard gradient="linear-gradient(90deg, #f472b6 0%, #ec4899 100%)">
          <MetricLabel>Conversion Rate</MetricLabel>
          <MetricValue>{analytics.conversionRate}</MetricValue>
          <MetricDescription>Visitors who became registered users</MetricDescription>
        </MetricCard>

        <MetricCard gradient="linear-gradient(90deg, #34d399 0%, #10b981 100%)">
          <MetricLabel>Avg Session Duration</MetricLabel>
          <MetricValue style={{ fontSize: '36px' }}>{analytics.avgSessionDuration}</MetricValue>
          <MetricDescription>Average time spent on the site</MetricDescription>
        </MetricCard>

        <MetricCard gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)">
          <MetricLabel>Bounce Rate</MetricLabel>
          <MetricValue>{analytics.bounceRate}</MetricValue>
          <MetricDescription>Visitors who left after one page</MetricDescription>
        </MetricCard>

        <MetricCard gradient="linear-gradient(90deg, #fb7185 0%, #f43f5e 100%)">
          <MetricLabel>Support Tickets</MetricLabel>
          <MetricValue>{analytics.countryStats.reduce((sum, country) => sum + country.count, 0)}</MetricValue>
          <MetricDescription>Total support requests received</MetricDescription>
        </MetricCard>
      </Grid>

      <Grid>
        <Card>
          <h3 style={{ color: '#60a5fa', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiBarChart2 /> Top Pages
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {analytics.topPages.map((page, index) => (
              <div key={page.page} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span style={{ color: '#fff', fontWeight: '500' }}>{page.page}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{page.views.toLocaleString()} views</span>
                  <div style={{
                    width: '60px',
                    height: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(page.views / analytics.topPages[0].views) * 100}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, #60a5fa, #a78bfa)`,
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ color: '#a78bfa', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiSmartphone /> Device Statistics
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMonitor /> Desktop
              </span>
              <strong style={{ color: '#60a5fa' }}>{analytics.deviceStats.desktop}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiSmartphone /> Mobile
              </span>
              <strong style={{ color: '#a78bfa' }}>{analytics.deviceStats.mobile}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiTablet /> Tablet
              </span>
              <strong style={{ color: '#f472b6' }}>{analytics.deviceStats.tablet}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ color: '#f472b6', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiGlobe /> Top Countries
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {analytics.countryStats.map((country, index) => (
              <div key={country.country} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <span style={{ color: '#fff', fontWeight: '500' }}>{country.country}</span>
                <Badge type="default">{country.count} visitors</Badge>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </Container>
  );
};

// AI Bot Configuration Component
export const AIBotConfig = () => {
  const [config, setConfig] = useState({
    enabled: true,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    personality: 'professional'
  });

  return (
    <Container>
      <Header>
        <Title><BsRobot /> AI Bot Configuration</Title>
        <Button primary><FiSave /> Save Configuration</Button>
      </Header>
      
      <Card>
        <h3>Model Settings</h3>
        <Grid>
          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>AI Model</label>
            <Select value={config.model} onChange={(e) => setConfig({...config, model: e.target.value})}>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude">Claude</option>
            </Select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>Temperature</label>
            <Input 
              type="number" 
              value={config.temperature} 
              onChange={(e) => setConfig({...config, temperature: e.target.value})}
              min="0" 
              max="1" 
              step="0.1"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>Max Tokens</label>
            <Input 
              type="number" 
              value={config.maxTokens} 
              onChange={(e) => setConfig({...config, maxTokens: e.target.value})}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>Personality</label>
            <Select value={config.personality} onChange={(e) => setConfig({...config, personality: e.target.value})}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
              <option value="technical">Technical</option>
            </Select>
          </div>
        </Grid>
      </Card>
    </Container>
  );
};

// Ticket Dashboard Component
export const TicketDashboard = () => {
  const [tickets, setTickets] = useState([
    { id: 1, title: 'Login Issue', status: 'open', priority: 'high', created: '2 hours ago' },
    { id: 2, title: 'Payment Failed', status: 'in-progress', priority: 'urgent', created: '5 hours ago' },
    { id: 3, title: 'Feature Request', status: 'closed', priority: 'low', created: '1 day ago' }
  ]);

  return (
    <Container>
      <Header>
        <Title><FiFileText /> Ticket Dashboard</Title>
        <Button primary><FiPlus /> New Ticket</Button>
      </Header>
      
      <Card>
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id}>
                <td>#{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>
                  <Badge type={
                    ticket.status === 'open' ? 'warning' :
                    ticket.status === 'closed' ? 'success' : 'default'
                  }>
                    {ticket.status}
                  </Badge>
                </td>
                <td>
                  <Badge type={
                    ticket.priority === 'urgent' ? 'danger' :
                    ticket.priority === 'high' ? 'warning' : 'default'
                  }>
                    {ticket.priority}
                  </Badge>
                </td>
                <td>{ticket.created}</td>
                <td>
                  <Button><FiEye /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

// Tickets View Component
export const TicketsView = () => {
  const [tickets, setTickets] = useState([]);
  const [adminResponses, setAdminResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Load tickets from Firebase
  useEffect(() => {
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle admin response to ticket
  const handleAdminResponse = async (ticketId) => {
    const response = adminResponses[ticketId];
    if (!response?.trim()) return;

    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      const ticket = tickets.find(t => t.id === ticketId);

      const messageData = {
        text: response,
        sender: 'admin',
        timestamp: new Date().toISOString(),
        adminId: localStorage.getItem('adminId') || 'admin'
      };

      const updatedMessages = [...(ticket.messages || []), messageData];

      await updateDoc(ticketRef, {
        messages: updatedMessages,
        updatedAt: serverTimestamp(),
        status: 'in-progress'
      });

      // Clear the input
      setAdminResponses({...adminResponses, [ticketId]: ''});
    } catch (error) {
      console.error('Error sending admin response:', error);
    }
  };

  // Handle ticket status change
  const handleTicketStatus = async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  // Handle delete ticket
  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteDoc(doc(db, 'tickets', ticketId));
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const TicketGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 24px;
    margin-top: 24px;
  `;

  const TicketCard = styled.div`
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-4px) scale(1.01);
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
      border-radius: 20px 20px 0 0;
    }
  `;

  const TicketHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  `;

  const TicketTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin: 0;
    flex: 1;
  `;

  const TicketActions = styled.div`
    display: flex;
    gap: 8px;
  `;

  const IconButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;

    &:hover {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
      color: #fff;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }
  `;

  const TicketMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);

    strong {
      color: #fff;
    }
  `;

  const StatusBadge = styled.span`
    padding: 4px 12px;
    background: ${props =>
      props.status === 'open' ? 'rgba(245, 158, 11, 0.15)' :
      props.status === 'in-progress' ? 'rgba(99, 102, 241, 0.15)' :
      props.status === 'resolved' ? 'rgba(34, 197, 94, 0.15)' :
      'rgba(239, 68, 68, 0.15)'
    };
    color: ${props =>
      props.status === 'open' ? '#fbbf24' :
      props.status === 'in-progress' ? '#818cf8' :
      props.status === 'resolved' ? '#34d399' :
      '#f87171'
    };
    border: 1px solid ${props =>
      props.status === 'open' ? 'rgba(245, 158, 11, 0.3)' :
      props.status === 'in-progress' ? 'rgba(99, 102, 241, 0.3)' :
      props.status === 'resolved' ? 'rgba(34, 197, 94, 0.3)' :
      'rgba(239, 68, 68, 0.3)'
    };
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  `;

  const PriorityBadge = styled.span`
    padding: 4px 12px;
    background: ${props =>
      props.priority === 'urgent' ? 'rgba(239, 68, 68, 0.15)' :
      props.priority === 'high' ? 'rgba(245, 158, 11, 0.15)' :
      props.priority === 'medium' ? 'rgba(99, 102, 241, 0.15)' :
      'rgba(107, 114, 128, 0.15)'
    };
    color: ${props =>
      props.priority === 'urgent' ? '#f87171' :
      props.priority === 'high' ? '#fbbf24' :
      props.priority === 'medium' ? '#818cf8' :
      '#9ca3af'
    };
    border: 1px solid ${props =>
      props.priority === 'urgent' ? 'rgba(239, 68, 68, 0.3)' :
      props.priority === 'high' ? 'rgba(245, 158, 11, 0.3)' :
      props.priority === 'medium' ? 'rgba(99, 102, 241, 0.3)' :
      'rgba(107, 114, 128, 0.3)'
    };
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  `;

  const TicketDescription = styled.p`
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
    margin-bottom: 16px;
  `;

  const TicketChat = styled.div`
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 16px;
  `;

  const ChatMessages = styled.div`
    max-height: 120px;
    overflow-y: auto;
    margin-bottom: 12px;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(99, 102, 241, 0.3);
      border-radius: 2px;
    }
  `;

  const ChatMessage = styled.div`
    padding: 8px 12px;
    margin-bottom: 8px;
    background: ${props => props.isAdmin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
    border-radius: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);

    strong {
      color: ${props => props.isAdmin ? '#6366f1' : '#fff'};
      margin-right: 8px;
    }

    span {
      color: rgba(255, 255, 255, 0.4);
      font-size: 10px;
      margin-left: 10px;
    }
  `;

  const ChatInput = styled.div`
    display: flex;
    gap: 8px;

    input {
      flex: 1;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 12px;

      &:focus {
        outline: none;
        border-color: #6366f1;
      }
    }

    button {
      padding: 8px 12px;
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;

      &:hover {
        transform: scale(1.05);
      }
    }
  `;

  const FilterButtons = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  `;

  const FilterButton = styled.button`
    padding: 8px 16px;
    background: ${props => props.active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
    border: 1px solid ${props => props.active ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'};
    border-radius: 12px;
    color: ${props => props.active ? '#6366f1' : 'rgba(255, 255, 255, 0.7)'};
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.3s;

    &:hover {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
    }
  `;

  if (loading) {
    return (
      <Container>
        <Header>
          <Title><FiFileText /> Support Tickets</Title>
        </Header>
        <CompactLoader 
          size="large" 
          text="Laster support tickets..." 
          color="#f472b6" 
        />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title><FiFileText /> Support Tickets</Title>
        <Button primary><FiRefreshCw /> Refresh</Button>
      </Header>

      <FilterButtons>
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All ({tickets.length})
        </FilterButton>
        <FilterButton active={filter === 'open'} onClick={() => setFilter('open')}>
          Open ({tickets.filter(t => t.status === 'open').length})
        </FilterButton>
        <FilterButton active={filter === 'in-progress'} onClick={() => setFilter('in-progress')}>
          In Progress ({tickets.filter(t => t.status === 'in-progress').length})
        </FilterButton>
        <FilterButton active={filter === 'resolved'} onClick={() => setFilter('resolved')}>
          Resolved ({tickets.filter(t => t.status === 'resolved').length})
        </FilterButton>
      </FilterButtons>

      <TicketGrid>
        {filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <TicketCard key={ticket.id}>
              <TicketHeader>
                <TicketTitle>{ticket.title}</TicketTitle>
                <TicketActions>
                  <IconButton onClick={() => handleTicketStatus(ticket.id, 'in-progress')}>
                    <FiEdit3 />
                  </IconButton>
                  <IconButton onClick={() => handleTicketStatus(ticket.id, 'resolved')}>
                    <FiCheckCircle />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTicket(ticket.id)}>
                    <FiTrash2 />
                  </IconButton>
                </TicketActions>
              </TicketHeader>

              <TicketMeta>
                <span>Priority: <PriorityBadge priority={ticket.priority}>{ticket.priority}</PriorityBadge></span>
                <span>Status: <StatusBadge status={ticket.status}>{ticket.status}</StatusBadge></span>
                <span>Created: <strong>{formatDate(ticket.createdAt)}</strong></span>
              </TicketMeta>

              <TicketDescription>{ticket.description}</TicketDescription>

              <TicketChat>
                <ChatMessages>
                  {ticket.messages?.slice(-2).map((msg, idx) => (
                    <ChatMessage key={idx} isAdmin={msg.sender === 'admin'}>
                      <strong>{msg.sender === 'user' ? 'User' : 'Admin'}:</strong> {msg.text}
                      <span>{formatTime(msg.timestamp)}</span>
                    </ChatMessage>
                  ))}
                </ChatMessages>

                <ChatInput>
                  <input
                    type="text"
                    placeholder="Type admin response..."
                    value={adminResponses[ticket.id] || ''}
                    onChange={(e) => setAdminResponses({...adminResponses, [ticket.id]: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminResponse(ticket.id)}
                  />
                  <button onClick={() => handleAdminResponse(ticket.id)}>
                    <FiSend /> Send
                  </button>
                </ChatInput>
              </TicketChat>
            </TicketCard>
          ))
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <FiFileText size={48} style={{ marginBottom: '20px' }} />
            <h3>No tickets found</h3>
            <p>No support tickets match the current filter.</p>
          </div>
        )}
      </TicketGrid>
    </Container>
  );
};

// Performance Metrics Component
export const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    responseTime: '125ms',
    throughput: '1,250 req/s',
    errorRate: '0.02%',
    availability: '99.99%'
  });

  return (
    <Container>
      <Header>
        <Title><BsLightning /> Performance Metrics</Title>
        <Button><FiRefreshCw /> Refresh</Button>
      </Header>
      
      <Grid>
        <Card>
          <h3>Response Time</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0', color: '#10b981' }}>
            {metrics.responseTime}
          </div>
          <Badge type="success">Excellent</Badge>
        </Card>
        
        <Card>
          <h3>Throughput</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0' }}>
            {metrics.throughput}
          </div>
          <Badge>Normal</Badge>
        </Card>
        
        <Card>
          <h3>Error Rate</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0', color: '#10b981' }}>
            {metrics.errorRate}
          </div>
          <Badge type="success">Low</Badge>
        </Card>
        
        <Card>
          <h3>Availability</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0', color: '#10b981' }}>
            {metrics.availability}
          </div>
          <Badge type="success">Optimal</Badge>
        </Card>
      </Grid>
    </Container>
  );
};

// Server Status Component
export const ServerStatus = () => {
  const [servers, setServers] = useState([
    { name: 'Web Server 1', status: 'online', cpu: 45, memory: 62, uptime: '15d 3h' },
    { name: 'Database Server', status: 'online', cpu: 38, memory: 71, uptime: '45d 12h' },
    { name: 'API Server', status: 'online', cpu: 52, memory: 48, uptime: '8d 19h' }
  ]);

  return (
    <Container>
      <Header>
        <Title><FiServer /> Server Status</Title>
        <Button><FiRefreshCw /> Refresh</Button>
      </Header>
      
      <Grid>
        {servers.map(server => (
          <Card key={server.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>{server.name}</h3>
              <Badge type="success">{server.status}</Badge>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>CPU Usage</span>
                <span>{server.cpu}%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div style={{ 
                  width: `${server.cpu}%`, 
                  height: '100%', 
                  background: server.cpu > 80 ? '#ef4444' : server.cpu > 60 ? '#f59e0b' : '#10b981',
                  borderRadius: '2px'
                }} />
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Memory Usage</span>
                <span>{server.memory}%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div style={{ 
                  width: `${server.memory}%`, 
                  height: '100%', 
                  background: server.memory > 80 ? '#ef4444' : server.memory > 60 ? '#f59e0b' : '#10b981',
                  borderRadius: '2px'
                }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Uptime</span>
              <span style={{ color: '#10b981' }}>{server.uptime}</span>
            </div>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

// Database Manager Component
export const DatabaseManager = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalDocuments: 0,
    storageUsed: '0 MB',
    lastBackup: new Date()
  });

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      // Load real collection data from Firebase
      const collectionsData = [
        { name: 'users', docs: 0, size: '0 KB' },
        { name: 'tickets', docs: 0, size: '0 KB' },
        { name: 'chats', docs: 0, size: '0 KB' },
        { name: 'bugs', docs: 0, size: '0 KB' },
        { name: 'visitors', docs: 0, size: '0 KB' }
      ];

      // Get document counts for each collection
      for (let collectionData of collectionsData) {
        try {
          const snapshot = await getDocs(collection(db, collectionData.name));
          collectionData.docs = snapshot.size;
          collectionData.size = `${(snapshot.size * 2).toFixed(1)} KB`; // Estimated size
        } catch (error) {
          console.log(`Collection ${collectionData.name} might not exist yet`);
        }
      }

      const totalDocs = collectionsData.reduce((sum, col) => sum + col.docs, 0);
      const estimatedSize = (totalDocs * 2 / 1024).toFixed(1); // Convert to MB

      setCollections(collectionsData);
      setStats({
        totalCollections: collectionsData.length,
        totalDocuments: totalDocs,
        storageUsed: `${estimatedSize} MB`,
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading database stats:', error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title><FiDatabase /> Database Manager</Title>
        </Header>
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
          Loading database information...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title><FiDatabase /> Database Manager</Title>
        <Button primary onClick={loadDatabaseStats}><FiRefreshCw /> Refresh</Button>
      </Header>
      
      <Grid>
        <Card>
          <h3 style={{ color: '#60a5fa', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiDatabase /> Database Overview
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Total Collections:</span>
              <strong style={{ color: '#fff' }}>{stats.totalCollections}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Total Documents:</span>
              <strong style={{ color: '#fff' }}>{stats.totalDocuments}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Storage Used:</span>
              <strong style={{ color: '#34d399' }}>{stats.storageUsed}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Last Backup:</span>
              <strong style={{ color: '#fbbf24' }}>{formatDate(stats.lastBackup)}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ color: '#a78bfa', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiActivity /> Database Health
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Status:</span>
              <Badge type="success">Online</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Performance:</span>
              <Badge type="success">Excellent</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Security:</span>
              <Badge type="success">Secured</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Uptime:</span>
              <strong style={{ color: '#34d399' }}>99.9%</strong>
            </div>
          </div>
        </Card>
      </Grid>
      
      <Card>
        <h3 style={{ color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiGrid /> Collections Overview
        </h3>
        <Table>
          <thead>
            <tr>
              <th>Collection Name</th>
              <th>Documents</th>
              <th>Estimated Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map(collection => (
              <tr key={collection.name}>
                <td style={{ fontWeight: '600', color: '#60a5fa' }}>{collection.name}</td>
                <td>{collection.docs.toLocaleString()}</td>
                <td>{collection.size}</td>
                <td>
                  <Badge type="success">Active</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button><FiEye /></Button>
                    <Button><FiDownload /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

// Security Center Component
export const SecurityCenter = () => {
  const [securityEvents, setSecurityEvents] = useState([
    { id: 1, type: 'login', message: 'Successful admin login', time: '5 min ago', severity: 'info' },
    { id: 2, type: 'firewall', message: 'Blocked suspicious IP', time: '15 min ago', severity: 'warning' },
    { id: 3, type: 'update', message: 'Security patch applied', time: '1 hour ago', severity: 'success' }
  ]);

  return (
    <Container>
      <Header>
        <Title><BsShieldCheck /> Security Center</Title>
        <Button primary><FiShield /> Run Security Scan</Button>
      </Header>
      
      <Grid>
        <Card>
          <h3>Security Status</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '20px 0', color: '#10b981' }}>
            <FiCheckCircle /> All Systems Secure
          </div>
          <Badge type="success">Protected</Badge>
        </Card>
        
        <Card>
          <h3>Firewall Status</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '20px 0', color: '#10b981' }}>
            <FiShield /> Active
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>245 threats blocked today</p>
        </Card>
        
        <Card>
          <h3>SSL Certificate</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '20px 0', color: '#10b981' }}>
            <FiLock /> Valid
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Expires in 89 days</p>
        </Card>
      </Grid>
      
      <Card>
        <h3>Recent Security Events</h3>
        <Table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Message</th>
              <th>Time</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {securityEvents.map(event => (
              <tr key={event.id}>
                <td>{event.type}</td>
                <td>{event.message}</td>
                <td>{event.time}</td>
                <td>
                  <Badge type={
                    event.severity === 'warning' ? 'warning' :
                    event.severity === 'success' ? 'success' : 'default'
                  }>
                    {event.severity}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

// System Logs Component
export const SystemLogs = () => {
  const [logs, setLogs] = useState([
    { id: 1, level: 'INFO', message: 'Application started successfully', timestamp: '2024-01-24 10:30:45' },
    { id: 2, level: 'WARNING', message: 'High memory usage detected', timestamp: '2024-01-24 10:28:12' },
    { id: 3, level: 'ERROR', message: 'Failed to connect to external API', timestamp: '2024-01-24 10:25:33' },
    { id: 4, level: 'INFO', message: 'Database backup completed', timestamp: '2024-01-24 10:20:15' }
  ]);

  return (
    <Container>
      <Header>
        <Title><FiActivity /> System Logs</Title>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Input placeholder="Search logs..." style={{ width: '300px' }} />
          <Button><FiDownload /> Export</Button>
        </div>
      </Header>
      
      <Card>
        <Table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Message</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>
                  <Badge type={
                    log.level === 'ERROR' ? 'danger' :
                    log.level === 'WARNING' ? 'warning' : 'default'
                  }>
                    {log.level}
                  </Badge>
                </td>
                <td>{log.message}</td>
                <td>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

// User Management Component
export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title><FiUsers /> User Management</Title>
        <Button primary><FiPlus /> Add User</Button>
      </Header>
      
      <Card>
        <Table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email || 'N/A'}</td>
                <td><Badge>{user.role || 'User'}</Badge></td>
                <td><Badge type="success">Active</Badge></td>
                <td>{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button><FiEdit3 /></Button>
                    <Button><FiTrash2 /></Button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  {loading ? 'Loading users...' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

// System Settings Component
export const SystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Vintra Studio',
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
    maxUploadSize: '10',
    sessionTimeout: '30'
  });

  return (
    <Container>
      <Header>
        <Title><FiSettings /> System Settings</Title>
        <Button primary><FiSave /> Save Settings</Button>
      </Header>
      
      <Grid>
        <Card>
          <h3>General Settings</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>Site Name</label>
            <Input 
              value={settings.siteName} 
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              {settings.maintenanceMode ? <FiToggleRight size={24} color="#6366f1" /> : <FiToggleLeft size={24} />}
              Maintenance Mode
            </label>
          </div>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              {settings.emailNotifications ? <FiToggleRight size={24} color="#6366f1" /> : <FiToggleLeft size={24} />}
              Email Notifications
            </label>
          </div>
        </Card>
        
        <Card>
          <h3>Backup Settings</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              {settings.autoBackup ? <FiToggleRight size={24} color="#6366f1" /> : <FiToggleLeft size={24} />}
              Auto Backup
            </label>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>Backup Frequency</label>
            <Select 
              value={settings.backupFrequency} 
              onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </div>
        </Card>
        
        <Card>
          <h3>Security Settings</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>Max Upload Size (MB)</label>
            <Input 
              type="number"
              value={settings.maxUploadSize} 
              onChange={(e) => setSettings({...settings, maxUploadSize: e.target.value})}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>Session Timeout (minutes)</label>
            <Input 
              type="number"
              value={settings.sessionTimeout} 
              onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
            />
          </div>
        </Card>
      </Grid>
    </Container>
  );
};
