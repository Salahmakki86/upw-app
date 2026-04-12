import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'

/* ─── ACHIEVEMENT DEFINITIONS ──────────────────────────────────────── */
const ACHIEVEMENTS = [
  {
    id: 'first_morning', emoji: '🌅', nameAr: 'أول صباح', nameEn: 'First Morning',
    descAr: 'أكمل روتينك الصباحي لأول مرة', descEn: 'Complete morning ritual for the first time',
    color: '#c9a84c', check: s => s.morningDone,
  },
  {
    id: 'streak_3', emoji: '🔥', nameAr: '3 أيام متواصلة', nameEn: '3-Day Streak',
    descAr: 'حافظ على streak 3 أيام', descEn: 'Maintain a 3-day streak',
    color: '#e67e22', check: s => (s.streak || 0) >= 3,
  },
  {
    id: 'streak_7', emoji: '⚡', nameAr: 'أسبوع كامل', nameEn: 'Full Week',
    descAr: '7 أيام متواصلة', descEn: '7-day streak',
    color: '#f1c40f', check: s => (s.streak || 0) >= 7,
  },
  {
    id: 'streak_30', emoji: '💎', nameAr: 'محارب الشهر', nameEn: 'Month Warrior',
    descAr: '30 يوماً متواصلاً', descEn: '30-day streak',
    color: '#9b59b6', check: s => (s.streak || 0) >= 30,
  },
  {
    id: 'first_goal', emoji: '🎯', nameAr: 'أول هدف', nameEn: 'First Goal',
    descAr: 'أضف هدفك الأول', descEn: 'Add your first goal',
    color: '#3498db', check: s => (s.goals || []).length >= 1,
  },
  {
    id: 'goals_5', emoji: '🏹', nameAr: 'صانع الأهداف', nameEn: 'Goal Setter',
    descAr: 'ضع 5 أهداف', descEn: 'Set 5 goals',
    color: '#2ecc71', check: s => (s.goals || []).length >= 5,
  },
  {
    id: 'goal_done', emoji: '🏆', nameAr: 'المنجز', nameEn: 'Achiever',
    descAr: 'أكمل هدفاً واحداً 100%', descEn: 'Complete one goal 100%',
    color: '#c9a84c', check: s => (s.goals || []).some(g => g.progress >= 100),
  },
  {
    id: 'beliefs_3', emoji: '💡', nameAr: 'محطم القيود', nameEn: 'Belief Breaker',
    descAr: 'أضف 3 معتقدات محدودة وحولها', descEn: 'Add 3 limiting beliefs',
    color: '#e74c3c', check: s => (s.limitingBeliefs || []).length >= 3,
  },
  {
    id: 'wheel_done', emoji: '⚙️', nameAr: 'عجلة الحياة', nameEn: 'Wheel of Life',
    descAr: 'أكمل تقييم عجلة الحياة', descEn: 'Complete wheel of life assessment',
    color: '#1abc9c', check: s => Object.values(s.wheelScores || {}).some(v => v !== 5),
  },
  {
    id: 'lifebook_start', emoji: '📖', nameAr: 'بداية الكتاب', nameEn: 'Book Started',
    descAr: 'ابدأ كتابك الحياتي', descEn: 'Start your Lifebook',
    color: '#8e44ad', check: s => Object.keys(s.lifebook || {}).length >= 1,
  },
  {
    id: 'lifebook_done', emoji: '📚', nameAr: 'الكتاب المكتمل', nameEn: 'Book Complete',
    descAr: 'أكمل الـ 12 فئة في Lifebook', descEn: 'Complete all 12 Lifebook categories',
    color: '#8e44ad', check: s => Object.keys(s.lifebook || {}).length >= 12,
  },
  {
    id: 'gratitude_7', emoji: '🙏', nameAr: 'أسبوع الامتنان', nameEn: 'Gratitude Week',
    descAr: '7 أيام من الامتنان', descEn: '7 days of gratitude',
    color: '#27ae60', check: s => Object.keys(s.gratitude || {}).length >= 7,
  },
  {
    id: 'habits_streak', emoji: '✅', nameAr: 'عادات راسخة', nameEn: 'Habit Builder',
    descAr: 'أكمل 5 عادات في يوم واحد', descEn: 'Complete 5 habits in one day',
    color: '#16a085',
    check: s => {
      const log = (s.habitTracker || {}).log || {}
      return Object.values(log).some(ids => ids.length >= 5)
    },
  },
  {
    id: 'reading_1', emoji: '📖', nameAr: 'القارئ', nameEn: 'Reader',
    descAr: 'أكمل قراءة كتاب', descEn: 'Complete reading one book',
    color: '#3498db',
    check: s => ((s.readingLog || {}).books || []).filter(b => b.status === 'done').length >= 1,
  },
  {
    id: 'reading_12', emoji: '🎓', nameAr: 'المثقف', nameEn: 'Scholar',
    descAr: 'اقرأ 12 كتاباً', descEn: 'Read 12 books',
    color: '#2980b9',
    check: s => ((s.readingLog || {}).books || []).filter(b => b.status === 'done').length >= 12,
  },
  {
    id: 'vision_board', emoji: '🔭', nameAr: 'الحالم الواقعي', nameEn: 'Visionary',
    descAr: 'أنشئ لوحة رؤيتك', descEn: 'Create your vision board',
    color: '#e91e8c', check: s => ((s.visionBoard || {}).cards || []).length >= 3,
  },
  {
    id: 'energy_complete', emoji: '⚡', nameAr: 'محارب الطاقة', nameEn: 'Energy Warrior',
    descAr: 'أكمل تحدي الـ 10 أيام', descEn: 'Complete the 10-day challenge',
    color: '#e67e22', check: s => (s.challengeDay || 0) >= 10,
  },
  {
    id: 'evening_done', emoji: '🌙', nameAr: 'ختام اليوم', nameEn: 'Day Closer',
    descAr: 'أكمل روتينك المسائي', descEn: 'Complete evening ritual',
    color: '#95a5a6', check: s => s.eveningDone,
  },
  {
    id: 'sleep_7', emoji: '😴', nameAr: 'نوم صحي', nameEn: 'Healthy Sleep',
    descAr: 'سجّل نومك 7 أيام', descEn: 'Log sleep for 7 days',
    color: '#8e44ad', check: s => Object.keys(s.sleepLog || {}).length >= 7,
  },
  {
    id: 'perfect_day', emoji: '⭐', nameAr: 'اليوم المثالي', nameEn: 'Perfect Day',
    descAr: 'أكمل الصباح والمساء والعادات في يوم واحد', descEn: 'Complete morning, evening and habits in one day',
    color: '#f39c12', check: s => s.morningDone && s.eveningDone,
  },
]

/* ─── BADGE CARD COMPONENT ──────────────────────────────────────────── */
function BadgeCard({ achievement, isUnlocked, isNew, unlockedAt, t, isAr }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="card relative cursor-pointer select-none"
      style={{
        borderTop: `3px solid ${isUnlocked ? achievement.color : '#333'}`,
        filter: isUnlocked ? 'none' : 'grayscale(0.9)',
        opacity: isUnlocked ? 1 : 0.55,
        boxShadow: isUnlocked ? `0 0 14px ${achievement.color}44` : 'none',
        transition: 'all 0.25s',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* NEW Banner */}
      {isNew && isUnlocked && (
        <div
          className="absolute top-0 right-0 text-xs font-bold px-2 py-0.5 rounded-bl-lg"
          style={{ background: achievement.color, color: '#000', zIndex: 2 }}
        >
          NEW!
        </div>
      )}

      <div className="p-3 text-center">
        <div
          className="text-3xl mb-2 mx-auto flex items-center justify-center rounded-full"
          style={{
            width: 54,
            height: 54,
            background: isUnlocked ? `${achievement.color}22` : '#1a1a1a',
            border: `2px solid ${isUnlocked ? achievement.color : '#333'}`,
          }}
        >
          {achievement.emoji}
        </div>
        <div className="font-bold text-sm text-white leading-tight">
          {isAr ? achievement.nameAr : achievement.nameEn}
        </div>
        {expanded && (
          <div className="mt-2 text-xs leading-snug" style={{ color: '#aaa' }}>
            {isAr ? achievement.descAr : achievement.descEn}
            {isUnlocked && unlockedAt && (
              <div className="mt-1" style={{ color: achievement.color }}>
                {t('فُتح في', 'Unlocked')} {unlockedAt}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────────────────────── */
export default function Achievements() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const achievementsState = state.achievements || { unlocked: [], seen: [] }
  const unlocked = achievementsState.unlocked || []   // [{ id, date }]
  const seen = achievementsState.seen || []            // [id]

  const t = (ar, en) => isAr ? ar : en

  // #12 — On mount: evaluate achievements, unlock new ones, show toast celebrations
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const currentUnlockedIds = new Set(unlocked.map(u => u.id))
    const newlyUnlocked = []

    ACHIEVEMENTS.forEach(a => {
      if (!currentUnlockedIds.has(a.id) && a.check(state)) {
        newlyUnlocked.push({ id: a.id, date: today })
      }
    })

    if (newlyUnlocked.length > 0) {
      const updatedUnlocked = [...unlocked, ...newlyUnlocked]
      update('achievements', {
        unlocked: updatedUnlocked,
        seen,
      })

      // #12 — Show celebration toasts for each new achievement
      newlyUnlocked.forEach((nu, i) => {
        const ach = ACHIEVEMENTS.find(a => a.id === nu.id)
        if (ach) {
          setTimeout(() => {
            showToast(
              `${ach.emoji} ${isAr ? ach.nameAr : ach.nameEn} — ${isAr ? 'إنجاز جديد!' : 'New Achievement!'}`,
              'gold',
              4000
            )
          }, i * 1200)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mark newly unlocked as seen on unmount / next visit
  useEffect(() => {
    return () => {
      const allUnlockedIds = (state.achievements?.unlocked || []).map(u => u.id)
      update('achievements', {
        unlocked: state.achievements?.unlocked || [],
        seen: allUnlockedIds,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unlockedIds = new Set(unlocked.map(u => u.id))
  const seenIds = new Set(seen)
  const unlockedList = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id))
  const lockedList = ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id))
  const newCount = unlockedList.filter(a => !seenIds.has(a.id)).length

  const totalCount = ACHIEVEMENTS.length
  const unlockedCount = unlockedList.length
  const progressPct = Math.round((unlockedCount / totalCount) * 100)

  return (
    <Layout
      title={t('الإنجازات والشارات', 'Achievements & Badges')}
      subtitle={t('كل إنجاز هو دليل على تحولك', 'Every achievement proves your transformation')}
    >
      {/* Progress Summary */}
      <div className="card mb-4 p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-bold text-lg" style={{ color: '#c9a84c' }}>
              {unlockedCount}
            </span>
            <span className="text-sm ml-1" style={{ color: '#888' }}>/ {totalCount}</span>
          </div>
          <div className="text-sm" style={{ color: '#888' }}>
            {progressPct}% {t('مكتمل', 'complete')}
          </div>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPct}%`, transition: 'width 0.5s ease' }}
          />
        </div>
        {newCount > 0 && (
          <div
            className="mt-3 text-center text-sm font-bold rounded py-2"
            style={{ background: '#c9a84c22', color: '#c9a84c' }}
          >
            🎉 {newCount} {t('إنجاز جديد!', 'new achievement!')}
          </div>
        )}
      </div>

      {/* Unlocked Section */}
      {unlockedList.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#c9a84c' }}>
            <span>🏆</span>
            <span>{t('مفتوحة', 'Unlocked')} ({unlockedList.length})</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {unlockedList.map(a => {
              const entry = unlocked.find(u => u.id === a.id)
              return (
                <BadgeCard
                  key={a.id}
                  achievement={a}
                  isUnlocked
                  isNew={!seenIds.has(a.id)}
                  unlockedAt={entry?.date}
                  t={t}
                  isAr={isAr}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Locked Section */}
      {lockedList.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#555' }}>
            <span>🔒</span>
            <span>{t('مقفلة', 'Locked')} ({lockedList.length})</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {lockedList.map(a => (
              <BadgeCard
                key={a.id}
                achievement={a}
                isUnlocked={false}
                isNew={false}
                unlockedAt={null}
                t={t}
                isAr={isAr}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {unlockedList.length === 0 && lockedList.length === ACHIEVEMENTS.length && (
        <div className="text-center py-8" style={{ color: '#555' }}>
          <div className="text-5xl mb-3">🏅</div>
          <p className="text-sm">
            {t('أكمل مهامك لتفتح أول إنجازاتك!', 'Complete tasks to unlock your first achievement!')}
          </p>
        </div>
      )}
    </Layout>
  )
}
