/**
 * #9 — Weekly User Summary (not just for coach)
 * Auto-generated weekly report card showing the user's own progress
 */
import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

export default function MyWeeklySummary() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const report = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i)
      return d.toISOString().slice(0, 10)
    })

    // Gratitude
    const gratitude = state.gratitude || {}
    const gratDays = last7.filter(d => (gratitude[d] || []).filter(Boolean).length >= 3).length

    // Habits
    const habitLog = state.habitTracker?.log || {}
    const habitDays = last7.filter(d => (habitLog[d] || []).length > 0).length
    const totalHabitsThisWeek = last7.reduce((sum, d) => sum + (habitLog[d] || []).length, 0)

    // Wins
    const wins = state.dailyWins || {}
    const totalWins = last7.reduce((sum, d) => sum + (wins[d] || []).length, 0)
    const winDays = last7.filter(d => (wins[d] || []).length > 0).length

    // Sleep
    const sleepLog = state.sleepLog || {}
    const sleepEntries = last7.map(d => sleepLog[d]).filter(Boolean)
    const avgSleep = sleepEntries.length > 0
      ? (sleepEntries.reduce((s, e) => s + (e.hours || 0), 0) / sleepEntries.length).toFixed(1)
      : null
    const avgQuality = sleepEntries.length > 0
      ? (sleepEntries.reduce((s, e) => s + (e.quality || 0), 0) / sleepEntries.length).toFixed(1)
      : null

    // State
    const stateLog = state.stateLog || []
    const weekStates = stateLog.filter(s => last7.includes(s.date))
    const beautifulDays = weekStates.filter(s => s.state === 'beautiful').length

    // Goals
    const goals = state.goals || []
    const activeGoals = goals.filter(g => (g.progress || 0) < 100)
    const goalsWorkedOn = activeGoals.filter(g => {
      return last7.some(d => g.dailyLog?.[d]?.done)
    }).length

    // Overall score (out of 7 categories)
    let score = 0
    if (gratDays >= 5) score++
    if (habitDays >= 5) score++
    if (totalWins >= 5) score++
    if (sleepEntries.length >= 5) score++
    if (beautifulDays >= 4) score++
    if (goalsWorkedOn > 0) score++
    if ((state.streak || 0) >= 7) score++

    // Grade
    const grade = score >= 6 ? 'A' : score >= 5 ? 'B' : score >= 3 ? 'C' : 'D'
    const gradeColor = score >= 6 ? '#2ecc71' : score >= 5 ? '#c9a84c' : score >= 3 ? '#e67e22' : '#e74c3c'

    return {
      gratDays, habitDays, totalHabitsThisWeek, totalWins, winDays,
      avgSleep, avgQuality, sleepDays: sleepEntries.length,
      beautifulDays, stateLoggedDays: weekStates.length,
      goalsWorkedOn, activeGoalsCount: activeGoals.length,
      streak: state.streak || 0,
      score, grade, gradeColor,
    }
  }, [state])

  const StatCard = ({ emoji, labelAr, labelEn, value, subAr, subEn, color }) => (
    <div className="rounded-xl p-3 text-center"
      style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <div className="text-lg mb-0.5">{emoji}</div>
      <div className="text-lg font-black" style={{ color }}>{value}</div>
      <div className="text-xs font-bold text-white">{isAr ? labelAr : labelEn}</div>
      {(subAr || subEn) && (
        <div className="text-xs mt-0.5" style={{ color: '#666' }}>{isAr ? subAr : subEn}</div>
      )}
    </div>
  )

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 6)
  const weekLabel = isAr
    ? `${weekStart.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} — ${new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}`
    : `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <Layout
      title={isAr ? 'تقرير أسبوعك' : 'Your Weekly Report'}
      subtitle={weekLabel}
    >
      <div className="space-y-4 pt-2">

        {/* Grade Card */}
        <div className="rounded-2xl p-6 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${report.gradeColor}10, ${report.gradeColor}05)`,
            border: `2px solid ${report.gradeColor}40`,
          }}>
          <div className="text-6xl font-black mb-1" style={{ color: report.gradeColor }}>
            {report.grade}
          </div>
          <p className="text-sm font-bold text-white mb-1">
            {report.score}/7 {isAr ? 'معايير محققة' : 'criteria met'}
          </p>
          <p className="text-xs" style={{ color: '#888' }}>
            {report.score >= 6
              ? (isAr ? 'أسبوع استثنائي! أنت في طريق التحول' : 'Exceptional week! You\'re on the path of transformation')
              : report.score >= 4
              ? (isAr ? 'أسبوع جيد — يمكنك أكثر!' : 'Good week — you can do more!')
              : (isAr ? 'أسبوع جديد = فرصة جديدة — ابدأ بقوة!' : 'New week = new opportunity — start strong!')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard emoji="🙏" labelAr="أيام الامتنان" labelEn="Gratitude Days"
            value={`${report.gratDays}/7`} color="#f1c40f" />
          <StatCard emoji="✅" labelAr="أيام العادات" labelEn="Habit Days"
            value={`${report.habitDays}/7`}
            subAr={`${report.totalHabitsThisWeek} عادة`} subEn={`${report.totalHabitsThisWeek} habits`}
            color="#2ecc71" />
          <StatCard emoji="🏆" labelAr="الانتصارات" labelEn="Wins"
            value={report.totalWins}
            subAr={`في ${report.winDays} يوم`} subEn={`in ${report.winDays} days`}
            color="#c9a84c" />
          <StatCard emoji="😴" labelAr="معدل النوم" labelEn="Avg Sleep"
            value={report.avgSleep ? `${report.avgSleep}h` : '—'}
            subAr={report.avgQuality ? `جودة: ${report.avgQuality}/10` : ''} subEn={report.avgQuality ? `Quality: ${report.avgQuality}/10` : ''}
            color="#9b59b6" />
          <StatCard emoji="✨" labelAr="أيام جميلة" labelEn="Beautiful Days"
            value={`${report.beautifulDays}/7`} color="#2ecc71" />
          <StatCard emoji="🎯" labelAr="أهداف نشطة" labelEn="Goals Worked"
            value={`${report.goalsWorkedOn}/${report.activeGoalsCount}`} color="#3498db" />
        </div>

        {/* Streak */}
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-lg font-black" style={{ color: '#c9a84c' }}>{report.streak} {isAr ? 'يوم متواصل' : 'day streak'}</p>
            <p className="text-xs" style={{ color: '#888' }}>
              {report.streak >= 21
                ? (isAr ? 'أصبحت عادة راسخة!' : 'This is now a solid habit!')
                : report.streak >= 7
                ? (isAr ? `باقي ${21 - report.streak} يوم لتصبح عادة` : `${21 - report.streak} days to make it a habit`)
                : (isAr ? 'استمر — كل يوم يبني الزخم' : 'Keep going — every day builds momentum')}
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(52,152,219,0.06)', border: '1px solid rgba(52,152,219,0.2)' }}>
          <p className="text-xs font-black mb-2" style={{ color: '#3498db' }}>
            💡 {isAr ? 'توصية الأسبوع القادم' : 'Next Week\'s Focus'}
          </p>
          <p className="text-sm text-white leading-relaxed">
            {report.gratDays < 5
              ? (isAr ? 'ركّز على الامتنان اليومي — ٣ أشياء كل يوم تغير كل شيء' : 'Focus on daily gratitude — 3 things every day changes everything')
              : report.habitDays < 5
              ? (isAr ? 'ثبّت عاداتك اليومية — الثبات يصنع التحول' : 'Solidify your daily habits — consistency creates transformation')
              : report.avgSleep && parseFloat(report.avgSleep) < 7
              ? (isAr ? 'حسّن نومك — كل شيء آخر يتحسن مع النوم الجيد' : 'Improve your sleep — everything else improves with good sleep')
              : report.goalsWorkedOn === 0
              ? (isAr ? 'اعمل على هدف واحد يومياً — خطوة واحدة كل يوم' : 'Work on one goal daily — one step every day')
              : (isAr ? 'استمر بنفس الزخم — أنت في المسار الصحيح!' : 'Keep this momentum — you\'re on the right track!')}
          </p>
        </div>
      </div>
    </Layout>
  )
}
