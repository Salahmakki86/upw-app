/**
 * #1 — "Discovery of the Day" Smart Insight Engine
 * Analyzes user state data to find meaningful correlations and patterns
 */

export function getDailyInsight(state, lang) {
  const isAr = lang === 'ar'
  const today = new Date().toISOString().slice(0, 10)
  const insights = []

  // Helper: get last N days
  const lastNDays = (n) => Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })

  const last14 = lastNDays(14)
  const last30 = lastNDays(30)

  // ── Sleep → State Correlation ──────────────────────────────
  const sleepLog = state.sleepLog || {}
  const stateLog = state.stateLog || []
  const stateByDate = {}
  stateLog.forEach(s => { stateByDate[s.date] = s.state })

  const goodSleepDays = last30.filter(d => sleepLog[d]?.hours >= 7)
  const goodSleepBeautiful = goodSleepDays.filter(d => stateByDate[d] === 'beautiful').length
  if (goodSleepDays.length >= 5) {
    const pct = Math.round((goodSleepBeautiful / goodSleepDays.length) * 100)
    if (pct >= 60) {
      insights.push({
        emoji: '😴',
        textAr: `عندما تنام ٧+ ساعات، حالتك "جميلة" ${pct}% من الوقت!`,
        textEn: `When you sleep 7+ hours, your state is "beautiful" ${pct}% of the time!`,
        color: '#9b59b6',
        priority: 9,
      })
    }
  }

  // ── Morning Ritual → Productive Days ──────────────────────
  const morningDays = last30.filter(d => {
    const log = state.habitTracker?.log?.[d]
    return log && log.length > 0
  })
  const morningAndBeautiful = last30.filter(d =>
    stateByDate[d] === 'beautiful' && (state.habitTracker?.log?.[d] || []).length > 0
  ).length
  if (morningDays.length >= 5 && morningAndBeautiful > 0) {
    const pct = Math.round((morningAndBeautiful / morningDays.length) * 100)
    if (pct >= 50) {
      insights.push({
        emoji: '⚡',
        textAr: `أيام العادات = أيام الطاقة! ${pct}% من أيام العادات كانت "جميلة"`,
        textEn: `Habit days = energy days! ${pct}% of habit days were "beautiful"`,
        color: '#2ecc71',
        priority: 8,
      })
    }
  }

  // ── Gratitude Streak Power ─────────────────────────────────
  const gratitude = state.gratitude || {}
  const gratDays = last14.filter(d => (gratitude[d] || []).filter(Boolean).length >= 3)
  if (gratDays.length >= 5) {
    insights.push({
      emoji: '🙏',
      textAr: `كتبت الامتنان ${gratDays.length} يوم من آخر ١٤ يوم — عقلك يتحول!`,
      textEn: `You wrote gratitude ${gratDays.length} of the last 14 days — your mind is transforming!`,
      color: '#f1c40f',
      priority: 7,
    })
  }

  // ── Win Pattern Analysis ──────────────────────────────────
  const dailyWins = state.dailyWins || {}
  const totalWins14 = last14.reduce((sum, d) => sum + (dailyWins[d] || []).length, 0)
  if (totalWins14 >= 10) {
    insights.push({
      emoji: '🏆',
      textAr: `${totalWins14} انتصار في آخر أسبوعين! أنت تبني زخماً حقيقياً`,
      textEn: `${totalWins14} wins in the last 2 weeks! You're building real momentum`,
      color: '#c9a84c',
      priority: 7,
    })
  }

  // ── Streak Power ──────────────────────────────────────────
  const streak = state.streak || 0
  if (streak >= 7 && streak < 30) {
    insights.push({
      emoji: '🔥',
      textAr: `${streak} يوم متواصل! بعد ٢١ يوم تصبح عادة — باقي ${21 - streak > 0 ? 21 - streak : '!'}`,
      textEn: `${streak} day streak! After 21 days it becomes a habit — ${21 - streak > 0 ? 21 - streak + ' to go' : 'you made it!'}`,
      color: '#e67e22',
      priority: streak >= 14 ? 9 : 6,
    })
  }

  // ── Wheel of Life Insight ─────────────────────────────────
  const scores = state.wheelScores || {}
  const scoreValues = Object.values(scores).filter(v => v !== 5)
  if (scoreValues.length > 0) {
    const min = Math.min(...Object.values(scores))
    const max = Math.max(...Object.values(scores))
    const gap = max - min
    if (gap >= 5) {
      const AREA_NAMES = {
        body: { ar: 'الصحة', en: 'Health' },
        emotions: { ar: 'العواطف', en: 'Emotions' },
        relationships: { ar: 'العلاقات', en: 'Relationships' },
        time: { ar: 'الوقت', en: 'Time' },
        career: { ar: 'المهنة', en: 'Career' },
        money: { ar: 'المال', en: 'Money' },
        contribution: { ar: 'المساهمة', en: 'Contribution' },
      }
      const minKey = Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b)[0]
      const areaName = AREA_NAMES[minKey]?.[lang] || minKey
      insights.push({
        emoji: '⚙️',
        textAr: `فجوة ${gap} نقاط بين أعلى وأدنى مجال — ركّز على "${areaName}" لتوازن حياتك`,
        textEn: `${gap}-point gap between highest and lowest area — focus on "${areaName}" to balance your life`,
        color: '#e63946',
        priority: 8,
      })
    }
  }

  // ── Sleep Quality Trend ───────────────────────────────────
  const last7Sleep = lastNDays(7).map(d => sleepLog[d]?.hours).filter(Boolean)
  if (last7Sleep.length >= 3) {
    const avgSleep = (last7Sleep.reduce((a, b) => a + b, 0) / last7Sleep.length).toFixed(1)
    if (avgSleep < 6.5) {
      insights.push({
        emoji: '⚠️',
        textAr: `معدل نومك ${avgSleep} ساعة فقط! النوم أساس كل شيء`,
        textEn: `Your average sleep is only ${avgSleep}h! Sleep is the foundation of everything`,
        color: '#e74c3c',
        priority: 10,
      })
    } else if (avgSleep >= 7.5) {
      insights.push({
        emoji: '💚',
        textAr: `معدل نومك ${avgSleep} ساعة — ممتاز! جسمك يستعيد طاقته بالكامل`,
        textEn: `Your average sleep is ${avgSleep}h — excellent! Your body is fully recovering`,
        color: '#2ecc71',
        priority: 5,
      })
    }
  }

  // ── Business Scorecard → State Correlation (#10) ────────
  const scorecard = state.businessScorecard || {}
  let beautifulRevenue = 0, beautifulBizDays = 0, otherRevenue = 0, otherBizDays = 0
  Object.entries(scorecard).forEach(([date, entry]) => {
    const rev = Number(entry.revenue) || 0
    if (stateByDate[date] === 'beautiful') { beautifulRevenue += rev; beautifulBizDays++ }
    else if (rev > 0) { otherRevenue += rev; otherBizDays++ }
  })
  if (beautifulBizDays >= 3 && otherBizDays >= 3) {
    const avgB = beautifulRevenue / beautifulBizDays
    const avgO = otherRevenue / otherBizDays
    if (avgB > avgO * 1.15) {
      const pct = Math.round(((avgB - avgO) / avgO) * 100)
      insights.push({
        emoji: '💼',
        textAr: `أيام "الحالة الجميلة" = إيرادات أعلى بـ ${pct}%! حالتك تصنع أرباحك`,
        textEn: `"Beautiful state" days = ${pct}% higher revenue! Your state creates your profit`,
        color: '#c9a84c',
        priority: 10,
      })
    }
  }

  // ── Power Hour Streak ─────────────────────────────────────
  const powerHour = state.powerHour || {}
  const phStreak = (() => {
    let c = 0; const cur = new Date()
    while (powerHour[cur.toISOString().slice(0, 10)]?.completedAt) { c++; cur.setDate(cur.getDate() - 1) }
    return c
  })()
  if (phStreak >= 3) {
    insights.push({
      emoji: '⏱',
      textAr: `${phStreak} يوم من ساعة القوة — التركيز العميق يصنع نتائج استثنائية!`,
      textEn: `${phStreak} days of Power Hour — deep focus creates extraordinary results!`,
      color: '#e67e22',
      priority: 7,
    })
  }

  // ── Goal Progress Momentum ────────────────────────────────
  const activeGoals = (state.goals || []).filter(g => (g.progress || 0) < 100)
  const goalsWithDailyLog = activeGoals.filter(g => g.dailyLog?.[today]?.done)
  if (activeGoals.length > 0 && goalsWithDailyLog.length > 0) {
    insights.push({
      emoji: '🎯',
      textAr: `عملت على ${goalsWithDailyLog.length} هدف اليوم — كل خطوة تقربك!`,
      textEn: `You worked on ${goalsWithDailyLog.length} goal today — every step counts!`,
      color: '#3498db',
      priority: 6,
    })
  }

  // Sort by priority and pick one (rotating daily)
  insights.sort((a, b) => b.priority - a.priority)
  if (insights.length === 0) {
    return {
      emoji: '💡',
      text: isAr
        ? 'أكمل مهامك اليوم لنكشف لك أنماطاً مذهلة في بياناتك!'
        : 'Complete your tasks today and we\'ll reveal amazing patterns in your data!',
      color: '#c9a84c',
    }
  }

  // Rotate through top insights daily
  const dayIndex = new Date().getDate() % Math.min(insights.length, 3)
  const chosen = insights[dayIndex] || insights[0]
  return {
    emoji: chosen.emoji,
    text: isAr ? chosen.textAr : chosen.textEn,
    color: chosen.color,
  }
}
