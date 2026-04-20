/**
 * BlueprintCheckPage — TR8 Blueprint Check (monthly)
 *
 * Tony Robbins' Blueprint:
 *   "The gap between where you are and where you want to be
 *    is your Blueprint. The gap between your Blueprint and what
 *    you're willing to DO is your true problem."
 *
 * Once a month, the user reviews:
 *   1. Where am I vs where I thought I'd be?
 *   2. What's the real gap?
 *   3. What am I willing to change TODAY?
 */
import { useState, useMemo } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

export default function BlueprintCheckPage() {
  const { state, saveBlueprintCheck } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const [where, setWhere] = useState('')
  const [expected, setExpected] = useState('')
  const [gap, setGap] = useState('')
  const [change, setChange] = useState('')
  const [rating, setRating] = useState(5)

  const previous = useMemo(() =>
    (state.blueprintCheckLog || []).slice(-4).reverse()
  , [state.blueprintCheckLog])

  const save = () => {
    if (!where.trim() || !change.trim()) {
      showToast(isAr ? 'أكمل الحقول الأساسية' : 'Fill the key fields', 'error', 1500)
      return
    }
    saveBlueprintCheck({ where, expected, gap, change, rating, month: new Date().toISOString().slice(0, 7) })
    setWhere(''); setExpected(''); setGap(''); setChange(''); setRating(5)
    showToast(isAr ? 'تم حفظ المراجعة ✓' : 'Check saved ✓', 'success', 1800)
  }

  return (
    <Layout
      title={isAr ? '🔭 مراجعة الخطة' : '🔭 Blueprint Check'}
      subtitle={isAr ? 'الفجوة بين ما أنت عليه وما تريده' : 'The gap between who you are and who you want to be'}
    >
      <div className="space-y-4 pt-2">

        {/* Intro quote */}
        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.1), transparent)',
          border: '1px solid rgba(201,168,76,0.25)',
        }}>
          <p style={{ fontSize: 12, color: '#ddd', lineHeight: 1.6, fontStyle: 'italic' }}>
            {isAr
              ? '"الفجوة بين ما أنت عليه وما تريد أن تكون هي خطّتك. الفجوة بين خطّتك وما تستعد لفعله هي مشكلتك الحقيقية."'
              : '"The gap between where you are and where you want to be is your Blueprint. The gap between your Blueprint and what you\'re willing to DO is your real problem."'}
          </p>
          <p style={{ fontSize: 10, color: '#c9a84c', marginTop: 6, textAlign: 'end' }}>— Tony Robbins</p>
        </div>

        {/* Form */}
        <Field
          label={isAr ? '1. أين أنا الآن؟' : '1. Where am I now?'}
          placeholder={isAr ? 'وصف واقعي لواقعك اليوم' : 'A realistic description of your today'}
          value={where} onChange={setWhere}
        />
        <Field
          label={isAr ? '2. أين توقعت أن أكون؟' : '2. Where did I expect to be?'}
          placeholder={isAr ? 'الصورة التي رسمتها لنفسك' : 'The picture you painted for yourself'}
          value={expected} onChange={setExpected}
        />
        <Field
          label={isAr ? '3. ما الفجوة الحقيقية؟' : '3. What is the REAL gap?'}
          placeholder={isAr ? 'ليست حجم الفجوة — بل سببها' : 'Not the size — the cause'}
          value={gap} onChange={setGap}
        />
        <Field
          label={isAr ? '4. ما الذي أنا مستعد لتغييره اليوم؟' : '4. What am I willing to change TODAY?'}
          placeholder={isAr ? 'فعل محدد، قابل للتنفيذ، الآن' : 'A specific action, executable, now'}
          value={change} onChange={setChange}
          accent="#2ecc71"
        />

        {/* Rating */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#bbb', marginBottom: 8 }}>
            {isAr ? 'ما مدى رضاك عن تقدمك هذا الشهر؟' : 'How satisfied with your progress this month?'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="range" min={1} max={10} value={rating}
              onChange={e => setRating(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#c9a84c' }}
            />
            <span style={{
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(201,168,76,0.15)', border: '2px solid #c9a84c',
              fontSize: 12, fontWeight: 900, color: '#c9a84c',
            }}>{rating}</span>
          </div>
        </div>

        <button
          onClick={save}
          className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #c9a84c, #e5c670)',
            color: '#000',
          }}
        >
          {isAr ? 'احفظ المراجعة الشهرية' : 'Save Monthly Check'}
        </button>

        {/* Past 4 months */}
        {previous.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 10 }}>
              {isAr ? '📜 آخر المراجعات' : '📜 Previous checks'}
            </p>
            {previous.map(p => (
              <div key={p.id} style={{
                padding: '10px 12px', background: '#141414',
                border: '1px solid #222', borderRadius: 10, marginBottom: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#c9a84c' }}>{p.month}</p>
                  <span style={{
                    fontSize: 10, fontWeight: 900, color: '#c9a84c',
                    background: 'rgba(201,168,76,0.1)', padding: '2px 8px', borderRadius: 6,
                  }}>{p.rating}/10</span>
                </div>
                {p.gap && (
                  <p style={{ fontSize: 10, color: '#aaa', lineHeight: 1.4 }}>
                    <strong>{isAr ? 'الفجوة: ' : 'Gap: '}</strong>{p.gap}
                  </p>
                )}
                {p.change && (
                  <p style={{ fontSize: 10, color: '#2ecc71', lineHeight: 1.4, marginTop: 4 }}>
                    <strong>→ </strong>{p.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

function Field({ label, placeholder, value, onChange, accent = '#c9a84c' }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: accent, marginBottom: 6 }}>{label}</p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg p-2 text-xs"
        style={{ background: '#141414', border: '1px solid #222', color: '#fff', minHeight: 60 }}
      />
    </div>
  )
}
