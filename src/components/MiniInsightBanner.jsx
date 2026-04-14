/**
 * MiniInsightBanner — Compact one-line intelligence banner for Dashboard
 * Shows a single personalized insight sentence instead of the full TransformationPulse.
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import {
  calcMomentum,
  detectRootCause,
  calcTransformationScore,
} from '../utils/transformationEngine'

function generateInsight(state, isAr) {
  const rootCause      = detectRootCause(state)
  const momentum       = calcMomentum(state)
  const transformation = calcTransformationScore(state)

  // ── Priority A: Root Cause (if not thriving/exploring) ──
  if (rootCause.type !== 'thriving' && rootCause.type !== 'exploring') {
    return {
      emoji: rootCause.emoji,
      text: isAr
        ? `${rootCause.labelAr} — ${rootCause.descAr}`
        : `${rootCause.labelEn} — ${rootCause.descEn}`,
      color: rootCause.color,
      actionPath: rootCause.action || null,
      actionLabel: rootCause.action
        ? (isAr ? rootCause.actionAr : rootCause.actionEn)
        : null,
    }
  }

  // ── Priority B: Momentum status ──
  if (momentum.score >= 70 && momentum.trend === 'up') {
    return {
      emoji: '\u{1F680}',
      text: isAr
        ? '\u0632\u062E\u0645\u0643 \u0642\u0648\u064A \u2014 \u0623\u0646\u062A \u0641\u064A \u0648\u0636\u0639 \u0645\u0645\u062A\u0627\u0632!'
        : 'Momentum is strong \u2014 you\u2019re in an excellent position!',
      color: '#2ecc71',
      actionPath: null,
      actionLabel: null,
    }
  }
  if (momentum.score >= 70) {
    return {
      emoji: '\u{1F4AA}',
      text: isAr
        ? '\u0632\u062E\u0645 \u062B\u0627\u0628\u062A \u2014 \u062D\u0627\u0641\u0638 \u0639\u0644\u064A\u0647'
        : 'Steady momentum \u2014 maintain it',
      color: '#2ecc71',
      actionPath: null,
      actionLabel: null,
    }
  }
  if (momentum.score >= 40) {
    return {
      emoji: '\u26A1',
      text: isAr
        ? '\u0627\u0644\u0632\u062E\u0645 \u064A\u062A\u0637\u0648\u0631 \u2014 \u0643\u0644 \u064A\u0648\u0645 \u064A\u0628\u0646\u064A\u0647'
        : 'Momentum is building \u2014 every day strengthens it',
      color: '#f39c12',
      actionPath: null,
      actionLabel: null,
    }
  }
  if (momentum.score < 40) {
    return {
      emoji: '\u{1F50B}',
      text: isAr
        ? '\u0627\u0644\u0632\u062E\u0645 \u064A\u062D\u062A\u0627\u062C \u0627\u0647\u062A\u0645\u0627\u0645 \u2014 \u0627\u0628\u062F\u0623 \u0628\u0639\u0627\u062F\u0629 \u0648\u0627\u062D\u062F\u0629'
        : 'Momentum needs attention \u2014 start with one habit',
      color: '#e63946',
      actionPath: '/morning',
      actionLabel: isAr ? '\u0627\u0628\u062F\u0623 \u0627\u0644\u0622\u0646' : 'Start now',
    }
  }

  // ── Priority C: Transformation score — lowest breakdown area as focus ──
  const bd = transformation.breakdown
  const areaLabels = {
    discipline: { ar: '\u0627\u0644\u0627\u0646\u0636\u0628\u0627\u0637', en: 'Discipline' },
    state:      { ar: '\u0627\u0644\u062D\u0627\u0644\u0629',   en: 'State' },
    progress:   { ar: '\u0627\u0644\u062A\u0642\u062F\u0645',   en: 'Progress' },
    depth:      { ar: '\u0627\u0644\u0639\u0645\u0642',     en: 'Depth' },
  }
  const lowest = Object.entries(bd).sort((a, b) => a[1] - b[1])[0]
  const lowestKey = lowest[0]
  const lowestLabel = isAr ? areaLabels[lowestKey].ar : areaLabels[lowestKey].en

  return {
    emoji: '\u{1F3AF}',
    text: isAr
      ? `\u0627\u0644\u0623\u0636\u0639\u0641: ${lowestLabel} \u2014 \u0631\u0643\u0651\u0632 \u0639\u0644\u064A\u0647\u0627 \u0627\u0644\u064A\u0648\u0645`
      : `Focus area: ${lowestLabel} \u2014 work on it today`,
    color: transformation.color,
    actionPath: null,
    actionLabel: null,
  }
}


export default function MiniInsightBanner() {
  const { state } = useApp()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const insight = useMemo(() => generateInsight(state, isAr), [state, isAr])

  const handleTap = () => {
    if (insight.actionPath) navigate(insight.actionPath)
  }

  return (
    <div
      onClick={handleTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        direction: isAr ? 'rtl' : 'ltr',
        background: `${insight.color}08`,
        border: `1px solid ${insight.color}25`,
        borderRadius: 12,
        padding: '10px 14px',
        cursor: insight.actionPath ? 'pointer' : 'default',
      }}
    >
      {/* Emoji */}
      <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1 }}>
        {insight.emoji}
      </span>

      {/* Text */}
      <span style={{
        flex: 1,
        fontSize: 11,
        fontWeight: 700,
        color: '#ccc',
        lineHeight: 1.4,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {insight.text}
      </span>

      {/* Action pill */}
      {insight.actionLabel && (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(insight.actionPath) }}
          style={{
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 800,
            color: '#0a0a0a',
            background: insight.color,
            border: 'none',
            borderRadius: 99,
            padding: '4px 10px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {insight.actionLabel} {isAr ? '\u2190' : '\u2192'}
        </button>
      )}
    </div>
  )
}
