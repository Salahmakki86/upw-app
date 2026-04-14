/**
 * WeeklyDiscovery — Auto-generated weekly report card
 * Shows every Sunday/Monday (or when 7+ days of data exist)
 * Gives users a reason to come back — unique insight each week
 *
 * 8 discovery types: best day, worst day, best vs worst comparison,
 * habit consistency, gratitude streak, sleep insight, goal progress,
 * pattern detection, and a weekly "aha!" top insight.
 *
 * Renders as a structured summary card with a "Show details" CTA.
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

/* ── helpers ───────────────────────────────────────────────── */

function getWeekDates() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
}

function dayName(dateStr, isAr) {
  return new Date(dateStr).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'long' })
}

function round1(n) { return Math.round(n * 10) / 10 }

/* ── discovery generator ───────────────────────────────────── */

function generateDiscoveries(state, isAr) {
  const week = getWeekDates()
  const checkin = state.stateCheckin || {}
  const habitLog = state.habitTracker?.log || {}
  const habitList = state.habitTracker?.list || []
  const gratitude = state.gratitude || {}
  const sleepLog = state.sleepLog || {}
  const morningLog = state.morningLog || []
  const goals = state.goals || []

  // Collect per-day averages from stateCheckin
  const dayAvgs = {} // { 'YYYY-MM-DD': avg }
  week.forEach(d => {
    if (!checkin[d]) return
    const c = checkin[d]
    dayAvgs[d] = ((c.energy || 0) + (c.mood || 0) + (c.clarity || 0)) / 3
  })
  const avgEntries = Object.entries(dayAvgs).sort((a, b) => b[1] - a[1])

  /* ─── Result accumulators ─── */
  const summary = {}      // structured summary fields
  const discoveries = []  // legacy-style discovery items
  let topInsight = null   // the weekly "aha!"

  /* 1. Best day ─────────────────────────────────────────── */
  if (avgEntries.length > 0) {
    const [bestDate, bestAvg] = avgEntries[0]
    const name = dayName(bestDate, isAr)
    summary.bestDay = { name, avg: round1(bestAvg), date: bestDate }
    discoveries.push({
      emoji: '\u{1F3C6}',
      text: isAr
        ? `\u{2B50} \u0623\u0641\u0636\u0644 \u064A\u0648\u0645: ${name} (\u0637\u0627\u0642\u0629 ${round1(bestAvg)})`
        : `\u{2B50} Best day: ${name} (energy ${round1(bestAvg)})`,
    })
  }

  /* 2. Worst day ────────────────────────────────────────── */
  if (avgEntries.length >= 2) {
    const [worstDate, worstAvg] = avgEntries[avgEntries.length - 1]
    const name = dayName(worstDate, isAr)
    summary.worstDay = { name, avg: round1(worstAvg), date: worstDate }
    discoveries.push({
      emoji: '\u{1F4C9}',
      text: isAr
        ? `\u0623\u0633\u0648\u0623 \u064A\u0648\u0645: ${name} (\u0637\u0627\u0642\u0629 ${round1(worstAvg)})`
        : `Lowest day: ${name} (energy ${round1(worstAvg)})`,
    })
  }

  /* 3. Best vs Worst comparison ─────────────────────────── */
  if (summary.bestDay && summary.worstDay) {
    const diff = round1(summary.bestDay.avg - summary.worstDay.avg)
    if (diff >= 2) {
      discoveries.push({
        emoji: '\u{1F914}',
        text: isAr
          ? `\u0641\u0631\u0642 ${diff} \u0646\u0642\u0627\u0637 \u0628\u064A\u0646 \u0623\u0641\u0636\u0644 \u0648\u0623\u0633\u0648\u0623 \u064A\u0648\u0645 \u2014 \u0645\u0627 \u0627\u0644\u0630\u064A \u0641\u0639\u0644\u062A\u0647 \u064A\u0648\u0645 ${summary.bestDay.name} \u0628\u0634\u0643\u0644 \u0645\u062E\u062A\u0644\u0641\u061F`
          : `${diff} point gap between best & worst day \u2014 what did you do differently on ${summary.bestDay.name}?`,
      })
    }
  }

  /* 4. Habit consistency ────────────────────────────────── */
  const weekHabitDays = week.filter(d => (habitLog[d] || []).length > 0).length
  if (weekHabitDays > 0 && habitList.length > 0) {
    summary.habitDays = weekHabitDays
    discoveries.push({
      emoji: '\u{1F4CA}',
      text: isAr
        ? `\u0623\u0643\u0645\u0644\u062A \u0639\u0627\u062F\u0627\u062A\u0643 ${weekHabitDays}/7 \u0623\u064A\u0627\u0645 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639`
        : `You completed habits ${weekHabitDays}/7 days this week`,
    })
  }

  /* 5. Gratitude streak ─────────────────────────────────── */
  const gratDays = week.filter(d => (gratitude[d] || []).filter(v => v?.trim()).length >= 3).length
  if (gratDays >= 3) {
    summary.gratDays = gratDays
    discoveries.push({
      emoji: '\u{1F64F}',
      text: isAr
        ? `\u0633\u062C\u0651\u0644\u062A \u0627\u0644\u0627\u0645\u062A\u0646\u0627\u0646 ${gratDays} \u0623\u064A\u0627\u0645 \u2014 \u0639\u0642\u0644\u0643 \u064A\u064F\u0628\u0631\u0645\u062C \u0646\u0641\u0633\u0647 \u0639\u0644\u0649 \u0627\u0644\u0625\u064A\u062C\u0627\u0628\u064A\u0629`
        : `Gratitude logged ${gratDays} days \u2014 your brain is rewiring toward positivity`,
    })
  }

  /* 6. Sleep insight ────────────────────────────────────── */
  const sleepHours = week.map(d => sleepLog[d]?.hours).filter(Boolean)
  let avgSleep = null
  if (sleepHours.length >= 3) {
    avgSleep = round1(sleepHours.reduce((s, h) => s + h, 0) / sleepHours.length)
    summary.avgSleep = avgSleep
    discoveries.push({
      emoji: '\u{1F634}',
      text: isAr
        ? `\u0645\u062A\u0648\u0633\u0637 \u0646\u0648\u0645\u0643: ${avgSleep} \u0633\u0627\u0639\u0627\u062A ${avgSleep >= 7 ? '\u2014 \u0645\u0645\u062A\u0627\u0632! \u062D\u0627\u0641\u0638 \u0639\u0644\u064A\u0647' : '\u2014 \u062D\u0627\u0648\u0644 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0640 7+'}`
        : `Avg sleep: ${avgSleep} hours ${avgSleep >= 7 ? '\u2014 excellent! Keep it up' : '\u2014 aim for 7+ hours'}`,
    })
  }

  /* 7. Goal progress ────────────────────────────────────── */
  const movedGoals = goals.filter(g => {
    const weekAgo = Date.now() - 7 * 86400000
    return g.updatedAt && g.updatedAt > weekAgo && (g.progress || 0) > 0
  })
  if (movedGoals.length > 0) {
    summary.goalsMovedCount = movedGoals.length
    discoveries.push({
      emoji: '\u{1F3AF}',
      text: isAr
        ? `\u062D\u0631\u0651\u0643\u062A ${movedGoals.length} \u0647\u062F\u0641 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u2014 \u0627\u0633\u062A\u0645\u0631!`
        : `Moved ${movedGoals.length} goal${movedGoals.length > 1 ? 's' : ''} this week \u2014 keep going!`,
    })
  }

  /* 8. Pattern detection — skipped tasks on specific days ─ */
  // Check if morning ritual is consistently skipped on a specific weekday
  // We look at 21 days of history (3 weeks) for reliable pattern detection
  const morningSet = new Set(morningLog)
  const extended = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
  const extSkipCount = {}
  const extTotalCount = {}
  extended.forEach(d => {
    const dow = new Date(d).getDay()
    extTotalCount[dow] = (extTotalCount[dow] || 0) + 1
    if (!morningSet.has(d)) {
      extSkipCount[dow] = (extSkipCount[dow] || 0) + 1
    }
  })
  // If a day has 2+ skips out of 3 weeks, flag it
  let patternDay = null
  for (const dow of Object.keys(extSkipCount)) {
    const total = extTotalCount[dow] || 0
    const skipped = extSkipCount[dow] || 0
    if (total >= 2 && skipped / total >= 0.66) {
      patternDay = Number(dow)
      break
    }
  }
  if (patternDay !== null) {
    // Use a known Sunday (Jan 7, 2024) and add offset to get correct weekday name
    const refSun = new Date(2024, 0, 7) // known Sunday
    refSun.setDate(refSun.getDate() + patternDay)
    const pName = refSun.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'long' })
    summary.patternDay = pName
    discoveries.push({
      emoji: '\u{1F50D}',
      text: isAr
        ? `\u0644\u0627\u062D\u0638\u0646\u0627 \u0623\u0646\u0643 \u062A\u062A\u062E\u0637\u0649 \u0627\u0644\u0635\u0628\u0627\u062D \u0623\u064A\u0627\u0645 ${pName} \u2014 \u0647\u0644 \u062A\u0631\u064A\u062F \u062C\u062F\u0648\u0644\u0629 \u0645\u062E\u062A\u0644\u0641\u0629\u061F`
        : `We noticed you skip mornings on ${pName}s \u2014 want a different schedule?`,
    })
  }

  /* 9. Top insight — the weekly "aha!" ─────────────────── */
  // Priority: sleep-performance correlation > habit-day correlation > goal acceleration
  if (avgSleep !== null && avgEntries.length >= 3) {
    // Check if days with 7+ sleep have higher avg state
    const goodSleepDays = week.filter(d => (sleepLog[d]?.hours || 0) >= 7)
    const badSleepDays = week.filter(d => sleepLog[d]?.hours && sleepLog[d].hours < 7)
    const avgGoodSleep = goodSleepDays.length > 0
      ? goodSleepDays.reduce((s, d) => s + (dayAvgs[d] || 0), 0) / goodSleepDays.filter(d => dayAvgs[d]).length
      : 0
    const avgBadSleep = badSleepDays.length > 0
      ? badSleepDays.reduce((s, d) => s + (dayAvgs[d] || 0), 0) / badSleepDays.filter(d => dayAvgs[d]).length
      : 0
    if (goodSleepDays.length >= 2 && avgGoodSleep > avgBadSleep + 1) {
      const pct = Math.round((avgGoodSleep / 10) * 100)
      topInsight = {
        emoji: '\u{1F4A1}',
        text: isAr
          ? `\u0627\u0643\u062A\u0634\u0627\u0641 \u0627\u0644\u0623\u0633\u0628\u0648\u0639: \u0646\u0648\u0645\u0643 \u0623\u0643\u062B\u0631 \u0645\u0646 7 \u0633\u0627\u0639\u0627\u062A = \u0623\u062F\u0627\u0621 ${pct}%+`
          : `Weekly discovery: 7+ hours sleep = ${pct}%+ performance`,
      }
    }
  }
  // Fallback: habit correlation with best days
  if (!topInsight && summary.bestDay && habitList.length > 0) {
    const bestDateHabits = habitLog[summary.bestDay.date] || []
    if (bestDateHabits.length >= 2) {
      topInsight = {
        emoji: '\u{1F4A1}',
        text: isAr
          ? `\u0627\u0643\u062A\u0634\u0627\u0641 \u0627\u0644\u0623\u0633\u0628\u0648\u0639: \u0623\u0641\u0636\u0644 \u0623\u064A\u0627\u0645\u0643 \u0627\u0631\u062A\u0628\u0637\u062A \u0628\u0625\u0643\u0645\u0627\u0644 ${bestDateHabits.length} \u0639\u0627\u062F\u0627\u062A`
          : `Weekly discovery: your best days correlate with completing ${bestDateHabits.length} habits`,
      }
    }
  }
  // Fallback: goal acceleration
  if (!topInsight && movedGoals.length > 0) {
    const fastest = movedGoals.reduce((best, g) => (g.progress || 0) > (best.progress || 0) ? g : best, movedGoals[0])
    topInsight = {
      emoji: '\u{1F4A1}',
      text: isAr
        ? `\u0627\u0643\u062A\u0634\u0627\u0641 \u0627\u0644\u0623\u0633\u0628\u0648\u0639: \u0647\u062F\u0641\u0643 "${fastest.title || fastest.text || ''}" \u062A\u0633\u0627\u0631\u0639 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639!`
        : `Weekly discovery: your goal "${fastest.title || fastest.text || ''}" accelerated this week!`,
    }
  }
  if (topInsight) {
    discoveries.push(topInsight)
  }

  /* ── Weekly actionable tip ─────────────────────────────── */
  let tip = null
  if (avgSleep !== null && avgSleep < 7) {
    tip = isAr
      ? '\u062D\u0627\u0648\u0644 \u0627\u0644\u0646\u0648\u0645 30 \u062F\u0642\u064A\u0642\u0629 \u0623\u0628\u0643\u0631 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u2014 \u0627\u0644\u0646\u0648\u0645 \u0623\u0633\u0627\u0633 \u0627\u0644\u0637\u0627\u0642\u0629'
      : 'Try sleeping 30 min earlier this week \u2014 sleep is the foundation of energy'
  } else if (weekHabitDays < 4 && habitList.length > 0) {
    tip = isAr
      ? '\u0631\u0643\u0651\u0632 \u0639\u0644\u0649 \u0639\u0627\u062F\u0629 \u0648\u0627\u062D\u062F\u0629 \u0641\u0642\u0637 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0648\u0627\u0644\u062A\u0632\u0645 \u0628\u0647\u0627 \u0643\u0644 \u064A\u0648\u0645'
      : 'Focus on just ONE habit this week and do it every day'
  } else if (summary.bestDay && summary.worstDay) {
    tip = isAr
      ? `\u0643\u0631\u0651\u0631 \u0645\u0627 \u0641\u0639\u0644\u062A\u0647 \u064A\u0648\u0645 ${summary.bestDay.name} \u2014 \u0627\u0644\u0646\u062C\u0627\u062D \u064A\u062A\u0631\u0643 \u0623\u062F\u0644\u0629`
      : `Repeat what you did on ${summary.bestDay.name} \u2014 success leaves clues`
  } else {
    tip = isAr
      ? '\u0627\u0633\u062A\u0645\u0631 \u0641\u064A \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u064A\u0648\u0645\u064A\u0627\u064B \u2014 \u0643\u0644 \u0623\u0633\u0628\u0648\u0639 \u0633\u062A\u0643\u062A\u0634\u0641 \u0634\u064A\u0626\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B \u0639\u0646 \u0646\u0641\u0633\u0643'
      : 'Keep logging daily \u2014 every week you\'ll discover something new about yourself'
  }

  return { discoveries, summary, topInsight, tip }
}

/* ── Component ─────────────────────────────────────────────── */

export default function WeeklyDiscovery() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  // Show on Sunday (0) or Monday (1)
  const dayOfWeek = new Date().getDay()
  const isWeeklySummaryDay = dayOfWeek === 0 || dayOfWeek === 1
  const morningCount = (state.morningLog || []).length

  const { discoveries, summary, topInsight, tip } = useMemo(
    () => generateDiscoveries(state, isAr),
    [state, isAr]
  )

  // Only show if: it's summary day, user has 7+ mornings, there are discoveries, and not dismissed
  if (!isWeeklySummaryDay || morningCount < 7 || discoveries.length < 2 || dismissed) return null

  /* ── Styles ─── */
  const card = {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    background: 'linear-gradient(135deg, rgba(201,168,76,0.10), rgba(147,112,219,0.07))',
    border: '1px solid rgba(201,168,76,0.30)',
    position: 'relative',
  }
  const headerRow = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  }
  const titleStyle = {
    fontSize: 12, fontWeight: 900, color: '#c9a84c', margin: 0,
  }
  const closeBtn = {
    fontSize: 10, color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  }
  const sectionTitle = {
    fontSize: 9, fontWeight: 800, color: '#666',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    marginBottom: 8, marginTop: 12,
  }
  const bulletRow = {
    display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6,
  }
  const bulletEmoji = { fontSize: 13, lineHeight: '18px', flexShrink: 0 }
  const bulletText = { fontSize: 11, color: '#ccc', lineHeight: 1.5, margin: 0 }
  const tipBox = {
    marginTop: 12,
    padding: '10px 12px',
    borderRadius: 10,
    background: 'rgba(201,168,76,0.08)',
    border: '1px solid rgba(201,168,76,0.18)',
  }
  const tipLabel = {
    fontSize: 9, fontWeight: 800, color: '#c9a84c',
    letterSpacing: '0.06em', marginBottom: 4,
  }
  const tipText = { fontSize: 11, color: '#ddd', lineHeight: 1.5, margin: 0 }
  const ctaBtn = {
    marginTop: 12,
    width: '100%',
    padding: '10px 0',
    borderRadius: 10,
    border: '1px solid rgba(201,168,76,0.35)',
    background: 'rgba(201,168,76,0.10)',
    color: '#c9a84c',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center',
  }

  /* ── Build summary bullets ─── */
  const summaryBullets = []
  if (summary.bestDay) {
    summaryBullets.push({
      emoji: '\u{2B50}',
      text: isAr
        ? `\u0623\u0641\u0636\u0644 \u064A\u0648\u0645: ${summary.bestDay.name} (\u0637\u0627\u0642\u0629 ${summary.bestDay.avg})`
        : `Best day: ${summary.bestDay.name} (energy ${summary.bestDay.avg})`,
    })
  }
  if (summary.worstDay) {
    summaryBullets.push({
      emoji: '\u{1F4C9}',
      text: isAr
        ? `\u0623\u0633\u0648\u0623 \u064A\u0648\u0645: ${summary.worstDay.name} (\u0637\u0627\u0642\u0629 ${summary.worstDay.avg})`
        : `Lowest day: ${summary.worstDay.name} (energy ${summary.worstDay.avg})`,
    })
  }
  if (summary.patternDay) {
    summaryBullets.push({
      emoji: '\u{1F50D}',
      text: isAr
        ? `\u0646\u0645\u0637: \u062A\u062A\u062E\u0637\u0649 \u0627\u0644\u0635\u0628\u0627\u062D \u0623\u064A\u0627\u0645 ${summary.patternDay}`
        : `Pattern: you skip mornings on ${summary.patternDay}s`,
    })
  }
  if (topInsight) {
    summaryBullets.push({
      emoji: '\u{1F4A1}',
      text: topInsight.text.replace(/^.*:\s*/, ''), // strip "اكتشاف الأسبوع:" prefix for the summary
    })
  }

  return (
    <div style={card}>
      {/* Header */}
      <div style={headerRow}>
        <p style={titleStyle}>
          {'\u{1F50D}'} {isAr ? '\u0627\u0643\u062A\u0634\u0641\u0646\u0627 \u0634\u064A\u0626\u0627\u064B \u0639\u0646\u0643 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639' : 'We discovered something about you this week'}
        </p>
        <button onClick={() => setDismissed(true)} style={closeBtn} aria-label="Dismiss">{'\u2715'}</button>
      </div>

      {/* Summary section */}
      <p style={sectionTitle}>
        {'\u{1F4CA}'} {isAr ? '\u0645\u0644\u062E\u0635 \u0627\u0644\u0623\u0633\u0628\u0648\u0639' : 'Weekly Summary'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {summaryBullets.map((b, i) => (
          <div key={i} style={bulletRow}>
            <span style={bulletEmoji}>{b.emoji}</span>
            <p style={bulletText}>{b.text}</p>
          </div>
        ))}
      </div>

      {/* Extra discoveries (beyond the summary) */}
      {discoveries.filter(d =>
        !summaryBullets.some(sb => sb.text === d.text)
      ).slice(0, 3).length > 0 && (
        <div style={{ marginTop: 8 }}>
          {discoveries.filter(d =>
            !summaryBullets.some(sb => sb.text === d.text)
          ).slice(0, 3).map((d, i) => (
            <div key={i} style={bulletRow}>
              <span style={bulletEmoji}>{d.emoji}</span>
              <p style={bulletText}>{d.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Top insight highlight */}
      {topInsight && (
        <div style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 8,
          background: 'rgba(147,112,219,0.08)', border: '1px solid rgba(147,112,219,0.20)',
        }}>
          <p style={{ fontSize: 11, color: '#b89adb', fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
            {topInsight.emoji} {topInsight.text}
          </p>
        </div>
      )}

      {/* Weekly tip */}
      {tip && (
        <div style={tipBox}>
          <p style={tipLabel}>
            {isAr ? '\u0646\u0635\u064A\u062D\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639' : 'Tip of the week'}
          </p>
          <p style={tipText}>{tip}</p>
        </div>
      )}

      {/* Show details CTA */}
      <button onClick={() => navigate('/insights')} style={ctaBtn}>
        {isAr ? '\u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644' : 'Show details'}
      </button>
    </div>
  )
}

/**
 * Hook: tells the parent (Dashboard/TodayPage) whether a new weekly
 * discovery is available so it can render a notification dot.
 */
export function useWeeklyDiscoveryAvailable() {
  const { state } = useApp()
  const dayOfWeek = new Date().getDay()
  const isWeeklySummaryDay = dayOfWeek === 0 || dayOfWeek === 1
  const morningCount = (state.morningLog || []).length

  return useMemo(() => {
    if (!isWeeklySummaryDay || morningCount < 7) return false
    const week = getWeekDates()
    const checkin = state.stateCheckin || {}
    // At least 2 checkin days in the week
    return week.filter(d => checkin[d]).length >= 2
  }, [state, isWeeklySummaryDay, morningCount])
}
