import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const NUTRITION_ITEMS = {
  ar: ['خضروات خضراء', 'توت وفاكهة', 'مكسرات وبذور', 'سمك وبروتين', 'تجنب السكر', 'تجنب المعالج'],
  en: ['Green Vegetables', 'Berries & Fruit', 'Nuts & Seeds', 'Fish & Protein', 'Avoid Sugar', 'Avoid Processed'],
}

const BREATHING_PROTOCOLS = {
  ar: [
    { key: 'morning', name: 'تنفس الصباح', desc: '30 نفساً سريعاً — تنشيط عميق', pattern: null, rounds: 30 },
    { key: 'power', name: 'تنفس القوة', desc: '4-4-8 — بناء الطاقة', pattern: [4, 4, 8], rounds: 5 },
    { key: 'focus', name: 'تنفس التركيز', desc: '4-4-4-4 — صندوق الهواء', pattern: [4, 4, 4, 4], rounds: 4 },
  ],
  en: [
    { key: 'morning', name: 'Morning Breathing', desc: '30 rapid breaths — deep activation', pattern: null, rounds: 30 },
    { key: 'power', name: 'Power Breathing', desc: '4-4-8 — build energy', pattern: [4, 4, 8], rounds: 5 },
    { key: 'focus', name: 'Focus Breathing', desc: '4-4-4-4 — box breathing', pattern: [4, 4, 4, 4], rounds: 4 },
  ],
}

const BREATH_LABELS = {
  ar: { inhale: 'استنشق', hold: 'احتفظ', exhale: 'أزفر', hold2: 'احتفظ' },
  en: { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale', hold2: 'Hold' },
}

function BreathingTimer({ protocol, isAr, onClose }) {
  const [phase, setPhase] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [round, setRound] = useState(1)
  const [running, setRunning] = useState(false)
  const [rapid, setRapid] = useState(0)
  const intervalRef = useRef(null)
  const labels = BREATH_LABELS[isAr ? 'ar' : 'en']

  const phaseLabels = protocol.pattern
    ? [labels.inhale, labels.hold, labels.exhale, labels.hold2].slice(0, protocol.pattern.length)
    : null

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return }
    if (!protocol.pattern) {
      // Rapid breathing
      intervalRef.current = setInterval(() => {
        setRapid(r => {
          if (r >= protocol.rounds - 1) { setRunning(false); return r }
          return r + 1
        })
      }, 800)
    } else {
      const maxPhase = protocol.pattern.length
      setCountdown(protocol.pattern[0])
      let currentPhase = 0
      let currentCount = protocol.pattern[0]
      intervalRef.current = setInterval(() => {
        currentCount--
        if (currentCount <= 0) {
          currentPhase = (currentPhase + 1) % maxPhase
          if (currentPhase === 0) {
            setRound(r => {
              if (r >= protocol.rounds) { setRunning(false); return r }
              return r + 1
            })
          }
          currentCount = protocol.pattern[currentPhase]
          setPhase(currentPhase)
        }
        setCountdown(currentCount)
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, protocol])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-[400px] mx-4 rounded-3xl p-6"
        style={{ background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.3)' }}>
        <p className="text-center font-black text-white text-lg mb-1">{protocol.name}</p>
        <p className="text-center text-xs mb-6" style={{ color: '#888' }}>{protocol.desc}</p>

        {protocol.pattern ? (
          <div className="text-center">
            <div className="w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center mx-auto mb-4 transition-all duration-300"
              style={{ borderColor: '#c9a84c', background: `rgba(201,168,76,${0.05 + phase * 0.05})` }}>
              <p className="text-3xl font-black text-white">{countdown}</p>
              <p className="text-xs mt-1" style={{ color: '#c9a84c' }}>{phaseLabels?.[phase]}</p>
            </div>
            <p className="text-xs mb-4" style={{ color: '#888' }}>
              {isAr ? 'جولة' : 'Round'} {round}/{protocol.rounds}
            </p>
          </div>
        ) : (
          <div className="text-center mb-4">
            <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center mx-auto mb-4"
              style={{ borderColor: '#3498db', background: 'rgba(52,152,219,0.1)' }}>
              <p className="text-4xl font-black text-white">{rapid + 1}</p>
            </div>
            <p className="text-xs" style={{ color: '#888' }}>
              {isAr ? 'نفس سريع' : 'Rapid Breath'} / {protocol.rounds}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setRunning(r => !r)}
            className="btn-gold flex-1 py-3">
            {running ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'ابدأ' : 'Start')}
          </button>
          <button onClick={onClose} className="btn-dark px-4">{isAr ? 'إغلاق' : 'Close'}</button>
        </div>
      </div>
    </div>
  )
}

export default function EnergyProtocol() {
  const { state, updateEnergyProtocol, today } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const [tab, setTab] = useState(0)
  const [activeBreathing, setActiveBreathing] = useState(null)

  const ep = (state.energyProtocol || {})[today] || {}
  const water = ep.water || 0
  const coldExposure = ep.coldExposure || false
  const morningMovement = ep.morningMovement || ''
  const steps = ep.steps || ''
  const stretching = ep.stretching || false
  const nutrition = ep.nutrition || []

  const update = (key, val) => updateEnergyProtocol(today, key, val)

  const tabs = isAr
    ? ['💧 الماء', '🌬 التنفس', '🏃 الحركة', '🥗 التغذية']
    : ['💧 Water', '🌬 Breathing', '🏃 Movement', '🥗 Nutrition']

  const breathProtocols = BREATHING_PROTOCOLS[lang]
  const nutritionItems = NUTRITION_ITEMS[lang]

  return (
    <Layout title={t('protocol_title')} subtitle={t('protocol_subtitle')}>
      <div className="space-y-4 pt-2">

        {/* Summary Row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: isAr ? 'ماء' : 'Water', value: `${water}/8`, color: '#3498db' },
            { label: isAr ? 'برد' : 'Cold', value: coldExposure ? '✅' : '○', color: '#1abc9c' },
            { label: isAr ? 'تمدد' : 'Stretch', value: stretching ? '✅' : '○', color: '#2ecc71' },
            { label: isAr ? 'تغذية' : 'Nutrition', value: `${nutrition.length}/${nutritionItems.length}`, color: '#c9a84c' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-2 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="text-base font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#888', fontSize: 9 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          {tabs.map((tab_label, i) => (
            <button key={i} onClick={() => setTab(i)}
              className="py-2 text-xs font-bold transition-all"
              style={{ background: tab === i ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === i ? '#c9a84c' : '#666', borderRight: i < 3 ? '1px solid #2a2a2a' : 'none' }}>
              {tab_label}
            </button>
          ))}
        </div>

        {/* Tab 0: Water */}
        {tab === 0 && (
          <div className="rounded-2xl p-5" style={{ background: '#0e0e0e', border: '1px solid rgba(52,152,219,0.2)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#3498db' }}>
              💧 {isAr ? '8 أكواب يومياً' : '8 Glasses Daily'}
            </p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {Array.from({ length: 8 }, (_, i) => (
                <button key={i} onClick={() => update('water', i < water ? i : i + 1)}
                  className="aspect-square rounded-2xl flex flex-col items-center justify-center transition-all active:scale-90"
                  style={{
                    background: i < water ? 'rgba(52,152,219,0.2)' : '#1a1a1a',
                    border: `2px solid ${i < water ? '#3498db' : '#2a2a2a'}`,
                  }}>
                  <span className="text-xl">{i < water ? '💧' : '○'}</span>
                  <span className="text-xs font-bold mt-1" style={{ color: i < water ? '#3498db' : '#444' }}>{i + 1}</span>
                </button>
              ))}
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(52,152,219,0.06)', border: '1px solid rgba(52,152,219,0.15)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#3498db' }}>{isAr ? '💡 نصائح' : '💡 Tips'}</p>
              <p className="text-xs" style={{ color: '#888' }}>
                {isAr
                  ? '• اشرب 500 مل فور الاستيقاظ\n• أضف عصير ليمون للقلوية'
                  : '• Drink 500ml upon waking\n• Add lemon for alkalinity'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 1: Breathing */}
        {tab === 1 && (
          <div className="space-y-3">
            {breathProtocols.map(protocol => (
              <div key={protocol.key} className="rounded-2xl p-4"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-black text-white text-sm">{protocol.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#888' }}>{protocol.desc}</p>
                    {protocol.pattern && (
                      <div className="flex gap-1 mt-2">
                        {protocol.pattern.map((n, i) => {
                          const phaseNames = isAr
                            ? ['استنشق', 'احتفظ', 'أزفر', 'احتفظ']
                            : ['Inhale', 'Hold', 'Exhale', 'Hold']
                          return (
                            <span key={i} className="text-xs rounded-full px-2 py-0.5"
                              style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
                              {phaseNames[i]} {n}s
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setActiveBreathing(protocol)}
                    className="rounded-xl px-4 py-2 text-xs font-bold ml-3"
                    style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}>
                    {isAr ? 'ابدأ' : 'Start'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Movement */}
        {tab === 2 && (
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="font-bold text-white text-sm mb-3">
                {isAr ? '🏃 حركة الصباح' : '🏃 Morning Movement'}
              </p>
              <input value={morningMovement} onChange={e => update('morningMovement', e.target.value)}
                placeholder={isAr ? 'نوع التمرين + المدة (مثال: جري 20 دقيقة)' : 'Type + duration (e.g. Running 20 min)'}
                style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '10px 14px', width: '100%', fontSize: 13 }} />
            </div>

            <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="font-bold text-white text-sm mb-3">
                {isAr ? '👣 الخطوات اليومية' : '👣 Daily Steps'}
              </p>
              <input value={steps} onChange={e => update('steps', e.target.value)} type="number"
                placeholder={isAr ? 'عدد الخطوات' : 'Number of steps'}
                style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '10px 14px', width: '100%', fontSize: 13 }} />
            </div>

            {[
              { key: 'stretching', val: stretching, label: isAr ? '🧘 تمارين التمدد' : '🧘 Stretching', color: '#2ecc71' },
              { key: 'coldExposure', val: coldExposure, label: isAr ? '🧊 تعرض للبرد' : '🧊 Cold Exposure', color: '#1abc9c' },
            ].map(item => (
              <button key={item.key} onClick={() => update(item.key, !item.val)}
                className="w-full rounded-2xl p-4 flex items-center justify-between transition-all"
                style={{ background: item.val ? `${item.color}15` : '#1a1a1a', border: `1px solid ${item.val ? `${item.color}40` : '#2a2a2a'}` }}>
                <span className="font-bold text-white text-sm">{item.label}</span>
                <div className="w-12 h-6 rounded-full relative transition-all"
                  style={{ background: item.val ? item.color : '#333' }}>
                  <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                    style={{ left: item.val ? '25px' : '2px' }} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: Nutrition */}
        {tab === 3 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.15)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#c9a84c' }}>
              🥗 {isAr ? 'قائمة التغذية القوية' : 'Power Foods Checklist'}
            </p>
            <div className="space-y-2">
              {nutritionItems.map((item, i) => {
                const checked = nutrition.includes(i)
                return (
                  <button key={i} onClick={() => update('nutrition', checked ? nutrition.filter(n => n !== i) : [...nutrition, i])}
                    className="w-full rounded-xl p-3 flex items-center gap-3 transition-all"
                    style={{ background: checked ? 'rgba(46,204,113,0.1)' : '#1a1a1a', border: `1px solid ${checked ? 'rgba(46,204,113,0.3)' : '#2a2a2a'}` }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: checked ? '#2ecc71' : '#2a2a2a', border: `2px solid ${checked ? '#2ecc71' : '#444'}` }}>
                      {checked && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-sm" style={{ color: checked ? 'white' : '#888' }}>{item}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 rounded-xl p-3 text-center" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <p className="text-sm font-black" style={{ color: '#c9a84c' }}>
                {nutrition.length}/{nutritionItems.length}
              </p>
              <p className="text-xs" style={{ color: '#888' }}>
                {isAr ? 'عناصر غذائية اليوم' : 'Nutrition items today'}
              </p>
            </div>
          </div>
        )}

      </div>

      {activeBreathing && (
        <BreathingTimer protocol={activeBreathing} isAr={isAr} onClose={() => setActiveBreathing(null)} />
      )}
    </Layout>
  )
}
