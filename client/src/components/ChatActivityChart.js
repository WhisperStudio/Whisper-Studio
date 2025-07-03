// src/components/ChatActivityChart.js
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,      // <— for a time axis
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler          // <— the missing plugin
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
  differenceInMinutes,
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
  Filler         // <— register it here
);

const RANGES = [
  { label: "Last 1 h",  value: "1h"  },
  { label: "Last 24 h", value: "24h" }
];

export default function ChatActivityChart() {
  const [range, setRange] = useState("1h");
  const [points, setPoints] = useState([]);

  const isOneHour = range === "1h";

  useEffect(() => {
    const now = new Date();
    const windowStart = isOneHour
      ? subHours(now, 1)
      : subHours(now, 24);

    // build our 10-minute bucket boundaries:
    const totalMin = differenceInMinutes(now, windowStart);
    const buckets = [];
    for (let i = 0; i <= totalMin; i += 10) {
      const dt = new Date(windowStart.getTime() + i * 60_000);
      buckets.push(dt);
    }

    // zero out
    const counts = Object.fromEntries(buckets.map(dt => [ +dt, 0 ]));

    // listen to Firestore
    const q = query(
      collectionGroup(db, "messages"),
      where("timestamp", ">=", windowStart),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      // reset
      const fresh = { ...counts };
      snap.docs.forEach(doc => {
        const data = doc.data();
        const ts = data.timestamp.toDate
          ? data.timestamp.toDate()
          : new Date(data.timestamp.seconds * 1000);
        // find the bucket floor:
        const minutesSinceStart = Math.floor(
          (ts.getTime() - windowStart.getTime()) / 60_000
        );
        const bucketIdx = Math.floor(minutesSinceStart / 10);
        const bucketTime = +buckets[bucketIdx];
        if (fresh[bucketTime] !== undefined) {
          fresh[bucketTime]++;
        }
      });
      // build our point array
      setPoints(buckets.map(dt => ({
        x: dt,
        y: fresh[+dt]
      })));
    });

    return () => unsub();
  }, [range]);

  const data = {
    datasets: [{
      label: "Messages",
      data: points,
      borderColor: "#ffffff",
      backgroundColor: "rgba(255,255,255,0.2)",
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
        text: isOneHour
          ? "Chat Activity (1 h, 10 min)"
          : "Chat Activity (24 h, 10 min)",
        color: "#fff"
      },
      tooltip: {
        callbacks: {
          title: ([pt]) => format(pt.parsed.x, "PPpp"),
          label: ctx => `Count: ${ctx.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          stepSize: 10,
          displayFormats: {
            minute: "HH:mm"
          }
        },
        ticks: { color: "#ddd" },
        grid:  { color: "rgba(255,255,255,0.1)" },
        title: { display: true, text: "Time (HH:mm)", color: "#fff" }
      },
      y: {
        beginAtZero: true,
        ticks:       { color: "#ddd" },
        grid:        { color: "rgba(255,255,255,0.1)" },
        title:       { display: true, text: "Count", color: "#fff" }
      }
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "4rem auto", color: "#fff" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        {RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            style={{
              margin:       "0 8px",
              padding:      "8px 16px",
              background:   r.value === range ? "#fff" : "#2d3a6a",
              color:        r.value === range ? "#000" : "#fff",
              border:       "none",
              borderRadius: 4,
              cursor:       "pointer"
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ height: 450, position: "relative" }}>
        <Line data={data} options={options} redraw />
      </div>
    </div>
  );
}
