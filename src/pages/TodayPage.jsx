import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sun, Moon, Star, Flame, Zap, Target, Trophy,
  Check, ArrowLeft, LifeBuoy, ChevronRight, ChevronLeft,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import { upwApi } from '../api/upwApi'
import BottomNav from '../components/BottomNav'
import TransformationPulse from '../components/TransformationPulse'
import StateCheckin from '../components/StateCheckin'
import SmartDailyQuestion from '../components/SmartDailyQuestion'
import StaleGoalNudge from '../components/StaleGoalNudge'
import AccountabilityCard from '../components/AccountabilityCard'
import ProgressSnapshot from '../components/ProgressSnapshot'
import WelcomeExperience from '../components/WelcomeExperience'
import WeeklyDiscovery from '../components/WeeklyDiscovery'
import PersonalizedCoachCard from '../components/PersonalizedCoachCard'
import InsightHarvester from '../components/InsightHarvester'
import { generateBriefing } from '../utils/morningBriefing'
import { calcWeightedScore, getScoreInsight } from '../utils/dailyScore'
import { getDailyPersonalizedTip } from '../utils/personalization'
import { getTodayVisibility } from '../utils/progressiveUI'

// ─── helpers ────────────────────────────────────────────────────────────────

function getGreeting(hour, isAr) {
  if (hour >= 5 && hour < 12) return isAr ? 'صباح الخير ☀️' : 'Good Morning ☀️'
  if (hour >= 12 && hour < 18) return isAr ? 'مرحباً بك 🌤' : 'Good Afternoon 🌤'
  return isAr ? 'مساء الخير 🌙' : 'Good Evening 🌙'
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function formatTodayDate(isAr) {
  return new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function getTimePeriod(hour) {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 24) return 'evening'
  return 'night' // 0–4
}

function getTimeBadge(period, isAr) {
  const badges = {
    morning:   { ar: '🌅 صباح',    en: '🌅 Morning' },
    afternoon: { ar: '☀️ ظهر',    en: '☀️ Afternoon' },
    evening:   { ar: '🌆 مساء',   en: '🌆 Evening' },
    night:     { ar: '🌙 ليل',    en: '🌙 Night' },
  }
  return isAr ? badges[period].ar : badges[period].en
}

// ─── Score Ring ──────────────────────────────────────────────────────────────

function ScoreRing({ score, total, weighted, insight, isAr }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const progress = weighted / 100
  const strokeDashoffset = circumference * (1 - progress)
  const ringColor = weighted >= 80 ? '#2ecc71' : weighted >= 50 ? '#c9a84c' : weighted >= 25 ? '#f39c12' : '#e63946'

  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="#1e1e1e"
          strokeWidth="8"
        />
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: ringColor, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
          {weighted}%
        </span>
        <span style={{ color: '#888', fontSize: 9, marginTop: 3 }}>
          {score}/7 {isAr ? 'مهام' : 'tasks'}
        </span>
      </div>
    </div>
  )
}

// ─── Task Row ────────────────────────────────────────────────────────────────

function TaskRow({ emoji, labelAr, labelEn, done, path, isAr, navigate, suggested }) {
  return (
    <button
      onClick={() => navigate(path)}
      className="active:scale-95 transition-all"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        padding: '14px 14px',
        marginBottom: 8,
        background: done ? 'rgba(46,204,113,0.06)' : '#111',
        border: `1px solid ${done ? 'rgba(46,204,113,0.3)' : suggested ? 'rgba(201,168,76,0.5)' : '#1e1e1e'}`,
        opacity: done ? 0.7 : 1,
        textAlign: isAr ? 'right' : 'left',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isAr ? 'flex-end' : 'flex-start', gap: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: done ? '#2ecc71' : '#ccc' }}>
            {isAr ? labelAr : labelEn}
          </span>
          {suggested && !done && (
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              color: '#c9a84c',
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 99,
              padding: '1px 7px',
              letterSpacing: '0.06em',
            }}>
              {isAr ? '✦ مقترح الآن' : '✦ Suggested now'}
            </span>
          )}
        </div>
      </div>
      {done
        ? <Check size={16} style={{ color: '#2ecc71', flexShrink: 0 }} />
        : isAr
          ? <ChevronLeft size={16} style={{ color: '#555', flexShrink: 0 }} />
          : <ChevronRight size={16} style={{ color: '#555', flexShrink: 0 }} />
      }
    </button>
  )
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ labelAr, labelEn, color, isAr }) {
  return (
    <div style={{
      borderRadius: 10,
      padding: '6px 12px',
      marginBottom: 10,
      background: `${color}18`,
      border: `1px solid ${color}40`,
      display: 'inline-block',
    }}>
      <span style={{ fontSize: 11, fontWeight: 900, color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {isAr ? labelAr : labelEn}
      </span>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TodayPage() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const [supportSent, setSupportSent] = useState(false)
  const [supportLoading, setSupportLoading] = useState(false)

  const today = todayKey()
  const currentHour = new Date().getHours()
  const greeting = getGreeting(currentHour, isAr)
  const timePeriod = getTimePeriod(currentHour)
  const timeBadge = getTimeBadge(timePeriod, isAr)

  // ── Score calculation ──────────────────────────────────────────────────────
  const gratitudeEntries = (state.gratitude?.[today] || []).filter(v => v && v.trim())
  const hasGratitude = gratitudeEntries.length >= 3

  const habitLog = state.habitTracker?.log || {}
  const hasHabits = (habitLog[today] || []).length > 0

  const dailyWins = state.dailyWins?.[today] || []
  const hasWins = dailyWins.length > 0

  const sleepEntry = state.sleepLog?.[today]
  const hasSleep = !!sleepEntry

  const score = [
    state.morningDone,
    hasGratitude,
    hasHabits,
    !!state.todayState,
    hasWins,
    state.eveningDone,
    hasSleep,
  ].filter(Boolean).length

  // Weighted score (0-100) — cornerstone habits weighted higher
  const weightedScore = useMemo(() => calcWeightedScore(state), [state])
  const scoreInsight = useMemo(() => getScoreInsight(state, isAr), [state, isAr])

  // ── Journey steps definition ──────────────────────────────────────────────
  const allSteps = useMemo(() => [
    { id: 'morning',   emoji: '☀️', labelAr: 'الروتين الصباحي', labelEn: 'Morning Ritual',  done: state.morningDone, path: '/morning',   section: 'morning' },
    { id: 'gratitude', emoji: '🙏', labelAr: 'الامتنان',        labelEn: 'Gratitude',        done: hasGratitude,      path: '/gratitude', section: 'morning' },
    { id: 'habits',    emoji: '✅', labelAr: 'العادات',          labelEn: 'Habits',           done: hasHabits,         path: '/habits',    section: 'morning' },
    { id: 'state',     emoji: '⚡', labelAr: 'حالتك اليوم',     labelEn: "Today's State",    done: !!state.todayState, path: '/state',    section: 'afternoon' },
    { id: 'goals',     emoji: '🎯', labelAr: 'الأهداف',          labelEn: 'Goals',            done: false,             path: '/goals',     section: 'afternoon' },
    { id: 'challenge', emoji: '🔥', labelAr: 'تحدي اليوم',      labelEn: 'Daily Challenge',  done: false,             path: '/challenge', section: 'afternoon' },
    { id: 'wins',      emoji: '🏆', labelAr: 'انتصارات اليوم',  labelEn: 'Daily Wins',       done: hasWins,           path: '/wins',      section: 'evening' },
    { id: 'evening',   emoji: '🌙', labelAr: 'الروتين المسائي', labelEn: 'Evening Ritual',   done: state.eveningDone, path: '/evening',   section: 'evening' },
    { id: 'sleep',     emoji: '😴', labelAr: 'تتبع النوم',      labelEn: 'Sleep Log',        done: hasSleep,          path: '/sleep',     section: 'evening' },
  ], [state.morningDone, hasGratitude, hasHabits, state.todayState, hasWins, state.eveningDone, hasSleep])

  // ── Time-based ordering ───────────────────────────────────────────────────
  // Priority step IDs by time period (front steps become prominent)
  const priorityOrder = useMemo(() => {
    if (timePeriod === 'morning')   return ['morning', 'state', 'habits', 'gratitude', 'goals', 'challenge', 'wins', 'evening', 'sleep']
    if (timePeriod === 'afternoon') return ['goals', 'habits', 'state', 'wins', 'challenge', 'morning', 'gratitude', 'evening', 'sleep']
    if (timePeriod === 'evening')   return ['evening', 'wins', 'gratitude', 'sleep', 'morning', 'state', 'habits', 'goals', 'challenge']
    // night (0-4)
    return ['sleep', 'evening', 'gratitude', 'morning', 'state', 'habits', 'goals', 'challenge', 'wins']
  }, [timePeriod])

  // Sort steps: incomplete first (by priority order), then done (by priority order)
  const sortedSteps = useMemo(() => {
    const incomplete = priorityOrder
      .map(id => allSteps.find(s => s.id === id))
      .filter(s => s && !s.done)
    const done = priorityOrder
      .map(id => allSteps.find(s => s.id === id))
      .filter(s => s && s.done)
    return [...incomplete, ...done]
  }, [allSteps, priorityOrder])

  // First incomplete step gets "suggested" badge
  const firstIncompleteId = sortedSteps.find(s => !s.done)?.id

  // ── Group sorted steps by section for display ─────────────────────────────
  const sectionColors = { morning: '#c9a84c', afternoon: '#3498db', evening: '#9b59b6' }
  const sectionLabels = {
    morning:   { ar: 'الصباح 🌅', en: 'Morning 🌅' },
    afternoon: { ar: 'النهار 🌤',  en: 'Afternoon 🌤' },
    evening:   { ar: 'المساء 🌙', en: 'Evening 🌙' },
  }

  // Group while preserving the sorted order within each section group appearance
  const sectionOrder = useMemo(() => {
    const seen = []
    const groups = {}
    sortedSteps.forEach(step => {
      if (!seen.includes(step.section)) seen.push(step.section)
      if (!groups[step.section]) groups[step.section] = []
      groups[step.section].push(step)
    })
    return { order: seen, groups }
  }, [sortedSteps])

  // ── Support button handler ─────────────────────────────────────────────────
  async function handleSupport() {
    if (supportLoading || supportSent) return
    setSupportLoading(true)
    try {
      await upwApi.sendCoachMessage({
        toUserId: 'admin',
        body: isAr ? 'الطالب يحتاج دعماً الآن 🙋' : 'Student needs support now 🙋',
        type: 'reminder',
      })
      setSupportSent(true)
      setTimeout(() => setSupportSent(false), 3000)
    } catch (e) {
      // silent fail — still show sent
      setSupportSent(true)
      setTimeout(() => setSupportSent(false), 3000)
    } finally {
      setSupportLoading(false)
    }
  }

  // ── Ritual Reflection Trend (last 7 days) ──────────────────────────────────
  const ritualTrend = useMemo(() => {
    const refs = state.ritualReflections || {}
    const keys = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })

    const morningRatings = []
    const eveningRatings = []

    keys.forEach(k => {
      const day = refs[k]
      if (day?.morning?.rating) morningRatings.push(day.morning.rating)
      if (day?.evening?.rating) eveningRatings.push(day.evening.rating)
    })

    const totalDays = new Set(keys.filter(k => refs[k]?.morning || refs[k]?.evening)).size
    if (totalDays < 3) return null

    const avg = arr => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null

    // Detect trend: compare first half vs second half of morning ratings
    let morningTrend = 'stable'
    if (morningRatings.length >= 4) {
      const mid = Math.floor(morningRatings.length / 2)
      const firstHalf = avg(morningRatings.slice(0, mid))
      const secondHalf = avg(morningRatings.slice(mid))
      if (secondHalf - firstHalf >= 0.4) morningTrend = 'up'
      else if (firstHalf - secondHalf >= 0.4) morningTrend = 'down'
    }

    return {
      avgMorning: avg(morningRatings),
      avgEvening: avg(eveningRatings),
      morningTrend,
      totalDays,
    }
  }, [state.ritualReflections])

  // ── Yesterday's Evening Plan → Today's Tasks ──────────────────────────────
  const yesterdayKey = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])
  const eveningPlan = (state.eveningLog?.[yesterdayKey]?.tomorrow || []).filter(t => t && t.trim())
  // Also check today's evening log (in case user planned today for today)
  const todayPlan = (state.eveningLog?.[today]?.tomorrow || []).filter(t => t && t.trim())
  const planTasks = eveningPlan.length > 0 ? eveningPlan : todayPlan
  const planChecked = state.todayPlanChecked?.[today] || {}

  const togglePlanTask = (idx) => {
    const existing = state.todayPlanChecked || {}
    const todayChecks = { ...(existing[today] || {}), [idx]: !planChecked[idx] }
    update('todayPlanChecked', { ...existing, [today]: todayChecks })
  }

  const planDoneCount = planTasks.filter((_, i) => planChecked[i]).length

  const isAdmin = currentUser?.role === 'admin'

  // ── Morning Briefing — smart intelligence sentence ────────────────────
  const briefing = useMemo(() => generateBriefing(state, isAr), [state, isAr])

  // ── Yesterday's Evening Reflection (surface it back to the user) ──────
  const yesterdayReflection = useMemo(() => {
    const yDate = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const entry = state.eveningLog?.[yDate]
    if (!entry?.reflection?.trim()) return null
    return { date: yDate, text: entry.reflection.trim(), rating: entry.dayRating }
  }, [state.eveningLog])

  // ── Personalized tip based on onboarding profile (Fix #8) ──────────
  const personalTip = useMemo(() => getDailyPersonalizedTip(state.onboardingProfile, isAr), [state.onboardingProfile, isAr])

  // ── Progressive UI — hide advanced elements for new users ──────────
  const todayVis = useMemo(() => getTodayVisibility(state), [state.morningLog])

  // ── Wheel of Life ↔ State Connection ──────────────────────────
  const wheelStateLink = useMemo(() => {
    const wheel = state.wheelScores || {}
    const entries = Object.entries(wheel).filter(([, v]) => v !== 5 && v <= 4)
    if (entries.length === 0) return null
    const AREA_LABELS = {
      body: { ar: 'الصحة', en: 'Health' }, emotions: { ar: 'العواطف', en: 'Emotions' },
      relationships: { ar: 'العلاقات', en: 'Relationships' }, time: { ar: 'الوقت', en: 'Time' },
      career: { ar: 'المهنة', en: 'Career' }, money: { ar: 'المال', en: 'Money' },
      contribution: { ar: 'المساهمة', en: 'Contribution' },
    }
    const lowest = entries.reduce((a, b) => a[1] < b[1] ? a : b)
    return { area: lowest[0], score: lowest[1], label: AREA_LABELS[lowest[0]] || { ar: lowest[0], en: lowest[0] } }
  }, [state.wheelScores])

  // ── Yesterday's evening reflection (data value return) ────────────────
  const yesterdayEvening = state.eveningLog?.[yesterdayKey]
  const morningCommitment = state.morningAnswers?.[6] // "What step will I take today?"

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#090909',
        minHeight: '100%',
        paddingBottom: 100,
      }}
    >
      {/* Fix #20 — First-time wow moment */}
      <WelcomeExperience />

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '52px 20px 12px',
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="active:scale-95 transition-all"
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid #2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isAr
            ? <ChevronRight size={16} style={{ color: '#aaa' }} />
            : <ArrowLeft size={16} style={{ color: '#aaa' }} />
          }
        </button>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <p style={{ color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {isAr ? 'يومي' : 'My Day'}
          </p>
          {/* Time-of-day badge */}
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            color: '#c9a84c',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 99,
            padding: '2px 10px',
          }}>
            {timeBadge}
          </span>
        </div>

        {/* streak badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(201,168,76,0.12)',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 99, padding: '4px 10px',
        }}>
          <Flame size={12} style={{ color: '#c9a84c' }} />
          <span style={{ color: '#c9a84c', fontSize: 11, fontWeight: 800 }}>
            {state.streak} {isAr ? 'يوم' : 'd'}
          </span>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── Greeting + Name ────────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 20,
          padding: '20px 20px',
          marginBottom: 16,
          background: '#0e0e0e',
          border: '1px solid #1e1e1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
              {greeting}
            </h1>
            <p style={{ color: '#c9a84c', fontSize: 14, fontWeight: 600 }}>
              {state.userName || (isAr ? 'المحارب' : 'Warrior')}
            </p>
            <p style={{ color: '#555', fontSize: 11, marginTop: 6 }}>
              {formatTodayDate(isAr)}
            </p>
          </div>
          <ScoreRing score={score} total={7} weighted={weightedScore} insight={scoreInsight} isAr={isAr} />
        </div>

        {/* ── Personalized AI Coach Card — "this app understands me" ──── */}
        {todayVis.personalizedCoach && (
          <div style={{ marginBottom: 14 }}>
            <PersonalizedCoachCard />
          </div>
        )}

        {/* ── Morning Briefing — Smart Intelligence Sentence ──────────── */}
        {briefing && (
          <div style={{
            borderRadius: 16,
            padding: '12px 14px',
            marginBottom: 14,
            background: briefing.type === 'sleep' && briefing.priority >= 9
              ? 'rgba(231,76,60,0.06)'
              : briefing.type === 'state' && briefing.priority >= 9
                ? 'rgba(155,89,182,0.06)'
                : 'rgba(201,168,76,0.06)',
            border: `1px solid ${
              briefing.type === 'sleep' && briefing.priority >= 9
                ? 'rgba(231,76,60,0.2)'
                : briefing.type === 'state' && briefing.priority >= 9
                  ? 'rgba(155,89,182,0.2)'
                  : 'rgba(201,168,76,0.15)'
            }`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{briefing.emoji}</span>
            <div>
              <p style={{
                fontSize: 12, fontWeight: 700, lineHeight: 1.5,
                color: briefing.priority >= 8 ? '#fff' : '#ccc',
              }}>
                {briefing.text}
              </p>
              {briefing.type !== 'generic' && (
                <p style={{ fontSize: 9, fontWeight: 600, color: '#555', marginTop: 3 }}>
                  {isAr ? '📊 بناءً على بياناتك' : '📊 Based on your data'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Weekly Discovery — auto-generated insights (continuity) ── */}
        <WeeklyDiscovery />

        {/* ── Insight Harvester — surface abandoned data (Critical Gap #1) ── */}
        <InsightHarvester />

        {/* ── Ritual Quality Trend — surface reflection data back ─── */}
        {ritualTrend && (
          <div style={{
            borderRadius: 16, padding: '12px 14px', marginBottom: 14,
            background: '#0e0e0e', border: '1px solid #1e1e1e',
          }}>
            <p style={{
              fontSize: 9, fontWeight: 800, color: '#666',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
            }}>
              {isAr ? 'جودة طقوسك — آخر ٧ أيام' : 'Ritual Quality — Last 7 Days'}
            </p>
            {ritualTrend.avgMorning !== null && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: ritualTrend.avgEvening !== null ? 8 : 0,
              }}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>☀️</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c' }}>
                  {ritualTrend.avgMorning}/5
                </span>
                <span style={{ fontSize: 11, color: '#888' }}>
                  {isAr ? 'الروتين الصباحي' : 'Morning ritual'}
                </span>
                <span style={{ fontSize: 12, color:
                  ritualTrend.morningTrend === 'up' ? '#2ecc71'
                  : ritualTrend.morningTrend === 'down' ? '#e74c3c'
                  : '#888',
                  fontWeight: 800, marginInlineStart: 'auto',
                }}>
                  {ritualTrend.morningTrend === 'up'
                    ? (isAr ? '↑ تحسّن!' : '↑ improving!')
                    : ritualTrend.morningTrend === 'down'
                      ? (isAr ? '↓ تراجع' : '↓ declining')
                      : (isAr ? '→ مستقر' : '→ stable')}
                </span>
              </div>
            )}
            {ritualTrend.avgEvening !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>🌙</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#9370db' }}>
                  {ritualTrend.avgEvening}/5
                </span>
                <span style={{ fontSize: 11, color: '#888' }}>
                  {isAr ? 'الروتين المسائي' : 'Evening ritual'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Yesterday's Sleep — explicit actionable card ──────────── */}
        {(() => {
          const yKey = new Date(Date.now() - 86400000).toISOString().split('T')[0]
          const ySleep = state.sleepLog?.[yKey]
          if (!ySleep?.hours) return null
          const h = ySleep.hours
          const isLow = h < 6
          const isMid = h >= 6 && h < 7
          if (!isLow && !isMid) return null // Only show if concerning
          return (
            <div style={{
              borderRadius: 16, padding: '10px 14px', marginBottom: 14,
              background: isLow ? 'rgba(231,76,60,0.06)' : 'rgba(230,126,34,0.06)',
              border: `1px solid ${isLow ? 'rgba(231,76,60,0.2)' : 'rgba(230,126,34,0.2)'}`,
            }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: isLow ? '#e74c3c' : '#e67e22', marginBottom: 3 }}>
                😴 {isAr ? `نومك البارحة: ${h} ساعات` : `Last night: ${h} hours of sleep`}
              </p>
              <p style={{ fontSize: 11, color: '#bbb', lineHeight: 1.5 }}>
                {isLow
                  ? (isAr ? '⚡ ابدأ بالماء + تنفس عميق. تجنّب القهوة بعد الظهر. اليوم ركّز على أهم مهمة واحدة فقط.'
                          : '⚡ Start with water + deep breathing. Skip caffeine after noon. Focus on just ONE key task today.')
                  : (isAr ? '💡 نوم مقبول — حاول النوم 30 دقيقة أبكر الليلة للوصول للمثالي.'
                          : '💡 Decent sleep — try sleeping 30 min earlier tonight to reach optimal.')}
              </p>
            </div>
          )
        })()}

        {/* ── Wheel of Life ↔ State Connection ────────────────────── */}
        {wheelStateLink && (
          <div style={{
            borderRadius: 16, padding: '10px 14px', marginBottom: 14,
            background: 'rgba(243,156,18,0.05)', border: '1px solid rgba(243,156,18,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#f39c12', marginBottom: 2 }}>
                🎡 {isAr ? 'عجلة حياتك' : 'Your Life Wheel'}
              </p>
              <p style={{ fontSize: 11, color: '#bbb' }}>
                {isAr
                  ? `"${wheelStateLink.label.ar}" عند ${wheelStateLink.score}/10 — ما خطوتك اليوم لرفعها؟`
                  : `"${wheelStateLink.label.en}" at ${wheelStateLink.score}/10 — what's your move today?`}
              </p>
            </div>
          </div>
        )}

        {/* ── Yesterday's Data Value Return ────────────────────────────── */}
        {morningCommitment && (
          <div style={{
            borderRadius: 16,
            padding: '10px 14px',
            marginBottom: 14,
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid rgba(201,168,76,0.12)',
          }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: '#c9a84c', marginBottom: 3 }}>
              ☀️ {isAr ? 'هذا الصباح التزمت بـ:' : 'This morning you committed to:'}
            </p>
            <p style={{ fontSize: 12, color: '#ddd', fontStyle: 'italic', lineHeight: 1.4 }}>
              "{morningCommitment.slice(0, 100)}"
            </p>
          </div>
        )}

        {/* ── Yesterday's Reflection — surface evening data back ──── */}
        {yesterdayReflection && (
          <div style={{
            borderRadius: 16, padding: '10px 14px', marginBottom: 14,
            background: 'rgba(147,112,219,0.05)', border: '1px solid rgba(147,112,219,0.15)',
          }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: '#9370db', marginBottom: 3 }}>
              🌙 {isAr ? 'تأمّلك البارحة:' : "Yesterday's Reflection:"}
            </p>
            <p style={{ fontSize: 12, color: '#bbb', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{yesterdayReflection.text.slice(0, 120)}{yesterdayReflection.text.length > 120 ? '...' : ''}"
            </p>
            {yesterdayReflection.rating && (
              <p style={{ fontSize: 9, color: '#555', marginTop: 4 }}>
                {isAr ? `تقييم يومك: ${yesterdayReflection.rating}/10` : `Day rating: ${yesterdayReflection.rating}/10`}
              </p>
            )}
          </div>
        )}

        {/* ── Personalized Tip — based on onboarding profile (Fix #8) ──── */}
        {todayVis.personalTip && personalTip && (
          <div style={{
            borderRadius: 16,
            padding: '10px 14px',
            marginBottom: 14,
            background: 'rgba(155,89,182,0.05)',
            border: '1px solid rgba(155,89,182,0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{personalTip.emoji}</span>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#bbb', lineHeight: 1.5 }}>
              {personalTip.text}
            </p>
          </div>
        )}

        {/* ── Stale Goal Nudge — Coaching Dialogue ─────────────────────── */}
        {todayVis.staleGoalNudge && <StaleGoalNudge />}

        {/* ── Accountability Card — weekly commitment (Fix #4) ─────────── */}
        {todayVis.accountability && (
          <div style={{ marginBottom: 14 }}>
            <AccountabilityCard />
          </div>
        )}

        {/* ── State Check-in ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 14 }}>
          {state.stateCheckin?.[today] ? (
            <StateCheckin compact />
          ) : (
            <StateCheckin />
          )}
        </div>

        {/* ── Smart Daily Question ─────────────────────────────────────────── */}
        {todayVis.smartQuestion && (
          <div style={{ marginBottom: 14 }}>
            <SmartDailyQuestion />
          </div>
        )}

        {/* ── Transformation Intelligence ─────────────────────────────────── */}
        {todayVis.transformPulse && (
          <div style={{ marginBottom: 14 }}>
            <TransformationPulse />
          </div>
        )}

        {/* ── Today's Plan (from yesterday evening) ─────────────────────────── */}
        {planTasks.length > 0 && (
          <div style={{
            borderRadius: 20,
            padding: 16,
            marginBottom: 14,
            background: '#0e0e0e',
            border: planDoneCount === planTasks.length
              ? '1px solid rgba(46,204,113,0.4)'
              : '1px solid rgba(201,168,76,0.3)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <div style={{
                borderRadius: 10,
                padding: '6px 12px',
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.3)',
                display: 'inline-block',
              }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.08em' }}>
                  📋 {isAr ? 'خطة اليوم' : "Today's Plan"}
                </span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 800,
                color: planDoneCount === planTasks.length ? '#2ecc71' : '#888',
              }}>
                {planDoneCount}/{planTasks.length}
              </span>
            </div>

            <p style={{ color: '#555', fontSize: 10, marginBottom: 10 }}>
              {isAr ? 'المهام التي خططت لها البارحة في الطقس المسائي' : 'Tasks you planned yesterday in the evening ritual'}
            </p>

            {planTasks.map((task, idx) => {
              const checked = !!planChecked[idx]
              return (
                <button
                  key={idx}
                  onClick={() => togglePlanTask(idx)}
                  className="active:scale-95 transition-all"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginBottom: 8,
                    background: checked ? 'rgba(46,204,113,0.06)' : '#111',
                    border: `1px solid ${checked ? 'rgba(46,204,113,0.3)' : '#1e1e1e'}`,
                    cursor: 'pointer',
                    textAlign: isAr ? 'right' : 'left',
                    flexDirection: isAr ? 'row-reverse' : 'row',
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 24, height: 24,
                    borderRadius: 8,
                    border: `2px solid ${checked ? '#2ecc71' : '#333'}`,
                    background: checked ? 'rgba(46,204,113,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}>
                    {checked && <Check size={14} style={{ color: '#2ecc71' }} />}
                  </div>
                  {/* Task text */}
                  <span style={{
                    fontSize: 13, fontWeight: 600, flex: 1,
                    color: checked ? '#666' : '#ddd',
                    textDecoration: checked ? 'line-through' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {task}
                  </span>
                  {/* Number */}
                  <span style={{
                    fontSize: 10, fontWeight: 800, flexShrink: 0,
                    color: checked ? '#2ecc71' : '#c9a84c',
                  }}>
                    {idx + 1}
                  </span>
                </button>
              )
            })}

            {planDoneCount === planTasks.length && planTasks.length > 0 && (
              <div style={{
                borderRadius: 10,
                padding: '8px 12px',
                marginTop: 4,
                background: 'rgba(46,204,113,0.08)',
                border: '1px solid rgba(46,204,113,0.25)',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2ecc71' }}>
                  ✅ {isAr ? 'أنجزت كل مهامك — ممتاز!' : 'All tasks done — excellent!'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Time-smart task sections ──────────────────────────────────────── */}
        {sectionOrder.order.map(section => {
          const steps = sectionOrder.groups[section]
          const color = sectionColors[section]
          const label = sectionLabels[section]
          return (
            <div
              key={section}
              style={{
                borderRadius: 20,
                padding: 16,
                marginBottom: 14,
                background: '#0e0e0e',
                border: `1px solid ${timePeriod === section ? `${color}55` : '#1e1e1e'}`,
              }}
            >
              <SectionHeader labelAr={label.ar} labelEn={label.en} color={color} isAr={isAr} />
              {steps.map(step => (
                <TaskRow
                  key={step.id}
                  emoji={step.emoji}
                  labelAr={step.labelAr}
                  labelEn={step.labelEn}
                  done={step.done}
                  path={step.path}
                  isAr={isAr}
                  navigate={navigate}
                  suggested={step.id === firstIncompleteId}
                />
              ))}
            </div>
          )
        })}

        {/* ── Progress Snapshot — before/after outcome measurement (Fix #10) ── */}
        {todayVis.progressSnapshot && (
          <div style={{ marginBottom: 14 }}>
            <ProgressSnapshot />
          </div>
        )}

        {/* ── All-done banner ─────────────────────────────────────────────────── */}
        {score === 7 && (
          <div style={{
            borderRadius: 20,
            padding: '16px 20px',
            marginBottom: 14,
            background: 'linear-gradient(135deg, rgba(46,204,113,0.12), rgba(46,204,113,0.05))',
            border: '1px solid rgba(46,204,113,0.35)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 28 }}>🏆</span>
            <p style={{ color: '#2ecc71', fontWeight: 900, fontSize: 15, marginTop: 6 }}>
              {isAr ? 'يوم مثالي! أكملت كل المهام 🎉' : 'Perfect day! All tasks complete 🎉'}
            </p>
            <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
              {isAr ? 'أنت تبني شخصاً استثنائياً' : "You're building an extraordinary self"}
            </p>
          </div>
        )}

        {/* ── Date + Streak Footer ─────────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center',
          padding: '4px 0 8px',
        }}>
          <p style={{ color: '#444', fontSize: 11 }}>
            {formatTodayDate(isAr)}
            {' · '}
            <span style={{ color: '#c9a84c' }}>
              🔥 {state.streak} {isAr ? 'يوم متواصل' : 'day streak'}
            </span>
          </p>
        </div>

      </div>

      {/* ── Floating Support Button ──────────────────────────────────────────── */}
      {!isAdmin && (
        <button
          onClick={handleSupport}
          disabled={supportLoading}
          className="active:scale-95 transition-all"
          style={{
            position: 'fixed',
            bottom: 84,
            [isAr ? 'left' : 'right']: 16,
            width: 56, height: 56,
            borderRadius: '50%',
            background: supportSent
              ? 'linear-gradient(135deg, #2ecc71, #27ae60)'
              : 'linear-gradient(135deg, #c9a84c, #e8c96a)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 50,
          }}
          title={isAr ? 'أحتاج دعماً' : 'Need support'}
        >
          {supportSent ? (
            <Check size={22} style={{ color: '#fff' }} />
          ) : (
            <LifeBuoy size={22} style={{ color: '#1a1000' }} />
          )}
        </button>
      )}

      {/* Sent toast */}
      {supportSent && (
        <div style={{
          position: 'fixed',
          bottom: 148,
          [isAr ? 'left' : 'right']: 12,
          background: 'rgba(46,204,113,0.95)',
          borderRadius: 10,
          padding: '8px 14px',
          zIndex: 51,
        }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
            {isAr ? 'تم الإرسال ✓' : 'Sent ✓'}
          </span>
        </div>
      )}

      {/* ── Bottom Navigation ────────────────────────────────────────────────── */}
      <BottomNav />
    </div>
  )
}
