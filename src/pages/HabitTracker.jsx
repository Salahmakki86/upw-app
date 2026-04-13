import { useState, useMemo, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const DEFAULT_HABITS = [
  { id: 'h1', nameAr: 'الروتين الصباحي', nameEn: 'Morning Ritual', emoji: '🌅', color: '#c9a84c' },
  { id: 'h2', nameAr: 'التمرين',          nameEn: 'Exercise',        emoji: '💪', color: '#2ecc71' },
  { id: 'h3', nameAr: 'القراءة',          nameEn: 'Reading',         emoji: '📚', color: '#3498db' },
  { id: 'h4', nameAr: 'التأمل',           nameEn: 'Meditation',      emoji: '🧘', color: '#9b59b6' },
  { id: 'h5', nameAr: 'شرب الماء',        nameEn: 'Hydration',       emoji: '💧', color: '#1abc9c' },
]

const EMOJI_OPTIONS = ['🌅','💪','📚','🧘','💧','🔥','🎯','🏃','✍️','🎨','🧠','💼','🌱','🎵','🤸','🥗','😴','🧹','🙏','⭐']
const COLOR_OPTIONS = ['#c9a84c','#2ecc71','#3498db','#9b59b6','#1abc9c','#e74c3c']

// Tony Robbins suggested habits
const TR_SUGGESTIONS = [
  { nameAr: 'التحضير الذهني (Priming)', nameEn: 'Daily Priming',      emoji: '🧠', color: '#c9a84c' },
  { nameAr: 'دش بارد',                  nameEn: 'Cold Shower',         emoji: '🚿', color: '#3498db' },
  { nameAr: 'الامتنان اليومي',           nameEn: 'Daily Gratitude',     emoji: '🙏', color: '#f1c40f' },
  { nameAr: 'التمرين',                   nameEn: 'Exercise',            emoji: '💪', color: '#2ecc71' },
  { nameAr: 'القراءة',                   nameEn: 'Reading',             emoji: '📚', color: '#3498db' },
  { nameAr: 'التأمل',                    nameEn: 'Meditation',          emoji: '🧘', color: '#9b59b6' },
  { nameAr: 'التأكيدات الإيجابية',       nameEn: 'Affirmations',        emoji: '⭐', color: '#e91e8c' },
  { nameAr: 'كتابة اليوميات',            nameEn: 'Journaling',          emoji: '✍️', color: '#1abc9c' },
  { nameAr: 'التواصل العميق',             nameEn: 'Deep Connection',     emoji: '❤️', color: '#e74c3c' },
  { nameAr: 'العطاء والمساهمة',          nameEn: 'Giving / Contribution',emoji: '🌟', color: '#c9a84c' },
]

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function calcHabitStreak(log, habitId) {
  let streak = 0
  const cursor = new Date()
  while (true) {
    const key = cursor.toISOString().split('T')[0]
    const dayLog = log[key] || []
    if (dayLog.includes(habitId)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

const EMPTY_FORM = { nameAr: '', nameEn: '', emoji: '🌅', color: '#c9a84c' }

export default function HabitTracker() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const today = new Date().toISOString().split('T')[0]

  const rawTracker = state.habitTracker || {}
  const list = rawTracker.list && rawTracker.list.length > 0 ? rawTracker.list : DEFAULT_HABITS
  const log  = rawTracker.log  || {}

  const todayLog = log[today] || []

  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationShownFor, setCelebrationShownFor] = useState(null)

  const last7 = useMemo(() => getLast7Days(), [])

  function saveTracker(newList, newLog) {
    update('habitTracker', { list: newList, log: newLog })
  }

  function toggleHabit(habitId) {
    const current = log[today] || []
    const updated = current.includes(habitId)
      ? current.filter(id => id !== habitId)
      : [...current, habitId]
    saveTracker(list, { ...log, [today]: updated })
  }

  function addHabit() {
    if (!form.nameAr.trim() && !form.nameEn.trim()) return
    const newHabit = {
      id: `h_${Date.now()}`,
      nameAr: form.nameAr.trim() || form.nameEn.trim(),
      nameEn: form.nameEn.trim() || form.nameAr.trim(),
      emoji: form.emoji,
      color: form.color,
    }
    const baseList = rawTracker.list && rawTracker.list.length > 0 ? list : DEFAULT_HABITS
    saveTracker([...baseList, newHabit], log)
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function addSuggestedHabit(suggestion) {
    const newHabit = {
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      nameAr: suggestion.nameAr,
      nameEn: suggestion.nameEn,
      emoji: suggestion.emoji,
      color: suggestion.color,
    }
    const baseList = rawTracker.list && rawTracker.list.length > 0 ? list : DEFAULT_HABITS
    saveTracker([...baseList, newHabit], log)
  }

  function deleteHabit(habitId) {
    const newList = list.filter(h => h.id !== habitId)
    const newLog = {}
    Object.keys(log).forEach(date => {
      newLog[date] = (log[date] || []).filter(id => id !== habitId)
    })
    saveTracker(newList, newLog)
    setConfirmDelete(null)
  }

  function moveHabit(index, direction) {
    const newList = [...list]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newList.length) return
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp
    saveTracker(newList, log)
  }

  const doneCount = todayLog.length
  const totalCount = list.length
  const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

  // Progressive: hide advanced features for new users
  const habitHistoryDays = Object.keys(log).length
  const isNewHabitUser = habitHistoryDays < 3

  // Celebration: when all habits are done for today
  useEffect(() => {
    if (progressPct === 100 && totalCount > 0 && celebrationShownFor !== today) {
      setShowCelebration(true)
      setCelebrationShownFor(today)
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [progressPct, totalCount, today, celebrationShownFor])

  // #10 — Detect broken streaks for failure recovery messaging
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const yesterdayLog = log[yesterday] || []
  const missedYesterday = yesterdayLog.length === 0 && Object.keys(log).length > 0

  // #10 — Habit stacking suggestions
  const stackingTip = useMemo(() => {
    if (doneCount === 0) return null
    const undone = list.filter(h => !todayLog.includes(h.id))
    if (undone.length === 0) return null
    const lastDone = list.find(h => todayLog.includes(h.id))
    if (!lastDone) return null
    return {
      after: isAr ? lastDone.nameAr : lastDone.nameEn,
      next: undone[0],
    }
  }, [doneCount, todayLog, list, isAr])

  function dayLabel(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short' })
  }

  // Already-added suggestion IDs (match by nameEn)
  const addedSuggestionNames = new Set(list.map(h => h.nameEn))

  return (
    <Layout
      title={isAr ? 'متتبّع العادات' : 'Habit Tracker'}
      subtitle={isAr ? 'بنّ عاداتك، تبنِ مستقبلك' : 'Build your habits, build your future'}
      helpKey="habits"
    >
      <div className="space-y-4 pt-2" dir={isAr ? 'rtl' : 'ltr'}>

        {/* Celebration Banner */}
        {showCelebration && (
          <div
            className="rounded-2xl p-4 text-center animate-scale-in"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(240,201,110,0.15))', border: '2px solid rgba(201,168,76,0.6)' }}
          >
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm font-black text-white">
              {isAr ? 'يوم مثالي! كل عاداتك مكتملة!' : 'Perfect day! All habits complete!'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#c9a84c' }}>
              {isAr ? 'أنت بطل حقيقي! استمر على هذا المستوى!' : "You're a true champion! Keep it up!"}
            </p>
          </div>
        )}

        {/* #10 — Failure Recovery Message */}
        {missedYesterday && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.2)' }}>
            <p className="text-xs font-bold" style={{ color: '#e74c3c' }}>
              🔄 {isAr ? 'فاتك يوم الأمس — لا بأس! الأبطال يسقطون ثم ينهضون أقوى.' : 'You missed yesterday — that\'s OK! Champions fall and rise stronger.'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#888' }}>
              {isAr ? 'ابدأ بعادة واحدة فقط اليوم وابنِ الزخم من جديد' : 'Start with just ONE habit today and rebuild momentum'}
            </p>
          </div>
        )}

        {/* Progress Summary */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, #1a1200, #1a1a1a)',
            border: '1px solid rgba(201,168,76,0.3)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
                {isAr ? 'إنجاز اليوم' : "Today's Progress"}
              </p>
              <p className="text-3xl font-black text-white mt-1">
                {doneCount}
                <span className="text-lg font-normal" style={{ color: '#888' }}>/{totalCount}</span>
              </p>
            </div>
            <div className="text-5xl">{progressPct === 100 ? '🏆' : '🎯'}</div>
          </div>

          {/* Progress Bar */}
          <div style={{ background: '#2a2a2a', borderRadius: 99, height: 8 }}>
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                borderRadius: 99,
                background: progressPct === 100
                  ? 'linear-gradient(90deg, #c9a84c, #f5d98b)'
                  : `linear-gradient(90deg, #c9a84c88, #c9a84c)`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {progressPct === 100 && (
            <p className="text-xs text-center mt-3 font-bold" style={{ color: '#c9a84c' }}>
              {isAr ? '🌟 أكملت جميع العادات اليوم! عظيم!' : '🌟 All habits complete today! Incredible!'}
            </p>
          )}
        </div>

        {/* #10 — Habit Stacking Tip (hidden for new users) */}
        {!isNewHabitUser && stackingTip && doneCount > 0 && doneCount < totalCount && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(52,152,219,0.06)', border: '1px solid rgba(52,152,219,0.2)' }}>
            <p className="text-xs font-bold" style={{ color: '#3498db' }}>
              🔗 {isAr ? 'نصيحة التراكم' : 'Stacking Tip'}
            </p>
            <p className="text-xs mt-1 text-white">
              {isAr
                ? `بعد "${stackingTip.after}"، جرّب مباشرة "${isAr ? stackingTip.next.nameAr : stackingTip.next.nameEn}" ${stackingTip.next.emoji}`
                : `After "${stackingTip.after}", try "${stackingTip.next.nameEn}" ${stackingTip.next.emoji} right away`}
            </p>
          </div>
        )}

        {/* Today's Habits */}
        <div
          className="rounded-2xl p-4"
          style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              ✦ {isAr ? 'عادات اليوم' : "Today's Habits"}
            </p>
            {/* Edit mode toggle — hidden for new users */}
            {!isNewHabitUser && (
              <button
                onClick={() => setEditMode(v => !v)}
                className="text-xs px-3 py-1 rounded-lg font-bold transition-all"
                style={{
                  background: editMode ? 'rgba(201,168,76,0.15)' : '#1a1a1a',
                  color: editMode ? '#c9a84c' : '#666',
                  border: `1px solid ${editMode ? 'rgba(201,168,76,0.4)' : '#2a2a2a'}`,
                }}
              >
                {isAr ? (editMode ? '✓ تم' : '✎ ترتيب') : (editMode ? '✓ Done' : '✎ Reorder')}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {list.map((habit, index) => {
              const done = todayLog.includes(habit.id)
              const streak = calcHabitStreak(log, habit.id)
              return (
                <div
                  key={habit.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: `1px solid ${done ? habit.color + '55' : '#2a2a2a'}`,
                    background: done ? `${habit.color}12` : '#111',
                    transition: 'all 0.2s',
                  }}
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Reorder buttons in edit mode */}
                    {editMode && (
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => moveHabit(index, -1)}
                          disabled={index === 0}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs transition-all"
                          style={{
                            background: index === 0 ? '#1a1a1a' : 'rgba(201,168,76,0.12)',
                            color: index === 0 ? '#333' : '#c9a84c',
                          }}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveHabit(index, 1)}
                          disabled={index === list.length - 1}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs transition-all"
                          style={{
                            background: index === list.length - 1 ? '#1a1a1a' : 'rgba(201,168,76,0.12)',
                            color: index === list.length - 1 ? '#333' : '#c9a84c',
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    )}

                    {/* Checkbox — min 44x44 touch target */}
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className="flex-shrink-0 rounded-lg flex items-center justify-center transition-all active:scale-90"
                      style={{
                        width: 44, height: 44,
                        background: done ? habit.color : '#2a2a2a',
                        border: `2px solid ${done ? habit.color : '#3a3a3a'}`,
                      }}
                    >
                      {done && <span className="text-sm font-black text-black">✓</span>}
                    </button>

                    {/* Emoji + Name */}
                    <span className="text-xl flex-shrink-0">{habit.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${done ? 'line-through' : ''}`}
                        style={{ color: done ? '#666' : 'white' }}>
                        {isAr ? habit.nameAr : habit.nameEn}
                      </p>
                      {streak > 0 && (
                        <p className="text-xs mt-0.5" style={{ color: habit.color }}>
                          🔥 {streak} {isAr ? 'يوم' : streak === 1 ? 'day' : 'days'}
                        </p>
                      )}
                    </div>

                    {/* Delete */}
                    {confirmDelete === habit.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ background: '#e74c3c22', color: '#e74c3c', border: '1px solid #e74c3c55' }}
                        >
                          {isAr ? 'نعم' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ background: '#2a2a2a', color: '#888' }}
                        >
                          {isAr ? 'لا' : 'No'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(habit.id)}
                        className="text-xs w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: '#2a2a2a', color: '#555' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add Habit Button */}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mt-3 rounded-xl py-3 font-bold text-sm transition-all active:scale-[0.98]"
              style={{
                background: 'rgba(201,168,76,0.08)',
                border: '1px dashed rgba(201,168,76,0.4)',
                color: '#c9a84c',
              }}
            >
              + {isAr ? 'أضف عادة جديدة' : 'Add New Habit'}
            </button>
          ) : (
            <div
              className="mt-3 rounded-xl p-4 space-y-3"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
                {isAr ? 'عادة جديدة' : 'New Habit'}
              </p>

              <input
                type="text"
                placeholder={isAr ? 'الاسم بالعربية' : 'Arabic name'}
                value={form.nameAr}
                onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
                style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
              />
              <input
                type="text"
                placeholder={isAr ? 'الاسم بالإنجليزية' : 'English name'}
                value={form.nameEn}
                onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
                style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
              />

              {/* Emoji Picker */}
              <div>
                <p className="text-xs mb-2" style={{ color: '#888' }}>{isAr ? 'الأيقونة' : 'Icon'}</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      onClick={() => setForm(f => ({ ...f, emoji: em }))}
                      className="w-9 h-9 rounded-lg text-lg transition-all"
                      style={{
                        background: form.emoji === em ? 'rgba(201,168,76,0.2)' : '#111',
                        border: `1px solid ${form.emoji === em ? '#c9a84c' : '#333'}`,
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <p className="text-xs mb-2" style={{ color: '#888' }}>{isAr ? 'اللون' : 'Color'}</p>
                <div className="flex gap-3">
                  {COLOR_OPTIONS.map(col => (
                    <button
                      key={col}
                      onClick={() => setForm(f => ({ ...f, color: col }))}
                      className="w-9 h-9 rounded-full transition-all"
                      style={{
                        background: col,
                        border: form.color === col ? `3px solid white` : '3px solid transparent',
                        outline: form.color === col ? `2px solid ${col}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={addHabit}
                  className="btn-gold flex-1 text-sm py-2"
                >
                  {isAr ? 'أضف العادة' : 'Add Habit'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                  className="px-4 text-sm py-2 rounded-xl"
                  style={{ background: '#2a2a2a', color: '#888' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Habit Suggestions — hidden for new users to reduce overwhelm */}
        {!isNewHabitUser && <div className="rounded-2xl overflow-hidden" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <button
            onClick={() => setShowSuggestions(v => !v)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <span>💡</span>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
                {isAr ? 'اقتراحات / Suggestions' : 'Suggestions / اقتراحات'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c' }}>
                {TR_SUGGESTIONS.length}
              </span>
            </div>
            <span style={{ color: '#555', fontSize: 12 }}>{showSuggestions ? '▲' : '▼'}</span>
          </button>

          {showSuggestions && (
            <div className="px-4 pb-4 space-y-2 animate-fade-in" style={{ borderTop: '1px solid #1a1a1a' }}>
              <p className="text-xs pt-2" style={{ color: '#666' }}>
                {isAr ? 'عادات توني روبنز الأساسية — اضغط لإضافة فوراً' : "Tony Robbins' core habits — tap to add instantly"}
              </p>
              {TR_SUGGESTIONS.map((sug, i) => {
                const alreadyAdded = addedSuggestionNames.has(sug.nameEn)
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: '#111', border: '1px solid #1e1e1e' }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{sug.emoji}</span>
                      <span className="text-sm" style={{ color: alreadyAdded ? '#555' : '#ddd' }}>
                        {isAr ? sug.nameAr : sug.nameEn}
                      </span>
                    </div>
                    <button
                      onClick={() => !alreadyAdded && addSuggestedHabit(sug)}
                      disabled={alreadyAdded}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all active:scale-95"
                      style={{
                        background: alreadyAdded ? '#1a1a1a' : `${sug.color}20`,
                        color: alreadyAdded ? '#444' : sug.color,
                        border: `1px solid ${alreadyAdded ? '#2a2a2a' : sug.color + '44'}`,
                        cursor: alreadyAdded ? 'default' : 'pointer',
                      }}
                    >
                      {alreadyAdded ? (isAr ? '✓ مضاف' : '✓ Added') : (isAr ? '+ أضف' : '+ Add')}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>}

        {/* 7-Day Grid — hidden for new users */}
        {!isNewHabitUser &&
        <div
          className="rounded-2xl p-4"
          style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#c9a84c' }}>
            📊 {isAr ? 'آخر 7 أيام' : 'Last 7 Days'}
          </p>

          {/* Day headers */}
          <div className="grid mb-2" style={{ gridTemplateColumns: `1fr repeat(7, 44px)`, gap: '4px' }}>
            <div />
            {last7.map(date => (
              <div key={date} className="text-center" style={{ width: 44 }}>
                <span
                  className="text-xs font-bold"
                  style={{ color: date === today ? '#c9a84c' : '#555' }}
                >
                  {dayLabel(date)}
                </span>
              </div>
            ))}
          </div>

          {/* Habit rows */}
          <div className="space-y-2">
            {list.map(habit => (
              <div
                key={habit.id}
                className="grid items-center"
                style={{ gridTemplateColumns: `1fr repeat(7, 44px)`, gap: '4px' }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm flex-shrink-0">{habit.emoji}</span>
                  <span className="text-xs truncate" style={{ color: '#888' }}>
                    {isAr ? habit.nameAr : habit.nameEn}
                  </span>
                </div>
                {last7.map(date => {
                  const done = (log[date] || []).includes(habit.id)
                  return (
                    <div
                      key={date}
                      className="rounded-md flex items-center justify-center transition-all active:scale-90"
                      style={{
                        width: 44, height: 44,
                        background: done ? `${habit.color}30` : '#1a1a1a',
                        border: `1px solid ${done ? habit.color + '60' : '#2a2a2a'}`,
                      }}
                    >
                      {done
                        ? <span className="text-sm font-bold" style={{ color: habit.color }}>✓</span>
                        : <span className="text-base" style={{ color: '#333' }}>·</span>
                      }
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>}

        {/* Morning Ritual connection */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
            ☀️ {isAr ? 'ابنِ عاداتك في الروتين الصباحي' : 'Build habits into your Morning Ritual'}
          </p>
          <p className="text-xs leading-relaxed mb-2" style={{ color: '#666' }}>
            {isAr
              ? 'توني: "الأشخاص الناجحون لديهم طقوس يومية ثابتة — ادمج عاداتك في روتينك الصباحي لتثبّتها"'
              : 'Tony: "Successful people have consistent daily rituals — integrate your habits into your Morning Ritual to solidify them"'}
          </p>
        </div>

      </div>
    </Layout>
  )
}
