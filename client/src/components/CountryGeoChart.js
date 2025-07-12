// src/components/CountryGeoChart.js
import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore();

export default function CountryGeoChart() {
  const [data, setData] = useState([['Country', 'Visits']]);
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'visitors'));
      const agg = {};
      snap.forEach(doc => {
        const country = doc.data().country || 'Unknown';
        agg[country] = (agg[country] || 0) + 1;
      });
      setCounts(agg);
      setTotal(Object.values(agg).reduce((s, v) => s + v, 0));
      setData([['Country','Visits'], ...Object.entries(agg)]);
    })();
  }, []);

  // pick top 10
  const top10 = Object.entries(counts)
    .sort(([,a],[,b]) => b - a)
    .slice(0,10);

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
  };

  const options = {
    displayMode: 'regions',
    resolution: 'countries',
    backgroundColor: '#0a0f1a',
    datalessRegionColor: '#1a2130',
    defaultColor: '#8D7FB3',
    colorAxis: { colors: ['#ebeaec','#63548C','#934397'] },
    legend: 'none',           
    tooltip: {
      textStyle: { color: '#000' },
      backgroundColor: '#e0ffff',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.mapWrapper}>
        <Chart
          chartType="GeoChart"
          width="100%"
          height="100%"
          data={data}
          options={options}
        />
      </div>
      <div style={styles.sidebar}>
        <div>
          <h2 style={styles.title}>Top 10 Countries</h2>
          <ol style={styles.list}>
            {top10.map(([cc, cnt]) => (
              <li key={cc} style={styles.listItem}>
                <span style={styles.countryCode}>{cc}</span>
                <span style={styles.count}>{cnt}</span>
              </li>
            ))}
          </ol>
        </div>
        <div style={styles.total}>
          Total visits = <strong>{total}</strong>
        </div>
      </div>
    </div>
  );
}
