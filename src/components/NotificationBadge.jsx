/**
 * NotificationBadge — small red dot / count pill
 *
 * Reads from state.unreadCounts[key]. Used in BottomNav tabs
 * and More menu items.
 *
 * Usage:
 *   <NotificationBadge type="dot" forKey="coach" />
 *   <NotificationBadge type="count" forKey="insights" />
 */
import { useApp } from '../context/AppContext'

export default function NotificationBadge({
  forKey,
  count,  // optional: explicit count overrides state
  type = 'dot',  // 'dot' | 'count'
  color = '#e63946',
  size = 'sm',
}) {
  const { state } = useApp()
  const unreadCounts = state.unreadCounts || {}
  const effectiveCount = typeof count === 'number' ? count : (unreadCounts[forKey] || 0)

  if (effectiveCount <= 0) return null

  if (type === 'dot') {
    const dotSize = size === 'lg' ? 10 : size === 'sm' ? 7 : 8
    return (
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: dotSize, height: dotSize,
          borderRadius: '50%', background: color,
          boxShadow: `0 0 0 2px #0a0a0a`,
        }}
      />
    )
  }

  // count pill
  const fontSize = size === 'lg' ? 11 : size === 'sm' ? 9 : 10
  return (
    <span
      aria-label={`${effectiveCount} unread`}
      style={{
        display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        minWidth: 16, height: 16,
        borderRadius: 8, padding: '0 5px',
        background: color, color: '#fff',
        fontSize, fontWeight: 900,
        boxShadow: `0 0 0 2px #0a0a0a`,
      }}
    >
      {effectiveCount > 99 ? '99+' : effectiveCount}
    </span>
  )
}
