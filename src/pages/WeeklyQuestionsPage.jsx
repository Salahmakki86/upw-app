/**
 * WeeklyQuestionsPage — TR7 Weekly Power Questions
 *
 * Tony Robbins teaches that the quality of your life is the quality
 * of your questions. Once a week, the user answers a fixed set of
 * power questions that focus attention, reveal progress, and
 * surface leverage points for the next week.
 */
import { useMemo, useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

const QUESTIONS = [
  { id: 'q1', ar: 'ما أفضل شيء حدث لي هذا الأسبوع؟', en: 'What\'s the best thing that happened this week?' },
  { id: 'q2', ar: 'لماذا أنا ممتن؟ من وما ولماذا؟', en: 'What am I grateful for? Who, what, and why?' },
  { id: 'q3', ar: 'ماذا أنجزت؟ ماذا تعلمت؟',       en: 'What did I accomplish? What did I learn?' },
  { id: 'q4', ar: 'ما الفرصة التي فوّتها — ولماذا؟', en: 'What opportunity did I miss — and why?' },
  { id: 'q5', ar: 'ماذا لو عشت الأسبوع من جديد — ما الذي سأغيره؟', en: 'If I relived this week — what would I change?' },
  { id: 'q6', ar: 'أكبر قرار عليّ اتخاذه الأسبوع القادم؟', en: 'Biggest decision I must make next week?' },
  { id: 'q7', ar: 'فعل جبّار واحد للأسبوع القادم؟', en: 'One massive action for next week?' },
]

function weekKey(date = new Date()) {
  const d = new Date(date.getTime())
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export default function WeeklyQuestionsPage() {
  const { state, saveWeeklyPowerQuestions } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const thisWeek = weekKey()
  const log = state.weeklyQuestionsLog || {}
  const existing = log[thisWeek] || {}

  const [answers, setAnswers] = useState(existing)

  useEffect(() => { setAnswers(existing) }, [thisWeek]) // eslint-disable-line react-hooks/exhaustive-deps

  const setAnswer = (id, value) => setAnswers(a => ({ ...a, [id]: value }))

  const filled = QUESTIONS.filter(q => (answers[q.id] || '').trim()).length
  const pct = Math.round((filled / QUESTIONS.length) * 100)

  const save = () => {
    saveWeeklyPowerQuestions(thisWeek, answers)
    showToast(isAr ? 'تم حفظ أسئلة الأسبوع ✓' : 'Weekly questions saved ✓', 'success', 1800)
  }

  const past = useMemo(() => {
    return Object.keys(log).filter(k => k !== thisWeek).sort().reverse().slice(0, 4)
  }, [log, thisWeek])

  return (
    <Layout
      title={isAr ? '🧩 أسئلة القوة الأسبوعية' : '🧩 Weekly Power Questions'}
      subtitle={isAr ? `جودة حياتك = جودة أسئلتك` : 'Quality of life = quality of questions'}
    >
      <div className="space-y-4 pt-2">

        {/* Progress header */}
        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.1), transparent)',
          border: '1px solid rgba(201,168,76,0.25)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#c9a84c' }}>
              {isAr ? `أسبوع ${thisWeek}` : `Week ${thisWeek}`}
            </p>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#c9a84c' }}>
              {filled}/{QUESTIONS.length}
            </p>
          </div>
          <div style={{ height: 5, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: 'linear-gradient(90deg, #c9a84c, #e5c670)', transition: 'width 0.4s',
            }}/>
          </div>
        </div>

        {/* Questions */}
        {QUESTIONS.map((q, i) => (
          <div key={q.id} className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c', marginBottom: 6 }}>
              {i + 1}. {isAr ? q.ar : q.en}
            </p>
            <textarea
              value={answers[q.id] || ''}
              onChange={e => setAnswer(q.id, e.target.value)}
              placeholder={isAr ? 'اكتب بصدق...' : 'Answer honestly...'}
              className="w-full rounded-lg p-2 text-xs"
              style={{ background: '#141414', border: '1px solid #222', color: '#fff', minHeight: 70 }}
            />
          </div>
        ))}

        <button
          onClick={save}
          className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #c9a84c, #e5c670)',
            color: '#000',
          }}
        >
          {isAr ? 'احفظ الإجابات' : 'Save Answers'}
        </button>

        {/* Previous weeks */}
        {past.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 8 }}>
              {isAr ? '📅 أسابيع سابقة' : '📅 Previous weeks'}
            </p>
            {past.map(wk => {
              const entry = log[wk]
              const count = QUESTIONS.filter(q => (entry[q.id] || '').trim()).length
              return (
                <div key={wk} style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: '#141414', border: '1px solid #222', marginBottom: 4,
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 11, color: '#ddd', fontWeight: 700 }}>{wk}</span>
                  <span style={{ fontSize: 10, color: count >= 5 ? '#2ecc71' : '#888' }}>
                    {count}/{QUESTIONS.length}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
