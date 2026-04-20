/**
 * AnalyticsPage — A4 Analytics Dashboard
 *
 * Personal longitudinal dashboard showing patterns across domains:
 *   • Morning streak + Sleep 30-day chart
 *   • State (energy/mood/clarity) 30-day trend
 *   • Goal completion + Identity alignment
 *   • Top correlations detected
 *
 * Uses existing data — no new logging required.
 */
import { useMemo } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { getAlignmentTrend } from '../utils/identityEngine'

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i))
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })
}

export default function AnalyticsPage() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const days30 = useMemo(() => lastNDays(30), [])

  const morningCount = useMemo(() => {
    const set = new Set((state.morningLog || []).map(m => m?.date).filter(Boolean))
    return days30.filter(d => set.has(d)).length
  }, [state.morningLog, days30])

  const avgSleep = useMemo(() => {
    const log = state.sleepLog || {}
    const hours = days30.map(d => log[d]?.hours).filter(h => typeof h === 'number' && h > 0)
    if (hours.length === 0) return null
    return Math.round((hours.reduce((a, b) => a + b, 0) / hours.length) * 10) / 10
  }, [state.sleepLog, days30])

  const stateAvg = useMemo(() => {
    const log = state.stateCheckin || {}
    const vals = days30.map(d => {
      const v = log[d]
      if (!v || typeof v.energy !== 'number') return null
      return (v.energy + v.mood + v.clarity) / 3
    }).filter(v => v !== null)
    if (vals.length === 0) return null
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  }, [state.stateCheckin, days30])

  const goalsCompleted = useMemo(() =>
    (state.goals || []).filter(g => g.completed).length,
    [state.goals]
  )

  const identityAvg = getAlignmentTrend(state).avg
  const totalWins = useMemo(() =>
    Object.values(state.dailyWins || {}).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0),
    [state.dailyWins]
  )

  const gratitudeDays = useMemo(() => {
    const g = state.gratitude || {}
    return days30.filter(d => (g[d] || []).filter(Boolean).length > 0).length
  }, [state.gratitude, days30])

  // 30-day state chart series (energy/mood/clarity)
  const chart30 = useMemo(() => {
    const log = state.stateCheckin || {}
    return days30.map(d => {
      const v = log[d]
      return {
        d,
        energy: v?.energy || null,
        mood: v?.mood || null,
        clarity: v?.clarity || null,
      }
    })
  }, [state.stateCheckin, days30])

  // Correlations
  const correlations = useMemo(() => {
    const out = []
    const check = state.stateCheckin || {}
    const morningSet = new Set((state.morningLog || []).map(m => m?.date).filter(Boolean))
    const sleep = state.sleepLog || {}

    const withM = [], withoutM = []
    days30.forEach(d => {
      const v = check[d]
      if (!v) return
      const avg = (v.energy + v.mood + v.clarity) / 3
      if (morningSet.has(d)) withM.push(avg); else withoutM.push(avg)
    })
    if (withM.length >= 3 && withoutM.length >= 3) {
      const a = withM.reduce((s, v) => s + v, 0) / withM.length
      const b = withoutM.reduce((s, v) => s + v, 0) / withoutM.length
      const diff = Math.round((a - b) * 10) / 10
      if (Math.abs(diff) >= 0.4) out.push({
        emoji: '☀️',
        ar: `الطقس الصباحي يرفع حالتك ${diff > 0 ? '+' : ''}${diff} نقطة`,
        en: `Morning ritual changes state by ${diff > 0 ? '+' : ''}${diff}`,
      })
    }

    const good = [], poor = []
    days30.forEach(d => {
      const v = check[d]; const h = sleep[d]?.hours
      if (!v || typeof h !== 'number') return
      const avg = (v.energy + v.mood + v.clarity) / 3
      if (h >= 7) good.push(avg); else if (h > 0) poor.push(avg)
    })
    if (good.length >= 3 && poor.length >= 3) {
      const a = good.reduce((s, v) => s + v, 0) / good.length
      const b = poor.reduce((s, v) => s + v, 0) / poor.length
      const diff = Math.round((a - b) * 10) / 10
      if (Math.abs(diff) >= 0.4) out.push({
        emoji: '😴',
        ar: `النوم ≥7 ساعات يرفع حالتك ${diff > 0 ? '+' : ''}${diff} نقطة`,
        en: `Sleep ≥7h changes state by ${diff > 0 ? '+' : ''}${diff}`,
      })
    }

    return out
  }, [state.stateCheckin, state.morningLog, state.sleepLog, days30])

  return (
    <Layout
      title={isAr ? '📊 لوحة التحليلات' : '📊 Analytics'}
      subtitle={isAr ? '30 يوم — الأنماط الحقيقية' : '30 days — the real patterns'}
    >
      <div className="space-y-4 pt-2">

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-2">
          <KPI emoji="☀️" label={isAr ? 'أيام الطقس' : 'Ritual days'} value={`${morningCount}/30`} color="#c9a84c" />
          <KPI emoji="😴" label={isAr ? 'متوسط النوم' : 'Avg sleep'} value={avgSleep ? `${avgSleep}h` : '—'} color="#3498db" />
          <KPI emoji="⚡" label={isAr ? 'متوسط الحالة' : 'Avg state'} value={stateAvg ? `${stateAvg}/10` : '—'} color="#2ecc71" />
          <KPI emoji="🎭" label={isAr ? 'انسجام الهوية' : 'Identity avg'} value={identityAvg ? `${identityAvg}/10` : '—'} color="#c9a84c" />
          <KPI emoji="🏆" label={isAr ? 'أهداف أُنجزت' : 'Goals done'} value={goalsCompleted} color="#e67e22" />
          <KPI emoji="⭐" label={isAr ? 'انتصارات' : 'Wins'} value={totalWins} color="#c9a84c" />
          <KPI emoji="🙏" label={isAr ? 'أيام الامتنان' : 'Gratitude days'} value={`${gratitudeDays}/30`} color="#2ecc71" />
        </div>

        {/* State 30-day chart */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em', marginBottom: 10 }}>
            {isAr ? '📉 الحالة — 30 يوم' : '📉 State — 30 days'}
          </p>
          <StateChart data={chart30} />
          <div style={{ display: 'flex', gap: 12, fontSize: 9, color: '#888', marginTop: 8, justifyContent: 'center' }}>
            <Legend color="#c9a84c" label={isAr ? 'طاقة' : 'Energy'} />
            <Legend color="#2ecc71" label={isAr ? 'مزاج' : 'Mood'} />
            <Legend color="#3498db" label={isAr ? 'وضوح' : 'Clarity'} />
          </div>
        </div>

        {/* Correlations */}
        {correlations.length > 0 && (
          <div className="rounded-2xl p-4" style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.08), transparent)',
            border: '1px solid rgba(201,168,76,0.25)',
          }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 10, letterSpacing: '0.05em' }}>
              {isAr ? '💡 أنماط اكتشفها التحليل' : '💡 Detected patterns'}
            </p>
            {correlations.map((c, i) => (
              <div key={i} style={{
                padding: '10px 12px', marginBottom: 6,
                background: '#141414', border: '1px solid #222', borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>{c.emoji}</span>
                <p style={{ fontSize: 11, color: '#ddd', flex: 1 }}>{isAr ? c.ar : c.en}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  )
}

function KPI({ emoji, label, value, color }) {
  return (
    <div className="rounded-xl p-3" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
      <div style={{ fontSize: 20 }}>{emoji}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }}/>
      <span>{label}</span>
    </span>
  )
}

function StateChart({ data }) {
  const w = 320, h = 90, padY = 6
  const series = ['energy', 'mood', 'clarity']
  const colors = { energy: '#c9a84c', mood: '#2ecc71', clarity: '#3498db' }
  const n = data.length

  const toPath = (key) => {
    const pts = data.map((d, i) => {
      const val = d[key]
      if (typeof val !== 'number') return null
      const x = (i / Math.max(1, n - 1)) * w
      const y = h - padY - ((val - 1) / 9) * (h - padY * 2)
      return [x, y]
    })
    let path = ''
    pts.forEach(p => {
      if (!p) return
      path += (path ? ' L ' : 'M ') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)
    })
    return path
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 90, overflow: 'visible' }} role="img" aria-label="30-day state trend">
      {/* gridlines */}
      {[2, 5, 8].map(v => {
        const y = h - padY - ((v - 1) / 9) * (h - padY * 2)
        return <line key={v} x1="0" x2={w} y1={y} y2={y} stroke="#1a1a1a" strokeDasharray="3 3" />
      })}
      {series.map(k => (
        <path key={k} d={toPath(k)} fill="none" stroke={colors[k]} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      ))}
    </svg>
  )
}
