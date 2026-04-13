/**
 * Progressive Feature Unlocking
 * Uses morningLog.length (total completions ever) — NOT streak
 * so missing one day doesn't lock the user out of earned features.
 *
 * Stage 1 "الانطلاق / Launch"   (0-2 completions):  Daily essentials
 * Stage 2 "النمو / Growth"      (3-6 completions):  Goals, beliefs, wheel
 * Stage 3 "التعمق / Deep Work"  (7-20 completions): Advanced programs
 * Stage 4 "الإتقان / Mastery"   (21+ completions):  Everything
 */

export const STAGES = [
  {
    stage: 1,
    minCompletions: 0,
    labelAr: 'الانطلاق',
    labelEn: 'Launch',
    emoji: '🌱',
    descAr: 'الطقوس اليومية الأساسية',
    descEn: 'Core daily rituals',
    color: '#2ecc71',
  },
  {
    stage: 2,
    minCompletions: 3,
    labelAr: 'النمو',
    labelEn: 'Growth',
    emoji: '🎯',
    descAr: 'الأهداف والمعتقدات',
    descEn: 'Goals & Beliefs',
    color: '#3498db',
  },
  {
    stage: 3,
    minCompletions: 7,
    labelAr: 'التعمق',
    labelEn: 'Deep Work',
    emoji: '⚡',
    descAr: 'البرامج المتقدمة',
    descEn: 'Advanced Programs',
    color: '#9b59b6',
  },
  {
    stage: 4,
    minCompletions: 21,
    labelAr: 'الإتقان',
    labelEn: 'Mastery',
    emoji: '🔥',
    descAr: 'كل الأدوات مفتوحة',
    descEn: 'Full Access',
    color: '#c9a84c',
  },
]

export function getMorningCount(state) {
  // morningLog is the array of dates morning was completed
  // Fall back to streak if morningLog not yet present (legacy users)
  const fromLog = (state.morningLog || []).length
  const fromStreak = state.streak || 0
  return Math.max(fromLog, fromStreak)
}

export function getUnlockTier(state) {
  const count = getMorningCount(state)
  if (count >= 21) return 4
  if (count >= 7)  return 3
  if (count >= 3)  return 2
  return 1
}

export function getStageProgress(state) {
  const count = getMorningCount(state)
  const tier = getUnlockTier(state)
  const currentStage = STAGES[tier - 1]
  const nextStage    = STAGES[tier]  // undefined if tier === 4

  const completionsInStage = nextStage
    ? count - currentStage.minCompletions
    : count - currentStage.minCompletions

  const stageTotal = nextStage
    ? nextStage.minCompletions - currentStage.minCompletions
    : 1 // already maxed

  const pct = nextStage
    ? Math.min(100, Math.round((completionsInStage / stageTotal) * 100))
    : 100

  const remaining = nextStage
    ? Math.max(0, nextStage.minCompletions - count)
    : 0

  return { tier, currentStage, nextStage, count, pct, remaining }
}

export function isFeatureUnlocked(path, tier) {
  const TIER_MAP = {
    // Stage 1 — Always available (daily essentials)
    '/morning': 1, '/state': 1, '/evening': 1, '/habits': 1, '/gratitude': 1,
    '/today': 1, '/wins': 1, '/emergency': 1, '/challenge': 1,
    '/videos': 1, '/sleep': 1,

    // Stage 2 — After 3 completions (goals & beliefs)
    '/goals': 2, '/wheel': 2, '/beliefs': 2, '/incantations': 2,
    '/weekly-pulse': 2, '/celebration': 2, '/vision': 2, '/reading': 2,

    // Stage 3 — After 7 completions (advanced programs)
    '/insights': 3, '/baseline': 3, '/destiny': 3, '/commitment': 3,
    '/fear': 3, '/six-needs': 3, '/nac': 3, '/compelling-future': 3,
    '/values': 3, '/upw-program': 3, '/life-story': 3, '/stats': 3,
    '/monthly-reset': 3, '/library': 3,
    // Business (stage 3)
    '/biz-scorecard': 3, '/power-hour': 3, '/decisions': 3, '/network': 3,
    '/pipeline': 3, '/biz-dashboard': 3, '/avatar': 3, '/content': 3,

    // Stage 4 — After 21 completions (mastery)
    '/freedom': 4, '/power30': 4, '/time': 4, '/modeling': 4,
    '/relationships': 4, '/protocol': 4, '/letters': 4,
    '/group-challenge': 4, '/sprint90': 4, '/skills': 4,
    '/transformation': 4, '/weekly': 4,
  }

  const requiredTier = TIER_MAP[path]
  if (!requiredTier) return true // Not in the map = always unlocked
  return tier >= requiredTier
}

export function getNextUnlockMessage(tier, lang, state) {
  const isAr = lang === 'ar'
  const { remaining, nextStage } = getStageProgress(state)

  if (tier >= 4) {
    return isAr ? '🔥 كل شيء مفتوح! أنت محارب حقيقي' : '🔥 Everything unlocked! You\'re a true warrior'
  }

  const stageName = nextStage ? (isAr ? nextStage.labelAr : nextStage.labelEn) : ''
  const stageEmoji = nextStage ? nextStage.emoji : ''

  if (isAr) {
    return `أكمل ${remaining} صباح${remaining === 1 ? '' : 'اً'} لتفتح المرحلة ${stageEmoji} ${stageName}`
  }
  return `Complete ${remaining} more morning${remaining === 1 ? '' : 's'} to unlock ${stageEmoji} ${stageName}`
}
