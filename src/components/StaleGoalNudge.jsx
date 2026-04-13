/**
 * StaleGoalNudge — Batch 1 (20 Mistakes Fix)
 * When a goal has no activity for 7+ days, show "What's blocking you?" modal.
 * Instead of just a yellow badge, we create a real coaching dialogue.
 * Principle: "Goals without coaching on stall" + "No real dialogue"
 */
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

const BLOCKERS = [
  {
    key: 'motivation',
    emoji: '🔥',
    labelAr: 'فقدت الحماس',
    labelEn: 'I lost motivation',
    descAr: 'سأساعدك تستعيد طاقتك',
    descEn: "Let's reignite your fire",
    path: '/state',
  },
  {
    key: 'clarity',
    emoji: '🎯',
    labelAr: 'لا أعرف الخطوة التالية',
    labelEn: "I don't know the next step",
    descAr: 'لنكسر الهدف لخطوات صغيرة',
    descEn: "Let's break it into small steps",
    path: '/goals',
  },
  {
    key: 'overwhelm',
    emoji: '🌊',
    labelAr: 'مشغول ومثقل',
    labelEn: "I'm overwhelmed",
    descAr: 'لنحدد أهم خطوة واحدة فقط',
    descEn: "Let's pick just the ONE most important step",
    path: '/today',
  },
  {
    key: 'irrelevant',
    emoji: '🔄',
    labelAr: 'لم يعد مهماً لي',
    labelEn: "It's no longer important",
    descAr: 'لا بأس — الوعي بذاته تقدم',
    descEn: "That's okay — awareness itself is progress",
    path: null, // Will archive the goal
  },
]

export default function StaleGoalNudge() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const [dismissed, setDismissed] = useState(false)
  const [selectedBlocker, setSelectedBlocker] = useState(null)

  // Find stale goals (7+ days without activity, not completed)
  const staleGoals = useMemo(() => {
    const goals = state.goals || []
    const sevenDaysAgo = Date.now() - 7 * 86400000
    return goals.filter(g =>
      (g.progress || 0) < 100 &&
      g.updatedAt && g.updatedAt < sevenDaysAgo
    )
  }, [state.goals])

  // Check if we already showed nudge today
  const today = new Date().toISOString().split('T')[0]
  const nudgeLog = state.staleGoalNudgeLog || {}
  const alreadyNudgedToday = nudgeLog[today]

  // Don't show if no stale goals, already nudged, or dismissed
  if (staleGoals.length === 0 || alreadyNudgedToday || dismissed) return null

  const targetGoal = staleGoals[0]
  const daysSince = Math.floor((Date.now() - targetGoal.updatedAt) / 86400000)

  const handleBlockerSelect = (blocker) => {
    setSelectedBlocker(blocker)

    // Log the nudge so we don't show again today
    update('staleGoalNudgeLog', { ...nudgeLog, [today]: {
      goalId: targetGoal.id,
      blocker: blocker.key,
      ts: Date.now(),
    }})

    if (blocker.key === 'irrelevant') {
      // Archive the goal (set progress to -1 as "archived" marker)
      const updatedGoals = (state.goals || []).map(g =>
        g.id === targetGoal.id
          ? { ...g, archived: true, archivedAt: Date.now(), updatedAt: Date.now() }
          : g
      )
      update('goals', updatedGoals)
      setTimeout(() => setDismissed(true), 1500)
    } else {
      // Navigate to the appropriate tool after a brief moment
      setTimeout(() => {
        setDismissed(true)
        navigate(blocker.path)
      }, 600)
    }
  }

  return (
    <div style={{
      background: '#111',
      border: '1px solid rgba(255,193,7,0.25)',
      borderRadius: 20,
      padding: '16px 14px',
      marginBottom: 14,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(255,193,7,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            🎯
          </div>
          <div>
            <p style={{ color: '#ffc107', fontSize: 12, fontWeight: 800 }}>
              {isAr ? 'هدفك متوقف' : 'Your goal stalled'}
            </p>
            <p style={{ color: '#666', fontSize: 10 }}>
              {isAr ? `${daysSince} يوم بدون تقدم` : `${daysSince} days without progress`}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            update('staleGoalNudgeLog', { ...nudgeLog, [today]: { dismissed: true, ts: Date.now() } })
            setDismissed(true)
          }}
          style={{
            background: 'none', border: 'none', color: '#444',
            fontSize: 11, cursor: 'pointer', padding: '4px 8px',
          }}
        >
          {isAr ? 'لاحقاً' : 'Later'}
        </button>
      </div>

      {/* Goal name */}
      <div style={{
        background: '#0e0e0e',
        border: '1px solid #1e1e1e',
        borderRadius: 12,
        padding: '10px 12px',
        marginBottom: 12,
      }}>
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
          "{targetGoal.result?.slice(0, 60)}"
        </p>
        <div style={{
          marginTop: 6, height: 4, borderRadius: 2,
          background: '#1e1e1e', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${targetGoal.progress || 0}%`,
            background: '#ffc107',
          }} />
        </div>
        <p style={{ color: '#555', fontSize: 10, marginTop: 4 }}>
          {targetGoal.progress || 0}% {isAr ? 'مكتمل' : 'complete'}
        </p>
      </div>

      {/* Question */}
      <p style={{ color: '#ddd', fontSize: 13, fontWeight: 800, marginBottom: 10, textAlign: 'center' }}>
        {isAr ? '🤔 ما الذي يوقفك؟' : "🤔 What's blocking you?"}
      </p>

      {/* Blocker choices */}
      {!selectedBlocker ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {BLOCKERS.map(b => (
            <button
              key={b.key}
              onClick={() => handleBlockerSelect(b)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12,
                background: '#0e0e0e',
                border: '1px solid #1e1e1e',
                cursor: 'pointer',
                textAlign: isAr ? 'right' : 'left',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 18 }}>{b.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#ddd', fontSize: 12, fontWeight: 700 }}>
                  {isAr ? b.labelAr : b.labelEn}
                </p>
                <p style={{ color: '#555', fontSize: 10, marginTop: 1 }}>
                  {isAr ? b.descAr : b.descEn}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{
          background: selectedBlocker.key === 'irrelevant' ? 'rgba(46,204,113,0.08)' : 'rgba(201,168,76,0.08)',
          border: `1px solid ${selectedBlocker.key === 'irrelevant' ? 'rgba(46,204,113,0.25)' : 'rgba(201,168,76,0.25)'}`,
          borderRadius: 12,
          padding: '12px 14px',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 24 }}>{selectedBlocker.emoji}</span>
          <p style={{
            color: selectedBlocker.key === 'irrelevant' ? '#2ecc71' : '#c9a84c',
            fontSize: 12, fontWeight: 800, marginTop: 6,
          }}>
            {selectedBlocker.key === 'irrelevant'
              ? (isAr ? 'تم! الهدف محفوظ في الأرشيف' : 'Done! Goal archived')
              : (isAr ? 'لنبدأ! جاري التوجيه...' : "Let's go! Redirecting...")}
          </p>
        </div>
      )}
    </div>
  )
}
