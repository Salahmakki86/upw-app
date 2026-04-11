import { useState, useEffect } from 'react'
import { MessageCircle, X, Check, ChevronLeft } from 'lucide-react'
import { upwApi } from '../api/upwApi'
import { useAuth } from '../context/AuthContext'

export default function MessageModal() {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [index,    setIndex]    = useState(0)
  const [open,     setOpen]     = useState(false)

  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') return
    upwApi.getMessages()
      .then(msgs => {
        const unread = msgs.filter(m => !m.read_at)
        if (unread.length > 0) { setMessages(unread); setOpen(true) }
      })
      .catch(() => {})
  }, [currentUser])

  if (!open || messages.length === 0) return null

  const msg    = messages[index]
  const isLast = index === messages.length - 1

  const markRead = (id) => upwApi.markMessageRead(id).catch(() => {})

  const handleNext = async () => {
    await markRead(msg.id)
    if (!isLast) { setIndex(i => i + 1) }
    else         { setOpen(false) }
  }

  const handleClose = async () => {
    // Mark all from current index onward
    for (const m of messages.slice(index)) await markRead(m.id)
    setOpen(false)
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.35)', direction: 'rtl' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #222' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.15)' }}
            >
              <MessageCircle size={18} style={{ color: '#c9a84c' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>رسالة من المدرب</p>
              {messages.length > 1 && (
                <p className="text-xs" style={{ color: '#555' }}>{index + 1} / {messages.length}</p>
              )}
            </div>
          </div>
          <button onClick={handleClose} className="transition-opacity hover:opacity-70" style={{ color: '#555' }}>
            <X size={18} />
          </button>
        </div>

        {/* Message body */}
        <div className="px-5 py-5">
          <p
            className="text-sm leading-7"
            style={{ color: '#e8e8e8', whiteSpace: 'pre-wrap', minHeight: 60 }}
          >
            {msg.body}
          </p>
        </div>

        {/* Date + action */}
        <div className="px-5 pb-5 flex flex-col gap-3">
          <p className="text-xs text-center" style={{ color: '#444' }}>
            {new Date(msg.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <button
            onClick={handleNext}
            className="w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)',
              color: '#0a0a0a',
            }}
          >
            {isLast
              ? <><Check size={15} /> شكراً على الرسالة</>
              : <><ChevronLeft size={15} /> الرسالة التالية</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
