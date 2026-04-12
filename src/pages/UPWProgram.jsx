import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'
import { CheckCircle, Circle, ChevronDown, ChevronUp, Flame, Zap, Heart, Star, Target, Users, Brain, TrendingUp } from 'lucide-react'

// ============================================================
// PROGRAM DATA
// ============================================================

const DAYS_DATA = [
  {
    key: 'day1',
    num: 1,
    color: '#e63946',
    gradientFrom: '#e63946',
    gradientTo: '#9b1a23',
    icon: Flame,
    titleAr: 'أطلق قوتك',
    titleEn: 'Unleash Your Power',
    themeAr: 'إتقان الحالة والتحكم العاطفي',
    themeEn: 'State Mastery & Emotional Control',
    conceptAr: 'حالتك تحدد كل شيء. أنت تتحكم في حالتك من خلال الفيزيولوجيا والتركيز واللغة.',
    conceptEn: 'Your state determines everything. You control your state through physiology, focus, and language.',
    exercises: [
      {
        titleAr: 'تحديد حالتك الافتراضية الحالية',
        titleEn: 'Identify your default emotional state',
        type: 'emotion-select',
        emotions: [
          { ar: 'قلق / خوف', en: 'Anxious / Fearful' },
          { ar: 'إحباط / غضب', en: 'Frustrated / Angry' },
          { ar: 'حزن / كآبة', en: 'Sad / Depressed' },
        ],
      },
      {
        titleAr: 'خريطة المؤثرات الثلاثة',
        titleEn: 'Map the Emotional Triad',
        type: 'triad',
        fieldsAr: ['صِف فيزيولوجيتك المعتادة (وضعية جسدك، تنفسك)...', 'صِف تركيزك المعتاد (ما الذي تفكر فيه غالباً)...', 'صِف لغتك المعتادة مع نفسك (ما تقوله لنفسك)...'],
        fieldsEn: ['Describe your typical physiology (posture, breathing)...', 'Describe your typical focus (what you think about usually)...', 'Describe your typical self-talk (what you say to yourself)...'],
      },
      {
        titleAr: 'قرار تغيير حالتك في 60 ثانية',
        titleEn: '60-second state change decision',
        type: 'link',
        descAr: 'قم بممارسة SOS الآن — غيّر حالتك في 60 ثانية',
        descEn: 'Do the SOS practice now — change your state in 60 seconds',
        linkPath: '/state',
        linkLabelAr: 'اذهب لصفحة الحالة',
        linkLabelEn: 'Go to State Page',
      },
      {
        titleAr: 'جلسة التنفس النشط',
        titleEn: 'Active Breathing Session',
        type: 'checkbox-confirm',
        confirmLabelAr: 'أنجزت جلسة التنفس',
        confirmLabelEn: 'I completed the breathing session',
      },
      {
        titleAr: 'كيف ستقيس نجاحك في اليوم؟',
        titleEn: 'How will you measure today\'s success?',
        type: 'text-input',
        placeholderAr: 'نجاحي في اليوم الأول يعني...',
        placeholderEn: 'My success in Day 1 means...',
      },
    ],
    reflectionAr: 'ما أكبر اكتشاف في يوم الأول؟',
    reflectionEn: 'What is your biggest discovery from Day 1?',
  },
  {
    key: 'day2',
    num: 2,
    color: '#e67e22',
    gradientFrom: '#e67e22',
    gradientTo: '#a05a15',
    icon: Brain,
    titleAr: 'حُرق القيود',
    titleEn: 'Burn the Limits',
    themeAr: 'تحويل المعتقدات والهوية',
    themeEn: 'Beliefs & Identity Transformation',
    conceptAr: 'معتقداتك هي قوانين كونك. أي معتقد يمكن تغييره.',
    conceptEn: 'Your beliefs are the laws of your universe. Any belief can be changed.',
    exercises: [
      {
        titleAr: 'حدد 3 معتقدات مقيّدة',
        titleEn: 'Identify 3 limiting beliefs',
        type: 'link',
        descAr: 'اذهب لصفحة المعتقدات وحدد ما يقيّدك',
        descEn: 'Go to the Beliefs page and identify what limits you',
        linkPath: '/beliefs',
        linkLabelAr: 'اذهب لصفحة المعتقدات',
        linkLabelEn: 'Go to Beliefs Page',
      },
      {
        titleAr: 'أكمل عملية ديكنز',
        titleEn: 'Complete Dickens Process',
        type: 'checkbox-confirm',
        confirmLabelAr: 'أكملت عملية ديكنز',
        confirmLabelEn: 'I completed the Dickens Process',
      },
      {
        titleAr: 'اكتب معتقداتك التمكينية الجديدة',
        titleEn: 'Write new empowering beliefs',
        type: 'multi-text',
        count: 3,
        placeholderAr: (i) => `المعتقد التمكيني ${i + 1}...`,
        placeholderEn: (i) => `Empowering belief ${i + 1}...`,
      },
      {
        titleAr: 'تمرين المرآة',
        titleEn: 'Mirror Exercise',
        type: 'checkbox-confirm',
        descAr: 'قل معتقداتك الجديدة أمام المرآة لمدة 3 دقائق',
        descEn: 'Say your new beliefs to a mirror for 3 minutes',
        confirmLabelAr: 'أنجزت تمرين المرآة',
        confirmLabelEn: 'I completed the Mirror Exercise',
      },
      {
        titleAr: 'بيان الهوية الجديدة',
        titleEn: 'New Identity Statement',
        type: 'textarea',
        placeholderAr: 'أنا...',
        placeholderEn: 'I am...',
      },
    ],
    reflectionAr: 'كيف تغيّر إحساسك بنفسك؟',
    reflectionEn: 'How did your sense of self shift?',
  },
  {
    key: 'day3',
    num: 3,
    color: '#e91e8c',
    gradientFrom: '#e91e8c',
    gradientTo: '#9c1360',
    icon: Heart,
    titleAr: 'قوة العلاقات',
    titleEn: 'The Power of Relationships',
    themeAr: 'الحب والتواصل والمساهمة',
    themeEn: 'Love, Connection & Contribution',
    conceptAr: 'جودة حياتك هي جودة علاقاتك. النجاح بدون إشباع هو فشل.',
    conceptEn: 'The quality of your life is the quality of your relationships. Success without fulfillment is failure.',
    exercises: [
      {
        titleAr: 'قيّم علاقاتك الرئيسية',
        titleEn: 'Rate your key relationships',
        type: 'link',
        descAr: 'اذهب لصفحة العلاقات لتقييم أهم علاقاتك',
        descEn: 'Go to the Relationships page to rate your key relationships',
        linkPath: '/relationships',
        linkLabelAr: 'اذهب لصفحة العلاقات',
        linkLabelEn: 'Go to Relationships Page',
      },
      {
        titleAr: 'رسالة قلبية',
        titleEn: 'Heart Letter',
        type: 'textarea',
        placeholderAr: 'اكتب رسالة تقدير لشخص مهم في حياتك...',
        placeholderEn: 'Write a letter of appreciation to someone important in your life...',
      },
      {
        titleAr: 'تحديد احتياجاتك الست',
        titleEn: 'Identify your Six Human Needs',
        type: 'link',
        descAr: 'اكتشف الحاجات الست وكيف تؤثر في حياتك',
        descEn: 'Discover the Six Human Needs and how they shape your life',
        linkPath: '/six-needs',
        linkLabelAr: 'اذهب لصفحة الحاجات الست',
        linkLabelEn: 'Go to Six Needs Page',
      },
      {
        titleAr: 'خطة العطاء',
        titleEn: 'Giving Plan',
        type: 'multi-text',
        count: 3,
        placeholderAr: (i) => `فعل عطاء ${i + 1} ستقوم به هذا الأسبوع...`,
        placeholderEn: (i) => `Giving action ${i + 1} you'll take this week...`,
      },
      {
        titleAr: 'نقطة التواصل',
        titleEn: 'Connection Point',
        type: 'checkbox-confirm',
        descAr: 'تواصل مع شخص لم تتحدث معه منذ زمن',
        descEn: 'Reach out to 1 person you haven\'t spoken to in a while',
        confirmLabelAr: 'تواصلت',
        confirmLabelEn: 'I reached out',
      },
    ],
    reflectionAr: 'من الشخص الذي أريد أن يعرف أنني أقدّره؟',
    reflectionEn: 'Who is the person I want to know I appreciate them?',
  },
  {
    key: 'day4',
    num: 4,
    color: '#9b59b6',
    gradientFrom: '#9b59b6',
    gradientTo: '#6c3483',
    icon: Star,
    titleAr: 'نموذج حياتك المثالية',
    titleEn: 'Your Ideal Life Blueprint',
    themeAr: 'الرؤية والغرض والمساهمة',
    themeEn: 'Vision, Purpose & Contribution',
    conceptAr: 'الحياة التي تُعاش بغرض هي أقوى حياة يمكنك أن تعيشها. إرثك يُبنى الآن.',
    conceptEn: 'A life lived on purpose is the most powerful life you can live. Your legacy is being built right now.',
    exercises: [
      {
        titleAr: 'رسالتك الحياتية',
        titleEn: 'Life Mission Statement',
        type: 'textarea',
        placeholderAr: 'رسالتي هي...',
        placeholderEn: 'My mission is...',
      },
      {
        titleAr: 'رؤيتك 10 سنوات',
        titleEn: '10-Year Vision',
        type: 'link',
        descAr: 'اذهب لصفحة المستقبل المقنع واملأ رؤية 10 سنوات',
        descEn: 'Go to the Compelling Future page and fill in your 10-year vision',
        linkPath: '/compelling-future',
        linkLabelAr: 'اذهب لرؤية 10 سنوات',
        linkLabelEn: 'Go to 10-Year Vision',
      },
      {
        titleAr: 'إرثك',
        titleEn: 'Your Legacy',
        type: 'textarea',
        placeholderAr: 'بعد 100 سنة، أريد أن يُقال عني...',
        placeholderEn: 'In 100 years, I want to be remembered as...',
      },
      {
        titleAr: 'هرمية قيمك',
        titleEn: 'Values Hierarchy',
        type: 'link',
        descAr: 'اكتشف وحدد قيمك الأعلى وترتيبها',
        descEn: 'Discover and rank your highest values',
        linkPath: '/values',
        linkLabelAr: 'اذهب لصفحة القيم',
        linkLabelEn: 'Go to Values Page',
      },
      {
        titleAr: 'خطوة المساهمة',
        titleEn: 'Contribution Step',
        type: 'textarea',
        placeholderAr: 'الطريقة التي سأساهم بها في العالم هذا الأسبوع...',
        placeholderEn: 'The way I will contribute to the world this week...',
      },
    ],
    reflectionAr: 'ما الالتزام الواحد الأكبر الذي ستتعهد به من هذا البرنامج؟',
    reflectionEn: 'What is the single biggest commitment you will make from this program?',
  },
]

// ============================================================
// INITIAL STATE
// ============================================================

const INITIAL_UPW = {
  daysDone: { day1: false, day2: false, day3: false, day4: false },
  exercises: {},
  exerciseData: {},  // stores text/selection data per exercise key
  reflections: { day1: '', day2: '', day3: '', day4: '' },
  startDate: null,
}

// ============================================================
// HELPERS
// ============================================================

function getDayExerciseCount(dayKey) {
  const day = DAYS_DATA.find(d => d.key === dayKey)
  return day ? day.exercises.length : 0
}

function getDayCompletedCount(dayKey, exercises) {
  const day = DAYS_DATA.find(d => d.key === dayKey)
  if (!day) return 0
  return day.exercises.filter((_, i) => exercises[`${dayKey}-${i}`]).length
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ExerciseCard({ dayKey, exIdx, exercise, isAr, exercises, exerciseData, onToggle, onDataChange, dayColor }) {
  const exKey = `${dayKey}-${exIdx}`
  const done = !!exercises[exKey]
  const data = exerciseData[exKey] || {}

  function handleDataChange(field, value) {
    onDataChange(exKey, { ...data, [field]: value })
  }

  return (
    <div
      style={{
        background: done ? `${dayColor}0d` : '#111',
        border: `1px solid ${done ? dayColor + '40' : '#1e1e1e'}`,
        borderRadius: 14,
        padding: '16px 18px',
        marginBottom: 10,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button
          onClick={() => onToggle(exKey)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 1, flexShrink: 0 }}
        >
          {done
            ? <CheckCircle size={22} style={{ color: dayColor }} />
            : <Circle size={22} style={{ color: '#333' }} />}
        </button>
        <div style={{ flex: 1 }}>
          <p style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: done ? dayColor : '#e8e8e8',
            lineHeight: 1.5,
          }}>
            {isAr ? exercise.titleAr : exercise.titleEn}
          </p>

          {/* Type-specific content */}
          {exercise.type === 'emotion-select' && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {exercise.emotions.map((em, ei) => {
                  const selected = data.selectedEmotion === ei
                  return (
                    <button
                      key={ei}
                      onClick={() => handleDataChange('selectedEmotion', selected ? null : ei)}
                      style={{
                        background: selected ? `${dayColor}22` : 'transparent',
                        border: `1px solid ${selected ? dayColor : '#333'}`,
                        borderRadius: 20,
                        padding: '6px 14px',
                        color: selected ? dayColor : '#aaa',
                        fontSize: 12,
                        fontWeight: selected ? 700 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isAr ? em.ar : em.en}
                    </button>
                  )
                })}
              </div>
              <input
                type="text"
                placeholder={isAr ? 'أو اكتب مشاعرك الافتراضية بنفسك...' : 'Or write your own default state...'}
                value={data.customEmotion || ''}
                onChange={e => handleDataChange('customEmotion', e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
                  padding: '8px 12px', color: '#e8e8e8', fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          )}

          {exercise.type === 'triad' && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(isAr ? exercise.fieldsAr : exercise.fieldsEn).map((placeholder, fi) => (
                <textarea
                  key={fi}
                  placeholder={placeholder}
                  value={data[`field_${fi}`] || ''}
                  onChange={e => handleDataChange(`field_${fi}`, e.target.value)}
                  rows={2}
                  style={{
                    width: '100%', boxSizing: 'border-box', resize: 'vertical',
                    background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
                    padding: '8px 12px', color: '#e8e8e8', fontSize: 13,
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
              ))}
            </div>
          )}

          {exercise.type === 'link' && (
            <div style={{ marginTop: 10 }}>
              {(exercise.descAr || exercise.descEn) && (
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#888', lineHeight: 1.5 }}>
                  {isAr ? exercise.descAr : exercise.descEn}
                </p>
              )}
              <a
                href={exercise.linkPath}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg, #c9a84c, #a88930)',
                  color: '#090909',
                  borderRadius: 8, padding: '7px 14px',
                  fontSize: 12, fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
                onClick={() => onToggle(exKey)}
              >
                <TrendingUp size={13} />
                {isAr ? exercise.linkLabelAr : exercise.linkLabelEn}
              </a>
            </div>
          )}

          {exercise.type === 'checkbox-confirm' && (
            <div style={{ marginTop: 10 }}>
              {(exercise.descAr || exercise.descEn) && (
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#888', lineHeight: 1.5 }}>
                  {isAr ? exercise.descAr : exercise.descEn}
                </p>
              )}
              <button
                onClick={() => onToggle(exKey)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: done ? `${dayColor}18` : 'transparent',
                  border: `1px solid ${done ? dayColor : '#333'}`,
                  borderRadius: 8, padding: '7px 14px',
                  color: done ? dayColor : '#888',
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {done
                  ? <CheckCircle size={13} />
                  : <Circle size={13} />}
                {isAr ? exercise.confirmLabelAr : exercise.confirmLabelEn}
              </button>
            </div>
          )}

          {exercise.type === 'text-input' && (
            <input
              type="text"
              placeholder={isAr ? exercise.placeholderAr : exercise.placeholderEn}
              value={data.value || ''}
              onChange={e => handleDataChange('value', e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box', marginTop: 10,
                background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
                padding: '8px 12px', color: '#e8e8e8', fontSize: 13,
                outline: 'none',
              }}
            />
          )}

          {exercise.type === 'textarea' && (
            <textarea
              placeholder={isAr ? exercise.placeholderAr : exercise.placeholderEn}
              value={data.value || ''}
              onChange={e => handleDataChange('value', e.target.value)}
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box', marginTop: 10, resize: 'vertical',
                background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
                padding: '8px 12px', color: '#e8e8e8', fontSize: 13,
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          )}

          {exercise.type === 'multi-text' && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: exercise.count }, (_, mi) => (
                <input
                  key={mi}
                  type="text"
                  placeholder={isAr ? exercise.placeholderAr(mi) : exercise.placeholderEn(mi)}
                  value={data[`item_${mi}`] || ''}
                  onChange={e => handleDataChange(`item_${mi}`, e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
                    padding: '8px 12px', color: '#e8e8e8', fontSize: 13,
                    outline: 'none',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function UPWProgram() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const { state, update } = useApp()
  const { showToast } = useToast()

  const upw = state.upwProgram || INITIAL_UPW

  const [activeDay, setActiveDay] = useState(0)  // 0-3
  const [confirmReset, setConfirmReset] = useState(false)

  // ---- derived ----
  const allDaysCount = DAYS_DATA.length
  const totalExercises = DAYS_DATA.reduce((sum, d) => sum + d.exercises.length, 0)
  const completedExercises = Object.values(upw.exercises || {}).filter(Boolean).length
  const overallPct = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0
  const allDaysCompleted = DAYS_DATA.every(d => upw.daysDone?.[d.key])

  // ---- helpers ----
  function saveUpw(next) {
    update('upwProgram', next)
  }

  function handleStart() {
    const today = new Date().toISOString().split('T')[0]
    saveUpw({ ...INITIAL_UPW, startDate: today })
    showToast(isAr ? 'تم بدء برنامج UPW! 🔥' : 'UPW Program started! 🔥', 'gold')
  }

  function handleExerciseToggle(exKey) {
    const current = !!(upw.exercises || {})[exKey]
    const nextExercises = { ...(upw.exercises || {}), [exKey]: !current }
    saveUpw({ ...upw, exercises: nextExercises })
  }

  function handleExerciseData(exKey, data) {
    const nextData = { ...(upw.exerciseData || {}), [exKey]: data }
    saveUpw({ ...upw, exerciseData: nextData })
  }

  function handleReflection(dayKey, value) {
    const nextReflections = { ...(upw.reflections || {}), [dayKey]: value }
    saveUpw({ ...upw, reflections: nextReflections })
  }

  function handleDayComplete(dayKey) {
    const nextDaysDone = { ...(upw.daysDone || {}), [dayKey]: true }
    saveUpw({ ...upw, daysDone: nextDaysDone })
    showToast(isAr ? 'أحسنت! يوم مكتمل 🎉' : 'Well done! Day complete 🎉', 'success')
    if (activeDay < 3) setActiveDay(activeDay + 1)
  }

  function handleReset() {
    saveUpw(INITIAL_UPW)
    setConfirmReset(false)
    setActiveDay(0)
    showToast(isAr ? 'تم إعادة ضبط البرنامج' : 'Program reset', 'info')
  }

  // ============================================================
  // NOT STARTED — SPLASH SCREEN
  // ============================================================
  if (!upw.startDate) {
    return (
      <Layout>
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', textAlign: 'center' }}>
          {/* Flame icon ring */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'linear-gradient(135deg, #e63946, #9b59b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 28,
            boxShadow: '0 0 40px rgba(230,57,70,0.4)',
          }}>
            <Flame size={48} color="#fff" />
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e8e8e8', margin: '0 0 6px' }}>
            UPW — {isAr ? 'أطلق قوتك الداخلية' : 'Unleash the Power Within'}
          </h1>
          <p style={{ fontSize: 14, color: '#c9a84c', fontWeight: 600, marginBottom: 20 }}>
            {isAr ? 'البرنامج الرقمي الكامل لـ Tony Robbins' : "Tony Robbins' Complete Digital Program"}
          </p>

          {/* 4 day pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            {DAYS_DATA.map(d => (
              <div key={d.key} style={{
                background: `${d.color}18`, border: `1px solid ${d.color}50`,
                borderRadius: 20, padding: '6px 16px',
                fontSize: 12, color: d.color, fontWeight: 700,
              }}>
                {isAr ? `اليوم ${d.num}: ${d.titleAr}` : `Day ${d.num}: ${d.titleEn}`}
              </div>
            ))}
          </div>

          {/* Quote */}
          <div style={{
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 16, padding: '20px 24px', maxWidth: 480,
            marginBottom: 36,
          }}>
            <p style={{ fontSize: 15, color: '#e8e8e8', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
              {isAr
                ? '"التغيير الحقيقي يحدث عندما يصبح ألم البقاء كما أنت أكبر من ألم التغيير."'
                : '"Real change happens when the pain of staying the same becomes greater than the pain of change."'}
            </p>
            <p style={{ fontSize: 12, color: '#c9a84c', margin: '12px 0 0', fontWeight: 600 }}>— Tony Robbins</p>
          </div>

          <button
            onClick={handleStart}
            style={{
              background: 'linear-gradient(135deg, #e63946, #c9a84c)',
              color: '#fff', border: 'none', borderRadius: 14,
              padding: '16px 40px', fontSize: 16, fontWeight: 800,
              cursor: 'pointer', letterSpacing: 0.5,
              boxShadow: '0 8px 32px rgba(230,57,70,0.4)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {isAr ? 'ابدأ البرنامج الآن' : 'Start the Program Now'}
          </button>

          <p style={{ fontSize: 11, color: '#444', marginTop: 14 }}>
            {isAr ? '4 أيام · 20 تمريناً · تحول حقيقي' : '4 Days · 20 Exercises · Real Transformation'}
          </p>
        </div>
      </Layout>
    )
  }

  // ============================================================
  // CURRENT DAY DATA
  // ============================================================
  const day = DAYS_DATA[activeDay]
  const DayIcon = day.icon
  const dayCompletedEx = getDayCompletedCount(day.key, upw.exercises || {})
  const dayTotalEx = getDayExerciseCount(day.key)
  const dayPct = dayTotalEx > 0 ? Math.round((dayCompletedEx / dayTotalEx) * 100) : 0

  // ============================================================
  // CELEBRATION SCREEN
  // ============================================================
  if (allDaysCompleted) {
    return (
      <Layout>
        <div style={{ padding: '24px 16px', maxWidth: 540, margin: '0 auto' }}>
          {/* Trophy Card */}
          <div style={{
            background: 'linear-gradient(135deg, #c9a84c15, #9b59b615)',
            border: '1px solid #c9a84c40',
            borderRadius: 20, padding: '32px 24px', textAlign: 'center', marginBottom: 20,
          }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🏆</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#c9a84c', margin: '0 0 8px' }}>
              {isAr ? 'أكملت UPW الرقمي!' : 'You Completed Digital UPW!'}
            </h2>
            <p style={{ fontSize: 14, color: '#aaa', margin: 0 }}>
              {isAr
                ? 'لقد أكملت جميع الأيام الأربعة. هذا إنجاز حقيقي.'
                : 'You have completed all four days. This is a real achievement.'}
            </p>
          </div>

          {/* Key commitments summary */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e8e8e8', marginBottom: 12 }}>
              {isAr ? 'التزاماتك الرئيسية:' : 'Your Key Commitments:'}
            </h3>
            {DAYS_DATA.map(d => {
              const reflection = (upw.reflections || {})[d.key]
              if (!reflection) return null
              return (
                <div key={d.key} style={{
                  background: '#111', border: `1px solid ${d.color}30`,
                  borderRadius: 12, padding: '14px 16px', marginBottom: 10,
                  borderRight: isAr ? `4px solid ${d.color}` : undefined,
                  borderLeft: !isAr ? `4px solid ${d.color}` : undefined,
                }}>
                  <p style={{ fontSize: 11, color: d.color, fontWeight: 700, margin: '0 0 6px' }}>
                    {isAr ? `اليوم ${d.num}: ${d.titleAr}` : `Day ${d.num}: ${d.titleEn}`}
                  </p>
                  <p style={{ fontSize: 13, color: '#ccc', margin: 0, lineHeight: 1.6 }}>{reflection}</p>
                </div>
              )
            })}
          </div>

          {/* Overall stats */}
          <div style={{
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 14, padding: '16px 20px', marginBottom: 20,
            display: 'flex', justifyContent: 'space-around', textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#c9a84c' }}>{completedExercises}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{isAr ? 'تمارين مكتملة' : 'Exercises Done'}</div>
            </div>
            <div style={{ width: 1, background: '#222' }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#c9a84c' }}>4</div>
              <div style={{ fontSize: 11, color: '#888' }}>{isAr ? 'أيام مكتملة' : 'Days Complete'}</div>
            </div>
            <div style={{ width: 1, background: '#222' }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#2ecc71' }}>100%</div>
              <div style={{ fontSize: 11, color: '#888' }}>{isAr ? 'الإنجاز الكلي' : 'Overall Progress'}</div>
            </div>
          </div>

          {/* Reset */}
          <div style={{ textAlign: 'center' }}>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                style={{ background: 'none', border: '1px solid #333', borderRadius: 8, padding: '8px 18px', color: '#555', fontSize: 12, cursor: 'pointer' }}
              >
                {isAr ? 'إعادة البرنامج من البداية' : 'Restart Program'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={handleReset} style={{ background: '#e74c3c22', border: '1px solid #e74c3c', borderRadius: 8, padding: '8px 16px', color: '#e74c3c', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                  {isAr ? 'نعم، إعادة ضبط' : 'Yes, Reset'}
                </button>
                <button onClick={() => setConfirmReset(false)} style={{ background: 'none', border: '1px solid #333', borderRadius: 8, padding: '8px 16px', color: '#888', fontSize: 12, cursor: 'pointer' }}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    )
  }

  // ============================================================
  // MAIN PROGRAM VIEW
  // ============================================================
  return (
    <Layout>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px 16px 40px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#e8e8e8', margin: 0 }}>
              UPW — {isAr ? 'أطلق قوتك الداخلية' : 'Unleash the Power Within'}
            </h1>
            {upw.startDate && (
              <span style={{ fontSize: 11, color: '#555', flexShrink: 0 }}>
                {isAr ? `بدأت: ${upw.startDate}` : `Started: ${upw.startDate}`}
              </span>
            )}
          </div>

          {/* Overall progress bar */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#888' }}>
                {isAr ? `الإنجاز الكلي — ${completedExercises} من ${totalExercises} تمريناً` : `Overall — ${completedExercises} of ${totalExercises} exercises`}
              </span>
              <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 700 }}>{overallPct}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>

        {/* ── Day Tabs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {DAYS_DATA.map((d, idx) => {
            const dComp = getDayCompletedCount(d.key, upw.exercises || {})
            const dTotal = getDayExerciseCount(d.key)
            const dPct = dTotal > 0 ? Math.round((dComp / dTotal) * 100) : 0
            const isActive = activeDay === idx
            const isDone = upw.daysDone?.[d.key]
            const DIcon = d.icon

            return (
              <button
                key={d.key}
                onClick={() => setActiveDay(idx)}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${d.gradientFrom}, ${d.gradientTo})`
                    : isDone
                    ? `${d.color}15`
                    : '#111',
                  border: `1px solid ${isActive ? d.color : isDone ? d.color + '40' : '#1e1e1e'}`,
                  borderRadius: 12,
                  padding: '12px 6px 10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 4px 20px ${d.color}35` : 'none',
                  position: 'relative',
                }}
              >
                {isDone && (
                  <div style={{
                    position: 'absolute', top: 6, right: isAr ? 6 : undefined, left: !isAr ? 6 : undefined,
                  }}>
                    <CheckCircle size={12} style={{ color: d.color }} />
                  </div>
                )}
                <DIcon size={18} color={isActive ? '#fff' : d.color} style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 16, fontWeight: 800, color: isActive ? '#fff' : '#e8e8e8', lineHeight: 1 }}>
                  {d.num}
                </div>
                <div style={{ fontSize: 9, color: isActive ? 'rgba(255,255,255,0.75)' : '#555', marginTop: 2, fontWeight: 600, lineHeight: 1.2 }}>
                  {isAr ? d.titleAr : d.titleEn}
                </div>
                {/* mini progress */}
                <div style={{
                  height: 2, background: isActive ? 'rgba(255,255,255,0.25)' : '#1e1e1e',
                  borderRadius: 2, marginTop: 8, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${dPct}%`,
                    background: isActive ? '#fff' : d.color,
                    borderRadius: 2, transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ fontSize: 9, color: isActive ? 'rgba(255,255,255,0.6)' : '#444', marginTop: 3 }}>
                  {dPct}%
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Active Day Content ── */}
        <div key={day.key}>
          {/* Day hero */}
          <div style={{
            background: `linear-gradient(135deg, ${day.gradientFrom}22, ${day.gradientTo}18)`,
            border: `1px solid ${day.color}35`,
            borderRadius: 16, padding: '20px 20px 16px', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `linear-gradient(135deg, ${day.gradientFrom}, ${day.gradientTo})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 16px ${day.color}40`,
              }}>
                <DayIcon size={22} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: day.color, fontWeight: 700, letterSpacing: 0.5 }}>
                  {isAr ? `اليوم ${day.num}` : `Day ${day.num}`}
                </p>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#e8e8e8' }}>
                  {isAr ? day.titleAr : day.titleEn}
                </h2>
              </div>
            </div>

            <div style={{ borderRadius: 10, background: `${day.color}12`, padding: '10px 14px', marginBottom: 10 }}>
              <p style={{ fontSize: 11, color: day.color, fontWeight: 700, margin: '0 0 4px' }}>
                {isAr ? 'المفهوم الأساسي:' : 'Core Concept:'}
              </p>
              <p style={{ fontSize: 13, color: '#ccc', margin: 0, lineHeight: 1.6 }}>
                {isAr ? day.conceptAr : day.conceptEn}
              </p>
            </div>

            {/* Day progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#888' }}>
                  {isAr ? `${dayCompletedEx} من ${dayTotalEx} تمارين` : `${dayCompletedEx} of ${dayTotalEx} exercises`}
                </span>
                <span style={{ fontSize: 11, color: day.color, fontWeight: 700 }}>{dayPct}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${dayPct}%`, background: day.color }} />
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#888', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isAr ? 'التمارين' : 'Exercises'}
            </h3>
            {day.exercises.map((ex, i) => (
              <ExerciseCard
                key={i}
                dayKey={day.key}
                exIdx={i}
                exercise={ex}
                isAr={isAr}
                exercises={upw.exercises || {}}
                exerciseData={upw.exerciseData || {}}
                onToggle={handleExerciseToggle}
                onDataChange={handleExerciseData}
                dayColor={day.color}
              />
            ))}
          </div>

          {/* Reflection */}
          <div style={{
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 14, padding: '16px 18px', marginBottom: 16,
          }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#e8e8e8', marginBottom: 10 }}>
              {isAr ? day.reflectionAr : day.reflectionEn}
            </label>
            <textarea
              value={(upw.reflections || {})[day.key] || ''}
              onChange={e => handleReflection(day.key, e.target.value)}
              placeholder={isAr ? 'اكتب تأملاتك هنا...' : 'Write your reflections here...'}
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box', resize: 'vertical',
                background: '#0a0a0a', border: '1px solid #222', borderRadius: 10,
                padding: '10px 14px', color: '#e8e8e8', fontSize: 13,
                outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
              }}
            />
          </div>

          {/* Day Complete Button */}
          {!upw.daysDone?.[day.key] ? (
            <button
              onClick={() => handleDayComplete(day.key)}
              disabled={dayPct < 60}
              style={{
                width: '100%',
                background: dayPct >= 60
                  ? `linear-gradient(135deg, ${day.gradientFrom}, ${day.gradientTo})`
                  : '#1a1a1a',
                color: dayPct >= 60 ? '#fff' : '#444',
                border: 'none', borderRadius: 14,
                padding: '16px', fontSize: 15, fontWeight: 800,
                cursor: dayPct >= 60 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                boxShadow: dayPct >= 60 ? `0 6px 24px ${day.color}40` : 'none',
              }}
            >
              {dayPct < 60
                ? isAr ? `أكمل ${Math.ceil(dayTotalEx * 0.6) - dayCompletedEx} تمارين إضافية للمتابعة` : `Complete ${Math.ceil(dayTotalEx * 0.6) - dayCompletedEx} more exercises to continue`
                : isAr ? `إنهاء اليوم ${day.num} ✓` : `Complete Day ${day.num} ✓`}
            </button>
          ) : (
            <div style={{
              background: `${day.color}12`, border: `1px solid ${day.color}40`,
              borderRadius: 14, padding: '14px', textAlign: 'center',
            }}>
              <CheckCircle size={20} style={{ color: day.color, marginBottom: 6 }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: day.color }}>
                {isAr ? `اليوم ${day.num} مكتمل!` : `Day ${day.num} Complete!`}
              </p>
              {activeDay < 3 && (
                <button
                  onClick={() => setActiveDay(activeDay + 1)}
                  style={{
                    background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909',
                    border: 'none', borderRadius: 10, padding: '8px 20px',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 10,
                  }}
                >
                  {isAr ? `انتقل لليوم ${day.num + 1} ←` : `Go to Day ${day.num + 1} →`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Reset Option ── */}
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #1a1a1a', textAlign: 'center' }}>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              style={{ background: 'none', border: '1px solid #222', borderRadius: 8, padding: '8px 18px', color: '#444', fontSize: 11, cursor: 'pointer' }}
            >
              {isAr ? 'إعادة ضبط البرنامج' : 'Reset Program'}
            </button>
          ) : (
            <div>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
                {isAr ? 'هل أنت متأكد؟ سيتم فقدان كل تقدمك.' : 'Are you sure? All progress will be lost.'}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={handleReset} style={{ background: '#e74c3c22', border: '1px solid #e74c3c', borderRadius: 8, padding: '8px 16px', color: '#e74c3c', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                  {isAr ? 'نعم، إعادة ضبط' : 'Yes, Reset'}
                </button>
                <button onClick={() => setConfirmReset(false)} style={{ background: 'none', border: '1px solid #333', borderRadius: 8, padding: '8px 16px', color: '#888', fontSize: 12, cursor: 'pointer' }}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
