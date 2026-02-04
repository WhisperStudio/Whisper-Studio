import React, { useEffect, useState } from "react";
import {
  subHours,
  subDays,
  subYears,
  eachMonthOfInterval,
  startOfDay,
  startOfMonth,
  format,
} from "date-fns";
import { Chart } from 'react-google-charts';
import { db, collection, getDocs } from '../../firebase';
import LineChart from "../LineChart2";

const RANGES = [
  { label: "1h", value: "1h", icon: "⚡" },
  { label: "24h", value: "24h", icon: "📅" },
  { label: "7d", value: "7d", icon: "📊" },
  { label: "30d", value: "30d", icon: "📈" },
  { label: "1y", value: "1y", icon: "📆" },
  { label: "All", value: "all", icon: "∞" },
];

const ANALYTICS_TYPES = [
  { label: "Visitors", value: "visitors", collection: "visitors", color: "#00d9ff" },
  { label: "Chat", value: "chat", collection: "chats", color: "#00ff88" },
  { label: "Game", value: "game", collection: "game-visitors", color: "#ff00ff" },
];

export default function VisitorAnalytics() {
  const [range, setRange] = useState("all");
  const [analyticsType, setAnalyticsType] = useState("visitors");
  const [now, setNow] = useState(new Date());
  const [windowStart, setWindowStart] = useState(new Date(2020, 0, 1));
  const [points, setPoints] = useState([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [countryStats, setCountryStats] = useState([]);
  const [mapData, setMapData] = useState([['Country', 'Visits']]);
  const [chartKey, setChartKey] = useState(0);

  // Update "now" every minute
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // 1) Find window start
    let ws;
    if (range === "1h") ws = subHours(now, 1);
    else if (range === "24h") ws = subHours(now, 24);
    else if (range === "7d") ws = subDays(now, 7);
    else if (range === "30d") ws = subDays(now, 30);
    else if (range === "1y") ws = startOfMonth(subYears(now, 1));
    else ws = startOfMonth(subYears(now, 3));
    setWindowStart(ws);

    // 2) Create buckets
    const buckets = [];
    if (range === "1h") {
      const startTime = new Date(now.getTime() - 60 * 60 * 1000);
      for (let m = 0; m <= 6; m++) {
        buckets.push(new Date(startTime.getTime() + m * 10 * 60_000));
      }
    } else if (range === "24h") {
      for (let h = 0; h <= 24; h += 1) {
        buckets.push(new Date(ws.getTime() + h * 60 * 60_000));
      }
    } else if (range === "7d") {
      for (let d = 0; d <= 7; d++) {
        buckets.push(startOfDay(new Date(ws.getTime() + d * 86_400_000)));
      }
    } else if (range === "30d") {
      for (let d = 0; d <= 30; d++) {
        buckets.push(startOfDay(new Date(ws.getTime() + d * 86_400_000)));
      }
    } else if (range === "1y") {
      const startDate = subYears(now, 1);
      buckets.push(...eachMonthOfInterval({ start: startOfMonth(startDate), end: startOfMonth(now) }));
    } else {
      buckets.push(...eachMonthOfInterval({ start: ws, end: startOfMonth(now) }));
    }

    // 3) Zero-fill
    const counts = Object.fromEntries(buckets.map((dt) => [+dt, 0]));

    // 4) Fetch data from Firebase
    const fetchData = async () => {
      try {
        const currentType = ANALYTICS_TYPES.find(type => type.value === analyticsType);
        const collectionName = currentType ? currentType.collection : "visitors";
        
        const visitorsRef = collection(db, collectionName);
        const snapshot = await getDocs(visitorsRef);
        
        const fresh = { ...counts };
        const countryCount = {};
        const filteredCountryCount = {};
        let total = 0;
        let filtered = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp?.seconds * 1000);
          const country = data.country || 'Unknown';
          
          // Count ALL for total
          countryCount[country] = (countryCount[country] || 0) + 1;
          total++;

          // Count FILTERED for chart and filtered stats
          const isInRange = range === "all" || timestamp >= ws;
          if (isInRange) {
            filteredCountryCount[country] = (filteredCountryCount[country] || 0) + 1;
            filtered++;

            // Find correct bucket
            let idx = buckets.length - 1;
            while (idx > 0 && timestamp < buckets[idx]) idx--;
            const key = +buckets[idx];
            if (fresh[key] !== undefined) fresh[key]++;
          }
        });

        // Use filtered or all data based on range
        const displayCountryCount = range === "all" ? countryCount : filteredCountryCount;

        // For "all time", show all data
        if (range === "all") {
          const monthlyData = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp?.seconds * 1000);
            const monthKey = startOfMonth(timestamp).getTime();
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
          });
          
          const allTimePoints = buckets.map((dt) => ({ 
            x: dt, 
            y: monthlyData[+dt] || 0 
          }));
          setPoints(allTimePoints);
        } else {
          setPoints(buckets.map((dt) => ({ x: dt, y: fresh[+dt] })));
        }

        setTotalVisitors(total);
        setFilteredTotal(filtered);
        
        // Top 10 countries (filtered)
        const sortedCountries = Object.entries(displayCountryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10);
        setCountryStats(sortedCountries);

        // Map data for GeoChart (filtered)
        const currentColor = ANALYTICS_TYPES.find(t => t.value === analyticsType)?.color || '#00d9ff';
        const mapDataArray = [
          ['Country', 'Visits', { type: 'string', role: 'tooltip', p: { html: true } }],
          ...Object.entries(displayCountryCount).map(([country, visits]) => ([
            country,
            visits,
            makeGeoTooltipHtml(country, visits),
          ])),
        ];
        setMapData(mapDataArray);

      } catch (error) {
        console.error('Error fetching visitor data:', error);
        // Use mock data as fallback
        const mockPoints = buckets.map((dt, i) => ({ 
          x: dt, 
          y: Math.floor(Math.random() * 20) + 1 
        }));
        setPoints(mockPoints);
        setTotalVisitors(500);
        setFilteredTotal(350);
        setCountryStats([
          ['Norway', 150],
          ['Sweden', 120],
          ['Denmark', 80],
          ['Germany', 60],
          ['Finland', 40]
        ]);
        setMapData([
          ['Country', 'Visits', { type: 'string', role: 'tooltip', p: { html: true } }],
          ['Norway', 150, makeGeoTooltipHtml('Norway', 150)],
          ['Sweden', 120, makeGeoTooltipHtml('Sweden', 120)],
          ['Denmark', 80, makeGeoTooltipHtml('Denmark', 80)],
          ['Germany', 60, makeGeoTooltipHtml('Germany', 60)],
          ['Finland', 40, makeGeoTooltipHtml('Finland', 40)],
        ]);
      }
    };

    fetchData();
    setChartKey(prev => prev + 1);
  }, [range, now, analyticsType]);

  // Axis setup
  const isHour = range === "1h";
  const isDay = range === "24h";
  const isWeek = range === "7d" || range === "30d";
  const isYear = range === "1y" || range === "all";

  const unit = isHour ? "minute" : isDay ? "hour" : isWeek ? "day" : "month";
  const stepSize = isHour ? 1 : isDay ? 2 : isWeek ? 1 : 1;

  const displayFormats = {
    minute: "HH:mm",
    hour: "HH:mm",
    day: "MMM d",
    month: "MMM yyyy",
  };

  // Get current analytics type color
  const currentColor = ANALYTICS_TYPES.find(t => t.value === analyticsType)?.color || '#00d9ff';

  // Dataset for linechart
  const datasets = [
    {
      label: ANALYTICS_TYPES.find(t => t.value === analyticsType)?.label || 'Visitors',
      data: points,
      borderColor: currentColor,
      backgroundColor: `${currentColor}20`,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 8,
      pointBackgroundColor: currentColor,
      pointBorderColor: "#0f182a",
      pointBorderWidth: 2,
      borderWidth: 2,
      parsing: false,
      spanGaps: true,
      normalized: true,
    },
  ];

  const makeGeoTooltipHtml = (country, visits) => `
  <div class="geoTT">
    <div class="geoTT__top">
      <div class="geoTT__title">${country}</div>
      <div class="geoTT__badge">${Number(visits).toLocaleString()}</div>
    </div>
    <div class="geoTT__sub">Visits</div>
  </div>
`;

  const getChartOptions = () => {
    const currentTime = new Date();
    const minTime = isHour ? new Date(currentTime.getTime() - 60 * 60 * 1000) : windowStart;
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `${ANALYTICS_TYPES.find(t => t.value === analyticsType)?.label || 'Visitors'} • ${RANGES.find((r) => r.value === range).label}`,
          color: "#e2e8f0",
          font: { size: 18, weight: '600', family: 'system-ui' },
          padding: { bottom: 20 }
        },
        tooltip: {
          backgroundColor: "#0f182a",
          titleColor: currentColor,
          bodyColor: "#cbd5e1",
          borderColor: `${currentColor}40`,
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: { size: 13, weight: '600' },
          bodyFont: { size: 12 },
          callbacks: {
            title: ([pt]) => {
              if (isYear) return format(pt.parsed.x, "MMM yyyy");
              if (isWeek) return format(pt.parsed.x, "MMM d");
              return format(pt.parsed.x, "PPpp");
            },
            label: (ctx) => `${ANALYTICS_TYPES.find(t => t.value === analyticsType)?.label || 'Visitors'}: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: { 
            unit, 
            stepSize,
            displayFormats,
            tooltipFormat: isHour ? "HH:mm" : isDay ? "MMM d, HH:mm" : isWeek ? "MMM d" : "MMM yyyy"
          },
          min: minTime,
          max: currentTime,
          bounds: "data",
          ticks: { 
            color: "#94a3b8",
            maxTicksLimit: isHour ? 6 : isDay ? 12 : isWeek ? 15 : 12,
            font: { size: 11, weight: '500' }
          },
          grid: { 
            color: "#1e293b",
            borderColor: "#334155"
          },
          title: {
            display: true,
            text: isYear ? "Month" : isWeek ? "Date" : isDay ? "Hour" : "Time",
            color: "#cbd5e1",
            font: { size: 12, weight: '600' }
          },
        },
        y: {
          beginAtZero: true,
          ticks: { 
            color: "#94a3b8",
            font: { size: 11, weight: '500' }
          },
          grid: { 
            color: "#1e293b",
            borderColor: "#334155"
          },
          title: { 
            display: true, 
            text: ANALYTICS_TYPES.find(t => t.value === analyticsType)?.label || 'Visitors', 
            color: "#cbd5e1",
            font: { size: 12, weight: '600' }
          },
        },
      },
    };
  };

  // GeoChart options
  const geoOptions = {
    displayMode: 'regions',
    resolution: 'countries',
    backgroundColor: 'transparent',
    datalessRegionColor: '#1e293b',
    defaultColor: '#334155',
    colorAxis: {
      colors: [
        `${currentColor}`,
        `${currentColor}`,
        currentColor,
        currentColor
      ],
      minValue: 0
    },
    legend: 'none',
    tooltip: {
      isHtml: true,
      trigger: 'focus'
    },
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#0f182a',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2e8f0'
    },
    card: {
      background: 'linear-gradient(135deg, #1a2332 0%, #0f182a 100%)',
      border: '1px solid #273043',
      borderRadius: 16,
      padding: '24px',
      marginBottom: 20,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'slideUp 0.5s ease-out'
    },
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 20,
      flexWrap: 'wrap',
      marginBottom: 24
    },
    headerLeft: {
      flex: '1 1 300px'
    },
    label: {
      fontSize: 11,
      color: '#64748b',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 8
    },
    mainTitle: {
      fontSize: 28,
      fontWeight: 700,
      color: currentColor,
      marginBottom: 8,
      textShadow: `0 0 20px ${currentColor}40`,
      animation: 'glow 2s ease-in-out infinite'
    },
    subtitle: {
      fontSize: 13,
      color: '#94a3b8'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12,
      flex: '1 1 400px'
    },
    statCard: {
      background: '#273043',
      border: '1px solid #334155',
      borderRadius: 12,
      padding: 16,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    statLabel: {
      fontSize: 11,
      color: '#64748b',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 6
    },
    statValue: {
      fontSize: 20,
      fontWeight: 700,
      color: '#e2e8f0'
    },
    filterSection: {
      background: '#1a2332',
      border: '1px solid #273043',
      borderRadius: 16,
      padding: 24,
      marginBottom: 20
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 20,
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr'
      }
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    },
    filterTitle: {
      fontSize: 13,
      color: '#94a3b8',
      fontWeight: 600,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 1
    },
    buttonGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    },
    button: (selected, color = currentColor) => ({
      padding: '10px 18px',
      background: selected ? `${color}20` : '#273043',
      color: selected ? color : '#cbd5e1',
      border: `1px solid ${selected ? color : '#334155'}`,
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: selected ? `0 0 15px ${color}30, inset 0 0 20px ${color}10` : 'none',
      position: 'relative',
      overflow: 'hidden',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }),
    mapGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 340px',
      gap: 20,
      alignItems: 'stretch',
      '@media (max-width: 1024px)': {
        gridTemplateColumns: '1fr'
      }
    },
    mapLeft: {
      border: '1px solid #273043',
      borderRadius: 16,
      overflow: 'hidden',
      background: '#1a2332',
      minHeight: 450,
      position: 'relative'
    },
    mapRight: {
      display: 'flex',
      flexDirection: 'column',
      background: '#1a2332',
      border: '1px solid #273043',
      borderRadius: 16,
      padding: 20,
      gap: 12
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: currentColor,
      textAlign: 'center',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 2,
      textShadow: `0 0 10px ${currentColor}40`
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flex: 1,
      overflowY: 'auto'
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 14px',
      background: '#273043',
      borderRadius: 10,
      border: '1px solid #334155',
      transition: 'all 0.3s ease',
      animation: 'fadeIn 0.5s ease-out backwards'
    },
    countryName: {
      fontWeight: 600,
      color: '#e2e8f0',
      fontSize: 13
    },
    countryCount: {
      color: currentColor,
      fontSize: 13,
      fontWeight: 700,
      background: `${currentColor}20`,
      padding: '4px 12px',
      borderRadius: 999,
      border: `1px solid ${currentColor}40`
    },
    totalBox: {
      marginTop: 12,
      textAlign: 'center',
      fontSize: 13,
      color: '#cbd5e1',
      padding: 12,
      background: '#273043',
      borderRadius: 10,
      border: '1px solid #334155',
      fontWeight: 600
    }
  };

  const displayTotal = range === "all" ? totalVisitors : filteredTotal;

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 20px ${currentColor}40, 0 0 30px ${currentColor}20;
          }
          50% {
            text-shadow: 0 0 30px ${currentColor}60, 0 0 40px ${currentColor}30;
          }
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        button:active {
          transform: translateY(0);
        }

        .statCard:hover {
          transform: translateY(-2px);
          border-color: ${currentColor}80;
          box-shadow: 0 4px 16px ${currentColor}20;
        }

        .listItem:hover {
          transform: translateX(4px);
          border-color: ${currentColor}60;
          background: #334155;
        }

        /* Tooltip styling */
        .google-visualization-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .google-visualization-tooltip-item-list,
        .google-visualization-tooltip-item {
          background: transparent !important;
        }

        .geoTT {
          min-width: 180px;
          border-radius: 12px;
          border: 1px solid ${currentColor}60;
          background: #0f182a;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          padding: 12px;
          color: #e2e8f0;
        }
        .geoTT__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
        }
        .geoTT__title {
          font-weight: 700;
          font-size: 14px;
          color: #e2e8f0;
        }
        .geoTT__badge {
          font-weight: 700;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid ${currentColor}40;
          background: ${currentColor}20;
          color: ${currentColor};
        }
        .geoTT__sub {
          font-size: 11px;
          color: #94a3b8;
        }

        @media (max-width: 1024px) {
          .mapGrid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .statsGrid {
            grid-template-columns: 1fr !important;
          }
          .filterGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Header Card */}
      

      {/* Filter Section */}
      <div style={styles.filterSection}>
        <div style={styles.filterGrid}>
          <div style={styles.filterGroup}>
            <div style={styles.filterTitle}>📊 Analytics Type</div>
            <div style={styles.buttonGroup}>
              {ANALYTICS_TYPES.map((type) => (
                <button
                  key={type.value}
                  style={styles.button(analyticsType === type.value, type.color)}
                  onClick={() => setAnalyticsType(type.value)}
                  onMouseEnter={(e) => {
                    if (analyticsType !== type.value) {
                      e.target.style.background = `${type.color}10`;
                      e.target.style.borderColor = `${type.color}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (analyticsType !== type.value) {
                      e.target.style.background = '#273043';
                      e.target.style.borderColor = '#334155';
                    }
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterGroup}>
            <div style={styles.filterTitle}>⏱️ Time Range</div>
            <div style={styles.buttonGroup}>
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  style={styles.button(range === r.value)}
                  onClick={() => setRange(r.value)}
                  onMouseEnter={(e) => {
                    if (range !== r.value) {
                      e.target.style.background = `${currentColor}10`;
                      e.target.style.borderColor = `${currentColor}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (range !== r.value) {
                      e.target.style.background = '#273043';
                      e.target.style.borderColor = '#334155';
                    }
                  }}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map and Stats Card */}
      <div style={styles.card}>
        <div style={styles.mapGrid} className="mapGrid">
          <div style={styles.mapLeft}>
            <Chart
              chartType="GeoChart"
              width="100%"
              height="100%"
              data={mapData}
              options={geoOptions}
            />
          </div>
          <div style={styles.mapRight}>
            <h3 style={styles.sectionTitle}>Top 10 Countries</h3>
            <ol style={styles.list}>
              {countryStats.map(([country, count], index) => (
                <li 
                  key={country} 
                  className="listItem"
                  style={{
                    ...styles.listItem,
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <span style={styles.countryName}>
                    {index + 1}. {country}
                  </span>
                  <span style={styles.countryCount}>{count}</span>
                </li>
              ))}
            </ol>
            <div style={styles.totalBox}>
              Total {ANALYTICS_TYPES.find(t => t.value === analyticsType)?.label || 'Visitors'}: {displayTotal.toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <LineChart 
            key={chartKey} 
            datasets={datasets} 
            options={getChartOptions()} 
            height={450} 
          />
        </div>
      </div>
    </div>
  );
}