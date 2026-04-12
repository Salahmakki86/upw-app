import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useLang } from '../context/LangContext'
import { useApp } from '../context/AppContext'

// Tags per concept title (bilingual match by title)
const CONCEPT_TAGS = {
  // AR titles
  'الثالوث العاطفي':          ['الحالة', 'الجسم'],
  'الحالة الجميلة vs المعاناة': ['الحالة', 'الوعي'],
  'القرارات الثلاثة':          ['الحالة', 'التركيز'],
  'البيت العاطفي':             ['الحالة', 'العادات'],
  'التكرارات الصوتية':         ['الأدوات', 'الحالة'],
  'أسئلة القوة':               ['الأدوات', 'التركيز'],
  'ساعة القوة':                ['الأدوات', 'الروتين'],
  'التحضير الذهني':            ['الأدوات', 'الروتين'],
  'عملية ديكنز':               ['التحول', 'المعتقدات'],
  'التكييف العصبي NAC':        ['التحول', 'المعتقدات'],
  'قاطع النمط':                ['التحول', 'الحالة'],
  'نمذجة التميز':              ['التحول', 'الأهداف'],
  'نظام RPM':                  ['الأهداف', 'التخطيط'],
  'معادلة النجاح المطلق':      ['الأهداف', 'التخطيط'],
  'الهدف ضرورة لا رغبة':       ['الأهداف', 'الدافع'],
  'إغلاق الفجوة':              ['الأهداف', 'التخطيط'],
  'اليقين':                    ['الاحتياجات', 'النفس'],
  'التنوع':                    ['الاحتياجات', 'النفس'],
  'الأهمية':                   ['الاحتياجات', 'النفس'],
  'الحب والتواصل':             ['الاحتياجات', 'العلاقات'],
  'النمو':                     ['الاحتياجات', 'التحول'],
  'المساهمة':                  ['الاحتياجات', 'العطاء'],
  // EN titles
  'The Triad':                          ['State', 'Body'],
  'Beautiful State vs. Suffering':       ['State', 'Awareness'],
  'Three Decisions':                     ['State', 'Focus'],
  'Home Base Emotion':                   ['State', 'Habits'],
  'Incantations':                        ['Tools', 'State'],
  'Power Questions':                     ['Tools', 'Focus'],
  'Hour of Power':                       ['Tools', 'Routine'],
  'Priming':                             ['Tools', 'Routine'],
  'Dickens Process':                     ['Transform', 'Beliefs'],
  'NAC — Neuro-Associative Conditioning':['Transform', 'Beliefs'],
  'Pattern Interrupt':                   ['Transform', 'State'],
  'Modeling Excellence':                 ['Transform', 'Goals'],
  'RPM System':                          ['Goals', 'Planning'],
  'Ultimate Success Formula':            ['Goals', 'Planning'],
  'Must vs. Want':                       ['Goals', 'Drive'],
  'Closing the Gap':                     ['Goals', 'Planning'],
  'Certainty':                           ['Needs', 'Psychology'],
  'Variety':                             ['Needs', 'Psychology'],
  'Significance':                        ['Needs', 'Psychology'],
  'Love & Connection':                   ['Needs', 'Relationships'],
  'Growth':                              ['Needs', 'Transform'],
  'Contribution':                        ['Needs', 'Giving'],
}

// Success principle titles get generic tags
const PRINCIPLE_TAG_AR = ['المبادئ', 'النجاح']
const PRINCIPLE_TAG_EN = ['Principles', 'Success']

// Related pages per concept title
const RELATED_PAGES = {
  // AR
  'الثالوث العاطفي':            [{ label: 'الحالة العاطفية', path: '/state' }, { label: 'الصباح', path: '/morning' }],
  'الحالة الجميلة vs المعاناة':  [{ label: 'الحالة العاطفية', path: '/state' }, { label: 'المكتبة', path: '/library' }],
  'القرارات الثلاثة':            [{ label: 'الأهداف', path: '/goals' }, { label: 'الحالة', path: '/state' }],
  'البيت العاطفي':              [{ label: 'الصباح', path: '/morning' }, { label: 'الحالة', path: '/state' }],
  'التكرارات الصوتية':           [{ label: 'الصباح', path: '/morning' }, { label: 'الحالة', path: '/state' }],
  'أسئلة القوة':                 [{ label: 'الصباح', path: '/morning' }, { label: 'الأهداف', path: '/goals' }],
  'ساعة القوة':                  [{ label: 'الصباح', path: '/morning' }, { label: 'العادات', path: '/habits' }],
  'التحضير الذهني':              [{ label: 'الصباح', path: '/morning' }, { label: 'العادات', path: '/habits' }],
  'عملية ديكنز':                 [{ label: 'الأهداف', path: '/goals' }, { label: 'الحالة', path: '/state' }],
  'التكييف العصبي NAC':          [{ label: 'العادات', path: '/habits' }, { label: 'الأهداف', path: '/goals' }],
  'قاطع النمط':                  [{ label: 'الحالة', path: '/state' }, { label: 'الصباح', path: '/morning' }],
  'نمذجة التميز':                [{ label: 'الأهداف', path: '/goals' }, { label: 'العجلة', path: '/wheel' }],
  'نظام RPM':                    [{ label: 'الأهداف', path: '/goals' }, { label: 'العجلة', path: '/wheel' }],
  'معادلة النجاح المطلق':        [{ label: 'الأهداف', path: '/goals' }, { label: 'العادات', path: '/habits' }],
  'الهدف ضرورة لا رغبة':         [{ label: 'الأهداف', path: '/goals' }, { label: 'الحالة', path: '/state' }],
  'إغلاق الفجوة':                [{ label: 'الأهداف', path: '/goals' }, { label: 'العجلة', path: '/wheel' }],
  'اليقين':                      [{ label: 'الحالة', path: '/state' }, { label: 'العجلة', path: '/wheel' }],
  'التنوع':                      [{ label: 'الحالة', path: '/state' }, { label: 'العادات', path: '/habits' }],
  'الأهمية':                     [{ label: 'الأهداف', path: '/goals' }, { label: 'العجلة', path: '/wheel' }],
  'الحب والتواصل':               [{ label: 'العجلة', path: '/wheel' }, { label: 'الصباح', path: '/morning' }],
  'النمو':                       [{ label: 'الأهداف', path: '/goals' }, { label: 'العادات', path: '/habits' }],
  'المساهمة':                    [{ label: 'العجلة', path: '/wheel' }, { label: 'الأهداف', path: '/goals' }],
  // EN
  'The Triad':                          [{ label: 'State', path: '/state' }, { label: 'Morning', path: '/morning' }],
  'Beautiful State vs. Suffering':       [{ label: 'State', path: '/state' }, { label: 'Morning', path: '/morning' }],
  'Three Decisions':                     [{ label: 'Goals', path: '/goals' }, { label: 'State', path: '/state' }],
  'Home Base Emotion':                   [{ label: 'Morning', path: '/morning' }, { label: 'State', path: '/state' }],
  'Incantations':                        [{ label: 'Morning', path: '/morning' }, { label: 'State', path: '/state' }],
  'Power Questions':                     [{ label: 'Morning', path: '/morning' }, { label: 'Goals', path: '/goals' }],
  'Hour of Power':                       [{ label: 'Morning', path: '/morning' }, { label: 'Habits', path: '/habits' }],
  'Priming':                             [{ label: 'Morning', path: '/morning' }, { label: 'Habits', path: '/habits' }],
  'Dickens Process':                     [{ label: 'Goals', path: '/goals' }, { label: 'State', path: '/state' }],
  'NAC — Neuro-Associative Conditioning':[{ label: 'Habits', path: '/habits' }, { label: 'Goals', path: '/goals' }],
  'Pattern Interrupt':                   [{ label: 'State', path: '/state' }, { label: 'Morning', path: '/morning' }],
  'Modeling Excellence':                 [{ label: 'Goals', path: '/goals' }, { label: 'Wheel', path: '/wheel' }],
  'RPM System':                          [{ label: 'Goals', path: '/goals' }, { label: 'Wheel', path: '/wheel' }],
  'Ultimate Success Formula':            [{ label: 'Goals', path: '/goals' }, { label: 'Habits', path: '/habits' }],
  'Must vs. Want':                       [{ label: 'Goals', path: '/goals' }, { label: 'State', path: '/state' }],
  'Closing the Gap':                     [{ label: 'Goals', path: '/goals' }, { label: 'Wheel', path: '/wheel' }],
  'Certainty':                           [{ label: 'State', path: '/state' }, { label: 'Wheel', path: '/wheel' }],
  'Variety':                             [{ label: 'State', path: '/state' }, { label: 'Habits', path: '/habits' }],
  'Significance':                        [{ label: 'Goals', path: '/goals' }, { label: 'Wheel', path: '/wheel' }],
  'Love & Connection':                   [{ label: 'Wheel', path: '/wheel' }, { label: 'Morning', path: '/morning' }],
  'Growth':                              [{ label: 'Goals', path: '/goals' }, { label: 'Habits', path: '/habits' }],
  'Contribution':                        [{ label: 'Wheel', path: '/wheel' }, { label: 'Goals', path: '/goals' }],
}

const TAG_COLORS = {
  // AR
  'الحالة': '#e91e8c', 'الجسم': '#e74c3c', 'الوعي': '#9b59b6', 'التركيز': '#3498db',
  'العادات': '#1abc9c', 'الأدوات': '#c9a84c', 'الروتين': '#2ecc71', 'التحول': '#f39c12',
  'المعتقدات': '#8e44ad', 'الأهداف': '#27ae60', 'التخطيط': '#2980b9', 'الدافع': '#e74c3c',
  'الاحتياجات': '#e91e8c', 'النفس': '#9b59b6', 'العلاقات': '#3498db', 'العطاء': '#c9a84c',
  'المبادئ': '#c9a84c', 'النجاح': '#2ecc71',
  // EN
  'State': '#e91e8c', 'Body': '#e74c3c', 'Awareness': '#9b59b6', 'Focus': '#3498db',
  'Habits': '#1abc9c', 'Tools': '#c9a84c', 'Routine': '#2ecc71', 'Transform': '#f39c12',
  'Beliefs': '#8e44ad', 'Goals': '#27ae60', 'Planning': '#2980b9', 'Drive': '#e74c3c',
  'Needs': '#e91e8c', 'Psychology': '#9b59b6', 'Relationships': '#3498db', 'Giving': '#c9a84c',
  'Principles': '#c9a84c', 'Success': '#2ecc71',
}

function HighlightText({ text, query }) {
  if (!query.trim()) return <span>{text}</span>
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} style={{ background: 'rgba(201,168,76,0.35)', color: '#c9a84c', borderRadius: 2, padding: '0 1px' }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  )
}

const CONCEPTS_DATA = {
  ar: [
    { category: 'الأساس', emoji: '🏛️', items: [
      { title: 'الثالوث العاطفي', desc: 'جسمك + تركيزك + لغتك = حالتك العاطفية الكاملة. غيّر واحداً وتغير الكل.' },
      { title: 'الحالة الجميلة vs المعاناة', desc: 'كل لحظة أنت في إحدى الحالتين. اختر بوعي أين تضع نفسك.' },
      { title: 'القرارات الثلاثة', desc: 'ما تركز عليه + ما يعنيه لك + ماذا ستفعل = مصيرك كل لحظة.' },
      { title: 'البيت العاطفي', desc: 'حالتك العاطفية الافتراضية. يمكن تغييرها بالوعي والممارسة اليومية.' },
    ]},
    { category: 'الأدوات', emoji: '🔧', items: [
      { title: 'التكرارات الصوتية', desc: 'ليس مجرد كلمات — بل عيشها بكل جسمك وصوتك وعاطفتك.' },
      { title: 'أسئلة القوة', desc: 'أسئلة صباحية ومسائية توجه تركيزك نحو الامتنان والإمكانية.' },
      { title: 'ساعة القوة', desc: 'حركة + تعلم + تخطيط + امتنان = 60 دقيقة تبني يومك الاستثنائي.' },
      { title: 'التحضير الذهني', desc: 'روتين 10-15 دقيقة صباحياً: تنفس → امتنان → شفاء → تخيل.' },
    ]},
    { category: 'التحول', emoji: '⚡', items: [
      { title: 'عملية ديكنز', desc: 'رحلة عبر الزمن لاستشعار ألم عدم التغيير ومتعة التحول. أقوى تمرين في UPW.' },
      { title: 'التكييف العصبي NAC', desc: 'ارتباط الألم بالقديم والمتعة بالجديد = تغيير دائم في السلوك.' },
      { title: 'قاطع النمط', desc: 'اكسر النمط السلبي بفعل مفاجئ قبل أن يستحكم.' },
      { title: 'نمذجة التميز', desc: 'ابحث عمّن حقق ما تريده وانسخ معتقداته واستراتيجياته.' },
    ]},
    { category: 'الأهداف', emoji: '🎯', items: [
      { title: 'نظام RPM', desc: 'النتيجة (R) + الغرض (P) + خطة العمل (M) = وصفة تحقيق أي هدف.' },
      { title: 'معادلة النجاح المطلق', desc: 'وضوح + سبب + إجراء ضخم + مراقبة + تعديل = النجاح الحتمي.' },
      { title: 'الهدف ضرورة لا رغبة', desc: 'اربط ألماً هائلاً بعدم التحرك ومتعة عظيمة بالوصول.' },
      { title: 'إغلاق الفجوة', desc: 'الفجوة بين الآن وهدفك هي سلسلة خطوات محددة — وليست هوّة.' },
    ]},
    { category: 'الاحتياجات', emoji: '❤️', items: [
      { title: 'اليقين', desc: 'الحاجة للأمان والاستقرار. الإفراط فيه يقتل النمو.' },
      { title: 'التنوع', desc: 'الحاجة للتغيير والمفاجآت والتحديات. بدونه تتجمد.' },
      { title: 'الأهمية', desc: 'الحاجة للشعور بالتميز والقيمة. تشبعه بالإنجاز لا الغرور.' },
      { title: 'الحب والتواصل', desc: 'الحاجة الأعمق. اشبعها بالعطاء قبل الأخذ.' },
      { title: 'النمو', desc: 'روح الإنسان. إذا لم تنمُ فأنت تتراجع — لا يوجد ثبات.' },
      { title: 'المساهمة', desc: 'سر الحياة. العطاء يملأ فراغاً لا يملأه أي شيء آخر.' },
    ]},
    { category: 'مبادئ النجاح', emoji: '🏆', items: [
      { title: 'المبدأ الأول: القوة في القرار', desc: 'كل شيء بدأ بقرار. القرار يغير كيمياء جسمك فوراً.' },
      { title: 'المبدأ الثاني: إدارة قوتك', desc: 'طاقتك أثمن مورد — جسمك، عقلك، وقتك، عواطفك.' },
      { title: 'المبدأ الثالث: الإتقان في العلاقات', desc: 'نجاحك يتناسب طردياً مع جودة علاقاتك.' },
      { title: 'المبدأ الرابع: الصحة هي الثروة', desc: 'بدون جسم قوي كل الثروة لا معنى لها.' },
      { title: 'المبدأ الخامس: إدارة المال', desc: 'لا تعمل من أجل المال — اجعل المال يعمل من أجلك.' },
      { title: 'المبدأ السادس: الوقت هو الحياة', desc: 'لا تدير وقتك — أدر حياتك. الوقت لا يُعاد.' },
      { title: 'المبدأ السابع: العطاء والمساهمة', desc: 'سر الحياة هو العطاء — ما تعطيه يعود إليك مضاعفاً.' },
    ]},
  ],
  en: [
    { category: 'Foundation', emoji: '🏛️', items: [
      { title: 'The Triad', desc: 'Your body + your focus + your language = your complete emotional state. Change one and you change everything.' },
      { title: 'Beautiful State vs. Suffering', desc: 'Every moment you are in one of two states. Choose consciously where you place yourself.' },
      { title: 'Three Decisions', desc: 'What you focus on + what it means + what you do = your destiny every moment.' },
      { title: 'Home Base Emotion', desc: 'Your default emotional state. It can be changed through awareness and daily practice.' },
    ]},
    { category: 'Tools', emoji: '🔧', items: [
      { title: 'Incantations', desc: 'Not just words — live them with your whole body, voice, and emotion.' },
      { title: 'Power Questions', desc: 'Morning and evening questions that direct your focus toward gratitude and possibility.' },
      { title: 'Hour of Power', desc: 'Movement + learning + planning + gratitude = 60 minutes that build your extraordinary day.' },
      { title: 'Priming', desc: '10-15 minute morning routine: breathing → gratitude → healing → visualization.' },
    ]},
    { category: 'Transformation', emoji: '⚡', items: [
      { title: 'Dickens Process', desc: 'A time journey to feel the pain of not changing and the pleasure of transformation. The most powerful UPW exercise.' },
      { title: 'NAC — Neuro-Associative Conditioning', desc: 'Linking pain to the old and pleasure to the new = permanent behavioral change.' },
      { title: 'Pattern Interrupt', desc: 'Break a negative pattern with a surprising action before it takes hold.' },
      { title: 'Modeling Excellence', desc: 'Find someone who achieved what you want and copy their beliefs and strategies.' },
    ]},
    { category: 'Goals', emoji: '🎯', items: [
      { title: 'RPM System', desc: 'Result (R) + Purpose (P) + Massive Action Plan (M) = recipe for achieving any goal.' },
      { title: 'Ultimate Success Formula', desc: 'Clarity + reason + massive action + monitoring + adjustment = inevitable success.' },
      { title: 'Must vs. Want', desc: 'Link enormous pain to not moving and tremendous pleasure to arriving.' },
      { title: 'Closing the Gap', desc: 'The gap between now and your goal is a specific chain of steps — not an abyss.' },
    ]},
    { category: 'Needs', emoji: '❤️', items: [
      { title: 'Certainty', desc: 'The need for safety and stability. Too much of it kills growth.' },
      { title: 'Variety', desc: 'The need for change, surprises, and challenges. Without it you freeze.' },
      { title: 'Significance', desc: 'The need to feel unique and valued. Fill it through achievement, not arrogance.' },
      { title: 'Love & Connection', desc: 'The deepest need. Fill it by giving before taking.' },
      { title: 'Growth', desc: 'The spirit of humanity. If you\'re not growing, you\'re dying — there is no standing still.' },
      { title: 'Contribution', desc: 'The secret to living. Giving fills a void that nothing else can fill.' },
    ]},
    { category: '7 Success Principles', emoji: '🏆', items: [
      { title: 'Principle 1: The Power of Decision', desc: 'Everything begins with a decision. A decision instantly changes the chemistry of your body.' },
      { title: 'Principle 2: Managing Your Power', desc: 'Your energy is your most precious resource — your body, mind, time, and emotions.' },
      { title: 'Principle 3: Mastery in Relationships', desc: 'Your success is directly proportional to the quality of your relationships.' },
      { title: 'Principle 4: Health is Wealth', desc: 'Without a strong body, all wealth is meaningless.' },
      { title: 'Principle 5: Money Management', desc: "Don't work for money — make money work for you." },
      { title: 'Principle 6: Time is Life', desc: "Don't manage your time — manage your life. Time cannot be reclaimed." },
      { title: 'Principle 7: Giving & Contribution', desc: 'The secret to living is giving — what you give returns to you multiplied.' },
    ]},
  ]
}

function getItemTags(title, lang) {
  if (CONCEPT_TAGS[title]) return CONCEPT_TAGS[title]
  // Fallback for success principles
  const isPrincipleAr = title.startsWith('المبدأ')
  const isPrincipleEn = title.startsWith('Principle')
  if (isPrincipleAr) return PRINCIPLE_TAG_AR
  if (isPrincipleEn) return PRINCIPLE_TAG_EN
  return []
}

export default function Library() {
  const { lang, t } = useLang()
  const { state, update } = useApp()
  const navigate = useNavigate()
  const [openCategory, setOpenCategory] = useState(null)
  const [openItem, setOpenItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const isAr = lang === 'ar'

  const CONCEPTS = CONCEPTS_DATA[lang]
  const conceptNotes = state.conceptNotes || {}

  function saveNote(title, note) {
    update('conceptNotes', { ...conceptNotes, [title]: note })
  }

  // Filter logic
  const q = searchQuery.trim().toLowerCase()
  const filteredConcepts = CONCEPTS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
    )
  })).filter(cat => cat.items.length > 0)

  const hasSearch = q.length > 0

  return (
    <Layout title={t('library_title')} subtitle={t('library_subtitle')} helpKey="library">
      <div className="space-y-3 pt-2">

        {/* Search Bar */}
        <div className="relative">
          <span className="absolute top-1/2 -translate-y-1/2 text-base pointer-events-none"
            style={{ [isAr ? 'right' : 'left']: 14, color: '#555' }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحث في المكتبة...' : 'Search library...'}
            className="w-full rounded-xl py-3 text-sm text-white"
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              outline: 'none',
              paddingLeft: isAr ? 14 : 40,
              paddingRight: isAr ? 40 : 14,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 -translate-y-1/2 text-sm"
              style={{ [isAr ? 'left' : 'right']: 12, color: '#555' }}>
              ✕
            </button>
          )}
        </div>

        {hasSearch && filteredConcepts.length === 0 && (
          <div className="text-center py-8" style={{ color: '#555' }}>
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm">{isAr ? 'لا نتائج للبحث' : 'No results found'}</p>
          </div>
        )}

        {filteredConcepts.map((cat) => (
          <div key={cat.category} className="rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <button
              onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
              className="w-full flex items-center justify-between p-4 text-right"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.emoji}</span>
                <span className="font-bold text-white">{cat.category}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c' }}>
                  {cat.items.length}
                </span>
              </div>
              <span style={{ color: '#555' }}>{openCategory === cat.category ? '▲' : '▼'}</span>
            </button>

            {(openCategory === cat.category || hasSearch) && (
              <div className="px-4 pb-4 space-y-2 animate-fade-in" style={{ borderTop: '1px solid #222' }}>
                {cat.items.map((item) => {
                  const tags = getItemTags(item.title, lang)
                  const relatedPages = RELATED_PAGES[item.title] || []
                  const note = conceptNotes[item.title] || ''
                  const isOpen = openItem === item.title

                  return (
                    <div
                      key={item.title}
                      className="rounded-xl transition-all"
                      style={{
                        background: isOpen ? 'rgba(201,168,76,0.08)' : '#111',
                        border: `1px solid ${isOpen ? 'rgba(201,168,76,0.25)' : '#1e1e1e'}`,
                      }}
                    >
                      <button
                        onClick={() => setOpenItem(isOpen ? null : item.title)}
                        className="w-full text-right p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-right flex-1" style={{ color: isOpen ? '#c9a84c' : '#ddd' }}>
                            {hasSearch
                              ? <HighlightText text={item.title} query={searchQuery} />
                              : item.title}
                          </p>
                          {/* Tags */}
                          <div className="flex gap-1 flex-wrap justify-end flex-shrink-0">
                            {tags.map(tag => (
                              <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                style={{ background: `${TAG_COLORS[tag] || '#555'}22`, color: TAG_COLORS[tag] || '#aaa', fontSize: 9 }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-3 pb-3 space-y-3 animate-fade-in">
                          <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>
                            {hasSearch
                              ? <HighlightText text={item.desc} query={searchQuery} />
                              : item.desc}
                          </p>

                          {/* Related Pages */}
                          {relatedPages.length > 0 && (
                            <div>
                              <p className="text-xs font-bold mb-1.5" style={{ color: '#666' }}>
                                {isAr ? '🔗 صفحات ذات صلة' : '🔗 Related Pages'}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {relatedPages.map(page => (
                                  <button
                                    key={page.path}
                                    onClick={() => navigate(page.path)}
                                    className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all active:scale-95"
                                    style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)' }}
                                  >
                                    {page.label} →
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Just Learned Note */}
                          <div>
                            <p className="text-xs font-bold mb-1" style={{ color: '#666' }}>
                              ✏️ {isAr ? 'ملاحظتي / My note' : 'My note / ملاحظتي'}
                            </p>
                            <textarea
                              value={note}
                              onChange={e => saveNote(item.title, e.target.value)}
                              placeholder={isAr ? 'ما الذي تعلمته؟ اكتب ملاحظتك هنا...' : 'What did you just learn? Write your note here...'}
                              rows={2}
                              className="w-full rounded-xl px-3 py-2 text-xs resize-none"
                              style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', color: '#ccc', outline: 'none' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {/* Quote */}
        <div className="rounded-2xl p-5 text-center mt-4"
          style={{ background: 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-sm font-bold text-white leading-relaxed mb-2">{t('library_quote')}</p>
          <p className="text-xs" style={{ color: '#888' }}>{t('library_quote_author')}</p>
        </div>
      </div>
    </Layout>
  )
}
