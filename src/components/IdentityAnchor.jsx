/**
 * IdentityAnchor — TR1 Daily Identity Check
 *
 * Two modes:
 *   • compact (default) — line banner visible at top of every page
 *   • full — morning/evening check-in with 1-10 slider & reframe coaching
 *
 * Purpose: constantly remind the user of WHO they are, then score action alignment.
 * "The strongest force in the human personality is the need to stay consistent with
 *  how we define ourselves." — Tony Robbins
 */
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import {
  getPrimaryIdentity,
  getAlignmentTrend,
  getIdentityReframe,
  getTodayCheckinStatus,
  getIdentityCoachingQuestion,
} from '../utils/identityEngine'

function scoreColor(n) {
  if (n == null) return '#888'
  if (n >= 8) return '#2ecc71'
  if (n >= 6) return '#c9a84c'
  if (n >= 4) return '#f39c12'
  return '#e63946'
}

export default function IdentityAnchor({ variant = 'compact', showQuestion = false }) {
  const { state, recordIdentityAlignment } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const identity = getPrimaryIdentity(state, isAr)
  const trend = getAlignmentTrend(state)
  const reframe = getIdentityReframe(state, isAr)
  const status = getTodayCheckinStatus(state)
  const coachingQ = useMemo(() => getIdentityCoachingQuestion(state, isAr), [state, isAr])

  // Block the anchor if the user has hidden it via settings
  const hidden = state.uiPreferences?.identityAnchorHidden
  if (hidden) return null

  // ──────────────────── COMPACT LINE ────────────────────
  if (variant === 'compact') {
    return (
      <div
        className="px-3 py-2 rounded-xl transition-all"
        style={{
          background: 'linear-gradient(90deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))',
          border: '1px solid rgba(201,168,76,0.18)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>🎭</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.04em' }}>
            {isAr ? 'أنا' : 'I AM'}
          </div>
          <div
            style={{
              fontSize: 11, fontWeight: 700, color: '#e8e0c6',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
            title={identity}
          >
            {identity}
          </div>
        </div>
        {trend.avg !== null && (
          <div
            style={{
              minWidth: 32, height: 32, borderRadius: '50%',
              background: `${scoreColor(trend.avg)}15`,
              border: `2px solid ${scoreColor(trend.avg)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 900, color: scoreColor(trend.avg),
            }}
            title={isAr ? `متوسط الانسجام — آخر ٧ أيام` : `7-day alignment average`}
          >
            {trend.avg}
          </div>
        )}
      </div>
    )
  }

  // ──────────────────── FULL CHECK-IN CARD ────────────────────
  return <IdentityFullCard identity={identity} trend={trend} reframe={reframe} status={status}
    coachingQ={coachingQ} isAr={isAr} showQuestion={showQuestion}
    recordIdentityAlignment={recordIdentityAlignment} showToast={showToast} />
}

function IdentityFullCard({ identity, trend, reframe, status, coachingQ, isAr, showQuestion, recordIdentityAlignment, showToast }) {
  const hour = new Date().getHours()
  const defaultWhen = hour < 14 ? 'morning' : 'evening'
  const [when, setWhen] = useState(defaultWhen)
  const [score, setScore] = useState(() => {
    const existing = when === 'morning' ? status.morningScore : status.eveningScore
    return existing || 7
  })

  const alreadyDone = when === 'morning' ? status.morningDone : status.eveningDone

  const save = () => {
    recordIdentityAlignment(when, score, identity)
    showToast(isAr ? 'تم تسجيل انسجامك ✓' : 'Alignment logged ✓', 'success', 1500)
  }

  return (
    <div className="rounded-2xl p-4" style={{
      background: '#0e0e0e',
      border: '1px solid #1e1e1e',
    }}>
      {/* Header: identity statement */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 12px', borderRadius: 12,
        background: 'linear-gradient(90deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))',
        border: '1px solid rgba(201,168,76,0.20)',
        marginBottom: 14,
      }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>🎭</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em', marginBottom: 4 }}>
            {isAr ? 'أنا' : 'I AM'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#e8e0c6', lineHeight: 1.4 }}>
            {identity}
          </div>
        </div>
      </div>

      {/* Morning/Evening toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['morning', 'evening'].map(key => (
          <button
            key={key}
            onClick={() => {
              setWhen(key)
              const existing = key === 'morning' ? status.morningScore : status.eveningScore
              if (typeof existing === 'number') setScore(existing)
            }}
            className="flex-1 rounded-xl py-2 text-xs font-bold transition-all active:scale-[0.97]"
            style={{
              background: when === key ? 'rgba(201,168,76,0.15)' : '#111',
              border: `1px solid ${when === key ? 'rgba(201,168,76,0.4)' : '#222'}`,
              color: when === key ? '#c9a84c' : '#888',
            }}
          >
            {key === 'morning'
              ? (isAr ? '☀️ صباحاً' : '☀️ Morning')
              : (isAr ? '🌙 مساءً' : '🌙 Evening')}
            {((key === 'morning' && status.morningDone) || (key === 'evening' && status.eveningDone)) && ' ✓'}
          </button>
        ))}
      </div>

      {/* Prompt */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', marginBottom: 8 }}>
        {when === 'morning'
          ? (isAr ? `ما مدى ثقتك أنك ستتصرف اليوم كـ "${identity}"؟` : `How confident you'll act as "${identity}" today?`)
          : (isAr ? `ما مدى انسجام أفعال اليوم مع "${identity}"؟` : `How aligned were today's actions with "${identity}"?`)}
      </div>

      {/* Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <input
          type="range" min={1} max={10} value={score}
          onChange={e => setScore(Number(e.target.value))}
          style={{ flex: 1, accentColor: scoreColor(score) }}
        />
        <span style={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${scoreColor(score)}15`, border: `2px solid ${scoreColor(score)}`,
          fontSize: 12, fontWeight: 900, color: scoreColor(score),
        }}>{score}</span>
      </div>

      {/* Coaching question (optional) */}
      {showQuestion && coachingQ && (
        <div style={{
          padding: '8px 10px', borderRadius: 10,
          background: 'rgba(201,168,76,0.05)',
          border: '1px dashed rgba(201,168,76,0.3)',
          fontSize: 10, color: '#c9a84c', fontStyle: 'italic',
          marginBottom: 12,
        }}>
          💭 {coachingQ.q}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={save}
        className="w-full rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.97]"
        style={{
          background: 'rgba(201,168,76,0.12)',
          border: '1px solid rgba(201,168,76,0.3)',
          color: '#c9a84c',
        }}
      >
        {alreadyDone
          ? (isAr ? '↻ تحديث الانسجام' : '↻ Update Alignment')
          : (isAr ? 'سجّل انسجامك' : 'Log Alignment')}
      </button>

      {/* Reframe */}
      {reframe && (
        <div style={{
          marginTop: 12, padding: '10px 12px', borderRadius: 10,
          background: reframe.tone === 'celebrate' ? 'rgba(46,204,113,0.08)'
            : reframe.tone === 'encourage' ? 'rgba(201,168,76,0.08)'
            : 'rgba(230,57,70,0.08)',
          border: `1px solid ${
            reframe.tone === 'celebrate' ? 'rgba(46,204,113,0.25)'
            : reframe.tone === 'encourage' ? 'rgba(201,168,76,0.25)'
            : 'rgba(230,57,70,0.25)'}`,
          fontSize: 11, color: '#ddd', lineHeight: 1.5,
        }}>
          {isAr ? reframe.ar : reframe.en}
        </div>
      )}
    </div>
  )
}
