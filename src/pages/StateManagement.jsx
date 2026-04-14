import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'
import StateCheckinComponent from '../components/StateCheckin'

const VOCAB_DATA = [
  {
    ar: 'مخيف', en: 'Terrified',
    levels: [
      { ar: 'قلق', en: 'Nervous', color: '#e67e22' },
      { ar: 'غير مرتاح', en: 'Uncomfortable', color: '#f39c12' },
      { ar: 'حذر', en: 'Cautious', color: '#2ecc71' },
    ]
  },
  {
    ar: 'فاشل', en: 'Failed',
    levels: [
      { ar: 'لم أنجز بعد', en: 'Not yet', color: '#e67e22' },
      { ar: 'أتعلم', en: 'Learning', color: '#f39c12' },
      { ar: 'أتطور', en: 'Growing', color: '#2ecc71' },
    ]
  },
  {
    ar: 'منهك', en: 'Exhausted',
    levels: [
      { ar: 'محتاج راحة', en: 'Need rest', color: '#e67e22' },
      { ar: 'أعيد شحن طاقتي', en: 'Recharging', color: '#2ecc71' },
      { ar: 'أستعيد قوتي', en: 'Recovering', color: '#27ae60' },
    ]
  },
  {
    ar: 'محبط', en: 'Frustrated',
    levels: [
      { ar: 'لم أجد الطريقة بعد', en: "Haven't found the way", color: '#e67e22' },
      { ar: 'أبحث', en: 'Exploring', color: '#f39c12' },
      { ar: 'أتعلم', en: 'Learning', color: '#2ecc71' },
    ]
  },
  {
    ar: 'كاره', en: 'Hate',
    levels: [
      { ar: 'لا أفضله', en: "Don't prefer", color: '#e67e22' },
      { ar: 'أختار غيره', en: 'Choosing differently', color: '#2ecc71' },
      { ar: 'أتقبله', en: 'Accepting', color: '#27ae60' },
    ]
  },
  {
    ar: 'خائف', en: 'Afraid',
    levels: [
      { ar: 'حذر', en: 'Cautious', color: '#e67e22' },
      { ar: 'متأهب', en: 'Alert', color: '#f39c12' },
      { ar: 'مستعد', en: 'Ready', color: '#2ecc71' },
    ]
  },
  {
    ar: 'يائس', en: 'Hopeless',
    levels: [
      { ar: 'في مرحلة تحدٍّ', en: 'In a challenge', color: '#e67e22' },
      { ar: 'أبني قوتي', en: 'Building strength', color: '#f39c12' },
      { ar: 'أنمو', en: 'Growing', color: '#2ecc71' },
    ]
  },
]

const MAGIC_QUESTIONS = {
  ar: [
    'ما الذي يمكنني التحكم فيه في هذا الموقف؟',
    'ما الذي يمكنني تعلمه من هذا؟',
    'كيف يمكنني استخدام هذا لصالحي؟',
    'ما الذي سأكون ممتناً له بعد عام من الآن؟',
    'من يمكنني أن أساعد بهذه التجربة؟',
    'ما الذي سيحدث إذا لم أتخذ إجراءً؟',
    'ما الخطوة الأصغر التي يمكنني اتخاذها الآن؟',
  ],
  en: [
    'What CAN I control in this situation?',
    'What can I LEARN from this?',
    'How can I USE this to my advantage?',
    'What will I be GRATEFUL for about this in a year?',
    'Who can I HELP with this experience?',
    'What WILL HAPPEN if I don\'t act?',
    'What\'s the SMALLEST step I can take right now?',
  ]
}

const INTERRUPT_LIST = {
  ar: [
    { emoji: '🏃', text: 'اقفز 20 مرة الآن بأقصى طاقة!' },
    { emoji: '🎵', text: 'غنِّ أغنيتك المفضلة بصوت عالٍ لمدة دقيقة!' },
    { emoji: '💃', text: 'ارقص لمدة دقيقة كاملة — أي رقصة!' },
    { emoji: '🤣', text: 'اضحك بصوت عالٍ 10 مرات متواصلة!' },
    { emoji: '🚿', text: 'اذهب فوراً واشرب كوب ماء بارد كامل!' },
    { emoji: '💪', text: 'اعمل 10 ضغط الآن — اشعر بقوتك!' },
    { emoji: '🧊', text: 'ضع يديك تحت الماء البارد 30 ثانية!' },
    { emoji: '🌬️', text: 'خذ 5 أنفاس عملاقة — ملء الرئتين تماماً!' },
  ],
  en: [
    { emoji: '🏃', text: 'Jump 20 times right now with maximum energy!' },
    { emoji: '🎵', text: 'Sing your favorite song out loud for a minute!' },
    { emoji: '💃', text: 'Dance for a full minute — any dance!' },
    { emoji: '🤣', text: 'Laugh out loud 10 times in a row!' },
    { emoji: '🚿', text: 'Go right now and drink a full glass of cold water!' },
    { emoji: '💪', text: 'Do 10 push-ups now — feel your strength!' },
    { emoji: '🧊', text: 'Put your hands under cold water for 30 seconds!' },
    { emoji: '🌬️', text: 'Take 5 giant breaths — completely fill your lungs!' },
  ]
}

const TRIAD_DATA = {
  ar: {
    physiology: [
      { emoji: '🏋️', title: 'اقفز وتحرك', desc: 'قم من مكانك وتحرك بطاقة 60 ثانية' },
      { emoji: '🧘', title: 'وضعية القوة', desc: 'أكتاف للخلف، رأس مرفوع، تنفس عميق، ابتسامة' },
      { emoji: '💨', title: 'تنفس 4-4-8', desc: 'شهيق 4 ث — احبس 4 ث — زفير 8 ث' },
      { emoji: '👐', title: 'قوة الصوت', desc: 'تكلم بصوت عالٍ وواثق — غيّر نبرتك' },
    ],
    focus: [
      { emoji: '🎯', title: 'ركز على الحل', desc: 'بدلاً من المشكلة — ما الخطوة التالية؟' },
      { emoji: '🙏', title: 'لحظة امتنان', desc: 'فكر في 3 أشياء جميلة في حياتك الآن' },
      { emoji: '🌟', title: 'التركيز على ما تريد', desc: 'حيث يذهب تركيزك تذهب طاقتك' },
      { emoji: '❓', title: 'سؤال القوة', desc: 'ما الذي يعمل بشكل جيد في حياتي الآن؟' },
    ],
    language: [
      { emoji: '🔄', title: 'غيّر كلماتك', desc: '"مشكلة" → "تحدي"، "مستحيل" → "لم أجد الطريقة بعد"' },
      { emoji: '💬', title: 'لغة الاختيار', desc: '"يجب أن أفعل" → "أختار أن أفعل"' },
      { emoji: '📈', title: 'لغة النمو', desc: '"أنا فاشل" → "أنا أتعلم وأتطور"' },
      { emoji: '🔥', title: 'تكرار صوتي', desc: 'ردد بقوة: "أنا أقوى من أي تحدي!"' },
    ],
  },
  en: {
    physiology: [
      { emoji: '🏋️', title: 'Jump & Move', desc: 'Get up and move with full energy for 60 seconds' },
      { emoji: '🧘', title: 'Power Posture', desc: 'Shoulders back, head up, deep breath, big smile' },
      { emoji: '💨', title: '4-4-8 Breathing', desc: 'Inhale 4s — Hold 4s — Exhale 8s' },
      { emoji: '👐', title: 'Voice Power', desc: 'Speak loudly and confidently — change your tone' },
    ],
    focus: [
      { emoji: '🎯', title: 'Focus on Solution', desc: 'Instead of the problem — what is the next step?' },
      { emoji: '🙏', title: 'Gratitude Moment', desc: 'Think of 3 beautiful things in your life right now' },
      { emoji: '🌟', title: 'Focus on What You Want', desc: 'Where focus goes, energy flows' },
      { emoji: '❓', title: 'Power Question', desc: 'What is working well in my life right now?' },
    ],
    language: [
      { emoji: '🔄', title: 'Change Your Words', desc: '"Problem" → "Challenge", "Impossible" → "Haven\'t found the way yet"' },
      { emoji: '💬', title: 'Language of Choice', desc: '"I have to" → "I choose to"' },
      { emoji: '📈', title: 'Growth Language', desc: '"I\'m a failure" → "I am learning and growing"' },
      { emoji: '🔥', title: 'Incantation', desc: 'Say powerfully: "I am stronger than any challenge!"' },
    ],
  }
}

const BREATHE_PHASES_DATA = {
  ar: [
    { label: 'شهيق', duration: 4, color: '#3498db' },
    { label: 'احبس', duration: 16, color: '#c9a84c' },
    { label: 'زفير', duration: 8, color: '#2ecc71' },
  ],
  en: [
    { label: 'Inhale', duration: 4, color: '#3498db' },
    { label: 'Hold', duration: 16, color: '#c9a84c' },
    { label: 'Exhale', duration: 8, color: '#2ecc71' },
  ]
}

const TRANSFORMER_DATA = {
  ar: [
    ['أنا فاشل', 'أنا أتعلم وأتطور'],
    ['مستحيل', 'لم أجد الطريقة بعد'],
    ['أنا خائف', 'أنا متحمس ومتوتر إيجابياً'],
    ['مشكلة', 'تحدٍّ وفرصة للنمو'],
    ['يجب أن أفعل', 'أختار أن أفعل'],
  ],
  en: [
    ["I'm a failure", "I'm learning and growing"],
    ['Impossible', "Haven't found the way yet"],
    ["I'm scared", "I'm excited and positively energized"],
    ['Problem', 'Challenge and growth opportunity'],
    ['I have to', 'I choose to'],
  ]
}

// ── Emotional Flooding data ──────────────────────────────────────────────────
const FLOODING_EMOTIONS = [
  {
    emoji: '🌟', key: 'gratitude',
    ar: 'امتنان', en: 'Gratitude',
    color: '#c9a84c',
    visualAr: 'أغمض عينيك. تخيّل لحظة شعرت فيها بامتنان عميق — شخص أحببته، نعمة حصلت عليها، لحظة لمستك. اشعر بالدفء ينتشر في صدرك. تنفس بعمق وأغرق نفسك في هذا الامتنان.',
    visualEn: 'Close your eyes. Recall a moment of deep gratitude — someone you love, a blessing you received, a moment that touched you. Feel the warmth spreading through your chest. Breathe deeply and flood yourself with this gratitude.',
  },
  {
    emoji: '💪', key: 'confidence',
    ar: 'ثقة', en: 'Confidence',
    color: '#3498db',
    visualAr: 'تخيّل نفسك في أقوى لحظاتك — حين نجحت، حين تجاوزت تحدياً، حين كنت في قمتك. اشعر بالقوة تملأ جسدك من أخمص قدميك حتى رأسك. أنت قادر. أنت واثق.',
    visualEn: 'Picture yourself at your strongest — a time you succeeded, overcame a challenge, stood at your peak. Feel that power filling your body from your feet to the top of your head. You are capable. You are confident.',
  },
  {
    emoji: '😄', key: 'joy',
    ar: 'سعادة', en: 'Joy',
    color: '#f39c12',
    visualAr: 'استحضر أسعد لحظة في حياتك — ابتسامة طفل، نجاح، لقاء عزيز. اشعر بالفرح يتدفق في كل خلية. اسمح لنفسك بالابتسامة الكاملة الآن.',
    visualEn: 'Bring to mind your happiest moment — a child\'s smile, a success, a reunion. Feel that joy flowing through every cell. Allow yourself a full, genuine smile right now.',
  },
  {
    emoji: '❤️', key: 'love',
    ar: 'حب', en: 'Love',
    color: '#e63946',
    visualAr: 'فكر في من تحبهم أكثر من أي شيء. اشعر بالحب الصادق يملأ قلبك. أرسل هذا الحب إليهم في أفكارك. الحب هو أقوى قوة في الكون.',
    visualEn: 'Think of those you love most deeply. Feel genuine love filling your heart. Send that love to them in your thoughts. Love is the most powerful force in the universe.',
  },
  {
    emoji: '🔥', key: 'energy',
    ar: 'طاقة', en: 'Energy',
    color: '#e67e22',
    visualAr: 'تخيّل نيراناً داخلية تشتعل في مركز جسدك. كل نفس يضيف وقوداً. طاقتك لا حدود لها. أنت قوة متحركة لا يوقفها شيء.',
    visualEn: 'Imagine an inner fire blazing in the center of your body. Each breath adds fuel. Your energy has no limits. You are unstoppable momentum.',
  },
  {
    emoji: '🧘', key: 'peace',
    ar: 'سلام', en: 'Peace',
    color: '#2ecc71',
    visualAr: 'تخيّل نفسك في مكان هادئ تماماً — بجوار البحر، في الطبيعة، في مكان آمن. كل نفس يُخرج التوتر. جسدك يسترخي تماماً. أنت بأمان. كل شيء على ما يرام.',
    visualEn: 'Picture yourself in complete stillness — by the ocean, in nature, in a safe place. Each breath releases tension. Your body fully relaxes. You are safe. Everything is well.',
  },
]

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function FloodingTimer({ onDone, lang }) {
  const [seconds, setSeconds] = useState(60)
  const ref = useRef(null)

  useEffect(() => {
    ref.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(ref.current); onDone(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [])

  const elapsed = 60 - seconds
  const pct = (elapsed / 60) * 100

  return (
    <div className="flex flex-col items-center py-4 space-y-3">
      <div className="relative w-32 h-32 rounded-full flex items-center justify-center"
        style={{ background: `conic-gradient(#9b59b6 ${pct * 3.6}deg, #1a1a1a 0)` }}>
        <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center" style={{ background: '#090909' }}>
          <span className="text-3xl font-black" style={{ color: '#9b59b6' }}>{seconds}</span>
          <span className="text-xs mt-0.5" style={{ color: '#888' }}>{lang === 'ar' ? 'ثانية' : 'sec'}</span>
        </div>
      </div>
      <div className="progress-bar-bg w-full">
        <div className="h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: '#9b59b6' }} />
      </div>
    </div>
  )
}

function SOSTimer({ onDone, lang }) {
  const [seconds, setSeconds] = useState(60)
  const ref = useRef(null)

  const STEPS = lang === 'ar' ? [
    { s: 0,  e: 10, text: 'قم من مكانك الآن! 🏃', color: '#e63946' },
    { s: 10, e: 25, text: 'خذ 3 أنفاس عميقة 💨', color: '#3498db' },
    { s: 25, e: 40, text: 'ارفع يديك وابتسم! 😁', color: '#c9a84c' },
    { s: 40, e: 55, text: '«أنا أقوى من هذا!» 💪', color: '#2ecc71' },
    { s: 55, e: 60, text: 'كيف تشعر الآن؟ ✨', color: '#9b59b6' },
  ] : [
    { s: 0,  e: 10, text: 'Get up and move NOW! 🏃', color: '#e63946' },
    { s: 10, e: 25, text: 'Take 3 deep breaths 💨', color: '#3498db' },
    { s: 25, e: 40, text: 'Raise your hands and SMILE! 😁', color: '#c9a84c' },
    { s: 40, e: 55, text: '"I am stronger than this!" 💪', color: '#2ecc71' },
    { s: 55, e: 60, text: 'How do you feel now? ✨', color: '#9b59b6' },
  ]

  useEffect(() => {
    ref.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(ref.current); onDone(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [])

  const elapsed = 60 - seconds
  const currentStep = STEPS.find(st => elapsed >= st.s && elapsed < st.e) || STEPS[STEPS.length - 1]
  const pct = (elapsed / 60) * 100

  return (
    <div className="flex flex-col items-center py-6 space-y-6">
      <div className="relative w-48 h-48 rounded-full flex items-center justify-center"
        style={{ background: `conic-gradient(${currentStep.color} ${pct * 3.6}deg, #1a1a1a 0)`,
          animation: 'pulse-red 1.5s ease-in-out infinite' }}>
        <div className="w-40 h-40 rounded-full flex flex-col items-center justify-center" style={{ background: '#090909' }}>
          <span className="text-5xl font-black" style={{ color: currentStep.color }}>{seconds}</span>
          <span className="text-xs mt-1" style={{ color: '#888' }}>{lang === 'ar' ? 'ثانية' : 'sec'}</span>
        </div>
      </div>
      <div className="rounded-2xl px-6 py-4 text-center w-full"
        style={{ background: `${currentStep.color}15`, border: `1px solid ${currentStep.color}44` }}>
        <p className="text-lg font-black text-white">{currentStep.text}</p>
      </div>
      <div className="progress-bar-bg w-full">
        <div className="h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: currentStep.color }} />
      </div>
    </div>
  )
}

function BreathGuide({ lang, t }) {
  const BREATHE_PHASES = BREATHE_PHASES_DATA[lang]
  const [phase, setPhase] = useState(0)
  const [count, setCount] = useState(4)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!running) return
    ref.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(p => {
            const next = (p + 1) % BREATHE_PHASES.length
            setCount(BREATHE_PHASES[next].duration)
            return next
          })
          return BREATHE_PHASES[(phase + 1) % BREATHE_PHASES.length].duration
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [running, phase])

  const current = BREATHE_PHASES[phase]

  return (
    <div className="card space-y-4">
      <h3 className="font-bold text-white text-sm">{t('state_breathing')}</h3>
      <div className="flex items-center justify-center py-4">
        <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-1000"
          style={{ background: `${current.color}18`, border: `3px solid ${current.color}`,
            boxShadow: running ? `0 0 30px ${current.color}44` : 'none',
            transform: running && phase === 0 ? 'scale(1.15)' : 'scale(1)' }}>
          <span className="text-3xl font-black" style={{ color: current.color }}>{count}</span>
          <span className="text-xs font-bold mt-1" style={{ color: current.color }}>{current.label}</span>
        </div>
      </div>
      <button onClick={() => setRunning(!running)}
        className="w-full py-3 rounded-2xl font-bold transition-all active:scale-95"
        style={{ background: running ? '#1a1a1a' : 'linear-gradient(135deg, #3498db, #2980b9)',
          border: running ? '1px solid #2a2a2a' : 'none', color: '#fff' }}>
        {running ? `⏸ ${t('pause')}` : `▶ ${t('state_breathe_start')}`}
      </button>
    </div>
  )
}

// ── Three Decisions component ─────────────────────────────────────────────────
function ThreeDecisions({ state, update, lang }) {
  const isAr = lang === 'ar'
  const [d1, setD1] = useState('')
  const [d2, setD2] = useState('')
  const [d3, setD3] = useState('')
  const [saved, setSaved] = useState(false)

  const today = getTodayStr()
  const lastSaved = state.threeDecisions ? Object.values(state.threeDecisions).pop() : null

  const handleApply = () => {
    if (!d1.trim() && !d2.trim() && !d3.trim()) return
    const existing = state.threeDecisions || {}
    const newDecisions = {
      ...existing,
      [today]: { focus: d1, meaning: d2, action: d3, date: today }
    }
    update('threeDecisions', newDecisions)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const QUESTIONS = isAr
    ? [
        { label: 'ما الذي أركز عليه الآن؟', value: d1, set: setD1 },
        { label: 'ماذا يعني هذا؟', value: d2, set: setD2 },
        { label: 'ماذا سأفعل الآن؟', value: d3, set: setD3 },
      ]
    : [
        { label: 'What am I focusing on right now?', value: d1, set: setD1 },
        { label: 'What does this mean?', value: d2, set: setD2 },
        { label: 'What am I going to do now?', value: d3, set: setD3 },
      ]

  return (
    <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
      <h3 className="font-bold text-white mb-1">⚡ {isAr ? 'قرارات القدر الثلاث' : 'The 3 Decisions That Shape Destiny'}</h3>
      <p className="text-xs mb-4" style={{ color: '#888' }}>
        {isAr
          ? 'في كل لحظة تتخذ 3 قرارات غير واعية — اجعلها واعية الآن'
          : 'In every moment you make 3 unconscious decisions — make them conscious right now'}
      </p>
      <div className="space-y-3">
        {QUESTIONS.map((q, i) => (
          <div key={i}>
            <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
              {i + 1}. {q.label}
            </p>
            <input
              value={q.value}
              onChange={e => q.set(e.target.value)}
              placeholder={isAr ? 'اكتب هنا...' : 'Write here...'}
              className="input-dark w-full text-sm py-2"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleApply}
        disabled={!d1.trim() && !d2.trim() && !d3.trim()}
        className="w-full py-3 rounded-2xl font-bold text-sm mt-4 transition-all active:scale-95 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #c9a84c, #a07a30)', color: '#000' }}>
        {saved
          ? (isAr ? '✓ تم الحفظ!' : '✓ Saved!')
          : (isAr ? 'تطبيق' : 'Apply')}
      </button>

      {/* Last saved decisions */}
      {lastSaved && (
        <div className="mt-4 rounded-2xl p-3 space-y-2"
          style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-xs font-bold" style={{ color: 'rgba(201,168,76,0.6)' }}>
            {isAr ? `آخر قرارات — ${lastSaved.date}` : `Last decisions — ${lastSaved.date}`}
          </p>
          {lastSaved.focus && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <span style={{ color: 'rgba(201,168,76,0.5)' }}>1. </span>{lastSaved.focus}
            </p>
          )}
          {lastSaved.meaning && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <span style={{ color: 'rgba(201,168,76,0.5)' }}>2. </span>{lastSaved.meaning}
            </p>
          )}
          {lastSaved.action && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <span style={{ color: 'rgba(201,168,76,0.5)' }}>3. </span>{lastSaved.action}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Emotional Flooding component ──────────────────────────────────────────────
function EmotionalFlooding({ state, update, lang }) {
  const isAr = lang === 'ar'
  const [activeEmotion, setActiveEmotion] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | visualizing | timer | rating
  const [timerDone, setTimerDone] = useState(false)

  const selectEmotion = (em) => {
    setActiveEmotion(em)
    setPhase('visualizing')
    setTimerDone(false)
  }

  const startTimer = () => setPhase('timer')

  const handleTimerDone = () => {
    setTimerDone(true)
    setPhase('rating')
  }

  const saveRating = (rating) => {
    const existing = state.floodingLog || []
    const newLog = [
      ...existing,
      { date: getTodayStr(), emotion: activeEmotion.key, rating }
    ]
    update('floodingLog', newLog)
    setPhase('idle')
    setActiveEmotion(null)
  }

  const resetFlooding = () => {
    setPhase('idle')
    setActiveEmotion(null)
    setTimerDone(false)
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
      <h3 className="font-bold text-white mb-1">🌊 {isAr ? 'الإغراق العاطفي' : 'Emotional Flooding'}</h3>
      <p className="text-xs mb-4" style={{ color: '#888' }}>
        {isAr
          ? 'تقنية التحكم الفوري في مشاعرك — تخيّل ذكرى تملؤك بمشاعر معينة وأغرق جهازك العصبي بها'
          : 'An immediate emotion control technique — recall a memory that floods you with a specific feeling'}
      </p>

      {/* Emotion grid */}
      {phase === 'idle' && (
        <div className="grid grid-cols-3 gap-2">
          {FLOODING_EMOTIONS.map(em => (
            <button
              key={em.key}
              onClick={() => selectEmotion(em)}
              className="py-3 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95"
              style={{ background: `${em.color}12`, border: `1px solid ${em.color}33`, color: em.color }}>
              <span className="text-2xl">{em.emoji}</span>
              <span className="text-xs font-bold">{isAr ? em.ar : em.en}</span>
            </button>
          ))}
        </div>
      )}

      {/* Visualization phase */}
      {phase === 'visualizing' && activeEmotion && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={resetFlooding} className="text-xs" style={{ color: '#555' }}>← {isAr ? 'رجوع' : 'Back'}</button>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{activeEmotion.emoji}</span>
              <span className="font-bold text-white">{isAr ? activeEmotion.ar : activeEmotion.en}</span>
            </div>
          </div>
          <div className="rounded-2xl p-4"
            style={{ background: `${activeEmotion.color}10`, border: `1px solid ${activeEmotion.color}30` }}>
            <p className="text-sm text-white leading-relaxed">
              {isAr ? activeEmotion.visualAr : activeEmotion.visualEn}
            </p>
          </div>
          <button
            onClick={startTimer}
            className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{ background: `${activeEmotion.color}20`, border: `1px solid ${activeEmotion.color}50`, color: activeEmotion.color }}>
            {isAr ? 'ابدأ الإغراق — 60 ثانية' : 'Start Flooding — 60 seconds'}
          </button>
        </div>
      )}

      {/* Timer phase */}
      {phase === 'timer' && activeEmotion && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{activeEmotion.emoji}</span>
            <p className="text-sm font-bold" style={{ color: activeEmotion.color }}>
              {isAr ? `أغرق نفسك في: ${activeEmotion.ar}` : `Flood yourself with: ${activeEmotion.en}`}
            </p>
          </div>
          <div className="rounded-2xl p-3 mb-3"
            style={{ background: `${activeEmotion.color}10`, border: `1px solid ${activeEmotion.color}25` }}>
            <p className="text-xs" style={{ color: activeEmotion.color }}>
              {isAr ? activeEmotion.visualAr : activeEmotion.visualEn}
            </p>
          </div>
          <FloodingTimer onDone={handleTimerDone} lang={lang} />
        </div>
      )}

      {/* Rating phase */}
      {phase === 'rating' && (
        <div className="space-y-4 animate-scale-in">
          <p className="text-sm font-bold text-white text-center">
            {isAr ? 'كيف تشعر الآن؟' : 'How do you feel now?'}
          </p>
          <div className="flex gap-3 justify-center">
            {[
              { emoji: '😔', label: isAr ? 'أسوأ' : 'Worse',  val: 'worse',  c: '#e63946' },
              { emoji: '😐', label: isAr ? 'نفس'  : 'Same',   val: 'same',   c: '#888' },
              { emoji: '😊', label: isAr ? 'أفضل' : 'Better', val: 'better', c: '#2ecc71' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => saveRating(opt.val)}
                className="flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95"
                style={{ background: `${opt.c}15`, border: `1px solid ${opt.c}40`, color: opt.c }}>
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── SOS History component ─────────────────────────────────────────────────────
function SOSHistory({ sosLog, last7Sos, sosThisWeek, today, isAr }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <h3 className="font-bold text-white text-sm">
          🚨 {isAr ? 'سجل SOS / SOS History' : 'SOS History / سجل SOS'}
        </h3>
        <span style={{ color: '#555', fontSize: 18 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Usage count this week */}
          <div className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <span className="text-sm text-white font-semibold">
              {isAr
                ? `استخدمت SOS ${sosThisWeek} مرة هذا الأسبوع`
                : `Used SOS ${sosThisWeek} time${sosThisWeek !== 1 ? 's' : ''} this week`}
            </span>
            <span className="text-xl font-black" style={{ color: '#e63946' }}>{sosThisWeek}</span>
          </div>

          {/* Last 7 dots */}
          {last7Sos.length > 0 && (
            <div>
              <p className="text-xs mb-2" style={{ color: '#888' }}>
                {isAr ? 'آخر 7 استخدامات:' : 'Last 7 uses:'}
              </p>
              <div className="flex gap-2 flex-wrap">
                {last7Sos.map((entry, i) => {
                  const isToday = entry.date === today
                  return (
                    <div key={i} title={entry.date}
                      style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#c9a84c',
                        boxShadow: isToday ? '0 0 8px rgba(201,168,76,0.8)' : 'none',
                        animation: isToday ? 'pulse-red 1.5s ease-in-out infinite' : 'none',
                        flexShrink: 0,
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* High-frequency insight */}
          {sosThisWeek >= 3 && (
            <div className="rounded-xl p-4 space-y-2"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <p className="text-sm text-white font-bold">
                💡 {isAr
                  ? 'استخدامك المتكرر يقترح أنك تواجه ضغطاً — هل جربت أدوات الطوارئ الأعمق؟'
                  : 'Frequent use suggests you\'re under pressure — have you tried deeper emergency tools?'}
              </p>
              <a href="/emergency"
                className="inline-block text-xs font-bold rounded-full px-4 py-1.5 transition-all active:scale-95"
                style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', textDecoration: 'none' }}>
                {isAr ? '→ أدوات الطوارئ العميقة' : '→ Deep Emergency Tools'}
              </a>
            </div>
          )}

          {/* Empty state */}
          {last7Sos.length === 0 && (
            <p className="text-xs text-center py-2" style={{ color: '#555' }}>
              {isAr ? 'لم تستخدم SOS بعد' : 'No SOS uses yet'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function StateManagement() {
  const { state, update, logState, updateMagicQuestions } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'
  const [mode, setMode] = useState('home')
  const [triadTab, setTriadTab] = useState('physiology')
  const [randomInterrupt, setRandomInterrupt] = useState(null)
  const [selectedVocab, setSelectedVocab] = useState(null)
  const [magicProblem, setMagicProblem] = useState('')

  const TRIAD_TOOLS = TRIAD_DATA[lang]
  const TRANSFORMER = TRANSFORMER_DATA[lang]
  const INTERRUPTS = INTERRUPT_LIST[lang]

  const today = getTodayStr()

  const handleSosComplete = () => {
    logState('beautiful', '✨')
    update('sosLog', [...(state.sosLog || []), { date: today, ts: Date.now(), result: 'completed' }])
    setMode('result')
  }

  // ── SOS History helpers ─────────────────────────────────────────────────────
  const sosLog = state.sosLog || []
  const last7Sos = sosLog.slice(-7)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const sosThisWeek = sosLog.filter(e => e.ts >= oneWeekAgo).length

  // Time-of-day message for result screen
  const sosResultMsg = (() => {
    const h = new Date().getHours()
    const freq = sosThisWeek
    if (isAr) {
      if (h >= 5 && h < 12) return freq >= 3 ? 'صباحك يبدأ بتحدٍّ — أنت تواجهه بشجاعة 🌅' : 'بداية صباحية قوية — أنت تتحكم في حالتك ☀️'
      if (h >= 12 && h < 17) return freq >= 3 ? 'منتصف اليوم يُجهدك — ارتِح دقيقتين ثم تابع 💪' : 'في منتصف اليوم وأنت لا تزال واقفاً — رائع 🌤'
      if (h >= 17 && h < 21) return freq >= 3 ? 'نهاية اليوم تثقل كاهلك — أنت لم تستسلم 🌆' : 'مساؤك قوي — اكتمل اليوم بنجاح 🌙'
      return freq >= 3 ? 'الليل طويل لكنك أقوى منه — نم وستجد الحل غداً 🌙' : 'حتى في الليل أنت تختار حالتك — قوي ✨'
    } else {
      if (h >= 5 && h < 12) return freq >= 3 ? 'Your morning starts with challenges — you face them bravely 🌅' : 'Strong morning start — you control your state ☀️'
      if (h >= 12 && h < 17) return freq >= 3 ? 'Midday drains you — rest 2 minutes then continue 💪' : 'Midday and still standing — remarkable 🌤'
      if (h >= 17 && h < 21) return freq >= 3 ? 'End-of-day weight — you didn\'t give up 🌆' : 'Strong evening — day completed with success 🌙'
      return freq >= 3 ? 'The night is long but you are stronger — sleep and find the solution tomorrow 🌙' : 'Even at night you choose your state — powerful ✨'
    }
  })()

  if (mode === 'sos') {
    return (
      <Layout title={`🚨 SOS`} subtitle={lang === 'ar' ? '60 ثانية تغيير جذري' : '60 seconds radical change'}>
        <SOSTimer onDone={handleSosComplete} lang={lang} />
      </Layout>
    )
  }

  if (mode === 'result') {
    return (
      <Layout title="">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <div className="text-6xl animate-scale-in">🌟</div>
          <h2 className="text-2xl font-black text-white">
            {lang === 'ar' ? 'أحسنت!' : 'Well done!'}
          </h2>
          <p className="text-sm" style={{ color: '#888' }}>
            {lang === 'ar'
              ? 'لاحظ الفرق في مشاعرك — هذه قوة الثالوث العاطفي'
              : 'Notice the difference in how you feel — this is the power of the Triad'}
          </p>
          {/* Time-of-day + frequency message */}
          <div className="rounded-2xl px-5 py-3 text-sm font-semibold"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', color: '#c9a84c', maxWidth: 320 }}>
            {sosResultMsg}
          </div>
          <p className="text-xs" style={{ color: '#555' }}>
            {lang === 'ar'
              ? `استخدمت SOS ${sosThisWeek} مرة${sosThisWeek !== 1 ? '' : ''} هذا الأسبوع`
              : `Used SOS ${sosThisWeek} time${sosThisWeek !== 1 ? 's' : ''} this week`}
          </p>
          <button onClick={() => setMode('home')} className="btn-gold px-8 py-3 mt-2">{t('back')}</button>
        </div>
      </Layout>
    )
  }

  const TRIAD_TABS = [
    { key: 'physiology', label: t('state_physiology'), emoji: '💪' },
    { key: 'focus',      label: t('state_focus'),      emoji: '🎯' },
    { key: 'language',   label: t('state_language'),   emoji: '💬' },
  ]

  return (
    <Layout title={t('state_title')} subtitle={t('state_subtitle')} helpKey="state">
      <div className="space-y-4 pt-2">

        {/* SOS Big Button */}
        <button onClick={() => setMode('sos')}
          className="w-full rounded-3xl py-6 flex flex-col items-center gap-2 transition-all duration-200 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)',
            boxShadow: '0 0 30px rgba(230,57,70,0.4)', animation: 'pulse-red 2s ease-in-out infinite' }}>
          <span className="text-4xl">🚨</span>
          <span className="text-xl font-black text-white">{t('state_sos')}</span>
          <span className="text-xs text-white opacity-70">{t('state_sos_desc')}</span>
        </button>

        {/* State Check-in (3 dimensions — single source of truth) */}
        <StateCheckinComponent onDone={() => {}} />

        {/* How state is derived */}
        <div className="rounded-xl px-4 py-2" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)' }}>
          <p className="text-xs" style={{ color: '#888' }}>
            {isAr
              ? 'حالتك تُقاس بالطاقة + المزاج + الوضوح. حالة جميلة = متوسط 7+، معاناة = متوسط 4 أو أقل'
              : 'Your state is measured as Energy + Mood + Clarity. Beautiful state = average 7+, Suffering = average 4 or below.'}
          </p>
        </div>

        {/* Breathing */}
        <BreathGuide lang={lang} t={t} />

        {/* Emotional Triad */}
        <div className="card">
          <h3 className="font-bold text-white mb-3">{t('state_triad')}</h3>
          <div className="flex gap-1 mb-4">
            {TRIAD_TABS.map(tab => (
              <button key={tab.key} onClick={() => setTriadTab(tab.key)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: triadTab === tab.key ? 'rgba(201,168,76,0.15)' : '#111',
                  border: `1px solid ${triadTab === tab.key ? 'rgba(201,168,76,0.4)' : '#1e1e1e'}`,
                  color: triadTab === tab.key ? '#c9a84c' : '#666' }}>
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {TRIAD_TOOLS[triadTab].map((tool, i) => (
              <div key={i} className="rounded-xl p-3 flex items-start gap-3"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                <span className="text-xl">{tool.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white">{tool.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#888' }}>{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern Interrupt */}
        <div className="card">
          <h3 className="font-bold text-white mb-3">{t('state_pattern_break')}</h3>
          <p className="text-xs mb-3" style={{ color: '#888' }}>{t('state_pattern_desc')}</p>
          <button onClick={() => setRandomInterrupt(INTERRUPTS[Math.floor(Math.random() * INTERRUPTS.length)])}
            className="w-full py-3 rounded-2xl font-bold text-sm mb-3 transition-all active:scale-95"
            style={{ background: '#222', border: '1px solid #333', color: '#c9a84c' }}>
            🎲 {t('state_new_pattern')}
          </button>
          {randomInterrupt && (
            <div className="rounded-2xl p-4 text-center animate-scale-in"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <p className="text-3xl mb-2">{randomInterrupt.emoji}</p>
              <p className="font-bold text-white">{randomInterrupt.text}</p>
            </div>
          )}
        </div>

        {/* Three Decisions */}
        <ThreeDecisions state={state} update={update} lang={lang} />

        {/* Language Transformer */}
        <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <h3 className="font-bold text-white mb-1">🔄 {t('state_transformer')}</h3>
          <p className="text-xs mb-3" style={{ color: '#888' }}>{t('state_transformer_desc')}</p>
          {TRANSFORMER.map(([neg, pos]) => (
            <div key={neg} className="flex items-center gap-2 mb-2 text-xs">
              <span style={{ color: '#e63946' }} className="flex-1 text-right">{neg}</span>
              <span style={{ color: '#888' }}>→</span>
              <span style={{ color: '#2ecc71' }} className="flex-1 text-left">{pos}</span>
            </div>
          ))}
        </div>

        {/* Transformational Vocabulary */}
        <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <h3 className="font-bold text-white mb-1">💬 {t('state_vocab')}</h3>
          <p className="text-xs mb-3" style={{ color: '#888' }}>{t('state_vocab_desc')}</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {VOCAB_DATA.map((word, i) => (
              <button
                key={i}
                onClick={() => setSelectedVocab(selectedVocab === i ? null : i)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: selectedVocab === i ? 'rgba(230,57,70,0.2)' : 'rgba(230,57,70,0.08)',
                  border: `1px solid ${selectedVocab === i ? '#e63946' : 'rgba(230,57,70,0.25)'}`,
                  color: selectedVocab === i ? '#e63946' : '#cc6666',
                }}>
                {lang === 'ar' ? word.ar : word.en}
              </button>
            ))}
          </div>
          {selectedVocab !== null && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <p className="text-xs font-bold" style={{ color: '#c9a84c' }}>
                {lang === 'ar' ? '→ بدائل أقل شدة:' : '→ Softer alternatives:'}
              </p>
              {VOCAB_DATA[selectedVocab].levels.map((lvl, li) => (
                <div key={li} className="flex items-center gap-3 rounded-xl p-2.5"
                  style={{ background: `${lvl.color}12`, border: `1px solid ${lvl.color}33` }}>
                  <span className="text-xs font-bold w-16 text-center rounded-full px-2 py-0.5"
                    style={{ background: `${lvl.color}20`, color: lvl.color }}>
                    {lang === 'ar' ? `مستوى ${li + 1}` : `Level ${li + 1}`}
                  </span>
                  <span className="text-sm font-bold" style={{ color: lvl.color }}>
                    {lang === 'ar' ? lvl.ar : lvl.en}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Magic Problem-Solving Questions */}
        <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <h3 className="font-bold text-white mb-1">✨ {t('state_magic_q')}</h3>
          <p className="text-xs mb-3" style={{ color: '#888' }}>{t('state_magic_q_desc')}</p>
          <textarea
            value={magicProblem}
            onChange={e => setMagicProblem(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب تحديك أو مشكلتك هنا...' : 'Write your challenge or problem here...'}
            rows={2}
            className="input-dark resize-none text-sm w-full mb-3"
          />
          {MAGIC_QUESTIONS[lang].map((q, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-start gap-2 mb-1.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                  {i + 1}
                </span>
                <p className="text-sm font-bold text-white leading-snug">{q}</p>
              </div>
              <textarea
                value={(state.magicQuestions || {})[`q${i}`] || ''}
                onChange={e => updateMagicQuestions(`q${i}`, e.target.value)}
                placeholder={lang === 'ar' ? 'إجابتك...' : 'Your answer...'}
                rows={2}
                className="input-dark resize-none text-xs w-full"
                style={{ marginLeft: lang === 'ar' ? 0 : '2rem', marginRight: lang === 'ar' ? '2rem' : 0 }}
              />
            </div>
          ))}
        </div>

        {/* Emotional Flooding */}
        <EmotionalFlooding state={state} update={update} lang={lang} />

        {/* SOS History */}
        <SOSHistory sosLog={sosLog} last7Sos={last7Sos} sosThisWeek={sosThisWeek} today={today} isAr={isAr} />

      </div>
    </Layout>
  )
}
