/**
 * Fix #8 — Deep Onboarding Profile Personalization
 * Uses onboardingProfile (goalArea, challenge, timePerDay, focusPath)
 * to customize the entire experience dynamically.
 */

const GOAL_CONTEXT = {
  health: {
    emoji: '💪',
    toolsAr: ['تتبع النوم', 'بروتوكول الطاقة', 'تحدي العادات'],
    toolsEn: ['Sleep Log', 'Energy Protocol', 'Habit Challenge'],
    routes: ['/sleep', '/habits', '/challenge'],
    tipAr: 'ركّز على النوم أولاً — هو أساس كل شيء',
    tipEn: 'Focus on sleep first — it\'s the foundation of everything',
    greetAr: 'جسمك هو معبدك — اهتم به اليوم',
    greetEn: 'Your body is your temple — honor it today',
  },
  career: {
    emoji: '🚀',
    toolsAr: ['الأهداف RPM', 'لوحة الأعمال', 'سبرنت ٩٠ يوم'],
    toolsEn: ['RPM Goals', 'Biz Dashboard', '90-Day Sprint'],
    routes: ['/goals', '/biz-dashboard', '/sprint90'],
    tipAr: 'أكبر عائق للنمو المهني هو عدم الوضوح — حدد هدفك',
    tipEn: 'Biggest career blocker is lack of clarity — define your target',
    greetAr: 'كل يوم خطوة نحو القمة',
    greetEn: 'Every day one step closer to the summit',
  },
  finances: {
    emoji: '💰',
    toolsAr: ['الحرية المالية', 'لوحة الأعمال', 'قرارات الأعمال'],
    toolsEn: ['Financial Freedom', 'Biz Dashboard', 'Decision Journal'],
    routes: ['/freedom', '/biz-dashboard', '/decisions'],
    tipAr: 'المال يأتي من القيمة التي تقدمها — ركّز على العطاء',
    tipEn: 'Money follows value — focus on giving more',
    greetAr: 'الوفرة حالة ذهنية قبل أن تكون رقماً',
    greetEn: 'Abundance is a mindset before a number',
  },
  relationships: {
    emoji: '❤️',
    toolsAr: ['العلاقات', 'عجلة الحياة', 'رسائل لنفسك'],
    toolsEn: ['Relationships', 'Wheel of Life', 'Letters to Self'],
    routes: ['/relationships', '/wheel', '/letters'],
    tipAr: 'جودة حياتك = جودة علاقاتك',
    tipEn: 'Quality of life = quality of your relationships',
    greetAr: 'أجمل استثمار هو في من تحب',
    greetEn: 'The best investment is in those you love',
  },
  mindset: {
    emoji: '🧠',
    toolsAr: ['المعتقدات', 'الترديدات', 'NAC'],
    toolsEn: ['Beliefs', 'Incantations', 'NAC'],
    routes: ['/beliefs', '/incantations', '/nac'],
    tipAr: 'غيّر قصتك تتغير حياتك — المعتقدات تصنع المصير',
    tipEn: 'Change your story, change your life — beliefs shape destiny',
    greetAr: 'عقلك هو أقوى أدواتك',
    greetEn: 'Your mind is your most powerful tool',
  },
  energy: {
    emoji: '⚡',
    toolsAr: ['إدارة الحالة', 'الروتين الصباحي', 'بروتوكول الطاقة'],
    toolsEn: ['State Management', 'Morning Ritual', 'Energy Protocol'],
    routes: ['/state', '/morning', '/habits'],
    tipAr: 'الطاقة هي العملة الحقيقية — اشحن نفسك أولاً',
    tipEn: 'Energy is the real currency — charge yourself first',
    greetAr: 'طاقتك اليوم تحدد مصيرك غداً',
    greetEn: 'Your energy today shapes your destiny tomorrow',
  },
}

const CHALLENGE_ADVICE = {
  consistency: {
    ar: 'لا تحاول أن تكون مثالياً — ابدأ بدقيقة واحدة فقط كل يوم',
    en: 'Don\'t aim for perfect — start with just 1 minute every day',
    focusRoute: '/habits',
  },
  clarity: {
    ar: 'الخطوة الأولى: اكتب هدفك الأهم — الوضوح يأتي بالكتابة',
    en: 'Step one: write your #1 goal — clarity comes from writing',
    focusRoute: '/goals',
  },
  motivation: {
    ar: 'الدافع يأتي من الحركة وليس العكس — تحرّك ثم ستشعر بالحماس',
    en: 'Motivation follows action, not the other way around — move first',
    focusRoute: '/state',
  },
  overwhelm: {
    ar: 'لا تفعل كل شيء — اختر ٣ أشياء فقط اليوم وأنجزها',
    en: 'Don\'t do everything — pick just 3 things today and crush them',
    focusRoute: '/today',
  },
  time: {
    ar: 'ليس لديك وقت؟ ابدأ بـ ٥ دقائق صباحاً — التأثير سيفاجئك',
    en: 'No time? Start with 5 minutes each morning — the impact will surprise you',
    focusRoute: '/morning',
  },
}

/**
 * Get personalized greeting based on profile
 */
export function getPersonalizedGreeting(profile, isAr) {
  const ctx = GOAL_CONTEXT[profile?.goalArea]
  if (!ctx) return null
  return {
    text: isAr ? ctx.greetAr : ctx.greetEn,
    emoji: ctx.emoji,
  }
}

/**
 * Get recommended tools for user's goal area
 */
export function getRecommendedTools(profile, isAr) {
  const ctx = GOAL_CONTEXT[profile?.goalArea]
  if (!ctx) return []
  const names = isAr ? ctx.toolsAr : ctx.toolsEn
  return ctx.routes.map((route, i) => ({
    name: names[i],
    route,
    emoji: ctx.emoji,
  }))
}

/**
 * Get challenge-specific coaching tip
 */
export function getChallengeTip(profile, isAr) {
  const advice = CHALLENGE_ADVICE[profile?.challenge]
  if (!advice) return null
  return {
    text: isAr ? advice.ar : advice.en,
    focusRoute: advice.focusRoute,
  }
}

/**
 * Get daily personalized tip that rotates based on day + profile
 */
export function getDailyPersonalizedTip(profile, isAr) {
  const ctx = GOAL_CONTEXT[profile?.goalArea]
  if (!ctx) return null

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const tips = getTipPool(profile, isAr)
  const tip = tips[dayOfYear % tips.length]
  return tip
}

function getTipPool(profile, isAr) {
  const ctx = GOAL_CONTEXT[profile?.goalArea]
  const advice = CHALLENGE_ADVICE[profile?.challenge]
  const pool = []

  if (ctx) pool.push({ text: isAr ? ctx.tipAr : ctx.tipEn, emoji: ctx.emoji, type: 'goal' })
  if (advice) pool.push({ text: isAr ? advice.ar : advice.en, emoji: '💡', type: 'challenge' })

  // Time-based tips
  const time = profile?.timePerDay
  if (time === '5') {
    pool.push({
      text: isAr ? 'في ٥ دقائق يمكنك تغيير يومك بالكامل — ابدأ بالتنفس' : 'In 5 minutes you can transform your whole day — start with breathing',
      emoji: '⏱️', type: 'time',
    })
  } else if (time === '60') {
    pool.push({
      text: isAr ? 'ساعة كاملة! استخدمها بحكمة — الروتين الصباحي + الأهداف + المعتقدات' : 'A full hour! Use it wisely — morning ritual + goals + beliefs work',
      emoji: '🕐', type: 'time',
    })
  }

  // Universal Tony Robbins tips
  pool.push(
    { text: isAr ? 'حيث يذهب تركيزك تذهب طاقتك' : 'Where focus goes, energy flows', emoji: '🎯', type: 'tony' },
    { text: isAr ? 'الحركة تخلق العاطفة — تحرّك الآن' : 'Motion creates emotion — MOVE', emoji: '🔥', type: 'tony' },
    { text: isAr ? 'في لحظات قراراتك يتشكل مصيرك' : 'In your moments of decision, destiny is shaped', emoji: '⚡', type: 'tony' },
  )

  return pool
}

/**
 * Compute personalized priority for time-based task suggestions
 * Adjusts task order based on user's time availability and goal area
 */
export function getPersonalizedTaskOrder(profile, defaultOrder) {
  if (!profile?.goalArea) return defaultOrder

  const priorityMap = {
    health:        ['morning', 'sleep', 'habits', 'state'],
    career:        ['morning', 'goals', 'state', 'habits'],
    finances:      ['morning', 'goals', 'state', 'habits'],
    relationships: ['morning', 'gratitude', 'state', 'evening'],
    mindset:       ['morning', 'state', 'gratitude', 'habits'],
    energy:        ['morning', 'state', 'habits', 'sleep'],
  }

  const priorities = priorityMap[profile.goalArea] || []
  if (priorities.length === 0) return defaultOrder

  // Move priority tasks to front while keeping rest in original order
  const prioritized = []
  const rest = []
  defaultOrder.forEach(id => {
    if (priorities.includes(id)) prioritized.push(id)
    else rest.push(id)
  })

  // Sort prioritized by their position in the priority list
  prioritized.sort((a, b) => priorities.indexOf(a) - priorities.indexOf(b))
  return [...prioritized, ...rest]
}
