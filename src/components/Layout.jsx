import { useState } from 'react'
import BottomNav from './BottomNav'
import { useLang } from '../context/LangContext'
import HelpDrawer from './HelpDrawer'

export default function Layout({ children, title, subtitle, rightAction, helpKey }) {
  const { lang, toggleLang, t } = useLang()
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="flex flex-col h-full" style={{ background: '#090909' }}>
      {/* Header */}
      {title && (
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-4"
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
                className="flex items-center justify-center rounded-full font-bold text-xs transition-all duration-200 active:scale-90"
                style={{
                  width: 36, height: 36,
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
              className="flex items-center justify-center rounded-full font-bold text-xs transition-all duration-200 active:scale-90"
              style={{
                width: 36,
                height: 36,
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

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-32 px-4">
        {children}
      </main>

      <BottomNav />
      {showHelp && <HelpDrawer pageKey={helpKey} onClose={() => setShowHelp(false)} />}
    </div>
  )
}
