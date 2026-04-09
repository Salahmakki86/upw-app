import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const COMMON_LIMITING = [
  'أنا لست جيداً بما يكفي',
  'فات الأوان على التغيير',
  'أنا لا أستحق النجاح',
  'الحياة صعبة ولا شيء يأتي بسهولة',
  'لا يمكنني كسب المال وأنا شخص جيد',
  'أنا لن أجد الحب الحقيقي',
  'النجاح يجلب المشاكل',
  'أنا كسول بطبعي',
]

const DICKENS_TIMEFRAMES = [
  { label: 'الماضي', questions: [
    'ما الذي كلّفني هذا المعتقد في الماضي؟',
    'ما الفرص التي فاتتني بسببه؟',
    'كيف أثّر على علاقاتي مع من أحب؟',
    'ما الثمن الذي دفعه من حولي بسبب هذا المعتقد؟',
  ]},
  { label: 'الحاضر', questions: [
    'ما الذي يكلّفني هذا المعتقد الآن؟',
    'كيف يحدّ من حياتي اليوم؟',
    'ما الفرص التي أخسرها حالياً بسببه؟',
    'كيف يؤثر على طاقتي وصحتي اليومية؟',
  ]},
  { label: 'سنة من الآن', questions: [
    'إذا لم أتغير: كيف ستكون حياتي بعد سنة؟',
    'ما الذي سأخسره في العلاقات والصحة والمال؟',
    'كيف سأشعر وأنا أنظر لنفسي؟',
  ]},
  { label: '5 سنوات', questions: [
    'ما الثمن المتراكم بعد 5 سنوات؟',
    'ماذا سيفكر أطفالي أو من أحبهم عني؟',
    'ما الأحلام التي ستبقى مدفونة؟',
  ]},
  { label: '10 سنوات', questions: [
    'كيف سأبدو وأشعر بعد 10 سنوات؟',
    'ما الكارثة الكاملة إذا استمررت هكذا؟',
    'هل ستندم؟ ما الذي ستقوله لنفسك؟',
  ]},
]

function DickensProcess({ belief, onClose }) {
  const [phase, setPhase] = useState('pain')   // pain | joy | decision
  const [tfIndex, setTfIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [qIndex, setQIndex] = useState(0)
  const [newBelief, setNewBelief] = useState('')
  const [committed, setCommitted] = useState(false)

  const currentTF = DICKENS_TIMEFRAMES[tfIndex]
  const currentQ  = currentTF.questions[qIndex]
  const totalQs   = DICKENS_TIMEFRAMES.reduce((s, tf) => s + tf.questions.length, 0)
  const doneQs    = DICKENS_TIMEFRAMES.slice(0, tfIndex).reduce((s, tf) => s + tf.questions.length, 0) + qIndex

  const saveAnswer = () => {
    if (!currentAnswer.trim()) return
    const key = `${tfIndex}-${qIndex}`
    setAnswers(a => ({ ...a, [key]: currentAnswer }))
    setCurrentAnswer('')

    if (qIndex < currentTF.questions.length - 1) {
      setQIndex(qIndex + 1)
    } else if (tfIndex < DICKENS_TIMEFRAMES.length - 1) {
      setTfIndex(tfIndex + 1)
      setQIndex(0)
    } else {
      setPhase('joy')
    }
  }

  if (committed) {
    return (
      <div className="flex flex-col items-center text-center py-8 space-y-4 animate-scale-in">
        <div className="text-5xl">🏆</div>
        <h3 className="text-xl font-black text-white">التحول اكتمل!</h3>
        <p className="text-sm" style={{ color: '#888' }}>
          من هذه اللحظة أنت شخص جديد بمعتقد جديد
        </p>
        <div
          className="rounded-2xl p-4 w-full text-right"
          style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)' }}
        >
          <p className="text-xs mb-1" style={{ color: '#2ecc71' }}>معتقدك الجديد:</p>
          <p className="font-bold text-white">{newBelief}</p>
        </div>
        <button onClick={onClose} className="btn-gold px-8 py-3 mt-2">مكتمل ✓</button>
      </div>
    )
  }

  if (phase === 'decision') {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="text-center">
          <p className="text-2xl mb-2">⚔️</p>
          <h3 className="text-lg font-black text-white">القرار الحاسم</h3>
          <p className="text-xs mt-1" style={{ color: '#888' }}>
            اشطب المعتقد القديم إلى الأبد واعتنق الجديد
          </p>
        </div>
        <div
          className="rounded-2xl p-4 line-through opacity-50"
          style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)' }}
        >
          <p className="text-sm text-white">{belief}</p>
        </div>
        <p className="text-center text-xl">↓</p>
        <div>
          <p className="text-xs mb-2" style={{ color: '#2ecc71' }}>✨ معتقدك الجديد التمكيني:</p>
          <textarea
            value={newBelief}
            onChange={e => setNewBelief(e.target.value)}
            placeholder="اكتب المعتقد الجديد بصيغة إيجابية وحاضرة..."
            rows={3}
            className="input-dark resize-none text-sm"
          />
        </div>
        <button
          onClick={() => setCommitted(true)}
          disabled={!newBelief.trim()}
          className="w-full btn-gold py-4 text-base disabled:opacity-40"
        >
          ✊ أتعهد بهذا المعتقد الجديد!
        </button>
      </div>
    )
  }

  if (phase === 'joy') {
    return (
      <div className="space-y-4 animate-fade-in">
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
        >
          <p className="text-3xl mb-2">🌟</p>
          <h3 className="text-lg font-black text-white">الآن — رحلة المتعة</h3>
          <p className="text-xs mt-1" style={{ color: '#888' }}>
            تخيّل حياتك بعد التغيير — اشعل مشاعر الفرح والأمل
          </p>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>
          أغمض عينيك وتخيّل: بعد سنة من الآن وأنت تعيش بدون هذا المعتقد المقيّد —
          كيف تبدو حياتك؟ كيف تشعر؟ ما الإنجازات التي حققتها؟ كيف تبدو علاقاتك؟
        </p>
        <textarea
          placeholder="صِف مستقبلك المشرق بكل تفاصيله..."
          rows={5}
          className="input-dark resize-none text-sm"
        />
        <button
          onClick={() => setPhase('decision')}
          className="w-full btn-gold py-3 text-sm"
        >
          القرار الحاسم →
        </button>
      </div>
    )
  }

  // Pain phase
  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)' }}
      >
        <p className="text-xs mb-1" style={{ color: '#e63946' }}>المعتقد المقيّد:</p>
        <p className="font-bold text-white text-sm">{belief}</p>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: '#888' }}>
          <span>{currentTF.label}</span>
          <span>{doneQs}/{totalQs}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${(doneQs / totalQs) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <div
        className="rounded-2xl p-4"
        style={{ background: '#111', border: '1px solid #1e1e1e' }}
      >
        <p className="text-sm font-bold text-white leading-relaxed">{currentQ}</p>
        <p className="text-xs mt-2" style={{ color: '#e63946' }}>
          ⚠️ لا تتجاوز هذا السؤال — عِش الألم بعمق
        </p>
      </div>

      <textarea
        value={currentAnswer}
        onChange={e => setCurrentAnswer(e.target.value)}
        placeholder="اكتب إجابتك بصدق وعمق..."
        rows={4}
        className="input-dark resize-none text-sm"
      />

      <button
        onClick={saveAnswer}
        disabled={!currentAnswer.trim()}
        className="w-full py-3 rounded-2xl font-bold text-sm disabled:opacity-40"
        style={{ background: '#1a1a1a', border: '1px solid #333', color: '#e63946' }}
      >
        التالي — اشعر بالألم →
      </button>
    </div>
  )
}

export default function Beliefs() {
  const { state, addBelief, removeBelief } = useApp()
  const { lang, t } = useLang()
  const [view, setView] = useState('list')
  const [dickensBelief, setDickensBelief] = useState('')
  const [newLimiting, setNewLimiting] = useState('')
  const [newEmpowering, setNewEmpowering] = useState('')

  const startDickens = (belief) => { setDickensBelief(belief); setView('dickens') }

  if (view === 'dickens') {
    return (
      <Layout title={t('beliefs_dickens')} subtitle={lang === 'ar' ? 'رحلة التحول العميق' : 'Deep Transformation Journey'}>
        <div className="pt-2">
          <DickensProcess belief={dickensBelief} onClose={() => setView('list')} lang={lang} t={t} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={t('beliefs_title')} subtitle={t('beliefs_subtitle')}>
      <div className="space-y-5 pt-2">

        {/* Intro */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>
            {lang === 'ar'
              ? <>المعتقدات هي أوامر مباشرة لجهازك العصبي. استخدم <span style={{ color: '#c9a84c' }}>عملية ديكنز</span> لتغيير أعمق معتقداتك إلى الأبد.</>
              : <>Beliefs are direct commands to your nervous system. Use the <span style={{ color: '#c9a84c' }}>Dickens Process</span> to change your deepest beliefs forever.</>}
          </p>
        </div>

        {/* Limiting Beliefs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title m-0">{t('beliefs_limiting')}</p>
            <span className="text-xs" style={{ color: '#e63946' }}>{state.limitingBeliefs.length}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_LIMITING.map(b => (
              <button key={b} onClick={() => addBelief('limiting', b)}
                className="text-xs px-2.5 py-1 rounded-full transition-all"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}>
                + {b}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input value={newLimiting} onChange={e => setNewLimiting(e.target.value)}
              placeholder={t('beliefs_add_limiting')} className="input-dark flex-1 text-xs py-2"
              onKeyDown={e => { if (e.key === 'Enter' && newLimiting.trim()) { addBelief('limiting', newLimiting); setNewLimiting('') } }} />
            <button onClick={() => { if (newLimiting.trim()) { addBelief('limiting', newLimiting); setNewLimiting('') } }}
              className="px-3 rounded-xl"
              style={{ background: 'rgba(230,57,70,0.15)', color: '#e63946', border: '1px solid rgba(230,57,70,0.3)' }}>
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {state.limitingBeliefs.map(b => (
              <div key={b.id} className="rounded-xl p-3 flex items-center justify-between"
                style={{ background: 'rgba(230,57,70,0.07)', border: '1px solid rgba(230,57,70,0.2)' }}>
                <p className="text-sm text-white flex-1">{b.text}</p>
                <div className="flex gap-1 mr-2">
                  <button onClick={() => startDickens(b.text)}
                    className="text-xs px-2 py-1 rounded-lg font-bold transition-all"
                    style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                    {t('beliefs_dickens')} ⚡
                  </button>
                  <button onClick={() => removeBelief('limiting', b.id)} className="p-1.5 rounded-lg" style={{ color: '#555' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {state.limitingBeliefs.length === 0 && (
              <p className="text-xs text-center py-3" style={{ color: '#555' }}>{t('beliefs_empty_limiting')}</p>
            )}
          </div>
        </div>

        {/* Empowering Beliefs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title m-0">{t('beliefs_empowering')}</p>
            <span className="text-xs" style={{ color: '#2ecc71' }}>{state.empoweringBeliefs.length}</span>
          </div>
          <div className="flex gap-2 mb-3">
            <input value={newEmpowering} onChange={e => setNewEmpowering(e.target.value)}
              placeholder={t('beliefs_add_empowering')} className="input-dark flex-1 text-xs py-2"
              onKeyDown={e => { if (e.key === 'Enter' && newEmpowering.trim()) { addBelief('empowering', newEmpowering); setNewEmpowering('') } }} />
            <button onClick={() => { if (newEmpowering.trim()) { addBelief('empowering', newEmpowering); setNewEmpowering('') } }}
              className="px-3 rounded-xl"
              style={{ background: 'rgba(46,204,113,0.15)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.3)' }}>
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {state.empoweringBeliefs.map(b => (
              <div key={b.id} className="rounded-xl p-3 flex items-center justify-between"
                style={{ background: 'rgba(46,204,113,0.07)', border: '1px solid rgba(46,204,113,0.2)' }}>
                <p className="text-sm text-white flex-1">{b.text}</p>
                <button onClick={() => removeBelief('empowering', b.id)} className="p-1.5 rounded-lg mr-2" style={{ color: '#555' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {state.empoweringBeliefs.length === 0 && (
              <p className="text-xs text-center py-3" style={{ color: '#555' }}>{t('beliefs_empty_empowering')}</p>
            )}
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-2xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
            💡 {lang === 'ar' ? 'كيف تغيّر معتقدًا؟' : 'How to change a belief?'}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
            {lang === 'ar'
              ? 'المعتقد مثل طاولة — أرجلها هي الأدلة. اكسر الأدلة القديمة وابنِ أدلة جديدة.'
              : 'A belief is like a table — its legs are the evidence. Break the old evidence and build new ones.'}
          </p>
        </div>
      </div>
    </Layout>
  )
}
