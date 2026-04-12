import { useState } from 'react'
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const STEPS_DATA = {
  ar: [
    {
      num: 1,
      title: 'تعريف الخوف بوضوح',
      question: 'ما الذي تخاف منه بالضبط؟ صِف الخوف بأدق تفاصيله.',
      emoji: '🔍',
      color: '#e63946',
    },
    {
      num: 2,
      title: 'استشعار تكلفة الخوف',
      question: 'ماذا يكلفك هذا الخوف؟ ما الذي تخسره بسببه كل يوم؟',
      emoji: '💰',
      color: '#e67e22',
    },
    {
      num: 3,
      title: 'اكتشف هدية الخوف',
      question: 'ما الذي يحميك أو يعلمك هذا الخوف؟ ما هديته المخفية؟',
      emoji: '🎁',
      color: '#f1c40f',
    },
    {
      num: 4,
      title: 'حوّل الخوف لطاقة',
      question: 'كيف يمكنك استخدام طاقة هذا الخوف كوقود للتقدم؟',
      emoji: '⚡',
      color: '#2ecc71',
    },
    {
      num: 5,
      title: 'اتخذ إجراءاً فورياً',
      question: 'ما الخطوة الأصغر التي يمكنك اتخاذها الآن فوراً نحو ما تخاف منه؟',
      emoji: '🚀',
      color: '#c9a84c',
    },
  ],
  en: [
    {
      num: 1,
      title: 'Define the Fear Clearly',
      question: 'What exactly are you afraid of? Describe the fear in precise detail.',
      emoji: '🔍',
      color: '#e63946',
    },
    {
      num: 2,
      title: 'Feel the Cost of Fear',
      question: 'What does staying afraid cost you? What are you losing every day because of it?',
      emoji: '💰',
      color: '#e67e22',
    },
    {
      num: 3,
      title: 'Find the Gift of Fear',
      question: 'What is this fear protecting or teaching you? What is its hidden gift?',
      emoji: '🎁',
      color: '#f1c40f',
    },
    {
      num: 4,
      title: 'Transform Fear to Fuel',
      question: 'How can you use the energy of this fear as fuel for progress?',
      emoji: '⚡',
      color: '#2ecc71',
    },
    {
      num: 5,
      title: 'Take Immediate Action',
      question: "What's the smallest step you can take RIGHT NOW toward what you fear?",
      emoji: '🚀',
      color: '#c9a84c',
    },
  ],
}

function FearCard({ fear, onUpdate, onDelete, lang }) {
  const isAr = lang === 'ar'
  const STEPS = STEPS_DATA[lang]
  const [expanded, setExpanded] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const steps = fear.steps || {}
  const completedSteps = STEPS.filter(s => (steps[s.num] || '').trim().length > 0).length
  const pct = Math.round((completedSteps / STEPS.length) * 100)
  const allDone = completedSteps === STEPS.length

  const setStep = (stepNum, val) => {
    const newSteps = { ...steps, [stepNum]: val }
    onUpdate(fear.id, { steps: newSteps })
  }

  const toggleDone = () => onUpdate(fear.id, { done: !fear.done })

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: fear.done ? 'rgba(46,204,113,0.06)' : '#1a1a1a',
        border: `1px solid ${fear.done ? 'rgba(46,204,113,0.25)' : '#2a2a2a'}`,
      }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button onClick={toggleDone}
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
            style={{
              background: fear.done ? '#2ecc71' : 'transparent',
              border: `2px solid ${fear.done ? '#2ecc71' : '#333'}`,
            }}>
            {fear.done && <span className="text-xs text-white font-black">✓</span>}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-snug">{fear.fear}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#111' }}>
                <div className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: allDone ? '#2ecc71' : 'linear-gradient(90deg, #e63946, #c9a84c)' }} />
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: allDone ? '#2ecc71' : '#666' }}>
                {completedSteps}/{STEPS.length}
              </span>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => setExpanded(!expanded)} className="p-1.5" style={{ color: '#666' }}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button onClick={() => onDelete(fear.id)} className="p-1.5" style={{ color: '#444' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t animate-fade-in" style={{ borderColor: '#222' }}>
          {/* Step selector */}
          <div className="flex gap-1 p-3 pb-0 overflow-x-auto">
            {STEPS.map((step, i) => {
              const filled = (steps[step.num] || '').trim().length > 0
              return (
                <button key={step.num}
                  onClick={() => setActiveStep(i)}
                  className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: activeStep === i ? `${step.color}15` : '#111',
                    border: `1px solid ${activeStep === i ? step.color + '55' : '#1e1e1e'}`,
                  }}>
                  <span className="text-base">{filled ? '✓' : step.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: activeStep === i ? step.color : '#555', whiteSpace: 'nowrap', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isAr ? `${step.num}` : `${step.num}`}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Step */}
          <div className="p-4">
            {(() => {
              const step = STEPS[activeStep]
              return (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{step.emoji}</span>
                    <p className="text-sm font-black text-white">{step.title}</p>
                  </div>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: '#888' }}>{step.question}</p>
                  <textarea
                    value={steps[step.num] || ''}
                    onChange={e => setStep(step.num, e.target.value)}
                    placeholder={isAr ? 'اكتب إجابتك هنا...' : 'Write your reflection here...'}
                    rows={4}
                    className="input-dark resize-none text-sm w-full"
                  />
                  {activeStep < STEPS.length - 1 && (
                    <button
                      onClick={() => setActiveStep(activeStep + 1)}
                      className="w-full mt-2 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{ background: `${step.color}15`, color: step.color, border: `1px solid ${step.color}30` }}>
                      {isAr ? 'الخطوة التالية ←' : 'Next Step →'}
                    </button>
                  )}
                  {activeStep === STEPS.length - 1 && allDone && (
                    <button onClick={toggleDone}
                      className="w-full mt-2 py-2 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(46,204,113,0.15)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.3)' }}>
                      {fear.done ? (isAr ? '↩ أعد فتح الخوف' : '↩ Reopen fear') : (isAr ? '🏆 حوّلت هذا الخوف!' : '🏆 Transformed this fear!')}
                    </button>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FearToFpower() {
  const { state, addFear, updateFear, deleteFear } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const [newFear, setNewFear] = useState('')
  const fears = (state.fearToFpower || {}).fears || []

  const activeFears = fears.filter(f => !f.done)
  const doneFears   = fears.filter(f => f.done)

  const handleAdd = () => {
    const trimmed = newFear.trim()
    if (!trimmed) return
    addFear(trimmed)
    setNewFear('')
  }

  return (
    <Layout title={t('fear_title')} subtitle={t('fear_subtitle')} helpKey="fear">
      <div className="space-y-4 pt-2">

        {/* Hero */}
        <div className="rounded-2xl p-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(155,89,182,0.12), #1a1a1a)', border: '1px solid rgba(155,89,182,0.3)' }}>
          <p className="text-4xl mb-2">🦁</p>
          <p className="text-sm font-bold text-white mb-1">
            {isAr ? 'الخوف ليس عدوك — إنه معلمك' : 'Fear is not your enemy — it\'s your teacher'}
          </p>
          <p className="text-xs" style={{ color: '#888' }}>
            {isAr
              ? 'كل خوف يحمل طاقة هائلة — تعلّم تحويلها'
              : 'Every fear carries enormous energy — learn to transform it'}
          </p>
        </div>

        {/* Add Fear */}
        <div className="card">
          <p className="text-sm font-bold text-white mb-2">
            {isAr ? '+ أضف خوفاً أو تحدياً' : '+ Add a fear or challenge'}
          </p>
          <div className="flex gap-2">
            <textarea
              value={newFear}
              onChange={e => setNewFear(e.target.value)}
              placeholder={isAr ? 'اكتب الخوف أو التحدي الذي تواجهه...' : 'Describe the fear or challenge you face...'}
              rows={2}
              className="input-dark resize-none text-sm flex-1"
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAdd() }}
            />
            <button onClick={handleAdd}
              className="flex-shrink-0 w-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(155,89,182,0.2)', border: '1px solid rgba(155,89,182,0.4)', color: '#9b59b6' }}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Stats */}
        {fears.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: isAr ? 'الكل' : 'Total',     value: fears.length,    color: '#888' },
              { label: isAr ? 'نشط' : 'Active',     value: activeFears.length, color: '#9b59b6' },
              { label: isAr ? 'محوّل' : 'Transformed', value: doneFears.length, color: '#2ecc71' },
            ].map(s => (
              <div key={s.label} className="card text-center py-3">
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#666' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Active Fears */}
        {activeFears.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9b59b6' }}>
              {isAr ? '⚡ مخاوف قيد المعالجة' : '⚡ Fears in Process'}
            </p>
            <div className="space-y-3">
              {activeFears.map(fear => (
                <FearCard key={fear.id} fear={fear} onUpdate={updateFear} onDelete={deleteFear} lang={lang} />
              ))}
            </div>
          </div>
        )}

        {/* Transformed Fears */}
        {doneFears.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2ecc71' }}>
              🏆 {isAr ? 'مخاوف محوّلة إلى قوة' : 'Fears Transformed to Power'}
            </p>
            <div className="space-y-3">
              {doneFears.map(fear => (
                <FearCard key={fear.id} fear={fear} onUpdate={updateFear} onDelete={deleteFear} lang={lang} />
              ))}
            </div>
          </div>
        )}

        {fears.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">🦁</p>
            <p className="text-base font-bold text-white mb-2">
              {isAr ? 'لا مخاوف بعد' : 'No fears yet'}
            </p>
            <p className="text-sm" style={{ color: '#666' }}>
              {isAr ? 'أضف أول خوف أو تحدٍّ تواجهه' : 'Add your first fear or challenge'}
            </p>
          </div>
        )}

        {/* Steps Overview */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.15)' }}>
          <p className="text-xs font-bold mb-3" style={{ color: '#9b59b6' }}>
            {isAr ? '🗺️ خطوات التحويل الخمس' : '🗺️ The 5 Transformation Steps'}
          </p>
          <div className="space-y-2">
            {STEPS_DATA[lang].map(step => (
              <div key={step.num} className="flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{step.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{step.title}</p>
                  <p className="text-xs" style={{ color: '#555' }}>{step.question}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
