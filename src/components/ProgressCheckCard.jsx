/**
 * ProgressCheckCard — Shows progress results when a previous insight's
 * check period has elapsed.
 *
 * Props:
 *   result    — { id, improved, baseline, current, diff, text, emoji }
 *   onDismiss — called with result.id to mark as completed
 *   onAdjust  — called with result.id when user wants to adjust approach
 */
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

export default function ProgressCheckCard({ result, onDismiss, onAdjust }) {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const [dismissed, setDismissed] = useState(false)

  if (!result || dismissed) return null

  const improved = result.improved
  const accent = improved ? '#2ecc71' : '#f39c12'

  const handleDismiss = () => {
    // Mark as completed in insightActionsLog
    const log = state.insightActionsLog || {}
    if (log[result.id]) {
      update('insightActionsLog', {
        ...log,
        [result.id]: { ...log[result.id], completed: true, completedAt: Date.now() },
      })
    }
    setDismissed(true)
    if (onDismiss) onDismiss(result.id)
  }

  const handleAdjust = () => {
    if (onAdjust) onAdjust(result.id)
  }

  return (
    <div style={{
      background: '#111',
      border: `1px solid ${accent}35`,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 14,
      direction: isAr ? 'rtl' : 'ltr',
      position: 'relative',
      animation: 'progressFadeIn 0.4s ease',
    }}>
      {/* Accent top border */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${accent}, ${accent}55)`,
      }} />

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            {/* Icon badge */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${accent}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}>
              {result.emoji}
            </div>

            <div>
              <p style={{
                color: accent,
                fontSize: 12,
                fontWeight: 800,
                margin: 0,
              }}>
                {improved
                  ? (isAr ? 'تحسن!' : 'Improved!')
                  : (isAr ? 'يحتاج انتباه' : 'Needs attention')}
              </p>
              <p style={{
                color: '#555',
                fontSize: 10,
                margin: '2px 0 0 0',
              }}>
                {isAr ? 'مراجعة التقدم' : 'Progress review'}
              </p>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#444',
              fontSize: 11,
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            {isAr ? 'إغلاق' : 'Dismiss'}
          </button>
        </div>

        {/* Result text */}
        <p style={{
          color: '#ddd',
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.6,
          margin: '0 0 10px 0',
        }}>
          {result.text}
        </p>

        {/* Metrics comparison bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#0e0e0e',
          borderRadius: 10,
          padding: '8px 12px',
          marginBottom: improved ? 0 : 10,
        }}>
          {/* Baseline */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ color: '#555', fontSize: 9, fontWeight: 700, margin: 0 }}>
              {isAr ? 'قبل' : 'Before'}
            </p>
            <p style={{ color: '#888', fontSize: 16, fontWeight: 800, margin: '2px 0 0 0' }}>
              {typeof result.baseline === 'number' ? Math.round(result.baseline) : result.baseline}
            </p>
          </div>

          {/* Arrow */}
          <span style={{
            fontSize: 16,
            color: accent,
          }}>
            {improved ? '→' : '→'}
          </span>

          {/* Current */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ color: '#555', fontSize: 9, fontWeight: 700, margin: 0 }}>
              {isAr ? 'الآن' : 'Now'}
            </p>
            <p style={{ color: accent, fontSize: 16, fontWeight: 800, margin: '2px 0 0 0' }}>
              {typeof result.current === 'number' ? Math.round(result.current) : result.current}
            </p>
          </div>

          {/* Diff badge */}
          <div style={{
            background: `${accent}20`,
            borderRadius: 99,
            padding: '3px 10px',
          }}>
            <span style={{
              color: accent,
              fontSize: 11,
              fontWeight: 800,
            }}>
              {result.diff > 0 ? '+' : ''}{typeof result.diff === 'number' ? Math.round(result.diff) : result.diff}
            </span>
          </div>
        </div>

        {/* Adjust button (only when not improved) */}
        {!improved && (
          <button
            onClick={handleAdjust}
            style={{
              width: '100%',
              background: `${accent}15`,
              border: `1px solid ${accent}30`,
              borderRadius: 12,
              padding: '10px 14px',
              color: accent,
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isAr ? 'تعديل المسار' : 'Adjust approach'}
          </button>
        )}

        {/* Confetti-like accent for improved cards */}
        {improved && (
          <div style={{
            position: 'absolute',
            top: 8,
            [isAr ? 'left' : 'right']: 12,
            fontSize: 10,
            opacity: 0.5,
            pointerEvents: 'none',
            letterSpacing: 2,
          }}>
            {'✨🎉✨'}
          </div>
        )}
      </div>

      {/* Inline animation */}
      <style>{`
        @keyframes progressFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
