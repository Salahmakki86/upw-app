/**
 * PersonalizedCoachCard — "It understands me" (7/10 Distinction)
 *
 * Dynamic coaching card at the top of TodayPage.
 * Shows ONE personalized message based on priority analysis of user data.
 */
import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { calcMomentum, calcStateRecipe, detectRootCause, calcTransformationScore } from '../utils/transformationEngine'

const MILESTONE_STREAKS = new Set([7, 14, 21, 30, 60, 90, 100, 365])

const TYPE_COLORS = {
  milestone: '#c9a84c',
  alert:     '#e74c3c',
  recipe:    '#2ecc71',
  momentum:  '#2ecc71',
  warning:   '#e74c3c',
  belief:    '#9370db',
  goal:      '#c9a84c',
  generic:   '#9370db',
}

const TYPE_GRADIENTS = {
  milestone: 'linear-gradient(135deg, #c9a84c08, #c9a84c18)',
  alert:     'linear-gradient(135deg, #e74c3c08, #e74c3c18)',
  recipe:    'linear-gradient(135deg, #2ecc7108, #2ecc7118)',
  momentum:  'linear-gradient(135deg, #2ecc7108, #2ecc7118)',
  warning:   'linear-gradient(135deg, #e74c3c08, #e74c3c18)',
  belief:    'linear-gradient(135deg, #9370db08, #9370db18)',
  goal:      'linear-gradient(135deg, #c9a84c08, #c9a84c18)',
  generic:   'linear-gradient(135deg, #9370db08, #9370db18)',
}

const TONY_QUOTES = [
  {
    ar: 'ليس ما نفعله من حين لآخر يشكّل حياتنا، بل ما نفعله باستمرار',
    en: "It's not what we do once in a while that shapes our lives, but what we do consistently",
  },
  {
    ar: 'القرارات هي التي تشكّل مصيرك، وليس ظروفك',
    en: 'Your decisions, not your conditions, determine your destiny',
  },
  {
    ar: 'أينما يذهب التركيز، تتدفق الطاقة',
    en: 'Where focus goes, energy flows',
  },
  {
    ar: 'التكرار هو أم المهارة',
    en: 'Repetition is the mother of skill',
  },
  {
    ar: 'إذا فعلت ما فعلته دائماً، ستحصل على ما حصلت عليه دائماً',
    en: 'If you do what you\'ve always done, you\'ll get what you\'ve always gotten',
  },
]

export default function PersonalizedCoachCard() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const coaching = useMemo(() => {
    const morningLog = state.morningLog || []
    if (morningLog.length === 0) return null

    const streak = state.streak || 0
    const momentum = calcMomentum(state)
    const recipe = calcStateRecipe(state)
    const rootCause = detectRootCause(state)
    const goals = state.goals || []
    const limitingBeliefs = state.limitingBeliefs || []
    const empoweringBeliefs = state.empoweringBeliefs || []

    // ── a) Streak Milestone ──
    if (MILESTONE_STREAKS.has(streak)) {
      const milestoneMessages = {
        7:   { ar: '7 ايام متتالية! عقلك بدا يبني هذا كعادة', en: '7 days in a row! Your brain is building this as a habit' },
        14:  { ar: '14 يوما! اصبحت اقوى من اي وقت مضى', en: '14 days! You are stronger than ever' },
        21:  { ar: '21 يوما — البحث يقول هذا وقت تكوين العادة', en: '21 days — research says this is habit formation time' },
        30:  { ar: '30 يوم! انت رسميا شخص مختلف عما كنت', en: '30 days! You are officially a different person' },
        60:  { ar: '60 يوم! هذا لم يعد تحديا — هذه هويتك الجديدة', en: '60 days! This is no longer a challenge — this is your new identity' },
        90:  { ar: '90 يوم! ربع سنة من التحول — هذا استثنائي', en: '90 days! A quarter of transformation — this is exceptional' },
        100: { ar: '100 يوم! نادرا ما يصل احد لهنا — انت مختلف', en: '100 days! Few reach this point — you are different' },
        365: { ar: 'سنة كاملة! انت اثبتت ان التحول ممكن', en: 'A full year! You proved transformation is possible' },
      }
      const msg = milestoneMessages[streak] || milestoneMessages[7]
      return {
        emoji: '\uD83C\uDF1F',
        message: isAr ? msg.ar : msg.en,
        subtext: isAr ? `${streak} يوم متتالي — استمر!` : `${streak}-day streak — keep going!`,
        color: TYPE_COLORS.milestone,
        type: 'milestone',
      }
    }

    // ── b) Root Cause Alert ──
    if (rootCause.priority >= 8 && rootCause.type !== 'thriving' && rootCause.type !== 'exploring') {
      return {
        emoji: rootCause.emoji,
        message: isAr ? rootCause.labelAr : rootCause.labelEn,
        subtext: isAr ? rootCause.descAr : rootCause.descEn,
        color: rootCause.color || TYPE_COLORS.alert,
        type: 'alert',
      }
    }

    // ── c) State Recipe Available ──
    if (recipe.hasRecipe && recipe.recipe && recipe.recipe.length >= 2) {
      const top2 = recipe.recipe.slice(0, 2)
      const recipeStr = top2.map(r => `${r.emoji} ${isAr ? r.emojiAr : r.emojiEn}`).join(' + ')
      return {
        emoji: '\uD83E\uDDEA',
        message: isAr
          ? `وصفة يومك المثالي: ${recipeStr}`
          : `Your perfect day recipe: ${recipeStr}`,
        subtext: isAr
          ? `بناء على ${recipe.greatDays} يوم ممتاز من ${recipe.totalDays}`
          : `Based on ${recipe.greatDays} great days out of ${recipe.totalDays}`,
        color: TYPE_COLORS.recipe,
        type: 'recipe',
      }
    }

    // ── d) Momentum Rising ──
    if (momentum.trend === 'up' && momentum.score >= 50) {
      return {
        emoji: '\uD83D\uDE80',
        message: isAr
          ? 'زخمك يرتفع! انت في طريق التحول'
          : 'Your momentum is rising! You are on the transformation path',
        subtext: isAr
          ? `نقاط الزخم: ${momentum.score}/100`
          : `Momentum score: ${momentum.score}/100`,
        color: TYPE_COLORS.momentum,
        type: 'momentum',
      }
    }

    // ── e) Momentum Warning ──
    if (momentum.trend === 'down') {
      return {
        emoji: '\u26A0\uFE0F',
        message: isAr
          ? 'زخمك يتراجع — اليوم اهم من الامس'
          : 'Momentum is dipping — today matters more than yesterday',
        subtext: isAr
          ? `نقاط الزخم: ${momentum.score}/100 — يمكنك تغيير هذا اليوم`
          : `Momentum score: ${momentum.score}/100 — you can change this today`,
        color: TYPE_COLORS.warning,
        type: 'warning',
      }
    }

    // ── f) Belief Progress ──
    if (empoweringBeliefs.length > limitingBeliefs.length && empoweringBeliefs.length > 0) {
      return {
        emoji: '\uD83E\uDDE0',
        message: isAr
          ? 'معتقداتك المحفزة اكثر من المقيدة — قصتك تتغير'
          : 'Your empowering beliefs outnumber limiting ones — your story is changing',
        subtext: isAr
          ? `${empoweringBeliefs.length} محفزة مقابل ${limitingBeliefs.length} مقيدة`
          : `${empoweringBeliefs.length} empowering vs ${limitingBeliefs.length} limiting`,
        color: TYPE_COLORS.belief,
        type: 'belief',
      }
    }

    // ── g) Goal Progress ──
    const advancedGoal = goals.find(g => (g.progress || 0) > 50)
    if (advancedGoal) {
      const pct = advancedGoal.progress || 0
      const name = advancedGoal.title || advancedGoal.name || (isAr ? 'هدفك' : 'Your goal')
      return {
        emoji: '\uD83C\uDFAF',
        message: isAr
          ? `${name} عند ${pct}%! انت اقرب مما تظن`
          : `${name} at ${pct}%! You are closer than you think`,
        subtext: isAr
          ? 'كل خطوة تقربك — لا تتوقف الان'
          : 'Every step gets you closer — do not stop now',
        color: TYPE_COLORS.goal,
        type: 'goal',
      }
    }

    // ── h) Generic Coaching (fallback) ──
    const dayCount = morningLog.length
    if (dayCount <= 3) {
      return {
        emoji: '\uD83C\uDF31',
        message: isAr
          ? 'كل رحلة تبدا بخطوة — انت اخذتها'
          : 'Every journey starts with a step — you have taken it',
        subtext: isAr
          ? `اليوم ${dayCount} من رحلتك`
          : `Day ${dayCount} of your journey`,
        color: TYPE_COLORS.generic,
        type: 'generic',
      }
    }

    if (dayCount <= 7) {
      return {
        emoji: '\uD83D\uDD25',
        message: isAr
          ? 'اسبوعك الاول قارب الانتهاء — لا تتوقف'
          : 'Your first week is almost done — do not stop',
        subtext: isAr
          ? `${dayCount} ايام مسجلة — الاستمرارية هي السر`
          : `${dayCount} days logged — consistency is the secret`,
        color: TYPE_COLORS.generic,
        type: 'generic',
      }
    }

    // Day 8+: Tony Robbins quote with data reference
    const quoteIndex = dayCount % TONY_QUOTES.length
    const quote = TONY_QUOTES[quoteIndex]
    return {
      emoji: '\uD83D\uDCAA',
      message: isAr ? quote.ar : quote.en,
      subtext: isAr
        ? `${dayCount} يوم مسجل — نقاط التحول: ${calcTransformationScore(state).total}/100`
        : `${dayCount} days logged — transformation score: ${calcTransformationScore(state).total}/100`,
      color: TYPE_COLORS.generic,
      type: 'generic',
    }
  }, [state, isAr])

  if (!coaching) return null

  const typeColor = coaching.color || TYPE_COLORS.generic

  return (
    <div
      style={{
        background: TYPE_GRADIENTS[coaching.type] || TYPE_GRADIENTS.generic,
        border: `1px solid ${typeColor}25`,
        borderLeft: `3px solid ${typeColor}`,
        borderRadius: 14,
        padding: '12px 14px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'coachPulse 0.6s ease-out',
      }}
    >
      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes coachPulse {
          0%   { opacity: 0; transform: scale(0.97); }
          60%  { opacity: 1; transform: scale(1.01); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* AI Coach label */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          [isAr ? 'left' : 'right']: 10,
          fontSize: 9,
          color: '#888',
          letterSpacing: 0.5,
          fontWeight: 600,
        }}
      >
        {isAr ? '\uD83E\uDD16 مدربك الذكي' : '\uD83E\uDD16 AI Coach'}
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 10 }}>
        <div
          style={{
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            background: `${typeColor}18`,
          }}
        >
          {coaching.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.5,
              direction: isAr ? 'rtl' : 'ltr',
              textAlign: isAr ? 'right' : 'left',
            }}
          >
            {coaching.message}
          </p>

          {coaching.subtext && (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 10,
                color: '#888',
                lineHeight: 1.4,
                direction: isAr ? 'rtl' : 'ltr',
                textAlign: isAr ? 'right' : 'left',
              }}
            >
              {coaching.subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
