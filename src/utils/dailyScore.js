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
