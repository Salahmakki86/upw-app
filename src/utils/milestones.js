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

  // ── Easier / early milestones ──────────────────────────────────
  {
    id: 'gratitude_10',
    check: s => Object.keys(s.gratitude || {}).filter(d =>
      (s.gratitude[d] || []).filter(Boolean).length >= 3
    ).length >= 10,
    emoji: '🌱',
    titleAr: '١٠ أيام امتنان!', titleEn: '10 Days of Gratitude!',
    msgAr: 'بذرة الامتنان بدأت تنمو — ١٠ أيام من رؤية النعم! توني يقول: "عندما تكون ممتناً، الخوف يختفي والوفرة تظهر"',
    msgEn: 'Your gratitude seed is growing — 10 days of seeing blessings! Tony says: "When you are grateful, fear disappears and abundance appears"',
    color: '#2ecc71',
  },
  {
    id: 'morning_ritual_10',
    check: s => (s.morningLog || []).length >= 10,
    emoji: '☀️',
    titleAr: '١٠ طقوس صباحية!', titleEn: '10 Morning Rituals!',
    msgAr: 'أكملت ١٠ طقوس صباحية — صباحك يحدد يومك، ويومك يحدد حياتك!',
    msgEn: 'You completed 10 morning rituals — your morning determines your day, and your day determines your LIFE!',
    color: '#f39c12',
  },
  {
    id: 'first_dickens',
    check: s => Object.keys(s.dickensResults || {}).length >= 1,
    emoji: '💥',
    titleAr: 'أول عملية ديكنز!', titleEn: 'First Dickens Process!',
    msgAr: 'كسرت أول معتقد مُقيّد! هذه اللحظة التي يبدأ فيها التحول الحقيقي — لم يعد الماضي يتحكم بمستقبلك',
    msgEn: 'You broke your first limiting belief! This is where real transformation begins — the past no longer controls your future',
    color: '#e74c3c',
  },

  // ── Intermediate milestones ────────────────────────────────────
  {
    id: 'belief_transform_3',
    check: s => (s.beliefs || []).filter(b => b.empowering).length >= 3,
    emoji: '🦋',
    titleAr: 'تحويل ٣ معتقدات!', titleEn: '3 Beliefs Transformed!',
    msgAr: 'حوّلت ٣ معتقدات — هويتك تتغير! توني يقول: "المعتقدات لديها القدرة على الخلق والقدرة على التدمير"',
    msgEn: '3 beliefs transformed — your identity is shifting! Tony says: "Beliefs have the power to create and the power to destroy"',
    color: '#9b59b6',
  },
  {
    id: 'sleep_consistency_7',
    check: s => {
      const log = s.sleepLog || {}
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i)
        return d.toISOString().slice(0, 10)
      })
      return days.every(d => log[d])
    },
    emoji: '😴',
    titleAr: 'أسبوع نوم منتظم!', titleEn: '7-Day Sleep Streak!',
    msgAr: '٧ أيام من تتبع نومك — النوم الجيد هو أساس الطاقة العالية والقرارات الصحيحة!',
    msgEn: '7 consecutive days of sleep tracking — quality sleep is the foundation of high energy and great decisions!',
    color: '#3498db',
  },
  {
    id: 'all_habits_3days',
    check: s => {
      const habits = s.habitTracker?.habits || []
      const log = s.habitTracker?.log || {}
      if (habits.length === 0) return false
      const days = Array.from({ length: 3 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i)
        return d.toISOString().slice(0, 10)
      })
      return days.every(d => (log[d] || []).length >= habits.length)
    },
    emoji: '🏅',
    titleAr: '٣ أيام كل العادات!', titleEn: 'All Habits — 3 Days!',
    msgAr: '٣ أيام أكملت فيها كل عاداتك — هذا مستوى الالتزام الذي يصنع الأبطال!',
    msgEn: '3 days with ALL habits done — this level of commitment is what creates champions!',
    color: '#2ecc71',
  },
  {
    id: 'deep_work_mode',
    check: s => (s.ritualReflections || []).some(r => r.mode === 'deep'),
    emoji: '🧘',
    titleAr: 'وضع التأمل العميق!', titleEn: 'Deep Meditation Mode!',
    msgAr: 'دخلت وضع الطقوس العميق — ٢٠ دقيقة من التركيز الكامل! هنا يحدث السحر الحقيقي',
    msgEn: 'You entered deep ritual mode — 20 minutes of total focus! This is where the real magic happens',
    color: '#9370db',
  },

  // ── Longer-term milestones ─────────────────────────────────────
  {
    id: 'business_4weeks',
    check: s => Object.keys(s.businessScorecard || {}).length >= 4,
    emoji: '📊',
    titleAr: '٤ أسابيع تتبع أعمال!', titleEn: '4 Weeks of Business Tracking!',
    msgAr: 'تابعت أعمالك لمدة شهر — ما يُقاس يُدار، وما يُدار ينمو!',
    msgEn: 'You tracked your business for a month — what gets measured gets managed, and what gets managed GROWS!',
    color: '#c9a84c',
  },
  {
    id: 'content_creator_10',
    check: s => (s.contentLog || []).length >= 10,
    emoji: '📱',
    titleAr: '١٠ محتويات!', titleEn: '10 Content Pieces!',
    msgAr: 'نشرت ١٠ محتويات — أنت تبني تأثيرك وتوسع دائرة خدمتك للآخرين!',
    msgEn: 'You logged 10 content pieces — you\'re building your influence and expanding your circle of service!',
    color: '#e91e63',
  },
  {
    id: 'beautiful_state_7',
    check: s => {
      const log = s.stateLog || s.stateCheckin || {}
      const days = Object.keys(log)
      let count = 0
      for (const d of days) {
        const entry = log[d]
        const energy = entry?.energy || 0
        const mood = entry?.mood || 0
        const clarity = entry?.clarity || 0
        if ((energy + mood + clarity) / 3 >= 7) count++
      }
      return count >= 7
    },
    emoji: '✨',
    titleAr: '٧ أيام في حالة جمال!', titleEn: '7 Days in Beautiful State!',
    msgAr: '٧ أيام في حالة جميلة — أنت تثبت أن السعادة قرار وليست ظرف! هذا هو الإتقان الحقيقي',
    msgEn: '7 days in a beautiful state — you\'re proving that happiness is a DECISION, not a circumstance! This is true mastery',
    color: '#c9a84c',
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
