import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  db, collection, getDocs, query, orderBy, limit, where, onSnapshot,
  updateDoc, doc, deleteDoc, serverTimestamp, addDoc
} from '../firebase';
import {
  FiUsers, FiMessageSquare, FiBarChart2, FiTrendingUp, FiClock,
  FiCheckCircle, FiAlertCircle, FiRefreshCw, FiFilter, FiEdit3,
  FiTrash2, FiSend, FiDatabase, FiFileText, FiActivity, FiDollarSign,
  FiDownload, FiCpu, FiHardDrive, FiWifi
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
  padding: 24px;
  min-height: 100vh;
  background: transparent;
  animation: fadeIn 0.6s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const HeaderSection = styled.div`
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
  font-size: 36px;
  font-weight: 900;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  letter-spacing: -0.02em;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 16px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.3);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
    background: rgba(255, 255, 255, 0.06);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)'};
    border-radius: 24px 24px 0 0;
  }
`;

const StatIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: ${props => props.color || 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
`;

const StatLabel = styled.div`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
  font-weight: 500;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.positive ? '#34d399' : '#f87171'};
  background: ${props => props.positive ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)'};
  padding: 6px 12px;
  border-radius: 12px;
  
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
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.06);
  }
  
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
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0;
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
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  max-height: 600px;
  overflow-y: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
    border-radius: 3px;
  }
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateX(8px);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActivityIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${props => props.color || 'rgba(99, 102, 241, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor || '#6366f1'};
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
  font-size: 15px;
`;

const ActivityTime = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
`;

// Ticket Management Styles
const TicketSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const TicketGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
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
    height: 2px;
    background: linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
    border-radius: 20px 20px 0 0;
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const TicketTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  flex: 1;
`;

const TicketActions = styled.div`
  display: flex;
  gap: 8px;
`;

const TicketMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);

  strong {
    color: #fff;
  }
`;

const TicketDescription = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin-bottom: 15px;
`;

const TicketChat = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 15px;
`;

const ChatMessages = styled.div`
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 15px;

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
  gap: 10px;

  input {
    flex: 1;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #fff;
    font-size: 12px;

    &:focus {
      outline: none;
      border-color: #6366f1;
    }
  }

  button {
    padding: 8px 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
`;

const SectionActions = styled.div`
  display: flex;
  gap: 10px;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  font-size: 16px;

  &:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
    color: #fff;
    transform: scale(1.1);
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
  }
  
  &:active {
    transform: scale(1.05);
  }
`;

const StatusBadge = styled.span`
  padding: 6px 14px;
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
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(10px);
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

// Simple Chart Components (fallback when Chart.js is not installed)
const SimpleChart = ({ data }) => {
  const maxValue = Math.max(...data.datasets[0].data);

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px' }}>
        {data.labels.map((label, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: '30px',
              height: `${(data.datasets[0].data[index] / maxValue) * 150}px`,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.3s'
            }} />
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>{label}</div>
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
    uptimeStatus: 'Excellent'
  });

  const [activities, setActivities] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('day');
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
      const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
      const visitorsSnapshot = await getDocs(collection(db, 'visitors'));

      // Calculate stats
      const totalUsers = usersSnapshot.size;
      const activeChats = chatsSnapshot.size;
      const totalTickets = ticketsSnapshot.size;
      const totalVisitors = visitorsSnapshot.size;

      // Calculate growth rates based on recent data
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentUsers = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt;
        return createdAt && createdAt.toDate() > lastWeek;
      }).length;

      const userGrowth = totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(1) : '0';

      setStats({
        totalUsers,
        activeChats,
        revenue: totalTickets * 150, // Simulated revenue based on tickets
        serverUptime: '99.9%',
        userGrowth: `+${userGrowth}%`,
        chatGrowth: `+${Math.floor(Math.random() * 15) + 5}%`,
        revenueGrowth: `+${Math.floor(Math.random() * 30) + 10}%`,
        uptimeStatus: 'Excellent'
      });

      // Generate real recent activities from Firebase data
      const recentActivities = [];
      let activityId = 1;

      // Add recent user registrations
      const recentUserDocs = usersSnapshot.docs
        .filter(doc => doc.data().createdAt)
        .sort((a, b) => b.data().createdAt.toDate() - a.data().createdAt.toDate())
        .slice(0, 2);

      recentUserDocs.forEach(doc => {
        recentActivities.push({
          id: activityId++,
          type: 'user',
          title: `New user registered: ${doc.data().email || 'Anonymous'}`,
          time: doc.data().createdAt.toDate(),
          icon: <FiUsers />
        });
      });

      // Add recent tickets
      const recentTicketDocs = ticketsSnapshot.docs
        .filter(doc => doc.data().createdAt)
        .sort((a, b) => b.data().createdAt.toDate() - a.data().createdAt.toDate())
        .slice(0, 2);

      recentTicketDocs.forEach(doc => {
        recentActivities.push({
          id: activityId++,
          type: 'ticket',
          title: `New support ticket: ${doc.data().title}`,
          time: doc.data().createdAt.toDate(),
          icon: <FiFileText />
        });
      });

      // Add recent bug reports
      const recentBugDocs = bugsSnapshot.docs
        .filter(doc => doc.data().timestamp)
        .sort((a, b) => b.data().timestamp.toDate() - a.data().timestamp.toDate())
        .slice(0, 2);

      recentBugDocs.forEach(doc => {
        recentActivities.push({
          id: activityId++,
          type: 'bug',
          title: `Bug report: ${doc.data().title || 'Issue reported'}`,
          time: doc.data().timestamp.toDate(),
          icon: <FiAlertCircle />
        });
      });

      // Add system activities
      recentActivities.push({
        id: activityId++,
        type: 'system',
        title: 'Database backup completed',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        icon: <FiCheckCircle />
      });

      // Sort by time and take the most recent 5
      const sortedActivities = recentActivities
        .sort((a, b) => b.time - a.time)
        .slice(0, 5);

      setActivities(sortedActivities);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
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
                activity.type === 'ticket' ? 'rgba(245, 158, 11, 0.2)' :
                activity.type === 'bug' ? 'rgba(239, 68, 68, 0.2)' :
                activity.type === 'system' ? 'rgba(34, 197, 94, 0.2)' :
                'rgba(107, 114, 128, 0.2)'
              }
              iconColor={
                activity.type === 'user' ? '#6366f1' :
                activity.type === 'chat' ? '#ec4899' :
                activity.type === 'ticket' ? '#f59e0b' :
                activity.type === 'bug' ? '#ef4444' :
                activity.type === 'system' ? '#22c55e' :
                '#6b7280'
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
