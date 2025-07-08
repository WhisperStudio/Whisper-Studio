// src/components/ChatGeoChart.js
import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Bytt regionNames ut av komponenten slik at det ikke brukes som avhengighet
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export default function ChatGeoChart() {
  // Første rad definerer kolonnene: ISO-kode, antall, HTML-tooltip
  const [data, setData] = useState([
    ['Country', 'Messages', { role: 'tooltip', type: 'string' }],
  ]);

  useEffect(() => {
    const unsub = onSnapshot(
      collectionGroup(db, 'messages'),
      (snapshot) => {
        const counts = {};

        snapshot.docs.forEach(doc => {
          const { country } = doc.data();
          if (!country || country === 'unknown') return;
          counts[country] = (counts[country] || 0) + 1;
        });

        const rows = Object.entries(counts).map(([iso, cnt]) => {
          const fullName = regionNames.of(iso) || iso;
          const tooltipHtml = `
            <div style="padding:5px;">
              <strong>${fullName}</strong><br/>
              Messages: ${cnt}
            </div>
          `;
          return [iso, cnt, tooltipHtml];
        });

        setData([
          ['Country', 'Messages', { role: 'tooltip', type: 'string' }],
          ...rows,
        ]);
      }
    );

    return () => unsub();
  }, []); // tom avhengighet for å kjøre kun én gang

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', color: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>Messages by Country</h2>
      <Chart
        chartType="GeoChart"
        width="100%"
        height="400px"
        data={data}
        options={{
          backgroundColor: '#0e0c0d',
          datalessRegionColor: '#2d3a6a',
          colorAxis: { colors: ['#b3e5fc', '#0288d1'] },
          legend: 'none',
          displayMode: 'regions',
          resolution: 'countries',
          tooltip: {
            isHtml: true,
            trigger: 'hover',
          },
        }}
      />
    </div>
  );
}
