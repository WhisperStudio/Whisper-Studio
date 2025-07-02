// pages/api/chat-activity.js
import { format, subHours, subDays, differenceInHours, differenceInCalendarDays } from 'date-fns'
import { db } from '../../lib/firebaseAdmin'  // <-- admin‐SDK

export default async function handler(req, res) {
  const range = req.query.range || '24h'
  let windowStart = new Date()
  if (range === '1h')       windowStart = subHours(new Date(), 1)
  else if (range === '24h') windowStart = subHours(new Date(), 24)
  else if (range === '7d')  windowStart = subDays(new Date(), 7)
  else if (range === '30d') windowStart = subDays(new Date(), 30)

  const now    = new Date()
  const byHour = range === '1h' || range === '24h'
  const labels = []

  if (byHour) {
    const total = differenceInHours(now, windowStart)
    for (let i = 0; i <= total; i++) {
      const dt = subHours(now, total - i)
      labels.push(format(dt, 'HH:00'))
    }
  } else {
    const total = differenceInCalendarDays(now, windowStart)
    for (let i = 0; i <= total; i++) {
      const dt = subDays(now, total - i)
      labels.push(format(dt, 'yyyy-MM-dd'))
    }
  }

  const userCounts = labels.map(() => 0)
  const botCounts  = labels.map(() => 0)

  const snap = await db
    .collectionGroup('messages')
    .where('timestamp', '>=', windowStart)
    .orderBy('timestamp', 'asc')
    .get()

  snap.forEach(doc => {
    const d  = doc.data()
    const ts = d.timestamp.toDate()
    const key = byHour
      ? format(ts, 'HH:00')
      : format(ts, 'yyyy-MM-dd')
    const idx = labels.indexOf(key)
    if (idx !== -1) {
      if (d.sender === 'user') userCounts[idx]++
      else if (d.sender === 'bot') botCounts[idx]++
    }
  })

  res.status(200).json({ labels, userCounts, botCounts })
}
