/** Calculate how many of the 7 daily tasks are done today */
export function calcDailyScore(state) {
  const today = new Date().toISOString().slice(0, 10)
  const gratitudeDone = (state?.gratitude?.[today] || []).filter(Boolean).length >= 3
  const habitsDone    = (state?.habitTracker?.log?.[today] || []).length > 0
  const winsDone      = (state?.dailyWins?.[today] || []).length > 0
  const sleepDone     = !!(state?.sleepLog?.[today])
  return [
    state?.morningDone,
    gratitudeDone,
    habitsDone,
    !!state?.todayState,
    winsDone,
    state?.eveningDone,
    sleepDone,
  ].filter(Boolean).length
}

export const DAILY_TASKS_TOTAL = 7

/**
 * Weighted Daily Score (0-100) — Batch 2 Fix #16
 * Morning/evening rituals weighted higher because they're cornerstone habits.
 * "All tasks are not equal — the morning ritual IS the foundation."
 */
export function calcWeightedScore(state) {
  const today = new Date().toISOString().slice(0, 10)
  const gratitudeDone = (state?.gratitude?.[today] || []).filter(Boolean).length >= 3
  const habitsDone    = (state?.habitTracker?.log?.[today] || []).length > 0
  const winsDone      = (state?.dailyWins?.[today] || []).length > 0
  const sleepDone     = !!(state?.sleepLog?.[today])

  // Weights: higher for foundational habits
  let score = 0
  if (state?.morningDone)  score += 20  // Cornerstone habit
  if (gratitudeDone)       score += 15  // Rewires brain
  if (habitsDone)          score += 10  // Execution
  if (state?.todayState)   score += 15  // Awareness
  if (winsDone)            score += 10  // Momentum
  if (state?.eveningDone)  score += 15  // Reflection
  if (sleepDone)           score += 15  // Recovery

  return score // 0-100
}

/**
 * Get the dominant weakness label for low-score days
 */
export function getScoreInsight(state, isAr) {
  const today = new Date().toISOString().slice(0, 10)
  if (!state?.morningDone)
    return isAr ? 'الصباح هو الأساس — ابدأ به' : 'Morning is the foundation — start there'
  if (!state?.todayState)
    return isAr ? 'سجّل حالتك — الوعي هو الخطوة الأولى' : 'Log your state — awareness is step one'
  if (!(state?.sleepLog?.[today]))
    return isAr ? 'النوم يضاعف كل شيء — سجّله' : 'Sleep multiplies everything — log it'
  return null
}
