import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const FIELDS = {
  ar: ['أعمال', 'صحة', 'علاقات', 'عقلية'],
  en: ['Business', 'Health', 'Relationships', 'Mindset'],
}

const STRATEGY_QUESTIONS = {
  ar: [
    { key: 'who', q: 'من حقق ما أريده؟' },
    { key: 'believe', q: 'ماذا يعتقدون؟' },
    { key: 'do', q: 'ماذا يفعلون؟' },
    { key: 'act', q: 'كيف يتصرفون؟' },
    { key: 'copy', q: 'ما الذي سأنسخه منهم اليوم؟' },
  ],
  en: [
    { key: 'who', q: 'Who already achieved what I want?' },
    { key: 'believe', q: 'What do they believe?' },
    { key: 'do', q: 'What do they do?' },
    { key: 'act', q: 'How do they act?' },
    { key: 'copy', q: 'What will I copy from them today?' },
  ],
}

const WEEKS = {
  ar: [
    { key: 'w1', label: 'الأسبوع 1', focus: 'تبني المعتقدات' },
    { key: 'w2', label: 'الأسبوع 2', focus: 'تطبيق الاستراتيجيات' },
    { key: 'w3', label: 'الأسبوع 3', focus: 'تكرار الأفعال' },
    { key: 'w4', label: 'الأسبوع 4', focus: 'مراجعة وتحسين' },
  ],
  en: [
    { key: 'w1', label: 'Week 1', focus: 'Beliefs Adoption' },
    { key: 'w2', label: 'Week 2', focus: 'Strategy Implementation' },
    { key: 'w3', label: 'Week 3', focus: 'Action Repetition' },
    { key: 'w4', label: 'Week 4', focus: 'Review & Refine' },
  ],
}

function ModelForm({ onSave, onCancel, isAr, lang }) {
  const [name, setName] = useState('')
  const [field, setField] = useState(0)
  const [modelFrom, setModelFrom] = useState('')
  const [beliefs, setBeliefs] = useState(['', '', ''])
  const [strategies, setStrategies] = useState(['', '', ''])
  const [actions, setActions] = useState(['', '', ''])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name, field, modelFrom, beliefs, strategies, actions })
  }

  const inputStyle = { background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 13 }

  return (
    <div className="space-y-3 rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.2)' }}>
      <p className="font-black text-white text-sm">{isAr ? 'إضافة نموذج جديد' : 'Add New Role Model'}</p>

      <input value={name} onChange={e => setName(e.target.value)} placeholder={isAr ? 'اسم النموذج' : 'Model Name'}
        style={inputStyle} />

      <div>
        <p className="text-xs mb-1.5" style={{ color: '#888' }}>{isAr ? 'المجال' : 'Field'}</p>
        <div className="flex gap-2 flex-wrap">
          {FIELDS[lang].map((f, i) => (
            <button key={i} onClick={() => setField(i)}
              className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
              style={{ background: field === i ? 'rgba(201,168,76,0.2)' : '#111', border: `1px solid ${field === i ? '#c9a84c' : '#333'}`, color: field === i ? '#c9a84c' : '#666' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <input value={modelFrom} onChange={e => setModelFrom(e.target.value)}
        placeholder={isAr ? 'ما الذي تريد نسخه منه؟' : 'What to model from them?'}
        style={inputStyle} />

      {[
        { label: isAr ? 'معتقداتهم الرئيسية' : 'Key Beliefs', vals: beliefs, set: setBeliefs },
        { label: isAr ? 'استراتيجياتهم الرئيسية' : 'Key Strategies', vals: strategies, set: setStrategies },
        { label: isAr ? 'أفعالهم الرئيسية' : 'Key Actions', vals: actions, set: setActions },
      ].map(({ label, vals, set }) => (
        <div key={label}>
          <p className="text-xs mb-1.5" style={{ color: '#888' }}>{label}</p>
          <div className="space-y-1.5">
            {vals.map((v, i) => (
              <input key={i} value={v} onChange={e => { const n = [...vals]; n[i] = e.target.value; set(n) }}
                placeholder={`${i + 1}.`} style={inputStyle} />
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <button onClick={handleSave} className="btn-gold flex-1 py-2 text-sm">{isAr ? 'حفظ النموذج' : 'Save Model'}</button>
        <button onClick={onCancel} className="btn-dark px-4 text-sm">{isAr ? 'إلغاء' : 'Cancel'}</button>
      </div>
    </div>
  )
}

export default function ModelingExcellence() {
  const { state, updateModeling } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const [tab, setTab] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const modeling = state.modeling || { models: [], strategyAnswers: {}, weeksDone: {} }
  const models = modeling.models || []
  const strategyAnswers = modeling.strategyAnswers || {}
  const weeksDone = modeling.weeksDone || {}

  const tabs = isAr
    ? ['نماذجي', 'استراتيجية النجاح', 'خطة التطبيق']
    : ['My Models', 'Success Strategy', 'Application Plan']

  const handleAddModel = (model) => {
    updateModeling('models', [...models, { id: Date.now(), ...model }])
    setShowForm(false)
  }

  const handleDeleteModel = (id) => {
    updateModeling('models', models.filter(m => m.id !== id))
  }

  const handleStrategyAnswer = (key, val) => {
    updateModeling('strategyAnswers', { ...strategyAnswers, [key]: val })
  }

  const handleWeekToggle = (key) => {
    updateModeling('weeksDone', { ...weeksDone, [key]: !weeksDone[key] })
  }

  const handleWeekNote = (key, note) => {
    updateModeling('weeksDone', { ...weeksDone, [`${key}_note`]: note })
  }

  const inputStyle = { background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 13 }

  return (
    <Layout title={t('modeling_title')} subtitle={t('modeling_subtitle')}>
      <div className="space-y-4 pt-2">

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          {tabs.map((tab_label, i) => (
            <button key={i} onClick={() => setTab(i)}
              className="flex-1 py-2.5 text-xs font-bold transition-all"
              style={{ background: tab === i ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === i ? '#c9a84c' : '#666', borderRight: i < 2 ? '1px solid #2a2a2a' : 'none' }}>
              {tab_label}
            </button>
          ))}
        </div>

        {/* Tab 0: My Models */}
        {tab === 0 && (
          <div className="space-y-3">
            {models.length === 0 && !showForm && (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🌟</p>
                <p className="text-sm" style={{ color: '#555' }}>
                  {isAr ? 'أضف نماذجك للنجاح' : 'Add your success role models'}
                </p>
              </div>
            )}

            {models.map(model => (
              <div key={model.id} className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-black text-white">{model.name}</p>
                    <span className="text-xs rounded-full px-2 py-0.5 mt-1 inline-block"
                      style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                      {FIELDS[lang][model.field]}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteModel(model.id)}
                    className="text-xs px-2 py-1 rounded-lg" style={{ background: '#2a2a2a', color: '#888' }}>✕</button>
                </div>
                {model.modelFrom && <p className="text-xs mt-2" style={{ color: '#aaa' }}>🎯 {model.modelFrom}</p>}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: isAr ? 'معتقدات' : 'Beliefs', items: model.beliefs },
                    { label: isAr ? 'استراتيجيات' : 'Strategies', items: model.strategies },
                    { label: isAr ? 'أفعال' : 'Actions', items: model.actions },
                  ].map(({ label, items }) => (
                    <div key={label} className="rounded-lg p-2" style={{ background: '#111' }}>
                      <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>{label}</p>
                      {(items || []).filter(Boolean).map((item, i) => (
                        <p key={i} className="text-xs" style={{ color: '#aaa' }}>• {item}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {showForm ? (
              <ModelForm onSave={handleAddModel} onCancel={() => setShowForm(false)} isAr={isAr} lang={lang} />
            ) : (
              <button onClick={() => setShowForm(true)}
                className="w-full rounded-2xl py-4 font-bold text-sm transition-all active:scale-[0.98]"
                style={{ background: 'rgba(201,168,76,0.08)', border: '2px dashed rgba(201,168,76,0.35)', color: '#c9a84c' }}>
                + {isAr ? 'أضف نموذجاً' : 'Add Role Model'}
              </button>
            )}
          </div>
        )}

        {/* Tab 1: Success Strategy */}
        {tab === 1 && (
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#c9a84c' }}>
                ✦ {isAr ? 'استراتيجية النجاح' : 'Success Strategy'}
              </p>
              <p className="text-xs" style={{ color: '#888' }}>
                {isAr ? 'أجب على هذه الأسئلة بصدق لتسريع نجاحك' : 'Answer honestly to accelerate your success'}
              </p>
            </div>
            {STRATEGY_QUESTIONS[lang].map(({ key, q }) => (
              <div key={key} className="rounded-xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <p className="text-sm font-bold text-white mb-2">❓ {q}</p>
                <textarea
                  value={strategyAnswers[key] || ''}
                  onChange={e => handleStrategyAnswer(key, e.target.value)}
                  placeholder={isAr ? 'اكتب إجابتك...' : 'Write your answer...'}
                  className="w-full rounded-xl p-3 text-sm resize-none"
                  style={{ background: '#111', border: '1px solid #333', color: 'white', minHeight: 70 }}
                  rows={3}
                />
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Application Plan */}
        {tab === 2 && (
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#c9a84c' }}>
                ✦ {isAr ? 'خطة 30 يوم للتطبيق' : '30-Day Application Plan'}
              </p>
            </div>
            {WEEKS[lang].map(w => {
              const isDone = weeksDone[w.key]
              const note = weeksDone[`${w.key}_note`] || ''
              return (
                <div key={w.key} className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: `1px solid ${isDone ? 'rgba(46,204,113,0.3)' : '#2a2a2a'}` }}>
                  <div className="flex items-start gap-3 mb-3">
                    <button onClick={() => handleWeekToggle(w.key)}
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: isDone ? '#2ecc71' : '#2a2a2a', border: `2px solid ${isDone ? '#2ecc71' : '#444'}` }}>
                      {isDone && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div className="flex-1">
                      <p className="font-black text-white text-sm">{w.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#c9a84c' }}>{w.focus}</p>
                    </div>
                  </div>
                  <textarea
                    value={note}
                    onChange={e => handleWeekNote(w.key, e.target.value)}
                    placeholder={isAr ? 'ملاحظاتك لهذا الأسبوع...' : 'Your notes for this week...'}
                    className="w-full rounded-xl p-3 text-xs resize-none"
                    style={{ background: '#111', border: '1px solid #333', color: 'white', minHeight: 60 }}
                    rows={2}
                  />
                </div>
              )
            })}
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <p className="text-xs" style={{ color: '#888' }}>
                {isAr ? 'أسابيع مكتملة:' : 'Weeks completed:'} {' '}
                <span style={{ color: '#c9a84c', fontWeight: 'bold' }}>
                  {WEEKS[lang].filter(w => weeksDone[w.key]).length}/4
                </span>
              </p>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
