/**
 * ActionableInsightCard — Renders one actionable insight with the full pipeline:
 * Data bar → Insight → Decision → Action logging
 *
 * Props: { insight, onAction }
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

const TYPE_COLORS = {
  sleep:    '#c9a84c',  // gold
  goal:     '#e63946',  // red
  identity: '#9b59b6',  // purple
  pattern:  '#3498db',  // blue
  state:    '#2ecc71',  // green
}

export default function ActionableInsightCard({ insight, onAction }) {
  const { update, state } = useApp()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const [picked, setPicked] = useState(null)
  const [visible, setVisible] = useState(true)

  if (!insight || !visible) return null

  const accent = TYPE_COLORS[insight.type] || '#c9a84c'

  const handleOption = (option, idx) => {
    setPicked(idx)

    // Save state if option has stateKey
    if (option.stateKey) {
      update(option.stateKey, option.stateValue)
    }

    // Log the action to insightActionsLog for progress tracking
    const log = state.insightActionsLog || {}
    update('insightActionsLog', {
      ...log,
      [insight.id]: {
        action: option.action,
        optionIndex: idx,
        timestamp: Date.now(),
        ...(insight.progress || {}),
      },
    })

    // Notify parent
    if (onAction) onAction(insight.id, idx)

    // Navigate if option has route
    if (option.route) {
      setTimeout(() => {
        navigate(option.route)
      }, 400)
    }
  }

  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 14,
        direction: isAr ? 'rtl' : 'ltr',
        position: 'relative',
        animation: 'insightFadeIn 0.4s ease',
      }}
    >
      {/* Accent border (left for LTR, right for RTL) */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [isAr ? 'right' : 'left']: 0,
        width: 3,
        background: accent,
        borderRadius: isAr ? '0 16px 16px 0' : '16px 0 0 16px',
      }} />

      {/* Data bar — subtle top section */}
      <div style={{
        padding: '8px 16px',
        background: `${accent}08`,
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          opacity: 0.8,
        }}>
          {insight.data?.metric}
        </span>
        <span style={{
          fontSize: 10,
          fontWeight: 800,
          color: '#aaa',
        }}>
          {insight.data?.value}
        </span>
      </div>

      {/* Insight section */}
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}>
          <span style={{
            fontSize: 20,
            lineHeight: 1,
            flexShrink: 0,
            marginTop: 1,
          }}>
            {insight.insight?.emoji}
          </span>
          <p style={{
            color: '#ddd',
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.6,
            flex: 1,
            margin: 0,
          }}>
            {insight.insight?.text}
          </p>
        </div>
      </div>

      {/* Decision section */}
      <div style={{ padding: '6px 16px 14px' }}>
        {/* Question */}
        <p style={{
          color: '#888',
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 8,
          margin: '0 0 8px 0',
        }}>
          {insight.decision?.question}
        </p>

        {/* Options */}
        {picked === null ? (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}>
            {(insight.decision?.options || []).map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOption(opt, idx)}
                style={{
                  background: `${accent}15`,
                  border: `1px solid ${accent}35`,
                  borderRadius: 99,
                  padding: '6px 14px',
                  color: '#ccc',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{
            background: `${accent}12`,
            border: `1px solid ${accent}30`,
            borderRadius: 12,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>
              {insight.decision?.options?.[picked]?.route ? '🚀' : '✅'}
            </span>
            <span style={{
              color: accent,
              fontSize: 11,
              fontWeight: 800,
            }}>
              {isAr
                ? (insight.decision?.options?.[picked]?.route ? 'جاري التوجيه...' : 'تم!')
                : (insight.decision?.options?.[picked]?.route ? 'Redirecting...' : 'Done!')}
            </span>
          </div>
        )}
      </div>

      {/* Inline style for animation */}
      <style>{`
        @keyframes insightFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
