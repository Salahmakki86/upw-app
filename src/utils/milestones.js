/**
 * #8 — Breakthrough Milestone Detection
 * Checks for milestone moments and returns celebration data
 */

const MILESTONES = [
  {
    id: 'streak_7',
    check: s => (s.streak || 0) === 7,
    emoji: '🔥',
    titleAr: 'أسبوع كامل!', titleEn: 'Full Week!',
    msgAr: '٧ أيام متواصلة — أنت تبني عادة حقيقية. توني يقول: "التكرار هو أم المهارة"',
    msgEn: '7 days straight — you\'re building a real habit. Tony says: "Repetition is the mother of skill"',
    color: '#e67e22',
  },
  {
    id: 'streak_14',
    check: s => (s.streak || 0) === 14,
    emoji: '⚡',
    titleAr: 'أسبوعان من القوة!', titleEn: '2 Weeks of Power!',
    msgAr: '١٤ يوم — أنت الآن في منطقة التحول. عقلك يبدأ بتقبل الهوية الجديدة',
    msgEn: '14 days — you\'re in the transformation zone. Your brain is accepting your new identity',
    color: '#f1c40f',
  },
  {
    id: 'streak_21',
    check: s => (s.streak || 0) === 21,
    emoji: '💎',
    titleAr: '٢١ يوم — عادة جديدة!', titleEn: '21 Days — New Habit!',
    msgAr: 'العلم يقول أن ٢١ يوماً كافية لبناء عادة. أنت لم تعد تحاول — أنت تعيشها!',
    msgEn: 'Science says 21 days builds a habit. You\'re not trying anymore — you\'re LIVING it!',
    color: '#9b59b6',
  },
  {
    id: 'streak_30',
    check: s => (s.streak || 0) === 30,
    emoji: '👑',
    titleAr: 'محارب الشهر!', titleEn: 'Month Warrior!',
    msgAr: '٣٠ يوم من الالتزام — أنت أثبتت لنفسك أنك شخص مختلف. هذا ليس تحفيزاً — هذا هويتك الجديدة!',
    msgEn: '30 days of commitment — you\'ve proven to yourself you\'re a different person. This isn\'t motivation — this is your NEW IDENTITY!',
    color: '#c9a84c',
  },
  {
    id: 'streak_60',
    check: s => (s.streak || 0) === 60,
    emoji: '🏆',
    titleAr: 'شهران من التميز!', titleEn: '60 Days of Excellence!',
    msgAr: 'أنت في الـ 1% — معظم الناس يتوقفون بعد أسبوع. أنت مستمر منذ شهرين!',
    msgEn: 'You\'re in the top 1% — most people quit after a week. You\'ve been going for 2 months!',
    color: '#2ecc71',
  },
  {
    id: 'gratitude_30',
    check: s => Object.keys(s.gratitude || {}).filter(d =>
      (s.gratitude[d] || []).filter(Boolean).length >= 3
    ).length >= 30,
    emoji: '🙏',
    titleAr: '٣٠ يوم امتنان!', titleEn: '30 Days of Gratitude!',
    msgAr: 'كتبت الامتنان ٣٠ يوماً — الأبحاث تثبت أن عقلك الآن يرى الإيجابيات تلقائياً',
    msgEn: 'You wrote gratitude for 30 days — research proves your brain now automatically sees positives',
    color: '#27ae60',
  },
  {
    id: 'first_goal_done',
    check: s => (s.goals || []).some(g => (g.progress || 0) >= 100),
    emoji: '🎯',
    titleAr: 'أول هدف محقق!', titleEn: 'First Goal Achieved!',
    msgAr: 'أكملت هدفك الأول — هذا دليل أنك تستطيع تحقيق أي شيء تقرره!',
    msgEn: 'You completed your first goal — this proves you can achieve ANYTHING you decide!',
    color: '#3498db',
  },
  {
    id: 'perfect_week',
    check: s => {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i)
        return d.toISOString().slice(0, 10)
      })
      const gratitude = s.gratitude || {}
      const habits = s.habitTracker?.log || {}
      return days.every(d =>
        (gratitude[d] || []).filter(Boolean).length >= 3 &&
        (habits[d] || []).length > 0
      )
    },
    emoji: '⭐',
    titleAr: 'أسبوع مثالي!', titleEn: 'Perfect Week!',
    msgAr: 'أسبوع كامل من الامتنان والعادات — أنت تعيش حياة الـ 1%!',
    msgEn: 'A full week of gratitude AND habits — you\'re living the 1% life!',
    color: '#f39c12',
  },
]

/**
 * Check for new milestones that haven't been celebrated yet
 * @returns {Object|null} milestone to celebrate, or null
 */
export function checkMilestones(state) {
  const celebrated = state.celebratedMilestones || []
  const celebratedSet = new Set(celebrated)

  for (const m of MILESTONES) {
    if (!celebratedSet.has(m.id) && m.check(state)) {
      return m
    }
  }
  return null
}

export { MILESTONES }
