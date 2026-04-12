import { useState } from 'react'
import { ChevronUp, ChevronDown, Plus, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'

const PRESET_VALUES = [
  { ar: 'الحب',         en: 'Love' },
  { ar: 'الحرية',       en: 'Freedom' },
  { ar: 'النجاح',       en: 'Success' },
  { ar: 'الصحة',        en: 'Health' },
  { ar: 'النمو',        en: 'Growth' },
  { ar: 'الأمان',       en: 'Security' },
  { ar: 'المغامرة',     en: 'Adventure' },
  { ar: 'الأسرة',       en: 'Family' },
  { ar: 'الإبداع',      en: 'Creativity' },
  { ar: 'الإيمان',      en: 'Faith' },
  { ar: 'السعادة',      en: 'Happiness' },
  { ar: 'التأثير',      en: 'Impact' },
  { ar: 'الخدمة',       en: 'Service' },
  { ar: 'الاحترام',     en: 'Respect' },
  { ar: 'الانضباط',     en: 'Discipline' },
  { ar: 'الشجاعة',      en: 'Courage' },
  { ar: 'الامتنان',     en: 'Gratitude' },
  { ar: 'التعلم',       en: 'Learning' },
  { ar: 'الصدق',        en: 'Integrity' },
  { ar: 'الثروة',       en: 'Wealth' },
  { ar: 'المرونة',      en: 'Resilience' },
  { ar: 'السلام',       en: 'Peace' },
  { ar: 'القيادة',      en: 'Leadership' },
  { ar: 'الاستقلالية',  en: 'Independence' },
  { ar: 'الوفاء',       en: 'Loyalty' },
  { ar: 'الجمال',       en: 'Beauty' },
  { ar: 'التوازن',      en: 'Balance' },
  { ar: 'الفضول',       en: 'Curiosity' },
  { ar: 'العدالة',      en: 'Justice' },
  { ar: 'التعاون',      en: 'Teamwork' },
  { ar: 'الطموح',       en: 'Ambition' },
  { ar: 'القوة',        en: 'Strength' },
  { ar: 'التواضع',      en: 'Humility' },
  { ar: 'الرحمة',       en: 'Compassion' },
  { ar: 'الصبر',        en: 'Patience' },
  { ar: 'الابتكار',     en: 'Innovation' },
  { ar: 'الروحانية',    en: 'Spirituality' },
  { ar: 'المتعة',       en: 'Joy' },
  { ar: 'الحكمة',       en: 'Wisdom' },
  { ar: 'النزاهة',      en: 'Authenticity' },
]

const MEDAL = ['🥇', '🥈', '🥉']

const STEP_LABELS = {
  ar: ['اختر قيمك', 'رتّب قيمك', 'حلّل القواعد', 'داخلي / خارجي'],
  en: ['Choose Values', 'Rank Values', 'Analyze Rules', 'Internal / External'],
}

export default function ValuesHierarchy() {
  const { state, update } = useApp()
  const { lang, dir } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const saved = state.valuesHierarchy || {}
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(saved.selected || [])
  const [ranked, setRanked] = useState(saved.ranked || [])
  const [rules, setRules] = useState(saved.rules || {})
  const [classification, setClassification] = useState(saved.classification || {})
  const [customInput, setCustomInput] = useState('')

  const labelKey = isAr ? 'ar' : 'en'

  // --- Step 1 helpers ---
  const toggleValue = (v) => {
    const key = v.ar
    if (selected.includes(key)) {
      setSelected(selected.filter(s => s !== key))
    } else {
      if (selected.length >= 15) {
        showToast(isAr ? 'الحد الأقصى 15 قيمة' : 'Max 15 values', 'warning')
        return
      }
      setSelected([...selected, key])
    }
  }

  const addCustom = () => {
    const val = customInput.trim()
    if (!val) return
    if (selected.length >= 15) {
      showToast(isAr ? 'الحد الأقصى 15 قيمة' : 'Max 15 values', 'warning')
      return
    }
    if (selected.includes(val)) return
    setSelected([...selected, val])
    setCustomInput('')
  }

  // --- Step 2 helpers ---
  const initRanked = () => {
    const r = ranked.length > 0
      ? ranked.filter(v => selected.includes(v))
      : [...selected]
    const missing = selected.filter(v => !r.includes(v))
    setRanked([...r, ...missing])
  }

  const moveUp = (i) => {
    if (i === 0) return
    const r = [...ranked]
    ;[r[i - 1], r[i]] = [r[i], r[i - 1]]
    setRanked(r)
  }

  const moveDown = (i) => {
    if (i === ranked.length - 1) return
    const r = [...ranked]
    ;[r[i], r[i + 1]] = [r[i + 1], r[i]]
    setRanked(r)
  }

  // --- Resolve display label ---
  const getLabel = (key) => {
    const preset = PRESET_VALUES.find(v => v.ar === key)
    if (preset) return preset[labelKey]
    return key
  }

  // --- Step 3 helpers ---
  const ruleEase = (rule) => {
    if (!rule || rule.trim().length < 10) return null
    const vague = ['أشعر', 'feel', 'happy', 'سعيد', 'تلقائي', 'naturally'].some(w =>
      rule.toLowerCase().includes(w.toLowerCase())
    )
    return vague
      ? { easy: true, label: isAr ? '✅ سهل التحقيق' : '✅ Easy to meet' }
      : { easy: false, label: isAr ? '⚡ صعب التحقيق' : '⚡ Hard to meet' }
  }

  // --- Save ---
  const saveAll = () => {
    update('valuesHierarchy', { selected, ranked, rules, classification })
    showToast(isAr ? 'تم الحفظ ✓' : 'Saved ✓', 'success')
  }

  // --- Navigation ---
  const goNext = () => {
    if (step === 0) {
      if (selected.length < 3) {
        showToast(isAr ? 'اختر 3 قيم على الأقل' : 'Choose at least 3 values', 'warning')
        return
      }
      initRanked()
    }
    if (step === 3) { saveAll(); return }
    setStep(s => s + 1)
  }

  const goPrev = () => setStep(s => Math.max(0, s - 1))

  // Top 5 from ranked
  const top5 = ranked.slice(0, 5)

  // External heavy insight
  const extCount = top5.filter(v => classification[v] === 'external').length
  const intCount = top5.filter(v => classification[v] === 'internal').length

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6" dir={dir}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#c9a84c' }}>
            {isAr ? 'هرم القيم' : 'Values Hierarchy'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isAr ? 'اكتشف ما يحرّكك في الأعماق' : 'Discover what truly drives you'}
          </p>
        </div>

        {/* Step progress */}
        <div className="flex gap-2 mb-6">
          {STEP_LABELS[isAr ? 'ar' : 'en'].map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className="h-1 rounded-full mb-1"
                style={{ background: i <= step ? '#c9a84c' : '#333' }}
              />
              <span className="text-xs" style={{ color: i === step ? '#c9a84c' : '#666' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── STEP 0: Select Values ── */}
        {step === 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white">
                {isAr ? 'ما هي قيمك؟' : 'What are your values?'}
              </h2>
              <span className="text-sm" style={{ color: '#c9a84c' }}>
                {selected.length}/15
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {isAr ? 'اضغط على القيم التي تُعبّر عنك (اختر حتى 15)' : 'Tap values that resonate with you (up to 15)'}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_VALUES.map(v => {
                const isOn = selected.includes(v.ar)
                return (
                  <button
                    key={v.ar}
                    onClick={() => toggleValue(v)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={isOn
                      ? { background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }
                      : { background: '#1a1a1a', border: '1px solid #333', color: '#ccc' }
                    }
                  >
                    {isOn && <Check size={12} className="inline mr-1" />}
                    {v[labelKey]}
                  </button>
                )
              })}
            </div>

            {/* Custom value */}
            <div
              className="p-3 rounded-xl mb-4"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}
            >
              <p className="text-xs text-gray-400 mb-2">
                {isAr ? 'أضف قيمة مخصصة:' : 'Add a custom value:'}
              </p>
              <div className="flex gap-2">
                <input
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustom()}
                  placeholder={isAr ? 'اكتب قيمة...' : 'Type a value...'}
                  className="flex-1 bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
                <button
                  onClick={addCustom}
                  className="p-2 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {selected.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">
                  {isAr ? 'القيم المختارة:' : 'Selected:'}
                </p>
                <div className="flex flex-wrap gap-1">
                  {selected.map(key => (
                    <span
                      key={key}
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}
                    >
                      {getLabel(key)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Rank Values ── */}
        {step === 1 && (
          <div>
            <h2 className="font-semibold text-white mb-1">
              {isAr ? 'رتّب قيمك' : 'Rank Your Values'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {isAr
                ? 'استخدم الأسهم لترتيب القيم من الأهم إلى الأقل أهمية'
                : 'Use arrows to order your values from most to least important'}
            </p>

            <div className="space-y-2">
              {ranked.map((key, i) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: i < 3 ? 'rgba(201,168,76,0.08)' : '#111',
                    border: i < 3 ? '1px solid rgba(201,168,76,0.25)' : '1px solid #1e1e1e',
                  }}
                >
                  <span className="text-lg w-8 text-center">
                    {i < 3 ? MEDAL[i] : <span className="text-gray-600 text-sm">{i + 1}</span>}
                  </span>
                  <span className="flex-1 text-white font-medium">{getLabel(key)}</span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      className="p-1 rounded disabled:opacity-20"
                      style={{ color: '#c9a84c' }}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveDown(i)}
                      disabled={i === ranked.length - 1}
                      className="p-1 rounded disabled:opacity-20"
                      style={{ color: '#c9a84c' }}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Rules Analysis ── */}
        {step === 2 && (
          <div>
            <h2 className="font-semibold text-white mb-1">
              {isAr ? 'قواعد القيم' : 'Values Rules'}
            </h2>
            <p className="text-xs text-gray-500 mb-1">
              {isAr
                ? 'لكل قيمة من قيمك الخمس الأولى: متى تشعر أنك حقّقتها؟'
                : 'For each of your top 5 values: when do you feel you\'ve honored it?'}
            </p>
            <p className="text-xs text-gray-400 mb-4" style={{ color: '#c9a84c' }}>
              {isAr
                ? 'تذكّر: القواعد الغامضة ("أشعر بالسعادة") أسهل تحقيقًا من القواعد الصارمة ("عندما أحقق X بالضبط")'
                : 'Tip: vague rules ("when I feel happy") are easier to meet than rigid rules ("when I achieve exactly X")'}
            </p>

            <div className="space-y-4">
              {top5.map((key, i) => {
                const ease = ruleEase(rules[key])
                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl"
                    style={{ background: '#111', border: '1px solid #1e1e1e' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span>{i < 3 ? MEDAL[i] : `${i + 1}.`}</span>
                      <span className="font-semibold" style={{ color: '#c9a84c' }}>{getLabel(key)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {isAr
                        ? `متى تشعر أنك حقّقت قيمة "${getLabel(key)}"؟`
                        : `When do you feel you've honored "${getLabel(key)}"?`}
                    </p>
                    <textarea
                      value={rules[key] || ''}
                      onChange={e => setRules({ ...rules, [key]: e.target.value })}
                      placeholder={isAr ? 'أكتب قاعدتك هنا...' : 'Write your rule here...'}
                      rows={2}
                      className="w-full bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                    />
                    {ease && (
                      <span
                        className="text-xs mt-1 inline-block"
                        style={{ color: ease.easy ? '#4ade80' : '#f87171' }}
                      >
                        {ease.label}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Internal vs External ── */}
        {step === 3 && (
          <div>
            <h2 className="font-semibold text-white mb-1">
              {isAr ? 'داخلي أم خارجي؟' : 'Internal vs External?'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {isAr
                ? 'كل قيمة: هل تعتمد على شيء بداخلك أم على الظروف الخارجية؟'
                : 'For each value: does it come from within you or depend on outside circumstances?'}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-center">
              <div
                className="p-2 rounded-lg text-xs"
                style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}
              >
                {isAr ? '🧠 داخلي — أنت تتحكم به دائمًا' : '🧠 Internal — always in your control'}
              </div>
              <div
                className="p-2 rounded-lg text-xs"
                style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
              >
                {isAr ? '🌍 خارجي — يعتمد على الآخرين/الظروف' : '🌍 External — depends on others/circumstances'}
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {top5.map((key, i) => {
                const c = classification[key]
                return (
                  <div
                    key={key}
                    className="p-3 rounded-xl"
                    style={{ background: '#111', border: '1px solid #1e1e1e' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span>{i < 3 ? MEDAL[i] : `${i + 1}.`}</span>
                      <span className="font-medium text-white">{getLabel(key)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setClassification({ ...classification, [key]: 'internal' })}
                        className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-all"
                        style={c === 'internal'
                          ? { background: 'rgba(74,222,128,0.2)', border: '1px solid #4ade80', color: '#4ade80' }
                          : { background: '#1a1a1a', border: '1px solid #333', color: '#666' }
                        }
                      >
                        {isAr ? '🧠 داخلي' : '🧠 Internal'}
                      </button>
                      <button
                        onClick={() => setClassification({ ...classification, [key]: 'external' })}
                        className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-all"
                        style={c === 'external'
                          ? { background: 'rgba(248,113,113,0.2)', border: '1px solid #f87171', color: '#f87171' }
                          : { background: '#1a1a1a', border: '1px solid #333', color: '#666' }
                        }
                      >
                        {isAr ? '🌍 خارجي' : '🌍 External'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Insight */}
            {(intCount + extCount) > 0 && (
              <div
                className="p-4 rounded-xl mb-2"
                style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: '#c9a84c' }}>
                  {isAr ? '💡 رؤية شخصية' : '💡 Personal Insight'}
                </p>
                {extCount > intCount ? (
                  <p className="text-xs text-gray-300">
                    {isAr
                      ? `${extCount} من قيمك الخمس الأولى خارجية — هذا يجعل سعادتك هشّة أمام تقلّبات الحياة. يوصي توني روبينز بتحويل القواعد لتعتمد على ما تتحكم فيه أنت.`
                      : `${extCount} of your top 5 values are external — this makes your happiness fragile. Tony Robbins recommends shifting your rules to depend on what you control.`}
                  </p>
                ) : (
                  <p className="text-xs text-gray-300">
                    {isAr
                      ? `رائع! ${intCount} من قيمك الأولى داخلية — هذا يعني أن سعادتك في يدك أنت.`
                      : `Excellent! ${intCount} of your top values are internal — your happiness is in your own hands.`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={goPrev}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc' }}
            >
              {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {isAr ? 'السابق' : 'Back'}
            </button>
          )}
          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}
          >
            {step === 3
              ? (isAr ? '💾 حفظ النتائج' : '💾 Save Results')
              : (isAr ? 'التالي' : 'Next')}
            {step < 3 && (isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />)}
          </button>
        </div>
      </div>
    </Layout>
  )
}
