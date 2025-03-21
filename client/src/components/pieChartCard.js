// pieChartCard.js
import React, { useEffect, useRef, useState } from "react";

function PieChartCard() {
  const chartRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1) Hent samtaler fra API
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("https://api.vintrastudio.com/api/conversations");
      const data = await res.json();
      setConversations(data);
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

    // 3a) Tell opp alle kategorier dynamisk
    const categoryCounts = conversations.reduce((acc, conv) => {
      const cat = conv.category || "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // 3b) Bygg en data-tabell for Google Charts
    //    ["Category", "Antall"]
    const dataArray = [["Category", "Antall"]];
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      dataArray.push([cat, count]);
    });

    // 3c) Sett farger for hver kategori (juster om du vil ha flere/færre)
    const colorMap = {
      Games: "rgb(35, 153, 80)",
      General: "rgb(212, 0, 255)",
      Work: "rgb(243, 47, 243)",
      Billing: 	"rgb(207, 124, 0)",
      Support: "rgb(5, 109, 206)",
      Sales: "rgb(40, 56, 182)",
      Other: "rgb(97, 97, 97)",
    };
    // Fallback-farge = #555555
    const colorList = dataArray.slice(1).map(([cat]) => colorMap[cat] || "#555555");

    // 3d) Opprett Google DataTable
    const data = new window.google.visualization.arrayToDataTable(dataArray);

    // 3e) Konfigurer diagrammet
    const options = {
      backgroundColor: "transparent",
      // Legg litt margin i chartArea for at slice-teksten skal se mer sentrert ut
      chartArea: { width: "85%", height: "85%", left: "18%", top: "7.5%" },
      pieHole: 0.5, // donut
      pieSliceBorderColor: "transparent",
      colors: colorList,
      // Vis antall i hver slice og sentrer fargen
      pieSliceText: "value",
      pieSliceTextStyle: {
        color: "#fff",   // hvit tekst
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
      tooltip: { trigger: "focus", ignoreBounds: "true" }, // standard hover/tooltip
    };

    // 3f) Tegn diagram
    const chart = new window.google.visualization.PieChart(chartRef.current);
    chart.draw(data, options);

    // 3g) Legg en totalsum i midten (overlay)
    const totalConversations = conversations.length;
    if (chartRef.current.firstChild) {
      // Opprett overlay (flex-sentrert)
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.top = "50%";
      overlay.style.left = "43.5%";
      overlay.style.transform = "translate(-50%, -50%)";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.textAlign = "center";
      overlay.style.pointerEvents = "none";

      const countText = document.createElement("div");
      countText.innerText = totalConversations;
      countText.style.fontSize = "32px";
      countText.style.fontWeight = "bold";
      countText.style.color = "#fff"; // hvit tekst i midten

      const labelText = document.createElement("div");
      labelText.innerText = "Samtaler";
      labelText.style.fontSize = "14px";
      labelText.style.opacity = "0.8";
      labelText.style.color = "#fff"; // hvit tekst i midten

      overlay.appendChild(countText);
      overlay.appendChild(labelText);

      chartRef.current.style.position = "relative";
      chartRef.current.appendChild(overlay);
    }
  };

  // Kall initChart når vi har hentet data
  useEffect(() => {
    if (!isLoading && conversations.length >= 0) {
      initChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, isLoading]);

  // 4) Re-tegn ved vinduendring
  useEffect(() => {
    const handleResize = () => {
      if (window.google && window.google.visualization) {
        drawChart();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [conversations]);

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

export default PieChartCard;
