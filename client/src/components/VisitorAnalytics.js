import React, { useEffect, useState } from "react";
import {
  subHours,
  subDays,
  subYears,
  differenceInMinutes,
  differenceInDays,
  eachMonthOfInterval,
  startOfDay,
  startOfMonth,
  format,
} from "date-fns";
import { Chart } from 'react-google-charts';
import { db, collection, getDocs } from '../firebase';
import LineChart from "./LineChart2";

const RANGES = [
  { label: "Last 1 h", value: "1h" },
  { label: "Last 24 h", value: "24h" },
  { label: "Last 7 d", value: "7d" },
  { label: "Last 30 d", value: "30d" },
  { label: "Last 1 y", value: "1y" },
  { label: "All time", value: "all" },
];

export default function VisitorAnalytics() {
  const [range, setRange] = useState("all");
  const [now, setNow] = useState(new Date());
  const [windowStart, setWindowStart] = useState(new Date(2020, 0, 1));
  const [points, setPoints] = useState([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [countryStats, setCountryStats] = useState([]);
  const [mapData, setMapData] = useState([['Country', 'Visits']]);
  const [chartKey, setChartKey] = useState(0); // For å force re-render av chart

  // Oppdater "now" hvert minutt
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // 1) Finn vindusstart
    let ws;
    if (range === "1h") ws = subHours(now, 1);
    else if (range === "24h") ws = subHours(now, 24);
    else if (range === "7d") ws = subDays(now, 7);
    else if (range === "30d") ws = subDays(now, 30);
    else if (range === "1y") ws = startOfMonth(subYears(now, 1));
    else ws = startOfMonth(subYears(now, 3)); // All time begrenset til 3 år
    setWindowStart(ws);

    // 2) Lag buckets - fikser tidsintervall problemet
    const buckets = [];
    if (range === "1h") {
      // For 1h: lag kun 6 buckets for siste time
      const startTime = new Date(now.getTime() - 60 * 60 * 1000); // Akkurat 1 time siden
      for (let m = 0; m <= 6; m++) {
        buckets.push(new Date(startTime.getTime() + m * 10 * 60_000));
      }
    } else if (range === "24h") {
      // For 24h: lag buckets for hver time i de siste 24 timene
      for (let h = 0; h <= 24; h += 1) {
        buckets.push(new Date(ws.getTime() + h * 60 * 60_000));
      }
    } else if (range === "7d") {
      // For 7d: lag buckets for hver dag i de siste 7 dagene
      for (let d = 0; d <= 7; d++) {
        buckets.push(startOfDay(new Date(ws.getTime() + d * 86_400_000)));
      }
    } else if (range === "30d") {
      // For 30d: lag buckets for hver dag i de siste 30 dagene
      for (let d = 0; d <= 30; d++) {
        buckets.push(startOfDay(new Date(ws.getTime() + d * 86_400_000)));
      }
    } else if (range === "1y") {
      // For 1y: lag månedlige buckets
      const startDate = subYears(now, 1);
      buckets.push(...eachMonthOfInterval({ start: startOfMonth(startDate), end: startOfMonth(now) }));
    } else {
      // All time - månedlige buckets, begrenset til 3 år
      buckets.push(...eachMonthOfInterval({ start: ws, end: startOfMonth(now) }));
    }

    // 3) Nullfyll
    const counts = Object.fromEntries(buckets.map((dt) => [+dt, 0]));

    // 4) Hent data fra Firebase
    const fetchData = async () => {
      try {
        const visitorsRef = collection(db, 'visitors');
        const snapshot = await getDocs(visitorsRef);
        
        const fresh = { ...counts };
        const countryCount = {};
        let total = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp?.seconds * 1000);
          const country = data.country || 'Unknown';
          
          // Count countries for all time
          countryCount[country] = (countryCount[country] || 0) + 1;
          total++;

          // Only count visits within time range for chart
          if (range !== "all" && timestamp < ws) return;

          // Finn riktig bucket
          let idx = buckets.length - 1;
          while (idx > 0 && timestamp < buckets[idx]) idx--;
          const key = +buckets[idx];
          if (fresh[key] !== undefined) fresh[key]++;
        });

        // For "all time", show all data
        if (range === "all") {
          // Group by month for all time view
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
        
        // Top 10 countries
        const sortedCountries = Object.entries(countryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10);
        setCountryStats(sortedCountries);

        // Map data for GeoChart
        const mapDataArray = [['Country', 'Visits'], ...Object.entries(countryCount)];
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
        setCountryStats([
          ['Norway', 150],
          ['Sweden', 120],
          ['Denmark', 80],
          ['Germany', 60],
          ['Finland', 40]
        ]);
        setMapData([
          ['Country', 'Visits'],
          ['Norway', 150],
          ['Sweden', 120],
          ['Denmark', 80],
          ['Germany', 60],
          ['Finland', 40]
        ]);
      }
    };

    fetchData();
    
    // Force re-render av chart når range endres
    setChartKey(prev => prev + 1);
  }, [range, now]);

  // Akseoppsett
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

  // Dataset til linechart
  const datasets = [
    {
      label: "Visitors",
      data: points,
      borderColor: "#00ddff",
      backgroundColor: "rgba(0,221,255,0.2)",
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      parsing: false,
      spanGaps: true,
      normalized: true,
    },
  ];

  // Lag nye options for hver render for å unngå cache-problemer
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
          text: `Website Visitors • ${RANGES.find((r) => r.value === range).label}`,
          color: "#cfefff",
          font: { size: 16, weight: 'bold' }
        },
        tooltip: {
          titleColor: "#000",
          bodyColor: "#000",
          backgroundColor: "#cfefff",
          callbacks: {
            title: ([pt]) => {
              if (isYear) return format(pt.parsed.x, "MMM yyyy");
              if (isWeek) return format(pt.parsed.x, "MMM d");
              return format(pt.parsed.x, "PPpp");
            },
            label: (ctx) => `Visitors: ${ctx.parsed.y}`,
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
            color: "#99e6ff",
            maxTicksLimit: isHour ? 6 : isDay ? 12 : isWeek ? 15 : 12
          },
          grid: { color: "rgba(0,85,170,0.1)" },
          title: {
            display: true,
            text: isYear ? "Month" : isWeek ? "Date" : isDay ? "Hour" : "Time",
            color: "#cfefff",
          },
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#99e6ff" },
          grid: { color: "rgba(0,85,170,0.1)" },
          title: { display: true, text: "Visitors", color: "#cfefff" },
        },
      },
    };
  };

  // GeoChart options
  const geoOptions = {
    displayMode: 'regions',
    resolution: 'countries',
    backgroundColor: '#0a0f1a',
    datalessRegionColor: '#1a2130',
    defaultColor: '#8D7FB3',
    colorAxis: { colors: ['#ebeaec','#63548C','#934397'] },
    legend: 'none',
    tooltip: { textStyle: { color: '#000' }, backgroundColor: '#e0ffff' },
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },
    topSection: {
      display: 'flex',
      gap: 16,
      background: '#0a0f1a',
      borderRadius: 8,
      padding: 16,
      color: '#cfefff',
      boxShadow: '0 0 16px rgba(0,85,170,0.5)',
    },
    mapWrapper: {
      flex: 6,
      border: '1px solid #003366',
      borderRadius: 4,
      overflow: 'hidden',
      height: 600,
    },
    chartCard: {
      maxWidth: 1600,
      margin: "0 auto",
      padding: 16,
      background: "#0a0f1a",
      border: "1px solid #003366",
      borderRadius: 8,
      boxShadow: "0 0 16px rgba(0,85,170,0.5)",
      color: "#cfefff",
    },
    toolbar: { 
      textAlign: "center", 
      marginBottom: 24,
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      flexWrap: 'wrap'
    },
    button: (selected) => ({
      padding: "8px 16px",
      background: selected ? "#00ddff" : "#2d3a6a",
      color: selected ? "#000" : "#fff",
      border: selected ? "1px solid #00ddff" : "1px solid #003366",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: selected ? 'bold' : 'normal',
      transition: 'all 0.3s ease',
      minWidth: 80,
    }),
    sidebar: {
      flex: 1,
      background: '#0f1b2a',
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minWidth: 200,
      maxWidth: 250,
    },
    title: { 
      fontSize: 18, 
      color: '#00ddff', 
      marginBottom: 16, 
      textShadow: '1px 1px 2px #000',
      textAlign: 'center'
    },
    list: { 
      listStyle: 'none', 
      padding: 0, 
      margin: 0, 
      flex: 1 
    },
    listItem: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '8px 0', 
      borderBottom: '1px solid #002244' 
    },
    countryCode: { 
      fontWeight: 'bold', 
      color: '#00aaff' 
    },
    count: { 
      color: '#99e6ff' 
    },
    total: { 
      marginTop: 16, 
      paddingTop: 16, 
      borderTop: '2px solid #003366', 
      textAlign: 'center', 
      fontSize: 20, 
      color: '#00ddff',
      fontWeight: 'bold'
    },
  };

  return (
    <div style={styles.container}>
      {/* Top section with map and sidebar like CountryGeoChart */}
      <div style={styles.topSection}>
        <div style={styles.mapWrapper}>
          <Chart
            chartType="GeoChart"
            width="100%"
            height="100%"
            data={mapData}
            options={geoOptions}
          />
        </div>

        <div style={styles.sidebar}>
          <div>
            <h2 style={styles.title}>Top 10 Countries</h2>
            <ol style={styles.list}>
              {countryStats.map(([country, count], index) => (
                <li key={country} style={styles.listItem}>
                  <span style={styles.countryCode}>
                    {index + 1}. {country}
                  </span>
                  <span style={styles.count}>{count}</span>
                </li>
              ))}
            </ol>
          </div>
          <div style={styles.total}>
            Total Visitors: {totalVisitors.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Bottom section with chart like ChatActivityChart */}
      <div style={styles.chartCard}>
        <div style={styles.toolbar}>
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={styles.button(r.value === range)}
              onMouseEnter={(e) => {
                if (r.value !== range) {
                  e.target.style.background = '#4a5a8a';
                }
              }}
              onMouseLeave={(e) => {
                if (r.value !== range) {
                  e.target.style.background = '#2d3a6a';
                }
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <LineChart key={chartKey} datasets={datasets} options={getChartOptions()} height={450} />
      </div>
    </div>
  );
}
