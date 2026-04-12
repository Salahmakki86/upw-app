/**
 * #1 — "Discovery of the Day" Smart Insight Card
 * Shows one daily data-driven insight on the Dashboard
 */
import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { getDailyInsight } from '../utils/insights'

export default function DiscoveryCard() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const insight = useMemo(() => getDailyInsight(state, lang), [state, lang])

  return (
    <div className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${insight.color}08, ${insight.color}15)`,
        border: `1px solid ${insight.color}30`,
      }}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10"
        style={{
          background: `radial-gradient(circle, ${insight.color}, transparent)`,
          transform: 'translate(30%, -30%)',
        }} />
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${insight.color}18` }}>
          {insight.emoji}
        </div>
        <div className="flex-1">
          <p className="text-xs font-black mb-1 tracking-wider uppercase"
            style={{ color: insight.color }}>
            {isAr ? '💡 اكتشاف اليوم' : '💡 Discovery of the Day'}
          </p>
          <p className="text-sm font-bold text-white leading-relaxed">
            {insight.text}
          </p>
        </div>
      </div>
    </div>
  )
}
