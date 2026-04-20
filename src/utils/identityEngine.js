/**
 * Identity Engine — Tony Robbins' most important teaching:
 * "The strongest force in the human personality is the need to stay
 * consistent with how we define ourselves."
 *
 * This engine:
 *   1. Extracts the user's primary identity statement from dwd.identityStatements
 *   2. Generates daily check-in prompts (morning/evening)
 *   3. Calculates an overall alignment trend
 *   4. Suggests identity-based reframes when actions misalign
 */

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })
}

/**
 * Get primary identity statement (fallback to identityProfile.target or onboarding focus)
 */
export function getPrimaryIdentity(state, isAr) {
  const dwdStmt = state.dwd?.identityStatements
  if (dwdStmt && typeof dwdStmt === 'string' && dwdStmt.trim().length > 0) {
    // identityStatements is often a multi-line string; take first non-empty line
    const first = dwdStmt.split(/\n/).map(s => s.trim()).filter(Boolean)[0]
    if (first) return first
  }
  const targetId = state.identityProfile?.target
  if (targetId && typeof targetId === 'string' && targetId.trim()) return targetId

  // Fallback to onboarding goal area label
  const goalArea = state.onboardingProfile?.goalArea
  if (goalArea) {
    const mapAr = {
      health: 'أنا شخص يحترم جسده ويبني طاقته كل يوم',
      career: 'أنا قائد يصنع نتائج استثنائية',
      relationships: 'أنا شخص يمنح ويستقبل الحب بكل امتلاء',
      mindset: 'أنا شخص نامٍ يحوّل كل تجربة إلى قوة',
      finances: 'أنا شخص يبني حريته المالية بوعي وانضباط',
      energy: 'أنا طاقة لا تنضب — قوتي تلهم من حولي',
    }
    const mapEn = {
      health: 'I am someone who respects my body and builds energy every day',
      career: 'I am a leader who creates extraordinary results',
      relationships: 'I am someone who gives and receives love fully',
      mindset: 'I am a growing person who turns every experience into power',
      finances: 'I am someone who builds financial freedom with clarity and discipline',
      energy: 'I am unlimited energy — my power inspires those around me',
    }
    return isAr ? (mapAr[goalArea] || mapAr.mindset) : (mapEn[goalArea] || mapEn.mindset)
  }

  return isAr
    ? 'أنا شخص في تحوّل — كل يوم أصبح النسخة الأفضل من نفسي'
    : 'I am transforming — becoming my best version every day'
}

/**
 * Calculate rolling 7-day alignment score (avg of morning + evening scores)
 */
export function getAlignmentTrend(state) {
  const log = state.identityAlignmentLog || {}
  const days = lastNDays(7)
  const scores = []
  days.forEach(d => {
    const entry = log[d]
    if (entry) {
      const m = entry.morningScore
      const e = entry.eveningScore
      if (typeof m === 'number') scores.push(m)
      if (typeof e === 'number') scores.push(e)
    }
  })
  if (scores.length === 0) return { avg: null, count: 0 }
  const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
  return { avg, count: scores.length, maxPossible: days.length * 2 }
}

/**
 * Get a reframe suggestion when alignment is low
 */
export function getIdentityReframe(state, isAr) {
  const { avg, count } = getAlignmentTrend(state)
  if (count < 3 || avg === null) return null
  const identity = getPrimaryIdentity(state, isAr)

  if (avg < 5) {
    return {
      tone: 'gentle-reset',
      ar: `توقف لحظة: ${identity}. هل تصرّفت اليوم بانسجام مع هذه الهوية؟`,
      en: `Pause: ${identity}. Did you act today in alignment with this identity?`,
    }
  }
  if (avg < 7) {
    return {
      tone: 'encourage',
      ar: `تتقدم. استمر — الهوية تُبنى بالأفعال الصغيرة المتكررة.`,
      en: `You're progressing. Keep going — identity is built through small repeated actions.`,
    }
  }
  return {
    tone: 'celebrate',
    ar: `أنت تعيش هويتك بانسجام مذهل. هذه اللحظات تصبح شخصيتك.`,
    en: `You're living your identity with remarkable alignment. These moments become your character.`,
  }
}

/**
 * Returns today's check-in status and whether morning/evening are pending
 */
export function getTodayCheckinStatus(state) {
  const log = state.identityAlignmentLog || {}
  const today = todayStr()
  const entry = log[today] || {}
  return {
    morningDone: typeof entry.morningScore === 'number',
    eveningDone: typeof entry.eveningScore === 'number',
    morningScore: entry.morningScore || null,
    eveningScore: entry.eveningScore || null,
  }
}

/**
 * Generate coaching questions based on identity + current state
 */
export function getIdentityCoachingQuestion(state, isAr) {
  const identity = getPrimaryIdentity(state, isAr)
  const questions = isAr ? [
    { q: `ماذا ستفعل اليوم كشخص "${identity}"؟`, category: 'action' },
    { q: `أي قرار اتخذته اليوم لا ينسجم مع "${identity}"؟`, category: 'audit' },
    { q: `لو كنت فعلاً "${identity}"، ماذا كنت ستفعل الآن؟`, category: 'reframe' },
    { q: `ما أكبر فعل "${identity}" اليوم؟`, category: 'celebrate' },
    { q: `من ينتظر منك أن تتصرف كـ "${identity}"؟`, category: 'accountability' },
  ] : [
    { q: `What will you do today as "${identity}"?`, category: 'action' },
    { q: `Which decision today misaligned with "${identity}"?`, category: 'audit' },
    { q: `If you truly were "${identity}", what would you do right now?`, category: 'reframe' },
    { q: `What was your biggest "${identity}" action today?`, category: 'celebrate' },
    { q: `Who needs you to show up as "${identity}" today?`, category: 'accountability' },
  ]
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return questions[dayOfYear % questions.length]
}
