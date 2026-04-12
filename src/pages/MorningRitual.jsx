import { useState, useEffect, useRef } from 'react'
import { CheckCircle, Play, Pause, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const PHASES_DATA = {
  ar: [
    { id: 0, title: 'التنفس النشط', subtitle: 'Breath of Fire', emoji: '💨', duration: 180, color: '#3498db',
      instruction: 'ارفع يديك عند الشهيق وأنزلهما بقوة عند الزفير. 30 نفساً قوياً × 3 مجموعات.',
      steps: ['ارفع يديك فوق رأسك — شهيق عميق', 'أنزل يديك بقوة — زفير قوي من الأنف', 'كرر 30 مرة — استرح 10 ثوانٍ', 'كرر المجموعة 3 مرات'] },
    { id: 1, title: 'الامتنان', subtitle: 'Gratitude', emoji: '🙏', duration: 180, color: '#c9a84c',
      instruction: 'ضع يدك على قلبك. تخيّل 3 لحظات تشعر بامتنان عميق تجاهها. عِش كل لحظة بكل حواسك.',
      steps: ['ضع يدك على قلبك', 'تخيّل اللحظة الأولى بكل تفاصيلها', 'اشعر بالامتنان حتى تدمع عيناك', 'كرر مع لحظتين أخريين'] },
    { id: 2, title: 'الشفاء والعطاء', subtitle: 'Healing & Giving', emoji: '✨', duration: 180, color: '#2ecc71',
      instruction: 'تخيّل نوراً ذهبياً يدخل قلبك ويشفي كل خلية. ثم أرسل هذا النور لمن تحبهم.',
      steps: ['تخيّل نوراً ذهبياً يغمر جسمك', 'اشعر بالدفء والشفاء في كل خلية', 'أرسل هذا النور لشخص تحبه', 'أرسله لشخص يحتاجه'] },
    { id: 3, title: 'تخيّل الأهداف', subtitle: 'Visualization', emoji: '🎯', duration: 180, color: '#9b59b6',
      instruction: 'تخيّل أهدافك وعِشها كأنها تحققت الآن. اشعل مشاعر الفرح والفخر والامتنان.',
      steps: ['أغمض عينيك وتنفس بعمق', 'تخيّل هدفك الأول محققاً — ماذا ترى؟', 'اشعر بالفرح والفخر كاملاً', 'كرر مع كل هدف من أهدافك'] },
  ],
  en: [
    { id: 0, title: 'Power Breathing', subtitle: 'Breath of Fire', emoji: '💨', duration: 180, color: '#3498db',
      instruction: 'Raise your arms on the inhale, push them down powerfully on exhale. 30 powerful breaths × 3 rounds.',
      steps: ['Raise your arms above your head — deep inhale', 'Push arms down forcefully — powerful exhale through nose', 'Repeat 30 times — rest 10 seconds', 'Repeat the round 3 times'] },
    { id: 1, title: 'Gratitude', subtitle: 'Gratitude', emoji: '🙏', duration: 180, color: '#c9a84c',
      instruction: 'Place your hand on your heart. Vividly imagine 3 moments you feel deeply grateful for. Live each moment with all your senses.',
      steps: ['Place your hand on your heart', 'Vividly imagine the first moment in full detail', 'Feel gratitude until you are moved to tears', 'Repeat with two more moments'] },
    { id: 2, title: 'Healing & Giving', subtitle: 'Healing & Giving', emoji: '✨', duration: 180, color: '#2ecc71',
      instruction: 'Imagine a golden light entering your heart, healing every cell. Then send this light to the people you love.',
      steps: ['Imagine a golden light flooding your body', 'Feel the warmth and healing in every cell', 'Send this light to someone you love', 'Send it to someone who needs it'] },
    { id: 3, title: 'Visualization', subtitle: 'Visualization', emoji: '🎯', duration: 180, color: '#9b59b6',
      instruction: 'Vividly visualize 3 goals as if they are already achieved. Ignite feelings of joy, pride, and gratitude.',
      steps: ['Close your eyes and breathe deeply', 'See your first goal achieved — what do you see?', 'Feel the joy and pride fully', 'Repeat with your other goals'] },
  ]
}

const POWER_QUESTIONS = {
  ar: [
    'ما الذي أشعر بالسعادة تجاهه في حياتي الآن؟ ولماذا؟',
    'ما الذي أشعر بالحماس تجاهه الآن؟ ولماذا أنا متحمس؟',
    'ما الذي أشعر بالفخر تجاهه في حياتي؟',
    'ما الذي أشعر بالامتنان تجاهه الآن؟',
    'من أحب؟ ومن يحبني؟ وكيف يجعلني ذلك أشعر؟',
    'ما الذي ألتزم به في حياتي الآن؟',
    'ما الخطوة الواحدة التي سأتخذها اليوم لأقترب من هدفي الأكبر؟',
  ],
  en: [
    'What am I happy about in my life right now? And why?',
    'What am I excited about right now? Why am I excited?',
    'What am I proud of in my life?',
    'What am I grateful for right now?',
    'Who do I love? Who loves me? How does that make me feel?',
    'What am I committed to in my life right now?',
    'What is the one step I will take today to get closer to my biggest goal?',
  ]
}

function BreathingCircle({ active, phase }) {
  return (
    <div className="relative flex items-center justify-center my-6">
      <div className="absolute rounded-full"
        style={{ width: 200, height: 200, border: `2px solid ${phase.color}22`,
          animation: active ? 'breath 4s ease-in-out infinite alternate' : 'none' }} />
      <div className="absolute rounded-full"
        style={{ width: 160, height: 160, border: `2px solid ${phase.color}44`,
          animation: active ? 'breath 4s ease-in-out infinite alternate' : 'none', animationDelay: '0.3s' }} />
      <div className="relative rounded-full flex items-center justify-center"
        style={{ width: 120, height: 120, background: `${phase.color}18`, border: `2px solid ${phase.color}66`,
          boxShadow: active ? `0 0 30px ${phase.color}44` : 'none',
          animation: active ? 'breath 4s ease-in-out infinite alternate' : 'none', animationDelay: '0.6s' }}>
        <span className="text-5xl">{phase.emoji}</span>
      </div>
    </div>
  )
}

function PhaseTimer({ phase, onComplete, t }) {
  const [timeLeft, setTimeLeft] = useState(phase.duration)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(v => {
          if (v <= 1) { clearInterval(intervalRef.current); setRunning(false); setDone(true); return 0 }
          return v - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const secs = (timeLeft % 60).toString().padStart(2, '0')
  const pct = ((phase.duration - timeLeft) / phase.duration) * 100

  return (
    <div className="space-y-4">
      <BreathingCircle active={running} phase={phase} />
      <div className="text-center">
        <div className="text-5xl font-black tracking-widest"
          style={{ color: done ? '#2ecc71' : phase.color, fontVariantNumeric: 'tabular-nums' }}>
          {mins}:{secs}
        </div>
        <div className="progress-bar-bg mt-3 mx-8">
          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${phase.color}88, ${phase.color})` }} />
        </div>
      </div>
      <div className="card space-y-2">
        {phase.steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-xs font-bold mt-0.5 w-4 text-center" style={{ color: phase.color }}>{i + 1}</span>
            <p className="text-xs text-white leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
      {!done ? (
        <div className="flex gap-3">
          <button onClick={() => setRunning(!running)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-tr-black transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${phase.color}cc, ${phase.color})` }}>
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? t('pause') : t('start')}
          </button>
          <button onClick={() => { setTimeLeft(phase.duration); setRunning(false); setDone(false) }}
            className="p-3 rounded-2xl" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <RotateCcw size={18} style={{ color: '#888' }} />
          </button>
        </div>
      ) : (
        <button onClick={onComplete}
          className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 animate-scale-in"
          style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: '#fff' }}>
          <CheckCircle size={18} />
          {t('next')} →
        </button>
      )}
    </div>
  )
}

const VIDEO_URL = 'https://www.youtube.com/embed/faTGTgid8Uc?start=787'

export default function MorningRitual() {
  const { state, completeMorning, update } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'
  const [activePhase, setActivePhase] = useState(0)
  const [view, setView] = useState('phases')
  const [answers, setAnswers] = useState({})
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [videoMode, setVideoMode] = useState(false)

  const PHASES = PHASES_DATA[lang]
  const QUESTIONS = POWER_QUESTIONS[lang]
  const donePhases = state.primingPhasesDone || []

  const handlePhaseComplete = (phaseId) => {
    const newDone = [...new Set([...donePhases, phaseId])]
    update('primingPhasesDone', newDone)
    if (phaseId < PHASES.length - 1) setActivePhase(phaseId + 1)
    else setView('questions')
  }

  const saveAnswer = () => {
    if (!answer.trim()) return
    const newAnswers = { ...answers, [qIndex]: answer }
    setAnswers(newAnswers)
    setAnswer('')
    if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1)
    else { update('morningAnswers', newAnswers); setView('incantations') }
  }

  const finishMorning = () => { completeMorning(); setView('done') }

  if (view === 'done') {
    return (
      <Layout title="">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="text-6xl mb-4 animate-scale-in">🏆</div>
          <h2 className="text-2xl font-black text-white mb-2">{t('morning_completed')}</h2>
          <p className="text-sm mb-6" style={{ color: '#888' }}>
            {lang === 'ar' ? 'أنت جاهز لتحقق العظمة اليوم' : 'You are ready to achieve greatness today'}
          </p>
          <div className="rounded-2xl p-4 text-center mb-6 w-full"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>🔥 {state.streak} {lang === 'ar' ? 'يوم متواصل' : 'days in a row'}</p>
            <p className="text-xs mt-1" style={{ color: '#888' }}>
              {lang === 'ar' ? 'أنت تبني شخصاً جديداً كل يوم' : 'You are building a new version of yourself every day'}
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  if (view === 'incantations') {
    // Pull DWD identity statements as extra incantations
    const dwdIdentity = (state.dwd?.identityStatements || '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    return (
      <Layout title={t('morning_incantations_title')} subtitle={t('morning_incantations_desc')}>
        <div className="space-y-4 pt-2">
          <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
            {isAr
              ? 'ردد كل تكرار بصوت عالٍ مع الحركة الجسدية. لا تقرأها فحسب — عِشها بكل جسمك!'
              : "Say each incantation out loud with physical movement. Don't just read them — LIVE them with your whole body!"}
          </p>

          {/* Regular incantations */}
          {state.incantations.map((inc, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <span className="text-xs font-bold mb-2 block" style={{ color: '#c9a84c' }}>#{i + 1}</span>
              <p className="text-base font-bold text-white leading-relaxed">{inc}</p>
            </div>
          ))}

          {/* DWD Identity Statements — only if user filled them */}
          {dwdIdentity.length > 0 && (
            <>
              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px" style={{ background: '#9b59b630' }} />
                <span className="text-xs font-bold" style={{ color: '#9b59b6' }}>
                  🪞 {isAr ? 'هويتك الجديدة (من موعد مع القدر)' : 'Your New Identity (from DWD)'}
                </span>
                <div className="flex-1 h-px" style={{ background: '#9b59b630' }} />
              </div>
              {dwdIdentity.map((stmt, i) => (
                <div key={`dwd-${i}`} className="rounded-2xl p-4"
                  style={{ background: '#12101a', border: '1px solid #9b59b630' }}>
                  <span className="text-xs font-bold mb-2 block" style={{ color: '#9b59b6' }}>
                    🪞 {isAr ? 'هويتي' : 'My Identity'}
                  </span>
                  <p className="text-base font-bold text-white leading-relaxed">{stmt}</p>
                </div>
              ))}
            </>
          )}

          <button onClick={finishMorning} className="w-full btn-gold py-4 mt-4 text-base">
            ✓ {isAr ? 'انتهيت — الصباح مكتمل!' : 'Done — Morning complete!'}
          </button>
        </div>
      </Layout>
    )
  }

  if (view === 'questions') {
    return (
      <Layout title={t('morning_questions_title')} subtitle={`${lang === 'ar' ? 'السؤال' : 'Question'} ${qIndex + 1} / ${QUESTIONS.length}`}>
        <div className="space-y-4 pt-2">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%` }} />
          </div>
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-base font-bold text-white leading-relaxed">{QUESTIONS[qIndex]}</p>
          </div>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder={t('morning_type_answer')}
            rows={4}
            className="input-dark resize-none text-sm"
          />
          <button onClick={saveAnswer} disabled={!answer.trim()}
            className="w-full btn-gold py-3 text-sm disabled:opacity-40">
            {qIndex < QUESTIONS.length - 1 ? `${t('next')} →` : `${t('done')} ✓`}
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={t('morning_title')} subtitle={t('morning_subtitle')} helpKey="morning">
      <div className="space-y-4 pt-2">

        {/* Mode toggle */}
        <div className="flex rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid #222' }}>
          <button
            onClick={() => setVideoMode(false)}
            className="flex-1 py-2.5 text-xs font-bold transition-all"
            style={{
              background: !videoMode ? 'linear-gradient(135deg, #c9a84c, #a88930)' : 'transparent',
              color: !videoMode ? '#090909' : '#555',
            }}
          >
            ⚡ {isAr ? 'التفاعلي' : 'Interactive'}
          </button>
          <button
            onClick={() => setVideoMode(true)}
            className="flex-1 py-2.5 text-xs font-bold transition-all"
            style={{
              background: videoMode ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'transparent',
              color: videoMode ? '#fff' : '#555',
            }}
          >
            ▶ {isAr ? 'مع توني' : 'With Tony'}
          </button>
        </div>

        {/* Video mode */}
        {videoMode && (
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #2a2a2a', background: '#000' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={VIDEO_URL}
                  title="Morning Priming with Tony Robbins"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.2)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#e74c3c' }}>
                🎬 {isAr ? 'طقوس الصباح مع توني روبينز' : 'Morning Priming with Tony Robbins'}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
                {isAr
                  ? 'الفيديو يبدأ من لحظة التمرين مباشرةً (13:07). اتبع توني خطوة بخطوة.'
                  : 'Video starts directly at the exercise (13:07). Follow Tony step by step.'}
              </p>
            </div>
            <button
              onClick={() => setView('questions')}
              className="w-full py-3 rounded-2xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}
            >
              {isAr ? 'انتهيت من الفيديو ← الأسئلة' : 'Done with video → Questions'} ✓
            </button>
          </div>
        )}

        {/* Interactive mode */}
        {!videoMode && (
          <>
            <div className="grid grid-cols-4 gap-1.5">
              {PHASES.map((ph) => {
                const done = donePhases.includes(ph.id)
                const active = activePhase === ph.id
                return (
                  <button key={ph.id} onClick={() => setActivePhase(ph.id)}
                    className="flex flex-col items-center gap-1 rounded-xl py-2 px-1 transition-all"
                    style={{
                      background: done ? `${ph.color}18` : active ? '#222' : '#111',
                      border: `1px solid ${done ? ph.color + '44' : active ? '#444' : '#1e1e1e'}`,
                    }}>
                    <span className="text-lg">{done ? '✅' : ph.emoji}</span>
                    <span className="text-xs text-center leading-tight" style={{ color: done ? ph.color : '#666', fontSize: 10 }}>
                      {ph.title}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{PHASES[activePhase].emoji}</span>
                <div>
                  <h3 className="font-black text-white">{PHASES[activePhase].title}</h3>
                  <p className="text-xs" style={{ color: PHASES[activePhase].color }}>{PHASES[activePhase].subtitle}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#aaa' }}>
                {PHASES[activePhase].instruction}
              </p>

              {/* Show top 3 goals in Visualization phase (phase 3) */}
              {activePhase === 3 && state.goals.length > 0 && (
                <div className="mb-4 rounded-xl p-3 space-y-2"
                  style={{ background: '#9b59b615', border: '1px solid #9b59b630' }}>
                  <p className="text-xs font-bold" style={{ color: '#9b59b6' }}>
                    🎯 {isAr ? 'تخيّل هذه الأهداف محققة الآن:' : 'Visualize these goals as already achieved:'}
                  </p>
                  {state.goals.filter(g => (g.progress || 0) < 100).slice(0, 3).map((g, i) => (
                    <div key={g.id} className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: '#9b59b6' }}>{i + 1}.</span>
                      <span className="text-xs font-bold text-white">{g.result}</span>
                    </div>
                  ))}
                </div>
              )}

              <PhaseTimer key={`${activePhase}-${lang}`} phase={PHASES[activePhase]}
                onComplete={() => handlePhaseComplete(activePhase)} t={t} />
            </div>

            <button onClick={() => setView('questions')} className="w-full text-xs py-2" style={{ color: '#555' }}>
              {t('skip')} → {t('morning_questions_title')}
            </button>
          </>
        )}

      </div>
    </Layout>
  )
}
