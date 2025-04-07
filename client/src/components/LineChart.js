import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

// ===== STYLED COMPONENTS =====

// Container for hele siden – transparent bakgrunn og hvit tekst
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background: transparent;
  color: #fff;
`;

// Slider-container
const SliderContainer = styled.div`
  position: relative;
  width: 500px;
  height: 60px;
  margin-top: 40px;
`;

// Selve sporet (grå linje)
const SliderTrack = styled.div`
  position: absolute;
  top: 28px;
  left: 0;
  width: 100%;
  height: 4px;
  background: #ccc;
  border-radius: 2px;
`;

// Punktene (hvite sirkler) på slideren
const SliderPoint = styled.div`
  position: absolute;
  top: 22px;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid #fff;
  border-radius: 50%;
  margin-left: -8px;
  transition: transform 0.3s ease;
  
  &.active {
    transform: scale(1.2);
  }
`;

// Tekst under hvert punkt
const PointLabel = styled.div`
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: #fff;
`;

// Håndtaket (blå sirkel) som kan dras
const SliderHandle = styled.div`
  position: absolute;
  top: 20px;
  width: 20px;
  height: 20px;
  background: #007bff;
  border-radius: 50%;
  margin-left: -10px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s ease;
  
  &:active {
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

// Container for diagrammet
const ChartContainer = styled.div`
  width: 100%;
  max-width: 700px;
  height: 300px;
  margin-top: 40px;
`;

function LineChart() {
  const chartRef = useRef(null);
  const sliderRef = useRef(null);

  // 10 punkter: 1W, 1M, 2M, 3M, 6M, 9M, 1Y, 2Y, 3Y, 4Y
  const [points, setPoints] = useState([
    { id: 0, label: "1W",  offset: 0,    range: "1w",  isActive: false },
    { id: 1, label: "1M",  offset: 11.11, range: "1m",  isActive: false },
    { id: 2, label: "2M",  offset: 22.22, range: "2m",  isActive: false },
    { id: 3, label: "3M",  offset: 33.33, range: "3m",  isActive: false },
    { id: 4, label: "6M",  offset: 44.44, range: "6m",  isActive: false },
    { id: 5, label: "9M",  offset: 55.55, range: "9m",  isActive: false },
    { id: 6, label: "1Y",  offset: 66.66, range: "12m", isActive: false },
    { id: 7, label: "2Y",  offset: 77.77, range: "2y",  isActive: false },
    { id: 8, label: "3Y",  offset: 88.88, range: "3y",  isActive: false },
    { id: 9, label: "4Y",  offset: 100,   range: "4y",  isActive: true },
  ]);

  // Håndtakets "range" – standard er "4y"
  const [currentRange, setCurrentRange] = useState("4y");

  // Slider-states
  const [sliderWidth, setSliderWidth] = useState(500);
  const [dragging, setDragging] = useState(false);
  const [currentX, setCurrentX] = useState(0);
  const [targetX, setTargetX] = useState(0);

  // Data fra API
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // viewWindow for diagrammet (brukes i dato-basert visning)
  const [viewWindow, setViewWindow] = useState({});

  // Hent brukere og last inn Google Charts
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        const res = await fetch("https://api.vintrastudio.com/api/users");
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Feil ved henting av brukere:", errorText);
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setIsLoading(false);
      }
    }
    if (typeof window !== "undefined") {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://www.gstatic.com/charts/loader.js";
        script.async = true;
        script.onload = () => fetchUsers();
        document.head.appendChild(script);
      } else {
        fetchUsers();
      }
    }
  }, []);

  // Tegn/oppdater diagram når data, viewWindow eller currentRange endres
  useEffect(() => {
    if (!isLoading && window.google && chartRef.current && Array.isArray(users)) {
      if (!window.google.visualization) {
        window.google.charts.load("current", { packages: ["corechart"] });
        window.google.charts.setOnLoadCallback(drawChart);
      } else {
        drawChart();
      }
    }
  }, [viewWindow, users, isLoading, currentRange]);

  // Mål sliderbredde
  useEffect(() => {
    if (sliderRef.current) {
      setSliderWidth(sliderRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animasjonsløkke for "etterslep"
  useEffect(() => {
    let rafId;
    function animate() {
      setCurrentX(prev => {
        const diff = targetX - prev;
        return prev + diff * 0.2;
      });
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [targetX]);

  // Drag-logikk for slider
  const getRelativeX = (e) => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let x = clientX - rect.left;
    return Math.max(0, Math.min(x, rect.width));
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setPoints(prev => prev.map(pt => ({ ...pt, isActive: false })));
    const x = getRelativeX(e);
    setCurrentX(x);
    setTargetX(x);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const x = getRelativeX(e);
    setCurrentX(x);
    setTargetX(x);
  };

  const handleMouseUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    let minDiff = Infinity;
    let chosen = points[0];
    let chosenX = currentX;
    points.forEach(pt => {
      const px = (pt.offset / 100) * sliderWidth;
      const diff = Math.abs(px - currentX);
      if (diff < minDiff) {
        minDiff = diff;
        chosen = pt;
        chosenX = px;
      }
    });
    setCurrentRange(chosen.range);
    setPoints(prev =>
      prev.map(pt =>
        pt.id === chosen.id ? { ...pt, isActive: true } : { ...pt, isActive: false }
      )
    );
    setTargetX(chosenX);
    updateChartView(chosen.range);
  };

  const handleMouseLeave = (e) => {
    if (dragging) {
      handleMouseUp(e);
    }
  };

  // Oppdater viewWindow basert på range
  // For "1w": viewWindow.min = dagens dato - 7 dager, viewWindow.max = dagens dato.
  const updateChartView = (range) => {
    const now = new Date();
    let min;
    switch (range) {
      case "1w": {
        min = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      }
      case "1m": {
        min = new Date(now);
        min.setDate(min.getDate() - 28);
        break;
      }
      case "2m": {
        min = new Date(now);
        min.setDate(min.getDate() - 56);
        break;
      }
      case "3m": {
        min = new Date(now);
        min.setMonth(min.getMonth() - 3);
        break;
      }
      case "6m": {
        min = new Date(now);
        min.setMonth(min.getMonth() - 6);
        break;
      }
      case "9m": {
        min = new Date(now);
        min.setMonth(min.getMonth() - 9);
        break;
      }
      case "12m": {
        min = new Date(now);
        min.setMonth(min.getMonth() - 12);
        break;
      }
      case "2y": {
        min = new Date(now);
        min.setMonth(min.getMonth() - 24);
        break;
      }
      case "3y": {
        min = new Date(now);
        min.setMonth(min.getMonth() - 36);
        break;
      }
      case "4y": {
        min = new Date(now);
        min.setMonth(min.getMonth() - 48);
        break;
      }
      default: {
        min = new Date(now);
        min.setMonth(min.getMonth() - 12);
        break;
      }
    }
    setViewWindow({ min, max: now });
  };

  // Generer ticks for x-aksen
  // Hvis range er "1w", bruk en numerisk x-akse (0 til 6) med tick-etiketter
  // som viser de faktiske datoene (formatert "dd.MM.yyyy")
  function generateTicks(range, { min, max }) {
    if (!min || !max) return null;
    if (range === "1w") {
      const ticks = [];
      const dayInterval = 6 / 6; // For x i [0,6] (0 = 7 dager siden, 6 = i dag)
      for (let i = 0; i <= 6; i++) {
        // x = i
        // Beregn dato: i = 0 -> 7 dager siden, i = 6 -> i dag
        const d = new Date(max.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const label = d.toLocaleDateString("no-NO");
        ticks.push({ v: i, f: label });
      }
      return ticks;
    }

    // For andre ranges behold eksisterende logikk:
    const ticks = [];
    let current = new Date(max);
    let intervalDays;
    switch (range) {
      case "1m": intervalDays = 7; break;
      case "2m": intervalDays = 14; break;
      case "3m":
      case "6m":
      case "9m":
      case "12m": intervalDays = 30; break;
      case "2y": intervalDays = 90; break;
      case "3y": intervalDays = 120; break;
      case "4y": intervalDays = 180; break;
      default:   intervalDays = 7;  break;
    }
    while (current >= min) {
      ticks.push(new Date(current));
      current.setDate(current.getDate() - intervalDays);
    }
    if (ticks.length === 0 || ticks[ticks.length - 1] > min) {
      ticks.push(min);
    }
    ticks.sort((a, b) => a - b);
    return ticks;
  }

  // Tegn diagrammet
  const drawChart = () => {
    if (!chartRef.current || !window.google?.visualization) return;
    if (!Array.isArray(users)) return;

    // Aggreger brukere per dag basert på dato (YYYY-MM-DD)
    const userCountByDay = {};
    users.forEach(user => {
      if (!user.createdAt) return;
      const d = new Date(user.createdAt);
      const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dateKey = dateOnly.toISOString().split("T")[0];
      userCountByDay[dateKey] = (userCountByDay[dateKey] || 0) + 1;
    });

    if (currentRange === "1w") {
      // For 1W: bruk numerisk x-akse [0..6]
      const dataTable = new window.google.visualization.DataTable();
      dataTable.addColumn("number", "Dag");   // x-akse: 0 (7 dager siden) til 6 (i dag)
      dataTable.addColumn("number", "Brukere"); // y-akse

      const dayMs = 24 * 60 * 60 * 1000;
      const now = new Date();
      const rows = [];
      // For i = 0 => 7 dager siden, i = 6 => i dag
      for (let i = 0; i <= 6; i++) {
        const xVal = i; // x-aksen: 0, 1, ... 6
        const d = new Date(now.getTime() - (6 - i) * dayMs);
        const dateKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split("T")[0];
        const count = userCountByDay[dateKey] || 0;
        rows.push([xVal, count]);
      }
      dataTable.addRows(rows);

      const ticks = generateTicks("1w", viewWindow) || [];
      const options = {
        title: "Brukere (siste 7 dager)",
        titleTextStyle: { color: "#fff", fontSize: 16, bold: true },
        backgroundColor: "transparent",
        chartArea: { backgroundColor: "transparent", left: 80, right: 80, top: 40, bottom: 60 },
        legend: { position: "none" },
        hAxis: {
          title: "Dato",
          viewWindow: { min: 0, max: 6 },
          ticks,
          baselineColor: "#fff",
          gridlines: { color: "#fff" },
          textStyle: { color: "#fff" }
        },
        vAxis: {
          title: "Brukere",
          viewWindow: { min: 0 },
          baselineColor: "#fff",
          gridlines: { color: "#fff" },
          textStyle: { color: "#fff" }
        },
        curveType: "function",
        pointSize: 6,
        lineWidth: 1,
        series: { 0: { pointShape: "circle", color: "#fff" } }
      };
      const chart = new window.google.visualization.LineChart(chartRef.current);
      chart.draw(dataTable, options);
    } else {
      // For andre ranges: dato-basert x-akse
      const dataTable = new window.google.visualization.DataTable();
      dataTable.addColumn("date", "Dato");
      dataTable.addColumn("number", "Brukere");
      const sortedDays = Object.keys(userCountByDay).sort();
      let rows = sortedDays.map(dayStr => {
        const dateObj = new Date(`${dayStr}T00:00:00Z`);
        return [dateObj, userCountByDay[dayStr]];
      });
      if (rows.length === 0) {
        rows = [[new Date(), 0]];
      }
      const todayKey = new Date().toISOString().split("T")[0];
      if (!rows.some(r => r[0].toISOString().split("T")[0] === todayKey)) {
        rows.push([new Date(), 0]);
      }
      rows.sort((a, b) => a[0] - b[0]);
      dataTable.addRows(rows);

      const ticks = generateTicks(currentRange, viewWindow) || [];
      const options = {
        title: "Brukere",
        titleTextStyle: { color: "#fff", fontSize: 16, bold: true },
        backgroundColor: "transparent",
        chartArea: { backgroundColor: "transparent", left: 50, right: 20, top: 30, bottom: 50 },
        legend: { position: "bottom", textStyle: { color: "#fff" } },
        hAxis: {
          title: "Dato",
          titleTextStyle: { color: "#fff" },
          textStyle: { color: "#fff" },
          format: "dd-MM-yyyy",
          viewWindow,
          viewWindowMode: "explicit",
          ticks,
          baselineColor: "#fff",
          gridlines: { color: "#fff" },
        },
        vAxis: {
          title: "Brukere",
          titleTextStyle: { color: "#fff" },
          textStyle: { color: "#fff" },
          baselineColor: "#fff",
          gridlines: { color: "#fff" },
          viewWindow: { min: 0 },
        },
        curveType: "function",
        pointSize: 6,
        series: { 0: { pointShape: "circle", color: "#fff" } },
      };
      const chart = new window.google.visualization.LineChart(chartRef.current);
      chart.draw(dataTable, options);
    }
  };

  return (
    <PageContainer>
      <SliderContainer
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <SliderTrack />
        {points.map(pt => {
          const leftPx = `${pt.offset}%`;
          return (
            <React.Fragment key={pt.id}>
              <SliderPoint className={pt.isActive ? "active" : ""} style={{ left: leftPx }} />
              <PointLabel style={{ left: leftPx }}>{pt.label}</PointLabel>
            </React.Fragment>
          );
        })}
        <SliderHandle style={{ left: currentX + "px" }} />
      </SliderContainer>
      <ChartContainer>
        {isLoading && <div style={{ textAlign: "center", padding: "20px" }}>Laster...</div>}
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </ChartContainer>
    </PageContainer>
  );
}

export default LineChart;
