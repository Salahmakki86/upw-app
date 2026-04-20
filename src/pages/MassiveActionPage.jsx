/**
 * MassiveActionPage — TR9 Massive Action
 *
 * Tony Robbins: "Ordinary actions produce ordinary results. Massive action
 * creates massive transformation."
 *
 * Each week, for each active goal, the user commits to ONE massive action
 * (not a small step — something that would be 'too much' to do).
 * They then log what they actually did and the outcome.
 */
import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import EmptyStateCard from '../components/EmptyStateCard'

function weekKey(date = new Date()) {
  const d = new Date(date.getTime())
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export default function MassiveActionPage() {
  const { state, setMassiveAction } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const thisWeek = weekKey()
  const log = state.massiveActionLog || {}
  const weekLog = log[thisWeek] || {}

  const goals = useMemo(() =>
    (state.goals || []).filter(g => !g.completed).slice(0, 6),
    [state.goals]
  )

  if (goals.length === 0) {
    return (
      <Layout title={isAr ? '🚀 الفعل الجبار' : '🚀 Massive Action'}>
        <EmptyStateCard
          emoji="🎯"
          titleAr="لا أهداف نشطة"  titleEn="No active goals"
          bodyAr="لتخطّط لفعل جبّار، تحتاج هدفاً نشطاً أولاً."
          bodyEn="Plan a massive action by first setting an active goal."
          ctaAr="أضف هدفك" ctaEn="Add a goal" ctaPath="/goals"
        />
      </Layout>
    )
  }

  return (
    <Layout
      title={isAr ? '🚀 الفعل الجبّار' : '🚀 Massive Action'}
      subtitle={isAr ? `أسبوع ${thisWeek}` : `Week ${thisWeek}`}
    >
      <div className="space-y-4 pt-2">

        {/* Intro */}
        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.08), transparent)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}>
          <p style={{ fontSize: 12, color: '#ddd', lineHeight: 1.6 }}>
            {isAr
              ? 'لكل هدف هذا الأسبوع: ماذا ستفعل؟ ليس خطوة صغيرة — شيء كبير يخيفك قليلاً.'
              : 'For each goal this week: what will you DO? Not a small step — something big that scares you a little.'}
          </p>
        </div>

        {/* Per-goal cards */}
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} weekKey={thisWeek} entry={weekLog[goal.id]}
            isAr={isAr} onSave={(patch) => {
              setMassiveAction(thisWeek, goal.id, patch)
              showToast(isAr ? 'تم الحفظ ✓' : 'Saved ✓', 'success', 1500)
            }} />
        ))}

        {/* Quote */}
        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, #1a1a1a, #0e0e0e)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}>
          <p style={{ fontSize: 11, color: '#ddd', fontStyle: 'italic', lineHeight: 1.6 }}>
            {isAr
              ? '"الفعل الجبّار هو الحبل الذي يربط الرؤية بالنتيجة."'
              : '"Massive action is the cure for most problems."'}
          </p>
          <p style={{ fontSize: 10, color: '#c9a84c', marginTop: 6, textAlign: 'end' }}>— Tony Robbins</p>
        </div>
      </div>
    </Layout>
  )
}

function GoalCard({ goal, weekKey, entry, isAr, onSave }) {
  const [plan, setPlan]       = useState(entry?.plan       || '')
  const [outcome, setOutcome] = useState(entry?.outcome    || '')
  const [status, setStatus]   = useState(entry?.status     || 'planned')
  const [expanded, setExpanded] = useState(false)

  const doSave = () => onSave({ plan, outcome, status, updatedAt: new Date().toISOString() })

  const statusColor = status === 'done' ? '#2ecc71'
    : status === 'progress' ? '#c9a84c'
    : status === 'missed' ? '#e63946'
    : '#888'

  return (
    <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <span style={{ fontSize: 22 }}>{goal.emoji || '🎯'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{goal.title}</p>
          <p style={{ fontSize: 10, color: statusColor, marginTop: 2 }}>
            {status === 'done'     ? (isAr ? '✓ تم' : '✓ Done')
             : status === 'progress' ? (isAr ? '⌛ قيد التنفيذ' : '⌛ In progress')
             : status === 'missed'   ? (isAr ? '✗ لم يحدث' : '✗ Missed')
             : (isAr ? '📝 خطّطت' : '📝 Planned')}
          </p>
        </div>
        <span style={{ color: '#888' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#c9a84c', marginBottom: 4 }}>
              {isAr ? 'فعلك الجبّار هذا الأسبوع' : 'Your massive action this week'}
            </p>
            <textarea
              value={plan}
              onChange={e => setPlan(e.target.value)}
              placeholder={isAr ? 'ماذا ستفعل؟ (كبير، يخيفك قليلاً)' : 'What will you DO? (big, scares you a bit)'}
              className="w-full rounded-lg p-2 text-xs"
              style={{ background: '#141414', border: '1px solid #222', color: '#fff', minHeight: 60 }}
            />
          </div>

          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#c9a84c', marginBottom: 4 }}>
              {isAr ? 'ماذا حدث؟ (نهاية الأسبوع)' : 'What happened? (end of week)'}
            </p>
            <textarea
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              placeholder={isAr ? 'النتيجة + ماذا تعلّمت' : 'Outcome + what you learned'}
              className="w-full rounded-lg p-2 text-xs"
              style={{ background: '#141414', border: '1px solid #222', color: '#fff', minHeight: 50 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'planned',  ar: 'خطّطت',  en: 'Planned' },
              { id: 'progress', ar: 'يجري',   en: 'Working' },
              { id: 'done',     ar: 'تم',    en: 'Done' },
              { id: 'missed',   ar: 'لم يحدث', en: 'Missed' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStatus(s.id)}
                className="flex-1 rounded-lg py-1.5 text-xs font-bold"
                style={{
                  background: status === s.id ? 'rgba(201,168,76,0.15)' : '#141414',
                  border: `1px solid ${status === s.id ? 'rgba(201,168,76,0.4)' : '#222'}`,
                  color: status === s.id ? '#c9a84c' : '#888',
                }}
              >
                {isAr ? s.ar : s.en}
              </button>
            ))}
          </div>

          <button
            onClick={doSave}
            className="w-full rounded-xl py-2 text-xs font-bold transition-all active:scale-[0.97]"
            style={{
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#c9a84c',
            }}
          >
            {isAr ? 'احفظ' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}
