import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const CATEGORIES = {
  personal: { ar: 'شخصي', en: 'Personal', color: '#9b59b6', emoji: '🌟' },
  work:     { ar: 'عمل',   en: 'Work',     color: '#3498db', emoji: '💼' },
  health:   { ar: 'صحة',   en: 'Health',   color: '#2ecc71', emoji: '💪' },
  relationship: { ar: 'علاقات', en: 'Relationships', color: '#e91e8c', emoji: '❤️' },
  spiritual: { ar: 'روحي', en: 'Spiritual', color: '#c9a84c', emoji: '✨' },
}

const EMOJIS = ['🏆', '🎯', '💪', '🔥', '⭐', '🌟', '✅', '🎉', '🚀', '💎']

const MOTIVATIONAL = {
  ar: [
    { max: 0, msg: 'ابدأ بتسجيل أول انتصار لك اليوم!' },
    { max: 1, msg: 'انتصار واحد يصنع الزخم — استمر!' },
    { max: 2, msg: 'انتصاران! أنت في المسار الصحيح!' },
    { max: 3, msg: '3 انتصارات! يوم استثنائي صنعته بنفسك!' },
    { max: Infinity, msg: 'لا حدود لانتصاراتك — أنت محارب!' },
  ],
  en: [
    { max: 0, msg: 'Log your first win of the day!' },
    { max: 1, msg: 'One win creates momentum — keep going!' },
    { max: 2, msg: 'Two wins! You\'re on the right track!' },
    { max: 3, msg: '3 wins! Extraordinary day you created!' },
    { max: Infinity, msg: 'No limit to your wins — you\'re a warrior!' },
  ],
}

export default function DailyWins() {
  const { state, addWin, deleteWin, today } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const [text, setText] = useState('')
  const [category, setCategory] = useState('personal')
  const [emoji, setEmoji] = useState('🏆')
  const [showForm, setShowForm] = useState(false)

  const dailyWins = state.dailyWins || {}
  const todayWins = dailyWins[today] || []

  // Last 14 days
  const last14 = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      return d.toISOString().split('T')[0]
    })
  }, [])

  // Stats
  const allWins = useMemo(() => Object.values(dailyWins).flat(), [dailyWins])
  const totalWins = allWins.length
  const daysWithWins = Object.keys(dailyWins).filter(d => (dailyWins[d] || []).length > 0).length

  const categoryCount = useMemo(() => {
    const counts = {}
    allWins.forEach(w => { counts[w.category] = (counts[w.category] || 0) + 1 })
    return counts
  }, [allWins])

  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0]

  // Win streak
  const winStreak = useMemo(() => {
    let streak = 0
    const sortedDates = Object.keys(dailyWins)
      .filter(d => (dailyWins[d] || []).length > 0)
      .sort().reverse()
    for (let i = 0; i < sortedDates.length; i++) {
      const expected = new Date()
      expected.setDate(expected.getDate() - i)
      if (sortedDates[i] === expected.toISOString().split('T')[0]) streak++
      else break
    }
    return streak
  }, [dailyWins])

  // Random win of the day
  const winOfDay = useMemo(() => {
    if (allWins.length === 0) return null
    const seed = new Date().getDate()
    return allWins[seed % allWins.length]
  }, [allWins])

  const motivational = useMemo(() => {
    const msgs = MOTIVATIONAL[lang]
    return msgs.find(m => todayWins.length <= m.max)?.msg || msgs[msgs.length - 1].msg
  }, [todayWins.length, lang])

  const handleAdd = () => {
    if (!text.trim()) return
    addWin(today, { text: text.trim(), category, emoji })
    setText('')
    setShowForm(false)
  }

  const pastDays = last14.filter(d => d !== today && (dailyWins[d] || []).length > 0).reverse()

  return (
    <Layout title={t('wins_title')} subtitle={t('wins_subtitle')}>
      <div className="space-y-4 pt-2">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: isAr ? 'انتصارات' : 'Total Wins', value: totalWins, color: '#c9a84c' },
            { label: isAr ? 'أيام متواصلة' : 'Day Streak', value: winStreak, color: '#2ecc71' },
            { label: isAr ? 'أيام فعّالة' : 'Active Days', value: daysWithWins, color: '#3498db' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top Category */}
        {topCategory && (
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <span className="text-2xl">{CATEGORIES[topCategory]?.emoji}</span>
            <div>
              <div className="text-xs" style={{ color: '#888' }}>{isAr ? 'أكثر فئة' : 'Top Category'}</div>
              <div className="font-bold text-white">{isAr ? CATEGORIES[topCategory]?.ar : CATEGORIES[topCategory]?.en}</div>
            </div>
          </div>
        )}

        {/* Today's Wins */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.2)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              {isAr ? '🏆 انتصارات اليوم' : '🏆 Today\'s Wins'}
            </span>
            <span className="text-xs font-bold" style={{ color: '#888' }}>{todayWins.length}/3</span>
          </div>

          <p className="text-xs mb-3" style={{ color: '#c9a84c88' }}>{motivational}</p>

          {todayWins.length === 0 && (
            <p className="text-center py-4 text-xs" style={{ color: '#555' }}>
              {isAr ? 'لم تسجّل أي انتصار اليوم بعد' : 'No wins logged yet today'}
            </p>
          )}

          <div className="space-y-2 mb-3">
            {todayWins.map(win => (
              <div key={win.id} className="flex items-start gap-3 rounded-xl p-3"
                style={{ background: `${CATEGORIES[win.category]?.color}15`, border: `1px solid ${CATEGORIES[win.category]?.color}30` }}>
                <span className="text-xl">{win.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{win.text}</p>
                  <span className="text-xs" style={{ color: CATEGORIES[win.category]?.color }}>
                    {isAr ? CATEGORIES[win.category]?.ar : CATEGORIES[win.category]?.en}
                  </span>
                </div>
                <button onClick={() => deleteWin(today, win.id)}
                  className="text-xs px-2 py-1 rounded-lg transition-all"
                  style={{ background: '#2a2a2a', color: '#888' }}>✕</button>
              </div>
            ))}
          </div>

          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="w-full rounded-xl py-3 font-bold text-sm transition-all active:scale-[0.98]"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c' }}>
              + {isAr ? 'أضف انتصاراً' : 'Add a Win'}
            </button>
          ) : (
            <div className="space-y-3 rounded-xl p-3" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder={isAr ? 'ماذا أنجزت؟ ما الذي تفخر به؟' : 'What did you accomplish? What are you proud of?'}
                className="w-full rounded-xl p-3 text-sm resize-none"
                style={{ background: '#111', border: '1px solid #333', color: 'white', minHeight: 70 }}
                rows={3} />

              {/* Category selector */}
              <div className="flex gap-2 flex-wrap">
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <button key={key} onClick={() => setCategory(key)}
                    className="rounded-lg px-2 py-1 text-xs font-bold transition-all"
                    style={{
                      background: category === key ? `${cat.color}25` : '#111',
                      border: `1px solid ${category === key ? cat.color : '#333'}`,
                      color: category === key ? cat.color : '#666'
                    }}>
                    {cat.emoji} {isAr ? cat.ar : cat.en}
                  </button>
                ))}
              </div>

              {/* Emoji selector */}
              <div className="flex gap-2 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEmoji(e)}
                    className="w-8 h-8 rounded-lg text-base transition-all"
                    style={{ background: emoji === e ? 'rgba(201,168,76,0.2)' : '#111', border: `1px solid ${emoji === e ? '#c9a84c' : '#333'}` }}>
                    {e}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={handleAdd} className="btn-gold flex-1 text-sm py-2">
                  {isAr ? 'سجّل الانتصار' : 'Log Win'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-dark px-4 text-sm py-2">
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Win of the Day */}
        {winOfDay && (
          <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: '1px solid rgba(201,168,76,0.3)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#c9a84c' }}>
              ✦ {isAr ? 'انتصار اليوم المميز' : 'Win of the Day'}
            </p>
            <p className="text-lg mb-1">{winOfDay.emoji}</p>
            <p className="text-sm text-white font-medium">"{winOfDay.text}"</p>
            <span className="text-xs" style={{ color: CATEGORIES[winOfDay.category]?.color }}>
              {isAr ? CATEGORIES[winOfDay.category]?.ar : CATEGORIES[winOfDay.category]?.en}
            </span>
          </div>
        )}

        {/* Past 14 Days History */}
        {pastDays.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              {isAr ? '📅 آخر 14 يوم' : '📅 Last 14 Days'}
            </p>
            <div className="space-y-3">
              {pastDays.map(date => {
                const wins = dailyWins[date] || []
                if (wins.length === 0) return null
                const dateObj = new Date(date)
                const label = dateObj.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })
                return (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs" style={{ color: '#888' }}>{label}</span>
                      <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>({wins.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {wins.map(win => (
                        <div key={win.id} className="flex items-center gap-2 rounded-lg p-2"
                          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                          <span>{win.emoji}</span>
                          <span className="text-xs text-white flex-1">{win.text}</span>
                          <span className="text-xs" style={{ color: CATEGORIES[win.category]?.color }}>
                            {CATEGORIES[win.category]?.emoji}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
