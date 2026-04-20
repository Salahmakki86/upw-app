/**
 * BootstrapInsightCard — M4 Cold-Start Insights
 *
 * Renders the top-priority heuristic insight from bootstrapInsights.js
 * when the user is in their first 7-21 days (before the real insight engine
 * has enough data).
 *
 * Lists 1-3 relevant insights, one action-per-card CTA.
 * User can dismiss (marks insightId in bootstrapInsightsSeen for 14 days).
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { generateBootstrapInsights, getBootstrapPhase } from '../utils/bootstrapInsights'

export default function BootstrapInsightCard({ limit = 2 }) {
  const { state, markBootstrapInsightSeen } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const phase = getBootstrapPhase(state)

  const insights = useMemo(() => {
    if (phase === 'normal') return []
    return generateBootstrapInsights(state, isAr).slice(0, limit)
  }, [state, isAr, limit, phase])

  if (insights.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {insights.map(ins => (
        <InsightItem key={ins.id} insight={ins} isAr={isAr}
          onDismiss={() => markBootstrapInsightSeen(ins.id)} />
      ))}
    </div>
  )
}

function InsightItem({ insight, isAr, onDismiss }) {
  return (
    <div
      className="rounded-2xl"
      style={{
        padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.01))',
        border: '1px solid rgba(201,168,76,0.25)',
        position: 'relative',
      }}
    >
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        aria-label={isAr ? 'إغلاق' : 'Dismiss'}
        style={{
          position: 'absolute', top: 6, insetInlineEnd: 8,
          background: 'transparent', border: 'none', color: '#666',
          fontSize: 14, cursor: 'pointer', lineHeight: 1,
        }}
      >×</button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 24, lineHeight: 1 }}>{insight.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: 12, fontWeight: 900, color: '#c9a84c', marginBottom: 4 }}>
            {isAr ? insight.titleAr : insight.titleEn}
          </h4>
          <p style={{ fontSize: 11, color: '#ccc', lineHeight: 1.5, marginBottom: 10 }}>
            {isAr ? insight.bodyAr : insight.bodyEn}
          </p>
          {insight.ctaPath && (
            <Link
              to={insight.ctaPath}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-[0.97]"
              style={{
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#c9a84c', textDecoration: 'none',
              }}
            >
              {isAr ? insight.ctaAr : insight.ctaEn}
              <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
