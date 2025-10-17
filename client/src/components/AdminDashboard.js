import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { 
  db, collection, getDocs
} from '../firebase';
import { CompactLoader } from './LoadingComponent';
import {
  FiUsers, FiMessageSquare, FiTrendingUp, FiCheckCircle, FiAlertCircle,
  FiRefreshCw, FiFilter, FiFileText, FiActivity, FiDollarSign, FiDownload
} from 'react-icons/fi';
import { BsSpeedometer2 } from 'react-icons/bs';
import { IoPulse } from 'react-icons/io5';

/* ===================== Styled Components ===================== */
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

  svg { font-size: 16px; }
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

  ${props => props.fullWidth && `grid-column: 1 / -1;`}
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

  &:hover { background: rgba(99, 102, 241, 0.1); }
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

  &:hover { background: rgba(255, 255, 255, 0.06); }

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 3px; }
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

  &:last-child { margin-bottom: 0; }
`;

const ActivityIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${props => props.color || 'rgba(99, 102, 241, 0.2)'};
  display: flex; align-items: center; justify-content: center;
  color: ${props => props.iconColor || '#6366f1'};
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ActivityContent = styled.div` flex: 1; `;
const ActivityTitle = styled.div` font-weight: 600; color: #fff; margin-bottom: 6px; font-size: 15px; `;
const ActivityTime = styled.div` font-size: 13px; color: rgba(255, 255, 255, 0.6); font-weight: 500; `;

/* ---------- Gauge layout (sentrert, runde kort) ---------- */
const GaugeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const GaugeCard = styled.div`
  background: radial-gradient(120% 120% at 50% 0%, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 28px;
  padding: 20px 18px 14px;
  backdrop-filter: blur(18px);
  position: relative;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(0,0,0,.25);
    transition: 180ms ease;
  }
`;

const GaugeHolder = styled.div`
  width: 100%;
  max-width: 360px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GaugeCaption = styled.div`
  margin-top: 8px;
  font-size: 13px;
  font-weight: 800;
  color: rgba(233, 231, 255, 0.9);
  letter-spacing: .04em;
  text-transform: uppercase;
  text-align: center;
`;

/* ===================== EGEN GAUGE (SVG) – FIXED NEEDLE ===================== */

const GaugeWrap = styled.div`
  width: ${p => p.$size || 260}px;
  height: ${(p) => (p.$size || 260) * 0.58}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const defaultZones = [
  { from: 0,   to: 60,  color: "#22c55e" },
  { from: 60,  to: 85,  color: "#f59e0b" },
  { from: 85,  to: 100, color: "#ef4444" },
];

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function lerp(a,b,t){ return a+(b-a)*t; }

const Gauge = ({
  value = 0,
  min = 0,
  max = 100,
  size = 260,
  faceColor = "#2b2450",
  rimColor  = "#3a2f56",
  trackColor = "rgba(255,255,255,0.08)",
  tickColor = "#d9d6ff",
  needleColor = "#7c3aed",
  pinColor = "#0ea5e9",
  zones = defaultZones,
  label,
  showTicks = true,
  majorTicks = 5,
  animate = true,
  format = (v)=>String(Math.round(v)),
}) => {
  const w = size;
  const h = Math.round(size * 0.58);
  const cx = w / 2;
  const cy = h * 0.95;
  const rFace = Math.min(cx, cy) - 6;
  const rRingOuter = rFace;
  const rRingInner = rFace - 18;

  const startAngle = -120;
  const endAngle = 120;

  const norm = clamp((value - min) / (max - min), 0, 1);
  const angle = lerp(startAngle, endAngle, norm);

  const toXY = (ang, r) => {
    // her er 0° = opp; positivt med klokka (matcher øvrig tegning)
    const t = (ang - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  };

  const arcPath = (r, a0, a1) => {
    const [x0, y0] = toXY(a0, r);
    const [x1, y1] = toXY(a1, r);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };

  const ringSlice = (a0, a1) => {
    const [xo0, yo0] = toXY(a0, rRingOuter);
    const [xo1, yo1] = toXY(a1, rRingOuter);
    const [xi1, yi1] = toXY(a1, rRingInner);
    const [xi0, yi0] = toXY(a0, rRingInner);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `
      M ${xo0} ${yo0}
      A ${rRingOuter} ${rRingOuter} 0 ${large} 1 ${xo1} ${yo1}
      L ${xi1} ${yi1}
      A ${rRingInner} ${rRingInner} 0 ${large} 0 ${xi0} ${yi0}
      Z
    `;
  };

  const zonePaths = React.useMemo(() => {
    return (zones || defaultZones).map((z, i) => {
      const a0 = lerp(startAngle, endAngle, clamp((z.from - min) / (max - min), 0, 1));
      const a1 = lerp(startAngle, endAngle, clamp((z.to   - min) / (max - min), 0, 1));
      return { d: ringSlice(a0, a1), color: z.color, key: i };
    });
  }, [zones, min, max, size]);

  const ticks = React.useMemo(() => {
    if (!showTicks || majorTicks < 2) return [];
    const arr = [];
    for (let i = 0; i < majorTicks; i++) {
      const t = i / (majorTicks - 1);
      const ang = lerp(startAngle, endAngle, t);
      const [x0, y0] = toXY(ang, rRingInner - 6);
      const [x1, y1] = toXY(ang, rRingInner - 16);
      const [xl, yl] = toXY(ang, rRingInner - 26);
      const label = format(lerp(min, max, t));
      arr.push({ x0, y0, x1, y1, xl, yl, label, key: i });
    }
    return arr;
  }, [showTicks, majorTicks, min, max, size, format]);

  // Nåla lages i LOKALE koordinater rundt (0,0) og roteres/translator som gruppe
  const needleLength = rRingInner - 12;
  const needleWidth = 6;
  const needlePoints = [
    [-needleWidth, 0],          // venstre ved senter
    [0, -needleLength],         // spiss oppover (0°)
    [needleWidth, 0],           // høyre ved senter
  ].map(([x,y]) => `${x},${y}`).join(' ');

  return (
    <GaugeWrap $size={size} aria-label={label || "Gauge"}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="custom-gauge">
        {/* Skive */}
        <path d={arcPath(rFace, startAngle, endAngle)} stroke="none" fill={faceColor} />
        {/* Ytterring */}
        <path d={arcPath(rFace + 4, startAngle, endAngle)} stroke={rimColor} strokeWidth="8" fill="none" opacity="0.9" />

        {/* Track */}
        <path d={ringSlice(startAngle, endAngle)} fill={trackColor} />

        {/* Sonefyll */}
        {zonePaths.map(z => <path key={z.key} d={z.d} fill={z.color} />)}

        {/* Ticks */}
        {ticks.map(t => (
          <g key={t.key}>
            <line x1={t.x0} y1={t.y0} x2={t.x1} y2={t.y1} stroke="#d9d6ff" strokeWidth="2" />
            <text x={t.xl} y={t.yl} fill={tickColor} fontSize="10" textAnchor="middle" dominantBaseline="middle">
              {t.label}
            </text>
          </g>
        ))}

        {/* Nåla + pin – korrekt sentrert */}
        <g
          transform={`translate(${cx},${cy}) rotate(${angle})`}
          style={{ transition: animate ? 'transform 380ms ease-in-out' : 'none' }}
        >
          <polygon points={needlePoints} fill={needleColor} stroke="rgba(0,0,0,.35)" strokeWidth="1" />
          <circle cx="0" cy="0" r="8" fill={pinColor} stroke="rgba(0,0,0,0.35)" strokeWidth="2" />
        </g>

        {/* Verdi (ligger over pin) */}
        <text x={cx} y={cy - 20} fill="#efeaff" fontSize="24" fontWeight="700" textAnchor="middle">
          {format(value)}
        </text>
      </svg>
    </GaugeWrap>
  );
};


/* ===================== Dashboard Overview ===================== */
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
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const chatsSnapshot = await getDocs(collection(db, 'chats'));
      const bugsSnapshot = await getDocs(collection(db, 'bugs'));
      const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
      const visitorsSnapshot = await getDocs(collection(db, 'visitors'));

      const totalUsers = usersSnapshot.size;
      const activeChats = chatsSnapshot.size;
      const totalTickets = ticketsSnapshot.size;
      const totalVisitors = visitorsSnapshot.size;

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
        revenue: totalTickets * 150,
        serverUptime: '99.9%',
        userGrowth: `+${userGrowth}%`,
        chatGrowth: `+${Math.floor(Math.random() * 15) + 5}%`,
        revenueGrowth: `+${Math.floor(Math.random() * 30) + 10}%`,
        uptimeStatus: 'Excellent'
      });

      const recentActivities = [];
      let activityId = 1;

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

      recentActivities.push({
        id: activityId++,
        type: 'system',
        title: 'Database backup completed',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: <FiCheckCircle />
      });

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

  const chartData = {
    labels: chartPeriod === 'day' 
      ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
      : chartPeriod === 'week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      { label: 'Users', data: chartPeriod === 'day' ? [65,59,80,81,56,95] : chartPeriod === 'week' ? [120,150,180,220,280,350,400] : [1200,1500,1800,2200] },
      { label: 'Chats', data: chartPeriod === 'day' ? [28,48,40,19,86,27] : chartPeriod === 'week' ? [80,100,120,140,180,200,250] : [800,1000,1200,1400] }
    ]
  };

  const doughnutData = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [{ data: [65,30,5], backgroundColor: ['rgba(99,102,241,0.8)','rgba(236,72,153,0.8)','rgba(34,197,94,0.8)'], borderWidth: 0 }]
  };

  if (loading) {
    return (
      <DashboardContainer>
        <HeaderSection>
          <Title><BsSpeedometer2 /> Dashboard Overview</Title>
          <ActionButtons>
            <ActionButton onClick={loadDashboardData}><FiRefreshCw /> Refresh</ActionButton>
            <ActionButton><FiDownload /> Export</ActionButton>
          </ActionButtons>
        </HeaderSection>
        <CompactLoader size="large" text="Laster dashboard data..." color="#60a5fa" />
      </DashboardContainer>
    );
  }

  // Enkle fallback-graf-komponenter (uten chart.js)
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
    const total = data.datasets[0].data.reduce((a,b)=>a+b,0);
    const colors = ['#667eea','#ec4899','#22c55e'];
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '150px', height: '150px', borderRadius: '50%',
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
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: colors[index] }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                {label} ({Math.round((data.datasets[0].data[index] / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardContainer>
      <HeaderSection>
        <Title><BsSpeedometer2 /> Dashboard Overview</Title>
        <ActionButtons>
          <ActionButton onClick={loadDashboardData}><FiRefreshCw /> Refresh</ActionButton>
          <ActionButton><FiDownload /> Export</ActionButton>
        </ActionButtons>
      </HeaderSection>

      <StatsGrid>
        <StatCard color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <StatIcon color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"><FiUsers /></StatIcon>
          <StatValue>{stats.totalUsers.toLocaleString()}</StatValue>
          <StatLabel>Total Users</StatLabel>
          <StatChange positive><FiTrendingUp /> {stats.userGrowth}</StatChange>
        </StatCard>

        <StatCard color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          <StatIcon color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"><FiMessageSquare /></StatIcon>
          <StatValue>{stats.activeChats}</StatValue>
          <StatLabel>Active Chats</StatLabel>
          <StatChange positive><FiTrendingUp /> {stats.chatGrowth}</StatChange>
        </StatCard>

        <StatCard color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
          <StatIcon color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"><FiDollarSign /></StatIcon>
          <StatValue>${stats.revenue.toLocaleString()}</StatValue>
          <StatLabel>Revenue</StatLabel>
          <StatChange positive><FiTrendingUp /> {stats.revenueGrowth}</StatChange>
        </StatCard>

        <StatCard color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
          <StatIcon color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"><FiActivity /></StatIcon>
          <StatValue>{stats.serverUptime}</StatValue>
          <StatLabel>Server Uptime</StatLabel>
          <StatChange positive><FiCheckCircle /> {stats.uptimeStatus}</StatChange>
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
          <ChartHeader><ChartTitle>Device Distribution</ChartTitle></ChartHeader>
          <SimplePieChart data={doughnutData} />
        </ChartCard>
      </ChartsSection>

      <ActivityFeed>
        <ChartHeader>
          <ChartTitle>Recent Activity</ChartTitle>
          <ActionButton><FiFilter /> Filter</ActionButton>
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
              <ActivityTime>{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ActivityTime>
            </ActivityContent>
          </ActivityItem>
        ))}
      </ActivityFeed>
    </DashboardContainer>
  );
};

/* ===================== Realtime Monitor (Custom SVG Gauges) ===================== */
export const RealtimeMonitor = () => {
  const [systemStats, setSystemStats] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkTraffic: 125, // MB/s (0–500)
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats({
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        diskUsage: Math.floor(Math.random() * 100),
        networkTraffic: Math.floor(Math.random() * 500),
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const netPct = clamp((systemStats.networkTraffic / 500) * 100, 0, 100);

  const gaugeProps = {
    size: 260,
    faceColor: "#2b2450",
    rimColor: "#3a2f56",
    trackColor: "rgba(255,255,255,0.08)",
    tickColor: "#d9d6ff",
    needleColor: "#7c3aed",
    pinColor: "#0ea5e9",
    zones: defaultZones,
    majorTicks: 5,
    animate: true,
  };

  return (
    <DashboardContainer>
      <Title><IoPulse /> Real-time System Monitor</Title>

      <GaugeGrid>
        <GaugeCard>
          <GaugeHolder>
            <Gauge {...gaugeProps} value={systemStats.memoryUsage} label="Memory" />
          </GaugeHolder>
          <GaugeCaption>Memory Usage</GaugeCaption>
        </GaugeCard>

        <GaugeCard>
          <GaugeHolder>
            <Gauge {...gaugeProps} value={systemStats.cpuUsage} label="CPU" />
          </GaugeHolder>
          <GaugeCaption>CPU Usage</GaugeCaption>
        </GaugeCard>

        <GaugeCard>
          <GaugeHolder>
            <Gauge {...gaugeProps} value={systemStats.diskUsage} label="Disk" />
          </GaugeHolder>
          <GaugeCaption>Disk Usage</GaugeCaption>
        </GaugeCard>

        <GaugeCard>
          <GaugeHolder>
            <Gauge
              {...gaugeProps}
              value={netPct}
              label="Network"
              format={(v) => `${Math.round((v/100)*500)} MB/s`}
            />
          </GaugeHolder>
          <GaugeCaption>Network (0–500 MB/s)</GaugeCaption>
        </GaugeCard>
      </GaugeGrid>
    </DashboardContainer>
  );
};

export default DashboardOverview;
