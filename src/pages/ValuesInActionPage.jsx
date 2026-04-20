/**
 * ValuesInActionPage — TR2 Values in Action
 *
 * Tony Robbins: "Decisions shape destiny. But decisions without
 * values-alignment shape a destiny you don't recognize."
 *
 * This page lets the user audit recent decisions against their top values.
 * For each decision (from decisionJournal or a manual entry), the user
 * checks which values it honored and which it violated.
 */
import { useState, useMemo } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import EmptyStateCard from '../components/EmptyStateCard'

export default function ValuesInActionPage() {
  const { state, linkValueToDecision } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  // Top values from valuesHierarchy
  const values = useMemo(() => {
    return Array.isArray(state.valuesHierarchy?.items)
      ? state.valuesHierarchy.items.slice(0, 8)
      : []
  }, [state.valuesHierarchy])

  const decisions = useMemo(() => {
    return Array.isArray(state.decisionJournal)
      ? [...state.decisionJournal].reverse().slice(0, 15)
      : []
  }, [state.decisionJournal])

  const log = state.decisionValueLog || {}
  const [selectedDecision, setSelectedDecision] = useState(decisions[0]?.id || null)
  const current = decisions.find(d => d.id === selectedDecision)
  const currentLinks = log[selectedDecision]?.valueIds || []
  const [picked, setPicked] = useState(currentLinks)

  const togglePick = (vid) => {
    setPicked(cur => cur.includes(vid) ? cur.filter(x => x !== vid) : [...cur, vid])
  }

  const save = () => {
    if (!selectedDecision) return
    linkValueToDecision(selectedDecision, picked)
    showToast(isAr ? 'تم الحفظ ✓' : 'Linked ✓', 'success', 1500)
  }

  if (values.length === 0) {
    return (
      <Layout title={isAr ? '✍️ قيمك في القرارات' : '✍️ Values in Action'}>
        <EmptyStateCard
          emoji="💎"
          titleAr="لم تحدد قيمك بعد" titleEn="No values ranked yet"
          bodyAr="لتربط القرارات بقيمك، تحتاج أولاً لترتيب أهم قيمك. يستغرق 10 دقائق."
          bodyEn="To link decisions to values, first rank your top values. Takes 10 minutes."
          ctaAr="رتّب قيمك" ctaEn="Rank your values"
          ctaPath="/values"
        />
      </Layout>
    )
  }

  if (decisions.length === 0) {
    return (
      <Layout title={isAr ? '✍️ قيمك في القرارات' : '✍️ Values in Action'}>
        <EmptyStateCard
          emoji="🧠"
          titleAr="لا قرارات مسجلة" titleEn="No decisions logged"
          bodyAr="كل قرار يشكّل مصيرك. ابدأ بتسجيل قراراتك الصعبة — ثم ربطها بقيمك."
          bodyEn="Every decision shapes your destiny. Start by logging tough decisions — then link them to your values."
          ctaAr="سجّل قرارك الأول" ctaEn="Log your first decision"
          ctaPath="/decisions"
        />
      </Layout>
    )
  }

  return (
    <Layout
      title={isAr ? '✍️ قيمك في القرارات' : '✍️ Values in Action'}
      subtitle={isAr ? 'أي قرار خدم قيمك — وأيها خانها؟' : 'Which decision served — and which betrayed?'}
    >
      <div className="space-y-4 pt-2">

        {/* Decisions list */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em', marginBottom: 8 }}>
            {isAr ? '📋 قراراتك الأخيرة' : '📋 Recent decisions'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {decisions.map(d => {
              const linked = (log[d.id]?.valueIds || []).length
              const selected = selectedDecision === d.id
              return (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDecision(d.id); setPicked(log[d.id]?.valueIds || []) }}
                  className="text-start rounded-xl p-3 transition-all"
                  style={{
                    background: selected ? 'rgba(201,168,76,0.12)' : '#0e0e0e',
                    border: `1px solid ${selected ? 'rgba(201,168,76,0.35)' : '#1e1e1e'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                        {d.decision || d.title || (isAr ? 'قرار بدون عنوان' : 'Untitled decision')}
                      </p>
                      <p style={{ fontSize: 9, color: '#666' }}>
                        {d.date || new Date(d.ts || Date.now()).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                      </p>
                    </div>
                    {linked > 0 && (
                      <span style={{
                        fontSize: 9, fontWeight: 900, color: '#c9a84c',
                        background: 'rgba(201,168,76,0.1)', padding: '2px 6px', borderRadius: 6,
                      }}>
                        {linked} {isAr ? 'قيم' : 'values'}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Link values to selected decision */}
        {current && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.3)' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 8, letterSpacing: '0.05em' }}>
              {isAr ? 'أي قيم خدمها هذا القرار؟' : 'Which values did this decision honor?'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {values.map((v, i) => {
                const vid = typeof v === 'string' ? v : (v.id || v.label || String(i))
                const vLabel = typeof v === 'string' ? v : (v.label || v.name || v.id || '')
                const sel = picked.includes(vid)
                return (
                  <button
                    key={vid}
                    onClick={() => togglePick(vid)}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
                    style={{
                      background: sel ? 'rgba(46,204,113,0.15)' : '#141414',
                      border: `1px solid ${sel ? 'rgba(46,204,113,0.4)' : '#222'}`,
                      color: sel ? '#2ecc71' : '#888',
                    }}
                  >
                    {sel && '✓ '}{vLabel}
                  </button>
                )
              })}
            </div>
            <button
              onClick={save}
              className="w-full mt-3 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.97]"
              style={{
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#c9a84c',
              }}
            >
              {isAr ? 'احفظ الربط' : 'Save Links'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
