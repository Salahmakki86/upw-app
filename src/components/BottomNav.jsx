import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Sun, Target, Briefcase, LayoutGrid } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import NotificationBadge from './NotificationBadge'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLang()
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const TABS = [
    { path: '/dashboard', matchPaths: ['/', '/dashboard'], icon: Home, labelKey: 'nav_home' },
    { path: '/morning',   icon: Sun,       labelKey: 'nav_morning'  },
    { path: '/state',     icon: null,      labelKey: 'nav_sos',     center: true },
    { path: '/goals',     icon: Target,    labelKey: 'nav_goals'    },
    { path: '/business',  icon: Briefcase, labelKey: 'nav_business',  adminOnly: true, badgeKey: 'adminTab' },
    { path: '/all-tools', icon: LayoutGrid, labelKey: 'nav_more' },
  ].filter(tab => !tab.adminOnly || isAdmin)

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 flex items-end"
      style={{
        /* Soft fade-from-bg keeps the glass edge readable over page scroll */
        background: 'linear-gradient(0deg, rgba(9,9,9,0.92) 70%, rgba(9,9,9,0))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className="glass-dark w-full flex items-center justify-around px-2 pt-3 pb-4"
        style={{
          /* Override default glass-dark border to a sharper top-edge only */
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          borderTop: '1px solid rgba(201,168,76,0.18)',
          borderRadius: 0,
        }}
      >
        {TABS.map((tab) => {
          if (tab.center) {
            const isActive = location.pathname === tab.path
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                aria-label={t(tab.labelKey)}
                aria-current={isActive ? 'page' : undefined}
                className="relative -top-5 flex flex-col items-center gap-1"
                style={{ minHeight: 56, minWidth: 56 }}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-sm text-tr-black transition-all duration-300 active:scale-90 ${isActive ? 'icon-pulse' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, #f2e4b3 0%, #c9a84c 40%, #a88930 100%)',
                    backdropFilter: 'blur(14px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(14px) saturate(180%)',
                    border: '1px solid rgba(232,201,106,0.55)',
                    boxShadow: isActive
                      ? '0 6px 28px rgba(201,168,76,0.55), 0 0 0 3px rgba(9,9,9,1), inset 0 1px 0 rgba(255,255,255,0.3)'
                      : '0 4px 20px rgba(201,168,76,0.35), 0 0 0 3px rgba(9,9,9,1), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                >
                  <span className="text-lg" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>⚡</span>
                </div>
                <span className="text-xs font-bold" style={{
                  color: '#c9a84c',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                }}>
                  {t(tab.labelKey)}
                </span>
              </button>
            )
          }

          const Icon = tab.icon
          const active = tab.matchPaths
            ? tab.matchPaths.includes(location.pathname)
            : location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              aria-label={t(tab.labelKey)}
              aria-current={active ? 'page' : undefined}
              className="nav-tab flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-300 relative"
              style={{ color: active ? '#c9a84c' : '#555555', minHeight: 48 }}
            >
              <div
                className={`icon-halo ${active ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{
                    filter: active ? 'drop-shadow(0 0 6px rgba(201,168,76,0.55))' : 'none',
                    transition: 'filter 0.3s ease',
                  }}
                />
                {tab.badgeKey && (
                  <span style={{ position: 'absolute', top: -4, insetInlineEnd: -6 }}>
                    <NotificationBadge forKey={tab.badgeKey} type="dot" size="sm" />
                  </span>
                )}
              </div>
              <span className="text-xs font-medium" style={{
                textShadow: active ? '0 1px 3px rgba(0,0,0,0.6)' : 'none',
              }}>{t(tab.labelKey)}</span>
              {active && (
                <div
                  className="w-1 h-1 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #f2e4b3, #c9a84c)',
                    boxShadow: '0 0 6px rgba(201,168,76,0.8)',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
