import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const WHEEL_AREAS = {
  ar: { body: 'الجسد', emotions: 'العواطف', relationships: 'العلاقات', time: 'الوقت', career: 'المهنة', money: 'المال', contribution: 'المساهمة' },
  en: { body: 'Body', emotions: 'Emotions', relationships: 'Relationships', time: 'Time', career: 'Career', money: 'Money', contribution: 'Contribution' },
}

function StatBar({ value, max, color = '#c9a84c', label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div>
      {label && <div className="flex justify-between text-xs mb-1" style={{ color: '#888' }}>
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>}
      <div className="w-full rounded-full h-2" style={{ background: '#2a2a2a' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function Statistics() {
  const { state } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const today = new Date().toISOString().split('T')[0]

  // ── Overview ─────────────────────────────────────────────
  const totalWins = useMemo(() => Object.values(state.dailyWins || {}).flat().length, [state.dailyWins])
  const goalsCompleted = useMemo(() => (state.goals || []).filter(g => (g.progress || 0) >= 100).length, [state.goals])
  const wheelSnapshots = (state.wheelHistory || []).length

  const daysSinceFirst = useMemo(() => {
    const allDates = [
      ...(state.stateLog || []).map(l => l.date),
      ...(state.goals || []).map(g => g.createdAt),
    ].filter(Boolean).sort()
    if (allDates.length === 0) return 0
    const first = new Date(allDates[0])
    return Math.floor((new Date() - first) / 86400000)
  }, [state])

  // ── Emotional State ───────────────────────────────────────
  const beautiCnt = (state.stateLog || []).filter(s => s.state === 'beautiful').length
  const sufferCnt = (state.stateLog || []).filter(s => s.state === 'suffering').length
  const totalStates = beautiCnt + sufferCnt
  const beautiPct = totalStates > 0 ? Math.round((beautiCnt / totalStates) * 100) : 0

  // Monthly breakdown
  const monthlyStates = useMemo(() => {
    const months = {}
    ;(state.stateLog || []).forEach(s => {
      const m = s.date.slice(0, 7)
      if (!months[m]) months[m] = { beautiful: 0, suffering: 0 }
      months[m][s.state] = (months[m][s.state] || 0) + 1
    })
    return Object.entries(months).sort().slice(-6)
  }, [state.stateLog])

  // ── Wheel of Life ─────────────────────────────────────────
  const firstWheel = (state.wheelHistory || [])[0]
  const latestWheel = (state.wheelHistory || []).slice(-1)[0]
  const wheelAreas = WHEEL_AREAS[lang]

  // ── Goals ────────────────────────────────────────────────
  const goals = state.goals || []
  const completionRate = goals.length > 0 ? Math.round((goalsCompleted / goals.length) * 100) : 0
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((a, g) => a + (g.progress || 0), 0) / goals.length) : 0

  // ── Journey Milestones ────────────────────────────────────
  const milestones = useMemo(() => {
    const ms = []
    const firstState = (state.stateLog || []).sort((a, b) => a.date.localeCompare(b.date))[0]
    const firstGoal = (state.goals || []).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))[0]

    if (firstState) ms.push({ date: firstState.date, label: isAr ? 'أول تسجيل حالة' : 'First state logged', emoji: '⚡' })
    if (firstGoal) ms.push({ date: firstGoal.createdAt, label: isAr ? 'أول هدف' : 'First goal set', emoji: '🎯' })
    if (firstWheel) ms.push({ date: firstWheel.date, label: isAr ? 'أول عجلة حياة' : 'First wheel snapshot', emoji: '🔄' })
    if (state.letters?.length > 0) ms.push({ date: state.letters[0].writtenDate, label: isAr ? 'أول رسالة لنفسك' : 'First letter to self', emoji: '✉️' })

    return ms.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  }, [state, firstWheel, isAr])

  const overviewStats = [
    { label: isAr ? 'أيام في التطبيق' : 'Days in App', value: daysSinceFirst, color: '#c9a84c', emoji: '📅' },
    { label: isAr ? 'سلسلة الانتصار' : 'Current Streak', value: state.streak || 0, color: '#e67e22', emoji: '🔥' },
    { label: isAr ? 'انتصاراتي' : 'Total Wins', value: totalWins, color: '#2ecc71', emoji: '🏆' },
    { label: isAr ? 'أهداف مكتملة' : 'Goals Completed', value: goalsCompleted, color: '#3498db', emoji: '✅' },
    { label: isAr ? 'لقطات العجلة' : 'Wheel Snapshots', value: wheelSnapshots, color: '#9b59b6', emoji: '🔄' },
    { label: isAr ? 'رسائل مستقبلية' : 'Future Letters', value: (state.letters || []).length, color: '#e91e8c', emoji: '✉️' },
  ]

  return (
    <Layout title={t('stats_title')} subtitle={t('stats_subtitle')} helpKey="stats">
      <div className="space-y-4 pt-2">

        {/* 1. Overview */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
            ✦ {isAr ? 'نظرة عامة' : 'Overview'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {overviewStats.map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5 leading-tight" style={{ color: '#888', fontSize: 9 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Emotional State */}
        {totalStates > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              ⚡ {isAr ? 'الحالة العاطفية' : 'Emotional State'}
            </p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)' }}>
                <p className="text-2xl font-black" style={{ color: '#2ecc71' }}>{beautiPct}%</p>
                <p className="text-xs mt-0.5" style={{ color: '#888' }}>{isAr ? 'جميلة' : 'Beautiful'}</p>
              </div>
              <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)' }}>
                <p className="text-2xl font-black" style={{ color: '#e63946' }}>{100 - beautiPct}%</p>
                <p className="text-xs mt-0.5" style={{ color: '#888' }}>{isAr ? 'معاناة' : 'Suffering'}</p>
              </div>
            </div>
            {monthlyStates.length > 0 && (
              <div>
                <p className="text-xs mb-2" style={{ color: '#888' }}>{isAr ? 'آخر 6 أشهر:' : 'Last 6 months:'}</p>
                <div className="space-y-2">
                  {monthlyStates.map(([month, data]) => {
                    const total = (data.beautiful || 0) + (data.suffering || 0)
                    const bPct = total > 0 ? Math.round(((data.beautiful || 0) / total) * 100) : 0
                    return (
                      <div key={month}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: '#888' }}>{month}</span>
                          <span style={{ color: '#2ecc71' }}>{bPct}%</span>
                        </div>
                        <div className="w-full rounded-full h-2 relative" style={{ background: '#e63946' }}>
                          <div className="h-2 rounded-full" style={{ width: `${bPct}%`, background: '#2ecc71' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Wheel of Life */}
        {!firstWheel ? (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              🔄 {isAr ? 'عجلة الحياة' : 'Wheel of Life'}
            </p>
            <div className="text-center py-4">
              <p className="text-3xl mb-2">🔄</p>
              <p className="text-sm font-bold text-white mb-1">
                {isAr ? 'لم تقيّم عجلة حياتك بعد' : 'No wheel snapshots yet'}
              </p>
              <p className="text-xs mb-3" style={{ color: '#666' }}>
                {isAr ? 'سجّل أول قياس لعجلة حياتك لترى تطورك هنا' : 'Record your first wheel snapshot to track progress here'}
              </p>
            </div>
          </div>
        ) : (firstWheel && latestWheel && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              🔄 {isAr ? 'عجلة الحياة' : 'Wheel of Life'}
            </p>
            <div className="flex gap-2 text-xs mb-3">
              <span className="rounded-full px-2 py-0.5" style={{ background: 'rgba(52,152,219,0.15)', color: '#3498db' }}>
                {isAr ? 'الأول:' : 'First:'} {firstWheel.date}
              </span>
              <span className="rounded-full px-2 py-0.5" style={{ background: 'rgba(46,204,113,0.15)', color: '#2ecc71' }}>
                {isAr ? 'الأخير:' : 'Latest:'} {latestWheel.date}
              </span>
            </div>
            <div className="space-y-2">
              {Object.entries(wheelAreas).map(([key, label]) => {
                const first = firstWheel.scores?.[key] || 0
                const latest = latestWheel.scores?.[key] || 0
                const diff = latest - first
                const color = diff > 0 ? '#2ecc71' : diff < 0 ? '#e63946' : '#888'
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: '#aaa' }}>{label}</span>
                      <span style={{ color }}>
                        {first} → {latest} {diff > 0 ? `+${diff}` : diff < 0 ? diff : '='}
                      </span>
                    </div>
                    <div className="w-full rounded-full h-1.5 relative" style={{ background: '#2a2a2a' }}>
                      <div className="h-1.5 rounded-full absolute" style={{ width: `${first * 10}%`, background: '#444' }} />
                      <div className="h-1.5 rounded-full" style={{ width: `${latest * 10}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* 4. Goals */}
        {goals.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              🎯 {isAr ? 'الأهداف' : 'Goals'}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: isAr ? 'إجمالي' : 'Total', value: goals.length, color: '#3498db' },
                { label: isAr ? 'مكتملة' : 'Completed', value: goalsCompleted, color: '#2ecc71' },
                { label: isAr ? 'متوسط تقدم' : 'Avg Progress', value: `${avgProgress}%`, color: '#c9a84c' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#888', fontSize: 9 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <StatBar value={completionRate} max={100} color="#2ecc71" label={isAr ? 'نسبة الإنجاز' : 'Completion Rate'} />
            <div className="mt-1 text-xs text-center" style={{ color: '#888' }}>{completionRate}%</div>
          </div>
        )}

        {/* 5. Energy / Activity */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
            ⚡ {isAr ? 'نشاطي' : 'My Activity'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: isAr ? 'تحديات منجزة' : 'Challenges Done', value: Object.keys((state.dailyChallenges?.completed) || {}).length, color: '#e67e22' },
              { label: isAr ? 'صباح مكتمل' : 'Mornings Done', value: state.morningDone ? 1 : 0, color: '#c9a84c' },
              { label: isAr ? 'انعكاسات أسبوعية' : 'Weekly Reviews', value: (state.weeklyReflections || []).length, color: '#3498db' },
              { label: isAr ? 'أيام بيانات الطاقة' : 'Energy Days', value: Object.keys(state.energyProtocol || {}).length, color: '#2ecc71' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5 leading-tight" style={{ color: '#888', fontSize: 9 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Journey Timeline */}
        {milestones.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#c9a84c' }}>
              🚀 {isAr ? 'رحلتك' : 'Your Journey'}
            </p>
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-4 w-px" style={{ background: 'rgba(201,168,76,0.2)' }} />
              <div className="space-y-4">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                      style={{ background: '#1a1a1a', border: '2px solid rgba(201,168,76,0.4)' }}>
                      <span className="text-base">{m.emoji}</span>
                    </div>
                    <div className="flex-1 pb-1">
                      <p className="text-sm font-bold text-white">{m.label}</p>
                      <p className="text-xs" style={{ color: '#888' }}>{m.date}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                    style={{ background: 'rgba(201,168,76,0.2)', border: '2px solid #c9a84c' }}>
                    <span className="text-base">⭐</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                      {isAr ? 'اليوم — استمر!' : 'Today — Keep Going!'}
                    </p>
                    <p className="text-xs" style={{ color: '#888' }}>{today}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational summary */}
            <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <p className="text-xs text-center" style={{ color: '#c9a84c' }}>
                {daysSinceFirst > 30
                  ? (isAr ? `🏆 أكثر من شهر في الرحلة — أنت مقاتل حقيقي!` : `🏆 Over a month in the journey — you're a true warrior!`)
                  : daysSinceFirst > 7
                  ? (isAr ? `🔥 ${daysSinceFirst} يوماً في الرحلة — الزخم يبنيه الاستمرار!` : `🔥 ${daysSinceFirst} days in — momentum is built by consistency!`)
                  : (isAr ? '⚡ بداية الرحلة — كل خطوة تبني الإنسان الاستثنائي!' : '⚡ Journey beginning — every step builds the extraordinary self!')}
              </p>
            </div>
          </div>
        )}

        {milestones.length === 0 && (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm" style={{ color: '#555' }}>
              {isAr ? 'ابدأ استخدام التطبيق لرؤية إحصائياتك' : 'Start using the app to see your statistics'}
            </p>
          </div>
        )}

      </div>
    </Layout>
  )
}
