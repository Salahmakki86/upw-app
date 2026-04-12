/**
 * #6 — Progressive Feature Unlocking
 * Shows features gradually based on user's journey stage
 * Tier 1 (Day 1): Daily essentials — morning, state, evening, habits, gratitude
 * Tier 2 (Day 3+): Growth tools — goals, wheel, wins, sleep, beliefs
 * Tier 3 (Day 7+): Advanced — insights, baseline, destiny, commitment, vision
 * Tier 4 (Day 21+): Everything — all programs, admin features
 */

export function getUnlockTier(state) {
  const streak = state.streak || 0
  const tasksEverDone = state.morningDone || state.eveningDone || (state.goals || []).length > 0

  if (streak >= 21 || Object.keys(state.sleepLog || {}).length >= 14) return 4
  if (streak >= 7 || (state.goals || []).length >= 1) return 3
  if (streak >= 3 || tasksEverDone) return 2
  return 1
}

export function isFeatureUnlocked(path, tier) {
  const TIER_MAP = {
    // Tier 1 — Always available
    '/morning': 1, '/state': 1, '/evening': 1, '/habits': 1, '/gratitude': 1,
    '/today': 1, '/wins': 1,
    // Tier 2 — After 3 days
    '/goals': 2, '/wheel': 2, '/sleep': 2, '/beliefs': 2, '/incantations': 2,
    // Tier 3 — After 7 days
    '/insights': 3, '/baseline': 3, '/destiny': 3, '/commitment': 3,
    '/vision': 3, '/reading': 3, '/fear': 3,
    '/biz-scorecard': 3, '/power-hour': 3, '/decisions': 3, '/network': 3,
    '/pipeline': 3, '/biz-dashboard': 3, '/avatar': 3, '/content': 3,
    '/six-needs': 3, '/nac': 3, '/compelling-future': 3, '/values': 3,
    '/upw-program': 3, '/celebration': 2, '/life-story': 3,
    // Tier 4 — After 21 days
    '/freedom': 4, '/power30': 4, '/time': 4, '/modeling': 4,
    '/relationships': 4, '/protocol': 4, '/letters': 4, '/library': 4,
    '/group-challenge': 4, '/sprint90': 4, '/skills': 4,
    '/transformation': 4,
  }

  const requiredTier = TIER_MAP[path]
  if (!requiredTier) return true // Not in the map = always unlocked
  return tier >= requiredTier
}

export function getNextUnlockMessage(tier, lang) {
  const isAr = lang === 'ar'
  const messages = {
    1: {
      ar: 'أكمل ٣ أيام لتفتح أدوات الأهداف والنمو',
      en: 'Complete 3 days to unlock Goals & Growth tools',
    },
    2: {
      ar: 'أكمل ٧ أيام لتفتح الأدوات المتقدمة',
      en: 'Complete 7 days to unlock Advanced tools',
    },
    3: {
      ar: 'أكمل ٢١ يوم لتفتح كل البرامج',
      en: 'Complete 21 days to unlock all Programs',
    },
    4: {
      ar: 'كل شيء مفتوح! أنت محارب حقيقي',
      en: 'Everything unlocked! You\'re a true warrior',
    },
  }
  return messages[tier]?.[lang] || messages[1][lang]
}
