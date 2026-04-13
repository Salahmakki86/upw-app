/**
 * Journey Timeline — Batch 3
 * Visual timeline of user's transformation milestones
 */
import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

function extractMilestones(state, isAr) {
  const milestones = []
  const today = new Date().toISOString().split('T')[0]

  // 1. First day using the app (from stateLog or morningLog)
  const allDates = [
    ...(state.stateLog || []).map(s => s.date),
    ...(state.morningLog || []),
    ...Object.keys(state.sleepLog || {}),
    ...Object.keys(state.gratitude || {}),
  ].filter(Boolean).sort()

  if (allDates.length > 0) {
    milestones.push({
      date: allDates[0],
      emoji: '🚀',
      titleAr: 'بداية الرحلة',
      titleEn: 'Journey Started',
      descAr: 'أول يوم استخدمت فيه المنصة',
      descEn: 'Your first day using the platform',
      color: '#c9a84c',
    })
  }

  // 2. First goal created
  const goals = state.goals || []
  const sortedGoals = [...goals].sort((a, b) => (a.id || 0) - (b.id || 0))
  if (sortedGoals.length > 0) {
    const firstGoal = sortedGoals[0]
    const goalDate = firstGoal.createdAt
      ? new Date(firstGoal.createdAt).toISOString().split('T')[0]
      : firstGoal.id ? new Date(firstGoal.id).toISOString().split('T')[0] : null
    if (goalDate) {
      milestones.push({
        date: goalDate,
        emoji: '🎯',
        titleAr: 'أول هدف',
        titleEn: 'First Goal Set',
        descAr: firstGoal.result?.slice(0, 40) || '',
        descEn: firstGoal.result?.slice(0, 40) || '',
        color: '#3498db',
      })
    }
  }

  // 3. Goals completed
  goals.filter(g => (g.progress || 0) >= 100).forEach(g => {
    const completedDate = g.updatedAt
      ? new Date(g.updatedAt).toISOString().split('T')[0]
      : null
    if (completedDate) {
      milestones.push({
        date: completedDate,
        emoji: '🏆',
        titleAr: 'هدف مُحقق!',
        titleEn: 'Goal Achieved!',
        descAr: g.result?.slice(0, 40) || '',
        descEn: g.result?.slice(0, 40) || '',
        color: '#2ecc71',
      })
    }
  })

  // 4. Dickens Process completions (beliefs transformed)
  const dickensLog = state.dickensLog || []
  dickensLog.forEach(session => {
    milestones.push({
      date: session.date || session.completedAt?.split('T')[0],
      emoji: '🔥',
      titleAr: 'معتقد تم تحويله',
      titleEn: 'Belief Transformed',
      descAr: session.newBelief?.slice(0, 40) || '',
      descEn: session.newBelief?.slice(0, 40) || '',
      color: '#e63946',
    })
  })

  // 5. Commitment signed
  if (state.commitment?.text && state.commitment?.signedAt) {
    milestones.push({
      date: new Date(state.commitment.signedAt).toISOString().split('T')[0],
      emoji: '✊',
      titleAr: 'التزام مُوقّع',
      titleEn: 'Commitment Signed',
      descAr: state.commitment.text?.slice(0, 40) || '',
      descEn: state.commitment.text?.slice(0, 40) || '',
      color: '#9b59b6',
    })
  }

  // 6. Streak milestones (7, 21, 30, 60, 90 days)
  const maxStreak = state.maxStreak || state.streak || 0
  const streakMilestones = [7, 21, 30, 60, 90].filter(s => maxStreak >= s)
  if (streakMilestones.length > 0) {
    const top = streakMilestones[streakMilestones.length - 1]
    milestones.push({
      date: today, // approximate
      emoji: '🔥',
      titleAr: `سلسلة ${top} يوم!`,
      titleEn: `${top}-Day Streak!`,
      descAr: `وصلت إلى ${top} يوم متواصل من الانضباط`,
      descEn: `Reached ${top} consecutive days of discipline`,
      color: '#e67e22',
    })
  }

  // 7. Wheel of Life assessments
  const wheelHistory = state.wheelHistory || []
  if (wheelHistory.length > 0) {
    milestones.push({
      date: wheelHistory[0].date || today,
      emoji: '⚙️',
      titleAr: 'تقييم عجلة الحياة',
      titleEn: 'Life Wheel Assessment',
      descAr: `${wheelHistory.length} تقييم`,
      descEn: `${wheelHistory.length} assessment(s)`,
      color: '#1abc9c',
    })
  }

  // 8. Identity Profile set
  if (state.identityProfile?.current && state.identityProfile?.lastUpdated) {
    milestones.push({
      date: state.identityProfile.lastUpdated,
      emoji: '🪞',
      titleAr: 'ملف الهوية',
      titleEn: 'Identity Profile Set',
      descAr: 'حددت من أنت ومن تريد أن تكون',
      descEn: 'Defined who you are and who you want to be',
      color: '#9370db',
    })
  }

  // Sort by date (newest first) and deduplicate
  return milestones
    .filter(m => m.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12) // max 12 milestones
}

function formatDate(dateStr, isAr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      day: 'numeric', month: 'short',
    })
  } catch {
    return dateStr
  }
}

function daysAgo(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  return Math.floor((now - d) / 86400000)
}

export default function JourneyTimeline() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const milestones = useMemo(() => extractMilestones(state, isAr), [state, isAr])

  if (milestones.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
        <p className="text-3xl mb-2">🗺️</p>
        <p className="text-sm text-gray-500">
          {isAr ? 'ابدأ رحلتك لتظهر خط زمنك هنا' : 'Start your journey to see your timeline here'}
        </p>
      </div>
    )
  }

  // Stats
  const totalDays = milestones.length > 0 ? daysAgo(milestones[milestones.length - 1].date) : 0

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-2xl p-4" style={{
        background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(26,188,156,0.06))',
        border: '1px solid rgba(201,168,76,0.25)',
      }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            <span className="text-sm font-black text-[#c9a84c]">
              {isAr ? 'خط الرحلة الزمني' : 'Journey Timeline'}
            </span>
          </div>
          <div className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
            {totalDays} {isAr ? 'يوم' : 'days'}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {isAr ? `${milestones.length} محطة في رحلة تحوّلك` : `${milestones.length} milestones in your transformation`}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative" style={{ paddingRight: isAr ? 0 : 20, paddingLeft: isAr ? 20 : 0 }}>
        {/* Vertical line */}
        <div className="absolute top-0 bottom-0"
          style={{
            width: 2,
            background: 'linear-gradient(to bottom, #c9a84c, #333)',
            [isAr ? 'right' : 'left']: 8,
          }}
        />

        <div className="space-y-3">
          {milestones.map((m, i) => {
            const ago = daysAgo(m.date)
            return (
              <div key={i} className="relative flex items-start gap-3"
                style={{ [isAr ? 'paddingRight' : 'paddingLeft']: 24 }}>
                {/* Dot */}
                <div className="absolute flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    background: m.color + '33',
                    border: `2px solid ${m.color}`,
                    [isAr ? 'right' : 'left']: 1,
                    top: 4,
                  }}
                />

                {/* Content */}
                <div className="flex-1 rounded-xl p-3 transition-all"
                  style={{ background: '#0e0e0e', border: `1px solid ${m.color}22` }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm">{m.emoji}</span>
                    <span className="text-xs font-bold text-white">
                      {isAr ? m.titleAr : m.titleEn}
                    </span>
                  </div>
                  {(m.descAr || m.descEn) && (
                    <p className="text-xs text-gray-500 mb-1">
                      {isAr ? m.descAr : m.descEn}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: m.color }}>
                      {formatDate(m.date, isAr)}
                    </span>
                    {ago > 0 && (
                      <span className="text-xs text-gray-600">
                        ({ago} {isAr ? 'يوم' : 'd'})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
