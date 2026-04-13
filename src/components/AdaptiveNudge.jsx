/**
 * AdaptiveNudge — Batch 5
 * Personalized feature recommendations based on onboarding profile + unlock tier
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { getUnlockTier } from '../utils/featureUnlock'
import { getRecommendations, getSmartGreeting } from '../utils/adaptivePath'

export default function AdaptiveNudge() {
  const { state } = useApp()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const tier = useMemo(() => getUnlockTier(state), [state.morningLog, state.streak])
  const recs = useMemo(() => getRecommendations(state, tier, isAr), [state, tier, isAr])
  const { nudge } = useMemo(() => getSmartGreeting(state, isAr), [state, isAr])

  // Don't show if no profile or no recommendations
  const profile = state.onboardingProfile
  if (!profile?.goalArea || recs.length === 0) return null

  // Focus label
  const FOCUS_LABELS = {
    energy:   { ar: 'مسار الطاقة', en: 'Energy Path' },
    goals:    { ar: 'مسار الأهداف', en: 'Goals Path' },
    mindset:  { ar: 'مسار العقلية', en: 'Mindset Path' },
    business: { ar: 'مسار الأعمال', en: 'Business Path' },
    balance:  { ar: 'مسار التوازن', en: 'Balance Path' },
  }
  const focusPath = profile.focusPath || 'balance'
  const focusLabel = FOCUS_LABELS[focusPath] || FOCUS_LABELS.balance

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0d08 0%, #111 100%)',
        border: '1px solid rgba(201,168,76,0.25)',
      }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(201,168,76,0.15)' }}>
            <Sparkles size={14} style={{ color: '#c9a84c' }} />
          </div>
          <div>
            <p className="text-xs font-black" style={{ color: '#c9a84c' }}>
              {isAr ? '✨ مقترحات لك' : '✨ Recommended for You'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#555' }}>
              {isAr ? focusLabel.ar : focusLabel.en}
            </p>
          </div>
        </div>
      </div>

      {/* Nudge message */}
      <p className="px-4 pb-2 text-xs" style={{ color: '#777' }}>{nudge}</p>

      {/* Recommendations */}
      <div className="px-3 pb-4 space-y-2">
        {recs.map((rec, i) => (
          <button
            key={rec.path}
            onClick={() => navigate(rec.path)}
            className="w-full flex items-center gap-3 rounded-xl p-3 transition-all active:scale-[0.98]"
            style={{
              background: i === 0 ? 'rgba(201,168,76,0.08)' : '#0a0a0a',
              border: `1px solid ${i === 0 ? 'rgba(201,168,76,0.25)' : '#1e1e1e'}`,
              textAlign: isAr ? 'right' : 'left',
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: i === 0 ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                fontSize: 20,
              }}>
              {rec.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{isAr ? rec.labelAr : rec.labelEn}</p>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                {isAr ? rec.descAr : rec.descEn}
              </p>
            </div>
            {isAr
              ? <ChevronLeft size={14} style={{ color: i === 0 ? '#c9a84c' : '#333', flexShrink: 0 }} />
              : <ChevronRight size={14} style={{ color: i === 0 ? '#c9a84c' : '#333', flexShrink: 0 }} />
            }
          </button>
        ))}
      </div>
    </div>
  )
}
