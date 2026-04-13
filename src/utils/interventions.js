/**
 * Smart Intervention Engine — Batch 4
 * Analyzes student data and suggests targeted coach interventions
 */

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
}

/**
 * Analyze a single student's state and return intervention suggestions
 * @param {Object} s — student state object (from getStudentState)
 * @returns {Array} — sorted interventions
 */
export function detectInterventions(s, isAr = true) {
  if (!s) return []
  const interventions = []
  const days7 = lastNDays(7)
  const today = new Date().toISOString().split('T')[0]

  // 1. Streak broken after strong run
  const streak = s.streak || 0
  const maxStreak = s.maxStreak || streak
  if (streak === 0 && maxStreak >= 7) {
    interventions.push({
      type: 'streak_broken',
      priority: 10,
      emoji: '🔥',
      severity: 'critical',
      titleAr: 'سلسلة منقطعة بعد زخم قوي',
      titleEn: 'Streak broken after strong momentum',
      descAr: `كان لديه سلسلة ${maxStreak} يوم وانقطع — يحتاج تدخل فوري لإعادة التحفيز`,
      descEn: `Had a ${maxStreak}-day streak and broke it — needs immediate re-motivation`,
      actionAr: 'أرسل رسالة تحفيز شخصية + ذكّره بالتزامه',
      actionEn: 'Send a personal motivation message + remind them of their commitment',
    })
  }

  // 2. Suffering state dominant
  const stateLog = s.stateLog || []
  const recentStates = stateLog.filter(l => days7.includes(l.date))
  const sufferingDays = recentStates.filter(l => l.state === 'suffering').length
  if (sufferingDays >= 3) {
    interventions.push({
      type: 'suffering',
      priority: 9,
      emoji: '😟',
      severity: 'critical',
      titleAr: 'حالة معاناة مستمرة',
      titleEn: 'Persistent suffering state',
      descAr: `${sufferingDays} أيام من المعاناة في آخر أسبوع — يحتاج دعم عاطفي`,
      descEn: `${sufferingDays} suffering days in the last week — needs emotional support`,
      actionAr: 'تواصل شخصي + اقترح أدوات إدارة الحالة (SOS, Triad)',
      actionEn: 'Personal outreach + suggest state management tools (SOS, Triad)',
    })
  }

  // 3. No activity for 3+ days
  const morningLog = s.morningLog || []
  const lastActive = [...morningLog].sort().pop()
  if (lastActive) {
    const daysSince = Math.floor((new Date() - new Date(lastActive)) / 86400000)
    if (daysSince >= 3 && daysSince < 14) {
      interventions.push({
        type: 'inactive',
        priority: 8,
        emoji: '💤',
        severity: 'warning',
        titleAr: `غياب ${daysSince} أيام`,
        titleEn: `Inactive for ${daysSince} days`,
        descAr: 'قد يكون في مرحلة تراجع — تدخل سريع يمكن أن يعيده',
        descEn: 'May be in a regression phase — quick intervention can bring them back',
        actionAr: 'رسالة قصيرة: "نفتقدك — خطوة واحدة صغيرة اليوم تكفي"',
        actionEn: 'Short message: "We miss you — one small step today is enough"',
      })
    }
    if (daysSince >= 14) {
      interventions.push({
        type: 'dropout_risk',
        priority: 10,
        emoji: '🚨',
        severity: 'critical',
        titleAr: `خطر انسحاب — ${daysSince} يوم غياب`,
        titleEn: `Dropout risk — ${daysSince} days absent`,
        descAr: 'أسبوعان بدون نشاط — يحتاج مكالمة شخصية',
        descEn: 'Two weeks without activity — needs a personal call',
        actionAr: 'اتصال هاتفي مباشر + سؤال عن التحديات',
        actionEn: 'Direct phone call + ask about challenges',
      })
    }
  }

  // 4. Sleep crisis
  const sleepLog = s.sleepLog || {}
  const recentSleep = days7.map(d => sleepLog[d]?.hours).filter(Boolean)
  if (recentSleep.length >= 3) {
    const avgSleep = recentSleep.reduce((a, b) => a + b, 0) / recentSleep.length
    if (avgSleep < 5.5) {
      interventions.push({
        type: 'sleep_crisis',
        priority: 8,
        emoji: '😴',
        severity: 'warning',
        titleAr: `أزمة نوم — معدل ${avgSleep.toFixed(1)} ساعة`,
        titleEn: `Sleep crisis — avg ${avgSleep.toFixed(1)}h`,
        descAr: 'النوم أقل من 5.5 ساعة يدمر كل شيء — أولوية قصوى',
        descEn: 'Sleep under 5.5h destroys everything — top priority',
        actionAr: 'ناقش بروتوكول النوم + ساعة النوم الثابتة',
        actionEn: 'Discuss sleep protocol + fixed bedtime',
      })
    }
  }

  // 5. Goals without progress
  const goals = s.goals || []
  const staleGoals = goals.filter(g => {
    if ((g.progress || 0) >= 100) return false
    const sevenDaysAgo = Date.now() - 14 * 86400000
    return !g.updatedAt || g.updatedAt < sevenDaysAgo
  })
  if (staleGoals.length >= 2) {
    interventions.push({
      type: 'stale_goals',
      priority: 6,
      emoji: '🎯',
      severity: 'info',
      titleAr: `${staleGoals.length} أهداف بدون تقدم لأسبوعين`,
      titleEn: `${staleGoals.length} goals with no progress for 2 weeks`,
      descAr: 'قد يحتاج مراجعة أهدافه — هل هي واقعية؟ هل يملك خطة عمل؟',
      descEn: 'May need to review goals — are they realistic? Do they have an action plan?',
      actionAr: 'اسأله: "ما أكبر عائق أمام هدفك الأهم؟"',
      actionEn: 'Ask: "What is the biggest obstacle to your #1 goal?"',
    })
  }

  // 6. Limiting beliefs outweigh empowering
  const limiting = (s.limitingBeliefs || []).length
  const empowering = (s.empoweringBeliefs || []).length
  if (limiting > 3 && limiting > empowering * 2) {
    interventions.push({
      type: 'beliefs_imbalance',
      priority: 7,
      emoji: '🪞',
      severity: 'warning',
      titleAr: `${limiting} معتقد مقيد vs ${empowering} محفز — خلل كبير`,
      titleEn: `${limiting} limiting vs ${empowering} empowering beliefs — major imbalance`,
      descAr: 'يحتاج جلسة ديكنز على أقوى معتقد مقيد',
      descEn: 'Needs a Dickens Process on their strongest limiting belief',
      actionAr: 'اقترح عملية ديكنز على أقوى معتقد + تابع النتيجة',
      actionEn: 'Suggest Dickens Process on strongest belief + follow up',
    })
  }

  // 7. Doing great — celebrate
  if (streak >= 14 && sufferingDays === 0) {
    interventions.push({
      type: 'celebrate',
      priority: 5,
      emoji: '🏆',
      severity: 'positive',
      titleAr: 'أداء ممتاز — يستحق الاحتفاء!',
      titleEn: 'Excellent performance — deserves celebration!',
      descAr: `سلسلة ${streak} يوم بدون معاناة — عزز هذا السلوك`,
      descEn: `${streak}-day streak with no suffering — reinforce this behavior`,
      actionAr: 'رسالة تقدير + شارك إنجازه مع المجموعة (بإذنه)',
      actionEn: 'Appreciation message + share achievement with group (with permission)',
    })
  }

  return interventions.sort((a, b) => b.priority - a.priority)
}

/**
 * Get severity color
 */
export function severityColor(severity) {
  switch (severity) {
    case 'critical': return '#e63946'
    case 'warning':  return '#f39c12'
    case 'info':     return '#3498db'
    case 'positive': return '#2ecc71'
    default:         return '#888'
  }
}
