/**
 * #8 — Skill Stack
 * Track and rate 5 core business skills monthly with radar chart
 */
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const DEFAULT_SKILLS = [
  { key: 'sales',      emoji: '💰', ar: 'المبيعات',   en: 'Sales' },
  { key: 'marketing',  emoji: '📢', ar: 'التسويق',    en: 'Marketing' },
  { key: 'leadership', emoji: '👑', ar: 'القيادة',     en: 'Leadership' },
  { key: 'negotiation',emoji: '🤝', ar: 'التفاوض',    en: 'Negotiation' },
  { key: 'execution',  emoji: '⚡', ar: 'التنفيذ',     en: 'Execution' },
]

function SkillRadar({ scores, skills, size = 240 }) {
  const cx = size / 2, cy = size / 2
  const n = skills.length
  const maxR = size / 2 - 30
  const angle = (i) => (i / n) * 2 * Math.PI - Math.PI / 2
  const getPoint = (i, val) => {
    const r = (val / 10) * maxR
    return { x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) }
  }
  const rings = [2, 4, 6, 8, 10]
  const polygon = skills.map((s, i) => {
    const p = getPoint(i, scores[s.key] || 0)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map(r => {
        const pts = skills.map((_, i) => { const p = getPoint(i, r); return `${p.x},${p.y}` }).join(' ')
        return <polygon key={r} points={pts} fill="none" stroke={r === 10 ? '#333' : '#222'} strokeWidth={r === 10 ? 1 : 0.5} />
      })}
      {skills.map((_, i) => {
        const p = getPoint(i, 10)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#222" strokeWidth={0.8} />
      })}
      <polygon points={polygon} fill="rgba(52,152,219,0.15)" stroke="#3498db" strokeWidth={2} strokeLinejoin="round" />
      {skills.map((s, i) => {
        const p = getPoint(i, scores[s.key] || 0)
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill="#3498db" stroke="#090909" strokeWidth={2} />
      })}
      {skills.map((s, i) => {
        const p = getPoint(i, 12.5)
        return (
          <g key={i}>
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={14} fill="#888">{s.emoji}</text>
            <text x={p.x} y={p.y + 16} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="#666">{scores[s.key] || 0}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function SkillStack() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const skillData = state.skillStack || { scores: {}, history: [], customSkills: null }
  const scores = skillData.scores || {}
  const history = skillData.history || []
  const skills = skillData.customSkills || DEFAULT_SKILLS
  const [saved, setSaved] = useState(false)

  const avg = useMemo(() => {
    const vals = skills.map(s => scores[s.key] || 0)
    return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '0'
  }, [scores, skills])

  const weakest = useMemo(() => {
    return skills.reduce((a, b) => (scores[a.key] || 0) < (scores[b.key] || 0) ? a : b)
  }, [scores, skills])

  const strongest = useMemo(() => {
    return skills.reduce((a, b) => (scores[a.key] || 0) > (scores[b.key] || 0) ? a : b)
  }, [scores, skills])

  const updateScore = (key, value) => {
    const newScores = { ...scores, [key]: Number(value) }
    update('skillStack', { ...skillData, scores: newScores })
  }

  const saveSnapshot = () => {
    const snapshot = { date: new Date().toISOString().slice(0, 10), scores: { ...scores } }
    update('skillStack', { ...skillData, history: [...history, snapshot] })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout
      title={isAr ? 'خريطة المهارات' : 'Skill Stack'}
      subtitle={isAr ? 'مهارتك الأضعف تحد كل شيء فوقها' : 'Your weakest skill limits everything above it'}
    >
      <div className="space-y-4 pt-2">

        {/* Radar Chart */}
        <div className="rounded-2xl flex items-center justify-center py-4"
          style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <SkillRadar scores={scores} skills={skills} size={260} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="card text-center py-3">
            <p className="text-xl font-black" style={{ color: '#3498db' }}>{avg}</p>
            <p className="text-xs mt-0.5" style={{ color: '#666' }}>{isAr ? 'المعدل' : 'Average'}</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-lg">{strongest.emoji}</p>
            <p className="text-xs mt-0.5" style={{ color: '#2ecc71' }}>{isAr ? 'الأقوى' : 'Strongest'}</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-lg">{weakest.emoji}</p>
            <p className="text-xs mt-0.5" style={{ color: '#e63946' }}>{isAr ? 'الأضعف' : 'Weakest'}</p>
          </div>
        </div>

        {/* Skill Sliders */}
        <div className="space-y-3">
          {skills.map(skill => (
            <div key={skill.key} className="rounded-2xl p-4"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  {skill.emoji} {isAr ? skill.ar : skill.en}
                </span>
                <span className="text-lg font-black" style={{
                  color: (scores[skill.key] || 0) >= 7 ? '#2ecc71' : (scores[skill.key] || 0) >= 4 ? '#c9a84c' : '#e63946',
                }}>
                  {scores[skill.key] || 0}
                </span>
              </div>
              <input type="range" min={0} max={10} step={1} value={scores[skill.key] || 0}
                onChange={e => updateScore(skill.key, e.target.value)}
                className="w-full" style={{ accentColor: '#3498db' }} />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#444' }}>
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          ))}
        </div>

        {/* Focus Card */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(230,57,70,0.07)', border: '1px solid rgba(230,57,70,0.2)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: '#e63946' }}>
            🎯 {isAr ? 'ركّز هذا الشهر على' : "This month's focus"}
          </p>
          <p className="text-sm font-bold text-white">{weakest.emoji} {isAr ? weakest.ar : weakest.en}</p>
          <p className="text-xs mt-1" style={{ color: '#aaa' }}>
            {isAr
              ? `درجتك: ${scores[weakest.key] || 0}/10 — حسّن هذه المهارة وكل شيء يتحسن معها`
              : `Score: ${scores[weakest.key] || 0}/10 — improve this skill and everything else follows`}
          </p>
        </div>

        {/* Save Snapshot */}
        <button onClick={saveSnapshot} className="w-full btn-gold py-3 text-sm">
          {saved ? '✓ ' + (isAr ? 'تم الحفظ' : 'Saved') : '💾 ' + (isAr ? 'احفظ تقييم الشهر' : 'Save Monthly Assessment')}
        </button>

        {/* History */}
        {history.length > 0 && (
          <div className="card">
            <p className="text-sm font-bold text-white mb-3">📈 {isAr ? 'تاريخ التقييمات' : 'Assessment History'}</p>
            <div className="space-y-2">
              {[...history].reverse().slice(0, 5).map((snap, i) => {
                const snapAvg = (Object.values(snap.scores).reduce((a, b) => a + b, 0) / skills.length).toFixed(1)
                return (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span style={{ color: '#888' }}>{snap.date}</span>
                    <span className="font-bold" style={{ color: '#3498db' }}>{isAr ? 'معدل' : 'Avg'}: {snapAvg}</span>
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
