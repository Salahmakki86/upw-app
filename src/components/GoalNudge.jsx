/**
 * #4 — Goal Nudges Component
 * Shows daily nudge toward goals + stale goal alerts on Dashboard
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

export default function GoalNudge() {
  const { state } = useApp()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'
  const today = new Date().toISOString().slice(0, 10)

  const nudge = useMemo(() => {
    const goals = state.goals || []
    const activeGoals = goals.filter(g => (g.progress || 0) < 100)
    if (activeGoals.length === 0) return null

    // Check for stale goals (no daily log in 14+ days)
    const staleGoals = activeGoals.filter(g => {
      const log = g.dailyLog || {}
      const dates = Object.keys(log).sort().reverse()
      if (dates.length === 0) return true
      const lastDate = new Date(dates[0])
      const diff = (new Date() - lastDate) / (1000 * 60 * 60 * 24)
      return diff >= 14
    })

    if (staleGoals.length > 0) {
      const stale = staleGoals[0]
      return {
        type: 'stale',
        emoji: '⏰',
        text: isAr
          ? `هدف "${stale.result}" لم تعمل عليه منذ أسبوعين — خطوة واحدة صغيرة اليوم؟`
          : `Goal "${stale.result}" hasn't been worked on in 2 weeks — one small step today?`,
        color: '#e67e22',
        goalId: stale.id,
      }
    }

    // Daily nudge — pick a goal that wasn't worked on today
    const unworkedToday = activeGoals.filter(g => !g.dailyLog?.[today]?.done)
    if (unworkedToday.length > 0) {
      const goal = unworkedToday[new Date().getHours() % unworkedToday.length]
      return {
        type: 'nudge',
        emoji: '🎯',
        text: isAr
          ? `خطوة واحدة نحو "${goal.result}" اليوم؟`
          : `One step toward "${goal.result}" today?`,
        color: '#3498db',
        goalId: goal.id,
      }
    }

    return null
  }, [state.goals, today, isAr])

  // Win → Goal Bridge: check if today's wins relate to any goal
  const winBridge = useMemo(() => {
    const wins = state.dailyWins?.[today] || []
    const goals = (state.goals || []).filter(g => (g.progress || 0) < 100)
    if (wins.length === 0 || goals.length === 0) return null

    // Simple text match between win text and goal result
    for (const win of wins) {
      for (const goal of goals) {
        const winWords = (win.text || '').toLowerCase().split(/\s+/)
        const goalWords = (goal.result || '').toLowerCase().split(/\s+/)
        const overlap = winWords.filter(w => w.length > 3 && goalWords.includes(w))
        if (overlap.length > 0) {
          return {
            emoji: '🔗',
            text: isAr
              ? `انتصارك اليوم مرتبط بهدفك "${goal.result}" — سجّل تقدماً!`
              : `Today's win connects to your goal "${goal.result}" — log progress!`,
            color: '#2ecc71',
            goalId: goal.id,
          }
        }
      }
    }
    return null
  }, [state.dailyWins, state.goals, today, isAr])

  const display = winBridge || nudge
  if (!display) return null

  return (
    <button
      onClick={() => navigate('/goals')}
      className="w-full rounded-2xl p-3.5 transition-all active:scale-[0.98]"
      style={{
        background: `${display.color}0a`,
        border: `1px solid ${display.color}25`,
        textAlign: isAr ? 'right' : 'left',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl flex-shrink-0">{display.emoji}</span>
        <p className="text-xs font-bold text-white leading-relaxed flex-1">{display.text}</p>
        <span style={{ color: '#333', fontSize: 12 }}>{isAr ? '←' : '→'}</span>
      </div>
    </button>
  )
}
