/**
 * Smart Daily Question — Batch 3
 * Adaptive question based on user's current state & data patterns
 */
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { calcMomentum, detectRootCause } from '../utils/transformationEngine'

function getSmartQuestion(state, isAr) {
  const today = new Date().toISOString().split('T')[0]
  const momentum = calcMomentum(state)
  const rootCause = detectRootCause(state)
  const hour = new Date().getHours()
  const streak = state.streak || 0
  const checkin = state.stateCheckin?.[today]

  // Pool of context-aware questions
  const questions = []

  // 1. If energy is low today
  if (checkin && checkin.energy <= 4) {
    questions.push({
      emoji: '🔋',
      textAr: 'طاقتك منخفضة اليوم — ما أصغر شيء يمكنك فعله الآن ليرفع طاقتك 10%؟',
      textEn: 'Your energy is low today — what is the smallest thing you can do right now to boost it by 10%?',
      category: 'energy',
      priority: 10,
    })
  }

  // 2. If clarity is low
  if (checkin && checkin.clarity <= 4) {
    questions.push({
      emoji: '🎯',
      textAr: 'وضوحك منخفض — ما هو الشيء الوحيد الذي إذا أنجزته اليوم ستشعر بالتقدم؟',
      textEn: 'Your clarity is low — what is the ONE thing that, if done today, would make you feel real progress?',
      category: 'clarity',
      priority: 9,
    })
  }

  // 3. If streak just broke
  if (streak === 0 && (state.morningLog || []).length > 3) {
    questions.push({
      emoji: '🔄',
      textAr: 'سلسلتك انقطعت — ما الذي سيحدث إذا بدأت من جديد الآن دون الانتظار حتى الغد؟',
      textEn: 'Your streak broke — what happens if you restart now instead of waiting until tomorrow?',
      category: 'restart',
      priority: 9,
    })
  }

  // 4. If momentum is strong
  if (momentum.status === 'strong') {
    questions.push({
      emoji: '🚀',
      textAr: 'زخمك قوي! ما المستوى التالي الذي يمكنك الوصول إليه هذا الأسبوع؟',
      textEn: "Your momentum is strong! What's the next level you can reach this week?",
      category: 'growth',
      priority: 7,
    })
  }

  // 5. If goals are stale
  const activeGoals = (state.goals || []).filter(g => (g.progress || 0) < 100)
  const staleGoals = activeGoals.filter(g => {
    const sevenDaysAgo = Date.now() - 7 * 86400000
    return g.updatedAt && g.updatedAt < sevenDaysAgo
  })
  if (staleGoals.length > 0) {
    questions.push({
      emoji: '💤',
      textAr: `لديك ${staleGoals.length} أهداف لم تتحرك منذ أسبوع — أي هدف ستحرّكه اليوم؟`,
      textEn: `You have ${staleGoals.length} goals with no progress in a week — which one will you move today?`,
      category: 'goals',
      priority: 8,
    })
  }

  // 6. Root cause aligned questions
  if (rootCause.type === 'energy') {
    questions.push({
      emoji: '⚡',
      textAr: 'جسمك يطلب الطاقة — ما التغيير الواحد في نومك أو حركتك الذي سيحدث فرقاً هذا الأسبوع؟',
      textEn: 'Your body is asking for energy — what ONE change to your sleep or movement would make a difference this week?',
      category: 'energy',
      priority: 8,
    })
  }
  if (rootCause.type === 'identity') {
    questions.push({
      emoji: '🪞',
      textAr: 'إذا كنت الشخص الذي تريد أن تصبحه — ماذا سيفعل اليوم؟',
      textEn: 'If you were already the person you want to become — what would that person do today?',
      category: 'identity',
      priority: 8,
    })
  }
  if (rootCause.type === 'meaning') {
    questions.push({
      emoji: '💭',
      textAr: 'أنت تنفّذ لكن لا تشعر بالإشباع — ما الذي يهمك حقاً ولم تعطه وقتاً كافياً؟',
      textEn: "You execute but don't feel fulfilled — what truly matters to you that you haven't given enough time?",
      category: 'meaning',
      priority: 8,
    })
  }

  // 7. Evening reflection prompt
  if (hour >= 18) {
    questions.push({
      emoji: '🌙',
      textAr: 'ما الشيء الوحيد الذي تعلمته اليوم عن نفسك؟',
      textEn: 'What is the ONE thing you learned about yourself today?',
      category: 'reflection',
      priority: 6,
    })
  }

  // 8. Morning motivation prompt
  if (hour >= 5 && hour < 12) {
    questions.push({
      emoji: '☀️',
      textAr: 'ما النتيجة الأهم التي تريد تحقيقها اليوم ولماذا هي ضرورة مطلقة؟',
      textEn: 'What is the most important result you want today and why is it an absolute must?',
      category: 'morning',
      priority: 5,
    })
  }

  // 9. Generic powerful questions
  questions.push({
    emoji: '💡',
    textAr: 'ما الذي أنت ممتن له الآن ولم تفكر فيه من قبل؟',
    textEn: "What are you grateful for right now that you haven't thought about before?",
    category: 'gratitude',
    priority: 4,
  })

  questions.push({
    emoji: '🔥',
    textAr: 'إذا كنت تعرف أنك لن تفشل — ما الذي ستفعله اليوم؟',
    textEn: 'If you knew you could not fail — what would you do today?',
    category: 'courage',
    priority: 3,
  })

  // Sort by priority and pick top based on day rotation
  questions.sort((a, b) => b.priority - a.priority)
  const topQuestions = questions.slice(0, 3)

  // Rotate through top 3 based on time
  const idx = Math.floor(Date.now() / (1000 * 60 * 60 * 4)) % topQuestions.length // changes every 4 hours
  return topQuestions[idx] || topQuestions[0]
}

export default function SmartDailyQuestion() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const today = new Date().toISOString().split('T')[0]
  const savedAnswer = state.smartQuestionLog?.[today]
  const [answer, setAnswer] = useState(savedAnswer?.answer || '')
  const [showInput, setShowInput] = useState(false)
  const [saved, setSaved] = useState(!!savedAnswer)

  const question = useMemo(() => getSmartQuestion(state, isAr), [state, isAr])

  function save() {
    if (!answer.trim()) return
    const log = state.smartQuestionLog || {}
    update('smartQuestionLog', {
      ...log,
      [today]: {
        question: isAr ? question.textAr : question.textEn,
        answer: answer.trim(),
        category: question.category,
        ts: Date.now(),
      },
    })
    setSaved(true)
    setShowInput(false)
    showToast(isAr ? 'تم حفظ إجابتك' : 'Answer saved', 'success')
  }

  if (!question) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: 'linear-gradient(135deg, rgba(147,112,219,0.08), rgba(201,168,76,0.06))',
      border: '1px solid rgba(147,112,219,0.2)',
    }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{question.emoji}</span>
          <div className="flex-1">
            <p className="text-xs font-bold mb-1" style={{ color: '#9370db' }}>
              {isAr ? '🧠 سؤال اليوم الذكي' : '🧠 Smart Daily Question'}
            </p>
            <p className="text-sm font-bold text-white leading-relaxed">
              {isAr ? question.textAr : question.textEn}
            </p>
          </div>
        </div>

        {saved && !showInput ? (
          <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#2ecc71' }}>✓ {isAr ? 'إجابتك:' : 'Your answer:'}</p>
            <p className="text-xs text-gray-400 leading-relaxed">{savedAnswer?.answer || answer}</p>
            <button onClick={() => setShowInput(true)} className="text-xs mt-2" style={{ color: '#888' }}>
              {isAr ? 'تعديل' : 'Edit'}
            </button>
          </div>
        ) : showInput ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder={isAr ? 'اكتب إجابتك بصدق...' : 'Write your honest answer...'}
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none"
              style={{ background: '#0a0a0a', border: '1px solid #333', outline: 'none' }}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={save} disabled={!answer.trim()}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-black disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #9370db, #b48cef)' }}>
                💾 {isAr ? 'حفظ' : 'Save'}
              </button>
              <button onClick={() => setShowInput(false)}
                className="px-3 py-2 rounded-xl text-xs"
                style={{ background: '#2a2a2a', color: '#888' }}>
                {isAr ? 'لاحقاً' : 'Later'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(147,112,219,0.12)',
              border: '1px solid rgba(147,112,219,0.3)',
              color: '#9370db',
            }}>
            ✍️ {isAr ? 'أجب الآن' : 'Answer Now'}
          </button>
        )}
      </div>
    </div>
  )
}
