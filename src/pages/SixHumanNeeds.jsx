import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'
import {
  Heart, TrendingUp, Star, Shield, Zap, Users,
  CheckCircle, ChevronRight, BarChart2, Lightbulb, Link,
  Calendar, Clock
} from 'lucide-react'

const NEED_META = [
  {
    key: 'certainty',
    color: '#3498db',
    icon: Shield,
    ar: 'اليقين',
    en: 'Certainty',
    desc_ar: 'الحاجة إلى الأمان والاستقرار والتنبؤ بالمستقبل',
    desc_en: 'The need for safety, stability and predictability',
    healthy_ar: ['التخطيط والتنظيم', 'بناء مهارات متينة', 'الادخار والاستثمار'],
    healthy_en: ['Planning & organizing', 'Building solid skills', 'Saving & investing'],
    unhealthy_ar: ['تجنب المخاطر كلياً', 'السيطرة على الآخرين', 'الوسواس القهري'],
    unhealthy_en: ['Avoiding all risk', 'Controlling others', 'OCD tendencies'],
    rel_ar: [
      'تبحث عن الاستقرار والأمان في علاقاتك — تجنّب التغيير المفاجئ',
      'تحتاج إلى وعود واضحة وروتين ثابت مع من تحب لتشعر بالارتياح',
    ],
    rel_en: [
      'You seek stability and security in relationships — sudden change feels threatening',
      'Clear commitments and consistent routines with loved ones help you feel at ease',
    ],
  },
  {
    key: 'variety',
    color: '#e67e22',
    icon: Zap,
    ar: 'التنوع',
    en: 'Variety',
    desc_ar: 'الحاجة إلى التغيير والإثارة والمغامرة',
    desc_en: 'The need for change, excitement and adventure',
    healthy_ar: ['السفر والاستكشاف', 'تعلم مهارات جديدة', 'الرياضات المثيرة'],
    healthy_en: ['Travel & exploration', 'Learning new skills', 'Thrilling sports'],
    unhealthy_ar: ['تشتت الانتباه', 'الانتقال من علاقة لأخرى', 'إدمان المخاطرة'],
    unhealthy_en: ['Distraction & ADD', 'Serial relationships', 'Risk addiction'],
    rel_ar: [
      'تحتاج إلى التجديد والإثارة في علاقاتك — الروتين يشعرك بالملل',
      'تجلب الحيوية والإبداع لمن حولك، لكن احذر من عدم الاستقرار العاطفي',
    ],
    rel_en: [
      'You need novelty and excitement in relationships — routine feels suffocating',
      'You bring vitality and creativity to others, but watch for emotional instability',
    ],
  },
  {
    key: 'significance',
    color: '#e63946',
    icon: Star,
    ar: 'الأهمية',
    en: 'Significance',
    desc_ar: 'الحاجة إلى الشعور بالتميز والقيمة والاعتراف',
    desc_en: 'The need to feel unique, important and recognized',
    healthy_ar: ['تحقيق الإنجازات', 'التميز في مجال الخبرة', 'قيادة الآخرين'],
    healthy_en: ['Achieving milestones', 'Becoming an expert', 'Leading others'],
    unhealthy_ar: ['التفاخر والغرور', 'إنزال الآخرين', 'السعي للشهرة بأي ثمن'],
    unhealthy_en: ['Bragging & arrogance', 'Putting others down', 'Fame at any cost'],
    rel_ar: [
      'تحتاج إلى أن تُقدَّر وتُرى في علاقاتك — الإهمال يؤلمك عميقاً',
      'علاقاتك تزدهر حين يُعترف بدورك ومكانتك — الاعتراف هو لغة حبك',
    ],
    rel_en: [
      'You need to feel valued and seen in relationships — being ignored cuts deep',
      'Your relationships flourish when your role is recognized — appreciation is your love language',
    ],
  },
  {
    key: 'love',
    color: '#e91e8c',
    icon: Heart,
    ar: 'الحب والتواصل',
    en: 'Love & Connection',
    desc_ar: 'الحاجة إلى المحبة والتواصل العميق مع الآخرين',
    desc_en: 'The need for love and deep connection with others',
    healthy_ar: ['بناء علاقات صادقة', 'التطوع والعطاء', 'الاحتفاء بالآخرين'],
    healthy_en: ['Building genuine bonds', 'Volunteering & giving', 'Celebrating others'],
    unhealthy_ar: ['التعلق المفرط', 'الغيرة والتملك', 'قبول علاقات مسيئة'],
    unhealthy_en: ['Codependency', 'Jealousy & possessiveness', 'Accepting abuse'],
    rel_ar: [
      'العلاقات هي مركز حياتك — تستثمر عاطفياً بعمق وتحتاج تواصلاً حقيقياً',
      'تخشى الرفض لأن الحب حاجتك الجوهرية — الانفتاح مع الحدود الصحية مفتاحك',
    ],
    rel_en: [
      'Relationships are at the center of your life — you invest deeply and need genuine connection',
      'You fear rejection because love is your core need — openness with healthy boundaries is your key',
    ],
  },
  {
    key: 'growth',
    color: '#2ecc71',
    icon: TrendingUp,
    ar: 'النمو',
    en: 'Growth',
    desc_ar: 'الحاجة إلى التطور والتقدم المستمر',
    desc_en: 'The need for constant development and progress',
    healthy_ar: ['القراءة والتعلم المستمر', 'التحديات الجديدة', 'التأمل والمراجعة الذاتية'],
    healthy_en: ['Continuous learning', 'New challenges', 'Reflection & self-review'],
    unhealthy_ar: ['إهمال العلاقات للتركيز على النمو', 'الكمالية المفرطة', 'الإرهاق الذاتي'],
    unhealthy_en: ['Neglecting relationships for growth', 'Perfectionism', 'Self-burnout'],
    rel_ar: [
      'تريد علاقات تُحفّزك على النمو — الشريك الذي يُلهمك أهم من الشريك المريح',
      'احذر من إهمال علاقاتك أثناء انشغالك بتطوير نفسك — النمو مع الآخرين أعمق',
    ],
    rel_en: [
      'You want relationships that challenge and inspire growth — a stimulating partner beats a comfortable one',
      'Beware of neglecting relationships while pursuing self-improvement — growing together runs deeper',
    ],
  },
  {
    key: 'contribution',
    color: '#c9a84c',
    icon: Users,
    ar: 'المساهمة',
    en: 'Contribution',
    desc_ar: 'الحاجة إلى إعطاء ما هو أبعد من الذات وترك أثر',
    desc_en: 'The need to give beyond yourself and leave a legacy',
    healthy_ar: ['العمل الخيري', 'تعليم وإرشاد الآخرين', 'المشاريع ذات الأثر الاجتماعي'],
    healthy_en: ['Charity work', 'Mentoring others', 'Social impact projects'],
    unhealthy_ar: ['إهمال النفس لأجل الآخرين', 'الشعور بالاستشهاد', 'تجاهل حدود الطاقة'],
    unhealthy_en: ['Self-neglect for others', 'Martyrdom complex', 'Ignoring energy limits'],
    rel_ar: [
      'تجد معنى عميقاً في رعاية من تحب ودعمهم — العطاء هو أسلوب حبك',
      'تأكد من أن علاقاتك تبادلية — لا تستنزف نفسك لأجل الآخرين دون تجديد طاقتك',
    ],
    rel_en: [
      'You find deep meaning in nurturing and supporting loved ones — giving is how you love',
      'Ensure your relationships are reciprocal — don\'t deplete yourself for others without replenishing',
    ],
  },
]

const TABS = [
  { id: 'diagnostic', ar: 'التشخيص', en: 'Diagnostic' },
  { id: 'tracking', ar: 'التتبع', en: 'Tracking' },
  { id: 'sources', ar: 'المصادر', en: 'Sources' },
  { id: 'transform', ar: 'التحول', en: 'Transform' },
]

const INSIGHTS = {
  certainty_significance: {
    ar: 'تسعى للسيطرة والاحترام — قائد طبيعي إذا وجّهت هذا نحو خدمة الآخرين',
    en: 'You seek control and respect — a natural leader if directed toward serving others',
  },
  certainty_love: {
    ar: 'تحتاج الأمان في علاقاتك — بناء الثقة هو مفتاحك',
    en: 'You need security in relationships — building trust is your key',
  },
  variety_significance: {
    ar: 'تريد أن تبرز وتنجز بطرق جديدة — إبداعك قوتك الكبرى',
    en: 'You want to stand out and achieve in new ways — creativity is your superpower',
  },
  variety_love: {
    ar: 'تبحث عن الإثارة والتواصل — ستزدهر في مجتمعات حيوية وعلاقات نشطة',
    en: 'You seek excitement and connection — you thrive in vibrant communities',
  },
  growth_contribution: {
    ar: 'تريد التطور وتغيير العالم — مسار المرشد والقائد الرسالي',
    en: 'You want to grow and change the world — the mentor/mission leader path',
  },
  significance_contribution: {
    ar: 'تريد أن يُعرف بك وأن تترك أثراً — الريادة الاجتماعية طريقك',
    en: 'You want to be known and leave a legacy — social entrepreneurship is your path',
  },
}

function getInsight(top1, top2) {
  const key1 = `${top1}_${top2}`
  const key2 = `${top2}_${top1}`
  return INSIGHTS[key1] || INSIGHTS[key2] || null
}

export default function SixHumanNeeds() {
  const { lang, dir } = useLang()
  const { state, update } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const [activeTab, setActiveTab] = useState('diagnostic')
  const [scores, setScores] = useState(
    state.sixNeedsScores || { certainty: 5, variety: 5, significance: 5, love: 5, growth: 5, contribution: 5 }
  )
  const [sources, setSources] = useState(state.sixNeedsSources || {})
  const [vehicle, setVehicle] = useState(state.sixNeedsVehicle || '')
  const history = state.sixNeedsHistory || {}
  const today = new Date().toISOString().split('T')[0]
  const savedToday = !!history[today]

  const sortedNeeds = [...NEED_META].map((n, index) => ({ ...n, index }))
    .sort((a, b) => (scores[b.key] || 0) - (scores[a.key] || 0) || a.index - b.index)
  const dominant = sortedNeeds[0]
  const shadow = sortedNeeds[sortedNeeds.length - 1]
  const top2Keys = [sortedNeeds[0].key, sortedNeeds[1].key].sort()
  const insight = getInsight(top2Keys[0], top2Keys[1])

  function handleScoreChange(key, val) {
    setScores(prev => ({ ...prev, [key]: Number(val) }))
  }

  function saveScores() {
    update('sixNeedsScores', scores)
    showToast(isAr ? 'تم حفظ نتائج الاحتياجات' : 'Needs scores saved', 'success')
  }

  function saveWeeklySnapshot() {
    const snapshot = { ...scores, ts: Date.now() }
    const updated = { ...history, [today]: snapshot }
    update('sixNeedsHistory', updated)
    update('sixNeedsScores', scores)
    showToast(isAr ? 'تم حفظ تقييم الأسبوع!' : 'Weekly check-in saved!', 'success')
  }

  // Get sorted history entries for chart
  const historyEntries = Object.entries(history)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)  // last 8 entries

  function toggleSource(needKey, type, item) {
    const prev = sources[needKey]?.[type] || []
    const next = prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    const updated = { ...sources, [needKey]: { ...(sources[needKey] || {}), [type]: next } }
    setSources(updated)
    update('sixNeedsSources', updated)
  }

  function saveVehicle() {
    update('sixNeedsVehicle', vehicle)
    showToast(isAr ? 'تم حفظ المركبة الأساسية' : 'Primary vehicle saved', 'success')
  }

  const maxScore = Math.max(...Object.values(scores))

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-24" dir={dir}>
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-b border-[#c9a84c]/20 px-4 pt-8 pb-6">
          <h1 className="text-2xl font-bold text-[#c9a84c] text-center">
            {isAr ? 'الاحتياجات الإنسانية الستة' : '6 Human Needs'}
          </h1>
          <p className="text-center text-gray-400 text-sm mt-1">
            {isAr ? 'نموذج توني روبنز لفهم المحركات الداخلية' : "Tony Robbins' model for inner drivers"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {isAr ? tab.ar : tab.en}
            </button>
          ))}
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto">
          {/* ── TAB 1: DIAGNOSTIC ── */}
          {activeTab === 'diagnostic' && (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm text-center">
                {isAr
                  ? 'حرّك كل شريط ليعكس مدى أهمية هذه الحاجة في حياتك الآن (1 = منخفض، 10 = أعلى)'
                  : 'Drag each slider to reflect how much this need drives you now (1 = low, 10 = highest)'}
              </p>

              {NEED_META.map(need => {
                const Icon = need.icon
                const val = scores[need.key] || 5
                return (
                  <div
                    key={need.key}
                    className="bg-[#111] rounded-2xl p-4 border border-[#222] hover:border-[#333] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: need.color + '22', border: `1.5px solid ${need.color}` }}
                      >
                        <Icon size={18} style={{ color: need.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">
                          {isAr ? need.ar : need.en}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isAr ? need.desc_ar : need.desc_en}
                        </div>
                      </div>
                      <div
                        className="text-xl font-black w-8 text-center"
                        style={{ color: need.color }}
                      >
                        {val}
                      </div>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={val}
                      onChange={e => handleScoreChange(need.key, e.target.value)}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to ${isAr ? 'left' : 'right'}, ${need.color} ${(val - 1) / 9 * 100}%, #333 ${(val - 1) / 9 * 100}%)`,
                        accentColor: need.color,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>1</span>
                      <span>10</span>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={saveScores}
                className="w-full py-3 rounded-xl font-bold text-black"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c96e)' }}
              >
                {isAr ? 'حفظ النتائج' : 'Save Results'}
              </button>

              {/* Results section */}
              <div className="bg-[#111] rounded-2xl p-5 border border-[#c9a84c]/20 space-y-4 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 size={18} className="text-[#c9a84c]" />
                  <span className="font-bold text-[#c9a84c]">
                    {isAr ? 'نتائجك' : 'Your Results'}
                  </span>
                </div>

                {/* Bar chart */}
                {sortedNeeds.map(need => {
                  const val = scores[need.key] || 0
                  const pct = maxScore > 0 ? (val / maxScore) * 100 : 0
                  return (
                    <div key={need.key} className="flex items-center gap-3">
                      <div className={`text-xs text-gray-400 w-24 flex-shrink-0 ${isAr ? 'text-left' : 'text-right'}`} dir="ltr">
                        {isAr ? need.ar : need.en}
                      </div>
                      <div className="flex-1 h-5 bg-[#222] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${pct}%`, backgroundColor: need.color }}
                        >
                          <span className="text-xs font-bold text-white">{val}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Dominant / Shadow */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ backgroundColor: dominant.color + '18', border: `1px solid ${dominant.color}55` }}
                  >
                    <div className="text-xs text-gray-400 mb-1">
                      {isAr ? 'الحاجة السائدة' : 'Dominant Need'}
                    </div>
                    <div className="font-bold" style={{ color: dominant.color }}>
                      {isAr ? dominant.ar : dominant.en}
                    </div>
                    <div className="text-2xl font-black mt-1" style={{ color: dominant.color }}>
                      {scores[dominant.key]}
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ backgroundColor: shadow.color + '18', border: `1px solid ${shadow.color}55` }}
                  >
                    <div className="text-xs text-gray-400 mb-1">
                      {isAr ? 'الحاجة الخفية' : 'Shadow Need'}
                    </div>
                    <div className="font-bold" style={{ color: shadow.color }}>
                      {isAr ? shadow.ar : shadow.en}
                    </div>
                    <div className="text-2xl font-black mt-1" style={{ color: shadow.color }}>
                      {scores[shadow.key]}
                    </div>
                  </div>
                </div>

                {/* Insight */}
                {insight && (
                  <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl p-4 flex gap-3">
                    <Lightbulb size={20} className="text-[#c9a84c] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">
                      {isAr ? insight.ar : insight.en}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 2: TRACKING ── */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm text-center">
                {isAr
                  ? 'تتبع تطور احتياجاتك أسبوعياً — لاحظ كيف تتغير أولوياتك مع الوقت'
                  : 'Track your needs evolution weekly — notice how your priorities shift over time'}
              </p>

              {/* Weekly Check-in */}
              <div className="bg-[#111] rounded-2xl p-5 border border-[#c9a84c]/20 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#c9a84c]" />
                  <span className="font-bold text-[#c9a84c]">
                    {isAr ? 'تقييم هذا الأسبوع' : "This Week's Check-in"}
                  </span>
                  {savedToday && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(46,204,113,0.15)', color: '#2ecc71' }}>
                      ✓ {isAr ? 'تم اليوم' : 'Done today'}
                    </span>
                  )}
                </div>

                {NEED_META.map(need => {
                  const Icon = need.icon
                  const val = scores[need.key] || 5
                  return (
                    <div key={need.key} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: need.color + '22' }}>
                        <Icon size={14} style={{ color: need.color }} />
                      </div>
                      <span className="text-xs font-bold w-16 flex-shrink-0" style={{ color: need.color }}>
                        {isAr ? need.ar : need.en}
                      </span>
                      <input
                        type="range" min={1} max={10} value={val}
                        onChange={e => handleScoreChange(need.key, e.target.value)}
                        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to ${isAr ? 'left' : 'right'}, ${need.color} ${(val - 1) / 9 * 100}%, #333 ${(val - 1) / 9 * 100}%)`,
                          accentColor: need.color,
                        }}
                      />
                      <span className="text-sm font-black w-6 text-center" style={{ color: need.color }}>{val}</span>
                    </div>
                  )
                })}

                <button
                  onClick={saveWeeklySnapshot}
                  className="w-full py-3 rounded-xl font-bold text-black"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c96e)' }}
                >
                  {savedToday
                    ? (isAr ? 'تحديث تقييم اليوم' : 'Update Today\'s Check-in')
                    : (isAr ? 'حفظ تقييم الأسبوع' : 'Save Weekly Check-in')
                  }
                </button>
              </div>

              {/* History Chart */}
              {historyEntries.length > 0 && (
                <div className="bg-[#111] rounded-2xl p-5 border border-[#222] space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#c9a84c]" />
                    <span className="font-bold text-[#c9a84c]">
                      {isAr ? 'تطور الاحتياجات' : 'Needs Evolution'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({historyEntries.length} {isAr ? 'تقييم' : 'entries'})
                    </span>
                  </div>

                  {/* Mini sparkline per need */}
                  {NEED_META.map(need => {
                    const vals = historyEntries.map(([, e]) => e[need.key] || 5)
                    const maxV = Math.max(...vals)
                    const minV = Math.min(...vals)
                    const latest = vals[vals.length - 1]
                    const prev = vals.length > 1 ? vals[vals.length - 2] : latest
                    const trend = latest - prev
                    return (
                      <div key={need.key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold" style={{ color: need.color }}>
                            {isAr ? need.ar : need.en}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold" style={{ color: need.color }}>{latest}</span>
                            {trend !== 0 && (
                              <span className="text-xs" style={{ color: trend > 0 ? '#2ecc71' : '#e63946' }}>
                                {trend > 0 ? '↑' : '↓'}{Math.abs(trend)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-end gap-1 h-6">
                          {vals.map((v, i) => (
                            <div key={i} className="flex-1 rounded-t-sm transition-all"
                              style={{
                                height: `${((v - 1) / 9) * 100}%`,
                                minHeight: '2px',
                                backgroundColor: i === vals.length - 1 ? need.color : need.color + '55',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {/* History list */}
                  <div className="pt-2 border-t border-[#222]">
                    <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                      <Clock size={12} /> {isAr ? 'السجل' : 'History'}
                    </p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {[...historyEntries].reverse().map(([date, entry]) => {
                        const topNeed = NEED_META.reduce((a, b) => (entry[b.key] || 0) > (entry[a.key] || 0) ? b : a)
                        return (
                          <div key={date} className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg"
                            style={{ background: '#1a1a1a' }}>
                            <span className="text-gray-500 w-20 flex-shrink-0">{date}</span>
                            <span style={{ color: topNeed.color }} className="font-bold flex-shrink-0">
                              {isAr ? topNeed.ar : topNeed.en}
                            </span>
                            <span className="text-gray-600">= {entry[topNeed.key]}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {historyEntries.length === 0 && (
                <div className="bg-[#111] rounded-2xl p-6 text-center border border-[#222]">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-sm text-gray-400">
                    {isAr ? 'ابدأ بأول تقييم أسبوعي لتتبع تطورك' : 'Start your first weekly check-in to track your evolution'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: SOURCES ── */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm text-center">
                {isAr
                  ? 'حدد الطرق التي تلبي بها كل حاجة حالياً'
                  : 'Select how you currently meet each need'}
              </p>
              {NEED_META.map(need => {
                const Icon = need.icon
                const needSources = sources[need.key] || {}
                return (
                  <div
                    key={need.key}
                    className="bg-[#111] rounded-2xl p-5 border border-[#222] space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: need.color + '22', border: `1.5px solid ${need.color}` }}
                      >
                        <Icon size={18} style={{ color: need.color }} />
                      </div>
                      <span className="font-bold" style={{ color: need.color }}>
                        {isAr ? need.ar : need.en}
                      </span>
                    </div>

                    {/* Healthy */}
                    <div>
                      <div className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wide">
                        {isAr ? 'طرق صحية' : 'Healthy Ways'}
                      </div>
                      <div className="space-y-2">
                        {(isAr ? need.healthy_ar : need.healthy_en).map((item, i) => {
                          const checked = (needSources.healthy || []).includes(item)
                          return (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  checked ? 'bg-green-500 border-green-500' : 'border-[#444] group-hover:border-green-400'
                                }`}
                                onClick={() => toggleSource(need.key, 'healthy', item)}
                              >
                                {checked && <CheckCircle size={12} className="text-white" />}
                              </div>
                              <span className="text-sm text-gray-300">{item}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* Unhealthy */}
                    <div>
                      <div className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wide">
                        {isAr ? 'طرق غير صحية' : 'Unhealthy Ways'}
                      </div>
                      <div className="space-y-2">
                        {(isAr ? need.unhealthy_ar : need.unhealthy_en).map((item, i) => {
                          const checked = (needSources.unhealthy || []).includes(item)
                          return (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  checked ? 'bg-red-500 border-red-500' : 'border-[#444] group-hover:border-red-400'
                                }`}
                                onClick={() => toggleSource(need.key, 'unhealthy', item)}
                              >
                                {checked && <CheckCircle size={12} className="text-white" />}
                              </div>
                              <span className="text-sm text-gray-300">{item}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── TAB 4: TRANSFORM ── */}
          {activeTab === 'transform' && (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm text-center">
                {isAr
                  ? 'بناءً على نتائجك، إليك أسئلة التحول لاحتياجاتك الأعلى'
                  : 'Based on your scores, here are transformation questions for your top needs'}
              </p>

              {/* Top 2 needs */}
              {sortedNeeds.slice(0, 2).map(need => {
                const Icon = need.icon
                const transformQuestions_ar = [
                  `كيف تلبّي حاجتك في "${need.ar}" بطرق تخدم رسالتك؟`,
                  `متى كانت آخر مرة أحسست بـ"${need.ar}" بشكل حقيقي؟`,
                  `ماذا ستفعل بشكل مختلف إذا لم تكن هذه الحاجة تسيطر عليك؟`,
                ]
                const transformQuestions_en = [
                  `How can you meet your "${need.en}" need in ways that serve your mission?`,
                  `When did you last feel genuine "${need.en}"?`,
                  `What would you do differently if this need didn't control you?`,
                ]
                const questions = isAr ? transformQuestions_ar : transformQuestions_en
                return (
                  <div
                    key={need.key}
                    className="bg-[#111] rounded-2xl p-5 border space-y-4"
                    style={{ borderColor: need.color + '44' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: need.color + '22', border: `2px solid ${need.color}` }}
                      >
                        <Icon size={20} style={{ color: need.color }} />
                      </div>
                      <div>
                        <div className="font-bold text-white">{isAr ? need.ar : need.en}</div>
                        <div className="text-xs text-gray-500">
                          {isAr ? 'حاجتك الأعلى' : 'Your top need'} — {scores[need.key]}/10
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {questions.map((q, i) => (
                        <div
                          key={i}
                          className="flex gap-3 bg-[#1a1a1a] rounded-xl p-3"
                        >
                          <ChevronRight size={16} style={{ color: need.color }} className="flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-300">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Primary Vehicle */}
              <div className="bg-[#111] rounded-2xl p-5 border border-[#c9a84c]/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-[#c9a84c]" />
                  <span className="font-bold text-[#c9a84c]">
                    {isAr ? 'المركبة الأساسية' : 'Primary Vehicle'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {isAr
                    ? 'المركبة الأساسية هي النشاط أو المسار الذي يلبّي جميع احتياجاتك الستة في آنٍ واحد. ما الشيء الذي إذا فعلته أحسست بالأمان والإثارة والأهمية والمحبة والنمو والمساهمة معاً؟'
                    : "Your primary vehicle is the activity or path that meets ALL 6 needs simultaneously. What one thing, when you do it, makes you feel certain, excited, significant, connected, growing, and contributing all at once?"}
                </p>
                <textarea
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value)}
                  placeholder={isAr ? 'اكتب مركبتك الأساسية هنا...' : 'Write your primary vehicle here...'}
                  rows={4}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-[#c9a84c]/50"
                />
                <button
                  onClick={saveVehicle}
                  className="w-full py-3 rounded-xl font-bold text-black"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c96e)' }}
                >
                  {isAr ? 'حفظ المركبة الأساسية' : 'Save Primary Vehicle'}
                </button>
              </div>

              {/* ── Cross-link: Relationship Blueprint ── */}
              <div className="bg-[#111] rounded-2xl p-5 border space-y-4"
                style={{ borderColor: dominant.color + '44' }}>
                <div className="flex items-center gap-2">
                  <Link size={18} style={{ color: dominant.color }} />
                  <span className="font-bold" style={{ color: dominant.color }}>
                    {isAr ? 'ربط بالعلاقات' : 'Connection to Relationships'}
                  </span>
                </div>

                {/* Top need in context of relationships */}
                <div className="rounded-xl p-4 space-y-2"
                  style={{ background: dominant.color + '10', border: `1px solid ${dominant.color}33` }}>
                  <p className="text-sm font-bold text-white">
                    {isAr
                      ? `احتياجك الأعلى "${dominant.ar}" يشكّل كيف تسلوك في علاقاتك — افهم نفسك أكثر`
                      : `Your dominant need "${dominant.en}" shapes how you show up in relationships — understand yourself deeper`}
                  </p>
                </div>

                {/* Relationship impact lines */}
                <div className="space-y-2">
                  {(isAr ? dominant.rel_ar : dominant.rel_en).map((line, i) => (
                    <div key={i} className="flex gap-3 rounded-xl p-3"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <ChevronRight size={16} style={{ color: dominant.color, flexShrink: 0, marginTop: 2 }} />
                      <p className="text-sm text-gray-300">{line}</p>
                    </div>
                  ))}
                </div>

                {/* Navigate to Relationships */}
                <button
                  onClick={() => navigate('/relationships')}
                  className="w-full py-3 rounded-xl font-bold text-black transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c96e)' }}
                >
                  🔗 {isAr ? 'افتح خارطة العلاقات' : 'Open Relationship Blueprint'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
