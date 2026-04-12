import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'
import {
  ChevronRight, ChevronLeft, AlertTriangle, Zap, RefreshCw,
  Trophy, Brain, Target
} from 'lucide-react'

const PATTERN_INTERRUPTS = [
  { id: 'jump', icon: '🦘', ar: 'القفز لأعلى 10 مرات', en: 'Jump up 10 times', desc_ar: 'أجبر جسمك على الحركة المفاجئة', desc_en: 'Force sudden body movement' },
  { id: 'clap', icon: '👏', ar: 'التصفيق بقوة 5 مرات', en: 'Clap hard 5 times', desc_ar: 'أيقظ جهازك العصبي', desc_en: 'Wake up your nervous system' },
  { id: 'shout', icon: '📣', ar: 'الصراخ "YES!" بقوة', en: 'Shout "YES!" loudly', desc_ar: 'غيّر نبرة صوتك الداخلية', desc_en: 'Change your internal voice tone' },
  { id: 'cold_water', icon: '💧', ar: 'رذاذ ماء بارد على الوجه', en: 'Cold water splash on face', desc_ar: 'صدمة فسيولوجية فورية', desc_en: 'Instant physiological shock' },
  { id: 'power_pose', icon: '🦸', ar: 'وضعية القوة دقيقتين', en: '2-minute power pose', desc_ar: 'يدان على الخصر، رأس مرفوع', desc_en: 'Hands on hips, head held high' },
]

const STEPS_META = [
  {
    id: 1,
    icon: Brain,
    color: '#e63946',
    ar: 'ما الذي تريد تغييره؟',
    en: 'What do you want to change?',
    sub_ar: 'صِف النمط أو السلوك الذي يعيقك',
    sub_en: 'Describe the pattern or behavior holding you back',
  },
  {
    id: 2,
    icon: AlertTriangle,
    color: '#e67e22',
    ar: 'الرافعة — الألم',
    en: 'Get Leverage — Pain',
    sub_ar: 'ما الأثمان التي تدفعها بسبب عدم التغيير؟',
    sub_en: "What are the costs of NOT changing?",
  },
  {
    id: 3,
    icon: Zap,
    color: '#3498db',
    ar: 'قاطع النمط',
    en: 'Pattern Interrupt',
    sub_ar: 'اختر الأداة التي ستستخدمها لكسر النمط القديم',
    sub_en: 'Choose your tool to break the old pattern',
  },
  {
    id: 4,
    icon: Target,
    color: '#2ecc71',
    ar: 'السلوك الجديد',
    en: 'New Alternative Behavior',
    sub_ar: 'ما البديل الصحي الذي سيحل محل النمط القديم؟',
    sub_en: 'What healthy behavior will replace the old pattern?',
  },
  {
    id: 5,
    icon: RefreshCw,
    color: '#c9a84c',
    ar: 'التكييف — ٢١ يوم',
    en: 'Condition — 21 Days',
    sub_ar: 'التزام يومي لترسيخ النمط الجديد',
    sub_en: 'Daily commitment to reinforce the new pattern',
  },
  {
    id: 6,
    icon: Trophy,
    color: '#9b59b6',
    ar: 'اختبر التغيير',
    en: 'Test the Change',
    sub_ar: 'واجه المحفّز — ماذا تفعل الآن؟',
    sub_en: 'Face the trigger — what do you do now?',
  },
]

function getTodayAndNext6() {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export default function NACProcess() {
  const { lang, dir } = useLang()
  const { state, update } = useApp()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const [step, setStep] = useState(1)
  const [pattern, setPattern] = useState('')
  const [pains, setPains] = useState([
    { text: '', severity: 7 },
    { text: '', severity: 7 },
    { text: '', severity: 7 },
  ])
  const [selectedInterrupt, setSelectedInterrupt] = useState(null)
  const [newBehavior, setNewBehavior] = useState('')
  const [newBehaviorNeed, setNewBehaviorNeed] = useState('')
  const [checkedDays, setCheckedDays] = useState({})
  const [testResponse, setTestResponse] = useState('')
  const [completed, setCompleted] = useState(false)

  const days = getTodayAndNext6()

  function updatePain(index, field, value) {
    setPains(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  function addPain() {
    if (pains.length < 8) setPains(prev => [...prev, { text: '', severity: 7 }])
  }

  function toggleDay(day) {
    setCheckedDays(prev => ({ ...prev, [day]: !prev[day] }))
  }

  function canProceed() {
    if (step === 1) return pattern.trim().length > 5
    if (step === 2) return pains.filter(p => p.text.trim().length > 0).length >= 1
    if (step === 3) return selectedInterrupt !== null
    if (step === 4) return newBehavior.trim().length > 5
    if (step === 5) return true
    if (step === 6) return testResponse.trim().length > 0
    return true
  }

  function handleNext() {
    if (step < 6) {
      setStep(s => s + 1)
    } else {
      finishSession()
    }
  }

  function finishSession() {
    const session = {
      timestamp: new Date().toISOString(),
      pattern,
      pains,
      selectedInterrupt,
      newBehavior,
      newBehaviorNeed,
      checkedDays,
      testResponse,
    }
    const sessions = [...(state.nacSessions || []), session]
    update('nacSessions', sessions)
    setCompleted(true)
    showToast(isAr ? 'تم حفظ جلسة NAC بنجاح!' : 'NAC session saved!', 'success')
  }

  function resetSession() {
    setStep(1)
    setPattern('')
    setPains([{ text: '', severity: 7 }, { text: '', severity: 7 }, { text: '', severity: 7 }])
    setSelectedInterrupt(null)
    setNewBehavior('')
    setNewBehaviorNeed('')
    setCheckedDays({})
    setTestResponse('')
    setCompleted(false)
  }

  const progressPct = ((step - 1) / 5) * 100

  // ── COMPLETION SCREEN ──
  if (completed) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center" dir={dir}>
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-black text-[#c9a84c] mb-3">
            {isAr ? 'أحسنت! التغيير بدأ' : 'Well done! Change begins'}
          </h2>
          <p className="text-gray-400 mb-8 max-w-xs">
            {isAr
              ? 'لقد أكملت عملية NAC. النمط الجديد يحتاج 21 يوماً للترسيخ — استمر!'
              : 'You completed the NAC process. The new pattern needs 21 days to anchor — keep going!'}
          </p>
          <button
            onClick={resetSession}
            className="px-8 py-3 rounded-xl font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c96e)' }}
          >
            {isAr ? 'جلسة جديدة' : 'New Session'}
          </button>
        </div>
      </Layout>
    )
  }

  const currentMeta = STEPS_META[step - 1]
  const StepIcon = currentMeta.icon

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-24" dir={dir}>
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-b border-[#c9a84c]/20 px-4 pt-8 pb-5">
          <h1 className="text-xl font-bold text-[#c9a84c] text-center">
            {isAr ? 'عملية NAC — التكييف العصبي' : 'NAC Process — Neuro-Associative Conditioning'}
          </h1>
          <p className="text-center text-gray-400 text-xs mt-1">
            {isAr ? '6 خطوات لتغيير السلوك بعمق' : '6 steps for deep behavioral change'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              {isAr ? `الخطوة ${step} من 6` : `Step ${step} of 6`}
            </span>
            <span className="text-xs font-bold" style={{ color: currentMeta.color }}>
              {isAr ? currentMeta.ar : currentMeta.en}
            </span>
          </div>
          <div className="h-2 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: currentMeta.color }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {STEPS_META.map(s => (
              <button
                key={s.id}
                onClick={() => s.id <= step && setStep(s.id)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s.id === step
                    ? 'scale-110'
                    : s.id < step
                    ? 'opacity-70'
                    : 'opacity-30'
                }`}
                style={{
                  backgroundColor: s.id <= step ? s.color + '33' : '#222',
                  border: `2px solid ${s.id <= step ? s.color : '#444'}`,
                  color: s.id <= step ? s.color : '#666',
                }}
              >
                {s.id < step ? '✓' : s.id}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
          {/* Step title card */}
          <div
            className="rounded-2xl p-5 flex gap-4 items-start"
            style={{ backgroundColor: currentMeta.color + '12', border: `1.5px solid ${currentMeta.color}44` }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: currentMeta.color + '25', border: `2px solid ${currentMeta.color}` }}
            >
              <StepIcon size={22} style={{ color: currentMeta.color }} />
            </div>
            <div>
              <div className="font-black text-white text-lg leading-tight">
                {isAr ? currentMeta.ar : currentMeta.en}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {isAr ? currentMeta.sub_ar : currentMeta.sub_en}
              </div>
            </div>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-3">
              <textarea
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder={
                  isAr
                    ? 'مثال: أؤجل مهامي المهمة وأقضي الوقت على وسائل التواصل...'
                    : 'Example: I procrastinate on important tasks and waste time on social media...'
                }
                rows={5}
                className="w-full bg-[#111] border border-[#333] rounded-xl p-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#e63946]/50 text-sm"
              />
              <div className="bg-[#111] rounded-xl p-4 border border-[#333]">
                <p className="text-xs text-gray-500 leading-relaxed">
                  {isAr
                    ? 'كن محدداً قدر الإمكان. متى يحدث؟ ما المحفز؟ كيف يؤثر على حياتك؟'
                    : 'Be as specific as possible. When does it happen? What triggers it? How does it affect your life?'}
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {isAr
                  ? 'اجعل الألم حقيقياً. كلما كان الألم أعمق، كان الدافع للتغيير أقوى.'
                  : 'Make the pain real. The deeper the pain, the stronger the motivation to change.'}
              </p>
              {pains.map((pain, i) => (
                <div key={i} className="bg-[#111] rounded-xl p-4 border border-[#333] space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: '#e67e2222', color: '#e67e22', border: '1.5px solid #e67e22' }}
                    >
                      {i + 1}
                    </span>
                    <input
                      value={pain.text}
                      onChange={e => updatePain(i, 'text', e.target.value)}
                      placeholder={isAr ? `الألم ${i + 1}...` : `Pain ${i + 1}...`}
                      className="flex-1 bg-transparent border-b border-[#333] py-1 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#e67e22]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{isAr ? 'شدة الألم' : 'Severity'}</span>
                      <span
                        className="font-bold text-base"
                        style={{ color: pain.severity >= 8 ? '#e63946' : pain.severity >= 5 ? '#e67e22' : '#2ecc71' }}
                      >
                        {pain.severity}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={pain.severity}
                      onChange={e => updatePain(i, 'severity', Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #e67e22 ${(pain.severity - 1) / 9 * 100}%, #333 ${(pain.severity - 1) / 9 * 100}%)`,
                        accentColor: '#e67e22',
                      }}
                    />
                  </div>
                </div>
              ))}
              {pains.length < 8 && (
                <button
                  onClick={addPain}
                  className="w-full py-3 rounded-xl border border-dashed border-[#444] text-gray-500 hover:border-[#e67e22] hover:text-[#e67e22] transition-colors text-sm"
                >
                  + {isAr ? 'أضف ألماً آخر' : 'Add another pain'}
                </button>
              )}
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                {isAr
                  ? 'قاطع النمط هو أداة تستخدمها لحظة بدء النمط القديم لإيقافه فوراً.'
                  : 'A pattern interrupt is a tool you use the moment the old pattern begins to stop it immediately.'}
              </p>
              {PATTERN_INTERRUPTS.map(pi => (
                <button
                  key={pi.id}
                  onClick={() => setSelectedInterrupt(pi.id)}
                  className={`w-full text-start rounded-2xl p-4 border-2 transition-all flex items-center gap-4 ${
                    selectedInterrupt === pi.id
                      ? 'border-[#3498db] bg-[#3498db]/12'
                      : 'border-[#222] bg-[#111] hover:border-[#3498db]/40'
                  }`}
                >
                  <span className="text-3xl">{pi.icon}</span>
                  <div className="flex-1">
                    <div className={`font-bold ${selectedInterrupt === pi.id ? 'text-[#3498db]' : 'text-white'}`}>
                      {isAr ? pi.ar : pi.en}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {isAr ? pi.desc_ar : pi.desc_en}
                    </div>
                  </div>
                  {selectedInterrupt === pi.id && (
                    <div className="w-6 h-6 rounded-full bg-[#3498db] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-[#111] rounded-xl p-4 border border-[#333] space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  {isAr ? 'السلوك البديل الجديد:' : 'New replacement behavior:'}
                </label>
                <textarea
                  value={newBehavior}
                  onChange={e => setNewBehavior(e.target.value)}
                  placeholder={
                    isAr
                      ? 'مثال: عندما أشعر برغبة في التأجيل، أقوم بقاعدة الخمس دقائق — ابدأ لمدة 5 دقائق فقط...'
                      : 'Example: When I feel the urge to procrastinate, I use the 5-minute rule — just start for 5 minutes...'
                  }
                  rows={4}
                  className="w-full bg-transparent border border-[#333] rounded-lg p-3 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#2ecc71]/50 text-sm"
                />
              </div>
              <div className="bg-[#111] rounded-xl p-4 border border-[#333] space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  {isAr ? 'ما الحاجة التي يلبيها هذا السلوك البديل؟' : 'What need does this new behavior meet?'}
                </label>
                <input
                  value={newBehaviorNeed}
                  onChange={e => setNewBehaviorNeed(e.target.value)}
                  placeholder={isAr ? 'مثال: اليقين، النمو...' : 'Example: Certainty, Growth...'}
                  className="w-full bg-transparent border-b border-[#333] py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#2ecc71]"
                />
              </div>
            </div>
          )}

          {/* ── STEP 5 ── */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl p-4">
                <p className="text-sm text-gray-300">
                  {isAr
                    ? 'العلم يقول إن 21 يوماً من التكرار الواعي يرسّخ أنماطاً عصبية جديدة. ضع علامة على كل يوم تنجح فيه.'
                    : 'Science says 21 days of conscious repetition anchors new neural patterns. Check off each day you succeed.'}
                </p>
              </div>

              <div className="bg-[#111] rounded-xl p-4 border border-[#333]">
                <div className="text-sm font-semibold text-gray-300 mb-3">
                  {isAr ? 'الأيام السبعة القادمة:' : 'Next 7 days:'}
                </div>
                <div className="space-y-2">
                  {days.map((day, i) => {
                    const checked = !!checkedDays[day]
                    const isToday = i === 0
                    const dateObj = new Date(day)
                    const label = dateObj.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                      weekday: 'long', month: 'short', day: 'numeric'
                    })
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`w-full flex items-center gap-3 rounded-xl p-3 border transition-all ${
                          checked
                            ? 'border-[#c9a84c] bg-[#c9a84c]/10'
                            : isToday
                            ? 'border-[#c9a84c]/40 bg-[#c9a84c]/05'
                            : 'border-[#222] hover:border-[#333]'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                          checked ? 'bg-[#c9a84c] border-[#c9a84c]' : 'border-[#444]'
                        }`}>
                          {checked && <span className="text-black text-xs font-bold">✓</span>}
                        </div>
                        <span className={`text-sm flex-1 text-start ${checked ? 'text-[#c9a84c]' : 'text-gray-300'}`}>
                          {label}
                        </span>
                        {isToday && (
                          <span className="text-xs bg-[#c9a84c]/20 text-[#c9a84c] px-2 py-0.5 rounded-full font-semibold">
                            {isAr ? 'اليوم' : 'Today'}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-[#111] rounded-xl p-4 border border-[#333] text-center">
                <div className="text-3xl font-black text-[#c9a84c]">
                  {Object.values(checkedDays).filter(Boolean).length}/21
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {isAr ? 'أيام مكتملة' : 'days completed'}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 6 ── */}
          {step === 6 && (
            <div className="space-y-4">
              <div
                className="bg-[#9b59b6]/10 border border-[#9b59b6]/30 rounded-xl p-4"
              >
                <div className="text-sm font-semibold text-[#9b59b6] mb-2">
                  {isAr ? 'سيناريو المحفّز:' : 'Trigger Scenario:'}
                </div>
                <p className="text-sm text-gray-300">
                  {isAr
                    ? `تخيّل: الآن بدأ نفس الموقف الذي كان يطلق النمط القديم لديك — "${pattern.slice(0, 80)}..." — ماذا تفعل الآن؟`
                    : `Imagine: The same situation that used to trigger your old pattern just started — "${pattern.slice(0, 80)}..." — what do you do now?`}
                </p>
              </div>
              <textarea
                value={testResponse}
                onChange={e => setTestResponse(e.target.value)}
                placeholder={
                  isAr
                    ? 'صِف بالتفصيل ما ستفعله الآن بالسلوك الجديد...'
                    : 'Describe in detail what you will do now with the new behavior...'
                }
                rows={5}
                className="w-full bg-[#111] border border-[#333] rounded-xl p-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#9b59b6]/50 text-sm"
              />
              {testResponse.length > 20 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex gap-3 items-center">
                  <Trophy size={20} className="text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-400">
                    {isAr
                      ? 'ممتاز! أنت جاهز للتغيير الحقيقي. كل مرة تستخدم فيها هذه الاستجابة، يصبح المسار العصبي الجديد أقوى.'
                      : "Excellent! You're ready for real change. Every time you use this response, the new neural pathway grows stronger."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#333] text-gray-400 hover:border-[#555] hover:text-white transition-colors"
              >
                {isAr ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                {isAr ? 'السابق' : 'Back'}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-black transition-all ${
                canProceed()
                  ? 'opacity-100 hover:scale-[1.02]'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              style={{ background: canProceed() ? 'linear-gradient(135deg, #c9a84c, #f0c96e)' : '#444' }}
            >
              {step === 6
                ? (isAr ? 'إنهاء وحفظ الجلسة' : 'Finish & Save Session')
                : (isAr ? 'التالي' : 'Next')}
              {step < 6 && (isAr ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
