/**
 * Fix #9 — Business Intelligence Engine
 * Transforms raw business data into actionable insights.
 * No more "just forms" — every business feature gets smart analysis.
 */

/**
 * Analyze business scorecard data for trends and insights
 */
export function analyzeScorecardTrends(scorecard, isAr) {
  const entries = Object.entries(scorecard || {}).sort(([a], [b]) => a.localeCompare(b))
  if (entries.length < 3) return null

  const last7 = entries.slice(-7)
  const prev7 = entries.slice(-14, -7)

  const sum = (arr, key) => arr.reduce((s, [, e]) => s + (Number(e[key]) || 0), 0)
  const avg = (arr, key) => arr.length > 0 ? sum(arr, key) / arr.length : 0

  const currentRevenue = sum(last7, 'revenue')
  const previousRevenue = sum(prev7, 'revenue')
  const revenueTrend = previousRevenue > 0
    ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
    : 0

  const currentLeads = sum(last7, 'leads')
  const previousLeads = sum(prev7, 'leads')
  const leadsTrend = previousLeads > 0
    ? Math.round(((currentLeads - previousLeads) / previousLeads) * 100)
    : 0

  const avgCalls = avg(last7, 'calls')
  const avgLeads = avg(last7, 'leads')
  const conversionRate = avgCalls > 0 ? Math.round((avgLeads / avgCalls) * 100) : 0

  // Best lead source analysis
  const sourceCounts = {}
  entries.forEach(([, e]) => {
    if (e.source) sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1
  })
  const bestSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]

  // Revenue by source
  const revenueBySource = {}
  entries.forEach(([, e]) => {
    if (e.source && e.revenue) {
      revenueBySource[e.source] = (revenueBySource[e.source] || 0) + Number(e.revenue)
    }
  })
  const topRevenueSource = Object.entries(revenueBySource).sort((a, b) => b[1] - a[1])[0]

  // Best day of week
  const revenueByDay = [0, 0, 0, 0, 0, 0, 0]
  const countByDay = [0, 0, 0, 0, 0, 0, 0]
  entries.forEach(([date, e]) => {
    const day = new Date(date).getDay()
    revenueByDay[day] += Number(e.revenue) || 0
    countByDay[day]++
  })
  const avgByDay = revenueByDay.map((r, i) => countByDay[i] > 0 ? r / countByDay[i] : 0)
  const bestDayIdx = avgByDay.indexOf(Math.max(...avgByDay))
  const dayNames = isAr
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return {
    currentRevenue,
    previousRevenue,
    revenueTrend,
    currentLeads,
    leadsTrend,
    conversionRate,
    avgCalls: Math.round(avgCalls * 10) / 10,
    bestSource: bestSource?.[0] || null,
    topRevenueSource: topRevenueSource?.[0] || null,
    bestDay: dayNames[bestDayIdx],
    totalEntries: entries.length,
  }
}

/**
 * Generate actionable recommendations from business data
 */
export function generateBizRecommendations(state, isAr) {
  const recs = []
  const scorecard = state.businessScorecard || {}
  const pipeline = state.salesPipeline || { deals: [], closedLost: [] }
  const entries = Object.entries(scorecard).sort(([a], [b]) => a.localeCompare(b))

  // 1. Low conversion rate alert
  const last7Entries = entries.slice(-7)
  const totalCalls = last7Entries.reduce((s, [, e]) => s + (Number(e.calls) || 0), 0)
  const totalLeads = last7Entries.reduce((s, [, e]) => s + (Number(e.leads) || 0), 0)
  const convRate = totalCalls > 0 ? (totalLeads / totalCalls) * 100 : 0

  if (totalCalls >= 10 && convRate < 15) {
    recs.push({
      type: 'warning',
      emoji: '📞',
      titleAr: 'نسبة تحويل منخفضة',
      titleEn: 'Low Conversion Rate',
      textAr: `نسبة تحويل المكالمات ${Math.round(convRate)}% — جرّب تحسين النص الافتتاحي أو تأهيل العملاء قبل الاتصال`,
      textEn: `Call conversion at ${Math.round(convRate)}% — try improving your opening script or pre-qualifying leads`,
      actionRoute: '/biz-scorecard',
      priority: 9,
    })
  }

  // 2. Pipeline bottleneck detection
  const deals = pipeline.deals || []
  const stageCounts = { prospects: 0, leads: 0, appointments: 0, proposals: 0, closed_won: 0 }
  deals.forEach(d => { if (stageCounts[d.stage] !== undefined) stageCounts[d.stage]++ })

  // Find bottleneck: big drop between stages
  const stageKeys = ['prospects', 'leads', 'appointments', 'proposals', 'closed_won']
  for (let i = 0; i < stageKeys.length - 1; i++) {
    const current = stageCounts[stageKeys[i]]
    const next = stageCounts[stageKeys[i + 1]]
    if (current >= 3 && next === 0) {
      const stageNameAr = { prospects: 'المحتملون', leads: 'المهتمون', appointments: 'المواعيد', proposals: 'العروض' }
      const stageNameEn = { prospects: 'Prospects', leads: 'Leads', appointments: 'Appointments', proposals: 'Proposals' }
      recs.push({
        type: 'bottleneck',
        emoji: '🚧',
        titleAr: `عنق زجاجة: ${stageNameAr[stageKeys[i]]}`,
        titleEn: `Bottleneck: ${stageNameEn[stageKeys[i]]}`,
        textAr: `لديك ${current} في مرحلة "${stageNameAr[stageKeys[i]]}" لكن صفر في المرحلة التالية — ركّز على تحريكهم`,
        textEn: `You have ${current} in "${stageNameEn[stageKeys[i]]}" but zero in the next stage — focus on moving them forward`,
        actionRoute: '/pipeline',
        priority: 10,
      })
      break
    }
  }

  // 3. Stale deals (no movement in 14+ days)
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
  const twoWeeksStr = twoWeeksAgo.toISOString().slice(0, 10)
  const staleDeals = deals.filter(d => d.movedAt && d.movedAt < twoWeeksStr && d.stage !== 'closed_won')
  if (staleDeals.length > 0) {
    recs.push({
      type: 'warning',
      emoji: '⏳',
      titleAr: `${staleDeals.length} صفقة راكدة`,
      titleEn: `${staleDeals.length} stale deal${staleDeals.length > 1 ? 's' : ''}`,
      textAr: 'صفقات لم تتحرك منذ أسبوعين — تابعها أو أغلقها',
      textEn: 'Deals with no movement for 2+ weeks — follow up or close them',
      actionRoute: '/pipeline',
      priority: 8,
    })
  }

  // 4. No scorecard entries today
  const today = new Date().toISOString().slice(0, 10)
  if (!scorecard[today] && entries.length > 0) {
    recs.push({
      type: 'reminder',
      emoji: '📝',
      titleAr: 'لم تسجّل بيانات اليوم',
      titleEn: 'No scorecard entry today',
      textAr: 'سجّل مكالماتك وعملاءك وإيراداتك — التتبع أساس التحسين',
      textEn: 'Log your calls, leads, and revenue — tracking is the foundation of improvement',
      actionRoute: '/biz-scorecard',
      priority: 7,
    })
  }

  // 5. Positive: Revenue growing
  if (entries.length >= 14) {
    const last7Rev = entries.slice(-7).reduce((s, [, e]) => s + (Number(e.revenue) || 0), 0)
    const prev7Rev = entries.slice(-14, -7).reduce((s, [, e]) => s + (Number(e.revenue) || 0), 0)
    if (last7Rev > prev7Rev * 1.15) {
      recs.push({
        type: 'success',
        emoji: '📈',
        titleAr: 'الإيرادات ترتفع!',
        titleEn: 'Revenue is climbing!',
        textAr: `نمو ${Math.round(((last7Rev - prev7Rev) / Math.max(prev7Rev, 1)) * 100)}% هذا الأسبوع — استمر في نفس الإيقاع`,
        textEn: `${Math.round(((last7Rev - prev7Rev) / Math.max(prev7Rev, 1)) * 100)}% growth this week — keep this momentum`,
        priority: 5,
      })
    }
  }

  return recs.sort((a, b) => b.priority - a.priority)
}

/**
 * Generate pipeline health score (0-100)
 */
export function getPipelineHealth(pipeline) {
  const deals = pipeline?.deals || []
  if (deals.length === 0) return { score: 0, label: 'empty' }

  let score = 0

  // Has deals in multiple stages (diversity)
  const stages = new Set(deals.map(d => d.stage))
  score += Math.min(25, stages.size * 6)

  // Has recent movement
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const recentMoves = deals.filter(d => d.movedAt && d.movedAt >= oneWeekAgo.toISOString().slice(0, 10))
  score += Math.min(25, recentMoves.length * 5)

  // Has closed deals
  const closedWon = deals.filter(d => d.stage === 'closed_won')
  score += Math.min(25, closedWon.length * 5)

  // Has pipeline value
  const totalValue = deals.reduce((s, d) => s + (Number(d.value) || 0), 0)
  if (totalValue > 0) score += 15
  if (totalValue > 10000) score += 10

  return {
    score: Math.min(100, score),
    label: score >= 70 ? 'healthy' : score >= 40 ? 'moderate' : 'needs-work',
  }
}
