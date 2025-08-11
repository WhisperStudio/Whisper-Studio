// src/components/LineChart.js
import React from "react";
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
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";

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

export default function LineChart({
  datasets,
  options = {},
  height = 450,
  width = "100%",
  className,
  style,
  redraw = true,
}) {
  const data = { datasets };
  const mergedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    ...options,
  };

  return (
    <div className={className} style={{ position: "relative", height, width, ...style }}>
      <Line data={data} options={mergedOptions} redraw={redraw} />
    </div>
  );
}
