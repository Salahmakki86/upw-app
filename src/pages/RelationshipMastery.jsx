import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const RELATIONSHIP_TYPES = {
  ar: {
    family:     { label: 'الأسرة',     emoji: '👨‍👩‍👧', color: '#e91e8c' },
    partner:    { label: 'الشريك',     emoji: '❤️',     color: '#e63946' },
    friends:    { label: 'الأصدقاء',   emoji: '👫',     color: '#3498db' },
    colleagues: { label: 'الزملاء',    emoji: '💼',     color: '#f39c12' },
    self:       { label: 'نفسي',        emoji: '🌟',     color: '#2ecc71' },
    community:  { label: 'المجتمع',    emoji: '🌍',     color: '#9b59b6' },
  },
  en: {
    family:     { label: 'Family',      emoji: '👨‍👩‍👧', color: '#e91e8c' },
    partner:    { label: 'Partner',     emoji: '❤️',     color: '#e63946' },
    friends:    { label: 'Friends',     emoji: '👫',     color: '#3498db' },
    colleagues: { label: 'Colleagues',  emoji: '💼',     color: '#f39c12' },
    self:       { label: 'Self',        emoji: '🌟',     color: '#2ecc71' },
    community:  { label: 'Community',   emoji: '🌍',     color: '#9b59b6' },
  },
}

const HUMAN_NEEDS = {
  ar: ['اليقين', 'التنوع', 'الأهمية', 'الحب', 'النمو', 'المساهمة'],
  en: ['Certainty', 'Variety', 'Significance', 'Love', 'Growth', 'Contribution'],
}

const BLUEPRINT_PEOPLE = {
  ar: [
    { key: 'partner',   label: 'الشريك',       emoji: '❤️' },
    { key: 'parent',    label: 'أحد الوالدين',  emoji: '🧡' },
    { key: 'friend',    label: 'صديق',          emoji: '👫' },
    { key: 'colleague', label: 'زميل',           emoji: '💼' },
    { key: 'self',      label: 'نفسي',           emoji: '🌟' },
  ],
  en: [
    { key: 'partner',   label: 'Partner',    emoji: '❤️' },
    { key: 'parent',    label: 'Parent',     emoji: '🧡' },
    { key: 'friend',    label: 'Friend',     emoji: '👫' },
    { key: 'colleague', label: 'Colleague',  emoji: '💼' },
    { key: 'self',      label: 'Self',       emoji: '🌟' },
  ],
}

const LOVE_LANGUAGES = {
  ar: [
    { key: 'touch',   label: 'اللمس الجسدي',       emoji: '🤝' },
    { key: 'time',    label: 'الوقت المشترك',       emoji: '⏳' },
    { key: 'words',   label: 'كلمات التأكيد',       emoji: '💬' },
    { key: 'service', label: 'أعمال الخدمة',        emoji: '🛠️' },
    { key: 'gifts',   label: 'الهدايا',             emoji: '🎁' },
  ],
  en: [
    { key: 'touch',   label: 'Physical Touch',      emoji: '🤝' },
    { key: 'time',    label: 'Quality Time',         emoji: '⏳' },
    { key: 'words',   label: 'Words of Affirmation', emoji: '💬' },
    { key: 'service', label: 'Acts of Service',      emoji: '🛠️' },
    { key: 'gifts',   label: 'Gifts',                emoji: '🎁' },
  ],
}

const BLUEPRINT_EMOTIONS = {
  ar: [
    { key: 'happy',     label: 'سعيد',    emoji: '😊' },
    { key: 'respected', label: 'محترم',   emoji: '🫡' },
    { key: 'loved',     label: 'محبوب',   emoji: '❤️' },
  ],
  en: [
    { key: 'happy',     label: 'Happy',     emoji: '😊' },
    { key: 'respected', label: 'Respected', emoji: '🫡' },
    { key: 'loved',     label: 'Loved',     emoji: '❤️' },
  ],
}

const EMPTY_BLUEPRINT = {
  loveLangs: [],
  myRules: { happy: '', respected: '', loved: '' },
  theirRules: { happy: '', respected: '', loved: '' },
  gapAction: '',
}

export default function RelationshipMastery() {
  const { state, updateRelationships } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const [tab, setTab] = useState(0)

  const relationships = state.relationships || {
    ratings: { family: 5, partner: 5, friends: 5, colleagues: 5, self: 5, community: 5 },
    givingPlan: [
      { person: '', action: '', done: false },
      { person: '', action: '', done: false },
      { person: '', action: '', done: false },
      { person: '', action: '', done: false },
      { person: '', action: '', done: false },
    ],
    needsAnswers: {},
  }

  const ratings      = relationships.ratings      || {}
  const givingPlan   = relationships.givingPlan   || []
  const needsAnswers = relationships.needsAnswers  || {}
  const blueprints   = relationships.blueprints   || {}

  // Blueprint local state
  const blueprintPeople = BLUEPRINT_PEOPLE[lang]
  const [selectedPerson, setSelectedPerson] = useState(blueprintPeople[0].key)
  const currentBp = blueprints[selectedPerson] || { ...EMPTY_BLUEPRINT }

  const tabs = isAr
    ? ['تشخيص العلاقات', 'الاحتياجات', 'خطة العطاء', 'المخطط / Blueprint']
    : ['Diagnosis', 'Needs', 'Giving Plan', 'Blueprint']

  const handleRating = (key, val) => {
    updateRelationships('ratings', { ...ratings, [key]: val })
  }

  const handleGivingPlan = (idx, field, val) => {
    const updated = givingPlan.map((item, i) => i === idx ? { ...item, [field]: val } : item)
    updateRelationships('givingPlan', updated)
  }

  const handleNeedsAnswer = (key, val) => {
    updateRelationships('needsAnswers', { ...needsAnswers, [key]: val })
  }

  // Blueprint helpers
  const updateBp = (patch) => {
    const updated = { ...blueprints, [selectedPerson]: { ...currentBp, ...patch } }
    updateRelationships('blueprints', updated)
  }

  const toggleLoveLang = (key) => {
    const langs = currentBp.loveLangs || []
    const next = langs.includes(key) ? langs.filter(k => k !== key) : [...langs, key]
    updateBp({ loveLangs: next })
  }

  const updateMyRule = (emotion, val) => {
    updateBp({ myRules: { ...(currentBp.myRules || {}), [emotion]: val } })
  }

  const updateTheirRule = (emotion, val) => {
    updateBp({ theirRules: { ...(currentBp.theirRules || {}), [emotion]: val } })
  }

  const saveBlueprintSection = () => {
    // Already saving on each change; this just provides a visual save trigger
    updateRelationships('blueprints', { ...blueprints, [selectedPerson]: currentBp })
  }

  const filledCount = Object.keys(blueprints).filter(k => {
    const bp = blueprints[k]
    return bp && (
      (bp.loveLangs && bp.loveLangs.length > 0) ||
      (bp.myRules && Object.values(bp.myRules).some(v => v)) ||
      (bp.gapAction && bp.gapAction.trim())
    )
  }).length

  const relTypes = RELATIONSHIP_TYPES[lang]
  const lowestKey = Object.entries(ratings).sort((a, b) => a[1] - b[1])[0]?.[0]

  return (
    <Layout title={t('relationships_title')} subtitle={t('relationships_subtitle')} helpKey="relationships">
      <div className="space-y-4 pt-2">

        {/* Tony Quote */}
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-sm font-bold text-white text-center leading-relaxed">
            "{isAr ? 'جودة حياتك = جودة علاقاتك' : 'The quality of your life is the quality of your relationships'}"
          </p>
          <p className="text-xs text-center mt-1" style={{ color: '#c9a84c' }}>— Tony Robbins</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          {tabs.map((tab_label, i) => (
            <button key={i} onClick={() => setTab(i)}
              className="flex-1 py-2.5 text-xs font-bold transition-all"
              style={{
                background: tab === i ? 'rgba(233,30,140,0.12)' : 'transparent',
                color: tab === i ? '#e91e8c' : '#666',
                borderRight: i < tabs.length - 1 ? '1px solid #2a2a2a' : 'none',
              }}>
              {tab_label}
            </button>
          ))}
        </div>

        {/* Tab 0: Diagnosis */}
        {tab === 0 && (
          <div className="space-y-3">
            {lowestKey && (
              <div className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.25)' }}>
                <span className="text-2xl">{relTypes[lowestKey]?.emoji}</span>
                <div>
                  <p className="text-xs" style={{ color: '#888' }}>{isAr ? 'تحتاج أكثر اهتمام:' : 'Needs most attention:'}</p>
                  <p className="font-bold text-white">{relTypes[lowestKey]?.label}</p>
                  <p className="text-xs" style={{ color: '#e63946' }}>
                    {isAr ? `تقييم: ${ratings[lowestKey]}/10` : `Score: ${ratings[lowestKey]}/10`}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {Object.entries(relTypes).map(([key, rel]) => {
                const score = ratings[key] || 5
                const pct = score * 10
                return (
                  <div key={key} className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rel.emoji}</span>
                        <span className="font-bold text-white text-sm">{rel.label}</span>
                      </div>
                      <span className="text-lg font-black" style={{ color: rel.color }}>{score}</span>
                    </div>
                    <div className="w-full rounded-full h-2 mb-3" style={{ background: '#2a2a2a' }}>
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: rel.color }} />
                    </div>
                    <div className="flex justify-between gap-1">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button key={n} onClick={() => handleRating(key, n)}
                          className="flex-1 rounded-md py-1 text-xs font-bold transition-all"
                          style={{ background: score === n ? rel.color : '#2a2a2a', color: score === n ? 'white' : '#555' }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 1: Needs */}
        {tab === 1 && (
          <div className="space-y-3">
            <div className="rounded-xl p-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <p className="text-xs text-center" style={{ color: '#888' }}>
                {isAr ? 'كيف تُلبّي الاحتياجات داخل علاقاتك مقابل من خلالها؟' : 'How do you meet needs IN relationships vs THROUGH relationships?'}
              </p>
            </div>
            {HUMAN_NEEDS[lang].map((need, i) => {
              const inKey = `need_in_${i}`
              const throughKey = `need_through_${i}`
              return (
                <div key={i} className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <p className="font-black text-white mb-3">{need}</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#888' }}>
                        {isAr ? 'داخل العلاقة:' : 'IN relationships:'}
                      </p>
                      <input value={needsAnswers[inKey] || ''} onChange={e => handleNeedsAnswer(inKey, e.target.value)}
                        placeholder={isAr ? 'كيف تُلبّي هذه الحاجة معهم؟' : 'How do you meet this need with them?'}
                        style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 12 }} />
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#888' }}>
                        {isAr ? 'من خلال العلاقة:' : 'THROUGH relationships:'}
                      </p>
                      <input value={needsAnswers[throughKey] || ''} onChange={e => handleNeedsAnswer(throughKey, e.target.value)}
                        placeholder={isAr ? 'ما الذي تحصل عليه من العلاقة؟' : 'What do you get FROM the relationship?'}
                        style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 12 }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab 2: Giving Plan */}
        {tab === 2 && (
          <div className="space-y-3">
            <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#c9a84c' }}>
                🎁 {isAr ? 'خطة العطاء الأسبوعية' : 'Weekly Giving Plan'}
              </p>
              <p className="text-xs" style={{ color: '#888' }}>
                {isAr ? '5 أشخاص في حياتك + فعل محدد من الحب والعطاء' : '5 people in your life + one specific act of love/contribution'}
              </p>
            </div>

            {givingPlan.map((item, idx) => (
              <div key={idx} className="rounded-2xl p-4"
                style={{ background: '#1a1a1a', border: `1px solid ${item.done ? 'rgba(46,204,113,0.3)' : '#2a2a2a'}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => handleGivingPlan(idx, 'done', !item.done)}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: item.done ? '#2ecc71' : '#2a2a2a', border: `2px solid ${item.done ? '#2ecc71' : '#444'}` }}>
                    {item.done && <span className="text-white text-xs">✓</span>}
                  </button>
                  <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                    {isAr ? `الشخص ${idx + 1}` : `Person ${idx + 1}`}
                  </p>
                </div>
                <div className="space-y-2">
                  <input value={item.person} onChange={e => handleGivingPlan(idx, 'person', e.target.value)}
                    placeholder={isAr ? 'اسم الشخص' : 'Person name'}
                    style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 13 }} />
                  <input value={item.action} onChange={e => handleGivingPlan(idx, 'action', e.target.value)}
                    placeholder={isAr ? 'فعل محدد من العطاء لهذا الشخص هذا الأسبوع' : 'Specific act of love/contribution this week'}
                    style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 13 }} />
                </div>
              </div>
            ))}

            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.15)' }}>
              <p className="text-xs" style={{ color: '#888' }}>
                {isAr ? 'مكتمل:' : 'Completed:'}{' '}
                <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                  {givingPlan.filter(i => i.done).length}/5
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Blueprint */}
        {tab === 3 && (
          <div className="space-y-4">

            {/* Intro */}
            <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #0d1a2e, #1a1a1a)', border: '1px solid rgba(52,152,219,0.25)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#3498db' }}>
                🗺️ {isAr ? 'مخطط العلاقة' : 'Relationship Blueprint'}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
                {isAr
                  ? 'لكل شخص "مخطط" — قواعد داخلية لمتى يشعر بالحب والاحترام والسعادة. التعارض بين المخططات = الألم.'
                  : 'Every person has a "blueprint" — internal rules for when they feel loved, respected, and happy. Mismatched blueprints = pain.'}
              </p>
            </div>

            {/* Person Selector */}
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: '#888' }}>
                {isAr ? 'اختر العلاقة:' : 'Select relationship:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {blueprintPeople.map(person => (
                  <button
                    key={person.key}
                    onClick={() => setSelectedPerson(person.key)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: selectedPerson === person.key ? 'rgba(52,152,219,0.2)' : '#1a1a1a',
                      border: `1px solid ${selectedPerson === person.key ? '#3498db' : '#2a2a2a'}`,
                      color: selectedPerson === person.key ? '#3498db' : '#666',
                    }}>
                    <span>{person.emoji}</span>
                    <span>{person.label}</span>
                    {blueprints[person.key] && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2ecc71', display: 'inline-block' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Love Languages */}
            <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="font-bold text-white text-sm mb-1">
                {isAr ? '💝 متى تشعر أن هذا الشخص يحبك؟' : '💝 When do you feel this person loves you?'}
              </p>
              <p className="text-xs mb-3" style={{ color: '#666' }}>
                {isAr ? 'اختر كل ما ينطبق (اختيار متعدد)' : 'Select all that apply (multi-select)'}
              </p>
              <div className="space-y-2">
                {LOVE_LANGUAGES[lang].map(ll => {
                  const selected = (currentBp.loveLangs || []).includes(ll.key)
                  return (
                    <button
                      key={ll.key}
                      onClick={() => toggleLoveLang(ll.key)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                      style={{
                        background: selected ? 'rgba(233,30,140,0.1)' : '#111',
                        border: `1px solid ${selected ? 'rgba(233,30,140,0.4)' : '#2a2a2a'}`,
                        color: selected ? '#e91e8c' : '#888',
                        textAlign: isAr ? 'right' : 'left',
                      }}>
                      <span className="text-base flex-shrink-0">{ll.emoji}</span>
                      <span className="flex-1 font-medium">{ll.label}</span>
                      {selected && <span className="text-xs font-black">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Section 2: My Rules */}
            <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="font-bold text-white text-sm mb-1">
                {isAr ? '📋 قواعدك: ما الذي يجب أن يحدث لتشعر بالرضا؟' : '📋 Your rules: what must happen for you to feel satisfied?'}
              </p>
              <p className="text-xs mb-3" style={{ color: '#666' }}>
                {isAr ? 'أكمل الجملة: "أشعر بـ... عندما..."' : 'Complete the sentence: "I feel... when..."'}
              </p>
              <div className="space-y-3">
                {BLUEPRINT_EMOTIONS[lang].map(em => (
                  <div key={em.key}>
                    <p className="text-xs font-bold mb-1.5" style={{ color: '#c9a84c' }}>
                      {em.emoji} {isAr ? `أشعر أنني ${em.label} عندما:` : `I feel ${em.label} when:`}
                    </p>
                    <textarea
                      value={(currentBp.myRules || {})[em.key] || ''}
                      onChange={e => updateMyRule(em.key, e.target.value)}
                      placeholder={isAr ? 'اكتب قاعدتك هنا...' : 'Write your rule here...'}
                      rows={2}
                      style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 12, resize: 'none' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Their Blueprint */}
            <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="font-bold text-white text-sm mb-1">
                {isAr ? '🔍 ما قواعد هذا الشخص كما تفهمها؟' : "🔍 What are this person's rules as you understand them?"}
              </p>
              <p className="text-xs mb-3" style={{ color: '#666' }}>
                {isAr ? 'ما الذي يجعلهم يشعرون بهذه المشاعر؟' : 'What makes them feel these emotions?'}
              </p>
              <div className="space-y-3">
                {BLUEPRINT_EMOTIONS[lang].map(em => (
                  <div key={em.key}>
                    <p className="text-xs font-bold mb-1.5" style={{ color: '#3498db' }}>
                      {em.emoji} {isAr ? `يشعر بـ ${em.label} عندما:` : `They feel ${em.label} when:`}
                    </p>
                    <textarea
                      value={(currentBp.theirRules || {})[em.key] || ''}
                      onChange={e => updateTheirRule(em.key, e.target.value)}
                      placeholder={isAr ? 'اكتب فهمك لقواعدهم...' : 'Write your understanding of their rules...'}
                      rows={2}
                      style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 12, resize: 'none' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Gap Analysis */}
            <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="font-bold text-white text-sm mb-1">
                {isAr ? '🎯 أين الفجوة؟' : '🎯 Where is the gap?'}
              </p>
              <p className="text-xs mb-3" style={{ color: '#666' }}>
                {isAr ? 'ما الذي يمكنك فعله لتلبية قواعدهم؟' : 'What can you do to meet their rules?'}
              </p>
              <textarea
                value={currentBp.gapAction || ''}
                onChange={e => updateBp({ gapAction: e.target.value })}
                placeholder={isAr ? 'اكتب خطة عملك هنا...' : 'Write your action plan here...'}
                rows={4}
                style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 12, resize: 'none' }}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={saveBlueprintSection}
              className="w-full py-3 rounded-2xl text-sm font-black transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(52,152,219,0.2), rgba(52,152,219,0.1))', border: '1px solid rgba(52,152,219,0.4)', color: '#3498db' }}>
              {isAr ? '💾 حفظ المخطط' : '💾 Save Blueprint'}
            </button>

            {/* Summary Card */}
            {filledCount > 0 && (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)' }}>
                <p className="text-xs font-bold mb-3" style={{ color: '#2ecc71' }}>
                  ✅ {isAr ? `المخططات المكتملة: ${filledCount}` : `Completed Blueprints: ${filledCount}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {blueprintPeople.map(person => {
                    const bp = blueprints[person.key]
                    const hasBp = bp && (
                      (bp.loveLangs && bp.loveLangs.length > 0) ||
                      (bp.myRules && Object.values(bp.myRules).some(v => v)) ||
                      (bp.gapAction && bp.gapAction.trim())
                    )
                    if (!hasBp) return null
                    return (
                      <div
                        key={person.key}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                        style={{ background: 'rgba(46,204,113,0.12)', border: '1px solid rgba(46,204,113,0.25)', color: '#2ecc71' }}>
                        <span>{person.emoji}</span>
                        <span>{person.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </Layout>
  )
}
