import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { computeFocusPath } from '../utils/adaptivePath'

const TOTAL_STEPS = 5

const GOAL_AREAS = [
  { key: 'health',        emoji: '💪', labelAr: 'الصحة والطاقة',     labelEn: 'Health & Energy' },
  { key: 'career',        emoji: '🚀', labelAr: 'المسار المهني',     labelEn: 'Career Growth' },
  { key: 'finances',      emoji: '💰', labelAr: 'الحرية المالية',    labelEn: 'Financial Freedom' },
  { key: 'relationships', emoji: '❤️', labelAr: 'العلاقات',          labelEn: 'Relationships' },
  { key: 'mindset',       emoji: '🧠', labelAr: 'العقلية والمعتقدات', labelEn: 'Mindset & Beliefs' },
  { key: 'energy',        emoji: '⚡', labelAr: 'الطاقة والحيوية',   labelEn: 'Energy & Vitality' },
]

const CHALLENGES = [
  { key: 'consistency', emoji: '🔄', labelAr: 'الاستمرارية',            labelEn: 'Staying Consistent',   descAr: 'أبدأ بحماس ثم أتوقف', descEn: 'I start strong then lose momentum' },
  { key: 'clarity',     emoji: '🎯', labelAr: 'الوضوح',                labelEn: 'Finding Clarity',      descAr: 'لا أعرف ماذا أريد بالضبط', descEn: "I don't know exactly what I want" },
  { key: 'motivation',  emoji: '🔥', labelAr: 'التحفيز',               labelEn: 'Staying Motivated',    descAr: 'أفقد الحماس بسرعة', descEn: 'I lose motivation quickly' },
  { key: 'overwhelm',   emoji: '🌊', labelAr: 'الضغط والتشتت',         labelEn: 'Feeling Overwhelmed',  descAr: 'كثرة المهام تشتتني', descEn: 'Too many things pulling my attention' },
  { key: 'time',        emoji: '⏰', labelAr: 'ضيق الوقت',             labelEn: 'Not Enough Time',      descAr: 'يومي مزدحم جداً', descEn: 'My days are packed' },
]

const TIME_OPTIONS = [
  { key: '5',  emoji: '⚡', labelAr: '٥ دقائق',  labelEn: '5 minutes',  descAr: 'سريع ومؤثر', descEn: 'Quick & impactful' },
  { key: '15', emoji: '🎯', labelAr: '١٥ دقيقة', labelEn: '15 minutes', descAr: 'مثالي للروتين', descEn: 'Perfect for routines' },
  { key: '30', emoji: '🔥', labelAr: '٣٠ دقيقة', labelEn: '30 minutes', descAr: 'تحوّل حقيقي', descEn: 'Real transformation' },
  { key: '60', emoji: '💎', labelAr: 'ساعة+',    labelEn: '1 hour+',    descAr: 'أنا ملتزم بالكامل', descEn: 'I\'m fully committed' },
]

const FEATURES = [
  {
    emoji: '☀️', color: '#f39c12',
    labelAr: 'الروتين الصباحي', labelEn: 'Morning Ritual',
    descAr: 'تقنية الضخ: تنفس + امتنان + تصور الأهداف (15 دقيقة)',
    descEn: 'Priming: breathing + gratitude + goal visualization (15 min)'
  },
  {
    emoji: '🎯', color: '#3498db',
    labelAr: 'الأهداف بمنهج RPM',  labelEn: 'Goals with RPM Method',
    descAr: 'Result → Purpose → Massive Action — الطريقة الأقوى لتحقيق الأهداف',
    descEn: 'Result → Purpose → Massive Action — the most powerful goal system'
  },
  {
    emoji: '🌐', color: '#2ecc71',
    labelAr: 'عجلة الحياة',  labelEn: 'Wheel of Life',
    descAr: 'قيّم 7 مجالات: الصحة، العلاقات، المال، المهنة... واكتشف أين التوازن',
    descEn: 'Rate 7 areas: health, relationships, money, career... and find balance'
  },
  {
    emoji: '🧠', color: '#9b59b6',
    labelAr: 'تحويل المعتقدات',  labelEn: 'Beliefs Transformation',
    descAr: 'نموذج ديكنز: اكتشف المعتقدات المقيّدة وحوّلها إلى قوة دافعة',
    descEn: 'Dickens Process: discover limiting beliefs and turn them into driving force'
  },
  {
    emoji: '📊', color: '#c9a84c',
    labelAr: 'الفحص الأسبوعي',  labelEn: 'Weekly Pulse',
    descAr: 'كل أسبوع: قيّم طاقتك، راجع انتصاراتك، وضع نيتك للأسبوع القادم',
    descEn: 'Each week: rate your energy, review your wins, set next week\'s intention'
  },
  {
    emoji: '🚨', color: '#e63946',
    labelAr: 'أدوات الطوارئ',  labelEn: 'Emergency Toolkit',
    descAr: 'عندما تشعر بالضغط: 6 أدوات فورية لتغيير حالتك في 60 ثانية',
    descEn: 'When overwhelmed: 6 instant tools to change your state in 60 seconds'
  },
]

export default function OnboardingModal({ onDone }) {
  const { update } = useApp()
  const { lang, toggleLang } = useLang()
  const isAr = lang === 'ar'

  const [step, setStep]   = useState(0)
  const [name, setName]   = useState('')
  const [nameErr, setNameErr] = useState(false)

  // Profile state
  const [goalArea, setGoalArea]       = useState(null)
  const [challenge, setChallenge]     = useState(null)
  const [timePerDay, setTimePerDay]   = useState(null)

  const canProceed = () => {
    if (step === 1) return !!goalArea
    if (step === 2) return !!challenge
    if (step === 3) return name.trim().length > 0 && !!timePerDay
    return true
  }

  const next = () => {
    if (step === 3) {
      if (!name.trim()) { setNameErr(true); return }
      if (!timePerDay) return
      // Save profile + name (but NOT onboardingDone yet — wait for last step)
      const focusPath = computeFocusPath({ goalArea })
      const profile = { goalArea, challenge, timePerDay, focusPath }
      update('userName', name.trim())
      update('onboardingProfile', profile)
    }
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1)
    } else {
      // Final step — mark onboarding complete and close
      update('onboardingDone', true)
      onDone()
    }
  }

  const back = () => setStep(s => s - 1)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 480,
          background: '#111',
          borderRadius: '24px 24px 0 0',
          border: '1px solid #222',
          padding: '28px 24px 40px',
          direction: isAr ? 'rtl' : 'ltr',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6,
              borderRadius: 3,
              background: i === step ? '#c9a84c' : i < step ? '#c9a84c55' : '#2a2a2a',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 10 }}>
              {isAr ? 'مرحباً بك في رحلة التحول' : 'Welcome to Your Transformation'}
            </h2>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, marginBottom: 24 }}>
              {isAr
                ? 'هذا التطبيق مبني على منهج توني روبنز لمساعدتك على بناء حياة استثنائية خطوة بخطوة'
                : 'This app is built on Tony Robbins\' methodology to help you build an extraordinary life step by step'}
            </p>
            {/* Lang toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              {['ar', 'en'].map(l => (
                <button key={l}
                  onClick={() => l !== lang && toggleLang()}
                  style={{
                    padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: lang === l ? 'rgba(201,168,76,0.15)' : '#1a1a1a',
                    border: `1px solid ${lang === l ? 'rgba(201,168,76,0.5)' : '#2a2a2a'}`,
                    color: lang === l ? '#c9a84c' : '#666',
                    cursor: 'pointer',
                  }}
                >
                  {l === 'ar' ? '🇸🇦 العربية' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Goal Area ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
              {isAr ? '🎯 ما أهم مجال تريد تطويره؟' : '🎯 What area matters most to you?'}
            </h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              {isAr ? 'سنخصص تجربتك بناءً على اختيارك' : 'We\'ll personalize your experience based on this'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {GOAL_AREAS.map(area => (
                <button key={area.key}
                  onClick={() => setGoalArea(area.key)}
                  style={{
                    padding: '16px 12px', borderRadius: 14,
                    background: goalArea === area.key ? 'rgba(201,168,76,0.12)' : '#1a1a1a',
                    border: `2px solid ${goalArea === area.key ? '#c9a84c' : '#2a2a2a'}`,
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{area.emoji}</div>
                  <p style={{
                    fontSize: 13, fontWeight: 700,
                    color: goalArea === area.key ? '#c9a84c' : '#aaa',
                  }}>
                    {isAr ? area.labelAr : area.labelEn}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Biggest Challenge ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
              {isAr ? '🔥 ما أكبر تحدٍ يواجهك؟' : '🔥 What\'s your biggest challenge?'}
            </h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              {isAr ? 'هذا يساعدنا نرشدك للأدوات المناسبة' : 'This helps us guide you to the right tools'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CHALLENGES.map(ch => (
                <button key={ch.key}
                  onClick={() => setChallenge(ch.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 14,
                    background: challenge === ch.key ? 'rgba(201,168,76,0.12)' : '#1a1a1a',
                    border: `2px solid ${challenge === ch.key ? '#c9a84c' : '#2a2a2a'}`,
                    cursor: 'pointer',
                    textAlign: isAr ? 'right' : 'left',
                    transition: 'all 0.2s ease',
                  }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: challenge === ch.key ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>
                    {ch.emoji}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: challenge === ch.key ? '#c9a84c' : '#ddd' }}>
                      {isAr ? ch.labelAr : ch.labelEn}
                    </p>
                    <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                      {isAr ? ch.descAr : ch.descEn}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Name + Time ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
              {isAr ? '👤 أخبرنا عن نفسك' : '👤 Tell Us About You'}
            </h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              {isAr ? 'سيُستخدم اسمك في تجربتك الشخصية' : 'Your name personalizes your experience'}
            </p>

            {/* Name input */}
            <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 600 }}>
              {isAr ? 'اسمك' : 'Your Name'}
            </label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setNameErr(false) }}
              placeholder={isAr ? 'اكتب اسمك هنا...' : 'Enter your name...'}
              autoFocus
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: 12, fontSize: 16,
                background: '#1a1a1a',
                border: `1px solid ${nameErr ? '#e74c3c' : '#2a2a2a'}`,
                color: '#fff', outline: 'none',
                textAlign: isAr ? 'right' : 'left',
                boxSizing: 'border-box',
              }}
            />
            {nameErr && (
              <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 6 }}>
                {isAr ? 'الاسم مطلوب' : 'Name is required'}
              </p>
            )}

            {/* Time per day */}
            <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 8, marginTop: 20, fontWeight: 600 }}>
              {isAr ? '⏱ كم وقت يمكنك تخصيصه يومياً؟' : '⏱ How much time can you dedicate daily?'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TIME_OPTIONS.map(t => (
                <button key={t.key}
                  onClick={() => setTimePerDay(t.key)}
                  style={{
                    padding: '12px 10px', borderRadius: 12, textAlign: 'center',
                    background: timePerDay === t.key ? 'rgba(201,168,76,0.12)' : '#1a1a1a',
                    border: `2px solid ${timePerDay === t.key ? '#c9a84c' : '#2a2a2a'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{t.emoji}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: timePerDay === t.key ? '#c9a84c' : '#ddd' }}>
                    {isAr ? t.labelAr : t.labelEn}
                  </p>
                  <p style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                    {isAr ? t.descAr : t.descEn}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Features overview ── */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
              {isAr ? '🗺 كيف يعمل التطبيق' : '🗺 How It Works'}
            </h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
              {isAr ? 'كل شيء في مكانه — ابدأ بيومك وتوسّع شيئاً فشيئاً' : 'Everything in its place — start with your day and expand gradually'}
            </p>
            <p style={{ fontSize: 11, color: '#555', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              {isAr ? '🔓 يُفتح تدريجياً مع تقدمك' : '🔓 Unlocks gradually as you progress'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FEATURES.map((f, i) => {
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: '#1a1a1a', borderRadius: 14,
                    padding: '12px 14px',
                    border: '1px solid #252525',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: `${f.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      {f.emoji}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                        {isAr ? f.labelAr : f.labelEn}
                      </p>
                      <p style={{ fontSize: 11, color: '#666' }}>
                        {isAr ? f.descAr : f.descEn}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 0 && (
            <button onClick={back} style={{
              padding: '13px 18px', borderRadius: 14, fontSize: 14, fontWeight: 700,
              background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
          <button
            onClick={next}
            disabled={!canProceed()}
            style={{
              flex: 1, padding: '14px 20px', borderRadius: 14, fontSize: 15, fontWeight: 900,
              background: canProceed()
                ? 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)'
                : '#2a2a2a',
              color: canProceed() ? '#0a0a0a' : '#555',
              border: 'none', cursor: canProceed() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.3s ease',
              opacity: canProceed() ? 1 : 0.6,
            }}>
            {step === 4
              ? (isAr ? 'ابدأ رحلتك ⚡' : 'Start Your Journey ⚡')
              : step === 3
                ? (isAr ? 'التالي ←' : 'Next →')
                : step === 0
                  ? (isAr ? 'هيّا نبدأ ←' : 'Let\'s Go →')
                  : (isAr ? 'التالي ←' : 'Next →')}
          </button>
        </div>
      </div>
    </div>
  )
}
