import { useState } from 'react'
import { Plus, X, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const CATEGORIES = [
  { id: 'health',      emoji: '💪', color: '#2ecc71', ar: 'الصحة واللياقة',      en: 'Health & Fitness' },
  { id: 'intellectual',emoji: '🧠', color: '#3498db', ar: 'التطوير الفكري',       en: 'Intellectual Life' },
  { id: 'emotional',   emoji: '❤️', color: '#e74c3c', ar: 'الحياة العاطفية',      en: 'Emotional Life' },
  { id: 'character',   emoji: '🌟', color: '#f1c40f', ar: 'الشخصية والقيم',       en: 'Character & Values' },
  { id: 'spiritual',   emoji: '✨', color: '#9b59b6', ar: 'الحياة الروحية',        en: 'Spiritual Life' },
  { id: 'love',        emoji: '💑', color: '#e91e8c', ar: 'الحب والعلاقة',         en: 'Love Relationship' },
  { id: 'parenting',   emoji: '👨‍👩‍👧‍👦', color: '#1abc9c', ar: 'التربية والأسرة',    en: 'Parenting & Family' },
  { id: 'social',      emoji: '🤝', color: '#16a085', ar: 'الحياة الاجتماعية',     en: 'Social Life' },
  { id: 'financial',   emoji: '💰', color: '#27ae60', ar: 'الحرية المالية',         en: 'Financial Freedom' },
  { id: 'career',      emoji: '🚀', color: '#e67e22', ar: 'المسيرة المهنية',        en: 'Career & Business' },
  { id: 'quality',     emoji: '🌈', color: '#8e44ad', ar: 'جودة الحياة',            en: 'Quality of Life' },
  { id: 'lifeVision',  emoji: '🔭', color: '#c9a84c', ar: 'رؤية الحياة',            en: 'Life Vision' },
]

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

const EMPTY_FORM = {
  category: '',
  titleAr: '',
  titleEn: '',
  descAr: '',
  descEn: '',
}

export default function VisionBoard() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const board = state.visionBoard || { cards: [] }
  const cards = board.cards || []

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [expandedId, setExpandedId] = useState(null)

  const t = (ar, en) => isAr ? ar : en

  const saveCard = () => {
    if (!form.category || !(form.titleAr || form.titleEn)) return
    const cat = CAT_MAP[form.category]
    const newCard = {
      id: Date.now().toString(),
      category: form.category,
      titleAr: form.titleAr.trim(),
      titleEn: form.titleEn.trim(),
      descAr: form.descAr.trim(),
      descEn: form.descEn.trim(),
      color: cat.color,
      emoji: cat.emoji,
      done: false,
    }
    update('visionBoard', { cards: [...cards, newCard] })
    setForm(EMPTY_FORM)
    setShowModal(false)
  }

  const toggleDone = (id) => {
    update('visionBoard', {
      cards: cards.map(c => c.id === id ? { ...c, done: !c.done } : c),
    })
  }

  const deleteCard = (id) => {
    update('visionBoard', { cards: cards.filter(c => c.id !== id) })
    if (expandedId === id) setExpandedId(null)
  }

  const categoriesCovered = new Set(cards.map(c => c.category)).size
  const progress = Math.round((categoriesCovered / 12) * 100)

  return (
    <Layout
      title={t('لوحة رؤيتي', 'My Vision Board')}
      subtitle={t('ارسم مستقبلك قبل أن تعيشه', 'Draw your future before you live it')}
    >
      {/* Inspirational Quote */}
      <div className="card mb-4 text-center px-4 py-4" style={{ borderLeft: '3px solid #c9a84c' }}>
        <p className="text-sm" style={{ color: '#c9a84c', fontStyle: 'italic' }}>
          {t(
            '"الناس لا يخططون للفشل، لكنهم يفشلون في التخطيط" — توني روبنز',
            '"People don\'t plan to fail, they fail to plan." — Tony Robbins',
          )}
        </p>
      </div>

      {/* Progress */}
      <div className="card mb-4 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold" style={{ color: '#c9a84c' }}>
            {t('التقدم', 'Progress')}
          </span>
          <span className="text-sm" style={{ color: '#888' }}>
            {categoriesCovered}/12 {t('فئات مغطاة', 'categories covered')}
          </span>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}
          />
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: '#888' }}>
          {progress}% {t('من رؤيتك اكتملت', 'of your vision complete')}
        </p>
      </div>

      {/* Add Card Button */}
      <button
        className="btn-gold w-full mb-5 flex items-center justify-center gap-2"
        onClick={() => setShowModal(true)}
      >
        <Plus size={18} />
        {t('أضف بطاقة رؤية', 'Add Vision Card')}
      </button>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="rounded-2xl p-6 text-center" style={{ background: '#0e0e0e', border: '1px dashed #2a2a2a', margin: '8px 0' }}>
          <div className="text-5xl mb-4">🔭</div>
          <p className="text-base font-bold text-white mb-2">
            {isAr ? 'لوحة رؤيتك فارغة' : 'Your vision board is empty'}
          </p>
          <p className="text-xs mb-5" style={{ color: '#666', lineHeight: 1.7 }}>
            {isAr
              ? 'الرؤية الواضحة تجذب الواقع نحوها\nأضف بطاقة لكل محور من محاور حياتك'
              : 'A clear vision attracts reality toward it.\nAdd a card for each area of your life.'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#0a0a0a',
              border: 'none', cursor: 'pointer', padding: '12px 24px',
              borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
            ✨ {isAr ? 'ارسم أول رؤية' : 'Create First Vision'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cards.map(card => {
            const isExpanded = expandedId === card.id
            return (
              <div
                key={card.id}
                className="card relative overflow-hidden cursor-pointer"
                style={{
                  borderTop: `3px solid ${card.color}`,
                  opacity: card.done ? 0.75 : 1,
                  transition: 'all 0.2s',
                }}
                onClick={() => setExpandedId(isExpanded ? null : card.id)}
              >
                {/* Done overlay */}
                {card.done && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.45)', zIndex: 1 }}
                  >
                    <div
                      className="text-3xl rounded-full flex items-center justify-center"
                      style={{
                        width: 48,
                        height: 48,
                        background: card.color,
                        boxShadow: `0 0 16px ${card.color}88`,
                      }}
                    >
                      ✅
                    </div>
                  </div>
                )}

                <div className="p-3 relative z-0">
                  <div className="text-2xl mb-1">{card.emoji}</div>
                  <div className="text-xs mb-1" style={{ color: card.color }}>
                    {t(CAT_MAP[card.category]?.ar, CAT_MAP[card.category]?.en)}
                  </div>
                  <div className="font-semibold text-sm text-white leading-tight mb-1">
                    {isAr ? card.titleAr || card.titleEn : card.titleEn || card.titleAr}
                  </div>
                  {!isExpanded && (
                    <div className="text-xs leading-snug line-clamp-2" style={{ color: '#888' }}>
                      {isAr ? card.descAr || card.descEn : card.descEn || card.descAr}
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div onClick={e => e.stopPropagation()}>
                      <div className="text-xs leading-snug mt-1 mb-3" style={{ color: '#aaa' }}>
                        {isAr ? card.descAr || card.descEn : card.descEn || card.descAr}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs font-semibold"
                          style={{
                            background: card.done ? '#333' : card.color,
                            color: card.done ? '#aaa' : '#000',
                          }}
                          onClick={() => toggleDone(card.id)}
                        >
                          <Check size={12} />
                          {card.done ? t('إلغاء', 'Undo') : t('أنجزت', 'Done')}
                        </button>
                        <button
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: '#2a1a1a', color: '#e74c3c' }}
                          onClick={() => deleteCard(card.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-1">
                    {isExpanded
                      ? <ChevronUp size={14} style={{ color: '#555' }} />
                      : <ChevronDown size={14} style={{ color: '#555' }} />
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Categories Reference */}
      <div className="card mt-5 p-4">
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#c9a84c' }}>
          {t('الفئات الـ 12 — Lifebook', '12 Lifebook Categories')}
        </h3>
        <div className="grid grid-cols-2 gap-1">
          {CATEGORIES.map(cat => {
            const covered = cards.some(c => c.category === cat.id)
            return (
              <div
                key={cat.id}
                className="flex items-center gap-2 px-2 py-1 rounded text-xs"
                style={{
                  background: covered ? `${cat.color}22` : '#1a1a1a',
                  borderLeft: `2px solid ${covered ? cat.color : '#333'}`,
                }}
              >
                <span>{cat.emoji}</span>
                <span style={{ color: covered ? cat.color : '#666' }}>
                  {t(cat.ar, cat.en)}
                </span>
                {covered && <Check size={10} style={{ color: cat.color, marginLeft: 'auto' }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Card Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl p-5 pb-8"
            style={{ background: '#1a1a1a', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base" style={{ color: '#c9a84c' }}>
                {t('بطاقة رؤية جديدة', 'New Vision Card')}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} style={{ color: '#888' }} />
              </button>
            </div>

            {/* Category Select */}
            <label className="block text-xs mb-1" style={{ color: '#888' }}>
              {t('الفئة', 'Category')} *
            </label>
            <select
              className="input-dark w-full mb-3"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              style={{ background: '#111', color: 'white' }}
            >
              <option value="">{t('اختر فئة...', 'Select category...')}</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {t(cat.ar, cat.en)}
                </option>
              ))}
            </select>

            {form.category && (
              <div
                className="text-xs px-3 py-2 rounded mb-3 flex items-center gap-2"
                style={{
                  background: `${CAT_MAP[form.category]?.color}22`,
                  border: `1px solid ${CAT_MAP[form.category]?.color}44`,
                  color: CAT_MAP[form.category]?.color,
                }}
              >
                <span>{CAT_MAP[form.category]?.emoji}</span>
                <span>{t(CAT_MAP[form.category]?.ar, CAT_MAP[form.category]?.en)}</span>
              </div>
            )}

            {/* Title Arabic */}
            <label className="block text-xs mb-1" style={{ color: '#888' }}>
              {t('العنوان (عربي)', 'Title (Arabic)')}
            </label>
            <input
              className="input-dark w-full mb-3"
              placeholder={t('عنوان رؤيتك...', 'Your vision title...')}
              value={form.titleAr}
              onChange={e => setForm({ ...form, titleAr: e.target.value })}
              dir="rtl"
            />

            {/* Title English */}
            <label className="block text-xs mb-1" style={{ color: '#888' }}>
              {t('العنوان (إنجليزي)', 'Title (English)')}
            </label>
            <input
              className="input-dark w-full mb-3"
              placeholder="Your vision title..."
              value={form.titleEn}
              onChange={e => setForm({ ...form, titleEn: e.target.value })}
              dir="ltr"
            />

            {/* Desc Arabic */}
            <label className="block text-xs mb-1" style={{ color: '#888' }}>
              {t('الوصف (عربي)', 'Description (Arabic)')}
            </label>
            <textarea
              className="input-dark w-full mb-3 resize-none"
              rows={3}
              placeholder={t('صف رؤيتك بتفصيل...', 'Describe your vision in detail...')}
              value={form.descAr}
              onChange={e => setForm({ ...form, descAr: e.target.value })}
              dir="rtl"
            />

            {/* Desc English */}
            <label className="block text-xs mb-1" style={{ color: '#888' }}>
              {t('الوصف (إنجليزي)', 'Description (English)')}
            </label>
            <textarea
              className="input-dark w-full mb-4 resize-none"
              rows={3}
              placeholder="Describe your vision in detail..."
              value={form.descEn}
              onChange={e => setForm({ ...form, descEn: e.target.value })}
              dir="ltr"
            />

            <button
              className="btn-gold w-full"
              onClick={saveCard}
              disabled={!form.category || !(form.titleAr || form.titleEn)}
              style={{ opacity: (!form.category || !(form.titleAr || form.titleEn)) ? 0.5 : 1 }}
            >
              {t('حفظ البطاقة', 'Save Card')}
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
