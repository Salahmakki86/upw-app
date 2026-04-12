import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'

const TABS = [
  { id: 'personal', ar: '🧘 شخصي', en: '🧘 Personal' },
  { id: 'business', ar: '💼 عمل', en: '💼 Business' },
]

const WHEEL_AREAS = {
  ar: [
    { key: 'body',          label: 'الجسم',    emoji: '💪', color: '#e74c3c' },
    { key: 'emotions',      label: 'العواطف',  emoji: '❤️', color: '#e91e8c' },
    { key: 'relationships', label: 'العلاقات', emoji: '👥', color: '#9b59b6' },
    { key: 'time',          label: 'الوقت',    emoji: '⏰', color: '#3498db' },
    { key: 'career',        label: 'المهنة',   emoji: '🚀', color: '#2ecc71' },
    { key: 'money',         label: 'المال',    emoji: '💰', color: '#f1c40f' },
    { key: 'contribution',  label: 'العطاء',   emoji: '🌟', color: '#c9a84c' },
  ],
  en: [
    { key: 'body',          label: 'Health',        emoji: '💪', color: '#e74c3c' },
    { key: 'emotions',      label: 'Emotions',      emoji: '❤️', color: '#e91e8c' },
    { key: 'relationships', label: 'Relationships', emoji: '👥', color: '#9b59b6' },
    { key: 'time',          label: 'Time',          emoji: '⏰', color: '#3498db' },
    { key: 'career',        label: 'Career',        emoji: '🚀', color: '#2ecc71' },
    { key: 'money',         label: 'Money',         emoji: '💰', color: '#f1c40f' },
    { key: 'contribution',  label: 'Giving',        emoji: '🌟', color: '#c9a84c' },
  ],
}

const DAY_NAMES = {
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

export default function WeeklyReview() {
  const { lang } = useLang()
  const { state, saveWeeklyReflection, update } = useApp()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const [activeTab, setActiveTab] = useState('personal')
  const [reflection, setReflection] = useState(() => {
    // Load this week's reflection if exists
    const week = getWeekKey()
    return (state.weeklyReflections || []).find(r => r.week === week)?.text || ''
  })
  const [saved, setSaved] = useState(false)

  // Business Review state
  const weekKey = getWeekKey()
  const bizReviews = state.businessWeeklyReview || {}
  const currentBizReview = bizReviews[weekKey] || {}
  const [bizForm, setBizForm] = useState({
    revenueActual: currentBizReview.revenueActual || '',
    revenueTarget: currentBizReview.revenueTarget || '',
    topWins: currentBizReview.topWins || ['', '', ''],
    biggestBlocker: currentBizReview.biggestBlocker || '',
    blockerPlan: currentBizReview.blockerPlan || '',
    decisionNeeded: currentBizReview.decisionNeeded || '',
    selfRating: currentBizReview.selfRating || 5,
    notes: currentBizReview.notes || '',
  })
  const [bizSaved, setBizSaved] = useState(false)

  function getWeekKey() {
    const d = new Date()
    const jan4 = new Date(d.getFullYear(), 0, 4)
    const w = Math.ceil(((d - jan4) / 86400000 + jan4.getDay() + 1) / 7)
    return `${d.getFullYear()}-W${String(w).padStart(2, '0')}`
  }

  // ── Last 7 days ──────────────────────────────────────────
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })
  }, [])

  const stateByDay = useMemo(() => {
    const map = {}
    ;(state.stateLog || []).forEach(s => { map[s.date] = s.state })
    return map
  }, [state.stateLog])

  const today = new Date().toISOString().split('T')[0]

  // Week stats
  const weekBeautiful = last7.filter(d => stateByDay[d] === 'beautiful').length
  const weekSuffering = last7.filter(d => stateByDay[d] === 'suffering').length
  const weekHabits    = last7.map(d => (state.challengeLog?.[d] || []).length)
  const totalHabits   = weekHabits.reduce((a, b) => a + b, 0)

  // Wheel avg
  const wheelScores = state.wheelScores || {}
  const areas = WHEEL_AREAS[lang]
  const wheelAvg = areas.length > 0
    ? (areas.reduce((sum, a) => sum + (wheelScores[a.key] || 0), 0) / areas.length).toFixed(1)
    : 0
  const minArea = areas.reduce((mn, a) => (wheelScores[a.key] || 0) < (wheelScores[mn.key] || 0) ? a : mn, areas[0])

  // Goals
  const activeGoals    = (state.goals || []).filter(g => (g.progress || 0) < 100)
  const completedGoals = (state.goals || []).filter(g => (g.progress || 0) >= 100)
  const avgProgress    = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s, g) => s + (g.progress || 0), 0) / activeGoals.length)
    : 0

  // Business KPIs
  const kpis = state.businessKPIs || {}

  // DWD
  const dwd          = state.dwd || {}
  const dwdDays      = Object.values(dwd.daysDone || {}).filter(Boolean).length
  const dwdExercises = Object.values(dwd.exercises || {}).filter(Boolean).length

  const handleSave = () => {
    saveWeeklyReflection(reflection)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleBizSave = () => {
    const reviews = state.businessWeeklyReview || {}
    update('businessWeeklyReview', { ...reviews, [weekKey]: { ...bizForm, savedAt: new Date().toISOString() } })
    setBizSaved(true)
    setTimeout(() => setBizSaved(false), 2000)
  }

  // Weekly business scorecard stats
  const weekScorecard = useMemo(() => {
    const sc = state.businessScorecard || {}
    let totalCalls = 0, totalLeads = 0, totalRevenue = 0
    last7.forEach(d => {
      const entry = sc[d]
      if (entry) {
        totalCalls += Number(entry.calls) || 0
        totalLeads += Number(entry.leads) || 0
        totalRevenue += Number(entry.revenue) || 0
      }
    })
    return { totalCalls, totalLeads, totalRevenue }
  }, [state.businessScorecard, last7])

  // Power hour completion this week
  const weekPowerHours = useMemo(() => {
    const ph = state.powerHour || {}
    return last7.filter(d => ph[d]?.completedAt).length
  }, [state.powerHour, last7])

  // Decisions this week
  const weekDecisions = useMemo(() => {
    const dj = state.decisionJournal || []
    return dj.filter(d => last7.includes(d.date)).length
  }, [state.decisionJournal, last7])

  // ── Week range label ─────────────────────────────────────
  const weekStart = new Date(last7[0]).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })
  const weekEnd   = new Date(last7[6]).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="page"
      style={{ direction: isAr ? 'rtl' : 'ltr' }}>

      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <button onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#141414' }}>
          <ArrowRight size={18} color="#c9a84c"
            style={{ transform: isAr ? 'none' : 'rotate(180deg)' }} />
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black" style={{ color: '#fff' }}>
            📋 {isAr ? 'مراجعة الأسبوع' : 'Weekly Review'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#555' }}>
            {weekStart} — {weekEnd}
          </p>
        </div>
      </div>

      <div className="mx-5 space-y-4">

        {/* ── Tab Switcher ────────────────────────────────── */}
        <div className="flex rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 text-xs font-bold transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#c9a84c' : '#666',
              }}>
              {isAr ? tab.ar : tab.en}
            </button>
          ))}
        </div>

        {/* ════════════════ PERSONAL TAB ════════════════════ */}
        {activeTab === 'personal' && <>

        {/* ── 1. أيام الأسبوع ─────────────────────────────── */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p className="text-xs font-black mb-3 uppercase tracking-widest" style={{ color: '#c9a84c' }}>
            {isAr ? '🗓 أيام الأسبوع' : '🗓 This Week\'s Days'}
          </p>
          <div className="grid grid-cols-7 gap-1">
            {last7.map((date, i) => {
              const st         = stateByDay[date]
              const habits     = (state.challengeLog?.[date] || []).length
              const isToday    = date === today
              const dayOfWeek  = new Date(date).getDay()
              const dayName    = DAY_NAMES[lang][dayOfWeek]
              const stateColor = st === 'beautiful' ? '#2ecc71' : st === 'suffering' ? '#e63946' : '#2a2a2a'
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xs" style={{ color: '#444', fontSize: 8 }}>{dayName}</span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: stateColor + (st ? '25' : ''),
                      border: `2px solid ${isToday ? '#c9a84c' : stateColor}`,
                    }}>
                    <span style={{ fontSize: 11 }}>
                      {st === 'beautiful' ? '✨' : st === 'suffering' ? '🌧' : '○'}
                    </span>
                  </div>
                  {habits > 0 && (
                    <span className="text-xs font-bold" style={{ color: '#e67e22', fontSize: 8 }}>
                      🔥{habits}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 2. الحالة العاطفية هذا الأسبوع ────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: '#2ecc7110', border: '1px solid #2ecc7130' }}>
            <div className="text-2xl font-black" style={{ color: '#2ecc71' }}>{weekBeautiful}</div>
            <div className="text-xs mt-0.5" style={{ color: '#555' }}>{isAr ? 'أيام جميلة' : 'Beautiful'}</div>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: '#e6394610', border: '1px solid #e6394630' }}>
            <div className="text-2xl font-black" style={{ color: '#e63946' }}>{weekSuffering}</div>
            <div className="text-xs mt-0.5" style={{ color: '#555' }}>{isAr ? 'أيام معاناة' : 'Suffering'}</div>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: '#e67e2210', border: '1px solid #e67e2230' }}>
            <div className="text-2xl font-black" style={{ color: '#e67e22' }}>{totalHabits}</div>
            <div className="text-xs mt-0.5" style={{ color: '#555' }}>{isAr ? 'عادات طاقة' : 'Energy Habits'}</div>
          </div>
        </div>

        {/* ── 3. الأهداف ──────────────────────────────────────── */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#3498db' }}>
              {isAr ? '🎯 أهدافك' : '🎯 Your Goals'}
            </p>
            <button onClick={() => navigate('/goals')}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: '#3498db15', color: '#3498db', border: '1px solid #3498db30' }}>
              {isAr ? 'عدّل' : 'Edit'}
            </button>
          </div>

          {activeGoals.length === 0 && completedGoals.length === 0 ? (
            <button onClick={() => navigate('/goals')}
              className="w-full text-xs py-2 rounded-xl"
              style={{ color: '#444', background: '#111', border: '1px solid #1e1e1e' }}>
              {isAr ? '+ أضف هدفاً الآن' : '+ Add a goal now'}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-2" style={{ color: '#666' }}>
                <span>{isAr ? `${activeGoals.length} هدف نشط` : `${activeGoals.length} active`}</span>
                <span>{isAr ? `متوسط التقدم: ${avgProgress}%` : `Avg progress: ${avgProgress}%`}</span>
              </div>
              {activeGoals.slice(0, 4).map(g => (
                <div key={g.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white">{g.result}</span>
                    <span style={{ color: g.progress >= 70 ? '#2ecc71' : '#c9a84c' }}>{g.progress || 0}%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ background: '#1a1a1a' }}>
                    <div className="h-1.5 rounded-full"
                      style={{ width: `${g.progress || 0}%`, background: g.progress >= 70 ? '#2ecc71' : '#3498db' }} />
                  </div>
                </div>
              ))}
              {completedGoals.length > 0 && (
                <p className="text-xs" style={{ color: '#2ecc71' }}>
                  ✅ {isAr ? `${completedGoals.length} هدف مكتمل` : `${completedGoals.length} completed`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── 4. عجلة الحياة ──────────────────────────────────── */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#2ecc71' }}>
              {isAr ? '📊 عجلة الحياة' : '📊 Wheel of Life'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-base font-black" style={{ color: '#c9a84c' }}>{wheelAvg}/10</span>
              <button onClick={() => navigate('/wheel')}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ background: '#2ecc7115', color: '#2ecc71', border: '1px solid #2ecc7130' }}>
                {isAr ? 'عدّل' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {areas.map(area => {
              const score = wheelScores[area.key] || 0
              return (
                <div key={area.key} className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{area.emoji}</span>
                  <span className="text-xs w-16 flex-shrink-0" style={{ color: '#888' }}>{area.label}</span>
                  <div className="flex-1 rounded-full h-2" style={{ background: '#1a1a1a' }}>
                    <div className="h-2 rounded-full transition-all"
                      style={{ width: `${score * 10}%`, background: area.color }} />
                  </div>
                  <span className="text-xs font-bold w-5 text-center"
                    style={{ color: score >= 7 ? '#2ecc71' : score >= 4 ? '#c9a84c' : '#e63946' }}>
                    {score}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 rounded-xl p-2"
            style={{ background: '#e6394610', border: '1px solid #e6394620' }}>
            <p className="text-xs" style={{ color: '#e63946' }}>
              🎯 {isAr ? `تركيز الأسبوع: ${minArea.emoji} ${minArea.label} (${wheelScores[minArea.key] || 0}/10)`
                : `Focus: ${minArea.emoji} ${minArea.label} (${wheelScores[minArea.key] || 0}/10)`}
            </p>
          </div>
        </div>

        {/* ── 5. مؤشرات الأعمال ───────────────────────────────── */}
        {(kpis.revenue > 0 || kpis.clients > 0) && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
                {isAr ? '💼 مؤشرات أعمالك' : '💼 Business KPIs'}
              </p>
              <button onClick={() => navigate('/business')}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ background: '#c9a84c15', color: '#c9a84c', border: '1px solid #c9a84c30' }}>
                {isAr ? 'تفاصيل' : 'Details'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: isAr ? 'الإيراد' : 'Revenue', value: `$${(kpis.revenue || 0).toLocaleString()}`, color: '#2ecc71', target: 50000 },
                { label: isAr ? 'العملاء' : 'Clients', value: kpis.clients || 0, color: '#3498db', target: 300 },
                { label: isAr ? 'التحويل' : 'Conversion', value: `${kpis.conversion || 0}%`, color: '#e67e22', target: 25 },
              ].map(kpi => (
                <div key={kpi.label} className="rounded-xl p-2 text-center"
                  style={{ background: '#151515', border: '1px solid #252525' }}>
                  <div className="text-sm font-black" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className="text-xs" style={{ color: '#555', fontSize: 9 }}>{kpi.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. تقدم موعد مع القدر ───────────────────────────── */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#9b59b6' }}>
              {isAr ? '🎯 موعد مع القدر' : '🎯 Date with Destiny'}
            </p>
            <button onClick={() => navigate('/destiny')}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: '#9b59b615', color: '#9b59b6', border: '1px solid #9b59b630' }}>
              {isAr ? 'تابع' : 'Continue'}
            </button>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl p-3 text-center"
              style={{ background: '#9b59b610', border: '1px solid #9b59b620' }}>
              <div className="text-xl font-black" style={{ color: '#9b59b6' }}>{dwdDays}/6</div>
              <div className="text-xs" style={{ color: '#555' }}>{isAr ? 'أيام' : 'Days'}</div>
            </div>
            <div className="flex-1 rounded-xl p-3 text-center"
              style={{ background: '#9b59b610', border: '1px solid #9b59b620' }}>
              <div className="text-xl font-black" style={{ color: '#9b59b6' }}>{dwdExercises}/30</div>
              <div className="text-xs" style={{ color: '#555' }}>{isAr ? 'تمارين' : 'Exercises'}</div>
            </div>
            <div className="flex-1 rounded-xl p-3 text-center"
              style={{ background: '#9b59b610', border: '1px solid #9b59b620' }}>
              <div className="text-xl font-black" style={{ color: '#9b59b6' }}>
                {Math.round((dwdDays / 6) * 100)}%
              </div>
              <div className="text-xs" style={{ color: '#555' }}>{isAr ? 'تقدم' : 'Progress'}</div>
            </div>
          </div>
          {dwd.mission && (
            <div className="mt-2 rounded-xl p-2"
              style={{ background: '#c9a84c08', border: '1px solid #c9a84c15' }}>
              <p className="text-xs italic leading-relaxed" style={{ color: '#888' }}>
                "{dwd.mission.slice(0, 100)}{dwd.mission.length > 100 ? '...' : ''}"
              </p>
            </div>
          )}
        </div>

        {/* ── 7. تأمل الأسبوع ─────────────────────────────────── */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p className="text-xs font-black mb-1 uppercase tracking-widest" style={{ color: '#c9a84c' }}>
            {isAr ? '✍️ تأمل الأسبوع' : '✍️ Weekly Reflection'}
          </p>
          <p className="text-xs mb-3" style={{ color: '#555' }}>
            {isAr
              ? 'ما الأبرز هذا الأسبوع؟ ما الدرس؟ ما الخطوة القادمة؟'
              : 'What stood out this week? What did you learn? What\'s next?'}
          </p>
          <textarea
            rows={5}
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            placeholder={isAr
              ? 'اكتب تأملك هنا...\n\nما أفخر به هذا الأسبوع:\nما سأحسّنه الأسبوع القادم:\nالدرس الأهم:'
              : 'Write your reflection here...\n\nWhat I\'m proud of this week:\nWhat I\'ll improve next week:\nBiggest lesson:'}
            className="w-full rounded-xl p-3 text-sm leading-relaxed outline-none resize-none"
            style={{ background: '#111', color: '#e0e0e0', border: '1px solid #1e1e1e' }}
          />
          <button onClick={handleSave}
            className="w-full mt-3 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: saved ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#000',
            }}>
            {saved ? <><Check size={16} /> {isAr ? 'تم حفظ تأمل الأسبوع ✓' : 'Weekly reflection saved ✓'}</> : (isAr ? '💾 احفظ تأمل الأسبوع' : '💾 Save Weekly Reflection')}
          </button>
        </div>

        {/* Past reflections */}
        {(state.weeklyReflections || []).length > 1 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black mb-3 uppercase tracking-widest" style={{ color: '#555' }}>
              {isAr ? '📚 تأملات سابقة' : '📚 Past Reflections'}
            </p>
            <div className="space-y-3">
              {[...(state.weeklyReflections || [])].reverse().slice(1, 4).map((r, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                  <p className="text-xs mb-1" style={{ color: '#444' }}>{r.date} · {r.week}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#666' }}>
                    {r.text.slice(0, 120)}{r.text.length > 120 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        </>}

        {/* ════════════════ BUSINESS TAB ═══════════════════ */}
        {activeTab === 'business' && <>

          {/* ── Weekly Business Scorecard Summary ───────────── */}
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black mb-3 uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              {isAr ? '📊 ملخص سبورة الأسبوع' : '📊 Weekly Scorecard Summary'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: isAr ? 'اتصالات/اجتماعات' : 'Calls/Meetings', value: weekScorecard.totalCalls, color: '#3498db', emoji: '📞' },
                { label: isAr ? 'عملاء جدد' : 'New Leads', value: weekScorecard.totalLeads, color: '#2ecc71', emoji: '🧲' },
                { label: isAr ? 'الإيرادات' : 'Revenue', value: `$${weekScorecard.totalRevenue.toLocaleString()}`, color: '#c9a84c', emoji: '💰' },
                { label: isAr ? 'ساعات قوة' : 'Power Hours', value: weekPowerHours, color: '#e67e22', emoji: '⏱' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#151515', border: '1px solid #252525' }}>
                  <span className="text-lg">{item.emoji}</span>
                  <div className="text-xl font-black mt-1" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#555' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Revenue vs Target ──────────────────────────── */}
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black mb-3 uppercase tracking-widest" style={{ color: '#2ecc71' }}>
              {isAr ? '💰 الإيراد مقابل الهدف' : '💰 Revenue vs Target'}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs mb-1" style={{ color: '#888' }}>{isAr ? 'الإيراد الفعلي' : 'Actual Revenue'}</p>
                <input type="number" value={bizForm.revenueActual}
                  onChange={e => setBizForm(f => ({ ...f, revenueActual: e.target.value }))}
                  placeholder="0" className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
                  style={{ background: '#111', border: '1px solid #333', outline: 'none' }} />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#888' }}>{isAr ? 'الهدف الأسبوعي' : 'Weekly Target'}</p>
                <input type="number" value={bizForm.revenueTarget}
                  onChange={e => setBizForm(f => ({ ...f, revenueTarget: e.target.value }))}
                  placeholder="0" className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
                  style={{ background: '#111', border: '1px solid #333', outline: 'none' }} />
              </div>
            </div>
            {bizForm.revenueTarget > 0 && (() => {
              const pct = Math.round((Number(bizForm.revenueActual) / Number(bizForm.revenueTarget)) * 100) || 0
              const hit = pct >= 100
              return (
                <div className="rounded-xl p-3" style={{ background: hit ? '#2ecc7110' : '#e6394610', border: `1px solid ${hit ? '#2ecc7130' : '#e6394630'}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: hit ? '#2ecc71' : '#e63946' }}>
                      {hit ? (isAr ? '🎯 تجاوزت الهدف!' : '🎯 Target exceeded!') : (isAr ? `${pct}% من الهدف` : `${pct}% of target`)}
                    </span>
                    <span className="text-xs font-black" style={{ color: hit ? '#2ecc71' : '#e63946' }}>{pct}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: '#1a1a1a' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: hit ? '#2ecc71' : '#e63946' }} />
                  </div>
                </div>
              )
            })()}
          </div>

          {/* ── Top 3 Business Wins ───────────────────────── */}
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black mb-3 uppercase tracking-widest" style={{ color: '#f1c40f' }}>
              {isAr ? '🏆 أفضل ٣ إنجازات عمل' : '🏆 Top 3 Business Wins'}
            </p>
            <div className="space-y-2">
              {bizForm.topWins.map((win, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-black flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: win ? '#c9a84c' : '#2a2a2a', color: win ? '#000' : '#555' }}>{i + 1}</span>
                  <input type="text" value={win}
                    onChange={e => {
                      const w = [...bizForm.topWins]; w[i] = e.target.value
                      setBizForm(f => ({ ...f, topWins: w }))
                    }}
                    placeholder={isAr ? `الإنجاز ${i + 1}...` : `Win ${i + 1}...`}
                    className="flex-1 rounded-xl px-3 py-2 text-sm text-white"
                    style={{ background: '#111', border: '1px solid #333', outline: 'none' }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Biggest Blocker + Plan ────────────────────── */}
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black mb-3 uppercase tracking-widest" style={{ color: '#e63946' }}>
              {isAr ? '🚧 أكبر عائق + خطة الحل' : '🚧 Biggest Blocker + Plan'}
            </p>
            <textarea value={bizForm.biggestBlocker}
              onChange={e => setBizForm(f => ({ ...f, biggestBlocker: e.target.value }))}
              placeholder={isAr ? 'ما أكبر عائق واجهته هذا الأسبوع؟' : 'What was the biggest blocker this week?'}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none mb-2"
              style={{ background: '#111', border: '1px solid #333', outline: 'none', minHeight: 60 }} rows={2} />
            <textarea value={bizForm.blockerPlan}
              onChange={e => setBizForm(f => ({ ...f, blockerPlan: e.target.value }))}
              placeholder={isAr ? 'ما خطتك لحل هذا العائق؟' : 'What\'s your plan to solve it?'}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none"
              style={{ background: '#111', border: '1px solid #2ecc7140', outline: 'none', minHeight: 60 }} rows={2} />
          </div>

          {/* ── Decision Needed Next Week ─────────────────── */}
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black mb-3 uppercase tracking-widest" style={{ color: '#9b59b6' }}>
              {isAr ? '🧠 قرار مطلوب الأسبوع القادم' : '🧠 Decision Needed Next Week'}
            </p>
            <textarea value={bizForm.decisionNeeded}
              onChange={e => setBizForm(f => ({ ...f, decisionNeeded: e.target.value }))}
              placeholder={isAr ? 'ما أهم قرار عليك اتخاذه الأسبوع القادم؟' : 'What\'s the most important decision to make next week?'}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none"
              style={{ background: '#111', border: '1px solid #333', outline: 'none', minHeight: 60 }} rows={2} />
          </div>

          {/* ── Self Rating ────────────────────────────────── */}
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black mb-3 uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              {isAr ? '⭐ تقييمك لأدائك هذا الأسبوع' : '⭐ Rate Your Performance This Week'}
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <input type="range" min={1} max={10} value={bizForm.selfRating}
                onChange={e => setBizForm(f => ({ ...f, selfRating: parseInt(e.target.value) }))}
                className="flex-1" style={{ accentColor: '#c9a84c' }} />
              <div className="text-3xl font-black" style={{
                color: bizForm.selfRating >= 8 ? '#2ecc71' : bizForm.selfRating >= 5 ? '#c9a84c' : '#e63946'
              }}>
                {bizForm.selfRating}/10
              </div>
            </div>
            <p className="text-xs text-center" style={{ color: '#555' }}>
              {bizForm.selfRating >= 9 ? (isAr ? '🔥 أداء استثنائي!' : '🔥 Exceptional!') :
               bizForm.selfRating >= 7 ? (isAr ? '💪 أداء قوي' : '💪 Strong!') :
               bizForm.selfRating >= 5 ? (isAr ? '📈 يمكنك أفضل' : '📈 Room to grow') :
               (isAr ? '⚡ الأسبوع القادم أقوى' : '⚡ Next week will be stronger')}
            </p>
          </div>

          {/* ── Notes ──────────────────────────────────────── */}
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black mb-1 uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              {isAr ? '✍️ ملاحظات إضافية' : '✍️ Additional Notes'}
            </p>
            <textarea value={bizForm.notes}
              onChange={e => setBizForm(f => ({ ...f, notes: e.target.value }))}
              placeholder={isAr ? 'أي ملاحظة أو فكرة تريد تسجيلها...' : 'Any additional notes or ideas...'}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none mt-2"
              style={{ background: '#111', border: '1px solid #1e1e1e', outline: 'none', minHeight: 60 }} rows={3} />
          </div>

          {/* ── Save Business Review ──────────────────────── */}
          <button onClick={handleBizSave}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: bizSaved ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#000',
            }}>
            {bizSaved ? <><Check size={16} /> {isAr ? 'تم حفظ المراجعة ✓' : 'Business review saved ✓'}</> : (isAr ? '💾 احفظ مراجعة العمل' : '💾 Save Business Review')}
          </button>

          {/* ── Past Business Reviews ────────────────────── */}
          {Object.keys(bizReviews).filter(k => k !== weekKey && bizReviews[k].savedAt).length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
              <p className="text-xs font-black mb-3 uppercase tracking-widest" style={{ color: '#555' }}>
                {isAr ? '📚 مراجعات سابقة' : '📚 Past Reviews'}
              </p>
              <div className="space-y-3">
                {Object.entries(bizReviews)
                  .filter(([k, v]) => k !== weekKey && v.savedAt)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 4)
                  .map(([wk, r]) => (
                    <div key={wk} className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold" style={{ color: '#888' }}>{wk}</p>
                        <span className="text-xs font-black" style={{
                          color: r.selfRating >= 7 ? '#2ecc71' : r.selfRating >= 5 ? '#c9a84c' : '#e63946'
                        }}>{r.selfRating}/10</span>
                      </div>
                      <div className="flex gap-3 text-xs" style={{ color: '#555' }}>
                        {r.revenueActual && <span>${Number(r.revenueActual).toLocaleString()}</span>}
                        {r.topWins?.filter(Boolean).length > 0 && <span>{r.topWins.filter(Boolean).length} {isAr ? 'إنجاز' : 'wins'}</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </>}

      </div>

      <BottomNav />
    </div>
  )
}
