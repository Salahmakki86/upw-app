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

// Score explanation per area
const AREA_EXPLANATIONS = {
  ar: {
    body:         { '1': 'متعب دائماً، مريض كثيراً، لا تمارس أي رياضة', '5': 'صحة متوسطة، بعض التمارين أحياناً، وزن مقبول', '10': 'طاقة استثنائية، جسم قوي، روتين صحي يومي ثابت' },
    emotions:     { '1': 'تشعر بالمعاناة معظم الوقت، قلق دائم، حزن عميق', '5': 'أحياناً سعيد وأحياناً متعب عاطفياً', '10': 'حالة جميلة دائمة، امتنان عميق، هدوء داخلي حقيقي' },
    relationships:{ '1': 'علاقات مشحونة، وحيد، لا اتصال حقيقي', '5': 'علاقات جيدة لكن تفتقر للعمق أو الصدق', '10': 'علاقات عميقة، محبة حقيقية، دعم متبادل قوي' },
    time:         { '1': 'لا تتحكم في وقتك إطلاقاً، مشتت دائماً', '5': 'بعض التنظيم لكن كثير من الضياع', '10': 'تتحكم بوقتك تماماً، أولوياتك واضحة، لا هدر' },
    career:       { '1': 'تكره عملك، لا معنى فيه، لا نمو', '5': 'عمل مقبول، بعض الرضا، لكن ليس شغفك', '10': 'تعيش رسالتك، شغوف بما تفعل، أثر حقيقي' },
    money:        { '1': 'ديون، ضغط مالي يومي، لا مدخرات', '5': 'مستقر مالياً لكن بلا وفرة أو حرية', '10': 'حرية مالية كاملة، المال يعمل لصالحك' },
    contribution: { '1': 'لا تشعر أنك تؤثر في أحد، تعطي للنفس فقط', '5': 'تساعد أحياناً لكن العطاء ليس عادة راسخة', '10': 'تأثيرك واسع، عطاؤك جزء من هويتك، تشعر بالامتلاء' },
  },
  en: {
    body:         { '1': 'Always tired, often sick, no exercise routine', '5': 'Average health, occasional exercise, acceptable weight', '10': 'Exceptional energy, strong body, consistent daily health routine' },
    emotions:     { '1': 'Suffering most of the time, constant anxiety, deep sadness', '5': 'Sometimes happy, sometimes emotionally drained', '10': 'Permanent beautiful state, deep gratitude, true inner peace' },
    relationships:{ '1': 'Tense relationships, lonely, no real connection', '5': 'Good relationships but lacking depth or honesty', '10': 'Deep relationships, real love, strong mutual support' },
    time:         { '1': 'No control over time, always distracted', '5': 'Some organization but lots of waste', '10': 'Full control, clear priorities, zero wasted time' },
    career:       { '1': 'Hate your work, no meaning, no growth', '5': 'Acceptable work, some satisfaction, but not your passion', '10': 'Living your mission, passionate, making a real impact' },
    money:        { '1': 'Debt, daily financial stress, no savings', '5': 'Financially stable but no abundance or freedom', '10': 'Full financial freedom, money works for you' },
    contribution: { '1': "Don't feel you impact anyone, focused only on self", '5': 'Help occasionally but giving is not a deep habit', '10': 'Wide impact, giving is part of your identity, feel fulfilled' },
  }
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
  const { state, updateWheel, saveWheelSnapshot, linkWheelToGoal } = useApp()
  const { lang, t } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'
  const [saved, setSaved] = useState(false)
  const [showGoalTip, setShowGoalTip] = useState(false)
  const [activeArea, setActiveArea] = useState(null)
  const [compareMode, setCompareMode] = useState(false)
  const [scoreInfoArea, setScoreInfoArea] = useState(null)
  const [lowAreaSuggestions, setLowAreaSuggestions] = useState([])
  const [linkPickerArea, setLinkPickerArea] = useState(null)

  // Bridge B2 — Wheel → Goal linking
  const wheelGoalLinks = state.wheelGoalLinks || {}
  const activeGoals = (state.goals || []).filter(g => !g.completed && (g.progress || 0) < 100)

  const AREAS = AREAS_DATA[lang]
  const scores = state.wheelScores
  const avg = (Object.values(scores).reduce((a, b) => a + b, 0) / AREAS.length).toFixed(1)
  const minArea = AREAS.reduce((a, b) => (scores[a.key] < scores[b.key] ? a : b))
  const maxArea = AREAS.reduce((a, b) => (scores[a.key] > scores[b.key] ? a : b))

  const wheelHistory = state.wheelHistory || []
  const canCompare = wheelHistory.length >= 2
  const prevSnapshot = canCompare ? wheelHistory[wheelHistory.length - 2] : null

  const handleSave = () => {
    saveWheelSnapshot()
    setSaved(true)
    setShowGoalTip(true)
    // Build list of low areas for suggestions
    const lows = AREAS.filter(a => scores[a.key] < 6)
    setLowAreaSuggestions(lows)
    setTimeout(() => setSaved(false), 2000)
  }

  const getChangeArrow = (key) => {
    if (!prevSnapshot) return { arrow: '→', color: '#888' }
    const curr = scores[key] || 0
    const prev = prevSnapshot.scores[key] || 0
    if (curr > prev) return { arrow: '↑', color: '#2ecc71' }
    if (curr < prev) return { arrow: '↓', color: '#e63946' }
    return { arrow: '→', color: '#888' }
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

        {/* Compare Mode Toggle */}
        {canCompare && (
          <button
            onClick={() => setCompareMode(v => !v)}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: compareMode ? 'rgba(52,152,219,0.15)' : '#111',
              border: `1px solid ${compareMode ? 'rgba(52,152,219,0.4)' : '#1e1e1e'}`,
              color: compareMode ? '#3498db' : '#666',
            }}
          >
            📊 {isAr ? 'قارن / Compare' : 'Compare with previous'}
          </button>
        )}

        {/* Compare Table */}
        {compareMode && prevSnapshot && (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <div className="grid text-xs font-bold py-2 px-4" style={{ gridTemplateColumns: '1fr 60px 60px 40px', color: '#666' }}>
              <span>{isAr ? 'المجال' : 'Area'}</span>
              <span className="text-center">{isAr ? 'الآن' : 'Now'}</span>
              <span className="text-center">{isAr ? 'السابق' : 'Prev'}</span>
              <span className="text-center">{isAr ? 'التغيير' : 'Change'}</span>
            </div>
            {AREAS.map(area => {
              const { arrow, color } = getChangeArrow(area.key)
              const curr = scores[area.key] || 0
              const prev = prevSnapshot.scores[area.key] || 0
              return (
                <div key={area.key}
                  className="grid items-center px-4 py-2.5 text-sm"
                  style={{ gridTemplateColumns: '1fr 60px 60px 40px', borderTop: '1px solid #222' }}
                >
                  <div className="flex items-center gap-2">
                    <span>{area.emoji}</span>
                    <span className="text-xs" style={{ color: '#bbb' }}>{area.label}</span>
                  </div>
                  <span className="text-center font-black" style={{ color: '#c9a84c' }}>{curr}</span>
                  <span className="text-center font-bold" style={{ color: '#555' }}>{prev}</span>
                  <span className="text-center font-black text-base" style={{ color }}>{arrow}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Score Info Popup */}
        {scoreInfoArea && (
          <div className="rounded-2xl p-4 animate-fade-in"
            style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                {AREAS.find(a => a.key === scoreInfoArea)?.emoji} {AREAS.find(a => a.key === scoreInfoArea)?.label}
              </p>
              <button onClick={() => setScoreInfoArea(null)} style={{ color: '#555', fontSize: 18 }}>×</button>
            </div>
            {['1', '5', '10'].map(lvl => {
              const exp = AREA_EXPLANATIONS[lang][scoreInfoArea]?.[lvl]
              return exp ? (
                <div key={lvl} className="flex gap-3 mb-2">
                  <span className="text-xs font-black w-5 flex-shrink-0"
                    style={{ color: lvl === '1' ? '#e63946' : lvl === '5' ? '#c9a84c' : '#2ecc71' }}>
                    {lvl}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>{exp}</p>
                </div>
              ) : null
            })}
          </div>
        )}

        <div className="space-y-3">
          {AREAS.map(area => {
            const linkedGoalId = wheelGoalLinks[area.key]
            const linkedGoal = linkedGoalId ? activeGoals.find(g => g.id === linkedGoalId) : null
            const isPicking = linkPickerArea === area.key
            return (
            <div key={area.key} className="rounded-2xl p-4 transition-all"
              style={{ background: activeArea === area.key ? `${area.color}10` : '#1a1a1a',
                border: `1px solid ${activeArea === area.key ? area.color + '44' : '#2a2a2a'}` }}
              onClick={() => setActiveArea(activeArea === area.key ? null : area.key)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{area.emoji}</span>
                  <span className="text-sm font-bold text-white">{area.label}</span>
                  {/* Info button */}
                  <button
                    onClick={e => { e.stopPropagation(); setScoreInfoArea(scoreInfoArea === area.key ? null : area.key) }}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all"
                    style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)' }}
                  >
                    i
                  </button>
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

              {/* Bridge B2 — Linked Goal */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px dashed #2a2a2a' }} onClick={e => e.stopPropagation()}>
                {linkedGoal ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#666' }}>
                      🔗 {isAr ? 'هدف مرتبط:' : 'Linked goal:'}
                    </span>
                    <button
                      onClick={() => navigate('/goals')}
                      className="flex-1 text-xs font-bold text-white text-start truncate"
                      style={{ background: 'transparent', border: 'none' }}
                    >
                      {linkedGoal.result || linkedGoal.title}
                    </button>
                    <button
                      onClick={() => linkWheelToGoal(area.key, null)}
                      className="text-xs"
                      style={{ color: '#888', background: 'transparent', border: '1px solid #333', borderRadius: 6, padding: '2px 6px' }}
                      aria-label={isAr ? 'إلغاء الربط' : 'Unlink'}
                    >
                      ✕
                    </button>
                  </div>
                ) : isPicking ? (
                  <div>
                    <p className="text-xs mb-2" style={{ color: '#888' }}>
                      {isAr ? 'اختر هدفاً لربطه بـ' : 'Pick a goal to link to'} {area.emoji} {area.label}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
                      {activeGoals.length === 0 ? (
                        <p className="text-xs" style={{ color: '#666' }}>
                          {isAr ? 'لا أهداف نشطة — أضف هدفاً أولاً' : 'No active goals — add one first'}
                        </p>
                      ) : activeGoals.map(g => (
                        <button
                          key={g.id}
                          onClick={() => { linkWheelToGoal(area.key, g.id); setLinkPickerArea(null) }}
                          className="text-xs font-bold text-white text-start truncate"
                          style={{
                            background: '#111', border: '1px solid #222',
                            borderRadius: 8, padding: '6px 10px',
                          }}
                        >
                          {(g.result || g.title || '').slice(0, 50)}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setLinkPickerArea(null)}
                      className="text-xs mt-2"
                      style={{ color: '#666', background: 'transparent' }}
                    >
                      {isAr ? 'إغلاق' : 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setLinkPickerArea(area.key)}
                    className="text-xs font-bold"
                    style={{ color: '#c9a84c', background: 'transparent' }}
                  >
                    🔗 {isAr ? 'اربط هدفاً بهذا المجال' : 'Link a goal to this area'}
                  </button>
                )}
              </div>
            </div>
          )})}
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

        {/* Auto Goal Suggestions for areas < 6 */}
        {showGoalTip && lowAreaSuggestions.length > 0 && (
          <div className="space-y-2">
            {lowAreaSuggestions.map(area => (
              <div key={area.key} className="rounded-2xl p-4 animate-scale-in"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.35)' }}>
                <p className="text-sm font-bold text-white mb-1">
                  💡 {area.emoji} {isAr
                    ? `"${area.label}" يحتاج اهتماماً — هل تضيف هدفاً الآن؟`
                    : `"${area.label}" needs attention — add a goal now?`}
                </p>
                <p className="text-xs mb-3" style={{ color: '#aaa' }}>
                  {isAr ? `درجتك الحالية: ${scores[area.key]}/10` : `Current score: ${scores[area.key]}/10`}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setLowAreaSuggestions(prev => prev.filter(a => a.key !== area.key))}
                    className="flex-1 py-2 rounded-xl text-xs font-bold"
                    style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }}>
                    {isAr ? 'لاحقاً' : 'Later'}
                  </button>
                  <button
                    onClick={() => navigate('/goals', { state: { suggestedArea: area.key, suggestedLabel: area.label } })}
                    className="flex-1 py-2 rounded-xl text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c96e)', color: '#000' }}>
                    ➕ {isAr ? 'أضف هدفاً' : 'Add Goal'}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => { setShowGoalTip(false); setLowAreaSuggestions([]) }}
              className="w-full py-2 text-xs" style={{ color: '#555' }}>
              {isAr ? 'إغلاق الكل' : 'Dismiss all'}
            </button>
          </div>
        )}

        {/* Legacy single suggestion (kept for backwards compat when no lows) */}
        {showGoalTip && lowAreaSuggestions.length === 0 && scores[minArea.key] < 6 && (
          <div className="rounded-2xl p-4 animate-scale-in"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.35)' }}>
            <p className="text-sm font-bold text-white mb-1">
              📊 {isAr
                ? `بناءً على تقييمك، مجال "${minArea.label}" يحتاج أكثر اهتماماً. هل تريد إضافة هدف لتحسينه؟`
                : `Based on your assessment, "${minArea.label}" needs the most attention. Want to add a goal to improve it?`}
            </p>
            <p className="text-xs mb-3" style={{ color: '#aaa' }}>
              {isAr ? `درجتك الحالية: ${scores[minArea.key]}/10` : `Current score: ${scores[minArea.key]}/10`}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowGoalTip(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }}>
                {isAr ? 'لاحقاً' : 'Later'}
              </button>
              <button
                onClick={() => navigate('/goals', { state: { suggestedArea: minArea.key, suggestedLabel: minArea.label } })}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c96e)', color: '#000' }}>
                ➕ {isAr ? `أضف هدفاً / Add Goal` : `Add Goal`}
              </button>
            </div>
          </div>
        )}

        {wheelHistory.length > 0 && (
          <div className="card">
            <p className="text-sm font-bold text-white mb-3">📈 {t('wheel_history')}</p>
            <div className="space-y-2">
              {[...wheelHistory].reverse().slice(0, 5).map((snap, i) => {
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
