import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Play, Pause, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'
import { getCompletionMessage } from '../utils/completionSignals'
import OneTapReflection from '../components/OneTapReflection'
import { getNextStep, getRitualVariation } from '../utils/smartFlow'

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

const POWER_QUESTIONS_SETS = [
  // Set 0 — Classic Tony Robbins (days 1-7)
  {
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
    ],
  },
  // Set 1 — Growth & Identity (weeks 2-3)
  {
    ar: [
      'أي نسخة من نفسي أريد أن أكون اليوم؟',
      'ما الخوف الذي أحتاج مواجهته هذا الأسبوع؟',
      'ما العادة الصغيرة التي غيّرت حياتي مؤخراً؟',
      'لو كان عندي 10 أضعاف الثقة — ماذا سأفعل اليوم؟',
      'ما الذي يمكنني إعطاؤه لشخص آخر اليوم؟',
      'ما المعتقد القديم الذي أحتاج التخلي عنه؟',
      'ما النتيجة الأهم التي ستجعل اليوم ناجحاً؟',
    ],
    en: [
      'Which version of myself do I want to be today?',
      'What fear do I need to face this week?',
      'What small habit has changed my life recently?',
      'If I had 10x the confidence — what would I do today?',
      'What can I give to someone else today?',
      'What old belief do I need to let go of?',
      'What is the #1 result that would make today a success?',
    ],
  },
  // Set 2 — Mastery & Legacy (weeks 4+)
  {
    ar: [
      'ما الذي يجعل حياتي ذات معنى حقيقي الآن؟',
      'كيف أريد أن يتذكرني الناس بعد 20 سنة؟',
      'ما المهارة التي إذا أتقنتها ستغيّر كل شيء؟',
      'ما الذي أتجنبه وأعرف أنه مهم؟',
      'لو بقي عام واحد في حياتي — ما أول شيء سأفعله؟',
      'ما أكبر درس تعلمته في آخر 30 يوم؟',
      'ما الإرث الذي أبنيه بأفعالي اليومية؟',
    ],
    en: [
      'What makes my life truly meaningful right now?',
      'How do I want to be remembered in 20 years?',
      'What skill, if mastered, would change everything?',
      'What am I avoiding that I know is important?',
      'If I had one year left — what would I do first?',
      'What is the biggest lesson I learned in the last 30 days?',
      'What legacy am I building with my daily actions?',
    ],
  },
]

function getPowerQuestions(morningCount) {
  if (morningCount < 7) return POWER_QUESTIONS_SETS[0]
  if (morningCount < 21) {
    // Rotate between set 0 and 1 weekly
    const weekNum = Math.floor(morningCount / 7)
    return POWER_QUESTIONS_SETS[weekNum % 2 === 0 ? 0 : 1]
  }
  // After 21 days: rotate all 3 sets
  const weekNum = Math.floor(morningCount / 7)
  return POWER_QUESTIONS_SETS[weekNum % 3]
}

// Backward compat alias
const POWER_QUESTIONS = POWER_QUESTIONS_SETS[0]

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

const VIDEO_URL = 'https://www.youtube.com/watch?v=faTGTgid8Uc'

export default function MorningRitual() {
  const { state, completeMorning, update } = useApp()
  const { lang, t } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'
  const [activePhase, setActivePhase] = useState(0)
  const [view, setView] = useState('phases')
  const [answers, setAnswers] = useState({})
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [videoMode, setVideoMode] = useState(false)
  const [ritualMode, setRitualMode] = useState('standard')
  const [smartSuggested, setSmartSuggested] = useState(false)

  // --- Smart mode suggestion: sleep data + day-of-week ---
  const yesterdaySleep = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10) })()
  const lastSleepHours = state.sleepLog?.[yesterdaySleep]?.hours
  const dayOfWeek = new Date().getDay() // 0=Sun, 1=Mon...

  useEffect(() => {
    if (smartSuggested) return
    let suggested = null
    // Sleep-based suggestion takes priority
    if (lastSleepHours != null) {
      if (lastSleepHours < 6) suggested = 'quick'
      else if (lastSleepHours >= 7) suggested = 'deep'
    }
    // Day-of-week refinement (only if no sleep override or sleep was normal range)
    if (!suggested) {
      if (dayOfWeek === 1 || dayOfWeek === 0 || dayOfWeek === 6) suggested = 'deep' // Mon, weekends
      else if (dayOfWeek === 5) suggested = 'standard' // Friday fatigue
    }
    if (suggested) {
      setRitualMode(suggested)
      setSmartSuggested(true)
    }
  }, [lastSleepHours, dayOfWeek, smartSuggested])

  const ALL_PHASES = PHASES_DATA[lang]
  const PHASES = ritualMode === 'quick' ? ALL_PHASES.filter(p => p.id <= 1) : ALL_PHASES
  const phaseDuration = ritualMode === 'quick' ? 60 : ritualMode === 'deep' ? 300 : 180
  const morningCount = (state.morningLog || []).length
  const currentSet = getPowerQuestions(morningCount)
  const ALL_QUESTIONS = currentSet[lang]
  const DEEP_EXTRA_Q = isAr ? 'ما التحول الذي تلتزم به اليوم؟' : 'What transformation are you committed to today?'
  const QUESTIONS = ritualMode === 'quick'
    ? ALL_QUESTIONS.slice(0, 3)
    : ritualMode === 'deep'
      ? [...ALL_QUESTIONS, DEEP_EXTRA_Q]
      : ALL_QUESTIONS
  const donePhases = state.primingPhasesDone || []

  const handlePhaseComplete = (phaseId) => {
    const newDone = [...new Set([...donePhases, phaseId])]
    update('primingPhasesDone', newDone)
    if (phaseId < PHASES.length - 1) setActivePhase(phaseId + 1)
    else setView('questions')
  }

  const today = new Date().toISOString().split('T')[0]

  const saveAnswer = () => {
    if (!answer.trim()) return
    const newAnswers = { ...answers, [qIndex]: answer }
    setAnswers(newAnswers)
    // Auto-save partial answers immediately on every question
    update('morningAnswers', newAnswers)
    // Also save to date-keyed log for growth tracking
    const pqLog = state.powerQuestionsLog || {}
    update('powerQuestionsLog', {
      ...pqLog,
      [today]: { ...(pqLog[today] || {}), morning: newAnswers }
    })
    // Clear draft since this question is now saved
    update('morningAnswerDraft', null)
    setAnswer('')
    if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1)
    else if (ritualMode === 'quick') finishMorning()
    else setView('incantations')
  }

  const finishMorning = () => {
    // Save ritual mode to today's reflection data so milestones can track it
    const todayKey = new Date().toISOString().slice(0,10)
    const reflections = { ...(state.ritualReflections || {}) }
    reflections[todayKey] = {
      ...(reflections[todayKey] || {}),
      morning: { ...(reflections[todayKey]?.morning || {}), mode: ritualMode, started: Date.now() }
    }
    update('ritualReflections', reflections)
    completeMorning()
    setView('reflection')
  }

  // One-Tap Reflection → then done screen
  if (view === 'reflection') {
    return (
      <Layout title="">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="text-6xl mb-4 animate-scale-in">🏆</div>
          <h2 className="text-2xl font-black text-white mb-2">{t('morning_completed')}</h2>
          <p className="text-sm mb-6" style={{ color: '#888' }}>
            {lang === 'ar' ? 'أنت جاهز لتحقق العظمة اليوم' : 'You are ready to achieve greatness today'}
          </p>
          {/* One-Tap Reflection */}
          <div className="w-full">
            <OneTapReflection
              ritualType="morning"
              onSave={(rating, note) => {
                const todayKey = new Date().toISOString().slice(0,10)
                const reflections = { ...(state.ritualReflections || {}) }
                reflections[todayKey] = {
                  ...(reflections[todayKey] || {}),
                  morning: { rating, note, mode: ritualMode, ts: Date.now() }
                }
                update('ritualReflections', reflections)
                setView('done')
              }}
              onDismiss={() => setView('done')}
            />
          </div>
        </div>
      </Layout>
    )
  }

  if (view === 'done') {
    const nextStep = getNextStep('morning', state, isAr)
    return (
      <Layout title="">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="text-6xl mb-4 animate-scale-in">🏆</div>
          <h2 className="text-2xl font-black text-white mb-2">{t('morning_completed')}</h2>
          <p className="text-sm mb-6" style={{ color: '#888' }}>
            {lang === 'ar' ? 'أنت جاهز لتحقق العظمة اليوم' : 'You are ready to achieve greatness today'}
          </p>
          <div className="rounded-2xl p-4 text-center mb-4 w-full"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>🔥 {state.streak} {lang === 'ar' ? 'يوم متواصل' : 'days in a row'}</p>
            <p className="text-xs mt-1" style={{ color: '#888' }}>
              {lang === 'ar' ? 'أنت تبني شخصاً جديداً كل يوم' : 'You are building a new version of yourself every day'}
            </p>
          </div>

          {/* Progressive Challenge — keeps ritual fresh after day 7 */}
          {morningCount >= 7 && (
            <div className="rounded-2xl p-4 text-center mb-4 w-full"
              style={{ background: 'linear-gradient(135deg, rgba(147,112,219,0.08), rgba(52,152,219,0.06))', border: '1px solid rgba(147,112,219,0.2)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#9370db' }}>
                🎯 {isAr ? 'تحدّي اليوم' : "Today's Challenge"}
              </p>
              <p className="text-sm font-bold text-white">
                {(() => {
                  const challenges = isAr ? [
                    'أرسل رسالة شكر لشخص غيّر حياتك',
                    'تبرّع بشيء صغير اليوم — وقت، مال، أو مساعدة',
                    'تحدّث مع شخص غريب وابتسم',
                    'اكتب 3 إنجازات أنت فخور بها ولم تفكر فيها مؤخراً',
                    'أمضِ 5 دقائق في التنفس العميق وأنت ممتن',
                    'أخبر شخصاً تحبه لماذا هو مهم في حياتك',
                    'افعل شيئاً تخاف منه — ولو صغيراً جداً',
                  ] : [
                    'Send a thank-you message to someone who changed your life',
                    'Give something small today — time, money, or help',
                    'Talk to a stranger and smile',
                    'Write 3 achievements you\'re proud of but forgot about',
                    'Spend 5 minutes in deep grateful breathing',
                    'Tell someone you love why they matter to you',
                    'Do something you\'re afraid of — even something tiny',
                  ]
                  return challenges[Math.floor(Date.now() / 86400000) % challenges.length]
                })()}
              </p>
            </div>
          )}
          {/* Smart Flow — What's Next (Fix #2) */}
          <button
            onClick={() => navigate(nextStep.path)}
            className="w-full rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.25)',
              textAlign: isAr ? 'right' : 'left', cursor: 'pointer',
            }}>
            <span style={{ fontSize: 24 }}>{nextStep.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#3498db' }}>
                {isAr ? 'الخطوة التالية ←' : 'What\'s Next →'}
              </p>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                {isAr ? nextStep.labelAr : nextStep.labelEn}
              </p>
            </div>
          </button>
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
          {(state.incantations || []).map((inc, i) => (
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

  // Restore draft on mount when entering questions view, or when qIndex changes
  useEffect(() => {
    if (view !== 'questions') return
    const draft = state.morningAnswerDraft
    if (draft && draft.qIndex === qIndex && draft.text) {
      setAnswer(draft.text)
    }
  }, [view, qIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Find last answer to the current question (from powerQuestionsLog)
  const pastAnswer = (() => {
    const log = state.powerQuestionsLog || {}
    const dates = Object.keys(log).filter(d => d !== today && log[d]?.morning?.[qIndex]?.trim()).sort().reverse()
    if (dates.length === 0) return null
    return { date: dates[0], text: log[dates[0]].morning[qIndex] }
  })()

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

          {/* Show past answer for this question as growth context */}
          {pastAnswer && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(147,112,219,0.06)', border: '1px solid rgba(147,112,219,0.15)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#9370db' }}>
                📖 {isAr ? 'إجابتك السابقة:' : 'Your previous answer:'}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#999', fontStyle: 'italic' }}>
                "{pastAnswer.text.slice(0, 120)}{pastAnswer.text.length > 120 ? '...' : ''}"
              </p>
              <p className="text-xs mt-1" style={{ color: '#444' }}>
                {new Date(pastAnswer.date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}
                {' — '}
                {isAr ? 'هل تطوّرت إجابتك؟' : 'Has your answer evolved?'}
              </p>
            </div>
          )}

          <textarea
            value={answer}
            onChange={e => {
              setAnswer(e.target.value)
              // Auto-save draft so mid-session data is never lost
              update('morningAnswerDraft', { qIndex, text: e.target.value })
            }}
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

  // #2 — Wheel of Life lowest area
  const AREA_NAMES = { body: { ar: 'الصحة', en: 'Health' }, emotions: { ar: 'العواطف', en: 'Emotions' }, relationships: { ar: 'العلاقات', en: 'Relationships' }, time: { ar: 'الوقت', en: 'Time' }, career: { ar: 'المهنة', en: 'Career' }, money: { ar: 'المال', en: 'Money' }, contribution: { ar: 'المساهمة', en: 'Contribution' } }
  const wheelScores = state.wheelScores || {}
  const wheelEntries = Object.entries(wheelScores).filter(([, v]) => v !== 5)
  const lowestArea = wheelEntries.length > 0
    ? wheelEntries.reduce((a, b) => a[1] < b[1] ? a : b)
    : null
  const lowestAreaKey = lowestArea?.[0]

  // State Check-in → Ritual adaptation
  const todayCheckin = state.stateCheckin?.[today]
  const lowEnergy  = todayCheckin && todayCheckin.energy <= 4
  const lowMood    = todayCheckin && todayCheckin.mood <= 4
  const lowClarity = todayCheckin && todayCheckin.clarity <= 4

  // #3 — Sleep → Energy chain
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const lastSleep = state.sleepLog?.[yesterday]
  const poorSleep = lastSleep && lastSleep.hours < 6.5

  // #5 — Commitment reference
  const commitment = state.commitment

  return (
    <Layout title={t('morning_title')} subtitle={t('morning_subtitle')} helpKey="morning">
      <div className="space-y-4 pt-2">

        {/* #3 — Poor Sleep Energy Alert */}
        {poorSleep && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)' }}>
            <p className="text-xs font-bold" style={{ color: '#e74c3c' }}>
              ⚠️ {isAr
                ? `نمت ${lastSleep.hours} ساعة فقط البارحة — ركّز اليوم على الطاقة الجسدية أكثر!`
                : `You only slept ${lastSleep.hours}${isAr ? ' ساعة' : 'h'} last night — focus extra on physical energy today!`}
            </p>
            <p className="text-xs mt-1" style={{ color: '#888' }}>
              {isAr ? 'تنفس أعمق، تحرك أكثر، اشرب ماء فوراً' : 'Breathe deeper, move more, drink water immediately'}
            </p>
          </div>
        )}

        {/* State Check-in → Adaptive ritual guidance */}
        {todayCheckin && (lowEnergy || lowMood || lowClarity) && (
          <div className="rounded-2xl p-3" style={{
            background: 'linear-gradient(135deg, rgba(147,112,219,0.08), rgba(52,152,219,0.06))',
            border: '1px solid rgba(147,112,219,0.2)',
          }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#9370db' }}>
              🎯 {isAr ? 'روتينك مُكيَّف لحالتك اليوم:' : 'Your ritual is adapted to your state:'}
            </p>
            <div className="space-y-1">
              {lowEnergy && (
                <p className="text-xs" style={{ color: '#f39c12' }}>
                  ⚡ {isAr
                    ? `طاقتك ${todayCheckin.energy}/10 — ركّز أكثر على التنفس العميق والحركة الجسدية`
                    : `Energy ${todayCheckin.energy}/10 — focus extra on deep breathing & physical movement`}
                </p>
              )}
              {lowMood && (
                <p className="text-xs" style={{ color: '#3498db' }}>
                  😊 {isAr
                    ? `مزاجك ${todayCheckin.mood}/10 — أطِل في مرحلة الامتنان ودع المشاعر تتحرك`
                    : `Mood ${todayCheckin.mood}/10 — extend the gratitude phase and let emotions flow`}
                </p>
              )}
              {lowClarity && (
                <p className="text-xs" style={{ color: '#2ecc71' }}>
                  🎯 {isAr
                    ? `وضوحك ${todayCheckin.clarity}/10 — ركّز في تخيّل الأهداف على هدف واحد فقط`
                    : `Clarity ${todayCheckin.clarity}/10 — during visualization, focus on just ONE goal`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* #5 — Commitment Reminder */}
        {commitment?.text && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
              📜 {isAr ? 'التزامك اليوم' : 'Your Commitment'}
            </p>
            <p className="text-xs text-white leading-relaxed" style={{ fontStyle: 'italic' }}>
              "{commitment.text}"
            </p>
          </div>
        )}

        {/* #2 — Wheel of Life Lowest Area Prompt */}
        {lowestArea && lowestAreaKey && (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.15)' }}>
            <p className="text-xs font-bold" style={{ color: '#e63946' }}>
              ⚙️ {isAr
                ? `مجال "${AREA_NAMES[lowestAreaKey]?.ar || lowestAreaKey}" (${lowestArea[1]}/10) يحتاج اهتمامك — ماذا ستفعل اليوم لتحسينه؟`
                : `"${AREA_NAMES[lowestAreaKey]?.en || lowestAreaKey}" (${lowestArea[1]}/10) needs your attention — what will you do today to improve it?`}
            </p>
          </div>
        )}

        {/* Ritual Variation Tip — keeps routine fresh (Fix #11) */}
        {(() => {
          const variation = getRitualVariation('morning', state, isAr)
          return (
            <div className="rounded-xl p-2.5" style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.15)' }}>
              <p className="text-xs" style={{ color: '#9b59b6', fontWeight: 600 }}>
                💡 {variation.text}
              </p>
              {variation.bonus && (
                <p className="text-xs mt-1" style={{ color: '#666' }}>{variation.bonus}</p>
              )}
            </div>
          )
        })()}

        {/* Smart mode suggestion banner */}
        {donePhases.length === 0 && lastSleepHours != null && (
          <div className="rounded-xl p-3" style={{
            background: lastSleepHours < 6
              ? 'rgba(243,156,18,0.08)' : 'rgba(46,204,113,0.08)',
            border: `1px solid ${lastSleepHours < 6
              ? 'rgba(243,156,18,0.2)' : 'rgba(46,204,113,0.2)'}`,
          }}>
            <p className="text-xs font-bold" style={{
              color: lastSleepHours < 6 ? '#f39c12' : '#2ecc71',
            }}>
              {lastSleepHours < 6
                ? (isAr
                  ? '😴 نومك أمس كان قصيراً — ننصحك بالوضع السريع ⚡'
                  : '😴 Short sleep last night — Quick mode recommended ⚡')
                : lastSleepHours >= 7
                  ? (isAr
                    ? '💪 نومك ممتاز! جرب الوضع العميق 🧘'
                    : '💪 Great sleep! Try Deep mode 🧘')
                  : null}
            </p>
          </div>
        )}

        {/* Ritual mode selector — only before first phase is started */}
        {donePhases.length === 0 && (
          <div className="flex gap-2">
            {[
              { key: 'quick', emoji: '\u26A1', ar: '\u0633\u0631\u064A\u0639 (5 \u062F)', en: 'Quick (5 min)' },
              { key: 'standard', emoji: '\u2600\uFE0F', ar: '\u0639\u0627\u062F\u064A (12 \u062F)', en: 'Standard (12 min)' },
              { key: 'deep', emoji: '\uD83E\uDDD8', ar: '\u0639\u0645\u064A\u0642 (20 \u062F)', en: 'Deep (20 min)' },
            ].map(m => (
              <button key={m.key}
                onClick={() => setRitualMode(m.key)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: ritualMode === m.key ? 'rgba(201,168,76,0.15)' : '#111',
                  border: ritualMode === m.key ? '2px solid #c9a84c' : '1px solid #222',
                  color: ritualMode === m.key ? '#c9a84c' : '#555',
                }}>
                {m.emoji} {isAr ? m.ar : m.en}
              </button>
            ))}
          </div>
        )}

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
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #2a2a2a', background: '#000' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe
                  src="https://www.youtube.com/embed/faTGTgid8Uc?rel=0"
                  title="Morning Priming with Tony Robbins"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
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
            <div className={`grid gap-1.5 ${PHASES.length <= 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
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
              {activePhase === 3 && (state.goals || []).length > 0 && (
                <div className="mb-4 rounded-xl p-3 space-y-2"
                  style={{ background: '#9b59b615', border: '1px solid #9b59b630' }}>
                  <p className="text-xs font-bold" style={{ color: '#9b59b6' }}>
                    🎯 {isAr ? 'تخيّل هذه الأهداف محققة الآن:' : 'Visualize these goals as already achieved:'}
                  </p>
                  {(state.goals || []).filter(g => (g.progress || 0) < 100).slice(0, 3).map((g, i) => (
                    <div key={g.id} className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: '#9b59b6' }}>{i + 1}.</span>
                      <span className="text-xs font-bold text-white">{g.result}</span>
                    </div>
                  ))}
                </div>
              )}

              <PhaseTimer key={`${activePhase}-${lang}-${ritualMode}`} phase={{ ...PHASES[activePhase], duration: phaseDuration }}
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
