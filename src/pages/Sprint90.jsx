/**
 * #2 — 90-Day Business Sprint
 * Focused 90-day plan with weekly milestones and tracking
 */
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

export default function Sprint90() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const sprint = state.sprint90 || {}
  const [editGoal, setEditGoal] = useState(false)
  const [goalText, setGoalText] = useState(sprint.goal || '')
  const [metric, setMetric] = useState(sprint.metric || '')
  const [weekNote, setWeekNote] = useState('')
  const [activeWeek, setActiveWeek] = useState(null)

  const saveSprint = (patch) => {
    update('sprint90', { ...sprint, ...patch })
  }

  const startSprint = () => {
    if (!goalText.trim()) return
    saveSprint({
      goal: goalText.trim(),
      metric: metric.trim(),
      startDate: new Date().toISOString().slice(0, 10),
      weeks: Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        target: '',
        done: false,
        note: '',
      })),
    })
    setEditGoal(false)
  }

  const updateWeek = (weekIdx, patch) => {
    const weeks = [...(sprint.weeks || [])]
    weeks[weekIdx] = { ...weeks[weekIdx], ...patch }
    saveSprint({ weeks })
  }

  // Progress
  const weeks = sprint.weeks || []
  const doneWeeks = weeks.filter(w => w.done).length
  const progressPct = weeks.length > 0 ? Math.round((doneWeeks / weeks.length) * 100) : 0

  // Days remaining
  const daysRemaining = useMemo(() => {
    if (!sprint.startDate) return 90
    const start = new Date(sprint.startDate)
    const end = new Date(start); end.setDate(end.getDate() + 90)
    const diff = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }, [sprint.startDate])

  const currentWeek = useMemo(() => {
    if (!sprint.startDate) return 0
    const start = new Date(sprint.startDate)
    return Math.min(12, Math.ceil((new Date() - start) / (7 * 24 * 60 * 60 * 1000)))
  }, [sprint.startDate])

  // No sprint active
  if (!sprint.goal || editGoal) {
    return (
      <Layout
        title={isAr ? 'سبرنت ٩٠ يوم' : '90-Day Sprint'}
        subtitle={isAr ? 'ركّز على هدف واحد كبير' : 'Focus on ONE big goal'}
      >
        <div className="space-y-4 pt-4">
          <div className="rounded-2xl p-6 text-center"
            style={{ background: 'linear-gradient(135deg,#1a1500,#1a1a1a)', border: '1px solid rgba(201,168,76,0.3)' }}>
            <div className="text-5xl mb-3">🎯</div>
            <h2 className="text-lg font-black text-white mb-1">
              {isAr ? 'ما هدفك الكبير لـ ٩٠ يوم القادمة؟' : 'What is your BIG goal for the next 90 days?'}
            </h2>
            <p className="text-xs mb-4" style={{ color: '#888' }}>
              {isAr ? 'هدف واحد فقط — التركيز هو القوة' : 'Only ONE goal — focus is power'}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#c9a84c' }}>
                🎯 {isAr ? 'الهدف الكبير' : 'The Big Goal'}
              </label>
              <textarea
                value={goalText}
                onChange={e => setGoalText(e.target.value)}
                placeholder={isAr ? 'مثال: أوصل الإيرادات الشهرية لـ ٥٠ ألف' : 'Example: Reach $50K monthly revenue'}
                rows={2}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none"
                style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#c9a84c' }}>
                📊 {isAr ? 'المقياس (كيف تعرف أنك نجحت؟)' : 'Success Metric (how will you know?)'}
              </label>
              <input
                type="text"
                value={metric}
                onChange={e => setMetric(e.target.value)}
                placeholder={isAr ? 'مثال: إيراد شهري ٥٠,٠٠٠' : 'Example: $50,000 monthly revenue'}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
                style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
              />
            </div>
            <button onClick={startSprint} disabled={!goalText.trim()}
              className="w-full btn-gold py-3 text-sm disabled:opacity-40">
              🚀 {isAr ? 'ابدأ السبرنت' : 'Start Sprint'}
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title={isAr ? 'سبرنت ٩٠ يوم' : '90-Day Sprint'}
      subtitle={sprint.goal}
    >
      <div className="space-y-4 pt-2">

        {/* Progress Header */}
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg,#1a1500,#1a1a1a)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs" style={{ color: '#888' }}>{isAr ? 'الهدف' : 'Goal'}</p>
              <p className="text-sm font-black text-white">{sprint.goal}</p>
              {sprint.metric && (
                <p className="text-xs mt-0.5" style={{ color: '#c9a84c' }}>📊 {sprint.metric}</p>
              )}
            </div>
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: daysRemaining <= 14 ? '#e74c3c' : '#c9a84c' }}>
                {daysRemaining}
              </div>
              <div className="text-xs" style={{ color: '#888' }}>{isAr ? 'يوم باقي' : 'days left'}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>{progressPct}%</span>
            <div className="flex-1 rounded-full h-2" style={{ background: '#2a2a2a' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100 ? 'linear-gradient(90deg,#2ecc71,#27ae60)' : 'linear-gradient(90deg,#c9a84c,#e8c96a)',
                }} />
            </div>
            <span className="text-xs" style={{ color: '#888' }}>{doneWeeks}/12</span>
          </div>

          <div className="flex gap-2 mt-3">
            <button onClick={() => { setGoalText(sprint.goal); setMetric(sprint.metric || ''); setEditGoal(true) }}
              className="text-xs px-3 py-1.5 rounded-lg" style={{ background: '#2a2a2a', color: '#888' }}>
              ✏️ {isAr ? 'تعديل' : 'Edit'}
            </button>
            <button onClick={() => saveSprint({ goal: '', weeks: [], startDate: null, metric: '' })}
              className="text-xs px-3 py-1.5 rounded-lg" style={{ background: '#e74c3c15', color: '#e74c3c', border: '1px solid #e74c3c30' }}>
              🗑 {isAr ? 'إنهاء السبرنت' : 'End Sprint'}
            </button>
          </div>
        </div>

        {/* 12-Week Grid */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
            📅 {isAr ? '١٢ أسبوع' : '12 Weeks'}
          </p>
          <div className="space-y-2">
            {weeks.map((w, i) => {
              const isCurrent = i + 1 === currentWeek
              const isExpanded = activeWeek === i
              return (
                <div key={i}>
                  <button
                    onClick={() => setActiveWeek(isExpanded ? null : i)}
                    className="w-full flex items-center gap-3 rounded-xl p-3 transition-all"
                    style={{
                      background: w.done ? 'rgba(46,204,113,0.08)' : isCurrent ? 'rgba(201,168,76,0.08)' : '#111',
                      border: `1px solid ${w.done ? '#2ecc7130' : isCurrent ? '#c9a84c30' : '#222'}`,
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={e => { e.stopPropagation(); updateWeek(i, { done: !w.done }) }}
                      className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: w.done ? '#2ecc71' : '#2a2a2a', border: `2px solid ${w.done ? '#2ecc71' : '#3a3a3a'}` }}
                    >
                      {w.done && <span className="text-xs text-black font-bold">✓</span>}
                    </button>

                    <div className="flex-1 text-right">
                      <span className="text-xs font-bold" style={{ color: w.done ? '#2ecc71' : isCurrent ? '#c9a84c' : '#888' }}>
                        {isAr ? `الأسبوع ${w.week}` : `Week ${w.week}`}
                        {isCurrent && !w.done && <span className="mr-1 ml-1" style={{ color: '#c9a84c' }}>← {isAr ? 'الحالي' : 'Current'}</span>}
                      </span>
                      {w.target && (
                        <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>{w.target}</p>
                      )}
                    </div>
                  </button>

                  {/* Expanded: target + note */}
                  {isExpanded && (
                    <div className="mt-1 p-3 rounded-xl space-y-2" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <input
                        type="text"
                        value={w.target}
                        onChange={e => updateWeek(i, { target: e.target.value })}
                        placeholder={isAr ? 'هدف هذا الأسبوع...' : "This week's target..."}
                        className="w-full rounded-lg px-3 py-2 text-xs text-white"
                        style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
                      />
                      <textarea
                        value={w.note}
                        onChange={e => updateWeek(i, { note: e.target.value })}
                        placeholder={isAr ? 'ملاحظات ونتائج...' : 'Notes and results...'}
                        rows={2}
                        className="w-full rounded-lg px-3 py-2 text-xs text-white resize-none"
                        style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Motivational */}
        {progressPct > 0 && progressPct < 100 && (
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <p className="text-xs font-bold" style={{ color: '#c9a84c' }}>
              {progressPct >= 75
                ? (isAr ? '🔥 أنت قريب جداً! اللحظات الأخيرة هي الأهم!' : "🔥 You're so close! The final moments matter most!")
                : progressPct >= 50
                ? (isAr ? '⚡ نصف الطريق! الزخم معك — استمر!' : "⚡ Halfway! Momentum is with you — keep going!")
                : (isAr ? '🚀 بداية قوية! كل أسبوع يقربك أكثر' : '🚀 Strong start! Every week brings you closer')}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}
