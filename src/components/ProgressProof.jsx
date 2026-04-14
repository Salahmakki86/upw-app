/**
 * ProgressProof — Monthly comparison of Wheel of Life scores.
 * Shows when wheelHistory has 2+ entries AND 30+ days since first entry.
 * Highlights biggest improvement in gold.
 */
import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'

const AREAS = [
  { key: 'body',          emoji: '💪', ar: 'الجسم',      en: 'Body' },
  { key: 'emotions',      emoji: '🧠', ar: 'المشاعر',    en: 'Emotions' },
  { key: 'relationships', emoji: '❤️', ar: 'العلاقات',   en: 'Relationships' },
  { key: 'time',          emoji: '⏰', ar: 'الوقت',      en: 'Time' },
  { key: 'career',        emoji: '💼', ar: 'المهنة',     en: 'Career' },
  { key: 'money',         emoji: '💰', ar: 'المال',      en: 'Money' },
  { key: 'contribution',  emoji: '🤝', ar: 'المساهمة',   en: 'Contribution' },
]

export default function ProgressProof() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const [dismissed, setDismissed] = useState(false)

  const data = useMemo(() => {
    const history = state.wheelHistory || []
    if (history.length < 2) return null

    // Sort by date ascending
    const sorted = [...history].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    // Check 30+ days gap
    const firstDate = new Date(first.date)
    const lastDate = new Date(last.date)
    const daysDiff = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24))
    if (daysDiff < 30) return null

    const beforeScores = first.scores || {}
    const afterScores = last.scores || state.wheelScores || {}

    let biggestWinKey = null
    let biggestWinDelta = -Infinity

    const rows = AREAS.map(area => {
      const before = beforeScores[area.key] ?? 5
      const after = afterScores[area.key] ?? 5
      const delta = after - before
      if (delta > biggestWinDelta) {
        biggestWinDelta = delta
        biggestWinKey = area.key
      }
      return { ...area, before, after, delta }
    })

    return { rows, biggestWinKey, daysDiff }
  }, [state.wheelHistory, state.wheelScores])

  if (!data || dismissed) return null

  return (
    <div style={{
      background: '#111',
      borderRadius: 16,
      padding: 16,
      border: '1px solid rgba(201,168,76,0.15)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ color: '#c9a84c', fontSize: 15, fontWeight: 700, margin: 0 }}>
          {isAr ? '📊 تقدمك في شهر' : '📊 Your monthly progress'}
        </p>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: 8,
            color: '#888',
            fontSize: 12,
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          {isAr ? 'اخفاء' : 'Dismiss'}
        </button>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.rows.map(row => {
          const isBiggestWin = row.key === data.biggestWinKey && row.delta > 0
          return (
            <div
              key={row.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 10,
                background: isBiggestWin
                  ? 'rgba(201,168,76,0.12)'
                  : 'rgba(255,255,255,0.03)',
                border: isBiggestWin
                  ? '1px solid rgba(201,168,76,0.3)'
                  : '1px solid transparent',
              }}
            >
              <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{row.emoji}</span>
              <span style={{
                flex: 1,
                color: isBiggestWin ? '#c9a84c' : '#aaa',
                fontSize: 13,
                fontWeight: isBiggestWin ? 700 : 500,
              }}>
                {isAr ? row.ar : row.en}
              </span>
              <span style={{ color: '#666', fontSize: 12, minWidth: 20, textAlign: 'center' }}>
                {row.before}
              </span>
              <span style={{ color: '#555', fontSize: 11 }}>→</span>
              <span style={{
                color: row.delta > 0 ? '#2ecc71' : row.delta < 0 ? '#e63946' : '#888',
                fontSize: 13,
                fontWeight: 700,
                minWidth: 20,
                textAlign: 'center',
              }}>
                {row.after}
              </span>
              <span style={{ fontSize: 12, minWidth: 20, textAlign: 'center' }}>
                {row.delta > 0
                  ? <span style={{ color: '#2ecc71' }}>↑{row.delta}</span>
                  : row.delta < 0
                    ? <span style={{ color: '#e63946' }}>↓{Math.abs(row.delta)}</span>
                    : <span style={{ color: '#666' }}>—</span>}
              </span>
            </div>
          )
        })}
      </div>

      {/* Motivational note */}
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.12)',
      }}>
        <p style={{ color: '#c9a84c', fontSize: 12, textAlign: 'center', margin: 0, fontWeight: 600, lineHeight: 1.6 }}>
          {isAr
            ? `${data.daysDiff} يوما من العمل الحقيقي — هذا هو الدليل أن النظام يعمل ✨`
            : `${data.daysDiff} days of real work — this is proof the system works ✨`}
        </p>
      </div>
    </div>
  )
}
