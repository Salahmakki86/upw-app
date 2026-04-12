import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Pencil, Check, X, Play, ChevronRight, ChevronLeft, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'

const TEMPLATES = [
  { ar: 'كل يوم وبكل طريقة أزداد قوة وسعادة!',         en: 'Every day in every way I\'m getting stronger and happier!' },
  { ar: 'أنا أستطيع، أنا قادر، أنا أفعل الآن!',          en: 'I can, I am able, I do it now!' },
  { ar: 'أنا مصدر طاقة لا ينضب، حياتي استثنائية!',       en: 'I am an unlimited source of energy, my life is extraordinary!' },
  { ar: 'أنا أصنع مصيري بقراراتي في كل لحظة!',           en: 'I create my destiny with every decision I make!' },
  { ar: 'الله أعطاني كل ما أحتاجه لأنجح الآن!',          en: 'I have everything I need to succeed right now!' },
  { ar: 'أنا أستحق الحب والنجاح والوفرة الكاملة!',       en: 'I deserve love, success, and total abundance!' },
  { ar: 'المال يتدفق نحوي بسهولة وبركة!',               en: 'Money flows to me easily and abundantly!' },
  { ar: 'جسدي بصحة ممتازة وطاقتي في ذروتها!',           en: 'My body is in peak health and my energy is at its peak!' },
  { ar: 'أنا قائد ملهم يغيّر العالم من حوله!',           en: 'I am an inspiring leader who changes the world around me!' },
  { ar: 'كل تحدٍّ يجعلني أقوى وأكثر حكمة!',             en: 'Every challenge makes me stronger and wiser!' },
  { ar: 'أنا مليء بالامتنان والفرح والحب!',              en: 'I am filled with gratitude, joy, and love!' },
  { ar: 'أنا أنمو وأتطور وأتحسّن كل يوم!',              en: 'I grow, evolve, and improve every single day!' },
]

const DURATION_OPTIONS = [30, 60, 90]

// Practice mode component
function PracticeSession({ incantations, onClose, isAr }) {
  const [count, setCount] = useState(Math.min(3, incantations.length))
  const [duration, setDuration] = useState(30)
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [completed, setCompleted] = useState(false)
  const timerRef = useRef(null)

  const subset = count === 'all'
    ? incantations
    : incantations.slice(0, Math.min(Number(count), incantations.length))

  useEffect(() => {
    if (!started || completed) return
    setTimeLeft(duration)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          if (current + 1 >= subset.length) {
            setCompleted(true)
          } else {
            setCurrent(c => c + 1)
          }
          return duration
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, current, duration, subset.length, completed])

  if (completed) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-6"
        style={{ background: '#0a0a0a' }}>
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#c9a84c' }}>
          {isAr ? 'أحسنت! جلسة مكتملة' : 'Well done! Session Complete'}
        </h2>
        <p className="text-gray-400 mb-2">
          {isAr
            ? `أكملت ${subset.length} إيحاء بنجاح!`
            : `You completed ${subset.length} incantations!`}
        </p>
        <div
          className="px-4 py-2 rounded-full text-sm mb-6"
          style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}
        >
          {isAr ? '🔥 استمر كل يوم لبناء قوة ذهنية' : '🔥 Keep going daily to build mental power'}
        </div>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl font-bold"
          style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}
        >
          {isAr ? 'العودة' : 'Back'}
        </button>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
        style={{ background: '#0a0a0a' }}>
        <h2 className="text-xl font-bold mb-6" style={{ color: '#c9a84c' }}>
          {isAr ? '⚡ تمرين الإيحاءات' : '⚡ Incantation Practice'}
        </h2>

        <div className="w-full max-w-sm space-y-5">
          {/* Count selector */}
          <div>
            <p className="text-sm text-gray-400 mb-2">
              {isAr ? 'عدد الإيحاءات:' : 'Number of incantations:'}
            </p>
            <div className="flex gap-2">
              {[3, 5, 'all'].map(n => {
                const label = n === 'all' ? (isAr ? 'الكل' : 'All') : String(n)
                const val = n === 'all' ? 'all' : n
                return (
                  <button
                    key={n}
                    onClick={() => setCount(val)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium"
                    style={count === val
                      ? { background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }
                      : { background: '#1a1a1a', border: '1px solid #333', color: '#ccc' }
                    }
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Duration selector */}
          <div>
            <p className="text-sm text-gray-400 mb-2">
              {isAr ? 'مدة كل إيحاء:' : 'Duration per incantation:'}
            </p>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium"
                  style={duration === d
                    ? { background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }
                    : { background: '#1a1a1a', border: '1px solid #333', color: '#ccc' }
                  }
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div
            className="p-3 rounded-xl text-center text-sm"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', color: '#c9a84c' }}
          >
            {isAr ? '🗣️ قل كل إيحاء بصوت عالٍ مع الحركة!' : '🗣️ Say each incantation out loud with movement!'}
          </div>

          {incantations.length === 0 ? (
            <div
              className="w-full py-3 rounded-xl text-center text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}
            >
              {isAr ? 'أضف تكرارات أولاً' : 'Add incantations first'}
            </div>
          ) : subset.length === 0 ? (
            <div
              className="w-full py-3 rounded-xl text-center text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}
            >
              {isAr ? 'أضف تكرارات أولاً' : 'Add incantations first'}
            </div>
          ) : (
            <button
              onClick={() => { setCurrent(0); setTimeLeft(duration); setStarted(true) }}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}
            >
              <Play size={18} />
              {isAr ? 'ابدأ التمرين' : 'Start Practice'}
            </button>
          )}

          <button onClick={onClose} className="w-full py-2 text-sm text-gray-500">
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    )
  }

  // Active session
  const pct = Math.round(((duration - timeLeft) / duration) * 100)
  const progressPct = Math.round(((current) / subset.length) * 100)

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0a0a0a' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm text-gray-500">
          {current + 1} / {subset.length}
        </span>
        <div className="flex-1 mx-4">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <button onClick={onClose}><X size={20} style={{ color: '#666' }} /></button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Cue */}
        <div
          className="px-4 py-2 rounded-full text-sm mb-8"
          style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}
        >
          {isAr ? '🗣️ قل بصوت عالٍ مع الحركة!' : '🗣️ Say out loud with movement!'}
        </div>

        {/* Incantation text */}
        <p className="text-2xl font-bold text-white leading-relaxed mb-10">
          {subset[current]}
        </p>

        {/* Countdown ring */}
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" fill="none" stroke="#1e1e1e" strokeWidth="6" />
            <circle
              cx="48" cy="48" r="44" fill="none"
              stroke="#c9a84c" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (timeLeft / duration)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color: '#c9a84c' }}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Skip button */}
      <div className="px-6 pb-8 flex gap-3">
        <button
          onClick={() => {
            clearInterval(timerRef.current)
            if (current + 1 >= subset.length) setCompleted(true)
            else setCurrent(c => c + 1)
          }}
          className="flex-1 py-3 rounded-xl font-semibold"
          style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc' }}
        >
          {isAr ? 'التالي ←' : '→ Next'}
        </button>
      </div>
    </div>
  )
}

export default function Incantations() {
  const { state, update } = useApp()
  const { lang, dir } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const incantations = state.incantations || []
  const streak = state.incantationStreak || 0

  const [newText, setNewText] = useState('')
  const [editingIdx, setEditingIdx] = useState(null)
  const [editText, setEditText] = useState('')
  const [practiceOpen, setPracticeOpen] = useState(false)

  const save = (arr) => update('incantations', arr)

  const addIncantation = () => {
    const text = newText.trim()
    if (!text) return
    save([...incantations, text])
    setNewText('')
    showToast(isAr ? 'تمت الإضافة ✓' : 'Added ✓', 'success')
  }

  const deleteIncantation = (i) => {
    const arr = incantations.filter((_, idx) => idx !== i)
    save(arr)
  }

  const startEdit = (i) => {
    setEditingIdx(i)
    setEditText(incantations[i])
  }

  const saveEdit = () => {
    if (!editText.trim()) return
    const arr = [...incantations]
    arr[editingIdx] = editText.trim()
    save(arr)
    setEditingIdx(null)
  }

  const addTemplate = (t) => {
    const text = isAr ? t.ar : t.en
    if (incantations.includes(text)) {
      showToast(isAr ? 'موجود بالفعل' : 'Already in your list', 'warning')
      return
    }
    save([...incantations, text])
    showToast(isAr ? 'تمت الإضافة ✓' : 'Added ✓', 'success')
  }

  const handlePracticeClose = () => {
    setPracticeOpen(false)
    // Update streak
    const today = new Date().toISOString().split('T')[0]
    const lastPractice = state.lastIncantationDate
    const newStreak = lastPractice === today ? streak : streak + 1
    update('incantationStreak', newStreak)
    update('lastIncantationDate', today)
    showToast(isAr ? `🔥 ${newStreak} أيام متتالية!` : `🔥 ${newStreak}-day streak!`, 'success')
  }

  return (
    <Layout>
      {practiceOpen && (
        <PracticeSession
          incantations={incantations}
          onClose={handlePracticeClose}
          isAr={isAr}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-6" dir={dir}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#c9a84c' }}>
              {isAr ? 'الإيحاءات' : 'Incantations'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isAr ? 'برمج عقلك الباطن بقوة الكلمة والحركة' : 'Program your subconscious with words and motion'}
            </p>
          </div>
          {streak > 0 && (
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
            >
              <span className="text-lg">🔥</span>
              <span className="font-bold text-sm" style={{ color: '#c9a84c' }}>{streak}</span>
            </div>
          )}
        </div>

        {/* ── Section 1: My Incantations ── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Zap size={16} style={{ color: '#c9a84c' }} />
              {isAr ? 'مكتبتي' : 'My Incantations'}
            </h2>
            <span className="text-xs text-gray-500">{incantations.length}</span>
          </div>

          {/* Add input */}
          <div className="flex gap-2 mb-4">
            <input
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addIncantation()}
              placeholder={isAr ? 'اكتب إيحاءً جديدًا...' : 'Write a new incantation...'}
              className="flex-1 bg-transparent border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            />
            <button
              onClick={addIncantation}
              className="p-2.5 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}
            >
              <Plus size={18} />
            </button>
          </div>

          {incantations.length === 0 && (
            <div
              className="text-center py-8 rounded-xl text-sm text-gray-500"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}
            >
              {isAr ? 'لا توجد إيحاءات بعد — أضف من المكتبة أدناه' : 'No incantations yet — add from templates below'}
            </div>
          )}

          <div className="space-y-2">
            {incantations.map((inc, i) => (
              <div
                key={i}
                className="p-3 rounded-xl"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}
              >
                {editingIdx === i ? (
                  <div className="flex gap-2">
                    <input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEdit()}
                      className="flex-1 bg-transparent border border-gray-600 rounded-lg px-3 py-1 text-sm text-white outline-none"
                      autoFocus
                    />
                    <button onClick={saveEdit} className="p-1.5 rounded-lg" style={{ color: '#4ade80' }}>
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingIdx(null)} className="p-1.5 rounded-lg" style={{ color: '#f87171' }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="flex-1 text-sm text-white leading-relaxed">{inc}</p>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(i)}
                        className="p-1.5 rounded-lg hover:bg-white/5"
                        style={{ color: '#c9a84c' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteIncantation(i)}
                        className="p-1.5 rounded-lg hover:bg-white/5"
                        style={{ color: '#f87171' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Practice button */}
          {incantations.length > 0 && (
            <button
              onClick={() => setPracticeOpen(true)}
              className="w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}
            >
              <Play size={18} />
              {isAr ? 'ابدأ التمرين' : 'Start Practice Session'}
            </button>
          )}
        </section>

        {/* ── Section 2: Templates ── */}
        <section>
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span style={{ color: '#c9a84c' }}>✨</span>
            {isAr ? 'أنماط جاهزة' : 'Ready Templates'}
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            {isAr ? 'من أقوى إيحاءات توني روبينز — اضغط للإضافة' : 'Tony Robbins\' most powerful incantations — tap to add'}
          </p>

          <div className="space-y-2">
            {TEMPLATES.map((t, i) => {
              const text = isAr ? t.ar : t.en
              const alreadyAdded = incantations.includes(text)
              return (
                <button
                  key={i}
                  onClick={() => addTemplate(t)}
                  className="w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all"
                  style={{
                    background: alreadyAdded ? 'rgba(74,222,128,0.06)' : 'rgba(201,168,76,0.04)',
                    border: alreadyAdded ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(201,168,76,0.12)',
                  }}
                >
                  <span className="text-lg mt-0.5">
                    {alreadyAdded ? '✅' : '💫'}
                  </span>
                  <span
                    className="text-sm leading-relaxed flex-1"
                    style={{ color: alreadyAdded ? '#4ade80' : '#d1d5db' }}
                  >
                    {text}
                  </span>
                  {!alreadyAdded && (
                    <Plus size={16} className="shrink-0 mt-0.5" style={{ color: '#c9a84c' }} />
                  )}
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </Layout>
  )
}
