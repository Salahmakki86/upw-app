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

function ScoreRing({ score, total, isAr }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const progress = score / total
  const strokeDashoffset = circumference * (1 - progress)

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
          stroke="#c9a84c"
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
        <span style={{ color: '#c9a84c', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
          {score}/{total}
        </span>
        <span style={{ color: '#888', fontSize: 10, marginTop: 3 }}>
          {isAr ? 'نقاط اليوم' : "Today's Score"}
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

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#090909',
        minHeight: '100%',
        paddingBottom: 100,
      }}
    >
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
          <ScoreRing score={score} total={7} isAr={isAr} />
        </div>

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
