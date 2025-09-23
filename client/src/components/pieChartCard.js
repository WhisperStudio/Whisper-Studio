// src/components/PieChartCard.js
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { db, collection, getDocs, onSnapshot } from '../firebase';
import styled from 'styled-components';

Chart.register(ArcElement, Tooltip, Legend);

const Container = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: #0a0f1a;
  border-radius: 8px;
  border: 1px solid #003366;
  box-shadow: 0 0 16px rgba(0,85,170,0.5);
  color: #cfefff;
`;

const Title = styled.h3`
  color: #00ddff;
  text-align: center;
  margin-bottom: 1.5rem;
  text-shadow: 1px 1px 2px #000;
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 107, 107, 0.3);
`;

const LoadingMessage = styled.p`
  color: #99e6ff;
  text-align: center;
  padding: 1rem;
`;

const PieChartCard = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Prøv å hente fra conversations collection
        const conversationsRef = collection(db, 'conversations');
        const snapshot = await getDocs(conversationsRef);
        
        if (snapshot.empty) {
          // Hvis ingen conversations, bruk mock data
          const mockData = generateMockConversationData();
          setChartData(mockData);
        } else {
          // Tell opp hvor mange conversations som har status open/pending/closed
          const counts = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            const status = data.status || 'unknown';
            counts[status] = (counts[status] || 0) + 1;
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
                  'rgba(0, 221, 255, 0.8)',
                  'rgba(255, 206, 86, 0.8)',
                  'rgba(255, 99, 132, 0.8)',
                  'rgba(75, 192, 192, 0.8)',
                  'rgba(153, 102, 255, 0.8)'
                ],
                borderColor: [
                  'rgba(0, 221, 255, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(255, 99, 132, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 2
              }
            ]
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Feil ved henting av data:', err);
        // Fallback til mock data
        const mockData = generateMockConversationData();
        setChartData(mockData);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateMockConversationData = () => {
    const statuses = ['open', 'pending', 'closed', 'resolved'];
    const counts = {
      'open': Math.floor(Math.random() * 20) + 5,
      'pending': Math.floor(Math.random() * 15) + 3,
      'closed': Math.floor(Math.random() * 50) + 20,
      'resolved': Math.floor(Math.random() * 30) + 10
    };

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Samtale‐statusfordeling',
          data: Object.values(counts),
          backgroundColor: [
            'rgba(0, 221, 255, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ],
          borderColor: [
            'rgba(0, 221, 255, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 2
        }
      ]
    };
  };

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (loading || !chartData) {
    return (
      <Container>
        <LoadingMessage>Laster samtale‐statistikk…</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Samtale‐Statistikk</Title>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#cfefff',
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: '#cfefff',
              titleColor: '#000',
              bodyColor: '#000',
              borderColor: '#00ddff',
              borderWidth: 1
            }
          },
          elements: {
            arc: {
              borderWidth: 2
            }
          }
        }}
      />
    </Container>
  );
};

export default PieChartCard;
