/**
 * Transformation Intelligence Engine — Batch 1
 *
 * 1. Momentum Score — measures real momentum (not just streak)
 * 2. State Recipe — discovers your "best day formula"
 * 3. Root Cause Detector — diagnoses WHY you're stuck
 * 4. Transformation Score — single composite score
 */

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
}

function dayScore(state, date) {
  const gratDone  = ((state.gratitude?.[date]) || []).filter(Boolean).length >= 3
  const habitDone = (state.habitTracker?.log?.[date] || []).length > 0
  const winsDone  = (state.dailyWins?.[date] || []).length > 0
  const sleepDone = !!(state.sleepLog?.[date])
  const stateByDate = {}
  ;(state.stateLog || []).forEach(s => { stateByDate[s.date] = s.state })
  const stateDone  = !!stateByDate[date]
  const morningDone = (state.morningLog || []).includes(date)
  const eveningDone = !!(state.eveningLog?.[date])
  return [morningDone, gratDone, habitDone, stateDone, winsDone, eveningDone, sleepDone].filter(Boolean).length
}

// ═══════════════════════════════════════════════════════════════
//  1. MOMENTUM SCORE
// ═══════════════════════════════════════════════════════════════

export function calcMomentum(state) {
  const days7  = lastNDays(7)
  const days14 = lastNDays(14)

  // Score for each day (0-7)
  const scores7  = days7.map(d  => dayScore(state, d))
  const scores14 = days14.map(d => dayScore(state, d))

  const avg7  = scores7.length  > 0 ? scores7.reduce((a, b) => a + b, 0) / scores7.length   : 0
  const avg14 = scores14.length > 0 ? scores14.reduce((a, b) => a + b, 0) / scores14.length  : 0

  // First half vs second half of last 14 days
  const firstHalf  = scores14.slice(7)  // older 7 days
  const secondHalf = scores14.slice(0, 7) // recent 7 days
  const avgFirst  = firstHalf.length > 0  ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length   : 0
  const avgSecond = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0

  // Trend
  const diff = avgSecond - avgFirst
  let trend = 'stable'
  if (diff > 0.5)  trend = 'up'
  if (diff < -0.5) trend = 'down'

  // Momentum = (avg7 / 7) * 100, weighted by streak
  const streak = state.streak || 0
  const streakBonus = Math.min(streak / 30, 1) * 15 // up to 15 bonus points
  const baseScore = Math.round((avg7 / 7) * 85 + streakBonus)
  const score = Math.min(100, Math.max(0, baseScore))

  // Active days count
  const activeDays = scores7.filter(s => s > 0).length

  let color, status
  if (score >= 70) { color = '#2ecc71'; status = 'strong' }
  else if (score >= 40) { color = '#f39c12'; status = 'building' }
  else { color = '#e63946'; status = 'needs_attention' }

  return { score, trend, color, status, activeDays, avg7: Math.round(avg7 * 10) / 10 }
}


// ═══════════════════════════════════════════════════════════════
//  2. STATE RECIPE — "Your Best Day Formula"
// ═══════════════════════════════════════════════════════════════

export function calcStateRecipe(state) {
  const days30 = lastNDays(30)
  const stateByDate = {}
  ;(state.stateLog || []).forEach(s => { stateByDate[s.date] = s.state })

  // Find "great days" — dayRating >= 8 OR state === beautiful + high execution
  const greatDays = []
  const normalDays = []

  days30.forEach(date => {
    const eveningEntry = state.eveningLog?.[date]
    const rating = eveningEntry?.dayRating || 0
    const stateVal = stateByDate[date]
    const score = dayScore(state, date)
    const isGreat = rating >= 8 || (stateVal === 'beautiful' && score >= 5)

    const factors = {
      date,
      sleep: state.sleepLog?.[date]?.hours || 0,
      sleptWell: (state.sleepLog?.[date]?.hours || 0) >= 7,
      morningDone: (state.morningLog || []).includes(date),
      hadGratitude: ((state.gratitude?.[date]) || []).filter(Boolean).length >= 3,
      hadHabits: (state.habitTracker?.log?.[date] || []).length > 0,
      hadExercise: !!(state.energyProtocol?.[date]?.movement),
      hadPowerHour: !!(state.powerHour?.[date]?.completedAt),
      stateLogged: !!stateVal,
      score,
    }

    if (isGreat) greatDays.push(factors)
    else normalDays.push(factors)
  })

  if (greatDays.length < 2) {
    return { hasRecipe: false, greatDays: greatDays.length, totalDays: days30.length }
  }

  // Calculate what % of great days had each factor
  const factors = [
    { key: 'sleptWell',    emojiAr: '7+ ساعات نوم',   emojiEn: '7+ hours sleep',  emoji: '😴' },
    { key: 'morningDone',  emojiAr: 'روتين صباحي',     emojiEn: 'Morning ritual',  emoji: '☀️' },
    { key: 'hadGratitude', emojiAr: 'امتنان',          emojiEn: 'Gratitude',       emoji: '🙏' },
    { key: 'hadHabits',    emojiAr: 'عادات',           emojiEn: 'Habits',          emoji: '✅' },
    { key: 'hadExercise',  emojiAr: 'حركة/رياضة',     emojiEn: 'Exercise',        emoji: '💪' },
    { key: 'hadPowerHour', emojiAr: 'ساعة القوة',      emojiEn: 'Power Hour',      emoji: '⏱' },
  ]

  const recipe = factors.map(f => {
    const greatPct  = Math.round((greatDays.filter(d => d[f.key]).length / greatDays.length) * 100)
    const normalPct = normalDays.length > 0
      ? Math.round((normalDays.filter(d => d[f.key]).length / normalDays.length) * 100)
      : 0
    return { ...f, greatPct, normalPct, impact: greatPct - normalPct }
  })
    .filter(f => f.greatPct >= 50) // only factors present in 50%+ of great days
    .sort((a, b) => b.impact - a.impact) // sort by impact (difference)

  // Average sleep on great days
  const avgSleepGreat = greatDays.reduce((s, d) => s + d.sleep, 0) / greatDays.length

  return {
    hasRecipe: true,
    recipe: recipe.slice(0, 4), // top 4 factors
    greatDays: greatDays.length,
    totalDays: days30.length,
    avgSleepGreat: Math.round(avgSleepGreat * 10) / 10,
  }
}


// ═══════════════════════════════════════════════════════════════
//  3. ROOT CAUSE DETECTOR — Diagnoses WHY you're stuck
// ═══════════════════════════════════════════════════════════════

export function detectRootCause(state) {
  const days7 = lastNDays(7)
  const days14 = lastNDays(14)
  const today = todayStr()

  // Gather metrics
  const scores7 = days7.map(d => dayScore(state, d))
  const avgExecution = scores7.reduce((a, b) => a + b, 0) / 7 / 7 // 0-1 scale

  // State average from stateCheckin or stateLog
  const stateByDate = {}
  ;(state.stateLog || []).forEach(s => { stateByDate[s.date] = s.state })
  const checkin = state.stateCheckin || {}

  let stateAvg = 5
  const stateValues = days7.map(d => {
    if (checkin[d]) return (checkin[d].energy + checkin[d].mood + checkin[d].clarity) / 3
    if (stateByDate[d] === 'beautiful') return 8
    if (stateByDate[d] === 'suffering') return 3
    return null
  }).filter(Boolean)
  if (stateValues.length > 0) stateAvg = stateValues.reduce((a, b) => a + b, 0) / stateValues.length

  // Sleep average
  const sleepHours = days7.map(d => state.sleepLog?.[d]?.hours).filter(Boolean)
  const avgSleep = sleepHours.length > 0 ? sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length : null

  // Goals analysis
  const goals = state.goals || []
  const goalsWithPurpose = goals.filter(g => g.description && g.description.trim().length > 10)
  const activeGoals = goals.filter(g => (g.progress || 0) < 100)

  // Streak pattern (boom/bust detection)
  const morningLog = state.morningLog || []
  const streak = state.streak || 0

  // Fear check
  const fears = state.fearToFpower?.fears || []
  const activeFears = fears.filter(f => !f.transformed)

  // Beliefs check
  const limitingBeliefs = state.limitingBeliefs || []
  const empoweringBeliefs = state.empoweringBeliefs || []

  // Commitment check
  const hasCommitment = !!(state.commitment?.text)

  // Morning ritual consistency
  const morningDays7 = days7.filter(d => morningLog.includes(d)).length

  // ── Decision Tree ──────────────────────────────────────────

  // If doing well — no root cause needed
  if (avgExecution >= 0.6 && stateAvg >= 7) {
    return {
      type: 'thriving',
      emoji: '🟢',
      labelAr: 'أنت في حالة ممتازة!',
      labelEn: "You're thriving!",
      descAr: 'استمر على هذا النمط — الزخم يبني نفسه.',
      descEn: 'Keep this pattern going — momentum builds itself.',
      color: '#2ecc71',
      priority: 0,
    }
  }

  const causes = []

  // 1. Energy Problem
  if ((avgSleep !== null && avgSleep < 6) || stateAvg < 5) {
    causes.push({
      type: 'energy',
      emoji: '🔋',
      labelAr: 'المشكلة: طاقة منخفضة',
      labelEn: 'Problem: Low Energy',
      descAr: avgSleep !== null && avgSleep < 6
        ? `معدل نومك ${avgSleep.toFixed(1)} ساعة — جسمك لا يملك الوقود. حسّن نومك أولاً.`
        : 'حالتك النفسية منخفضة هذا الأسبوع. الطاقة أساس كل شيء — ابدأ بجسمك.',
      descEn: avgSleep !== null && avgSleep < 6
        ? `Your sleep average is ${avgSleep.toFixed(1)}h — your body has no fuel. Fix sleep first.`
        : 'Your state has been low this week. Energy is the foundation — start with your body.',
      color: '#e63946',
      priority: 10,
      action: '/protocol',
      actionAr: 'بروتوكول الطاقة',
      actionEn: 'Energy Protocol',
    })
  }

  // 2. Clarity Problem
  if (activeGoals.length === 0 || (activeGoals.length > 0 && goalsWithPurpose.length === 0)) {
    causes.push({
      type: 'clarity',
      emoji: '🔍',
      labelAr: 'المشكلة: غياب الوضوح',
      labelEn: 'Problem: Lack of Clarity',
      descAr: activeGoals.length === 0
        ? 'لا أهداف نشطة — بدون هدف واضح، لا يوجد تركيز.'
        : 'أهدافك بلا "لماذا" واضح — الهدف بلا Purpose = قائمة مهام.',
      descEn: activeGoals.length === 0
        ? 'No active goals — without a clear target, there is no focus.'
        : 'Your goals have no clear "why" — a goal without Purpose is just a to-do list.',
      color: '#3498db',
      priority: 8,
      action: '/goals',
      actionAr: 'راجع أهدافك',
      actionEn: 'Review Goals',
    })
  }

  // 3. Scatter Problem
  if (activeGoals.length > 5) {
    causes.push({
      type: 'scatter',
      emoji: '🎯',
      labelAr: 'المشكلة: تشتت',
      labelEn: 'Problem: Scattered Focus',
      descAr: `لديك ${activeGoals.length} أهداف نشطة — التركيز على شيء واحد أقوى من التشتت على عشرة.`,
      descEn: `You have ${activeGoals.length} active goals — focus on ONE is more powerful than scattered ten.`,
      color: '#f39c12',
      priority: 7,
      action: '/goals',
      actionAr: 'اختر هدفاً واحداً',
      actionEn: 'Choose ONE goal',
    })
  }

  // 4. Standards Problem (boom/bust pattern)
  if (streak <= 2 && morningLog.length >= 7) {
    // Has history but keeps restarting
    const recentStarts = morningLog.slice(-14)
    const gaps = []
    for (let i = 1; i < recentStarts.length; i++) {
      const d1 = new Date(recentStarts[i - 1])
      const d2 = new Date(recentStarts[i])
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
      if (diff > 2) gaps.push(diff)
    }
    if (gaps.length >= 2) {
      causes.push({
        type: 'standards',
        emoji: '📏',
        labelAr: 'المشكلة: معايير منخفضة',
        labelEn: 'Problem: Low Standards',
        descAr: 'تبدأ بحماس ثم تتوقف — الحماس وقود مؤقت. ارفع معيارك: حتى في أسوأ يوم، نفّذ الأساسيات.',
        descEn: "You start strong then stop — enthusiasm is temporary fuel. Raise your standard: even on your worst day, do the basics.",
        color: '#e67e22',
        priority: 9,
        action: '/commitment',
        actionAr: 'وقّع التزامك',
        actionEn: 'Sign Commitment',
      })
    }
  }

  // 5. Fear Problem
  if (activeFears.length >= 2 && avgExecution < 0.4) {
    causes.push({
      type: 'fear',
      emoji: '😨',
      labelAr: 'المشكلة: الخوف يوقفك',
      labelEn: 'Problem: Fear is Stopping You',
      descAr: `لديك ${activeFears.length} مخاوف نشطة. الخوف ليس علامة توقف — بل علامة اتجاه. واجه خوفاً واحداً اليوم.`,
      descEn: `You have ${activeFears.length} active fears. Fear is not a stop sign — it's a direction sign. Face one fear today.`,
      color: '#9b59b6',
      priority: 8,
      action: '/fear',
      actionAr: 'واجه مخاوفك',
      actionEn: 'Face Your Fears',
    })
  }

  // 6. Identity Problem
  if (limitingBeliefs.length > empoweringBeliefs.length && avgExecution < 0.5) {
    causes.push({
      type: 'identity',
      emoji: '🪞',
      labelAr: 'المشكلة: هوية غير متوافقة',
      labelEn: 'Problem: Identity Mismatch',
      descAr: `معتقداتك المقيّدة (${limitingBeliefs.length}) أكثر من المحفّزة (${empoweringBeliefs.length}). غيّر قصتك قبل أن تغيّر خطتك.`,
      descEn: `Your limiting beliefs (${limitingBeliefs.length}) outnumber empowering ones (${empoweringBeliefs.length}). Change your story before your strategy.`,
      color: '#e91e8c',
      priority: 7,
      action: '/beliefs',
      actionAr: 'راجع معتقداتك',
      actionEn: 'Review Beliefs',
    })
  }

  // 7. Meaning Problem — executing well but not fulfilled
  if (avgExecution >= 0.5 && stateAvg <= 6) {
    const eveningRatings = days7
      .map(d => state.eveningLog?.[d]?.dayRating)
      .filter(Boolean)
    const avgRating = eveningRatings.length > 0
      ? eveningRatings.reduce((a, b) => a + b, 0) / eveningRatings.length
      : null
    if (avgRating !== null && avgRating <= 6) {
      causes.push({
        type: 'meaning',
        emoji: '💭',
        labelAr: 'المشكلة: غياب المعنى',
        labelEn: 'Problem: Lack of Meaning',
        descAr: 'أنت تنفّذ بانضباط لكن لا تشعر بالإشباع. ربما أهدافك لا تمثلك حقاً.',
        descEn: "You execute with discipline but don't feel fulfilled. Perhaps your goals don't truly represent you.",
        color: '#8e44ad',
        priority: 6,
        action: '/six-needs',
        actionAr: 'راجع احتياجاتك',
        actionEn: 'Review Your Needs',
      })
    }
  }

  // 8. Discipline Problem (no commitment, low morning consistency)
  if (!hasCommitment && morningDays7 <= 2 && avgExecution < 0.4) {
    causes.push({
      type: 'discipline',
      emoji: '⚙️',
      labelAr: 'المشكلة: غياب النظام',
      labelEn: 'Problem: No System',
      descAr: 'لا التزام مكتوب ولا روتين صباحي ثابت. النظام يتغلب على الحافز — ابنِ عادة واحدة أولاً.',
      descEn: 'No written commitment and no consistent morning ritual. System beats motivation — build one habit first.',
      color: '#95a5a6',
      priority: 7,
      action: '/morning',
      actionAr: 'ابدأ بالروتين الصباحي',
      actionEn: 'Start Morning Ritual',
    })
  }

  // Sort by priority, return top cause
  causes.sort((a, b) => b.priority - a.priority)
  return causes[0] || {
    type: 'exploring',
    emoji: '🔄',
    labelAr: 'نحتاج بيانات أكثر',
    labelEn: 'Need More Data',
    descAr: 'استمر في استخدام التطبيق يومياً وسنكتشف أنماطك قريباً.',
    descEn: 'Keep using the app daily and we will discover your patterns soon.',
    color: '#888',
    priority: 0,
  }
}


// ═══════════════════════════════════════════════════════════════
//  4. TRANSFORMATION SCORE — Single composite metric
// ═══════════════════════════════════════════════════════════════

export function calcTransformationScore(state) {
  const days7 = lastNDays(7)
  const days30 = lastNDays(30)

  // ── A. Discipline (30%) ──
  const scores7 = days7.map(d => dayScore(state, d))
  const avgScore = scores7.reduce((a, b) => a + b, 0) / 7
  const disciplineRaw = (avgScore / 7) * 100
  const streak = state.streak || 0
  const streakBonus = Math.min(streak / 21, 1) * 10
  const discipline = Math.min(100, disciplineRaw + streakBonus)

  // ── B. State (25%) ──
  const stateByDate = {}
  ;(state.stateLog || []).forEach(s => { stateByDate[s.date] = s.state })
  const checkin = state.stateCheckin || {}

  const stateScores = days7.map(d => {
    if (checkin[d]) return ((checkin[d].energy + checkin[d].mood + checkin[d].clarity) / 3) * 10
    if (stateByDate[d] === 'beautiful') return 80
    if (stateByDate[d] === 'suffering') return 30
    return null
  }).filter(Boolean)
  const stateScore = stateScores.length > 0
    ? stateScores.reduce((a, b) => a + b, 0) / stateScores.length
    : 50

  // ── C. Progress (25%) ──
  const goals = state.goals || []
  const avgProgress = goals.length > 0
    ? goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length
    : 0
  // Execution rate: planned tasks done (from todayPlan)
  const planExecution = days7.reduce((acc, d) => {
    const plan = state.eveningLog?.[d]?.tomorrow?.filter(t => t?.trim()) || []
    const checked = state.todayPlanChecked?.[d] || {}
    if (plan.length === 0) return acc
    const done = plan.filter((_, i) => checked[i]).length
    return { total: acc.total + plan.length, done: acc.done + done }
  }, { total: 0, done: 0 })
  const execRate = planExecution.total > 0 ? (planExecution.done / planExecution.total) * 100 : avgProgress
  const progress = Math.min(100, (avgProgress * 0.4 + execRate * 0.6))

  // ── D. Depth (20%) ──
  const depthFactors = [
    !!(state.commitment?.text),                               // has commitment
    (state.empoweringBeliefs || []).length >= 3,              // 3+ empowering beliefs
    (state.valuesHierarchy?.ranked || []).length >= 3,        // values defined
    !!(state.dwd?.mission),                                    // mission defined
    (state.wheelHistory || []).length >= 1,                    // wheel assessed
    Object.keys(state.sixNeedsScores || {}).some(k => state.sixNeedsScores[k] !== 5), // needs assessed
    (state.goals || []).some(g => g.description?.trim()),     // at least 1 goal with purpose
    (state.incantationStreak || 0) >= 3,                      // incantation practice
  ]
  const depthScore = (depthFactors.filter(Boolean).length / depthFactors.length) * 100

  // ── Composite ──
  const total = Math.round(
    discipline * 0.30 +
    stateScore * 0.25 +
    progress   * 0.25 +
    depthScore * 0.20
  )

  let level, color
  if (total >= 80)      { level = 'exceptional'; color = '#2ecc71' }
  else if (total >= 60) { level = 'strong';      color = '#c9a84c' }
  else if (total >= 40) { level = 'building';    color = '#f39c12' }
  else if (total >= 20) { level = 'starting';    color = '#e67e22' }
  else                  { level = 'beginning';   color = '#e63946' }

  return {
    total,
    level,
    color,
    breakdown: {
      discipline: Math.round(discipline),
      state: Math.round(stateScore),
      progress: Math.round(progress),
      depth: Math.round(depthScore),
    },
  }
}
