import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, Flame, Star, Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import TransformationPulse from '../components/TransformationPulse'
import WeeklyTruthReview from '../components/WeeklyTruthReview'
import JourneyTimeline from '../components/JourneyTimeline'
import { detectRootCause } from '../utils/transformationEngine'

// ─── helpers ────────────────────────────────────────────────────────────────

function getLast14Keys() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().split('T')[0]
  })
}

function getLast30Keys() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })
}

function getLast7Keys() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function calcHours(bedtime, waketime) {
  if (!bedtime || !waketime) return null
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = waketime.split(':').map(Number)
  let diff = (wh * 60 + wm) - (bh * 60 + bm)
  if (diff < 0) diff += 24 * 60
  return Math.round((diff / 60) * 10) / 10
}

function hoursQualityColor(hours, quality) {
  if (!hours && !quality) return '#2a2a2a'
  const h = hours || 0
  const q = quality || 0
  if (h < 6 || q < 3) return '#e74c3c'
  if (h < 7 || q < 4) return '#e67e22'
  return '#2ecc71'
}

function shortDayLabel(dateStr, isAr) {
  const d = new Date(dateStr + 'T00:00:00')
  const arLabels = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمس', 'جمع', 'سبت']
  const enLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return isAr ? arLabels[d.getDay()] : enLabels[d.getDay()]
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SummaryCard({ emoji, value, label, color }) {
  return (
    <div style={{
      borderRadius: 16,
      padding: '16px 12px',
      background: '#0e0e0e',
      border: '1px solid #1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
    }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <span style={{ color: color || '#c9a84c', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ color: '#666', fontSize: 10, textAlign: 'center', lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
  )
}

function HabitBarChart({ habitTracker, last7, isAr }) {
  const list = habitTracker?.list || []
  const log  = habitTracker?.log  || {}
  const total = list.length

  const bars = last7.map(dateKey => {
    const done = (log[dateKey] || []).length
    const pct  = total > 0 ? done / total : 0
    return { dateKey, done, pct }
  })

  const barColor = (pct) => {
    if (pct === 0) return '#1e1e1e'
    if (pct < 0.5) return '#e67e22'
    if (pct < 1) return '#c9a84c'
    return '#2ecc71'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72 }}>
      {bars.map(({ dateKey, done, pct }) => (
        <div key={dateKey} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{
              width: '100%',
              height: `${Math.max(pct * 100, pct > 0 ? 8 : 0)}%`,
              minHeight: pct > 0 ? 8 : 0,
              borderRadius: '4px 4px 0 0',
              background: barColor(pct),
              transition: 'height 0.4s ease',
            }} />
          </div>
          <span style={{ color: '#555', fontSize: 8, whiteSpace: 'nowrap' }}>
            {shortDayLabel(dateKey, isAr)}
          </span>
          <span style={{ color: pct > 0 ? '#888' : '#333', fontSize: 8 }}>
            {done}/{total}
          </span>
        </div>
      ))}
    </div>
  )
}

function SleepDots({ sleepLog, last7, isAr }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
      {last7.map(dateKey => {
        const entry = sleepLog?.[dateKey]
        const hours = entry
          ? (entry.hours ?? calcHours(entry.bedtime, entry.waketime))
          : null
        const quality = entry?.quality || null
        const color = hoursQualityColor(hours, quality)
        const hasData = !!entry

        return (
          <div key={dateKey} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {/* Quality dots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(q => (
                <div key={q} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: hasData && quality >= q ? color : '#1e1e1e',
                }} />
              ))}
            </div>
            {/* Hours */}
            <span style={{
              fontSize: 9,
              color: hasData ? color : '#333',
              fontWeight: 700,
            }}>
              {hours !== null ? `${hours}h` : '-'}
            </span>
            {/* Day label */}
            <span style={{ color: '#444', fontSize: 8 }}>
              {shortDayLabel(dateKey, isAr)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const { state } = useApp()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const last30 = useMemo(() => getLast30Keys(), [])
  const last14 = useMemo(() => getLast14Keys(), [])
  const last7  = useMemo(() => getLast7Keys(), [])

  // ── Sleep average ──────────────────────────────────────────────────────────
  const avgSleep = useMemo(() => {
    const sleepLog = state.sleepLog || {}
    const vals = last30
      .map(k => {
        const e = sleepLog[k]
        if (!e) return null
        return e.hours ?? calcHours(e.bedtime, e.waketime)
      })
      .filter(v => v !== null && v > 0)
    if (!vals.length) return null
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  }, [state.sleepLog, last30])

  // ── Beautiful days % ──────────────────────────────────────────────────────
  const beautifulPct = useMemo(() => {
    const stateLog = state.stateLog || []
    const last30Set = new Set(last30)
    const inRange = stateLog.filter(s => last30Set.has(s.date))
    if (!inRange.length) return null
    const beautiful = inRange.filter(s => s.state === 'beautiful').length
    return Math.round((beautiful / inRange.length) * 100)
  }, [state.stateLog, last30])

  // ── Gratitude days ────────────────────────────────────────────────────────
  const gratitudeDays = useMemo(() => {
    const gratitude = state.gratitude || {}
    return last30.filter(k => {
      const e = gratitude[k] || []
      return e.filter(v => v && v.trim()).length >= 3
    }).length
  }, [state.gratitude, last30])

  // ── Superpower habit ─────────────────────────────────────────────────────
  const superpower = useMemo(() => {
    const tracker = state.habitTracker || {}
    const list = tracker.list || []
    const log  = tracker.log  || {}

    if (!list.length) return null

    let best = null
    let bestCount = 0

    list.forEach(habit => {
      let streak = 0
      const cursor = new Date()
      while (streak < 30) {
        const key = cursor.toISOString().split('T')[0]
        if ((log[key] || []).includes(habit.id)) {
          streak++
          cursor.setDate(cursor.getDate() - 1)
        } else {
          break
        }
      }
      // also count total days in last 30
      const totalDone = last30.filter(k => (log[k] || []).includes(habit.id)).length
      if (totalDone > bestCount) {
        bestCount = totalDone
        best = { ...habit, streak, totalDone }
      }
    })

    return best
  }, [state.habitTracker, last30])

  // ── Ritual reflection data (last 14 days) ─────────────────────────────────
  const ritualData = useMemo(() => {
    const refs = state.ritualReflections || {}
    const days = last14.map(k => ({
      key: k,
      morning: refs[k]?.morning?.rating || null,
      evening: refs[k]?.evening?.rating || null,
    }))

    const morningVals = days.map(d => d.morning).filter(Boolean)
    const eveningVals = days.map(d => d.evening).filter(Boolean)
    const totalDays = days.filter(d => d.morning || d.evening).length

    if (totalDays < 2) return null

    const avg = arr => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null

    return {
      days,
      avgMorning: avg(morningVals),
      avgEvening: avg(eveningVals),
      totalDays,
    }
  }, [state.ritualReflections, last14])

  // ── Root cause for Today's Focus ──────────────────────────────────────────
  const rootCause = useMemo(() => detectRootCause(state), [state])

  // ── Smart observations ────────────────────────────────────────────────────
  const observations = useMemo(() => {
    const obs = []
    const sleepLog = state.sleepLog || {}

    const morningCount = last30.filter(k => {
      // proxy: if state is beautiful AND sleep was logged, morning was likely done
      return !!sleepLog[k]
    }).length

    if (morningCount > 0) {
      obs.push({
        text: isAr
          ? `سجّلت نومك ${morningCount} مرة خلال آخر ٣٠ يوم`
          : `You logged sleep ${morningCount} times in the last 30 days`,
        action: '/sleep',
        actionLabel: isAr ? 'تتبع النوم' : 'Track Sleep',
      })
    }

    if (gratitudeDays > 0) {
      obs.push({
        text: isAr
          ? `معدل امتنانك: ${gratitudeDays} يوم من ٣٠`
          : `Gratitude rate: ${gratitudeDays} days out of 30`,
        action: '/gratitude',
        actionLabel: isAr ? 'الامتنان' : 'Gratitude',
      })
    }

    if (beautifulPct !== null) {
      if (beautifulPct >= 70) {
        obs.push({
          text: isAr
            ? `${beautifulPct}٪ من أيامك كانت جميلة — تفوق رائع! ✨`
            : `${beautifulPct}% of your days were beautiful — outstanding! ✨`,
          action: '/state',
          actionLabel: isAr ? 'سجّل حالتك' : 'Log State',
        })
      } else if (beautifulPct >= 40) {
        obs.push({
          text: isAr
            ? `لديك ${beautifulPct}٪ أيام جميلة — الروتين الصباحي سيرفعها أكثر`
            : `You have ${beautifulPct}% beautiful days — morning ritual can boost this`,
          action: '/state',
          actionLabel: isAr ? 'سجّل حالتك' : 'Log State',
        })
      } else {
        obs.push({
          text: isAr
            ? 'ركّز على ربط حالتك كل يوم — هذا يغير كل شيء'
            : 'Focus on logging your state daily — it changes everything',
          action: '/state',
          actionLabel: isAr ? 'سجّل حالتك' : 'Log State',
        })
      }
    }

    if (!obs.length) {
      obs.push({
        text: isAr
          ? 'ابدأ بتسجيل بياناتك يومياً لتظهر رؤى شخصية هنا'
          : 'Start logging daily data to unlock personal insights here',
        action: '/',
        actionLabel: isAr ? 'ابدأ الآن' : 'Start Now',
      })
    }

    return obs.slice(0, 2)
  }, [state.sleepLog, state.stateLog, gratitudeDays, beautifulPct, last30, isAr])

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#090909',
        minHeight: '100%',
        paddingBottom: 100,
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '52px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={() => navigate('/')}
          className="active:scale-95 transition-all"
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid #2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          {isAr
            ? <ChevronRight size={16} style={{ color: '#aaa' }} />
            : <ArrowLeft size={16} style={{ color: '#aaa' }} />
          }
        </button>

        <div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 900, marginBottom: 2 }}>
            {isAr ? 'تقرير رحلتي' : 'My Journey Report'}
          </h1>
          <p style={{ color: '#888', fontSize: 12 }}>
            {isAr ? 'آخر ٣٠ يوم' : 'Last 30 Days'}
          </p>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── Today's Focus ──────────────────────────────────────────────────── */}
        {rootCause && (
          <div style={{
            borderRadius: 20, padding: 16, marginBottom: 14,
            background: `linear-gradient(135deg, ${rootCause.color}18, ${rootCause.color}08)`,
            border: `1px solid ${rootCause.color}40`,
          }}>
            <p style={{
              fontSize: 11, fontWeight: 900, color: rootCause.color,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              {rootCause.emoji} {isAr ? 'تركيز اليوم' : "Today's Focus"}
            </p>
            <p style={{ color: '#fff', fontSize: 15, fontWeight: 800, marginBottom: 4 }}>
              {isAr ? rootCause.labelAr : rootCause.labelEn}
            </p>
            <p style={{ color: '#999', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
              {isAr ? rootCause.descAr : rootCause.descEn}
            </p>
            {rootCause.action && (
              <button onClick={() => navigate(rootCause.action)} style={{
                fontSize: 12, fontWeight: 800, color: '#0a0a0a',
                background: rootCause.color, borderRadius: 10,
                padding: '8px 18px', border: 'none', cursor: 'pointer',
              }}>
                {isAr ? (rootCause.actionAr || 'ابدأ الآن') : (rootCause.actionEn || 'Take Action')} →
              </button>
            )}
          </div>
        )}

        {/* ── Transformation Intelligence ────────────────────────────────────── */}
        <div style={{ marginBottom: 14 }}>
          <TransformationPulse />
        </div>

        {/* ── Summary 2×2 Grid ───────────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, marginBottom: 14,
        }}>
          <SummaryCard
            emoji="😴"
            value={avgSleep !== null ? `${avgSleep}h` : '--'}
            label={isAr ? 'متوسط النوم' : 'Avg Sleep'}
            color="#9b59b6"
          />
          <SummaryCard
            emoji="🔥"
            value={state.streak || 0}
            label={isAr ? 'الانتظام (يوم)' : 'Streak (days)'}
            color="#e67e22"
          />
          <SummaryCard
            emoji="✨"
            value={beautifulPct !== null ? `${beautifulPct}%` : '--'}
            label={isAr ? 'أيام جميلة' : 'Beautiful Days'}
            color="#2ecc71"
          />
          <SummaryCard
            emoji="📿"
            value={gratitudeDays}
            label={isAr ? 'أيام الامتنان' : 'Gratitude Days'}
            color="#c9a84c"
          />
        </div>

        {/* ── Weekly Truth Review ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 14 }}>
          <WeeklyTruthReview />
        </div>

        {/* ── Habit Chart ────────────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 20, padding: 16, marginBottom: 14,
          background: '#0e0e0e', border: '1px solid #1e1e1e',
        }}>
          <p style={{
            color: '#c9a84c', fontSize: 11, fontWeight: 900,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            ✅ {isAr ? 'إنجاز العادات — آخر ٧ أيام' : 'Habit Completion — Last 7 Days'}
          </p>
          {(state.habitTracker?.list || []).length === 0 ? (
            <p style={{ color: '#444', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>
              {isAr ? 'لم تُضف عادات بعد' : 'No habits added yet'}
            </p>
          ) : (
            <HabitBarChart habitTracker={state.habitTracker} last7={last7} isAr={isAr} />
          )}
          {/* color legend */}
          <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center' }}>
            {[
              { color: '#2ecc71', labelAr: 'مكتمل', labelEn: '100%' },
              { color: '#c9a84c', labelAr: '>50%', labelEn: '>50%' },
              { color: '#e67e22', labelAr: '<50%', labelEn: '<50%' },
            ].map(l => (
              <div key={l.color} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ color: '#555', fontSize: 9 }}>{isAr ? l.labelAr : l.labelEn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Superpower Card ────────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 20, padding: 16, marginBottom: 14,
          background: superpower
            ? 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))'
            : '#0e0e0e',
          border: `1px solid ${superpower ? 'rgba(201,168,76,0.4)' : '#1e1e1e'}`,
        }}>
          <p style={{
            color: '#c9a84c', fontSize: 11, fontWeight: 900,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            👑 {isAr ? 'قوتك الخارقة' : 'Your Superpower'}
          </p>

          {superpower ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `${superpower.color}22`,
                border: `1px solid ${superpower.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, flexShrink: 0,
              }}>
                {superpower.emoji}
              </div>
              <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                <p style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>
                  {isAr ? superpower.nameAr : superpower.nameEn}
                </p>
                <p style={{ color: '#888', fontSize: 12, marginTop: 3 }}>
                  {isAr
                    ? `${superpower.totalDone} مرة من ٣٠ يوم`
                    : `${superpower.totalDone} times in 30 days`
                  }
                </p>
                {superpower.streak > 1 && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(201,168,76,0.15)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: 99, padding: '2px 8px', marginTop: 6,
                  }}>
                    <Flame size={10} style={{ color: '#c9a84c' }} />
                    <span style={{ color: '#c9a84c', fontSize: 10, fontWeight: 700 }}>
                      {superpower.streak} {isAr ? 'يوم متواصل' : 'day streak'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ color: '#555', fontSize: 24, marginBottom: 8 }}>🌱</p>
              <p style={{ color: '#555', fontSize: 13 }}>
                {isAr ? 'ابدأ تتبع العادات لتكتشف قوتك الخارقة' : 'Start tracking habits to find your superpower'}
              </p>
            </div>
          )}
        </div>

        {/* ── Sleep Quality Trend ────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 20, padding: 16, marginBottom: 14,
          background: '#0e0e0e', border: '1px solid #1e1e1e',
        }}>
          <p style={{
            color: '#c9a84c', fontSize: 11, fontWeight: 900,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            😴 {isAr ? 'جودة النوم — آخر ٧ أيام' : 'Sleep Quality — Last 7 Days'}
          </p>
          <SleepDots sleepLog={state.sleepLog} last7={last7} isAr={isAr} />
          {/* legend */}
          <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center' }}>
            {[
              { color: '#2ecc71', labelAr: 'ممتاز', labelEn: 'Great' },
              { color: '#e67e22', labelAr: 'متوسط', labelEn: 'Fair' },
              { color: '#e74c3c', labelAr: 'ضعيف', labelEn: 'Poor' },
            ].map(l => (
              <div key={l.color} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ color: '#555', fontSize: 9 }}>{isAr ? l.labelAr : l.labelEn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Journey Timeline ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 14 }}>
          <JourneyTimeline />
        </div>

        {/* ── Ritual Quality Over Time ──────────────────────────────────────── */}
        {ritualData && (
          <div style={{
            borderRadius: 16, padding: 16, marginBottom: 14,
            background: '#0e0e0e', border: '1px solid #1e1e1e',
          }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              {isAr ? '📊 جودة الطقوس — آخر 14 يوم' : '📊 Ritual Quality — Last 14 Days'}
            </p>

            {/* Mini dot chart */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
              {ritualData.days.map((d, i) => {
                const mColor = d.morning ? ['#e74c3c','#e67e22','#f39c12','#c9a84c','#2ecc71'][d.morning - 1] : '#1e1e1e'
                const eColor = d.evening ? ['#e74c3c','#e67e22','#f39c12','#9370db','#2ecc71'][d.evening - 1] : '#1e1e1e'
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: mColor }} title={`M: ${d.morning || '-'}`} />
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: eColor }} title={`E: ${d.evening || '-'}`} />
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#c9a84c' }} />
                <span style={{ fontSize: 9, color: '#888' }}>{isAr ? 'صباح' : 'Morning'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#9370db' }} />
                <span style={{ fontSize: 9, color: '#888' }}>{isAr ? 'مساء' : 'Evening'}</span>
              </div>
            </div>

            {/* Averages + insight */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              {ritualData.avgMorning !== null && (
                <div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#c9a84c' }}>{ritualData.avgMorning}</span>
                  <span style={{ fontSize: 10, color: '#666' }}>/5 {isAr ? 'صباح' : 'morning'}</span>
                </div>
              )}
              {ritualData.avgEvening !== null && (
                <div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#9370db' }}>{ritualData.avgEvening}</span>
                  <span style={{ fontSize: 10, color: '#666' }}>/5 {isAr ? 'مساء' : 'evening'}</span>
                </div>
              )}
            </div>

            {/* Comparison insight */}
            {ritualData.avgMorning !== null && ritualData.avgEvening !== null && (
              <p style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>
                {ritualData.avgMorning > ritualData.avgEvening
                  ? (isAr ? '☀️ صباحاتك أقوى من مساءاتك — استثمر في روتينك المسائي' : '☀️ Your mornings outshine evenings — invest in your evening routine')
                  : ritualData.avgEvening > ritualData.avgMorning
                    ? (isAr ? '🌙 مساءاتك أقوى — جرّب تنشيط روتينك الصباحي' : '🌙 Evenings are stronger — try energizing your morning ritual')
                    : (isAr ? '⚖️ صباحاتك ومساءاتك متوازنة — ممتاز!' : '⚖️ Mornings and evenings are balanced — excellent!')}
              </p>
            )}
          </div>
        )}

        {/* ── Deep Growth Insights (21+ days) ──────────────────────────────── */}
        {(state.morningLog || []).length >= 21 && (() => {
          const checkin = state.stateCheckin || {}
          const allDates = Object.keys(checkin).sort()
          if (allDates.length < 14) return null

          // Compare first 7 days vs last 7 days
          const first7 = allDates.slice(0, 7)
          const last7Dates = allDates.slice(-7)

          const avgState = (dates) => {
            const vals = dates.map(d => checkin[d] ? (checkin[d].energy + checkin[d].mood + checkin[d].clarity) / 3 : null).filter(Boolean)
            return vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length * 10) / 10 : null
          }

          const firstAvg = avgState(first7)
          const lastAvg = avgState(last7Dates)
          const stateGrowth = firstAvg && lastAvg ? Math.round((lastAvg - firstAvg) * 10) / 10 : null

          // Belief transformation
          const limitingCount = (state.limitingBeliefs || []).length
          const empoweringCount = (state.empoweringBeliefs || []).length
          const beliefRatio = limitingCount + empoweringCount > 0
            ? Math.round((empoweringCount / (limitingCount + empoweringCount)) * 100) : null

          // Goal velocity
          const goals = state.goals || []
          const completedGoals = goals.filter(g => (g.progress || 0) >= 100).length

          const deepInsights = []

          if (stateGrowth !== null) {
            deepInsights.push({
              emoji: stateGrowth > 0 ? '📈' : '📉',
              color: stateGrowth > 0 ? '#2ecc71' : '#e74c3c',
              text: isAr
                ? `حالتك تطوّرت ${stateGrowth > 0 ? '+' : ''}${stateGrowth} نقطة (أول أسبوع ${firstAvg} → آخر أسبوع ${lastAvg})`
                : `State evolved ${stateGrowth > 0 ? '+' : ''}${stateGrowth} points (first week ${firstAvg} → latest week ${lastAvg})`,
              action: '/state',
              actionLabel: isAr ? 'تحقق من حالتك' : 'Check State',
            })
          }

          if (beliefRatio !== null && (limitingCount + empoweringCount) >= 3) {
            deepInsights.push({
              emoji: beliefRatio >= 60 ? '💪' : '🚧',
              color: beliefRatio >= 60 ? '#2ecc71' : '#f39c12',
              text: isAr
                ? `نسبة معتقداتك التمكينية: ${beliefRatio}% (${empoweringCount} تمكينية / ${limitingCount} مقيّدة)`
                : `Empowering belief ratio: ${beliefRatio}% (${empoweringCount} empowering / ${limitingCount} limiting)`,
              action: '/beliefs',
              actionLabel: isAr ? 'راجع معتقداتك' : 'Review Beliefs',
            })
          }

          if (completedGoals > 0) {
            deepInsights.push({
              emoji: '🏆',
              color: '#c9a84c',
              text: isAr
                ? `أكملت ${completedGoals} هدف — أنت تصنع نتائج حقيقية`
                : `${completedGoals} goal${completedGoals > 1 ? 's' : ''} completed — you're creating real results`,
              action: '/goals',
              actionLabel: isAr ? 'الأهداف' : 'Goals',
            })
          }

          if (deepInsights.length === 0) return null

          return (
            <div style={{
              borderRadius: 20, padding: 16, marginBottom: 14,
              background: 'linear-gradient(135deg, rgba(147,112,219,0.08), rgba(201,168,76,0.05))',
              border: '1px solid rgba(147,112,219,0.3)',
            }}>
              <p style={{
                color: '#9370db', fontSize: 11, fontWeight: 900,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                🔬 {isAr ? 'رؤى النمو العميق' : 'Deep Growth Insights'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                {deepInsights.map((ins, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    padding: '8px 12px', borderRadius: 12,
                    background: `${ins.color}0a`, border: `1px solid ${ins.color}20`,
                  }}>
                    <span style={{ fontSize: 16 }}>{ins.emoji}</span>
                    <div>
                      <p style={{ color: '#ccc', fontSize: 12, lineHeight: 1.5 }}>{ins.text}</p>
                      {ins.action && (
                        <button onClick={() => navigate(ins.action)} style={{
                          fontSize: 10, fontWeight: 800, color: '#0a0a0a',
                          background: ins.color || '#c9a84c', borderRadius: 8,
                          padding: '4px 10px', border: 'none', cursor: 'pointer',
                          marginTop: 4,
                        }}>
                          {ins.actionLabel} →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── Smart Observations ────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 20, padding: 16, marginBottom: 14,
          background: '#0e0e0e',
          border: '1px solid rgba(201,168,76,0.25)',
        }}>
          <p style={{
            color: '#c9a84c', fontSize: 11, fontWeight: 900,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            ✦ {isAr ? 'ملاحظة ذكية' : 'Smart Observation'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
            {observations.map((obs, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                flexDirection: isAr ? 'row-reverse' : 'row',
              }}>
                <Sparkles size={14} style={{ color: '#c9a84c', flexShrink: 0, marginTop: 1 }} />
                <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <p style={{ color: '#bbb', fontSize: 13, lineHeight: 1.5 }}>
                    {obs.text}
                  </p>
                  {obs.action && (
                    <button onClick={() => navigate(obs.action)} style={{
                      fontSize: 10, fontWeight: 800, color: '#0a0a0a',
                      background: '#c9a84c', borderRadius: 8,
                      padding: '4px 10px', border: 'none', cursor: 'pointer',
                      marginTop: 4,
                    }}>
                      {obs.actionLabel} →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
