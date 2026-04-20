/**
 * 90-Day Transformation Journey Engine
 *
 * Chapters:
 *   - Foundations (Day 1-30): Morning ritual, State, First goals, Sleep
 *   - Discovery (Day 31-60): Beliefs, Values, Six Needs, DWD
 *   - Mastery (Day 61-90): NAC, Fear to Power, Modeling, Personal Power
 *
 * Each day has a PRIMARY task (required) + 2 OPTIONAL tasks.
 * Graduation ceremonies at Day 30, 60, 90.
 *
 * This is a SEPARATE track — all existing pages remain accessible
 * independently. Journey is OPT-IN.
 */

export const CHAPTERS = [
  { id: 'foundations', startDay: 1,  endDay: 30, emoji: '🌱',
    titleAr: 'الأساسات', titleEn: 'Foundations',
    descAr: 'بناء قاعدة الطقوس اليومية، الحالة، الأهداف', descEn: 'Build daily rituals, state, first goals' },
  { id: 'discovery',   startDay: 31, endDay: 60, emoji: '🧭',
    titleAr: 'الاكتشاف', titleEn: 'Discovery',
    descAr: 'كشف المعتقدات، القيم، الحاجات الست، الهوية', descEn: 'Uncover beliefs, values, 6 needs, identity' },
  { id: 'mastery',     startDay: 61, endDay: 90, emoji: '🏆',
    titleAr: 'الإتقان', titleEn: 'Mastery',
    descAr: 'NAC، غلبة الخوف، النمذجة، القوة الشخصية', descEn: 'NAC, Fear→Power, Modeling, Personal Power' },
]

// Day-by-day structured plan (compact — only primary + optional routes).
// Primary = required to mark day complete. Optional = bonus.
export const DAY_PLAN = (() => {
  const plan = {}
  // Foundations (1-30)
  for (let d = 1; d <= 30; d++) {
    const base = {
      chapter: 'foundations',
      primary: { labelAr: 'الطقس الصباحي', labelEn: 'Morning Ritual', path: '/morning', emoji: '☀️' },
      optional: [
        { labelAr: 'حالتك الآن', labelEn: 'State Check-in', path: '/state', emoji: '⚡' },
        { labelAr: 'الامتنان', labelEn: 'Gratitude', path: '/gratitude', emoji: '🙏' },
      ],
    }
    // Sprinkle milestone days
    if (d === 1)  base.milestone = { ar: 'تقييم نقطة الانطلاق', en: 'Baseline assessment', path: '/baseline', emoji: '🧭' }
    if (d === 3)  base.milestone = { ar: 'أول هدف RPM', en: 'First RPM goal', path: '/goals', emoji: '🎯' }
    if (d === 5)  base.milestone = { ar: 'عجلة الحياة', en: 'Wheel of Life', path: '/wheel', emoji: '🎡' }
    if (d === 7)  base.milestone = { ar: 'إنجاز أسبوعك الأول', en: '1st Week Milestone', path: '/celebration', emoji: '🌟' }
    if (d === 10) base.milestone = { ar: 'سجّل نومك', en: 'Sleep tracking', path: '/sleep', emoji: '😴' }
    if (d === 14) base.milestone = { ar: 'نبض أسبوعي', en: 'Weekly Pulse', path: '/weekly-pulse', emoji: '📊' }
    if (d === 21) base.milestone = { ar: 'عهد التزام مكتوب', en: 'Written Commitment', path: '/commitment', emoji: '📜' }
    if (d === 28) base.milestone = { ar: 'مراجعة الأسبوع الرابع', en: '4th Week Review', path: '/weekly', emoji: '🔍' }
    if (d === 30) base.milestone = { ar: '🎉 تخرج الأساسات', en: '🎉 Foundations Graduation', path: '/journey', emoji: '🏆' }
    plan[d] = base
  }
  // Discovery (31-60)
  for (let d = 31; d <= 60; d++) {
    const base = {
      chapter: 'discovery',
      primary: { labelAr: 'اكتشاف اليوم', labelEn: 'Today\'s Discovery', path: '/morning', emoji: '🧭' },
      optional: [
        { labelAr: 'المعتقدات', labelEn: 'Beliefs', path: '/beliefs', emoji: '🧠' },
        { labelAr: 'القيم', labelEn: 'Values', path: '/values', emoji: '💎' },
      ],
    }
    if (d === 31) base.milestone = { ar: 'موعد مع القدر', en: 'Date with Destiny', path: '/destiny', emoji: '🌌' }
    if (d === 35) base.milestone = { ar: 'الحاجات الست', en: '6 Human Needs', path: '/six-needs', emoji: '🔷' }
    if (d === 40) base.milestone = { ar: 'قيمك مرتّبة', en: 'Values Hierarchy', path: '/values', emoji: '💎' }
    if (d === 45) base.milestone = { ar: 'البيت العاطفي', en: 'Emotional Home', path: '/emotional-home', emoji: '🏠' }
    if (d === 50) base.milestone = { ar: 'مستقبل مقنع', en: 'Compelling Future', path: '/compelling-future', emoji: '🔮' }
    if (d === 55) base.milestone = { ar: 'الهوية الجديدة', en: 'New Identity', path: '/identity', emoji: '🎭' }
    if (d === 60) base.milestone = { ar: '🎉 تخرج الاكتشاف', en: '🎉 Discovery Graduation', path: '/journey', emoji: '🏆' }
    plan[d] = base
  }
  // Mastery (61-90)
  for (let d = 61; d <= 90; d++) {
    const base = {
      chapter: 'mastery',
      primary: { labelAr: 'تمرين الإتقان', labelEn: 'Mastery Practice', path: '/morning', emoji: '🏆' },
      optional: [
        { labelAr: 'قوة شخصية', labelEn: 'Personal Power', path: '/power30', emoji: '⚡' },
        { labelAr: 'إعادة ضبط', labelEn: 'Triad Reset', path: '/emergency', emoji: '🔁' },
      ],
    }
    if (d === 65) base.milestone = { ar: 'NAC', en: 'NAC', path: '/nac', emoji: '🧬' },
    (plan[65] = plan[65] || base)
    if (d === 70) base.milestone = { ar: 'خوف إلى قوة', en: 'Fear to Power', path: '/fear', emoji: '⚔️' }
    if (d === 75) base.milestone = { ar: 'النمذجة', en: 'Modeling Excellence', path: '/modeling', emoji: '📚' }
    if (d === 80) base.milestone = { ar: 'رأس مال قوتك', en: 'Personal Power Capital', path: '/power30', emoji: '💪' }
    if (d === 85) base.milestone = { ar: 'الفعل الجبار', en: 'Massive Action', path: '/massive-action', emoji: '🚀' }
    if (d === 90) base.milestone = { ar: '🎊 تخرج الإتقان', en: '🎊 Mastery Graduation', path: '/journey', emoji: '👑' }
    plan[d] = base
  }
  return plan
})()

/**
 * Compute current day in journey based on startDate.
 */
export function computeCurrentDay(state) {
  const j = state.journey90
  if (!j || !j.active || !j.startDate) return 0
  const start = new Date(j.startDate + 'T00:00:00')
  const now = new Date()
  const diffMs = now - start
  const days = Math.floor(diffMs / 86400000) + 1
  return Math.min(Math.max(days, 1), 90)
}

/**
 * Get current chapter object.
 */
export function getCurrentChapter(state) {
  const day = computeCurrentDay(state)
  return CHAPTERS.find(c => day >= c.startDay && day <= c.endDay) || CHAPTERS[0]
}

/**
 * Overall progress percentage (0-100).
 */
export function getJourneyProgress(state) {
  const j = state.journey90 || {}
  if (!j.active) return 0
  const completions = j.dayCompletions || {}
  const completed = Object.keys(completions).length
  return Math.round((completed / 90) * 100)
}

/**
 * Whether today's primary task is complete.
 */
export function isTodayComplete(state) {
  const day = computeCurrentDay(state)
  if (day === 0) return false
  return !!((state.journey90 || {}).dayCompletions || {})[day]
}

/**
 * Days completed within the current chapter.
 */
export function chapterProgress(state) {
  const j = state.journey90 || {}
  if (!j.active) return { chapter: null, done: 0, total: 30 }
  const chapter = getCurrentChapter(state)
  const completions = j.dayCompletions || {}
  let done = 0
  for (let d = chapter.startDay; d <= chapter.endDay; d++) {
    if (completions[d]) done++
  }
  return { chapter, done, total: chapter.endDay - chapter.startDay + 1 }
}

/**
 * Get today's plan (primary + optional + milestone).
 */
export function getTodayPlan(state) {
  const day = computeCurrentDay(state)
  if (day === 0) return null
  return { day, ...DAY_PLAN[day] }
}
