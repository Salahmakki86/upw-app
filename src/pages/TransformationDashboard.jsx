import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

// ─── Tony Quotes (rotating by day of year) ───────────────────────────────────
const QUOTES = [
  {
    ar: 'لا تقل "لا أستطيع". قل "كيف أستطيع؟"',
    en: 'Don\'t say "I can\'t." Say "How can I?"',
  },
  {
    ar: 'التغيير يبدأ بقرار واحد تتخذه الآن.',
    en: 'Change begins with a single decision you make right now.',
  },
  {
    ar: 'حياتك تتشكّل بمعاييرك، لا بظروفك.',
    en: 'Your life is shaped by your standards, not your circumstances.',
  },
  {
    ar: 'الناس الناجحون يطرحون أسئلة أفضل، وبالتالي يحصلون على إجابات أفضل.',
    en: 'Successful people ask better questions and as a result get better answers.',
  },
  {
    ar: 'إذا كنت تعمل على أهداف تثيرك، لن تشعر بالتعب.',
    en: 'If you\'re working on goals that excite you, you won\'t feel tired.',
  },
  {
    ar: 'المستوى الذي تعيش فيه يتحدد بحجم المشاكل التي تستطيع تحملها.',
    en: 'The level you live at is determined by the size of problems you can handle.',
  },
  {
    ar: 'الأمر لا يتعلق بمواردك، بل بمدى قدرتك على الابتكار.',
    en: 'It\'s not about resources, it\'s about your resourcefulness.',
  },
]

// ─── Pillar definitions ───────────────────────────────────────────────────────
const getPillars = (state, isAr) => {
  const wheelScores = state.wheelScores || {}
  const wheelAvg = Object.values(wheelScores).length > 0
    ? Object.values(wheelScores).reduce((a, b) => a + Number(b), 0) / Object.values(wheelScores).length
    : 0

  const goals = state.goals || []
  const lb = state.limitingBeliefs || []
  const eb = state.empoweringBeliefs || []
  const beliefsWorked = lb.filter(b => b.reframe || b.answered).length + eb.length
  const maxBeliefs = 10
  const beliefsScore = Math.min(100, Math.round((beliefsWorked / maxBeliefs) * 100))

  const ffLevel = state.financialFreedom?.currentLevel || 1
  const ffScore = Math.round(((ffLevel - 1) / 6) * 100)

  const relationships = state.relationships?.ratings || {}
  const relAvg = Object.values(relationships).length > 0
    ? Object.values(relationships).reduce((a, b) => a + Number(b), 0) / Object.values(relationships).length
    : 5
  const relScore = Math.round((relAvg / 10) * 100)

  const habits = state.habitTracker?.list || []
  const today = new Date().toISOString().split('T')[0]
  const habitLog = state.habitTracker?.log || {}
  const todayHabits = habitLog[today] || []
  const habitScore = habits.length > 0 ? Math.round((todayHabits.length / habits.length) * 100) : 0

  const purposeItems = [
    state.dwd?.mission?.trim(),
    state.dwd?.legacy?.trim(),
    state.dwd?.vision?.trim(),
    goals.length > 0 ? 'goals' : null,
  ].filter(Boolean).length
  const purposeScore = Math.round((purposeItems / 4) * 100)

  return [
    {
      icon: '🧠',
      label: isAr ? 'عقلية' : 'Mindset',
      score: beliefsScore,
      hint: isAr ? 'معتقدات محوّلة' : 'Transformed beliefs',
    },
    {
      icon: '❤️',
      label: isAr ? 'علاقات' : 'Relationships',
      score: relScore,
      hint: isAr ? 'متوسط العلاقات' : 'Relationship avg',
    },
    {
      icon: '💰',
      label: isAr ? 'مالي' : 'Financial',
      score: ffScore,
      hint: isAr ? 'مستوى الحرية' : 'Freedom level',
    },
    {
      icon: '🏥',
      label: isAr ? 'صحة' : 'Health',
      score: Math.min(100, Math.round((wheelScores.body || 5) * 10)),
      hint: isAr ? 'عجلة الحياة' : 'Wheel of Life',
    },
    {
      icon: '🎯',
      label: isAr ? 'هدف' : 'Purpose',
      score: purposeScore,
      hint: isAr ? 'رسالة وأهداف' : 'Mission & Goals',
    },
    {
      icon: '🌱',
      label: isAr ? 'نمو' : 'Growth',
      score: Math.min(100, Math.round((wheelAvg / 10) * 100)),
      hint: isAr ? 'متوسط العجلة' : 'Wheel avg',
    },
  ]
}

// ─── Score calculation ────────────────────────────────────────────────────────
function calcScore(state) {
  const today = new Date().toISOString().split('T')[0]
  let score = 0

  if (state.morningDone) score += 10
  if (state.eveningDone) score += 10
  if ((state.streak || 0) >= 7) score += 15
  if ((state.goals || []).length >= 3) score += 10

  const lb = state.limitingBeliefs || []
  const eb = state.empoweringBeliefs || []
  if (lb.filter(b => b.reframe || b.answered).length + eb.length >= 2) score += 10

  const wheelScores = state.wheelScores || {}
  const vals = Object.values(wheelScores)
  const avg = vals.length > 0 ? vals.reduce((a, b) => a + Number(b), 0) / vals.length : 0
  if (avg >= 7) score += 15

  if ((state.financialFreedom?.currentLevel || 1) >= 3) score += 10

  const gratToday = (state.gratitude || {})[today] || []
  if (gratToday.filter(v => v && v.trim()).length >= 3) score += 10

  const stateLog = state.stateLog || []
  if (stateLog.some(s => s.date === today)) score += 10

  return Math.min(100, score)
}

// ─── Milestones ───────────────────────────────────────────────────────────────
function getMilestones(state, isAr) {
  const goals = state.goals || []
  const lb = state.limitingBeliefs || []
  const eb = state.empoweringBeliefs || []
  return [
    {
      label: isAr ? 'اليوم 1' : 'Day 1',
      done: (state.streak || 0) >= 1,
    },
    {
      label: isAr ? 'أول هدف' : 'First Goal',
      done: goals.length >= 1,
    },
    {
      label: isAr ? '3 أيام' : '3-Day Streak',
      done: (state.streak || 0) >= 3,
    },
    {
      label: isAr ? '7 أيام 🔥' : '7-Day Streak 🔥',
      done: (state.streak || 0) >= 7,
    },
    {
      label: isAr ? '3 أهداف' : '3 Goals',
      done: goals.length >= 3,
    },
    {
      label: isAr ? 'عمل المعتقدات' : 'Beliefs Worked',
      done: lb.filter(b => b.reframe || b.answered).length + eb.length >= 2,
    },
    {
      label: isAr ? '30 يوم 💎' : '30-Day Streak 💎',
      done: (state.streak || 0) >= 30,
    },
  ]
}

// ─── Next Focus suggestion ────────────────────────────────────────────────────
function getNextFocus(pillars, state, isAr) {
  const lowest = [...pillars].sort((a, b) => a.score - b.score)[0]
  const suggestions = {
    ar: {
      '🧠': 'اعمل على معتقد محدود اليوم في صفحة المعتقدات.',
      '❤️': 'تواصل مع شخص تحبه اليوم وأخبره كم هو مهم.',
      '💰': 'راجع أهدافك المالية وارتقِ بمستوى حريتك المالية.',
      '🏥': 'أضف عادة صحية واحدة لقائمتك اليوم.',
      '🎯': 'اكتب رسالتك في الحياة أو أضف هدفًا جديدًا.',
      '🌱': 'سجّل تقييم عجلة الحياة وحدّد أضعف منطقة.',
    },
    en: {
      '🧠': 'Work on one limiting belief today in the Beliefs page.',
      '❤️': 'Reach out to someone you love and tell them they matter.',
      '💰': 'Review your financial goals and level up your freedom.',
      '🏥': 'Add one healthy habit to your tracker today.',
      '🎯': 'Write your life mission or add a new compelling goal.',
      '🌱': 'Log your Wheel of Life and identify your weakest area.',
    },
  }
  return suggestions[isAr ? 'ar' : 'en'][lowest.icon] || (isAr ? 'استمر في عملك الرائع!' : 'Keep up the amazing work!')
}

// ─── Calendar Heatmap ─────────────────────────────────────────────────────────
function buildHeatmap(state) {
  const today = new Date()
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    let count = 0

    const gratToday = (state.gratitude || {})[key] || []
    if (gratToday.filter(v => v && v.trim()).length >= 3) count++

    const stateLog = state.stateLog || []
    if (stateLog.some(s => s.date === key)) count++

    const wins = (state.dailyWins || {})[key] || []
    if (wins.length > 0) count++

    const habitLog = (state.habitTracker?.log || {})[key] || []
    if (habitLog.length > 0) count++

    days.push({ key, count, day: d.getDate(), month: d.getMonth() })
  }
  return days
}

function heatColor(count) {
  if (count === 0) return '#1a1a1a'
  if (count === 1) return 'rgba(201,168,76,0.25)'
  if (count === 2) return 'rgba(201,168,76,0.5)'
  return '#c9a84c'
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TransformationDashboard() {
  const { state } = useApp()
  const { lang, dir } = useLang()
  const isAr = lang === 'ar'

  const today = new Date().toISOString().split('T')[0]
  const score = useMemo(() => calcScore(state), [state])
  const pillars = useMemo(() => getPillars(state, isAr), [state, isAr])
  const milestones = useMemo(() => getMilestones(state, isAr), [state, isAr])
  const heatmap = useMemo(() => buildHeatmap(state), [state])
  const nextFocus = useMemo(() => getNextFocus(pillars, state, isAr), [pillars, state, isAr])

  // Quote of the day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const quote = QUOTES[dayOfYear % QUOTES.length]

  // This week's wins
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekWins = Object.entries(state.dailyWins || {}).reduce((acc, [date, wins]) => {
    const d = new Date(date)
    return d >= weekStart ? acc + (wins || []).length : acc
  }, 0)

  // Conic gradient for score circle
  const conicBg = `conic-gradient(#c9a84c ${score * 3.6}deg, #1e1e1e ${score * 3.6}deg)`

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6" dir={dir}>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#c9a84c' }}>
            {isAr ? 'لوحة التحول' : 'Transformation Dashboard'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isAr ? 'نظرة شاملة على رحلتك مع توني روبينز' : 'Your complete Tony Robbins journey overview'}
          </p>
        </div>

        {/* ── Transformation Score ── */}
        <div
          className="p-6 rounded-2xl mb-5 flex items-center gap-6"
          style={{ background: '#111', border: '1px solid #1e1e1e' }}
        >
          {/* Circle */}
          <div className="relative shrink-0" style={{ width: 96, height: 96 }}>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: conicBg }}
            >
              <div
                className="w-20 h-20 rounded-full flex flex-col items-center justify-center"
                style={{ background: '#111' }}
              >
                <span className="text-2xl font-bold" style={{ color: '#c9a84c' }}>{score}</span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="font-bold text-white text-lg mb-1">
              {isAr ? 'نقاط التحول' : 'Transformation Score'}
            </h2>
            <div className="space-y-1">
              {[
                { label: isAr ? '🌅 صباح' : '🌅 Morning', done: state.morningDone, pts: 10 },
                { label: isAr ? '🌙 مساء' : '🌙 Evening', done: state.eveningDone, pts: 10 },
                { label: isAr ? '🔥 سلسلة 7 أيام' : '🔥 7-Day Streak', done: (state.streak || 0) >= 7, pts: 15 },
                { label: isAr ? '🎯 3 أهداف' : '🎯 3 Goals', done: (state.goals || []).length >= 3, pts: 10 },
                { label: isAr ? '🙏 امتنان اليوم' : '🙏 Gratitude Today', done: ((state.gratitude || {})[today] || []).filter(v => v?.trim()).length >= 3, pts: 10 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span style={{ color: item.done ? '#4ade80' : '#555' }}>
                    {item.done ? '✓' : '○'}
                  </span>
                  <span style={{ color: item.done ? '#d1d5db' : '#555' }}>{item.label}</span>
                  <span className="ml-auto" style={{ color: item.done ? '#c9a84c' : '#444' }}>
                    +{item.pts}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Pillar Progress ── */}
        <div className="mb-5">
          <h2 className="font-semibold text-white mb-3">
            {isAr ? '🏛️ ركائز التحول' : '🏛️ Transformation Pillars'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className="p-3 rounded-xl"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{pillar.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{pillar.label}</p>
                    <p className="text-xs text-gray-600">{pillar.hint}</p>
                  </div>
                  <span className="ml-auto text-sm font-bold" style={{ color: '#c9a84c' }}>
                    {pillar.score}%
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Stats Row ── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div
            className="p-3 rounded-xl text-center"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}
          >
            <p className="text-2xl font-bold" style={{ color: '#c9a84c' }}>{state.streak || 0}</p>
            <p className="text-xs text-gray-500 mt-1">{isAr ? 'سلسلة الأيام' : 'Day Streak'}</p>
          </div>
          <div
            className="p-3 rounded-xl text-center"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}
          >
            <p className="text-2xl font-bold" style={{ color: '#c9a84c' }}>{weekWins}</p>
            <p className="text-xs text-gray-500 mt-1">{isAr ? 'انتصارات هذا الأسبوع' : 'Wins This Week'}</p>
          </div>
          <div
            className="p-3 rounded-xl text-center"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}
          >
            <p className="text-2xl font-bold" style={{ color: '#c9a84c' }}>{(state.goals || []).length}</p>
            <p className="text-xs text-gray-500 mt-1">{isAr ? 'الأهداف' : 'Goals'}</p>
          </div>
        </div>

        {/* ── Next Focus ── */}
        <div
          className="p-4 rounded-xl mb-5 flex gap-3"
          style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)' }}
        >
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#c9a84c' }}>
              {isAr ? 'تركيزك التالي' : 'Your Next Focus'}
            </p>
            <p className="text-sm text-gray-300">{nextFocus}</p>
          </div>
        </div>

        {/* ── Quote of the Day ── */}
        <div
          className="p-4 rounded-xl mb-5"
          style={{ background: '#111', border: '1px solid #1e1e1e' }}
        >
          <p className="text-xs text-gray-500 mb-2">
            {isAr ? '💬 اقتباس اليوم' : '💬 Quote of the Day'}
          </p>
          <p className="text-sm italic leading-relaxed" style={{ color: '#c9a84c' }}>
            "{isAr ? quote.ar : quote.en}"
          </p>
          <p className="text-xs text-gray-600 mt-2">— Tony Robbins</p>
        </div>

        {/* ── Journey Timeline ── */}
        <div className="mb-5">
          <h2 className="font-semibold text-white mb-3">
            {isAr ? '🗺️ خريطة الرحلة' : '🗺️ Journey Timeline'}
          </h2>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
              {milestones.map((m, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl shrink-0"
                  style={{
                    background: m.done ? 'rgba(74,222,128,0.08)' : '#111',
                    border: m.done ? '1px solid rgba(74,222,128,0.3)' : '1px solid #1e1e1e',
                    minWidth: 72,
                  }}
                >
                  <span className="text-lg">{m.done ? '✅' : '⬜'}</span>
                  <span
                    className="text-xs text-center font-medium"
                    style={{ color: m.done ? '#4ade80' : '#555' }}
                  >
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 30-Day Heatmap ── */}
        <div className="mb-5">
          <h2 className="font-semibold text-white mb-3">
            {isAr ? '📅 نشاط 30 يوم' : '📅 30-Day Activity'}
          </h2>
          <div
            className="p-4 rounded-xl"
            style={{ background: '#111', border: '1px solid #1e1e1e' }}
          >
            <div className="flex flex-wrap gap-1.5">
              {heatmap.map((day, i) => (
                <div
                  key={i}
                  title={`${day.key}: ${day.count} activities`}
                  className="w-7 h-7 rounded flex items-center justify-center text-xs"
                  style={{ background: heatColor(day.count), color: day.count >= 2 ? '#090909' : '#555' }}
                >
                  {day.day}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
              <span>{isAr ? 'أقل' : 'Less'}</span>
              {[0, 1, 2, 3].map(n => (
                <div
                  key={n}
                  className="w-4 h-4 rounded"
                  style={{ background: heatColor(n) }}
                />
              ))}
              <span>{isAr ? 'أكثر' : 'More'}</span>
            </div>
          </div>
        </div>

        {/* ── State Log Summary ── */}
        {(state.stateLog || []).length > 0 && (
          <div
            className="p-4 rounded-xl"
            style={{ background: '#111', border: '1px solid #1e1e1e' }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: '#c9a84c' }}>
              {isAr ? '📊 سجل الحالة العاطفية' : '📊 Emotional State Log'}
            </p>
            {(() => {
              const log = state.stateLog || []
              const beautiful = log.filter(s => s.state === 'beautiful').length
              const suffering = log.filter(s => s.state === 'suffering').length
              const total = log.length
              const beauPct = total > 0 ? Math.round((beautiful / total) * 100) : 0
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-400">😊</span>
                    <span className="text-gray-400 flex-1">{isAr ? 'رائع' : 'Beautiful'}</span>
                    <span style={{ color: '#4ade80' }}>{beautiful} ({beauPct}%)</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${beauPct}%` }} />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span>😔</span>
                    <span className="text-gray-400 flex-1">{isAr ? 'يعاني' : 'Suffering'}</span>
                    <span style={{ color: '#f87171' }}>{suffering}</span>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

      </div>
    </Layout>
  )
}
