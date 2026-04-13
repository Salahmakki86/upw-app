/**
 * Progressive UI Complexity Controller
 *
 * Problem: New users see 92+ elements, 15+ cards, 9 categories.
 * Solution: Show elements based on user's journey stage.
 *
 * Complexity Levels:
 *   Level 1 "Focus"    (0-2 mornings):  Only essentials — 5 elements max
 *   Level 2 "Expand"   (3-6 mornings):  Add goals, beliefs, badges
 *   Level 3 "Deepen"   (7-13 mornings): Add intelligence, history, programs
 *   Level 4 "Full"     (14+ mornings):  Everything visible
 */

export function getUIComplexity(state) {
  const count = (state.morningLog || []).length
  if (count >= 14) return 4
  if (count >= 7)  return 3
  if (count >= 3)  return 2
  return 1
}

/**
 * Dashboard element visibility rules
 * Returns which dashboard elements should be shown
 */
export function getDashboardVisibility(state) {
  const level = getUIComplexity(state)

  return {
    // Level 1 — Always visible (core essentials)
    startHere:        true,
    smartReminder:    level >= 2,
    stateCheckin:     true,
    todaysJourney:    true,
    quote:            true,
    supportButton:    true,
    dailyCategory:    true,

    // Level 2 — After 3 mornings
    guidedJourney:    level >= 2,
    goalNudge:        level >= 2,
    goalsSnapshot:    level >= 2,
    badges:           level >= 2,
    goalsCategory:    level >= 2,
    learnCategory:    true, // always visible (educational content)
    weeklyReport:     level >= 2,

    // Level 3 — After 7 mornings
    adaptiveNudge:    level >= 3,
    staleGoalNudge:   level >= 3,
    transformPulse:   level >= 3,
    stateHistory:     level >= 3,
    journeyStageMap:  level >= 3,
    todaysPlan:       level >= 2, // plan is useful early
    discoveryCard:    level >= 3,
    programsCategory: level >= 3,
    planningCategory: level >= 3,
    toolsCategory:    level >= 3,

    // Level 4 — After 14 mornings
    businessCategory: level >= 4,
    unlockProgress:   level >= 2,
    affirmation:      level >= 2,
  }
}

/**
 * TodayPage element visibility
 */
export function getTodayVisibility(state) {
  const level = getUIComplexity(state)

  return {
    // Always visible
    welcomeExperience: true,
    greeting:          true,
    scoreRing:         true,
    briefing:          true,
    stateCheckin:      true,
    taskSections:      true,
    allDoneBanner:     true,

    // Level 2+
    personalTip:       level >= 2,
    staleGoalNudge:    level >= 2,
    accountability:    level >= 2,
    smartQuestion:     level >= 2,
    todaysPlan:        true,

    // Level 3+
    transformPulse:    level >= 3,
    progressSnapshot:  level >= 3,
    morningCommitment: true,
  }
}

/**
 * Get a friendly label for the current complexity level
 */
export function getComplexityLabel(state, isAr) {
  const level = getUIComplexity(state)
  const labels = {
    1: { ar: '🌱 مرحلة التركيز', en: '🌱 Focus Mode' },
    2: { ar: '🎯 مرحلة التوسع',  en: '🎯 Expand Mode' },
    3: { ar: '⚡ مرحلة التعمق',  en: '⚡ Deep Mode' },
    4: { ar: '🔥 الوضع الكامل',  en: '🔥 Full Access' },
  }
  return isAr ? labels[level].ar : labels[level].en
}
