import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const STEPS = [
  {
    emoji: '⚡',
    titleAr: 'مرحباً بك في رحلة التحول',
    titleEn: 'Welcome to Your Transformation',
    descAr: 'هذا التطبيق مبني على منهج توني روبنز لمساعدتك على بناء حياة استثنائية خطوة بخطوة',
    descEn: 'This app is built on Tony Robbins\' methodology to help you build an extraordinary life step by step',
  },
  {
    emoji: null,
    titleAr: 'أخبرنا عن نفسك',
    titleEn: 'Tell us about you',
    descAr: '',
    descEn: '',
  },
  {
    emoji: null,
    titleAr: 'كيف يعمل التطبيق',
    titleEn: 'How the app works',
    descAr: '',
    descEn: '',
  },
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

  const next = () => {
    if (step === 1) {
      if (!name.trim()) { setNameErr(true); return }
      update('userName', name.trim())
      update('onboardingDone', true)
    }
    if (step < 2) { setStep(s => s + 1) }
    else { onDone() }
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
        }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {STEPS.map((_, i) => (
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
              {isAr ? STEPS[0].titleAr : STEPS[0].titleEn}
            </h2>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, marginBottom: 24 }}>
              {isAr ? STEPS[0].descAr : STEPS[0].descEn}
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

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
              {isAr ? '👤 أخبرنا عن نفسك' : '👤 Tell Us About You'}
            </h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              {isAr ? 'سيُستخدم اسمك في تجربتك الشخصية' : 'Your name personalizes your experience'}
            </p>
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
          </div>
        )}

        {/* ── Step 2: Features overview ── */}
        {step === 2 && (
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
          <button onClick={next} style={{
            flex: 1, padding: '14px 20px', borderRadius: 14, fontSize: 15, fontWeight: 900,
            background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)',
            color: '#0a0a0a', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {step === 2
              ? (isAr ? 'ابدأ رحلتك ⚡' : 'Start Your Journey ⚡')
              : step === 1
                ? (isAr ? 'التالي ←' : 'Next →')
                : (isAr ? 'هيّا نبدأ ←' : 'Let\'s Go →')}
          </button>
        </div>
      </div>
    </div>
  )
}
