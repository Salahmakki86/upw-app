import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { Target, TrendingUp, ArrowLeft, ChevronLeft, Save, BarChart2 } from 'lucide-react'

const AREAS = [
  { key: 'health',        ar: 'الصحة والجسم',       en: 'Health & Body',       emoji: '💪', wheelKey: 'body' },
  { key: 'career',        ar: 'العمل والمهنة',       en: 'Career & Work',       emoji: '💼', wheelKey: 'career' },
  { key: 'finances',      ar: 'المال والثروة',       en: 'Finances & Wealth',   emoji: '💰', wheelKey: 'money' },
  { key: 'relationships', ar: 'العلاقات',            en: 'Relationships',       emoji: '❤️', wheelKey: 'relationships' },
  { key: 'family',        ar: 'العائلة',             en: 'Family',              emoji: '🏠', wheelKey: null },
  { key: 'fun',           ar: 'الترفيه والمرح',      en: 'Fun & Joy',           emoji: '🎉', wheelKey: 'time' },
  { key: 'growth',        ar: 'النمو والتعلم',       en: 'Growth & Learning',   emoji: '📚', wheelKey: 'emotions' },
  { key: 'spirituality',  ar: 'الروحانية',           en: 'Spirituality',        emoji: '✨', wheelKey: null },
  { key: 'contribution',  ar: 'المساهمة',            en: 'Contribution',        emoji: '🤝', wheelKey: 'contribution' },
  { key: 'environment',   ar: 'البيئة والمحيط',     en: 'Environment',         emoji: '🌿', wheelKey: null },
]

function ScoreSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: value === n ? '2px solid #c9a84c' : '2px solid #2a2a2a',
            background: value === n ? '#c9a84c' : '#1a1a1a',
            color: value === n ? '#000' : '#888',
            fontWeight: value === n ? 700 : 400,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function DeltaBadge({ delta }) {
  if (delta === null || delta === undefined) return null
  const color = delta > 0 ? '#4ade80' : delta < 0 ? '#f87171' : '#888'
  const symbol = delta > 0 ? '▲' : delta < 0 ? '▼' : '='
  return (
    <span style={{ color, fontWeight: 700, fontSize: 13, marginInlineStart: 6 }}>
      {symbol} {Math.abs(delta)}
    </span>
  )
}

export default function BaselinePage() {
  const { state, update, today } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const [hasStarted, setHasStarted] = useState(false)
  const [editing, setEditing] = useState(false)
  const [scores, setScores] = useState(() => {
    const init = {}
    AREAS.forEach(a => { init[a.key] = 5 })
    return init
  })
  const [saved, setSaved] = useState(false)

  const baseline = state.baseline
  const wheelScores = state.wheelScores || {}

  function handleSave() {
    update('baseline', { date: today, scores })
    setSaved(true)
    setEditing(false)
    setHasStarted(false)
    setTimeout(() => setSaved(false), 2000)
  }

  function startEditing() {
    if (baseline) {
      setScores({ ...baseline.scores })
    }
    setEditing(true)
    setHasStarted(true)
  }

  // Compute mapped deltas for comparison view
  function getMappedScore(area) {
    if (!area.wheelKey) return null
    const ws = wheelScores[area.wheelKey]
    return ws !== undefined ? ws : null
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch { return dateStr }
  }

  const mappedAreas = AREAS.filter(a => a.wheelKey !== null)
  const avgDelta = baseline
    ? (() => {
        const deltas = mappedAreas.map(a => {
          const current = getMappedScore(a)
          const base = baseline.scores[a.key]
          return current !== null ? current - base : null
        }).filter(d => d !== null)
        if (deltas.length === 0) return 0
        return deltas.reduce((s, d) => s + d, 0) / deltas.length
      })()
    : 0

  const showForm = hasStarted || editing

  // ---- INTRO SCREEN ----
  if (!baseline && !showForm) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090909',
        color: '#fff',
        fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
        direction: isAr ? 'rtl' : 'ltr',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1e1e1e' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
            className="active:scale-95 transition-all"
          >
            {isAr ? <ChevronLeft size={22} style={{ transform: 'scaleX(-1)' }} /> : <ArrowLeft size={22} />}
          </button>
          <span style={{ marginInlineStart: 8, color: '#888', fontSize: 14 }}>
            {isAr ? 'نقطة الانطلاق' : 'Baseline'}
          </span>
        </div>

        {/* Intro content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🎯</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12, lineHeight: 1.3 }}>
            {isAr ? 'نقطة انطلاقك' : 'Your Starting Point'}
          </h1>
          <p style={{ color: '#aaa', fontSize: 16, maxWidth: 320, lineHeight: 1.7, marginBottom: 40 }}>
            {isAr
              ? 'قيّم حياتك الآن صادقاً — هذا سيساعدك على قياس التحول الحقيقي'
              : 'Rate your life honestly now — this helps measure real transformation'}
          </p>

          <div style={{
            background: '#0e0e0e',
            border: '1px solid #1e1e1e',
            borderRadius: 16,
            padding: '20px 24px',
            maxWidth: 340,
            width: '100%',
            marginBottom: 36,
            textAlign: isAr ? 'right' : 'left',
          }}>
            {AREAS.slice(0, 4).map(a => (
              <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{a.emoji}</span>
                <span style={{ color: '#ccc', fontSize: 14 }}>{isAr ? a.ar : a.en}</span>
              </div>
            ))}
            <div style={{ color: '#666', fontSize: 13, marginTop: 8 }}>
              {isAr ? `+ ${AREAS.length - 4} مجالات أخرى` : `+ ${AREAS.length - 4} more areas`}
            </div>
          </div>

          <button
            onClick={() => setHasStarted(true)}
            className="active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#000',
              border: 'none',
              borderRadius: 14,
              padding: '16px 40px',
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              maxWidth: 320,
            }}
          >
            {isAr ? 'ابدأ التقييم' : 'Start Assessment'}
          </button>
        </div>
      </div>
    )
  }

  // ---- ASSESSMENT FORM ----
  if (showForm) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090909',
        color: '#fff',
        fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
        direction: isAr ? 'rtl' : 'ltr',
        paddingBottom: 40,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, background: '#090909', zIndex: 10 }}>
          <button
            onClick={() => { setHasStarted(false); setEditing(false) }}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
            className="active:scale-95 transition-all"
          >
            {isAr ? <ChevronLeft size={22} style={{ transform: 'scaleX(-1)' }} /> : <ArrowLeft size={22} />}
          </button>
          <h1 style={{ marginInlineStart: 12, fontSize: 18, fontWeight: 700 }}>
            {isAr ? 'تقييم نقطة الانطلاق' : 'Baseline Assessment'}
          </h1>
        </div>

        <div style={{ padding: '20px 16px' }}>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
            {isAr ? 'كن صادقاً مع نفسك — من 1 (ضعيف) إلى 10 (ممتاز)' : 'Be honest — from 1 (poor) to 10 (excellent)'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AREAS.map(area => (
              <div key={area.key} style={{
                background: '#0e0e0e',
                border: '1px solid #1e1e1e',
                borderRadius: 16,
                padding: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{area.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>
                        {isAr ? area.ar : area.en}
                      </div>
                      <div style={{ color: '#666', fontSize: 12 }}>
                        {isAr ? area.en : area.ar}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: '#c9a84c',
                    color: '#000',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontWeight: 800,
                    fontSize: 18,
                    minWidth: 36,
                    textAlign: 'center',
                  }}>
                    {scores[area.key] || 5}
                  </div>
                </div>
                <ScoreSelector
                  value={scores[area.key] || 5}
                  onChange={v => setScores(prev => ({ ...prev, [area.key]: v }))}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="active:scale-95 transition-all"
            style={{
              marginTop: 24,
              background: saved ? '#4ade80' : 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#000',
              border: 'none',
              borderRadius: 14,
              padding: '16px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Save size={18} />
            {saved
              ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓')
              : (isAr ? 'احفظ نقطة الانطلاق' : 'Save Starting Point')
            }
          </button>
        </div>
      </div>
    )
  }

  // ---- COMPARISON VIEW (baseline exists) ----
  return (
    <div style={{
      minHeight: '100vh',
      background: '#090909',
      color: '#fff',
      fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
      direction: isAr ? 'rtl' : 'ltr',
      paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, background: '#090909', zIndex: 10 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
          className="active:scale-95 transition-all"
        >
          {isAr ? <ChevronLeft size={22} style={{ transform: 'scaleX(-1)' }} /> : <ArrowLeft size={22} />}
        </button>
        <div style={{ marginInlineStart: 12 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {isAr ? 'نقطة انطلاقك' : 'Your Starting Point'}
          </h1>
          <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
            {isAr ? 'تم التقييم: ' : 'Assessed: '}{formatDate(baseline.date)}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Overall progress */}
        {(() => {
          const pct = Math.min(100, Math.max(0, ((avgDelta + 10) / 20) * 100))
          return (
            <div style={{
              background: '#0e0e0e',
              border: '1px solid #1e1e1e',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <BarChart2 size={16} color="#c9a84c" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  {isAr ? 'التطور الإجمالي' : 'Overall Progress'}
                </span>
                <DeltaBadge delta={Math.round(avgDelta * 10) / 10} />
              </div>
              <div style={{ height: 8, background: '#1e1e1e', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: avgDelta >= 0 ? 'linear-gradient(90deg, #c9a84c, #e8c96a)' : '#f87171',
                  borderRadius: 4,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ color: '#555', fontSize: 11 }}>{isAr ? 'نقطة الانطلاق' : 'Baseline'}</span>
                <span style={{ color: '#555', fontSize: 11 }}>{isAr ? 'الحال الآن' : 'Now'}</span>
              </div>
            </div>
          )
        })()}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#4a7aff' }} />
            <span style={{ color: '#888', fontSize: 12 }}>{isAr ? 'نقطة البداية' : 'Baseline'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#c9a84c' }} />
            <span style={{ color: '#888', fontSize: 12 }}>{isAr ? 'الآن' : 'Current'}</span>
          </div>
        </div>

        {/* Area cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AREAS.map(area => {
            const baseScore = baseline.scores[area.key]
            const currentScore = getMappedScore(area)
            const delta = currentScore !== null ? currentScore - baseScore : null

            return (
              <div key={area.key} style={{
                background: '#0e0e0e',
                border: '1px solid #1e1e1e',
                borderRadius: 16,
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{area.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {isAr ? area.ar : area.en}
                      </div>
                      <div style={{ color: '#555', fontSize: 11 }}>
                        {isAr ? area.en : area.ar}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Baseline score */}
                    <div style={{
                      background: '#1a2a4a',
                      color: '#7aadff',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontWeight: 700,
                      fontSize: 16,
                      minWidth: 32,
                      textAlign: 'center',
                    }}>
                      {baseScore}
                    </div>
                    <span style={{ color: '#444', fontSize: 12 }}>→</span>
                    {/* Current score */}
                    {currentScore !== null ? (
                      <div style={{
                        background: '#2a1e00',
                        color: '#c9a84c',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontWeight: 700,
                        fontSize: 16,
                        minWidth: 32,
                        textAlign: 'center',
                      }}>
                        {currentScore}
                      </div>
                    ) : (
                      <div style={{
                        color: '#444',
                        fontSize: 11,
                        maxWidth: 70,
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}>
                        {isAr ? 'لم يُقس بعد' : 'Not measured yet'}
                      </div>
                    )}
                    {delta !== null && <DeltaBadge delta={delta} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Motivation card */}
        {avgDelta > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #1a1500, #2a2000)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 16,
            padding: '20px',
            marginTop: 16,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🚀</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#c9a84c' }}>
              {isAr ? 'أنت تتطور!' : 'You Are Growing!'}
            </div>
            <div style={{ color: '#aaa', fontSize: 13, marginTop: 6 }}>
              {isAr
                ? `تحسّن متوسط ${(Math.round(avgDelta * 10) / 10).toFixed(1)} نقطة منذ نقطة الانطلاق`
                : `Average improvement of ${(Math.round(avgDelta * 10) / 10).toFixed(1)} points since baseline`
              }
            </div>
          </div>
        )}

        {/* Update button */}
        <button
          onClick={startEditing}
          className="active:scale-95 transition-all"
          style={{
            marginTop: 20,
            background: 'none',
            border: '1px solid #c9a84c',
            color: '#c9a84c',
            borderRadius: 14,
            padding: '14px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <TrendingUp size={16} />
          {isAr ? 'تحديث التقييم' : 'Update Assessment'}
        </button>
      </div>
    </div>
  )
}
