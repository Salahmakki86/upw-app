/**
 * Actionable Insight Engine
 * Data → Pattern → Interpretation → Decision → Action → Progress
 *
 * Self-contained — no imports except standard JS.
 * All text is bilingual (ar/en).
 */

// ── Helpers ──────────────────────────────────────────────────────────

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
}

function avg(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function daysBetween(dateStr, today) {
  const a = new Date(dateStr + 'T00:00:00')
  const b = new Date(today + 'T00:00:00')
  return Math.floor((b - a) / 86400000)
}

// Approximate Pearson r for two equal-length arrays
function pearsonR(x, y) {
  const n = x.length
  if (n < 3) return 0
  const mx = avg(x)
  const my = avg(y)
  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx
    const dy = y[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  return denom === 0 ? 0 : num / denom
}

// Execution rate for a single day (0-1)
function dayExecution(state, date) {
  let signals = 0
  let count = 0

  // Morning ritual
  count++
  if ((state.morningLog || []).includes(date)) signals++

  // Habits
  const habitList = state.habitTracker?.list || []
  const habitDone = (state.habitTracker?.log?.[date] || []).length
  if (habitList.length > 0) {
    count++
    signals += habitDone / habitList.length
  }

  // Goals worked on
  const activeGoals = (state.goals || []).filter(g => (g.progress || 0) < 100)
  if (activeGoals.length > 0) {
    count++
    const worked = activeGoals.filter(g => g.dailyLog?.[date]?.done).length
    signals += worked / activeGoals.length
  }

  return count === 0 ? 0 : signals / count
}

// ── 1. SLEEP PATTERN ─────────────────────────────────────────────────

function detectSleepPattern(state, isAr, today) {
  const days = lastNDays(10)
  const sleepLog = state.sleepLog || {}
  const checkin = state.stateCheckin || {}

  const lowSleepPerf = []
  const goodSleepPerf = []

  days.forEach(d => {
    const hours = sleepLog[d]?.hours
    if (hours == null) return

    // Performance = checkin avg or execution rate
    let perf
    if (checkin[d]) {
      perf = (checkin[d].energy + checkin[d].mood + checkin[d].clarity) / 3 * 10 // 0-100 scale
    } else {
      perf = dayExecution(state, d) * 100
    }

    if (hours < 6) lowSleepPerf.push(perf)
    else if (hours >= 7) goodSleepPerf.push(perf)
  })

  if (lowSleepPerf.length < 2 || goodSleepPerf.length < 2) return []

  const lowAvg = Math.round(avg(lowSleepPerf))
  const goodAvg = Math.round(avg(goodSleepPerf))
  const diff = goodAvg - lowAvg

  if (diff < 25) return []

  // Calculate current avg sleep
  const allHours = days.map(d => sleepLog[d]?.hours).filter(Boolean)
  const avgSleep = allHours.length > 0 ? +(avg(allHours).toFixed(1)) : 0

  return [{
    id: 'sleep_pattern',
    priority: 9,
    type: 'sleep',

    data: {
      metric: isAr ? 'معدل النوم' : 'Avg sleep',
      value: isAr ? `${avgSleep} ساعة` : `${avgSleep}h`,
    },

    insight: {
      emoji: '😴',
      text: isAr
        ? `في آخر ١٠ أيام، أيام النوم أقل من ٦ ساعات كان أداؤك ${lowAvg}%. أيام النوم الجيد = ${goodAvg}%`
        : `In the last 10 days, your performance on <6h sleep was ${lowAvg}%. On 7h+ sleep = ${goodAvg}%`,
    },

    decision: {
      question: isAr
        ? 'هل تريد تفعيل تذكير النوم؟'
        : 'Do you want to enable a bedtime reminder?',
      options: [
        {
          label: isAr ? 'نعم، الساعة ١٠ مساءً' : 'Yes, at 10 PM',
          action: 'enable_bedtime',
          stateKey: 'bedtimeReminder',
          stateValue: { enabled: true, time: '22:00', startDate: today },
        },
        {
          label: isAr ? 'لا شكراً' : 'No thanks',
          action: 'dismiss',
        },
      ],
    },

    progress: {
      metric: 'avg_sleep',
      metricLabel: isAr ? 'معدل النوم' : 'Avg sleep',
      baseline: avgSleep,
      checkAfterDays: 7,
      startDate: today,
    },
  }]
}

// ── 2. STALE GOAL COACHING ───────────────────────────────────────────

function detectGoalPatterns(state, isAr, today) {
  const goals = state.goals || []
  const staleGoals = goals.filter(g => {
    if ((g.progress || 0) >= 100) return false
    if (g.archived) return false
    const updated = g.updatedAt
    if (!updated) return true // never updated = stale
    const daysSince = daysBetween(
      typeof updated === 'number'
        ? new Date(updated).toISOString().slice(0, 10)
        : String(updated).slice(0, 10),
      today
    )
    return daysSince >= 14
  })

  if (staleGoals.length === 0) return []

  const goal = staleGoals[0]
  const goalName = goal.result || goal.name || (isAr ? 'هدفك' : 'Your goal')
  const updatedStr = goal.updatedAt
    ? (typeof goal.updatedAt === 'number'
        ? new Date(goal.updatedAt).toISOString().slice(0, 10)
        : String(goal.updatedAt).slice(0, 10))
    : null
  const staleDays = updatedStr ? daysBetween(updatedStr, today) : 30

  return [{
    id: `goal_stale_${goal.id || 0}`,
    priority: 8,
    type: 'goal',

    data: {
      metric: isAr ? 'تقدم الهدف' : 'Goal progress',
      value: `${goal.progress || 0}%`,
    },

    insight: {
      emoji: '🎯',
      text: isAr
        ? `هدفك "${goalName.slice(0, 40)}" متوقف منذ ${staleDays} يوم`
        : `Your goal "${goalName.slice(0, 40)}" has stalled for ${staleDays} days`,
    },

    decision: {
      question: isAr ? 'ما الذي يمنعك؟' : "What's blocking you?",
      options: [
        {
          label: isAr ? 'مشغول' : 'Too busy',
          action: 'busy',
          route: '/today',
        },
        {
          label: isAr ? 'فقدت الحماس' : 'Lost motivation',
          action: 'motivation',
          route: '/state',
        },
        {
          label: isAr ? 'الخطة غير واضحة' : 'Plan unclear',
          action: 'clarity',
          route: '/goals',
        },
        {
          label: isAr ? 'معتقد مقيّد' : 'Limiting belief',
          action: 'belief',
          route: '/beliefs',
          stateKey: 'goalBlocker',
          stateValue: { goalId: goal.id, blocker: 'belief', date: today },
        },
      ],
    },

    progress: {
      metric: `goal_progress_${goal.id || 0}`,
      metricLabel: isAr ? `تقدم: ${goalName.slice(0, 20)}` : `Progress: ${goalName.slice(0, 20)}`,
      baseline: goal.progress || 0,
      checkAfterDays: 7,
      startDate: today,
    },
  }]
}

// ── 3. IDENTITY-BEHAVIOR GAP ─────────────────────────────────────────

function detectIdentityGap(state, isAr, today) {
  const profile = state.identityProfile || state.onboardingProfile || {}
  const target = (profile.identity || profile.targetIdentity || '').toLowerCase()

  if (!target) return []

  // Map identity keywords to expected behaviors
  let expectedBehaviors = []
  let identityLabel = ''

  if (target.includes('قائد') || target.includes('leader')) {
    identityLabel = isAr ? 'القائد' : 'The Leader'
    expectedBehaviors = [
      { key: 'state_log', check: d => !!(state.stateCheckin?.[d] || (state.stateLog || []).find(s => s.date === d)) },
      { key: 'goal_work', check: d => (state.goals || []).some(g => g.dailyLog?.[d]?.done) },
    ]
  } else if (target.includes('رائد') || target.includes('entrepreneur') || target.includes('business')) {
    identityLabel = isAr ? 'رائد الأعمال' : 'The Entrepreneur'
    expectedBehaviors = [
      { key: 'biz_scorecard', check: d => !!(state.businessScorecard?.[d]) },
      { key: 'content_log', check: d => !!(state.contentLog?.[d]) || (state.dailyWins?.[d] || []).length > 0 },
    ]
  } else if (target.includes('صحة') || target.includes('health') || target.includes('fitness')) {
    identityLabel = isAr ? 'الشخص الصحي' : 'The Healthy Person'
    expectedBehaviors = [
      { key: 'sleep', check: d => !!(state.sleepLog?.[d]) },
      { key: 'habits', check: d => (state.habitTracker?.log?.[d] || []).length > 0 },
    ]
  } else {
    // Generic identity — expect basic engagement
    identityLabel = target.slice(0, 25)
    expectedBehaviors = [
      { key: 'state_log', check: d => !!(state.stateCheckin?.[d] || (state.stateLog || []).find(s => s.date === d)) },
      { key: 'habits', check: d => (state.habitTracker?.log?.[d] || []).length > 0 },
    ]
  }

  const days7 = lastNDays(7)
  let totalChecks = 0
  let totalMet = 0

  days7.forEach(d => {
    expectedBehaviors.forEach(b => {
      totalChecks++
      if (b.check(d)) totalMet++
    })
  })

  const alignment = totalChecks > 0 ? totalMet / totalChecks : 1
  const gapPct = Math.round((1 - alignment) * 100)
  const missedDays = 7 - days7.filter(d => expectedBehaviors.every(b => b.check(d))).length

  if (gapPct < 50) return []

  return [{
    id: 'identity_gap',
    priority: 7,
    type: 'identity',

    data: {
      metric: isAr ? 'توافق الهوية' : 'Identity alignment',
      value: `${Math.round(alignment * 100)}%`,
    },

    insight: {
      emoji: '🪞',
      text: isAr
        ? `${identityLabel} يتخذ قرارات يومياً — أنت لم تسجّل حالتك ${missedDays} أيام من آخر ٧`
        : `${identityLabel} makes daily decisions — you missed logging ${missedDays} of the last 7 days`,
    },

    decision: {
      question: isAr
        ? `ماذا سيفعل ${identityLabel} الآن؟`
        : `What would ${identityLabel} do right now?`,
      options: [
        {
          label: isAr ? 'تسجيل حالتي' : 'Log my state',
          action: 'log_state',
          route: '/state',
        },
        {
          label: isAr ? 'مراجعة أهدافي' : 'Review my goals',
          action: 'review_goals',
          route: '/goals',
        },
        {
          label: isAr ? 'البدء بالصباح' : 'Start morning ritual',
          action: 'morning',
          route: '/morning',
        },
      ],
    },

    progress: {
      metric: 'identity_alignment',
      metricLabel: isAr ? 'توافق الهوية' : 'Identity alignment',
      baseline: Math.round(alignment * 100),
      checkAfterDays: 7,
      startDate: today,
    },
  }]
}

// ── 4. BOOM-BUST CYCLE ───────────────────────────────────────────────

function detectBoomBust(state, isAr, today) {
  const days21 = lastNDays(21)

  // Classify each day as active or inactive
  const activity = days21.map(d => {
    const exec = dayExecution(state, d)
    return { date: d, active: exec > 0.3 }
  }).reverse() // chronological order

  // Detect boom-bust: runs of 3+ active then 2+ inactive, repeated 2+ times
  let boomBustCount = 0
  let i = 0
  let totalActiveDays = 0
  let totalInactiveDays = 0

  while (i < activity.length) {
    // Find active run
    let activeRun = 0
    while (i < activity.length && activity[i].active) {
      activeRun++
      i++
    }
    // Find inactive run
    let inactiveRun = 0
    while (i < activity.length && !activity[i].active) {
      inactiveRun++
      i++
    }

    if (activeRun >= 3 && inactiveRun >= 2) {
      boomBustCount++
      totalActiveDays += activeRun
      totalInactiveDays += inactiveRun
    }
  }

  if (boomBustCount < 2) return []

  const avgActive = Math.round(totalActiveDays / boomBustCount)
  const avgInactive = Math.round(totalInactiveDays / boomBustCount)

  return [{
    id: 'boom_bust',
    priority: 8,
    type: 'pattern',

    data: {
      metric: isAr ? 'نمط النشاط' : 'Activity pattern',
      value: isAr ? `${boomBustCount} دورات` : `${boomBustCount} cycles`,
    },

    insight: {
      emoji: '📊',
      text: isAr
        ? `لاحظنا نمط: تقوى ${avgActive} أيام ثم تتوقف ${avgInactive} أيام — هذا نمط الانفجار/الانهيار`
        : `Pattern detected: ${avgActive} active days then ${avgInactive} inactive — this is a boom/bust cycle`,
    },

    decision: {
      question: isAr
        ? 'هل تريد تقليل المهام اليومية من 7 إلى 3 الأسبوع القادم؟'
        : 'Want to reduce daily tasks from 7 to 3 next week?',
      options: [
        {
          label: isAr ? 'نعم، قلّل' : 'Yes, reduce',
          action: 'reduce',
          stateKey: 'reducedMode',
          stateValue: { enabled: true, startDate: today, tasks: 3 },
        },
        {
          label: isAr ? 'أبقِ كما هو' : 'Keep current',
          action: 'keep',
        },
      ],
    },

    progress: {
      metric: 'streak_stability',
      metricLabel: isAr ? 'استقرار النشاط' : 'Activity stability',
      baseline: boomBustCount,
      checkAfterDays: 14,
      startDate: today,
    },
  }]
}

// ── 5. STATE-PERFORMANCE CORRELATION ─────────────────────────────────

function detectStatePerformance(state, isAr, today) {
  const days14 = lastNDays(14)
  const checkin = state.stateCheckin || {}

  const stateScores = []
  const execScores = []

  days14.forEach(d => {
    if (!checkin[d]) return
    const stateAvg = (checkin[d].energy + checkin[d].mood + checkin[d].clarity) / 3
    const exec = dayExecution(state, d) * 10 // 0-10 scale
    stateScores.push(stateAvg)
    execScores.push(exec)
  })

  if (stateScores.length < 5) return []

  const r = pearsonR(stateScores, execScores)

  if (r < 0.5) return []

  // Calculate performance difference: high-state days vs low-state days
  let highStateExec = []
  let lowStateExec = []
  stateScores.forEach((s, i) => {
    if (s >= 8) highStateExec.push(execScores[i])
    else if (s < 6) lowStateExec.push(execScores[i])
  })

  const highAvg = highStateExec.length > 0 ? Math.round(avg(highStateExec) * 10) : 0
  const lowAvg = lowStateExec.length > 0 ? Math.round(avg(lowStateExec) * 10) : 0
  const diffPct = highAvg - lowAvg

  return [{
    id: 'state_performance',
    priority: 7,
    type: 'state',

    data: {
      metric: isAr ? 'ارتباط الحالة-الأداء' : 'State-performance link',
      value: `r=${r.toFixed(2)}`,
    },

    insight: {
      emoji: '⚡',
      text: isAr
        ? `عندما تبدأ يومك بحالة ٨+ من ١٠، أداؤك يرتفع ${diffPct > 0 ? diffPct + '%' : 'بشكل ملحوظ'}`
        : `When you start your day at 8+/10 state, your performance rises ${diffPct > 0 ? diffPct + '%' : 'significantly'}`,
    },

    decision: {
      question: isAr
        ? 'هل تريد البدء بتمرين الحالة الآن؟'
        : 'Want to start a state exercise now?',
      options: [
        {
          label: isAr ? 'نعم، ابدأ الآن' : 'Yes, start now',
          action: 'start_state',
          route: '/state',
        },
        {
          label: isAr ? 'لاحقاً' : 'Later',
          action: 'dismiss',
        },
      ],
    },

    progress: {
      metric: 'execution_rate',
      metricLabel: isAr ? 'معدل التنفيذ' : 'Execution rate',
      baseline: Math.round(avg(execScores) * 10),
      checkAfterDays: 7,
      startDate: today,
    },
  }]
}

// ── MAIN GENERATOR ───────────────────────────────────────────────────

/**
 * Returns array of actionable insights, sorted by priority (max 3).
 * Each insight contains: data, insight, decision, progress.
 */
export function generateActionableInsights(state, isAr) {
  const insights = []
  const today = new Date().toISOString().slice(0, 10)

  // 1. SLEEP PATTERN
  insights.push(...detectSleepPattern(state, isAr, today))

  // 2. STALE GOAL COACHING
  insights.push(...detectGoalPatterns(state, isAr, today))

  // 3. IDENTITY-BEHAVIOR GAP
  insights.push(...detectIdentityGap(state, isAr, today))

  // 4. BOOM-BUST CYCLE
  insights.push(...detectBoomBust(state, isAr, today))

  // 5. STATE-PERFORMANCE CORRELATION
  insights.push(...detectStatePerformance(state, isAr, today))

  return insights
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3) // max 3 insights at once
}

// ── PROGRESS CHECK ───────────────────────────────────────────────────

/**
 * Measure current value for a given metric key.
 */
function measureMetric(state, metric) {
  if (metric === 'avg_sleep') {
    const days7 = lastNDays(7)
    const sleepLog = state.sleepLog || {}
    const hours = days7.map(d => sleepLog[d]?.hours).filter(Boolean)
    return hours.length > 0 ? +(avg(hours).toFixed(1)) : 0
  }

  if (metric.startsWith('goal_progress_')) {
    const goalId = metric.replace('goal_progress_', '')
    const goal = (state.goals || []).find(g => String(g.id) === String(goalId))
    return goal ? (goal.progress || 0) : 0
  }

  if (metric === 'execution_rate') {
    const days7 = lastNDays(7)
    const rates = days7.map(d => dayExecution(state, d) * 100)
    return Math.round(avg(rates))
  }

  if (metric === 'identity_alignment') {
    const profile = state.identityProfile || state.onboardingProfile || {}
    const target = (profile.identity || profile.targetIdentity || '').toLowerCase()
    if (!target) return 0

    const days7 = lastNDays(7)
    let totalChecks = 0
    let totalMet = 0

    // Simplified alignment check
    days7.forEach(d => {
      totalChecks += 2
      if (state.stateCheckin?.[d] || (state.stateLog || []).find(s => s.date === d)) totalMet++
      if ((state.habitTracker?.log?.[d] || []).length > 0) totalMet++
    })

    return totalChecks > 0 ? Math.round((totalMet / totalChecks) * 100) : 0
  }

  if (metric === 'streak_stability') {
    // Lower = better (fewer boom-bust cycles)
    const days21 = lastNDays(21)
    const activity = days21.map(d => ({ active: dayExecution(state, d) > 0.3 })).reverse()
    let cycles = 0
    let i = 0
    while (i < activity.length) {
      let activeRun = 0
      while (i < activity.length && activity[i].active) { activeRun++; i++ }
      let inactiveRun = 0
      while (i < activity.length && !activity[i].active) { inactiveRun++; i++ }
      if (activeRun >= 3 && inactiveRun >= 2) cycles++
    }
    return cycles
  }

  return 0
}

/**
 * Check if a previous insight's progress period has elapsed.
 * Returns array of progress results to display.
 */
export function checkInsightProgress(state, isAr) {
  const log = state.insightActionsLog || {}
  const results = []
  const today = new Date()

  for (const [id, entry] of Object.entries(log)) {
    if (entry.completed) continue
    if (!entry.startDate || !entry.checkAfterDays) continue

    const start = new Date(entry.startDate + 'T00:00:00')
    const daysSince = Math.floor((today - start) / 86400000)

    if (daysSince >= entry.checkAfterDays) {
      const current = measureMetric(state, entry.metric)
      const baseline = entry.baseline ?? 0
      const isLowerBetter = entry.metric === 'streak_stability'
      const improved = isLowerBetter ? current < baseline : current > baseline
      const diff = isLowerBetter ? baseline - current : current - baseline

      results.push({
        id,
        improved,
        baseline,
        current,
        diff,
        text: isAr
          ? improved
            ? `${entry.metricLabel || entry.metric} تحسن بنسبة ${Math.abs(Math.round(diff))}% 🎉`
            : `${entry.metricLabel || entry.metric} لم يتحسن بعد — هل تريد تعديل المسار؟`
          : improved
            ? `${entry.metricLabel || entry.metric} improved by ${Math.abs(Math.round(diff))}% 🎉`
            : `${entry.metricLabel || entry.metric} hasn't improved yet — adjust your approach?`,
        emoji: improved ? '📈' : '🔄',
      })
    }
  }

  return results
}
