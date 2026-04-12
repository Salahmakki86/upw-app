import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'

// ─── Data ───────────────────────────────────────────────────────────────────

const MOVEMENTS = {
  ar: ['قفزات المكان', 'ضغط الأرضية', 'الجري في المكان', 'وضعية القوة', 'القرفصاء', 'القفز على اليدين'],
  en: ['Jumping Jacks', 'Push-ups', 'Running in Place', 'Power Poses', 'Squats', 'Jump & Clap'],
}

const EMOTIONS = {
  ar: ['فرح', 'امتنان', 'قوة', 'محبة', 'سكينة', 'شغف'],
  en: ['Joy', 'Gratitude', 'Power', 'Love', 'Peace', 'Passion'],
}

const VISUALIZATIONS = {
  ar: [
    'تخيّل ذكرى جعلتك تشعر بفرح لا حدود له. استحضر تلك اللحظة الآن — الألوان، الأصوات، الإحساس في جسدك.',
    'فكّر في ثلاثة أشياء في حياتك تستحق الامتنان العميق. أحسّ بكل واحدة منها الآن.',
    'تذكّر لحظة شعرت فيها بقوة هائلة — حين تجاوزت حدودك. تلك القوة لا تزال فيك الآن.',
    'تخيّل من تحبهم وهم يحيطون بك. أشعر بدفء ذلك الحب يملأ قلبك.',
    'تنفّس ببطء واستحضر مشهداً هادئاً في الطبيعة. صوت المياه، الهواء النقي، الصمت الثمين.',
    'ما الذي يشعل شغفك الحقيقي؟ تخيّل نفسك تعيشه بكامل طاقتك وحيويتك.',
  ],
  en: [
    'Imagine a memory that made you feel limitless joy. Bring that moment back now — the colors, sounds, feeling in your body.',
    'Think of three things in your life deeply worth being grateful for. Feel each one right now.',
    'Remember a time you felt immense power — when you pushed past your limits. That power is still in you.',
    'Imagine those you love surrounding you. Feel the warmth of that love filling your heart.',
    'Breathe slowly and bring up a peaceful scene in nature. The sound of water, clean air, precious silence.',
    'What truly ignites your passion? Imagine yourself living it with full energy and vitality.',
  ],
}

const REFRAMES = {
  ar: [
    { q: 'ماذا لو كان هذا يحدث لـِ لا ضِدّي؟', a: 'كل عقبة هي دورة تحوّلية مُضمَرة في ثياب صعوبة مؤقتة.' },
    { q: 'ما الفرصة الخفية في هذا الموقف؟', a: 'الأزمة تحتوي دائماً على نفس الجذر اللغوي لكلمة "فرصة" في اليابانية.' },
    { q: 'ماذا سأقول لنفسي عن هذا بعد خمس سنوات؟', a: 'معظم ما يبدو كارثياً اليوم، سيبدو تافهاً أو نعمة خفية لاحقاً.' },
  ],
  en: [
    { q: 'What if this is happening FOR me, not TO me?', a: 'Every obstacle is a transformation disguised as temporary difficulty.' },
    { q: 'What hidden opportunity lives in this situation?', a: 'A crisis always contains the seed of opportunity — if you look for it.' },
    { q: 'What will I say to myself about this in five years?', a: 'Most of what feels catastrophic today will look trivial — or like a blessing.' },
  ],
}

const POWER_QUESTIONS = {
  ar: [
    'ما الذي يسعدني في حياتي الآن وبماذا أشعر؟',
    'ماذا أستطيع أن أكون ممتناً له في حياتي الآن؟',
    'ما الذي أنا متحمّس له في حياتي الآن؟',
    'ما الذي أنا ملتزم به في حياتي الآن؟',
    'ما الذي أستمتع به أكثر في حياتي الآن؟',
    'من أحبّ أكثر؟ ومن يحبني أكثر؟',
    'كيف أستطيع أن أعطي وأساهم اليوم؟',
  ],
  en: [
    'What am I happy about in my life right now, and what does that feel like?',
    'What am I grateful for in my life right now?',
    'What am I excited about in my life right now?',
    'What am I committed to in my life right now?',
    'What am I enjoying most in my life right now?',
    'Who do I love most? And who loves me?',
    'How can I give and contribute today?',
  ],
}

const TOOLS = [
  { id: 'breathing',  emoji: '💨', color: '#3498db',  ar: 'التنفس',            en: 'Breathing' },
  { id: 'movement',   emoji: '🏃', color: '#e67e22',  ar: 'الحركة',            en: 'Movement' },
  { id: 'flooding',   emoji: '🌊', color: '#9b59b6',  ar: 'الإغراق العاطفي',   en: 'Emotional Flooding' },
  { id: 'reframe',    emoji: '💬', color: '#2ecc71',  ar: 'إعادة التأطير',     en: 'Reframe' },
  { id: 'incantation',emoji: '🔥', color: '#c9a84c',  ar: 'التكرارات',         en: 'Incantations' },
  { id: 'question',   emoji: '⚡', color: '#e63946',  ar: 'سؤال التحول',       en: 'Power Question' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d.getTime()
}

// ─── Sub-views ───────────────────────────────────────────────────────────────

function BreathingView({ onDone, isAr }) {
  const [phase, setPhase] = useState(0) // 0=in,1=hold,2=out,3=hold2
  const [count, setCount] = useState(4)
  const [cycle, setCycle] = useState(1)
  const [scale, setScale] = useState(1)
  const timerRef = useRef(null)
  const TOTAL_CYCLES = 4
  const PHASES = isAr
    ? ['استنشق', 'احتفظ', 'أخرج', 'احتفظ']
    : ['Inhale', 'Hold', 'Exhale', 'Hold']

  useEffect(() => {
    setScale(phase === 0 ? 1.4 : phase === 2 ? 0.7 : 1)
  }, [phase])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(p => {
            const next = (p + 1) % 4
            if (p === 3) setCycle(cy => cy + 1)
            return next
          })
          return 4
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const done = cycle > TOTAL_CYCLES

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 text-center">
      {done ? (
        <>
          <div style={{ fontSize: 56 }}>✅</div>
          <p style={{ color: '#c9a84c', fontSize: 22, fontWeight: 700 }}>
            {isAr ? 'أحسنت! جهازك العصبي الآن هادئ.' : 'Well done! Your nervous system is calm.'}
          </p>
          <button
            onClick={onDone}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 16, padding: '14px 40px', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
          >
            {isAr ? 'رائع ✓' : 'Awesome ✓'}
          </button>
        </>
      ) : (
        <>
          <p style={{ color: '#888', fontSize: 14 }}>
            {isAr ? `دورة ${cycle} من ${TOTAL_CYCLES}` : `Cycle ${cycle} of ${TOTAL_CYCLES}`}
          </p>
          <div
            style={{
              width: 180, height: 180, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(52,152,219,0.35) 0%, rgba(52,152,219,0.08) 70%)',
              border: '3px solid #3498db',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `scale(${scale})`,
              transition: 'transform 1s ease-in-out',
              boxShadow: '0 0 40px rgba(52,152,219,0.3)',
            }}
          >
            <span style={{ fontSize: 40, fontWeight: 800, color: '#fff' }}>{count}</span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#3498db' }}>{PHASES[phase]}</p>
          <p style={{ color: '#555', fontSize: 13 }}>
            {isAr ? '4 - 4 - 4 - 4 — التنفس الصندوقي' : '4 - 4 - 4 - 4 — Box Breathing'}
          </p>
        </>
      )}
    </div>
  )
}

function MovementView({ onDone, isAr }) {
  const [timeLeft, setTimeLeft] = useState(60)
  const [started, setStarted] = useState(false)
  const [move] = useState(() => {
    const list = isAr ? MOVEMENTS.ar : MOVEMENTS.en
    return list[Math.floor(Math.random() * list.length)]
  })
  const timerRef = useRef(null)

  useEffect(() => {
    if (!started) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started])

  const done = timeLeft === 0

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 text-center">
      {done ? (
        <>
          <div style={{ fontSize: 56 }}>🔥</div>
          <p style={{ color: '#c9a84c', fontSize: 22, fontWeight: 700 }}>
            {isAr ? 'الطاقة تجري في عروقك!' : 'Energy is flowing!'}
          </p>
          <button
            onClick={onDone}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 16, padding: '14px 40px', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
          >
            {isAr ? 'رائع ✓' : 'Done ✓'}
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: 15, color: '#888' }}>
            {isAr ? 'تحدي 60 ثانية' : '60-second challenge'}
          </p>
          <p style={{ fontSize: 34, fontWeight: 800, color: '#e67e22' }}>{move}</p>
          {!started ? (
            <button
              onClick={() => setStarted(true)}
              style={{ background: 'linear-gradient(135deg,#e67e22,#d35400)', color: '#fff', borderRadius: 16, padding: '16px 48px', fontWeight: 700, fontSize: 18, border: 'none', cursor: 'pointer' }}
            >
              {isAr ? 'ابدأ الآن!' : 'Start Now!'}
            </button>
          ) : (
            <div
              style={{
                width: 140, height: 140, borderRadius: '50%',
                border: '4px solid #e67e22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(230,126,34,0.4)',
              }}
            >
              <span style={{ fontSize: 48, fontWeight: 900, color: '#e67e22' }}>{timeLeft}</span>
            </div>
          )}
          <p style={{ color: '#555', fontSize: 13 }}>
            {isAr ? 'تحرّك بأقصى طاقة ممكنة!' : 'Move with maximum intensity!'}
          </p>
        </>
      )}
    </div>
  )
}

function FloodingView({ onDone, isAr }) {
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [running, setRunning] = useState(false)
  const timerRef = useRef(null)
  const emotions = isAr ? EMOTIONS.ar : EMOTIONS.en
  const visualizations = isAr ? VISUALIZATIONS.ar : VISUALIZATIONS.en

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running])

  function choose(i) {
    setSelected(i)
    setTimeLeft(30)
    setRunning(true)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const done = selected !== null && timeLeft === 0

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
      {done ? (
        <>
          <div style={{ fontSize: 48 }}>💜</div>
          <p style={{ color: '#c9a84c', fontSize: 20, fontWeight: 700 }}>
            {isAr ? `أنا أختار أن أشعر بـ "${emotions[selected]}" الآن!` : `I choose to feel "${emotions[selected]}" NOW!`}
          </p>
          <button
            onClick={onDone}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 16, padding: '14px 40px', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
          >
            {isAr ? 'رائع ✓' : 'Done ✓'}
          </button>
        </>
      ) : selected === null ? (
        <>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {isAr ? 'اختر المشاعر التي تريدها' : 'Choose the emotion you want'}
          </p>
          <div className="grid grid-cols-3 gap-3 w-full">
            {emotions.map((e, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                style={{
                  background: 'rgba(155,89,182,0.15)',
                  border: '1px solid rgba(155,89,182,0.4)',
                  borderRadius: 14, padding: '16px 8px',
                  color: '#ce9ff5', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p style={{ color: '#9b59b6', fontSize: 14, fontWeight: 600 }}>
            {isAr ? `تغمّر في مشاعر الـ${emotions[selected]}` : `Flooding with ${emotions[selected]}`}
          </p>
          <p style={{ fontSize: 15, color: '#ddd', lineHeight: 1.7, maxWidth: 320 }}>
            {visualizations[selected]}
          </p>
          <div
            style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '3px solid #9b59b6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, color: '#9b59b6' }}>{timeLeft}</span>
          </div>
          <button
            onClick={() => choose(selected === EMOTIONS.ar.length - 1 ? 0 : selected)}
            style={{ color: '#9b59b6', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer' }}
          >
            {isAr ? '← اختر عاطفة أخرى' : '← Choose another'}
          </button>
        </>
      )}
    </div>
  )
}

function ReframeView({ onDone, isAr }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const reframes = isAr ? REFRAMES.ar : REFRAMES.en

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
      <p style={{ fontSize: 13, color: '#555' }}>
        {idx + 1} / {reframes.length}
      </p>
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          width: '100%', minHeight: 200, borderRadius: 20,
          background: flipped ? 'rgba(46,204,113,0.12)' : 'rgba(46,204,113,0.06)',
          border: '1px solid rgba(46,204,113,0.3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '28px 20px', cursor: 'pointer',
          transition: 'background 0.3s',
        }}
      >
        {!flipped ? (
          <>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#2ecc71', marginBottom: 12 }}>
              {reframes[idx].q}
            </p>
            <p style={{ fontSize: 12, color: '#555' }}>{isAr ? 'اضغط للإجابة' : 'Tap for the reframe'}</p>
          </>
        ) : (
          <p style={{ fontSize: 17, color: '#b8f5cf', lineHeight: 1.7 }}>
            {reframes[idx].a}
          </p>
        )}
      </div>
      <div className="flex gap-4 w-full">
        {idx < reframes.length - 1 ? (
          <button
            onClick={() => { setIdx(i => i + 1); setFlipped(false) }}
            style={{ flex: 1, background: 'linear-gradient(135deg,#2ecc71,#27ae60)', color: '#090909', borderRadius: 14, padding: '14px', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}
          >
            {isAr ? 'التالي →' : 'Next →'}
          </button>
        ) : (
          <button
            onClick={onDone}
            style={{ flex: 1, background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 14, padding: '14px', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}
          >
            {isAr ? 'تم ✓' : 'Done ✓'}
          </button>
        )}
      </div>
    </div>
  )
}

function IncantationView({ incantations, onDone, isAr }) {
  const subset = incantations.slice(0, 3)
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(5)
  const timerRef = useRef(null)

  useEffect(() => {
    setTimeLeft(5)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          if (current + 1 < subset.length) {
            setCurrent(c => c + 1)
          }
          return 5
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [current, subset.length])

  const finished = current >= subset.length

  if (!subset.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
        <p style={{ color: '#888' }}>
          {isAr ? 'لا توجد تكرارات — أضف من صفحة التكرارات أولاً' : 'No incantations — add some from the Incantations page first.'}
        </p>
        <button onClick={onDone} style={{ color: '#c9a84c', background: 'none', border: 'none', fontSize: 15, cursor: 'pointer' }}>
          {isAr ? 'رجوع' : 'Back'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
      {finished ? (
        <>
          <div style={{ fontSize: 48 }}>🔥</div>
          <p style={{ color: '#c9a84c', fontSize: 22, fontWeight: 700 }}>
            {isAr ? 'أنت قوة لا تُقهر!' : 'You are an unstoppable force!'}
          </p>
          <button
            onClick={onDone}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 16, padding: '14px 40px', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
          >
            {isAr ? 'رائع ✓' : 'Done ✓'}
          </button>
        </>
      ) : (
        <>
          <p style={{ color: '#888', fontSize: 13 }}>
            {current + 1} / {subset.length}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#c9a84c', lineHeight: 1.5, maxWidth: 320 }}>
            {subset[current]}
          </p>
          <div
            style={{
              width: 70, height: 70, borderRadius: '50%',
              border: '3px solid #c9a84c',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 800, color: '#c9a84c' }}>{timeLeft}</span>
          </div>
          <p style={{ color: '#888', fontSize: 14, maxWidth: 280 }}>
            {isAr ? '🫀 قل بصوت عالٍ وانقر صدرك!' : '🫀 Say out loud and tap your chest!'}
          </p>
          <button
            onClick={() => { clearInterval(timerRef.current); if (current + 1 < subset.length) setCurrent(c => c + 1); else onDone() }}
            style={{ color: '#c9a84c', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer' }}
          >
            {isAr ? 'التالية ←' : 'Next →'}
          </button>
        </>
      )}
    </div>
  )
}

function PowerQuestionView({ onDone, isAr }) {
  const [idx] = useState(() => Math.floor(Math.random() * POWER_QUESTIONS.ar.length))
  const [currentIdx, setCurrentIdx] = useState(idx)
  const [answer, setAnswer] = useState('')
  const questions = isAr ? POWER_QUESTIONS.ar : POWER_QUESTIONS.en

  return (
    <div className="flex flex-col justify-center h-full gap-6 px-6">
      <p style={{ color: '#e63946', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
        {isAr ? 'سؤال التحول' : 'Power Question'}
      </p>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.6, textAlign: 'center' }}>
        {questions[currentIdx]}
      </p>
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder={isAr ? 'اكتب إجابتك هنا...' : 'Write your answer here...'}
        rows={4}
        style={{
          background: '#111', border: '1px solid #333', borderRadius: 14,
          color: '#fff', fontSize: 15, padding: '14px 16px', resize: 'none',
          fontFamily: 'inherit', outline: 'none',
        }}
      />
      <div className="flex gap-3">
        <button
          onClick={() => { setCurrentIdx((currentIdx + 1) % questions.length); setAnswer('') }}
          style={{
            flex: 1, background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)',
            borderRadius: 14, padding: '14px', color: '#e63946', fontWeight: 700, fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {isAr ? 'سؤال آخر ←' : 'Next Question →'}
        </button>
        <button
          onClick={onDone}
          style={{ flex: 1, background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 14, padding: '14px', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
        >
          {isAr ? 'تم ✓' : 'Done ✓'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function EmergencyToolkit() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const [activeTool, setActiveTool] = useState(null)

  const emergencyLog = state.emergencyLog || []

  const weekStart = getWeekStart()
  const weekCount = emergencyLog.filter(e => e.ts >= weekStart).length

  function openTool(toolId) {
    setActiveTool(toolId)
  }

  function closeTool(toolId) {
    // Log the usage
    const newLog = [
      ...emergencyLog,
      { date: new Date().toISOString().split('T')[0], tool: toolId, ts: Date.now() },
    ]
    update('emergencyLog', newLog)
    showToast(isAr ? '✓ أداة الطوارئ مكتملة' : '✓ Emergency tool complete', 'gold')
    setActiveTool(null)
  }

  function renderToolView(toolId) {
    const tool = TOOLS.find(t => t.id === toolId)
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: '#0a0a0a',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '52px 20px 16px',
            background: `linear-gradient(180deg, rgba(${hexToRgb(tool.color)},0.12) 0%, transparent 100%)`,
            borderBottom: `1px solid rgba(${hexToRgb(tool.color)},0.2)`,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveTool(null)}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isAr ? '→' : '←'}
          </button>
          <span style={{ fontSize: 22 }}>{tool.emoji}</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: tool.color }}>
            {isAr ? tool.ar : tool.en}
          </span>
        </div>

        {/* Tool Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {toolId === 'breathing'   && <BreathingView   onDone={() => closeTool(toolId)} isAr={isAr} />}
          {toolId === 'movement'    && <MovementView    onDone={() => closeTool(toolId)} isAr={isAr} />}
          {toolId === 'flooding'    && <FloodingView    onDone={() => closeTool(toolId)} isAr={isAr} />}
          {toolId === 'reframe'     && <ReframeView     onDone={() => closeTool(toolId)} isAr={isAr} />}
          {toolId === 'incantation' && <IncantationView incantations={state.incantations || []} onDone={() => closeTool(toolId)} isAr={isAr} />}
          {toolId === 'question'    && <PowerQuestionView onDone={() => closeTool(toolId)} isAr={isAr} />}
        </div>
      </div>
    )
  }

  return (
    <Layout
      title={isAr ? '🚨 طقم الطوارئ' : '🚨 Emergency Toolkit'}
      subtitle={isAr ? 'التغيير يحدث في ثوانٍ' : 'Change happens in seconds'}
    >
      {activeTool && renderToolView(activeTool)}

      <div style={{ overflowY: 'auto', height: '100%', paddingBottom: 100 }}>
        {/* Hero */}
        <div
          style={{
            margin: '0 16px 24px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(230,57,70,0.2) 0%, rgba(201,168,76,0.1) 100%)',
            border: '1px solid rgba(230,57,70,0.3)',
            padding: '24px 20px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
            {isAr ? '🚨 وقت التغيير' : '🚨 Time to SHIFT'}
          </p>
          <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6 }}>
            {isAr
              ? 'اختر أداتك الآن — التغيير يحدث في ثوانٍ'
              : 'Choose your tool now — change happens in seconds'}
          </p>
        </div>

        {/* Tool Grid */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 12, padding: '0 16px',
          }}
        >
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => openTool(tool.id)}
              style={{
                background: `rgba(${hexToRgb(tool.color)},0.08)`,
                border: `1px solid rgba(${hexToRgb(tool.color)},0.3)`,
                borderRadius: 18,
                padding: '22px 14px',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                transition: 'transform 0.15s, box-shadow 0.15s',
                textAlign: 'center',
                minHeight: 120,
              }}
              onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.96)' }}
              onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              <span style={{ fontSize: 30 }}>{tool.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: tool.color }}>
                {isAr ? tool.ar : tool.en}
              </span>
            </button>
          ))}
        </div>

        {/* Usage Count */}
        <div
          style={{
            margin: '24px 16px 0',
            background: '#111',
            border: '1px solid #1e1e1e',
            borderRadius: 16,
            padding: '16px 20px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#888', fontSize: 14 }}>
            {isAr
              ? `📊 استخدمت هذه الأدوات ${weekCount} ${weekCount === 1 ? 'مرة' : 'مرات'} هذا الأسبوع`
              : `📊 You've used these tools ${weekCount} time${weekCount !== 1 ? 's' : ''} this week`}
          </p>
          {weekCount >= 5 && (
            <p style={{ color: '#c9a84c', fontSize: 12, marginTop: 6 }}>
              {isAr ? '⭐ أنت تبني عقلية لا تُقهر!' : '⭐ You\'re building an unbreakable mindset!'}
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}

// Utility: convert hex color to "r,g,b" string for rgba()
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '255,255,255'
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
}
