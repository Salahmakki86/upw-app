/**
 * WeeklyDiscovery — Auto-generated "What you discovered this week"
 * Shows every Sunday/Monday (or when 7+ days of data exist)
 * Gives users a reason to come back — unique insight each week
 */
import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

function getWeekDates() {
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function generateDiscoveries(state, isAr) {
  const week = getWeekDates()
  const discoveries = []

  // 1. Best day of the week
  const checkin = state.stateCheckin || {}
  let bestDay = null, bestAvg = 0
  week.forEach(d => {
    if (!checkin[d]) return
    const avg = (checkin[d].energy + checkin[d].mood + checkin[d].clarity) / 3
    if (avg > bestAvg) { bestAvg = avg; bestDay = d }
  })
  if (bestDay) {
    const dayName = new Date(bestDay).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'long' })
    discoveries.push({
      emoji: '🏆',
      text: isAr
        ? `أفضل يوم لك كان ${dayName} (حالة ${Math.round(bestAvg * 10) / 10}/10)`
        : `Your best day was ${dayName} (state ${Math.round(bestAvg * 10) / 10}/10)`,
    })
  }

  // 2. Habit consistency
  const habitLog = state.habitTracker?.log || {}
  const habitList = state.habitTracker?.list || []
  const weekHabitDays = week.filter(d => (habitLog[d] || []).length > 0).length
  if (weekHabitDays > 0 && habitList.length > 0) {
    discoveries.push({
      emoji: '📊',
      text: isAr
        ? `أكملت عاداتك ${weekHabitDays}/7 أيام هذا الأسبوع`
        : `You completed habits ${weekHabitDays}/7 days this week`,
    })
  }

  // 3. Gratitude streak
  const gratitude = state.gratitude || {}
  const gratDays = week.filter(d => (gratitude[d] || []).filter(v => v?.trim()).length >= 3).length
  if (gratDays >= 3) {
    discoveries.push({
      emoji: '🙏',
      text: isAr
        ? `سجّلت الامتنان ${gratDays} أيام — عقلك يُبرمج نفسه على الإيجابية`
        : `Gratitude logged ${gratDays} days — your brain is rewiring toward positivity`,
    })
  }

  // 4. Sleep insight
  const sleepLog = state.sleepLog || {}
  const sleepHours = week.map(d => sleepLog[d]?.hours).filter(Boolean)
  if (sleepHours.length >= 3) {
    const avg = Math.round(sleepHours.reduce((s, h) => s + h, 0) / sleepHours.length * 10) / 10
    discoveries.push({
      emoji: '😴',
      text: isAr
        ? `متوسط نومك: ${avg} ساعات ${avg >= 7 ? '— ممتاز! حافظ عليه' : '— حاول الوصول لـ 7+'}`
        : `Avg sleep: ${avg} hours ${avg >= 7 ? '— excellent! Keep it up' : '— aim for 7+ hours'}`,
    })
  }

  // 5. Goal progress
  const goals = state.goals || []
  const movedGoals = goals.filter(g => {
    const weekAgo = Date.now() - 7 * 86400000
    return g.updatedAt && g.updatedAt > weekAgo && (g.progress || 0) > 0
  })
  if (movedGoals.length > 0) {
    discoveries.push({
      emoji: '🎯',
      text: isAr
        ? `حرّكت ${movedGoals.length} هدف هذا الأسبوع — استمر!`
        : `Moved ${movedGoals.length} goal${movedGoals.length > 1 ? 's' : ''} this week — keep going!`,
    })
  }

  return discoveries
}

export default function WeeklyDiscovery() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const [dismissed, setDismissed] = useState(false)

  // Show on Sunday (0) or Monday (1)
  const dayOfWeek = new Date().getDay()
  const isWeeklySummaryDay = dayOfWeek === 0 || dayOfWeek === 1
  const morningCount = (state.morningLog || []).length

  const discoveries = useMemo(() => generateDiscoveries(state, isAr), [state, isAr])

  // Only show if: it's summary day, user has 7+ mornings, there are discoveries, and not dismissed
  if (!isWeeklySummaryDay || morningCount < 7 || discoveries.length < 2 || dismissed) return null

  return (
    <div style={{
      borderRadius: 16, padding: 14, marginBottom: 14,
      background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(147,112,219,0.06))',
      border: '1px solid rgba(201,168,76,0.25)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c' }}>
          📬 {isAr ? 'اكتشافات الأسبوع' : 'This Week\'s Discoveries'}
        </p>
        <button onClick={() => setDismissed(true)} style={{ fontSize: 10, color: '#444', background: 'none', border: 'none' }}>✕</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {discoveries.slice(0, 4).map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>{d.emoji}</span>
            <p style={{ fontSize: 11, color: '#ccc', lineHeight: 1.5 }}>{d.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
