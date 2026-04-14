/**
 * #8 — Breakthrough Milestone Celebration Modal
 * Full celebration page with confetti, animated counter,
 * reflection prompt, and share functionality
 */
import { useEffect, useState, useRef, useMemo } from 'react'

// TODO: celebration sound — add audio playback here when ready

/* ── CSS-only confetti particles ────────────────────────── */
const CONFETTI_COLORS = ['#c9a84c', '#9b59b6', '#ffffff', '#e67e22', '#f1c40f', '#2ecc71']
const PARTICLE_COUNT = 22

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,            // % from left
    size: 4 + Math.random() * 6,          // px
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 2.5,           // seconds
    duration: 2 + Math.random() * 2,      // seconds
    rotation: Math.random() * 360,
    drift: -30 + Math.random() * 60,      // horizontal drift px
    shape: i % 3,                          // 0=square, 1=circle, 2=rectangle
  }))
}

const confettiKeyframes = `
@keyframes confettiFall {
  0%   { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateY(calc(100vh + 20px)) translateX(var(--drift)) rotate(720deg); opacity: 0; }
}
@keyframes counterPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.12); }
}
@keyframes breath {
  0%   { transform: scale(1); }
  100% { transform: scale(1.08); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`

/* ── Helper: extract streak number from milestone id ───── */
function getStreakNumber(milestone) {
  if (!milestone?.id) return null
  const match = milestone.id.match(/^streak_(\d+)$/)
  return match ? parseInt(match[1], 10) : null
}

export default function MilestoneModal({ milestone, onClose, lang, onSaveReflection }) {
  const [show, setShow] = useState(false)
  const [reflectionText, setReflectionText] = useState('')
  const [reflectionSaved, setReflectionSaved] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const [counter, setCounter] = useState(0)
  const intervalRef = useRef(null)
  const isAr = lang === 'ar'

  const particles = useMemo(() => generateParticles(), [])
  const streakNum = getStreakNumber(milestone)

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
  }, [])

  // Animated counter for streak milestones
  useEffect(() => {
    if (streakNum === null) return
    setCounter(0)
    const step = Math.max(1, Math.floor(streakNum / 40))
    const ms = Math.max(20, Math.floor(1200 / streakNum))
    intervalRef.current = setInterval(() => {
      setCounter(prev => {
        const next = prev + step
        if (next >= streakNum) {
          clearInterval(intervalRef.current)
          return streakNum
        }
        return next
      })
    }, ms)
    return () => clearInterval(intervalRef.current)
  }, [streakNum])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300)
  }

  const handleSaveReflection = () => {
    if (!reflectionText.trim()) return
    onSaveReflection?.(reflectionText.trim())
    setReflectionSaved(true)
  }

  const handleShare = async () => {
    const title = isAr ? milestone.titleAr : milestone.titleEn
    const num = streakNum ? `${streakNum} ` : ''
    const text = isAr
      ? `\u{1F525} لقد حققت ${title}! ${num}يوم من التحول مع UPW Coach`
      : `\u{1F525} I just hit ${title}! ${num}days of transformation with UPW Coach`

    if (navigator.share) {
      try {
        await navigator.share({ text })
        setShareMsg(isAr ? 'تمت المشاركة!' : 'Shared!')
      } catch {
        // user cancelled — ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setShareMsg(isAr ? 'تم النسخ!' : 'Copied!')
      } catch {
        setShareMsg(isAr ? 'فشل النسخ' : 'Copy failed')
      }
    }
    setTimeout(() => setShareMsg(''), 2000)
  }

  if (!milestone) return null

  return (
    <>
      <style>{confettiKeyframes}</style>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(10px)',
          opacity: show ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onClick={handleClose}
      >
        {/* ── Confetti layer ───────────────────────────── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[101]">
          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                top: -12,
                left: `${p.left}%`,
                width: p.shape === 2 ? p.size * 0.5 : p.size,
                height: p.shape === 2 ? p.size * 1.6 : p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === 1 ? '50%' : p.shape === 2 ? '2px' : '1px',
                opacity: 0,
                '--drift': `${p.drift}px`,
                animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          ))}
        </div>

        {/* ── Modal card ──────────────────────────────── */}
        <div
          className="mx-4 w-full max-w-[400px] rounded-3xl p-7 text-center relative overflow-hidden z-[102]"
          style={{
            background: `linear-gradient(160deg, #1a1a1a, ${milestone.color}15)`,
            border: `2px solid ${milestone.color}60`,
            boxShadow: `0 0 80px ${milestone.color}35, inset 0 0 40px ${milestone.color}08`,
            transform: show ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(30px)',
            transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Glow orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${milestone.color}, transparent)` }} />
          <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${milestone.color}, transparent)`, transform: 'translate(30%, 30%)' }} />

          {/* Emoji */}
          <div className="text-7xl mb-3" style={{ animation: 'breath 2s ease-in-out infinite alternate' }}>
            {milestone.emoji}
          </div>

          {/* ── Animated streak counter ──────────────── */}
          {streakNum !== null && (
            <div className="mb-3">
              <span
                className="inline-block text-5xl font-black tabular-nums"
                style={{
                  color: milestone.color,
                  animation: counter === streakNum ? 'counterPulse 0.6s ease' : 'none',
                  textShadow: `0 0 20px ${milestone.color}60`,
                }}
              >
                {counter}
              </span>
              <span className="block text-xs font-medium mt-1" style={{ color: '#999' }}>
                {isAr ? 'يوم متواصل' : 'day streak'}
              </span>
            </div>
          )}

          {/* Title */}
          <h2
            className="text-2xl font-black text-white mb-2"
            style={{
              backgroundImage: `linear-gradient(90deg, #fff, ${milestone.color}, #fff)`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            {isAr ? milestone.titleAr : milestone.titleEn}
          </h2>

          {/* Message */}
          <p className="text-sm leading-relaxed mb-5" style={{ color: '#ccc' }}>
            {isAr ? milestone.msgAr : milestone.msgEn}
          </p>

          {/* Impact statement */}
          <div className="rounded-xl p-3 mb-5" style={{
            background: `${milestone.color}10`, border: `1px solid ${milestone.color}25`,
          }}>
            <p className="text-xs font-bold mb-1" style={{ color: milestone.color }}>
              {isAr ? '\u{1F48E} لماذا هذا مهم؟' : '\u{1F48E} Why this matters:'}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>
              {isAr
                ? 'كل إنجاز يُعيد برمجة هويتك \u2014 أنت لم تعد "تحاول" بل "تعيش" هذه العادة'
                : "Every milestone reprograms your identity \u2014 you're no longer 'trying', you're 'living' this habit"}
            </p>
          </div>

          {/* ── Reflection prompt ─────────────────────── */}
          <div className="rounded-xl p-4 mb-5" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#ddd' }}>
              {isAr ? '\u{1F4DD} ماذا تعلمت؟' : '\u{1F4DD} What did you learn?'}
            </p>
            <p className="text-[11px] mb-3" style={{ color: '#888' }}>
              {isAr
                ? 'اكتب ماذا يعني لك هذا الإنجاز (اختياري)'
                : 'Write what this milestone means to you (optional)'}
            </p>
            {!reflectionSaved ? (
              <>
                <textarea
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  placeholder={isAr ? 'خاطرة سريعة...' : 'A quick reflection...'}
                  rows={3}
                  dir={isAr ? 'rtl' : 'ltr'}
                  className="w-full rounded-lg p-3 text-sm resize-none outline-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${milestone.color}30`,
                    color: '#eee',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = `${milestone.color}80`
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = `${milestone.color}30`
                  }}
                />
                {reflectionText.trim() && (
                  <button
                    onClick={handleSaveReflection}
                    className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                    style={{
                      background: `${milestone.color}25`,
                      color: milestone.color,
                      border: `1px solid ${milestone.color}40`,
                    }}
                  >
                    {isAr ? 'احفظ' : 'Save'}
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2">
                <span style={{ color: '#2ecc71' }}>{'\u2713'}</span>
                <span className="text-xs font-medium" style={{ color: '#2ecc71' }}>
                  {isAr ? 'تم الحفظ!' : 'Saved!'}
                </span>
              </div>
            )}
          </div>

          {/* ── Share button ──────────────────────────── */}
          <button
            onClick={handleShare}
            className="w-full py-2.5 rounded-xl text-xs font-bold mb-3 transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#ccc',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {shareMsg ? (
              <span style={{ color: '#2ecc71' }}>{shareMsg}</span>
            ) : (
              <>
                <span>{'\u{1F4E4}'}</span>
                <span>{isAr ? 'شارك إنجازك' : 'Share your achievement'}</span>
              </>
            )}
          </button>

          {/* ── Continue button ───────────────────────── */}
          <button
            onClick={handleClose}
            className="w-full py-3.5 rounded-2xl font-bold text-base transition-all active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${milestone.color}cc, ${milestone.color})`,
              color: '#090909',
              boxShadow: `0 4px 24px ${milestone.color}50`,
            }}
          >
            {isAr ? 'استمر في العظمة! \u{1F525}' : 'Continue the greatness! \u{1F525}'}
          </button>
        </div>
      </div>
    </>
  )
}
