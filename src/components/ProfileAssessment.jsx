/**
 * ProfileAssessment — Quick assessment for existing users
 * Shows ONLY for users who completed old onboarding but don't have a profile yet.
 * Does NOT touch any existing data — only adds onboardingProfile.
 */
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { computeFocusPath } from '../utils/adaptivePath'

const GOAL_AREAS = [
  { key: 'health',        emoji: '💪', labelAr: 'الصحة والطاقة',     labelEn: 'Health & Energy' },
  { key: 'career',        emoji: '🚀', labelAr: 'المسار المهني',     labelEn: 'Career Growth' },
  { key: 'finances',      emoji: '💰', labelAr: 'الحرية المالية',    labelEn: 'Financial Freedom' },
  { key: 'relationships', emoji: '❤️', labelAr: 'العلاقات',          labelEn: 'Relationships' },
  { key: 'mindset',       emoji: '🧠', labelAr: 'العقلية والمعتقدات', labelEn: 'Mindset & Beliefs' },
  { key: 'energy',        emoji: '⚡', labelAr: 'الطاقة والحيوية',   labelEn: 'Energy & Vitality' },
]

const CHALLENGES = [
  { key: 'consistency', emoji: '🔄', labelAr: 'الاستمرارية',    labelEn: 'Staying Consistent',  descAr: 'أبدأ بحماس ثم أتوقف',       descEn: 'I start strong then lose momentum' },
  { key: 'clarity',     emoji: '🎯', labelAr: 'الوضوح',        labelEn: 'Finding Clarity',     descAr: 'لا أعرف ماذا أريد بالضبط',   descEn: "I don't know exactly what I want" },
  { key: 'motivation',  emoji: '🔥', labelAr: 'التحفيز',       labelEn: 'Staying Motivated',   descAr: 'أفقد الحماس بسرعة',          descEn: 'I lose motivation quickly' },
  { key: 'overwhelm',   emoji: '🌊', labelAr: 'الضغط والتشتت', labelEn: 'Feeling Overwhelmed', descAr: 'كثرة المهام تشتتني',         descEn: 'Too many things pulling my attention' },
  { key: 'time',        emoji: '⏰', labelAr: 'ضيق الوقت',     labelEn: 'Not Enough Time',     descAr: 'يومي مزدحم جداً',             descEn: 'My days are packed' },
]

const TIME_OPTIONS = [
  { key: '5',  emoji: '⚡', labelAr: '٥ دقائق',  labelEn: '5 minutes',  descAr: 'سريع ومؤثر',         descEn: 'Quick & impactful' },
  { key: '15', emoji: '🎯', labelAr: '١٥ دقيقة', labelEn: '15 minutes', descAr: 'مثالي للروتين',       descEn: 'Perfect for routines' },
  { key: '30', emoji: '🔥', labelAr: '٣٠ دقيقة', labelEn: '30 minutes', descAr: 'تحوّل حقيقي',         descEn: 'Real transformation' },
  { key: '60', emoji: '💎', labelAr: 'ساعة+',    labelEn: '1 hour+',    descAr: 'أنا ملتزم بالكامل',   descEn: "I'm fully committed" },
]

export default function ProfileAssessment() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const [step, setStep] = useState(0)  // 0=goal, 1=challenge, 2=time
  const [goalArea, setGoalArea] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [timePerDay, setTimePerDay] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  // Don't show if profile already exists OR user dismissed
  if (dismissed || state.onboardingProfile?.goalArea) return null

  const TOTAL = 3

  const canProceed = () => {
    if (step === 0) return !!goalArea
    if (step === 1) return !!challenge
    if (step === 2) return !!timePerDay
    return true
  }

  const next = () => {
    if (step < TOTAL - 1) {
      setStep(s => s + 1)
    } else {
      // Save profile
      const focusPath = computeFocusPath({ goalArea })
      update('onboardingProfile', { goalArea, challenge, timePerDay, focusPath })
    }
  }

  const back = () => { if (step > 0) setStep(s => s - 1) }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#111',
        borderRadius: '24px 24px 0 0',
        border: '1px solid #222',
        padding: '24px 24px 36px',
        direction: isAr ? 'rtl' : 'ltr',
        maxHeight: '85vh',
        overflowY: 'auto',
      }}>
        {/* Header + Skip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: TOTAL }, (_, i) => (
              <div key={i} style={{
                width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                background: i === step ? '#c9a84c' : i < step ? '#c9a84c55' : '#2a2a2a',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
          <button onClick={() => setDismissed(true)} style={{
            background: 'none', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer',
            fontWeight: 600, padding: '4px 8px',
          }}>
            {isAr ? 'تخطي ←' : 'Skip →'}
          </button>
        </div>

        {/* Intro text */}
        <div style={{
          background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 20,
        }}>
          <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 700 }}>
            ✨ {isAr ? 'ميزة جديدة! أجب على ٣ أسئلة سريعة لنخصص تجربتك' : 'New! Answer 3 quick questions to personalize your experience'}
          </p>
          <p style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            {isAr ? 'بياناتك وأهدافك لن تتأثر — هذا فقط لتحسين المقترحات' : 'Your data and goals stay intact — this only improves recommendations'}
          </p>
        </div>

        {/* Step 0: Goal Area */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 16 }}>
              {isAr ? '🎯 ما أهم مجال تريد تطويره؟' : '🎯 What area matters most?'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {GOAL_AREAS.map(a => (
                <button key={a.key} onClick={() => setGoalArea(a.key)} style={{
                  padding: '14px 10px', borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                  background: goalArea === a.key ? 'rgba(201,168,76,0.12)' : '#1a1a1a',
                  border: `2px solid ${goalArea === a.key ? '#c9a84c' : '#2a2a2a'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{a.emoji}</div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: goalArea === a.key ? '#c9a84c' : '#aaa' }}>
                    {isAr ? a.labelAr : a.labelEn}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Challenge */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 16 }}>
              {isAr ? '🔥 ما أكبر تحدٍ يواجهك؟' : "🔥 What's your biggest challenge?"}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CHALLENGES.map(c => (
                <button key={c.key} onClick={() => setChallenge(c.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                  background: challenge === c.key ? 'rgba(201,168,76,0.12)' : '#1a1a1a',
                  border: `2px solid ${challenge === c.key ? '#c9a84c' : '#2a2a2a'}`,
                  textAlign: isAr ? 'right' : 'left', transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0, fontSize: 18,
                    background: challenge === c.key ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{c.emoji}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: challenge === c.key ? '#c9a84c' : '#ddd' }}>
                      {isAr ? c.labelAr : c.labelEn}
                    </p>
                    <p style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{isAr ? c.descAr : c.descEn}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Time */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 16 }}>
              {isAr ? '⏱ كم وقت يمكنك تخصيصه يومياً؟' : '⏱ How much time daily?'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TIME_OPTIONS.map(t => (
                <button key={t.key} onClick={() => setTimePerDay(t.key)} style={{
                  padding: '14px 10px', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                  background: timePerDay === t.key ? 'rgba(201,168,76,0.12)' : '#1a1a1a',
                  border: `2px solid ${timePerDay === t.key ? '#c9a84c' : '#2a2a2a'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{t.emoji}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: timePerDay === t.key ? '#c9a84c' : '#ddd' }}>
                    {isAr ? t.labelAr : t.labelEn}
                  </p>
                  <p style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{isAr ? t.descAr : t.descEn}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          {step > 0 && (
            <button onClick={back} style={{
              padding: '12px 16px', borderRadius: 14, fontSize: 14, fontWeight: 700,
              background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}>
              {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
          <button onClick={next} disabled={!canProceed()} style={{
            flex: 1, padding: '13px 20px', borderRadius: 14, fontSize: 14, fontWeight: 900,
            background: canProceed() ? 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)' : '#2a2a2a',
            color: canProceed() ? '#0a0a0a' : '#555',
            border: 'none', cursor: canProceed() ? 'pointer' : 'default',
            opacity: canProceed() ? 1 : 0.6, transition: 'all 0.3s',
          }}>
            {step === 2
              ? (isAr ? '✨ خصّص تجربتي' : '✨ Personalize')
              : (isAr ? 'التالي ←' : 'Next →')}
          </button>
        </div>
      </div>
    </div>
  )
}
