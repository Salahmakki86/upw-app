import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Sun, Target, Briefcase, BookOpen } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLang()
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const TABS = [
    { path: '/',         icon: Home,      labelKey: 'nav_home'     },
    { path: '/morning',  icon: Sun,       labelKey: 'nav_morning'  },
    { path: '/state',    icon: null,      labelKey: 'nav_sos',     center: true },
    { path: '/goals',    icon: Target,    labelKey: 'nav_goals'    },
    { path: '/business',  icon: Briefcase, labelKey: 'nav_business',  adminOnly: true },
    { path: '/lifebook',  icon: BookOpen,  labelKey: 'nav_lifebook',  adminOnly: true },
  ].filter(tab => !tab.adminOnly || isAdmin)

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 flex items-end"
      style={{
        background: 'linear-gradient(0deg, #090909 80%, transparent)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className="w-full flex items-center justify-around px-2 pt-3 pb-4"
        style={{
          background: '#111111',
          borderTop: '1px solid #222222',
        }}
      >
        {TABS.map((tab) => {
          if (tab.center) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative -top-5 flex flex-col items-center gap-1"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-black text-sm text-tr-black transition-all duration-200 active:scale-90"
                  style={{
                    background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)',
                    boxShadow: location.pathname === tab.path
                      ? '0 0 0 0 rgba(201,168,76,0.5), 0 0 25px rgba(201,168,76,0.6)'
                      : '0 0 20px rgba(201,168,76,0.4)',
                    animation: location.pathname === tab.path
                      ? 'pulse-gold 2s ease-in-out infinite'
                      : 'none',
                  }}
                >
                  <span className="text-lg">⚡</span>
                </div>
                <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>
                  {t(tab.labelKey)}
                </span>
              </button>
            )
          }

          const Icon = tab.icon
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="nav-tab flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-200"
              style={{ color: active ? '#c9a84c' : '#555555' }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{t(tab.labelKey)}</span>
              {active && (
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: '#c9a84c' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
