// src/components/PieChartCard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const PieChartCard = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/conversations', {
          withCredentials: true
        });
        const convs = res.data;

        // Tell opp hvor mange conversations som har status open/pending/closed
        const counts = {};
        convs.forEach((c) => {
          const st = c.status;
          counts[st] = (counts[st] || 0) + 1;
        });

        const labels = Object.keys(counts);
        const dataValues = Object.values(counts);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Samtale‐statusfordeling',
              data: dataValues,
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 99, 132, 0.6)'
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)'
              ],
              borderWidth: 1
            }
          ]
        });
      } catch (err) {
        console.error('Feil ved henting av conversations:', err);
        setError('Kunne ikke hente samtaler. Sjekk at du er logget inn som admin.');
      }
    };

    fetchConversations();
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!chartData) {
    return <p>Laster samtale‐statistikk…</p>;
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h3>Samtale‐Statistikk</h3>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }}
      />
    </div>
  );
};

export default PieChartCard;
