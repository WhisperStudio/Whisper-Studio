import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Chart } from 'react-google-charts';
import { db, collectionGroup, getDocs } from '../firebase';

const ChartContainer = styled.div`
  background: #0b1121;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 30px 40px rgba(0, 0, 0, 0.25);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatCard = styled.div`
  background: #152238;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #003366;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #00ddff;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #99e6ff;
  font-size: 0.9rem;
`;

const ChatPieChart = () => {
  const [chartData, setChartData] = useState([['Type', 'Count']]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    userMessages: 0,
    adminMessages: 0,
    botMessages: 0,
    totalChats: 0,
    activeChats: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChatStats = async () => {
      try {
        setLoading(true);
        console.log('ChatPieChart: Loading chat statistics...');

        // Get all messages
        const messagesSnapshot = await getDocs(collectionGroup(db, 'messages'));
        console.log('ChatPieChart: Found total messages:', messagesSnapshot.size);

        let userCount = 0;
        let adminCount = 0;
        let botCount = 0;
        const uniqueUsers = new Set();
        const activeUsers = new Set();
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        messagesSnapshot.forEach(doc => {
          const data = doc.data();
          const sender = data.sender;
          const userId = data.userId || data.uid || data.user_id;
          const timestamp = data.timestamp?.toDate() || new Date(data.timestamp?.seconds * 1000) || new Date();

          // Count message types
          if (sender === 'user') {
            userCount++;
          } else if (sender === 'admin') {
            adminCount++;
          } else if (sender === 'bot') {
            botCount++;
          }

          // Track unique users
          if (userId) {
            uniqueUsers.add(userId);
            
            // Check if user was active in last 24 hours
            if (timestamp > oneDayAgo) {
              activeUsers.add(userId);
            }
          }
        });

        const newStats = {
          totalMessages: messagesSnapshot.size,
          userMessages: userCount,
          adminMessages: adminCount,
          botMessages: botCount,
          totalChats: uniqueUsers.size,
          activeChats: activeUsers.size
        };

        setStats(newStats);

        // Prepare pie chart data
        const pieData = [
          ['Type', 'Count'],
          ['User Messages', userCount],
          ['Admin Messages', adminCount],
          ['Bot Messages', botCount]
        ];

        setChartData(pieData);
        setLoading(false);

        console.log('ChatPieChart: Stats loaded:', newStats);

      } catch (error) {
        console.error('ChatPieChart: Error loading stats:', error);
        setLoading(false);
      }
    };

    loadChatStats();

    // Refresh every 30 seconds
    const interval = setInterval(loadChatStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const pieOptions = {
    title: 'Message Distribution',
    titleTextStyle: {
      color: '#ffffff',
      fontSize: 18,
      bold: true
    },
    backgroundColor: '#0b1121',
    legend: {
      textStyle: { color: '#ffffff' },
      position: 'bottom'
    },
    colors: ['#00ddff', '#ff6b6b', '#4CAF50'],
    pieSliceTextStyle: {
      color: '#ffffff',
      fontSize: 12
    },
    chartArea: {
      left: 20,
      top: 60,
      width: '90%',
      height: '70%'
    }
  };

  if (loading) {
    return (
      <ChartContainer>
        <h3 style={{ color: '#00ddff', margin: '0 0 1rem 0' }}>
          📊 Chat Statistics
        </h3>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#99e6ff' }}>
          Loading statistics...
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <h3 style={{ color: '#00ddff', margin: '0 0 1rem 0' }}>
        📊 Chat Statistics
      </h3>
      
      <div style={{ height: '400px', marginBottom: '1rem' }}>
        <Chart
          chartType="PieChart"
          width="100%"
          height="100%"
          data={chartData}
          options={pieOptions}
        />
      </div>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.totalMessages}</StatNumber>
          <StatLabel>Total Messages</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber>{stats.totalChats}</StatNumber>
          <StatLabel>Total Chats</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber>{stats.activeChats}</StatNumber>
          <StatLabel>Active (24h)</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber>{stats.userMessages}</StatNumber>
          <StatLabel>User Messages</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber>{stats.adminMessages}</StatNumber>
          <StatLabel>Admin Replies</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber>{stats.botMessages}</StatNumber>
          <StatLabel>Bot Responses</StatLabel>
        </StatCard>
      </StatsGrid>
    </ChartContainer>
  );
};

export default ChatPieChart;
