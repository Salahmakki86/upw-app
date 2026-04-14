import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const QUOTE = {
  ar: 'الامتنان يحوّل ما لديك إلى كافٍ',
  en: 'Gratitude turns what we have into enough',
}

const PLACEHOLDER = {
  ar: ['أشكر على...', 'أشكر على...', 'أشكر على...'],
  en: ['I\'m grateful for...', 'I\'m grateful for...', 'I\'m grateful for...'],
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  })
}

function calcStreak(gratitude, today) {
  let streak = 0
  let cursor = new Date(today)
  while (true) {
    const key = cursor.toISOString().split('T')[0]
    const entry = gratitude[key] || []
    const filled = entry.filter(v => v && v.trim()).length
    if (filled === 3) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default function GratitudeJournal() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const today = new Date().toISOString().split('T')[0]
  const gratitude = state.gratitude || {}
  const todayEntry = gratitude[today] || ['', '', '']

  const [collapsed, setCollapsed] = useState({})

  const filled = todayEntry.filter(v => v && v.trim()).length
  const allDone = filled === 3
  const streak = useMemo(() => calcStreak(gratitude, today), [gratitude, today])

  // Progressive: hide advanced elements for new users
  const totalGratitudeDays = Object.keys(gratitude).filter(d => (gratitude[d] || []).filter(v => v && v.trim()).length >= 3).length
  const isNewUser = totalGratitudeDays < 3

  const last7 = useMemo(() => getLast7Days(), [])
  const historyDays = last7.filter(d => d !== today && (gratitude[d] || []).some(v => v && v.trim()))

  function handleChange(index, value) {
    const newEntry = [...todayEntry]
    newEntry[index] = value
    update('gratitude', { ...gratitude, [today]: newEntry })
  }

  function toggleCollapse(date) {
    setCollapsed(prev => ({ ...prev, [date]: !prev[date] }))
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  const progressPct = (filled / 3) * 100

  return (
    <Layout
      title={isAr ? 'يوميات الامتنان' : 'Gratitude Journal'}
      subtitle={isAr ? 'ثلاثة أشياء تمنحك قوة كل يوم' : 'Three things that power your day'}
      helpKey="gratitude"
    >
      <div className="space-y-4 pt-2" dir={isAr ? 'rtl' : 'ltr'}>

        {/* Gold Gradient Header */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: 'linear-gradient(135deg, #1a1200, #1a1500, #0e0e0e)',
            border: '1px solid rgba(201,168,76,0.35)',
          }}
        >
          <div className="text-3xl mb-2">🌟</div>
          <p
            className="text-sm font-semibold italic leading-relaxed"
            style={{ color: '#c9a84c' }}
          >
            "{isAr ? QUOTE.ar : QUOTE.en}"
          </p>
          {streak > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <span className="text-base">🔥</span>
              <span className="text-xs font-black" style={{ color: '#c9a84c' }}>
                {streak} {isAr ? 'يوم متواصل' : streak === 1 ? 'day streak' : 'day streak'}
              </span>
            </div>
          )}
          {!isNewUser && (
            <p className="text-xs mt-3 px-2" style={{ color: '#666', lineHeight: 1.7 }}>
              {isAr
                ? '🧠 علم الأعصاب: ٣ أشياء يومياً تعيد برمجة دماغك نحو الإيجابية في ٢١ يوماً'
                : '🧠 Neuroscience: 3 daily items rewire your brain toward positivity in 21 days'}
            </p>
          )}
        </div>

        {/* Today's Entry */}
        <div
          className="rounded-2xl p-4"
          style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.2)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              ✦ {isAr ? 'امتنان اليوم' : "Today's Gratitude"}
            </span>
            <span className="text-xs font-bold" style={{ color: '#888' }}>{filled}/3</span>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-bg mb-4" style={{ height: 6, borderRadius: 99 }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPct}%`,
                height: '100%',
                borderRadius: 99,
                background: allDone
                  ? 'linear-gradient(90deg, #c9a84c, #f5d98b)'
                  : 'linear-gradient(90deg, #c9a84c88, #c9a84c)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="relative">
                <span
                  className="absolute text-xs font-black"
                  style={{
                    color: todayEntry[i]?.trim() ? '#c9a84c' : '#444',
                    top: '50%', transform: 'translateY(-50%)',
                    [isAr ? 'right' : 'left']: 12,
                  }}
                >
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={todayEntry[i] || ''}
                  onChange={e => handleChange(i, e.target.value)}
                  placeholder={isAr ? PLACEHOLDER.ar[i] : PLACEHOLDER.en[i]}
                  className="w-full rounded-xl py-3 text-sm text-white"
                  style={{
                    background: todayEntry[i]?.trim() ? 'rgba(201,168,76,0.08)' : '#111',
                    border: `1px solid ${todayEntry[i]?.trim() ? 'rgba(201,168,76,0.4)' : '#2a2a2a'}`,
                    [isAr ? 'paddingRight' : 'paddingLeft']: 36,
                    [isAr ? 'paddingLeft' : 'paddingRight']: 12,
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Celebration Message */}
          {allDone && (
            <div
              className="mt-4 rounded-xl p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                border: '1px solid rgba(201,168,76,0.4)',
              }}
            >
              <div className="text-2xl mb-1">🎉</div>
              <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                {isAr
                  ? `رائع! أكملت امتنان اليوم — ${streak} يوم متواصل 🔥`
                  : `Beautiful! Today's gratitude complete — ${streak} day streak 🔥`}
              </p>
              <p className="text-xs mt-1" style={{ color: '#888' }}>
                {isAr
                  ? 'قلبك الممتنّ يجذب مزيداً من النعم'
                  : 'Your grateful heart attracts more blessings'}
              </p>
              {!state.morningDone && (
                <button
                  onClick={() => navigate('/morning')}
                  className="mt-3 w-full rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}>
                  {isAr ? '☀️ ابدأ الروتين الصباحي ←' : '☀️ Start Morning Ritual →'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 7-Day History — hidden for first-time users to reduce clutter */}
        {!isNewUser && historyDays.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}
          >
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              📅 {isAr ? 'آخر 7 أيام' : 'Last 7 Days'}
            </p>
            <div className="space-y-2">
              {historyDays.map(date => {
                const entry = gratitude[date] || []
                const dayFilled = entry.filter(v => v && v.trim()).length
                const isOpen = !collapsed[date]
                return (
                  <div
                    key={date}
                    className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid #2a2a2a' }}
                  >
                    <button
                      onClick={() => toggleCollapse(date)}
                      className="w-full flex items-center justify-between px-4 py-3"
                      style={{ background: '#1a1a1a' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{dayFilled === 3 ? '✅' : '📝'}</span>
                        <span className="text-xs text-white font-medium">{formatDate(date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: dayFilled === 3 ? '#c9a84c' : '#888' }}>
                          {dayFilled}/3
                        </span>
                        <span className="text-xs" style={{ color: '#555' }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 pt-2 space-y-2" style={{ background: '#111' }}>
                        {[0, 1, 2].map(i => (
                          entry[i]?.trim() ? (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-xs font-black mt-0.5" style={{ color: '#c9a84c' }}>{i + 1}</span>
                              <p className="text-xs text-white leading-relaxed">{entry[i]}</p>
                            </div>
                          ) : null
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state for history — only show after user has data */}
        {!isNewUser && historyDays.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: '#444' }}>
              {isAr ? 'سجّل امتنانك يومياً لترى تاريخك هنا' : 'Journal daily to see your history here'}
            </p>
          </div>
        )}

      </div>
    </Layout>
  )
}
