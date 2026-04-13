/**
 * StateCheckin — Enhanced 3-dimension state check-in
 * Energy (1-10) + Mood (1-10) + Clarity (1-10)
 * Quick 30-second check-in that replaces the binary beautiful/suffering
 */
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

function getSliderColor(val) {
  if (val <= 3)  return '#e63946'
  if (val <= 5)  return '#f39c12'
  if (val <= 7)  return '#c9a84c'
  return '#2ecc71'
}

function Dimension({ emoji, labelAr, labelEn, value, onChange, isAr }) {
  const color = getSliderColor(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#888' }}>
            {isAr ? labelAr : labelEn}
          </span>
          <span style={{ fontSize: 12, fontWeight: 900, color }}>{value}</span>
        </div>
        <input
          type="range" min={1} max={10} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: color }}
        />
      </div>
    </div>
  )
}

export default function StateCheckin({ onDone, compact = false }) {
  const { state, update, logState } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const today = new Date().toISOString().slice(0, 10)

  // Quick mode for new users (< 3 mornings): single emoji tap instead of 3 sliders
  const morningCount = (state.morningLog || []).length
  const isQuickMode = morningCount < 3

  const existing = state.stateCheckin?.[today]
  const [energy,  setEnergy]  = useState(existing?.energy  || 5)
  const [mood,    setMood]    = useState(existing?.mood    || 5)
  const [clarity, setClarity] = useState(existing?.clarity || 5)
  const [saved, setSaved] = useState(!!existing)

  // Sync if already saved today
  useEffect(() => {
    if (existing) {
      setEnergy(existing.energy)
      setMood(existing.mood)
      setClarity(existing.clarity)
      setSaved(true)
    }
  }, [])

  const avg = Math.round(((energy + mood + clarity) / 3) * 10) / 10
  const avgColor = getSliderColor(Math.round(avg))

  const save = () => {
    const checkinData = { energy, mood, clarity, ts: new Date().toISOString() }
    const existing = state.stateCheckin || {}
    update('stateCheckin', { ...existing, [today]: checkinData })

    // Also update the classic state (beautiful/suffering) for backward compatibility
    if (avg >= 7) {
      logState('beautiful', isAr ? 'حالة ممتازة' : 'Great state')
    } else if (avg <= 4) {
      logState('suffering', isAr ? 'حالة منخفضة' : 'Low state')
    } else {
      logState('beautiful', isAr ? 'حالة جيدة' : 'Good state')
    }

    setSaved(true)
    showToast(isAr ? 'تم تسجيل حالتك ✓' : 'State logged ✓', 'success', 1500)
    if (onDone) onDone()
  }

  // ── Compute state correlation insight (what raises your state?) ──
  const stateInsight = useMemo(() => {
    const checkin = state.stateCheckin || {}
    const morningLog = state.morningLog || []
    const sleepLog = state.sleepLog || {}
    const dates = Object.keys(checkin).filter(d => checkin[d]?.energy)
    if (dates.length < 5) return null

    let withMorning = [], withoutMorning = []
    let withGoodSleep = [], withPoorSleep = []

    const morningDates = new Set(morningLog.map(m => m?.date || ''))

    dates.forEach(d => {
      const avg = (checkin[d].energy + checkin[d].mood + checkin[d].clarity) / 3
      if (morningDates.has(d)) withMorning.push(avg)
      else withoutMorning.push(avg)
      if (sleepLog[d]?.hours >= 7) withGoodSleep.push(avg)
      else if (sleepLog[d]?.hours && sleepLog[d].hours < 7) withPoorSleep.push(avg)
    })

    const avgWith = withMorning.length >= 2 ? Math.round(withMorning.reduce((s, v) => s + v, 0) / withMorning.length * 10) / 10 : null
    const avgWithout = withoutMorning.length >= 2 ? Math.round(withoutMorning.reduce((s, v) => s + v, 0) / withoutMorning.length * 10) / 10 : null
    const morningDiff = avgWith && avgWithout ? Math.round((avgWith - avgWithout) * 10) / 10 : null

    const avgGoodSleep = withGoodSleep.length >= 2 ? Math.round(withGoodSleep.reduce((s, v) => s + v, 0) / withGoodSleep.length * 10) / 10 : null
    const avgPoorSleep = withPoorSleep.length >= 2 ? Math.round(withPoorSleep.reduce((s, v) => s + v, 0) / withPoorSleep.length * 10) / 10 : null
    const sleepDiff = avgGoodSleep && avgPoorSleep ? Math.round((avgGoodSleep - avgPoorSleep) * 10) / 10 : null

    // Pick strongest driver
    if (morningDiff && morningDiff > 0 && (!sleepDiff || morningDiff >= sleepDiff)) {
      return { type: 'morning', diff: morningDiff, emoji: '☀️',
        ar: `الروتين الصباحي يرفع حالتك +${morningDiff} نقطة`,
        en: `Morning Ritual raises your state by +${morningDiff}` }
    }
    if (sleepDiff && sleepDiff > 0) {
      return { type: 'sleep', diff: sleepDiff, emoji: '😴',
        ar: `النوم الجيد يرفع حالتك +${sleepDiff} نقطة`,
        en: `Good sleep raises your state by +${sleepDiff}` }
    }
    return null
  }, [state.stateCheckin, state.morningLog, state.sleepLog])

  if (compact && saved) {
    return (
      <div>
        <div className="rounded-2xl p-3" style={{
          background: `${avgColor}08`, border: `1px solid ${avgColor}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>
              {avg >= 7 ? '🌟' : avg >= 5 ? '🌤' : '🌧'}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#888' }}>
              {isAr ? 'حالتك اليوم' : "Today's State"}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#666' }}>
              ⚡{energy} 😊{mood} 🎯{clarity}
            </span>
            <span style={{ fontSize: 14, fontWeight: 900, color: avgColor }}>
              {avg}
            </span>
          </div>
        </div>
        {/* ── State Driver Insight ── */}
        {stateInsight && (
          <div style={{
            marginTop: 6, padding: '6px 12px', borderRadius: 12,
            background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 12 }}>{stateInsight.emoji}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#c9a84c' }}>
              {isAr ? stateInsight.ar : stateInsight.en}
            </span>
          </div>
        )}
      </div>
    )
  }

  // ── Quick Mode for new users: 5-emoji tap (no sliders) ──
  if (isQuickMode && !saved) {
    const QUICK_OPTIONS = [
      { emoji: '😫', val: 2,  labelAr: 'صعبة', labelEn: 'Tough',  stateType: 'suffering' },
      { emoji: '😐', val: 4,  labelAr: 'مقبولة', labelEn: 'Meh',    stateType: 'suffering' },
      { emoji: '🙂', val: 6,  labelAr: 'جيدة', labelEn: 'Good',   stateType: 'beautiful' },
      { emoji: '😊', val: 8,  labelAr: 'ممتازة', labelEn: 'Great',  stateType: 'beautiful' },
      { emoji: '🤩', val: 10, labelAr: 'رائعة!', labelEn: 'Amazing!', stateType: 'beautiful' },
    ]

    const quickSave = (opt) => {
      const checkinData = { energy: opt.val, mood: opt.val, clarity: opt.val, ts: new Date().toISOString(), quickMode: true }
      const existing = state.stateCheckin || {}
      update('stateCheckin', { ...existing, [today]: checkinData })
      logState(opt.stateType, isAr ? (opt.stateType === 'beautiful' ? 'حالة جميلة' : 'معاناة') : (opt.stateType === 'beautiful' ? 'Beautiful' : 'Suffering'))
      setEnergy(opt.val); setMood(opt.val); setClarity(opt.val)
      setSaved(true)
      showToast(isAr ? 'تم تسجيل حالتك ✓' : 'State logged ✓', 'success', 1500)
      if (onDone) onDone()
    }

    return (
      <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
        <p style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c', marginBottom: 4 }}>
          {isAr ? '⚡ كيف حالتك الآن؟' : '⚡ How do you feel right now?'}
        </p>
        <p style={{ fontSize: 10, color: '#555', marginBottom: 12 }}>
          {isAr ? 'اضغط على الإيموجي الأقرب لحالتك' : 'Tap the emoji closest to how you feel'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          {QUICK_OPTIONS.map((opt, i) => (
            <button
              key={i}
              onClick={() => quickSave(opt)}
              className="transition-all active:scale-90"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '10px 4px',
                borderRadius: 12,
                background: '#111',
                border: '1px solid #222',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 24 }}>{opt.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#888' }}>
                {isAr ? opt.labelAr : opt.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-4" style={{
      background: '#0e0e0e',
      border: `1px solid ${saved ? `${avgColor}30` : '#1e1e1e'}`,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.03em' }}>
            {isAr ? '⚡ حالتك الآن' : '⚡ Your State Now'}
          </p>
          <p style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
            {isAr ? '30 ثانية — كيف تشعر الآن؟' : '30 seconds — how do you feel right now?'}
          </p>
        </div>
        {/* Composite score */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: `${avgColor}15`, border: `2px solid ${avgColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: avgColor }}>{avg}</span>
        </div>
      </div>

      {/* 3 Dimensions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Dimension emoji="⚡" labelAr="الطاقة" labelEn="Energy"  value={energy}  onChange={setEnergy}  isAr={isAr} />
        <Dimension emoji="😊" labelAr="المزاج" labelEn="Mood"    value={mood}    onChange={setMood}    isAr={isAr} />
        <Dimension emoji="🎯" labelAr="الوضوح" labelEn="Clarity" value={clarity} onChange={setClarity} isAr={isAr} />
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center', margin: '10px 0 8px' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: avgColor }}>
          {avg >= 8 ? (isAr ? '🔥 في أفضل حالاتك!' : '🔥 Peak State!')
            : avg >= 6 ? (isAr ? '💪 حالة جيدة' : '💪 Good State')
            : avg >= 4 ? (isAr ? '🌤 متوسط' : '🌤 Moderate')
            : (isAr ? '🌧 تحتاج تغيير حالة' : '🌧 Need a State Change')}
        </span>
        {avg <= 4 && (
          <p style={{ fontSize: 9, color: '#888', marginTop: 3 }}>
            {isAr ? 'جرّب أدوات تغيير الحالة ←' : 'Try state change tools →'}
          </p>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={save}
        className="w-full rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.97]"
        style={{
          background: saved ? 'rgba(46,204,113,0.1)' : 'rgba(201,168,76,0.12)',
          border: `1px solid ${saved ? 'rgba(46,204,113,0.3)' : 'rgba(201,168,76,0.3)'}`,
          color: saved ? '#2ecc71' : '#c9a84c',
        }}>
        {saved
          ? (isAr ? '✓ تم التسجيل — اضغط للتحديث' : '✓ Saved — tap to update')
          : (isAr ? 'سجّل حالتك' : 'Log Your State')}
      </button>
    </div>
  )
}
