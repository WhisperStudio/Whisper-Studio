import React, { useEffect, useRef, useState } from "react";

function LineChart() {
  const chartRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hent brukere fra API
  const fetchUsers = async () => {
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
      const arrayData = Array.isArray(data) ? data : [];
      setUsers(arrayData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  };

  // Last inn Google Charts (om nødvendig) og hent brukere
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://www.gstatic.com/charts/loader.js";
        script.async = true;
        script.onload = () => {
          fetchUsers();
        };
        document.head.appendChild(script);
      } else {
        fetchUsers();
      }
    }
  }, []);

  // Initier chart når data er klare
  const initChart = () => {
    if (window.google && chartRef.current) {
      window.google.charts.load("current", { packages: ["corechart"] });
      window.google.charts.setOnLoadCallback(drawChart);
    }
  };

  // Tegn linjediagrammet
  const drawChart = () => {
    if (!chartRef.current || !window.google?.visualization) return;
    if (!Array.isArray(users)) return;

    // 1) Regn ut nye brukere per dag
    const userCountByDay = {};
    users.forEach((user) => {
      if (user.createdAt) {
        const fullDate = new Date(user.createdAt);
        const year = fullDate.getUTCFullYear();
        const month = fullDate.getUTCMonth();  // 0-basert
        const day = fullDate.getUTCDate();     // 1-basert
        const dateOnly = new Date(Date.UTC(year, month, day));
        const dateKey = dateOnly.toISOString().split("T")[0];
        userCountByDay[dateKey] = (userCountByDay[dateKey] || 0) + 1;
      }
    });

    const sortedDays = Object.keys(userCountByDay).sort();

    // 2) Opprett DataTable med kolonnene
    const dataTable = new window.google.visualization.DataTable();
    dataTable.addColumn("date", "Dato");
    dataTable.addColumn("number", "Nye brukere");

    // 3) Bygg rader
    let rows = sortedDays.map((dayStr) => {
      const dateObj = new Date(`${dayStr}T00:00:00Z`);
      return [dateObj, userCountByDay[dayStr]];
    });

    // 4) Hvis vi ikke har noen data, legg inn en dummy‐rad
    if (rows.length === 0) {
      // Legg f.eks. inn en rad på 1. januar 2025 med verdi 0
      rows = [[new Date(2025, 1, 1), 0]];
    }

    dataTable.addRows(rows);

    // 5) Konfigurer diagrammet
    const options = {
      title: "Nye brukere per dag",
      backgroundColor: "transparent",
      legend: { position: "bottom" },
      hAxis: {
        title: "Dato",
        format: "yyyy-MM-dd",
        viewWindow: {
          min: new Date(2025, 1, 1)
        }
      },
      vAxis: {
        title: "Antall brukere"
      },
      curveType: "function"
    };

    const chart = new window.google.visualization.LineChart(chartRef.current);
    chart.draw(dataTable, options);
  };

  // Initier chart når brukere er hentet
  useEffect(() => {
    if (!isLoading) {
      initChart();
    }
  }, [users, isLoading]);

  // Re-tegn diagrammet ved vindusendring
  useEffect(() => {
    const handleResize = () => {
      if (window.google && window.google.visualization) {
        drawChart();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [users]);

  return (
    <div style={{ width: "100%", height: "300px", position: "relative" }}>
      {isLoading && (
        <div style={{ textAlign: "center", padding: "20px", color: "#fff" }}>
          Laster...
        </div>
      )}
      <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default LineChart;
