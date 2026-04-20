/**
 * EmotionalHomePage — TR4 Emotional Home
 *
 * Tony Robbins: "Your emotional home is where you live most of the time —
 * the feeling you return to when nothing is demanding a specific state."
 *
 * Weekly tracker:
 *   • Pick a TARGET emotional home (joy, gratitude, confidence, peace, love)
 *   • Rate the top 3 emotions you lived this week
 *   • See 8-week trend
 */
import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

function weekKey(date = new Date()) {
  // ISO-ish week key: yyyy-Wxx
  const d = new Date(date.getTime())
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

const EMOTIONS = [
  { id: 'joy',        emoji: '😊', ar: 'فرح',     en: 'Joy' },
  { id: 'gratitude',  emoji: '🙏', ar: 'امتنان',   en: 'Gratitude' },
  { id: 'confidence', emoji: '💪', ar: 'ثقة',     en: 'Confidence' },
  { id: 'peace',      emoji: '🕊', ar: 'سلام',    en: 'Peace' },
  { id: 'love',       emoji: '❤️', ar: 'حب',     en: 'Love' },
  { id: 'passion',    emoji: '🔥', ar: 'شغف',     en: 'Passion' },
  { id: 'curiosity',  emoji: '🧠', ar: 'فضول',    en: 'Curiosity' },
  { id: 'fear',       emoji: '😨', ar: 'خوف',     en: 'Fear' },
  { id: 'anger',      emoji: '😠', ar: 'غضب',     en: 'Anger' },
  { id: 'sadness',    emoji: '😔', ar: 'حزن',     en: 'Sadness' },
  { id: 'anxiety',    emoji: '😰', ar: 'قلق',     en: 'Anxiety' },
  { id: 'shame',      emoji: '😳', ar: 'خجل',     en: 'Shame' },
]

export default function EmotionalHomePage() {
  const { state, updateEmotionalHomeWeek } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const thisWeek = weekKey()
  const log = state.emotionalHomeLog || {}
  const week = log[thisWeek] || {}

  const [target, setTarget] = useState(week.target || '')
  const [actual, setActual] = useState(week.actual || [])

  const toggleActual = (id) => {
    setActual(cur => {
      if (cur.includes(id)) return cur.filter(x => x !== id)
      if (cur.length >= 3) return [...cur.slice(1), id]
      return [...cur, id]
    })
  }

  const save = () => {
    if (!target) {
      showToast(isAr ? 'اختر هدفك أولاً' : 'Pick your target first', 'error', 1500)
      return
    }
    updateEmotionalHomeWeek(thisWeek, { target, actual, savedAt: new Date().toISOString() })
    showToast(isAr ? 'تم حفظ أسبوعك ✓' : 'Week saved ✓', 'success', 1500)
  }

  // 8-week history
  const history = useMemo(() => {
    const weeks = []
    for (let i = 0; i < 8; i++) {
      const d = new Date(); d.setDate(d.getDate() - i * 7)
      weeks.unshift(weekKey(d))
    }
    return weeks.map(w => ({ week: w, entry: log[w] }))
  }, [log])

  return (
    <Layout
      title={isAr ? '🏠 البيت العاطفي' : '🏠 Emotional Home'}
      subtitle={isAr ? 'ما الشعور الذي تعود إليه دائماً؟' : 'Which feeling do you always return to?'}
    >
      <div className="space-y-4 pt-2">

        {/* Intro */}
        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.08), transparent)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}>
          <p style={{ fontSize: 12, color: '#ddd', lineHeight: 1.6 }}>
            {isAr
              ? 'البيت العاطفي هو الشعور الذي تعيش فيه أغلب وقتك — المكان الذي تعود إليه عندما لا يطلب منك الوضع شعوراً معيناً.'
              : 'Your emotional home is the feeling you live in most of the time — the place you return to when nothing demands a specific state.'}
          </p>
          <p style={{ fontSize: 10, color: '#c9a84c', marginTop: 6, textAlign: 'end' }}>— Tony Robbins</p>
        </div>

        {/* Target */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c', marginBottom: 10, letterSpacing: '0.05em' }}>
            {isAr ? '🎯 بيتي العاطفي المستهدف' : '🎯 My Target Emotional Home'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {EMOTIONS.slice(0, 6).map(e => (
              <button
                key={e.id}
                onClick={() => setTarget(e.id)}
                className="rounded-xl p-2 text-center transition-all"
                style={{
                  background: target === e.id ? 'rgba(46,204,113,0.15)' : '#141414',
                  border: `1px solid ${target === e.id ? 'rgba(46,204,113,0.4)' : '#222'}`,
                }}
              >
                <div style={{ fontSize: 22 }}>{e.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: target === e.id ? '#2ecc71' : '#aaa', marginTop: 2 }}>
                  {isAr ? e.ar : e.en}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actual */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c', marginBottom: 4, letterSpacing: '0.05em' }}>
            {isAr ? '📊 أكثر 3 مشاعر عشتها هذا الأسبوع' : '📊 Top 3 emotions you lived this week'}
          </p>
          <p style={{ fontSize: 10, color: '#888', marginBottom: 10 }}>
            {isAr ? 'كن صادقاً — بدون حكم' : 'Be honest — no judgment'} ({actual.length}/3)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {EMOTIONS.map(e => {
              const isSel = actual.includes(e.id)
              return (
                <button
                  key={e.id}
                  onClick={() => toggleActual(e.id)}
                  className="rounded-xl p-2 text-center transition-all"
                  style={{
                    background: isSel ? 'rgba(201,168,76,0.15)' : '#141414',
                    border: `1px solid ${isSel ? 'rgba(201,168,76,0.4)' : '#222'}`,
                    opacity: !isSel && actual.length >= 3 ? 0.5 : 1,
                  }}
                >
                  <div style={{ fontSize: 20 }}>{e.emoji}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: isSel ? '#c9a84c' : '#888', marginTop: 2 }}>
                    {isAr ? e.ar : e.en}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={save}
          className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #c9a84c, #e5c670)',
            color: '#000',
          }}
        >
          {isAr ? 'احفظ أسبوعي' : 'Save This Week'}
        </button>

        {/* 8-week history */}
        {history.some(h => h.entry) && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 10, letterSpacing: '0.05em' }}>
              {isAr ? '📅 آخر 8 أسابيع' : '📅 Last 8 weeks'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map(h => {
                if (!h.entry) return (
                  <div key={h.week} style={{ fontSize: 10, color: '#555' }}>
                    {h.week} — {isAr ? 'لم يُسجّل' : 'not logged'}
                  </div>
                )
                const tgt = EMOTIONS.find(e => e.id === h.entry.target)
                const act = (h.entry.actual || []).map(id => EMOTIONS.find(e => e.id === id)).filter(Boolean)
                const match = tgt && act.some(a => a.id === tgt.id)
                return (
                  <div key={h.week} style={{
                    padding: '8px 10px', borderRadius: 8,
                    background: '#141414', border: '1px solid #222',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
                      <span style={{ color: '#666', width: 60 }}>{h.week}</span>
                      {tgt && (
                        <span style={{ color: '#c9a84c' }}>🎯 {tgt.emoji}</span>
                      )}
                      <span style={{ color: '#666' }}>→</span>
                      <span style={{ color: '#ddd' }}>
                        {act.map(a => a.emoji).join(' ')}
                      </span>
                      {match && (
                        <span style={{ marginInlineStart: 'auto', fontSize: 10, color: '#2ecc71' }}>✓</span>
                      )}
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
