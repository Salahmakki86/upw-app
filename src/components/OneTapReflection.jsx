/**
 * OneTapReflection — Batch 1 (20 Mistakes Fix)
 * Quick 1-5 star rating + optional note after ritual completion.
 * Takes ~2 seconds. Captures micro-feedback the intelligence system can use.
 * Principle: "Heavy input, low return" → make input light, return high.
 */
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

const RATING_EMOJIS = ['😞', '😐', '🙂', '😊', '🤩']

export default function OneTapReflection({ type, onDone }) {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const [rating, setRating] = useState(null)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)

  const save = () => {
    if (rating === null) { onDone(); return }

    const today = new Date().toISOString().split('T')[0]
    const existing = state.ritualReflections || {}
    const todayReflections = existing[today] || {}

    update('ritualReflections', {
      ...existing,
      [today]: {
        ...todayReflections,
        [type]: {
          rating: rating + 1, // 1-5
          note: note.trim() || null,
          ts: Date.now(),
        },
      },
    })
    onDone()
  }

  const LABELS = {
    morning: { ar: 'كيف كان الطقس الصباحي؟', en: 'How was your morning ritual?' },
    evening: { ar: 'كيف كان يومك بشكل عام؟', en: 'How was your day overall?' },
  }

  const label = LABELS[type] || LABELS.morning

  return (
    <div style={{
      background: '#111',
      border: '1px solid #222',
      borderRadius: 20,
      padding: '20px 16px',
      marginBottom: 16,
      textAlign: 'center',
    }}>
      <p style={{ color: '#888', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
        {isAr ? label.ar : label.en}
      </p>

      {/* Emoji rating row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
        {RATING_EMOJIS.map((emoji, i) => (
          <button
            key={i}
            onClick={() => setRating(i)}
            style={{
              width: 48, height: 48,
              borderRadius: 14,
              fontSize: 24,
              border: `2px solid ${rating === i ? '#c9a84c' : '#222'}`,
              background: rating === i ? 'rgba(201,168,76,0.12)' : '#0e0e0e',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: rating === i ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Rating label */}
      {rating !== null && (
        <p style={{
          color: '#c9a84c', fontSize: 11, fontWeight: 800,
          marginBottom: 10, transition: 'all 0.2s',
        }}>
          {[
            isAr ? 'ضعيف' : 'Rough',
            isAr ? 'عادي' : 'Okay',
            isAr ? 'جيد' : 'Good',
            isAr ? 'رائع' : 'Great',
            isAr ? 'استثنائي!' : 'Amazing!',
          ][rating]}
        </p>
      )}

      {/* Optional note toggle */}
      {rating !== null && !showNote && (
        <button
          onClick={() => setShowNote(true)}
          style={{
            background: 'none', border: 'none',
            color: '#555', fontSize: 11, cursor: 'pointer',
            marginBottom: 8,
          }}
        >
          + {isAr ? 'أضف ملاحظة سريعة' : 'Add a quick note'}
        </button>
      )}

      {/* Note input */}
      {showNote && (
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={isAr ? 'ملاحظة سريعة...' : 'Quick note...'}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #2a2a2a',
            background: '#0e0e0e',
            color: '#fff',
            fontSize: 13,
            marginBottom: 8,
            outline: 'none',
          }}
          autoFocus
        />
      )}

      {/* Continue button */}
      <button
        onClick={save}
        style={{
          width: '100%',
          padding: '12px 20px',
          borderRadius: 14,
          fontWeight: 800,
          fontSize: 13,
          background: rating !== null
            ? 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)'
            : '#1a1a1a',
          color: rating !== null ? '#0a0a0a' : '#555',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s',
          marginTop: 4,
        }}
      >
        {rating !== null
          ? (isAr ? 'تم ✓' : 'Done ✓')
          : (isAr ? 'تخطي ←' : 'Skip →')}
      </button>
    </div>
  )
}
