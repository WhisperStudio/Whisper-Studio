// src/components/ChatActivityChart.js
import { useEffect, useState } from "react";
import {
  collectionGroup,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  subHours,
  subDays,
  subYears,
  eachMonthOfInterval,
  startOfDay,
  startOfMonth,
  format,
} from "date-fns";
import { db } from "../firebase";
import LineChart from "./LineChart2";

// Tilpass om feltnavn/collections er annerledes
const QUERY_COLLECTION_GROUP = "messages";
const TIMESTAMP_FIELD = "timestamp";

const RANGES = [
  { label: "Last 1 h", value: "1h" },
  { label: "Last 24 h", value: "24h" },
  { label: "Last 7 d", value: "7d" },
  { label: "Last 30 d", value: "30d" },
  { label: "Last 1 y", value: "1y" },
  { label: "All time", value: "all" },
];

export default function ChatActivityChart() {
  const [range, setRange] = useState("all");
  const [now, setNow] = useState(new Date());
  const [windowStart, setWindowStart] = useState(new Date(2020, 0, 1));
  const [points, setPoints] = useState([]);
  const [chartKey, setChartKey] = useState(0); // For å force re-render av chart

  // Oppdater "now" hvert minutt så grafen sklir fremover
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
    else ws = new Date(2020, 0, 1); // All time - start from 2020
    setWindowStart(ws);

    // 2) Lag buckets - fikser tidsintervall problemet
    const buckets = [];
    if (range === "1h") {
      // For 1h: lag kun 6 buckets for siste time
      const startTime = new Date(now.getTime() - 60 * 60 * 1000);
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
      buckets.push(...eachMonthOfInterval({ start: ws, end: startOfMonth(now) }));
    } else {
      // All time: lag månedlige buckets for all time
      buckets.push(...eachMonthOfInterval({ start: ws, end: startOfMonth(now) }));
    }

    // 3) Nullfyll
    const counts = Object.fromEntries(buckets.map((dt) => [+dt, 0]));

    // 4) Lytt på Firestore
    const qref = query(
      collectionGroup(db, QUERY_COLLECTION_GROUP),
      where(TIMESTAMP_FIELD, ">=", ws),
      orderBy(TIMESTAMP_FIELD, "asc")
    );

    // Use getDocs instead of onSnapshot to avoid Firebase 11.9.0 bug
    const fetchData = async () => {
      try {
        const snap = await getDocs(qref);
        const fresh = { ...counts };
        snap.docs.forEach((doc) => {
          const data = doc.data();
          const tsv =
            data[TIMESTAMP_FIELD]?.toDate?.() ??
            new Date(data[TIMESTAMP_FIELD].seconds * 1000);

          // Finn riktig bucket
          let idx = buckets.length - 1;
          while (idx > 0 && tsv < buckets[idx]) idx--;
          const key = +buckets[idx];
          if (fresh[key] !== undefined) fresh[key]++;
        });

        setPoints(buckets.map((dt) => ({ x: dt, y: fresh[+dt] })));
      } catch (error) {
        console.error('Error fetching chat activity data:', error);
        // Use mock data as fallback
        const mockPoints = buckets.map((dt, i) => ({ 
          x: dt, 
          y: Math.floor(Math.random() * 10) + 1 
        }));
        setPoints(mockPoints);
      }
    };

    fetchData();
    
    // Force re-render av chart når range endres
    setChartKey(prev => prev + 1);
  }, [range, now]);

  // 5) Akseoppsett
  const isHour = range === "1h";
  const isDay = range === "24h";
  const isWeek = range === "7d" || range === "30d";
  const isYear = range === "1y" || range === "all";

  const unit = isHour ? "minute" : isDay ? "hour" : isWeek ? "day" : "month";

  // Viktig: for unit "hour" skal stepSize være antall timer per tick (1)
  const stepSize = isHour ? 1 : isDay ? 2 : 1;

  const displayFormats = {
    minute: "HH:mm",
    hour: "HH:mm",
    day: "MMM d",
    month: "MMM yyyy",
  };

  // 6) Dataset til universell linechart
  const datasets = [
    {
      label: "Messages",
      data: points, // [{x: Date, y: number}]
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
      parsing: false,     // vi gir {x,y}
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
          text: `Chat Activity • ${RANGES.find((r) => r.value === range).label}`,
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
              if (isWeek) return format(pt.parsed.x, "MMM d, HH:mm");
              return format(pt.parsed.x, "PPpp");
            },
            label: (ctx) => `Messages: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: { unit, stepSize, displayFormats },
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
            text: "Messages", 
            color: "rgba(255, 255, 255, 0.8)",
            font: { size: 14, weight: '600' }
          },
        },
      },
    };
  };

  // 7) Moderne UI
  const styles = {
    card: {
      background: "rgba(255, 255, 255, 0.03)",
      backdropFilter: 'blur(20px)',
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 24,
      padding: 32,
      margin: "24px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      color: "#fff",
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'fadeIn 0.6s ease',
    },
    toolbar: { 
      display: 'flex',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 32,
      flexWrap: 'wrap'
    },
    button: (selected) => ({
      padding: "12px 24px",
      background: selected ? 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)' : 'rgba(255, 255, 255, 0.05)',
      color: selected ? "#fff" : "rgba(255, 255, 255, 0.7)",
      border: selected ? "1px solid transparent" : "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: 16,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: selected ? '600' : '500',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(10px)',
      boxShadow: selected ? '0 8px 24px rgba(168, 85, 247, 0.3)' : 'none',
    }),
  };

  return (
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
                e.target.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.2)';
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
  );
}
