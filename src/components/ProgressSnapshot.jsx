/**
 * Fix #10 — Before/After Outcome Measurement
 * Shows measurable transformation: first week vs current week
 * Visual comparison that proves the journey is working.
 */
import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function getWeekDates(offset = 0) {
  const dates = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i - (offset * 7))
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export default function ProgressSnapshot() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const morningLog = state.morningLog || []

  // Only show after 14+ days of data
  if (morningLog.length < 7) return null

  const snapshot = useMemo(() => {
    const firstDates = morningLog.slice(0, 7)
    const currentDates = getWeekDates(0)

    // First week data
    const firstMornings = firstDates.length
    const firstGratitude = firstDates.filter(d => ((state.gratitude?.[d]) || []).filter(Boolean).length >= 3).length
    const firstSleepDays = firstDates.filter(d => state.sleepLog?.[d]).length
    const firstSleepAvg = firstDates.reduce((s, d) => {
      const h = Number(state.sleepLog?.[d]?.hours) || 0
      return s + h
    }, 0) / Math.max(firstSleepDays, 1)
    const firstStateDays = firstDates.filter(d => (state.stateLog || []).some(l => l.date === d)).length
    const firstBeautiful = firstDates.filter(d => (state.stateLog || []).some(l => l.date === d && l.state === 'beautiful')).length

    // Current week data
    const currentMornings = currentDates.filter(d => morningLog.includes(d)).length
    const currentGratitude = currentDates.filter(d => ((state.gratitude?.[d]) || []).filter(Boolean).length >= 3).length
    const currentSleepDays = currentDates.filter(d => state.sleepLog?.[d]).length
    const currentSleepAvg = currentDates.reduce((s, d) => {
      const h = Number(state.sleepLog?.[d]?.hours) || 0
      return s + h
    }, 0) / Math.max(currentSleepDays, 1)
    const currentStateDays = currentDates.filter(d => (state.stateLog || []).some(l => l.date === d)).length
    const currentBeautiful = currentDates.filter(d => (state.stateLog || []).some(l => l.date === d && l.state === 'beautiful')).length

    return {
      mornings:  { first: firstMornings,  current: currentMornings },
      gratitude: { first: firstGratitude,  current: currentGratitude },
      sleep:     { first: Math.round(firstSleepAvg * 10) / 10, current: Math.round(currentSleepAvg * 10) / 10 },
      state:     { first: firstStateDays,  current: currentStateDays },
      beautiful: { first: firstBeautiful,  current: currentBeautiful },
      totalDays: morningLog.length,
    }
  }, [state, morningLog])

  // Check if there's meaningful improvement
  const improvements = [
    snapshot.mornings.current > snapshot.mornings.first,
    snapshot.gratitude.current > snapshot.gratitude.first,
    snapshot.sleep.current > snapshot.sleep.first,
    snapshot.beautiful.current > snapshot.beautiful.first,
  ].filter(Boolean).length

  const metrics = [
    {
      emoji: '☀️',
      labelAr: 'صباحات',
      labelEn: 'Mornings',
      first: `${snapshot.mornings.first}/7`,
      current: `${snapshot.mornings.current}/7`,
      improved: snapshot.mornings.current > snapshot.mornings.first,
    },
    {
      emoji: '🙏',
      labelAr: 'امتنان',
      labelEn: 'Gratitude',
      first: `${snapshot.gratitude.first}/7`,
      current: `${snapshot.gratitude.current}/7`,
      improved: snapshot.gratitude.current > snapshot.gratitude.first,
    },
    {
      emoji: '😴',
      labelAr: 'نوم (ساعة)',
      labelEn: 'Sleep (hrs)',
      first: snapshot.sleep.first > 0 ? `${snapshot.sleep.first}h` : '—',
      current: snapshot.sleep.current > 0 ? `${snapshot.sleep.current}h` : '—',
      improved: snapshot.sleep.current > snapshot.sleep.first,
    },
    {
      emoji: '🌟',
      labelAr: 'أيام جميلة',
      labelEn: 'Beautiful Days',
      first: `${snapshot.beautiful.first}/7`,
      current: `${snapshot.beautiful.current}/7`,
      improved: snapshot.beautiful.current > snapshot.beautiful.first,
    },
  ]

  return (
    <div style={{
      borderRadius: 16,
      padding: '14px 16px',
      background: '#0e0e0e',
      border: '1px solid #1e1e1e',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#c9a84c' }}>
          📊 {isAr ? 'قياس التحول' : 'Transformation Measurement'}
        </p>
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color: '#555',
          background: '#1a1a1a',
          padding: '2px 8px',
          borderRadius: 99,
        }}>
          {isAr ? `يوم ${snapshot.totalDays}` : `Day ${snapshot.totalDays}`}
        </span>
      </div>

      {/* Before/After Table */}
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1e1e1e' }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          padding: '6px 10px',
          background: '#111',
          borderBottom: '1px solid #1e1e1e',
        }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#555' }}></span>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#e63946', textAlign: 'center' }}>
            {isAr ? 'البداية' : 'Start'}
          </span>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#2ecc71', textAlign: 'center' }}>
            {isAr ? 'الآن' : 'Now'}
          </span>
        </div>

        {/* Metric rows */}
        {metrics.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              padding: '8px 10px',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              borderBottom: i < metrics.length - 1 ? '1px solid #1a1a1a' : 'none',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{m.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#999' }}>
                {isAr ? m.labelAr : m.labelEn}
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#666', textAlign: 'center' }}>
              {m.first}
            </span>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontSize: 12,
                fontWeight: 800,
                color: m.improved ? '#2ecc71' : '#ddd',
              }}>
                {m.current}
              </span>
              {m.improved && (
                <span style={{ fontSize: 9, color: '#2ecc71', marginLeft: 4 }}>▲</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: 10,
        padding: '8px 10px',
        borderRadius: 10,
        background: improvements >= 3 ? 'rgba(46,204,113,0.06)' : improvements >= 1 ? 'rgba(201,168,76,0.06)' : 'rgba(231,76,60,0.06)',
        border: `1px solid ${improvements >= 3 ? 'rgba(46,204,113,0.2)' : improvements >= 1 ? 'rgba(201,168,76,0.15)' : 'rgba(231,76,60,0.2)'}`,
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: improvements >= 3 ? '#2ecc71' : improvements >= 1 ? '#c9a84c' : '#e63946',
        }}>
          {improvements >= 3
            ? (isAr ? '🔥 تحسن واضح في أغلب المجالات — أنت تتحول!' : '🔥 Clear improvement across most areas — you\'re transforming!')
            : improvements >= 1
              ? (isAr ? '💪 بداية تحسن — استمر لترى النتائج الكبيرة' : '💪 Starting to improve — keep going for bigger results')
              : (isAr ? '⚡ الاتساق هو المفتاح — لا تستسلم' : '⚡ Consistency is key — don\'t give up')}
        </span>
      </div>
    </div>
  )
}
