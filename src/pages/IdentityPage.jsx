/**
 * IdentityPage — TR1 Daily Identity (full page)
 *
 * Tony Robbins: "The strongest force in the human personality is the need
 * to stay consistent with how we define ourselves."
 *
 * This page combines:
 *   • Primary identity statement (editable, derived from DWD)
 *   • Morning + Evening alignment check-in
 *   • 14-day alignment chart
 *   • Coaching questions rotated daily
 *   • Reframe when alignment is low
 */
import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import IdentityAnchor from '../components/IdentityAnchor'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { getPrimaryIdentity, getAlignmentTrend } from '../utils/identityEngine'

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i))
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })
}

export default function IdentityPage() {
  const { state, updateDwd } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const identity = getPrimaryIdentity(state, isAr)
  const trend = getAlignmentTrend(state)

  // Editable identity
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(identity)

  const saveIdentity = () => {
    if (!draft.trim()) {
      showToast(isAr ? 'اكتب جملة هويتك' : 'Write your identity statement', 'error', 1500)
      return
    }
    // Update the DWD identityStatements; prepend so primary is first line
    const existing = state.dwd?.identityStatements || ''
    const lines = existing.split(/\n/).map(s => s.trim()).filter(Boolean)
    const updated = [draft.trim(), ...lines.filter(l => l !== draft.trim())].join('\n')
    updateDwd({ identityStatements: updated })
    setEditing(false)
    showToast(isAr ? 'تم حفظ هويتك ✓' : 'Identity saved ✓', 'success', 1500)
  }

  // 14-day alignment chart
  const days = useMemo(() => lastNDays(14), [])
  const chart = useMemo(() => {
    const log = state.identityAlignmentLog || {}
    return days.map(d => {
      const entry = log[d]
      if (!entry) return { d, avg: null }
      const m = entry.morningScore
      const e = entry.eveningScore
      const vals = [m, e].filter(v => typeof v === 'number')
      if (vals.length === 0) return { d, avg: null }
      return { d, avg: vals.reduce((a, b) => a + b, 0) / vals.length }
    })
  }, [state.identityAlignmentLog, days])

  const scoredDays = chart.filter(c => c.avg !== null).length
  const highDays = chart.filter(c => c.avg !== null && c.avg >= 7).length

  return (
    <Layout
      title={isAr ? '🎭 هويتي اليومية' : '🎭 Daily Identity'}
      subtitle={isAr ? 'من أنت؟ وهل أفعالك تتبع ذلك؟' : 'Who are you? And do your actions follow?'}
    >
      <div className="space-y-4 pt-2">

        {/* Identity editor */}
        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))',
          border: '1px solid rgba(201,168,76,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em' }}>
              {isAr ? 'جملة هويتي' : 'MY IDENTITY STATEMENT'}
            </p>
            {!editing && (
              <button
                onClick={() => { setDraft(identity); setEditing(true) }}
                style={{
                  background: '#1a1a1a', border: '1px solid #2a2a2a',
                  color: '#c9a84c', fontSize: 10, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 8, cursor: 'pointer',
                }}
              >
                {isAr ? 'تحرير' : 'Edit'}
              </button>
            )}
          </div>

          {!editing ? (
            <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.5 }}>
              "{identity}"
            </p>
          ) : (
            <>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={isAr ? 'أنا شخص...' : 'I am someone who...'}
                className="w-full rounded-xl p-3 text-sm"
                style={{ background: '#111', border: '1px solid #333', color: '#fff', minHeight: 80, resize: 'vertical' }}
                maxLength={200}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={saveIdentity}
                  className="flex-1 rounded-xl py-2 text-xs font-bold"
                  style={{
                    background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)',
                    color: '#c9a84c',
                  }}
                >
                  {isAr ? 'احفظ' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 rounded-xl py-2 text-xs font-bold"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </>
          )}

          {/* Suggestion link */}
          {!editing && (
            <p style={{ fontSize: 10, color: '#888', marginTop: 8 }}>
              {isAr
                ? '💡 تعدَّل من '
                : '💡 Edit it from '}
              <a href="/destiny" style={{ color: '#c9a84c', textDecoration: 'underline' }}>
                {isAr ? 'موعد مع القدر' : 'Date with Destiny'}
              </a>
            </p>
          )}
        </div>

        {/* Full check-in + reframe */}
        <IdentityAnchor variant="full" showQuestion={true} />

        {/* 14-day chart */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em' }}>
              {isAr ? '📈 انسجامك — 14 يوم' : '📈 14-Day Alignment'}
            </p>
            {trend.avg !== null && (
              <span style={{ fontSize: 11, fontWeight: 800, color: '#c9a84c' }}>
                {isAr ? 'متوسط 7 أيام: ' : '7d avg: '}{trend.avg}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 70 }}>
            {chart.map(({ d, avg }, i) => {
              const h = avg === null ? 4 : Math.max(4, (avg / 10) * 66)
              const color = avg === null ? '#222'
                : avg >= 8 ? '#2ecc71'
                : avg >= 6 ? '#c9a84c'
                : avg >= 4 ? '#f39c12'
                : '#e63946'
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    style={{
                      width: '100%', height: h, background: color, borderRadius: 3,
                      transition: 'height 0.4s',
                    }}
                    title={`${d}: ${avg === null ? (isAr ? 'غير مسجل' : 'not logged') : avg.toFixed(1)}`}
                  />
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 9, color: '#666', marginTop: 6 }}>
            <span>{isAr ? '14 يوماً' : '14d ago'}</span>
            <span>{isAr ? 'اليوم' : 'Today'}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12, fontSize: 10, color: '#888' }}>
            <span>
              <span style={{ color: '#c9a84c', fontWeight: 800 }}>{scoredDays}</span>/{days.length} {isAr ? 'يوم مسجل' : 'days logged'}
            </span>
            <span>
              <span style={{ color: '#2ecc71', fontWeight: 800 }}>{highDays}</span> {isAr ? 'يوم ≥7' : 'days ≥7'}
            </span>
          </div>
        </div>

        {/* Tony Robbins quote */}
        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, #1a1a1a, #0e0e0e)',
          border: '1px solid rgba(201,168,76,0.2)',
          position: 'relative',
        }}>
          <span style={{
            position: 'absolute', top: 8, insetInlineStart: 12, fontSize: 28, color: 'rgba(201,168,76,0.25)',
          }}>"</span>
          <p style={{
            fontSize: 12, color: '#ddd', fontStyle: 'italic', lineHeight: 1.6,
            paddingInlineStart: 24, paddingInlineEnd: 8,
          }}>
            {isAr
              ? 'أقوى قوة في الشخصية الإنسانية هي الحاجة للبقاء منسجمين مع الطريقة التي نعرّف بها أنفسنا.'
              : 'The strongest force in the human personality is the need to stay consistent with how we define ourselves.'}
          </p>
          <p style={{ fontSize: 10, color: '#c9a84c', fontWeight: 700, marginTop: 8, textAlign: 'end' }}>
            — Tony Robbins
          </p>
        </div>
      </div>
    </Layout>
  )
}
