/**
 * Bootstrap Insights Engine
 *
 * Used for the first 7-21 days when insightEngine lacks enough data to
 * generate data-driven insights. Returns heuristic-based, progressive
 * guidance that mirrors Tony Robbins' "onboarding the user into their
 * own transformation" narrative.
 *
 * Design principles:
 *   - Never blocks the data-driven engine — only a fallback
 *   - Uses state already present (morningLog, stateCheckin, goals, etc.)
 *   - Provides action for every insight (so it's not just narrative)
 *   - Bilingual (ar/en)
 */

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function daysSince(isoDate) {
  if (!isoDate) return 999
  const a = new Date(isoDate.slice(0, 10) + 'T00:00:00')
  const b = new Date(todayStr() + 'T00:00:00')
  return Math.floor((b - a) / 86400000)
}

/**
 * Returns the total number of "active days" the user has logged in the app.
 * Uses morningLog + stateCheckin as signals.
 */
export function getActivityDays(state) {
  const morningDays = new Set(state.morningLog || [])
  const stateDays   = new Set(Object.keys(state.stateCheckin || {}))
  return new Set([...morningDays, ...stateDays]).size
}

/**
 * Primary entry: returns a prioritized list of heuristic insights.
 * Each insight has:
 *   { id, priority, emoji, titleAr, titleEn, bodyAr, bodyEn,
 *     action: { labelAr, labelEn, path } }
 */
export function generateBootstrapInsights(state, isAr) {
  const insights = []
  const activityDays = getActivityDays(state)
  const morningCount = (state.morningLog || []).length
  const onboardingProfile = state.onboardingProfile || {}
  const hasGoals = (state.goals || []).length > 0
  const hasBaseline = !!state.baseline
  const hasCommitment = !!state.commitment
  const identityStatement = state.dwd?.identityStatements || ''
  const beliefsLimiting = (state.limitingBeliefs || []).length
  const beliefsEmpowering = (state.empoweringBeliefs || []).length
  const wheelHistory = (state.wheelHistory || []).length
  const sleepDays = Object.keys(state.sleepLog || {}).length
  const gratitudeDays = Object.keys(state.gratitude || {}).filter(d =>
    (state.gratitude[d] || []).filter(Boolean).length >= 1
  ).length
  const heroSelected = state.heroArchetype?.selected
  const triadResets = (state.triadResetLog || []).length

  // Day 0-2: Baseline first
  if (!hasBaseline && activityDays <= 3) {
    insights.push({
      id: 'bootstrap-baseline',
      priority: 10,
      emoji: '🧭',
      titleAr: 'ابدأ بتقييم نقطة انطلاقك',
      titleEn: 'Start with your Baseline',
      bodyAr: 'خمس دقائق لتقييم حياتك في 10 مجالات. هذه النقطة ستكون مرجعك.',
      bodyEn: '5 minutes to assess 10 life areas. This is your reference point.',
      action: { labelAr: 'ابدأ التقييم', labelEn: 'Start Assessment', path: '/baseline' },
    })
  }

  // Day 1-5: Morning momentum
  if (morningCount < 3) {
    insights.push({
      id: 'bootstrap-morning-3',
      priority: 9,
      emoji: '☀️',
      titleAr: '3 أصباح متتالية = تغيير ملموس',
      titleEn: '3 mornings in a row = real change',
      bodyAr: 'الطقس الصباحي هو المفتاح. 10 دقائق فقط — بعد 3 أيام ستلاحظ الفرق.',
      bodyEn: 'Morning ritual is the key. Just 10 minutes — after 3 days you\'ll notice the difference.',
      action: { labelAr: 'ابدأ الآن', labelEn: 'Start Now', path: '/morning' },
    })
  }

  // Day 2-7: Identity
  if (!identityStatement && activityDays >= 2) {
    insights.push({
      id: 'bootstrap-identity',
      priority: 8,
      emoji: '🎭',
      titleAr: 'من تريد أن تكون؟',
      titleEn: 'Who do you want to become?',
      bodyAr: 'تعريف هويتك هو البوصلة. 10 دقائق في "موعد مع القدر" ستحدد الطريق.',
      bodyEn: 'Defining your identity is your compass. 10 minutes in "Date with Destiny" sets the path.',
      action: { labelAr: 'حدد هويتك', labelEn: 'Define Identity', path: '/destiny' },
    })
  }

  // Day 3-10: Goals
  if (!hasGoals && activityDays >= 3) {
    insights.push({
      id: 'bootstrap-goals',
      priority: 9,
      emoji: '🎯',
      titleAr: 'اكتب هدفك الأول',
      titleEn: 'Write your first goal',
      bodyAr: 'هدف RPM واحد يغيّر كل شيء. لا تفكر طويلاً — اختر أهم شيء الآن.',
      bodyEn: 'One RPM goal changes everything. Don\'t overthink — pick what matters most now.',
      action: { labelAr: 'أضف هدفاً', labelEn: 'Add Goal', path: '/goals' },
    })
  }

  // Day 4-14: Wheel of Life
  if (wheelHistory === 0 && activityDays >= 4) {
    insights.push({
      id: 'bootstrap-wheel',
      priority: 7,
      emoji: '🎡',
      titleAr: 'كيف تبدو عجلة حياتك؟',
      titleEn: 'How does your life wheel look?',
      bodyAr: 'قيّم 7 مجالات في حياتك في 3 دقائق. ستكتشف الفجوة الكبرى.',
      bodyEn: 'Rate 7 areas of your life in 3 minutes. You\'ll discover the biggest gap.',
      action: { labelAr: 'قيّم العجلة', labelEn: 'Rate Wheel', path: '/wheel' },
    })
  }

  // Day 5-14: Sleep (important for energy)
  if (sleepDays === 0 && activityDays >= 5) {
    insights.push({
      id: 'bootstrap-sleep',
      priority: 6,
      emoji: '😴',
      titleAr: 'النوم يحدد طاقتك كلها',
      titleEn: 'Sleep determines all your energy',
      bodyAr: 'سجّل نومك الليلة. بعد أسبوع ستعرف أي عدد ساعات يمنحك أفضل أداء.',
      bodyEn: 'Log tonight\'s sleep. After a week you\'ll know which hours give you peak performance.',
      action: { labelAr: 'سجّل النوم', labelEn: 'Log Sleep', path: '/sleep' },
    })
  }

  // Day 3-7: Gratitude
  if (gratitudeDays < 3 && activityDays >= 3) {
    insights.push({
      id: 'bootstrap-gratitude',
      priority: 7,
      emoji: '🙏',
      titleAr: 'الامتنان يغيّر كيمياء دماغك',
      titleEn: 'Gratitude changes your brain chemistry',
      bodyAr: '3 أشياء ممتن لها — دقيقة واحدة. جرّب 7 أيام وراقب الفرق.',
      bodyEn: '3 things you\'re grateful for — one minute. Try 7 days and watch the difference.',
      action: { labelAr: 'اكتب امتناني', labelEn: 'Write Gratitude', path: '/gratitude' },
    })
  }

  // Day 5-14: Beliefs
  if (beliefsLimiting === 0 && beliefsEmpowering === 0 && activityDays >= 5) {
    insights.push({
      id: 'bootstrap-beliefs',
      priority: 6,
      emoji: '🧠',
      titleAr: 'ما المعتقد الذي يمنعك؟',
      titleEn: 'Which belief is stopping you?',
      bodyAr: 'اكتب معتقداً واحداً مقيّداً، واستبدله بمعتقد قوي. 5 دقائق تحوّل.',
      bodyEn: 'Write one limiting belief, replace it with an empowering one. 5-minute transformation.',
      action: { labelAr: 'اكتب معتقداتك', labelEn: 'Write Beliefs', path: '/beliefs' },
    })
  }

  // Day 7-21: Commitment contract
  if (!hasCommitment && activityDays >= 7) {
    insights.push({
      id: 'bootstrap-commitment',
      priority: 6,
      emoji: '📜',
      titleAr: 'عهد التزام مكتوب = هوية جديدة',
      titleEn: 'A written commitment = new identity',
      bodyAr: 'اكتب عهدك لنفسك. تحدث من طرفك، لنفسك، كأنك المدرب. قوة سرية.',
      bodyEn: 'Write your commitment to yourself. Speak TO yourself like a coach. Secret power.',
      action: { labelAr: 'اكتب عهدك', labelEn: 'Write Commitment', path: '/commitment' },
    })
  }

  // Day 7-14: Pick Hero Archetype
  if (!heroSelected && activityDays >= 7) {
    insights.push({
      id: 'bootstrap-hero',
      priority: 5,
      emoji: '⚔️',
      titleAr: 'اختر نمط بطلك الداخلي',
      titleEn: 'Choose your inner hero archetype',
      bodyAr: '12 نمطًا أصلانيًا من يونغ. أيهم يمثّلك؟ سؤال يغيّر قراراتك.',
      bodyEn: '12 Jungian archetypes. Which one is you? A question that shifts your decisions.',
      action: { labelAr: 'اختر بطلك', labelEn: 'Pick Archetype', path: '/hero-archetype' },
    })
  }

  // Day 14+: Triad Reset awareness
  if (triadResets === 0 && activityDays >= 14) {
    insights.push({
      id: 'bootstrap-triad',
      priority: 5,
      emoji: '🔁',
      titleAr: 'أداة "إعادة ضبط الحالة" تحت إصبعك',
      titleEn: 'The "State Reset" tool is at your fingertip',
      bodyAr: '60 ثانية: جسم + تركيز + لغة = حالة مختلفة فوراً. جرّبها.',
      bodyEn: '60 seconds: body + focus + language = instant new state. Try it.',
      action: { labelAr: 'جرّب الآن', labelEn: 'Try Now', path: '/emergency' },
    })
  }

  // Sort by priority descending
  insights.sort((a, b) => b.priority - a.priority)

  // Filter out already-seen insights (if state.bootstrapInsightsSeen has them)
  const seen = state.bootstrapInsightsSeen || {}
  const unseen = insights.filter(i => !seen[i.id] || daysSince(seen[i.id]) >= 14)

  // Return top 3
  return unseen.slice(0, 3)
}

/**
 * Short motivational "where you are" message for Day N
 */
export function getBootstrapPhase(state, isAr) {
  const days = getActivityDays(state)
  if (days === 0) return { emoji: '🌱', textAr: 'البداية — كل شيء أمامك', textEn: 'Day Zero — everything is ahead' }
  if (days <= 3)  return { emoji: '🌱', textAr: `اليوم ${days} — أول البذور`, textEn: `Day ${days} — first seeds` }
  if (days <= 7)  return { emoji: '🌿', textAr: `اليوم ${days} — تشكّل عاداتك`, textEn: `Day ${days} — habits forming` }
  if (days <= 14) return { emoji: '🌳', textAr: `اليوم ${days} — جذورك تتعمّق`, textEn: `Day ${days} — roots deepening` }
  if (days <= 30) return { emoji: '🌟', textAr: `اليوم ${days} — الزخم يبني نفسه`, textEn: `Day ${days} — momentum building` }
  return { emoji: '🔥', textAr: `اليوم ${days} — أنت الآن في الهوية الجديدة`, textEn: `Day ${days} — you are the new identity` }
}
