import { useState, useEffect } from 'react'
import { X, MessageCircle, Flame, Zap, Bell, Trophy } from 'lucide-react'
import { upwApi } from '../api/upwApi'
import { useAuth } from '../context/AuthContext'

// ── Type icons / colors ───────────────────────────────────────────────────

const TYPE_CONFIG = {
  motivation: { icon: <Flame size={14} />,   color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.35)'  },
  challenge:  { icon: <Zap size={14} />,     color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.35)'  },
  reminder:   { icon: <Bell size={14} />,    color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)' },
  praise:     { icon: <Trophy size={14} />,  color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.35)'  },
}

const DISMISSED_KEY = 'upw-dismissed-coach-msgs'

function getDismissed() {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]') }
  catch { return [] }
}

function saveDismissed(ids) {
  try { localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids)) }
  catch {}
}

// ── Component ─────────────────────────────────────────────────────────────

export default function CoachMessageBanner() {
  const { currentUser } = useAuth()
  const [messages,  setMessages]  = useState([])   // unread, un-dismissed
  const [index,     setIndex]     = useState(0)
  const [visible,   setVisible]   = useState(false)
  const [animOut,   setAnimOut]   = useState(false)

  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') return

    upwApi.getMessages()
      .then(msgs => {
        const dismissed = getDismissed()
        // Show unread messages that haven't been dismissed locally
        const pending = msgs.filter(m => !m.read_at && !dismissed.includes(m.id))
        if (pending.length > 0) {
          setMessages(pending)
          setIndex(0)
          setVisible(true)
        }
      })
      .catch(() => {})
  }, [currentUser])

  if (!visible || messages.length === 0) return null

  const msg  = messages[index]
  const isLast = index >= messages.length - 1

  // Map body / message field (backend may use either)
  const body = msg.message || msg.body || ''
  // Map type (backend may or may not send it)
  const type = msg.type && TYPE_CONFIG[msg.type] ? msg.type : 'motivation'
  const cfg  = TYPE_CONFIG[type]

  const dismiss = (id) => {
    upwApi.markMessageRead(id).catch(() => {})
    const dismissed = getDismissed()
    if (!dismissed.includes(id)) saveDismissed([...dismissed, id])
  }

  const handleNext = () => {
    dismiss(msg.id)
    if (!isLast) {
      setIndex(i => i + 1)
    } else {
      animateOut()
    }
  }

  const handleDismissAll = () => {
    messages.forEach(m => dismiss(m.id))
    animateOut()
  }

  const animateOut = () => {
    setAnimOut(true)
    setTimeout(() => {
      setVisible(false)
      setAnimOut(false)
    }, 300)
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[150] flex justify-center px-4 pt-3"
      style={{
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: animOut ? 0 : 1,
        transform: animOut ? 'translateY(-12px)' : 'translateY(0)',
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: '#161616',
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${cfg.border}`,
          pointerEvents: 'auto',
          direction: 'rtl',
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {cfg.icon}
            </div>
            <span className="text-xs font-bold" style={{ color: cfg.color }}>رسالة من المدرب</span>
            {messages.length > 1 && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#888' }}
              >
                {index + 1}/{messages.length}
              </span>
            )}
          </div>
          <button
            onClick={handleDismissAll}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#888' }}
          >
            <X size={12} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#e8e8e8', whiteSpace: 'pre-wrap' }}
          >
            {body}
          </p>
          {msg.created_at && (
            <p className="text-xs mt-1.5" style={{ color: '#444' }}>
              {new Date(msg.created_at).toLocaleDateString('ar-EG', {
                day: 'numeric', month: 'short',
              })}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 pb-4">
          {/* Dismiss this one */}
          <button
            onClick={handleNext}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)',
              color: '#0a0a0a',
            }}
          >
            {isLast ? 'شكراً ✓' : 'التالي →'}
          </button>
          {/* Dismiss all shortcut when > 1 */}
          {messages.length > 1 && !isLast && (
            <button
              onClick={handleDismissAll}
              className="rounded-xl px-3 py-2.5 text-xs transition-all active:scale-95"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#555' }}
            >
              تجاهل الكل
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
