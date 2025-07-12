// src/components/ChatActivityChart.js
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import "chartjs-adapter-date-fns";

import {
  collectionGroup,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import {
  subHours,
  subDays,
  subYears,
  differenceInMinutes,
  differenceInDays,
  eachMonthOfInterval,
  startOfDay,
  startOfMonth,
  format
} from "date-fns";
import { db } from "../firebase";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RANGES = [
  { label: "Last 1 h",  value: "1h"  },
  { label: "Last 24 h", value: "24h" },
  { label: "Last 7 d",  value: "7d"  },
  { label: "Last 30 d", value: "30d" },
  { label: "Last 1 y",  value: "1y"  },
];

export default function ChatActivityChart() {
  const [range, setRange] = useState("1h");
  const [now,   setNow]   = useState(new Date());
  const [points, setPoints] = useState([]);

  // tick 'now' every minute so chart slides forward
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // compute windowStart
    let windowStart;
    if (range === "1h")        windowStart = subHours(now, 1);
    else if (range === "24h")  windowStart = subHours(now, 24);
    else if (range === "7d")   windowStart = subDays(now, 7);
    else if (range === "30d")  windowStart = subDays(now, 30);
    else /* "1y" */            windowStart = startOfMonth(subYears(now, 1));

    // build buckets
    const buckets = [];
    if (range === "1h") {
      const mins = differenceInMinutes(now, windowStart);
      for (let m = 0; m <= mins; m += 10) {
        buckets.push(new Date(windowStart.getTime() + m * 60_000));
      }
    } else if (range === "24h") {
      const mins = differenceInMinutes(now, windowStart);
      for (let m = 0; m <= mins; m += 60) {
        buckets.push(new Date(windowStart.getTime() + m * 60_000));
      }
    } else if (range === "7d" || range === "30d") {
      const days = differenceInDays(now, windowStart);
      for (let d = 0; d <= days; d++) {
        buckets.push(startOfDay(new Date(windowStart.getTime() + d * 86_400_000)));
      }
    } else {
      buckets.push(
        ...eachMonthOfInterval({ start: windowStart, end: startOfMonth(now) })
      );
    }

    // zero‐fill
    const counts = Object.fromEntries(buckets.map(dt => [+dt, 0]));

    // listen Firestore
    const q = query(
      collectionGroup(db, "messages"),
      where("timestamp", ">=", windowStart),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      const fresh = { ...counts };
      snap.docs.forEach(doc => {
        const data = doc.data();
        const ts =
          data.timestamp.toDate?.() ??
          new Date(data.timestamp.seconds * 1000);

        let idx = buckets.length - 1;
        while (idx > 0 && ts < buckets[idx]) idx--;
        const key = +buckets[idx];
        if (fresh[key] !== undefined) fresh[key]++;
      });

      setPoints(buckets.map(dt => ({ x: dt, y: fresh[+dt] })));
    });

    return () => unsub();
  }, [range, now]);

  // axis config
  const isHour = range === "1h";
  const isDay  = range === "24h";
  const isWeek = range === "7d" || range === "30d";
  const isYear = range === "1y";

  const unit = isHour ? "minute"
             : isDay  ? "hour"
             : isWeek ? "day"
             :         "month";

  const stepSize = isHour ? 10
                  : isDay  ? 60
                  :          1;

  const displayFormats = {
    minute: "HH:mm",
    hour:   "HH:mm",
    day:    "MMM d",
    month:  "MMM yyyy"
  };

  const data = {
    datasets: [{
      label: "Messages",
      data: points,
      borderColor: "#00ddff",
      backgroundColor: "rgba(0,221,255,0.2)",
      fill: true,
      tension: 0.3,
      pointRadius: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text:  RANGES.find(r => r.value === range).label,
        color: "#cfefff"
      },
      tooltip: {
        titleColor: "#000",
        bodyColor:  "#000",
        backgroundColor: "#cfefff",
        callbacks: {
          title: ([pt]) => {
            if (isYear) return format(pt.parsed.x, "MMM yyyy");
            if (isWeek) return format(pt.parsed.x, "MMM d, HH:mm");
            return format(pt.parsed.x, "PPpp");
          },
          label: ctx => `Count: ${ctx.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        type: "time",
        time: { unit, stepSize, displayFormats },
        ticks: { color: "#99e6ff" },
        grid:  { color: "rgba(0,85,170,0.1)" },
        title: {
          display: true,
          text: isYear  ? "Month"
               : isWeek  ? "Date"
               : isDay   ? "Hour"
               :          "Time",
          color: "#cfefff"
        }
      },
      y: {
        beginAtZero: true,
        ticks:       { color: "#99e6ff" },
        grid:        { color: "rgba(0,85,170,0.1)" },
        title:       { display: true, text: "Count", color: "#cfefff" }
      }
    }
  };

  // inline styles for the "card"
  const styles = {
    card: {
      maxWidth: 900,
      margin:   "4rem auto",
      padding:  16,
      background: "#0a0f1a",
      border:   "1px solid #003366",
      borderRadius: 8,
      boxShadow: "0 0 16px rgba(0,85,170,0.5)",
      color:    "#cfefff"
    },
    toolbar: {
      textAlign: "center",
      marginBottom: 24
    },
    button: selected => ({
      margin:       "0 8px",
      padding:      "8px 16px",
      background:   selected ? "white" : "#2d3a6a",
      color:        selected ? "#000" : "#fff",
      border:       "none",
      borderRadius: 4,
      cursor:       "pointer"
    }),
    chartWrap: {
      height:       450,
      position:     "relative"
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.toolbar}>
        {RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            style={styles.button(r.value === range)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div style={styles.chartWrap}>
        <Line data={data} options={options} redraw />
      </div>
    </div>
  );
}
