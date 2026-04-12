import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Check, X, Flame, Target, Trophy, Calendar,
  Play, RefreshCw, Award, Star,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

// ── Challenge definitions ──────────────────────────────────────────────────

const CHALLENGES = [
  {
    id: 'cold',
    emoji: '🧊',
    titleAr: 'تحدي الدش البارد ٣٠ يوم',
    titleEn: '30-Day Cold Shower Challenge',
    descAr: 'دش بارد كل يوم لمدة ٣٠ يوماً لتقوية الإرادة والطاقة',
    descEn: 'A cold shower every day for 30 days to build willpower and energy',
    borderColor: '#38bdf8',
  },
  {
    id: 'gratitude',
    emoji: '🙏',
    titleAr: 'تحدي الامتنان ٣٠ يوم',
    titleEn: '30-Day Gratitude Challenge',
    descAr: 'اكتب ٣ أشياء تشعر بالامتنان تجاهها كل يوم',
    descEn: "Write 3 things you're grateful for every day",
    borderColor: '#f59e0b',
  },
  {
    id: 'reading',
    emoji: '📚',
    titleAr: 'تحدي القراءة اليومية ٣٠ يوم',
    titleEn: '30-Day Daily Reading Challenge',
    descAr: 'اقرأ ١٠ صفحات على الأقل كل يوم',
    descEn: 'Read at least 10 pages every day',
    borderColor: '#a855f7',
  },
  {
    id: 'no_phone',
    emoji: '📵',
    titleAr: 'تحدي بدون هاتف في الصباح',
    titleEn: 'No Phone Morning Challenge',
    descAr: 'لا تمس هاتفك أول ساعة بعد الاستيقاظ لمدة ٣٠ يوماً',
    descEn: 'No phone for the first hour after waking for 30 days',
    borderColor: '#ef4444',
  },
  {
    id: 'movement',
    emoji: '🏃',
    titleAr: 'تحدي الحركة اليومية',
    titleEn: 'Daily Movement Challenge',
    descAr: '٣٠ دقيقة حركة يومياً لمدة ٣٠ يوماً',
    descEn: '30 minutes of movement every day for 30 days',
    borderColor: '#4ade80',
  },
  {
    id: 'meditation',
    emoji: '🧘',
    titleAr: 'تحدي التأمل اليومي',
    titleEn: 'Daily Meditation Challenge',
    descAr: '١٠ دقائق تأمل أو تنفس واعٍ كل يوم',
    descEn: '10 minutes of meditation or conscious breathing daily',
    borderColor: '#c9a84c',
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function diffDays(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

function getDaySquares(startDate) {
  return Array.from({ length: 30 }, (_, i) => addDays(startDate, i))
}

function calcStreak(daysLog, startDate) {
  let streak = 0
  const today = todayStr()
  // Walk backward from today to start
  let cursor = today
  while (diffDays(startDate, cursor) >= 0) {
    if (daysLog[cursor]) {
      streak++
      const d = new Date(cursor)
      d.setDate(d.getDate() - 1)
      cursor = d.toISOString().split('T')[0]
    } else {
      break
    }
  }
  return streak
}

// ── Progress ring SVG ──────────────────────────────────────────────────────

function ProgressRing({ done, total = 30 }) {
  const r = 52
  const cx = 60
  const cy = 60
  const circumference = 2 * Math.PI * r
  const pct = Math.min(done / total, 1)
  const offset = circumference * (1 - pct)

  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={8}
      />
      {/* Progress */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#c9a84c"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* Center text */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="#c9a84c"
        fontSize="20"
        fontWeight="bold"
        fontFamily="system-ui"
      >
        {done}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill="#555"
        fontSize="11"
        fontFamily="system-ui"
      >
        / {total}
      </text>
    </svg>
  )
}

// ── Confirm modal ──────────────────────────────────────────────────────────

function ConfirmModal({ challenge, isAr, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
        style={{ background: '#111', border: '1px solid #1e1e1e' }}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{challenge.emoji}</div>
          <h2 className="text-lg font-bold mb-1" style={{ color: '#e8e8e8' }}>
            {isAr ? 'هل أنت مستعد؟' : 'Ready to start?'}
          </h2>
          <p className="text-sm font-semibold mb-2" style={{ color: '#c9a84c' }}>
            {isAr ? challenge.titleAr : challenge.titleEn}
          </p>
          <p className="text-sm" style={{ color: '#666' }}>
            {isAr ? challenge.descAr : challenge.descEn}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all"
            style={{ background: '#1a1a1a', color: '#888' }}
          >
            {isAr ? 'لا، لاحقاً' : 'Not yet'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all"
            style={{ background: '#c9a84c', color: '#000' }}
          >
            <Play size={14} className="inline mb-0.5 me-1" />
            {isAr ? 'ابدأ التحدي!' : 'Start Challenge!'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── End challenge confirm ──────────────────────────────────────────────────

function EndConfirmModal({ isAr, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
        style={{ background: '#111', border: '1px solid #1e1e1e' }}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: '#ff6b7a' }}>
            {isAr ? 'إنهاء التحدي؟' : 'End the challenge?'}
          </h2>
          <p className="text-sm" style={{ color: '#666' }}>
            {isAr
              ? 'سيتم حذف تقدمك الحالي. هل أنت متأكد؟'
              : 'Your current progress will be lost. Are you sure?'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all"
            style={{ background: '#1a1a1a', color: '#888' }}
          >
            {isAr ? 'تراجع' : 'Go back'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all"
            style={{ background: 'rgba(255,107,122,0.15)', color: '#ff6b7a', border: '1px solid rgba(255,107,122,0.3)' }}
          >
            {isAr ? 'نعم، إنهاء' : 'Yes, end it'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Challenge selector view ────────────────────────────────────────────────

function ChallengeSelector({ isAr, onSelect }) {
  const [pending, setPending] = useState(null)

  return (
    <div className="px-5 pt-5 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#e8e8e8' }}>
          {isAr ? 'تحديات ٣٠ يوم' : '30-Day Challenges'}
        </h2>
        <p className="text-sm" style={{ color: '#666' }}>
          {isAr
            ? 'اختر تحدياً وأكمله ٣٠ يوماً متواصلة لتغيير حياتك'
            : 'Pick a challenge and complete 30 days straight to transform your life'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {CHALLENGES.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setPending(ch)}
            className="rounded-2xl p-4 text-start active:scale-95 transition-all"
            style={{
              background: '#0e0e0e',
              border: `1px solid #1c1c1c`,
              borderLeft: `3px solid ${ch.borderColor}`,
              direction: isAr ? 'rtl' : 'ltr',
            }}
          >
            <div className="text-3xl mb-2">{ch.emoji}</div>
            <p className="text-xs font-bold leading-snug mb-1" style={{ color: '#e0e0e0' }}>
              {isAr ? ch.titleAr : ch.titleEn}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#555' }}>
              {isAr ? ch.descAr : ch.descEn}
            </p>
          </button>
        ))}
      </div>

      {pending && (
        <ConfirmModal
          challenge={pending}
          isAr={isAr}
          onConfirm={() => {
            onSelect(pending)
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}

// ── Active challenge view ──────────────────────────────────────────────────

function ActiveChallengeView({ active, isAr, onMarkToday, onEnd }) {
  const today = todayStr()
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const challenge = CHALLENGES.find((c) => c.id === active.id) || CHALLENGES[0]
  const daysLog = active.daysLog || {}
  const squares = getDaySquares(active.startDate)

  const daysDone = Object.values(daysLog).filter(Boolean).length
  const daysLeft = Math.max(0, 30 - daysDone)
  const streak = useMemo(() => calcStreak(daysLog, active.startDate), [daysLog, active.startDate])
  const todayDone = !!daysLog[today]

  // Is today within the challenge window?
  const dayIndex = diffDays(active.startDate, today)
  const inWindow = dayIndex >= 0 && dayIndex < 30

  return (
    <div className="px-5 pt-5 pb-24">
      {/* Challenge title */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{challenge.emoji}</div>
        <h2 className="text-lg font-bold" style={{ color: '#e8e8e8' }}>
          {isAr ? challenge.titleAr : challenge.titleEn}
        </h2>
        <p className="text-xs mt-1" style={{ color: '#555' }}>
          {isAr ? 'بدأ في ' : 'Started '}
          {new Date(active.startDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Progress ring + today button */}
      <div
        className="rounded-2xl p-5 mb-4 flex flex-col items-center gap-4"
        style={{ background: '#0e0e0e', border: '1px solid #1c1c1c' }}
      >
        <ProgressRing done={daysDone} total={30} />

        {inWindow ? (
          todayDone ? (
            <div
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
              style={{
                background: 'rgba(74,222,128,0.12)',
                border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ade80',
              }}
            >
              <Check size={16} />
              {isAr ? 'أكملت تحديّك اليوم 🎉' : 'Done for today 🎉'}
            </div>
          ) : (
            <button
              onClick={onMarkToday}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold active:scale-95 transition-all"
              style={{ background: '#c9a84c', color: '#000' }}
            >
              <Check size={16} />
              {isAr ? '✅ أكملت تحديّ اليوم' : '✅ Done Today!'}
            </button>
          )
        ) : dayIndex >= 30 ? (
          <div
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
            style={{
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#c9a84c',
            }}
          >
            <Trophy size={16} />
            {isAr ? 'أنجزت التحدي! 🏆' : 'Challenge complete! 🏆'}
          </div>
        ) : null}
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 gap-3 mb-4"
      >
        {[
          {
            icon: <Check size={14} />,
            value: daysDone,
            labelAr: 'أيام مكتملة',
            labelEn: 'Days done',
            color: '#c9a84c',
          },
          {
            icon: <Calendar size={14} />,
            value: daysLeft,
            labelAr: 'أيام متبقية',
            labelEn: 'Days left',
            color: '#3b82f6',
          },
          {
            icon: <Flame size={14} />,
            value: streak,
            labelAr: 'السلسلة',
            labelEn: 'Streak',
            color: '#f97316',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-3 text-center"
            style={{ background: '#0e0e0e', border: '1px solid #1c1c1c' }}
          >
            <div
              className="flex items-center justify-center mb-1"
              style={{ color: item.color }}
            >
              {item.icon}
            </div>
            <p className="font-bold text-xl" style={{ color: item.color }}>
              {item.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#555' }}>
              {isAr ? item.labelAr : item.labelEn}
            </p>
          </div>
        ))}
      </div>

      {/* 30-day calendar grid */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{ background: '#0e0e0e', border: '1px solid #1c1c1c' }}
      >
        <p
          className="text-xs font-semibold mb-3 uppercase tracking-widest"
          style={{ color: '#555' }}
        >
          {isAr ? 'تقويم ٣٠ يوماً' : '30-Day Calendar'}
        </p>

        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}
        >
          {squares.map((dateKey, i) => {
            const isPast = dateKey < today
            const isToday = dateKey === today
            const isFuture = dateKey > today
            const done = !!daysLog[dateKey]

            let bg = '#0a0a0a'
            let border = '1px solid #1a1a1a'
            let color = '#333'

            if (done) {
              bg = 'rgba(201,168,76,0.25)'
              border = '1px solid rgba(201,168,76,0.5)'
              color = '#c9a84c'
            } else if (isPast) {
              bg = 'rgba(255,107,122,0.08)'
              border = '1px solid rgba(255,107,122,0.15)'
              color = '#3a1a1a'
            }

            if (isToday) {
              border = `2px solid ${done ? '#c9a84c' : '#444'}`
            }

            return (
              <div
                key={dateKey}
                className="rounded-lg flex items-center justify-center"
                style={{ width: '100%', aspectRatio: '1', background: bg, border }}
                title={dateKey}
              >
                {done ? (
                  <Check size={12} style={{ color: '#c9a84c' }} />
                ) : (
                  <span style={{ color: '#444', fontSize: 10 }}>{i + 1}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div
          className="flex items-center gap-4 mt-3"
          style={{ direction: isAr ? 'rtl' : 'ltr' }}
        >
          {[
            { color: 'rgba(201,168,76,0.25)', border: 'rgba(201,168,76,0.5)', label: isAr ? 'مكتمل' : 'Done' },
            { color: 'rgba(255,107,122,0.08)', border: 'rgba(255,107,122,0.15)', label: isAr ? 'فاتك' : 'Missed' },
            { color: '#0a0a0a', border: '#1a1a1a', label: isAr ? 'قادم' : 'Future' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded"
                style={{ background: item.color, border: `1px solid ${item.border}` }}
              />
              <span style={{ color: '#555', fontSize: 11 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* End challenge button */}
      <button
        onClick={() => setShowEndConfirm(true)}
        className="w-full py-3 rounded-xl text-sm font-medium active:scale-95 transition-all"
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,107,122,0.3)',
          color: '#ff6b7a',
        }}
      >
        {isAr ? 'إنهاء التحدي' : 'End Challenge'}
      </button>

      {showEndConfirm && (
        <EndConfirmModal
          isAr={isAr}
          onConfirm={onEnd}
          onCancel={() => setShowEndConfirm(false)}
        />
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function GroupChallengePage() {
  const navigate = useNavigate()
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const groupChallenge = state.groupChallenge || { active: null }
  const hasActive = !!groupChallenge.active

  function handleSelect(challenge) {
    update('groupChallenge', {
      active: {
        id: challenge.id,
        titleAr: challenge.titleAr,
        titleEn: challenge.titleEn,
        emoji: challenge.emoji,
        startDate: todayStr(),
        daysLog: {},
      },
    })
  }

  function handleMarkToday() {
    const today = todayStr()
    const prev = groupChallenge.active
    update('groupChallenge', {
      active: {
        ...prev,
        daysLog: {
          ...prev.daysLog,
          [today]: true,
        },
      },
    })
  }

  function handleEnd() {
    update('groupChallenge', { active: null })
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: '#090909', direction: isAr ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 flex items-center justify-between py-4"
        style={{
          background: 'rgba(9,9,9,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
          style={{ background: '#1a1a1a' }}
        >
          <ChevronLeft
            size={18}
            style={{ color: '#888', transform: isAr ? 'rotate(180deg)' : 'none' }}
          />
        </button>

        <div className="text-center">
          <h1 className="font-bold text-base" style={{ color: '#e8e8e8' }}>
            {hasActive
              ? isAr
                ? groupChallenge.active.titleAr
                : groupChallenge.active.titleEn
              : isAr
              ? 'تحديات ٣٠ يوم'
              : '30-Day Challenges'}
          </h1>
          {hasActive && (
            <p className="text-xs mt-0.5" style={{ color: '#c9a84c' }}>
              {groupChallenge.active.emoji}
            </p>
          )}
        </div>

        <div className="w-9" />
      </div>

      {hasActive ? (
        <ActiveChallengeView
          active={groupChallenge.active}
          isAr={isAr}
          onMarkToday={handleMarkToday}
          onEnd={handleEnd}
        />
      ) : (
        <ChallengeSelector isAr={isAr} onSelect={handleSelect} />
      )}
    </div>
  )
}
