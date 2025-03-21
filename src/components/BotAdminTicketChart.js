import React, { useEffect, useRef, useState } from "react";

function BotAdminTicketChart() {
  const chartRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Disse tre teller vi opp
  const [botCount, setBotCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);

  // 1) Hent samtaler fra API
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("https://api.vintrastudio.com/api/conversations");
      const data = await res.json();

      // Filtrer/registrer hvor mange som har snakket med bot, admin, ticket
      const bot = data.filter((conv) => conv.method === "bot").length;
      const admin = data.filter((conv) => conv.method === "admin").length;
      const ticket = data.filter((conv) => conv.method === "ticket").length;

      setBotCount(bot);
      setAdminCount(admin);
      setTicketCount(ticket);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setIsLoading(false);
    }
  };

  // 2) Last inn Google Charts + kall fetchConversations
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.google) {
        // Dynamisk lasting av Google Charts
        const script = document.createElement("script");
        script.src = "https://www.gstatic.com/charts/loader.js";
        script.async = true;
        script.onload = () => {
          fetchConversations(); // Hent data etter at Google Charts er lastet
        };
        document.head.appendChild(script);
      } else {
        // Google Charts er allerede lastet
        fetchConversations();
      }
    }
  }, []);

  // 3) Tegn chart når data er hentet
  const initChart = () => {
    if (window.google && chartRef.current) {
      window.google.charts.load("current", { packages: ["corechart"] });
      window.google.charts.setOnLoadCallback(drawChart);
    }
  };

  const drawChart = () => {
    if (!chartRef.current || !window.google?.visualization) return;

    // Bygg dataarray for de tre kategoriene
    const dataArray = [
      ["Method", "Antall"],
      ["Bot", botCount],
      ["Admin", adminCount],
      ["Ticket", ticketCount],
    ];

    // Farger for hver av de tre kategoriene
    const colorMap = {
      Bot: "rgb(0, 200, 83)",    // grønn
      Admin: "rgb(5, 109, 206)", // blå
      Ticket: "rgb(207, 124, 0)" // oransje
    };

    // Lag en liste med farger i samme rekkefølge som dataArray (minus header)
    const colorList = dataArray.slice(1).map(([method]) => colorMap[method] || "#555555");

    // Opprett Google DataTable
    const data = new window.google.visualization.arrayToDataTable(dataArray);

    // Konfigurer diagrammet
    const options = {
      backgroundColor: "transparent",
      chartArea: { width: "85%", height: "85%", left: "7.5%", top: "7.5%" },
      pieHole: 0.5, // donut
      pieSliceBorderColor: "transparent",
      colors: colorList,
      pieSliceText: "value",
      pieSliceTextStyle: {
        color: "#fff",
        fontSize: 14,
        bold: true,
      },
      legend: {
        position: "right",
        alignment: "center",
        textStyle: {
          color: "#fff",
          fontSize: 12,
        },
      },
      tooltip: { trigger: "focus" }, // standard hover/tooltip
    };

    // Tegn diagram
    const chart = new window.google.visualization.PieChart(chartRef.current);
    chart.draw(data, options);

    // Totalsum i midten (overlay)
    const total = botCount + adminCount + ticketCount;
    if (chartRef.current.firstChild) {
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.top = "50%";
      overlay.style.left = "50%";
      overlay.style.transform = "translate(-50%, -50%)";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.textAlign = "center";
      overlay.style.pointerEvents = "none";

      const countText = document.createElement("div");
      countText.innerText = total;
      countText.style.fontSize = "32px";
      countText.style.fontWeight = "bold";
      countText.style.color = "#fff";

      const labelText = document.createElement("div");
      labelText.innerText = "Valg";
      labelText.style.fontSize = "14px";
      labelText.style.opacity = "0.8";
      labelText.style.color = "#fff";

      overlay.appendChild(countText);
      overlay.appendChild(labelText);

      chartRef.current.style.position = "relative";
      chartRef.current.appendChild(overlay);
    }
  };

  // Kall initChart når data er klare
  useEffect(() => {
    // Dersom du vil være sikker på at data er hentet, sjekk isLoading
    if (!isLoading) {
      initChart();
    }
  }, [isLoading, botCount, adminCount, ticketCount]);

  // Re-tegn ved vinduendring
  useEffect(() => {
    const handleResize = () => {
      if (window.google && window.google.visualization) {
        drawChart();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [botCount, adminCount, ticketCount]);

  // 5) Render
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

export default BotAdminTicketChart;
