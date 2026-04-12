import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const AREAS_DATA = {
  ar: [
    { key: 'body',         label: 'الجسم والصحة',        emoji: '💪', color: '#e74c3c' },
    { key: 'emotions',     label: 'العواطف والمعنى',      emoji: '❤️', color: '#e91e8c' },
    { key: 'relationships',label: 'العلاقات',              emoji: '👥', color: '#9b59b6' },
    { key: 'time',         label: 'الوقت',                emoji: '⏰', color: '#3498db' },
    { key: 'career',       label: 'المهنة والمهمة',       emoji: '🚀', color: '#2ecc71' },
    { key: 'money',        label: 'المال والثروة',         emoji: '💰', color: '#f1c40f' },
    { key: 'contribution', label: 'المساهمة والعطاء',    emoji: '🌟', color: '#c9a84c' },
  ],
  en: [
    { key: 'body',         label: 'Health & Body',     emoji: '💪', color: '#e74c3c' },
    { key: 'emotions',     label: 'Emotions & Meaning', emoji: '❤️', color: '#e91e8c' },
    { key: 'relationships',label: 'Relationships',      emoji: '👥', color: '#9b59b6' },
    { key: 'time',         label: 'Time',               emoji: '⏰', color: '#3498db' },
    { key: 'career',       label: 'Career & Mission',  emoji: '🚀', color: '#2ecc71' },
    { key: 'money',        label: 'Money & Wealth',    emoji: '💰', color: '#f1c40f' },
    { key: 'contribution', label: 'Contribution',      emoji: '🌟', color: '#c9a84c' },
  ]
}

function RadarChart({ scores, areas, size = 260 }) {
  const cx = size / 2, cy = size / 2
  const n = areas.length
  const maxR = size / 2 - 30

  const angle = (i) => (i / n) * 2 * Math.PI - Math.PI / 2

  const getPoint = (i, val, maxVal = 10) => {
    const r = (val / maxVal) * maxR
    return {
      x: cx + r * Math.cos(angle(i)),
      y: cy + r * Math.sin(angle(i)),
    }
  }

  // Grid rings
  const rings = [2, 4, 6, 8, 10]

  // Polygon for scores
  const polygon = areas.map((a, i) => {
    const p = getPoint(i, scores[a.key] || 0)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {rings.map(r => {
        const pts = areas.map((_, i) => {
          const p = getPoint(i, r)
          return `${p.x},${p.y}`
        }).join(' ')
        return (
          <polygon key={r} points={pts} fill="none"
            stroke={r === 10 ? '#333' : '#222'} strokeWidth={r === 10 ? 1 : 0.5} />
        )
      })}

      {areas.map((_, i) => {
        const p = getPoint(i, 10)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#222" strokeWidth={0.8} />
      })}

      <polygon points={polygon} fill="rgba(201,168,76,0.15)" stroke="#c9a84c" strokeWidth={2} strokeLinejoin="round" />

      {areas.map((a, i) => {
        const p = getPoint(i, scores[a.key] || 0)
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill={a.color} stroke="#090909" strokeWidth={2} />
      })}

      {areas.map((a, i) => {
        const p = getPoint(i, 12.5)
        const score = scores[a.key] || 0
        return (
          <g key={i}>
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={11}
              fill={score >= 7 ? '#c9a84c' : '#888'} fontFamily="Cairo" fontWeight="600">{a.emoji}</text>
            <text x={p.x} y={p.y + 14} textAnchor="middle" dominantBaseline="middle" fontSize={8}
              fill="#666" fontFamily="Cairo">{score}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function WheelOfLife() {
  const { state, updateWheel, saveWheelSnapshot } = useApp()
  const { lang, t } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'
  const [saved, setSaved] = useState(false)
  const [showGoalTip, setShowGoalTip] = useState(false)
  const [activeArea, setActiveArea] = useState(null)

  const AREAS = AREAS_DATA[lang]
  const scores = state.wheelScores
  const avg = (Object.values(scores).reduce((a, b) => a + b, 0) / AREAS.length).toFixed(1)
  const minArea = AREAS.reduce((a, b) => (scores[a.key] < scores[b.key] ? a : b))
  const maxArea = AREAS.reduce((a, b) => (scores[a.key] > scores[b.key] ? a : b))

  const handleSave = () => {
    saveWheelSnapshot()
    setSaved(true)
    setShowGoalTip(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout title={t('wheel_title')} subtitle={t('wheel_subtitle')} helpKey="wheel">
      <div className="space-y-4 pt-2">

        <div className="rounded-2xl flex items-center justify-center py-4"
          style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <RadarChart scores={scores} areas={AREAS} size={280} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="card text-center py-3">
            <p className="text-xl font-black" style={{ color: '#c9a84c' }}>{avg}</p>
            <p className="text-xs mt-0.5" style={{ color: '#666' }}>{t('wheel_avg')}</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-lg font-black" style={{ color: '#2ecc71' }}>{maxArea.emoji}</p>
            <p className="text-xs mt-0.5" style={{ color: '#666' }}>{lang === 'ar' ? 'الأعلى' : 'Highest'}</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-lg font-black" style={{ color: '#e63946' }}>{minArea.emoji}</p>
            <p className="text-xs mt-0.5" style={{ color: '#666' }}>{lang === 'ar' ? 'الأدنى' : 'Lowest'}</p>
          </div>
        </div>

        <div className="space-y-3">
          {AREAS.map(area => (
            <div key={area.key} className="rounded-2xl p-4 transition-all"
              style={{ background: activeArea === area.key ? `${area.color}10` : '#1a1a1a',
                border: `1px solid ${activeArea === area.key ? area.color + '44' : '#2a2a2a'}` }}
              onClick={() => setActiveArea(activeArea === area.key ? null : area.key)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{area.emoji}</span>
                  <span className="text-sm font-bold text-white">{area.label}</span>
                </div>
                <span className="text-lg font-black"
                  style={{ color: scores[area.key] >= 7 ? '#2ecc71' : scores[area.key] >= 4 ? '#c9a84c' : '#e63946' }}>
                  {scores[area.key]}
                </span>
              </div>
              <input type="range" min={0} max={10} step={1} value={scores[area.key]}
                onChange={e => updateWheel(area.key, Number(e.target.value))}
                onClick={e => e.stopPropagation()} className="w-full" style={{ accentColor: area.color }} />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#444' }}>
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'rgba(230,57,70,0.07)', border: '1px solid rgba(230,57,70,0.2)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: '#e63946' }}>
            🎯 {lang === 'ar' ? 'تركيزك هذا الشهر' : 'This month\'s focus'}
          </p>
          <p className="text-sm font-bold text-white">{minArea.emoji} {minArea.label}</p>
          <p className="text-xs mt-1" style={{ color: '#aaa' }}>
            {lang === 'ar'
              ? `درجتك: ${scores[minArea.key]}/10 — هذا المجال يحد من كل شيء فوقه. اعطِه الأولوية الآن.`
              : `Score: ${scores[minArea.key]}/10 — This area is limiting everything above it. Prioritize it now.`}
          </p>
        </div>

        <button onClick={handleSave} className="w-full btn-gold py-3 text-sm">
          {saved ? `✓ ${t('wheel_snapshot_saved')}!` : `💾 ${t('wheel_save')}`}
        </button>

        {/* Goal suggestion after saving */}
        {showGoalTip && (
          <div className="rounded-2xl p-4 animate-scale-in"
            style={{ background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.3)' }}>
            <p className="text-sm font-bold text-white mb-1">
              🎯 {isAr ? 'هل تريد تحسين أضعف مجال؟' : 'Want to improve your weakest area?'}
            </p>
            <p className="text-xs mb-3" style={{ color: '#aaa' }}>
              {isAr
                ? `مجال "${minArea.label}" (${scores[minArea.key]}/10) يحتاج اهتماماً — أنشئ هدفاً له الآن`
                : `"${minArea.label}" (${scores[minArea.key]}/10) needs attention — create a goal for it now`}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowGoalTip(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }}>
                {isAr ? 'لاحقاً' : 'Later'}
              </button>
              <button onClick={() => navigate('/goals')}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(52,152,219,0.2)', color: '#3498db', border: '1px solid rgba(52,152,219,0.4)' }}>
                {isAr ? `أنشئ هدف لـ ${minArea.emoji} ${minArea.label}` : `Create Goal for ${minArea.emoji} ${minArea.label}`}
              </button>
            </div>
          </div>
        )}

        {state.wheelHistory.length > 0 && (
          <div className="card">
            <p className="text-sm font-bold text-white mb-3">📈 {t('wheel_history')}</p>
            <div className="space-y-2">
              {[...state.wheelHistory].reverse().slice(0, 5).map((snap, i) => {
                const snapAvg = (Object.values(snap.scores).reduce((a, b) => a + b, 0) / 7).toFixed(1)
                return (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span style={{ color: '#888' }}>{snap.date}</span>
                    <span className="font-bold" style={{ color: '#c9a84c' }}>{t('wheel_avg')}: {snapAvg}</span>
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
