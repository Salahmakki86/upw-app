/**
 * TransformationPulse — Intelligence Dashboard Component
 * Shows: Transformation Score + Momentum + Root Cause + State Recipe
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import {
  calcMomentum,
  calcStateRecipe,
  detectRootCause,
  calcTransformationScore,
} from '../utils/transformationEngine'

// ── Score Ring ──────────────────────────────────────────────────
function ScoreRing({ score, color, size = 80 }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a1a1a" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color, fontSize: size * 0.25, fontWeight: 900, lineHeight: 1 }}>{score}</span>
      </div>
    </div>
  )
}

// ── Trend Arrow ─────────────────────────────────────────────────
function TrendArrow({ trend, isAr }) {
  const config = {
    up:     { arrow: '↑', color: '#2ecc71', ar: 'صاعد',  en: 'Rising' },
    down:   { arrow: '↓', color: '#e63946', ar: 'هابط',  en: 'Declining' },
    stable: { arrow: '→', color: '#f39c12', ar: 'مستقر', en: 'Stable' },
  }
  const c = config[trend] || config.stable
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, color: c.color,
      background: `${c.color}15`, border: `1px solid ${c.color}30`,
      borderRadius: 99, padding: '2px 8px',
      display: 'inline-flex', alignItems: 'center', gap: 3,
    }}>
      {c.arrow} {isAr ? c.ar : c.en}
    </span>
  )
}

// ── Breakdown Bar ───────────────────────────────────────────────
function BreakdownBar({ label, value, color, tip }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#666', width: 42, textAlign: 'right', flexShrink: 0 }}>
          {label}
        </span>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#1a1a1a' }}>
          <div style={{
            height: '100%', borderRadius: 3, width: `${value}%`,
            background: color, transition: 'width 0.6s ease',
          }} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color, width: 24, textAlign: 'left', flexShrink: 0 }}>
          {value}
        </span>
      </div>
      {tip && (
        <p style={{ fontSize: 8, fontWeight: 600, color: value >= 40 ? '#2ecc71' : '#888', margin: '1px 0 0 50px', lineHeight: 1.3 }}>
          {tip}
        </p>
      )}
    </div>
  )
}


// ── Score Interpretation ────────────────────────────────────────
function getScoreInterpretation(score, breakdown, rootCause, isAr) {
  // Find lowest pillar for 60-79 range
  const pillars = [
    { key: 'discipline', value: breakdown.discipline, ar: 'الانضباط', en: 'discipline' },
    { key: 'state', value: breakdown.state, ar: 'الحالة', en: 'state' },
    { key: 'progress', value: breakdown.progress, ar: 'التقدم', en: 'progress' },
    { key: 'depth', value: breakdown.depth, ar: 'العمق', en: 'depth' },
  ]
  const lowest = pillars.reduce((min, p) => p.value < min.value ? p : min, pillars[0])

  if (score >= 80) {
    return isAr ? 'أنت في حالة استثنائية — واصل!' : "You're in exceptional form — keep going!"
  }
  if (score >= 60) {
    return isAr
      ? `تقدم قوي — ركّز على ${lowest.ar}`
      : `Strong progress — focus on ${lowest.en}`
  }
  if (score >= 40) {
    const action = rootCause.actionAr
      ? (isAr ? rootCause.actionAr : rootCause.actionEn)
      : (isAr ? 'الأساسيات' : 'the basics')
    return isAr
      ? `أنت تبني الأساس — ${action}`
      : `You're building the foundation — ${action}`
  }
  // < 40
  const highImpact = pillars.reduce((max, p) => p.value > max.value ? p : max, pillars[0])
  return isAr
    ? `الرحلة تبدأ بخطوة — ابدأ بـ${highImpact.ar}`
    : `The journey starts with one step — start with ${highImpact.en}`
}

// ── Pillar Tips ─────────────────────────────────────────────────
function getPillarTip(pillar, value, isAr) {
  if (value >= 40) return isAr ? '✓ جيد' : '✓ Good'
  const tips = {
    discipline: { ar: 'أكمل الصباح 3 أيام متتالية', en: 'Complete 3 consecutive mornings' },
    state:      { ar: 'سجّل حالتك يومياً',         en: 'Log your state daily' },
    progress:   { ar: 'حدّث هدفاً واحداً هذا الأسبوع', en: 'Update one goal this week' },
    depth:      { ar: 'اكتب التزامك أو قيمك',      en: 'Write your commitment or values' },
  }
  return isAr ? tips[pillar]?.ar : tips[pillar]?.en
}

// ── Root Cause → Fix Route ──────────────────────────────────────
function getFixRoute(rootCauseType) {
  const map = {
    energy: '/sleep', clarity: '/goals', fear: '/beliefs',
    discipline: '/morning', standards: '/morning',
    identity: '/beliefs', scatter: '/goals', meaning: '/six-needs',
  }
  return map[rootCauseType] || null
}

export default function TransformationPulse() {
  const { state } = useApp()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const transformation = useMemo(() => calcTransformationScore(state), [state])
  const momentum       = useMemo(() => calcMomentum(state), [state])
  const rootCause      = useMemo(() => detectRootCause(state), [state])
  const recipe         = useMemo(() => calcStateRecipe(state), [state])

  const levelLabels = {
    exceptional: { ar: 'استثنائي', en: 'Exceptional' },
    strong:      { ar: 'قوي',     en: 'Strong' },
    building:    { ar: 'يتطور',   en: 'Building' },
    starting:    { ar: 'يبدأ',    en: 'Starting' },
    beginning:   { ar: 'بداية',   en: 'Beginning' },
  }

  const bd = transformation.breakdown

  return (
    <div className="space-y-3">

      {/* ── Main Score Card ───────────────────────────────── */}
      <div className="rounded-2xl p-4" style={{
        background: '#0e0e0e', border: `1px solid ${transformation.color}30`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

          {/* Score Ring */}
          <ScoreRing score={transformation.total} color={transformation.color} size={82} />

          {/* Right side */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: transformation.color, letterSpacing: '0.05em' }}>
                {isAr ? '🧠 مؤشر التحول' : '🧠 Transformation'}
              </span>
              <TrendArrow trend={momentum.trend} isAr={isAr} />
            </div>

            <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
              {isAr
                ? levelLabels[transformation.level]?.ar
                : levelLabels[transformation.level]?.en}
            </p>

            {/* Plain-language interpretation */}
            <p style={{ fontSize: 9, fontWeight: 600, color: '#aaa', marginBottom: 6, lineHeight: 1.4 }}>
              {getScoreInterpretation(transformation.total, bd, rootCause, isAr)}
            </p>

            {/* Breakdown Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <BreakdownBar label={isAr ? 'انضباط' : 'Disc.'} value={bd.discipline} color="#c9a84c" tip={getPillarTip('discipline', bd.discipline, isAr)} />
              <BreakdownBar label={isAr ? 'حالة' : 'State'} value={bd.state} color="#3498db" tip={getPillarTip('state', bd.state, isAr)} />
              <BreakdownBar label={isAr ? 'تقدم' : 'Prog.'} value={bd.progress} color="#2ecc71" tip={getPillarTip('progress', bd.progress, isAr)} />
              <BreakdownBar label={isAr ? 'عمق' : 'Depth'} value={bd.depth} color="#9b59b6" tip={getPillarTip('depth', bd.depth, isAr)} />
            </div>
          </div>
        </div>

        {/* Momentum Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 10, padding: '6px 10px',
          borderRadius: 10, background: `${momentum.color}10`,
          border: `1px solid ${momentum.color}25`,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#888' }}>
            {isAr ? '🔥 الزخم' : '🔥 Momentum'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: momentum.color }}>
              {momentum.score}/100
            </span>
            <span style={{ fontSize: 9, color: '#666' }}>
              ({momentum.activeDays}/7 {isAr ? 'أيام نشطة' : 'active days'})
            </span>
          </div>
        </div>
      </div>

      {/* ── Root Cause Card + Actionable Next Steps (Fix #7) ── */}
      {rootCause.type !== 'thriving' && rootCause.type !== 'exploring' && (
        <div className="rounded-2xl overflow-hidden" style={{
          background: `${rootCause.color}08`,
          border: `1px solid ${rootCause.color}25`,
        }}>
          <div style={{ padding: 16, textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{rootCause.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 900, color: rootCause.color, marginBottom: 3 }}>
                  {isAr ? rootCause.labelAr : rootCause.labelEn}
                </p>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#999', lineHeight: 1.5 }}>
                  {isAr ? rootCause.descAr : rootCause.descEn}
                </p>
              </div>
            </div>
          </div>
          {/* Actionable next steps — every insight leads to action */}
          <div style={{
            display: 'flex', gap: 6, padding: '0 12px 12px',
            flexWrap: 'wrap',
          }}>
            {rootCause.action && (
              <button
                onClick={() => navigate(rootCause.action)}
                className="transition-all active:scale-95"
                style={{
                  fontSize: 10, fontWeight: 800, color: '#0a0a0a',
                  background: rootCause.color,
                  borderRadius: 8, padding: '6px 12px', border: 'none', cursor: 'pointer',
                }}>
                {isAr ? rootCause.actionAr : rootCause.actionEn} {isAr ? '←' : '→'}
              </button>
            )}
            {rootCause.type === 'energy' && (
              <button onClick={() => navigate('/sleep')} className="transition-all active:scale-95"
                style={{ fontSize: 10, fontWeight: 700, color: '#3498db', background: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.3)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
                😴 {isAr ? 'سجّل نومك' : 'Log Sleep'}
              </button>
            )}
            {rootCause.type === 'clarity' && (
              <button onClick={() => navigate('/goals')} className="transition-all active:scale-95"
                style={{ fontSize: 10, fontWeight: 700, color: '#9b59b6', background: 'rgba(155,89,182,0.1)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
                🎯 {isAr ? 'راجع أهدافك' : 'Review Goals'}
              </button>
            )}
            {(rootCause.type === 'fear' || rootCause.type === 'identity') && (
              <button onClick={() => navigate('/beliefs')} className="transition-all active:scale-95"
                style={{ fontSize: 10, fontWeight: 700, color: '#e67e22', background: 'rgba(230,126,34,0.1)', border: '1px solid rgba(230,126,34,0.3)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
                🪞 {isAr ? 'المعتقدات' : 'Beliefs'}
              </button>
            )}
            {/* Fix this now — direct route based on root cause type */}
            {getFixRoute(rootCause.type) && (
              <button
                onClick={() => navigate(getFixRoute(rootCause.type))}
                className="transition-all active:scale-95"
                style={{
                  fontSize: 10, fontWeight: 800, color: '#fff',
                  background: 'linear-gradient(135deg, #c9a84c, #dbb85c)',
                  borderRadius: 8, padding: '6px 14px', border: 'none', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(201,168,76,0.3)',
                }}>
                🛠️ {isAr ? 'عالج هذا الآن' : 'Fix this now'} {isAr ? '←' : '→'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Thriving Banner ──────────────────────────────── */}
      {rootCause.type === 'thriving' && (
        <div className="rounded-2xl p-3" style={{
          background: 'rgba(46,204,113,0.06)',
          border: '1px solid rgba(46,204,113,0.25)',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#2ecc71' }}>
            🟢 {isAr ? 'أنت في حالة ممتازة — استمر على هذا النمط!' : "You're thriving — keep this pattern going!"}
          </span>
        </div>
      )}

      {/* ── State Recipe Card ─────────────────────────────── */}
      {recipe.hasRecipe && recipe.recipe.length > 0 && (
        <div className="rounded-2xl p-4" style={{
          background: '#0e0e0e', border: '1px solid #1e1e1e',
        }}>
          <p style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c', marginBottom: 8, letterSpacing: '0.03em' }}>
            {isAr ? '✨ وصفة أفضل يوم لك' : '✨ Your Best Day Formula'}
          </p>
          <p style={{ fontSize: 10, color: '#666', marginBottom: 10 }}>
            {isAr
              ? `بناءً على تحليل ${recipe.greatDays} يوم مميز من آخر 30 يوم:`
              : `Based on analyzing ${recipe.greatDays} great days from the last 30:`}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {recipe.recipe.map((factor, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#111', border: '1px solid #222',
                borderRadius: 10, padding: '5px 10px',
              }}>
                <span style={{ fontSize: 14 }}>{factor.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#ddd' }}>
                  {isAr ? factor.emojiAr : factor.emojiEn}
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 800, color: '#2ecc71',
                  background: 'rgba(46,204,113,0.12)',
                  borderRadius: 6, padding: '1px 5px',
                }}>
                  {factor.greatPct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
