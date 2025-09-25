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
      borderColor: "rgba(168, 85, 247, 1)",
      backgroundColor: "rgba(168, 85, 247, 0.1)",
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: "rgba(168, 85, 247, 1)",
      pointBorderColor: "rgba(255, 255, 255, 0.8)",
      pointBorderWidth: 2,
      borderWidth: 3,
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
          color: "#fff",
          font: { size: 20, weight: '700', family: 'Inter' },
          padding: { bottom: 20 }
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "rgba(168, 85, 247, 0.3)",
          borderWidth: 1,
          cornerRadius: 12,
          padding: 12,
          titleFont: { size: 14, weight: '600' },
          bodyFont: { size: 13 },
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
            color: "rgba(255, 255, 255, 0.7)",
            maxTicksLimit: isHour ? 6 : isDay ? 12 : isWeek ? 15 : 12,
            font: { size: 12, weight: '500' }
          },
          grid: { 
            color: "rgba(255, 255, 255, 0.05)",
            borderColor: "rgba(255, 255, 255, 0.1)"
          },
          title: {
            display: true,
            text: isYear ? "Month" : isWeek ? "Date" : isDay ? "Hour" : "Time",
            color: "rgba(255, 255, 255, 0.8)",
            font: { size: 14, weight: '600' }
          },
        },
        y: {
          beginAtZero: true,
          ticks: { 
            color: "rgba(255, 255, 255, 0.7)",
            font: { size: 12, weight: '500' }
          },
          grid: { 
            color: "rgba(255, 255, 255, 0.05)",
            borderColor: "rgba(255, 255, 255, 0.1)"
          },
          title: { 
            display: true, 
            text: "Visitors", 
            color: "rgba(255, 255, 255, 0.8)",
            font: { size: 14, weight: '600' }
          },
        },
      },
    };
  };

  // GeoChart options (hex colors only to avoid invalid color errors)
  const geoOptions = {
    displayMode: 'regions',
    resolution: 'countries',
    backgroundColor: 'transparent',
    datalessRegionColor: '#1f2937',
    defaultColor: '#374151',
    colorAxis: { 
      colors: ['#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8'],
      minValue: 0
    },
    legend: 'none',
    tooltip: { 
      textStyle: { color: '#ffffff', fontSize: 12 }, 
      backgroundColor: '#0f172a'
    }
  };

  const styles = {
    card: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 24,
      padding: 32,
      margin: '24px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      color: '#fff',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'fadeIn 0.6s ease'
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 32,
      flexWrap: 'wrap'
    },
    button: (selected) => ({
      padding: '12px 24px',
      background: selected ? 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)' : 'rgba(255, 255, 255, 0.05)',
      color: selected ? '#fff' : 'rgba(255, 255, 255, 0.7)',
      border: selected ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 16,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: selected ? '600' : '500',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(10px)',
      boxShadow: selected ? '0 8px 24px rgba(168, 85, 247, 0.3)' : 'none'
    }),
    mapGrid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 320px',
      gap: 24,
      alignItems: 'stretch'
    },
    mapLeft: {
      height: 520,
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 16,
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.02)'
    },
    overlay: undefined,
    mapRight: {
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 16,
      padding: 16,
      gap: 12,
      maxHeight: 520,
      overflowY: 'auto'
    },
    title: {
      fontSize: 20,
      fontWeight: 700,
      background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
      textAlign: 'center'
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 14px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 12,
      border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    countryCode: { fontWeight: 600, color: '#fff', fontSize: 14 },
    count: {
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: 13,
      fontWeight: 600,
      background: 'rgba(168, 85, 247, 0.15)',
      padding: '4px 10px',
      borderRadius: 10,
      border: '1px solid rgba(168, 85, 247, 0.35)'
    },
    total: {
      marginTop: 8,
      textAlign: 'center',
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)'
    }
  };

  return (
    <>
      {/* Map card */}
      <div style={styles.card}>
        <div style={styles.mapGrid}>
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
            <h3 style={styles.title}>Top 10 Countries</h3>
            <ol style={styles.list}>
              {countryStats.map(([country, count], index) => (
                <li key={country} style={styles.listItem}>
                  <span style={styles.countryCode}>{index + 1}. {country}</span>
                  <span style={styles.count}>{count}</span>
                </li>
              ))}
            </ol>
            <div style={styles.total}>Total Visitors: {totalVisitors.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Time range line chart card (matches ChatActivityChart styling) */}
      <div style={styles.card}>
        <div style={styles.toolbar}>
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={styles.button(r.value === range)}
              onMouseEnter={(e) => {
                if (r.value !== range) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(96, 165, 250, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (r.value !== range) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <LineChart key={chartKey} datasets={datasets} options={getChartOptions()} height={450} />
      </div>
    </>
  );
}
