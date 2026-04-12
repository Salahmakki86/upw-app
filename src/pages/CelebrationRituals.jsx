import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'
import { Trophy, Plus, Trash2, Zap, Star, ChevronDown, ChevronUp } from 'lucide-react'

const PRESET_RITUALS = [
  { id: 'victory_dance',   emoji: '🎉', ar: 'رقصة النصر',       en: 'Victory Dance',    desc_ar: 'ارقص رقصة نصر لمدة 30 ثانية',          desc_en: 'Do a power dance for 30 seconds' },
  { id: 'fist_pump',       emoji: '🙌', ar: 'رفع القبضات',       en: 'Fist Pump',        desc_ar: 'ارفع قبضتيك 5 مرات مع "نعم!"',          desc_en: 'Pump fists 5 times with "YES!"' },
  { id: 'chest_bump',      emoji: '🏆', ar: 'تفرجعة للصدر',      en: 'Chest Bump Self',  desc_ar: 'اضرب صدرك وقل "أنا فعلتها!"',           desc_en: 'Hit chest and say "I did it!"' },
  { id: 'body_shake',      emoji: '💃', ar: 'حركة الجسم',        en: 'Full Body Shake',  desc_ar: 'هزّ جسمك كله لمدة 20 ثانية',            desc_en: 'Shake your whole body for 20 seconds' },
  { id: 'victory_shout',   emoji: '📣', ar: 'الصراخ بالنجاح',    en: 'Victory Shout',    desc_ar: 'اصرخ بانتصارك بصوت عالٍ',              desc_en: 'Shout your win out loud' },
  { id: 'power_jumps',     emoji: '🤸', ar: 'القفز',             en: 'Power Jumps',      desc_ar: '3 قفزات عالية مع رفع الذراعين',         desc_en: '3 high jumps with arms raised' },
]

const WIN_CATEGORIES = [
  { id: 'health',       emoji: '💪', ar: 'صحة',      en: 'Health' },
  { id: 'money',        emoji: '💰', ar: 'مال',       en: 'Money' },
  { id: 'relationship', emoji: '❤️', ar: 'علاقة',    en: 'Relationship' },
  { id: 'mindset',      emoji: '🧠', ar: 'عقلية',    en: 'Mindset' },
  { id: 'goal',         emoji: '🎯', ar: 'هدف',       en: 'Goal' },
  { id: 'growth',       emoji: '🌱', ar: 'نمو',       en: 'Growth' },
  { id: 'business',     emoji: '💼', ar: 'عمل',       en: 'Business' },
]

const INTENSITY_COLORS = {
  low:    '#3498db',
  medium: '#f39c12',
  high:   '#e74c3c',
}

function intensityColor(n) {
  if (n <= 3) return INTENSITY_COLORS.low
  if (n <= 6) return INTENSITY_COLORS.medium
  return INTENSITY_COLORS.high
}

function formatDate(ts, isAr) {
  const d = new Date(ts)
  return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
}

export default function CelebrationRituals() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  // Load saved data
  const saved = state.celebrationRituals || { selectedRituals: [], winsLog: [] }
  const selectedRituals = saved.selectedRituals || []
  const winsLog = saved.winsLog || []

  // Win log form
  const [winCategory, setWinCategory]   = useState('goal')
  const [winText, setWinText]           = useState('')
  const [winIntensity, setWinIntensity] = useState(7)
  const [customRitual, setCustomRitual] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [showLogSection, setShowLogSection] = useState(true)

  // Celebration overlay state
  const [celebrating, setCelebrating]   = useState(false)
  const [celebRitual, setCelebRitual]   = useState(null)
  const [countdown, setCountdown]       = useState(3)
  const [showCelebrate, setShowCelebrate] = useState(false)
  const countdownRef = useRef(null)

  function saveRituals(newSelected) {
    update('celebrationRituals', { ...saved, selectedRituals: newSelected })
  }

  function toggleRitual(id) {
    const next = selectedRituals.includes(id)
      ? selectedRituals.filter(r => r !== id)
      : [...selectedRituals, id]
    saveRituals(next)
  }

  function addCustomRitual() {
    const trimmed = customRitual.trim()
    if (!trimmed) return
    const id = 'custom_' + Date.now()
    const next = [...selectedRituals, id + ':' + trimmed]
    saveRituals(next)
    setCustomRitual('')
    setShowCustomInput(false)
    showToast(isAr ? 'تمت إضافة الاحتفالية' : 'Custom ritual added', 'success')
  }

  function removeCustomRitual(entry) {
    saveRituals(selectedRituals.filter(r => r !== entry))
  }

  function logWin() {
    if (!winText.trim()) {
      showToast(isAr ? 'الرجاء وصف انتصارك' : 'Please describe your win', 'error')
      return
    }

    const newWin = {
      id:        Date.now(),
      date:      new Date().toISOString().split('T')[0],
      category:  winCategory,
      text:      winText.trim(),
      intensity: winIntensity,
      ts:        Date.now(),
    }

    const newLog = [newWin, ...winsLog]
    update('celebrationRituals', { ...saved, winsLog: newLog })

    // Pick a random selected ritual to celebrate with
    const activePresets = PRESET_RITUALS.filter(r => selectedRituals.includes(r.id))
    const customEntries  = selectedRituals.filter(r => r.startsWith('custom_'))
    const allActive = [...activePresets.map(r => ({ emoji: r.emoji, label: isAr ? r.ar : r.en })),
                       ...customEntries.map(e => ({ emoji: '✨', label: e.split(':').slice(1).join(':') }))]

    let ritual = null
    if (allActive.length > 0) {
      ritual = allActive[Math.floor(Math.random() * allActive.length)]
    } else {
      ritual = { emoji: '🎉', label: isAr ? 'رقصة النصر' : 'Victory Dance' }
    }

    setCelebRitual(ritual)
    setCountdown(3)
    setCelebrating(true)
    setShowCelebrate(false)
    setWinText('')
    setWinIntensity(7)
    setWinCategory('goal')
  }

  useEffect(() => {
    if (!celebrating) return
    if (showCelebrate) return

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          setShowCelebrate(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownRef.current)
  }, [celebrating, showCelebrate])

  function closeCelebration() {
    setCelebrating(false)
    setShowCelebrate(false)
    setCelebRitual(null)
    clearInterval(countdownRef.current)
  }

  const recentWins = winsLog.slice(0, 7)

  const customRitualEntries = selectedRituals.filter(r => r.startsWith('custom_'))

  return (
    <Layout
      title={isAr ? 'احتفالات النصر' : 'Celebration Rituals'}
      subtitle={isAr ? 'ارسّخ كل انتصار بالاحتفال — الأدمغة تتعلم مما تكرر' : 'Anchor every win with celebration — brains learn what you repeat'}
    >
      {/* === CELEBRATION OVERLAY === */}
      {celebrating && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '1.5rem',
          }}
          onClick={showCelebrate ? closeCelebration : undefined}
        >
          {!showCelebrate ? (
            <>
              {/* Skip button — top-right corner */}
              <button
                onClick={e => { e.stopPropagation(); clearInterval(countdownRef.current); setShowCelebrate(true); setCountdown(0) }}
                style={{
                  position: 'absolute', top: '1.25rem', right: isAr ? undefined : '1.25rem', left: isAr ? '1.25rem' : undefined,
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '0.35rem 0.75rem',
                  color: '#888', fontSize: '0.85rem', cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {isAr ? 'تخطى ←' : 'Skip →'}
              </button>

              <p style={{ color: '#888', fontSize: '1rem' }}>
                {isAr ? 'احتفل بـ' : 'Celebrate with'}
              </p>
              {celebRitual && (
                <p style={{ color: '#c9a84c', fontSize: '1.4rem', fontWeight: 700 }}>
                  {celebRitual.emoji} {celebRitual.label}
                </p>
              )}
              <div
                style={{
                  width: 120, height: 120, borderRadius: '50%',
                  border: '4px solid #c9a84c',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', fontWeight: 800, color: '#c9a84c',
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              >
                {countdown}
              </div>
            </>
          ) : (
            <>
              {celebRitual && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '5rem', animation: 'bounce 0.6s ease infinite alternate', marginBottom: '0.5rem' }}>
                    {celebRitual.emoji}
                  </div>
                  <p style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    {celebRitual.label}
                  </p>
                </div>
              )}
              <h2 style={{ color: '#c9a84c', fontSize: '2.5rem', fontWeight: 900, textAlign: 'center' }}>
                {isAr ? 'احتفل الآن!' : 'CELEBRATE!'}
              </h2>
              <button
                onClick={e => { e.stopPropagation(); closeCelebration() }}
                style={{
                  marginTop: '0.75rem',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, padding: '0.6rem 2rem',
                  color: '#888', fontSize: '0.9rem', cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {isAr ? 'أغلق' : 'Close'}
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.08); opacity:.8; } }
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-16px); } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ===== SECTION 1 — MY RITUALS ===== */}
        <div className="card" style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '1.5rem' }}>
          <h2 style={{ color: '#c9a84c', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {isAr ? '🎊 احتفالاتي' : '🎊 My Rituals'}
          </h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {isAr ? 'اختر احتفالياتك المفضلة — ستُستخدم عند تسجيل أي انتصار' : 'Pick your favourite rituals — they\'ll be used when you log a win'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {PRESET_RITUALS.map(ritual => {
              const active = selectedRituals.includes(ritual.id)
              return (
                <button
                  key={ritual.id}
                  onClick={() => toggleRitual(ritual.id)}
                  style={{
                    background: active ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                    border: active ? '1px solid rgba(201,168,76,0.5)' : '1px solid #2a2a2a',
                    borderRadius: 12, padding: '0.85rem 0.75rem',
                    cursor: 'pointer', textAlign: isAr ? 'right' : 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{ritual.emoji}</div>
                  <div style={{ color: active ? '#c9a84c' : '#ccc', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {isAr ? ritual.ar : ritual.en}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.75rem', lineHeight: 1.4 }}>
                    {isAr ? ritual.desc_ar : ritual.desc_en}
                  </div>
                  {active && (
                    <div style={{ marginTop: '0.5rem', color: '#c9a84c', fontSize: '0.75rem', fontWeight: 600 }}>
                      ✓ {isAr ? 'نشط' : 'Active'}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Custom rituals */}
          {customRitualEntries.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {customRitualEntries.map(entry => (
                <div
                  key={entry}
                  style={{
                    background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: 20, padding: '0.35rem 0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c9a84c', fontSize: '0.85rem',
                  }}
                >
                  ✨ {entry.split(':').slice(1).join(':')}
                  <button
                    onClick={() => removeCustomRitual(entry)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0, lineHeight: 1, display: 'flex' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add custom */}
          <div style={{ marginTop: '1rem' }}>
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                style={{
                  background: 'none', border: '1px dashed #333', borderRadius: 8,
                  color: '#666', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                <Plus size={15} />
                {isAr ? 'إضافة احتفالية مخصصة' : 'Add custom ritual'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="input-dark"
                  value={customRitual}
                  onChange={e => setCustomRitual(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomRitual()}
                  placeholder={isAr ? 'اكتب احتفاليتك...' : 'Describe your ritual...'}
                  style={{ flex: 1, borderRadius: 8 }}
                  autoFocus
                />
                <button
                  onClick={addCustomRitual}
                  style={{
                    background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909',
                    border: 'none', borderRadius: 8, padding: '0 1rem', cursor: 'pointer', fontWeight: 700,
                  }}
                >
                  {isAr ? 'إضافة' : 'Add'}
                </button>
                <button
                  onClick={() => { setShowCustomInput(false); setCustomRitual('') }}
                  style={{ background: '#1e1e1e', border: 'none', borderRadius: 8, padding: '0 0.75rem', cursor: 'pointer', color: '#888' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <p style={{ color: '#444', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            {selectedRituals.length} {isAr ? 'احتفالية نشطة' : 'active rituals'}
          </p>
        </div>

        {/* ===== SECTION 2 — LOG A WIN ===== */}
        <div className="card" style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '1.5rem' }}>
          <button
            onClick={() => setShowLogSection(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <h2 style={{ color: '#c9a84c', fontSize: '1.2rem', fontWeight: 700 }}>
              {isAr ? '✍️ سجّل انتصارك' : '✍️ Log a Win'}
            </h2>
            {showLogSection ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
          </button>

          {showLogSection && (
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Category chips */}
              <div>
                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                  {isAr ? 'نوع الانتصار' : 'Win category'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {WIN_CATEGORIES.map(cat => {
                    const active = winCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setWinCategory(cat.id)}
                        style={{
                          background: active ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                          border: active ? '1px solid rgba(201,168,76,0.5)' : '1px solid #2a2a2a',
                          borderRadius: 20, padding: '0.4rem 0.85rem',
                          cursor: 'pointer', color: active ? '#c9a84c' : '#aaa', fontSize: '0.85rem',
                          transition: 'all 0.15s',
                        }}
                      >
                        {cat.emoji} {isAr ? cat.ar : cat.en}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Win description */}
              <div>
                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  {isAr ? 'صف انتصارك' : 'Describe your win'}
                </p>
                <textarea
                  className="input-dark"
                  rows={3}
                  value={winText}
                  onChange={e => setWinText(e.target.value)}
                  placeholder={isAr ? 'ما الذي أنجزته؟ مهما كان صغيراً، يستحق الاحتفال...' : 'What did you accomplish? No matter how small, it deserves celebration...'}
                  style={{ width: '100%', resize: 'vertical', borderRadius: 10 }}
                />
              </div>

              {/* Intensity slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <p style={{ color: '#888', fontSize: '0.85rem' }}>
                    {isAr ? 'كم كبير هذا الانتصار؟' : 'How big is this win?'}
                  </p>
                  <span style={{
                    color: intensityColor(winIntensity), fontWeight: 700, fontSize: '1.1rem',
                    minWidth: 28, textAlign: 'center',
                  }}>
                    {winIntensity}
                  </span>
                </div>
                <input
                  type="range" min={1} max={10} value={winIntensity}
                  onChange={e => setWinIntensity(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#c9a84c', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  <span>{isAr ? 'صغير' : 'Small'}</span>
                  <span>{isAr ? 'متوسط' : 'Medium'}</span>
                  <span>{isAr ? 'ضخم!' : 'Huge!'}</span>
                </div>
              </div>

              <button
                onClick={logWin}
                style={{
                  background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909',
                  border: 'none', borderRadius: 12, padding: '0.9rem',
                  cursor: 'pointer', fontWeight: 800, fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <Trophy size={18} />
                {isAr ? 'سجّل وابتهج! 🎉' : 'Log & Celebrate! 🎉'}
              </button>
            </div>
          )}
        </div>

        {/* ===== SECTION 3 — WIN LOG ===== */}
        <div className="card" style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#c9a84c', fontSize: '1.2rem', fontWeight: 700 }}>
              {isAr ? '🏆 سجل الانتصارات' : '🏆 Win Log'}
            </h2>
            <div style={{
              background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 20, padding: '0.25rem 0.75rem', color: '#c9a84c', fontSize: '0.85rem', fontWeight: 700,
            }}>
              {winsLog.length} {isAr ? 'انتصار' : 'wins'}
            </div>
          </div>

          {recentWins.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#444', padding: '2rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
              <p style={{ fontSize: '0.9rem' }}>{isAr ? 'لا توجد انتصارات بعد — سجّل أول انتصاراتك!' : 'No wins yet — log your first win!'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentWins.map(win => {
                const cat = WIN_CATEGORIES.find(c => c.id === win.category) || WIN_CATEGORIES[0]
                return (
                  <div
                    key={win.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid #1e1e1e',
                      borderRadius: 12, padding: '0.9rem 1rem',
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    }}
                  >
                    <div style={{ fontSize: '1.4rem', lineHeight: 1, marginTop: 2 }}>{cat.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                        <span style={{
                          background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                          borderRadius: 10, padding: '0.15rem 0.5rem', color: '#c9a84c', fontSize: '0.72rem', fontWeight: 600,
                        }}>
                          {isAr ? cat.ar : cat.en}
                        </span>
                        <span style={{ color: '#555', fontSize: '0.75rem' }}>{formatDate(win.ts, isAr)}</span>
                      </div>
                      <p style={{ color: '#ddd', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>{win.text}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: intensityColor(win.intensity),
                        boxShadow: `0 0 6px ${intensityColor(win.intensity)}`,
                      }} />
                      <span style={{ color: '#555', fontSize: '0.7rem' }}>{win.intensity}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ===== SECTION 4 — WHY CELEBRATE ===== */}
        <div
          style={{
            background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: 16, padding: '1.5rem',
          }}
        >
          <h2 style={{ color: '#c9a84c', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
            {isAr ? '💡 لماذا تحتفل؟' : '💡 Why Celebrate?'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Zap size={18} color="#c9a84c" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                {isAr
                  ? 'عندما تحتفل، أنت ترسّخ الحالة الذروة في السلوك. هذا يجعل دماغك يريد تكراره مرة أخرى.'
                  : 'When you celebrate, you anchor the peak state to the behavior. This makes your brain want to repeat it again.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Star size={18} color="#c9a84c" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                {isAr
                  ? 'كلما كبر الاحتفال، كان الترسيخ أقوى. الجسم، الصوت، الحركة — كلها تعمق التعلم العاطفي.'
                  : 'The bigger the celebration, the stronger the anchor. Body, voice, movement — they all deepen emotional learning.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Trophy size={18} color="#c9a84c" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                {isAr
                  ? '"معظم الناس لا يحتفلون بما يكفي. احتفل بكل تقدم — مهما كان صغيراً." — توني روبنز'
                  : '"Most people don\'t celebrate enough. Celebrate every bit of progress — no matter how small." — Tony Robbins'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}
