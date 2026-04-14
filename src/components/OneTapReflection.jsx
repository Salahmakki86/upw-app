/**
 * OneTapReflection — Post-ritual 2-second reflection
 * 5 emoji scale + optional quick note + auto-dismiss after 5s
 * Props: { ritualType, onSave, onDismiss }
 */
import { useState, useEffect, useRef } from 'react'
import { useLang } from '../context/LangContext'

const EMOJIS = ['😫', '😕', '🙂', '😊', '🤩']
const EMOJI_LABELS = {
  ar: ['صعب', 'عادي', 'جيد', 'رائع', 'استثنائي!'],
  en: ['Rough', 'Okay', 'Good', 'Great', 'Amazing!'],
}

const LABELS = {
  morning:   { ar: 'كيف كانت هذه التجربة؟', en: 'How was this experience?' },
  evening:   { ar: 'كيف كانت هذه التجربة؟', en: 'How was this experience?' },
  gratitude: { ar: 'كيف كانت هذه التجربة؟', en: 'How was this experience?' },
  habits:    { ar: 'كيف كانت هذه التجربة؟', en: 'How was this experience?' },
  state:     { ar: 'كيف كانت هذه التجربة؟', en: 'How was this experience?' },
}

export default function OneTapReflection({ ritualType = 'morning', onSave, onDismiss }) {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const [rating, setRating] = useState(null)
  const [note, setNote] = useState('')
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const timerRef = useRef(null)
  const interacted = useRef(false)

  const label = LABELS[ritualType] || LABELS.morning

  // Slide in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Auto-dismiss countdown (5s) — pauses on interaction
  useEffect(() => {
    if (interacted.current) return
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          slideOut(() => onDismiss?.())
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const pauseCountdown = () => {
    if (!interacted.current) {
      interacted.current = true
      clearInterval(timerRef.current)
      setCountdown(0) // hide progress bar
    }
  }

  const slideOut = (cb) => {
    setExiting(true)
    setTimeout(() => cb?.(), 300)
  }

  const handleEmojiTap = (index) => {
    pauseCountdown()
    setRating(index)
  }

  const handleSave = () => {
    const ratingValue = rating !== null ? rating + 1 : null // 1-5 scale
    slideOut(() => onSave?.(ratingValue, note.trim() || null))
  }

  return (
    <div
      style={{
        transform: visible && !exiting ? 'translateY(0)' : 'translateY(40px)',
        opacity: visible && !exiting ? 1 : 0,
        transition: 'all 300ms ease',
        background: '#151515',
        border: '1px solid #222',
        borderRadius: 16,
        padding: '16px 14px 12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Question text */}
      <p style={{
        color: '#888',
        fontSize: 12,
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: 12,
      }}>
        {isAr ? label.ar : label.en}
      </p>

      {/* 5 Emoji buttons in a row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
        {EMOJIS.map((emoji, i) => (
          <button
            key={i}
            onClick={() => handleEmojiTap(i)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: rating === i ? '2px solid #c9a84c' : '2px solid transparent',
              background: rating === i ? 'rgba(201,168,76,0.12)' : '#0e0e0e',
              boxShadow: rating === i ? '0 0 8px rgba(201,168,76,0.3)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: rating === i ? 'scale(1.2)' : 'scale(1)',
              padding: 0,
              outline: 'none',
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Rating label */}
      {rating !== null && (
        <p style={{
          color: '#c9a84c',
          fontSize: 11,
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: 8,
          transition: 'all 0.2s',
        }}>
          {EMOJI_LABELS[isAr ? 'ar' : 'en'][rating]}
        </p>
      )}

      {/* Optional one-line text input — appears after emoji selection */}
      {rating !== null && (
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={isAr ? 'خاطرة سريعة...' : 'Quick thought...'}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid #2a2a2a',
            background: '#0e0e0e',
            color: '#fff',
            fontSize: 12,
            marginBottom: 10,
            outline: 'none',
            boxSizing: 'border-box',
          }}
          autoFocus
        />
      )}

      {/* Save button — compact */}
      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: 12,
          fontWeight: 800,
          fontSize: 12,
          background: rating !== null
            ? 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)'
            : '#1a1a1a',
          color: rating !== null ? '#0a0a0a' : '#555',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
      >
        {rating !== null
          ? (isAr ? 'حفظ' : 'Save')
          : (isAr ? 'تخطي' : 'Skip')}
      </button>

      {/* Auto-dismiss countdown progress bar */}
      {countdown > 0 && !interacted.current && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: '#1a1a1a',
        }}>
          <div style={{
            height: '100%',
            background: 'rgba(201,168,76,0.4)',
            width: `${(countdown / 5) * 100}%`,
            transition: 'width 1s linear',
            borderRadius: '0 2px 2px 0',
          }} />
        </div>
      )}
    </div>
  )
}
