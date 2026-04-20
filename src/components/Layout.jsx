import { useState } from 'react'
import BottomNav from './BottomNav'
import { useLang } from '../context/LangContext'
import HelpDrawer from './HelpDrawer'
import IdentityAnchor from './IdentityAnchor'
import TriadReset from './TriadReset'
import OfflineIndicator from './OfflineIndicator'
import { useApp } from '../context/AppContext'
import { calcDailyScore, DAILY_TASKS_TOTAL } from '../utils/dailyScore'

export default function Layout({ children, title, subtitle, rightAction, helpKey, hideAnchor = false }) {
  const { lang, toggleLang, t } = useLang()
  const { state } = useApp()
  const [showHelp, setShowHelp] = useState(false)
  const [showTriad, setShowTriad] = useState(false)
  const focusMode = !!state.uiPreferences?.focusMode

  const score = calcDailyScore(state)
  const pct   = Math.round((score / DAILY_TASKS_TOTAL) * 100)
  const isComplete = score === DAILY_TASKS_TOTAL

  return (
    <div className="flex flex-col h-full" style={{ background: '#090909' }}>
      {/* Header */}
      {title && (
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 pb-4 safe-top"
          style={{ background: '#090909' }}
        >
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: '#888888' }}>{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {rightAction && <div>{rightAction}</div>}
            {/* Help Button */}
            {helpKey && (
              <button
                onClick={() => setShowHelp(true)}
                aria-label={lang === 'ar' ? 'مساعدة' : 'Help'}
                className="flex items-center justify-center rounded-full font-bold text-xs transition-all duration-200 active:scale-90"
                style={{
                  width: 44, height: 44,
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: '#c9a84c',
                }}
              >
                ?
              </button>
            )}
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
              className="flex items-center justify-center rounded-full font-bold text-xs transition-all duration-200 active:scale-90"
              style={{
                width: 44,
                height: 44,
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#c9a84c',
                fontFamily: lang === 'ar' ? "'Inter', sans-serif" : "'Cairo', sans-serif",
              }}
              title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              {t('lang_toggle')}
            </button>
          </div>
        </header>
      )}

      {/* ── Daily Progress Bar ──────────────────────────────── */}
      <div style={{ height: 3, background: '#111', flexShrink: 0 }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: isComplete
              ? 'linear-gradient(90deg, #2ecc71, #27ae60)'
              : 'linear-gradient(90deg, #c9a84c, #e8c96a)',
            transition: 'width 0.6s ease',
            boxShadow: isComplete ? '0 0 6px #2ecc7180' : '0 0 6px #c9a84c60',
          }}
        />
      </div>

      {/* Score pill — shown only when at least 1 task done; OfflineIndicator on the other side */}
      {(score > 0 || true) && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '4px 16px 0', flexShrink: 0, gap: 8,
        }}>
          <OfflineIndicator />
          {score > 0 ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: isComplete ? 'rgba(46,204,113,0.1)' : 'rgba(201,168,76,0.1)',
              border: `1px solid ${isComplete ? 'rgba(46,204,113,0.3)' : 'rgba(201,168,76,0.25)'}`,
              borderRadius: 20, padding: '2px 8px',
            }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: isComplete ? '#2ecc71' : '#c9a84c' }}>
                {isComplete ? '🏆' : '⚡'} {score}/{DAILY_TASKS_TOTAL}
              </span>
            </div>
          ) : <span /> /* spacer so OfflineIndicator stays left */}
        </div>
      )}

      {/* Identity Anchor — compact line, opt-out via uiPreferences.identityAnchorHidden */}
      {!hideAnchor && !focusMode && (
        <div style={{ padding: '4px 16px 0 16px', flexShrink: 0 }}>
          <IdentityAnchor variant="compact" />
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-32 px-4">
        {children}
      </main>

      {/* Floating Triad Reset button */}
      {!focusMode && (
        <button
          onClick={() => setShowTriad(true)}
          aria-label={lang === 'ar' ? 'إعادة ضبط الحالة — ٦٠ ثانية' : '60-second state reset'}
          title={lang === 'ar' ? 'إعادة ضبط الحالة — ٦٠ ثانية' : '60-second state reset'}
          style={{
            position: 'fixed',
            insetInlineEnd: 16,
            bottom: 96,
            width: 44, height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a84c, #a88930)',
            color: '#090909',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(201,168,76,0.35), 0 0 0 2px #090909',
            zIndex: 40,
            fontSize: 18,
            fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ⚡
        </button>
      )}

      <BottomNav />
      {showHelp && <HelpDrawer pageKey={helpKey} onClose={() => setShowHelp(false)} />}
      <TriadReset open={showTriad} onClose={() => setShowTriad(false)} />
    </div>
  )
}
