import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

const WHEEL_AREAS = [
  { key: 'body',         ar: 'الصحة',     en: 'Health' },
  { key: 'emotions',     ar: 'العواطف',   en: 'Emotions' },
  { key: 'relationships',ar: 'العلاقات',  en: 'Relationships' },
  { key: 'time',         ar: 'الوقت',     en: 'Time' },
  { key: 'career',       ar: 'المهنة',    en: 'Career' },
  { key: 'money',        ar: 'المال',     en: 'Money' },
  { key: 'contribution', ar: 'المساهمة',  en: 'Contribution' },
]

function getMonthName(date, lang) {
  return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })
}

function getCurrentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getPrevMonthKey() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Fire animation CSS injected once
const FIRE_STYLE = `
@keyframes burnText {
  0%   { opacity: 1; color: #fff; text-shadow: none; }
  40%  { color: #e67e22; text-shadow: 0 0 20px #e67e22, 0 0 40px #e74c3c; }
  70%  { color: #e74c3c; text-shadow: 0 0 30px #e74c3c, 0 0 60px #e67e22; opacity: 0.6; }
  100% { opacity: 0; color: #e74c3c; text-shadow: 0 0 10px #e74c3c; }
}
@keyframes breath {
  from { transform: scale(0.95); opacity: 0.7; }
  to   { transform: scale(1.05); opacity: 1; }
}
`

export default function MonthlyReset() {
  const { state, update } = useApp()
  const { lang, t } = useLang()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const [phase, setPhase] = useState(0)

  // Phase 1 — Review
  const [wins, setWins] = useState('')
  const [challenge, setChallenge] = useState('')
  const [who, setWho] = useState('')

  // Phase 2 — Release
  const [release, setRelease] = useState('')
  const [burning, setBurning] = useState(false)   // animation playing
  const [burned, setBurned]   = useState(false)    // done

  // Phase 3 — Assessment
  const [scores, setScores] = useState(() => {
    const base = state.wheelScores || {}
    const result = {}
    WHEEL_AREAS.forEach(a => { result[a.key] = base[a.key] ?? 5 })
    return result
  })

  // Phase 4 — Intention
  const [wordOfMonth, setWordOfMonth] = useState('')
  const [mainGoal, setMainGoal]       = useState('')
  const [commitments, setCommitments] = useState(['', '', ''])
  const [whoWillBe, setWhoWillBe]     = useState('')

  const currentMonthKey = getCurrentMonthKey()
  const prevMonthKey    = getPrevMonthKey()
  const currentMonthName = getMonthName(new Date(), lang)

  // Inject fire CSS once
  useEffect(() => {
    const id = 'monthly-reset-style'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = FIRE_STYLE
      document.head.appendChild(el)
    }
  }, [])

  // Stats for phase 0
  const dailyWins = state.dailyWins || {}
  const monthWinsCount = Object.entries(dailyWins)
    .filter(([date]) => date.startsWith(currentMonthKey))
    .reduce((sum, [, arr]) => sum + (arr?.length || 0), 0)

  const goalsThisMonth = (state.goals || []).filter(
    g => g.createdAt && g.createdAt.startsWith(currentMonthKey)
  ).length

  const streak = state.streak || 0

  // Morning sessions this month — count morningDone days from stateLog proxy
  // We use dailyWins dates as rough proxy for active days this month
  const activeDaysThisMonth = Object.keys(dailyWins).filter(d => d.startsWith(currentMonthKey)).length

  // Wheel history delta
  const wheelHistory = state.wheelHistory || []
  const prevSnap = wheelHistory.filter(h => h.date && h.date.startsWith(prevMonthKey)).slice(-1)[0]
  const prevScores = prevSnap?.scores || null

  function getDeltas() {
    if (!prevScores) return {}
    const deltas = {}
    WHEEL_AREAS.forEach(a => {
      deltas[a.key] = (scores[a.key] ?? 5) - (prevScores[a.key] ?? 5)
    })
    return deltas
  }

  const deltas = getDeltas()

  const bestImproved = prevScores
    ? WHEEL_AREAS.reduce((best, a) =>
        (deltas[a.key] ?? 0) > (deltas[best?.key] ?? 0) ? a : best,
      WHEEL_AREAS[0])
    : null

  const mostNeeded = WHEEL_AREAS.reduce((worst, a) =>
    (scores[a.key] ?? 5) < (scores[worst.key] ?? 5) ? a : worst,
  WHEEL_AREAS[0])

  // Month wins reference chips for phase 1
  const thisMonthWinChips = Object.entries(dailyWins)
    .filter(([date]) => date.startsWith(currentMonthKey))
    .flatMap(([, arr]) => (arr || []).map(w => w.text || ''))
    .filter(Boolean)
    .slice(0, 12)

  function handleBurn() {
    if (!release.trim()) return
    setBurning(true)
    setTimeout(() => {
      setBurning(false)
      setBurned(true)
    }, 3000)
  }

  function handleScoreChange(key, val) {
    setScores(prev => ({ ...prev, [key]: Number(val) }))
  }

  function setCommit(i, v) {
    const c = [...commitments]
    c[i] = v
    setCommitments(c)
  }

  function handleSave() {
    const newReset = {
      month: currentMonthKey,
      wins,
      challenge,
      who,
      release: burned ? release : '',
      scores: { ...scores },
      wordOfMonth,
      mainGoal,
      commitments: [...commitments],
      whoWillBe,
      completedAt: new Date().toISOString(),
    }
    update('monthlyResets', [...(state.monthlyResets || []), newReset])
    // Also save wheel snapshot
    update('wheelHistory', [
      ...(state.wheelHistory || []),
      { date: new Date().toISOString().slice(0, 10), scores: { ...scores } },
    ])
    showToast(isAr ? 'تم حفظ احتفال الشهر ✓' : 'Monthly reset saved ✓', 'success')
    setPhase(5)
  }

  const totalPhases = 6
  const canProceed = [
    true,                              // phase 0 always
    wins.trim().length > 0,            // phase 1
    true,                              // phase 2 (optional)
    true,                              // phase 3 (sliders)
    wordOfMonth.trim() && mainGoal.trim(), // phase 4
    true,                              // phase 5
  ]

  // ─── Phase Dots ───────────────────────────────────────────────────────────
  function PhaseDots() {
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: totalPhases }, (_, i) => (
          <button
            key={i}
            onClick={() => i < phase && setPhase(i)}
            style={{
              width: i === phase ? 20 : 8,
              height: 8,
              borderRadius: 4,
              background: i === phase
                ? 'linear-gradient(90deg, #c9a84c, #e6c96f)'
                : i < phase ? '#c9a84c66' : '#2a2a2a',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: i < phase ? 'pointer' : 'default',
            }}
          />
        ))}
      </div>
    )
  }

  function NavButtons({ onNext, nextLabel, nextDisabled = false, showBack = true }) {
    return (
      <div className="flex gap-3 mt-6">
        {showBack && phase > 0 && (
          <button
            onClick={() => setPhase(p => p - 1)}
            className="flex-1 py-3 rounded-2xl text-sm font-bold"
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#888' }}
          >
            {isAr ? '← رجوع' : '← Back'}
          </button>
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 py-3 rounded-2xl text-sm font-bold disabled:opacity-40 active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}
        >
          {nextLabel}
        </button>
      </div>
    )
  }

  // ─── PHASE 0: Welcome ─────────────────────────────────────────────────────
  if (phase === 0) {
    return (
      <Layout title="">
        <div className="space-y-5 pt-2 pb-8">
          <PhaseDots />

          <div className="flex flex-col items-center text-center py-4">
            <div className="text-7xl mb-4" style={{ animation: 'breath 3s ease-in-out infinite alternate' }}>🌕</div>
            <h1 className="text-2xl font-black mb-1" style={{
              background: 'linear-gradient(135deg, #c9a84c, #e6c96f)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              {isAr ? 'احتفال الشهر الجديد' : 'New Month Ceremony'}
            </h1>
            <p className="text-sm font-bold mt-1" style={{ color: '#9b59b6' }}>
              {currentMonthName}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '☀️', value: activeDaysThisMonth, labelAr: 'صباح نشط', labelEn: 'active mornings' },
              { emoji: '🏆', value: monthWinsCount, labelAr: 'انتصار مسجّل', labelEn: 'wins logged' },
              { emoji: '🔥', value: streak, labelAr: 'يوم سلسلة', labelEn: 'day streak' },
              { emoji: '🎯', value: goalsThisMonth, labelAr: 'هدف جديد', labelEn: 'new goals' },
            ].map(({ emoji, value, labelAr, labelEn }) => (
              <div key={labelEn} className="rounded-2xl p-4 text-center"
                style={{ background: 'rgba(155,89,182,0.08)', border: '1px solid rgba(155,89,182,0.25)' }}>
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="text-3xl font-black" style={{ color: '#c9a84c' }}>{value}</div>
                <div className="text-xs mt-1" style={{ color: '#888' }}>{isAr ? labelAr : labelEn}</div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-sm text-white text-center leading-relaxed" style={{ fontStyle: 'italic' }}>
              {isAr
                ? '"كل شهر جديد هو فرصة جديدة لتصبح النسخة الأحسن من نفسك"'
                : '"Every new month is a new opportunity to become the best version of yourself"'}
            </p>
            <p className="text-xs text-center mt-2" style={{ color: '#c9a84c' }}>— Tony Robbins</p>
          </div>

          <button
            onClick={() => setPhase(1)}
            className="w-full py-4 rounded-2xl text-base font-black active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}
          >
            {isAr ? '🌕 ابدأ الاحتفال' : '🌕 Begin the Ceremony'}
          </button>
        </div>
      </Layout>
    )
  }

  // ─── PHASE 1: Review ──────────────────────────────────────────────────────
  if (phase === 1) {
    return (
      <Layout title={isAr ? 'المراجعة' : 'Review'} subtitle={isAr ? 'ماذا حدث هذا الشهر؟' : 'What happened this month?'}>
        <div className="space-y-5 pt-2 pb-8">
          <PhaseDots />

          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.25)' }}>
            <p className="text-sm font-black mb-1" style={{ color: '#9b59b6' }}>
              {isAr ? '1 — أكبر 3 انتصارات هذا الشهر' : '1 — Top 3 wins this month'}
            </p>
            <p className="text-xs mb-2" style={{ color: '#888' }}>
              {isAr ? 'أي شيء، صغيراً كان أم كبيراً' : 'Anything, big or small'}
            </p>
            <textarea
              value={wins}
              onChange={e => setWins(e.target.value)}
              placeholder={isAr ? 'اكتب انتصاراتك هنا...' : 'Write your wins here...'}
              rows={3}
              className="input-dark resize-none text-sm w-full"
            />
          </div>

          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.25)' }}>
            <p className="text-sm font-black mb-1" style={{ color: '#9b59b6' }}>
              {isAr ? '2 — أكبر تحدٍّ واجهته وما تعلمته منه' : '2 — Biggest challenge & lesson learned'}
            </p>
            <textarea
              value={challenge}
              onChange={e => setChallenge(e.target.value)}
              placeholder={isAr ? 'التحدي والدرس...' : 'The challenge and the lesson...'}
              rows={3}
              className="input-dark resize-none text-sm w-full"
            />
          </div>

          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.25)' }}>
            <p className="text-sm font-black mb-1" style={{ color: '#9b59b6' }}>
              {isAr ? '3 — من أثّر إيجابياً في حياتي هذا الشهر؟' : '3 — Who influenced my life positively this month?'}
            </p>
            <textarea
              value={who}
              onChange={e => setWho(e.target.value)}
              placeholder={isAr ? 'شخص أو أشخاص...' : 'A person or people...'}
              rows={2}
              className="input-dark resize-none text-sm w-full"
            />
          </div>

          {/* Reference chips */}
          {thisMonthWinChips.length > 0 && (
            <div>
              <p className="text-xs mb-2" style={{ color: '#888' }}>
                📋 {isAr ? 'انتصاراتك المسجّلة هذا الشهر (للمرجع):' : 'Your logged wins this month (for reference):'}
              </p>
              <div className="flex flex-wrap gap-2">
                {thisMonthWinChips.map((w, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full"
                    style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c' }}>
                    {w.length > 30 ? w.slice(0, 30) + '…' : w}
                  </span>
                ))}
              </div>
            </div>
          )}

          <NavButtons
            onNext={() => setPhase(2)}
            nextLabel={isAr ? 'التالي: التحرير →' : 'Next: Release →'}
            nextDisabled={!canProceed[1]}
          />
        </div>
      </Layout>
    )
  }

  // ─── PHASE 2: Release ─────────────────────────────────────────────────────
  if (phase === 2) {
    return (
      <Layout title={isAr ? 'أطلق السراح' : 'Release'} subtitle={isAr ? 'ما تريد تركه في الشهر الماضي' : 'What to leave in the past month'}>
        <div className="space-y-5 pt-2 pb-8">
          <PhaseDots />

          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(155,89,182,0.08)', border: '2px solid rgba(155,89,182,0.4)' }}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#ccc' }}>
              {isAr
                ? 'اكتب ما تريد تركه في الشهر الماضي — توقعات خاطئة، ضغينة، عادات سيئة، قرارات خاطئة'
                : 'Write what you want to leave in the past month — wrong expectations, resentments, bad habits, poor decisions'}
            </p>

            {!burned ? (
              <>
                <p className="text-xs font-bold mb-2" style={{ color: '#9b59b6' }}>
                  {isAr ? 'أتحرر من...' : 'I release...'}
                </p>
                <textarea
                  value={release}
                  onChange={e => !burning && setRelease(e.target.value)}
                  placeholder={isAr ? 'اكتب هنا ما تريد التحرر منه...' : 'Write here what you want to release...'}
                  rows={4}
                  className="input-dark resize-none text-sm w-full mb-4"
                  style={burning ? {
                    animation: 'burnText 3s ease-out forwards',
                    pointerEvents: 'none',
                  } : {}}
                  readOnly={burning}
                />

                {!burning && (
                  <button
                    onClick={handleBurn}
                    disabled={!release.trim()}
                    className="w-full py-3 rounded-2xl font-bold text-sm disabled:opacity-40 active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg, #e74c3c, #e67e22)', color: '#fff' }}
                  >
                    🔥 {isAr ? 'أحرقها' : 'Burn it'}
                  </button>
                )}

                {burning && (
                  <div className="text-center py-3">
                    <div className="text-4xl mb-2" style={{ animation: 'breath 0.5s ease-in-out infinite alternate' }}>🔥</div>
                    <p className="text-sm font-bold" style={{ color: '#e67e22' }}>
                      {isAr ? 'يحترق...' : 'Burning...'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 animate-scale-in">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-lg font-black" style={{ color: '#2ecc71' }}>
                  {isAr ? 'تم التحرير ✓' : 'Released ✓'}
                </p>
                <p className="text-sm mt-2" style={{ color: '#888' }}>
                  {isAr ? 'أنت خفيف الآن. الماضي مضى.' : 'You are free now. The past is gone.'}
                </p>
              </div>
            )}
          </div>

          <NavButtons
            onNext={() => setPhase(3)}
            nextLabel={isAr ? 'التالي: التقييم →' : 'Next: Assessment →'}
          />
        </div>
      </Layout>
    )
  }

  // ─── PHASE 3: Assessment ──────────────────────────────────────────────────
  if (phase === 3) {
    return (
      <Layout title={isAr ? 'التقييم' : 'Assessment'} subtitle={isAr ? 'عجلة الحياة الشهرية' : 'Monthly Wheel of Life'}>
        <div className="space-y-4 pt-2 pb-8">
          <PhaseDots />

          {prevScores && bestImproved && (
            <div className="rounded-2xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.25)' }}>
              <span className="text-xl">🌟</span>
              <div>
                <p className="text-xs font-black" style={{ color: '#2ecc71' }}>
                  {isAr
                    ? `مجال "${bestImproved.ar}" تحسّن أكثر هذا الشهر!`
                    : `"${bestImproved.en}" improved the most this month!`}
                </p>
              </div>
            </div>
          )}

          {WHEEL_AREAS.map(area => {
            const val = scores[area.key] ?? 5
            const delta = deltas[area.key]
            const prevVal = prevScores?.[area.key]
            return (
              <div key={area.key} className="rounded-2xl p-4"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{isAr ? area.ar : area.en}</span>
                  <div className="flex items-center gap-2">
                    {prevVal !== undefined && delta !== 0 && (
                      <span className="text-xs font-bold"
                        style={{ color: delta > 0 ? '#2ecc71' : '#e74c3c' }}>
                        {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`}
                      </span>
                    )}
                    <span className="text-xl font-black w-8 text-center" style={{ color: '#c9a84c' }}>{val}</span>
                  </div>
                </div>
                <input
                  type="range" min={1} max={10} value={val}
                  onChange={e => handleScoreChange(area.key, e.target.value)}
                  className="w-full"
                  style={{
                    accentColor: '#c9a84c',
                    background: `linear-gradient(to ${isAr ? 'left' : 'right'}, #c9a84c ${(val - 1) / 9 * 100}%, #333 ${(val - 1) / 9 * 100}%)`,
                  }}
                />
                {prevVal !== undefined && (
                  <p className="text-xs mt-1" style={{ color: '#555' }}>
                    {isAr ? `الشهر الماضي: ${prevVal}` : `Last month: ${prevVal}`}
                  </p>
                )}
              </div>
            )
          })}

          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
              {isAr ? '🎯 يحتاج أكثر تركيز الشهر القادم:' : '🎯 Needs most focus next month:'}
            </p>
            <p className="text-sm font-black text-white">
              {isAr ? mostNeeded.ar : mostNeeded.en} ({scores[mostNeeded.key]}/10)
            </p>
          </div>

          <NavButtons
            onNext={() => setPhase(4)}
            nextLabel={isAr ? 'التالي: النية →' : 'Next: Intention →'}
          />
        </div>
      </Layout>
    )
  }

  // ─── PHASE 4: Intention ───────────────────────────────────────────────────
  if (phase === 4) {
    return (
      <Layout title={isAr ? 'النية' : 'Intention'} subtitle={isAr ? 'نيتك للشهر القادم' : 'Your intention for next month'}>
        <div className="space-y-5 pt-2 pb-8">
          <PhaseDots />

          {/* Word of the Month */}
          <div>
            <p className="text-sm font-black mb-2" style={{ color: '#c9a84c' }}>
              {isAr ? 'كلمة الشهر / Word of the Month' : 'Word of the Month / كلمة الشهر'}
            </p>
            <input
              value={wordOfMonth}
              onChange={e => setWordOfMonth(e.target.value)}
              placeholder={isAr ? 'كلمة واحدة...' : 'One word...'}
              className="w-full text-center text-2xl font-black py-4 rounded-2xl"
              style={{
                background: '#0f0a00',
                border: '2px solid rgba(201,168,76,0.5)',
                color: '#c9a84c',
                outline: 'none',
              }}
            />
          </div>

          {/* Main goal */}
          <div>
            <p className="text-sm font-black mb-2" style={{ color: '#9b59b6' }}>
              {isAr ? 'هدفي الأكبر هذا الشهر' : 'My #1 goal this month'}
            </p>
            <input
              value={mainGoal}
              onChange={e => setMainGoal(e.target.value)}
              placeholder={isAr ? 'الهدف الأكبر...' : 'My biggest goal...'}
              className="input-dark text-sm w-full"
            />
          </div>

          {/* 3 commitments */}
          <div>
            <p className="text-sm font-black mb-2" style={{ color: '#e63946' }}>
              {isAr ? '3 التزامات لا تقبل المساومة' : '3 Non-Negotiable Commitments'}
            </p>
            {commitments.map((c, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black w-5 text-center" style={{ color: '#e63946' }}>{i + 1}</span>
                <input
                  value={c}
                  onChange={e => setCommit(i, e.target.value)}
                  placeholder={isAr ? `الالتزام ${i + 1}...` : `Commitment ${i + 1}...`}
                  className="input-dark flex-1 text-sm py-2"
                />
              </div>
            ))}
          </div>

          {/* Who will I be */}
          <div>
            <p className="text-sm font-black mb-2" style={{ color: '#2ecc71' }}>
              {isAr ? 'من سأكون بنهاية هذا الشهر؟' : 'Who will I BE by end of this month?'}
            </p>
            <textarea
              value={whoWillBe}
              onChange={e => setWhoWillBe(e.target.value)}
              placeholder={isAr ? 'صف النسخة التي ستكونها...' : 'Describe the version you will be...'}
              rows={3}
              className="input-dark resize-none text-sm w-full"
            />
          </div>

          <NavButtons
            onNext={handleSave}
            nextLabel={isAr ? '🏆 أكمل الاحتفال' : '🏆 Complete Ceremony'}
            nextDisabled={!canProceed[4]}
          />
        </div>
      </Layout>
    )
  }

  // ─── PHASE 5: Celebration ─────────────────────────────────────────────────
  return (
    <Layout title="">
      <div className="space-y-5 pt-2 pb-8">
        <div className="flex flex-col items-center text-center py-4">
          <div className="text-7xl mb-4 animate-scale-in">🏆</div>
          <h1 className="text-2xl font-black mb-2" style={{
            background: 'linear-gradient(135deg, #c9a84c, #e6c96f)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            {isAr ? `شهر ${currentMonthName} مكتمل!` : `${currentMonthName} Complete!`}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
            {isAr
              ? 'أنت تبني مصيرك قراراً قراراً'
              : 'You are building your destiny one decision at a time'}
          </p>
        </div>

        {/* Word of Month — big gold */}
        {wordOfMonth && (
          <div className="text-center py-4">
            <p className="text-xs mb-2" style={{ color: '#888' }}>
              {isAr ? 'كلمة شهرك' : 'Your word of the month'}
            </p>
            <p className="text-5xl font-black" style={{
              background: 'linear-gradient(135deg, #c9a84c, #e6c96f)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              {wordOfMonth}
            </p>
          </div>
        )}

        {/* Summary card */}
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(155,89,182,0.06)', border: '2px solid rgba(155,89,182,0.3)' }}>

          {mainGoal && (
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: '#9b59b6' }}>
                🎯 {isAr ? 'هدفي الأكبر' : 'My #1 Goal'}
              </p>
              <p className="text-sm text-white font-bold">{mainGoal}</p>
            </div>
          )}

          {commitments.some(c => c.trim()) && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: '#e63946' }}>
                💪 {isAr ? 'الالتزامات' : 'Commitments'}
              </p>
              {commitments.filter(c => c.trim()).map((c, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="text-xs" style={{ color: '#e63946' }}>✓</span>
                  <span className="text-xs text-white">{c}</span>
                </div>
              ))}
            </div>
          )}

          {whoWillBe && (
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: '#2ecc71' }}>
                🪞 {isAr ? 'من سأكون' : 'Who I Will Be'}
              </p>
              <p className="text-xs text-white leading-relaxed" style={{ fontStyle: 'italic' }}>"{whoWillBe}"</p>
            </div>
          )}
        </div>

        {/* Share with coach */}
        <button
          onClick={() => showToast(isAr ? 'تمت المشاركة مع المدرب ✓' : 'Shared with coach ✓', 'success')}
          className="w-full py-3 rounded-2xl text-sm font-bold"
          style={{ background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.4)', color: '#9b59b6' }}
        >
          📤 {isAr ? 'شارك مع المدرب' : 'Share with Coach'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl text-base font-black active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}
        >
          {isAr ? '🚀 ابدأ شهراً جديداً بقوة!' : '🚀 Start the new month with power!'}
        </button>
      </div>
    </Layout>
  )
}
