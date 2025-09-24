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
  FiLock, FiUnlock, FiSearch, FiFilter, FiGrid, FiList
} from 'react-icons/fi';
import { 
  BsSpeedometer2, BsGraphUp, BsLightning, BsShieldCheck,
  BsCloudCheck, BsRobot, BsChatDots
} from 'react-icons/bs';
import { IoSparkles, IoPulse, IoAnalytics } from 'react-icons/io5';
// Chart imports - uncomment when chart.js is installed
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title as ChartTitle,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js';
// import { Line, Bar, Doughnut } from 'react-chartjs-2';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   ChartTitle,
//   Tooltip,
//   Legend,
//   Filler
// );

// Styled Components
const DashboardContainer = styled.div`
  padding: 20px;
  animation: fadeIn 0.5s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 25px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.color || 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'};
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 15px;
  background: ${props => props.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  margin-bottom: 15px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 15px;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  
  svg {
    font-size: 16px;
  }
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 25px;
  
  ${props => props.fullWidth && `
    grid-column: 1 / -1;
  `}
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
`;

const TabButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const TabButton = styled.button`
  padding: 5px 15px;
  background: ${props => props.active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: ${props => props.active ? '#6366f1' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
  }
`;

const ActivityFeed = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 25px;
  max-height: 500px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(5px);
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.color || 'rgba(99, 102, 241, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor || '#6366f1'};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 500;
  color: #fff;
  margin-bottom: 4px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

// Simple Chart Components (fallback when Chart.js is not installed)
const SimpleChart = ({ data }) => {
  const maxValue = Math.max(...data.datasets[0].data);
  
  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px' }}>
        {data.labels.map((label, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ 
              width: '40px', 
              height: `${(data.datasets[0].data[index] / maxValue) * 180}px`,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '4px 4px 0 0',
              marginBottom: '10px',
              transition: 'height 0.3s'
            }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{label}</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>
              {data.datasets[0].data[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimplePieChart = ({ data }) => {
  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
  const colors = ['#667eea', '#ec4899', '#22c55e'];
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ 
          width: '150px', 
          height: '150px', 
          borderRadius: '50%',
          background: `conic-gradient(
            ${colors[0]} 0deg ${(data.datasets[0].data[0] / total) * 360}deg,
            ${colors[1]} ${(data.datasets[0].data[0] / total) * 360}deg ${((data.datasets[0].data[0] + data.datasets[0].data[1]) / total) * 360}deg,
            ${colors[2]} ${((data.datasets[0].data[0] + data.datasets[0].data[1]) / total) * 360}deg 360deg
          )`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {data.labels.map((label, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '2px',
              background: colors[index]
            }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              {label} ({Math.round((data.datasets[0].data[index] / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Component
export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    revenue: 0,
    serverUptime: '99.9%',
    userGrowth: '+12.5%',
    chatGrowth: '+8.2%',
    revenueGrowth: '+25.4%',
    uptimeStatus: 'Stable'
  });
  
  const [activities, setActivities] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load real data from Firebase
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const chatsSnapshot = await getDocs(collection(db, 'chats'));
      const bugsSnapshot = await getDocs(collection(db, 'bugs'));
      
      // Calculate stats
      const totalUsers = usersSnapshot.size;
      const activeChats = chatsSnapshot.size;
      const revenue = Math.floor(Math.random() * 50000) + 10000; // Simulated
      
      setStats({
        totalUsers,
        activeChats,
        revenue,
        serverUptime: '99.9%',
        userGrowth: '+12.5%',
        chatGrowth: '+8.2%',
        revenueGrowth: '+25.4%',
        uptimeStatus: 'Stable'
      });
      
      // Generate recent activities
      const recentActivities = [
        { id: 1, type: 'user', title: 'New user registered', time: new Date(), icon: <FiUsers /> },
        { id: 2, type: 'chat', title: 'Chat session started', time: new Date(Date.now() - 300000), icon: <FiMessageSquare /> },
        { id: 3, type: 'system', title: 'System backup completed', time: new Date(Date.now() - 600000), icon: <FiCheckCircle /> },
        { id: 4, type: 'alert', title: 'High traffic detected', time: new Date(Date.now() - 900000), icon: <FiAlertCircle /> },
        { id: 5, type: 'update', title: 'Database optimized', time: new Date(Date.now() - 1200000), icon: <FiDatabase /> }
      ];
      
      setActivities(recentActivities);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const chartData = {
    labels: chartPeriod === 'day' 
      ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
      : chartPeriod === 'week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Users',
        data: chartPeriod === 'day'
          ? [65, 59, 80, 81, 56, 95]
          : chartPeriod === 'week'
          ? [120, 150, 180, 220, 280, 350, 400]
          : [1200, 1500, 1800, 2200],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4
      },
      {
        label: 'Chats',
        data: chartPeriod === 'day'
          ? [28, 48, 40, 19, 86, 27]
          : chartPeriod === 'week'
          ? [80, 100, 120, 140, 180, 200, 250]
          : [800, 1000, 1200, 1400],
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4
      }
    ]
  };

  const doughnutData = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [{
      data: [65, 30, 5],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  return (
    <DashboardContainer>
      <HeaderSection>
        <Title>
          <BsSpeedometer2 /> Dashboard Overview
        </Title>
        <ActionButtons>
          <ActionButton onClick={loadDashboardData}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton>
            <FiDownload /> Export
          </ActionButton>
        </ActionButtons>
      </HeaderSection>

      <StatsGrid>
        <StatCard color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <StatIcon color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <FiUsers />
          </StatIcon>
          <StatValue>{stats.totalUsers.toLocaleString()}</StatValue>
          <StatLabel>Total Users</StatLabel>
          <StatChange positive>
            <FiTrendingUp /> {stats.userGrowth}
          </StatChange>
        </StatCard>

        <StatCard color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          <StatIcon color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <FiMessageSquare />
          </StatIcon>
          <StatValue>{stats.activeChats}</StatValue>
          <StatLabel>Active Chats</StatLabel>
          <StatChange positive>
            <FiTrendingUp /> {stats.chatGrowth}
          </StatChange>
        </StatCard>

        <StatCard color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
          <StatIcon color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <FiDollarSign />
          </StatIcon>
          <StatValue>${stats.revenue.toLocaleString()}</StatValue>
          <StatLabel>Revenue</StatLabel>
          <StatChange positive>
            <FiTrendingUp /> {stats.revenueGrowth}
          </StatChange>
        </StatCard>

        <StatCard color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
          <StatIcon color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
            <FiActivity />
          </StatIcon>
          <StatValue>{stats.serverUptime}</StatValue>
          <StatLabel>Server Uptime</StatLabel>
          <StatChange positive>
            <FiCheckCircle /> {stats.uptimeStatus}
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsSection>
        <ChartCard>
          <ChartHeader>
            <ChartTitle>User & Chat Activity</ChartTitle>
            <TabButtons>
              <TabButton active={chartPeriod === 'day'} onClick={() => setChartPeriod('day')}>Day</TabButton>
              <TabButton active={chartPeriod === 'week'} onClick={() => setChartPeriod('week')}>Week</TabButton>
              <TabButton active={chartPeriod === 'month'} onClick={() => setChartPeriod('month')}>Month</TabButton>
            </TabButtons>
          </ChartHeader>
          <SimpleChart data={chartData} />
        </ChartCard>

        <ChartCard>
          <ChartHeader>
            <ChartTitle>Device Distribution</ChartTitle>
          </ChartHeader>
          <SimplePieChart data={doughnutData} />
        </ChartCard>
      </ChartsSection>

      <ActivityFeed>
        <ChartHeader>
          <ChartTitle>Recent Activity</ChartTitle>
          <ActionButton>
            <FiFilter /> Filter
          </ActionButton>
        </ChartHeader>
        {activities.map(activity => (
          <ActivityItem key={activity.id}>
            <ActivityIcon 
              color={
                activity.type === 'user' ? 'rgba(99, 102, 241, 0.2)' :
                activity.type === 'chat' ? 'rgba(236, 72, 153, 0.2)' :
                activity.type === 'system' ? 'rgba(34, 197, 94, 0.2)' :
                'rgba(239, 68, 68, 0.2)'
              }
              iconColor={
                activity.type === 'user' ? '#6366f1' :
                activity.type === 'chat' ? '#ec4899' :
                activity.type === 'system' ? '#22c55e' :
                '#ef4444'
              }
            >
              {activity.icon}
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>{activity.title}</ActivityTitle>
              <ActivityTime>{formatTime(activity.time)}</ActivityTime>
            </ActivityContent>
          </ActivityItem>
        ))}
      </ActivityFeed>
    </DashboardContainer>
  );
};

// Export other dashboard components
export const RealtimeMonitor = () => {
  const [systemStats, setSystemStats] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkTraffic: 125,
    activeConnections: 234,
    requestsPerSecond: 1250
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats({
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        diskUsage: Math.floor(Math.random() * 100),
        networkTraffic: Math.floor(Math.random() * 500),
        activeConnections: Math.floor(Math.random() * 500),
        requestsPerSecond: Math.floor(Math.random() * 2000)
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardContainer>
      <Title>
        <IoPulse /> Real-time System Monitor
      </Title>
      <StatsGrid>
        <StatCard>
          <StatIcon color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <FiCpu />
          </StatIcon>
          <StatValue>{systemStats.cpuUsage}%</StatValue>
          <StatLabel>CPU Usage</StatLabel>
          <div style={{ marginTop: '10px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div style={{ 
              width: `${systemStats.cpuUsage}%`, 
              height: '100%', 
              background: systemStats.cpuUsage > 80 ? '#ef4444' : systemStats.cpuUsage > 60 ? '#f59e0b' : '#10b981',
              borderRadius: '2px',
              transition: 'width 0.3s'
            }} />
          </div>
        </StatCard>

        <StatCard>
          <StatIcon color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <FiHardDrive />
          </StatIcon>
          <StatValue>{systemStats.memoryUsage}%</StatValue>
          <StatLabel>Memory Usage</StatLabel>
          <div style={{ marginTop: '10px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div style={{ 
              width: `${systemStats.memoryUsage}%`, 
              height: '100%', 
              background: systemStats.memoryUsage > 80 ? '#ef4444' : systemStats.memoryUsage > 60 ? '#f59e0b' : '#10b981',
              borderRadius: '2px',
              transition: 'width 0.3s'
            }} />
          </div>
        </StatCard>

        <StatCard>
          <StatIcon color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <FiDatabase />
          </StatIcon>
          <StatValue>{systemStats.diskUsage}%</StatValue>
          <StatLabel>Disk Usage</StatLabel>
          <div style={{ marginTop: '10px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div style={{ 
              width: `${systemStats.diskUsage}%`, 
              height: '100%', 
              background: '#10b981',
              borderRadius: '2px',
              transition: 'width 0.3s'
            }} />
          </div>
        </StatCard>

        <StatCard>
          <StatIcon color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
            <FiWifi />
          </StatIcon>
          <StatValue>{systemStats.networkTraffic} MB/s</StatValue>
          <StatLabel>Network Traffic</StatLabel>
          <StatChange positive>
            <FiActivity /> Active
          </StatChange>
        </StatCard>
      </StatsGrid>
    </DashboardContainer>
  );
};

export default DashboardOverview;
