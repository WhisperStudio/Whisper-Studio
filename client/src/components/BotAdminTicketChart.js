// src/components/BotAdminTicketChart.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BotAdminTicketChart = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Vi antar at React‐appen kjører på :3000, Node‐serveren på :5000
        const res = await axios.get('http://localhost:5000/api/tickets', {
          withCredentials: true
        });
        const tickets = res.data;

        // Tell opp hvor mange tickets det er i hver kategori
        const counts = {};
        tickets.forEach((t) => {
          const cat = t.category;
          counts[cat] = (counts[cat] || 0) + 1;
        });

        const labels = Object.keys(counts);
        const dataValues = Object.values(counts);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Antall tickets per kategori',
              data: dataValues,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        });
      } catch (err) {
        console.error('Feil ved henting av tickets:', err);
        setError('Kunne ikke hente tickets. Sjekk at du er logget inn som admin.');
      }
    };

    fetchTickets();
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!chartData) {
    return <p>Laster ticket‐statistikk…</p>;
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h3>Ticket‐Statistikk</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            },
            title: {
              display: false
            }
          }
        }}
      />
    </div>
  );
};

export default BotAdminTicketChart;
