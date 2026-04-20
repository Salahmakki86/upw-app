import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sun, Moon, Star, Flame, Zap, Target, Trophy,
  Check, ArrowLeft, LifeBuoy, ChevronRight, ChevronLeft,
  ChevronDown, ChevronUp,
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
import WeeklyDiscovery, { useWeeklyDiscoveryAvailable } from '../components/WeeklyDiscovery'
import PersonalizedCoachCard from '../components/PersonalizedCoachCard'
import InsightHarvester from '../components/InsightHarvester'
import { generateActionableInsights, checkInsightProgress } from '../utils/insightEngine'
import ActionableInsightCard from '../components/ActionableInsightCard'
import ProgressCheckCard from '../components/ProgressCheckCard'
import { generateBriefing } from '../utils/morningBriefing'
import { calcWeightedScore, getScoreInsight } from '../utils/dailyScore'
import { getDailyPersonalizedTip } from '../utils/personalization'
import { getTodayVisibility } from '../utils/progressiveUI'
import IdentityAnchor from '../components/IdentityAnchor'
import { getTodayPlan, computeCurrentDay, getCurrentChapter } from '../utils/journeyEngine'

// ─── helpers ────────────────────────────────────────────────────────────────

function getGreeting(hour, isAr) {
  if (hour >= 5 && hour < 12) return isAr ? 'صباح الخير' : 'Good Morning'
  if (hour >= 12 && hour < 18) return isAr ? 'مرحبا بك' : 'Good Afternoon'
  return isAr ? 'مساء الخير' : 'Good Evening'
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
  return 'night' // 0-4
}

// ─── Mini Score Arc (top corner) ────────────────────────────────────────────

function MiniScoreArc({ weighted, isAr }) {
  const radius = 22
  const circumference = Math.PI * radius // half-circle
  const progress = weighted / 100
  const strokeDashoffset = circumference * (1 - progress)
  const ringColor = weighted >= 80 ? '#2ecc71' : weighted >= 50 ? '#c9a84c' : weighted >= 25 ? '#f39c12' : '#e63946'

  return (
    <div style={{ position: 'relative', width: 56, height: 36 }}>
      <svg width="56" height="36" viewBox="0 0 56 36">
        {/* background arc */}
        <path
          d="M 4 32 A 24 24 0 0 1 52 32"
          fill="none"
          stroke="#1e1e1e"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* progress arc */}
        <path
          d="M 4 32 A 24 24 0 0 1 52 32"
          fill="none"
          stroke={ringColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        textAlign: 'center',
      }}>
        <span style={{ color: ringColor, fontSize: 13, fontWeight: 900, lineHeight: 1 }}>
          {weighted}%
        </span>
      </div>
    </div>
  )
}

// ─── Task Card (large, touchable) ───────────────────────────────────────────

function TaskCard({ emoji, labelAr, labelEn, contextAr, contextEn, done, path, isAr, navigate, suggested }) {
  return (
    <button
      onClick={() => navigate(path)}
      className="active:scale-[0.97] transition-all"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexDirection: isAr ? 'row-reverse' : 'row',
        borderRadius: 20,
        padding: '20px',
        background: done ? 'rgba(46,204,113,0.04)' : '#111',
        border: `1.5px solid ${done ? 'rgba(46,204,113,0.25)' : suggested ? '#c9a84c' : '#1a1a1a'}`,
        boxShadow: suggested && !done ? '0 0 20px rgba(201,168,76,0.08)' : 'none',
        opacity: done ? 0.6 : 1,
        textAlign: isAr ? 'right' : 'left',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Done overlay check */}
      {done && (
        <div style={{
          position: 'absolute',
          top: 10,
          [isAr ? 'left' : 'right']: 10,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(46,204,113,0.15)',
          border: '1.5px solid rgba(46,204,113,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Check size={14} style={{ color: '#2ecc71' }} />
        </div>
      )}

      {/* Emoji */}
      <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>

      {/* Text */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isAr ? 'flex-end' : 'flex-start',
        gap: 4,
      }}>
        <span style={{
          fontSize: 16,
          fontWeight: 700,
          color: done ? '#2ecc71' : '#eee',
          textDecoration: done ? 'line-through' : 'none',
        }}>
          {isAr ? labelAr : labelEn}
        </span>

        {/* Context line */}
        <span style={{ fontSize: 12, color: '#666', lineHeight: 1.3 }}>
          {isAr ? contextAr : contextEn}
        </span>

        {/* Suggested badge */}
        {suggested && !done && (
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            color: '#c9a84c',
            background: 'rgba(201,168,76,0.12)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 99,
            padding: '2px 10px',
            marginTop: 2,
            letterSpacing: '0.06em',
          }}>
            {isAr ? '✦ مقترح' : '✦ Suggested'}
          </span>
        )}
      </div>

      {/* Arrow */}
      {!done && (
        isAr
          ? <ChevronLeft size={18} style={{ color: suggested ? '#c9a84c' : '#444', flexShrink: 0 }} />
          : <ChevronRight size={18} style={{ color: suggested ? '#c9a84c' : '#444', flexShrink: 0 }} />
      )}
    </button>
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
  const [showMore, setShowMore] = useState(false)
  const weeklyDiscoveryReady = useWeeklyDiscoveryAvailable()

  const today = todayKey()
  const currentHour = new Date().getHours()
  const greeting = getGreeting(currentHour, isAr)
  const timePeriod = getTimePeriod(currentHour)

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

  // Weighted score (0-100) -- cornerstone habits weighted higher
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

  // ── Task Priority Logic (time-aware) ──────────────────────────────────────
  const hour = currentHour
  const priorityTasks = useMemo(() => {
    const tasks = [
      { key: 'morning',   path: '/morning',   emoji: '☀️', labelAr: 'الطقس الصباحي', labelEn: 'Morning Ritual',  contextAr: 'ابدا يومك بالطاقة', contextEn: 'Start your day with energy', done: state.morningDone, priority: hour < 12 ? 10 : 3 },
      { key: 'gratitude', path: '/gratitude',  emoji: '🙏', labelAr: 'الامتنان',       labelEn: 'Gratitude',       contextAr: '3 اشياء تشكرها اليوم', contextEn: '3 things to be thankful for', done: hasGratitude, priority: hour < 14 ? 8 : 4 },
      { key: 'state',     path: '/state',      emoji: '⚡', labelAr: 'سجل حالتك',      labelEn: 'Log Your State',  contextAr: 'كيف تشعر الان؟', contextEn: 'How are you feeling right now?', done: !!state.todayState, priority: 7 },
      { key: 'habits',    path: '/habits',     emoji: '✅', labelAr: 'العادات',         labelEn: 'Habits',          contextAr: 'تتبع عاداتك اليومية', contextEn: 'Track your daily habits', done: hasHabits, priority: 6 },
      { key: 'goals',     path: '/goals',      emoji: '🎯', labelAr: 'الاهداف',         labelEn: 'Goals',           contextAr: 'راجع تقدمك', contextEn: 'Review your progress', done: false, priority: hour >= 10 && hour < 16 ? 7 : 3 },
      { key: 'wins',      path: '/wins',       emoji: '🏆', labelAr: 'انجازات اليوم',   labelEn: "Today's Wins",    contextAr: 'احتفل بانتصاراتك', contextEn: 'Celebrate your victories', done: hasWins, priority: hour >= 16 ? 8 : 2 },
      { key: 'evening',   path: '/evening',    emoji: '🌙', labelAr: 'الطقس المسائي',  labelEn: 'Evening Ritual',  contextAr: 'اختم يومك بوعي', contextEn: 'Close your day mindfully', done: state.eveningDone, priority: hour >= 18 ? 10 : 1 },
    ]

    // Sort: incomplete first (by priority desc), then completed (by priority desc)
    const incomplete = tasks.filter(t => !t.done).sort((a, b) => b.priority - a.priority)
    const completed = tasks.filter(t => t.done).sort((a, b) => b.priority - a.priority)

    // Show top 3: fill from incomplete, then completed if fewer than 3 incomplete
    const top3 = [...incomplete, ...completed].slice(0, 3)
    return top3
  }, [state.morningDone, hasGratitude, state.todayState, hasHabits, hasWins, state.eveningDone, hour])

  // First incomplete from the priority list
  const firstIncompleteTask = priorityTasks.find(t => !t.done)
  const allDone = !firstIncompleteTask

  // ── Support button handler ─────────────────────────────────────────────────
  async function handleSupport() {
    if (supportLoading || supportSent) return
    setSupportLoading(true)
    try {
      await upwApi.sendCoachMessage({
        toUserId: 'admin',
        body: isAr ? 'الطالب يحتاج دعما الان' : 'Student needs support now',
        type: 'reminder',
      })
      setSupportSent(true)
      setTimeout(() => setSupportSent(false), 3000)
    } catch (e) {
      // silent fail -- still show sent
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

  // ── Yesterday's Evening Plan -> Today's Tasks ──────────────────────────────
  const yesterdayKey = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])
  const eveningPlan = (state.eveningLog?.[yesterdayKey]?.tomorrow || []).filter(t => t && t.trim())
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

  // ── Morning Briefing -- smart intelligence sentence ────────────────────
  const briefing = useMemo(() => generateBriefing(state, isAr), [state, isAr])
  const actionableInsights = useMemo(() => generateActionableInsights(state, isAr), [state, isAr])
  const progressResults = useMemo(() => checkInsightProgress(state, isAr), [state, isAr])

  // ── Yesterday's Evening Reflection (surface it back to the user) ──────
  const yesterdayReflection = useMemo(() => {
    const yDate = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const entry = state.eveningLog?.[yDate]
    if (!entry?.reflection?.trim()) return null
    return { date: yDate, text: entry.reflection.trim(), rating: entry.dayRating }
  }, [state.eveningLog])

  // ── Personalized tip based on onboarding profile ──────────────────────
  const personalTip = useMemo(() => getDailyPersonalizedTip(state.onboardingProfile, isAr), [state.onboardingProfile, isAr])

  // ── Progressive UI -- hide advanced elements for new users ────────────
  const todayVis = useMemo(() => getTodayVisibility(state), [state.morningLog])

  // ── 90-Day Journey info (opt-in) ─────────────────────────────────────
  const journeyActive = !!state.journey90?.active
  const journeyDay = useMemo(() => computeCurrentDay(state), [state.journey90])
  const journeyPlan = useMemo(() => getTodayPlan(state), [state.journey90])
  const journeyChapter = useMemo(() => getCurrentChapter(state), [state.journey90])
  const journeyDayCompleted = !!(state.journey90?.dayCompletions || {})[journeyDay]
  const focusMode = !!state.uiPreferences?.focusMode

  // ── Wheel of Life <-> State Connection ──────────────────────────────
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

  const yesterdayEvening = state.eveningLog?.[yesterdayKey]
  const morningCommitment = state.morningAnswers?.[6]

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#090909',
        minHeight: '100%',
        paddingBottom: 100,
      }}
    >
      <WelcomeExperience />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: HERO (~40vh) -- greeting, briefing, score arc          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        minHeight: '40vh',
        background: 'linear-gradient(180deg, #111 0%, #090909 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 24px 28px',
        position: 'relative',
        textAlign: 'center',
      }}>
        {/* Score arc -- top corner */}
        <div style={{
          position: 'absolute',
          top: 56,
          [isAr ? 'left' : 'right']: 20,
        }}>
          <MiniScoreArc weighted={weightedScore} isAr={isAr} />
        </div>

        {/* Streak badge -- opposite top corner */}
        <div style={{
          position: 'absolute',
          top: 60,
          [isAr ? 'right' : 'left']: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 99,
          padding: '3px 10px',
        }}>
          <Flame size={12} style={{ color: '#c9a84c' }} />
          <span style={{ color: '#c9a84c', fontSize: 11, fontWeight: 800 }}>
            {state.streak} {isAr ? 'يوم' : 'd'}
          </span>
        </div>

        {/* Greeting + date (subtle, small) */}
        <p style={{ color: '#555', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
          {greeting}, <span style={{ color: '#888' }}>{state.userName || (isAr ? 'المحارب' : 'Warrior')}</span>
        </p>
        <p style={{ color: '#333', fontSize: 11, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
          {formatTodayDate(isAr)}
          {weeklyDiscoveryReady && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 9, color: '#c9a84c', fontWeight: 700,
              background: 'rgba(201,168,76,0.10)', padding: '2px 7px',
              borderRadius: 8, border: '1px solid rgba(201,168,76,0.25)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#c9a84c', display: 'inline-block',
                animation: 'pulse 2s infinite',
              }} />
              {isAr ? '\u0627\u0643\u062A\u0634\u0627\u0641 \u062C\u062F\u064A\u062F' : 'New discovery'}
            </span>
          )}
        </p>

        {/* Morning Briefing -- the big sentence */}
        {briefing ? (
          <p style={{
            fontSize: 20,
            fontWeight: 500,
            color: '#eee',
            lineHeight: 1.6,
            maxWidth: 340,
            letterSpacing: '-0.01em',
          }}>
            <span style={{ marginInlineEnd: 8 }}>{briefing.emoji}</span>
            {briefing.text}
          </p>
        ) : (
          <p style={{
            fontSize: 20,
            fontWeight: 500,
            color: '#eee',
            lineHeight: 1.6,
            maxWidth: 340,
          }}>
            {isAr ? 'يومك ينتظرك. ابدا الان.' : 'Your day awaits. Start now.'}
          </p>
        )}

        {briefing && briefing.type !== 'generic' && (
          <p style={{ fontSize: 10, color: '#444', marginTop: 12, fontWeight: 600 }}>
            {isAr ? 'بناء على بياناتك' : 'Based on your data'}
          </p>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* IDENTITY ANCHOR — TR1: Daily identity reminder + alignment check   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {!focusMode && (
        <div style={{ padding: '0 16px 14px' }}>
          <IdentityAnchor variant="compact" />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 90-DAY JOURNEY DAY CARD (only if journey active)                   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {journeyActive && journeyPlan && (
        <div style={{ padding: '0 16px 14px' }}>
          <button
            onClick={() => navigate('/journey')}
            className="active:scale-[0.98] transition-all"
            style={{
              width: '100%', borderRadius: 20, padding: '14px 16px',
              background: 'linear-gradient(135deg, rgba(201,168,76,0.10), rgba(201,168,76,0.02))',
              border: `1px solid ${journeyDayCompleted ? 'rgba(46,204,113,0.35)' : 'rgba(201,168,76,0.3)'}`,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              flexDirection: isAr ? 'row-reverse' : 'row',
              textAlign: isAr ? 'right' : 'left',
            }}
          >
            <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>
              {journeyChapter?.emoji || '🌱'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 9, fontWeight: 900, letterSpacing: '0.08em',
                color: '#c9a84c', marginBottom: 3, textTransform: 'uppercase',
              }}>
                {isAr ? `اليوم ${journeyDay}/٩٠ — ${journeyChapter?.titleAr || ''}` : `Day ${journeyDay}/90 — ${journeyChapter?.titleEn || ''}`}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#eee', marginBottom: 2 }}>
                {journeyPlan.primary?.emoji}{' '}
                {isAr ? journeyPlan.primary?.labelAr : journeyPlan.primary?.labelEn}
              </div>
              {journeyPlan.milestone && (
                <div style={{ fontSize: 10, fontWeight: 700, color: '#c9a84c', marginTop: 3 }}>
                  {journeyPlan.milestone.emoji}{' '}
                  {isAr ? journeyPlan.milestone.ar : journeyPlan.milestone.en}
                </div>
              )}
            </div>
            {journeyDayCompleted ? (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(46,204,113,0.15)',
                border: '1.5px solid rgba(46,204,113,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Check size={14} style={{ color: '#2ecc71' }} />
              </div>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 800, color: '#c9a84c', flexShrink: 0 }}>
                →
              </span>
            )}
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: 3 PRIORITY TASKS (~40vh)                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {priorityTasks.map((task, idx) => (
          <TaskCard
            key={task.key}
            emoji={task.emoji}
            labelAr={task.labelAr}
            labelEn={task.labelEn}
            contextAr={task.contextAr}
            contextEn={task.contextEn}
            done={task.done}
            path={task.path}
            isAr={isAr}
            navigate={navigate}
            suggested={idx === 0 && !task.done && firstIncompleteTask?.key === task.key}
          />
        ))}

      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: GOLDEN BUTTON (fixed bottom area)                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '24px 16px 16px' }}>
        {allDone ? (
          <button
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
              border: 'none',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'center',
              letterSpacing: '-0.01em',
            }}
          >
            {isAr ? 'يومك مكتمل!' : 'Day Complete!'}
          </button>
        ) : (
          <button
            onClick={() => navigate(firstIncompleteTask.path)}
            className="active:scale-[0.97] transition-all"
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #c9a84c, #dbb85c)',
              border: 'none',
              color: '#090909',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'center',
              letterSpacing: '-0.01em',
              boxShadow: '0 4px 24px rgba(201,168,76,0.25)',
            }}
          >
            {isAr ? 'ابدا المهمة التالية' : 'Start Next Task'}
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: COLLAPSED "Show More" -- all existing components       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 16px' }}>

        {/* Toggle button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="active:scale-95 transition-all"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '14px 0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
            {showMore
              ? (isAr ? 'عرض اقل' : 'Show less')
              : (isAr ? 'عرض المزيد' : 'Show more')
            }
          </span>
          {showMore
            ? <ChevronUp size={16} style={{ color: '#555' }} />
            : <ChevronDown size={16} style={{ color: '#555' }} />
          }
        </button>

        {/* Expanded content */}
        {showMore && (
          <div style={{
            animation: 'fadeIn 0.3s ease',
          }}>

            {/* Full Identity Check-in (morning/evening slider) */}
            <div style={{ marginBottom: 14 }}>
              <IdentityAnchor variant="full" showQuestion={true} />
            </div>

            {/* Personalized AI Coach Card */}
            {todayVis.personalizedCoach && (
              <div style={{ marginBottom: 14 }}>
                <PersonalizedCoachCard />
              </div>
            )}

            {/* Progress Check Results */}
            {progressResults.map(result => (
              <ProgressCheckCard
                key={result.id}
                result={result}
                onDismiss={() => {
                  const log = { ...(state.insightActionsLog || {}) }
                  if (log[result.id]) log[result.id].completed = true
                  update('insightActionsLog', log)
                }}
                onAdjust={() => navigate('/insights')}
              />
            ))}

            {/* Actionable Insights */}
            {actionableInsights.length > 0 && (
              <div className="space-y-3" style={{ marginBottom: 14 }}>
                {actionableInsights.map(insight => (
                  <ActionableInsightCard
                    key={insight.id}
                    insight={insight}
                    onAction={(id, optIdx) => {
                      const opt = insight.decision.options[optIdx]
                      const log = { ...(state.insightActionsLog || {}) }
                      log[id] = {
                        action: opt.label,
                        startDate: new Date().toISOString().slice(0, 10),
                        metric: insight.progress?.metric,
                        metricLabel: insight.data?.metric,
                        baseline: insight.progress?.baseline,
                        checkAfterDays: insight.progress?.checkAfterDays || 7,
                        completed: false,
                      }
                      update('insightActionsLog', log)
                    }}
                  />
                ))}
              </div>
            )}

            {/* Weekly Discovery */}
            <WeeklyDiscovery />

            {/* Insight Harvester */}
            <InsightHarvester />

            {/* Ritual Quality Trend */}
            {ritualTrend && (
              <div style={{
                borderRadius: 16, padding: '12px 14px', marginBottom: 14,
                background: '#0e0e0e', border: '1px solid #1e1e1e',
              }}>
                <p style={{
                  fontSize: 9, fontWeight: 800, color: '#666',
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
                }}>
                  {isAr ? 'جودة طقوسك -- اخر 7 ايام' : 'Ritual Quality -- Last 7 Days'}
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
                        ? (isAr ? 'improving' : 'improving')
                        : ritualTrend.morningTrend === 'down'
                          ? (isAr ? 'declining' : 'declining')
                          : (isAr ? 'stable' : 'stable')}
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

            {/* Yesterday's Sleep */}
            {(() => {
              const yKey = new Date(Date.now() - 86400000).toISOString().split('T')[0]
              const ySleep = state.sleepLog?.[yKey]
              if (!ySleep?.hours) return null
              const h = ySleep.hours
              const isLow = h < 6
              const isMid = h >= 6 && h < 7
              if (!isLow && !isMid) return null
              return (
                <div style={{
                  borderRadius: 16, padding: '10px 14px', marginBottom: 14,
                  background: isLow ? 'rgba(231,76,60,0.06)' : 'rgba(230,126,34,0.06)',
                  border: `1px solid ${isLow ? 'rgba(231,76,60,0.2)' : 'rgba(230,126,34,0.2)'}`,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: isLow ? '#e74c3c' : '#e67e22', marginBottom: 3 }}>
                    {isAr ? `نومك البارحة: ${h} ساعات` : `Last night: ${h} hours of sleep`}
                  </p>
                  <p style={{ fontSize: 11, color: '#bbb', lineHeight: 1.5 }}>
                    {isLow
                      ? (isAr ? 'ابدا بالماء + تنفس عميق. تجنب القهوة بعد الظهر. اليوم ركز على اهم مهمة واحدة فقط.'
                              : 'Start with water + deep breathing. Skip caffeine after noon. Focus on just ONE key task today.')
                      : (isAr ? 'نوم مقبول -- حاول النوم 30 دقيقة ابكر الليلة للوصول للمثالي.'
                              : 'Decent sleep -- try sleeping 30 min earlier tonight to reach optimal.')}
                  </p>
                </div>
              )
            })()}

            {/* Wheel of Life State Connection */}
            {wheelStateLink && (
              <div style={{
                borderRadius: 16, padding: '10px 14px', marginBottom: 14,
                background: 'rgba(243,156,18,0.05)', border: '1px solid rgba(243,156,18,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#f39c12', marginBottom: 2 }}>
                    {isAr ? 'عجلة حياتك' : 'Your Life Wheel'}
                  </p>
                  <p style={{ fontSize: 11, color: '#bbb' }}>
                    {isAr
                      ? `"${wheelStateLink.label.ar}" عند ${wheelStateLink.score}/10 -- ما خطوتك اليوم لرفعها؟`
                      : `"${wheelStateLink.label.en}" at ${wheelStateLink.score}/10 -- what's your move today?`}
                  </p>
                </div>
              </div>
            )}

            {/* Yesterday's Data Value Return */}
            {morningCommitment && (
              <div style={{
                borderRadius: 16, padding: '10px 14px', marginBottom: 14,
                background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)',
              }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#c9a84c', marginBottom: 3 }}>
                  {isAr ? 'هذا الصباح التزمت ب:' : 'This morning you committed to:'}
                </p>
                <p style={{ fontSize: 12, color: '#ddd', fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{morningCommitment.slice(0, 100)}"
                </p>
              </div>
            )}

            {/* Yesterday's Reflection */}
            {yesterdayReflection && (
              <div style={{
                borderRadius: 16, padding: '10px 14px', marginBottom: 14,
                background: 'rgba(147,112,219,0.05)', border: '1px solid rgba(147,112,219,0.15)',
              }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#9370db', marginBottom: 3 }}>
                  {isAr ? 'تاملك البارحة:' : "Yesterday's Reflection:"}
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

            {/* Personalized Tip */}
            {todayVis.personalTip && personalTip && (
              <div style={{
                borderRadius: 16, padding: '10px 14px', marginBottom: 14,
                background: 'rgba(155,89,182,0.05)', border: '1px solid rgba(155,89,182,0.15)',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{personalTip.emoji}</span>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#bbb', lineHeight: 1.5 }}>
                  {personalTip.text}
                </p>
              </div>
            )}

            {/* Stale Goal Nudge */}
            {todayVis.staleGoalNudge && <StaleGoalNudge />}

            {/* Accountability Card */}
            {todayVis.accountability && (
              <div style={{ marginBottom: 14 }}>
                <AccountabilityCard />
              </div>
            )}

            {/* State Check-in */}
            <div style={{ marginBottom: 14 }}>
              {state.stateCheckin?.[today] ? (
                <StateCheckin compact />
              ) : (
                <StateCheckin />
              )}
            </div>

            {/* Smart Daily Question */}
            {todayVis.smartQuestion && (
              <div style={{ marginBottom: 14 }}>
                <SmartDailyQuestion />
              </div>
            )}

            {/* Transformation Intelligence */}
            {todayVis.transformPulse && (
              <div style={{ marginBottom: 14 }}>
                <TransformationPulse />
              </div>
            )}

            {/* Today's Plan (from yesterday evening) */}
            {planTasks.length > 0 && (
              <div style={{
                borderRadius: 20, padding: 16, marginBottom: 14,
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
                    borderRadius: 10, padding: '6px 12px',
                    background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
                    display: 'inline-block',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.08em' }}>
                      {isAr ? 'خطة اليوم' : "Today's Plan"}
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
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        borderRadius: 12, padding: '12px 14px', marginBottom: 8,
                        background: checked ? 'rgba(46,204,113,0.06)' : '#111',
                        border: `1px solid ${checked ? 'rgba(46,204,113,0.3)' : '#1e1e1e'}`,
                        cursor: 'pointer', textAlign: isAr ? 'right' : 'left',
                        flexDirection: isAr ? 'row-reverse' : 'row',
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: 8,
                        border: `2px solid ${checked ? '#2ecc71' : '#333'}`,
                        background: checked ? 'rgba(46,204,113,0.15)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.2s',
                      }}>
                        {checked && <Check size={14} style={{ color: '#2ecc71' }} />}
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 600, flex: 1,
                        color: checked ? '#666' : '#ddd',
                        textDecoration: checked ? 'line-through' : 'none',
                        transition: 'all 0.2s',
                      }}>
                        {task}
                      </span>
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
                    borderRadius: 10, padding: '8px 12px', marginTop: 4,
                    background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.25)',
                    textAlign: 'center',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#2ecc71' }}>
                      {isAr ? 'انجزت كل مهامك -- ممتاز!' : 'All tasks done -- excellent!'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Progress Snapshot */}
            {todayVis.progressSnapshot && (
              <div style={{ marginBottom: 14 }}>
                <ProgressSnapshot />
              </div>
            )}

            {/* All-done banner */}
            {score === 7 && (
              <div style={{
                borderRadius: 20, padding: '16px 20px', marginBottom: 14,
                background: 'linear-gradient(135deg, rgba(46,204,113,0.12), rgba(46,204,113,0.05))',
                border: '1px solid rgba(46,204,113,0.35)',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: 28 }}>🏆</span>
                <p style={{ color: '#2ecc71', fontWeight: 900, fontSize: 15, marginTop: 6 }}>
                  {isAr ? 'يوم مثالي! اكملت كل المهام' : 'Perfect day! All tasks complete'}
                </p>
                <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                  {isAr ? 'انت تبني شخصا استثنائيا' : "You're building an extraordinary self"}
                </p>
              </div>
            )}

            {/* Date + Streak Footer */}
            <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
              <p style={{ color: '#444', fontSize: 11 }}>
                {formatTodayDate(isAr)}
                {' · '}
                <span style={{ color: '#c9a84c' }}>
                  {state.streak} {isAr ? 'يوم متواصل' : 'day streak'}
                </span>
              </p>
            </div>

          </div>
        )}

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
          title={isAr ? 'احتاج دعما' : 'Need support'}
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
            {isAr ? 'تم الارسال' : 'Sent'}
          </span>
        </div>
      )}

      {/* ── Bottom Navigation ────────────────────────────────────────────────── */}
      <BottomNav />
    </div>
  )
}
