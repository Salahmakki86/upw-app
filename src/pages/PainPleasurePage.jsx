/**
 * PainPleasurePage — TR3 Pain-Pleasure Matrix
 *
 * Tony Robbins' Master Motivator: we act to AVOID pain and SEEK pleasure.
 * For every goal, the user writes:
 *   • Pain of NOT achieving it (5 consequences)
 *   • Pleasure of achieving it (5 rewards)
 *
 * The deeper the pain, the higher the motivation. This page makes
 * that leverage VISIBLE on every goal.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import EmptyStateCard from '../components/EmptyStateCard'

export default function PainPleasurePage() {
  const { state, setGoalPainPleasure } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const goals = state.goals || []

  const [selectedId, setSelectedId] = useState(goals[0]?.id || null)
  const selected = goals.find(g => g.id === selectedId)

  if (goals.length === 0) {
    return (
      <Layout title={isAr ? '⚔️ مصفوفة الألم واللذة' : '⚔️ Pain-Pleasure Matrix'}>
        <EmptyStateCard
          emoji="🎯"
          titleAr="لا أهداف بعد" titleEn="No Goals Yet"
          bodyAr="أضف أهدافك أولاً، ثم اربط كل هدف بألم تجنبه ولذة تحقيقه — هذا ما يمنحك قوة اتخاذ القرار."
          bodyEn="Add your goals first — then wire each to the pain of avoiding it and the pleasure of achieving it. That's what gives decisions their power."
          ctaAr="أضف هدفك الأول" ctaEn="Add your first goal"
          ctaPath="/goals"
        />
      </Layout>
    )
  }

  return (
    <Layout
      title={isAr ? '⚔️ الألم واللذة' : '⚔️ Pain & Pleasure'}
      subtitle={isAr ? 'لماذا هذا الهدف يستحق المعاناة؟' : 'Why this goal is worth the struggle'}
    >
      <div className="space-y-4 pt-2">

        {/* Goal selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedId(g.id)}
              className="rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition-all"
              style={{
                background: selectedId === g.id ? 'rgba(201,168,76,0.15)' : '#141414',
                border: `1px solid ${selectedId === g.id ? 'rgba(201,168,76,0.4)' : '#222'}`,
                color: selectedId === g.id ? '#c9a84c' : '#888',
                flexShrink: 0,
              }}
            >
              {g.emoji || '🎯'} {g.title}
            </button>
          ))}
        </div>

        {selected && (
          <PainPleasureEditor
            goal={selected}
            isAr={isAr}
            onSave={(pp) => {
              setGoalPainPleasure(selected.id, pp)
              showToast(isAr ? 'تم حفظ المصفوفة ✓' : 'Matrix saved ✓', 'success', 1500)
            }}
          />
        )}

        {/* Tony Robbins quote */}
        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, #1a1a1a, #0e0e0e)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}>
          <p style={{ fontSize: 11, color: '#ddd', fontStyle: 'italic', lineHeight: 1.6 }}>
            {isAr
              ? '"كل ما نفعله في الحياة مدفوع بقوتين فقط: البحث عن اللذة والهروب من الألم."'
              : '"Everything you and I do in life, we do either out of our need to avoid pain or desire to gain pleasure."'}
          </p>
          <p style={{ fontSize: 10, color: '#c9a84c', marginTop: 6, textAlign: 'end' }}>— Tony Robbins</p>
        </div>
      </div>
    </Layout>
  )
}

function PainPleasureEditor({ goal, isAr, onSave }) {
  const existing = goal.painPleasure || { pain: [], pleasure: [] }
  const [pain, setPain] = useState(existing.pain.length > 0 ? existing.pain : ['', '', '', '', ''])
  const [pleasure, setPleasure] = useState(existing.pleasure.length > 0 ? existing.pleasure : ['', '', '', '', ''])

  const updatePain = (i, v) => {
    const copy = [...pain]; copy[i] = v; setPain(copy)
  }
  const updatePleasure = (i, v) => {
    const copy = [...pleasure]; copy[i] = v; setPleasure(copy)
  }
  const handleSave = () => {
    onSave({
      pain: pain.filter(x => x.trim()),
      pleasure: pleasure.filter(x => x.trim()),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Goal header */}
      <div style={{ padding: '10px 14px', background: '#0e0e0e', borderRadius: 12, border: '1px solid #222' }}>
        <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c' }}>{isAr ? 'الهدف' : 'GOAL'}</p>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 4 }}>
          {goal.emoji || '🎯'} {goal.title}
        </p>
      </div>

      {/* PAIN section */}
      <div className="rounded-2xl p-4" style={{
        background: 'linear-gradient(135deg, rgba(230,57,70,0.08), transparent)',
        border: '1px solid rgba(230,57,70,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, color: '#e63946', letterSpacing: '0.05em' }}>
              {isAr ? 'ألم عدم التحقيق' : 'PAIN OF NOT ACHIEVING'}
            </p>
            <p style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>
              {isAr
                ? 'ماذا ستخسر؟ من ستخذل؟ كيف ستشعر بعد سنة؟'
                : 'What will you lose? Whom will you fail? How will you feel in a year?'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pain.map((p, i) => (
            <input
              key={i}
              value={p}
              onChange={e => updatePain(i, e.target.value)}
              placeholder={isAr ? `ألم ${i + 1}` : `Pain ${i + 1}`}
              className="w-full rounded-lg px-3 py-2 text-xs"
              style={{ background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.2)', color: '#fff' }}
            />
          ))}
        </div>
      </div>

      {/* PLEASURE section */}
      <div className="rounded-2xl p-4" style={{
        background: 'linear-gradient(135deg, rgba(46,204,113,0.08), transparent)',
        border: '1px solid rgba(46,204,113,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>🌟</span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, color: '#2ecc71', letterSpacing: '0.05em' }}>
              {isAr ? 'لذة التحقيق' : 'PLEASURE OF ACHIEVING'}
            </p>
            <p style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>
              {isAr
                ? 'ماذا ستربح؟ كيف ستشعر؟ من ستلهم؟'
                : 'What will you gain? How will you feel? Whom will you inspire?'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pleasure.map((p, i) => (
            <input
              key={i}
              value={p}
              onChange={e => updatePleasure(i, e.target.value)}
              placeholder={isAr ? `لذة ${i + 1}` : `Pleasure ${i + 1}`}
              className="w-full rounded-lg px-3 py-2 text-xs"
              style={{ background: 'rgba(46,204,113,0.05)', border: '1px solid rgba(46,204,113,0.2)', color: '#fff' }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.97]"
        style={{
          background: 'linear-gradient(135deg, #c9a84c, #e5c670)',
          color: '#000',
        }}
      >
        {isAr ? 'احفظ المصفوفة' : 'Save Matrix'}
      </button>

      {/* Link back to goals */}
      <Link to="/goals" style={{
        textAlign: 'center', fontSize: 11, color: '#888',
        textDecoration: 'underline',
      }}>
        ← {isAr ? 'رجوع للأهداف' : 'Back to goals'}
      </Link>
    </div>
  )
}
