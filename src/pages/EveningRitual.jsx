import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const EVENING_QUESTIONS = {
  ar: [
    'ماذا أعطيت اليوم؟ بأي طريقة كنت معطاءً؟',
    'ماذا تعلمت اليوم؟ ما الدرس الجديد؟',
    'كيف أضاف اليوم لجودة حياتي؟',
    'ما اللحظة الأجمل في يومي؟ وكيف شعرت؟',
    'كيف يمكنني استخدام اليوم كاستثمار في مستقبلي؟',
  ],
  en: [
    'What did I give today? In what ways was I generous?',
    'What did I learn today? What was the new lesson?',
    'How did today add to the quality of my life?',
    'What was the best moment of my day? How did I feel?',
    'How can I use today as an investment in my future?',
  ]
}

export default function EveningRitual() {
  const { update } = useApp()
  const { lang, t } = useLang()
  const [answers, setAnswers] = useState({})
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [gratitude, setGratitude] = useState(['', '', ''])
  const [dayRating, setDayRating] = useState(7)
  const [tomorrow, setTomorrow] = useState(['', '', ''])
  const [reflection, setReflection] = useState('')
  const [view, setView] = useState('questions')

  const QUESTIONS = EVENING_QUESTIONS[lang]
  const setGrat = (i, v) => { const g = [...gratitude]; g[i] = v; setGratitude(g) }
  const setTom  = (i, v) => { const tt = [...tomorrow]; tt[i] = v; setTomorrow(tt) }

  const saveAnswer = () => {
    if (!answer.trim()) return
    const newA = { ...answers, [qIndex]: answer }
    setAnswers(newA)
    setAnswer('')
    if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1)
    else setView('gratitude')
  }

  const finishEvening = () => {
    update('eveningDone', true)
    update('eveningAnswers', answers)
    setView('done')
  }

  if (view === 'done') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
          <div className="text-5xl animate-scale-in">🌙</div>
          <h2 className="text-2xl font-black text-white">{t('evening_completed')}</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
            {lang === 'ar' ? 'نمت بوعٍ اليوم وستستيقظ غداً أقوى.' : 'You slept consciously today and will wake up stronger tomorrow.'}
          </p>
          <div className="rounded-2xl p-4 w-full"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
              {t('evening_rating')}: {dayRating}/10
            </p>
            <div className="progress-bar-bg mt-1">
              <div className="progress-bar-fill" style={{ width: `${dayRating * 10}%` }} />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (view === 'tomorrow') {
    return (
      <Layout title={t('evening_planning')} subtitle={lang === 'ar' ? 'خطط لغدك الليلة' : 'Plan your tomorrow tonight'}>
        <div className="space-y-4 pt-2">
          <div>
            <p className="text-xs mb-2" style={{ color: '#888' }}>{t('evening_tomorrow_tasks')}:</p>
            {tomorrow.map((v, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black w-5 text-center" style={{ color: '#c9a84c' }}>{i + 1}</span>
                <input value={v} onChange={e => setTom(i, e.target.value)}
                  placeholder={t('evening_task_placeholder')} className="input-dark flex-1 text-sm py-2" />
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs mb-2" style={{ color: '#888' }}>{t('evening_reflection')}:</p>
            <textarea value={reflection} onChange={e => setReflection(e.target.value)}
              placeholder={t('evening_reflection_placeholder')} rows={3} className="input-dark resize-none text-sm" />
          </div>
          <div>
            <p className="text-xs mb-2" style={{ color: '#888' }}>{t('evening_rating')}: {dayRating}/10</p>
            <input type="range" min={1} max={10} value={dayRating}
              onChange={e => setDayRating(Number(e.target.value))}
              style={{ accentColor: '#c9a84c' }} className="w-full" />
          </div>
          <button onClick={finishEvening} className="w-full btn-gold py-4 text-base">
            🌙 {lang === 'ar' ? 'إنهاء اليوم' : 'End the day'}
          </button>
        </div>
      </Layout>
    )
  }

  if (view === 'gratitude') {
    return (
      <Layout title={t('evening_gratitude')} subtitle={t('evening_gratitude_desc')}>
        <div className="space-y-4 pt-2">
          <p className="text-xs" style={{ color: '#888' }}>
            {lang === 'ar'
              ? 'الامتنان يُغلق يومك بحالة جميلة ويبرمج عقلك الباطن للإيجابية أثناء النوم.'
              : 'Gratitude closes your day in a beautiful state and programs your subconscious for positivity during sleep.'}
          </p>
          {gratitude.map((g, i) => (
            <div key={i}>
              <p className="text-xs mb-1 font-bold" style={{ color: '#c9a84c' }}>
                {i === 0 ? '🌟 1' : i === 1 ? '💛 2' : '🙏 3'}
              </p>
              <textarea value={g} onChange={e => setGrat(i, e.target.value)}
                placeholder={t('evening_gratitude_placeholder')} rows={2} className="input-dark resize-none text-sm" />
            </div>
          ))}
          <button onClick={() => setView('tomorrow')} disabled={!gratitude.some(g => g.trim())}
            className="w-full btn-gold py-3 text-sm disabled:opacity-40">
            {t('evening_planning')} →
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={t('evening_title')} subtitle={t('evening_subtitle')}>
      <div className="space-y-4 pt-2">
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
        <p className="text-xs text-center" style={{ color: '#888' }}>
          {lang === 'ar' ? `السؤال ${qIndex + 1} من ${QUESTIONS.length}` : `Question ${qIndex + 1} of ${QUESTIONS.length}`}
        </p>
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-base font-bold text-white leading-relaxed">{QUESTIONS[qIndex]}</p>
        </div>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)}
          placeholder={t('morning_type_answer')} rows={4} className="input-dark resize-none text-sm" />
        <button onClick={saveAnswer} disabled={!answer.trim()}
          className="w-full btn-gold py-3 text-sm disabled:opacity-40">
          {qIndex < QUESTIONS.length - 1 ? `${t('next')} →` : `${t('evening_gratitude')} ✓`}
        </button>
        <button onClick={() => setView('gratitude')} className="w-full text-xs py-1" style={{ color: '#444' }}>
          {t('skip')} → {t('evening_gratitude')}
        </button>
      </div>
    </Layout>
  )
}
