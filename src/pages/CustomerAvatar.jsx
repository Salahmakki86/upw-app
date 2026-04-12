/**
 * Customer Avatar Builder
 * Based on Tony Robbins' Core Customer methodology
 * Supports multiple avatars, bilingual AR/EN
 */
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const INCOME_OPTIONS = {
  ar: ['أقل من $2k', '$2k–$5k', '$5k–$10k', '$10k+/شهر'],
  en: ['< $2k/mo', '$2k–$5k/mo', '$5k–$10k/mo', '$10k+/mo'],
}

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'Email', 'WhatsApp']

const GENDER_OPTIONS = {
  ar: ['أنثى', 'ذكر', 'آخر'],
  en: ['Female', 'Male', 'Other'],
}

const BLANK_AVATAR = {
  id: null,
  name: '',
  ageRange: '',
  gender: '',
  location: '',
  income: '',
  jobTitle: '',
  painPoints: ['', '', '', '', ''],
  desiredOutcomes: ['', '', '', '', ''],
  biggestFear: '',
  biggestDream: '',
  platforms: [],
  buyingTriggers: '',
  objections: ['', '', ''],
  budgetComfort: '',
  internalDialogue: '',
  transformationFrom: '',
  transformationTo: '',
  isPrimary: false,
}

const labelStyle = {
  color: '#c9a84c',
  fontSize: 10,
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: 2,
  display: 'block',
  marginBottom: 4,
}

const inputStyle = {
  background: '#111',
  border: '1px solid #333',
  color: 'white',
  borderRadius: 12,
  padding: '10px 14px',
  width: '100%',
  fontSize: 13,
  outline: 'none',
}

const cardStyle = {
  background: '#0e0e0e',
  border: '1px solid #1e1e1e',
  borderRadius: 16,
}

export default function CustomerAvatar() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const avatars = state.customerAvatars || []

  const [mode, setMode] = useState('list')   // 'list' | 'form' | 'view'
  const [editingId, setEditingId] = useState(null)
  const [viewingId, setViewingId] = useState(null)
  const [form, setForm] = useState({ ...BLANK_AVATAR })

  // ── helpers ───────────────────────────────────────────────────────────────

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const setListItem = (key, idx, val) =>
    setForm(f => {
      const arr = [...f[key]]
      arr[idx] = val
      return { ...f, [key]: arr }
    })

  const togglePlatform = (p) =>
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter(x => x !== p)
        : [...f.platforms, p],
    }))

  const openNew = () => {
    setForm({ ...BLANK_AVATAR, id: Date.now() })
    setEditingId(null)
    setMode('form')
  }

  const openEdit = (avatar) => {
    setForm({ ...BLANK_AVATAR, ...avatar })
    setEditingId(avatar.id)
    setMode('form')
  }

  const openView = (id) => {
    setViewingId(id)
    setMode('view')
  }

  const saveForm = () => {
    if (!form.name.trim()) return
    const entry = { ...form, id: editingId || form.id || Date.now() }

    let next
    if (editingId) {
      next = avatars.map(a => a.id === editingId ? entry : a)
    } else {
      next = [...avatars, entry]
    }

    // If this avatar is set primary, clear primary on others
    if (entry.isPrimary) {
      next = next.map(a => a.id === entry.id ? a : { ...a, isPrimary: false })
    }

    update('customerAvatars', next)
    setMode('list')
  }

  const deleteAvatar = (id) => {
    update('customerAvatars', avatars.filter(a => a.id !== id))
    if (viewingId === id) setMode('list')
  }

  const setPrimary = (id) => {
    update('customerAvatars', avatars.map(a => ({ ...a, isPrimary: a.id === id })))
  }

  const getInitial = (name) => (name || '?').charAt(0).toUpperCase()

  const viewingAvatar = avatars.find(a => a.id === viewingId)

  // ── FORM view ─────────────────────────────────────────────────────────────

  if (mode === 'form') {
    return (
      <Layout
        title={isAr ? 'بناء الأفاتار' : 'Build Avatar'}
        subtitle={isAr ? 'من هو عميلك المثالي؟' : 'Who is your ideal customer?'}
      >
        <div className="space-y-4 pt-2">

          {/* Name */}
          <div style={cardStyle} className="p-4">
            <span style={labelStyle}>{isAr ? 'اسم الأفاتار' : 'Avatar Name'}</span>
            <input
              style={inputStyle}
              placeholder={isAr ? 'مثال: سارة الباحثة الروحية' : 'e.g. Spiritual Seeker Sarah'}
              value={form.name}
              onChange={e => setF('name', e.target.value)}
            />
          </div>

          {/* Demographics */}
          <div style={cardStyle} className="p-4 space-y-3">
            <span style={labelStyle}>{isAr ? 'التفاصيل الديموغرافية' : 'Demographics'}</span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#888' }}>
                  {isAr ? 'الفئة العمرية' : 'Age Range'}
                </label>
                <input
                  style={{ ...inputStyle, fontSize: 12 }}
                  placeholder={isAr ? 'مثال: 28–40' : 'e.g. 28–40'}
                  value={form.ageRange}
                  onChange={e => setF('ageRange', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#888' }}>
                  {isAr ? 'الجنس' : 'Gender'}
                </label>
                <select
                  style={{ ...inputStyle, fontSize: 12 }}
                  value={form.gender}
                  onChange={e => setF('gender', e.target.value)}
                >
                  <option value="">—</option>
                  {GENDER_OPTIONS[isAr ? 'ar' : 'en'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#888' }}>
                  {isAr ? 'الموقع' : 'Location'}
                </label>
                <input
                  style={{ ...inputStyle, fontSize: 12 }}
                  placeholder={isAr ? 'مثال: السعودية / الخليج' : 'e.g. US / Gulf'}
                  value={form.location}
                  onChange={e => setF('location', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#888' }}>
                  {isAr ? 'الدخل الشهري' : 'Monthly Income'}
                </label>
                <select
                  style={{ ...inputStyle, fontSize: 12 }}
                  value={form.income}
                  onChange={e => setF('income', e.target.value)}
                >
                  <option value="">—</option>
                  {INCOME_OPTIONS[isAr ? 'ar' : 'en'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>
                {isAr ? 'المسمى الوظيفي' : 'Job / Title'}
              </label>
              <input
                style={inputStyle}
                placeholder={isAr ? 'مثال: مدربة، ربة بيت، رائدة أعمال' : 'e.g. Coach, Entrepreneur, Stay-at-home mom'}
                value={form.jobTitle}
                onChange={e => setF('jobTitle', e.target.value)}
              />
            </div>
          </div>

          {/* Pain Points */}
          <div style={cardStyle} className="p-4 space-y-2">
            <span style={labelStyle}>
              {isAr ? 'نقاط الألم (حتى 5)' : 'Pain Points (up to 5)'}
            </span>
            {form.painPoints.map((p, i) => (
              <input
                key={i}
                style={{ ...inputStyle, fontSize: 12 }}
                placeholder={isAr ? `الألم ${i + 1}` : `Pain ${i + 1}`}
                value={p}
                onChange={e => setListItem('painPoints', i, e.target.value)}
              />
            ))}
          </div>

          {/* Desired Outcomes */}
          <div style={cardStyle} className="p-4 space-y-2">
            <span style={labelStyle}>
              {isAr ? 'النتائج المرغوبة (حتى 5)' : 'Desired Outcomes (up to 5)'}
            </span>
            {form.desiredOutcomes.map((o, i) => (
              <input
                key={i}
                style={{ ...inputStyle, fontSize: 12 }}
                placeholder={isAr ? `النتيجة ${i + 1}` : `Outcome ${i + 1}`}
                value={o}
                onChange={e => setListItem('desiredOutcomes', i, e.target.value)}
              />
            ))}
          </div>

          {/* Fear & Dream */}
          <div style={cardStyle} className="p-4 space-y-3">
            <span style={labelStyle}>{isAr ? 'الخوف والحلم' : 'Fear & Dream'}</span>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>
                {isAr ? 'أكبر خوف' : 'Biggest Fear'}
              </label>
              <input
                style={inputStyle}
                placeholder={isAr ? 'ما الذي يخيفه أكثر من أي شيء؟' : 'What scares them most?'}
                value={form.biggestFear}
                onChange={e => setF('biggestFear', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>
                {isAr ? 'أكبر حلم' : 'Biggest Dream'}
              </label>
              <input
                style={inputStyle}
                placeholder={isAr ? 'ما الذي يتمناه بشدة؟' : 'What do they dream of deeply?'}
                value={form.biggestDream}
                onChange={e => setF('biggestDream', e.target.value)}
              />
            </div>
          </div>

          {/* Platforms */}
          <div style={cardStyle} className="p-4">
            <span style={labelStyle}>{isAr ? 'أين يتواجد؟' : 'Where They Hang Out'}</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {PLATFORMS.map(p => {
                const active = form.platforms.includes(p)
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
                    style={{
                      background: active ? 'rgba(201,168,76,0.15)' : '#111',
                      border: `1px solid ${active ? '#c9a84c' : '#333'}`,
                      color: active ? '#c9a84c' : '#666',
                    }}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Buying Triggers */}
          <div style={cardStyle} className="p-4">
            <span style={labelStyle}>{isAr ? 'مشغّلات الشراء' : 'Buying Triggers'}</span>
            <textarea
              style={{ ...inputStyle, resize: 'none' }}
              rows={2}
              placeholder={isAr ? 'ماذا يجعله يشتري؟ ما الذي يدفعه للقرار؟' : 'What makes them buy? What pushes them to decide?'}
              value={form.buyingTriggers}
              onChange={e => setF('buyingTriggers', e.target.value)}
            />
          </div>

          {/* Objections */}
          <div style={cardStyle} className="p-4 space-y-2">
            <span style={labelStyle}>
              {isAr ? 'الاعتراضات الرئيسية (حتى 3)' : 'Main Objections (up to 3)'}
            </span>
            {form.objections.map((o, i) => (
              <input
                key={i}
                style={{ ...inputStyle, fontSize: 12 }}
                placeholder={isAr ? `الاعتراض ${i + 1}` : `Objection ${i + 1}`}
                value={o}
                onChange={e => setListItem('objections', i, e.target.value)}
              />
            ))}
          </div>

          {/* Budget Comfort */}
          <div style={cardStyle} className="p-4">
            <span style={labelStyle}>{isAr ? 'منطقة الراحة المادية' : 'Budget Comfort Zone'}</span>
            <input
              style={inputStyle}
              placeholder={isAr ? 'مثال: مرتاح لدفع $500–$1000 لحل مشكلته' : 'e.g. Comfortable paying $500–$1,000 to solve their problem'}
              value={form.budgetComfort}
              onChange={e => setF('budgetComfort', e.target.value)}
            />
          </div>

          {/* Internal Dialogue */}
          <div style={cardStyle} className="p-4">
            <span style={labelStyle}>{isAr ? 'حواره الداخلي' : 'Internal Dialogue'}</span>
            <textarea
              style={{ ...inputStyle, resize: 'none' }}
              rows={2}
              placeholder={isAr ? '"أستيقظ كل صباح أفكر في..."' : '"I wake up every morning thinking about..."'}
              value={form.internalDialogue}
              onChange={e => setF('internalDialogue', e.target.value)}
            />
          </div>

          {/* Transformation */}
          <div style={cardStyle} className="p-4 space-y-3">
            <span style={labelStyle}>{isAr ? 'جملة التحوّل' : 'Transformation Statement'}</span>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#e74c3c' }}>
                {isAr ? 'من (الوضع الحالي)' : 'From (current state)'}
              </label>
              <input
                style={inputStyle}
                placeholder={isAr ? 'مثال: الضياع، الخوف، التردد' : 'e.g. Lost, fearful, stuck in indecision'}
                value={form.transformationFrom}
                onChange={e => setF('transformationFrom', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#2ecc71' }}>
                {isAr ? 'إلى (الوضع المأمول)' : 'To (desired state)'}
              </label>
              <input
                style={inputStyle}
                placeholder={isAr ? 'مثال: الوضوح، الثقة، الازدهار' : 'e.g. Clear, confident, thriving'}
                value={form.transformationTo}
                onChange={e => setF('transformationTo', e.target.value)}
              />
            </div>
          </div>

          {/* Primary Toggle */}
          <div style={cardStyle} className="p-4">
            <button
              onClick={() => setF('isPrimary', !form.isPrimary)}
              className="flex items-center gap-3 w-full"
            >
              <div
                className="w-11 h-6 rounded-full transition-all flex-shrink-0 relative"
                style={{ background: form.isPrimary ? '#c9a84c' : '#333' }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-black transition-all"
                  style={{ left: form.isPrimary ? 'calc(100% - 20px)' : 4 }}
                />
              </div>
              <span className="text-sm font-bold" style={{ color: form.isPrimary ? '#c9a84c' : '#888' }}>
                {isAr ? 'أفاتار رئيسي (الأهم)' : 'Primary Avatar (most important)'}
              </span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-4">
            <button
              onClick={saveForm}
              disabled={!form.name.trim()}
              className="w-full btn-gold py-3 text-sm disabled:opacity-40"
            >
              {isAr ? 'حفظ الأفاتار' : 'Save Avatar'}
            </button>
            <button
              onClick={() => setMode('list')}
              className="px-5 text-sm py-3 rounded-xl flex-shrink-0"
              style={{ background: '#2a2a2a', color: '#888' }}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  // ── VIEW (profile card detail) ────────────────────────────────────────────

  if (mode === 'view' && viewingAvatar) {
    const av = viewingAvatar
    const filledPains = av.painPoints?.filter(Boolean) || []
    const filledOutcomes = av.desiredOutcomes?.filter(Boolean) || []
    const filledObjections = av.objections?.filter(Boolean) || []

    return (
      <Layout
        title={av.name}
        subtitle={isAr ? 'بطاقة العميل' : 'Customer Profile'}
      >
        <div className="space-y-4 pt-2">

          {/* Header card */}
          <div style={{ ...cardStyle, border: av.isPrimary ? '1px solid rgba(201,168,76,0.4)' : '1px solid #1e1e1e' }}
            className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-black"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
              {getInitial(av.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-black text-white truncate">{av.name}</h2>
              {av.isPrimary && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                  {isAr ? 'أفاتار رئيسي' : 'Primary'}
                </span>
              )}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {[av.ageRange, av.gender, av.location, av.income].filter(Boolean).map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-lg"
                    style={{ background: '#1a1a1a', color: '#888' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Job title */}
          {av.jobTitle && (
            <InfoRow icon="💼" label={isAr ? 'المسمى الوظيفي' : 'Job / Title'} value={av.jobTitle} />
          )}

          {/* Pain Points */}
          {filledPains.length > 0 && (
            <div style={cardStyle} className="p-4">
              <p style={labelStyle}>🩸 {isAr ? 'نقاط الألم' : 'Pain Points'}</p>
              <ul className="space-y-1.5 mt-1">
                {filledPains.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-xs mt-0.5" style={{ color: '#e74c3c' }}>•</span>
                    <span className="text-xs text-white">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Desired Outcomes */}
          {filledOutcomes.length > 0 && (
            <div style={cardStyle} className="p-4">
              <p style={labelStyle}>🎯 {isAr ? 'النتائج المرغوبة' : 'Desired Outcomes'}</p>
              <ul className="space-y-1.5 mt-1">
                {filledOutcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-xs mt-0.5" style={{ color: '#2ecc71' }}>✓</span>
                    <span className="text-xs text-white">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fear & Dream */}
          {(av.biggestFear || av.biggestDream) && (
            <div style={cardStyle} className="p-4 space-y-3">
              {av.biggestFear && (
                <div>
                  <p style={{ ...labelStyle, color: '#e74c3c' }}>😨 {isAr ? 'أكبر خوف' : 'Biggest Fear'}</p>
                  <p className="text-xs text-white">{av.biggestFear}</p>
                </div>
              )}
              {av.biggestDream && (
                <div>
                  <p style={{ ...labelStyle, color: '#9b59b6' }}>✨ {isAr ? 'أكبر حلم' : 'Biggest Dream'}</p>
                  <p className="text-xs text-white">{av.biggestDream}</p>
                </div>
              )}
            </div>
          )}

          {/* Platforms */}
          {av.platforms?.length > 0 && (
            <div style={cardStyle} className="p-4">
              <p style={labelStyle}>📱 {isAr ? 'أين يتواجد' : 'Where They Hang Out'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {av.platforms.map(p => (
                  <span key={p} className="text-xs px-2.5 py-1 rounded-full font-bold"
                    style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Buying Triggers */}
          {av.buyingTriggers && (
            <InfoRow icon="⚡" label={isAr ? 'مشغّلات الشراء' : 'Buying Triggers'} value={av.buyingTriggers} />
          )}

          {/* Objections */}
          {filledObjections.length > 0 && (
            <div style={cardStyle} className="p-4">
              <p style={labelStyle}>🛑 {isAr ? 'الاعتراضات الرئيسية' : 'Main Objections'}</p>
              <ul className="space-y-1.5 mt-1">
                {filledObjections.map((o, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-xs mt-0.5" style={{ color: '#e67e22' }}>•</span>
                    <span className="text-xs text-white">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Budget Comfort */}
          {av.budgetComfort && (
            <InfoRow icon="💰" label={isAr ? 'منطقة الراحة المادية' : 'Budget Comfort Zone'} value={av.budgetComfort} />
          )}

          {/* Internal Dialogue */}
          {av.internalDialogue && (
            <div style={cardStyle} className="p-4">
              <p style={labelStyle}>💭 {isAr ? 'حواره الداخلي' : 'Internal Dialogue'}</p>
              <p className="text-xs italic" style={{ color: '#aaa' }}>"{av.internalDialogue}"</p>
            </div>
          )}

          {/* Transformation */}
          {(av.transformationFrom || av.transformationTo) && (
            <div style={{ ...cardStyle, border: '1px solid rgba(201,168,76,0.2)' }} className="p-4">
              <p style={labelStyle}>🔄 {isAr ? 'جملة التحوّل' : 'Transformation Statement'}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {av.transformationFrom && (
                  <span className="text-xs px-3 py-1.5 rounded-xl font-bold"
                    style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.2)' }}>
                    {av.transformationFrom}
                  </span>
                )}
                <span style={{ color: '#c9a84c', fontWeight: 900 }}>→</span>
                {av.transformationTo && (
                  <span className="text-xs px-3 py-1.5 rounded-xl font-bold"
                    style={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.2)' }}>
                    {av.transformationTo}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="flex gap-2 pb-4">
            <button onClick={() => openEdit(av)} className="flex-1 btn-gold py-3 text-sm">
              {isAr ? 'تعديل' : 'Edit'}
            </button>
            {!av.isPrimary && (
              <button
                onClick={() => { setPrimary(av.id); setMode('list') }}
                className="flex-1 py-3 text-sm rounded-xl font-bold"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}
              >
                {isAr ? 'تعيين رئيسي' : 'Set Primary'}
              </button>
            )}
            <button
              onClick={() => deleteAvatar(av.id)}
              className="px-4 py-3 text-sm rounded-xl"
              style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c' }}
            >
              {isAr ? 'حذف' : 'Delete'}
            </button>
          </div>

          <button onClick={() => setMode('list')} className="w-full text-xs py-2" style={{ color: '#555' }}>
            ← {isAr ? 'عودة للقائمة' : 'Back to list'}
          </button>
        </div>
      </Layout>
    )
  }

  // ── LIST view ─────────────────────────────────────────────────────────────

  return (
    <Layout
      title={isAr ? 'أفاتار العميل' : 'Customer Avatar'}
      subtitle={isAr ? 'يجب أن تعرف من تكلّم قبل أن تصل إلى روحه' : 'You have to know who you\'re speaking to before you can speak to their soul'}
    >
      <div className="space-y-4 pt-2">

        {/* Tony Robbins quote */}
        <div className="rounded-2xl p-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-xs italic text-center" style={{ color: '#c9a84c' }}>
            "{isAr
              ? 'يجب أن تعرف من تتحدث إليه قبل أن تستطيع أن تصل إلى روحه'
              : 'You have to know who you\'re speaking to before you can speak to their soul'}"
          </p>
          <p className="text-center text-xs mt-1" style={{ color: '#555' }}>— Tony Robbins</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <StatBox label={isAr ? 'أفاتار' : 'Avatars'} value={avatars.length} color="#c9a84c" />
          <StatBox label={isAr ? 'رئيسي' : 'Primary'} value={avatars.filter(a => a.isPrimary).length} color="#2ecc71" />
          <StatBox label={isAr ? 'مكتمل' : 'Complete'} value={avatars.filter(a => a.name && a.transformationFrom && a.biggestFear).length} color="#3498db" />
        </div>

        {/* Add button */}
        <button
          onClick={openNew}
          className="w-full rounded-xl py-3 font-bold text-sm transition-all active:scale-[0.98]"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c' }}
        >
          + {isAr ? 'أضف أفاتار جديد' : 'Add New Avatar'}
        </button>

        {/* Empty state */}
        {avatars.length === 0 && (
          <div className="text-center py-10" style={{ color: '#555' }}>
            <div className="text-5xl mb-3">👤</div>
            <p className="text-sm">{isAr ? 'ابنِ أفاتار عميلك المثالي لتنمو أعمالك بسرعة' : 'Build your ideal customer avatar to grow your business faster'}</p>
          </div>
        )}

        {/* Avatar cards */}
        {avatars.map(av => {
          const filledPains = av.painPoints?.filter(Boolean).length || 0
          const completion = [
            av.name, av.ageRange, av.biggestFear, av.biggestDream,
            av.buyingTriggers, av.transformationFrom, av.transformationTo,
            av.platforms?.length > 0,
          ].filter(Boolean).length
          const pct = Math.round((completion / 8) * 100)

          return (
            <button
              key={av.id}
              onClick={() => openView(av.id)}
              className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
              style={{
                background: '#0e0e0e',
                border: `1px solid ${av.isPrimary ? 'rgba(201,168,76,0.35)' : '#1e1e1e'}`,
                borderRadius: 16,
              }}
            >
              {/* Avatar initial */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-black"
                style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c' }}>
                {getInitial(av.name)}
              </div>

              <div className="flex-1 min-w-0" style={{ textAlign: isAr ? 'right' : 'left' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white truncate">{av.name}</span>
                  {av.isPrimary && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                      {isAr ? 'رئيسي' : 'Primary'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {[av.ageRange, av.gender, av.location].filter(Boolean).map((t, i) => (
                    <span key={i} className="text-xs" style={{ color: '#666' }}>{t}</span>
                  ))}
                </div>
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs" style={{ color: '#555' }}>
                      {isAr ? `${filledPains} نقطة ألم` : `${filledPains} pain pts`}
                    </span>
                    <span className="text-xs" style={{ color: pct >= 70 ? '#2ecc71' : '#888' }}>{pct}%</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: '#222' }}>
                    <div className="h-1 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: pct >= 70 ? '#2ecc71' : '#c9a84c' }} />
                  </div>
                </div>
              </div>
              <span style={{ color: '#444' }}>›</span>
            </button>
          )
        })}

        {/* Bottom tip */}
        {avatars.length > 0 && (
          <div className="rounded-xl p-3 text-center" style={{ background: '#0e0e0e', border: '1px solid #1a1a1a' }}>
            <p className="text-xs" style={{ color: '#555' }}>
              {isAr
                ? 'Tony Robbins: "العميل المثالي ليس كل الناس — هو شخص واحد محدد بدقة"'
                : 'Tony Robbins: "Your ideal client is not everyone — it\'s one specific person, defined precisely"'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatBox({ label, value, color }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
      <div className="text-xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs" style={{ color: '#888' }}>{label}</div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ background: '#0e0e0e', border: '1px solid #1e1e1e', borderRadius: 16 }} className="p-4">
      <p style={{
        color: '#c9a84c', fontSize: 10, fontWeight: 900,
        textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4,
      }}>
        {icon} {label}
      </p>
      <p className="text-xs text-white">{value}</p>
    </div>
  )
}
