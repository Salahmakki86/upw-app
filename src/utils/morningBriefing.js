/**
 * Morning Briefing Engine — Batch 1 (20 Mistakes Fix)
 * Generates a single smart sentence for TodayPage based on real user data.
 * Principle: "Every piece of data the user enters must return as value."
 */

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function yesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  })
}

/**
 * Generate a single smart briefing sentence based on user's data
 * Returns { text, emoji, type } where type = 'sleep' | 'streak' | 'state' | 'goals' | 'momentum' | 'generic'
 */
export function generateBriefing(state, isAr) {
  const today = todayKey()
  const yesterday = yesterdayKey()
  const briefings = []

  // ─── 1. Sleep-based briefing (highest priority when relevant) ───────────
  const lastSleep = state.sleepLog?.[yesterday]
  if (lastSleep?.hours) {
    const h = lastSleep.hours
    if (h < 5.5) {
      briefings.push({
        priority: 10,
        emoji: '😴',
        type: 'sleep',
        text: isAr
          ? `نمت ${h} ساعة فقط البارحة — اليوم ركّز على التنفس والماء والحركة`
          : `Only ${h}h sleep last night — focus on breathing, water & movement today`,
      })
    } else if (h >= 8) {
      briefings.push({
        priority: 6,
        emoji: '💪',
        type: 'sleep',
        text: isAr
          ? `${h} ساعات نوم ممتازة! طاقتك اليوم ستكون في القمة`
          : `${h}h of great sleep! Your energy today will be peak`,
      })
    }
  }

  // ─── 2. Sleep → Performance correlation ─────────────────────────────────
  const days7 = lastNDays(7)
  const sleepLog = state.sleepLog || {}
  const morningLog = state.morningLog || []
  const goodSleepDays = days7.filter(d => sleepLog[d]?.hours >= 7)
  const badSleepDays = days7.filter(d => sleepLog[d]?.hours && sleepLog[d].hours < 6)

  if (goodSleepDays.length >= 3 && badSleepDays.length >= 2) {
    const goodExec = goodSleepDays.filter(d => morningLog.includes(d)).length / goodSleepDays.length
    const badExec = badSleepDays.filter(d => morningLog.includes(d)).length / badSleepDays.length
    const diff = Math.round((goodExec - badExec) * 100)
    if (diff > 20) {
      briefings.push({
        priority: 8,
        emoji: '📊',
        type: 'sleep',
        text: isAr
          ? `بياناتك تقول: أداؤك يرتفع ${diff}% عندما تنام +7 ساعات`
          : `Your data shows: performance is ${diff}% higher with 7+ hours of sleep`,
      })
    }
  }

  // ─── 3. State trend ─────────────────────────────────────────────────────
  const stateCheckin = state.stateCheckin || {}
  const recentCheckins = days7.map(d => stateCheckin[d]).filter(Boolean)
  if (recentCheckins.length >= 3) {
    const avgEnergy = recentCheckins.reduce((s, c) => s + (c.energy || 5), 0) / recentCheckins.length
    const avgMood = recentCheckins.reduce((s, c) => s + (c.mood || 5), 0) / recentCheckins.length

    if (avgEnergy < 4 && avgMood < 4) {
      briefings.push({
        priority: 9,
        emoji: '⚡',
        type: 'state',
        text: isAr
          ? 'طاقتك ومزاجك منخفضان هذا الأسبوع — جرب SOS أو تمرين الحالة الآن'
          : 'Energy & mood are low this week — try SOS or a State exercise now',
      })
    } else if (avgEnergy >= 7 && avgMood >= 7) {
      briefings.push({
        priority: 5,
        emoji: '🔥',
        type: 'state',
        text: isAr
          ? 'طاقتك ومزاجك ممتازان هذا الأسبوع! استثمر هذا الزخم'
          : 'Energy & mood are excellent this week! Leverage this momentum',
      })
    }
  }

  // ─── 4. Stale goals warning ─────────────────────────────────────────────
  const goals = state.goals || []
  const sevenDaysAgo = Date.now() - 7 * 86400000
  const staleGoals = goals.filter(g =>
    (g.progress || 0) < 100 && g.updatedAt && g.updatedAt < sevenDaysAgo
  )
  if (staleGoals.length > 0) {
    const goalName = staleGoals[0].result?.slice(0, 30)
    briefings.push({
      priority: 7,
      emoji: '🎯',
      type: 'goals',
      text: isAr
        ? `هدفك "${goalName}" لم يتحرك منذ أسبوع — خطوة صغيرة اليوم تكفي`
        : `Your goal "${goalName}" hasn't moved in a week — one small step today is enough`,
    })
  }

  // ─── 5. Streak context ─────────────────────────────────────────────────
  const streak = state.streak || 0
  if (streak === 0 && (state.maxStreak || 0) >= 7) {
    briefings.push({
      priority: 8,
      emoji: '🔥',
      type: 'streak',
      text: isAr
        ? `سلسلتك انقطعت — لكن التعافي يبدأ بيوم واحد. ابدأ الآن`
        : `Your streak broke — but recovery starts with one day. Start now`,
    })
  } else if (streak === 7) {
    briefings.push({
      priority: 4,
      emoji: '🎉',
      type: 'streak',
      text: isAr
        ? 'أسبوع كامل! أنت تثبت لنفسك أنك قادر على الالتزام'
        : 'One full week! You\'re proving to yourself you can commit',
    })
  } else if (streak === 21) {
    briefings.push({
      priority: 4,
      emoji: '👑',
      type: 'streak',
      text: isAr
        ? '21 يوم! تشكّلت العادة الجديدة — أنت شخص مختلف الآن'
        : '21 days! A new habit is formed — you\'re a different person now',
    })
  }

  // ─── 6. Yesterday's day rating feedback ─────────────────────────────────
  const yesterdayEvening = state.eveningLog?.[yesterday]
  if (yesterdayEvening?.dayRating) {
    const rating = yesterdayEvening.dayRating
    if (rating <= 4) {
      briefings.push({
        priority: 7,
        emoji: '💡',
        type: 'momentum',
        text: isAr
          ? `البارحة قيّمت يومك ${rating}/10 — اليوم فرصة جديدة لتكون أفضل`
          : `Yesterday you rated your day ${rating}/10 — today is a fresh chance to do better`,
      })
    } else if (rating >= 9) {
      briefings.push({
        priority: 5,
        emoji: '⭐',
        type: 'momentum',
        text: isAr
          ? `البارحة كان يومك ${rating}/10! ما الذي فعلته؟ كرّره اليوم`
          : `Yesterday was a ${rating}/10 day! What did you do? Repeat it today`,
      })
    }
  }

  // ─── 7. Generic fallback ────────────────────────────────────────────────
  if (briefings.length === 0) {
    const hour = new Date().getHours()
    if (hour < 12) {
      briefings.push({
        priority: 1,
        emoji: '☀️',
        type: 'generic',
        text: isAr
          ? 'صباح القوة! ابدأ بالطقس الصباحي وحدد نيتك لليوم'
          : 'Power morning! Start with your morning ritual and set your intention',
      })
    } else {
      briefings.push({
        priority: 1,
        emoji: '⚡',
        type: 'generic',
        text: isAr
          ? 'كل لحظة هي فرصة للتغيير — ماذا ستفعل الآن؟'
          : 'Every moment is a chance to change — what will you do now?',
      })
    }
  }

  // Return highest-priority briefing
  return briefings.sort((a, b) => b.priority - a.priority)[0]
}
