/**
 * TriadReset — TR6 60-second state change
 *
 * Tony Robbins' Triad = Physiology + Focus + Language.
 * A one-tap fullscreen overlay that walks the user through a 60-second reset:
 *   1) Physiology (15s)  — change your body (stand, breathe, smile, move)
 *   2) Focus (15s)       — change what you focus on (3 gratitudes)
 *   3) Language (15s)    — change how you speak to yourself (incantation)
 *   4) Log before/after state  (15s)
 *
 * Invoked via a floating button placed in Layout.jsx OR from any page.
 */
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

const STEPS_AR = [
  { phase: 'physiology', emoji: '💪', label: 'الجسد',  instruction: 'قف. ارفع رأسك. تنفس بعمق ٣ مرات. ابتسم. حرّك جسدك.', seconds: 15 },
  { phase: 'focus',      emoji: '🎯', label: 'التركيز', instruction: 'استحضر ٣ أشياء ممتن لها الآن. اشعر بها بكل جسدك.',   seconds: 15 },
  { phase: 'language',   emoji: '🗣', label: 'اللغة',  instruction: 'قل بصوت عالٍ: "أنا قوي. أنا قادر. لحظة بلحظة أختار حالتي."', seconds: 15 },
]
const STEPS_EN = [
  { phase: 'physiology', emoji: '💪', label: 'Body',     instruction: 'Stand. Raise your head. Deep breath × 3. Smile. Move.',              seconds: 15 },
  { phase: 'focus',      emoji: '🎯', label: 'Focus',    instruction: 'Call up 3 things you are grateful for. Feel them in your body.',      seconds: 15 },
  { phase: 'language',   emoji: '🗣', label: 'Language', instruction: 'Say aloud: "I am strong. I am capable. Moment by moment, I choose my state."', seconds: 15 },
]

export default function TriadReset({ open, onClose }) {
  const { logTriadReset } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const steps = isAr ? STEPS_AR : STEPS_EN

  const [stepIndex, setStepIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(steps[0].seconds)
  const [beforeState, setBeforeState] = useState(null)
  const [afterState, setAfterState] = useState(null)
  const [phase, setPhase] = useState('pre')  // pre → running → post → done
  const tickRef = useRef(null)

  useEffect(() => {
    if (!open) return
    // Reset on open
    setStepIndex(0)
    setTimeLeft(steps[0].seconds)
    setBeforeState(null)
    setAfterState(null)
    setPhase('pre')
    return () => clearInterval(tickRef.current)
  }, [open])

  useEffect(() => {
    if (phase !== 'running') { clearInterval(tickRef.current); return }
    clearInterval(tickRef.current)
    tickRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Advance step or go to post
          setStepIndex(i => {
            const next = i + 1
            if (next >= steps.length) { setPhase('post'); return i }
            setTimeLeft(steps[next].seconds)
            return next
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [phase, steps])

  if (!open) return null
  const current = steps[stepIndex]
  const progressPct = phase === 'running'
    ? Math.round((((stepIndex) * current.seconds + (current.seconds - timeLeft)) / (steps.reduce((s,x)=>s+x.seconds,0))) * 100)
    : phase === 'post' ? 100 : 0

  const start = () => {
    setPhase('running')
    setStepIndex(0)
    setTimeLeft(steps[0].seconds)
  }

  const finalize = () => {
    logTriadReset({
      beforeState: beforeState ?? null,
      afterState: afterState ?? null,
      duration: steps.reduce((s, x) => s + x.seconds, 0),
    })
    showToast(isAr ? '🔥 أنت في حالة جديدة' : '🔥 You are in a new state', 'success', 2000)
    setPhase('done')
    setTimeout(onClose, 600)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'إعادة ضبط الحالة' : 'Triad Reset'}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget && phase !== 'running') onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 440, background: '#0a0a0a',
        border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: 22,
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          style={{
            position: 'absolute', top: 16, right: 16, fontSize: 20,
            background: 'transparent', border: 'none', color: '#888', cursor: 'pointer',
          }}
        >×</button>

        {/* PRE: rate before state */}
        {phase === 'pre' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#c9a84c', marginBottom: 4, textAlign: 'center' }}>
              {isAr ? '🔁 إعادة ضبط الحالة' : '🔁 Triad Reset'}
            </h2>
            <p style={{ fontSize: 11, color: '#888', textAlign: 'center', marginBottom: 20 }}>
              {isAr ? '60 ثانية لتغيير حالتك — جسد، تركيز، لغة' : '60 seconds to change your state — body, focus, language'}
            </p>
            <div style={{ fontSize: 12, color: '#ddd', marginBottom: 10, textAlign: 'center', fontWeight: 700 }}>
              {isAr ? 'حالتك الآن (1-10)؟' : 'Your state now (1-10)?'}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setBeforeState(n)}
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: beforeState === n ? 'rgba(201,168,76,0.25)' : '#1a1a1a',
                    border: `1px solid ${beforeState === n ? '#c9a84c' : '#2a2a2a'}`,
                    color: beforeState === n ? '#c9a84c' : '#888',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer',
                  }}
                >{n}</button>
              ))}
            </div>
            <button
              disabled={beforeState == null}
              onClick={start}
              className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.97]"
              style={{
                background: beforeState == null ? '#1a1a1a' : 'rgba(201,168,76,0.15)',
                border: `1px solid ${beforeState == null ? '#2a2a2a' : 'rgba(201,168,76,0.4)'}`,
                color: beforeState == null ? '#555' : '#c9a84c',
                cursor: beforeState == null ? 'not-allowed' : 'pointer',
              }}
            >
              {isAr ? 'ابدأ الآن' : 'Start Now'}
            </button>
          </>
        )}

        {/* RUNNING: guided step */}
        {phase === 'running' && (
          <>
            {/* progress */}
            <div style={{
              height: 4, background: '#1a1a1a', borderRadius: 2, marginBottom: 20, overflow: 'hidden',
            }}>
              <div style={{
                width: `${progressPct}%`, height: '100%',
                background: 'linear-gradient(90deg, #c9a84c, #e5c670)', transition: 'width 0.5s',
              }}/>
            </div>

            {/* step indicator */}
            <div style={{
              display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16,
            }}>
              {steps.map((s, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i === stepIndex ? 'rgba(201,168,76,0.25)'
                    : i < stepIndex ? 'rgba(46,204,113,0.15)' : '#1a1a1a',
                  border: `1px solid ${i === stepIndex ? '#c9a84c' : i < stepIndex ? 'rgba(46,204,113,0.4)' : '#2a2a2a'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                }}>
                  {i < stepIndex ? '✓' : s.emoji}
                </div>
              ))}
            </div>

            {/* phase title */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 48, lineHeight: 1 }}>{current.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#c9a84c', marginTop: 8 }}>
                {current.label}
              </div>
            </div>

            {/* instruction */}
            <p style={{
              fontSize: 16, color: '#eee', textAlign: 'center',
              lineHeight: 1.6, margin: '16px 0 20px', fontWeight: 700,
            }}>
              {current.instruction}
            </p>

            {/* countdown */}
            <div style={{
              width: 84, height: 84, borderRadius: '50%', margin: '0 auto',
              background: `conic-gradient(#c9a84c ${((current.seconds - timeLeft) / current.seconds) * 360}deg, #1a1a1a 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900, color: '#c9a84c', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 6, borderRadius: '50%', background: '#0a0a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{timeLeft}</div>
            </div>
          </>
        )}

        {/* POST: rate after state */}
        {phase === 'post' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 40 }}>🎉</div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#2ecc71', marginTop: 8 }}>
                {isAr ? 'أحسنت!' : 'Excellent!'}
              </h2>
            </div>
            <p style={{ fontSize: 12, color: '#ddd', marginBottom: 14, textAlign: 'center', fontWeight: 700 }}>
              {isAr ? 'حالتك الآن (1-10)؟' : 'Your state now (1-10)?'}
            </p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setAfterState(n)}
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: afterState === n ? 'rgba(46,204,113,0.25)' : '#1a1a1a',
                    border: `1px solid ${afterState === n ? '#2ecc71' : '#2a2a2a'}`,
                    color: afterState === n ? '#2ecc71' : '#888',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer',
                  }}
                >{n}</button>
              ))}
            </div>
            {beforeState && afterState && (
              <p style={{ textAlign: 'center', fontSize: 11, color: '#2ecc71', marginBottom: 14 }}>
                {isAr
                  ? `ارتفعت حالتك من ${beforeState} إلى ${afterState} (+${afterState - beforeState})`
                  : `Your state went from ${beforeState} to ${afterState} (+${afterState - beforeState})`}
              </p>
            )}
            <button
              onClick={finalize}
              disabled={afterState == null}
              className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.97]"
              style={{
                background: afterState == null ? '#1a1a1a' : 'rgba(46,204,113,0.15)',
                border: `1px solid ${afterState == null ? '#2a2a2a' : 'rgba(46,204,113,0.4)'}`,
                color: afterState == null ? '#555' : '#2ecc71',
                cursor: afterState == null ? 'not-allowed' : 'pointer',
              }}
            >
              {isAr ? 'احفظ الجلسة' : 'Save Session'}
            </button>
          </>
        )}

        {phase === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48 }}>🔥</div>
            <p style={{ fontSize: 14, color: '#c9a84c', fontWeight: 800, marginTop: 8 }}>
              {isAr ? 'حالة جديدة تماماً' : 'Brand new state'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
