import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'
import {
  Heart, Briefcase, Users, TrendingUp, Star, Compass,
  Gift, Eye, EyeOff, Save, CheckCircle, Calendar
} from 'lucide-react'

const TIMEFRAMES = [
  { id: '1yr', ar: 'سنة واحدة', en: '1 Year' },
  { id: '3yr', ar: '٣ سنوات', en: '3 Years' },
  { id: '5yr', ar: '٥ سنوات', en: '5 Years' },
  { id: '10yr', ar: '١٠ سنوات', en: '10 Years' },
]

const LIFE_AREAS = [
  { key: 'health', icon: Heart, color: '#e63946', ar: 'الصحة', en: 'Health', placeholder_ar: 'كيف سيبدو جسمك وصحتك؟', placeholder_en: 'How will your body and health look?' },
  { key: 'career', icon: Briefcase, color: '#3498db', ar: 'المهنة والمال', en: 'Career & Finance', placeholder_ar: 'ما مسيرتك المهنية ووضعك المادي؟', placeholder_en: 'What is your career and financial state?' },
  { key: 'relationships', icon: Users, color: '#e91e8c', ar: 'العلاقات', en: 'Relationships', placeholder_ar: 'كيف تبدو علاقاتك مع الأهل والأصدقاء؟', placeholder_en: 'How do your relationships with family & friends look?' },
  { key: 'growth', icon: TrendingUp, color: '#2ecc71', ar: 'النمو الشخصي', en: 'Personal Growth', placeholder_ar: 'من أصبحت؟ ما المهارات التي أتقنتها؟', placeholder_en: 'Who have you become? What skills have you mastered?' },
  { key: 'spirituality', icon: Star, color: '#c9a84c', ar: 'الروحانية', en: 'Spirituality', placeholder_ar: 'كيف تبدو علاقتك بالله والمعنى والغاية؟', placeholder_en: 'What does your connection to meaning and purpose look like?' },
  { key: 'fun', icon: Compass, color: '#9b59b6', ar: 'المتعة والمغامرة', en: 'Fun & Adventure', placeholder_ar: 'ما التجارب والمغامرات التي عشتها؟', placeholder_en: 'What experiences and adventures have you lived?' },
  { key: 'contribution', icon: Gift, color: '#e67e22', ar: 'المساهمة', en: 'Contribution', placeholder_ar: 'كيف أثّرت في حياة الآخرين والمجتمع؟', placeholder_en: 'How have you impacted others and society?' },
]

const FEELINGS = [
  { emoji: '🔥', label_ar: 'مثار', label_en: 'Excited' },
  { emoji: '😌', label_ar: 'مطمئن', label_en: 'Peaceful' },
  { emoji: '💪', label_ar: 'قوي', label_en: 'Powerful' },
  { emoji: '🙏', label_ar: 'ممتنن', label_en: 'Grateful' },
  { emoji: '✨', label_ar: 'ملهَم', label_en: 'Inspired' },
]

const EMPTY_TIMEFRAME = () => ({
  areas: Object.fromEntries(LIFE_AREAS.map(a => [a.key, ''])),
  vision: '',
  feeling: '',
})

export default function CompellingFuture() {
  const { lang, dir } = useLang()
  const { state, update } = useApp()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const [activeTimeframe, setActiveTimeframe] = useState('1yr')
  const [vizMode, setVizMode] = useState(false)

  const allData = state.compellingFuture || {}

  function getTimeframeData(tf) {
    const empty = EMPTY_TIMEFRAME()
    const saved = allData[tf] || {}
    return {
      ...empty,
      ...saved,
      areas: { ...empty.areas, ...(saved.areas || {}) },
    }
  }

  function updateArea(tf, areaKey, value) {
    const current = getTimeframeData(tf)
    const updated = {
      ...allData,
      [tf]: {
        ...current,
        areas: { ...current.areas, [areaKey]: value },
      },
    }
    update('compellingFuture', updated)
  }

  function updateVision(tf, value) {
    const current = getTimeframeData(tf)
    const updated = { ...allData, [tf]: { ...current, vision: value } }
    update('compellingFuture', updated)
  }

  function updateFeeling(tf, emoji) {
    const current = getTimeframeData(tf)
    const feeling = current.feeling === emoji ? '' : emoji
    const updated = { ...allData, [tf]: { ...current, feeling } }
    update('compellingFuture', updated)
  }

  function handleSave() {
    showToast(isAr ? 'تم حفظ المستقبل المُلهِم' : 'Compelling future saved', 'success')
  }

  // Completion stats
  const stats = TIMEFRAMES.map(tf => {
    const d = getTimeframeData(tf.id)
    const filledAreas = LIFE_AREAS.filter(a => d.areas[a.key]?.trim().length > 0).length
    const hasVision = d.vision?.trim().length > 0
    return { tf, filledAreas, hasVision }
  })
  const filledTimeframes = stats.filter(s => s.filledAreas > 0 || s.hasVision).length

  const currentData = getTimeframeData(activeTimeframe)
  const currentTfMeta = TIMEFRAMES.find(t => t.id === activeTimeframe)

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-24" dir={dir}>
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-b border-[#c9a84c]/20 px-4 pt-8 pb-5">
          <h1 className="text-2xl font-bold text-[#c9a84c] text-center">
            {isAr ? 'المستقبل المُلهِم' : 'Compelling Future'}
          </h1>
          <p className="text-center text-gray-400 text-sm mt-1">
            {isAr ? 'صوّر حياتك بوضوح — فما تراه تصله' : 'Visualize your life clearly — what you see, you achieve'}
          </p>
        </div>

        {/* Completion stats bar */}
        <div className="px-4 py-3 bg-[#111] border-b border-[#222]">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#c9a84c]" />
              <span className="text-xs text-gray-400">
                {isAr
                  ? `${filledTimeframes} من 4 أُطر زمنية مكتملة`
                  : `${filledTimeframes} of 4 timeframes filled`}
              </span>
            </div>
            <div className="flex gap-3">
              {stats.map(s => (
                <div key={s.tf.id} className="flex flex-col items-center">
                  <div
                    className={`w-2 h-2 rounded-full ${s.filledAreas > 0 ? 'bg-[#c9a84c]' : 'bg-[#333]'}`}
                  />
                  <span className="text-[10px] text-gray-600 mt-0.5">
                    {isAr ? s.tf.ar.replace('سنة واحدة', '١س').replace(' سنوات', 'س').replace(' سنوات', 'س') : s.tf.en.replace(' Year', 'y').replace(' Years', 'y')}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setVizMode(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                vizMode
                  ? 'bg-[#c9a84c] text-black'
                  : 'bg-[#222] text-gray-400 hover:bg-[#333]'
              }`}
            >
              {vizMode ? <EyeOff size={13} /> : <Eye size={13} />}
              {isAr ? 'تصوّر' : 'Visualize'}
            </button>
          </div>
        </div>

        {/* Timeframe tabs */}
        <div className="flex border-b border-[#222]">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.id}
              onClick={() => setActiveTimeframe(tf.id)}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${
                activeTimeframe === tf.id
                  ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {isAr ? tf.ar : tf.en}
            </button>
          ))}
        </div>

        <div className="px-4 py-5 max-w-2xl mx-auto space-y-5">

          {/* ── VISUALIZATION MODE ── */}
          {vizMode ? (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="text-[#c9a84c] text-sm font-semibold mb-1">
                  {isAr ? 'رؤيتك خلال' : 'Your vision in'}
                </div>
                <div className="text-2xl font-black text-white">
                  {isAr ? currentTfMeta?.ar : currentTfMeta?.en}
                </div>
                {currentData.feeling && (
                  <div className="text-3xl mt-2">{currentData.feeling}</div>
                )}
              </div>

              {LIFE_AREAS.map(area => {
                const text = currentData.areas[area.key]
                if (!text?.trim()) return null
                const Icon = area.icon
                return (
                  <div
                    key={area.key}
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: area.color + '10', border: `1px solid ${area.color}30` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={16} style={{ color: area.color }} />
                      <span className="font-bold text-sm" style={{ color: area.color }}>
                        {isAr ? area.ar : area.en}
                      </span>
                    </div>
                    <p className="text-white text-base leading-relaxed">{text}</p>
                  </div>
                )
              })}

              {currentData.vision?.trim() && (
                <div className="bg-gradient-to-br from-[#c9a84c]/15 to-[#c9a84c]/05 border border-[#c9a84c]/30 rounded-2xl p-6">
                  <div className="text-[#c9a84c] text-xs font-semibold uppercase tracking-wider mb-3">
                    {isAr ? 'رؤيتي الكاملة' : 'My Overall Vision'}
                  </div>
                  <p className="text-white text-lg leading-relaxed font-medium">{currentData.vision}</p>
                </div>
              )}

              {LIFE_AREAS.every(a => !currentData.areas[a.key]?.trim()) && !currentData.vision?.trim() && (
                <div className="text-center text-gray-600 py-12">
                  <Eye size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    {isAr ? 'لا يوجد محتوى بعد لهذا الإطار الزمني' : 'No content yet for this timeframe'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ── EDIT MODE ── */
            <div className="space-y-5">
              {/* Life areas */}
              {LIFE_AREAS.map(area => {
                const Icon = area.icon
                const value = currentData.areas[area.key] || ''
                return (
                  <div
                    key={area.key}
                    className="bg-[#111] rounded-2xl p-4 border border-[#222] hover:border-[#333] transition-colors space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: area.color + '20', border: `1.5px solid ${area.color}` }}
                      >
                        <Icon size={17} style={{ color: area.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">
                          {isAr ? area.ar : area.en}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isAr ? area.placeholder_ar : area.placeholder_en}
                        </div>
                      </div>
                      {value.trim().length > 0 && (
                        <CheckCircle size={16} style={{ color: area.color }} />
                      )}
                    </div>
                    <textarea
                      value={value}
                      onChange={e => updateArea(activeTimeframe, area.key, e.target.value)}
                      placeholder={isAr ? 'اكتب رؤيتك هنا...' : 'Write your vision here...'}
                      rows={3}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-3 text-white text-sm placeholder-gray-700 resize-none focus:outline-none transition-colors"
                      style={{ '--tw-ring-color': area.color }}
                      onFocus={e => e.target.style.borderColor = area.color + '60'}
                      onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                    />
                  </div>
                )
              })}

              {/* Feeling selector */}
              <div className="bg-[#111] rounded-2xl p-4 border border-[#222] space-y-3">
                <div className="text-sm font-semibold text-gray-300">
                  {isAr ? 'كيف تشعر وأنت تتخيل هذا المستقبل؟' : 'How do you feel imagining this future?'}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {FEELINGS.map(f => (
                    <button
                      key={f.emoji}
                      onClick={() => updateFeeling(activeTimeframe, f.emoji)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all ${
                        currentData.feeling === f.emoji
                          ? 'border-[#c9a84c] bg-[#c9a84c]/15'
                          : 'border-[#333] hover:border-[#555]'
                      }`}
                    >
                      <span className="text-2xl">{f.emoji}</span>
                      <span className={`text-xs ${currentData.feeling === f.emoji ? 'text-[#c9a84c]' : 'text-gray-500'}`}>
                        {isAr ? f.label_ar : f.label_en}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vision statement */}
              <div className="bg-gradient-to-br from-[#1a1507] to-[#111] rounded-2xl p-5 border border-[#c9a84c]/25 space-y-3">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-[#c9a84c]" />
                  <span className="font-bold text-[#c9a84c] text-sm">
                    {isAr
                      ? `بيان رؤيتي خلال ${currentTfMeta?.ar}`
                      : `My Vision Statement — ${currentTfMeta?.en}`}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {isAr
                    ? 'اكتب بيان رؤية شامل يصف حياتك المثالية في هذا الإطار الزمني. اكتبه بصيغة المضارع كما لو كنت تعيشه الآن.'
                    : 'Write an overall vision statement describing your ideal life in this timeframe. Write it in present tense as if you are living it now.'}
                </p>
                <textarea
                  value={currentData.vision || ''}
                  onChange={e => updateVision(activeTimeframe, e.target.value)}
                  placeholder={
                    isAr
                      ? 'أنا الآن أعيش حياة من الوفرة والمعنى والتأثير...'
                      : 'I am now living a life of abundance, meaning, and impact...'
                  }
                  rows={5}
                  className="w-full bg-[#0a0a0a] border border-[#c9a84c]/20 rounded-xl p-3 text-white text-sm placeholder-gray-700 resize-none focus:outline-none focus:border-[#c9a84c]/50"
                />
              </div>

              {/* Per-timeframe stats */}
              <div className="bg-[#111] rounded-xl p-4 border border-[#222]">
                <div className="text-xs font-semibold text-gray-400 mb-3">
                  {isAr ? 'إحصائيات هذا الإطار الزمني' : 'This timeframe stats'}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label_ar: 'مجالات مكتملة',
                      label_en: 'Areas filled',
                      value: LIFE_AREAS.filter(a => currentData.areas[a.key]?.trim().length > 0).length,
                      total: 7,
                    },
                    {
                      label_ar: 'بيان الرؤية',
                      label_en: 'Vision statement',
                      value: currentData.vision?.trim().length > 0 ? 1 : 0,
                      total: 1,
                    },
                    {
                      label_ar: 'المشاعر',
                      label_en: 'Feeling set',
                      value: currentData.feeling ? 1 : 0,
                      total: 1,
                    },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-xl font-black ${stat.value > 0 ? 'text-[#c9a84c]' : 'text-gray-600'}`}>
                        {stat.value}/{stat.total}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {isAr ? stat.label_ar : stat.label_en}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-black"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c96e)' }}
              >
                <Save size={18} />
                {isAr ? 'حفظ رؤيتي' : 'Save My Vision'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
