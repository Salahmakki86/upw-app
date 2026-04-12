/**
 * #4 — Decision Journal
 * Log important decisions with reasoning, track outcomes
 */
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

export default function DecisionJournal() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const decisions = state.decisionJournal || []
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ decision: '', reason: '', alternatives: '', expectedResult: '', emotion: '' })
  const [expandedId, setExpandedId] = useState(null)
  const [reviewText, setReviewText] = useState('')

  const EMOTIONS = [
    { emoji: '😤', ar: 'غضب', en: 'Angry' },
    { emoji: '😰', ar: 'خوف', en: 'Fear' },
    { emoji: '🤔', ar: 'تحليل', en: 'Analytical' },
    { emoji: '😊', ar: 'ثقة', en: 'Confident' },
    { emoji: '🔥', ar: 'حماس', en: 'Excited' },
    { emoji: '😐', ar: 'محايد', en: 'Neutral' },
  ]

  const saveDecision = () => {
    if (!form.decision.trim()) return
    const newDecision = {
      id: Date.now(),
      ...form,
      date: new Date().toISOString().slice(0, 10),
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      review: null,
    }
    update('decisionJournal', [newDecision, ...decisions])
    setForm({ decision: '', reason: '', alternatives: '', expectedResult: '', emotion: '' })
    setShowForm(false)
  }

  const saveReview = (id) => {
    const updated = decisions.map(d =>
      d.id === id ? { ...d, review: { text: reviewText.trim(), date: new Date().toISOString().slice(0, 10) } } : d
    )
    update('decisionJournal', updated)
    setReviewText('')
  }

  const deleteDecision = (id) => {
    update('decisionJournal', decisions.filter(d => d.id !== id))
  }

  // Decisions needing review (30+ days old, no review)
  const today = new Date().toISOString().slice(0, 10)
  const needsReview = decisions.filter(d => !d.review && d.reviewDate <= today)

  const formatDate = (d) => new Date(d).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <Layout
      title={isAr ? 'سجل القرارات' : 'Decision Journal'}
      subtitle={isAr ? 'في لحظات قراراتك يتشكل مصيرك' : 'Your destiny is shaped in your moments of decision'}
    >
      <div className="space-y-4 pt-2">

        {/* Needs Review Alert */}
        {needsReview.length > 0 && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)' }}>
            <p className="text-xs font-bold" style={{ color: '#e74c3c' }}>
              ⏰ {needsReview.length} {isAr ? 'قرار يحتاج مراجعة — ماذا حصل؟' : 'decision(s) need review — what happened?'}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <div className="text-xl font-black" style={{ color: '#c9a84c' }}>{decisions.length}</div>
            <div className="text-xs" style={{ color: '#888' }}>{isAr ? 'قرار' : 'Decisions'}</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <div className="text-xl font-black" style={{ color: '#2ecc71' }}>{decisions.filter(d => d.review).length}</div>
            <div className="text-xs" style={{ color: '#888' }}>{isAr ? 'تمت مراجعته' : 'Reviewed'}</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <div className="text-xl font-black" style={{ color: '#e74c3c' }}>{needsReview.length}</div>
            <div className="text-xs" style={{ color: '#888' }}>{isAr ? 'ينتظر مراجعة' : 'Pending'}</div>
          </div>
        </div>

        {/* Add Decision */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)}
            className="w-full rounded-xl py-3 font-bold text-sm transition-all active:scale-[0.98]"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c' }}>
            + {isAr ? 'سجّل قراراً جديداً' : 'Log a New Decision'}
          </button>
        ) : (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              📝 {isAr ? 'قرار جديد' : 'New Decision'}
            </p>

            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#c9a84c' }}>
                ⚡ {isAr ? 'القرار' : 'The Decision'}
              </label>
              <textarea value={form.decision} onChange={e => setForm(f => ({ ...f, decision: e.target.value }))}
                placeholder={isAr ? 'ما القرار الذي اتخذته؟' : 'What decision did you make?'}
                rows={2} className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none"
                style={{ background: '#111', border: '1px solid #333', outline: 'none' }} />
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#3498db' }}>
                🧠 {isAr ? 'لماذا؟ (المنطق)' : 'Why? (Reasoning)'}
              </label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder={isAr ? 'ما المنطق وراء هذا القرار؟' : 'What reasoning led to this decision?'}
                rows={2} className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none"
                style={{ background: '#111', border: '1px solid #333', outline: 'none' }} />
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#9b59b6' }}>
                🔄 {isAr ? 'البدائل التي رفضتها' : 'Alternatives Rejected'}
              </label>
              <input type="text" value={form.alternatives} onChange={e => setForm(f => ({ ...f, alternatives: e.target.value }))}
                placeholder={isAr ? 'ما الخيارات الأخرى التي كانت متاحة؟' : 'What other options were available?'}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
                style={{ background: '#111', border: '1px solid #333', outline: 'none' }} />
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#2ecc71' }}>
                🎯 {isAr ? 'النتيجة المتوقعة' : 'Expected Outcome'}
              </label>
              <input type="text" value={form.expectedResult} onChange={e => setForm(f => ({ ...f, expectedResult: e.target.value }))}
                placeholder={isAr ? 'ماذا تتوقع أن يحدث؟' : 'What do you expect to happen?'}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
                style={{ background: '#111', border: '1px solid #333', outline: 'none' }} />
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: '#e67e22' }}>
                💭 {isAr ? 'حالتي العاطفية عند القرار' : 'My Emotional State'}
              </label>
              <div className="flex gap-2 flex-wrap">
                {EMOTIONS.map(em => (
                  <button key={em.emoji} onClick={() => setForm(f => ({ ...f, emotion: em.emoji }))}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all"
                    style={{
                      background: form.emotion === em.emoji ? '#c9a84c25' : '#111',
                      border: `1px solid ${form.emotion === em.emoji ? '#c9a84c' : '#333'}`,
                      color: form.emotion === em.emoji ? '#c9a84c' : '#666',
                    }}>
                    {em.emoji} {isAr ? em.ar : em.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={saveDecision} disabled={!form.decision.trim()} className="btn-gold flex-1 text-sm py-2.5 disabled:opacity-40">
                💾 {isAr ? 'احفظ' : 'Save'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 text-sm py-2.5 rounded-xl" style={{ background: '#2a2a2a', color: '#888' }}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Decision List */}
        {decisions.length === 0 && !showForm && (
          <div className="text-center py-8" style={{ color: '#555' }}>
            <div className="text-5xl mb-3">📝</div>
            <p className="text-sm">{isAr ? 'سجّل أول قرار مهم لتبدأ تعلم أنماط قراراتك' : 'Log your first important decision to start learning your patterns'}</p>
          </div>
        )}

        {decisions.map(d => {
          const isExpanded = expandedId === d.id
          const needsRev = !d.review && d.reviewDate <= today
          return (
            <div key={d.id} className="rounded-2xl overflow-hidden"
              style={{ background: '#0e0e0e', border: `1px solid ${needsRev ? '#e74c3c30' : '#1e1e1e'}` }}>
              <button onClick={() => setExpandedId(isExpanded ? null : d.id)}
                className="w-full p-3 flex items-start gap-3" style={{ textAlign: isAr ? 'right' : 'left' }}>
                <span className="text-xl flex-shrink-0">{d.emotion || '⚡'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{d.decision}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#888' }}>{formatDate(d.date)}</p>
                </div>
                {d.review && <span className="text-xs" style={{ color: '#2ecc71' }}>✓</span>}
                {needsRev && <span className="text-xs" style={{ color: '#e74c3c' }}>⏰</span>}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {d.reason && (
                    <div className="rounded-lg p-2" style={{ background: '#1a1a1a' }}>
                      <p className="text-xs font-bold" style={{ color: '#3498db' }}>🧠 {isAr ? 'السبب' : 'Reasoning'}</p>
                      <p className="text-xs text-white mt-0.5">{d.reason}</p>
                    </div>
                  )}
                  {d.alternatives && (
                    <div className="rounded-lg p-2" style={{ background: '#1a1a1a' }}>
                      <p className="text-xs font-bold" style={{ color: '#9b59b6' }}>🔄 {isAr ? 'البدائل' : 'Alternatives'}</p>
                      <p className="text-xs text-white mt-0.5">{d.alternatives}</p>
                    </div>
                  )}
                  {d.expectedResult && (
                    <div className="rounded-lg p-2" style={{ background: '#1a1a1a' }}>
                      <p className="text-xs font-bold" style={{ color: '#2ecc71' }}>🎯 {isAr ? 'المتوقع' : 'Expected'}</p>
                      <p className="text-xs text-white mt-0.5">{d.expectedResult}</p>
                    </div>
                  )}

                  {/* Review section */}
                  {d.review ? (
                    <div className="rounded-lg p-2" style={{ background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)' }}>
                      <p className="text-xs font-bold" style={{ color: '#2ecc71' }}>✅ {isAr ? 'المراجعة' : 'Review'} ({formatDate(d.review.date)})</p>
                      <p className="text-xs text-white mt-0.5">{d.review.text}</p>
                    </div>
                  ) : needsRev ? (
                    <div className="rounded-lg p-2 space-y-2" style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)' }}>
                      <p className="text-xs font-bold" style={{ color: '#e74c3c' }}>
                        ⏰ {isAr ? 'حان وقت المراجعة — ماذا حصل فعلاً؟' : 'Review time — what actually happened?'}
                      </p>
                      <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                        placeholder={isAr ? 'ما النتيجة الفعلية؟ ماذا تعلمت؟' : 'What was the actual outcome? What did you learn?'}
                        rows={2} className="w-full rounded-lg px-3 py-2 text-xs text-white resize-none"
                        style={{ background: '#111', border: '1px solid #333', outline: 'none' }} />
                      <button onClick={() => saveReview(d.id)} disabled={!reviewText.trim()}
                        className="btn-gold w-full text-xs py-2 disabled:opacity-40">
                        💾 {isAr ? 'احفظ المراجعة' : 'Save Review'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-center" style={{ color: '#444' }}>
                      📅 {isAr ? `مراجعة في ${formatDate(d.reviewDate)}` : `Review on ${formatDate(d.reviewDate)}`}
                    </p>
                  )}

                  <button onClick={() => deleteDecision(d.id)}
                    className="text-xs w-full py-1.5 rounded-lg" style={{ background: '#e74c3c10', color: '#e74c3c' }}>
                    🗑 {isAr ? 'حذف' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
