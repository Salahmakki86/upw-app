/**
 * Adaptive Path Engine — Batch 5
 * Recommends features based on onboarding profile + unlock tier + current state
 */

const PATH_MAP = {
  // focusPath → recommended routes in priority order
  energy: [
    { path: '/morning',   emoji: '☀️', tier: 1, labelAr: 'الروتين الصباحي',      labelEn: 'Morning Ritual',       descAr: 'ابدأ بالضخ — تنفس وامتنان', descEn: 'Start with priming — breath & gratitude' },
    { path: '/energy',    emoji: '🔥', tier: 1, labelAr: 'تحدي الطاقة',           labelEn: 'Energy Challenge',     descAr: '١٠ أيام لبناء عادات الطاقة', descEn: '10-day energy habit builder' },
    { path: '/protocol',  emoji: '💧', tier: 4, labelAr: 'بروتوكول الطاقة',       labelEn: 'Energy Protocol',      descAr: 'ماء + حركة + تغذية يومياً', descEn: 'Water + movement + nutrition daily' },
    { path: '/sleep',     emoji: '🌙', tier: 1, labelAr: 'تتبع النوم',            labelEn: 'Sleep Tracker',        descAr: 'النوم الجيد = طاقة عالية', descEn: 'Good sleep = high energy' },
    { path: '/state',     emoji: '⚡', tier: 1, labelAr: 'إدارة الحالة',          labelEn: 'State Management',     descAr: 'تعلم تغيير حالتك في ثوانٍ', descEn: 'Learn to shift your state instantly' },
    { path: '/incantations', emoji: '🗣', tier: 2, labelAr: 'التأكيدات',           labelEn: 'Incantations',         descAr: 'كلمات القوة اليومية', descEn: 'Daily power words' },
  ],
  goals: [
    { path: '/goals',     emoji: '🎯', tier: 2, labelAr: 'أهداف RPM',             labelEn: 'RPM Goals',            descAr: 'حدد نتيجتك وغرضك وخطتك', descEn: 'Define your Result, Purpose & Plan' },
    { path: '/morning',   emoji: '☀️', tier: 1, labelAr: 'الروتين الصباحي',      labelEn: 'Morning Ritual',       descAr: 'تصور أهدافك كل صباح', descEn: 'Visualize your goals each morning' },
    { path: '/compelling-future', emoji: '🔮', tier: 3, labelAr: 'المستقبل المشرق', labelEn: 'Compelling Future', descAr: 'ارسم رؤية ١-١٠ سنوات', descEn: 'Design your 1-10 year vision' },
    { path: '/wheel',     emoji: '🌐', tier: 2, labelAr: 'عجلة الحياة',           labelEn: 'Wheel of Life',        descAr: 'اكتشف أين التوازن', descEn: 'Discover where balance is needed' },
    { path: '/sprint90',  emoji: '🏃', tier: 3, labelAr: 'سبرنت ٩٠ يوم',         labelEn: '90-Day Sprint',        descAr: 'ركّز على هدف واحد ٩٠ يوم', descEn: 'Focus on one goal for 90 days' },
    { path: '/commitment', emoji: '✍️', tier: 3, labelAr: 'عقد الالتزام',          labelEn: 'Commitment Contract',  descAr: 'التزم كتابياً بأهدافك', descEn: 'Commit to your goals in writing' },
  ],
  mindset: [
    { path: '/beliefs',   emoji: '🧠', tier: 2, labelAr: 'تحويل المعتقدات',      labelEn: 'Beliefs Transformation', descAr: 'اكتشف وحوّل معتقداتك', descEn: 'Discover & transform your beliefs' },
    { path: '/morning',   emoji: '☀️', tier: 1, labelAr: 'الروتين الصباحي',      labelEn: 'Morning Ritual',       descAr: 'ابنِ ذهنية القوة صباحاً', descEn: 'Build a power mindset each morning' },
    { path: '/nac',       emoji: '⚡', tier: 3, labelAr: 'عملية NAC',             labelEn: 'NAC Process',          descAr: 'اكسر الأنماط القديمة نهائياً', descEn: 'Break old patterns permanently' },
    { path: '/life-story', emoji: '📖', tier: 3, labelAr: 'إعادة صياغة القصة',    labelEn: 'Life Story Reframing', descAr: 'أعد كتابة قصتك', descEn: 'Rewrite your story' },
    { path: '/values',    emoji: '💎', tier: 3, labelAr: 'قيمك الأساسية',         labelEn: 'Values Hierarchy',     descAr: 'اكتشف ما يهمك حقاً', descEn: 'Discover what truly matters' },
    { path: '/fear',      emoji: '🦁', tier: 3, labelAr: 'من الخوف للقوة',        labelEn: 'Fear to Power',        descAr: 'حوّل مخاوفك لوقود', descEn: 'Turn fears into fuel' },
  ],
  business: [
    { path: '/biz-dashboard', emoji: '📊', tier: 3, labelAr: 'لوحة الأعمال',      labelEn: 'Biz Dashboard',        descAr: 'نظرة شاملة على عملك', descEn: 'Full business overview' },
    { path: '/morning',   emoji: '☀️', tier: 1, labelAr: 'الروتين الصباحي',      labelEn: 'Morning Ritual',       descAr: 'ابدأ يوم العمل بتركيز', descEn: 'Start your work day focused' },
    { path: '/goals',     emoji: '🎯', tier: 2, labelAr: 'أهداف RPM',             labelEn: 'RPM Goals',            descAr: 'حدد أهداف العمل بدقة', descEn: 'Define precise business goals' },
    { path: '/pipeline',  emoji: '💰', tier: 3, labelAr: 'قمع المبيعات',          labelEn: 'Sales Pipeline',       descAr: 'تتبع صفقاتك وتحويلاتك', descEn: 'Track deals & conversions' },
    { path: '/power-hour', emoji: '⏰', tier: 3, labelAr: 'ساعة القوة',           labelEn: 'Power Hour',           descAr: 'ساعة مركزة بلا انقطاع', descEn: 'One focused hour, no interruptions' },
    { path: '/network',   emoji: '🤝', tier: 3, labelAr: 'شبكة العلاقات',         labelEn: 'Network Tracker',      descAr: 'ابنِ علاقات استراتيجية', descEn: 'Build strategic relationships' },
  ],
  balance: [
    { path: '/morning',   emoji: '☀️', tier: 1, labelAr: 'الروتين الصباحي',      labelEn: 'Morning Ritual',       descAr: 'أساس كل شيء', descEn: 'The foundation of everything' },
    { path: '/wheel',     emoji: '🌐', tier: 2, labelAr: 'عجلة الحياة',           labelEn: 'Wheel of Life',        descAr: 'قيّم ٧ مجالات حياتك', descEn: 'Rate 7 areas of your life' },
    { path: '/gratitude', emoji: '🙏', tier: 1, labelAr: 'دفتر الامتنان',         labelEn: 'Gratitude Journal',    descAr: '٣ أشياء تمتن لها يومياً', descEn: '3 things to be grateful for daily' },
    { path: '/habits',    emoji: '✅', tier: 1, labelAr: 'تتبع العادات',          labelEn: 'Habit Tracker',        descAr: 'ابنِ عادات تدعم توازنك', descEn: 'Build habits that support balance' },
    { path: '/weekly-pulse', emoji: '📊', tier: 2, labelAr: 'الفحص الأسبوعي',     labelEn: 'Weekly Pulse',         descAr: 'راجع أسبوعك بصدق', descEn: 'Review your week honestly' },
    { path: '/relationships', emoji: '❤️', tier: 4, labelAr: 'إتقان العلاقات',     labelEn: 'Relationship Mastery', descAr: 'طوّر أهم علاقاتك', descEn: 'Develop your key relationships' },
  ],
}

// Maps goalArea → focusPath
function computeFocusPath(profile) {
  if (!profile || !profile.goalArea) return 'balance'
  const map = {
    health:        'energy',
    energy:        'energy',
    career:        'goals',
    finances:      'business',
    relationships: 'balance',
    mindset:       'mindset',
  }
  return map[profile.goalArea] || 'balance'
}

/**
 * Get personalized recommendations for the user
 * @param {object} state — full app state
 * @param {number} tier — current unlock tier (1-4)
 * @param {boolean} isAr — is Arabic
 * @returns {object[]} — up to 3 recommended actions
 */
export function getRecommendations(state, tier, isAr) {
  const profile = state.onboardingProfile || {}
  const focusPath = profile.focusPath || computeFocusPath(profile)
  const paths = PATH_MAP[focusPath] || PATH_MAP.balance

  // Filter to unlocked features only
  const available = paths.filter(p => p.tier <= tier)

  // Score each recommendation by relevance
  const scored = available.map(rec => {
    let score = 0

    // Boost features aligned with user's challenge
    if (profile.challenge === 'consistency' && ['/morning', '/habits', '/energy'].includes(rec.path)) score += 3
    if (profile.challenge === 'clarity' && ['/goals', '/values', '/wheel', '/compelling-future'].includes(rec.path)) score += 3
    if (profile.challenge === 'motivation' && ['/beliefs', '/incantations', '/state', '/nac'].includes(rec.path)) score += 3
    if (profile.challenge === 'overwhelm' && ['/emergency', '/morning', '/gratitude'].includes(rec.path)) score += 3
    if (profile.challenge === 'time' && ['/power-hour', '/morning', '/sprint90'].includes(rec.path)) score += 3

    // Deprioritize features the user has already engaged with heavily
    const today = new Date().toISOString().split('T')[0]
    if (rec.path === '/morning' && state.morningDone) score -= 5
    if (rec.path === '/state' && state.todayState) score -= 5
    if (rec.path === '/evening' && state.eveningDone) score -= 5
    if (rec.path === '/gratitude' && (state.gratitude?.[today] || []).filter(Boolean).length >= 3) score -= 5
    if (rec.path === '/goals' && (state.goals || []).length >= 3) score -= 2
    if (rec.path === '/beliefs' && (state.limitingBeliefs || []).length >= 2) score -= 2
    if (rec.path === '/wheel' && (state.wheelHistory || []).length >= 1) score -= 2

    // Boost features based on time of day
    const hour = new Date().getHours()
    if (hour < 12 && rec.path === '/morning') score += 2
    if (hour >= 19 && rec.path === '/evening') score += 2
    if (hour >= 12 && hour < 17 && ['/goals', '/power-hour', '/biz-dashboard'].includes(rec.path)) score += 1

    // Boost time-appropriate features based on timePerDay
    if (profile.timePerDay === '5' && ['/morning', '/gratitude', '/state'].includes(rec.path)) score += 2
    if (profile.timePerDay === '60' && ['/destiny', '/sprint90', '/compelling-future'].includes(rec.path)) score += 1

    return { ...rec, score }
  })

  // Sort by score descending, return top 3
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3)
}

/**
 * Get smart greeting based on profile
 */
export function getSmartGreeting(state, isAr) {
  const profile = state.onboardingProfile || {}
  const hour = new Date().getHours()

  let greeting = ''
  if (hour < 12) greeting = isAr ? 'صباح القوة' : 'Power morning'
  else if (hour < 17) greeting = isAr ? 'وقت الإنجاز' : 'Achievement time'
  else greeting = isAr ? 'مساء التأمل' : 'Reflection evening'

  // Add focus-specific nudge
  const focusPath = profile.focusPath || computeFocusPath(profile)
  const nudges = {
    energy:   { ar: '🔥 طاقتك هي أساس كل شيء', en: '🔥 Your energy is the foundation of everything' },
    goals:    { ar: '🎯 كل خطوة تقربك من هدفك', en: '🎯 Every step brings you closer to your goal' },
    mindset:  { ar: '🧠 عقلك هو أقوى أدواتك', en: '🧠 Your mind is your most powerful tool' },
    business: { ar: '💼 اليوم يوم بناء الإمبراطورية', en: '💼 Today is empire-building day' },
    balance:  { ar: '⚖️ التوازن هو مفتاح الحياة الاستثنائية', en: '⚖️ Balance is the key to an extraordinary life' },
  }

  const nudge = nudges[focusPath] || nudges.balance
  return { greeting, nudge: isAr ? nudge.ar : nudge.en }
}

/**
 * Get category order based on profile
 * Returns the preferred order of category keys
 */
export function getCategoryOrder(profile) {
  const focusPath = profile?.focusPath || computeFocusPath(profile)
  // Default: daily, learn, goals, programs, planning, business, tools, admin
  const base = ['daily', 'learn', 'goals', 'programs', 'planning', 'business', 'tools', 'admin']

  const priorityMap = {
    energy:   ['daily', 'programs', 'learn', 'goals', 'planning', 'tools', 'business', 'admin'],
    goals:    ['daily', 'goals', 'planning', 'learn', 'programs', 'tools', 'business', 'admin'],
    mindset:  ['daily', 'goals', 'programs', 'learn', 'planning', 'tools', 'business', 'admin'],
    business: ['daily', 'business', 'goals', 'planning', 'learn', 'programs', 'tools', 'admin'],
    balance:  base,
  }

  return priorityMap[focusPath] || base
}

export { computeFocusPath }
