/**
 * #8 — Breakthrough Milestone Celebration Modal
 * Shows a fullscreen celebration when user hits a major milestone
 */
import { useEffect, useState } from 'react'

export default function MilestoneModal({ milestone, onClose, lang }) {
  const [show, setShow] = useState(false)
  const isAr = lang === 'ar'

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setShow(true))
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300)
  }

  if (!milestone) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
      onClick={handleClose}
    >
      <div
        className="mx-6 w-full max-w-[380px] rounded-3xl p-8 text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, #1a1a1a, ${milestone.color}15)`,
          border: `2px solid ${milestone.color}60`,
          boxShadow: `0 0 60px ${milestone.color}30`,
          transform: show ? 'scale(1)' : 'scale(0.8)',
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${milestone.color}, transparent)` }} />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${milestone.color}, transparent)`, transform: 'translate(30%, 30%)' }} />

        {/* Emoji */}
        <div className="text-7xl mb-4" style={{ animation: 'breath 2s ease-in-out infinite alternate' }}>
          {milestone.emoji}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white mb-2">
          {isAr ? milestone.titleAr : milestone.titleEn}
        </h2>

        {/* Message */}
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#ccc' }}>
          {isAr ? milestone.msgAr : milestone.msgEn}
        </p>

        {/* Continue button */}
        <button
          onClick={handleClose}
          className="w-full py-3.5 rounded-2xl font-bold text-base transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${milestone.color}cc, ${milestone.color})`,
            color: '#090909',
            boxShadow: `0 4px 20px ${milestone.color}40`,
          }}
        >
          {isAr ? 'استمر في العظمة! 🔥' : 'Continue the greatness! 🔥'}
        </button>
      </div>
    </div>
  )
}
