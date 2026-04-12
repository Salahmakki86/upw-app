import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, ChevronUp, Pencil, Zap } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'

// ============================================================
// DATA — 6 Days of Date with Destiny
// ============================================================

const DAYS_CONFIG = {
  ar: [
    {
      num: 1, key: 'day1', emoji: '🔍', color: '#e74c3c',
      title: 'الاكتشاف والقيم',
      subtitle: 'من أنت وماذا تريد حقاً؟',
      themes: [
        'الحاجات الستة البشرية — وأيها يحركك أكثر في حياتك',
        'تحديد قيمك الأعلى وترتيبها من الأهم للأقل أهمية',
        'الأنماط العاطفية الأساسية التي تشكّل يومك',
        'نموذج التغيير الرباعي: جسد × عقل × تركيز × لغة',
        'هل تتحرك نحو لذة أم بعيداً عن ألم؟ (Toward vs Away)',
      ],
      keyInsight: 'كل سلوك إنساني يلبي حاجة — اكتشف الحاجة واكتشفت المحرك الحقيقي وراء كل قرار تتخذه',
      exercises: [
        'رتّب الحاجات الست وحدد أهم 3 تحركك في الحياة',
        'اكتب 10 قيم مهمة لك ثم رتبها بترتيب الأولوية',
        'لاحظ: ما المشاعر التي تعيشها أكثر في يومك العادي؟',
        'تمرين النموذج الرباعي: غيّر جسدك وغيّرت حالتك فوراً',
        'حدد: هل قراراتك الكبيرة مبنية على اللذة أم الخوف؟',
      ],
    },
    {
      num: 2, key: 'day2', emoji: '🧠', color: '#e67e22',
      title: 'المعتقدات والقواعد',
      subtitle: 'ما تؤمن به يصنع ما تعيشه',
      themes: [
        'المعتقدات العالمية: أنا... الحياة... الناس... المال...',
        'القواعد الشخصية — شروطك للشعور بالسعادة والنجاح',
        'السؤال الأساسي Primary Question الذي يشكّل حياتك كاملة',
        'المعتقدات المقيّدة مقابل المعتقدات المحررة والمُشعلة',
        'إعادة التأطير Reframing — تغيير المعنى يغيّر الواقع',
      ],
      keyInsight: 'سؤالك الأساسي يحدد أين يذهب انتباهك كل يوم — وما تركز عليه يكبر ويتوسع في حياتك',
      exercises: [
        'اكتب معتقداتك العالمية: "أنا..." "الحياة..." "الناس..." "المال..."',
        'اكتشف سؤالك الأساسي: ما السؤال الذي تطرحه على نفسك باستمرار؟',
        'حدد 3 معتقدات مقيّدة وحولها إلى معتقدات محررة قوية',
        'اكتب قواعدك: ما الشروط التي تحددها لتشعر بالسعادة والنجاح؟',
        'هل قواعدك تجعل الشعور الإيجابي سهل المنال أم نادراً؟',
      ],
    },
    {
      num: 3, key: 'day3', emoji: '🪞', color: '#f1c40f',
      title: 'الهوية والذات',
      subtitle: 'أنت لست قصتك — أنت من تقرر أن تكون',
      themes: [
        'هوية الـ "أنا" وكيف تصنع واقعك وعلاقاتك وقراراتك',
        'القصة القديمة التي كنت تحكيها عن نفسك سنوات',
        'إعلانات الهوية الجديدة القوية "أنا شخص يـ..."',
        'نقاط القوة الجوهرية Core Strengths التي تميزك',
        'التحول من هوية المعاناة إلى هوية القوة والامتلاء',
      ],
      keyInsight: 'التغيير الحقيقي يبدأ من الهوية — ليس من الإرادة أو السلوك أو العادات وحدها',
      exercises: [
        'اكتب القصة القديمة التي كنت تحكيها عن نفسك بصدق',
        'اكتب 7 إعلانات هوية جديدة تبدأ بـ "أنا شخص يـ..."',
        'حدد 5 نقاط قوة جوهرية تميزك وتملأك فخراً',
        'ما الدور الأعمق الذي تحمله في الحياة؟ (معلم / محرر / بانٍ...)',
        'اكتب قصتك الجديدة في فقرة واحدة مشحونة بالقوة',
      ],
    },
    {
      num: 4, key: 'day4', emoji: '🏠', color: '#2ecc71',
      title: 'البيت العاطفي',
      subtitle: 'المشاعر التي تسكنها تحدد جودة حياتك',
      themes: [
        'مفهوم البيت العاطفي — أين تسكن عاطفياً بشكل معتاد؟',
        'قائمة مشاعر البيت الحالي مقابل البيت المستهدف الجديد',
        'الحالة الجميلة Beautiful State مقابل حالة المعاناة',
        'الأدوات الفورية لتحويل حالتك: تنفس، جسد، تركيز',
        'الامتنان العميق كممارسة يومية تحوّل الدماغ فعلياً',
      ],
      keyInsight: 'أنت لا تسكن في مكان — أنت تسكن في حالة عاطفية. غيّرها وتغيّر حياتك من الداخل للخارج',
      exercises: [
        'اكتب 10 مشاعر تعيشها بشكل متكرر (بيتك العاطفي الحالي)',
        'اكتب 10 مشاعر تريد أن تعيشها يومياً (البيت الجديد)',
        'تمرين التنفس العميق 4-7-8 لتحويل حالتك في 60 ثانية',
        'حدد المشغّل الذي ينقلك من الحالة الجميلة للمعاناة',
        'تمرين الامتنان العميق: 3 أشياء حقيقية تشعر بها الآن',
      ],
    },
    {
      num: 5, key: 'day5', emoji: '❤️', color: '#9b59b6',
      title: 'العلاقات والحب',
      subtitle: 'العلاقات هي المكان الذي تُختبر فيه روحك',
      themes: [
        'حاجة الحب الأساسية Primary Love Need — ماذا تحتاج أكثر؟',
        'الأنماط المتكررة في علاقاتك عبر السنوات',
        'الطاقة الأنثوية والذكورية والتوازن الصحي بينهما',
        'فن التواصل العميق وحل النزاعات من مكان الحب',
        'التسامح كتحرر من الثقل — لأجلك أنت وليس لهم',
      ],
      keyInsight: 'الجرح الذي لم تشفيه في نفسك ستعيشه مراراً وتكراراً في علاقاتك حتى تشفيه',
      exercises: [
        'حدد حاجة الحب الأساسية عندك: أمان؟ تقدير؟ اهتمام؟ فهم؟',
        'اكتب النمط الذي تكرره في علاقاتك باستمرار',
        'اكتب رسالة لأهم شخص في حياتك تقول ما لم تقله بعد',
        'تمرين التسامح: من تحتاج أن تسامحه لتتحرر وتكمل؟',
        'صف علاقتك المثالية: كيف تبدو وكيف تشعر يومياً؟',
      ],
    },
    {
      num: 6, key: 'day6', emoji: '🌟', color: '#c9a84c',
      title: 'الرسالة والإرث',
      subtitle: 'أنت هنا لسبب أكبر منك',
      themes: [
        'الغرض من الحياة Mission — لماذا أنت هنا فعلاً؟',
        'الإرث الذي تريد تركه بعد رحيلك عن هذا العالم',
        'الرؤية المستقبلية المُقنعة Compelling Future',
        'ربط الرؤية الكبيرة بخطوات عملية قابلة للتنفيذ اليوم',
        'الاحتفال والتكامل — أنت لست نفس الشخص الذي بدأ',
      ],
      keyInsight: 'الحياة الاستثنائية لا تُبنى بالصدفة — بل بقرار ورسالة واضحة وتطبيق يومي مستمر',
      exercises: [
        'اكتب رسالتك في الحياة في جملة واحدة قوية ومُشعلة',
        'كيف تريد أن يتذكرك الناس بعد 100 سنة من رحيلك؟',
        'اكتب رؤيتك لحياتك بعد 10 سنوات بكل التفاصيل الحسية',
        'حدد 3 خطوات عملية تبدأها هذا الأسبوع نحو رسالتك',
        'احتفل: اكتب 10 أشياء رائعة تجعلك ممتناً لكونك أنت',
      ],
    },
  ],
  en: [
    {
      num: 1, key: 'day1', emoji: '🔍', color: '#e74c3c',
      title: 'Discovery & Values',
      subtitle: 'Who are you and what do you truly want?',
      themes: [
        '6 Human Needs — which ones drive you most in life',
        'Identifying your top values and ranking them by priority',
        'Core emotional patterns that shape your daily experience',
        '4-part change model: body × mind × focus × language',
        'Moving toward pleasure or away from pain? (Toward vs Away)',
      ],
      keyInsight: 'Every human behavior serves a need — discover the need and you discover the real driver behind every decision',
      exercises: [
        'Rank the 6 needs and identify your top 3 life drivers',
        'Write 10 important values and prioritize them',
        'Notice: what emotions do you experience most in a typical day?',
        'Try the 4-part model: change your body and instantly change your state',
        'Identify: are your big decisions driven by pleasure or by fear?',
      ],
    },
    {
      num: 2, key: 'day2', emoji: '🧠', color: '#e67e22',
      title: 'Beliefs & Rules',
      subtitle: 'What you believe creates what you live',
      themes: [
        'Global beliefs: I am... Life is... People are... Money is...',
        'Personal rules — your conditions for feeling happy and successful',
        'Your Primary Question that shapes your entire life',
        'Limiting beliefs vs. empowering and igniting beliefs',
        'Reframing — changing the meaning changes the reality',
      ],
      keyInsight: 'Your primary question determines where your attention goes every day — and what you focus on expands in your life',
      exercises: [
        'Write your global beliefs: "I am..." "Life is..." "People are..."',
        'Discover your primary question — what do you ask yourself constantly?',
        'Identify 3 limiting beliefs and transform them into empowering ones',
        'Write your rules: what conditions do you set to feel happy?',
        'Are your rules making positive feelings easy to achieve or rare?',
      ],
    },
    {
      num: 3, key: 'day3', emoji: '🪞', color: '#f1c40f',
      title: 'Identity & Self',
      subtitle: "You are not your story — you are who you decide to be",
      themes: [
        'The "I Am" identity and how it creates your reality and relationships',
        'The old story you have been telling yourself for years',
        'Powerful new identity declarations "I am someone who..."',
        'Core Strengths that make you unique and exceptional',
        'Shifting from a suffering identity to a powerful, fulfilling one',
      ],
      keyInsight: 'Real change begins with identity — not willpower, behavior, or habits alone',
      exercises: [
        'Write the old story you have been telling yourself honestly',
        'Write 7 new identity declarations starting with "I am someone who..."',
        'Identify 5 core strengths that make you proud',
        'What is the deeper role you carry in life? (teacher / liberator / builder...)',
        'Write your new story in one powerful, charged paragraph',
      ],
    },
    {
      num: 4, key: 'day4', emoji: '🏠', color: '#2ecc71',
      title: 'Emotional Home',
      subtitle: 'The emotions you inhabit determine your quality of life',
      themes: [
        'The emotional home concept — where do you emotionally live habitually?',
        'Current emotional home list vs. your new target emotional home',
        'Beautiful State vs. Suffering State',
        'Instant state-change tools: breathing, body posture, focus',
        'Deep gratitude as a daily brain-transforming practice',
      ],
      keyInsight: "You don't live in a place — you live in an emotional state. Change it and change your life from the inside out",
      exercises: [
        'Write 10 emotions you experience repeatedly (your current emotional home)',
        'Write 10 emotions you want to live in daily (your new home)',
        'Practice 4-7-8 breathing to transform your state in 60 seconds',
        'Identify the trigger that moves you from beautiful state to suffering',
        'Deep gratitude exercise: 3 real things you genuinely feel right now',
      ],
    },
    {
      num: 5, key: 'day5', emoji: '❤️', color: '#9b59b6',
      title: 'Relationships & Love',
      subtitle: 'Relationships are where your soul is truly tested',
      themes: [
        'Primary Love Need — what do you need most in relationships?',
        'Recurring patterns in your relationships over the years',
        'Feminine and masculine energy and the healthy balance',
        'The art of deep communication and loving conflict resolution',
        'Forgiveness as liberation — for YOU, not for them',
      ],
      keyInsight: "The wound you haven't healed in yourself will be re-lived again and again in your relationships until you heal it",
      exercises: [
        'Identify your primary love need: safety? appreciation? attention? understanding?',
        'Write the pattern you keep repeating in relationships',
        'Write a letter to the most important person in your life — say what you haven\'t',
        'Forgiveness exercise: who do you need to forgive to set yourself free?',
        'Describe your ideal relationship: what does it look and feel like daily?',
      ],
    },
    {
      num: 6, key: 'day6', emoji: '🌟', color: '#c9a84c',
      title: 'Mission & Legacy',
      subtitle: 'You are here for a purpose greater than yourself',
      themes: [
        "Life's purpose Mission — why are you really here?",
        'The legacy you want to leave when you are gone from this world',
        'Compelling Future — the vision that pulls you powerfully forward',
        'Connecting the big vision to practical actionable steps today',
        'Celebration and integration — you are not the same person who started',
      ],
      keyInsight: 'An extraordinary life is not built by chance — but by decision, clear mission, and consistent daily action',
      exercises: [
        'Write your life mission in one powerful, igniting sentence',
        'How do you want to be remembered 100 years from now?',
        'Write your vision for your life in 10 years with full sensory detail',
        'Identify 3 practical steps you will start this week toward your mission',
        'Celebrate: write 10 amazing things that make you grateful to be YOU',
      ],
    },
  ],
}

const NEEDS_CONFIG = {
  ar: [
    { key: 'certainty',    label: 'اليقين',         emoji: '🛡️', color: '#3498db', desc: 'الحاجة للأمان والتأكد والسيطرة على المستقبل' },
    { key: 'variety',      label: 'التنوع',          emoji: '🎲', color: '#e74c3c', desc: 'الحاجة للتغيير والمفاجأة والإثارة والتجديد' },
    { key: 'significance', label: 'الأهمية',         emoji: '⭐', color: '#f39c12', desc: 'الحاجة للشعور بأنك مميز وذو قيمة ومهم' },
    { key: 'love',         label: 'الحب والتواصل',   emoji: '❤️', color: '#e91e63', desc: 'الحاجة للتواصل العميق والشعور بالحب والقبول' },
    { key: 'growth',       label: 'النمو',           emoji: '🌱', color: '#2ecc71', desc: 'الحاجة للتطور والتعلم والتوسع المستمر' },
    { key: 'contribution', label: 'المساهمة',        emoji: '🌍', color: '#9b59b6', desc: 'الحاجة للعطاء وخدمة الآخرين وترك أثر حقيقي' },
  ],
  en: [
    { key: 'certainty',    label: 'Certainty',         emoji: '🛡️', color: '#3498db', desc: 'Need for safety, security and control over the future' },
    { key: 'variety',      label: 'Variety',           emoji: '🎲', color: '#e74c3c', desc: 'Need for change, surprise, excitement and novelty' },
    { key: 'significance', label: 'Significance',      emoji: '⭐', color: '#f39c12', desc: 'Need to feel special, unique and important' },
    { key: 'love',         label: 'Love & Connection', emoji: '❤️', color: '#e91e63', desc: 'Need for deep connection, love and acceptance' },
    { key: 'growth',       label: 'Growth',            emoji: '🌱', color: '#2ecc71', desc: 'Need to grow, learn and expand continuously' },
    { key: 'contribution', label: 'Contribution',      emoji: '🌍', color: '#9b59b6', desc: 'Need to give, serve others and leave a real legacy' },
  ],
}

const EMOTIONS_OPTIONS = {
  ar: {
    suffering: ['😰 القلق','😔 الحزن','😤 الإحباط','😡 الغضب','😨 الخوف','😴 الخمول','🤔 الشك','😞 خيبة الأمل','😓 الضغط','🥺 الوحدة','😒 الملل','🫤 اللامبالاة'],
    beautiful: ['😊 الفرح','🙏 الامتنان','💪 القوة','❤️ الحب','🌟 الإلهام','😎 الثقة','🎯 التركيز','🕊️ السلام','🔥 الحماس','✨ البهجة','🤩 الدهشة','🌺 الرقة'],
  },
  en: {
    suffering: ['😰 Anxiety','😔 Sadness','😤 Frustration','😡 Anger','😨 Fear','😴 Lethargy','🤔 Doubt','😞 Disappointment','😓 Stress','🥺 Loneliness','😒 Boredom','🫤 Indifference'],
    beautiful: ['😊 Joy','🙏 Gratitude','💪 Strength','❤️ Love','🌟 Inspiration','😎 Confidence','🎯 Focus','🕊️ Peace','🔥 Passion','✨ Bliss','🤩 Awe','🌺 Tenderness'],
  },
}

const TABS_CONFIG = {
  ar: [
    { id: 0, label: '🗓 الأيام' },
    { id: 1, label: '⚡ القيم' },
    { id: 2, label: '🪞 الهوية' },
    { id: 3, label: '🌟 الرسالة' },
  ],
  en: [
    { id: 0, label: '🗓 Days' },
    { id: 1, label: '⚡ Values' },
    { id: 2, label: '🪞 Identity' },
    { id: 3, label: '🌟 Mission' },
  ],
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function DateWithDestiny() {
  const { lang } = useLang()
  const { state, updateDwd, addGoal } = useApp()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const [goalFlash,      setGoalFlash]      = useState(false)
  const [activeTab,      setActiveTab]      = useState(0)
  const [expandedDay,    setExpandedDay]    = useState(null)
  const [editingNeed,    setEditingNeed]    = useState(null)
  const [needVal,        setNeedVal]        = useState('')
  const [editingValIdx,  setEditingValIdx]  = useState(null)
  const [valInput,       setValInput]       = useState('')
  const [editingField,   setEditingField]   = useState(null)
  const [fieldVal,       setFieldVal]       = useState('')

  // ── State slices ──────────────────────────────────────────
  const dwd                 = state.dwd || {}
  const daysDone            = dwd.daysDone            || {}
  const exercises           = dwd.exercises           || {}
  const needsScores         = dwd.needsScores         || { certainty:5, variety:5, significance:5, love:5, growth:5, contribution:5 }
  const values              = dwd.values              || ['','','','','','']
  const primaryQuestion     = dwd.primaryQuestion     || ''
  const emotionalHomeCurrent= dwd.emotionalHomeCurrent|| []
  const emotionalHomeNew    = dwd.emotionalHomeNew    || []
  const identityStatements  = dwd.identityStatements  || ''
  const globalBeliefs       = dwd.globalBeliefs       || ''
  const mission             = dwd.mission             || ''
  const legacy              = dwd.legacy              || ''
  const vision              = dwd.vision              || ''
  const actionSteps         = dwd.actionSteps         || ''

  // ── Derived ───────────────────────────────────────────────
  const days               = DAYS_CONFIG[lang]
  const needs              = NEEDS_CONFIG[lang]
  const tabs               = TABS_CONFIG[lang]
  const emotions           = EMOTIONS_OPTIONS[lang]
  const completedDays      = Object.values(daysDone).filter(Boolean).length
  const completedExercises = Object.values(exercises).filter(Boolean).length
  const overallPct         = Math.round((completedDays / 6) * 100)
  const exercisePct        = Math.round((completedExercises / 30) * 100)

  // ── Handlers ─────────────────────────────────────────────
  const toggleDay = (key) =>
    updateDwd('daysDone', { ...daysDone, [key]: !daysDone[key] })

  const toggleExercise = (exKey) =>
    updateDwd('exercises', { ...exercises, [exKey]: !exercises[exKey] })

  const toggleEmotion = (type, emotion) => {
    const field   = type === 'current' ? 'emotionalHomeCurrent' : 'emotionalHomeNew'
    const current = type === 'current' ? emotionalHomeCurrent   : emotionalHomeNew
    const next    = current.includes(emotion)
      ? current.filter(e => e !== emotion)
      : [...current, emotion]
    updateDwd(field, next)
  }

  const confirmNeed = () => {
    const v = Math.min(10, Math.max(1, parseInt(needVal) || 5))
    updateDwd('needsScores', { ...needsScores, [editingNeed]: v })
    setEditingNeed(null)
  }

  const confirmValue = () => {
    const next = [...values]; next[editingValIdx] = valInput
    updateDwd('values', next)
    setEditingValIdx(null)
  }

  const startEditField = (key, current) => { setEditingField(key); setFieldVal(current) }
  const confirmField   = () => { updateDwd(editingField, fieldVal); setEditingField(null) }

  // Convert action steps → RPM Goals
  const convertToGoals = () => {
    const steps = actionSteps.split('\n').map(s => s.replace(/^[\d١٢٣٤٥٦٧٨٩\.\-\*]+\s*/, '').trim()).filter(Boolean)
    if (steps.length === 0) return
    steps.forEach(step => addGoal({ result: step, purpose: mission || (isAr ? 'من رسالتي في موعد مع القدر' : 'From my DWD mission'), actions: '', timeframe: '3months', progress: 0 }))
    setGoalFlash(true)
    setTimeout(() => setGoalFlash(false), 2500)
  }

  // ── Helpers ───────────────────────────────────────────────
  const EditableArea = ({ fieldKey, currentVal, placeholder, rows = 4, accentColor = '#c9a84c' }) => (
    <div className="rounded-xl p-4" style={{ background: '#111', border: `1px solid ${accentColor}20` }}>
      {editingField === fieldKey ? (
        <div>
          <textarea
            autoFocus rows={rows}
            value={fieldVal}
            onChange={e => setFieldVal(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{ color: '#fff' }}
          />
          <div className="flex gap-2 mt-3 justify-end">
            <button onClick={() => setEditingField(null)}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: '#222', color: '#888' }}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button onClick={confirmField}
              className="text-xs px-3 py-1.5 rounded-lg font-bold"
              style={{ background: accentColor, color: '#000' }}>
              {isAr ? 'حفظ ✓' : 'Save ✓'}
            </button>
          </div>
        </div>
      ) : (
        <button className="w-full text-right" onClick={() => startEditField(fieldKey, currentVal)}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-right"
            style={{ color: currentVal ? '#e0e0e0' : '#444' }}>
            {currentVal || (isAr ? 'اضغط للكتابة...' : 'Tap to write...')}
          </p>
          {currentVal && <Pencil size={12} color="#444" className="mt-2" />}
        </button>
      )}
    </div>
  )

  // ============================================================
  // TAB 0 — الأيام / Days
  // ============================================================
  const renderDaysTab = () => (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: `${completedDays}/6`, pct: overallPct,  color: '#c9a84c', label: isAr ? 'أيام مكتملة' : 'Days Done' },
          { value: `${completedExercises}/30`, pct: exercisePct, color: '#2ecc71', label: isAr ? 'تمارين منجزة' : 'Exercises Done' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-4 text-center" style={{ background: '#111', border: '1px solid #222' }}>
            <div className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#666' }}>{stat.label}</div>
            <div className="w-full rounded-full h-1.5 mt-2" style={{ background: '#222' }}>
              <div className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stat.pct}%`, background: stat.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Day cards */}
      {days.map((day) => {
        const isDone     = !!daysDone[day.key]
        const isExpanded = expandedDay === day.key
        const exDone     = day.exercises.filter((_, i) => exercises[`${day.key}-${i}`]).length
        return (
          <div key={day.key} className="rounded-2xl overflow-hidden"
            style={{ background: '#0e0e0e', border: `1px solid ${isDone ? day.color + '50' : '#1e1e1e'}` }}>
            {/* Header */}
            <button className="w-full flex items-center gap-3 p-4"
              onClick={() => setExpandedDay(isExpanded ? null : day.key)}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-black flex-shrink-0 transition-all"
                style={{
                  background: isDone ? day.color + '25' : '#1a1a1a',
                  color: isDone ? day.color : '#555',
                  border: `2px solid ${isDone ? day.color : '#2a2a2a'}`,
                }}>
                {isDone ? '✓' : day.num}
              </div>
              <div className="flex-1 text-right">
                <div className="font-bold text-sm" style={{ color: isDone ? day.color : '#ddd' }}>
                  {day.emoji} {day.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#555' }}>{day.subtitle}</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold" style={{ color: exDone === 5 ? '#2ecc71' : '#444' }}>
                  {exDone}/5
                </span>
                {isExpanded
                  ? <ChevronUp size={14} color="#444" />
                  : <ChevronDown size={14} color="#444" />}
              </div>
            </button>

            {/* Expanded */}
            {isExpanded && (
              <div className="px-4 pb-5 space-y-4">
                {/* Key insight */}
                <div className="rounded-xl p-3" style={{ background: day.color + '12', border: `1px solid ${day.color}25` }}>
                  <p className="text-xs leading-relaxed" style={{ color: day.color }}>
                    💡 {day.keyInsight}
                  </p>
                </div>

                {/* Themes */}
                <div>
                  <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: '#555' }}>
                    {isAr ? '📚 محاور اليوم' : '📚 Day Themes'}
                  </p>
                  <div className="space-y-1.5">
                    {day.themes.map((theme, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: day.color }} />
                        <span className="text-xs leading-relaxed" style={{ color: '#999' }}>{theme}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exercises */}
                <div>
                  <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: '#555' }}>
                    {isAr ? '✍️ التمارين العملية' : '✍️ Practical Exercises'}
                  </p>
                  <div className="space-y-2">
                    {day.exercises.map((ex, i) => {
                      const exKey = `${day.key}-${i}`
                      const done  = !!exercises[exKey]
                      return (
                        <button key={i}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all active:scale-98"
                          style={{
                            background: done ? day.color + '12' : '#151515',
                            border: `1px solid ${done ? day.color + '35' : '#252525'}`,
                          }}
                          onClick={() => toggleExercise(exKey)}>
                          <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                            style={{
                              background: done ? day.color : '#252525',
                              border: `1.5px solid ${done ? day.color : '#3a3a3a'}`,
                            }}>
                            {done && <Check size={10} color="#000" strokeWidth={3.5} />}
                          </div>
                          <span className="text-xs leading-relaxed flex-1"
                            style={{ color: done ? '#555' : '#bbb', textDecoration: done ? 'line-through' : 'none' }}>
                            {ex}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mark complete button */}
                <button
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                  style={{
                    background: isDone
                      ? 'transparent'
                      : `linear-gradient(135deg, ${day.color}, ${day.color}cc)`,
                    color:  isDone ? day.color : '#000',
                    border: `1.5px solid ${day.color}`,
                  }}
                  onClick={() => toggleDay(day.key)}>
                  {isDone
                    ? (isAr ? `✓ اليوم ${day.num} مكتمل — اضغط للإلغاء` : `✓ Day ${day.num} Complete — tap to undo`)
                    : (isAr ? `✅ أكملت اليوم ${day.num} — ${day.title}` : `✅ Mark Day ${day.num} Complete`)}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  // ============================================================
  // TAB 1 — القيم / Values & Needs
  // ============================================================
  const renderValuesTab = () => (
    <div className="space-y-6">
      {/* 6 Human Needs */}
      <div>
        <div className="text-xs font-black mb-1 tracking-widest uppercase" style={{ color: '#c9a84c' }}>
          {isAr ? '⚡ الحاجات الست البشرية' : '⚡ 6 Human Needs'}
        </div>
        <p className="text-xs mb-3" style={{ color: '#555' }}>
          {isAr ? 'اضغط على الرقم لتحديث درجتك (١-١٠)' : 'Tap the score to update it (1-10)'}
        </p>
        <div className="space-y-2">
          {needs.map((need) => {
            const score     = needsScores[need.key] ?? 5
            const isEditing = editingNeed === need.key
            return (
              <div key={need.key} className="rounded-2xl p-3"
                style={{ background: '#0e0e0e', border: `1px solid ${need.color}20` }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{need.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-sm" style={{ color: need.color }}>{need.label}</span>
                      {isEditing ? (
                        <input
                          type="number" min="1" max="10" autoFocus
                          value={needVal}
                          onChange={e => setNeedVal(e.target.value)}
                          onBlur={confirmNeed}
                          onKeyDown={e => e.key === 'Enter' && confirmNeed()}
                          className="w-14 text-center text-sm font-bold rounded-lg p-1.5 outline-none"
                          style={{ background: '#1a1a1a', color: need.color, border: `1px solid ${need.color}` }}
                        />
                      ) : (
                        <button
                          className="text-xl font-black leading-none"
                          style={{ color: need.color }}
                          onClick={() => { setEditingNeed(need.key); setNeedVal(String(score)) }}>
                          {score}
                          <span className="text-xs font-normal" style={{ color: '#444' }}>/10</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: '#555' }}>{need.desc}</p>
                    <div className="w-full rounded-full h-2 mt-2" style={{ background: '#1a1a1a' }}>
                      <div className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${score * 10}%`, background: `linear-gradient(90deg, ${need.color}88, ${need.color})` }} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Which 2 needs drive you most */}
        <div className="mt-3 rounded-xl p-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <p className="text-xs" style={{ color: '#555' }}>
            {isAr
              ? '💡 الحاجتان اللتان تحصلان على أعلى درجة هما محرّكاك الأساسيان'
              : '💡 The two needs with the highest scores are your primary drivers'}
          </p>
        </div>
      </div>

      {/* Top 6 Values */}
      <div>
        <div className="text-xs font-black mb-1 tracking-widest uppercase" style={{ color: '#c9a84c' }}>
          {isAr ? '🏆 قيمك الستة الأعلى' : '🏆 Your Top 6 Values'}
        </div>
        <p className="text-xs mb-3" style={{ color: '#555' }}>
          {isAr ? 'اضغط على أي قيمة لكتابتها أو تعديلها' : 'Tap any value to write or edit it'}
        </p>
        <div className="space-y-2">
          {values.map((val, idx) => {
            const isEditing = editingValIdx === idx
            const rankColors = ['#c9a84c','#aaaaaa','#cd7f32','rgba(201,168,76,0.5)','#777777','#555555']
            return (
              <div key={idx} className="rounded-xl flex items-center gap-3 p-3"
                style={{ background: '#0e0e0e', border: `1px solid ${val ? '#2a2a2a' : '#181818'}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: '#1a1a1a', color: rankColors[idx] || '#555', border: `1.5px solid ${rankColors[idx] ? rankColors[idx] + '40' : '#222'}` }}>
                  {idx + 1}
                </div>
                {isEditing ? (
                  <input
                    type="text" autoFocus
                    value={valInput}
                    onChange={e => setValInput(e.target.value)}
                    onBlur={confirmValue}
                    onKeyDown={e => e.key === 'Enter' && confirmValue()}
                    placeholder={isAr ? 'اكتب القيمة...' : 'Enter value...'}
                    className="flex-1 text-sm bg-transparent outline-none border-b py-0.5"
                    style={{ color: '#fff', borderColor: '#c9a84c' }}
                  />
                ) : (
                  <button className="flex-1 text-right"
                    onClick={() => { setEditingValIdx(idx); setValInput(val) }}>
                    <span className="text-sm" style={{ color: val ? '#e0e0e0' : '#333' }}>
                      {val || (isAr ? `القيمة ${idx + 1}...` : `Value ${idx + 1}...`)}
                    </span>
                  </button>
                )}
                <Pencil size={13} color="#2a2a2a" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Primary Question */}
      <div>
        <div className="text-xs font-black mb-1 tracking-widest uppercase" style={{ color: '#e67e22' }}>
          {isAr ? '❓ سؤالك الأساسي' : '❓ Your Primary Question'}
        </div>
        <p className="text-xs mb-3" style={{ color: '#555' }}>
          {isAr
            ? 'السؤال الذي تطرحه على نفسك أكثر من أي سؤال آخر — إيجابي أم سلبي؟'
            : 'The question you ask yourself more than any other — positive or negative?'}
        </p>
        <EditableArea
          fieldKey="primaryQuestion"
          currentVal={primaryQuestion}
          placeholder={isAr
            ? 'مثال:\n• "لماذا لا أستطيع النجاح؟"\nأو بعد التحويل:\n• "كيف أجعل هذا ممكناً الآن؟"'
            : 'e.g.:\n• "Why can\'t I succeed?"\nor after transformation:\n• "How can I make this possible now?"'}
          rows={4}
          accentColor="#e67e22"
        />
      </div>
    </div>
  )

  // ============================================================
  // TAB 2 — الهوية / Identity
  // ============================================================
  const renderIdentityTab = () => (
    <div className="space-y-6">
      {/* Current Emotional Home */}
      <div>
        <div className="text-xs font-black mb-1 tracking-widest uppercase" style={{ color: '#e74c3c' }}>
          {isAr ? '🏠 بيتك العاطفي الحالي' : '🏠 Current Emotional Home'}
        </div>
        <p className="text-xs mb-3" style={{ color: '#555' }}>
          {isAr ? 'المشاعر التي تعيشها بشكل متكرر الآن — اختر كل ما ينطبق' : 'Emotions you experience repeatedly now — select all that apply'}
        </p>
        <div className="flex flex-wrap gap-2">
          {emotions.suffering.map(em => {
            const selected = emotionalHomeCurrent.includes(em)
            return (
              <button key={em}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: selected ? '#e74c3c25' : '#111',
                  color:      selected ? '#e74c3c'   : '#555',
                  border:     `1px solid ${selected ? '#e74c3c50' : '#222'}`,
                }}
                onClick={() => toggleEmotion('current', em)}>
                {em}
              </button>
            )
          })}
        </div>
      </div>

      {/* New Emotional Home */}
      <div>
        <div className="text-xs font-black mb-1 tracking-widest uppercase" style={{ color: '#2ecc71' }}>
          {isAr ? '✨ بيتك العاطفي الجديد' : '✨ New Emotional Home'}
        </div>
        <p className="text-xs mb-3" style={{ color: '#555' }}>
          {isAr ? 'المشاعر التي تريد أن تعيش فيها يومياً — اختر هدفك' : 'Emotions you want to live in daily — choose your target'}
        </p>
        <div className="flex flex-wrap gap-2">
          {emotions.beautiful.map(em => {
            const selected = emotionalHomeNew.includes(em)
            return (
              <button key={em}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: selected ? '#2ecc7125' : '#111',
                  color:      selected ? '#2ecc71'   : '#555',
                  border:     `1px solid ${selected ? '#2ecc7150' : '#222'}`,
                }}
                onClick={() => toggleEmotion('new', em)}>
                {em}
              </button>
            )
          })}
        </div>
      </div>

      {/* Transition summary */}
      {(emotionalHomeCurrent.length > 0 || emotionalHomeNew.length > 0) && (
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p className="text-xs font-bold mb-3 text-center" style={{ color: '#555' }}>
            {isAr ? 'رحلة التحول العاطفي' : 'Emotional Transformation Journey'}
          </p>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <p className="text-xs font-bold mb-1.5" style={{ color: '#e74c3c' }}>{isAr ? '🚪 أتركه' : '🚪 Leaving'}</p>
              <div className="flex flex-wrap gap-1">
                {emotionalHomeCurrent.map(e => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: '#e74c3c15', color: '#e74c3c' }}>
                    {e.split(' ').slice(1).join(' ')}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-xl self-center" style={{ color: '#333' }}>→</div>
            <div className="flex-1">
              <p className="text-xs font-bold mb-1.5" style={{ color: '#2ecc71' }}>{isAr ? '🏡 أبنيه' : '🏡 Building'}</p>
              <div className="flex flex-wrap gap-1">
                {emotionalHomeNew.map(e => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: '#2ecc7115', color: '#2ecc71' }}>
                    {e.split(' ').slice(1).join(' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Identity Statements */}
      <div>
        <div className="text-xs font-black mb-1 tracking-widest uppercase" style={{ color: '#f1c40f' }}>
          {isAr ? '🪞 إعلانات هويتك الجديدة' : '🪞 New Identity Declarations'}
        </div>
        <p className="text-xs mb-3" style={{ color: '#555' }}>
          {isAr ? '"أنا شخص يـ..." — اكتب ٧ إعلانات هوية جديدة قوية' : '"I am someone who..." — write 7 powerful new identity declarations'}
        </p>
        <EditableArea
          fieldKey="identityStatements"
          currentVal={identityStatements}
          placeholder={isAr
            ? 'أنا شخص يعيش بامتنان عميق كل يوم\nأنا شخص يتصرف بشجاعة رغم الخوف\nأنا شخص يعطي بسخاء بلا توقع مقابل\nأنا شخص يلهم الآخرين بوجوده\n...'
            : 'I am someone who lives with deep gratitude daily\nI am someone who acts courageously despite fear\nI am someone who gives generously without expectation\nI am someone who inspires others by my presence\n...'}
          rows={7}
          accentColor="#f1c40f"
        />
      </div>

      {/* Global Beliefs */}
      <div>
        <div className="text-xs font-black mb-1 tracking-widest uppercase" style={{ color: '#9b59b6' }}>
          {isAr ? '🧠 معتقداتك العالمية المحررة' : '🧠 Empowering Global Beliefs'}
        </div>
        <p className="text-xs mb-3" style={{ color: '#555' }}>
          {isAr
            ? '"أنا..." "الحياة..." "الناس..." "المال..." — اكتب معتقداتك الجديدة'
            : '"I am..." "Life is..." "People are..." "Money is..." — write your new beliefs'}
        </p>
        <EditableArea
          fieldKey="globalBeliefs"
          currentVal={globalBeliefs}
          placeholder={isAr
            ? 'أنا شخص قادر على تحقيق أي شيء يهمني\nالحياة تحدث من أجلي وليس ضدي\nالناس بطبيعتهم يريدون الخير\nالمال أداة قوية للتأثير والعطاء\n...'
            : 'I am capable of achieving anything I truly care about\nLife happens FOR me, not against me\nPeople are naturally good-hearted\nMoney is a powerful tool for impact and giving\n...'}
          rows={6}
          accentColor="#9b59b6"
        />
      </div>
    </div>
  )

  // ============================================================
  // TAB 3 — الرسالة / Mission
  // ============================================================
  const renderMissionTab = () => {
    const fields = [
      {
        key: 'mission', emoji: '🎯', color: '#c9a84c',
        title: isAr ? 'رسالتك في الحياة' : 'Your Life Mission',
        subtitle: isAr ? 'لماذا أنت هنا؟ في جملة واحدة قوية مُشعلة' : 'Why are you here? In one powerful, igniting sentence',
        placeholder: isAr
          ? 'مثال: رسالتي هي تحرير الناس من آلامهم الباطنية ومساعدتهم على اكتشاف قوتهم الحقيقية وحياة حياة استثنائية مليئة بالأثر...'
          : 'e.g., My mission is to liberate people from inner pain and help them discover their true power to live an extraordinary life...',
        value: mission, rows: 4,
      },
      {
        key: 'legacy', emoji: '🌍', color: '#2ecc71',
        title: isAr ? 'إرثك بعد ١٠٠ سنة' : 'Your Legacy in 100 Years',
        subtitle: isAr ? 'كيف تريد أن يتذكرك الناس بعد رحيلك عن هذا العالم؟' : 'How do you want to be remembered after you leave this world?',
        placeholder: isAr
          ? 'أريد أن يتذكرني الناس بأنني كنت شخصاً غيّر مسار حياة الآلاف من الناس...\nكنت شخصاً يُشعل القلوب ويحرر الأرواح...'
          : 'I want to be remembered as someone who changed the course of thousands of lives...\nA person who ignited hearts and freed souls...',
        value: legacy, rows: 4,
      },
      {
        key: 'vision', emoji: '🔮', color: '#9b59b6',
        title: isAr ? 'رؤيتك بعد ١٠ سنوات' : 'Your Vision in 10 Years',
        subtitle: isAr ? 'صف حياتك المستقبلية بكل التفاصيل الحسية — أين؟ مع من؟ ماذا تفعل؟' : 'Describe your future life with full sensory detail — where? with whom? doing what?',
        placeholder: isAr
          ? 'بعد ١٠ سنوات أنا أعيش في...\nعملي هو...\nعلاقاتي تبدو...\nصحتي وجسدي...\nمالياً أنا...\nأثري في العالم هو...'
          : 'In 10 years I am living in...\nMy work is...\nMy relationships look like...\nMy health and body...\nFinancially I am...\nMy impact in the world is...',
        value: vision, rows: 7,
      },
      {
        key: 'actionSteps', emoji: '⚡', color: '#e67e22',
        title: isAr ? '٣ خطوات هذا الأسبوع' : '3 Steps This Week',
        subtitle: isAr ? 'الخطوات العملية الملموسة التي ستبدأها الآن نحو رسالتك' : 'Concrete practical steps you will start now toward your mission',
        placeholder: isAr ? '١. \n٢. \n٣. ' : '1. \n2. \n3. ',
        value: actionSteps, rows: 4,
      },
    ]

    const filled = [mission, legacy, vision, actionSteps].filter(Boolean).length

    return (
      <div className="space-y-5">
        {/* Completion tracker */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-bold" style={{ color: '#555' }}>
              {isAr ? 'مكتملة' : 'Completed'}
            </div>
            <div className="text-xl font-black" style={{ color: '#c9a84c' }}>{filled}/4</div>
          </div>
          <div className="flex gap-2">
            {[
              { label: isAr ? 'الرسالة' : 'Mission', done: !!mission,     color: '#c9a84c' },
              { label: isAr ? 'الإرث'   : 'Legacy',  done: !!legacy,      color: '#2ecc71' },
              { label: isAr ? 'الرؤية'  : 'Vision',  done: !!vision,      color: '#9b59b6' },
              { label: isAr ? 'الخطوات' : 'Steps',   done: !!actionSteps, color: '#e67e22' },
            ].map(item => (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: item.done ? item.color + '25' : '#1a1a1a',
                    border: `1.5px solid ${item.done ? item.color : '#2a2a2a'}`,
                  }}>
                  {item.done && <Check size={11} color={item.color} strokeWidth={3} />}
                </div>
                <span className="text-xs" style={{ color: item.done ? item.color : '#333' }}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="w-full rounded-full h-1.5 mt-3" style={{ background: '#1a1a1a' }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(filled / 4) * 100}%`, background: 'linear-gradient(90deg, #c9a84c, #e8c96a)' }} />
          </div>
        </div>

        {fields.map(f => (
          <div key={f.key}>
            <div className="text-xs font-black mb-0.5 tracking-widest uppercase" style={{ color: f.color }}>
              {f.emoji} {f.title}
            </div>
            <p className="text-xs mb-2" style={{ color: '#555' }}>{f.subtitle}</p>
            <EditableArea
              fieldKey={f.key}
              currentVal={f.value}
              placeholder={f.placeholder}
              rows={f.rows}
              accentColor={f.color}
            />
          </div>
        ))}

        {/* Convert action steps to RPM Goals */}
        {actionSteps && (
          <div className="rounded-xl p-4" style={{ background: '#e67e2210', border: '1px solid #e67e2230' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#e67e22' }}>
              ⚡ {isAr ? 'حوّل خطواتك إلى أهداف RPM فعلية' : 'Convert your steps into real RPM Goals'}
            </p>
            <p className="text-xs mb-3" style={{ color: '#666' }}>
              {isAr
                ? 'خطواتك الثلاث ستُضاف تلقائياً لصفحة الأهداف مع ربطها برسالتك'
                : 'Your steps will be added to the Goals page, linked to your mission'}
            </p>
            <button onClick={convertToGoals}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: goalFlash ? '#2ecc71' : '#e67e2220', color: goalFlash ? '#000' : '#e67e22', border: `1px solid ${goalFlash ? '#2ecc71' : '#e67e2240'}` }}>
              <Zap size={14} />
              {goalFlash
                ? (isAr ? '✓ تمت الإضافة للأهداف!' : '✓ Added to Goals!')
                : (isAr ? 'أضف كأهداف RPM →' : 'Add as RPM Goals →')}
            </button>
          </div>
        )}

        {/* Tony quote */}
        <div className="rounded-2xl p-5 text-center" style={{ background: '#0e0e0e', border: '1px solid #c9a84c20' }}>
          <p className="text-sm italic leading-relaxed" style={{ color: '#777' }}>
            {isAr
              ? '"القرار هو القوة — لا تنتظر الظروف المثالية.\nاصنع القرار الآن وابدأ في مكانك بما لديك"'
              : '"Decision is power — don\'t wait for perfect conditions.\nMake the decision now and start where you are with what you have"'}
          </p>
          <p className="text-xs mt-3 font-bold" style={{ color: '#c9a84c' }}>— Tony Robbins · Date with Destiny</p>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="flex flex-col pb-32"
      style={{ background: '#090909', minHeight: '100vh', direction: isAr ? 'rtl' : 'ltr' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <button onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#141414' }}>
          <ArrowRight size={18} color="#c9a84c"
            style={{ transform: isAr ? 'none' : 'rotate(180deg)' }} />
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black" style={{ color: '#fff' }}>
            🎯 {isAr ? 'موعد مع القدر' : 'Date with Destiny'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#555' }}>
            {isAr ? 'كورس توني روبنز — ٦ أيام تغيّر حياتك' : 'Tony Robbins — 6 Days That Change Your Life'}
          </p>
        </div>
      </div>

      {/* ── Overall progress banner ────────────────────────── */}
      <div className="mx-5 mb-4 rounded-2xl p-4"
        style={{ background: 'linear-gradient(135deg, #0e0e06, #100e00)', border: '1px solid #c9a84c25' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs" style={{ color: '#666' }}>
            {isAr
              ? `${completedDays} من ٦ أيام  •  ${completedExercises} من ٣٠ تمريناً`
              : `${completedDays} of 6 days  •  ${completedExercises} of 30 exercises`}
          </div>
          <div className="text-xl font-black" style={{ color: '#c9a84c' }}>{overallPct}%</div>
        </div>
        <div className="w-full rounded-full h-2.5" style={{ background: '#1a1a1a' }}>
          <div className="h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%`, background: 'linear-gradient(90deg, #c9a84c, #f0d878)' }} />
        </div>
        {/* Day dots */}
        <div className="flex gap-2 mt-3">
          {Array.from({ length: 6 }, (_, i) => {
            const k    = `day${i + 1}`
            const done = daysDone[k]
            const day  = days[i]
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-1.5 rounded-full"
                  style={{ background: done ? day.color : '#1e1e1e' }} />
                <span className="text-xs" style={{ color: done ? day.color : '#333' }}>
                  {isAr ? `${i + 1}` : `D${i + 1}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Tabs with progress badges ────────────────────────── */}
      <div className="mx-5 mb-3">
        {/* Tab pills */}
        <div className="flex rounded-2xl overflow-hidden"
          style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          {tabs.map(tab => {
            // Compute simple completion dot per tab
            const tabDone =
              tab.id === 0 ? completedDays > 0 :
              tab.id === 1 ? (needsScores.certainty !== 5 || values.some(v => v.trim())) :
              tab.id === 2 ? (identityStatements.trim().length > 0 || emotionalHomeCurrent.length > 0) :
              tab.id === 3 ? (mission.trim().length > 0 || legacy.trim().length > 0) : false
            return (
              <button key={tab.id}
                className="flex-1 py-3 text-xs font-bold transition-all relative"
                style={{
                  background: activeTab === tab.id
                    ? 'linear-gradient(135deg, #c9a84c, #e8c96a)'
                    : 'transparent',
                  color: activeTab === tab.id ? '#000' : '#444',
                }}
                onClick={() => setActiveTab(tab.id)}>
                {tab.label}
                {tabDone && activeTab !== tab.id && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#2ecc71',
                  }} />
                )}
              </button>
            )
          })}
        </div>

        {/* "Continue" shortcut — first incomplete day */}
        {activeTab === 0 && completedDays < 6 && (() => {
          const nextDay = days.find(d => !daysDone[d.key])
          if (!nextDay) return null
          return (
            <button
              onClick={() => setExpandedDay(expandedDay === nextDay.key ? null : nextDay.key)}
              className="w-full mt-2 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ background: '#1a1a1a', border: `1px solid ${nextDay.color}40`, color: nextDay.color }}>
              {isAr
                ? `⚡ كمّل من اليوم ${nextDay.num} — ${nextDay.title}`
                : `⚡ Continue from Day ${nextDay.num} — ${nextDay.title}`}
            </button>
          )
        })()}
      </div>

      {/* ── Tab content ────────────────────────────────────── */}
      <div className="mx-5">
        {activeTab === 0 && renderDaysTab()}
        {activeTab === 1 && renderValuesTab()}
        {activeTab === 2 && renderIdentityTab()}
        {activeTab === 3 && renderMissionTab()}

        {/* Next tab navigator */}
        {activeTab < tabs.length - 1 && (
          <button
            onClick={() => setActiveTab(activeTab + 1)}
            className="w-full mt-6 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}>
            {isAr
              ? `${tabs[activeTab + 1].label} ←`
              : `→ ${tabs[activeTab + 1].label}`}
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
