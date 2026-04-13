/**
 * Fix #20 — First-Time "Wow Moment" Experience
 * A beautiful, immersive intro that shows the user they're in the right place.
 * Shows ONCE on the very first visit after onboarding.
 * Goal: Create emotional impact in the first 5 minutes.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

const STEPS = [
  {
    emoji: '🔥',
    titleAr: 'مرحباً في رحلة التحول',
    titleEn: 'Welcome to Your Transformation',
    textAr: 'هذا ليس تطبيقاً عادياً — هذا مختبر شخصي لبناء حياة استثنائية.\nمصمم على منهج توني روبنز.',
    textEn: 'This isn\'t just an app — it\'s a personal lab for building an extraordinary life.\nDesigned on Tony Robbins\' methodology.',
    bg: 'linear-gradient(180deg, #090909, #1a0f00)',
    color: '#c9a84c',
  },
  {
    emoji: '☀️',
    titleAr: 'طقسك الصباحي يغير كل شيء',
    titleEn: 'Your Morning Ritual Changes Everything',
    textAr: 'في ١٠ دقائق كل صباح — تنفس، امتنان، تخيّل — ستشعر بفرق حقيقي من أول يوم.',
    textEn: 'In 10 minutes each morning — breathe, gratitude, visualize — you\'ll feel a real difference from day one.',
    bg: 'linear-gradient(180deg, #090909, #0a1520)',
    color: '#3498db',
  },
  {
    emoji: '📈',
    titleAr: 'كلما تقدمت، فتحنا لك أدوات جديدة',
    titleEn: 'As You Progress, New Tools Unlock',
    textAr: 'بدأنا بالأساسيات. كل صباح تكمله يفتح لك أدوات أقوى — أهداف، معتقدات، برامج متقدمة.',
    textEn: 'We start with the essentials. Each morning you complete unlocks more powerful tools — goals, beliefs, advanced programs.',
    bg: 'linear-gradient(180deg, #090909, #100a18)',
    color: '#9b59b6',
  },
  {
    emoji: '💎',
    titleAr: 'أنت على بعد قرار واحد',
    titleEn: 'You\'re One Decision Away',
    textAr: '"ليست ظروفك من تحدد مصيرك — بل قراراتك."\n— توني روبنز\n\nقرارك الأول: أكمل الروتين الصباحي الآن.',
    textEn: '"It\'s not your conditions but your decisions that shape your destiny."\n— Tony Robbins\n\nYour first decision: Complete the morning ritual now.',
    bg: 'linear-gradient(180deg, #090909, #1a1200)',
    color: '#c9a84c',
  },
]

export default function WelcomeExperience() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const [step, setStep] = useState(0)
  const [show, setShow] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  // Only show if onboarding done but welcome not seen yet
  const shouldShow = state.onboardingDone && !state.welcomeExperienceSeen

  useEffect(() => {
    if (shouldShow) {
      requestAnimationFrame(() => setShow(true))
    }
  }, [shouldShow])

  if (!shouldShow) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const goNext = () => {
    if (isLast) {
      // Dismiss and go to morning ritual
      setShow(false)
      setTimeout(() => {
        update('welcomeExperienceSeen', true)
        navigate('/morning')
      }, 400)
      return
    }
    setTransitioning(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setTransitioning(false)
    }, 300)
  }

  const skip = () => {
    setShow(false)
    setTimeout(() => {
      update('welcomeExperienceSeen', true)
    }, 400)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: current.bg,
        opacity: show ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Skip button */}
      <button
        onClick={skip}
        style={{
          position: 'absolute',
          top: 56,
          [isAr ? 'left' : 'right']: 20,
          fontSize: 12,
          fontWeight: 600,
          color: '#555',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 12px',
        }}
      >
        {isAr ? 'تخطي' : 'Skip'}
      </button>

      {/* Step dots */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 6,
      }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 20 : 6,
              height: 6,
              borderRadius: 99,
              background: i === step ? current.color : '#333',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 340,
          padding: '0 24px',
          textAlign: 'center',
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(20px)' : 'translateY(0)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Emoji */}
        <div style={{
          fontSize: 64,
          marginBottom: 24,
          animation: 'breath 2.5s ease-in-out infinite alternate',
        }}>
          {current.emoji}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 900,
          color: '#fff',
          marginBottom: 16,
          lineHeight: 1.3,
        }}>
          {isAr ? current.titleAr : current.titleEn}
        </h1>

        {/* Text */}
        <p style={{
          fontSize: 14,
          color: '#aaa',
          lineHeight: 1.7,
          whiteSpace: 'pre-line',
          marginBottom: 40,
        }}>
          {isAr ? current.textAr : current.textEn}
        </p>

        {/* CTA Button */}
        <button
          onClick={goNext}
          className="active:scale-95 transition-all"
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 16,
            background: `linear-gradient(135deg, ${current.color}cc, ${current.color})`,
            color: '#090909',
            fontSize: 15,
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 4px 24px ${current.color}40`,
          }}
        >
          {isLast
            ? (isAr ? 'ابدأ الروتين الصباحي 🔥' : 'Start Morning Ritual 🔥')
            : (isAr ? 'التالي →' : 'Next →')}
        </button>
      </div>

      {/* Bottom glow */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 300,
        height: 200,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${current.color}15, transparent)`,
        pointerEvents: 'none',
      }} />
    </div>
  )
}
