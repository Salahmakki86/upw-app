/**
 * Fix #13 — Coach Visibility: Student Pattern Detection
 * Analyzes a student's data to surface patterns the coach needs to see.
 * Makes the coach "un-blind" — they can see what's really happening.
 */

/**
 * Analyze student state and return a comprehensive pattern report
 * Used in CoachPrep to give the coach deep insight before a session.
 */
export function analyzeStudentPatterns(studentState, isAr) {
  const s = studentState || {}
  const patterns = []

  // 1. Morning consistency pattern
  const morningLog = s.morningLog || []
  const last14 = getLast14Days()
  const morningLast14 = last14.filter(d => morningLog.includes(d)).length
  const morningRate = Math.round((morningLast14 / 14) * 100)

  if (morningRate < 30) {
    patterns.push({
      type: 'critical',
      emoji: '🚨',
      titleAr: 'التزام صباحي ضعيف جداً',
      titleEn: 'Very low morning commitment',
      detailAr: `${morningLast14}/14 يوم فقط في آخر أسبوعين (${morningRate}%)`,
      detailEn: `Only ${morningLast14}/14 days in the last 2 weeks (${morningRate}%)`,
      coachTipAr: 'اسأل: "ما الذي يمنعك من البدء صباحاً؟" — قد يكون مشكلة نوم أو معتقد',
      coachTipEn: 'Ask: "What stops you from starting in the morning?" — could be a sleep or belief issue',
    })
  } else if (morningRate >= 80) {
    patterns.push({
      type: 'strength',
      emoji: '🌟',
      titleAr: 'التزام صباحي قوي',
      titleEn: 'Strong morning commitment',
      detailAr: `${morningLast14}/14 يوم — عادة ثابتة`,
      detailEn: `${morningLast14}/14 days — solid habit`,
      coachTipAr: 'عزّز هذا بالثناء وتحدّه بتعميق الطقس (مثلاً: إضافة تخيّل أهداف)',
      coachTipEn: 'Reinforce with praise and challenge them to deepen (e.g., add visualization)',
    })
  }

  // 2. Emotional state pattern
  const stateLog = s.stateLog || []
  const recentStates = stateLog.filter(l => last14.includes(l.date))
  const beautifulCount = recentStates.filter(l => l.state === 'beautiful').length
  const sufferingCount = recentStates.filter(l => l.state === 'suffering').length

  if (sufferingCount >= 5) {
    patterns.push({
      type: 'critical',
      emoji: '😟',
      titleAr: `${sufferingCount} أيام معاناة من ${recentStates.length}`,
      titleEn: `${sufferingCount} suffering days out of ${recentStates.length}`,
      detailAr: 'نمط معاناة متكرر — يحتاج تدخلاً عاجلاً',
      detailEn: 'Recurring suffering pattern — needs urgent intervention',
      coachTipAr: 'ابدأ الجلسة بـ: "أخبرني عن شعورك هذا الأسبوع" — ثم اذهب لأدوات NAC أو إدارة الحالة',
      coachTipEn: 'Start session: "Tell me how you\'ve been feeling" — then use NAC or state management tools',
    })
  } else if (beautifulCount >= 10 && recentStates.length >= 10) {
    patterns.push({
      type: 'strength',
      emoji: '✨',
      titleAr: 'حالة نفسية ممتازة',
      titleEn: 'Excellent emotional state',
      detailAr: `${beautifulCount} أيام جميلة — مستقر نفسياً`,
      detailEn: `${beautifulCount} beautiful days — emotionally stable`,
      coachTipAr: 'هذا وقت ممتاز لتحدي أكبر — أهداف جريئة أو عمل على المعتقدات العميقة',
      coachTipEn: 'Great time for a bigger challenge — bold goals or deep beliefs work',
    })
  }

  // 3. Sleep pattern
  const sleepLog = s.sleepLog || {}
  const recentSleep = last14.map(d => sleepLog[d]).filter(Boolean)
  if (recentSleep.length >= 5) {
    const avgHours = recentSleep.reduce((s, e) => s + (Number(e.hours) || 0), 0) / recentSleep.length
    if (avgHours < 6) {
      patterns.push({
        type: 'warning',
        emoji: '😴',
        titleAr: `معدل نوم منخفض: ${Math.round(avgHours * 10) / 10} ساعة`,
        titleEn: `Low sleep average: ${Math.round(avgHours * 10) / 10} hours`,
        detailAr: 'النوم القليل يدمر كل شيء — الطاقة، المزاج، والإنتاجية',
        detailEn: 'Poor sleep destroys everything — energy, mood, and productivity',
        coachTipAr: 'ناقش: "ما الذي يسرق نومك؟" — غالباً هواتف أو قلق أو عادات مسائية',
        coachTipEn: 'Discuss: "What\'s stealing your sleep?" — usually screens, anxiety, or evening habits',
      })
    }
  }

  // 4. Goal progress pattern
  const goals = s.goals || []
  const stagnantGoals = goals.filter(g => (g.progress || 0) < 20 && g.result)
  const completedGoals = goals.filter(g => (g.progress || 0) >= 100)

  if (goals.length > 0 && stagnantGoals.length === goals.length) {
    patterns.push({
      type: 'critical',
      emoji: '🎯',
      titleAr: 'كل الأهداف راكدة',
      titleEn: 'All goals stagnant',
      detailAr: `${goals.length} أهداف بدون تقدم — قد يكون المشكلة في تحديد الأهداف نفسه`,
      detailEn: `${goals.length} goals with no progress — the goal-setting itself may be the issue`,
      coachTipAr: 'أعد صياغة الأهداف معه — اجعلها أصغر وأوضح وقابلة للقياس',
      coachTipEn: 'Reframe goals together — make them smaller, clearer, and measurable',
    })
  } else if (completedGoals.length > 0) {
    patterns.push({
      type: 'strength',
      emoji: '🏆',
      titleAr: `${completedGoals.length} أهداف مكتملة!`,
      titleEn: `${completedGoals.length} goals completed!`,
      detailAr: 'إنجاز رائع — الطالب يترجم كلامه لأفعال',
      detailEn: 'Great achievement — student is turning words into action',
      coachTipAr: 'احتفل ثم تحدّه: "ما الهدف الأكبر الذي لم تجرؤ على كتابته بعد؟"',
      coachTipEn: 'Celebrate then challenge: "What\'s the bigger goal you haven\'t dared to write yet?"',
    })
  }

  // 5. Beliefs transformation pattern
  const limiting = (s.limitingBeliefs || []).length
  const empowering = (s.empoweringBeliefs || []).length
  if (limiting > empowering && limiting >= 3) {
    patterns.push({
      type: 'warning',
      emoji: '🔗',
      titleAr: `معتقدات مقيدة (${limiting}) أكثر من المحفزة (${empowering})`,
      titleEn: `Limiting beliefs (${limiting}) outnumber empowering (${empowering})`,
      detailAr: 'الطالب يعرف ما يقيده لكن لم يستبدلها بعد',
      detailEn: 'Student identified limits but hasn\'t replaced them yet',
      coachTipAr: 'استخدم Dickens Process على أقوى معتقد مقيد — ثم ساعده بكتابة البديل',
      coachTipEn: 'Use Dickens Process on strongest limiting belief — then help write the replacement',
    })
  }

  // 6. Engagement breadth
  const toolsUsed = countToolsUsed(s)
  if (toolsUsed <= 3 && morningLog.length >= 7) {
    patterns.push({
      type: 'info',
      emoji: '🗺️',
      titleAr: `يستخدم ${toolsUsed} أدوات فقط`,
      titleEn: `Only using ${toolsUsed} tools`,
      detailAr: 'التطبيق فيه أكثر من ٣٠ أداة — الطالب يحتاج توجيه لاكتشاف أدوات جديدة',
      detailEn: 'App has 30+ tools — student needs guidance to discover new ones',
      coachTipAr: 'اقترح أداة واحدة جديدة هذا الأسبوع بناءً على احتياجه الحالي',
      coachTipEn: 'Suggest one new tool this week based on their current need',
    })
  }

  // 7. Ritual reflection quality
  const reflections = s.ritualReflections || {}
  const reflectionDates = Object.keys(reflections)
  if (reflectionDates.length >= 5) {
    const avgRating = reflectionDates.reduce((sum, d) => {
      const mr = reflections[d]?.morning?.rating || 0
      const er = reflections[d]?.evening?.rating || 0
      return sum + (mr + er) / (mr && er ? 2 : 1)
    }, 0) / reflectionDates.length

    if (avgRating < 3) {
      patterns.push({
        type: 'warning',
        emoji: '📉',
        titleAr: `تقييم الطقوس منخفض (${Math.round(avgRating * 10) / 10}/5)`,
        titleEn: `Low ritual rating (${Math.round(avgRating * 10) / 10}/5)`,
        detailAr: 'الطالب لا يشعر بقيمة الطقوس — يحتاج تغيير في النهج',
        detailEn: 'Student doesn\'t feel rituals are valuable — needs approach change',
        coachTipAr: 'اسأل: "ما الجزء المفضل والأقل إفادة؟" — قد يحتاج تخصيص الطقس',
        coachTipEn: 'Ask: "What\'s your favorite and least useful part?" — may need ritual customization',
      })
    }
  }

  return patterns.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2, strength: 3 }
    return (order[a.type] ?? 4) - (order[b.type] ?? 4)
  })
}

/**
 * Generate a quick summary sentence for coach
 */
export function getStudentSummary(studentState, isAr) {
  const s = studentState || {}
  const streak = s.streak || 0
  const goals = (s.goals || []).length
  const mornings = (s.morningLog || []).length
  const stateLog = s.stateLog || []
  const beautifulPct = stateLog.length > 0
    ? Math.round((stateLog.filter(l => l.state === 'beautiful').length / stateLog.length) * 100)
    : 0

  if (isAr) {
    return `سلسلة: ${streak} يوم | ${mornings} صباح مكتمل | ${goals} أهداف | ${beautifulPct}% حالة جميلة`
  }
  return `Streak: ${streak}d | ${mornings} mornings | ${goals} goals | ${beautifulPct}% beautiful state`
}

// Helpers
function getLast14Days() {
  const dates = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function countToolsUsed(s) {
  let count = 0
  if ((s.morningLog || []).length > 0) count++
  if (Object.keys(s.gratitude || {}).length > 0) count++
  if ((s.habitTracker?.log && Object.keys(s.habitTracker.log).length > 0)) count++
  if ((s.stateLog || []).length > 0) count++
  if (Object.keys(s.dailyWins || {}).length > 0) count++
  if (Object.keys(s.eveningLog || {}).length > 0) count++
  if (Object.keys(s.sleepLog || {}).length > 0) count++
  if ((s.goals || []).length > 0) count++
  if ((s.limitingBeliefs || []).length > 0 || (s.empoweringBeliefs || []).length > 0) count++
  if (Object.keys(s.businessScorecard || {}).length > 0) count++
  if (Object.keys(s.weeklyPulse || {}).length > 0) count++
  if ((s.nacSessions || []).length > 0) count++
  return count
}
