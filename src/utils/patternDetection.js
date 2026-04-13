/**
 * Pattern Detection Engine — Batch 3
 * Deep cross-data pattern analysis
 */

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
}

function dayOfWeek(dateStr) {
  return new Date(dateStr + 'T00:00:00').getDay() // 0=Sun ... 6=Sat
}

const DAY_NAMES_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Detect day-of-week patterns: which days are consistently best/worst
 */
export function detectDayPatterns(state) {
  const days30 = lastNDays(30)
  const stateByDate = {}
  ;(state.stateLog || []).forEach(s => { stateByDate[s.date] = s.state })
  const checkin = state.stateCheckin || {}

  // Aggregate scores per day of week
  const dayBuckets = Array.from({ length: 7 }, () => [])

  days30.forEach(date => {
    const dow = dayOfWeek(date)
    let score = 0
    if (checkin[date]) {
      score = (checkin[date].energy + checkin[date].mood + checkin[date].clarity) / 3
    } else if (stateByDate[date] === 'beautiful') {
      score = 8
    } else if (stateByDate[date] === 'suffering') {
      score = 3
    } else {
      return // no data
    }
    dayBuckets[dow].push(score)
  })

  const dayAvgs = dayBuckets.map((scores, dow) => ({
    dow,
    avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
    count: scores.length,
  })).filter(d => d.count >= 2) // need at least 2 data points

  if (dayAvgs.length < 3) return null

  const sorted = [...dayAvgs].sort((a, b) => (b.avg || 0) - (a.avg || 0))
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  if (!best || !worst || (best.avg - worst.avg) < 1) return null

  return {
    best: { dow: best.dow, avg: Math.round(best.avg * 10) / 10 },
    worst: { dow: worst.dow, avg: Math.round(worst.avg * 10) / 10 },
    gap: Math.round((best.avg - worst.avg) * 10) / 10,
    allDays: sorted,
  }
}

/**
 * Detect sleep-performance correlation
 */
export function detectSleepCorrelation(state) {
  const days30 = lastNDays(30)
  const sleepLog = state.sleepLog || {}
  const morningLog = state.morningLog || []
  const habitLog = state.habitTracker?.log || {}

  let goodSleepExecution = 0, goodSleepDays = 0
  let poorSleepExecution = 0, poorSleepDays = 0

  days30.forEach(date => {
    const hours = sleepLog[date]?.hours
    if (!hours) return

    const didMorning = morningLog.includes(date) ? 1 : 0
    const didHabits = (habitLog[date] || []).length > 0 ? 1 : 0
    const execution = (didMorning + didHabits) / 2

    if (hours >= 7) {
      goodSleepExecution += execution
      goodSleepDays++
    } else if (hours < 6) {
      poorSleepExecution += execution
      poorSleepDays++
    }
  })

  if (goodSleepDays < 3 || poorSleepDays < 3) return null

  const goodAvg = goodSleepExecution / goodSleepDays
  const poorAvg = poorSleepExecution / poorSleepDays
  const diff = Math.round((goodAvg - poorAvg) * 100)

  if (diff < 10) return null

  return {
    goodSleepExecRate: Math.round(goodAvg * 100),
    poorSleepExecRate: Math.round(poorAvg * 100),
    diff,
    goodSleepDays,
    poorSleepDays,
  }
}

/**
 * Detect "golden combinations" — what activities cluster on best days
 */
export function detectGoldenCombos(state) {
  const days30 = lastNDays(30)
  const stateByDate = {}
  ;(state.stateLog || []).forEach(s => { stateByDate[s.date] = s.state })
  const checkin = state.stateCheckin || {}

  const activities = {
    morning: { ar: 'الروتين الصباحي', en: 'Morning Ritual', emoji: '☀️' },
    habits: { ar: 'العادات', en: 'Habits', emoji: '✅' },
    gratitude: { ar: 'الامتنان', en: 'Gratitude', emoji: '🙏' },
    exercise: { ar: 'الرياضة', en: 'Exercise', emoji: '💪' },
    goodSleep: { ar: 'نوم ٧+', en: '7+ Sleep', emoji: '😴' },
    wins: { ar: 'الانتصارات', en: 'Wins', emoji: '🏆' },
  }

  const greatDayActivities = []
  const normalDayActivities = []

  days30.forEach(date => {
    let isGreat = false
    if (checkin[date]) {
      const avg = (checkin[date].energy + checkin[date].mood + checkin[date].clarity) / 3
      isGreat = avg >= 7
    } else if (stateByDate[date] === 'beautiful') {
      isGreat = true
    }

    const dayActs = []
    if ((state.morningLog || []).includes(date)) dayActs.push('morning')
    if ((state.habitTracker?.log?.[date] || []).length > 0) dayActs.push('habits')
    if (((state.gratitude?.[date]) || []).filter(Boolean).length >= 3) dayActs.push('gratitude')
    if (state.energyProtocol?.[date]?.movement) dayActs.push('exercise')
    if ((state.sleepLog?.[date]?.hours || 0) >= 7) dayActs.push('goodSleep')
    if ((state.dailyWins?.[date] || []).length > 0) dayActs.push('wins')

    if (dayActs.length === 0) return

    if (isGreat) greatDayActivities.push(dayActs)
    else normalDayActivities.push(dayActs)
  })

  if (greatDayActivities.length < 3) return null

  // Find pairs that appear together most in great days
  const pairCounts = {}
  greatDayActivities.forEach(acts => {
    for (let i = 0; i < acts.length; i++) {
      for (let j = i + 1; j < acts.length; j++) {
        const key = [acts[i], acts[j]].sort().join('+')
        pairCounts[key] = (pairCounts[key] || 0) + 1
      }
    }
  })

  const sortedPairs = Object.entries(pairCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count >= 2)
    .slice(0, 3)

  if (sortedPairs.length === 0) return null

  return sortedPairs.map(([pair, count]) => {
    const [a, b] = pair.split('+')
    return {
      combo: [activities[a], activities[b]],
      count,
      pct: Math.round((count / greatDayActivities.length) * 100),
    }
  })
}

/**
 * Generate weekly truth bullets — honest assessment of the week
 */
export function generateWeeklyTruths(state, isAr) {
  const days7 = lastNDays(7)
  const truths = []

  // 1. Morning Ritual consistency
  const morningLog = state.morningLog || []
  const morningDays = days7.filter(d => morningLog.includes(d)).length
  if (morningDays >= 6) {
    truths.push({ emoji: '🔥', type: 'win', text: isAr ? `الروتين الصباحي ${morningDays}/7 أيام — انضباط استثنائي!` : `Morning ritual ${morningDays}/7 days — exceptional discipline!` })
  } else if (morningDays >= 4) {
    truths.push({ emoji: '✅', type: 'good', text: isAr ? `الروتين الصباحي ${morningDays}/7 أيام — جيد ويمكن أفضل` : `Morning ritual ${morningDays}/7 days — good but can improve` })
  } else if (morningDays > 0) {
    truths.push({ emoji: '⚠️', type: 'warn', text: isAr ? `الروتين الصباحي ${morningDays}/7 فقط — الانضباط يُبنى يوماً بعد يوم` : `Morning ritual only ${morningDays}/7 — discipline is built day by day` })
  } else {
    truths.push({ emoji: '🚫', type: 'alert', text: isAr ? 'لم تنفذ الروتين الصباحي هذا الأسبوع — هذا أساس كل شيء' : 'No morning ritual this week — this is the foundation of everything' })
  }

  // 2. State tracking
  const stateByDate = {}
  ;(state.stateLog || []).forEach(s => { stateByDate[s.date] = s.state })
  const checkin = state.stateCheckin || {}
  const stateEntries = days7.filter(d => checkin[d] || stateByDate[d]).length
  const beautifulDays = days7.filter(d => {
    if (checkin[d]) return ((checkin[d].energy + checkin[d].mood + checkin[d].clarity) / 3) >= 7
    return stateByDate[d] === 'beautiful'
  }).length

  if (stateEntries >= 5) {
    const pct = Math.round((beautifulDays / stateEntries) * 100)
    truths.push({
      emoji: pct >= 60 ? '😊' : '😐',
      type: pct >= 60 ? 'win' : 'warn',
      text: isAr ? `${pct}% من أيامك كانت في حالة ممتازة` : `${pct}% of your days were in an excellent state`,
    })
  }

  // 3. Sleep quality
  const sleepLog = state.sleepLog || {}
  const sleepDays = days7.map(d => sleepLog[d]?.hours).filter(Boolean)
  if (sleepDays.length >= 3) {
    const avg = (sleepDays.reduce((a, b) => a + b, 0) / sleepDays.length).toFixed(1)
    truths.push({
      emoji: avg >= 7 ? '😴' : '⚠️',
      type: avg >= 7 ? 'good' : 'warn',
      text: isAr ? `متوسط النوم: ${avg} ساعة ${avg >= 7 ? '— ممتاز!' : '— يحتاج تحسين'}` : `Avg sleep: ${avg}h ${avg >= 7 ? '— excellent!' : '— needs improvement'}`,
    })
  }

  // 4. Goal progress
  const activeGoals = (state.goals || []).filter(g => (g.progress || 0) < 100)
  const goalsWorkedOn = activeGoals.filter(g => {
    return days7.some(d => g.dailyLog?.[d]?.done)
  }).length
  if (activeGoals.length > 0) {
    truths.push({
      emoji: goalsWorkedOn > 0 ? '🎯' : '💤',
      type: goalsWorkedOn > 0 ? 'good' : 'alert',
      text: isAr
        ? `عملت على ${goalsWorkedOn} من ${activeGoals.length} أهداف نشطة ${goalsWorkedOn === 0 ? '— أهدافك تنتظرك!' : ''}`
        : `Worked on ${goalsWorkedOn} of ${activeGoals.length} active goals ${goalsWorkedOn === 0 ? '— your goals are waiting!' : ''}`,
    })
  }

  // 5. Habit streak
  const habitList = state.habitTracker?.list || []
  const habitLog = state.habitTracker?.log || {}
  if (habitList.length > 0) {
    const completionRates = days7.map(d => {
      const done = (habitLog[d] || []).length
      return done / habitList.length
    })
    const avgRate = Math.round((completionRates.reduce((a, b) => a + b, 0) / 7) * 100)
    truths.push({
      emoji: avgRate >= 70 ? '✅' : '📊',
      type: avgRate >= 70 ? 'win' : 'warn',
      text: isAr ? `إنجاز العادات: ${avgRate}% هذا الأسبوع` : `Habit completion: ${avgRate}% this week`,
    })
  }

  // 6. Gratitude
  const gratitude = state.gratitude || {}
  const gratDays = days7.filter(d => (gratitude[d] || []).filter(Boolean).length >= 3).length
  if (gratDays > 0) {
    truths.push({
      emoji: '🙏',
      type: gratDays >= 5 ? 'win' : 'good',
      text: isAr ? `الامتنان: ${gratDays}/7 أيام` : `Gratitude: ${gratDays}/7 days`,
    })
  }

  return truths.slice(0, 6) // max 6 truths
}

/**
 * Week-over-week comparison
 */
export function weekComparison(state) {
  const thisWeek = lastNDays(7)
  const lastWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 7 - i)
    return d.toISOString().slice(0, 10)
  })

  function weekScore(days) {
    const morningLog = state.morningLog || []
    const habitLog = state.habitTracker?.log || {}
    const habitCount = (state.habitTracker?.list || []).length || 1
    const sleepLog = state.sleepLog || {}
    const gratitude = state.gratitude || {}

    let morning = 0, habits = 0, sleep = 0, grat = 0
    days.forEach(d => {
      if (morningLog.includes(d)) morning++
      habits += (habitLog[d] || []).length / habitCount
      if (sleepLog[d]?.hours >= 7) sleep++
      if ((gratitude[d] || []).filter(Boolean).length >= 3) grat++
    })

    return {
      morning: Math.round((morning / 7) * 100),
      habits: Math.round((habits / 7) * 100),
      sleep: Math.round((sleep / 7) * 100),
      gratitude: Math.round((grat / 7) * 100),
      total: Math.round(((morning + habits + sleep + grat) / (7 * 4)) * 100),
    }
  }

  const current = weekScore(thisWeek)
  const previous = weekScore(lastWeek)

  return {
    current,
    previous,
    diff: {
      morning: current.morning - previous.morning,
      habits: current.habits - previous.habits,
      sleep: current.sleep - previous.sleep,
      gratitude: current.gratitude - previous.gratitude,
      total: current.total - previous.total,
    },
  }
}

export { DAY_NAMES_AR, DAY_NAMES_EN }
