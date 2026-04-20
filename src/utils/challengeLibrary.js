/**
 * Challenge Marketplace — curated packaged challenges
 * Each challenge has a daily task, a duration, and a "theme" outcome.
 *
 * These are DIFFERENT from dailyChallenges (which are ad-hoc) and
 * from groupChallenge (which is admin-set).
 * This is the USER-picked library of 30-day & 7-day challenges.
 */

export const CHALLENGES = [
  {
    id: 'morning-warrior-30',
    durationDays: 30,
    emoji: '☀️',
    titleAr: 'محارب الصباح (30 يوم)', titleEn: 'Morning Warrior (30 days)',
    descAr: 'طقس صباحي 10 دقائق كل يوم — بدون استثناء',
    descEn: 'Morning ritual for 10 min every day — no exceptions',
    dailyTaskAr: 'أكمل الطقس الصباحي (10 دقائق على الأقل)',
    dailyTaskEn: 'Complete the morning ritual (at least 10 min)',
    linkedPath: '/morning',
    category: 'discipline',
  },
  {
    id: 'gratitude-21',
    durationDays: 21,
    emoji: '🙏',
    titleAr: 'قوة الامتنان (21 يوم)', titleEn: 'Power of Gratitude (21 days)',
    descAr: '3 أشياء ممتن لها كل مساء — بوعي وشعور',
    descEn: '3 things you\'re grateful for every evening — with awareness',
    dailyTaskAr: 'اكتب 3 نعم ممتن لها بوعي',
    dailyTaskEn: 'Write 3 things you\'re grateful for',
    linkedPath: '/gratitude',
    category: 'mindset',
  },
  {
    id: 'body-movement-7',
    durationDays: 7,
    emoji: '💪',
    titleAr: 'تحريك الجسد (7 أيام)', titleEn: 'Body Movement (7 days)',
    descAr: '30 دقيقة حركة كل يوم — مشي، تمرين، رقص',
    descEn: '30 minutes of movement daily — walk, workout, dance',
    dailyTaskAr: 'حرّك جسدك 30 دقيقة',
    dailyTaskEn: 'Move your body for 30 minutes',
    linkedPath: '/protocol',
    category: 'health',
  },
  {
    id: 'incantations-30',
    durationDays: 30,
    emoji: '🗣',
    titleAr: 'تعويذات القوة (30 يوم)', titleEn: 'Incantations of Power (30 days)',
    descAr: 'قل تعويذاتك بصوت عالٍ بكل جسدك كل صباح',
    descEn: 'Say your incantations out loud with your whole body every morning',
    dailyTaskAr: 'قل تعويذاتك 3 مرات بصوت عالٍ',
    dailyTaskEn: 'Say your incantations 3 times out loud',
    linkedPath: '/incantations',
    category: 'identity',
  },
  {
    id: 'no-complain-7',
    durationDays: 7,
    emoji: '🤫',
    titleAr: 'بلا شكوى (7 أيام)', titleEn: 'No Complaining (7 days)',
    descAr: 'لا كلمة شكوى — عن أي شيء، لأي أحد، لمدة 7 أيام كاملة',
    descEn: 'Not one complaint — about anything, to anyone, for 7 full days',
    dailyTaskAr: 'اليوم: لا شكوى، لا تذمر، لا انتقاد',
    dailyTaskEn: 'Today: no complaining, no whining, no criticism',
    linkedPath: '/dashboard',
    category: 'mindset',
  },
  {
    id: 'wealth-mindset-30',
    durationDays: 30,
    emoji: '💎',
    titleAr: 'عقلية الوفرة (30 يوم)', titleEn: 'Wealth Mindset (30 days)',
    descAr: 'كل يوم: تسجيل 3 فرص مالية + قراءة صفحة واحدة',
    descEn: 'Daily: log 3 financial opportunities + read one page',
    dailyTaskAr: 'سجّل 3 فرص + اقرأ صفحة',
    dailyTaskEn: 'Log 3 opportunities + read a page',
    linkedPath: '/freedom',
    category: 'finances',
  },
  {
    id: 'vulnerability-7',
    durationDays: 7,
    emoji: '💝',
    titleAr: 'الضعف الشجاع (7 أيام)', titleEn: 'Brave Vulnerability (7 days)',
    descAr: 'كل يوم: مكالمة/رسالة واحدة بصدق كامل لشخص مهم',
    descEn: 'Daily: one call/message with full honesty to someone important',
    dailyTaskAr: 'محادثة صادقة مع شخص مهم',
    dailyTaskEn: 'Honest conversation with someone important',
    linkedPath: '/relationships',
    category: 'relationships',
  },
  {
    id: 'reading-30',
    durationDays: 30,
    emoji: '📚',
    titleAr: 'القراءة اليومية (30 يوم)', titleEn: 'Daily Reading (30 days)',
    descAr: 'فصل واحد كل يوم — بوعي واستخلاص 3 أفكار',
    descEn: 'One chapter daily — with 3 extracted insights',
    dailyTaskAr: 'اقرأ فصلاً واكتب 3 أفكار',
    dailyTaskEn: 'Read a chapter and write 3 insights',
    linkedPath: '/reading',
    category: 'learning',
  },
  {
    id: 'cold-exposure-14',
    durationDays: 14,
    emoji: '🧊',
    titleAr: 'الماء البارد (14 يوم)', titleEn: 'Cold Exposure (14 days)',
    descAr: '90 ثانية ماء بارد في نهاية الحمام — يومياً',
    descEn: '90 seconds cold water at end of shower — daily',
    dailyTaskAr: '90 ثانية ماء بارد',
    dailyTaskEn: '90 seconds cold water',
    linkedPath: '/protocol',
    category: 'health',
  },
  {
    id: 'sleep-discipline-21',
    durationDays: 21,
    emoji: '😴',
    titleAr: 'انضباط النوم (21 يوم)', titleEn: 'Sleep Discipline (21 days)',
    descAr: 'نم قبل منتصف الليل — 7+ ساعات — سجّل يومياً',
    descEn: 'Bed before midnight — 7+ hours — log daily',
    dailyTaskAr: 'سجّل 7+ ساعات نوم',
    dailyTaskEn: 'Log 7+ hours sleep',
    linkedPath: '/sleep',
    category: 'health',
  },
  {
    id: 'daily-wins-30',
    durationDays: 30,
    emoji: '🏆',
    titleAr: 'انتصارات يومية (30 يوم)', titleEn: 'Daily Wins (30 days)',
    descAr: 'سجّل 3 انتصارات يومية مهما صغرت',
    descEn: 'Log 3 daily wins, no matter how small',
    dailyTaskAr: 'سجّل 3 انتصارات',
    dailyTaskEn: 'Log 3 wins',
    linkedPath: '/wins',
    category: 'celebration',
  },
  {
    id: 'deep-work-21',
    durationDays: 21,
    emoji: '🎯',
    titleAr: 'العمل العميق (21 يوم)', titleEn: 'Deep Work (21 days)',
    descAr: '90 دقيقة عمل مركّز بدون هاتف أو إشعارات',
    descEn: '90 minutes focused work — no phone, no notifications',
    dailyTaskAr: '90 دقيقة عمل عميق',
    dailyTaskEn: '90 min deep work',
    linkedPath: '/power-hour',
    category: 'career',
  },
]

export function getChallengeById(id) {
  return CHALLENGES.find(c => c.id === id) || null
}

export function isChallengeAccepted(state, challengeId) {
  const mp = state.challengeMarketplace || {}
  return (mp.accepted || []).some(c => c.challengeId === challengeId)
}

export function getChallengeProgress(state, challengeId) {
  const mp = state.challengeMarketplace || {}
  const active = (mp.accepted || []).find(c => c.challengeId === challengeId)
  if (!active) return { active: false, daysDone: 0, daysTotal: 0, pct: 0 }
  const challenge = getChallengeById(challengeId)
  const daysDone = Object.values(active.progress || {}).filter(Boolean).length
  const daysTotal = challenge?.durationDays || 30
  return {
    active: true,
    daysDone,
    daysTotal,
    pct: Math.round((daysDone / daysTotal) * 100),
    startDate: active.startDate,
  }
}
