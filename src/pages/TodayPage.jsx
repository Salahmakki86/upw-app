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

function TaskRow({ emoji, labelAr, labelEn, done, path, isAr, navigate }) {
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
        border: `1px solid ${done ? 'rgba(46,204,113,0.3)' : '#1e1e1e'}`,
        opacity: done ? 0.7 : 1,
        textAlign: isAr ? 'right' : 'left',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: done ? '#2ecc71' : '#ccc' }}>
          {isAr ? labelAr : labelEn}
        </span>
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
  const { state } = useApp()
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const [supportSent, setSupportSent] = useState(false)
  const [supportLoading, setSupportLoading] = useState(false)

  const today = todayKey()
  const hour = new Date().getHours()
  const greeting = getGreeting(hour, isAr)

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
          onClick={() => navigate('/')}
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

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {isAr ? 'يومي' : 'My Day'}
          </p>
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

        {/* ── MORNING SECTION ────────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 20,
          padding: 16,
          marginBottom: 14,
          background: '#0e0e0e',
          border: `1px solid ${hour >= 5 && hour < 12 ? 'rgba(201,168,76,0.3)' : '#1e1e1e'}`,
        }}>
          <SectionHeader labelAr="الصباح 🌅" labelEn="Morning 🌅" color="#c9a84c" isAr={isAr} />

          <TaskRow
            emoji="☀️"
            labelAr="الروتين الصباحي"
            labelEn="Morning Ritual"
            done={state.morningDone}
            path="/morning"
            isAr={isAr}
            navigate={navigate}
          />
          <TaskRow
            emoji="🙏"
            labelAr="الامتنان"
            labelEn="Gratitude"
            done={hasGratitude}
            path="/gratitude"
            isAr={isAr}
            navigate={navigate}
          />
          <TaskRow
            emoji="✅"
            labelAr="العادات"
            labelEn="Habits"
            done={hasHabits}
            path="/habits"
            isAr={isAr}
            navigate={navigate}
          />
        </div>

        {/* ── AFTERNOON SECTION ──────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 20,
          padding: 16,
          marginBottom: 14,
          background: '#0e0e0e',
          border: `1px solid ${hour >= 12 && hour < 18 ? 'rgba(52,152,219,0.35)' : '#1e1e1e'}`,
        }}>
          <SectionHeader labelAr="النهار 🌤" labelEn="Afternoon 🌤" color="#3498db" isAr={isAr} />

          <TaskRow
            emoji="⚡"
            labelAr="حالتك اليوم"
            labelEn="Today's State"
            done={!!state.todayState}
            path="/state"
            isAr={isAr}
            navigate={navigate}
          />
          <TaskRow
            emoji="🎯"
            labelAr="الأهداف"
            labelEn="Goals"
            done={false}
            path="/goals"
            isAr={isAr}
            navigate={navigate}
          />
          <TaskRow
            emoji="🔥"
            labelAr="تحدي اليوم"
            labelEn="Daily Challenge"
            done={false}
            path="/challenge"
            isAr={isAr}
            navigate={navigate}
          />
        </div>

        {/* ── EVENING SECTION ────────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 20,
          padding: 16,
          marginBottom: 14,
          background: '#0e0e0e',
          border: `1px solid ${hour >= 18 ? 'rgba(155,89,182,0.35)' : '#1e1e1e'}`,
        }}>
          <SectionHeader labelAr="المساء 🌙" labelEn="Evening 🌙" color="#9b59b6" isAr={isAr} />

          <TaskRow
            emoji="🏆"
            labelAr="انتصارات اليوم"
            labelEn="Daily Wins"
            done={hasWins}
            path="/wins"
            isAr={isAr}
            navigate={navigate}
          />
          <TaskRow
            emoji="🌙"
            labelAr="الروتين المسائي"
            labelEn="Evening Ritual"
            done={state.eveningDone}
            path="/evening"
            isAr={isAr}
            navigate={navigate}
          />
          <TaskRow
            emoji="😴"
            labelAr="تتبع النوم"
            labelEn="Sleep Log"
            done={hasSleep}
            path="/sleep"
            isAr={isAr}
            navigate={navigate}
          />
        </div>

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
    </div>
  )
}
