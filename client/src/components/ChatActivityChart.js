import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import {
  format,
  subHours,
  subDays,
  differenceInHours,
  differenceInCalendarDays
} from 'date-fns'

// register Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const RANGES = [
  { label: 'Last 1 h',  value: '1h'  },
  { label: 'Last 24 h', value: '24h' },
  { label: 'Last 7 d',  value: '7d'  },
  { label: 'Last 30 d', value: '30d' }
]

export default function ChatActivityChart() {
  const [range, setRange] = useState('24h')
  const [labels, setLabels] = useState([])
  const [userCounts, setUserCounts] = useState([])
  const [botCounts, setBotCounts] = useState([])

  useEffect(() => {
    fetch(`/api/chat-activity?range=${range}`)
      .then(r => r.json())
      .then(({ labels, userCounts, botCounts }) => {
        setLabels(labels)
        setUserCounts(userCounts)
        setBotCounts(botCounts)
      })
      .catch(console.error)
  }, [range])

  const data = {
    labels,
    datasets: [
      {
        label: 'User messages',
        data: userCounts,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.5)'
      },
      {
        label: 'Bot messages',
        data: botCounts,
        borderColor: 'rgba(153,102,255,1)',
        backgroundColor: 'rgba(153,102,255,0.5)'
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Chat Activity' },
      legend: { position: 'bottom' }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: range === '1h' || range === '24h' ? 'Hour' : 'Date'
        }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Count' }
      }
    }
  }

  return (
    <div style={{ maxWidth: 800, marginTop: 400,  margin: '2rem auto' }}>
      <div style={{ marginBottom: 16 }}>
        {RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            style={{
              marginRight: 8,
              padding: '6px 12px',
              background: r.value === range ? '#4a6fc3' : '#2d3a6a',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
      <Line data={data} options={options} />
    </div>
  )
}
