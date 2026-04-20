/**
 * OfflineIndicator — Wave 7 Advanced
 *
 * Small status pill shown when the browser loses connectivity OR when there
 * is a queued state save waiting for reconnect. Non-intrusive — positioned
 * below the header in Layout so users always know their edits are local-first
 * but have not yet synced.
 */
import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import { isOnline, subscribeOnline, hasPendingSave } from '../utils/offlineQueue'

export default function OfflineIndicator() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const [online, setOnline] = useState(isOnline())
  const [pending, setPending] = useState(hasPendingSave())

  useEffect(() => {
    const unsub = subscribeOnline((isUp) => {
      setOnline(isUp)
      // Re-check pending state when connectivity changes
      setPending(hasPendingSave())
    })
    // Poll pending state every 5s — cheap localStorage read
    const id = setInterval(() => setPending(hasPendingSave()), 5000)
    return () => { unsub(); clearInterval(id) }
  }, [])

  // Nothing to show: fully online and nothing queued
  if (online && !pending) return null

  const offlineColor = '#e74c3c'
  const pendingColor = '#f39c12'
  const color = !online ? offlineColor : pendingColor
  const bg    = !online ? 'rgba(231,76,60,0.08)' : 'rgba(243,156,18,0.08)'
  const border = !online ? 'rgba(231,76,60,0.25)' : 'rgba(243,156,18,0.25)'

  const label = !online
    ? (isAr ? 'بدون اتصال — حفظ محلي' : 'Offline — saving locally')
    : (isAr ? 'مزامنة معلقة…' : 'Sync pending…')

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 99,
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.03em',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: color,
        animation: 'pulse 1.8s ease-in-out infinite',
      }} />
      {label}
    </div>
  )
}
