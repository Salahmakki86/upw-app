import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'
import { getCompletionMessage } from '../utils/completionSignals'
import OneTapReflection from '../components/OneTapReflection'
import { getNextStep } from '../utils/smartFlow'

const EVENING_QUESTIONS = {
  ar: [
    'ماذا أعطيت اليوم؟ بأي طريقة كنت معطاءً؟',
    'ماذا تعلمت اليوم؟ ما الدرس الجديد؟',
    'كيف أضاف اليوم لجودة حياتي؟',
    'ما اللحظة الأجمل في يومي؟ وكيف شعرت؟',
    'كيف يمكنني استخدام اليوم كاستثمار في مستقبلي؟',
  ],
  en: [
    'What did I give today? In what ways was I generous?',
    'What did I learn today? What was the new lesson?',
    'How did today add to the quality of my life?',
    'What was the best moment of my day? How did I feel?',
    'How can I use today as an investment in my future?',
  ]
}

const CANI_AREAS = [
  { ar: 'الصحة',    en: 'Health',         emoji: '💪' },
  { ar: 'العلاقات', en: 'Relationships',  emoji: '❤️' },
  { ar: 'المال',    en: 'Money',          emoji: '💰' },
  { ar: 'العقلية',  en: 'Mindset',        emoji: '🧠' },
  { ar: 'المهارات', en: 'Skills',         emoji: '🎯' },
  { ar: 'الطاقة',   en: 'Energy',         emoji: '⚡' },
]

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function computeCANIStreak(caniLog) {
  if (!caniLog) return 0
  const dates = Object.keys(caniLog).sort()
  if (dates.length === 0) return 0
  let streak = 1
  for (let i = dates.length - 1; i > 0; i--) {
    const cur = new Date(dates[i])
    const prev = new Date(dates[i - 1])
    const diff = (cur - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) streak++
    else break
  }
  // streak only counts if today is included
  const today = getTodayStr()
  const lastDate = dates[dates.length - 1]
  if (lastDate !== today) return 0
  return streak
}

function getMeterColor(val) {
  if (val <= 3) return '#e63946'
  if (val <= 6) return '#f39c12'
  return '#2ecc71'
}

const DAY_ABBR = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  ar: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
}

function CANIMiniCalendar({ caniLog, isAr, lang }) {
  const today = getTodayStr()
  const todayDone = !!(caniLog && caniLog[today])

  // Build last 7 days (oldest → newest)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const done = !!(caniLog && caniLog[dateStr])
    const isToday = dateStr === today
    const dayIndex = d.getDay() // 0=Sun
    return { dateStr, done, isToday, dayIndex }
  })

  const doneCount = days.filter(d => d.done).length

  return (
    <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
      <p className="text-xs font-bold mb-3 text-center" style={{ color: '#c9a84c' }}>
        {doneCount}/7 {isAr ? 'أيام' : 'days'}
      </p>
      <div className="flex items-center justify-center gap-2">
        {days.map(({ dateStr, done, isToday, dayIndex }) => (
          <div key={dateStr} className="flex flex-col items-center gap-1">
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? '#2ecc71' : '#1e1e1e',
                border: `2px solid ${done ? '#2ecc71' : isToday ? '#c9a84c' : '#2a2a2a'}`,
                boxShadow: isToday && !done ? '0 0 8px rgba(201,168,76,0.6)' : done ? '0 0 6px rgba(46,204,113,0.4)' : 'none',
                animation: isToday && !done ? 'pulse 1.5s ease-in-out infinite' : 'none',
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {done && <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ color: '#555', fontSize: 10 }}>
              {DAY_ABBR[lang][dayIndex]}
            </span>
          </div>
        ))}
      </div>
      {!todayDone && (
        <p className="text-xs text-center mt-2" style={{ color: '#c9a84c88' }}>
          {isAr ? 'أكمل CANI اليوم لتُضيء الدائرة!' : 'Complete CANI today to light up your circle!'}
        </p>
      )}
    </div>
  )
}

export default function EveningRitual() {
  const { state, update, completeEvening } = useApp()
  const { lang, t } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'
  const [answers, setAnswers] = useState({})
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [gratitude, setGratitude] = useState(['', '', ''])
  const [dayRating, setDayRating] = useState(7)
  const [tomorrow, setTomorrow] = useState(['', '', ''])
  const [reflection, setReflection] = useState('')
  const [view, setView] = useState('questions')

  // CANI state
  const [caniQ1, setCaniQ1] = useState('')
  const [caniQ2, setCaniQ2] = useState('')
  const [caniArea, setCaniArea] = useState('')
  const [caniMeter, setCaniMeter] = useState(5)

  // Restore today's evening data if already completed
  useEffect(() => {
    const todayKey = getTodayStr()
    const todayLog = state.eveningLog?.[todayKey]
    if (todayLog) {
      if (todayLog.gratitude?.length) setGratitude(todayLog.gratitude.concat(['','',''].slice(todayLog.gratitude.length)).slice(0,3))
      if (todayLog.dayRating) setDayRating(todayLog.dayRating)
      if (todayLog.tomorrow?.length) setTomorrow(todayLog.tomorrow.concat(['','',''].slice(todayLog.tomorrow.length)).slice(0,3))
      if (todayLog.reflection) setReflection(todayLog.reflection)
      if (todayLog.cani?.q1) setCaniQ1(todayLog.cani.q1)
      if (todayLog.cani?.q2) setCaniQ2(todayLog.cani.q2)
      if (todayLog.cani?.area) setCaniArea(todayLog.cani.area)
      if (todayLog.cani?.meter) setCaniMeter(todayLog.cani.meter)
    }
  }, []) // Only on mount

  const QUESTIONS = EVENING_QUESTIONS[lang]

  // #7 — Morning answers reference
  const morningAnswers = state.morningAnswers || {}
  const morningCommitment = morningAnswers[6] // "What step will I take today?"

  // #5 — Commitment
  const commitment = state.commitment

  // #2 — Wheel of Life lowest area
  const AREA_NAMES = { body: { ar: 'الصحة', en: 'Health' }, emotions: { ar: 'العواطف', en: 'Emotions' }, relationships: { ar: 'العلاقات', en: 'Relationships' }, time: { ar: 'الوقت', en: 'Time' }, career: { ar: 'المهنة', en: 'Career' }, money: { ar: 'المال', en: 'Money' }, contribution: { ar: 'المساهمة', en: 'Contribution' } }
  const wheelScores = state.wheelScores || {}
  const wheelEntries = Object.entries(wheelScores).filter(([, v]) => v !== 5)
  const lowestArea = wheelEntries.length > 0 ? wheelEntries.reduce((a, b) => a[1] < b[1] ? a : b) : null

  // CROSS-LINK 6: Map wheel areas → CANI areas
  const WHEEL_TO_CANI = {
    body:         { ar: 'الصحة',    en: 'Health' },
    emotions:     { ar: 'العقلية',  en: 'Mindset' },
    relationships:{ ar: 'العلاقات', en: 'Relationships' },
    money:        { ar: 'المال',    en: 'Money' },
    career:       { ar: 'المهارات', en: 'Skills' },
    contribution: { ar: 'الصحة',    en: 'Health' },
    time:         { ar: 'الطاقة',   en: 'Energy' },
  }
  const wheelSuggestedCaniLabel = lowestArea
    ? (isAr ? WHEEL_TO_CANI[lowestArea[0]]?.ar : WHEEL_TO_CANI[lowestArea[0]]?.en) || null
    : null
  const setGrat = (i, v) => { const g = [...gratitude]; g[i] = v; setGratitude(g) }
  const setTom  = (i, v) => { const tt = [...tomorrow]; tt[i] = v; setTomorrow(tt) }

  const saveAnswer = () => {
    if (!answer.trim()) return
    const newA = { ...answers, [qIndex]: answer }
    setAnswers(newA)
    setAnswer('')
    if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1)
    else setView('gratitude')
  }

  const saveCANI = () => {
    const today = getTodayStr()
    const existingLog = state.caniLog || {}
    const newLog = {
      ...existingLog,
      [today]: { q1: caniQ1, q2: caniQ2, area: caniArea, meter: caniMeter, date: today }
    }
    update('caniLog', newLog)
    setView('tomorrow')
  }

  const finishEvening = () => {
    const todayKey = getTodayStr()
    // Auto-calculate dayRating from StateCheckin (backwards-compatible: falls back to manual value)
    const checkin = state.stateCheckin?.[todayKey]
    const computedRating = checkin
      ? Math.round(((checkin.energy || 5) + (checkin.mood || 5) + (checkin.clarity || 5)) / 3)
      : dayRating
    // Gratitude: prefer the unified gratitude page data, fall back to any local evening entries
    const unifiedGratitude = state.gratitude?.[todayKey]?.filter(v => v && v.trim()) || []
    const localGratitude = gratitude.filter(g => g.trim())
    const finalGratitude = unifiedGratitude.length > 0 ? unifiedGratitude : localGratitude
    // Atomic: sets eveningDone + lastActiveDate + all logs in a single setState.
    // This prevents the daily-reset effect from wiping eveningDone because
    // lastActiveDate stayed on an old day.
    completeEvening({
      answers,
      gratitude: finalGratitude,
      dayRating: computedRating,
      tomorrow: tomorrow.filter(t => t.trim()),
      reflection: reflection.trim(),
      cani: { q1: caniQ1, q2: caniQ2, area: caniArea, meter: caniMeter },
    })
    setView('reflection')
  }

  // CANI streak
  const caniStreak = computeCANIStreak(state.caniLog)

  // ── Hooks that must run on EVERY render (React rules of hooks) ──────────
  // Past reflections for inspiration (must be above early returns)
  const pastReflections = useMemo(() => {
    const log = state.eveningLog || {}
    const todayKey = getTodayStr()
    return Object.entries(log)
      .filter(([d, v]) => d !== todayKey && v?.reflection?.trim())
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3)
  }, [state.eveningLog])

  // One-Tap Reflection after evening
  if (view === 'reflection') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
          <div className="text-5xl animate-scale-in">🌙</div>
          <h2 className="text-2xl font-black text-white">{t('evening_completed')}</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
            {lang === 'ar' ? 'نمت بوعٍ اليوم وستستيقظ غداً أقوى.' : 'You slept consciously today and will wake up stronger tomorrow.'}
          </p>
          {/* One-Tap Reflection */}
          <div className="w-full">
            <OneTapReflection type="evening" onDone={() => setView('done')} />
          </div>
        </div>
      </Layout>
    )
  }

  if (view === 'done') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
          <div className="text-5xl animate-scale-in">🌙</div>
          <h2 className="text-2xl font-black text-white">{t('evening_completed')}</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
            {lang === 'ar' ? 'نمت بوعٍ اليوم وستستيقظ غداً أقوى.' : 'You slept consciously today and will wake up stronger tomorrow.'}
          </p>
          {(() => {
            const checkin = state.stateCheckin?.[getTodayStr()]
            const displayRating = checkin
              ? Math.round(((checkin.energy || 5) + (checkin.mood || 5) + (checkin.clarity || 5)) / 3)
              : dayRating
            return (
              <div className="rounded-2xl p-4 w-full"
                style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
                  {t('evening_rating')}: {displayRating}/10
                  {checkin && (
                    <span className="ml-2 text-xs font-normal" style={{ color: '#666' }}>
                      {isAr ? '(من حالتك)' : '(from state)'}
                    </span>
                  )}
                </p>
                <div className="progress-bar-bg mt-1">
                  <div className="progress-bar-fill" style={{ width: `${displayRating * 10}%` }} />
                </div>
              </div>
            )
          })()}
          {/* Smart Flow — What's Next (Fix #2) */}
          {(() => {
            const nextStep = getNextStep('evening', state, isAr)
            return (
              <button
                onClick={() => navigate(nextStep.path)}
                className="rounded-2xl p-4 mt-2 w-full flex items-center gap-3 transition-all active:scale-[0.98]"
                style={{
                  background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.25)',
                  textAlign: isAr ? 'right' : 'left', cursor: 'pointer',
                }}>
                <span style={{ fontSize: 24 }}>{nextStep.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#3498db' }}>
                    {isAr ? 'الخطوة التالية ←' : "What's Next →"}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                    {isAr ? nextStep.labelAr : nextStep.labelEn}
                  </p>
                </div>
              </button>
            )
          })()}
          {/* Goals cross-link */}
          <div className="rounded-2xl p-4 mt-2 w-full" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
              🎯 {isAr ? 'راجع أهدافك لليوم التالي' : 'Review your goals for tomorrow'}
            </p>
            <p className="text-xs mb-3" style={{ color: '#666' }}>
              {isAr
                ? 'مراجعة أهدافك قبل النوم تجعل عقلك الباطن يعمل عليها طوال الليل'
                : 'Reviewing your goals before sleep makes your subconscious work on them all night'}
            </p>
            <button
              onClick={() => navigate('/goals')}
              className="w-full rounded-xl py-2.5 text-xs font-bold"
              style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}>
              {isAr ? '🎯 مراجعة الأهداف ←' : '→ 🎯 Review Goals'}
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  if (view === 'tomorrow') {
    return (
      <Layout title={t('evening_planning')} subtitle={lang === 'ar' ? 'خطط لغدك الليلة' : 'Plan your tomorrow tonight'}>
        <div className="space-y-4 pt-2">
          <div>
            <p className="text-xs mb-2" style={{ color: '#888' }}>{t('evening_tomorrow_tasks')}:</p>
            {tomorrow.map((v, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black w-5 text-center" style={{ color: '#c9a84c' }}>{i + 1}</span>
                <input value={v} onChange={e => setTom(i, e.target.value)}
                  placeholder={t('evening_task_placeholder')} className="input-dark flex-1 text-sm py-2" />
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs mb-2" style={{ color: '#888' }}>{t('evening_reflection')}:</p>
            <textarea value={reflection} onChange={e => setReflection(e.target.value)}
              placeholder={t('evening_reflection_placeholder')} rows={3} className="input-dark resize-none text-sm" />

            {/* Past reflections — your words back to you */}
            {pastReflections.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#555' }}>
                  📖 {isAr ? 'تأملاتك السابقة' : 'Your Past Reflections'}
                </p>
                {pastReflections.map(([date, entry]) => (
                  <div key={date} className="rounded-xl p-2.5 mb-1.5" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                    <span className="text-xs" style={{ color: '#444' }}>
                      {new Date(date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#999' }}>{entry.reflection}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Day rating auto-calculated from StateCheckin */}
          {state.stateCheckin?.[getTodayStr()] && (
            <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
              <p className="text-xs" style={{ color: '#666' }}>
                {isAr ? '💡 تقييم يومك محسوب تلقائياً من حالتك (الطاقة + المزاج + الوضوح)'
                       : '💡 Your day rating is auto-calculated from your state (energy + mood + clarity)'}
              </p>
              <p className="text-sm font-bold mt-1" style={{ color: '#c9a84c' }}>
                {Math.round(((state.stateCheckin[getTodayStr()].energy || 5) + (state.stateCheckin[getTodayStr()].mood || 5) + (state.stateCheckin[getTodayStr()].clarity || 5)) / 3)}/10
              </p>
            </div>
          )}
          {!state.stateCheckin?.[getTodayStr()] && (
            <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
              <p className="text-xs" style={{ color: '#666' }}>
                {isAr ? '💡 سجّل حالتك في صفحة "حالتك" ليتم احتساب تقييم يومك تلقائياً'
                       : '💡 Log your state on the State page to auto-calculate your day rating'}
              </p>
            </div>
          )}
          <button onClick={finishEvening} className="w-full btn-gold py-4 text-base">
            🌙 {lang === 'ar' ? 'إنهاء اليوم' : 'End the day'}
          </button>
        </div>
      </Layout>
    )
  }

  if (view === 'cani') {
    const meterColor = getMeterColor(caniMeter)
    const canProceed = caniQ1.trim() || caniQ2.trim() || caniArea

    return (
      <Layout
        title={isAr ? 'التحسين المستمر' : 'Constant And Never-Ending Improvement'}
        subtitle="CANI">
        <div className="space-y-5 pt-2">

          {/* 7-day CANI mini-calendar */}
          <CANIMiniCalendar caniLog={state.caniLog} isAr={isAr} lang={lang} />

          {/* Streak badge */}
          {caniStreak >= 3 && (
            <div className="rounded-2xl p-3 flex items-center gap-3 animate-scale-in"
              style={{ background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.25)' }}>
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-xs font-black" style={{ color: '#2ecc71' }}>
                  {isAr ? `سلسلة CANI: ${caniStreak} أيام متواصلة!` : `CANI Streak: ${caniStreak} days in a row!`}
                </p>
                <p className="text-xs" style={{ color: '#888' }}>
                  {isAr ? 'أنت تتحسن كل يوم — استمر!' : 'You are improving every day — keep going!'}
                </p>
              </div>
            </div>
          )}

          {/* Principle card */}
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-black mb-1" style={{ color: '#c9a84c' }}>
              {isAr ? '— توني روبنز' : '— Tony Robbins'}
            </p>
            <p className="text-sm text-white leading-relaxed" style={{ fontStyle: 'italic' }}>
              {isAr
                ? '"التحسين بنسبة 1% كل يوم يعني أنك ستكون 37 ضعفاً أفضل في نهاية العام."'
                : '"Improving just 1% every day means you will be 37x better by the end of the year."'}
            </p>
          </div>

          {/* Q1 */}
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
              1. {isAr
                ? 'ما الشيء الواحد الذي تحسّنت فيه اليوم ولو بنسبة 1%؟'
                : 'What is one thing you improved by even 1% today?'}
            </p>
            <textarea
              value={caniQ1}
              onChange={e => setCaniQ1(e.target.value)}
              placeholder={isAr ? 'اكتب هنا...' : 'Write here...'}
              rows={2}
              className="input-dark resize-none text-sm w-full"
            />
          </div>

          {/* Q2 */}
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
              2. {isAr
                ? 'ما عادة صغيرة يمكنك إضافتها غداً لتكون أفضل؟'
                : 'What small habit can you add tomorrow to be 1% better?'}
            </p>
            <textarea
              value={caniQ2}
              onChange={e => setCaniQ2(e.target.value)}
              placeholder={isAr ? 'اكتب هنا...' : 'Write here...'}
              rows={2}
              className="input-dark resize-none text-sm w-full"
            />
          </div>

          {/* Q3 — Area chips */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: '#c9a84c' }}>
              3. {isAr
                ? 'في أي مجال من مجالات حياتك تريد التحسين الأسرع؟'
                : 'In which life area do you want to improve the fastest?'}
            </p>
            {/* CROSS-LINK 6: Wheel suggestion hint */}
            {wheelSuggestedCaniLabel && (
              <div className="rounded-xl px-3 py-2 mb-2 flex items-center justify-between gap-2"
                style={{ background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)' }}>
                <p className="text-xs" style={{ color: '#3498db', flex: 1 }}>
                  📊 {isAr
                    ? `مقترح من عجلة الحياة: "${wheelSuggestedCaniLabel}"`
                    : `Suggested from Wheel: "${wheelSuggestedCaniLabel}"`}
                </p>
                <button
                  onClick={() => navigate('/wheel')}
                  className="text-xs font-bold px-2 py-1 rounded-lg transition-all active:scale-95"
                  style={{ background: 'rgba(52,152,219,0.15)', border: '1px solid rgba(52,152,219,0.3)', color: '#3498db', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                  {isAr ? 'عجلة الحياة ←' : '→ Wheel'}
                </button>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {CANI_AREAS.map(area => {
                const label = isAr ? area.ar : area.en
                const isSelected = caniArea === label
                const isSuggested = wheelSuggestedCaniLabel === label
                return (
                  <button
                    key={label}
                    onClick={() => setCaniArea(isSelected ? '' : label)}
                    className="py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 flex flex-col items-center gap-1 relative"
                    style={{
                      background: isSelected ? 'rgba(201,168,76,0.18)' : isSuggested ? 'rgba(52,152,219,0.1)' : '#111',
                      border: `1px solid ${isSelected ? 'rgba(201,168,76,0.5)' : isSuggested ? 'rgba(52,152,219,0.4)' : '#1e1e1e'}`,
                      color: isSelected ? '#c9a84c' : isSuggested ? '#3498db' : '#666',
                    }}>
                    <span className="text-lg">{area.emoji}</span>
                    <span>{label}</span>
                    {isSuggested && !isSelected && (
                      <span className="text-[9px] font-bold" style={{ color: '#3498db' }}>
                        📊 {isAr ? 'مقترح' : 'suggested'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Improvement Meter */}
          <div className="rounded-2xl p-4"
            style={{ background: '#111', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-bold mb-3 text-white">
              📊 {isAr ? 'متر التحسين — كم حسّنت نفسك اليوم؟' : 'Improvement Meter — How much did you improve today?'}
            </p>
            {(() => {
              const meterLabel = isAr
                ? (caniMeter <= 3 ? 'ضعيف' : caniMeter <= 6 ? 'متوسط' : 'قوي')
                : (caniMeter <= 3 ? 'Weak' : caniMeter <= 6 ? 'Moderate' : 'Strong')
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: '#888' }}>1</span>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-2xl font-black" style={{ color: meterColor }}>{caniMeter}</span>
                      <span className="text-xs font-bold" style={{ color: meterColor }}>{meterLabel}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#888' }}>10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={caniMeter}
                    onChange={e => setCaniMeter(Number(e.target.value))}
                    style={{ accentColor: meterColor }}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: '#e63946' }}>{isAr ? 'ضعيف' : 'Weak'}</span>
                    <span className="text-xs" style={{ color: '#f39c12' }}>{isAr ? 'متوسط' : 'Moderate'}</span>
                    <span className="text-xs" style={{ color: '#2ecc71' }}>{isAr ? 'قوي' : 'Strong'}</span>
                  </div>
                </>
              )
            })()}
            {/* Color bar */}
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(caniMeter / 10) * 100}%`, background: meterColor }}
              />
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={saveCANI}
            disabled={!canProceed}
            className="w-full btn-gold py-3 text-sm disabled:opacity-40">
            {isAr ? 'حفظ والمتابعة لتخطيط الغد →' : 'Save & Continue to Tomorrow Planning →'}
          </button>
          <button onClick={() => setView('tomorrow')} className="w-full text-xs py-1" style={{ color: '#444' }}>
            {t('skip')} →
          </button>
        </div>
      </Layout>
    )
  }

  if (view === 'gratitude') {
    const todayGratitude = state.gratitude?.[getTodayStr()] || []
    const hasGratitudeToday = todayGratitude.filter(v => v && v.trim()).length > 0

    return (
      <Layout title={t('evening_gratitude')} subtitle={t('evening_gratitude_desc')}>
        <div className="space-y-4 pt-2">
          <p className="text-xs" style={{ color: '#888' }}>
            {isAr
              ? 'الامتنان يُغلق يومك بحالة جميلة ويبرمج عقلك الباطن للإيجابية أثناء النوم.'
              : 'Gratitude closes your day in a beautiful state and programs your subconscious for positivity during sleep.'}
          </p>

          {/* Show today's gratitude if already entered on the Gratitude page */}
          {hasGratitudeToday ? (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#2ecc71' }}>
                {isAr ? '✓ أضفت امتنانك اليوم' : '✓ You logged gratitude today'}
              </p>
              {todayGratitude.filter(v => v && v.trim()).map((g, i) => (
                <p key={i} className="text-xs mb-1 leading-relaxed" style={{ color: '#999' }}>
                  {i === 0 ? '🌟' : i === 1 ? '💛' : '🙏'} {g}
                </p>
              ))}
              <button
                onClick={() => navigate('/gratitude')}
                className="mt-3 w-full rounded-xl py-2 text-xs font-bold transition-all active:scale-[0.97]"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', color: '#c9a84c' }}>
                {isAr ? 'تعديل الامتنان ←' : 'Edit Gratitude ->'}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-sm font-bold mb-2" style={{ color: '#c9a84c' }}>
                {isAr ? '🙏 هل أضفت شيئاً للامتنان اليوم؟' : '🙏 Did you add something to be grateful for today?'}
              </p>
              <p className="text-xs mb-3" style={{ color: '#888' }}>
                {isAr
                  ? 'الامتنان قبل النوم يبرمج عقلك الباطن للإيجابية — أضف 3 أشياء تشكرها'
                  : 'Gratitude before sleep programs your subconscious for positivity — add 3 things you are grateful for'}
              </p>
              <button
                onClick={() => navigate('/gratitude')}
                className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #a07a30)', color: '#000' }}>
                {isAr ? '🙏 افتح صفحة الامتنان ←' : '-> 🙏 Open Gratitude Page'}
              </button>
            </div>
          )}

          <button onClick={() => setView('cani')}
            className="w-full btn-gold py-3 text-sm">
            {isAr ? 'CANI — التحسين المستمر →' : 'CANI — Improvement ->'}
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={t('evening_title')} subtitle={t('evening_subtitle')} helpKey="evening">
      <div className="space-y-4 pt-2">

        {/* CANI Streak badge (shown on questions screen too) */}
        {caniStreak >= 3 && (
          <div className="rounded-2xl p-2.5 flex items-center gap-2"
            style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)' }}>
            <span className="text-lg">🔥</span>
            <p className="text-xs font-bold" style={{ color: '#2ecc71' }}>
              {isAr ? `سلسلة CANI: ${caniStreak} أيام` : `CANI Streak: ${caniStreak} days`}
            </p>
          </div>
        )}

        {/* #7 — Morning Reference */}
        {morningCommitment && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
              ☀️ {isAr ? 'هذا الصباح قلت:' : 'This morning you said:'}
            </p>
            <p className="text-xs text-white leading-relaxed" style={{ fontStyle: 'italic' }}>
              "{morningCommitment}"
            </p>
            <p className="text-xs mt-1" style={{ color: '#888' }}>
              {isAr ? 'هل نفذتها؟ فكّر في ذلك أثناء أسئلتك المسائية' : 'Did you follow through? Reflect on this during your evening questions'}
            </p>
          </div>
        )}

        {/* #5 — Commitment Reminder */}
        {commitment?.text && !morningCommitment && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
              📜 {isAr ? 'تذكّر التزامك' : 'Remember Your Commitment'}
            </p>
            <p className="text-xs text-white leading-relaxed" style={{ fontStyle: 'italic' }}>"{commitment.text}"</p>
          </div>
        )}

        {/* #2 — Wheel of Life Reflection */}
        {lowestArea && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.15)' }}>
            <p className="text-xs font-bold" style={{ color: '#e63946' }}>
              ⚙️ {isAr
                ? `ماذا فعلت اليوم لتحسين "${AREA_NAMES[lowestArea[0]]?.ar || lowestArea[0]}"؟`
                : `What did you do today to improve "${AREA_NAMES[lowestArea[0]]?.en || lowestArea[0]}"?`}
            </p>
          </div>
        )}

        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
        <p className="text-xs text-center" style={{ color: '#888' }}>
          {lang === 'ar' ? `السؤال ${qIndex + 1} من ${QUESTIONS.length}` : `Question ${qIndex + 1} of ${QUESTIONS.length}`}
        </p>
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-base font-bold text-white leading-relaxed">{QUESTIONS[qIndex]}</p>
        </div>

        {/* Past answer for this evening question */}
        {(() => {
          const log = state.powerQuestionsLog || {}
          const todayKey = getTodayStr()
          const pastDates = Object.keys(log).filter(d => d !== todayKey && log[d]?.evening?.[qIndex]?.trim()).sort().reverse()
          if (pastDates.length === 0) return null
          const pastText = log[pastDates[0]].evening[qIndex]
          return (
            <div className="rounded-xl p-3" style={{ background: 'rgba(147,112,219,0.06)', border: '1px solid rgba(147,112,219,0.15)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#9370db' }}>
                📖 {isAr ? 'إجابتك السابقة:' : 'Your previous answer:'}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#999', fontStyle: 'italic' }}>
                "{pastText.slice(0, 120)}{pastText.length > 120 ? '...' : ''}"
              </p>
              <p className="text-xs mt-1" style={{ color: '#444' }}>
                {new Date(pastDates[0]).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}
                {' — '}{isAr ? 'لاحظ كيف تتطور إجاباتك' : 'Notice how your answers evolve'}
              </p>
            </div>
          )
        })()}

        <textarea value={answer} onChange={e => setAnswer(e.target.value)}
          placeholder={t('morning_type_answer')} rows={4} className="input-dark resize-none text-sm" />
        <button onClick={saveAnswer} disabled={!answer.trim()}
          className="w-full btn-gold py-3 text-sm disabled:opacity-40">
          {qIndex < QUESTIONS.length - 1 ? `${t('next')} →` : `${t('evening_gratitude')} ✓`}
        </button>
        <button onClick={() => setView('gratitude')} className="w-full text-xs py-1" style={{ color: '#444' }}>
          {t('skip')} → {t('evening_gratitude')}
        </button>
      </div>
    </Layout>
  )
}
