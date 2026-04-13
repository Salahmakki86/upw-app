/**
 * GuidedJourney — Batch 3 Fix #15
 * Clear 30-day path with daily focus topics.
 * Replaces "Start Here" which was 3 steps then gone.
 * Shows today's focus area and progress through the 30-day journey.
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

const JOURNEY_DAYS = [
  // Week 1: Foundation
  { day: 1, emoji: '☀️', pathAr: 'الصباح', pathEn: 'Morning', route: '/morning', focusAr: 'ابدأ طقسك الصباحي الأول', focusEn: 'Start your first morning ritual' },
  { day: 2, emoji: '😊', pathAr: 'الحالة', pathEn: 'State', route: '/state', focusAr: 'تعلّم مراقبة حالتك', focusEn: 'Learn to observe your state' },
  { day: 3, emoji: '🙏', pathAr: 'الامتنان', pathEn: 'Gratitude', route: '/gratitude', focusAr: 'اكتب 3 أشياء تشكرها', focusEn: 'Write 3 things you\'re grateful for' },
  { day: 4, emoji: '✅', pathAr: 'العادات', pathEn: 'Habits', route: '/habits', focusAr: 'حدد عاداتك الأساسية', focusEn: 'Define your core habits' },
  { day: 5, emoji: '🌙', pathAr: 'المساء', pathEn: 'Evening', route: '/evening', focusAr: 'أكمل أول طقس مسائي', focusEn: 'Complete your first evening ritual' },
  { day: 6, emoji: '😴', pathAr: 'النوم', pathEn: 'Sleep', route: '/sleep', focusAr: 'سجّل نومك وراقب النمط', focusEn: 'Log sleep and observe patterns' },
  { day: 7, emoji: '🔥', pathAr: 'أسبوع!', pathEn: 'Week 1!', route: '/today', focusAr: 'أكمل يوماً مثالياً 7/7', focusEn: 'Complete a perfect 7/7 day' },
  // Week 2: Goals & Beliefs
  { day: 8, emoji: '🎯', pathAr: 'الأهداف', pathEn: 'Goals', route: '/goals', focusAr: 'حدد هدفك الأول بنظام RPM', focusEn: 'Set your first RPM goal' },
  { day: 9, emoji: '🧭', pathAr: 'عجلة الحياة', pathEn: 'Wheel', route: '/wheel', focusAr: 'قيّم حياتك في 7 مجالات', focusEn: 'Rate your life in 7 areas' },
  { day: 10, emoji: '🪞', pathAr: 'المعتقدات', pathEn: 'Beliefs', route: '/beliefs', focusAr: 'اكتشف معتقداتك المقيدة', focusEn: 'Discover your limiting beliefs' },
  { day: 11, emoji: '🗣️', pathAr: 'التكرارات', pathEn: 'Incantations', route: '/incantations', focusAr: 'اكتب تكراراتك القوية', focusEn: 'Write your power incantations' },
  { day: 12, emoji: '🏆', pathAr: 'الانتصارات', pathEn: 'Wins', route: '/wins', focusAr: 'سجّل 3 انتصارات اليوم', focusEn: 'Log 3 wins today' },
  { day: 13, emoji: '📊', pathAr: 'النبض', pathEn: 'Pulse', route: '/weekly-pulse', focusAr: 'راجع أسبوعك الأول', focusEn: 'Review your first week' },
  { day: 14, emoji: '⚡', pathAr: 'أسبوعان!', pathEn: '2 Weeks!', route: '/today', focusAr: 'أنت في منطقة التحول الآن!', focusEn: 'You\'re in the transformation zone!' },
  // Week 3: Deep Work
  { day: 15, emoji: '🔍', pathAr: 'الرؤى', pathEn: 'Insights', route: '/insights', focusAr: 'اكتشف أنماطك الخفية', focusEn: 'Discover your hidden patterns' },
  { day: 16, emoji: '💪', pathAr: 'التحدي', pathEn: 'Challenge', route: '/challenge', focusAr: 'ابدأ تحدي الطاقة', focusEn: 'Start the energy challenge' },
  { day: 17, emoji: '🎭', pathAr: 'الحالة', pathEn: 'State Mgmt', route: '/state', focusAr: 'جرّب أدوات تغيير الحالة', focusEn: 'Try state change tools' },
  { day: 18, emoji: '🧠', pathAr: 'القيم', pathEn: 'Values', route: '/values', focusAr: 'حدد قيمك الأساسية', focusEn: 'Define your core values' },
  { day: 19, emoji: '📝', pathAr: 'الالتزام', pathEn: 'Commitment', route: '/commitment', focusAr: 'اكتب عقد التزامك', focusEn: 'Write your commitment contract' },
  { day: 20, emoji: '🌟', pathAr: 'الرؤية', pathEn: 'Vision', route: '/vision', focusAr: 'صمم لوحة رؤيتك', focusEn: 'Design your vision board' },
  { day: 21, emoji: '💎', pathAr: '21 يوم!', pathEn: '21 Days!', route: '/today', focusAr: 'العادة تشكّلت — أنت شخص جديد!', focusEn: 'Habit formed — you\'re a new person!' },
  // Week 4: Mastery
  { day: 22, emoji: '🏔️', pathAr: 'القدر', pathEn: 'Destiny', route: '/destiny', focusAr: 'صمم مستقبلك المقنع', focusEn: 'Design your compelling future' },
  { day: 23, emoji: '💭', pathAr: 'القصة', pathEn: 'Life Story', route: '/life-story', focusAr: 'أعد كتابة قصة حياتك', focusEn: 'Rewrite your life story' },
  { day: 24, emoji: '⚖️', pathAr: 'القرارات', pathEn: 'Decisions', route: '/decisions', focusAr: 'القرارات الثلاثة التي تشكل حياتك', focusEn: '3 decisions that shape your life' },
  { day: 25, emoji: '❤️', pathAr: 'العلاقات', pathEn: 'Relations', route: '/relationships', focusAr: 'قيّم وطوّر علاقاتك', focusEn: 'Rate and improve your relationships' },
  { day: 26, emoji: '📖', pathAr: 'القراءة', pathEn: 'Reading', route: '/reading', focusAr: 'اقرأ 10 صفحات اليوم', focusEn: 'Read 10 pages today' },
  { day: 27, emoji: '🔥', pathAr: 'السبرنت', pathEn: 'Sprint', route: '/sprint90', focusAr: 'خطط سبرنت 90 يوم', focusEn: 'Plan a 90-day sprint' },
  { day: 28, emoji: '📊', pathAr: 'الإحصائيات', pathEn: 'Stats', route: '/stats', focusAr: 'راجع إحصائياتك الكاملة', focusEn: 'Review your full statistics' },
  { day: 29, emoji: '✨', pathAr: 'التحول', pathEn: 'Transform', route: '/transformation', focusAr: 'قيّم تحولك الشامل', focusEn: 'Assess your full transformation' },
  { day: 30, emoji: '👑', pathAr: 'الإتقان!', pathEn: 'Mastery!', route: '/today', focusAr: '30 يوم! أنت محارب حقيقي الآن!', focusEn: '30 days! You\'re a true warrior now!' },
]

export default function GuidedJourney() {
  const { state } = useApp()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const journeyDay = useMemo(() => {
    const count = (state.morningLog || []).length
    return Math.min(count + 1, 30) // Day 1-30 based on completions
  }, [state.morningLog])

  // Don't show after 30 days or before onboarding
  if (journeyDay > 30 || !state.onboardingDone) return null

  const todayFocus = JOURNEY_DAYS[journeyDay - 1] || JOURNEY_DAYS[0]
  const progress = Math.round((journeyDay / 30) * 100)

  // Show mini dots for last 7 days
  const recentDays = JOURNEY_DAYS.slice(Math.max(0, journeyDay - 4), journeyDay + 3)

  return (
    <div style={{
      background: '#0e0e0e',
      border: '1px solid rgba(201,168,76,0.2)',
      borderRadius: 20, padding: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c' }}>
            🗺️ {isAr ? 'رحلة الـ 30 يوم' : '30-Day Journey'}
          </p>
          <p style={{ fontSize: 10, color: '#555' }}>
            {isAr ? `اليوم ${journeyDay} من 30` : `Day ${journeyDay} of 30`}
          </p>
        </div>
        <div style={{
          background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 10, padding: '4px 10px',
        }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c' }}>{progress}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 2, background: '#1e1e1e', marginBottom: 12 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #c9a84c, #e8c96a)',
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Day dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
        {recentDays.map(d => {
          const isCurrent = d.day === journeyDay
          const isPast = d.day < journeyDay
          return (
            <div key={d.day} style={{
              width: isCurrent ? 28 : 22, height: isCurrent ? 28 : 22,
              borderRadius: '50%',
              background: isPast ? 'rgba(46,204,113,0.15)' : isCurrent ? 'rgba(201,168,76,0.15)' : '#1a1a1a',
              border: `2px solid ${isPast ? '#2ecc71' : isCurrent ? '#c9a84c' : '#2a2a2a'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isCurrent ? 14 : 11,
              transition: 'all 0.3s',
            }}>
              {isPast ? <span style={{ color: '#2ecc71', fontSize: 10 }}>✓</span> : d.emoji}
            </div>
          )
        })}
      </div>

      {/* Today's focus */}
      <button
        onClick={() => navigate(todayFocus.route)}
        className="w-full transition-all active:scale-[0.98]"
        style={{
          background: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: 14, padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer',
          textAlign: isAr ? 'right' : 'left',
        }}>
        <span style={{ fontSize: 22 }}>{todayFocus.emoji}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>
            {isAr ? todayFocus.focusAr : todayFocus.focusEn}
          </p>
          <p style={{ fontSize: 10, color: '#c9a84c', marginTop: 2 }}>
            {isAr ? `يوم ${journeyDay}: ${todayFocus.pathAr}` : `Day ${journeyDay}: ${todayFocus.pathEn}`}
          </p>
        </div>
        <span style={{ color: '#c9a84c', fontSize: 14 }}>{isAr ? '←' : '→'}</span>
      </button>
    </div>
  )
}
