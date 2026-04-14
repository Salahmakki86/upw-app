import { useState, useEffect, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

export default function IdentityReinforcement() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const [message, setMessage] = useState(null)
  const [show, setShow] = useState(false)

  // Get identity label
  const profile = state.identityProfile || state.onboardingProfile || {}
  const target = profile.identity || profile.targetIdentity || profile.target || profile.goalArea || ''

  // Map to label
  const identityLabel = useMemo(() => {
    const t = (target || '').toLowerCase()
    if (t.includes('قائد') || t.includes('leader')) return isAr ? 'القائد الواثق' : 'The Confident Leader'
    if (t.includes('رائد') || t.includes('entrepreneur') || t.includes('business')) return isAr ? 'رائد الأعمال الناجح' : 'The Successful Entrepreneur'
    if (t.includes('صحة') || t.includes('health') || t.includes('energy')) return isAr ? 'الشخص الصحي' : 'The Healthy Person'
    if (t.includes('mindset') || t.includes('عقلية')) return isAr ? 'المفكر القوي' : 'The Powerful Thinker'
    if (t.includes('balance') || t.includes('توازن')) return isAr ? 'الشخص المتوازن' : 'The Balanced Person'
    if (t.includes('career') || t.includes('مهنة')) return isAr ? 'المحترف المتميز' : 'The Outstanding Professional'
    if (t.includes('relationship') || t.includes('علاقات')) return isAr ? 'الشخص المحب' : 'The Loving Person'
    if (t.includes('finances') || t.includes('مالية')) return isAr ? 'المستثمر الذكي' : 'The Smart Investor'
    return isAr ? 'النسخة الأفضل منك' : 'Your Best Self'
  }, [target, isAr])

  // Only trigger once per session per message
  const triggeredRef = useRef(new Set())

  function triggerMessage(msg) {
    if (triggeredRef.current.has(msg)) return
    triggeredRef.current.add(msg)
    setMessage(msg)
    setShow(true)
    setTimeout(() => setShow(false), 3000)
    setTimeout(() => setMessage(null), 3500)
  }

  // Track completed tasks to trigger reinforcement
  useEffect(() => {
    if (state.morningDone) {
      triggerMessage(isAr ? `هذا ما يفعله ${identityLabel} كل صباح ⚡` : `This is what ${identityLabel} does every morning ⚡`)
    }
  }, [state.morningDone])

  useEffect(() => {
    if (state.todayState) {
      triggerMessage(isAr ? `${identityLabel} يعرف حالته دائما 🪞` : `${identityLabel} always knows their state 🪞`)
    }
  }, [state.todayState])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const gratitudeToday = (state.gratitude?.[today] || []).filter(Boolean).length
    if (gratitudeToday >= 3) {
      triggerMessage(isAr ? `${identityLabel} يرى النعم في كل شيء 🙏` : `${identityLabel} sees blessings everywhere 🙏`)
    }
  }, [state.gratitude])

  useEffect(() => {
    if (state.eveningDone) {
      triggerMessage(isAr ? `${identityLabel} يراجع يومه دائما 🌙` : `${identityLabel} always reviews their day 🌙`)
    }
  }, [state.eveningDone])

  if (!message || !identityLabel) return null

  return (
    <div style={{
      position: 'fixed',
      top: show ? 12 : -80,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      transition: 'top 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(147,112,219,0.1))',
      border: '1px solid rgba(201,168,76,0.3)',
      borderRadius: 16,
      padding: '12px 20px',
      backdropFilter: 'blur(12px)',
      maxWidth: 'calc(100vw - 32px)',
    }}>
      <p style={{
        color: '#c9a84c',
        fontSize: 13,
        fontWeight: 700,
        textAlign: 'center',
        margin: 0,
      }}>
        {message}
      </p>
    </div>
  )
}
