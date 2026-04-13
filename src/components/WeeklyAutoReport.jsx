/**
 * WeeklyAutoReport — Batch 2 Fix #18
 * Auto-generates weekly summary card every Sunday/Monday.
 * User doesn't need to visit /insights — the report comes to them.
 * Principle: "No automatic weekly report" → now it's automatic.
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  })
}

export default function WeeklyAutoReport() {
  const { state } = useApp()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'
  const [dismissed, setDismissed] = useState(false)

  // Only show on Sunday (0) or Monday (1)
  const today = new Date()
  const dayOfWeek = today.getDay()
  const isReportDay = dayOfWeek === 0 || dayOfWeek === 1

  // Check if dismissed today
  const todayKey = today.toISOString().split('T')[0]
  const weeklyDismissed = state.weeklyReportDismissed?.[todayKey]

  const report = useMemo(() => {
    const days7 = lastNDays(7)
    const morningLog = state.morningLog || []
    const sleepLog = state.sleepLog || {}
    const gratitude = state.gratitude || {}
    const habitLog = state.habitTracker?.log || {}
    const stateCheckin = state.stateCheckin || {}
    const goals = state.goals || []

    // Metrics
    const morningDays = days7.filter(d => morningLog.includes(d)).length
    const sleepDays = days7.filter(d => sleepLog[d]?.hours).length
    const avgSleep = sleepDays > 0
      ? Math.round(days7.reduce((s, d) => s + (sleepLog[d]?.hours || 0), 0) / sleepDays * 10) / 10
      : 0
    const gratitudeDays = days7.filter(d => (gratitude[d] || []).filter(Boolean).length >= 3).length
    const habitDays = days7.filter(d => (habitLog[d] || []).length > 0).length
    const stateDays = days7.filter(d => stateCheckin[d]).length

    const checkins = days7.map(d => stateCheckin[d]).filter(Boolean)
    const avgEnergy = checkins.length > 0
      ? Math.round(checkins.reduce((s, c) => s + (c.energy || 5), 0) / checkins.length * 10) / 10
      : null
    const avgMood = checkins.length > 0
      ? Math.round(checkins.reduce((s, c) => s + (c.mood || 5), 0) / checkins.length * 10) / 10
      : null

    const goalsWorked = goals.filter(g => {
      const log = g.dailyLog || {}
      return days7.some(d => log[d]?.task)
    }).length

    // Overall grade A-D
    const totalScore = morningDays + gratitudeDays + habitDays + Math.min(sleepDays, 7)
    const grade = totalScore >= 24 ? 'A' : totalScore >= 18 ? 'B' : totalScore >= 12 ? 'C' : 'D'
    const gradeColor = { A: '#2ecc71', B: '#c9a84c', C: '#f39c12', D: '#e63946' }[grade]

    // Find weakest area
    const areas = [
      { key: 'morning', score: morningDays, labelAr: 'الصباح', labelEn: 'Morning Ritual' },
      { key: 'gratitude', score: gratitudeDays, labelAr: 'الامتنان', labelEn: 'Gratitude' },
      { key: 'habits', score: habitDays, labelAr: 'العادات', labelEn: 'Habits' },
      { key: 'sleep', score: sleepDays, labelAr: 'النوم', labelEn: 'Sleep' },
    ]
    const weakest = areas.reduce((a, b) => a.score < b.score ? a : b)

    return {
      morningDays, sleepDays, avgSleep, gratitudeDays, habitDays,
      stateDays, avgEnergy, avgMood, goalsWorked,
      grade, gradeColor, weakest, streak: state.streak || 0,
    }
  }, [state])

  if (!isReportDay || dismissed || weeklyDismissed) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0d08 0%, #111 100%)',
      border: `1px solid ${report.gradeColor}30`,
      borderRadius: 20, padding: 16, marginBottom: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: `${report.gradeColor}15`, border: `2px solid ${report.gradeColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: report.gradeColor,
          }}>
            {report.grade}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>
              {isAr ? '📊 تقريرك الأسبوعي' : '📊 Your Weekly Report'}
            </p>
            <p style={{ fontSize: 10, color: '#555' }}>
              {isAr ? 'آخر 7 أيام — تلقائي' : 'Last 7 days — auto-generated'}
            </p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} style={{
          background: 'none', border: 'none', color: '#444', fontSize: 11, cursor: 'pointer',
        }}>
          {isAr ? 'إخفاء' : 'Hide'}
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
        {[
          { v: `${report.morningDays}/7`, l: isAr ? 'صباح' : 'Morning', c: report.morningDays >= 5 ? '#2ecc71' : '#f39c12' },
          { v: `${report.gratitudeDays}/7`, l: isAr ? 'امتنان' : 'Gratitude', c: report.gratitudeDays >= 5 ? '#2ecc71' : '#f39c12' },
          { v: report.avgSleep ? `${report.avgSleep}h` : '—', l: isAr ? 'نوم' : 'Sleep', c: report.avgSleep >= 7 ? '#2ecc71' : '#f39c12' },
          { v: `${report.habitDays}/7`, l: isAr ? 'عادات' : 'Habits', c: report.habitDays >= 5 ? '#2ecc71' : '#f39c12' },
        ].map((item, i) => (
          <div key={i} style={{
            background: '#0a0a0a', borderRadius: 10, padding: '8px 4px', textAlign: 'center',
            border: '1px solid #1e1e1e',
          }}>
            <p style={{ fontSize: 16, fontWeight: 900, color: item.c }}>{item.v}</p>
            <p style={{ fontSize: 9, color: '#666', marginTop: 2 }}>{item.l}</p>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div style={{
        background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: 10, padding: '8px 10px', marginBottom: 10,
      }}>
        <p style={{ fontSize: 11, color: '#ddd', fontWeight: 600, lineHeight: 1.5 }}>
          {report.weakest.score <= 3
            ? (isAr
              ? `💡 أضعف نقطة: ${report.weakest.labelAr} (${report.weakest.score}/7) — ركّز عليها هذا الأسبوع`
              : `💡 Weakest area: ${report.weakest.labelEn} (${report.weakest.score}/7) — focus here this week`)
            : (isAr
              ? `🔥 أداء قوي! سلسلتك: ${report.streak} يوم`
              : `🔥 Strong performance! Streak: ${report.streak} days`)}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/insights')}
        className="transition-all active:scale-95"
        style={{
          width: '100%', padding: '10px 16px', borderRadius: 12,
          background: `${report.gradeColor}15`, border: `1px solid ${report.gradeColor}30`,
          color: report.gradeColor, fontWeight: 800, fontSize: 11,
          cursor: 'pointer',
        }}>
        {isAr ? '📊 التقرير الكامل ←' : '📊 Full Report  →'}
      </button>
    </div>
  )
}
