/**
 * Fix #4 — Accountability System
 * Weekly commitment + daily follow-through tracking.
 * Shows on TodayPage to keep the user honest about their promises.
 */
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

function getWeekKey() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

export default function AccountabilityCard() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const [input, setInput] = useState('')
  const [showSet, setShowSet] = useState(false)

  const weekKey = getWeekKey()
  const today = todayKey()
  const accountability = state.accountability || {}
  const currentWeek = accountability[weekKey] || null

  // Check if commitment exists for this week
  if (!currentWeek && !showSet) {
    return (
      <div
        style={{
          borderRadius: 16,
          padding: '14px 16px',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 800, color: '#c9a84c', marginBottom: 6 }}>
          🤝 {isAr ? 'التزام الأسبوع' : 'Weekly Commitment'}
        </p>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 10, lineHeight: 1.5 }}>
          {isAr
            ? 'ما الشيء الواحد الذي تلتزم بتحقيقه هذا الأسبوع؟ اكتبه هنا وسيتابعك التطبيق يومياً.'
            : 'What ONE thing do you commit to achieving this week? Write it here and the app will hold you accountable daily.'}
        </p>
        <button
          onClick={() => setShowSet(true)}
          className="active:scale-95 transition-all"
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #c9a84c, #e8c96e)',
            color: '#090909',
            fontSize: 13,
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isAr ? 'حدد التزامك ✍️' : 'Set Your Commitment ✍️'}
        </button>
      </div>
    )
  }

  // Set commitment form
  if (showSet && !currentWeek) {
    return (
      <div
        style={{
          borderRadius: 16,
          padding: '14px 16px',
          background: '#0e0e0e',
          border: '1px solid rgba(201,168,76,0.3)',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 800, color: '#c9a84c', marginBottom: 8 }}>
          🤝 {isAr ? 'ما التزامك هذا الأسبوع؟' : 'What\'s your commitment this week?'}
        </p>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isAr ? 'مثال: أكمل الروتين الصباحي ٥ أيام' : 'e.g., Complete morning ritual 5 days'}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            background: '#111',
            border: '1px solid #333',
            color: '#fff',
            fontSize: 13,
            outline: 'none',
            marginBottom: 8,
            textAlign: isAr ? 'right' : 'left',
          }}
          dir={isAr ? 'rtl' : 'ltr'}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowSet(false)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 10,
              background: '#1a1a1a',
              border: '1px solid #333',
              color: '#888',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={() => {
              if (!input.trim()) return
              const newData = {
                ...accountability,
                [weekKey]: {
                  commitment: input.trim(),
                  setAt: new Date().toISOString(),
                  checkins: {},
                },
              }
              update('accountability', newData)
              setInput('')
              setShowSet(false)
            }}
            className="active:scale-95"
            style={{
              flex: 2,
              padding: '8px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #c9a84c, #e8c96e)',
              color: '#090909',
              fontSize: 12,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isAr ? 'التزم! 🔥' : 'Commit! 🔥'}
          </button>
        </div>
      </div>
    )
  }

  // Show current commitment + daily check-in
  const checkins = currentWeek?.checkins || {}
  const todayChecked = checkins[today]
  const totalCheckins = Object.keys(checkins).length
  const positiveCheckins = Object.values(checkins).filter(Boolean).length
  const followThrough = totalCheckins > 0 ? Math.round((positiveCheckins / totalCheckins) * 100) : 0

  const handleCheckin = (didIt) => {
    const newData = {
      ...accountability,
      [weekKey]: {
        ...currentWeek,
        checkins: { ...checkins, [today]: didIt },
      },
    }
    update('accountability', newData)
  }

  return (
    <div
      style={{
        borderRadius: 16,
        padding: '14px 16px',
        background: todayChecked === true
          ? 'rgba(46,204,113,0.05)'
          : todayChecked === false
            ? 'rgba(231,76,60,0.05)'
            : '#0e0e0e',
        border: `1px solid ${
          todayChecked === true
            ? 'rgba(46,204,113,0.3)'
            : todayChecked === false
              ? 'rgba(231,76,60,0.3)'
              : 'rgba(201,168,76,0.2)'
        }`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#c9a84c' }}>
          🤝 {isAr ? 'التزامك' : 'Your Commitment'}
        </p>
        {totalCheckins > 0 && (
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            color: followThrough >= 70 ? '#2ecc71' : followThrough >= 40 ? '#f39c12' : '#e63946',
            background: followThrough >= 70 ? 'rgba(46,204,113,0.12)' : followThrough >= 40 ? 'rgba(243,156,18,0.12)' : 'rgba(230,57,70,0.12)',
            padding: '2px 8px',
            borderRadius: 99,
          }}>
            {followThrough}% {isAr ? 'التزام' : 'follow-through'}
          </span>
        )}
      </div>

      {/* Commitment text */}
      <p style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#ddd',
        lineHeight: 1.5,
        marginBottom: 10,
        padding: '6px 10px',
        borderRadius: 8,
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.1)',
      }}>
        "{currentWeek.commitment}"
      </p>

      {/* Daily check-in */}
      {todayChecked === undefined ? (
        <>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
            {isAr ? 'هل عملت على التزامك اليوم؟' : 'Did you work on your commitment today?'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleCheckin(true)}
              className="active:scale-95"
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 10,
                background: 'rgba(46,204,113,0.1)',
                border: '1px solid rgba(46,204,113,0.3)',
                color: '#2ecc71',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isAr ? 'نعم! ✅' : 'Yes! ✅'}
            </button>
            <button
              onClick={() => handleCheckin(false)}
              className="active:scale-95"
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 10,
                background: 'rgba(231,76,60,0.1)',
                border: '1px solid rgba(231,76,60,0.3)',
                color: '#e63946',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isAr ? 'لا بعد 😔' : 'Not yet 😔'}
            </button>
          </div>
        </>
      ) : (
        <div style={{
          padding: '6px 10px',
          borderRadius: 8,
          background: todayChecked ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: todayChecked ? '#2ecc71' : '#e63946' }}>
            {todayChecked
              ? (isAr ? '✅ ممتاز! أنت تبني هوية جديدة' : '✅ Excellent! You\'re building a new identity')
              : (isAr ? '💪 لا بأس — غداً فرصة جديدة. لا تكسر السلسلة!' : '💪 It\'s OK — tomorrow is a new chance. Don\'t break the chain!')}
          </span>
        </div>
      )}

      {/* Week dots */}
      {totalCheckins > 0 && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 10 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - d.getDay() + i)
            const key = d.toISOString().split('T')[0]
            const val = checkins[key]
            return (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: val === true ? '#2ecc71' : val === false ? '#e63946' : '#333',
                  border: key === today ? '2px solid #c9a84c' : '1px solid transparent',
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
