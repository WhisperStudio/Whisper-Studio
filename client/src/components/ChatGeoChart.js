// src/components/ChatGeoChart.js
import React, { useEffect, useState } from 'react'
import { Chart } from 'react-google-charts'
import { collectionGroup, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

// Intl helper to turn ISO ↔ full country name
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

export default function ChatGeoChart() {
  // [ ['Country', 'Messages', { role:'tooltip', type:'string' } ], ... ]
  const [chartData, setChartData] = useState([
    ['Country','Messages',{ role:'tooltip', type:'string' }]
  ])
  const [counts, setCounts] = useState({})
  const [total,  setTotal ] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        const snap = await getDocs(collectionGroup(db, 'messages'));
        const agg = {};
        
        snap.docs.forEach(doc => {
          const c = doc.data().country;
          if (!c || c === 'unknown') return;
          agg[c] = (agg[c] || 0) + 1;
        });
        
        setCounts(agg);
        const sum = Object.values(agg).reduce((a,b)=>a+b,0);
        setTotal(sum);
        
        // build google-charts rows
        const rows = Object.entries(agg).map(([iso, cnt]) => {
          let full = iso;
          try {
            // Only try to get display name if iso looks like a valid country code
            if (iso && iso.length === 2 && /^[A-Z]{2}$/.test(iso.toUpperCase())) {
              full = regionNames.of(iso.toUpperCase()) || iso;
            }
          } catch (error) {
            console.warn(`Invalid country code: ${iso}`, error);
            full = iso; // fallback to original value
          }
          
          const tip = `
                          ${full}
                          Messages: ${cnt}
                        `;
          return [iso, cnt, tip];
        });
        
        setChartData([
          ['Country','Messages',{ role:'tooltip', type:'string' }],
          ...rows
        ]);
      } catch (error) {
        console.error('Error loading chat geo data:', error);
      }
    };
    
    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [])

  // get top 10
  const top10 = Object.entries(counts)
    .sort(([,a],[,b])=>b-a)
    .slice(0,10)

  const styles = {
    container: {
      display: 'flex',
      gap: 16,
      background: '#0a0f1a',
      borderRadius: 8,
      padding: 16,
      color: '#cfefff',
      boxShadow: '0 0 16px rgba(0,85,170,0.5)',
    },
    mapWrapper: {
      flex: 2,
      border: '1px solid #003366',
      borderRadius: 4,
      overflow: 'hidden',
      minHeight: 400,
    },
    sidebar: {
      flex: 1,
      background: '#0f1b2a',
      borderRadius: 4,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 20,
      color: '#00ddff',
      marginBottom: 8,
      textShadow: '1px 1px 2px #000',
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      flex: 1,
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #002244',
    },
    countryCode: {
      fontWeight: 'bold',
      color: '#00aaff',
    },
    count: {
      color: '#99e6ff',
    },
    total: {
      marginTop: 16,
      paddingTop: 8,
      borderTop: '1px solid #002244',
      textAlign: 'center',
      fontSize: 18,
      color: '#ffffff',
    },
  }

  const options = {
    displayMode: 'regions',
    resolution: 'countries',
    backgroundColor: '#0a0f1a',
    datalessRegionColor: '#1a2130',
    defaultColor: '#003366',
    colorAxis: { colors: ['#ebeaec','#63548C','#934397'] },
    legend: 'none',
    tooltip: {
      isHtml: true,
      trigger: 'hover',
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.mapWrapper}>
        <Chart
          chartType="GeoChart"
          width="100%"
          height="100%"
          data={chartData}
          options={options}
        />
      </div>
      <div style={styles.sidebar}>
        <div>
          <h2 style={styles.title}>Top 10 Countries</h2>
          <ol style={styles.list}>
            {top10.map(([cc,cnt])=>(
              <li key={cc} style={styles.listItem}>
                <span style={styles.countryCode}>{cc}</span>
                <span style={styles.count}>{cnt}</span>
              </li>
            ))}
          </ol>
        </div>
        <div style={styles.total}>
          Total messages = <strong>{total}</strong>
        </div>
      </div>
    </div>
  )
}
