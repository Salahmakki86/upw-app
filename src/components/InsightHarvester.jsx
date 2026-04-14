/**
 * InsightHarvester — Solves the "abandoned data" problem
 *
 * The app stores daily text answers from Smart Questions, Power Questions,
 * Evening Reflections, and Morning Answers — but never analyzes or shows
 * them back to the user. This component harvests 7-14 days of text data,
 * detects recurring themes, mood trends, and answer depth, then displays
 * a "What we discovered about you" card.
 */
import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

/* ── Helpers ─────────────────────────────────────────────────────────── */

function getDateRange(days) {
  const dates = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

/* ── Theme keyword clusters ──────────────────────────────────────────── */

const THEME_DEFS = [
  {
    id: 'business',
    pattern: /عمل|business|مال|money|إيراد|revenue|عملاء|clients|ربح|profit|مشروع|project/gi,
    emoji: '💼',
    ar: 'العمل والمال',
    en: 'Business / Money',
    color: '#c9a84c',
  },
  {
    id: 'relationships',
    pattern: /عائلة|family|علاقة|relationship|حب|love|زوج|spouse|أبناء|children|صديق|friend/gi,
    emoji: '❤️',
    ar: 'العلاقات',
    en: 'Relationships',
    color: '#e74c6f',
  },
  {
    id: 'health',
    pattern: /صحة|health|طاقة|energy|رياضة|exercise|نوم|sleep|جسم|body|ماء|water/gi,
    emoji: '💪',
    ar: 'الصحة والطاقة',
    en: 'Health / Energy',
    color: '#2ecc71',
  },
  {
    id: 'fear',
    pattern: /خوف|fear|قلق|worry|توتر|stress|ضغط|pressure|شك|doubt/gi,
    emoji: '🌊',
    ar: 'الخوف والتوتر',
    en: 'Fear / Stress',
    color: '#e63946',
  },
  {
    id: 'goals',
    pattern: /هدف|goal|نجاح|success|إنجاز|achievement|تقدم|progress|خطة|plan/gi,
    emoji: '🎯',
    ar: 'الأهداف',
    en: 'Goals',
    color: '#3498db',
  },
  {
    id: 'gratitude',
    pattern: /امتنان|grateful|شكر|thankful|نعمة|blessing|حمد|praise/gi,
    emoji: '🙏',
    ar: 'الامتنان',
    en: 'Gratitude',
    color: '#f39c12',
  },
]

/* ── Collect all text answers from state ─────────────────────────────── */

function collectTexts(state, dates) {
  const texts = []

  // 1. smartQuestionLog — { 'YYYY-MM-DD': { question, answer, category } }
  const sqLog = state.smartQuestionLog || {}
  dates.forEach(d => {
    const entry = sqLog[d]
    if (entry?.answer?.trim()) texts.push(entry.answer)
  })

  // 2. powerQuestionsLog — { 'YYYY-MM-DD': { morning: [{q,a}], evening: [{q,a}] } }
  const pqLog = state.powerQuestionsLog || {}
  dates.forEach(d => {
    const entry = pqLog[d]
    if (entry?.morning) {
      const items = Array.isArray(entry.morning) ? entry.morning : Object.values(entry.morning)
      items.forEach(item => {
        const ans = typeof item === 'string' ? item : item?.a
        if (ans?.trim()) texts.push(ans)
      })
    }
    if (entry?.evening) {
      const items = Array.isArray(entry.evening) ? entry.evening : Object.values(entry.evening)
      items.forEach(item => {
        const ans = typeof item === 'string' ? item : item?.a
        if (ans?.trim()) texts.push(ans)
      })
    }
  })

  // 3. eveningLog — { 'YYYY-MM-DD': { reflection, dayRating, gratitude, ... } }
  const elog = state.eveningLog || {}
  dates.forEach(d => {
    const entry = elog[d]
    if (entry?.reflection?.trim()) texts.push(entry.reflection)
    if (entry?.gratitude) {
      entry.gratitude.forEach(g => { if (g?.trim()) texts.push(g) })
    }
    if (entry?.cani) {
      if (entry.cani.q1?.trim()) texts.push(entry.cani.q1)
      if (entry.cani.q2?.trim()) texts.push(entry.cani.q2)
    }
  })

  // 4. morningAnswers — object keyed by index, values are answer strings
  const ma = state.morningAnswers || {}
  Object.values(ma).forEach(ans => {
    if (typeof ans === 'string' && ans.trim()) texts.push(ans)
  })

  // 5. ritualReflections — { 'YYYY-MM-DD': { morning: { rating, note }, evening: { rating, note } } }
  const rr = state.ritualReflections || {}
  dates.forEach(d => {
    const entry = rr[d]
    if (entry?.morning?.note?.trim()) texts.push(entry.morning.note)
    if (entry?.evening?.note?.trim()) texts.push(entry.evening.note)
  })

  return texts
}

/* ── Analysis functions ──────────────────────────────────────────────── */

function detectThemes(texts) {
  const counts = {}
  THEME_DEFS.forEach(theme => { counts[theme.id] = 0 })

  const combined = texts.join(' ')
  THEME_DEFS.forEach(theme => {
    const matches = combined.match(theme.pattern)
    if (matches) counts[theme.id] = matches.length
  })

  return THEME_DEFS
    .map(t => ({ ...t, count: counts[t.id] }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
}

function analyzeMoodTrend(state, dates7) {
  const rr = state.ritualReflections || {}
  const morningRatings = []
  const eveningRatings = []

  // Walk dates oldest-first so index maps to chronological order
  ;[...dates7].reverse().forEach(d => {
    const entry = rr[d]
    if (entry?.morning?.rating) morningRatings.push(entry.morning.rating)
    if (entry?.evening?.rating) eveningRatings.push(entry.evening.rating)
  })

  const trend = (arr) => {
    if (arr.length < 3) return 'none'
    const half = Math.floor(arr.length / 2)
    const first = arr.slice(0, half)
    const second = arr.slice(half)
    const avgFirst = first.reduce((s, v) => s + v, 0) / first.length
    const avgSecond = second.reduce((s, v) => s + v, 0) / second.length
    if (avgSecond - avgFirst >= 0.5) return 'up'
    if (avgFirst - avgSecond >= 0.5) return 'down'
    return 'stable'
  }

  const avgMorning = morningRatings.length
    ? Math.round(morningRatings.reduce((s, v) => s + v, 0) / morningRatings.length * 10) / 10
    : null
  const avgEvening = eveningRatings.length
    ? Math.round(eveningRatings.reduce((s, v) => s + v, 0) / eveningRatings.length * 10) / 10
    : null

  return {
    morningTrend: trend(morningRatings),
    eveningTrend: trend(eveningRatings),
    avgMorning,
    avgEvening,
    hasMoodData: morningRatings.length >= 3 || eveningRatings.length >= 3,
  }
}

function analyzeAnswerDepth(texts14Old, texts7Recent) {
  // Compare average answer length: first half (older) vs second half (recent)
  if (texts14Old.length < 2 || texts7Recent.length < 2) return null
  const avgOld = texts14Old.reduce((s, t) => s + t.length, 0) / texts14Old.length
  const avgRecent = texts7Recent.reduce((s, t) => s + t.length, 0) / texts7Recent.length
  if (avgRecent > avgOld * 1.2) return 'deeper'
  if (avgRecent < avgOld * 0.8) return 'shorter'
  return 'stable'
}

/* ── Main analysis (memoized) ────────────────────────────────────────── */

function harvestInsights(state, isAr) {
  const dates14 = getDateRange(14)
  const dates7 = getDateRange(7)
  const datesOlder = dates14.filter(d => !dates7.includes(d))

  const allTexts = collectTexts(state, dates14)
  const recentTexts = collectTexts(state, dates7)
  const olderTexts = collectTexts(state, datesOlder)

  // Gate: need at least 5 text answers
  if (allTexts.length < 5) return null

  const themes = detectThemes(allTexts)
  const mood = analyzeMoodTrend(state, dates7)
  const depthTrend = analyzeAnswerDepth(olderTexts, recentTexts)

  // Recurring concern: a theme in 3+ individual answers (not just combined text)
  let recurringConcern = null
  if (themes.length > 0) {
    for (const theme of themes) {
      const matchCount = allTexts.filter(t => theme.pattern.test(t)).length
      // Reset regex lastIndex since we use /g flag
      theme.pattern.lastIndex = 0
      if (matchCount >= 3) {
        recurringConcern = theme
        break
      }
    }
  }

  return {
    themes,
    mood,
    depthTrend,
    recurringConcern,
    totalAnswers: allTexts.length,
  }
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function InsightHarvester() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const [dismissed, setDismissed] = useState(false)

  const insights = useMemo(() => harvestInsights(state, isAr), [state, isAr])

  if (!insights || dismissed) return null

  const { themes, mood, depthTrend, recurringConcern, totalAnswers } = insights

  /* ── Mood trend sentence ──────────────────────────────────────────── */
  let moodSentence = null
  if (mood.hasMoodData) {
    if (mood.morningTrend === 'up') {
      moodSentence = {
        emoji: '🌅',
        text: isAr ? 'صباحاتك تتحسن — استمر!' : 'Your mornings are getting better!',
        color: '#2ecc71',
      }
    } else if (mood.eveningTrend === 'down') {
      moodSentence = {
        emoji: '🌙',
        text: isAr ? 'مساءاتك تحتاج اهتمام' : 'Your evenings need attention',
        color: '#f39c12',
      }
    } else if (mood.morningTrend === 'down') {
      moodSentence = {
        emoji: '🌅',
        text: isAr ? 'صباحاتك تحتاج دعم — جرّب تغيير روتينك' : 'Your mornings need a boost — try adjusting your routine',
        color: '#e63946',
      }
    } else if (mood.eveningTrend === 'up') {
      moodSentence = {
        emoji: '🌙',
        text: isAr ? 'مساءاتك تتحسن — جميل!' : 'Your evenings are improving — nice!',
        color: '#2ecc71',
      }
    } else if (mood.avgMorning && mood.avgEvening) {
      moodSentence = {
        emoji: '📊',
        text: isAr
          ? `متوسط الصباح: ${mood.avgMorning}/5 — متوسط المساء: ${mood.avgEvening}/5`
          : `Morning avg: ${mood.avgMorning}/5 — Evening avg: ${mood.avgEvening}/5`,
        color: '#9370db',
      }
    }
  }

  /* ── Answer depth sentence ────────────────────────────────────────── */
  let depthSentence = null
  if (depthTrend === 'deeper') {
    depthSentence = {
      emoji: '📝',
      text: isAr ? 'تأملاتك أصبحت أعمق — أنت تتطور' : "You're reflecting more deeply",
      color: '#2ecc71',
    }
  } else if (depthTrend === 'shorter') {
    depthSentence = {
      emoji: '📝',
      text: isAr ? 'حاول تمضي دقيقة إضافية في التأمل' : 'Try spending an extra minute on reflections',
      color: '#f39c12',
    }
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        background: 'linear-gradient(135deg, #0e0e0e 0%, rgba(147,112,219,0.06) 100%)',
        border: '1px solid rgba(147,112,219,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative glow */}
      <div style={{
        position: 'absolute',
        top: -30,
        [isAr ? 'left' : 'right']: -30,
        width: 90,
        height: 90,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,112,219,0.15), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <p style={{
          fontSize: 12,
          fontWeight: 900,
          color: '#c9a84c',
          letterSpacing: '0.03em',
        }}>
          {isAr ? '📬 ما اكتشفناه عنك' : '📬 What We Discovered About You'}
        </p>
        <button
          onClick={() => setDismissed(true)}
          style={{
            fontSize: 11,
            color: '#555',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 6px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Subtitle */}
      <p style={{ fontSize: 10, color: '#666', marginBottom: 12, lineHeight: 1.4 }}>
        {isAr
          ? `بناءً على ${totalAnswers} إجابة من آخر أسبوعين`
          : `Based on ${totalAnswers} answers from the last 2 weeks`}
      </p>

      {/* Theme pills */}
      {themes.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,
        }}>
          {themes.map(t => (
            <div
              key={t.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: `${t.color}15`,
                border: `1px solid ${t.color}30`,
                borderRadius: 99,
                padding: '5px 12px',
              }}
            >
              <span style={{ fontSize: 12 }}>{t.emoji}</span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: t.color,
              }}>
                {isAr ? t.ar : t.en}
              </span>
              <span style={{
                fontSize: 9,
                color: '#777',
                fontWeight: 600,
              }}>
                ({t.count})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Insights list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Mood trend */}
        {moodSentence && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>{moodSentence.emoji}</span>
            <span style={{ fontSize: 11, color: moodSentence.color, fontWeight: 600, lineHeight: 1.4 }}>
              {moodSentence.text}
            </span>
          </div>
        )}

        {/* Answer depth */}
        {depthSentence && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>{depthSentence.emoji}</span>
            <span style={{ fontSize: 11, color: depthSentence.color, fontWeight: 600, lineHeight: 1.4 }}>
              {depthSentence.text}
            </span>
          </div>
        )}

        {/* Recurring concern highlight */}
        {recurringConcern && (
          <div style={{
            marginTop: 6,
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(147,112,219,0.08)',
            border: '1px solid rgba(147,112,219,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>🔍</span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#9370db',
              lineHeight: 1.5,
            }}>
              {isAr
                ? `موضوع يتكرر: ${recurringConcern.ar}`
                : `Recurring theme: ${recurringConcern.en}`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
