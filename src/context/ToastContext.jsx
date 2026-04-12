import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const TYPE_CONFIG = {
  success: { color: '#2ecc71', bg: 'rgba(46,204,113,0.12)', border: 'rgba(46,204,113,0.3)', Icon: CheckCircle },
  error:   { color: '#e74c3c', bg: 'rgba(231,76,60,0.12)',  border: 'rgba(231,76,60,0.3)',  Icon: AlertCircle },
  info:    { color: '#3498db', bg: 'rgba(52,152,219,0.12)', border: 'rgba(52,152,219,0.3)', Icon: Info },
  gold:    { color: '#c9a84c', bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.3)', Icon: CheckCircle },
}

function ToastItem({ toast, onRemove }) {
  const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.success
  const { Icon } = cfg
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#161616',
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: 220, maxWidth: 320,
        animation: 'toastIn 0.25s ease',
        direction: 'rtl',
      }}
    >
      <Icon size={16} style={{ color: cfg.color, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, color: '#e8e8e8', fontWeight: 600 }}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#555', flexShrink: 0 }}
      >
        <X size={12} />
      </button>
    </div>
  )
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: 8,
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-4), { id, message, type }]) // max 5 toasts
    setTimeout(() => removeToast(id), duration)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { showToast: () => {} } // graceful fallback
  return ctx
}
