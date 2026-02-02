import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import {
  db, collection, getDocs
} from '../../firebase';
import { CompactLoader } from '../LoadingComponent';
import {
  FiUsers, FiMessageSquare, FiTrendingUp, FiCheckCircle, FiAlertCircle,
  FiRefreshCw, FiFilter, FiFileText, FiDownload
} from 'react-icons/fi';
import { BsSpeedometer2 } from 'react-icons/bs';
import { IoPulse } from 'react-icons/io5';

// ===================== CHART.JS IMPORTER =====================
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title as ChartTitleElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  ChartTitleElement,
  Tooltip,
  Legend
);
// ==============================================================

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
  background: rgba(255, 255, 255, 0.05); /* Dypere base */
  backdrop-filter: blur(30px); /* Mer blur */
  border: 1px solid rgba(255, 255, 255, 0.1); /* Tydeligere kant */
  border-radius: 28px; /* Mer avrundet */
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5); /* Dypere skygge */
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
  background: rgba(255, 255, 255, 0.02); /* Litt lysere base */
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.06); 
  border-radius: 28px; /* Mer avrundet */
  padding: 32px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* Lett initial skygge */


  &:hover {
    transform: translateY(-12px) scale(1.02); /* Mer dramatisk løft */
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
    background: rgba(255, 255, 255, 0.08); /* Lysere ved hover */
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)'};
    border-radius: 28px 28px 0 0;
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

// Oppdatert StatChange for å støtte negative/positive props
const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => (props.positive ? '#34d399' : props.negative ? '#f87171' : 'rgba(255,255,255,0.7)')};
  background: ${props => (props.positive ? 'rgba(52, 211, 153, 0.1)' : props.negative ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255,255,255,0.1)')};
  padding: 6px 12px;
  border-radius: 12px;

  svg { font-size: 16px; }
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px; /* Mer avrundet */
  padding: 32px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 400px; 
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); 

  &:hover {
    transform: translateY(-6px); 
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
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
  border-radius: 28px;
  padding: 32px;
  max-height: 600px;
  overflow-y: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); 


  &:hover { background: rgba(255, 255, 255, 0.06); }

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
    border-radius: 4px;
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); 


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

/* ===================== EGEN GAUGE (SVG) – UENDRET ===================== */

const GaugeWrap = styled.div`
  width: ${p => p.$size || 260}px;
  height: ${(p) => (p.$size || 260) * 0.58}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const defaultZones = [
  { from: 0,   to: 60,  color: "#22c55e" },
  { from: 60,  to: 85,  color: "#f59e0b" },
  { from: 85,  to: 100, color: "#ef4444" },
];

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function lerp(a,b,t){ return a+(b-a)*t; }

const Gauge = ({
  value = 0,
  min = 0,
  max = 100,
  size = 260,
  faceColor = "#2b2450",
  rimColor  = "#3a2f56",
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

  const toXY = React.useCallback((ang, r) => {
    const t = (ang - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  }, [cx, cy]);

  const arcPath = React.useCallback((r, a0, a1) => {
    const [x0, y0] = toXY(a0, r);
    const [x1, y1] = toXY(a1, r);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  }, [toXY]);

  const ringSlice = React.useCallback((a0, a1) => {
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
  }, [toXY, rRingOuter, rRingInner]);

  const zonePaths = React.useMemo(() => {
    return (zones || defaultZones).map((z, i) => {
      const a0 = lerp(startAngle, endAngle, clamp((z.from - min) / (max - min), 0, 1));
      const a1 = lerp(startAngle, endAngle, clamp((z.to   - min) / (max - min), 0, 1));
      return { d: ringSlice(a0, a1), color: z.color, key: i };
    });
  }, [zones, min, max, ringSlice, startAngle]);

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
  }, [showTicks, majorTicks, min, max, format, rRingInner, startAngle, endAngle, toXY]);

  const needleLength = rRingInner - 12;
  const needleWidth = 6;
  const needlePoints = [
    [-needleWidth, 0],
    [0, -needleLength],
    [needleWidth, 0],
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
    totalTickets: 0, // Nytt felt
    totalBugs: 0,    // Nytt felt
    recentBugs: 0,   // Nytt felt
    
    userGrowth: '+0.0%',
    chatGrowth: '+0.0%',
    ticketGrowth: '+0.0%', // Nytt vekstfelt
  });

  const [activities, setActivities] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000); 
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const chatsSnapshot = await getDocs(collection(db, 'chats'));
      const bugsSnapshot = await getDocs(collection(db, 'bugs'));
      const ticketsSnapshot = await getDocs(collection(db, 'tickets'));

      const totalUsers = usersSnapshot.size;
      const activeChats = chatsSnapshot.size;
      const totalTickets = ticketsSnapshot.size;
      const totalBugs = bugsSnapshot.size;

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      // Brukervekst
      const currentPeriodUsers = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt;
        return createdAt && createdAt.toDate() > oneWeekAgo;
      }).length;
      const previousPeriodUsers = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt;
        return createdAt && createdAt.toDate() > twoWeeksAgo && createdAt.toDate() <= oneWeekAgo;
      }).length;

      let userGrowth = 0;
      if (previousPeriodUsers > 0) {
        userGrowth = ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100;
      } else if (currentPeriodUsers > 0) {
        userGrowth = 100;
      }
      const userGrowthString = `${userGrowth >= 0 ? '+' : ''}${userGrowth.toFixed(1)}%`;
      
      // Bugs som krever oppmerksomhet (siste 24 timer)
      const recentBugs = bugsSnapshot.docs.filter(doc => {
          const timestamp = doc.data().timestamp;
          // Sjekker om tidsstempelet er nyere enn 24 timer siden
          return timestamp && timestamp.toDate().getTime() > (now.getTime() - 24 * 60 * 60 * 1000);
      }).length;

      // Simulerer vekst for tickets og chats
      const randomChatGrowth = (Math.random() * 10 - 2).toFixed(1); 
      const randomTicketGrowth = (Math.random() * 15 - 5).toFixed(1); 

      setStats({
        totalUsers,
        activeChats,
        totalTickets, 
        totalBugs,
        recentBugs,
        
        userGrowth: userGrowthString,
        chatGrowth: `${randomChatGrowth >= 0 ? '+' : ''}${randomChatGrowth}%`,
        ticketGrowth: `${randomTicketGrowth >= 0 ? '+' : ''}${randomTicketGrowth}%`,
      });

      // Aktivitetssimulering (uendret)
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
          title: `New support ticket: ${doc.data().title || 'Support issue'}`,
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
        title: 'System check completed',
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

  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.7)' } },
      y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)' } },
    },
    plugins: {
      legend: { labels: { color: '#fff', boxWidth: 12, padding: 20 } },
      tooltip: { bodyColor: '#fff', titleColor: '#fff', backgroundColor: 'rgba(0,0,0,0.8)', padding: 10 },
    },
  }), []);
  
  const doughnutOptions = useMemo(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: { position: 'right', labels: { color: '#fff', padding: 20, boxWidth: 12 } },
          tooltip: { bodyColor: '#fff', titleColor: '#fff', backgroundColor: 'rgba(0,0,0,0.8)', padding: 10 },
      },
      cutout: '70%',
  }), []);


  const chartData = useMemo(() => {
    const labels = chartPeriod === 'day'
      ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
      : chartPeriod === 'week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    const datasets = [
      {
        label: 'Users',
        data: chartPeriod === 'day' ? [65, 59, 80, 81, 56, 95] : chartPeriod === 'week' ? [120, 150, 180, 220, 280, 350, 400] : [1200, 1500, 1800, 2200],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1',
      },
      {
        label: 'Chats',
        data: chartPeriod === 'day' ? [28, 48, 40, 19, 86, 27] : chartPeriod === 'week' ? [80, 100, 120, 140, 180, 200, 250] : [800, 1000, 1200, 1400],
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ec4899',
      }
    ];

    return { labels, datasets };
  }, [chartPeriod]);

  const doughnutData = useMemo(() => ({
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [{ 
      data: [65, 30, 5], 
      backgroundColor: ['#6366f1', '#ec4899', '#22c55e'], 
      borderColor: 'rgba(255, 255, 255, 0.1)', 
      borderWidth: 1 
    }]
  }), []);


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
        {/* KORT 1: Total Users (Beholdt) */}
        <StatCard color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <StatIcon color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"><FiUsers /></StatIcon>
          <StatValue>{stats.totalUsers.toLocaleString()}</StatValue>
          <StatLabel>Total Users</StatLabel>
          <StatChange positive={stats.userGrowth.charAt(0) === '+'}>{stats.userGrowth.charAt(0) === '+' ? <FiTrendingUp /> : <FiTrendingUp style={{ transform: 'rotate(180deg)' }} />} {stats.userGrowth}</StatChange>
        </StatCard>

        {/* KORT 2: Active Chats (Beholdt) */}
        <StatCard color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          <StatIcon color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"><FiMessageSquare /></StatIcon>
          <StatValue>{stats.activeChats}</StatValue>
          <StatLabel>Active Chats</StatLabel>
          <StatChange positive={stats.chatGrowth.charAt(0) === '+'}>{stats.chatGrowth.charAt(0) === '+' ? <FiTrendingUp /> : <FiTrendingUp style={{ transform: 'rotate(180deg)' }} />} {stats.chatGrowth}</StatChange>
        </StatCard>
        
        {/* NYTT KORT 3: Total Tickets (Erstatter Revenue) */}
        <StatCard color="linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)">
          <StatIcon color="linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)"><FiFileText /></StatIcon>
          <StatValue>{stats.totalTickets.toLocaleString()}</StatValue>
          <StatLabel>Total Support Tickets</StatLabel>
          <StatChange positive={stats.ticketGrowth.charAt(0) === '+'}>{stats.ticketGrowth.charAt(0) === '+' ? <FiTrendingUp /> : <FiTrendingUp style={{ transform: 'rotate(180deg)' }} />} {stats.ticketGrowth}</StatChange>
        </StatCard>

        {/* NYTT KORT 4: Bug Reports (Erstatter Server Uptime) */}
        <StatCard color="linear-gradient(135deg, #ef4444 0%, #f97316 100%)">
          <StatIcon color="linear-gradient(135deg, #ef4444 0%, #f97316 100%)"><FiAlertCircle /></StatIcon>
          <StatValue>{stats.totalBugs}</StatValue>
          <StatLabel>Total Bug Reports</StatLabel>
          {/* Positiv når det ikke er nye bugs, negativ når det er nye bugs */}
          <StatChange positive={stats.recentBugs === 0} negative={stats.recentBugs > 0}>
              {stats.recentBugs > 0 ? <FiAlertCircle /> : <FiCheckCircle />} 
              {stats.recentBugs} issues (24h)
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
          <div style={{ flexGrow: 1, minHeight: '280px' }}>
            <Line options={lineChartOptions} data={chartData} />
          </div>
        </ChartCard>

        <ChartCard>
          <ChartHeader><ChartTitle>Device Distribution</ChartTitle></ChartHeader>
          <div style={{ flexGrow: 1, minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '300px', height: '100%' }}>
              <Doughnut options={doughnutOptions} data={doughnutData} />
            </div>
          </div>
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
                activity.type === 'ticket' ? 'rgba(245, 158, 11, 0.2)' :
                activity.type === 'bug' ? 'rgba(239, 68, 68, 0.2)' :
                activity.type === 'system' ? 'rgba(34, 197, 94, 0.2)' :
                'rgba(107, 114, 128, 0.2)'
              }
              iconColor={
                activity.type === 'user' ? '#6366f1' :
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

/* ===================== Realtime Monitor (Custom SVG Gauges) - UENDRET ===================== */
export const RealtimeMonitor = () => {
  const [systemStats, setSystemStats] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkTraffic: 125, // MB/s (0–500)
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prevStats => ({
        // Små tilfeldige svingninger for å simulere sanntid, klamper for å holde i realistisk område (0-100 eller 0-500)
        cpuUsage: clamp(prevStats.cpuUsage + Math.floor(Math.random() * 10 - 5), 0, 100),
        memoryUsage: clamp(prevStats.memoryUsage + Math.floor(Math.random() * 8 - 4), 0, 100),
        diskUsage: clamp(prevStats.diskUsage + Math.floor(Math.random() * 6 - 3), 0, 100),
        networkTraffic: clamp(prevStats.networkTraffic + Math.floor(Math.random() * 50 - 25), 0, 500),
      }));
    }, 1500); 
    return () => clearInterval(interval);
  }, []);

  const netPct = clamp((systemStats.networkTraffic / 500) * 100, 0, 100);

  const gaugeProps = useMemo(() => ({
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
  }), []);

  return (
    <DashboardContainer>
      <Title><IoPulse /> Real-time System Monitor</Title>

      <GaugeGrid>
        <GaugeCard>
          <GaugeHolder>
            <Gauge {...gaugeProps} value={systemStats.memoryUsage} label="Memory" />
          </GaugeHolder>
          <GaugeCaption>Memory Usage ({systemStats.memoryUsage.toFixed(0)}%)</GaugeCaption>
        </GaugeCard>

        <GaugeCard>
          <GaugeHolder>
            <Gauge {...gaugeProps} value={systemStats.cpuUsage} label="CPU" />
          </GaugeHolder>
          <GaugeCaption>CPU Usage ({systemStats.cpuUsage.toFixed(0)}%)</GaugeCaption>
        </GaugeCard>

        <GaugeCard>
          <GaugeHolder>
            <Gauge {...gaugeProps} value={systemStats.diskUsage} label="Disk" />
          </GaugeHolder>
          <GaugeCaption>Disk Usage ({systemStats.diskUsage.toFixed(0)}%)</GaugeCaption>
        </GaugeCard>

        <GaugeCard>
          <GaugeHolder>
            <Gauge
              {...gaugeProps}
              value={netPct}
              label="Network"
              min={0}
              max={100}
              format={(v) => `${systemStats.networkTraffic.toFixed(0)} MB/s`}
              zones={[
                { from: 0,   to: 50,  color: "#22c55e" }, 
                { from: 50,  to: 80,  color: "#f59e0b" }, 
                { from: 80,  to: 100, color: "#ef4444" }, 
              ]}
            />
          </GaugeHolder>
          <GaugeCaption>Network Traffic (0–500 MB/s)</GaugeCaption>
        </GaugeCard>
      </GaugeGrid>
    </DashboardContainer>
  );
};

export default DashboardOverview;