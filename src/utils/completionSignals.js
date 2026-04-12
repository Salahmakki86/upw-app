/**
 * #11 — Unified Completion Signals
 * Consistent celebration messages and confetti-like effects across pages
 */

const CELEBRATIONS = {
  ar: [
    'أحسنت! استمر! 🔥',
    'رائع! أنت تبني عظمة! 💪',
    'ممتاز! خطوة أخرى نحو التحول! ⚡',
    'مذهل! قوتك تزداد! 🏆',
    'تم! أنت محارب حقيقي! 👑',
  ],
  en: [
    'Well done! Keep going! 🔥',
    'Amazing! You\'re building greatness! 💪',
    'Excellent! Another step toward transformation! ⚡',
    'Incredible! Your power is growing! 🏆',
    'Done! You\'re a true warrior! 👑',
  ],
}

/**
 * Get a random celebration message
 */
export function getCelebrationMessage(lang) {
  const msgs = CELEBRATIONS[lang] || CELEBRATIONS.en
  return msgs[Math.floor(Math.random() * msgs.length)]
}

/**
 * Get contextual completion message for a specific action
 */
export function getCompletionMessage(action, lang) {
  const isAr = lang === 'ar'
  const messages = {
    morning: {
      ar: 'الصباح مكتمل! أنت جاهز لتحقيق العظمة ☀️',
      en: 'Morning complete! You\'re ready for greatness ☀️',
    },
    evening: {
      ar: 'يوم رائع ينتهي بوعي — غداً ستكون أقوى 🌙',
      en: 'A great day ends with awareness — tomorrow you\'ll be stronger 🌙',
    },
    gratitude: {
      ar: 'الامتنان يفتح أبواب الوفرة 🙏',
      en: 'Gratitude opens the doors of abundance 🙏',
    },
    habits: {
      ar: 'عاداتك اليوم اكتملت! التكرار يصنع الإتقان ✅',
      en: 'Today\'s habits complete! Repetition creates mastery ✅',
    },
    sleep: {
      ar: 'نوم مسجل! الوعي بنومك يحسّنه تلقائياً 😴',
      en: 'Sleep logged! Awareness of your sleep automatically improves it 😴',
    },
    wins: {
      ar: 'انتصار مسجل! كل فوز يبني الزخم 🏆',
      en: 'Win logged! Every victory builds momentum 🏆',
    },
    goal: {
      ar: 'تقدم في الهدف! كل خطوة تهم 🎯',
      en: 'Goal progress! Every step matters 🎯',
    },
    state: {
      ar: 'حالتك مسجلة! الوعي هو الخطوة الأولى ⚡',
      en: 'State logged! Awareness is the first step ⚡',
    },
  }
  return messages[action]?.[lang] || getCelebrationMessage(lang)
}
