/**
 * #1 — Daily Business Scorecard
 * Quick daily logging of key business metrics with trend analysis
 */
import { useState, useMemo, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const METRICS = [
  { key: 'calls',    emoji: '📞', ar: 'المكالمات/الاجتماعات', en: 'Calls / Meetings',  type: 'number', color: '#3498db' },
  { key: 'leads',    emoji: '🧲', ar: 'عملاء جدد (Leads)',    en: 'New Leads',          type: 'number', color: '#2ecc71' },
  { key: 'source',   emoji: '📡', ar: 'مصدر العملاء',         en: 'Lead Source',         type: 'select', color: '#9b59b6' },
  { key: 'revenue',  emoji: '💰', ar: 'الإيرادات اليوم',       en: "Today's Revenue",    type: 'number', color: '#c9a84c' },
  { key: 'topWin',   emoji: '🏆', ar: 'أهم إنجاز عملي',       en: 'Top Business Win',   type: 'text',   color: '#f1c40f' },
  { key: 'blocker',  emoji: '🚧', ar: 'أكبر عائق',            en: 'Biggest Blocker',    type: 'text',   color: '#e74c3c' },
]

const SOURCES = [
  { key: 'Instagram', ar: 'إنستغرام',  en: 'Instagram' },
  { key: 'Facebook',  ar: 'فيسبوك',    en: 'Facebook'  },
  { key: 'TikTok',    ar: 'تيك توك',   en: 'TikTok'    },
  { key: 'Email',     ar: 'إيميل',     en: 'Email'     },
  { key: 'Referral',  ar: 'إحالة',     en: 'Referral'  },
  { key: 'Ads',       ar: 'إعلانات',   en: 'Ads'       },
  { key: 'Direct',    ar: 'مباشر',     en: 'Direct'    },
  { key: 'Other',     ar: 'أخرى',      en: 'Other'     },
]

export default function BusinessScorecard() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const today = new Date().toISOString().slice(0, 10)
  const scorecard = state.businessScorecard || {}
  const todayData = scorecard[today] || {}

  const [form, setForm] = useState(() => {
    const init = {}
    METRICS.forEach(m => { init[m.key] = todayData[m.key] || '' })
    return init
  })
  const [saved, setSaved] = useState(false)

  // Re-sync form when today changes (after midnight) or when returning to page
  useEffect(() => {
    const init = {}
    METRICS.forEach(m => { init[m.key] = todayData[m.key] || '' })
    setForm(init)
  }, [today]) // eslint-disable-line

  const handleSave = () => {
    const newScorecard = { ...scorecard, [today]: { ...form, savedAt: Date.now() } }
    update('businessScorecard', newScorecard)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Last 7 days for trend
  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  }), [])

  // Weekly stats
  const weekStats = useMemo(() => {
    let totalCalls = 0, totalLeads = 0, totalRevenue = 0, daysLogged = 0
    last7.forEach(d => {
      const entry = scorecard[d]
      if (entry) {
        daysLogged++
        totalCalls += Number(entry.calls) || 0
        totalLeads += Number(entry.leads) || 0
        totalRevenue += Number(entry.revenue) || 0
      }
    })
    return { totalCalls, totalLeads, totalRevenue, daysLogged }
  }, [scorecard, last7])

  // Top source this week
  const topSource = useMemo(() => {
    const counts = {}
    last7.forEach(d => {
      const src = scorecard[d]?.source
      if (src) counts[src] = (counts[src] || 0) + 1
    })
    const entries = Object.entries(counts)
    if (!entries.length) return null
    entries.sort((a, b) => b[1] - a[1])
    return entries[0][0]
  }, [scorecard, last7])

  // Marketing attribution insight (3+ days with source logged)
  const marketingInsight = useMemo(() => {
    const counts = {}
    let daysWithSource = 0
    Object.values(scorecard).forEach(entry => {
      if (entry?.source) {
        daysWithSource++
        counts[entry.source] = (counts[entry.source] || 0) + 1
      }
    })
    if (daysWithSource < 3) return null
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const src = SOURCES.find(s => s.key === entries[0][0])
    return src ? (isAr ? src.ar : src.en) : entries[0][0]
  }, [scorecard, isAr])

  // State → Performance correlation (#10)
  const stateCorrelation = useMemo(() => {
    const stateByDate = {}
    ;(state.stateLog || []).forEach(s => { stateByDate[s.date] = s.state })
    let beautifulRevenue = 0, beautifulDays = 0, otherRevenue = 0, otherDays = 0
    Object.entries(scorecard).forEach(([date, entry]) => {
      const rev = Number(entry.revenue) || 0
      if (stateByDate[date] === 'beautiful') { beautifulRevenue += rev; beautifulDays++ }
      else if (rev > 0) { otherRevenue += rev; otherDays++ }
    })
    if (beautifulDays >= 3 && otherDays >= 3) {
      const avgBeautiful = beautifulRevenue / beautifulDays
      const avgOther = otherRevenue / otherDays
      if (avgBeautiful > avgOther * 1.2) {
        const pct = Math.round(((avgBeautiful - avgOther) / avgOther) * 100)
        return { pct, type: 'positive' }
      }
    }
    return null
  }, [scorecard, state.stateLog])

  // Revenue bar chart
  const maxRevenue = Math.max(...last7.map(d => Number(scorecard[d]?.revenue) || 0), 1)

  return (
    <Layout
      title={isAr ? 'السبورة اليومية' : 'Daily Scorecard'}
      subtitle={isAr ? 'دقيقة واحدة — سجّل أرقام يومك' : 'One minute — log your daily numbers'}
    >
      <div className="space-y-4 pt-2">

        {/* Weekly Summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: isAr ? 'المكالمات' : 'Calls', value: weekStats.totalCalls, color: '#3498db' },
            { label: isAr ? 'العملاء' : 'Leads', value: weekStats.totalLeads, color: '#2ecc71' },
            { label: isAr ? 'الإيرادات' : 'Revenue', value: weekStats.totalRevenue.toLocaleString(), color: '#c9a84c' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#888' }}>{s.label}</div>
              <div className="text-xs" style={{ color: '#555' }}>{isAr ? 'هذا الأسبوع' : 'This week'}</div>
            </div>
          ))}
        </div>

        {/* Top Source badge */}
        {topSource && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: '#9b59b610', border: '1px solid #9b59b630' }}>
            <span style={{ color: '#9b59b6', fontSize: 16 }}>📡</span>
            <span className="text-xs font-bold" style={{ color: '#9b59b6' }}>
              {isAr ? 'أفضل مصدر هذا الأسبوع:' : 'Top source this week:'}
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full"
              style={{ background: '#9b59b620', color: '#9b59b6', border: '1px solid #9b59b640' }}>
              {SOURCES.find(s => s.key === topSource)?.[isAr ? 'ar' : 'en'] ?? topSource}
            </span>
          </div>
        )}

        {/* State → Performance insight */}
        {stateCorrelation && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)' }}>
            <p className="text-xs font-bold" style={{ color: '#2ecc71' }}>
              💡 {isAr
                ? `أيام "الحالة الجميلة" = إيرادات أعلى بـ ${stateCorrelation.pct}%!`
                : `"Beautiful state" days = ${stateCorrelation.pct}% higher revenue!`}
            </p>
          </div>
        )}

        {/* Marketing attribution insight */}
        {marketingInsight && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.2)' }}>
            <p className="text-xs font-bold" style={{ color: '#9b59b6' }}>
              📡 {isAr
                ? `أكثر مصدر عملاء: ${marketingInsight}`
                : `Top lead source overall: ${marketingInsight}`}
            </p>
          </div>
        )}

        {/* Revenue Chart */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
            📊 {isAr ? 'الإيرادات — آخر ٧ أيام' : 'Revenue — Last 7 Days'}
          </p>
          <div className="flex items-end gap-1.5" style={{ height: 80 }}>
            {last7.map(d => {
              const rev = Number(scorecard[d]?.revenue) || 0
              const h = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0
              const isToday = d === today
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: rev > 0 ? '#c9a84c' : '#333', fontSize: 8 }}>
                    {rev > 0 ? rev.toLocaleString() : ''}
                  </span>
                  <div className="w-full rounded-t" style={{
                    height: `${Math.max(h, 4)}%`,
                    background: rev > 0
                      ? 'linear-gradient(180deg, #c9a84c, #a88930)'
                      : '#1e1e1e',
                    border: isToday ? '1px solid #c9a84c' : 'none',
                    transition: 'height 0.4s ease',
                  }} />
                  <span className="text-xs" style={{ color: isToday ? '#c9a84c' : '#555', fontSize: 8 }}>
                    {new Date(d).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's Input */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
            ✏️ {isAr ? 'سجّل يومك' : "Log Today's Numbers"}
          </p>
          <div className="space-y-3">
            {METRICS.map(m => (
              <div key={m.key}>
                <label className="text-xs font-bold flex items-center gap-1.5 mb-1" style={{ color: m.color }}>
                  {m.emoji} {isAr ? m.ar : m.en}
                </label>

                {m.type === 'number' && (
                  <input
                    type="number" inputMode="numeric"
                    value={form[m.key]}
                    onChange={e => setForm(f => ({ ...f, [m.key]: e.target.value }))}
                    placeholder="0"
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
                    style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
                  />
                )}

                {m.type === 'text' && (
                  <input
                    type="text"
                    value={form[m.key]}
                    onChange={e => setForm(f => ({ ...f, [m.key]: e.target.value }))}
                    placeholder={isAr ? 'اكتب هنا...' : 'Type here...'}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
                    style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
                  />
                )}

                {m.type === 'select' && (
                  <div
                    className="flex gap-2 pb-1"
                    style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
                  >
                    {SOURCES.map(src => {
                      const isSelected = form[m.key] === src.key
                      return (
                        <button
                          key={src.key}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, [m.key]: isSelected ? '' : src.key }))}
                          className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all"
                          style={{
                            background: isSelected ? '#9b59b620' : '#111',
                            border: `1px solid ${isSelected ? '#9b59b6' : '#333'}`,
                            color: isSelected ? '#9b59b6' : '#666',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isAr ? src.ar : src.en}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="w-full btn-gold py-3 text-sm mt-4">
            {saved ? '✓ ' + (isAr ? 'تم الحفظ' : 'Saved') : '💾 ' + (isAr ? 'احفظ السبورة' : 'Save Scorecard')}
          </button>
        </div>

        {/* History */}
        {weekStats.daysLogged > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              📅 {isAr ? 'سجل الأيام' : 'Daily Log'}
            </p>
            <div className="space-y-2">
              {[...last7].reverse().map(d => {
                const entry = scorecard[d]
                if (!entry) return null
                const dateLabel = new Date(d).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })
                const srcObj = entry.source ? SOURCES.find(s => s.key === entry.source) : null
                return (
                  <div key={d} className="rounded-xl p-2.5"
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#888' }}>{dateLabel}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span style={{ color: '#3498db' }}>📞 {entry.calls || 0}</span>
                        <span style={{ color: '#2ecc71' }}>🧲 {entry.leads || 0}</span>
                        <span className="font-bold" style={{ color: '#c9a84c' }}>💰 {Number(entry.revenue || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    {srcObj && (
                      <div className="mt-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: '#9b59b615', color: '#9b59b6', border: '1px solid #9b59b630' }}>
                          📡 {isAr ? srcObj.ar : srcObj.en}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
