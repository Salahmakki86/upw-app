import { useState, useMemo } from 'react'
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

  function deleteHabit(habitId) {
    const newList = list.filter(h => h.id !== habitId)
    const newLog = {}
    Object.keys(log).forEach(date => {
      newLog[date] = (log[date] || []).filter(id => id !== habitId)
    })
    saveTracker(newList, newLog)
    setConfirmDelete(null)
  }

  const doneCount = todayLog.length
  const totalCount = list.length
  const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

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

  return (
    <Layout
      title={isAr ? 'متتبّع العادات' : 'Habit Tracker'}
      subtitle={isAr ? 'بنّ عاداتك، تبنِ مستقبلك' : 'Build your habits, build your future'}
      helpKey="habits"
    >
      <div className="space-y-4 pt-2" dir={isAr ? 'rtl' : 'ltr'}>

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

        {/* #10 — Habit Stacking Tip */}
        {stackingTip && doneCount > 0 && doneCount < totalCount && (
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
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
            ✦ {isAr ? 'عادات اليوم' : "Today's Habits"}
          </p>
          <div className="space-y-2">
            {list.map(habit => {
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
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                      style={{
                        background: done ? habit.color : '#2a2a2a',
                        border: `2px solid ${done ? habit.color : '#3a3a3a'}`,
                      }}
                    >
                      {done && <span className="text-xs font-black text-black">✓</span>}
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
                        className="text-xs w-7 h-7 rounded-lg flex items-center justify-center"
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

        {/* 7-Day Grid */}
        <div
          className="rounded-2xl p-4"
          style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#c9a84c' }}>
            📊 {isAr ? 'آخر 7 أيام' : 'Last 7 Days'}
          </p>

          {/* Day headers */}
          <div className="grid mb-2" style={{ gridTemplateColumns: `1fr repeat(7, 28px)`, gap: '4px' }}>
            <div />
            {last7.map(date => (
              <div key={date} className="text-center">
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
                style={{ gridTemplateColumns: `1fr repeat(7, 28px)`, gap: '4px' }}
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
                      className="rounded-md flex items-center justify-center"
                      style={{
                        width: 28, height: 28,
                        background: done ? `${habit.color}30` : '#1a1a1a',
                        border: `1px solid ${done ? habit.color + '60' : '#2a2a2a'}`,
                      }}
                    >
                      {done
                        ? <span className="text-xs" style={{ color: habit.color }}>✓</span>
                        : <span className="text-xs" style={{ color: '#333' }}>·</span>
                      }
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
