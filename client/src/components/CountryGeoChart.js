// src/components/CountryGeoChart.js
import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { getFirestore, collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import {
  subHours, subDays, subYears,
  differenceInMinutes, differenceInDays,
  eachMonthOfInterval, startOfDay, startOfMonth, format
} from "date-fns";
import LineChart from "./LineChart2"; // <-- universell linechart (endre sti hvis nødvendig)

const db = getFirestore();

// Tilpass disse to hvis dine feltnavn er annerledes:
const VISITOR_COLLECTION = 'visitors';
const TIMESTAMP_FIELD = 'timestamp'; // f.eks 'createdAt'

const RANGES = [
  { label: "Last 1 h", value: "1h" },
  { label: "Last 24 h", value: "24h" },
  { label: "Last 7 d", value: "7d" },
  { label: "Last 30 d", value: "30d" },
  { label: "Last 1 y", value: "1y" },
];

export default function CountryGeoChart() {
  const [data, setData] = useState([['Country', 'Visits']]);
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);

  // ---- Line chart state ----
  const [range, setRange] = useState("7d");
  const [now, setNow] = useState(new Date());
  const [windowStart, setWindowStart] = useState(subDays(new Date(), 7));
  const [points, setPoints] = useState([]);

  // Hent land/total én gang (kan lett byttes til onSnapshot om ønskelig)
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, VISITOR_COLLECTION));
      const agg = {};
      snap.forEach(doc => {
        const country = doc.data().country || 'Unknown';
        agg[country] = (agg[country] || 0) + 1;
      });
      setCounts(agg);
      setTotal(Object.values(agg).reduce((s, v) => s + v, 0));
      setData([['Country','Visits'], ...Object.entries(agg)]);
    })();
  }, []);

  // Tick 'now' hvert minutt for å “skli” vinduet fremover
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Bygg tidsserien til linechart med live Firestore-lytting
  useEffect(() => {
    // 1) vindusstart
    let ws;
    if (range === "1h") ws = subHours(now, 1);
    else if (range === "24h") ws = subHours(now, 24);
    else if (range === "7d") ws = subDays(now, 7);
    else if (range === "30d") ws = subDays(now, 30);
    else ws = startOfMonth(subYears(now, 1)); // 1y
    setWindowStart(ws);

    // 2) buckets
    const buckets = [];
    if (range === "1h") {
      const mins = differenceInMinutes(now, ws);
      for (let m = 0; m <= mins; m += 10) {
        buckets.push(new Date(ws.getTime() + m * 60_000));
      }
    } else if (range === "24h") {
      const mins = differenceInMinutes(now, ws);
      for (let m = 0; m <= mins; m += 60) {
        buckets.push(new Date(ws.getTime() + m * 60_000));
      }
    } else if (range === "7d" || range === "30d") {
      const days = differenceInDays(now, ws);
      for (let d = 0; d <= days; d++) {
        buckets.push(startOfDay(new Date(ws.getTime() + d * 86_400_000)));
      }
    } else {
      buckets.push(...eachMonthOfInterval({ start: ws, end: startOfMonth(now) }));
    }

    const zero = Object.fromEntries(buckets.map(dt => [+dt, 0]));

    // 3) query Firestore
    const qref = query(
      collection(db, VISITOR_COLLECTION),
      where(TIMESTAMP_FIELD, ">=", ws),
      orderBy(TIMESTAMP_FIELD, "asc")
    );

    const unsub = onSnapshot(qref, snap => {
      const fresh = { ...zero };
      snap.docs.forEach(doc => {
        const d = doc.data();
        const ts = d[TIMESTAMP_FIELD]?.toDate?.()
          ?? new Date(d[TIMESTAMP_FIELD]?.seconds * 1000);

        if (!ts || Number.isNaN(+ts)) return;

        // finn nærmeste bucket til venstre
        let idx = buckets.length - 1;
        while (idx > 0 && ts < buckets[idx]) idx--;
        const key = +buckets[idx];
        if (fresh[key] !== undefined) fresh[key]++;
      });

      setPoints(buckets.map(dt => ({ x: dt, y: fresh[+dt] })));
    });

    return () => unsub();
  }, [range, now]);

  // Akseloggikk for linechart
  const isHour = range === "1h";
  const isDay  = range === "24h";
  const isWeek = range === "7d" || range === "30d";
  const isYear = range === "1y";

  const unit =
    isHour ? "minute" : isDay ? "hour" : isWeek ? "day" : "month";
  // Viktig: stepSize i "hour" = antall timer per tick (1)
  const stepSize = isHour ? 10 : isDay ? 1 : 1;

  const displayFormats = {
    minute: "HH:mm",
    hour:   "HH:mm",
    day:    "MMM d",
    month:  "MMM yyyy",
  };

  const RangeButton = ({ label, active, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={styles.rangeBtn(active, hover)}
      aria-pressed={active}
    >
      {label}
    </button>
  );
};

  const visitDatasets = [
    {
      label: "Visits",
      data: points,             // [{x:Date,y:number}]
      borderColor: "#00ddff",
      backgroundColor: "rgba(0,221,255,0.2)",
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      parsing: false,
      spanGaps: true,
      normalized: true,
    },
  ];

  const visitOptions = {
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Visits • ${RANGES.find(r => r.value === range).label}`,
        color: "#cfefff",
      },
      tooltip: {
        titleColor: "#000",
        bodyColor:  "#000",
        backgroundColor: "#cfefff",
        callbacks: {
          title: ([pt]) => {
            if (isYear) return format(pt.parsed.x, "MMM yyyy");
            if (isWeek) return format(pt.parsed.x, "MMM d");
            return format(pt.parsed.x, "PPpp");
          },
          label: (ctx) => `Count: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit, stepSize, displayFormats },
        min: windowStart,
        max: now,
        bounds: "ticks",
        ticks: { color: "#99e6ff" },
        grid:  { color: "rgba(0,85,170,0.1)" },
        title: {
          display: true,
          text: isYear ? "Month" : isWeek ? "Date" : isDay ? "Hour" : "Time",
          color: "#cfefff",
        },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#99e6ff" },
        grid:  { color: "rgba(0,85,170,0.1)" },
        title: { display: true, text: "Count", color: "#cfefff" },
      },
    },
  };

 const styles = {
  container: {
    display: 'flex',
    gap: 16,
    background: '#0a0f1a',
    borderRadius: 8,
    padding: 16,
    color: '#cfefff',
    boxShadow: '0 0 16px rgba(0,85,170,0.5)',
    alignItems: 'stretch',
  },
  leftCol: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  mapWrapper: {
    flex: 1,
    border: 'none',
    borderRadius: 4,
    overflow: 'hidden',
    minHeight: 320,
  },
// inside styles
chartWrapper: {
  flex: 1,
  border: 'none',
  borderRadius: 4,
  padding: 8,
  minHeight: 260,
  position: 'relative',
  paddingBottom: 56,               // room for the panel
},

rangeBarInChart: {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: 8,
  display: 'inline-flex',
  gap: 8,
  padding: '6px 8px',
  background: 'linear-gradient(180deg, rgba(13,25,45,.65), rgba(9,15,28,.65))',
  border: 'none',
  borderRadius: 12,
  boxShadow:
    'inset 0 0 0 1px rgba(0,221,255,.06), 0 8px 24px rgba(0,221,255,.12)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  pointerEvents: 'auto',
  zIndex: 2,
},

// rangeBtn now takes (active, hover)
rangeBtn: (active, hover) => ({
  padding: '7px 12px',
  minWidth: 84,
  fontSize: 12,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  borderRadius: 10,
  border: '1px solid',
  borderColor: active
    ? 'rgba(0,234,255,.9)'
    : hover
    ? 'rgba(0,200,255,.6)'
    : 'rgba(90,120,170,.45)',
  background: active
    ? 'linear-gradient(180deg, rgba(0,234,255,.18), rgba(0,170,200,.10))'
    : hover
    ? 'linear-gradient(180deg, rgba(40,60,100,.55), rgba(25,40,80,.55))'
    : 'linear-gradient(180deg, rgba(30,45,80,.55), rgba(18,28,50,.55))',
  color: active ? '#fefefe' : '#fefefe',
  boxShadow: active
    ? '0 0 0 1px rgba(0,234,255,.7) inset, 0 0 22px rgba(0,234,255,.22)'
    : hover
    ? '0 0 0 1px rgba(0,200,255,.35) inset, 0 4px 14px rgba(0,200,255,.18)'
    : '0 0 0 1px rgba(255,255,255,.02) inset',
  outline: 'none',
  cursor: 'pointer',
  transition: 'all 160ms ease',
  userSelect: 'none',
}),
  sidebar: {
    flex: 1,
    background: '#0f1b2a',
    borderRadius: 4,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: { fontSize: 20, color: '#00ddff', marginBottom: 8, textShadow: '1px 1px 2px #000' },
  list: { listStyle: 'none', padding: 0, margin: 0, flex: 1 },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #002244' },
  countryCode: { fontWeight: 'bold', color: '#00aaff' },
  count: { color: '#99e6ff' },
  total: { marginTop: 16, paddingTop: 8, borderTop: '1px solid #002244', textAlign: 'center', fontSize: 18, color: '#ffffff' },
};


  // Top 10 land
  const top10 = Object.entries(counts)
    .sort(([,a],[,b]) => b - a)
    .slice(0,10);

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

  return (
    <div style={styles.container}>
      <div style={styles.leftCol}>
        <div style={styles.mapWrapper}>
          <Chart
            chartType="GeoChart"
            width="100%"
            height="100%"
            data={data}
            options={geoOptions}
          />
        </div>

        {/* Line chart for visits */}
        <div style={styles.chartWrapper}>
          <LineChart datasets={visitDatasets} options={visitOptions} height={220} />
          <div style={styles.rangeBarInChart}>
            {RANGES.map(r => (
              <RangeButton
                key={r.value}
                label={r.label}
                active={r.value === range}
                onClick={() => setRange(r.value)}
              />
            ))}
          </div>
        </div>

      </div>

      <div style={styles.sidebar}>
        <div>
          <h2 style={styles.title}>Top 10 Countries</h2>
          <ol style={styles.list}>
            {top10.map(([cc, cnt]) => (
              <li key={cc} style={styles.listItem}>
                <span style={styles.countryCode}>{cc}</span>
                <span style={styles.count}>{cnt}</span>
              </li>
            ))}
          </ol>
        </div>
        <div style={styles.total}>
          Total visits = <strong>{total}</strong>
        </div>
      </div>
    </div>
  );
}
