/**
 * FocusModeToggle — M2 Simplified UI
 *
 * Toggles `state.uiPreferences.focusMode`. When active:
 *   • Dashboard hides everything except today's primary task + state check-in
 *   • Bottom nav dims to Home / Morning / State only
 *   • All other pages remain accessible via /all-tools or direct link
 *
 * Small button — can be dropped anywhere in the UI.
 */
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

export default function FocusModeToggle({ size = 'md', showLabel = true }) {
  const { state, updateUIPref } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const active = !!state.uiPreferences?.focusMode

  const toggle = () => {
    updateUIPref('focusMode', !active)
    showToast(
      !active
        ? (isAr ? '🎯 وضع التركيز مفعَّل' : '🎯 Focus Mode ON')
        : (isAr ? '◉ الوضع الكامل' : '◉ Full mode restored'),
      'success', 1500
    )
  }

  const sizePx = size === 'sm' ? { padY: 6, font: 10, emojiSize: 12, gap: 6 }
    : size === 'lg' ? { padY: 10, font: 13, emojiSize: 16, gap: 10 }
    : { padY: 8, font: 11, emojiSize: 14, gap: 8 }

  return (
    <button
      onClick={toggle}
      aria-pressed={active}
      aria-label={isAr ? 'تبديل وضع التركيز' : 'Toggle focus mode'}
      className="rounded-xl transition-all active:scale-[0.97]"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: sizePx.gap,
        padding: `${sizePx.padY}px 12px`,
        background: active ? 'rgba(201,168,76,0.15)' : '#141414',
        border: `1px solid ${active ? 'rgba(201,168,76,0.4)' : '#222'}`,
        color: active ? '#c9a84c' : '#888',
        fontSize: sizePx.font, fontWeight: 800, cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: sizePx.emojiSize }}>{active ? '🎯' : '◉'}</span>
      {showLabel && (
        <span>
          {active
            ? (isAr ? 'وضع التركيز' : 'Focus Mode')
            : (isAr ? 'وضع كامل' : 'Full Mode')}
        </span>
      )}
    </button>
  )
}
