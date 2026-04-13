/**
 * Business Intelligence Dashboard
 * Connects ALL business data in one unified command center
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'
import { analyzeScorecardTrends, generateBizRecommendations, getPipelineHealth } from '../utils/bizIntelligence'

const SKILL_DEFS = [
  { key: 'sales',       emoji: '💰', en: 'Sales',       ar: 'المبيعات',   color: '#c9a84c' },
  { key: 'marketing',   emoji: '📢', en: 'Marketing',   ar: 'التسويق',    color: '#3498db' },
  { key: 'leadership',  emoji: '👑', en: 'Leadership',  ar: 'القيادة',    color: '#9b59b6' },
  { key: 'negotiation', emoji: '🤝', en: 'Negotiation', ar: 'التفاوض',   color: '#e67e22' },
  { key: 'execution',   emoji: '⚡', en: 'Execution',   ar: 'التنفيذ',    color: '#2ecc71' },
]

const PIPELINE_STAGES = [
  { key: 'prospects',    emoji: '🎯', en: 'Prospects',    ar: 'المحتملون',        color: '#3498db' },
  { key: 'leads',        emoji: '🧲', en: 'Leads',        ar: 'العملاء المهتمون', color: '#9b59b6' },
  { key: 'appointments', emoji: '📅', en: 'Appointments', ar: 'المواعيد',          color: '#e67e22' },
  { key: 'proposals',    emoji: '📋', en: 'Proposals',    ar: 'العروض',           color: '#f1c40f' },
  { key: 'closed_won',   emoji: '🏆', en: 'Closed Won',   ar: 'تم الإغلاق',       color: '#2ecc71' },
]

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_AR = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمس', 'جمع', 'سبت']

export default function BizDashboard() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const today = new Date().toISOString().slice(0, 10)

  // ── Data sources ──────────────────────────────────────────────
  const scorecard   = state.businessScorecard  || {}
  const powerLog    = state.powerHour          || {}
  const sprint      = state.sprint90           || {}
  const pipeline    = state.salesPipeline      || { deals: [], closedLost: [] }
  const skillStack  = state.skillStack         || {}
  const network     = state.networkTracker     || []
  const decisions   = state.decisionJournal    || []
  const stateLog    = state.stateLog           || []

  // ── Last 7 days ───────────────────────────────────────────────
  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  }), [])

  // ── Business Health Score (0-100) ─────────────────────────────
  const healthScore = useMemo(() => {
    let score = 0
    const todayEntry = scorecard[today] || {}
    if (Number(todayEntry.calls)   > 0) score += 15
    if (Number(todayEntry.leads)   > 0) score += 20
    if (Number(todayEntry.revenue) > 0) score += 25
    if (powerLog[today]?.completedAt)   score += 20
    if (sprint.startDate && sprint.weeks?.length > 0) score += 10
    const overdueCount = network.filter(c => c.nextFollowUp && c.nextFollowUp < today).length
    if (overdueCount === 0 && network.length > 0) score += 10
    return Math.min(100, score)
  }, [scorecard, today, powerLog, sprint, network])

  const healthColor = healthScore >= 70 ? '#2ecc71' : healthScore >= 40 ? '#f1c40f' : '#e74c3c'
  const healthLabel = isAr
    ? (healthScore >= 70 ? 'صحي جداً' : healthScore >= 40 ? 'متوسط' : 'يحتاج تحسين')
    : (healthScore >= 70 ? 'Healthy' : healthScore >= 40 ? 'Moderate' : 'Needs Work')

  // ── Today's state ─────────────────────────────────────────────
  const todayState = useMemo(() => {
    const entry = [...stateLog].reverse().find(s => s.date === today)
    return entry?.state || 'unknown'
  }, [stateLog, today])

  const stateEmoji = todayState === 'beautiful' ? '🌟' : todayState === 'suffering' ? '😔' : '❓'
  const stateLabel = isAr
    ? (todayState === 'beautiful' ? 'حالة جميلة' : todayState === 'suffering' ? 'معاناة' : 'غير محدد')
    : (todayState === 'beautiful' ? 'Beautiful State' : todayState === 'suffering' ? 'Suffering' : 'Unknown')

  // ── KPI: This week's stats ────────────────────────────────────
  const weekStats = useMemo(() => {
    let revenue = 0, leads = 0, powerHours = 0
    last7.forEach(d => {
      const entry = scorecard[d]
      if (entry) {
        revenue    += Number(entry.revenue) || 0
        leads      += Number(entry.leads)   || 0
      }
      if (powerLog[d]?.completedAt) powerHours++
    })
    return { revenue, leads, powerHours }
  }, [scorecard, powerLog, last7])

  // ── Sprint progress ───────────────────────────────────────────
  const sprintData = useMemo(() => {
    const weeks      = sprint.weeks || []
    const doneWeeks  = weeks.filter(w => w.done).length
    const pct        = weeks.length > 0 ? Math.round((doneWeeks / weeks.length) * 100) : 0
    let daysRemaining = 90
    if (sprint.startDate) {
      const start = new Date(sprint.startDate)
      const end   = new Date(start); end.setDate(end.getDate() + 90)
      daysRemaining = Math.max(0, Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24)))
    }
    return { pct, daysRemaining, goal: sprint.goal || '', active: !!sprint.startDate }
  }, [sprint])

  // ── Pipeline ──────────────────────────────────────────────────
  const pipelineData = useMemo(() => {
    const deals = pipeline.deals || []
    const counts = {}
    PIPELINE_STAGES.forEach(s => { counts[s.key] = 0 })
    deals.forEach(d => { if (counts[d.stage] !== undefined) counts[d.stage]++ })
    const totalValue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
    return { counts, totalValue, total: deals.length }
  }, [pipeline])

  // ── Skill scores ──────────────────────────────────────────────
  const skillScores = useMemo(() => {
    const months = Object.keys(skillStack).sort().reverse()
    return months.length > 0 ? skillStack[months[0]] || {} : {}
  }, [skillStack])

  // ── State → Revenue correlation ───────────────────────────────
  const stateCorrelation = useMemo(() => {
    const stateByDate = {}
    stateLog.forEach(s => { stateByDate[s.date] = s.state })
    let beautifulRevenue = 0, beautifulDays = 0, otherRevenue = 0, otherDays = 0
    Object.entries(scorecard).forEach(([date, entry]) => {
      const rev = Number(entry.revenue) || 0
      if (stateByDate[date] === 'beautiful') { beautifulRevenue += rev; beautifulDays++ }
      else { otherRevenue += rev; otherDays++ }
    })
    if (beautifulDays >= 3 && otherDays >= 3) {
      const avgB = beautifulRevenue / beautifulDays
      const avgO = otherRevenue / otherDays
      if (avgB > avgO * 1.1) {
        return { pct: Math.round(((avgB - avgO) / Math.max(avgO, 1)) * 100), avgB: Math.round(avgB), avgO: Math.round(avgO) }
      }
    }
    return null
  }, [scorecard, stateLog])

  // ── Weekly insights ───────────────────────────────────────────
  const insights = useMemo(() => {
    // Best revenue day
    let bestDay = null, bestRev = 0
    last7.forEach(d => {
      const rev = Number(scorecard[d]?.revenue) || 0
      if (rev > bestRev) { bestRev = rev; bestDay = d }
    })
    const bestDayLabel = bestDay
      ? new Date(bestDay).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short' })
      : null

    // Calls vs leads conversion
    let totalCalls = 0, totalLeads = 0
    last7.forEach(d => {
      totalCalls += Number(scorecard[d]?.calls)  || 0
      totalLeads += Number(scorecard[d]?.leads)  || 0
    })
    const callsToLeads = totalCalls > 0 ? Math.round((totalLeads / totalCalls) * 100) : null

    // Power hour impact on calls
    let phCalls = 0, phDays = 0, nphCalls = 0, nphDays = 0
    last7.forEach(d => {
      const calls = Number(scorecard[d]?.calls) || 0
      if (powerLog[d]?.completedAt) { phCalls += calls; phDays++ }
      else { nphCalls += calls; nphDays++ }
    })
    const phAvg  = phDays  > 0 ? phCalls  / phDays  : 0
    const nphAvg = nphDays > 0 ? nphCalls / nphDays : 0
    const phImpact = phAvg > 0 && nphAvg > 0
      ? Math.round(((phAvg - nphAvg) / Math.max(nphAvg, 1)) * 100)
      : null

    return { bestDayLabel, bestRev, callsToLeads, phImpact, totalCalls, totalLeads }
  }, [scorecard, powerLog, last7, isAr])

  // ── Alerts ────────────────────────────────────────────────────
  const overdueContacts = useMemo(
    () => network.filter(c => c.nextFollowUp && c.nextFollowUp < today),
    [network, today]
  )

  const dueDecisions = useMemo(
    () => decisions.filter(d => !d.review && d.reviewDate && d.reviewDate <= today),
    [decisions, today]
  )

  // ── Fix #9 — Business Intelligence Engine ──────────────────────
  const scorecardTrends = useMemo(() => analyzeScorecardTrends(scorecard, isAr), [scorecard, isAr])
  const bizRecommendations = useMemo(() => generateBizRecommendations(state, isAr), [state, isAr])
  const pipelineHealthData = useMemo(() => getPipelineHealth(pipeline), [pipeline])

  // ── Helpers ───────────────────────────────────────────────────
  const cardStyle = {
    background: '#0e0e0e',
    border: '1px solid #1e1e1e',
    borderRadius: 16,
    padding: 16,
  }

  const sectionTitle = (icon, text) => (
    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
      {icon} {text}
    </p>
  )

  return (
    <Layout
      title={isAr ? 'لوحة الأعمال' : 'Business Dashboard'}
      subtitle={isAr ? 'كل بياناتك في مكان واحد' : 'All your business data in one view'}
    >
      <div className="space-y-4 pt-2" dir={isAr ? 'rtl' : 'ltr'}>

        {/* ── Alerts ─────────────────────────────────────────── */}
        {overdueContacts.length > 0 && (
          <div className="rounded-2xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)' }}>
            <span className="text-xl">🔴</span>
            <div>
              <p className="text-sm font-black" style={{ color: '#e74c3c' }}>
                {isAr
                  ? `${overdueContacts.length} جهات اتصال متأخرة للمتابعة`
                  : `${overdueContacts.length} contact${overdueContacts.length > 1 ? 's' : ''} overdue for follow-up`}
              </p>
              <p className="text-xs" style={{ color: '#e74c3c99' }}>
                {overdueContacts.slice(0, 3).map(c => c.name).join(', ')}
                {overdueContacts.length > 3 && ` +${overdueContacts.length - 3}`}
              </p>
            </div>
          </div>
        )}

        {dueDecisions.length > 0 && (
          <div className="rounded-2xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}>
            <span className="text-xl">⏰</span>
            <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>
              {isAr
                ? `${dueDecisions.length} قرار يحتاج مراجعة`
                : `${dueDecisions.length} decision${dueDecisions.length > 1 ? 's' : ''} due for review`}
            </p>
          </div>
        )}

        {/* ── Smart Recommendations (Fix #9 — Intelligence) ──── */}
        {bizRecommendations.length > 0 && (
          <div style={cardStyle} className="space-y-2">
            {sectionTitle('🧠', isAr ? 'توصيات ذكية' : 'Smart Recommendations')}
            {bizRecommendations.slice(0, 3).map((rec, i) => {
              const bgColor = rec.type === 'warning' ? 'rgba(231,76,60,0.06)'
                : rec.type === 'bottleneck' ? 'rgba(243,156,18,0.06)'
                : rec.type === 'success' ? 'rgba(46,204,113,0.06)'
                : 'rgba(201,168,76,0.06)'
              const borderColor = rec.type === 'warning' ? 'rgba(231,76,60,0.2)'
                : rec.type === 'bottleneck' ? 'rgba(243,156,18,0.2)'
                : rec.type === 'success' ? 'rgba(46,204,113,0.2)'
                : 'rgba(201,168,76,0.15)'
              const titleColor = rec.type === 'warning' ? '#e63946'
                : rec.type === 'bottleneck' ? '#f39c12'
                : rec.type === 'success' ? '#2ecc71'
                : '#c9a84c'
              return (
                <div key={i}
                  className="rounded-xl p-3"
                  style={{ background: bgColor, border: `1px solid ${borderColor}` }}
                  onClick={() => rec.actionRoute && navigate(rec.actionRoute)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{rec.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold" style={{ color: titleColor }}>
                        {isAr ? rec.titleAr : rec.titleEn}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#888' }}>
                        {isAr ? rec.textAr : rec.textEn}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Scorecard Trends (Fix #9) ─────────────────────── */}
        {scorecardTrends && (
          <div style={cardStyle}>
            {sectionTitle('📊', isAr ? 'اتجاهات البيانات' : 'Data Trends')}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2.5" style={{ background: '#111' }}>
                <p className="text-xs" style={{ color: '#666' }}>{isAr ? 'اتجاه الإيرادات' : 'Revenue Trend'}</p>
                <p className="text-sm font-black" style={{ color: scorecardTrends.revenueTrend >= 0 ? '#2ecc71' : '#e63946' }}>
                  {scorecardTrends.revenueTrend >= 0 ? '▲' : '▼'} {Math.abs(scorecardTrends.revenueTrend)}%
                </p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: '#111' }}>
                <p className="text-xs" style={{ color: '#666' }}>{isAr ? 'نسبة التحويل' : 'Conversion Rate'}</p>
                <p className="text-sm font-black" style={{ color: '#c9a84c' }}>
                  {scorecardTrends.conversionRate}%
                </p>
              </div>
              {scorecardTrends.bestSource && (
                <div className="rounded-lg p-2.5" style={{ background: '#111' }}>
                  <p className="text-xs" style={{ color: '#666' }}>{isAr ? 'أفضل مصدر' : 'Top Source'}</p>
                  <p className="text-sm font-bold" style={{ color: '#3498db' }}>
                    {scorecardTrends.bestSource}
                  </p>
                </div>
              )}
              {scorecardTrends.bestDay && (
                <div className="rounded-lg p-2.5" style={{ background: '#111' }}>
                  <p className="text-xs" style={{ color: '#666' }}>{isAr ? 'أفضل يوم' : 'Best Day'}</p>
                  <p className="text-sm font-bold" style={{ color: '#9b59b6' }}>
                    {scorecardTrends.bestDay}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Hero: Date + State + Health Score ──────────────── */}
        <div style={cardStyle}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs" style={{ color: '#555' }}>
                {new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl">{stateEmoji}</span>
                <span className="text-sm font-bold" style={{ color: '#ddd' }}>{stateLabel}</span>
              </div>
            </div>
            {/* Health Score ring */}
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center"
                style={{
                  width: 72, height: 72,
                  borderRadius: '50%',
                  background: `conic-gradient(${healthColor} ${healthScore * 3.6}deg, #1a1a1a 0deg)`,
                }}>
                <div className="flex flex-col items-center justify-center rounded-full"
                  style={{ width: 56, height: 56, background: '#0e0e0e' }}>
                  <span className="text-lg font-black" style={{ color: healthColor }}>{healthScore}</span>
                  <span style={{ fontSize: 8, color: '#555' }}>/100</span>
                </div>
              </div>
              <p className="text-xs mt-1 font-bold" style={{ color: healthColor }}>{healthLabel}</p>
            </div>
          </div>
        </div>

        {/* ── KPI Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: isAr ? 'إيرادات الأسبوع' : "Week's Revenue",
              value: `$${weekStats.revenue.toLocaleString()}`,
              color: '#c9a84c', emoji: '💰',
            },
            {
              label: isAr ? 'عملاء هذا الأسبوع' : "Week's Leads",
              value: weekStats.leads,
              color: '#2ecc71', emoji: '🧲',
            },
            {
              label: isAr ? 'ساعات قوة (الأسبوع)' : 'Power Hours (Week)',
              value: weekStats.powerHours,
              color: '#3498db', emoji: '⚡',
            },
            {
              label: isAr ? 'أيام Sprint المتبقية' : 'Sprint Days Left',
              value: sprintData.active ? sprintData.daysRemaining : '—',
              color: '#9b59b6', emoji: '🚀',
            },
          ].map((kpi, i) => (
            <div key={i} className="rounded-xl p-3"
              style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span>{kpi.emoji}</span>
                <span className="text-xs" style={{ color: '#666' }}>{kpi.label}</span>
              </div>
              <div className="text-xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* ── State → Revenue Correlation ─────────────────────── */}
        {stateCorrelation ? (
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)' }}>
            {sectionTitle('💡', isAr ? 'الحالة والإيرادات' : 'State & Revenue')}
            <p className="text-sm font-bold" style={{ color: '#2ecc71' }}>
              {isAr
                ? `أيام "الحالة الجميلة" = إيرادات أعلى بـ ${stateCorrelation.pct}% 🚀`
                : `"Beautiful state" days = ${stateCorrelation.pct}% higher revenue 🚀`}
            </p>
            <div className="flex gap-4 mt-2">
              <div className="text-xs" style={{ color: '#888' }}>
                🌟 {isAr ? 'حالة جميلة:' : 'Beautiful:'}{' '}
                <span className="font-bold" style={{ color: '#2ecc71' }}>${stateCorrelation.avgB.toLocaleString()}</span>
              </div>
              <div className="text-xs" style={{ color: '#888' }}>
                😐 {isAr ? 'غيرها:' : 'Other:'}{' '}
                <span className="font-bold" style={{ color: '#888' }}>${stateCorrelation.avgO.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-3"
            style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs" style={{ color: '#555' }}>
              💡 {isAr
                ? 'سجّل حالتك وإيراداتك لـ 3+ أيام لرؤية الارتباط'
                : 'Log your state & revenue for 3+ days to see the correlation'}
            </p>
          </div>
        )}

        {/* ── Pipeline Overview ────────────────────────────────── */}
        {pipelineData.total > 0 && (
          <div style={cardStyle}>
            {sectionTitle('🏗️', isAr ? 'نظرة على قمع المبيعات' : 'Pipeline Overview')}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-sm font-black" style={{ color: '#c9a84c' }}>
                ${pipelineData.totalValue.toLocaleString()}
              </span>
              <span className="text-xs" style={{ color: '#555' }}>
                · {pipelineData.total} {isAr ? 'صفقة' : 'deals'}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PIPELINE_STAGES.map(s => {
                const count = pipelineData.counts[s.key] || 0
                return (
                  <div key={s.key} className="flex flex-col items-center rounded-xl px-2.5 py-2 flex-shrink-0"
                    style={{ background: '#111', border: `1px solid ${s.color}22`, minWidth: 56 }}>
                    <span>{s.emoji}</span>
                    <span className="text-sm font-black" style={{ color: s.color }}>{count}</span>
                    <span style={{ fontSize: 9, color: '#555', whiteSpace: 'nowrap' }}>
                      {isAr ? s.ar : s.en}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Sprint90 Progress Bar ────────────────────────────── */}
        {sprintData.active && (
          <div style={cardStyle}>
            {sectionTitle('🚀', isAr ? 'تقدم سبرينت ٩٠' : 'Sprint 90 Progress')}
            {sprintData.goal && (
              <p className="text-sm font-bold text-white mb-2 leading-tight">{sprintData.goal}</p>
            )}
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span style={{ color: '#888' }}>{sprintData.pct}% {isAr ? 'مكتمل' : 'complete'}</span>
              <span style={{ color: '#666' }}>
                {sprintData.daysRemaining} {isAr ? 'يوم متبق' : 'days left'}
              </span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ background: '#1a1a1a', height: 10 }}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${sprintData.pct}%`,
                  background: 'linear-gradient(90deg, #c9a84c, #f1c40f)',
                }} />
            </div>
          </div>
        )}

        {/* ── Skill Stack Mini Bars ────────────────────────────── */}
        {Object.keys(skillScores).length > 0 && (
          <div style={cardStyle}>
            {sectionTitle('📊', isAr ? 'مستوى المهارات' : 'Skill Stack')}
            <div className="space-y-2">
              {SKILL_DEFS.map(skill => {
                const score = skillScores[skill.key] || 0
                return (
                  <div key={skill.key} className="flex items-center gap-2">
                    <span style={{ width: 20, textAlign: 'center' }}>{skill.emoji}</span>
                    <span className="text-xs" style={{ color: '#888', width: isAr ? 80 : 76, flexShrink: 0 }}>
                      {isAr ? skill.ar : skill.en}
                    </span>
                    <div className="flex-1 rounded-full overflow-hidden" style={{ background: '#1a1a1a', height: 8 }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${score * 10}%`, background: skill.color }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: skill.color, width: 20, textAlign: 'right' }}>
                      {score}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Weekly Insights ──────────────────────────────────── */}
        <div style={cardStyle}>
          {sectionTitle('🧠', isAr ? 'رؤى الأسبوع' : 'Weekly Insights')}
          <div className="space-y-2">
            {insights.bestDayLabel && insights.bestRev > 0 ? (
              <div className="flex items-start gap-2 rounded-xl p-2.5"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                <span>📅</span>
                <p className="text-xs" style={{ color: '#bbb' }}>
                  {isAr
                    ? `أفضل يوم إيراداً هذا الأسبوع: ${insights.bestDayLabel} (${insights.bestRev.toLocaleString()}$)`
                    : `Best revenue day this week: ${insights.bestDayLabel} ($${insights.bestRev.toLocaleString()})`}
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-xl p-2.5"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                <span>📅</span>
                <p className="text-xs" style={{ color: '#555' }}>
                  {isAr ? 'لا توجد بيانات إيرادات هذا الأسبوع' : 'No revenue logged this week yet'}
                </p>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-xl p-2.5"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}>
              <span>📞</span>
              <p className="text-xs" style={{ color: '#bbb' }}>
                {insights.callsToLeads !== null
                  ? (isAr
                    ? `تحويل المكالمات إلى عملاء: ${insights.callsToLeads}% (${insights.totalCalls} مكالمة → ${insights.totalLeads} عميل)`
                    : `Calls → Leads conversion: ${insights.callsToLeads}% (${insights.totalCalls} calls → ${insights.totalLeads} leads)`)
                  : (isAr ? 'سجّل مكالمات لرؤية نسبة التحويل' : 'Log calls to see conversion rate')}
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-xl p-2.5"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}>
              <span>⚡</span>
              <p className="text-xs" style={{ color: '#bbb' }}>
                {insights.phImpact !== null && insights.phImpact > 0
                  ? (isAr
                    ? `أيام ساعة القوة = مكالمات أكثر بـ ${insights.phImpact}% 💪`
                    : `Power hour days = ${insights.phImpact}% more calls 💪`)
                  : (isAr
                    ? 'أكمل ساعات قوة لمقارنة الأداء'
                    : 'Complete power hours to compare performance')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ────────────────────────────────────── */}
        <div style={cardStyle}>
          {sectionTitle('⚡', isAr ? 'إجراءات سريعة' : 'Quick Actions')}
          <div className="grid grid-cols-2 gap-2">
            {[
              { emoji: '📊', label: isAr ? 'سجّل اليوم'    : 'Log Today',   route: '/biz-scorecard', color: '#c9a84c' },
              { emoji: '🏗️', label: isAr ? 'قمع المبيعات'  : 'Pipeline',    route: '/pipeline',      color: '#3498db' },
              { emoji: '⚡', label: isAr ? 'ساعة القوة'    : 'Power Hour',  route: '/power-hour',    color: '#9b59b6' },
              { emoji: '🤝', label: isAr ? 'شبكة العلاقات' : 'Network',     route: '/network',       color: '#2ecc71' },
            ].map(action => (
              <button
                key={action.route}
                onClick={() => navigate(action.route)}
                className="rounded-xl p-3 text-left flex items-center gap-2 transition-all active:scale-95"
                style={{ background: '#111', border: `1px solid ${action.color}33` }}
              >
                <span className="text-lg">{action.emoji}</span>
                <span className="text-xs font-bold" style={{ color: action.color }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
