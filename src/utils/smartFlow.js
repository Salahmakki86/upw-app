/**
 * SmartFlow — Batch 3-4 Fixes #2 (sequence) + #11 (ritual variety)
 *
 * Fix #2: "Too many pages without sequence" → suggest what to do next
 * Fix #11: "Routine becomes boring after 3 weeks" → vary ritual focus daily
 */

const today = () => new Date().toISOString().split('T')[0]

/**
 * After completing a ritual, suggest the next natural step
 * Returns { emoji, labelAr, labelEn, path }
 */
export function getNextStep(completedAction, state, isAr) {
  const t = today()

  const FLOWS = {
    morning: [
      { check: () => !state.todayState, emoji: '⚡', labelAr: 'سجّل حالتك', labelEn: 'Log Your State', path: '/state' },
      { check: () => !(state.gratitude?.[t] || []).filter(Boolean).length, emoji: '🙏', labelAr: 'الامتنان', labelEn: 'Gratitude', path: '/gratitude' },
      { check: () => !(state.habitTracker?.log?.[t] || []).length, emoji: '✅', labelAr: 'العادات', labelEn: 'Habits', path: '/habits' },
      { check: () => true, emoji: '🎯', labelAr: 'الأهداف', labelEn: 'Goals', path: '/goals' },
    ],
    evening: [
      { check: () => !state.sleepLog?.[t], emoji: '😴', labelAr: 'سجّل نومك', labelEn: 'Log Sleep', path: '/sleep' },
      { check: () => true, emoji: '🎯', labelAr: 'راجع أهدافك', labelEn: 'Review Goals', path: '/goals' },
    ],
    state: [
      { check: () => !state.morningDone, emoji: '☀️', labelAr: 'الروتين الصباحي', labelEn: 'Morning Ritual', path: '/morning' },
      { check: () => true, emoji: '🎯', labelAr: 'اعمل على أهدافك', labelEn: 'Work on Goals', path: '/goals' },
    ],
    gratitude: [
      { check: () => !(state.habitTracker?.log?.[t] || []).length, emoji: '✅', labelAr: 'العادات', labelEn: 'Habits', path: '/habits' },
      { check: () => true, emoji: '🏠', labelAr: 'الرئيسية', labelEn: 'Dashboard', path: '/dashboard' },
    ],
  }

  const flow = FLOWS[completedAction] || FLOWS.morning
  const next = flow.find(f => f.check())
  return next || { emoji: '🏠', labelAr: 'الرئيسية', labelEn: 'Dashboard', path: '/dashboard' }
}

/**
 * Ritual variation — change the daily focus phrase to keep routines fresh.
 * Fix #11: "Routine becomes boring after 3 weeks"
 * Returns a daily-rotating focus tip for the morning/evening ritual.
 */
export function getRitualVariation(type, state, isAr) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const streak = state.streak || 0

  const MORNING_VARIATIONS = [
    { ar: 'ركّز اليوم على التنفس العميق أكثر من المعتاد', en: 'Focus extra on deep breathing today' },
    { ar: 'في مرحلة الامتنان، تخيّل وجوه من تحبهم', en: 'During gratitude, visualize faces of loved ones' },
    { ar: 'ارفع صوتك في التكرارات اليوم — الصوت يغير الحالة', en: 'Raise your voice in incantations — sound changes state' },
    { ar: 'في التخيل، ركّز على هدف واحد فقط بعمق', en: 'In visualization, focus deeply on just ONE goal' },
    { ar: 'أضف حركة جسدية أكثر أثناء التنفس', en: 'Add more body movement during breathing' },
    { ar: 'جرّب الامتنان لشخص لم تشكره من قبل', en: 'Try gratitude for someone you never thanked' },
    { ar: 'في الشفاء، أرسل النور لشخص يعاني', en: 'In healing, send light to someone who is struggling' },
  ]

  const EVENING_VARIATIONS = [
    { ar: 'اكتب 3 دروس بدل درس واحد الليلة', en: 'Write 3 lessons instead of one tonight' },
    { ar: 'في CANI، اختر مجالاً جديداً لم تجربه', en: 'In CANI, choose a new area you haven\'t tried' },
    { ar: 'خطط لغد بـ 3 مهام فقط — الأقل هو الأكثر', en: 'Plan tomorrow with 3 tasks only — less is more' },
    { ar: 'اكتب رسالة شكر قصيرة لنفسك', en: 'Write a short thank you note to yourself' },
    { ar: 'قيّم يومك من ناحية الطاقة لا الإنتاجية', en: 'Rate your day by energy, not productivity' },
  ]

  const variations = type === 'morning' ? MORNING_VARIATIONS : EVENING_VARIATIONS
  const index = dayOfYear % variations.length
  const variation = variations[index]

  // Add streak-specific encouragement
  let bonus = null
  if (streak >= 21) {
    bonus = isAr ? '💎 عادة متجذرة — تحدَّ نفسك بعمق أكبر اليوم' : '💎 Deep habit — challenge yourself to go deeper today'
  } else if (streak >= 7) {
    bonus = isAr ? '🔥 أسبوع+ — جرّب شيئاً جديداً في الطقس' : '🔥 Week+ — try something new in the ritual'
  }

  return {
    text: isAr ? variation.ar : variation.en,
    bonus,
  }
}
