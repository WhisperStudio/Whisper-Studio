import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  db, collection, getDocs, query, orderBy, limit, where, onSnapshot,
  updateDoc, doc, deleteDoc, serverTimestamp, addDoc
} from '../firebase';
import { 
  FiUsers, FiMessageSquare, FiDollarSign, FiActivity, FiTrendingUp,
  FiServer, FiDatabase, FiCpu, FiHardDrive, FiWifi, FiShield,
  FiAlertCircle, FiCheckCircle, FiClock, FiRefreshCw, FiDownload,
  FiEye, FiEdit3, FiTrash2, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiLock, FiUnlock, FiSearch, FiFilter, FiGrid, FiList, FiSettings,
  FiFileText, FiPlus, FiX, FiBell, FiUser, FiKey, FiToggleLeft,
  FiToggleRight, FiSave, FiUpload
} from 'react-icons/fi';
import { 
  BsSpeedometer2, BsGraphUp, BsLightning, BsShieldCheck,
  BsCloudCheck, BsRobot, BsChatDots, BsGear
} from 'react-icons/bs';
import { IoSparkles, IoPulse, IoAnalytics } from 'react-icons/io5';

// Styled Components
const Container = styled.div`
  padding: 20px;
  animation: fadeIn 0.5s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 15px;
  
  svg {
    color: #6366f1;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.primary ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.primary ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
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
    pageViews: 125432,
    uniqueVisitors: 45678,
    avgSessionDuration: '3m 45s',
    bounceRate: '32.5%',
    conversionRate: '4.8%'
  });

  return (
    <Container>
      <Header>
        <Title><IoAnalytics /> Advanced Analytics</Title>
        <Button primary><FiDownload /> Export Report</Button>
      </Header>
      
      <Grid>
        <Card>
          <h3>Traffic Overview</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0' }}>
            {analytics.pageViews.toLocaleString()}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Total Page Views</p>
        </Card>
        
        <Card>
          <h3>User Engagement</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0' }}>
            {analytics.avgSessionDuration}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Avg Session Duration</p>
        </Card>
        
        <Card>
          <h3>Conversion Metrics</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0' }}>
            {analytics.conversionRate}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Conversion Rate</p>
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
  return <TicketDashboard />;
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
  const [databases, setDatabases] = useState([
    { name: 'Main Database', size: '2.5 GB', tables: 45, connections: 12 },
    { name: 'Analytics DB', size: '850 MB', tables: 18, connections: 5 },
    { name: 'Cache DB', size: '120 MB', tables: 8, connections: 25 }
  ]);

  return (
    <Container>
      <Header>
        <Title><FiDatabase /> Database Manager</Title>
        <Button primary><FiPlus /> New Database</Button>
      </Header>
      
      <Card>
        <Table>
          <thead>
            <tr>
              <th>Database Name</th>
              <th>Size</th>
              <th>Tables</th>
              <th>Active Connections</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {databases.map(db => (
              <tr key={db.name}>
                <td>{db.name}</td>
                <td>{db.size}</td>
                <td>{db.tables}</td>
                <td>{db.connections}</td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button><FiEye /></Button>
                    <Button><FiEdit3 /></Button>
                    <Button><FiTrash2 /></Button>
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
