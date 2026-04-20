import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Sunrise, Crosshair, Building2, Shapes } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import NotificationBadge from './NotificationBadge'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLang()
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  // Left half (before SOS) — always 2 tabs
  const LEFT_TABS = [
    { path: '/dashboard', matchPaths: ['/', '/dashboard'], icon: LayoutDashboard, labelKey: 'nav_home' },
    { path: '/morning',   icon: Sunrise,   labelKey: 'nav_morning'  },
  ]

  // Right half (after SOS) — 2-3 tabs depending on admin role
  const RIGHT_TABS = [
    { path: '/goals',     icon: Crosshair, labelKey: 'nav_goals'    },
    { path: '/business',  icon: Building2, labelKey: 'nav_business',  adminOnly: true, badgeKey: 'adminTab' },
    { path: '/all-tools', icon: Shapes,    labelKey: 'nav_more' },
  ].filter(tab => !tab.adminOnly || isAdmin)

  // Center SOS tab — absolutely positioned at the nav midpoint
  const SOS_TAB = { path: '/state', labelKey: 'nav_sos' }
  const sosActive = location.pathname === SOS_TAB.path

  const renderTab = (tab) => {
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
  }

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
        className="glass-dark w-full flex items-center px-2 pt-3 pb-4 relative"
        style={{
          /* Override default glass-dark border to a sharper top-edge only */
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          borderTop: '1px solid rgba(201,168,76,0.18)',
          borderRadius: 0,
        }}
      >
        {/* LEFT HALF — 2 tabs */}
        <div className="flex-1 flex items-center justify-around">
          {LEFT_TABS.map(renderTab)}
        </div>

        {/* CENTER SPACER — reserves horizontal space so the two halves don't
            collide with the absolutely-positioned SOS button above them */}
        <div style={{ width: 64, flexShrink: 0 }} aria-hidden="true" />

        {/* RIGHT HALF — 2 or 3 tabs */}
        <div className="flex-1 flex items-center justify-around">
          {RIGHT_TABS.map(renderTab)}
        </div>

        {/* SOS — absolutely centered over the nav midpoint.
            Guaranteed to sit at exact visual center regardless of how many
            regular tabs appear (5 for users, 6 for admins). */}
        <button
          onClick={() => navigate(SOS_TAB.path)}
          aria-label={t(SOS_TAB.labelKey)}
          aria-current={sosActive ? 'page' : undefined}
          data-glass-skip
          className="absolute bg-transparent flex flex-col items-center gap-1"
          style={{
            left: '50%',
            top: 0,
            transform: 'translate(-50%, -20px)',
            minHeight: 56,
            minWidth: 56,
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
          }}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-sm text-tr-black transition-all duration-300 active:scale-90 ${sosActive ? 'icon-pulse' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #f2e4b3 0%, #c9a84c 40%, #a88930 100%)',
              backdropFilter: 'blur(14px) saturate(180%)',
              WebkitBackdropFilter: 'blur(14px) saturate(180%)',
              border: '1px solid rgba(232,201,106,0.55)',
              boxShadow: sosActive
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
            {t(SOS_TAB.labelKey)}
          </span>
        </button>
      </div>
    </nav>
  )
}
